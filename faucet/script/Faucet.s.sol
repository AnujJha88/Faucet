// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {console} from "forge-std/console.sol";
import {Script} from "forge-std/Script.sol";
import {Token} from "../src/Token.sol"; // Adjust path if your Token.sol is elsewhere
import {Faucet} from "../src/Faucet.sol"; // Adjust path if your Faucet.sol is elsewhere

contract DeployFaucet is Script {
    // Define a constant for the initial faucet funding amount
    uint256 public constant INITIAL_FAUCET_FUNDING = 10_000 * 10**18; // 10,000 tokens (assuming 18 decimals)

    function run() public returns (address tokenAddress, address faucetAddress) {
        // Start broadcasting transactions from the account configured in your environment
        // (e.g., --private-key or --mnemonic in forge script command)
        vm.startBroadcast();

        // --- 1. Deploy the Token Contract ---
        // The Token's constructor will mint the initial supply to msg.sender (the deployer)
        Token token = new Token();
        tokenAddress = address(token);
        console.log("Token deployed at:", tokenAddress);

        // --- 2. Deploy the Faucet Contract ---
        Faucet faucet = new Faucet(tokenAddress);
        faucetAddress = address(faucet);
        console.log("Faucet deployed at:", faucetAddress);

        // --- 3. Fund the Faucet (Optional, but recommended for initial setup) ---
        // This simulates the deployer (who owns the initial token supply)
        // approving the faucet and then having the faucet pull the tokens.

        // Approve the Faucet contract to spend tokens from the deployer's balance
        console.log("Approving Faucet to spend tokens...");
        token.approve(faucetAddress, INITIAL_FAUCET_FUNDING);
        console.log("Approval granted to Faucet for", INITIAL_FAUCET_FUNDING / 10**18, "tokens.");

        // Call refillVault on the Faucet to pull the tokens
        console.log("Refilling Faucet...");
        faucet.refillVault(INITIAL_FAUCET_FUNDING);
        console.log("Faucet refilled with", INITIAL_FAUCET_FUNDING / 10**18, "tokens.");

        // Verify Faucet balance
        uint256 faucetBalance = token.balanceOf(faucetAddress);
        console.log("Faucet's current balance:", faucetBalance / 10**18, "tokens.");

        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}