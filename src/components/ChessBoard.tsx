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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault()
    const fromSquare = e.dataTransfer.getData('square') as Square
    if (fromSquare && isPlayerTurn) {
      const piece = chess.get(fromSquare)
      const isPawnPromotion = (
        piece?.type === 'p' &&
        ((piece.color === 'w' && targetSquare.endsWith('8')) ||
          (piece.color === 'b' && targetSquare.endsWith('1')))
      )

      if (isPawnPromotion) {
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

  const handleSquareClick = (square: Square) => {
    if (!isPlayerTurn) return

    if (selectedSquare === square) {
      setSelectedSquare(null)
      setPossibleMoves([])
      return
    }

    if (selectedSquare) {
      const piece = chess.get(selectedSquare)
      const isPawnPromotion = (
        piece?.type === 'p' &&
        ((piece.color === 'w' && square.endsWith('8')) ||
          (piece.color === 'b' && square.endsWith('1')))
      )

      if (isPawnPromotion) {
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
    const squareName = String.fromCharCode(97 + colIndex) + (8 - rowIndex) as Square
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
    <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-2xl">
      <div className="grid grid-cols-8 gap-0">
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => renderSquare(square, rowIndex, colIndex))
        )}
      </div>
      {promotionSquare && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm mx-4 bg-card border-border">
            <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Promote Pawn to:</h3>
            <div className="flex justify-center space-x-3">
              <Button onClick={() => handlePromotionSelect('q')} size="lg" className="text-2xl hover:scale-110 transition-transform">♕</Button>
              <Button onClick={() => handlePromotionSelect('r')} size="lg" className="text-2xl hover:scale-110 transition-transform">♖</Button>
              <Button onClick={() => handlePromotionSelect('b')} size="lg" className="text-2xl hover:scale-110 transition-transform">♗</Button>
              <Button onClick={() => handlePromotionSelect('n')} size="lg" className="text-2xl hover:scale-110 transition-transform">♘</Button>
            </div>
          </Card>
        </div>
      )}
      <div className="mt-6 text-center space-y-2">
        <p className={`text-sm font-medium ${isPlayerTurn ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
          {isPlayerTurn ? "Your turn" : "Opponent's turn"}
        </p>
        {chess.isCheckmate() && <p className="text-red-600 dark:text-red-400 font-bold text-lg">Checkmate!</p>}
        {chess.isStalemate() && <p className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">Stalemate!</p>}
        {chess.inCheck() && <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">Check!</p>}
      </div>
    </div>
  )
}
