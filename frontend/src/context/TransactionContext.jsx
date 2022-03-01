import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

// We're gonna use React Context API exclusively for connecting in the blockchain

export const TransactionContext = React.createContext();

// We have this object because of metamask
const { ethereum } = window;

function getEthereumContract() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  // console.log({ provider, signer, transactionContract });
  // We're returnning our TransactionContract, created in solidity with our customized functions
  return transactionContract;
}

// Context wrapped in all React app
export function TransactionProvider({ children }) {
  const [currentAccount, setCurrentAccount] = useState('');
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount')
  );
  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e, name) {
    // If we pass a function to setFormData state function, we can get the prevState (didn't remember that)
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  }

  async function checkIfWalletIsConnected() {
    try {
      if (!ethereum) return alert('Please install MetaMask');
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        // getAllTransactions();
      } else {
        console.log('No accounts found');
      }
    } catch (err) {
      console.log(err);
      throw new Error('No ethereum object.');
    }
  }

  async function connectWallet() {
    try {
      if (!ethereum) return alert('Please install MetaMask');
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
      throw new Error('No ethereum object.');
    }
  }

  async function sendTransaction() {
    try {
      if (!ethereum) return alert('Please install MetaMask');

      // get data from the form
      const { addressTo, amount, keyword, message } = formData;
      // All our transaction functions from solidity are available in this const
      const transactionContract = getEthereumContract();

      // We need to parse the decimal amount value to hexadecimal ou 'Gwei' sub unit
      const parsedAmount = ethers.utils.parseEther(amount);

      // transfer ethereum
      await ethereum.request({
        method: 'eth_sendTransaction',
        // currentAccount is inside our state
        params: [
          {
            from: currentAccount,
            to: addressTo,
            // The transaction needs a gas fee to spend. This value is in hexadecimal
            // If we convert this hexadecimal value to a decimal number, it will be equals to '21000'
            // This number is in 'Gwei' (sub unit of ethereum). It's equal to 0.000021 ETH
            gas: '0x5208',
            // Passing '._hex' value of parsedAmount
            value: parsedAmount._hex,
          },
        ],
      });

      // Now we store the transaction in the blockchain
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);

      await transactionHash.wait();

      setLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());
    } catch (err) {
      console.log(err);

      throw new Error('No ethereum object.');
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
