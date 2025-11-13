// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./ChessLogic.sol";

contract QuantumChessArena is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Strings for uint256;
    using ChessLogic for uint8[64]; // Use ChessLogic library for board operations

    struct Game {
        address player1;
        address player2;
        string[] moves;
        uint256 startTime;
        uint8 status; // 0: waiting, 1: active, 2: finished
        address winner;
        uint8[64] board; // Add board state to the Game struct
    }

    struct PlayerStats {
        uint256 rating;
        uint256 gamesPlayed;
        uint256 gamesWon;
    }

    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    uint256 public gameCounter;
    uint256 public achievementCounter;

    event MoveMade(uint256 indexed gameId, address indexed player, string move, uint256 timestamp);
    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2);
    event GameEnded(uint256 indexed gameId, address indexed winner);
    event AchievementMinted(uint256 indexed tokenId, address indexed player, string achievementType);

    constructor() ERC721("Quantum Chess Achievements", "QCA") Ownable(msg.sender) {}

    function createGame(address opponent) public returns (uint256 gameId) {
        gameId = ++gameCounter;
        
        Game storage newGame = games[gameId];
        newGame.player1 = msg.sender;
        newGame.player2 = opponent;
        newGame.startTime = block.timestamp;
        newGame.status = 1;
        
        newGame.board.initializeBoard(); // Initialize the board using ChessLogic library

        playerStats[msg.sender].gamesPlayed++;
        if (opponent != address(0)) {
            playerStats[opponent].gamesPlayed++;
        }

        emit GameCreated(gameId, msg.sender, opponent);
    }

    function makeMove(uint256 gameId, string memory move) public {
        Game storage game = games[gameId];
        require(game.status == 1, "Game not active");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Not a player in this game");

        // Parse move string (e.g., "e2e4")
        require(bytes(move).length == 4, "Invalid move format (expected e.g., 'e2e4')");
        string memory fromCoord = substring(move, 0, 2);
        string memory toCoord = substring(move, 2, 4);

        bool isWhiteTurn = (game.moves.length % 2 == 0); // White moves first

        require(game.board.isValidMove(fromCoord, toCoord, isWhiteTurn), "Invalid chess move");

        game.board.applyMove(fromCoord, toCoord);
        game.moves.push(move);
        emit MoveMade(gameId, msg.sender, move, block.timestamp);

        // Determine whose turn it is next
        bool nextIsWhiteTurn = (game.moves.length % 2 == 0);

        // Check for checkmate or stalemate
        if (game.board._isCheckmate(nextIsWhiteTurn)) {
            address winner = msg.sender; // Current player is the winner
            endGame(gameId, winner);
        } else if (game.board._isStalemate(nextIsWhiteTurn)) {
            endGame(gameId, address(0)); // Draw
        }
    }

    function endGame(uint256 gameId, address winner) public {
        Game storage game = games[gameId];
        require(game.status == 1, "Game not active");
        require(msg.sender == game.player1 || msg.sender == game.player2 || msg.sender == owner(), "Not authorized");

        game.status = 2;
        game.winner = winner;

        if (winner != address(0)) {
            playerStats[winner].gamesWon++;
            updateRating(winner, true);

            // Check for first win achievement
            if (playerStats[winner].gamesWon == 1) {
                mintAchievement(winner, "FirstWin");
            }
        }

        emit GameEnded(gameId, winner);
    }

    function getGameState(uint256 gameId) public view returns (Game memory) {
        return games[gameId];
    }

    function getActiveGames() public view returns (uint256[] memory) {
        uint256[] memory activeGames = new uint256[](gameCounter);
        uint256 count = 0;
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == 1) {
                activeGames[count] = i;
                count++;
            }
        }
        // Resize array to actual count
        assembly {
            mstore(activeGames, count)
        }
        return activeGames;
    }

    function updateRating(address player, bool won) internal {
        PlayerStats storage stats = playerStats[player];
        if (stats.rating == 0) {
            stats.rating = 1200; // Default rating
        }

        uint256 k = 32; // K-factor

        // Simplified ELO calculation (linear approximation)
        // This is a very basic approximation and not a true ELO calculation
        // A more accurate ELO would require fixed-point math or a lookup table for exponentiation
        int256 ratingChange;
        if (won) {
            ratingChange = int256(k);
        } else {
            ratingChange = -int256(k);
        }

        stats.rating = uint256(int256(stats.rating) + ratingChange);
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

    // Utility function to get a substring
    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
