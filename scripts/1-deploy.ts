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
    nextValidatorSetHash: '0x1efb1ca13ea39e7f562de3c3210137c1f5773ddc036a30989f7689ee7f6321e1',
    validators: [
        {
            pubKey: '0x912803316932c63b154a5738b73159d31cd690d968aca38e40bc7f97c1626215',
            votingPower: 10000000,
            relayerAddress: '0x8606092b85e6af882bd84b84346efdaba94441eb',
            relayerBlsKey:
                '0x06728f8c284bc9a0a0de581717e9286a01357fe47eb84791b317b987637397871ce3e7776f643c533b9a28935b77673cc737f7823f5d1523c1efc03afba114a02102753c7872410d59d3eebd05ff831a7503f554a503c7b1af189a8a487b161304d793cde679e522273be528c1f6dab8f2f4db94ec16ef3915da0619b4e6b942',
        },
        {
            pubKey: '0x064530b1be65df37f672c28456514ffc86556089c2d35500be961df36d37771e',
            votingPower: 10000000,
            relayerAddress: '0xccbbedff276fc4bba811239c06201ebc2f2ba695',
            relayerBlsKey:
                '0x28a3de7547598780549e66a330b1c430deb064932639edc09b2cea912ad598d40181b17d96e3b4cde45b3dafe63e0b78e640e2d06859bab2e06f218e21b90308222fa37dfe83ccdf370764302bf5298732517644e06e62d666b361cb7f10924e26cef154fb34f5d70f21ccd135f94f8b24406bb5ed8f8cedabb02a677211a499',
        },
    ],
    consensusStateBytes:
        '0x6d65636861696e5f353135312d3100000000000000000000000000000000000000000000000000011efb1ca13ea39e7f562de3c3210137c1f5773ddc036a30989f7689ee7f6321e1912803316932c63b154a5738b73159d31cd690d968aca38e40bc7f97c162621500000000009896808606092b85e6af882bd84b84346efdaba94441eb06728f8c284bc9a0a0de581717e9286a01357fe47eb84791b317b987637397871ce3e7776f643c533b9a28935b77673cc737f7823f5d1523c1efc03afba114a02102753c7872410d59d3eebd05ff831a7503f554a503c7b1af189a8a487b161304d793cde679e522273be528c1f6dab8f2f4db94ec16ef3915da0619b4e6b942064530b1be65df37f672c28456514ffc86556089c2d35500be961df36d37771e0000000000989680ccbbedff276fc4bba811239c06201ebc2f2ba69528a3de7547598780549e66a330b1c430deb064932639edc09b2cea912ad598d40181b17d96e3b4cde45b3dafe63e0b78e640e2d06859bab2e06f218e21b90308222fa37dfe83ccdf370764302bf5298732517644e06e62d666b361cb7f10924e26cef154fb34f5d70f21ccd135f94f8b24406bb5ed8f8cedabb02a677211a499',
};

const initConsensusStateBytes = initConsensusState.consensusStateBytes;
const main = async () => {
    const commitId = await getCommitId();
    const [operator] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(operator.address);
    const network = await ethers.provider.getNetwork();
    log('network', network);
    log('operator.address: ', operator.address, toHuman(balance));

    // BSC Mainnet
    if (network.chainId === 56) {
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
        // BSC Testnet
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
    const proxyGreenfieldExecutor = await deployer.proxyGreenfieldExecutor();
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
        proxyGreenfieldExecutor,
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

    const implGreenfieldExecutor = await deployContract('GreenfieldExecutor');
    log('deploy implGreenfieldExecutor success', implGreenfieldExecutor.address);

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
        implGreenfieldExecutor.address,
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
        GreenfieldExecutor: proxyGreenfieldExecutor,
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

    // BSC Mainnet
    if (network.chainId === 56) {
        return;
    }

    tx = await operator.sendTransaction({
        to: proxyTokenHub,
        value: unit.mul(1),
    });
    await tx.wait(3);
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
    log('transfer bnb to validators');
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
