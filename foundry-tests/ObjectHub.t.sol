// SPDX-License-Identifier: Apache-2.0.

pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import "../contracts/CrossChain.sol";
import "../contracts/middle-layer/GovHub.sol";
import "../contracts/middle-layer/ObjectHub.sol";
import "../contracts/tokens/ERC721NonTransferable.sol";
import "../contracts/lib/RLPDecode.sol";
import "../contracts/lib/RLPEncode.sol";

contract ObjectHubTest is Test, ObjectHub {
    using RLPEncode for *;
    using RLPDecode for *;

    struct ParamChangePackage {
        string key;
        bytes values;
        bytes targets;
    }

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event ReceivedAckPkg(uint8 channelId, bytes msgData, bytes callbackData);
    event ReceivedFailAckPkg(uint8 channelId, bytes msgData, bytes callbackData);

    ERC721NonTransferable public objectToken;
    ObjectHub public objectHub;
    GovHub public govHub;
    CrossChain public crossChain;

    receive() external payable {}

    function setUp() public {
        vm.createSelectFork("test");

        govHub = GovHub(GOV_HUB);
        crossChain = CrossChain(CROSS_CHAIN);
        objectHub = ObjectHub(OBJECT_HUB);
        objectToken = ERC721NonTransferable(objectHub.ERC721Token());

        vm.label(GOV_HUB, "govHub");
        vm.label(OBJECT_HUB, "objectHub");
        vm.label(CROSS_CHAIN, "crossChain");
        vm.label(address(objectToken), "objectToken");
    }

    function testBasicInfo() public {
        string memory baseUri = objectToken.baseURI();
        assertEq(baseUri, "object");
    }

    function testGov() public {
        ParamChangePackage memory proposal = ParamChangePackage({
            key: "BaseURI",
            values: bytes("newObject"),
            targets: abi.encodePacked(address(objectHub))
        });
        bytes memory msgBytes = _encodeGovSynPackage(proposal);

        vm.expectEmit(true, true, false, true, address(objectHub));
        emit ParamChange("BaseURI", bytes("newObject"));
        vm.prank(CROSS_CHAIN);
        govHub.handleSynPackage(GOV_CHANNEL_ID, msgBytes);
    }

    function testMirror(uint256 id) public {
        CmnMirrorSynPackage memory mirrorSynPkg = CmnMirrorSynPackage({id: id, owner: msg.sender});
        bytes memory msgBytes = _encodeMirrorSynPackage(mirrorSynPkg);

        vm.expectEmit(true, true, true, true, address(objectToken));
        emit Transfer(address(0), msg.sender, id);
        vm.prank(CROSS_CHAIN);
        objectHub.handleSynPackage(OBJECT_CHANNEL_ID, msgBytes);
    }

    function testDelete(uint256 id) public {
        vm.prank(OBJECT_HUB);
        objectToken.mint(address(this), id);
        assertEq(address(this), objectToken.ownerOf(id));

        vm.expectEmit(true, true, true, true, address(objectHub));
        emit DeleteSubmitted(address(this), address(this), id);
        objectHub.deleteObject{value: 4e15}(id);

        bytes memory msgBytes = _encodeDeleteAckPackage(0, id);

        uint64 sequence = crossChain.channelReceiveSequenceMap(OBJECT_CHANNEL_ID);
        vm.startPrank(CROSS_CHAIN);
        vm.expectEmit(true, true, true, true, address(objectToken));
        emit Transfer(address(this), address(0), id);
        objectHub.handleAckPackage(OBJECT_CHANNEL_ID, sequence, msgBytes, 0);
    }

    function testGrantAndRevoke() public {
        uint256 id = 1;
        address granter = msg.sender;
        address operator = address(this);

        // failed without authorization
        vm.prank(OBJECT_HUB);
        objectToken.mint(granter, id);
        vm.expectRevert(bytes("no permission to delete"));
        objectHub.deleteObject{value: 4e15}(id);

        // wrong auth code
        uint256 expireTime = block.timestamp + 1 days;
        uint32 authCode = 1;
        vm.expectRevert(bytes("invalid authorization code"));
        vm.prank(msg.sender);
        objectHub.grant(operator, authCode, expireTime);

        // grant
        authCode = 2; // delete
        vm.prank(msg.sender);
        objectHub.grant(operator, authCode, expireTime);

        // delete success
        vm.expectEmit(true, true, true, true, address(objectHub));
        emit DeleteSubmitted(granter, operator, id);
        objectHub.deleteObject{value: 4e15}(id);

        // grant expire
        id = id + 1;
        vm.prank(OBJECT_HUB);
        objectToken.mint(granter, id);

        vm.warp(expireTime + 1);
        vm.expectRevert(bytes("no permission to delete"));
        objectHub.deleteObject{value: 4e15}(id);

        // revoke and delete failed
        expireTime = block.timestamp + 1 days;
        vm.prank(msg.sender);
        objectHub.grant(operator, authCode, expireTime);
        objectHub.deleteObject{value: 4e15}(id);

        vm.prank(msg.sender);
        objectHub.revoke(operator, authCode);

        id = id + 1;
        vm.prank(OBJECT_HUB);
        objectToken.mint(granter, id);
        vm.expectRevert(bytes("no permission to delete"));
        objectHub.deleteObject{value: 4e15}(id);
    }

    function testCallback() public {
        vm.prank(OBJECT_HUB);
        objectToken.mint(address(this), 0);

        bytes memory msgBytes = _encodeDeleteAckPackage(0, 0, address(this), FailureHandleStrategy.BlockOnFail);
        uint64 sequence = crossChain.channelReceiveSequenceMap(OBJECT_CHANNEL_ID);

        vm.expectEmit(false, false, false, false, address(this));
        emit ReceivedAckPkg(OBJECT_CHANNEL_ID, msgBytes, "");
        vm.prank(CROSS_CHAIN);
        objectHub.handleAckPackage(OBJECT_CHANNEL_ID, sequence, msgBytes, 5000);
    }

    function testFAck() public {
        vm.prank(OBJECT_HUB);
        objectToken.mint(address(this), 0);

        ExtraData memory extraData = ExtraData({
            appAddress: address(this),
            refundAddress: address(this),
            failureHandleStrategy: FailureHandleStrategy.BlockOnFail,
            callbackData: ""
        });
        CmnDeleteSynPackage memory synPkg =
            CmnDeleteSynPackage({operator: address(this), id: 0, extraData: _extraDataToBytes(extraData)});
        bytes memory msgBytes = _encodeCmnDeleteSynPackage(synPkg);
        uint64 sequence = crossChain.channelReceiveSequenceMap(OBJECT_CHANNEL_ID);

        vm.expectEmit(false, false, false, false, address(this));
        emit ReceivedFailAckPkg(OBJECT_CHANNEL_ID, msgBytes, "");
        vm.prank(CROSS_CHAIN);
        objectHub.handleFailAckPackage(OBJECT_CHANNEL_ID, sequence, msgBytes, 5000);
    }

    function testRetryPkg() public {
        vm.prank(OBJECT_HUB);
        objectToken.mint(address(this), 0);

        // callback failed(out of gas)
        bytes memory msgBytes = _encodeDeleteAckPackage(0, 0, address(this), FailureHandleStrategy.BlockOnFail);
        uint64 sequence = crossChain.channelReceiveSequenceMap(OBJECT_CHANNEL_ID);

        vm.expectEmit(true, false, false, false, address(objectHub));
        emit AppHandleAckPkgFailed(address(this), bytes32(""), "");
        vm.prank(CROSS_CHAIN);
        objectHub.handleAckPackage(OBJECT_CHANNEL_ID, sequence, msgBytes, 3000);

        // block on fail
        vm.prank(OBJECT_HUB);
        objectToken.mint(address(this), 0);

        ExtraData memory extraData = ExtraData({
            appAddress: address(this),
            refundAddress: address(this),
            failureHandleStrategy: FailureHandleStrategy.BlockOnFail,
            callbackData: ""
        });
        vm.expectRevert(bytes("retry queue is not empty"));
        objectHub.deleteObject{value: 4e15}(0, 0, extraData);

        // retry pkg
        objectHub.retryPackage();
        objectHub.deleteObject{value: 4e15}(0, 0, extraData);

        // skip on fail
        msgBytes = _encodeDeleteAckPackage(0, 0, address(this), FailureHandleStrategy.SkipOnFail);
        sequence = crossChain.channelReceiveSequenceMap(OBJECT_CHANNEL_ID);

        vm.expectEmit(true, false, false, false, address(objectHub));
        emit AppHandleAckPkgFailed(address(this), bytes32(""), "");
        vm.prank(CROSS_CHAIN);
        objectHub.handleAckPackage(OBJECT_CHANNEL_ID, sequence, msgBytes, 3000);

        vm.expectRevert(bytes(hex"3db2a12a")); // "Empty()"
        objectHub.retryPackage();
    }

    /*----------------- middle-layer app function -----------------*/
    // override the function in GroupHub
    function handleAckPackage(uint8 channelId, bytes calldata ackPkg, bytes calldata callbackData) external {
        emit ReceivedAckPkg(channelId, ackPkg, callbackData);
    }

    function handleFailAckPackage(uint8 channelId, bytes calldata failPkg, bytes calldata callbackData) external {
        emit ReceivedFailAckPkg(channelId, failPkg, callbackData);
    }

    /*----------------- Internal function -----------------*/
    function _encodeGovSynPackage(ParamChangePackage memory proposal) internal pure returns (bytes memory) {
        bytes[] memory elements = new bytes[](3);
        elements[0] = bytes(proposal.key).encodeBytes();
        elements[1] = proposal.values.encodeBytes();
        elements[2] = proposal.targets.encodeBytes();
        return elements.encodeList();
    }

    function _encodeMirrorSynPackage(CmnMirrorSynPackage memory synPkg) internal pure returns (bytes memory) {
        bytes[] memory elements = new bytes[](2);
        elements[0] = synPkg.id.encodeUint();
        elements[1] = synPkg.owner.encodeAddress();
        return _RLPEncode(TYPE_MIRROR, elements.encodeList());
    }

    function _encodeDeleteAckPackage(uint32 status, uint256 id) internal pure returns (bytes memory) {
        bytes[] memory elements = new bytes[](2);
        elements[0] = status.encodeUint();
        elements[1] = id.encodeUint();
        return _RLPEncode(TYPE_DELETE, elements.encodeList());
    }

    function _encodeDeleteAckPackage(uint32 status, uint256 id, address refundAddr, FailureHandleStrategy failStrategy)
        internal
        view
        returns (bytes memory)
    {
        ExtraData memory extraData = ExtraData({
            appAddress: address(this),
            refundAddress: refundAddr,
            failureHandleStrategy: failStrategy,
            callbackData: ""
        });

        bytes[] memory elements = new bytes[](3);
        elements[0] = status.encodeUint();
        elements[1] = id.encodeUint();
        elements[2] = _extraDataToBytes(extraData).encodeBytes();
        return _RLPEncode(TYPE_DELETE, elements.encodeList());
    }

    function _encodeCmnDeleteSynPackage(CmnDeleteSynPackage memory synPkg) internal pure returns (bytes memory) {
        bytes[] memory elements = new bytes[](3);
        elements[0] = synPkg.operator.encodeAddress();
        elements[1] = synPkg.id.encodeUint();
        elements[2] = synPkg.extraData.encodeBytes();
        return _RLPEncode(TYPE_DELETE, elements.encodeList());
    }
}
