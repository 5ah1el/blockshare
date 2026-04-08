require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      // If you are using Ganache UI, the chain ID is usually 5777
      chainId: 5777,
    },
    hardhat: {
      chainId: 1337,
    }
  }
};
