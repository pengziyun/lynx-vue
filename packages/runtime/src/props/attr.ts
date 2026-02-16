import type { HostElement } from '../types'
import { lynxApi } from '../lynx-api'

export function patchAttr(
  el: HostElement,
  key: string,
  value: any
): void {
  if (value == null || value === false) {
    lynxApi.removeAttribute(el, key)
  } else {
    const strValue = value === true ? '' : String(value)
    lynxApi.setAttribute(el, key, strValue)
  }
}

export function shouldSetAsProp(el: HostElement, key: string): boolean {
  if (key === 'form') {
    return false
  }

  if (key === 'list' && el.tag === 'input') {
    return false
  }

  if (key === 'type' && el.tag === 'textarea') {
    return false
  }

  return key in el
}
