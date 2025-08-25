// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GasTrap {
        address public owner;
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    
    bool public armed;                
    uint256 public loopCeil;          
    mapping(address => bool) public whitelist;

    event WhitelistSet(address indexed account, bool allowed);
    event ArmedSet(bool armed);
    event LoopCeilSet(uint256 loops);
    event Trapped(address indexed caller, uint256 loops);

    constructor(uint256 _loopCeil, bool _armed) {
        require(_loopCeil > 0 && _loopCeil <= 5_000_000, "bad loop ceil");
        owner = msg.sender;
        loopCeil = _loopCeil;
        armed = _armed;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // --- Admin ---
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setArmed(bool _armed) external onlyOwner {
        armed = _armed;
        emit ArmedSet(_armed);
    }

    function setWhitelist(address account, bool allowed) external onlyOwner {
        whitelist[account] = allowed;
        emit WhitelistSet(account, allowed);
    }

    function setLoopCeil(uint256 _loopCeil) external onlyOwner {
        require(_loopCeil > 0 && _loopCeil <= 5_000_000, "bad loop ceil");
        loopCeil = _loopCeil;
        emit LoopCeilSet(_loopCeil);
    }

    function enter(bytes calldata /*data*/) external returns (bool ok) {
        if (!armed || whitelist[msg.sender]) {
                  return true;
        }
        _trapAndRevert();
        return false; 
    }

    fallback() external payable {
        if (!armed || whitelist[msg.sender]) {
            revert("no-op");
        }
        _trapAndRevert();
    }

    receive() external payable {
        if (!armed || whitelist[msg.sender]) {
            revert("no direct ETH");
        }
        _trapAndRevert();
    }

  
    function _trapAndRevert() internal pure {
    uint256 n = 0;

    unchecked {
        for (uint256 i = 0; i < 3_000_000; i++) {
            n += i;
        }
    }

    require(n != 0 || n == 0, "trap");
    revert("trapped");
}

}