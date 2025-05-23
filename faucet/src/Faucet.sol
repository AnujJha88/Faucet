// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Token} from "./token.sol";
import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {Pausable} from "@openzeppelin/utils/Pausable.sol";

contract Faucet is Ownable,Pausable{
    Token public token;
    uint dripAmount = 5 * 10 ** 18;
    uint cooldown = 12 hours;
    mapping(address => uint) lastDrip;

    event TokensDripped(address indexed to, uint amount);
    event FaucetRefilled();
    event DripAmountChanges(uint OldAmount,uint NewAmount);
    event CooldownChanges(uint OldTime,uint NewTime);
    
    error CoolDownNotPassed(uint timeLeft);
    error NotEnoughTokens();

    constructor(address _token) Ownable(msg.sender) {
        token = Token(_token);
    }
    function requestTokens() public whenNotPaused {
        if (token.balanceOf(address(this))<=dripAmount){
            revert NotEnoughTokens();
        }
        if(lastDrip[msg.sender]+cooldown>block.timestamp){
            revert CoolDownNotPassed(lastDrip[msg.sender]+cooldown-block.timestamp);
        }

        
        lastDrip[msg.sender] = block.timestamp;
        bool success=token.transfer(msg.sender, dripAmount); //only want to transfer tokens to the caller not someone proxy calling for another account
        require(success,"Faucet drip failed");
        emit TokensDripped(msg.sender, dripAmount);
    }
    function refillVault(uint _amount) public onlyOwner whenNotPaused{
            bool success =token.transferFrom(msg.sender,address(this),_amount);
            require(success, "Refill failed: Check owner's balance and approval");
            emit FaucetRefilled();
    }
    function changeDripAmount(uint _newAmount) public onlyOwner whenNotPaused{
        uint oldAmount=dripAmount;
        dripAmount=_newAmount;
        emit DripAmountChanges(oldAmount,dripAmount);
    }
    function changeCoolDown (uint _newtime) public onlyOwner whenNotPaused{
        uint oldTime=cooldown;
        cooldown=_newtime;
        emit CooldownChanges(oldTime,cooldown);
    }
    
    function pause() public onlyOwner{
        _pause();
    }
    function unpause() public onlyOwner{
        _unpause();
    }
}
