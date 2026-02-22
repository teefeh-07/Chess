/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(label: string): void {
    this.metrics.set(label, performance.now())
  }

  endTimer(label: string): number {
    const startTime = this.metrics.get(label)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`)
    this.metrics.delete(label)
    return duration
  }

  measureRender<T>(component: string, fn: () => T): T {
    this.startTimer(`render-${component}`)
    const result = fn()
    this.endTimer(`render-${component}`)
    return result
  }
}

export const perf = PerformanceMonitor.getInstance()
