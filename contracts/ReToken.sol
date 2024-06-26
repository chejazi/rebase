// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ReToken is ERC20Snapshot {
    address private _deployer;
    address private _token;

    modifier onlyDeployer {
        require(msg.sender == _deployer, "Only callable by deployer");
        _;
    }

    constructor() ERC20("", "") {
        _deployer = msg.sender;
    }

    function initialize(address token) external {
        require(_deployer == address(0), "Initialized");
        _deployer = msg.sender;
        _token = token;
    }

    function name() public view override returns (string memory) {
        return string.concat("Rebase ", ERC20(_token).name());
    }

    function symbol() public view override returns (string memory) {
        return string.concat("re", ERC20(_token).symbol());
    }

    function decimals() public view override returns (uint8) {
        return ERC20(_token).decimals();
    }

    function mint(address to, uint tokens) external onlyDeployer returns (uint) {
        _mint(to, tokens);
        return totalSupply();
    }

    function burn(address from, uint tokens) external onlyDeployer returns (uint) {
        _burn(from, tokens);
        return totalSupply();
    }
}