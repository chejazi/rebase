// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract REFI is ERC20Burnable {
    address private immutable _rebase;

    event Convert (
        address indexed user,
        uint quantity
    );

    constructor(address rebase) ERC20("REFI", "REFI") {
        _rebase = rebase;
        _mint(msg.sender, 1000000000 * (1 ether));
        _mint(address(this), 1000000000 * (1 ether));
    }

    function convert() external {
        uint quantity = ERC20Burnable(_rebase).balanceOf(msg.sender);
        ERC20Burnable(_rebase).transferFrom(msg.sender, address(this), quantity);
        ERC20Burnable(_rebase).burn(quantity);
        _transfer(address(this), msg.sender, quantity);

        emit Convert(msg.sender, quantity);
    }
}
