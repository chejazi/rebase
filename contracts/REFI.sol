// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@4.9.5/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.9.5/token/ERC20/extensions/ERC20Burnable.sol";

contract REFI is ERC20Burnable {
    address private immutable _rebase;

    event Redeem (
        address indexed user,
        uint quantity
    );

    constructor(address rebase) ERC20("REFI", "REFI") {
        _rebase = rebase;
        _mint(msg.sender, 1000000000 * (1 ether));
        _mint(address(this), 1000000000 * (1 ether));
    }

    function redeem(uint quantity) external {
        ERC20Burnable(_rebase).transferFrom(msg.sender, address(this), quantity);
        ERC20Burnable(_rebase).burn(quantity);
        transfer(msg.sender, quantity);

        emit Redeem(msg.sender, quantity);
    }
}
