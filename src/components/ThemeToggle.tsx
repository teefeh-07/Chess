'use client'

import { useTheme } from '@/lib/ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Theme toggle constants
const ANIMATION_DURATION = 'duration-500';
const HOVER_SCALE = 'hover:scale-110';
const TRANSITION_CLASSES = 'transition-all duration-300';

/**
 * Theme toggle button component with smooth animations
 * Switches between light and dark themes with icon transitions
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`relative overflow-hidden border-2 ${HOVER_SCALE} ${TRANSITION_CLASSES} group`}
      aria-label="Toggle theme"
    >
      <Sun className={`h-5 w-5 rotate-0 scale-100 transition-all ${ANIMATION_DURATION} dark:-rotate-90 dark:scale-0 text-amber-500`} />
      <Moon className={`absolute h-5 w-5 rotate-90 scale-0 transition-all ${ANIMATION_DURATION} dark:rotate-0 dark:scale-100 text-purple-500`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
