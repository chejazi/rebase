// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./RewardPool.sol";

interface Rebased {
    function appname() external returns (string memory);
    function restake(address user, address token, uint quantity) external;
    function unrestake(address user, address token, uint quantity) external;
}

contract RebaseRewards is Rebased {
    address private immutable _rebase;
    address[] private _tokens;
    mapping(address => address) private _pools;

    constructor(address rebase) {
        _rebase = rebase;
        _tokens.push(0x940181a94A35A4569E4529A3CDfB74e38FD98631); // AERO
        _tokens.push(0x3C281A39944a2319aA653D81Cfd93Ca10983D234); // BUILD
        _tokens.push(0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed); // DEGEN
        _tokens.push(0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe); // HIGHER
        _tokens.push(0x4200000000000000000000000000000000000006); // WETH

        address rewardToken = rebase;
        uint duration = (60 * 60 * 24 * 7 * 5); // 5 weeks
        uint quantity = 200000000 * (10**18);
        for (uint i = 0; i < _tokens.length; i++) {
            _pools[_tokens[i]] = address(new RewardPool(quantity, rewardToken, duration));
        }
    }

    function appname() external pure returns (string memory) {
        return "Rebase Staking Rewards";
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
