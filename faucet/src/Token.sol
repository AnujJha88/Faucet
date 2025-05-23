//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/token/ERC20/ERC20.sol";

contract Token is ERC20{

    constructor () ERC20("MyToken","MT"){
        _mint(msg.sender,100_000_000*10**18);
    }

  
}