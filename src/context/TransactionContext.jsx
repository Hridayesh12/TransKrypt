import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/contracts";
export const TransactionContext = React.createContext();
const { ethereum } = window;
const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionContract;
};
export const TransactionProvider = ({ children }) => {
  const [formData, setformData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);
  const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }
    const getAllTransactions = async () => {
      try{
        
      if (!ethereum) return alert("Please Install MetaMask");
      const transactionsContract = getEthereumContract();
      const available_transaction = await transactionsContract.getAllTransactions();
      const structured_transaction = available_transaction.map((trans) => ({
        addressTo: trans.receiver,
        addressFrom: trans.sender,
        timestamp:new Date(trans.timestamp.toNumber() * 1000).toLocaleString(),
        message: trans.message,
        keyword: trans.keyword,
        amount: parseInt(trans.amount._hex) / (10 ** 18)
      }))
      console.log(structured_transaction);
      setTransactions(structured_transaction);
      }
      catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
    }
  const checkIfWalletIsConntected = async () => {
    try{
        if (!ethereum) return alert("Please Install MetaMask");
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
      getAllTransactions();
    }
    else{
        console.log("No Accounts Founr");
    }
    console.log(accounts);
    }
    catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
    
  };
    const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = getEthereumContract();
        const transactionsCount = await transactionsContract.getTransactionCount();
        window.localStorage.setItem("transactionCount", transactionsCount);
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };
  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = getEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          }],
        });

        const transactionHash = await transactionsContract.addToBlockChain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();
        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };
useEffect(() => {
    checkIfWalletIsConntected();
    checkIfTransactionsExists();
  }, []);
  return (
    <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setformData, handleChange,sendTransaction,transactions,isLoading }}>
      {children}
    </TransactionContext.Provider>
  );
};
