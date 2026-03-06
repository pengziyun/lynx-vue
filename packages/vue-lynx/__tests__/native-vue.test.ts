import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nodeOps, resetNodeIdCounter } from '../src/nodeOps';
import { createMockLynxAPI, resetLynxAPI, setLynxAPI } from '../src/lynxAPI';
import { patchProp } from '../src/patchProp';
import { vModelText, withModifiers } from '../src/native-vue';

describe('native-vue runtime helpers', () => {
  beforeEach(() => {
    resetNodeIdCounter();
    setLynxAPI(createMockLynxAPI());
  });

  afterEach(() => {
    resetLynxAPI();
  });

  it('syncs v-model values through the Lynx input bridge', () => {
    const el = nodeOps.createElement('input') as any;
    const updateModel = vi.fn();

    patchProp(el, 'onUpdate:modelValue', null, updateModel);
    vModelText.mounted?.(el, { value: 'draft', oldValue: undefined, modifiers: {}, instance: null, dir: vModelText } as any, null as any, null);

    expect((el.__lynx_element as any).__props.value).toBe('draft');

    const inputHandler = (el.__lynx_element as any).__events.input;
    expect(typeof inputHandler).toBe('function');

    inputHandler({ detail: { value: 'published' } });
    expect(updateModel).toHaveBeenCalledWith('published');
  });

  it('applies event modifiers without relying on runtime-dom', () => {
    const stopPropagation = vi.fn();
    const preventDefault = vi.fn();
    const handler = vi.fn();
    const guarded = withModifiers(handler, ['stop', 'prevent']);

    guarded({
      stopPropagation,
      preventDefault,
      target: {},
      currentTarget: {},
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
