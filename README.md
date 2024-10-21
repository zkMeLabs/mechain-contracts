# Mechain Contracts

Mechain Contracts is the bridge between Mechain and ethereum-compatible chain for cross-chain communication.

## Overview

The Mechain Blockchain provides a comprehensive set of resources that can be mirrored on the ethereum-compatible chain.
This includes buckets, objects, and groups, which can be stored and managed on the ethereum-compatible chain as non-fungible tokens (NFTs)
conforming to the ERC-721 standard.

A bucket is a logical container for storing objects in Mechain. An object, on the other hand, is a fundamental unit
of storage in Mechain that represents a file consisting of data and its associated metadata.
Lastly, a group is a collection of accounts with the same permissions.

These resources can be mirrored on the ethereum-compatible chain as ERC-721 NFTs, along with the members within a group, which represent
permissions to specify resources, that can be mirrored as ERC-1155 token. At present, the NFTs are not transferable,
but the transferability feature will be added in the near future.

Once these resources are mirrored on ethereum-compatible chain, they can be only read by smart contracts on ethereum-compatible chain(can be directly managed by admin account).


## Key Contract

1. **CrossChain**. The underlying cross-chain communication protocol. This contract is responsible for handling
   all aspects of cross-chain communication packages, including verification, encoding, decoding, routing, reward distribution.
2. **GovHub**. This contract oversees all aspects of contract upgrades, parameter adjustments, and handles governance
   requests originating from the `Mechain`. Additionally, it validates and executes governance proposals as required.
3. **TokenHub**. This contract is tasked with handling cross-chain transactions, encompassing both `transferIn` and
   `transferOut`. Upon initiating a cross-chain transfer from the `Mechain` to the ethereum-compatible chain, tokens are initially locked within
   the `TokenHub`, subsequently triggering a cross-chain transfer event.
4. **GroupHub**. This contract is responsible for managing the `Mechain` group,
   including the addition and removal of members.
5. **BucketHub**. This contract is responsible for managing the `Mechain` buckets.
6. **ObjectHub**. This contract is responsible for managing the `Mechain` objects.

## Resource Operating Primitives

A number of cross-chain primitives have been defined on ethereum-compatible chain to enable developers to manage Mechain resources on the
ethereum-compatible chain directly, without the need for intermediaries.

**Bucket**:

- create a bucket on ethereum-compatible chain(only admin account)
- delete a bucket on ethereum-compatible chain(only admin account)
- mirror bucket from Mechain to ethereum-compatible chain

**Object**:

- delete an object on ethereum-compatible chain(only admin account)
- mirror object from Mechain to ethereum-compatible chain
- grant/revoke permissions of objects on ethereum-compatible chain to accounts/groups(only admin account)
- create an object on ethereum-compatible chain (pending)
- copy objects on ethereum-compatible chain (pending)
- Kick off the execution of an object on ethereum-compatible chain (pending)

**Group**:

- create a group on ethereum-compatible chain(only admin account)
- delete a group on ethereum-compatible chain(only admin account)
- change group members on ethereum-compatible chain(only admin account)
- mirror group from Mechain to ethereum-compatible chain

Users can also approve smart contracts to operate the aforementioned resources instead, check the
[design](https://zk.me/docs/guide/dapp/permisson-control.html) for more details.

## Requirement

set environment

```shell
# require Node.js 14+
cp .env.example .env
# modify the env variable `DeployerPrivateKey` to your own private key

# make sure the address corresponding to the private key has enough azkme in the ethereum-compatible chain Testnet
```

Install foundry:

```shell script
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install dependencies:

```shell
make install-dependencies
```

## Lint

```shell
yarn lint:check
yarn lint:write
```

## Build

```shell
make build
```

## Deploy

```shell
# modify the env variable `DeployerPrivateKey` to your own private key on ethereum-compatible chain Testnet
npm run deploy:testnet

# modify the env variable `DeployerPrivateKey` to your own private key on ethereum-compatible chain
npm run deploy:ethereum-compatible chain
```

## Deployment

### Mechain Contracts on ethereum-compatible chain

#### Optimism
- ChainID: 10
- Explorer: <https://optimistic.etherscan.io/>
- Mechain ChainID: mechain_5252-1

#### BSC
- ChainID: 56
- Explorer: <https://bscscan.com/>
- Mechain ChainID: mechain_5252-1

#### Polygon
- ChainID: 137
- Explorer: <https://polygonscan.com/>
- Mechain ChainID: mechain_5252-1

#### opBNB
- ChainID: 204
- Explorer: <https://opbnb.bscscan.com/>
- Mechain ChainID: mechain_5252-1

#### Mantle
- ChainID: 5000
- Explorer: <https://mantlescan.xyz/>
- Mechain ChainID: mechain_5252-1

#### Arbitrum
- ChainID: 42161
- Explorer: <https://arbiscan.io/>
- Mechain ChainID: mechain_5252-1

#### Linea
- ChainID: 59144
- Explorer: <https://lineascan.build/>
- Mechain ChainID: mechain_5252-1

#### Scroll
- ChainID: 534352
- Explorer: <https://scrollscan.com/>
- Mechain ChainID: mechain_5252-1

### Mechain Contracts on ethereum-compatible chain Testnet

#### BSC Testnet
- ChainID: 97
- Explorer: <https://testnet.bscscan.com/>
- Mechain ChainID: mechain_5151-1

#### opBNB Testnet
- ChainID: 5611
- Explorer: <https://opbnb-testnet.bscscan.com/>
- Mechain ChainID: mechain_5151-1

#### Linea Sepolia
- ChainID: 59141
- Explorer: <https://sepolia.lineascan.build/>
- Mechain ChainID: mechain_5151-1

### ERC2771Forwarder

The eip-2771 defines a contract-level protocol for Recipient contracts to accept meta-transactions through trusted Forwarder contracts. No protocol changes are made.
Recipient contracts are sent the effective `msg.sender` (referred to as _erc2771Sender()) and `msg.data` (referred to as_msgData()) by appending additional calldata.

The trusted ERC2771_FORWARDER contract is deployed from: <https://github.com/bnb-chain/ERC2771Forwarder.git>
> TrustedForwarder Address on All Chains: 0xdb7d0bd38D223048B1cFf39700E4C5238e346f7F

More details, refer to

- [eip-2771](https://eips.ethereum.org/EIPS/eip-2771)
- [Openzeppelin ERC2771Forwarder](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/metatx/ERC2771Forwarder.sol)

## Contract Entrypoint

### Mainnet

| contract name | address                                    |
| ------------- | ------------------------------------------ |
| CrossChain    | 0x41FB8A469f4380141E31d17e3fd27eC8AFF596B0 |
| TokenHub      | 0x32CdeAA01b1Ec091bE4366803e2d6FE49b5b59da |
| BucketHub     | 0x800fa19D39b0d9Ae20ccEf062439dA7340B30EA9 |
| ObjectHub     | 0xB737C6530f6BADc78Eb56395C838c4222CdbE8D8 |
| GroupHub      | 0xf8fB9187D72E154aA0d448754c6368Ca357d2D23 |

Extra:

| contract name | address                                    |
| ------------- | ------------------------------------------ |
| Deployer      | 0x40919E586BD833857e847E6e8734F0b5D5afAE63 |
| ProxyAdmin    | 0xe0B327f0811ed1269722ddE6e8b07e6C16c4E9a9 |
| LightClient   | 0x659A2Bf95b12537af74425d22B85cfC09908923F |
| RelayerHub    | 0xA3235195c0b325d969Bdb4ce8263Df06bbc0c4A5 |

for full list of contracts, please refer to:
[Deployment on Polygon](https://github.com/zkMeLabs/mechain-contracts/blob/develop/deployment/137-deployment.json)

### Testnet

| contract name | address                                    |
| ------------- | ------------------------------------------ |
| CrossChain    | 0x3CeC77c96294634dA18AE89e0E18268Dc8E14714 |
| TokenHub      | 0xC38e9565928F0C979BA7EBD40d617D2981e79A15 |
| BucketHub     | 0x05b93fBA10404501d898929a9c5C96f3B7F2ab35 |
| ObjectHub     | 0xECb9df63b9C55b241e36E48041E35240263Bcb3C |
| GroupHub      | 0x7Db585e110b8808d7B2D50b845d54444a0e7026E |

Extra:

| contract name | address                                    |
| ------------- | ------------------------------------------ |
| Deployer      | 0x36BF4Abe28648f1Ce64e4f688458eEad051eDd16 |
| ProxyAdmin    | 0x0744364EcDCf6637DBf0f14729dDAB361321F376 |
| LightClient   | 0x746697dBcf194Ca2C632EFB1EeA640E766d3C6b8 |
| RelayerHub    | 0x8709Eb27ef5A3E5CB3B43c0f96C1fc63026Bfd0D |

for full list of contracts, please refer to:
[Deployment on BSC Testnet](https://github.com/zkMeLabs/mechain-contracts/blob/develop/deployment/97-deployment.json)

## Verify on ethereum-compatible chainScan

```shell
# modify the env variable `ethereum-compatible chainSCAN_APIKEY` to your own api-key created on https://ethereum-compatible chainscan.com/myapikey
npm run verify:testnet
npm run verify:ethereum-compatible chain
```

## Inspect Transactions

```shell
# 1. add your txHash to `InspectTxHashes` on `scripts/3-decode-events.ts`
# 2. run script on ethereum-compatible chain testnet
npx hardhat run scripts/3-decode-events.ts --network ethereum-compatible chain-testnet

# run script on ethereum-compatible chain
npx hardhat run scripts/3-decode-events.ts --network ethereum-compatible chain
```

## Test

```shell
# start a local chain
anvil -b 1

# run test on another terminal
npm run deploy:local
forge t -vvv --ffi
```

## Large Transfer Unlock

```shell script
npm install typescript ts-node -g

cp .env.example .env
# set RPC_URL, OPERATOR_PRIVATE_KEY, UNLOCK_RECEIVER to .env

ts-node scripts/6-claim-unlock-bot.ts
```

## Contribution

Thank you for considering helping with the source code! We appreciate contributions from anyone on the internet, no
matter how small the fix may be.

If you would like to contribute to Mechain, please follow these steps: fork the project, make your changes, commit them,
and send a pull request to the maintainers for review and merge into the main codebase. However, if you plan on submitting
more complex changes, we recommend checking with the core developers first via GitHub issues (we will soon have a Discord channel)
to ensure that your changes align with the project's general philosophy. This can also help reduce the workload of both
parties and streamline the review and merge process.

## License

The Mechain contracts (i.e. all code inside the `contracts` directory) are licensed under the
[GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html), also
included in our repository in the `COPYING` file.

## Fork Information

This project is forked from [greenfield-contracts](https://github.com/bnb-chain/greenfield-contracts). Significant changes have been made to adapt the project for specific use cases, but much of the core functionality comes from the original project.
