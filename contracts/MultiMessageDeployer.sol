// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "./Deployer.sol";
import "./GnfdProxy.sol";
import "./GnfdProxyAdmin.sol";
import "./GnfdLightClient.sol";
import "./CrossChain.sol";
import "./RelayerHub.sol";
import "./middle-layer/GovHub.sol";
import "./middle-layer/TokenHub.sol";
import "./middle-layer/resource-mirror/BucketHub.sol";
import "./middle-layer/resource-mirror/ObjectHub.sol";
import "./middle-layer/resource-mirror/GroupHub.sol";
import "./middle-layer/resource-mirror/MultiMessage.sol";
import "./middle-layer/MechainExecutor.sol";

contract MultiMessageDeployer {
    bytes20 public immutable deployRepoCommitId;

    Deployer public immutable oldDeployer;
    address public immutable proxyMultiMessage;
    address public immutable proxyMechainExecutor;

    address public implMultiMessage;
    address public implMechainExecutor;

    bool public deployed;
    address public operator;

    modifier onlyOperator() {
        require(msg.sender == operator, "only operator");
        _;
    }

    constructor(address _oldDeployer, bytes20 _deployRepoCommitId) {
        operator = msg.sender;
        oldDeployer = Deployer(_oldDeployer);
        deployRepoCommitId = _deployRepoCommitId;

        proxyMultiMessage = calcCreateAddress(address(this), uint8(1));
        proxyMechainExecutor = calcCreateAddress(address(this), uint8(2));
    }

    function deploy(address _implMultiMessage, address _implMechainExecutor) external onlyOperator {
        require(!deployed, "only not deployed");
        deployed = true;
        implMultiMessage = _implMultiMessage;
        implMechainExecutor = _implMechainExecutor;

        address deployedProxyMultiMessage = address(new GnfdProxy(_implMultiMessage, oldDeployer.proxyAdmin(), ""));
        require(deployedProxyMultiMessage == proxyMultiMessage, "invalid proxyMultiMessage address");
        MultiMessage(payable(proxyMultiMessage)).initialize();
        MultiMessage(payable(proxyMultiMessage)).initializeV2();

        address deployedProxyMechainExecutor = address(
            new GnfdProxy(_implMechainExecutor, oldDeployer.proxyAdmin(), "")
        );
        require(deployedProxyMechainExecutor == proxyMechainExecutor, "invalid proxyMechainExecutor address");
        MechainExecutor(payable(proxyMechainExecutor)).initialize();

        require(
            MultiMessage(payable(proxyMultiMessage)).CROSS_CHAIN() == oldDeployer.proxyCrossChain(),
            "invalid CROSS_CHAIN address on proxyMultiMessage"
        );
        require(
            Config(deployedProxyMultiMessage).PROXY_ADMIN() == oldDeployer.proxyAdmin(),
            "invalid proxyAdmin address on Config"
        );
        require(
            Config(deployedProxyMultiMessage).GOV_HUB() == oldDeployer.proxyGovHub(),
            "invalid proxyGovHub address on Config"
        );
        require(
            Config(deployedProxyMultiMessage).CROSS_CHAIN() == oldDeployer.proxyCrossChain(),
            "invalid proxyCrossChain address on Config"
        );
        require(
            Config(deployedProxyMultiMessage).TOKEN_HUB() == oldDeployer.proxyTokenHub(),
            "invalid proxyTokenHub address on Config"
        );
        require(
            Config(deployedProxyMultiMessage).GOV_HUB() == oldDeployer.proxyGovHub(),
            "invalid proxyGovHub address on Config"
        );
        require(
            Config(deployedProxyMultiMessage).RELAYER_HUB() == oldDeployer.proxyRelayerHub(),
            "invalid proxyRelayerHub address on Config"
        );
        require(
            Config(deployedProxyMultiMessage).GNFD_EXECUTOR() == proxyMechainExecutor,
            "invalid GNFD_EXECUTOR address on Config"
        );

        require(
            Config(proxyMechainExecutor).MULTI_MESSAGE() == proxyMultiMessage,
            "invalid MULTI_MESSAGE address on deployedProxyMechainExecutor"
        );
        require(
            Config(proxyMechainExecutor).CROSS_CHAIN() == oldDeployer.proxyCrossChain(),
            "invalid CROSS_CHAIN address on deployedProxyMechainExecutor"
        );
        require(
            Config(proxyMechainExecutor).MULTI_MESSAGE() == proxyMultiMessage,
            "invalid MULTI_MESSAGE address on deployedProxyMechainExecutor"
        );
        require(
            Config(proxyMechainExecutor).PROXY_ADMIN() == oldDeployer.proxyAdmin(),
            "invalid proxyAdmin address on deployedProxyMechainExecutor"
        );
        require(
            Config(proxyMechainExecutor).GOV_HUB() == oldDeployer.proxyGovHub(),
            "invalid GOV_HUB address on deployedProxyMechainExecutor"
        );
    }

    function _isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }

    function calcCreateAddress(address _deployer, uint8 _nonce) public pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xd6), bytes1(0x94), _deployer, _nonce)))));
    }
}
