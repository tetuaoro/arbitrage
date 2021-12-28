// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RaoArbitrage is IUniswapV2Callee {
    using SafeMath for uint256;

    address public immutable owner;

    modifier ensure(uint256 time) {
        require(time >= block.timestamp, "RaoArbitrage: T");
        _;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "RaoArbitrage: only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    struct FlashData {
        uint256 percent;
        address pairBorrow;
        address routerSell;
    }

    function withdraw(IERC20 token) external onlyOwner {
        token.transfer(owner, token.balanceOf(address(this)));
    }

    function flashswap(FlashData memory params, uint256 deadline)
        external
        ensure(deadline)
    {
        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(
            params.pairBorrow
        ).getReserves();
        bool borrow0 = reserve0 > reserve1;
        uint256 amountBorrow = borrow0
            ? reserve0 / params.percent
            : reserve1 / params.percent;
        bytes memory data = abi.encode(params.routerSell, borrow0);
        IUniswapV2Pair(params.pairBorrow).swap(
            borrow0 ? amountBorrow : 0,
            borrow0 ? 0 : amountBorrow,
            address(this),
            data
        );
    }

    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override {
        require(false, "revert this 3");
        require(sender == address(this), "RaoArbitrage: NAN");
        (address routerSell, bool borrow0) = abi.decode(data, (address, bool));
        uint256 amount = borrow0 ? amount0 : amount1;
        uint256 amountToRepay = getAmountOutToPayback(
            amount,
            borrow0,
            msg.sender
        );

        address[] memory path = new address[](2);
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        path[0] = borrow0 ? token0 : token1;
        path[1] = borrow0 ? token1 : token0;
        uint256 amountOutMin = IUniswapV2Router01(routerSell).getAmountsOut(
            amount,
            path
        )[1];
        require(amountToRepay < amountOutMin, "RaoArbitrage: K");
        IERC20(path[0]).approve(routerSell, amount);
        IUniswapV2Router01(routerSell).swapExactTokensForTokens(
            amount,
            amountOutMin,
            path,
            address(this),
            block.timestamp + 10
        );
        IERC20(path[1]).transfer(msg.sender, amountToRepay);
    }

    function getAmountOutToPayback(
        uint256 amount,
        bool borrow0,
        address pair
    ) internal view returns (uint256 amountToPayback) {
        (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair)
            .getReserves();
        uint256 reserveIn = borrow0 ? reserve0 : reserve1;
        uint256 reserveOut = borrow0 ? reserve1 : reserve0;

        amountToPayback = reserveOut
            .mul(1000)
            .mul(amount)
            .div(reserveIn.mul(997))
            .add(1);
    }
}
