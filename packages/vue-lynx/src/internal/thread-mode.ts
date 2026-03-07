export const VUE_LYNX_THREAD_MODE_KEY = '__VUE_LYNX_THREAD_MODE__';

export type LynxThreadMode = 'single' | 'background' | 'main-thread';

export function getLynxThreadMode(): LynxThreadMode {
  const mode = (globalThis as Record<string, unknown>)[VUE_LYNX_THREAD_MODE_KEY];
  return mode === 'background' || mode === 'main-thread' ? mode : 'single';
}

export function setLynxThreadMode(mode: LynxThreadMode) {
  (globalThis as Record<string, unknown>)[VUE_LYNX_THREAD_MODE_KEY] = mode;
}
