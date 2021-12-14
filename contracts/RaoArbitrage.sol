// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

interface IUniswapV2Router01 {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}

contract RaoArbitrage {
    address public immutable owner;

    modifier ensure(uint256 time) {
        require(time >= block.timestamp, "RaoArbitrage: T");
        _;
    }

    modifier restricted() {
        require(msg.sender == owner, "RaoArbitrage: O");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function swap(
        IERC20 token0,
        IERC20 token1,
        IUniswapV2Router01 routerExpensive,
        IUniswapV2Router01 routerCheap,
        uint256 amount0In,
        uint256 deadline
    )
        external
        view
        ensure(deadline)
        returns (uint256 amount0Expensive)
    {
        address[] memory path = new address[](2);
        uint256 amount1Cheap;
        {
            path[0] = address(token0);
            path[1] = address(token1);
            amount1Cheap = routerCheap.getAmountsOut(amount0In, path)[1];
            path[0] = address(token1); // switch tokens
            path[1] = address(token0);
            amount0Expensive = routerExpensive.getAmountsOut(
                amount1Cheap,
                path
            )[1];
            // require(amount0In > amount0Expensive, "RaoArbitrage: L");
        }
    }
}
