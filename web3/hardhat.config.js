require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/G4oBszniKdXRXCcwnt6HLo4yNQU0V855',
      accounts: ['bbfe9db710ac41abe604eddcba85cbda7e4bc9c45ad938d0a5bb60cc56fb4524']
    }
  }
};
