import type { HostElement } from './types'
import { patchEvent } from './props/event'
import { patchStyle } from './props/style'
import { patchClass } from './props/class'
import { patchAttr } from './props/attr'

export function patchProp(
  el: HostElement,
  key: string,
  prevValue: any,
  nextValue: any
): void {
  if (key.startsWith('on')) {
    patchEvent(el, key, prevValue, nextValue)
    return
  }

  if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
    return
  }

  if (key === 'class' || key === 'className') {
    patchClass(el, prevValue, nextValue)
    return
  }

  patchAttr(el, key, nextValue)
}
