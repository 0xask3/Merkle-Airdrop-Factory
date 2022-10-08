import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("deploy", "Deploys a given contract")
  .addParam("contract", "Name of contract to be deployed")
  .addParam("verify", "Whether verify the contract or not")
  .addOptionalParam("args", "Constructor arguments for contract")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    await hre.run("compile");
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    const Factory = await hre.ethers.getContractFactory(taskArguments.contract);
    let contract, args;
    console.log(`\n Deploying contract: ${taskArguments.contract} \n`);

    if (taskArguments.args) {
      const params: String[] = taskArguments.args.split(",");
      contract = await Factory.connect(signers[0]).deploy(...params);
      args = [...params];
    } else {
      contract = await Factory.connect(signers[0]).deploy();
      args = [];
    }

    console.log("Contract deployed, waiting for 5 confirmations...\n");
    await contract.deployTransaction.wait(5);
    console.log(`${taskArguments.contract} deployed to: ${contract.address} \n`);

    if (taskArguments.verify == 1) {
      console.log(`Verifying contract: ${taskArguments.contract} \n`);
      await hre.run("verify:verify", {
        address: contract.address,
        contract: `contracts/${taskArguments.contract}.sol:${taskArguments.contract}`,
        constructorArguments: args,
      });
    }
  });
