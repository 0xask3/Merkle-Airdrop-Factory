// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("BUSD", "BUSD") {
        _mint(msg.sender, 10000000000 * (10**uint256(decimals())));
    }
}
