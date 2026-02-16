import type { HostElement } from '../types'

type ClassValue = string | string[] | Record<string, boolean> | null | undefined

export function normalizeClass(value: ClassValue): string {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean).join(' ')
  }

  if (typeof value === 'object') {
    const classes: string[] = []
    for (const key in value) {
      if (value[key]) {
        classes.push(key)
      }
    }
    return classes.join(' ')
  }

  return ''
}

export function patchClass(
  el: HostElement,
  _prev: ClassValue,
  next: ClassValue
): void {
  const nextClass = normalizeClass(next)
  
  if (nextClass) {
    el.props.class = nextClass
  } else {
    delete el.props.class
  }
}
