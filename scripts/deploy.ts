import { execSync } from "child_process";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`Enter Contract Name: `, contract => {
  rl.question(`Enter network where contract should be deployed: `, network => {
    rl.question(`Enter constructor arguments (Comma separated): `, args => {
      rl.question(`Should verify contract on block explorer (true/false): `, verify => {
        const op = execSync(`npx hardhat deploy --contract ${contract} --network ${network} --args ${args} --verify ${verify}`, {
          encoding: "utf-8",
        });
        console.log("Result:\n", op);
        rl.close();
      });
    });
  });
});
