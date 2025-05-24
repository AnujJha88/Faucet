# 🚰 MyToken Faucet dApp

A decentralized faucet application that allows users to request customm made ERC20 test tokens on a blockchain network. The faucet is secured with rate limiting and includes an admin interface for vault management.


## 🌟 Features

- Request test tokens with a single click
- Rate limiting to prevent abuse (12-hour cooldown)
- Admin dashboard for vault management
- Responsive and modern UI/UX
- Secure smart contract with access control
- Real-time balance updates

## 🛠 Tech Stack

- **Frontend**: React.js, TailwindCSS, Framer Motion
- **Smart Contracts**: Solidity, OpenZeppelin
- **Blockchain**: Ethereum (compatible with any EVM chain)
- **Development**: Foundry, ethers.js

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- MetaMask browser extension
- Foundry(for local dev)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnujJha88/Faucet.git
   cd Faucet
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd faucet
   forge install OpenZeppelin/openzeppelin-contracts 
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Get an anvil chain running**
    after installing all dependencies, run the following command to get an anvil chain running:
    ```
    anvil --block-time <enter_block_time>
    ```
    This will spin up a local blockchain with a bunch of private keys to use. Import a couple into your metamask.
   

4. **Deploy contracts**
   ```bash
   cd faucet
   forge script script/Faucet.s.sol:DeployFaucet --rpc-url http://127.0.0.1:8545 --broadcast --private-key <YOUR_PRIVATE_KEY>
   ```

   we are using the standard anvil rpc url here. For private key use the one you just imported into metamask. 
   
   ### BEWARE THIS IS ONLY A TOY PROJECT! DO NOT PASTE PRIVATE KEYS INTO YOUR TERMINAL IN A PRODUCTION ENVIRONMENT!

5. **Update contract addresses**

   Update the contract addresses in `frontend/src/config.js` with the deployed contract addresses.

6. **Start the development server**
   ```bash
   cd ../frontend #navigate to frontend directory
   npm run dev
   ```

## 🏗 Project Structure

```
Faucet/
├── faucet
│   ├── broadcast/
│   ├── cache/
│   ├── foundry.toml
│   ├── lib/
│   ├── out/
│   ├── README.md
│   ├── script/
│   ├── src/
│   └── test/
├── frontend
│   ├── index.html
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.cjs
│   ├── src/
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md

```

## 🔑 Admin Features

The faucet includes special admin features:

- **Vault Balance**: View current token balance in the faucet
- **Refill Vault**: Add more tokens to the faucet

To access admin features, connect with the contract owner's wallet.

## 📝 License

This project is licensed under the MIT License 

## 🙏 Acknowledgments

- Built with [OpenZeppelin](https://openzeppelin.com/) contracts
- UI powered by [TailwindCSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by [Anuj Jha] | [Twitter](https://x.com/AnujJha571205) | [GitHub](https://github.com/AnujJha88)
