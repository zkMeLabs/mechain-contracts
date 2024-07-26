// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

interface IZkmeSBTHub {
    // GNFD to BSC
    struct CmnZkmeSBTSynPackage {
        address to;
        string key;
        uint256 validity;
        string data;
        string[] questions;
    }

    // BSC to GNFD
    struct CmnZkmeSBTAckPackage {
        address[] toaddrs;
        uint32 status;
    }

    // function mintSbt(CmnZkmeSBTSynPackage[] calldata mintDataArray) external;

    event zkmeSBTsynPkg(address to, string key, uint256 validity, string data, string[] questions);
    event zkmeSBTResponse(bool success, bytes data);
}
