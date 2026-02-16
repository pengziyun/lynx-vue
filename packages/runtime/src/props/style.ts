import type { HostElement, StyleValue } from '../types'

type StyleObject = Record<string, string | number>

const hyphenateRE = /\B([A-Z])/g

function hyphenate(str: string): string {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
}

function normalizeStyleValue(key: string, value: string | number): string {
  if (typeof value === 'number') {
    if (key === 'opacity' || key === 'z-index' || key === 'zIndex') {
      return String(value)
    }
    return `${value}px`
  }
  return value
}

function parseStyleString(styleStr: string): StyleObject {
  const result: StyleObject = {}
  
  if (!styleStr || typeof styleStr !== 'string') {
    return result
  }

  const declarations = styleStr.split(';')
  
  for (const decl of declarations) {
    const colonIndex = decl.indexOf(':')
    if (colonIndex === -1) continue
    
    const prop = decl.slice(0, colonIndex).trim()
    const value = decl.slice(colonIndex + 1).trim()
    
    if (prop && value) {
      result[prop] = value
    }
  }
  
  return result
}

function normalizeStyleObject(style: StyleObject): StyleObject {
  const normalized: StyleObject = {}
  
  for (const key in style) {
    const normalizedKey = hyphenate(key)
    const value = style[key]
    
    if (value != null) {
      normalized[normalizedKey] = normalizeStyleValue(key, value)
    }
  }
  
  return normalized
}

export function normalizeStyle(style: StyleValue): StyleObject {
  if (!style) {
    return {}
  }

  if (typeof style === 'string') {
    return parseStyleString(style)
  }

  if (typeof style === 'object') {
    return normalizeStyleObject(style as StyleObject)
  }

  return {}
}

export function stringifyStyle(style: StyleObject): string {
  const parts: string[] = []
  
  for (const key in style) {
    const value = style[key]
    if (value != null) {
      parts.push(`${key}: ${value}`)
    }
  }
  
  return parts.join('; ')
}

export function patchStyle(
  el: HostElement,
  prev: StyleValue,
  next: StyleValue
): void {
  const prevStyles = normalizeStyle(prev)
  const nextStyles = normalizeStyle(next)

  for (const key in prevStyles) {
    if (nextStyles[key] == null) {
      delete el.props[`style.${key}`]
    }
  }

  for (const key in nextStyles) {
    const value = nextStyles[key]
    if (value !== prevStyles[key]) {
      el.props[`style.${key}`] = value
    }
  }

  const styleString = stringifyStyle(nextStyles)
  if (styleString) {
    el.props.style = styleString
  } else {
    delete el.props.style
  }
}
