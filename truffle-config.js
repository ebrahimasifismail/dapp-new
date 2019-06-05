var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "garbage shoulder bachelor scrap month orchard armed opera vacuum prize choose poverty"

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/1456cd94a86d409696c6589e6b2974dd")
      },
      network_id: 3
    }
  }
};
