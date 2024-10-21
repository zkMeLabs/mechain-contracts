import { Deployer } from '../typechain-types';
import { setConstantsToConfig, sleep, toHuman } from './helper';

const fs = require('fs');
const { execSync } = require('child_process');
const { ethers } = require('hardhat');

const log = console.log;
const unit = ethers.constants.WeiPerEther;

let enableCrossChainTransfer = true;
const gnfdChainId = 5151;
let emergencyOperator = ''; // suspend / reopen / cancelTransfer
let emergencyUpgradeOperator = ''; // update params / upgrade contracts
const initConsensusState: any = {
    chainID: 'mechain_5151-1',
    height: 1,
    nextValidatorSetHash: '0xe3080a0690ae4266fef222ca5fbeb7b14233a6fb55b34de139039b4c68f93b33',
    validators: [
        {
            pubKey: '0x8823ed11e1ccf5940258fc557bde27188056015cc941faee75dc5f5f38b6acd0',
            votingPower: 10000000,
            relayerAddress: '0x7135e6a0af54876bb0107fca5016ef5154cdec70',
            relayerBlsKey:
                '0x29d7e149f0da413282c4a953c17bfd2b81295877e9a3b5f7011d761f09d7b2e429f140edbe508704b973699b6c433c0e1f8688eba0321fa13807528a43a79054133eafe09ec15567f92d62a323de5ff32d414f2a2ab5c3c2594c05968841f40128b9ae09b813d6d9b1f34a668d93b00c5e035ed5d1dd052f428cf78b5004fb52',
        },
        {
            pubKey: '0x13643057ad891c6a138402cf2ed684bee85dc8ca09d5b4e0b997f82c9b9e8d5a',
            votingPower: 10000000,
            relayerAddress: '0x1915072fb0e224e42404a5639849e4b855de4eea',
            relayerBlsKey:
                '0x0dcb2e6f11bb2916167b91f8f732c65b7fe3afee3e036670770764bcd67389cc00329e399e4e8d9f44f6c00ae33d9084089930c6e04f96185db23c01d39ef52c2a725a45421d42c7a97df3d6f3a2a973f70a879c9eed080f0ed9da0cd5f70d17129be1c13fd4f520c191ca283d6cdb1de38f85a67eceedeba30eaacbd40854f0',
        },
    ],
    consensusStateBytes:
        '0x6d65636861696e5f353135312d310000000000000000000000000000000000000000000000000001e3080a0690ae4266fef222ca5fbeb7b14233a6fb55b34de139039b4c68f93b338823ed11e1ccf5940258fc557bde27188056015cc941faee75dc5f5f38b6acd000000000009896807135e6a0af54876bb0107fca5016ef5154cdec7029d7e149f0da413282c4a953c17bfd2b81295877e9a3b5f7011d761f09d7b2e429f140edbe508704b973699b6c433c0e1f8688eba0321fa13807528a43a79054133eafe09ec15567f92d62a323de5ff32d414f2a2ab5c3c2594c05968841f40128b9ae09b813d6d9b1f34a668d93b00c5e035ed5d1dd052f428cf78b5004fb5213643057ad891c6a138402cf2ed684bee85dc8ca09d5b4e0b997f82c9b9e8d5a00000000009896801915072fb0e224e42404a5639849e4b855de4eea0dcb2e6f11bb2916167b91f8f732c65b7fe3afee3e036670770764bcd67389cc00329e399e4e8d9f44f6c00ae33d9084089930c6e04f96185db23c01d39ef52c2a725a45421d42c7a97df3d6f3a2a973f70a879c9eed080f0ed9da0cd5f70d17129be1c13fd4f520c191ca283d6cdb1de38f85a67eceedeba30eaacbd40854f0',
};

const initConsensusStateBytes = initConsensusState.consensusStateBytes;
const main = async () => {
    const commitId = await getCommitId();
    const [operator] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(operator.address);
    const network = await ethers.provider.getNetwork();
    log('network', network);
    log('operator.address: ', operator.address, toHuman(balance));

    // POLYGON Mainnet
    if (network.chainId === 137) {
        if (!emergencyOperator) {
            throw new Error('emergencyOperator is not set');
        }

        if (!emergencyUpgradeOperator) {
            throw new Error('emergencyUpgradeOperator is not set');
        }

        let code = await ethers.provider.getCode(emergencyOperator);
        if (code.length < 10) {
            throw new Error('emergencyOperator is not multi-sig contract');
        }

        code = await ethers.provider.getCode(emergencyUpgradeOperator);
        if (code.length < 10) {
            throw new Error('emergencyUpgradeOperator is not multi-sig contract');
        }
    } else {
        // POLYGON Testnet
        if (!emergencyOperator) {
            emergencyOperator = operator.address;
        }

        if (!emergencyUpgradeOperator) {
            emergencyUpgradeOperator = operator.address;
        }
    }

    log('emergencyOperator: ', emergencyOperator);
    log('emergencyUpgradeOperator: ', emergencyUpgradeOperator);

    execSync('npx hardhat compile');
    await sleep(2);

    const deployer = (await deployContract(
        'Deployer',
        gnfdChainId,
        enableCrossChainTransfer
    )) as Deployer;
    log('Deployer deployed', deployer.address);

    const proxyAdmin = await deployer.proxyAdmin();
    const proxyGovHub = await deployer.proxyGovHub();
    const proxyCrossChain = await deployer.proxyCrossChain();
    const proxyTokenHub = await deployer.proxyTokenHub();
    const proxyLightClient = await deployer.proxyLightClient();
    const proxyRelayerHub = await deployer.proxyRelayerHub();
    const proxyBucketHub = await deployer.proxyBucketHub();
    const proxyObjectHub = await deployer.proxyObjectHub();
    const proxyGroupHub = await deployer.proxyGroupHub();
    const proxyPermissionHub = await deployer.proxyPermissionHub();
    const proxyMultiMessage = await deployer.proxyMultiMessage();
    const proxyMechainExecutor = await deployer.proxyMechainExecutor();
    const proxyZkmeSBTHub = await deployer.proxyZkmeSBTHub();

    // Set all generated contracts to Config contracts
    await setConstantsToConfig({
        proxyAdmin,
        proxyGovHub,
        proxyCrossChain,
        proxyTokenHub,
        proxyLightClient,
        proxyRelayerHub,
        proxyBucketHub,
        proxyObjectHub,
        proxyGroupHub,
        proxyPermissionHub,
        proxyMultiMessage,
        proxyMechainExecutor,
        proxyZkmeSBTHub,
        emergencyOperator,
        emergencyUpgradeOperator,
    });

    const implGovHub = await deployContract('GovHub');
    log('deploy implGovHub success', implGovHub.address);

    const implCrossChain = await deployContract('CrossChain');
    log('deploy implCrossChain success', implCrossChain.address);

    const implTokenHub = await deployContract('TokenHub');
    log('deploy implTokenHub success', implTokenHub.address);

    const implLightClient = await deployContract('GnfdLightClient');
    log('deploy implLightClient success', implLightClient.address);

    const implRelayerHub = await deployContract('RelayerHub');
    log('deploy implRelayerHub success', implRelayerHub.address);

    const implBucketHub = await deployContract('BucketHub');
    log('deploy implBucketHub success', implBucketHub.address);

    const implObjectHub = await deployContract('ObjectHub');
    log('deploy implObjectHub success', implObjectHub.address);

    const implGroupHub = await deployContract('GroupHub');
    log('deploy implGroupHub success', implGroupHub.address);

    const implPermissionHub = await deployContract('PermissionHub');
    log('deploy implPermissionHub success', implPermissionHub.address);

    const implMultiMessage = await deployContract('MultiMessage');
    log('deploy implMultiMessage success', implMultiMessage.address);

    const implMechainExecutor = await deployContract('MechainExecutor');
    log('deploy implMechainExecutor success', implMechainExecutor.address);

    const implZkmeSBTHub = await deployContract('ZkmeSBTHub');
    log('deploy implZkmeSBTHub success', implZkmeSBTHub.address);

    const addBucketHub = await deployContract('AdditionalBucketHub');
    log('deploy addBucketHub success', addBucketHub.address);

    const addObjectHub = await deployContract('AdditionalObjectHub');
    log('deploy addObjectHub success', addObjectHub.address);

    const addGroupHub = await deployContract('AdditionalGroupHub');
    log('deploy addGroupHub success', addGroupHub.address);

    const addPermissionHub = await deployContract('AdditionalPermissionHub');
    log('deploy addPermissionHub success', addPermissionHub.address);

    const bucketToken = await deployContract(
        'ERC721NonTransferable',
        'Mechain-Bucket',
        'BUCKET',
        'bucket',
        proxyBucketHub
    );
    log('deploy bucket token success', bucketToken.address);

    const objectToken = await deployContract(
        'ERC721NonTransferable',
        'Mechain-Object',
        'OBJECT',
        'object',
        proxyObjectHub
    );
    log('deploy object token success', objectToken.address);

    const groupToken = await deployContract(
        'ERC721NonTransferable',
        'Mechain-Group',
        'GROUP',
        'group',
        proxyGroupHub
    );
    log('deploy group token success', groupToken.address);

    const permissionToken = await deployContract(
        'ERC721NonTransferable',
        'Mechain-PermissionToken',
        'PERMISSION',
        'permission',
        proxyPermissionHub
    );
    log('deploy permission token  success', permissionToken.address);

    const memberToken = await deployContract('ERC1155NonTransferable', 'member', proxyGroupHub);
    log('deploy member token success', memberToken.address);

    const initAddrs = [
        implGovHub.address,
        implCrossChain.address,
        implTokenHub.address,
        implLightClient.address,
        implRelayerHub.address,
        implBucketHub.address,
        implObjectHub.address,
        implGroupHub.address,
        addBucketHub.address,
        addObjectHub.address,
        addGroupHub.address,
        bucketToken.address,
        objectToken.address,
        groupToken.address,
        memberToken.address,

        implPermissionHub.address,
        addPermissionHub.address,
        permissionToken.address,
        implMultiMessage.address,
        implMechainExecutor.address,
        implZkmeSBTHub.address,
    ];

    let tx = await deployer.deploy(initAddrs, initConsensusStateBytes);
    await tx.wait(5);
    log('deploy success');

    const blockNumber = await ethers.provider.getBlockNumber();
    const deployment: any = {
        DeployCommitId: commitId,
        BlockNumber: blockNumber,

        EmergencyOperator: emergencyOperator,
        EmergencyUpgradeOperator: emergencyUpgradeOperator,

        Deployer: deployer.address,

        ProxyAdmin: proxyAdmin,
        GovHub: proxyGovHub,
        CrossChain: proxyCrossChain,
        TokenHub: proxyTokenHub,
        LightClient: proxyLightClient,
        RelayerHub: proxyRelayerHub,
        BucketHub: proxyBucketHub,
        ObjectHub: proxyObjectHub,
        GroupHub: proxyGroupHub,
        PermissionHub: proxyPermissionHub,
        MultiMessage: proxyMultiMessage,
        MechainExecutor: proxyMechainExecutor,
        ZkmeSBTHub: proxyZkmeSBTHub,

        AdditionalBucketHub: addBucketHub.address,
        AdditionalObjectHub: addObjectHub.address,
        AdditionalGroupHub: addGroupHub.address,
        AdditionalPermissionHub: addPermissionHub.address,

        BucketERC721Token: bucketToken.address,
        ObjectERC721Token: objectToken.address,
        GroupERC721Token: groupToken.address,
        PermissionERC721Token: permissionToken.address,

        MemberERC1155Token: memberToken.address,

        initConsensusState,
        gnfdChainId,
        enableCrossChainTransfer,
    };
    log('all contracts', JSON.stringify(deployment, null, 2));

    const deploymentDir = __dirname + `/../deployment`;
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }
    fs.writeFileSync(
        `${deploymentDir}/${network.chainId}-deployment.json`,
        JSON.stringify(deployment, null, 2)
    );

    // POLYGON Mainnet
    if (network.chainId === 137) {
        return;
    }

    // tx = await operator.sendTransaction({
    //     to: proxyTokenHub,
    //     value: unit.mul(1),
    // });
    // await tx.wait(3);
    log('balance of TokenHub', await ethers.provider.getBalance(proxyTokenHub));

    // const validators = initConsensusState.validators;
    // for (let i = 0; i < validators.length; i++) {
    //     const relayer = validators[i].relayerAddress;
    //     tx = await operator.sendTransaction({
    //         to: ethers.utils.getAddress(relayer),
    //         value: unit.mul(100),
    //     });
    //     await tx.wait(3);
    // }
    log('transfer matic to validators');
};

const deployContract = async (factoryPath: string, ...args: any) => {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const factory = await ethers.getContractFactory(factoryPath);
            const contract = await factory.deploy(...args);
            await contract.deployTransaction.wait(3);
            return contract;
        } catch (error) {
            if (error.code === 'ECONNRESET') {
                console.error(`Error deploying contract: ${error.message}. Retrying...`);
                retries++;
                await new Promise((resolve) => setTimeout(resolve, 2000)); // 等待 2 秒后重试
            } else {
                throw error;
            }
        }
    }
    throw new Error('Failed to deploy contract after multiple retries.');
};

const getCommitId = async (): Promise<string> => {
    try {
        const result = execSync('git rev-parse HEAD');
        log('getCommitId', result.toString().trim());
        return result.toString().trim();
    } catch (e) {
        console.error('getCommitId error', e);
        return '';
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
