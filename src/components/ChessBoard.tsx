'use client'

import { useState, useEffect, useCallback } from 'react'
import { Chess, Square, PieceSymbol, Piece } from 'chess.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface GameState {
  player1: string;
  player2: string;
  moves: string[];
  startTime: bigint;
  status: number;
  winner: string;
}

// Chess game constants
const BOARD_SIZE = 8;
const INITIAL_TIMER_MINUTES = 10;
const PIECE_SYMBOLS = {
  QUEEN: 'q' as PieceSymbol,
  ROOK: 'r' as PieceSymbol,
  BISHOP: 'b' as PieceSymbol,
  KNIGHT: 'n' as PieceSymbol,
} as const;

const CHESS_COLORS = {
  WHITE: 'w',
  BLACK: 'b',
} as const;

/**
 * Generates a chess square name from board coordinates
 * @param rowIndex - The row index (0-7)
 * @param colIndex - The column index (0-7)
 * @returns The square name (e.g., 'a1', 'h8')
 */
const getSquareName = (rowIndex: number, colIndex: number): Square => {
  return (String.fromCharCode(97 + colIndex) + (8 - rowIndex)) as Square;
};

/**
 * Checks if a move results in pawn promotion
 * @param piece - The chess piece being moved
 * @param targetSquare - The destination square
 * @returns True if the move is a pawn promotion
 */
const isPawnPromotion = (piece: Piece | null, targetSquare: Square): boolean => {
  return !!(
    piece?.type === 'p' &&
    ((piece.color === CHESS_COLORS.WHITE && targetSquare.endsWith('8')) ||
      (piece.color === CHESS_COLORS.BLACK && targetSquare.endsWith('1')))
  );
};

interface ChessBoardProps {
  gameId: number
  onMove: (move: string) => void
  isPlayerTurn: boolean
  gameState: GameState
}

export default function ChessBoard({ onMove, isPlayerTurn, gameState }: ChessBoardProps) {
  const [chess] = useState(new Chess())
  const [board, setBoard] = useState<(Piece | null)[][]>(chess.board())
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null)
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null)

  const updateBoardState = useCallback(() => {
    if (gameState?.moves) {
      chess.reset()
      gameState.moves.forEach((move: string) => {
        chess.move(move)
      })
      setBoard(chess.board())
    }
  }, [gameState, chess])

  useEffect(() => {
    setTimeout(() => updateBoardState(), 0)
  }, [updateBoardState])

  /**
   * Handles the start of a drag operation for chess pieces
   * @param e - The drag event
   * @param squareName - The square being dragged from
   */
  const handleDragStart = (e: React.DragEvent, squareName: Square) => {
    const piece = chess.get(squareName)
    if (isPlayerTurn && piece && piece.color === chess.turn()) {
      setSelectedSquare(squareName)
      e.dataTransfer.setData('square', squareName)
      const moves = chess.moves({ square: squareName, verbose: true })
      setPossibleMoves(moves.map(m => m.to))
    } else {
      e.preventDefault()
    }
  }

  /**
   * Handles drag over events for valid drop zones
   * @param e - The drag event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  /**
   * Handles piece drop events and processes chess moves
   * @param e - The drop event
   * @param targetSquare - The square where the piece is being dropped
   */
  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault()
    const fromSquare = e.dataTransfer.getData('square') as Square
    if (fromSquare && isPlayerTurn) {
      const piece = chess.get(fromSquare)
      const isPromotion = isPawnPromotion(piece, targetSquare)

      if (isPromotion) {
        setPromotionSquare(targetSquare)
        setPromotionMove({ from: fromSquare, to: targetSquare })
      } else {
        const move = chess.move({
          from: fromSquare,
          to: targetSquare,
          promotion: 'q'
        })

        if (move) {
          onMove(move.san)
          setBoard(chess.board())
          setSelectedSquare(null)
          setPossibleMoves([])
        } else {
          setSelectedSquare(null)
          setPossibleMoves([])
        }
      }
    }
  }

  /**
   * Handles square click events for piece selection and movement
   * @param square - The square that was clicked
   */
  const handleSquareClick = (square: Square) => {
    if (!isPlayerTurn) return

    if (selectedSquare === square) {
      setSelectedSquare(null)
      setPossibleMoves([])
      return
    }

    if (selectedSquare) {
      const piece = chess.get(selectedSquare)
      const isPromotion = isPawnPromotion(piece, square)

      if (isPromotion) {
        setPromotionSquare(square)
        setPromotionMove({ from: selectedSquare, to: square })
      } else {
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q'
        })

        if (move) {
          onMove(move.san)
          setBoard(chess.board())
          setSelectedSquare(null)
          setPossibleMoves([])
        } else {
          setSelectedSquare(square)
          const moves = chess.moves({ square, verbose: true })
          setPossibleMoves(moves.map(m => m.to))
        }
      }
    } else {
      const piece = chess.get(square)
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square)
        const moves = chess.moves({ square, verbose: true })
        setPossibleMoves(moves.map(m => m.to))
      }
    }
  }

  /**
   * Handles pawn promotion piece selection
   * @param pieceSymbol - The piece type to promote to (q, r, b, n)
   */
  const handlePromotionSelect = (pieceSymbol: PieceSymbol) => {
    if (promotionMove) {
      const move = chess.move({
        from: promotionMove.from,
        to: promotionMove.to,
        promotion: pieceSymbol
      })

      if (move) {
        onMove(move.san)
        setBoard(chess.board())
      }
    }
    setPromotionSquare(null)
    setPromotionMove(null)
    setSelectedSquare(null)
    setPossibleMoves([])
  }

  const renderSquare = (square: Piece | null, rowIndex: number, colIndex: number) => {
    const squareName = getSquareName(rowIndex, colIndex)
    const isLight = (rowIndex + colIndex) % 2 === 0
    const isSelected = selectedSquare === squareName
    const isPossibleMove = possibleMoves.includes(squareName)
    const piece = chess.get(squareName)

    return (
      <div
        key={squareName}
        className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
          isLight ? 'bg-amber-50 dark:bg-amber-100' : 'bg-amber-900 dark:bg-amber-800'
        } ${isSelected ? 'ring-4 ring-blue-500 dark:ring-blue-400' : ''} ${
          isPossibleMove ? 'ring-4 ring-green-500 dark:ring-green-400' : ''
        }`}
        onClick={() => handleSquareClick(squareName)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, squareName)}
      >
        {piece && (
          <span
            className={`text-2xl sm:text-3xl lg:text-4xl select-none ${
              piece.color === 'w' ? 'text-white drop-shadow-lg' : 'text-black dark:text-gray-900'
            } ${isPlayerTurn && piece.color === chess.turn() ? 'cursor-grab hover:scale-110' : 'cursor-default'}`}
            draggable={isPlayerTurn && piece.color === chess.turn()}
            onDragStart={(e) => handleDragStart(e, squareName)}
          >
            {getPieceSymbol(piece.type, piece.color)}
          </span>
        )}
        {isPossibleMove && !piece && (
          <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full opacity-70"></div>
        )}
      </div>
    )
  }

  const getPieceSymbol = (type: PieceSymbol, color: 'w' | 'b') => {
    const symbols = {
      k: color === 'w' ? '♔' : '♚',
      q: color === 'w' ? '♕' : '♛',
      r: color === 'w' ? '♖' : '♜',
      b: color === 'w' ? '♗' : '♝',
      n: color === 'w' ? '♘' : '♞',
      p: color === 'w' ? '♙' : '♟'
    }
    return symbols[type] || ''
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-card via-card to-amber-900/10 border-4 border-amber-600/30 dark:border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/20 p-4 md:p-6">
        <div className="grid grid-cols-8 gap-0 w-fit mx-auto relative">
          {board.map((row, rowIndex) =>
            row.map((square, colIndex) => renderSquare(square, rowIndex, colIndex))
          )}
        </div>
        
        {/* Board status indicators */}
        <div className="mt-4 text-center space-y-2">
          {chess.isCheckmate() && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/50 animate-pulse">
              <p className="text-red-600 dark:text-red-400 font-bold text-lg">🏁 Checkmate!</p>
            </div>
          )}
          {chess.isStalemate() && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50">
              <p className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">🤝 Stalemate!</p>
            </div>
          )}
          {chess.inCheck() && !chess.isCheckmate() && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 animate-pulse">
              <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">⚠️ Check!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Promotion modal */}
      {promotionSquare && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm dark:bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <Card className="p-8 max-w-sm mx-4 bg-gradient-to-br from-card to-amber-500/10 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/30 animate-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">👑</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Promote Pawn
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Choose your piece</p>
            </div>
            <div className="flex justify-center gap-3">
              <Button 
                onClick={() => handlePromotionSelect('q')} 
                size="lg" 
                className="w-16 h-16 text-3xl p-0 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:scale-110 transition-all shadow-lg hover:shadow-xl"
              >
                ♕
              </Button>
              <Button 
                onClick={() => handlePromotionSelect('r')} 
                size="lg" 
                className="w-16 h-16 text-3xl p-0 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 hover:scale-110 transition-all shadow-lg hover:shadow-xl"
              >
                ♖
              </Button>
              <Button 
                onClick={() => handlePromotionSelect('b')} 
                size="lg" 
                className="w-16 h-16 text-3xl p-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-110 transition-all shadow-lg hover:shadow-xl"
              >
                ♗
              </Button>
              <Button 
                onClick={() => handlePromotionSelect('n')} 
                size="lg" 
                className="w-16 h-16 text-3xl p-0 bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 hover:scale-110 transition-all shadow-lg hover:shadow-xl"
              >
                ♘
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
