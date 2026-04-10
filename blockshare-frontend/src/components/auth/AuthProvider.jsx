import React, { createContext, useContext, useState } from 'react';
import AuthService from '../../services/AuthService';
import UserService from '../../services/UserService';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap your application and provide authentication functionality
export const AuthProvider = ({ children }) => {
  // State to hold information about the authenticated user and Ethereum address
  const [user, setUser] = useState(() => {
    // Check if user data exists in local storage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [ethereumAddress, setEthereumAddress] = useState(() => {
    // Check if Ethereum address exists in local storage
    const storedAddress = localStorage.getItem('ethereum_address');
    return storedAddress ? storedAddress : null;
  });
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if login status exists in local storage
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    return storedIsLoggedIn === 'true';
  });

  // Function to handle user login
  const login = async (username, password) => {
    try {
      // Call the login function from AuthService
      const response = await AuthService.login(username, password);

      console.log('Login response:', response);

      // Check if login was successful
      if (response && response.success) {
        // Set the user, Ethereum address, and login status
        setUser(response.user);
        
        // If user already has an address in DB, use it, otherwise try to get from MetaMask
        let address = response.user.account_address;
        if (!address && window.ethereum) {
           const accounts = await window.ethereum.request({ method: 'eth_accounts' });
           if (accounts.length > 0) address = accounts[0];
        }

        setEthereumAddress(address);
        setIsLoggedIn(true);

        console.log('Login successful:', address);

        // Store user data, Ethereum address, and login status in local storage
        localStorage.setItem('user', JSON.stringify(response.user));
        if (address) {
          localStorage.setItem('ethereum_address', address);
          // If address was found in MetaMask but not in DB, sync it
          if (!response.user.account_address) {
            try {
              await UserService.updateUserAddress(response.user.id, address);
              console.log("Wallet address synced to database during login");
            } catch (error) {
              console.error("Failed to sync wallet address during login:", error);
            }
          }
        }
        localStorage.setItem('isLoggedIn', true);

        return true; // Return true indicating successful login
      } else {
        console.error('Login failed:', response && response.message);
        return false; // Return false indicating failed login
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      return false; // Return false indicating failed login
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        // Update local state and storage
        setEthereumAddress(address);
        localStorage.setItem('ethereum_address', address);
        
        // Sync to database if user is logged in
        if (user && user.id) {
          try {
            await UserService.updateUserAddress(user.id, address);
            console.log("Wallet address synced to database");
          } catch (error) {
            console.error("Failed to sync wallet address to database:", error);
          }
        }
        
        return address;
      } catch (error) {
        console.error("User denied account access");
        return null;
      }
    } else {
      alert("Please install MetaMask!");
      return null;
    }
  };

  // Function to handle user logout
  const logout = async () => {
    // Clear user data, Ethereum address, and login status from local storage
    localStorage.removeItem('user');
    // localStorage.removeItem('ethereum_address');
    localStorage.removeItem('isLoggedIn');

    // Update the user state, Ethereum address state, and login status state
    setUser(null);
    setEthereumAddress(null);
    setIsLoggedIn(false);
  };

  // Value to be provided by the context
  const value = {
    user,
    isLoggedIn,
    login,
    logout,
    ethereumAddress,
    setEthereumAddress,
    connectMetaMask
  };

  // Provide the authentication context to the children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
