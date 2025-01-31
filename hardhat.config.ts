import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config';

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },

    networks: {
        'test': {
            url: process.env.RPC_TEST || "http://127.0.0.1:8545",
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
                process.env.RelayerPrivateKey || '0x3c7ea76ddb53539174caae1dd960b308981933bd6e95196556ba29063200df9c',
                '0x23400f0b4857a2228218fa74fbcac1f2285c03e60d590afe8fa3dc93692aa7be', // faucet
                '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
                '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
                '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
                '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
                '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
                '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
                '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
                '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
            ],
        },
        'local': {
            url: process.env.BSC_LOCAL || "http://127.0.0.1:8545",
            accounts: [
                '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
                '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',  // relayer
                '0x23400f0b4857a2228218fa74fbcac1f2285c03e60d590afe8fa3dc93692aa7be', // faucet
            ],
            gasPrice: 10 * 1e9
        },
        'bsc-testnet': {
            url: process.env.BSC_TESTNET_RPC || 'https://bsc-testnet-rpc.publicnode.com/',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ],
            gasPrice: 10e9,
        },
        'bsc': {
            url: process.env.BSC_RPC || 'https://bsc-dataseed1.binance.org',
            accounts: {
                mnemonic: process.env.BSC_MN || 'test test test test test test test test test test test test',
            },
            gasPrice: 3.1 * 1e9
        },
        'polygon': {
            url: process.env.POLYGON_RPC || 'https://polygon-bor-rpc.publicnode.com',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ]
        },
        'linea': {
            url: process.env.LINEA_RPC || 'https://linea.blockpi.network/v1/rpc/public',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ]
        },
        'scroll': {
            url: process.env.SCROLL_RPC || 'https://scroll.drpc.org',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ]
        },
        'mantle': {
            url: process.env.MANTLE_RPC || 'https://rpc.ankr.com/mantle',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ]
        },
        'arbitrum': {
            url: process.env.ARBITRUM_RPC || 'https://api.stateless.solutions/arbitrum-one/v1/demo',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ]
        },
        'optimism': {
            url: process.env.OPTIMISM_RPC || 'https://optimism.llamarpc.com',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ]
        },
        'goerli': {
            url: process.env.GOERLI_RPC || 'https://rpc.ankr.com/eth_goerli',
            accounts: [
                process.env.DeployerPrivateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',  // developer
            ]
        },
        'opbnb': {
            url: 'https://opbnb-mainnet-rpc.bnbchain.org',
            accounts: {
                mnemonic: process.env.OP_MN || 'test test test test test test test test test test test test',
            },
            gasPrice: 1e8,
        },
        'opbnb-testnet': {
            url: 'https://opbnb-testnet-rpc.bnbchain.org',
            accounts: {
                mnemonic: process.env.OP_MN || 'test test test test test test test test test test test test',
            },
            gasPrice: 1e8,
        },
    },
    etherscan: {
        apiKey: {
            // opBNB: process.env.OPBNB_API_KEY || '',
            opBNB: process.env.OPBNB_BSCSCAN_APIKEY || '',
            opBNBTestnet: process.env.OPBNB_BSCSCAN_APIKEY || '',

            bsc: process.env.BSCSCAN_APIKEY || '',
            bscTestnet: process.env.BSCSCAN_APIKEY || '',
        },
        customChains: [
            {
                network: "opBNB",
                chainId: 204, // opBNB Mainnet
                urls: {
                    apiURL: `https://api-opbnb.bscscan.com/api`,  // opBNB Mainnet
                    browserURL: "https://opbnb.bscscan.com",  // opBNB mainnet
                },
            },
            {
                network: "opBNBTestnet",
                chainId: 5611, // opBNB Testnet
                urls: {
                    apiURL: `https://api-opbnb-testnet.bscscan.com/api`,  // opBNB Testnet
                    browserURL: "https://opbnb-testnet.bscscan.com/",  // opBNB Testnet
                },
            },
        ],
    },

};

export default config;
