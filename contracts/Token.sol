// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Token with Governance.
contract Token is ERC20("Token2", "TKN2"), Ownable {
    function mintToken(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
