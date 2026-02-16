import { createRenderer as vueCreateRenderer } from 'vue'
import type { HostNode, HostElement } from './types'
import { nodeOps } from './node-ops'
import { patchProp } from './patch-prop'

export function createRenderer() {
  return vueCreateRenderer<HostNode, HostElement>({
    ...nodeOps,
    patchProp,
  })
}
