import { useState } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, CubeTransparentIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, TOKEN_ADDRESS, FAUCET_ABI, TOKEN_ABI } from './config';
import { VaultBalance } from './components/VaultBalance';

// Components
const Navbar = ({ isConnected, onConnect }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <CubeTransparentIcon className="h-8 w-8 text-primary-500" />
            <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              MyToken Faucet
            </h1>
          </Link>
        </div>
        <div className="hidden md:block">
          <button 
            onClick={onConnect}
            className="relative group inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <span>{isConnected ? 'Connected' : 'Connect Wallet'}</span>
              <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const TokenCard = ({ tokenInfo, balance, onRequest, isConnected, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 p-0.5 w-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative bg-dark-800 p-6 rounded-2xl">
        <div className="flex items-center mb-6">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{tokenInfo.symbol[0]}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-dark-800 rounded-full border-2 border-dark-800 flex items-center justify-center">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-white">{tokenInfo.name}</h3>
            <p className="text-sm text-gray-400">{tokenInfo.symbol}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">Your Balance</span>
            <span className="text-sm font-medium text-white">
              {isConnected ? `${balance} ${tokenInfo.symbol}` : 'Connect Wallet'}
            </span>
          </div>
          <button
            onClick={(e) => {
              console.log('Button clicked!');
              onRequest(e);
            }}
            disabled={!isConnected || isLoading}
            className={`w-full py-3 px-4 ${
              !isConnected 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
            } text-white font-medium rounded-lg flex items-center justify-center transition-all duration-300`}
            style={{
              border: '2px solid red',  // Add a red border for visibility
              position: 'relative',
              zIndex: 1000,  // Ensure button is above other elements
            }}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Request {tokenInfo.dripAmount} {tokenInfo.symbol}
              </>
            )}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const App = () => {
  const [balance, setBalance] = useState('0.00');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faucetContract, setFaucetContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [vaultBalance, setVaultBalance] = useState('0');
  const [isRefilling, setIsRefilling] = useState(false);

  // Default values that match the contract's defaults
  const TOKEN_INFO = {
    name: 'MyToken',
    symbol: 'MT',
    decimals: 18,
    dripAmount: '5.0', // Default from contract: 5 * 10**18 wei = 5.0 tokens
    cooldown: '12 hours' // Default from contract
  };

  const connectWallet = async () => {
    console.log('1. Starting connectWallet');
    try {
      setIsLoading(true);
      console.log('2. Checking for window.ethereum');
      
      if (window.ethereum) {
        console.log('3. window.ethereum found, requesting accounts');
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        console.log('4. Accounts received:', accounts);
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log('5. Provider created');
        
        const signer = provider.getSigner();
        console.log('6. Signer created');
        
        console.log('7. Initializing contracts with:');
        console.log('   - CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
        console.log('   - TOKEN_ADDRESS:', TOKEN_ADDRESS);
        
        // Initialize contracts
        const faucet = new ethers.Contract(
          CONTRACT_ADDRESS,
          FAUCET_ABI,
          signer
        );
        console.log('8. Faucet contract instance created');
        
        const token = new ethers.Contract(
          TOKEN_ADDRESS,
          TOKEN_ABI,
          signer
        );
        console.log('9. Token contract instance created');
        
        // Store contracts in state
        setFaucetContract(faucet);
        setTokenContract(token);
        
        // Get user's token balance
        console.log('10. Getting token balance for account:', accounts[0]);
        const balance = await token.balanceOf(accounts[0]);
        console.log('11. Token balance received:', balance.toString());
        
        // Check if user is owner
        const owner = await faucet.owner();
        setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());
        console.log('12. Is owner:', isOwner);
        
        // Get vault balance
        const vaultBalance = await token.balanceOf(CONTRACT_ADDRESS);
        setVaultBalance(ethers.utils.formatUnits(vaultBalance, 18));
        
        setBalance(ethers.utils.formatUnits(balance, 18));
        setIsConnected(true);
        setAccount(accounts[0]);
        console.log('13. State updated - connected:', true, 'account:', accounts[0]);
        
      } else {
        console.error('MetaMask not detected');
        alert('Please install MetaMask to use this dApp!');
      }
    } catch (error) {
      console.error('Error in connectWallet:', error);
      alert('Failed to connect wallet: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
      console.log('14. Loading state reset');
    }
  };

  const handleRequestTokens = async () => {
    console.log('1. handleRequestTokens called');
    
    if (!isConnected) {
      console.log('2. Not connected, calling connectWallet');
      await connectWallet();
      return;
    }
    
    try {
      console.log('3. Setting loading state to true');
      setIsLoading(true);
      
      console.log('4. faucetContract state:', faucetContract);
      if (!faucetContract) {
        throw new Error('Faucet contract not initialized. Please refresh the page and try again.');
      }
      
      console.log('5. Calling requestTokens on contract');
      const tx = await faucetContract.requestTokens();
      console.log('6. Transaction sent, waiting for confirmation:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('7. Transaction confirmed in block:', receipt.blockNumber);
      
      if (tokenContract && account) {
        console.log('8. Updating token balance');
        const newBalance = await tokenContract.balanceOf(account);
        setBalance(ethers.utils.formatUnits(newBalance, 18));
      }
      
      alert('Tokens claimed successfully!');
    } catch (error) {
      console.error('Error in handleRequestTokens:', error);
      
      // More detailed error messages
      if (error.code === 4001) {
        alert('Transaction was rejected by user');
      } else if (error.message.includes('CoolDownNotPassed')) {
        alert('Please wait for the cooldown period (12 hours) before requesting more tokens.');
      } else if (error.message.includes('NotEnoughTokens')) {
        alert('The faucet is out of tokens. Please try again later.');
      } else if (error.message.includes('reverted')) {
        alert('Transaction reverted. Make sure you are connected to the correct network and have enough ETH for gas.');
      } else {
        alert('Error: ' + (error.message || 'Failed to request tokens'));
      }
    } finally {
      console.log('9. Resetting loading state');
      setIsLoading(false);
    }
  };

  const handleRefillVault = async (amount) => {
    if (!isConnected || !isOwner) return;
    
    try {
      setIsRefilling(true);
      const amountWei = ethers.utils.parseUnits(amount, 18);
      
      // First, approve the faucet to spend tokens
      console.log('Approving token transfer...');
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountWei);
      await approveTx.wait();
      console.log('Approval confirmed');
      
      // Then refill the vault
      console.log('Refilling vault...');
      const tx = await faucetContract.refillVault(amountWei);
      await tx.wait();
      console.log('Vault refill confirmed');
      
      // Update vault balance
      const newVaultBalance = await tokenContract.balanceOf(CONTRACT_ADDRESS);
      setVaultBalance(ethers.utils.formatUnits(newVaultBalance, 18));
      
      // Update user's balance
      const userBalance = await tokenContract.balanceOf(account);
      setBalance(ethers.utils.formatUnits(userBalance, 18));
      
      alert('Vault refilled successfully!');
    } catch (error) {
      console.error('Error refilling vault:', error);
      alert('Failed to refill vault: ' + (error.message || 'Unknown error'));
    } finally {
      setIsRefilling(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-gray-200">
        <Navbar isConnected={isConnected} onConnect={connectWallet} />
        <main>
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-1/4 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="block">Get {TOKEN_INFO.name} Test Tokens</span>
                  <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    For Development & Testing
                  </span>
                </motion.h1>

                <motion.p 
                  className="mt-6 max-w-2xl mx-auto text-lg text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Get free {TOKEN_INFO.symbol} tokens to test your dApps on the blockchain.
                  No signup required, just connect your wallet and claim your tokens.
                </motion.p>

                <motion.div 
                  className="mt-10 max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <TokenCard 
                    tokenInfo={TOKEN_INFO}
                    balance={balance}
                    onRequest={handleRequestTokens}
                    isConnected={isConnected}
                    isLoading={isLoading}
                  />
                </motion.div>

                <VaultBalance 
                  vaultBalance={vaultBalance}
                  tokenSymbol={TOKEN_INFO.symbol}
                  onRefill={handleRefillVault}
                  isLoading={isRefilling}
                  isOwner={isOwner}
                />

                {!isConnected && (
                  <motion.div 
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <p className="text-gray-400 mb-4">Don't have a wallet?</p>
                    <a
                      href="https://metamask.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-dark-700 hover:bg-dark-600 transition-colors duration-200"
                    >
                      Install MetaMask
                      <ArrowTopRightOnSquareIcon className="ml-2 -mr-1 h-5 w-5" />
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </Router>
  );
};

export default App;