// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract GasDrainTrap {
    address public immutable owner;
    uint256 public immutable bombSize;

    constructor(uint256 _bombSize) {
        require(_bombSize > 0 && _bombSize <= 1_000_000, "invalid bomb size");
        owner = msg.sender;
        bombSize = _bombSize;
    }

    
    function trigger() external view returns (bytes memory out) {
        require(msg.sender != owner, "Owner cannot trigger the trap");

        
        out = new bytes(bombSize);
    }

    
    fallback() external payable {
        
        bytes memory out = new bytes(bombSize);
        out;
        revert("trapped");
    }

    receive() external payable {
        revert("No direct ETH");
    }
}
