// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract SaveManager {
    using ECDSA for bytes32;

    // IPFS Hashes
    mapping(address => string) private _saves;
    mapping(address => uint256) private _lastSave;
    // Nonce
    mapping(bytes => bool) private _nonceUsed;

    // Signer
    address private _signer;

    event Saved(
        address indexed user,
        string indexed ipfsHash,
        uint256 timestamp
    );

    constructor(address signer) {
        _signer = signer;
    }

    function save(
        string memory ipfsHash,
        bytes memory signature,
        bytes memory nonce
    ) public {
        require(!_nonceUsed[nonce], "SaveManager: Not a valid nonce!");
        require(
            isValidSignature(ipfsHash, nonce, signature),
            "SaveManager: Not a valid signature!"
        );
        _saves[msg.sender] = ipfsHash;
        _lastSave[msg.sender] = block.timestamp;

        emit Saved(msg.sender, ipfsHash, block.timestamp);
    }

    function load(address user) public view returns (string memory) {
        return _saves[user];
    }

    function isValidSignature(
        string memory ipfsHash,
        bytes memory nonce,
        bytes memory signature
    ) private view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(msg.sender, ipfsHash, nonce));
        return _signer == hash.recover(signature);
    }
}
