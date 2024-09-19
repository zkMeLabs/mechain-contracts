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

Once these resources are mirrored on ethereum-compatible chain, they can be directly managed by smart contracts on ethereum-compatible chain.
These operations will directly affect the storage format, access permissions, and other aspects of the data on Mechain.
In other words, any changes made to the decentralized application on ethereum-compatible chain will also reflect changes on Mechain.
This integration between Mechain Blockchain and BNB Smart Chain allows for greater flexibility and accessibility
when it comes to accessing and manipulating data, ultimately leading to a more streamlined and efficient
data management process.

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

- create a bucket on ethereum-compatible chain
- delete a bucket on ethereum-compatible chain
- mirror bucket from Mechain to ethereum-compatible chain

**Object**:

- delete an object on ethereum-compatible chain
- mirror object from Mechain to ethereum-compatible chain
- grant/revoke permissions of objects on ethereum-compatible chain to accounts/groups
- create an object on ethereum-compatible chain (pending)
- copy objects on ethereum-compatible chain (pending)
- Kick off the execution of an object on ethereum-compatible chain (pending)

**Group**:

- create a group on ethereum-compatible chain
- delete a group on ethereum-compatible chain
- change group members on ethereum-compatible chain
- mirror group from Mechain to ethereum-compatible chain

Users can also approve smart contracts to operate the aforementioned resources instead, check the
[design](https://Mechain.bnbchain.org/docs/guide/dapp/permisson-control.html) for more details.

## Requirement

set environment

```shell
# require Node.js 14+
cp .env.example .env
# modify the env variable `DeployerPrivateKey` to your own private key

# make sure the address corresponding to the private key has enough tBNB in the ethereum-compatible chain Testnet
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

- ethereum-compatible chain ChainID: 56
- ethereum-compatible chain RPC: <<https://ethereum-compatible> chain-dataseed1.binance.org>
- ethereum-compatible chain Explorer: <<https://ethereum-compatible> chainscan.com/>

- Mechain ChainID: mechain_5151-1
- Mechain RPC: <https://Mechain-chain.bnbchain.org:443>
- Mechain GRPC swagger: <https://Mechain-chain.bnbchain.org/openapi>
- Mechain Storage dApp: <https://dcellar.io/>
- Mechain Explorer: <http://Mechainscan.com/>

### Mechain Contracts on ethereum-compatible chain Testnet

- ethereum-compatible chain Testnet ChainID: 97
- ethereum-compatible chain Testnet RPC: <<https://data-seed-preethereum-compatible> chain-1-s1.binance.org:8545/>
- ethereum-compatible chain Testnet Explorer: <<https://testnet.ethereum-compatible> chainscan.com/>

- Mechain ChainID: Mechain_5600-1
- Mechain RPC: <https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org>
- Mechain GRPC swagger: <https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org/openapi>
- Mechain Storage dApp: <https://dcellar.io/>
- Mechain Explorer: <http://Mechainscan.com/>

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
|---------------|--------------------------------------------|
| CrossChain    | 0x77e719b714be09F70D484AB81F70D02B0E182f7d |
| TokenHub      | 0xeA97dF87E6c7F68C9f95A69dA79E19B834823F25 |
| BucketHub     | 0xE909754263572F71bc6aFAc837646A93f5818573 |
| ObjectHub     | 0x634eB9c438b8378bbdd8D0e10970Ec88db0b4d0f |
| GroupHub      | 0xDd9af4573D64324125fCa5Ce13407be79331B7F7 |

Extra:

| contract name | address                                    |
|---------------|--------------------------------------------|
| Deployer      | 0x4763c12b21a548BCbD22a682fb15930565e27C43 |
| ProxyAdmin    | 0xf9010DC773eE3961418C96dc67Fc5DcCB3EA2C08 |
| LightClient   | 0x433bB48Bd86c089375e53b2E2873A9C4bC0e986B |
| RelayerHub    | 0x31C477F05CE58bB81A9FB4b8c00560f1cBe185d1 |

for full list of contracts, please refer to:
[Deployment on ethereum-compatible chain](https://github.com/bnb-chain/Mechain-contracts/blob/master/deployment/56-deployment.json)

### Testnet

| contract name | address                                    |
|---------------|--------------------------------------------|
| CrossChain    | 0xa5B2c9194131A4E0BFaCbF9E5D6722c873159cb7 |
| TokenHub      | 0xED8e5C546F84442219A5a987EE1D820698528E04 |
| BucketHub     | 0x5BB17A87D03620b313C39C24029C94cB5714814A |
| ObjectHub     | 0x1b059D8481dEe299713F18601fB539D066553e39 |
| GroupHub      | 0x50B3BF0d95a8dbA57B58C82dFDB5ff6747Cc1a9E |

Extra:

| contract name | address                                    |
|---------------|--------------------------------------------|
| Deployer      | 0x79aC4Ce73Cf5c4896a311CD39d2EB47E604D18E3 |
| ProxyAdmin    | 0xdD1c0a54a9EDEa8d0821AEB5BE54c51B79fa4c2e |
| LightClient   | 0xa9249cefF9cBc9BAC0D9167b79123b6C7413F50a |
| RelayerHub    | 0x91cA83d95c8454277d1C297F78082B589e6E4Ea3 |

for full list of contracts, please refer to:
[Deployment on ethereum-compatible chain Testnet](https://github.com/bnb-chain/Mechain-contracts/blob/master/deployment/97-deployment.json)

## Verify on ethereum-compatible chainScan

```shell
# modify the env variable `ethereum-compatible chainSCAN_APIKEY` to your own api-key created on https://ethereum-compatible chainscan.com/myapikey
npm run verify:testnet
npm run verify:ethereum-compatible chain
```

## Cross-Chain Transfer to Mechain

```shell
# make sure the foundry dependency are installed 
# 1. add private-key, receiver and BNB amount to ./foundry-scripts/transferOut.sh
# 2. run shell command
# cross-chain transfer 0.2 BNB (amount = 2 * 10 ^ 17) to your receiver on Mechain
forge script foundry-scripts/TokenHub.s.sol:TokenHuethereum-compatible chainript \
--private-key ${your private key} \
--sig "transferOut(address receiver, uint256 amount)" \
${the receiver you transfer to} 200000000000000000  \
-f https://data-seed-preethereum-compatible chain-1-s1.binance.org:8545/  \
--legacy --ffi --broadcast
# More examples please refer to ./foundry-scripts/examples/transferOut.sh
```

## Cross-Chain Operation to Mechain

```shell
# make sure the foundry dependency are installed 
# group operation - add member to the group
forge script foundry-scripts/GroupHub.s.sol:GroupHuethereum-compatible chainript \
--private-key ${your private key} \
--sig "addMember(address operator, uint256 groupId, address member)" \
${the owner of the group} ${your group id} ${the member address to add} \
-f https://data-seed-preethereum-compatible chain-1-s1.binance.org:8545/ \
--legacy --ffi --broadcast
# More examples please refer to ./foundry-scripts/examples/updateGroup.sh

# bucket operation - delete a bucket
forge script foundry-scripts/BucketHub.s.sol:BucketHuethereum-compatible chainript \
--private-key ${your private key} \
--sig "deleteBucket(uint256 bucketId)" \
${bucketId to delete} \
-f https://data-seed-preethereum-compatible chain-1-s1.binance.org:8545/ \
--legacy --ffi --broadcast
# More examples please refer to ./foundry-scripts/examples/bucketHub.sh

# object operation - delete an object
forge script foundry-scripts/ObjectHub.s.sol:ObjectHuethereum-compatible chainript \
--private-key ${your private key} \
--sig "deleteObject(uint256 id)" \
${object id to delete} \
-f https://data-seed-preethereum-compatible chain-1-s1.binance.org:8545/ \
--legacy --ffi --broadcast
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

This project is forked from [Mechain-contracts](https://github.com/bnb-chain/Mechain-contracts). Significant changes have been made to adapt the project for specific use cases, but much of the core functionality comes from the original project.
