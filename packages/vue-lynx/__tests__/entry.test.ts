import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from '@pgg/vue-lynx';
import { defineLynxEntry, useLynxData } from '../src/entry';
import { VUE_LYNX_THREAD_MODE_KEY } from '../src/internal/thread-mode';
import { resetLynxAPI } from '../src/lynxAPI';

interface FakeNativeElement {
  __attrs: Record<string, unknown>;
  __children: FakeNativeElement[];
  __events: Record<string, unknown>;
  __parent: FakeNativeElement | null;
  __styles: Record<string, unknown>;
  __tag: string;
}

describe('defineLynxEntry', () => {
  let flushElementTree: ReturnType<typeof vi.fn>;
  let pageElement: FakeNativeElement | undefined;
  let originalGlobals: Record<string, unknown>;

  beforeEach(() => {
    resetLynxAPI();
    flushElementTree = vi.fn();
    pageElement = undefined;

    originalGlobals = {
      __AddEvent: (globalThis as any).__AddEvent,
      __AddInlineStyle: (globalThis as any).__AddInlineStyle,
      __AppendElement: (globalThis as any).__AppendElement,
      __CreateElement: (globalThis as any).__CreateElement,
      __CreatePage: (globalThis as any).__CreatePage,
      __CreateRawText: (globalThis as any).__CreateRawText,
      __CreateScrollView: (globalThis as any).__CreateScrollView,
      __CreateText: (globalThis as any).__CreateText,
      __CreateView: (globalThis as any).__CreateView,
      __FlushElementTree: (globalThis as any).__FlushElementTree,
      __GetPageElement: (globalThis as any).__GetPageElement,
      __InsertElementBefore: (globalThis as any).__InsertElementBefore,
      __RemoveElement: (globalThis as any).__RemoveElement,
      __SetAttribute: (globalThis as any).__SetAttribute,
      __VUE_LYNX_BOOTSTRAP__: (globalThis as any).__VUE_LYNX_BOOTSTRAP__,
      getPageData: (globalThis as any).getPageData,
      lynx: (globalThis as any).lynx,
      processData: (globalThis as any).processData,
      removeComponents: (globalThis as any).removeComponents,
      renderPage: (globalThis as any).renderPage,
      updatePage: (globalThis as any).updatePage,
      __VUE_LYNX_ENTRY__: (globalThis as any).__VUE_LYNX_ENTRY__,
      [VUE_LYNX_THREAD_MODE_KEY]: (globalThis as any)[VUE_LYNX_THREAD_MODE_KEY],
    };

    const createNode = (tag: string): FakeNativeElement => ({
      __attrs: {},
      __children: [],
      __events: {},
      __parent: null,
      __styles: {},
      __tag: tag,
    });

    const createElement = (tag: string) => createNode(tag);

    (globalThis as any).__CreatePage = () => {
      pageElement ||= createNode('page');
      return pageElement;
    };
    (globalThis as any).__GetPageElement = () => pageElement;
    (globalThis as any).__CreateView = () => createElement('view');
    (globalThis as any).__CreateText = () => createElement('text');
    (globalThis as any).__CreateScrollView = () => createElement('scroll-view');
    (globalThis as any).__CreateElement = (tag: string) => createElement(tag);
    (globalThis as any).__CreateRawText = (text: string) => {
      const rawText = createElement('raw-text');
      rawText.__attrs.text = text;
      return rawText;
    };
    (globalThis as any).__AppendElement = (parent: FakeNativeElement, child: FakeNativeElement) => {
      parent.__children.push(child);
      child.__parent = parent;
    };
    (globalThis as any).__RemoveElement = (parent: FakeNativeElement, child: FakeNativeElement) => {
      const index = parent.__children.indexOf(child);
      if (index >= 0) {
        parent.__children.splice(index, 1);
      }
      child.__parent = null;
    };
    (globalThis as any).__InsertElementBefore = (
      parent: FakeNativeElement,
      child: FakeNativeElement,
      anchor?: FakeNativeElement,
    ) => {
      if (!anchor) {
        parent.__children.push(child);
      } else {
        const index = parent.__children.indexOf(anchor);
        if (index >= 0) {
          parent.__children.splice(index, 0, child);
        } else {
          parent.__children.push(child);
        }
      }
      child.__parent = parent;
    };
    (globalThis as any).__SetAttribute = (element: FakeNativeElement, key: string, value: unknown) => {
      if (value == null) {
        delete element.__attrs[key];
        return;
      }
      element.__attrs[key] = value;
    };
    (globalThis as any).__AddInlineStyle = (element: FakeNativeElement, key: string, value: unknown) => {
      if (value == null) {
        delete element.__styles[key];
        return;
      }
      element.__styles[key] = value;
    };
    (globalThis as any).__AddEvent = (
      element: FakeNativeElement,
      _eventType: string,
      eventName: string,
      handler?: unknown,
    ) => {
      if (handler == null) {
        delete element.__events[eventName];
        return;
      }
      element.__events[eventName] = handler;
    };
    (globalThis as any).__FlushElementTree = flushElementTree;
    (globalThis as any).lynx = {};
  });

  afterEach(() => {
    resetLynxAPI();
    Function(`
      processData = undefined;
      renderPage = undefined;
      updatePage = undefined;
      getPageData = undefined;
      removeComponents = undefined;
    `)();

    Object.entries(originalGlobals).forEach(([key, value]) => {
      if (value === undefined) {
        delete (globalThis as any)[key];
        return;
      }
      (globalThis as any)[key] = value;
    });
  });

  it('registers main-thread lifecycle functions and renders the page', () => {
    const App = defineComponent({
      setup() {
        const data = useLynxData<{ title?: string }>();
        return () => h('view', [
          h('text', data.value.title ?? 'fallback'),
        ]);
      },
    });

    defineLynxEntry(App, {
      autoMount: false,
      defaultDataProcessor: (data) => ({
        title: (data as { title?: string } | undefined)?.title ?? 'fallback',
      }),
    });

    expect(typeof (globalThis as any).lynx?.registerDataProcessors).toBe('function');
    expect(typeof (globalThis as any).processData).toBe('function');
    expect(typeof (globalThis as any).renderPage).toBe('function');
    expect(typeof (globalThis as any).updatePage).toBe('function');
    expect(Function('return typeof processData')()).toBe('function');
    expect(Function('return typeof renderPage')()).toBe('function');

    (globalThis as any).renderPage({ title: 'Explorer Ready' });

    const page = (globalThis as any).__GetPageElement() as FakeNativeElement;
    expect(page.__children).toHaveLength(1);
    expect(page.__children[0].__tag).toBe('view');
    expect(page.__children[0].__children[0].__tag).toBe('text');
    expect(page.__children[0].__children[0].__attrs.text).toBe('Explorer Ready');
    expect(flushElementTree).toHaveBeenCalledWith(page, {});
    expect((globalThis as any).getPageData()).toEqual({ title: 'Explorer Ready' });
  });

  it('updates injected page data on updatePage', async () => {
    const App = defineComponent({
      setup() {
        const data = useLynxData<{ title?: string }>();
        return () => h('view', [
          h('text', data.value.title ?? 'fallback'),
        ]);
      },
    });

    defineLynxEntry(App, { autoMount: false });

    (globalThis as any).renderPage({ title: 'Before' });
    (globalThis as any).updatePage({ title: 'After' }, { triggerDataUpdated: true });

    await nextTick();

    const page = (globalThis as any).__GetPageElement() as FakeNativeElement;
    expect(page.__children[0].__children[0].__attrs.text).toBe('After');
    expect(flushElementTree).toHaveBeenLastCalledWith(page, { triggerDataUpdated: true });
  });

  it('does not expose main-thread lifecycle functions in background mode', () => {
    (globalThis as any)[VUE_LYNX_THREAD_MODE_KEY] = 'background';

    const App = defineComponent({
      setup() {
        const data = useLynxData<{ title?: string }>();
        return () => h('view', [
          h('text', data.value.title ?? 'background'),
        ]);
      },
    });

    const entry = defineLynxEntry(App, { autoMount: false });

    expect((globalThis as any).processData).toBeUndefined();
    expect((globalThis as any).renderPage).toBeUndefined();
    expect((globalThis as any).updatePage).toBeUndefined();
    expect(Function('return typeof processData')()).toBe('undefined');
    expect(Function('return typeof renderPage')()).toBe('undefined');
    expect((globalThis as any).__VUE_LYNX_ENTRY__).toMatchObject({
      component: App,
      threadMode: 'background',
    });
    expect(entry.threadMode).toBe('background');
  });

  it('keeps main-thread lifecycle functions intact after a background entry registers', () => {
    const MainApp = defineComponent({
      setup() {
        const data = useLynxData<{ title?: string }>();
        return () => h('view', [
          h('text', data.value.title ?? 'main'),
        ]);
      },
    });

    defineLynxEntry(MainApp, { autoMount: false });

    const mainThreadProcessData = (globalThis as any).processData;
    const mainThreadRenderPage = (globalThis as any).renderPage;
    const mainThreadUpdatePage = (globalThis as any).updatePage;

    (globalThis as any)[VUE_LYNX_THREAD_MODE_KEY] = 'background';

    const BackgroundApp = defineComponent({
      setup() {
        return () => h('view', [
          h('text', 'background'),
        ]);
      },
    });

    defineLynxEntry(BackgroundApp, { autoMount: false });

    expect((globalThis as any).processData).toBe(mainThreadProcessData);
    expect((globalThis as any).renderPage).toBe(mainThreadRenderPage);
    expect((globalThis as any).updatePage).toBe(mainThreadUpdatePage);
    expect(Function('return typeof processData')()).toBe('function');
    expect(Function('return typeof renderPage')()).toBe('function');
  });
});
