#!/bin/bash

# Batch commit script 5 - More Features and Improvements
cd /home/marcus/chess

# Function to make a commit
make_commit() {
    git add .
    git commit -m "$1"
    echo "✓ Committed: $1"
}

echo "Starting batch 5 commits..."

# Add missing test files
cat > src/__tests__/lib/chess-utils.test.ts << 'EOF'
/**
 * Chess utility function tests
 */

import { squareToIndices, indicesToSquare, calculateMaterialAdvantage } from '@/lib/chess-utils'

describe('Chess Utils', () => {
  describe('squareToIndices', () => {
    it('converts a1 to correct indices', () => {
      const [row, col] = squareToIndices('a1')
      expect(row).toBe(7)
      expect(col).toBe(0)
    })

    it('converts h8 to correct indices', () => {
      const [row, col] = squareToIndices('h8')
      expect(row).toBe(0)
      expect(col).toBe(7)
    })
  })

  describe('indicesToSquare', () => {
    it('converts indices to a1', () => {
      const square = indicesToSquare(7, 0)
      expect(square).toBe('a1')
    })
  })

  describe('calculateMaterialAdvantage', () => {
    it('calculates equal material as 0', () => {
      const pieces = {
        e1: { type: 'k', color: 'w' },
        e8: { type: 'k', color: 'b' }
      }
      const advantage = calculateMaterialAdvantage(pieces as any)
      expect(advantage).toBe(0)
    })
  })
})
EOF
make_commit "test: add chess utility function tests"

cat > src/__tests__/lib/validation.test.ts << 'EOF'
/**
 * Validation utility tests
 */

import { Validator } from '@/lib/validation'

describe('Validator', () => {
  describe('ethereumAddress', () => {
    it('validates correct Ethereum address', () => {
      const result = Validator.ethereumAddress('0x1234567890123456789012345678901234567890')
      expect(result.isValid).toBe(true)
    })

    it('rejects invalid address', () => {
      const result = Validator.ethereumAddress('invalid')
      expect(result.isValid).toBe(false)
    })
  })

  describe('chessMove', () => {
    it('validates correct move', () => {
      const result = Validator.chessMove('e2e4')
      expect(result.isValid).toBe(true)
    })
  })
})
EOF
make_commit "test: add validation utility tests"

# Add game settings component
cat > src/components/GameSettings.tsx << 'EOF'
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Settings, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react'

interface GameSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function GameSettings({ isOpen, onClose }: GameSettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [highlightMoves, setHighlightMoves] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6 m-4">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5" />
          <h2 className="text-xl font-bold">Game Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Sound Effects</span>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showCoordinates ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>Show Coordinates</span>
            </div>
            <Switch checked={showCoordinates} onCheckedChange={setShowCoordinates} />
          </div>

          <div className="flex items-center justify-between">
            <span>Highlight Moves</span>
            <Switch checked={highlightMoves} onCheckedChange={setHighlightMoves} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Animation Speed</label>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <Badge
                  key={speed}
                  variant={animationSpeed === speed ? 'default' : 'info'}
                  className="cursor-pointer"
                  onClick={() => setAnimationSpeed(speed)}
                >
                  {speed}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onClose} className="flex-1">
            Save
          </Button>
        </div>
      </Card>
    </div>
  )
}
EOF
make_commit "feat: add game settings component"

# Add move history component
cat > src/components/MoveHistory.tsx << 'EOF'
'use client'

import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, RotateCcw } from 'lucide-react'

interface MoveHistoryProps {
  moves: string[]
  onMoveClick?: (moveIndex: number) => void
}

export function MoveHistory({ moves, onMoveClick }: MoveHistoryProps) {
  const movePairs = []
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1]
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4" />
        <h3 className="font-semibold">Move History</h3>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-1">
          {movePairs.map((pair) => (
            <div key={pair.number} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-muted-foreground">{pair.number}.</span>
              <button
                className="px-2 py-1 rounded hover:bg-muted transition-colors"
                onClick={() => onMoveClick?.((pair.number - 1) * 2)}
              >
                {pair.white}
              </button>
              {pair.black && (
                <button
                  className="px-2 py-1 rounded hover:bg-muted transition-colors"
                  onClick={() => onMoveClick?.((pair.number - 1) * 2 + 1)}
                >
                  {pair.black}
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {moves.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No moves yet</p>
        </div>
      )}
    </Card>
  )
}
EOF
make_commit "feat: add move history component"

# Add scroll area component (needed for move history)
cat > src/components/ui/scroll-area.tsx << 'EOF'
'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps {
  children: ReactNode
  className?: string
}

export function ScrollArea({ children, className }: ScrollAreaProps) {
  return (
    <div className={cn('overflow-auto', className)}>
      {children}
    </div>
  )
}
EOF
make_commit "feat: add scroll area component"

# Add game statistics component
cat > src/components/GameStats.tsx << 'EOF'
'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Target, Zap } from 'lucide-react'

interface GameStatsProps {
  totalMoves: number
  averageMoveTime: number
  capturedPieces: string[]
  gameTime: number
}

export function GameStats({ totalMoves, averageMoveTime, capturedPieces, gameTime }: GameStatsProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const formatMoveTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4" />
        <h3 className="font-semibold">Game Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-muted-foreground">Moves</span>
          </div>
          <div className="text-lg font-bold">{totalMoves}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-green-500" />
            <span className="text-xs text-muted-foreground">Game Time</span>
          </div>
          <div className="text-lg font-bold">{formatTime(gameTime)}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Avg Move</span>
          </div>
          <div className="text-lg font-bold">{formatMoveTime(averageMoveTime)}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-xs text-muted-foreground">Captures</span>
          </div>
          <div className="text-lg font-bold">{capturedPieces.length}</div>
        </div>
      </div>

      {capturedPieces.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-2">Captured Pieces</div>
          <div className="flex flex-wrap gap-1">
            {capturedPieces.map((piece, index) => (
              <Badge key={index} variant="info" size="sm">
                {piece}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
EOF
make_commit "feat: add game statistics component"

echo "Batch 5 complete! Made 6 more commits."
