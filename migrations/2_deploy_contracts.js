var IceToken = artifacts.require("./IceToken.sol");
var Store = artifacts.require("./Store.sol");

module.exports = function(deployer) {
    deployer.deploy(Store).then(function(){
        return deployer.deploy(IceToken, 10000000);
    });
  };
  