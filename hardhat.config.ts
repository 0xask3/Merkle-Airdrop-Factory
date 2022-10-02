import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";

import "./tasks/deploy.ts";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const chainIds = {
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GOERLI: 5,
  KOVAN: 42,
  BSCMAINNET: 56,
  BSCTESTNET: 97,
  POLYGON: 137,
  HARDHAT: 31337,
  AVAXTESTNET: 43113,
  AVAXMAINNET: 43114,
  MUMBAI: 80001,
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  return {
    accounts: {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[chain],
    url: process.env[chain],
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: process.env.SNOWTRACE || "",
      avalanche: process.env.SNOWTRACE || "",
      bscTestnet: process.env.BSCSCAN || "",
      bsc: process.env.BSCSCAN || "",
      goerli: process.env.ETHERSCAN || "",
      mainnet: process.env.ETHERSCAN || "",
      ropsten: process.env.ETHERSCAN || "",
      rinkeby: process.env.ETHERSCAN || "",
      kovan: process.env.ETHERSCAN || "",
      polygon: process.env.POLYGONSCAN || "",
      polygonMumbai: process.env.POLYGONSCAN || "",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.HARDHAT,
    },
    avalanche: getChainConfig("AVAXMAINNET"),
    avalancheFujiTestnet: getChainConfig("AVAXTESTNET"),
    bscTestnet: getChainConfig("BSCTESTNET"),
    bsc: getChainConfig("BSCMAINNET"),
    goerli: getChainConfig("GOERLI"),
    ropsten: getChainConfig("ROPSTEN"),
    rinkeby: getChainConfig("RINKEBY"),
    kovan: getChainConfig("KOVAN"),
    mainnet: getChainConfig("MAINNET"),
    polygon: getChainConfig("POLYGON"),
    polygonMumbai: getChainConfig("MUMBAI"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.15",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 9999,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
