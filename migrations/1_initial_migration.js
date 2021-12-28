// const RaoArbitrage = artifacts.require("RaoArbitrage");
const RaoUniswapQuery = artifacts.require("RaoUniswapQuery");

module.exports = function (deployer) {
  // deployer.deploy(RaoArbitrage);
  deployer.deploy(RaoUniswapQuery);
};
