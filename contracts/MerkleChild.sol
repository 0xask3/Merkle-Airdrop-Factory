// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

interface IFactory {
    function claimFee() external view returns (uint256);
}

contract MerkleChild {
    bytes32 public immutable merkleRoot;
    IERC20 public immutable token;
    IFactory private immutable factory;

    uint32 internal constant CLAIM_GAP = 1 hours;
    uint32 internal constant CLAIM_PERIOD = 1 hours;
    uint8 internal constant CLAIM_FREQ = 4; //Total 4 times claim

    mapping(address => bool) public userClaimed;
    mapping(uint8 => bool) public creatorClaimed;
    bool public ownerClaimed;

    uint256 public nonClaimedFunds;
    uint256 public startDate;
    uint256 public endDate;

    address internal creator;
    address internal owner;

    event Claim(address indexed to, uint256 amount);

    constructor(
        address _token,
        address _creator,
        address _owner,
        uint256 _startDate,
        uint256 _endDate,
        bytes32 _merkleRoot
    ) {
        merkleRoot = _merkleRoot;
        token = IERC20(_token);
        startDate = _startDate;
        endDate = _endDate;
        creator = _creator;
        owner = _owner;
        factory = IFactory(msg.sender);
    }

    function claim(uint256 amount, bytes32[] calldata proof) external payable {
        require(msg.value >= factory.claimFee(), "Claim fee not sent");
        require(block.timestamp >= startDate && block.timestamp <= endDate, "Not Started/Expired");
        require(canUserClaim(msg.sender, amount, proof), "Invalid proof");
        require(!userClaimed[msg.sender], "Already claimed");

        userClaimed[msg.sender] = true;
        emit Claim(msg.sender, amount);

        token.transfer(msg.sender, amount);
        payable(owner).transfer(msg.value);
    }

    function creatorClaim(uint8 roundId) external {
        require(msg.sender == creator, "Not creator");
        require(canCreatorClaim(roundId), "Not in creator claim period");
        require(!creatorClaimed[roundId], "Already claimed");
        require(roundId < CLAIM_FREQ, "Invalid claim round");

        if (nonClaimedFunds == 0) {
            nonClaimedFunds = token.balanceOf(address(this));
        }

        creatorClaimed[roundId] = true;
        token.transfer(creator, nonClaimedFunds / CLAIM_FREQ);
    }

    function ownerClaim() external {
        require(msg.sender == owner, "Not owner");
        require(ownerClaimStatus(), "Not in owner claim period");

        if (nonClaimedFunds == 0) {
            nonClaimedFunds = token.balanceOf(address(this));
        }

        ownerClaimed = true;
        token.transfer(owner, nonClaimedFunds);
    }

    function canCreatorClaim(uint8 roundId) public view returns (bool) {
        uint256 start = endDate + (((2 * roundId) + 1) * CLAIM_GAP);
        uint256 end = start + CLAIM_PERIOD;
        bool status = block.timestamp >= start && block.timestamp <= end;

        if(roundId > 0){
            status = status && creatorClaimed[roundId-1];
        }

        return status;
    }

    function canOwnerClaim(uint8 roundId) public view returns (bool) {
        uint256 end = endDate + (((2 * roundId) + 1) * CLAIM_GAP) + CLAIM_PERIOD;

        return (block.timestamp >= end && !creatorClaimed[roundId]);
    }

    function canUserClaim(
        address user,
        uint256 amount,
        bytes32[] calldata proof
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
        return isValidLeaf;
    }

    function creatorClaimStatus() public view returns (bool[] memory status) {
        status = new bool[](CLAIM_FREQ);

        for (uint8 i = 0; i < CLAIM_FREQ; i++) {
            status[i] = (canCreatorClaim(i) && !creatorClaimed[i]);
        }
    }

    function ownerClaimStatus() public view returns (bool status) {
        for (uint8 i = 0; i < CLAIM_FREQ; i++) {
            if(canOwnerClaim(i)){
                status = true;
                break;
            }
        }

        status = status && !ownerClaimed;
    }

    function userClaimStatus(address user) public view returns (bool) {
        return block.timestamp >= startDate && block.timestamp <= endDate && !userClaimed[user];
    }
}
