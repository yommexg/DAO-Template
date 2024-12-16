import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {
  developmentChains,
  networkConfig,
  VOTING_DELAY,
  VOTING_PERIOD,
  QUORUM_PERCENTAGE,
} from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployGovernorContract: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const governanceToken = await get("GovernanceToken");
  const timeLock = await get("TimeLock");
  log("Deploying Governor...");

  const args = [
    governanceToken.address,
    timeLock.address,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
  ];
  const chainId = network.config.chainId;

  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: chainId ? networkConfig[chainId].blockConfirmations : 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying.......");
    await verify(governorContract.address, args);
  }
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];
