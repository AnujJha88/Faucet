import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export const VaultBalance = ({ 
  vaultBalance, 
  tokenSymbol, 
  onRefill, 
  isLoading, 
  isOwner 
}) => {
  const [refillAmount, setRefillAmount] = useState('100');

  if (!isOwner) return null;

  return (
    <motion.div 
      className="mt-10 max-w-md mx-auto bg-dark-700 p-6 rounded-xl border border-dark-600"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-xl font-bold text-white mb-2">Vault Management</h2>
      <div className="mb-4 p-4 bg-dark-800 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Current Balance:</span>
          <span className="text-white font-mono text-lg">
            {vaultBalance} <span className="text-primary-400">{tokenSymbol}</span>
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="refillAmount" className="block text-sm font-medium text-gray-300 mb-1">
            Amount to Refill
          </label>
          <input
            id="refillAmount"
            type="number"
            min="1"
            step="1"
            value={refillAmount}
            onChange={(e) => setRefillAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-dark-800 border border-dark-600 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter amount to refill"
          />
        </div>
        
        <button
          onClick={() => onRefill(refillAmount)}
          disabled={isLoading}
          className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Processing...
            </>
          ) : (
            'Refill Vault'
          )}
        </button>
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          Only the contract owner can refill the vault
        </p>
      </div>
    </motion.div>
  );
};
