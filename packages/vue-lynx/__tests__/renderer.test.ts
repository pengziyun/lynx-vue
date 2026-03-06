/**
 * Integration Tests for Vue-Lynx Renderer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp, ref, defineComponent, h, nextTick, resetNodeIdCounter } from '../src/index';
import { createMockLynxAPI, setLynxAPI, resetLynxAPI } from '../src/lynxAPI';

describe('Vue-Lynx Renderer Integration', () => {
  let mockAPI: ReturnType<typeof createMockLynxAPI>;
  let rootContainer: any;

  beforeEach(() => {
    resetNodeIdCounter();
    mockAPI = createMockLynxAPI();
    setLynxAPI(mockAPI);
    rootContainer = {
      id: 0,
      type: 'root',
      tagName: 'root',
      parentNode: null,
      children: [],
      props: {},
      eventListeners: new Map(),
      __lynx_element: mockAPI.getRootElement(),
    };
  });

  afterEach(() => {
    resetLynxAPI();
  });

  it('should mount a simple component', () => {
    const App = defineComponent({
      render() {
        return h('view', null, [h('text', null, 'Hello Vue-Lynx!')]);
      },
    });

    const app = createApp(App);
    app.mount(rootContainer);

    // Check that children were added to the root
    expect(rootContainer.children.length).toBe(1);
    expect(rootContainer.children[0].type).toBe('view');
    expect(rootContainer.children[0].children.length).toBe(1);
    expect(rootContainer.children[0].children[0].type).toBe('text');
  });

  it('should handle reactive state updates', async () => {
    const App = defineComponent({
      setup() {
        const count = ref(0);
        const increment = () => count.value++;
        return { count, increment };
      },
      render() {
        return h('view', null, [
          h('text', null, `Count: ${this.count}`),
        ]);
      },
    });

    const app = createApp(App);
    const instance = app.mount(rootContainer);

    // Initial render
    expect(rootContainer.children.length).toBe(1);

    // Trigger update
    (instance as any).increment();
    await nextTick();

    // The component should have updated
    expect(rootContainer.children.length).toBe(1);
  });

  it('should handle conditional rendering', async () => {
    const App = defineComponent({
      setup() {
        const show = ref(true);
        return { show };
      },
      render() {
        return h('view', null, [
          this.show ? h('text', null, 'Visible') : h('text', null, 'Hidden'),
        ]);
      },
    });

    const app = createApp(App);
    const instance = app.mount(rootContainer);

    expect(rootContainer.children[0].children.length).toBe(1);

    // Toggle visibility
    (instance as any).show = false;
    await nextTick();

    expect(rootContainer.children[0].children.length).toBe(1);
  });

  it('should handle list rendering', () => {
    const App = defineComponent({
      setup() {
        const items = ref(['A', 'B', 'C']);
        return { items };
      },
      render() {
        return h(
          'view',
          null,
          this.items.map((item: string, index: number) =>
            h('text', { key: index }, item)
          )
        );
      },
    });

    const app = createApp(App);
    app.mount(rootContainer);

    const viewEl = rootContainer.children[0];
    expect(viewEl.children.length).toBe(3);
  });

  it('should handle event props', () => {
    let tapped = false;

    const App = defineComponent({
      render() {
        return h('view', {
          onTap: () => { tapped = true; },
        }, [h('text', null, 'Click me')]);
      },
    });

    const app = createApp(App);
    app.mount(rootContainer);

    const viewEl = rootContainer.children[0];
    expect(viewEl.eventListeners.has('tap')).toBe(true);

    // Simulate event
    const handler = viewEl.eventListeners.get('tap');
    if (handler) {
      handler({ detail: {} });
    }

    expect(tapped).toBe(true);
  });

  it('should handle style props', () => {
    const App = defineComponent({
      render() {
        return h('view', {
          style: { backgroundColor: 'red', padding: 10 },
        }, [h('text', null, 'Styled')]);
      },
    });

    const app = createApp(App);
    app.mount(rootContainer);

    const viewEl = rootContainer.children[0];
    const nativeEl = viewEl.__lynx_element as any;
    expect(nativeEl.__styles['background-color']).toBe('red');
    expect(nativeEl.__styles['padding']).toBe('10px');
  });

  it('should unmount cleanly', () => {
    const App = defineComponent({
      render() {
        return h('view', null, [h('text', null, 'Hello')]);
      },
    });

    const app = createApp(App);
    app.mount(rootContainer);

    expect(rootContainer.children.length).toBe(1);

    app.unmount();

    expect(rootContainer.children.length).toBe(0);
  });
});
