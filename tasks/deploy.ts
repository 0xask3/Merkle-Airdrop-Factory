import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy", "Deploys a given contract")
  .addParam("contract", "Name of contract to be deployed")
  .addParam("verify", "Whether verify the contract or not")
  .addOptionalParam("args", "Constructor arguments for contract")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    const Factory = await hre.ethers.getContractFactory(taskArguments.contract);
    let contract;
    if (taskArguments.args) {
      const params = taskArguments.args.split(" ");
      contract = await Factory.connect(signers[0]).deploy(...params);
      await contract.deployed();
      if (taskArguments.verify) {
        await hre.run("verify:verify", {
          address: contract.address,
          constructorArguments: [...params],
        });
      }
    } else {
      contract = await Factory.connect(signers[0]).deploy();
      await contract.deployed();
      if (taskArguments.verify) {
        await hre.run("verify:verify", {
          address: contract.address,
          constructorArguments: [],
        });
      }
    }
    console.log(`${taskArguments.contract} deployed to: ${contract.address}`);
  });
