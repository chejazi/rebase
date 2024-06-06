// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.5/utils/math/Math.sol";
import "@openzeppelin/contracts@4.9.5/utils/math/SafeMath.sol";
import "@openzeppelin/contracts@4.9.5/token/ERC20/ERC20.sol";

contract RewardPool {
    using SafeMath for uint256;

    uint256 public immutable rewardDuration;
    address public immutable rewardDistributor;
    address public immutable rewardToken;
    uint256 public immutable periodFinish;
    uint256 public immutable rewardRate;

    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    event RewardAdded(uint256 reward);
    event Restaked(address indexed user, uint256 amount);
    event Unrestaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    modifier onlyRewardDistributor() {
        require(msg.sender == rewardDistributor, "Caller is not reward distribution");
        _;
    }

    constructor(uint reward, address token, uint duration) {
        rewardDuration = duration;
        rewardDistributor = msg.sender;
        rewardToken = token;
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardDuration);
        rewardRate = reward.div(rewardDuration);
        emit RewardAdded(reward);
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(_totalSupply)
            );
    }

    function earned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    function restake(address user, uint256 amount) external onlyRewardDistributor updateReward(user) {
        require(amount > 0, "Cannot restake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[user] = _balances[user].add(amount);
        emit Restaked(user, amount);
    }

    function unrestake(address user, uint256 amount) external onlyRewardDistributor updateReward(user) {
        require(amount > 0, "Cannot unrestake 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[user] = _balances[user].sub(amount);
        emit Unrestaked(user, amount);
        getReward(user);
    }

    function getReward(address user) public onlyRewardDistributor updateReward(user) {
        uint256 reward = earned(user);
        if (reward > 0) {
            rewards[user] = 0;
            ERC20(rewardToken).transfer(user, reward);
            emit RewardPaid(user, reward);
        }
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
}
