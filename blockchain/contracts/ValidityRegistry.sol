// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ValidityRegistry - soulbound credential hashes on Moonbase Alpha
/// @notice Records a bytes32 hash per holder so VeriVenture can anchor achievements on-chain.
contract ValidityRegistry is Ownable {
    mapping(address => mapping(bytes32 => bool)) private _hasBadge;
    mapping(address => uint256) private _badgeCount;

    event Minted(address indexed to, bytes32 indexed badgeHash, address indexed issuer);
    event Revoked(address indexed from, bytes32 indexed badgeHash, address indexed issuer);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function hasBadge(address account, bytes32 badgeHash) external view returns (bool) {
        return _hasBadge[account][badgeHash];
    }

    function countOf(address account) external view returns (uint256) {
        return _badgeCount[account];
    }

    function mint(address to, bytes32 badgeHash) external onlyOwner {
        require(to != address(0), "invalid recipient");
        require(!_hasBadge[to][badgeHash], "already minted");
        _hasBadge[to][badgeHash] = true;
        unchecked {
            _badgeCount[to] += 1;
        }
        emit Minted(to, badgeHash, _msgSender());
    }

    function revoke(address from, bytes32 badgeHash) external onlyOwner {
        require(_hasBadge[from][badgeHash], "badge missing");
        _hasBadge[from][badgeHash] = false;
        unchecked {
            _badgeCount[from] -= 1;
        }
        emit Revoked(from, badgeHash, _msgSender());
    }
}
