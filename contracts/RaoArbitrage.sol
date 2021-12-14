// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract RaoArbitrage {
    address public immutable owner;

    modifier ensure(uint256 time) {
        require(time >= block.timestamp, "RaoArbitrage: T");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function swap(
        IERC20 token0,
        IERC20 token1,
        address pairA,
        address pairB,
        uint256 amount0In,
        uint256 deadline
    )
        external
        view
        ensure(deadline)
        returns (uint256 amountToRepayA, uint256 amountToRepayB)
    {
        uint256 pairBalanceX = token0.balanceOf(pairA);
        uint256 pairBalanceY = token1.balanceOf(pairA);
        amountToRepayA =
            ((1000 * pairBalanceY * amount0In) / (997 * pairBalanceX)) +
            1;
        pairBalanceX = token0.balanceOf(pairB);
        pairBalanceY = token1.balanceOf(pairB);
        amountToRepayB =
            ((1000 * pairBalanceY * amount0In) / (997 * pairBalanceX)) +
            1;
    }
}
