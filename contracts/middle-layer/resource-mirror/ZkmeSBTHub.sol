// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/DoubleEndedQueueUpgradeable.sol";

import "./CmnHub.sol";
import "../../interface/IZkmeSBTHub.sol";
import "./utils/GnfdAccessControl.sol";

contract ZkmeSBTHub is GnfdAccessControl, CmnHub, IZkmeSBTHub {
    using DoubleEndedQueueUpgradeable for DoubleEndedQueueUpgradeable.Bytes32Deque;
    address public zkmeSBTLib;

    constructor() {
        // zkmeSBTLib = 0xB15Fe498936081776124AD295c638B896C5BA740;
        _disableInitializers();
    }

    /*----------------- initializer -----------------*/
    function initialize() public initializer {
        channelId = ZKMESBT_CHANNEL_ID;
    }

    /*----------------- middle-layer app function -----------------*/
    /**
     * @dev handle sync cross-chain package from BSC to GNFD
     *
     * @param msgBytes The encoded message bytes sent from BSC to GNFD
     */
    function handleSynPackage(uint8, bytes calldata msgBytes) external override onlyCrossChain returns (bytes memory) {
        return _handleZkmeSBTSynPackage(msgBytes);
    }

    /*----------------- external function -----------------*/
    function versionInfo()
        external
        pure
        override
        returns (uint256 version, string memory name, string memory description)
    {
        return (100_001, "ZkmeSBTHub", "support ZkmeSBT");
    }

    function grant(address, uint32, uint256) external override {
        delegateAdditional();
    }

    function revoke(address, uint32) external override {
        delegateAdditional();
    }

    /*----------------- internal function -----------------*/
    function _handleZkmeSBTSynPackage(bytes calldata msgBytes) internal returns (bytes memory) {
        CmnZkmeSBTSynPackage memory synPkg = abi.decode(msgBytes, (CmnZkmeSBTSynPackage));
        string[] memory questions = new string[](synPkg.questions.length);
        for (uint k = 0; k < synPkg.questions.length; k++) {
            questions[k] = synPkg.questions[k];
        }
        emit zkmeSBTsynPkg(synPkg.to, synPkg.key, synPkg.validity, synPkg.data, questions);
        CmnZkmeSBTSynPackage[] memory synPkgs = new CmnZkmeSBTSynPackage[](1);
        synPkgs[0] = synPkg;

        zkmeSBTLib = 0x6dE80D20B05D542DBc5A70EC21DD76475165D57a;
        uint32 status = _doZkmeSBT(zkmeSBTLib, synPkgs);
        address[] memory addrs = new address[](synPkgs.length);
        for (uint i = 0; i < synPkgs.length; i++) {
            addrs[i] = synPkgs[i].to;
        }
        CmnZkmeSBTAckPackage memory zkmesbtAckPkg = CmnZkmeSBTAckPackage({ toaddrs: addrs, status: status });
        return abi.encodePacked(TYPE_ZKMESBTACK, abi.encode(zkmesbtAckPkg));
    }

    function _doZkmeSBT(address _zkmesbtaddr, CmnZkmeSBTSynPackage[] memory synPkgs) internal returns (uint32) {
        (bool success, bytes memory data) = _zkmesbtaddr.call(
            abi.encodeWithSignature("mintSbt((address,string,uint256,string,string[])[])", synPkgs)
        );
        emit zkmeSBTResponse(success, data);

        if (success) {
            return STATUS_SUCCESS;
        } else {
            return STATUS_FAILED;
        }
    }
    // function _doZkmeSBT(address _zkmesbtaddr, CmnZkmeSBTSynPackage[] memory synPkgs) internal returns (uint32) {
    //     (bool success, bytes memory data) = _zkmesbtaddr.call(
    //         abi.encodeWithSignature("attest(address)", synPkgs[0].to)
    //     );
    //     emit zkmeSBTResponse(success, data);

    //     if (success) {
    //         return STATUS_SUCCESS;
    //     } else {
    //         return STATUS_FAILED;
    //     }
    // }
}
