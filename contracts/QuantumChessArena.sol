// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract QuantumChessArena is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Strings for uint256;

    struct PlayerStats {
        uint256 rating;
        uint256 gamesPlayed;
        uint256 gamesWon;
    }

    struct LeaderboardEntry {
        address player;
        uint256 rating;
        uint256 gamesPlayed;
        uint256 gamesWon;
    }

    mapping(address => PlayerStats) public playerStats;
    LeaderboardEntry[] public leaderboard;
    uint256 public achievementCounter;

    event ScoreSubmitted(address indexed player, uint256 rating, bool won);
    event AchievementMinted(uint256 indexed tokenId, address indexed player, string achievementType);

    constructor() ERC721("Quantum Chess Achievements", "QCA") Ownable(msg.sender) {}

    function submitScore(bool won) public {
        PlayerStats storage stats = playerStats[msg.sender];

        if (stats.rating == 0) {
            stats.rating = 1200; // Default rating
        }

        stats.gamesPlayed++;

        if (won) {
            stats.gamesWon++;
            updateRating(msg.sender, true);

            // Check for first win achievement
            if (stats.gamesWon == 1) {
                mintAchievement(msg.sender, "FirstWin");
            }
        } else {
            updateRating(msg.sender, false);
        }

        updateLeaderboard(msg.sender);

        emit ScoreSubmitted(msg.sender, stats.rating, won);
    }

    function getLeaderboard() public view returns (LeaderboardEntry[] memory) {
        return leaderboard;
    }

    function updateRating(address player, bool won) internal {
        PlayerStats storage stats = playerStats[player];

        uint256 k = 32; // K-factor

        // Simplified ELO calculation (linear approximation)
        int256 ratingChange;
        if (won) {
            ratingChange = int256(k);
        } else {
            ratingChange = -int256(k);
        }

        stats.rating = uint256(int256(stats.rating) + ratingChange);
    }

    function updateLeaderboard(address player) internal {
        PlayerStats memory stats = playerStats[player];

        // Remove existing entry if present
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == player) {
                leaderboard[i] = leaderboard[leaderboard.length - 1];
                leaderboard.pop();
                break;
            }
        }

        // Add new entry
        leaderboard.push(LeaderboardEntry({
            player: player,
            rating: stats.rating,
            gamesPlayed: stats.gamesPlayed,
            gamesWon: stats.gamesWon
        }));

        // Sort leaderboard by rating (descending)
        for (uint256 i = 0; i < leaderboard.length - 1; i++) {
            for (uint256 j = 0; j < leaderboard.length - i - 1; j++) {
                if (leaderboard[j].rating < leaderboard[j + 1].rating) {
                    LeaderboardEntry memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }

        // Keep only top 10
        if (leaderboard.length > 10) {
            // Resize array to 10
            assembly {
                mstore(leaderboard, 10)
            }
        }
    }

    function mintAchievement(address player, string memory achievementType) public onlyOwner {
        achievementCounter++;
        _mint(player, achievementCounter);
        _setTokenURI(achievementCounter, string(abi.encodePacked("ipfs://", achievementType)));
        emit AchievementMinted(achievementCounter, player, achievementType);
    }

    // Override functions
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
