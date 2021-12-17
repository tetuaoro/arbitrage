// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract RaoArbitrage is IUniswapV2Callee, Ownable {
    using SafeMath for uint256;

    modifier ensure(uint256 time) {
        require(time >= block.timestamp, "RaoArbitrage: T");
        _;
    }

    struct FlashData {
        uint256 amountBorrow;
        address pairBorrow;
        address routerSell;
    }

    function withdraw(IERC20 token) external {
        token.transfer(owner(), token.balanceOf(address(this)));
    }

    function flashswap(FlashData memory flashd, uint256 deadline)
        external
        ensure(deadline)
    {
        bytes memory data = abi.encode(flashd.routerSell);
        IUniswapV2Pair(flashd.pairBorrow).swap(
            flashd.amountBorrow,
            0,
            address(this),
            data
        );
    }

    function uniswapV2Call(
        address sender,
        uint256 amountIn,
        uint256,
        bytes calldata data
    ) external override {
        require(sender == address(this), "RaoArbitrage: NAN");
        address routerSell = abi.decode(data, (address));
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        (uint256 amountOutMin, uint256 amountToRepay) = getAmountsOut(
            amountIn,
            token0,
            token1,
            msg.sender
        );
        require(amountToRepay > amountOutMin, "RaoArbitrage: K");
        address[] memory path = new address[](2);
        path[0] = token0;
        path[1] = token1;
        IERC20(token0).approve(routerSell, amountIn);
        IUniswapV2Router01(routerSell).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp + 30
        );
        IERC20(token1).transfer(msg.sender, amountToRepay);
    }

    function getAmountsOut(
        uint256 amountIn,
        address token0,
        address token1,
        address to
    ) internal view returns (uint256 amountOutMin, uint256 amountToRepay) {
        uint256 reserveIn = IERC20(token0).balanceOf(to);
        uint256 reserveOut = IERC20(token1).balanceOf(to);
        uint256 amountInWithFee = amountIn.mul(997);
        amountOutMin = amountInWithFee.mul(reserveOut).div(reserveIn.mul(1000).add(amountInWithFee));
        amountToRepay = reserveOut
            .mul(1000)
            .mul(amountIn)
            .div(reserveIn.mul(997))
            .add(1);
    }
}
