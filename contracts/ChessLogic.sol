// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library ChessLogic {
    // Piece encoding:
    // 0: Empty
    // 1: White Pawn
    // 2: White Knight
    // 3: White Bishop
    // 4: White Rook
    // 5: White Queen
    // 6: White King
    // 7: Black Pawn
    // 8: Black Knight
    // 9: Black Bishop
    // 10: Black Rook
    // 11: Black Queen
    // 12: Black King

    // Board representation: 8x8 board, each square stores a piece type.
    // For simplicity, we'll use a 1D array of 64 elements.
    // This is not the most gas-efficient, but easier to implement for a first pass.
    // A more advanced implementation would use bitboards.

    // Initialize the board to the starting chess position
    function initializeBoard(uint8[64] storage _board) internal {
        // Black pieces
        _board[0] = 10; _board[1] = 8; _board[2] = 9; _board[3] = 11; _board[4] = 12; _board[5] = 9; _board[6] = 8; _board[7] = 10;
        for (uint i = 8; i < 16; i++) {
            _board[i] = 7; // Black Pawns
        }

        // Empty squares
        for (uint i = 16; i < 48; i++) {
            _board[i] = 0;
        }

        // White pieces
        for (uint i = 48; i < 56; i++) {
            _board[i] = 1; // White Pawns
        }
        _board[56] = 4; _board[57] = 2; _board[58] = 3; _board[59] = 5; _board[60] = 6; _board[61] = 3; _board[62] = 2; _board[63] = 4;
    }

    // Converts a chess coordinate (e.g., "e2") to an array index (0-63)
    function coordToIndex(string memory coord) internal pure returns (uint) {
        bytes1 file = bytes(coord)[0];
        bytes1 rank = bytes(coord)[1];

        uint col = uint(uint8(file)) - uint(uint8(bytes1('a')));
        uint row = 8 - (uint(uint8(rank)) - uint(uint8(bytes1('0'))));

        return row * 8 + col;
    }

    function indexToRow(uint index) internal pure returns (uint) {
        return index / 8;
    }

    function indexToCol(uint index) internal pure returns (uint) {
        return index % 8;
    }

    function _abs(int256 x) internal pure returns (int256) {
        return x >= 0 ? x : -x;
    }

    // Helper to check if path is clear for Bishop, Rook, Queen
    function _isPathClear(uint8[64] storage _board, uint fromIndex, uint toIndex, int256 rowStep, int256 colStep) internal view returns (bool) {
        uint currentRow = indexToRow(fromIndex);
        uint currentCol = indexToCol(fromIndex);

        while (true) {
            currentRow = uint(int256(currentRow) + rowStep);
            currentCol = uint(int256(currentCol) + colStep);
            uint currentIndex = currentRow * 8 + currentCol;

            if (currentIndex == toIndex) {
                break; // Reached destination, path is clear
            }
            if (_board[currentIndex] != 0) {
                return false; // Path is blocked
            }
        }
        return true;
    }

    // Helper to get piece type and color
    function getPieceTypeAndColor(uint8 piece) internal pure returns (uint8 pieceType, bool isWhite) {
        if (piece == 0) return (0, false); // Empty square
        if (piece >= 1 && piece <= 6) {
            isWhite = true;
            pieceType = piece;
        } else {
            isWhite = false;
            pieceType = piece - 6; // Normalize black piece types (7-12 -> 1-6)
        }
    }

    // Basic move validation (very simplified for now)
    // This function will only check if the 'from' square contains a piece
    // and if the 'to' square is different from the 'from' square.
    // Full chess rules validation is complex and gas-intensive for on-chain.
    function isValidMove(uint8[64] storage _board, string memory fromCoord, string memory toCoord, bool isWhiteTurn) internal view returns (bool) {
        uint fromIndex = coordToIndex(fromCoord);
        uint toIndex = coordToIndex(toCoord);

        // Basic validation: ensure indices are within bounds (0-63)
        if (fromIndex >= 64 || toIndex >= 64) {
            return false;
        }

        // Cannot move to the same square
        if (fromIndex == toIndex) {
            return false;
        }

        uint8 fromPiece = _board[fromIndex];
        uint8 toPiece = _board[toIndex];

        // Must move a piece
        if (fromPiece == 0) {
            return false;
        }

        (uint8 fromPieceType, bool fromIsWhite) = getPieceTypeAndColor(fromPiece);

        // Check if it's the correct player's turn
        if (fromIsWhite != isWhiteTurn) {
            return false;
        }

        // Cannot capture your own piece
        if (toPiece != 0) {
            (, bool toIsWhite) = getPieceTypeAndColor(toPiece);
            if (fromIsWhite == toIsWhite) {
                return false;
            }
        }

        // Now, validate based on piece type
        if (fromPieceType == 1) { // Pawn
            int256 rowDiff = int256(indexToRow(toIndex)) - int256(indexToRow(fromIndex));
            int256 colDiff = int256(indexToCol(toIndex)) - int256(indexToCol(fromIndex));

            if (fromIsWhite) { // White pawn
                if (rowDiff == -1 && colDiff == 0 && toPiece == 0) { // Single forward move
                    return true;
                }
                if (indexToRow(fromIndex) == 6 && rowDiff == -2 && colDiff == 0 && toPiece == 0 && _board[fromIndex - 8] == 0) { // Double forward move
                    return true;
                }
                if (rowDiff == -1 && (colDiff == -1 || colDiff == 1) && toPiece != 0) { // Diagonal capture
                    return true;
                }
            } else { // Black pawn
                if (rowDiff == 1 && colDiff == 0 && toPiece == 0) { // Single forward move
                    return true;
                }
                if (indexToRow(fromIndex) == 1 && rowDiff == 2 && colDiff == 0 && toPiece == 0 && _board[fromIndex + 8] == 0) { // Double forward move
                    return true;
                }
                if (rowDiff == 1 && (colDiff == -1 || colDiff == 1) && toPiece != 0) { // Diagonal capture
                    return true;
                }
            }
            return false;
        } else if (fromPieceType == 2) { // Knight
            int256 rowDiff = int256(indexToRow(toIndex)) - int256(indexToRow(fromIndex));
            int256 colDiff = int256(indexToCol(toIndex)) - int256(indexToCol(fromIndex));

            // Knight moves in an L-shape: 2 squares in one direction (row or col) and 1 square in the perpendicular direction
            if ((_abs(rowDiff) == 2 && _abs(colDiff) == 1) || (_abs(rowDiff) == 1 && _abs(colDiff) == 2)) {
                return true;
            }
            return false;
        } else if (fromPieceType == 3) { // Bishop
            int256 rowDiff = int256(indexToRow(toIndex)) - int256(indexToRow(fromIndex));
            int256 colDiff = int256(indexToCol(toIndex)) - int256(indexToCol(fromIndex));

            if (_abs(rowDiff) == _abs(colDiff) && rowDiff != 0) { // Diagonal move
                int256 rowStep = rowDiff > 0 ? int256(1) : int256(-1);
                int256 colStep = colDiff > 0 ? int256(1) : int256(-1);
                return _isPathClear(_board, fromIndex, toIndex, rowStep, colStep);
            }
            return false;
        } else if (fromPieceType == 4) { // Rook
            int256 rowDiff = int256(indexToRow(toIndex)) - int256(indexToRow(fromIndex));
            int256 colDiff = int256(indexToCol(toIndex)) - int256(indexToCol(fromIndex));

            if ((rowDiff == 0 && colDiff != 0) || (colDiff == 0 && rowDiff != 0)) { // Straight move
                int256 rowStep = 0;
                int256 colStep = 0;
                if (rowDiff > 0) rowStep = 1;
                else if (rowDiff < 0) rowStep = -1;
                if (colDiff > 0) colStep = 1;
                else if (colDiff < 0) colStep = -1;
                return _isPathClear(_board, fromIndex, toIndex, rowStep, colStep);
            }
            return false;
        } else if (fromPieceType == 5) { // Queen
            int256 rowDiff = int256(indexToRow(toIndex)) - int256(indexToRow(fromIndex));
            int256 colDiff = int256(indexToCol(toIndex)) - int256(indexToCol(fromIndex));

            // Queen moves like a Rook or a Bishop
            bool isDiagonal = (_abs(rowDiff) == _abs(colDiff) && rowDiff != 0);
            bool isStraight = ((rowDiff == 0 && colDiff != 0) || (colDiff == 0 && rowDiff != 0));

            if (isDiagonal || isStraight) {
                int256 rowStep = 0;
                int256 colStep = 0;
                if (rowDiff > 0) rowStep = 1;
                else if (rowDiff < 0) rowStep = -1;
                if (colDiff > 0) colStep = 1;
                else if (colDiff < 0) colStep = -1;
                return _isPathClear(_board, fromIndex, toIndex, rowStep, colStep);
            }
            return false;
        } else if (fromPieceType == 6) { // King
            int256 rowDiff = int256(indexToRow(toIndex)) - int256(indexToRow(fromIndex));
            int256 colDiff = int256(indexToCol(toIndex)) - int256(indexToCol(fromIndex));

            // King moves one square in any direction
            if (_abs(rowDiff) <= 1 && _abs(colDiff) <= 1 && (rowDiff != 0 || colDiff != 0)) {
                return true;
            }
            return false;
        }

        return false; // Should not reach here if all piece types are handled
    }

    // Apply a move to the board state
    function applyMove(uint8[64] storage _board, string memory fromCoord, string memory toCoord) internal {
        uint fromIndex = coordToIndex(fromCoord);
        uint toIndex = coordToIndex(toCoord);

        _board[toIndex] = _board[fromIndex];
        _board[fromIndex] = 0; // Empty the 'from' square
    }

    // Helper to check if a king is in check
    function _isKingInCheck(uint8[64] storage _board, bool isWhiteKing, uint kingIndex) internal view returns (bool) {
        // Iterate through all squares on the board
        for (uint i = 0; i < 64; i++) {
            uint8 piece = _board[i];
            if (piece == 0) continue;

            (uint8 pieceType, bool pieceIsWhite) = getPieceTypeAndColor(piece);

            // If it's an opponent's piece
            if (pieceIsWhite != isWhiteKing) {
                // For simplicity, we'll check if the opponent's piece can "attack" the king's square
                // This is a simplified check and doesn't fully simulate all chess rules (e.g., discovered checks)
                // but it's a starting point for on-chain check detection.
                // We need to convert the indices back to coordinates for isValidMove
                string memory fromCoord = string(abi.encodePacked(bytes1(uint8(97 + indexToCol(i))), bytes1(uint8(56 - indexToRow(i)))));
                string memory toCoord = string(abi.encodePacked(bytes1(uint8(97 + indexToCol(kingIndex))), bytes1(uint8(56 - indexToRow(kingIndex)))));

                if (isValidMove(_board, fromCoord, toCoord, pieceIsWhite)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Helper to check if a player is in checkmate
    function _isCheckmate(uint8[64] storage _board, bool isWhiteTurn) internal view returns (bool) {
        // First, check if the current player's king is in check
        uint kingIndex = 0;
        for (uint i = 0; i < 64; i++) {
            uint8 piece = _board[i];
            if (piece == 0) continue;
            (uint8 pieceType, bool pieceIsWhite) = getPieceTypeAndColor(piece);
            if (pieceType == 6 && pieceIsWhite == isWhiteTurn) { // King of the current player
                kingIndex = i;
                break;
            }
        }

        if (!_isKingInCheck(_board, isWhiteTurn, kingIndex)) {
            return false; // Not in check, so cannot be checkmate
        }

        // Now, check if any legal move can get the king out of check
        for (uint fromIndex = 0; fromIndex < 64; fromIndex++) {
            uint8 fromPiece = _board[fromIndex];
            if (fromPiece == 0) continue;
            (uint8 fromPieceType, bool fromIsWhite) = getPieceTypeAndColor(fromPiece);

            if (fromIsWhite == isWhiteTurn) { // Only consider current player's pieces
                for (uint toIndex = 0; toIndex < 64; toIndex++) {
                    string memory fromCoord = string(abi.encodePacked(bytes1(uint8(97 + indexToCol(fromIndex))), bytes1(uint8(56 - indexToRow(fromIndex)))));
                    string memory toCoord = string(abi.encodePacked(bytes1(uint8(97 + indexToCol(toIndex))), bytes1(uint8(56 - indexToRow(toIndex)))));

                    if (isValidMove(_board, fromCoord, toCoord, isWhiteTurn)) {
                        // Simulate the move
                        uint8 originalFromPiece = _board[fromIndex];
                        uint8 originalToPiece = _board[toIndex];
                        _board[toIndex] = _board[fromIndex];
                        _board[fromIndex] = 0;

                        // Check if king is still in check after the move
                        uint newKingIndex = kingIndex;
                        if (fromPieceType == 6) { // If the king moved
                            newKingIndex = toIndex;
                        }

                        bool stillInCheck = _isKingInCheck(_board, isWhiteTurn, newKingIndex);

                        // Revert the move
                        _board[fromIndex] = originalFromPiece;
                        _board[toIndex] = originalToPiece;

                        if (!stillInCheck) {
                            return false; // Found a legal move that gets the king out of check
                        }
                    }
                }
            }
        }
        return true; // No legal moves found to get out of check
    }

    // Helper to check if a player is in stalemate
    function _isStalemate(uint8[64] storage _board, bool isWhiteTurn) internal view returns (bool) {
        // First, check if the current player's king is NOT in check
        uint kingIndex = 0;
        for (uint i = 0; i < 64; i++) {
            uint8 piece = _board[i];
            if (piece == 0) continue;
            (uint8 pieceType, bool pieceIsWhite) = getPieceTypeAndColor(piece);
            if (pieceType == 6 && pieceIsWhite == isWhiteTurn) { // King of the current player
                kingIndex = i;
                break;
            }
        }

        if (_isKingInCheck(_board, isWhiteTurn, kingIndex)) {
            return false; // In check, so cannot be stalemate
        }

        // Check if there are any legal moves for the current player
        for (uint fromIndex = 0; fromIndex < 64; fromIndex++) {
            uint8 fromPiece = _board[fromIndex];
            if (fromPiece == 0) continue;
            (uint8 fromPieceType, bool fromIsWhite) = getPieceTypeAndColor(fromPiece);

            if (fromIsWhite == isWhiteTurn) { // Only consider current player's pieces
                for (uint toIndex = 0; toIndex < 64; toIndex++) {
                    string memory fromCoord = string(abi.encodePacked(bytes1(uint8(97 + indexToCol(fromIndex))), bytes1(uint8(56 - indexToRow(fromIndex)))));
                    string memory toCoord = string(abi.encodePacked(bytes1(uint8(97 + indexToCol(toIndex))), bytes1(uint8(56 - indexToRow(toIndex)))));

                    if (isValidMove(_board, fromCoord, toCoord, isWhiteTurn)) {
                        // Simulate the move
                        uint8 originalFromPiece = _board[fromIndex];
                        uint8 originalToPiece = _board[toIndex];
                        _board[toIndex] = _board[fromIndex];
                        _board[fromIndex] = 0;

                        // Check if king is still in check after the move
                        uint newKingIndex = kingIndex;
                        if (fromPieceType == 6) { // If the king moved
                            newKingIndex = toIndex;
                        }

                        bool stillInCheck = _isKingInCheck(_board, isWhiteTurn, newKingIndex);

                        // Revert the move
                        _board[fromIndex] = originalFromPiece;
                        _board[toIndex] = originalToPiece;

                        if (!stillInCheck) {
                            return false; // Found a legal move that does not put the king in check
                        }
                    }
                }
            }
        }
        return true; // No legal moves found
    }
}
