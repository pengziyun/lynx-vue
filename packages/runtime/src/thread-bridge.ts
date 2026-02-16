import type { ThreadBridge } from './types'
import { queueJob, flushJobs, type ThreadType } from './scheduler'

export function createThreadBridge(): ThreadBridge {
  return {
    async runOnBackground<T>(fn: () => T): Promise<T> {
      return new Promise((resolve, reject) => {
        queueJob(() => {
          try {
            const result = fn()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, 'background')
      })
    },

    async runOnMainThread<T>(fn: () => T): Promise<T> {
      return new Promise((resolve, reject) => {
        queueJob(() => {
          try {
            const result = fn()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, 'main')
      })
    },

    flushUpdates(): void {
      flushJobs('background')
      flushJobs('main')
    },
  }
}

export function runOnThread<T>(fn: () => T, thread: ThreadType): Promise<T> {
  return new Promise((resolve, reject) => {
    queueJob(() => {
      try {
        const result = fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }, thread)
  })
}
