// SPDX-License-Identifier: UNLICENSED
pragma solidity <0.9.0;
pragma experimental ABIEncoderV2;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

contract RaoUniswapQuery {
    function getReservesByPairs(IUniswapV2Pair[] calldata _pairs)
        external
        view
        returns (uint256[3][] memory)
    {
        uint256[3][] memory result = new uint256[3][](_pairs.length);
        for (uint256 i = 0; i < _pairs.length; i++) {
            (result[i][0], result[i][1], result[i][2]) = _pairs[i]
                .getReserves();
        }
        return result;
    }

    function getPairsByFactory(
        IUniswapV2Factory[] calldata _uniswapFactories,
        address[2][] calldata tokens,
        uint256 len
    ) external view returns (address[] memory) {
        address[] memory pairs = new address[](len);
        uint256 c = 0;
        for (uint256 a = 0; a < _uniswapFactories.length; a++) {
            for (uint256 b = 0; b < tokens.length; b++) {
                pairs[c] = _uniswapFactories[a].getPair(
                    tokens[b][0],
                    tokens[b][1]
                );
                c++;
            }
        }
        return pairs;
    }
}
