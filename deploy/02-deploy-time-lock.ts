import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {
  developmentChains,
  networkConfig,
  MIN_DELAY,
} from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployTimeLock: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  network,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Deploying Time Lock...");

  const args = [MIN_DELAY, [], [], deployer];
  const chainId = network.config.chainId;

  const timelock = await deploy("TimeLock", {
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
    await verify(timelock.address, args);
  }
};

export default deployTimeLock;

deployTimeLock.tags = ["all", "time"];
