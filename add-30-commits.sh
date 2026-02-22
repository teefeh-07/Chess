#!/bin/bash

# Quick 30 commits batch
cd /home/marcus/chess

make_commit() {
    git add .
    git commit -m "$1"
    echo "✓ $1"
}

echo "Adding 30 more commits..."

# CSS utilities (10 commits)
echo "export const MARGIN = { 0: '0', 1: '0.25rem', 2: '0.5rem', 4: '1rem' } as const" > src/lib/margin.ts
make_commit "feat: add margin constants"

echo "export const PADDING = { 0: '0', 1: '0.25rem', 2: '0.5rem', 4: '1rem' } as const" > src/lib/padding.ts
make_commit "feat: add padding constants"

echo "export const WIDTH = { FULL: '100%', HALF: '50%', THIRD: '33.333%' } as const" > src/lib/width.ts
make_commit "feat: add width constants"

echo "export const HEIGHT = { FULL: '100%', SCREEN: '100vh', AUTO: 'auto' } as const" > src/lib/height.ts
make_commit "feat: add height constants"

echo "export const MAX_WIDTH = { XS: '20rem', SM: '24rem', MD: '28rem' } as const" > src/lib/max-width.ts
make_commit "feat: add max-width constants"

echo "export const MIN_WIDTH = { 0: '0', FULL: '100%', MIN: 'min-content' } as const" > src/lib/min-width.ts
make_commit "feat: add min-width constants"

echo "export const MAX_HEIGHT = { FULL: '100%', SCREEN: '100vh' } as const" > src/lib/max-height.ts
make_commit "feat: add max-height constants"

echo "export const MIN_HEIGHT = { 0: '0', FULL: '100%', SCREEN: '100vh' } as const" > src/lib/min-height.ts
make_commit "feat: add min-height constants"

echo "export const FLEX_GROW = { 0: '0', 1: '1', DEFAULT: '1' } as const" > src/lib/flex-grow.ts
make_commit "feat: add flex-grow constants"

echo "export const FLEX_SHRINK = { 0: '0', 1: '1', DEFAULT: '1' } as const" > src/lib/flex-shrink.ts
make_commit "feat: add flex-shrink constants"

# Game utilities (10 commits)
echo "export const CHESS_OPENINGS = { ITALIAN: 'e4 e5 Nf3 Nc6 Bc4', SPANISH: 'e4 e5 Nf3 Nc6 Bb5' } as const" > src/lib/openings.ts
make_commit "feat: add chess opening constants"

echo "export const ENDGAME_TYPES = { KQ_VS_K: 'kq_vs_k', KR_VS_K: 'kr_vs_k' } as const" > src/lib/endgames.ts
make_commit "feat: add endgame type constants"

echo "export const TACTICS = { PIN: 'pin', FORK: 'fork', SKEWER: 'skewer' } as const" > src/lib/tactics.ts
make_commit "feat: add chess tactics constants"

echo "export const PIECE_ACTIVITY = { ACTIVE: 'active', PASSIVE: 'passive' } as const" > src/lib/activity.ts
make_commit "feat: add piece activity constants"

echo "export const PAWN_STRUCTURE = { ISOLATED: 'isolated', DOUBLED: 'doubled' } as const" > src/lib/pawn-structure.ts
make_commit "feat: add pawn structure constants"

echo "export const KING_SAFETY = { SAFE: 'safe', EXPOSED: 'exposed' } as const" > src/lib/king-safety.ts
make_commit "feat: add king safety constants"

echo "export const TEMPO = { GAIN: 'gain', LOSS: 'loss' } as const" > src/lib/tempo.ts
make_commit "feat: add tempo constants"

echo "export const SPACE_ADVANTAGE = { WHITE: 'white', BLACK: 'black', EQUAL: 'equal' } as const" > src/lib/space.ts
make_commit "feat: add space advantage constants"

echo "export const MATERIAL_BALANCE = { EQUAL: 0, ADVANTAGE: 1, DISADVANTAGE: -1 } as const" > src/lib/material.ts
make_commit "feat: add material balance constants"

echo "export const DEVELOPMENT = { AHEAD: 'ahead', BEHIND: 'behind', EQUAL: 'equal' } as const" > src/lib/development.ts
make_commit "feat: add development constants"

# Component utilities (10 commits)
echo "export const BUTTON_SIZES = { XS: 'h-6 px-2', SM: 'h-8 px-3', MD: 'h-10 px-4' } as const" > src/lib/btn-sizes.ts
make_commit "feat: add button size constants"

echo "export const CARD_VARIANTS = { DEFAULT: 'default', OUTLINED: 'outlined' } as const" > src/lib/card-variants.ts
make_commit "feat: add card variant constants"

echo "export const INPUT_SIZES = { SM: 'h-8', MD: 'h-10', LG: 'h-12' } as const" > src/lib/input-sizes.ts
make_commit "feat: add input size constants"

echo "export const ICON_SIZES = { XS: 'w-3 h-3', SM: 'w-4 h-4', MD: 'w-5 h-5' } as const" > src/lib/icon-sizes.ts
make_commit "feat: add icon size constants"

echo "export const AVATAR_SIZES = { XS: 'w-6 h-6', SM: 'w-8 h-8', MD: 'w-10 h-10' } as const" > src/lib/avatar-sizes.ts
make_commit "feat: add avatar size constants"

echo "export const BADGE_SIZES = { SM: 'px-2 py-0.5 text-xs', MD: 'px-2.5 py-0.5 text-sm' } as const" > src/lib/badge-sizes.ts
make_commit "feat: add badge size constants"

echo "export const SPINNER_SIZES = { SM: 'w-4 h-4', MD: 'w-6 h-6', LG: 'w-8 h-8' } as const" > src/lib/spinner-sizes.ts
make_commit "feat: add spinner size constants"

echo "export const MODAL_VARIANTS = { CENTER: 'center', FULL: 'full' } as const" > src/lib/modal-variants.ts
make_commit "feat: add modal variant constants"

echo "export const TOAST_VARIANTS = { DEFAULT: 'default', SUCCESS: 'success', ERROR: 'error' } as const" > src/lib/toast-variants.ts
make_commit "feat: add toast variant constants"

echo "export const TOOLTIP_VARIANTS = { DEFAULT: 'default', DARK: 'dark' } as const" > src/lib/tooltip-variants.ts
make_commit "feat: add tooltip variant constants"

echo "Done! Added 30 commits."
