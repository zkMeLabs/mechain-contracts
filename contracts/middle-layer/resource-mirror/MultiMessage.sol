// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../../interface/ICrossChain.sol";
import "../../interface/IMultiMessage.sol";
import "./CmnHub.sol";
import "./storage/MultiStorage.sol";

contract MultiMessage is MultiStorage, CmnHub, IMultiMessage {
    uint8 public constant ACK_PACKAGE = 0x01;
    uint8 public constant FAIL_ACK_PACKAGE = 0x02;

    uint256 public constant MAX_MESSAGE_COUNT = 10;
    uint256 public constant MAX_MESSAGE_BYTES = 1024;

    mapping(address => bool) public whitelistTargets;

    event MultiMessageSent(address indexed sender, address[] targets, bytes[] data, uint256[] values);
    event AckMultiMessageReceived(uint8 packageType, uint64 sequence, bytes[] payloads);

    constructor() {
        _disableInitializers();
    }

    /*----------------- initializer -----------------*/
    function initialize() public initializer {
        __cmn_hub_init_unchained(address(0), address(0));

        channelId = MULTI_MESSAGE_CHANNEL_ID;

        whitelistTargets[BUCKET_HUB] = true;
        whitelistTargets[GROUP_HUB] = true;
        whitelistTargets[OBJECT_HUB] = true;
        whitelistTargets[PERMISSION_HUB] = true;
        whitelistTargets[TOKEN_HUB] = true;
        whitelistTargets[ZKMESBT_HUB] = true;
    }

    function initializeV2() public reinitializer(2) {
        __cmn_hub_init_unchained_v2(INIT_MAX_CALLBACK_DATA_LENGTH);
    }

    function sendMessages(
        address[] calldata _targets,
        bytes[] calldata _data,
        uint256[] calldata _values
    ) external payable returns (bool) {
        uint256 _length = _targets.length;
        require(_length > 0, "empty data");
        require(_length <= MAX_MESSAGE_COUNT, "too many messages");
        require(_length == _data.length, "length mismatch");
        require(_length == _values.length, "length mismatch");
        address _msgSender = _erc2771Sender();

        // generate packages
        uint256 _totalValue = 0;
        uint256 _totalRelayFee = 0;
        uint256 _totalAckRelayFee = 0;
        bytes[] memory messages = new bytes[](_length);
        for (uint256 i = 0; i < _length; ++i) {
            address target = _targets[i];
            require(whitelistTargets[target], "only whitelist");
            uint256 value = _values[i];
            _totalValue += value;
            bytes calldata data = _data[i];
            require(data.length <= MAX_MESSAGE_BYTES, "too large message bytes");

            (bool success, bytes memory result) = target.call{ value: value }(data);
            require(success, "call reverted");

            (, , uint256 _relayFee, uint256 _ackRelayFee, address _sender) = abi.decode(
                result,
                (uint8, bytes, uint256, uint256, address)
            );
            require(_msgSender == _sender, "invalid sender");

            _totalRelayFee += _relayFee;
            _totalAckRelayFee += _ackRelayFee;

            messages[i] = result;
        }
        require(_totalValue == msg.value, "invalid msg.value");
        require(_totalRelayFee + _totalAckRelayFee <= msg.value, "invalid total relayFee");

        // send sync package
        ICrossChain(CROSS_CHAIN).sendSynPackage(
            MULTI_MESSAGE_CHANNEL_ID,
            abi.encodePacked(TYPE_MULTI_MESSAGE, abi.encode(messages)),
            _totalRelayFee,
            _totalAckRelayFee
        );

        emit MultiMessageSent(_msgSender, _targets, _data, _values);
        return true;
    }

    function handleAckPackage(
        uint8,
        uint64 sequence,
        bytes calldata msgBytes,
        uint256
    ) external override onlyCrossChain returns (uint256 remainingGas, address refundAddress) {
        bytes[] memory payloads = abi.decode(msgBytes, (bytes[]));

        uint64 _multiMessageSequence;
        for (uint256 i = 0; i < payloads.length; i++) {
            _multiMessageSequence = _getMultiMessageSequence(i, sequence);

            ICrossChain(CROSS_CHAIN).handleAckPackageFromMultiMessage(payloads[i], ACK_PACKAGE, _multiMessageSequence);
        }

        emit AckMultiMessageReceived(ACK_PACKAGE, sequence, payloads);
        return (0, address(0));
    }

    function handleFailAckPackage(
        uint8,
        uint64 sequence,
        bytes calldata msgBytes,
        uint256
    ) external override onlyCrossChain returns (uint256 remainingGas, address refundAddress) {
        bytes[] memory payloads = abi.decode(msgBytes, (bytes[]));
        uint64 _multiMessageSequence;
        for (uint256 i = 0; i < payloads.length; i++) {
            _multiMessageSequence = _getMultiMessageSequence(i, sequence);
            ICrossChain(CROSS_CHAIN).handleAckPackageFromMultiMessage(
                payloads[i],
                FAIL_ACK_PACKAGE,
                _multiMessageSequence
            );
        }

        emit AckMultiMessageReceived(FAIL_ACK_PACKAGE, sequence, payloads);
        return (0, address(0));
    }

    function versionInfo()
        external
        pure
        override
        returns (uint256 version, string memory name, string memory description)
    {
        return (900_003, "MultiMessage", "support ERC2771Forwarder");
    }

    function _getMultiMessageSequence(uint256 index, uint64 sequence) internal pure returns (uint64) {
        bytes memory _sequenceBytes = abi.encodePacked(uint192(0), hex"ff", uint16(index), uint40(sequence));
        return abi.decode(_sequenceBytes, (uint64));
    }
}
