import * as fs from "fs";
import {
  developmentChains,
  proposalsFile,
  VOTING_PERIOD,
} from "../helper-hardhat-config";
import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-block";

async function main() {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  const chainId = network.config.chainId!.toString();

  const proposalId = proposals[chainId].at(-1);
  const voteWay = 1;
  const reason = "I love football";

  await vote(proposalId, voteWay, reason);
  console.log("Voted!!!");

  const governor = await ethers.getContract("GovernorContract");
  const proposalState = await governor.state(proposalId);
  console.log(`Final Proposal State: ${proposalState}`);
}

// // 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(
  proposalId: string,
  voteWay: number,
  reason: string
) {
  console.log("Voting...");
  const governor = await ethers.getContract("GovernorContract");
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
  const voteTxReceipt = await voteTx.wait(1);
  console.log(voteTxReceipt.events[0].args.reason);
  const proposalState = await governor.state(proposalId);
  console.log(`Current Proposal State: ${proposalState}`);
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
