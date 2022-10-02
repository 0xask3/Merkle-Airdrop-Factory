import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy", "Deploys a given contract")
  .addParam("contract", "Name of contract to be deployed")
  .addParam("args", "Constructor arguments for contract")
  .addParam("verify","Whether verify the contract or not",false)
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    const params = taskArguments.args.split(",");
    const Factory = await hre.ethers.getContractFactory(taskArguments.contract);
    const contract = await Factory.connect(signers[0]).deploy(...params);
    await contract.deployed();
    console.log(`${taskArguments.contract} deployed to: ${contract.address}`);
    
    if(taskArguments.verify){
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: [...params],
      });
    }
    
  });
