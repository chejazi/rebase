// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./RewardPool.sol";

interface Rebased {
    function appname() external returns (string memory);
    function restake(address user, address token, uint quantity) external;
    function unrestake(address user, address token, uint quantity) external;
}

contract RefiLPRewards is Rebased {
    address private immutable _rebase;
    address[] private _tokens;
    mapping(address => address) private _pools;

    constructor(address rebase, address rewardToken, address[] memory tokens) {
        _rebase = rebase;
        for (uint i = 0; i < tokens.length; i++) {
            _tokens.push(tokens[i]); // vAMM-WETH/REFI
        }

        uint duration = (60 * 60 * 24 * 7 * 5); // 5 weeks
        uint quantity = 500000000 * (10**18);
        for (uint i = 0; i < _tokens.length; i++) {
            _pools[_tokens[i]] = address(new RewardPool(quantity, rewardToken, duration));
        }
    }

    function appname() external pure returns (string memory) {
        return "Rebase LP Rewards";
    }

    function restake(address user, address token, uint quantity) external {
        require(msg.sender == _rebase, "Only Rebase");
        address pool = _pools[token];
        if (pool != address(0)) {
            RewardPool(pool).restake(user, quantity);
        }
    }
    function unrestake(address user, address token, uint quantity) external {
        require(msg.sender == _rebase, "Only Rebase");
        address pool = _pools[token];
        if (pool != address(0)) {
            RewardPool(pool).unrestake(user, quantity);
        }
    }

    function claimRewards() external {
        for (uint i = 0; i < _tokens.length; i++) {
            RewardPool(_pools[_tokens[i]]).payReward(msg.sender);
        }
    }

    function getRewardPool(address token) external view returns (address) {
        return _pools[token];
    }

    function getRewards(address user) external view returns (uint) {
        uint earned = 0;
        for (uint i = 0; i < _tokens.length; i++) {
            earned += RewardPool(_pools[_tokens[i]]).earned(user);
        }
        return earned;
    }

    function getTokens() public view returns (address[] memory) {
        return _tokens;
    }
}
