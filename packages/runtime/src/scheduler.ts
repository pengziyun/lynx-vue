export type SchedulerJob = () => void

export interface SchedulerQueue {
  jobs: SchedulerJob[]
  isFlushPending: boolean
  isFlushing: boolean
}

export type ThreadType = 'main' | 'background'

const mainThreadQueue: SchedulerQueue = {
  jobs: [],
  isFlushPending: false,
  isFlushing: false,
}

const backgroundThreadQueue: SchedulerQueue = {
  jobs: [],
  isFlushPending: false,
  isFlushing: false,
}

function getQueue(thread: ThreadType): SchedulerQueue {
  return thread === 'main' ? mainThreadQueue : backgroundThreadQueue
}

export function queueJob(job: SchedulerJob, thread: ThreadType = 'background'): void {
  const queue = getQueue(thread)
  
  if (!queue.jobs.includes(job)) {
    queue.jobs.push(job)
  }
  
  if (!queue.isFlushPending && !queue.isFlushing) {
    queue.isFlushPending = true
    scheduleFlush(thread)
  }
}

function scheduleFlush(thread: ThreadType): void {
  Promise.resolve().then(() => {
    flushJobs(thread)
  })
}

export function flushJobs(thread: ThreadType = 'background'): void {
  const queue = getQueue(thread)
  
  if (queue.isFlushing) {
    return
  }
  
  queue.isFlushPending = false
  queue.isFlushing = true
  
  try {
    const jobs = queue.jobs.slice()
    queue.jobs.length = 0
    
    for (const job of jobs) {
      try {
        job()
      } catch (error) {
        console.error(`[Scheduler] Job execution error on ${thread} thread:`, error)
      }
    }
  } finally {
    queue.isFlushing = false
    
    if (queue.jobs.length > 0) {
      scheduleFlush(thread)
    }
  }
}

export function nextTick(fn?: () => void): Promise<void> {
  const p = Promise.resolve()
  return fn ? p.then(fn) : p
}

export function clearQueue(thread: ThreadType): void {
  const queue = getQueue(thread)
  queue.jobs.length = 0
  queue.isFlushPending = false
}

export function hasQueuedJobs(thread: ThreadType): boolean {
  const queue = getQueue(thread)
  return queue.jobs.length > 0 || queue.isFlushPending || queue.isFlushing
}
