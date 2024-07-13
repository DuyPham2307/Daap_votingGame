// blockchain/migrations/2_deploy_contracts.js

const GameVoting = artifacts.require("GameVoting");

module.exports = function (deployer) {
  deployer.deploy(GameVoting);
};
