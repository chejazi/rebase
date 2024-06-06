// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Rebase.sol";

contract BatchReadRebase {
    address payable private immutable _rebase;
    constructor(address payable rebase) {
        _rebase = rebase;
    }

    function getTokenStakes(address[] memory tokens) external view returns (uint[] memory) {
        uint[] memory stakes = new uint[](tokens.length);
        for (uint i = 0; i < tokens.length; i++) {
            stakes[i] = Rebase(_rebase).getTokenStake(tokens[i]);
        }
        return stakes;
    }
}
