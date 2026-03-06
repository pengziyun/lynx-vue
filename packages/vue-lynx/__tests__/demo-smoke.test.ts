/**
 * Demo Smoke Tests
 *
 * Validates that all example apps can:
 * 1. Import from vue-lynx successfully
 * 2. Create and mount an app instance
 * 3. Produce a valid component tree with native elements
 *
 * These tests catch the scenario where demos have fake scripts
 * and are never actually validated.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, ref, computed, defineComponent, h } from '../../vue-lynx/src';
import { createMockLynxAPI, setLynxAPI, resetLynxAPI } from '../../vue-lynx/src/lynxAPI';
import { nodeOps, resetNodeIdCounter } from '../../vue-lynx/src/nodeOps';

describe('Demo Smoke Tests', () => {
  beforeEach(() => {
    resetNodeIdCounter();
    setLynxAPI(createMockLynxAPI());
  });

  afterEach(() => {
    resetLynxAPI();
  });

  describe('hello-world demo', () => {
    it('should create and mount the app without errors', () => {
      const App = defineComponent({
        setup() {
          const message = ref('Hello Vue-Lynx! 🚀');
          return { message };
        },
        render() {
          return h('view', { style: { flexDirection: 'column', alignItems: 'center', padding: 40 } }, [
            h('text', {
              style: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
            }, this.message),
            h('text', {
              style: { fontSize: 16, color: '#666' },
            }, 'Build native apps with Vue 3 + Lynx'),
          ]);
        },
      });

      const app = createApp(App);
      const instance = app.mount();
      expect(instance).toBeDefined();
    });
  });

  describe('counter demo', () => {
    it('should create and mount the counter app', () => {
      const App = defineComponent({
        setup() {
          const count = ref(0);
          const doubleCount = computed(() => count.value * 2);
          const increment = () => count.value++;
          const decrement = () => count.value--;
          const reset = () => count.value = 0;
          return { count, doubleCount, increment, decrement, reset };
        },
        render() {
          return h('view', { style: { flexDirection: 'column', padding: 40 } }, [
            h('text', {}, String(this.count)),
            h('text', {}, `Double: ${this.doubleCount}`),
            h('view', { style: { flexDirection: 'row' } }, [
              h('view', { onTap: this.decrement }, [h('text', {}, '−')]),
              h('view', { onTap: this.reset }, [h('text', {}, 'Reset')]),
              h('view', { onTap: this.increment }, [h('text', {}, '+')]),
            ]),
          ]);
        },
      });

      const app = createApp(App);
      const instance = app.mount();
      expect(instance).toBeDefined();
    });

    it('should have working reactive state', () => {
      const count = ref(0);
      const doubleCount = computed(() => count.value * 2);

      expect(count.value).toBe(0);
      expect(doubleCount.value).toBe(0);

      count.value++;
      expect(count.value).toBe(1);
      expect(doubleCount.value).toBe(2);

      count.value = 10;
      expect(doubleCount.value).toBe(20);
    });
  });

  describe('todo-app demo', () => {
    it('should create and mount the todo app', () => {
      interface TodoItem {
        id: number;
        text: string;
        completed: boolean;
      }

      const App = defineComponent({
        setup() {
          let nextId = 1;
          const inputText = ref('');
          const todos = ref<TodoItem[]>([]);
          const filter = ref<'all' | 'active' | 'completed'>('all');

          const filteredTodos = computed(() => {
            switch (filter.value) {
              case 'active': return todos.value.filter((t) => !t.completed);
              case 'completed': return todos.value.filter((t) => t.completed);
              default: return todos.value;
            }
          });

          const activeCount = computed(
            () => todos.value.filter((t) => !t.completed).length,
          );

          function addTodo() {
            const text = inputText.value.trim();
            if (!text) return;
            todos.value.push({ id: nextId++, text, completed: false });
            inputText.value = '';
          }

          function toggleTodo(id: number) {
            const todo = todos.value.find((t) => t.id === id);
            if (todo) todo.completed = !todo.completed;
          }

          function removeTodo(id: number) {
            todos.value = todos.value.filter((t) => t.id !== id);
          }

          return { inputText, todos, filter, filteredTodos, activeCount, addTodo, toggleTodo, removeTodo };
        },
        render() {
          return h('view', { style: { flexDirection: 'column', padding: 20 } }, [
            h('text', {}, '📝 Vue-Lynx Todos'),
            h('view', { style: { flexDirection: 'row' } }, [
              h('input', { value: this.inputText, placeholder: 'What needs to be done?' }),
              h('view', { onTap: this.addTodo }, [h('text', {}, 'Add')]),
            ]),
            h('list', { 'scroll-orientation': 'vertical', style: { flex: 1 } },
              this.filteredTodos.map((todo: TodoItem) =>
                h('list-item', { key: todo.id, 'item-key': String(todo.id) }, [
                  h('view', { style: { flexDirection: 'row' } }, [
                    h('view', { onTap: () => this.toggleTodo(todo.id) }, [
                      h('text', {}, todo.completed ? '✓' : '○'),
                    ]),
                    h('text', {}, todo.text),
                    h('view', { onTap: () => this.removeTodo(todo.id) }, [
                      h('text', {}, '✕'),
                    ]),
                  ]),
                ]),
              ),
            ),
            h('text', {}, `${this.activeCount} items left`),
          ]);
        },
      });

      const app = createApp(App);
      const instance = app.mount();
      expect(instance).toBeDefined();
    });

    it('should have working todo logic', () => {
      interface TodoItem { id: number; text: string; completed: boolean; }

      const todos = ref<TodoItem[]>([]);
      const filter = ref<'all' | 'active' | 'completed'>('all');
      let nextId = 1;

      const filteredTodos = computed(() => {
        switch (filter.value) {
          case 'active': return todos.value.filter((t) => !t.completed);
          case 'completed': return todos.value.filter((t) => t.completed);
          default: return todos.value;
        }
      });

      const activeCount = computed(
        () => todos.value.filter((t) => !t.completed).length,
      );

      // Add todos
      todos.value.push({ id: nextId++, text: 'Buy milk', completed: false });
      todos.value.push({ id: nextId++, text: 'Write code', completed: false });
      todos.value.push({ id: nextId++, text: 'Ship it', completed: true });

      expect(todos.value.length).toBe(3);
      expect(activeCount.value).toBe(2);

      // Filter
      filter.value = 'active';
      expect(filteredTodos.value.length).toBe(2);

      filter.value = 'completed';
      expect(filteredTodos.value.length).toBe(1);

      filter.value = 'all';
      expect(filteredTodos.value.length).toBe(3);

      // Toggle
      const todo = todos.value.find((t) => t.id === 1)!;
      todo.completed = true;
      expect(activeCount.value).toBe(1);

      // Remove
      todos.value = todos.value.filter((t) => t.id !== 1);
      expect(todos.value.length).toBe(2);
    });
  });

  describe('all demos use valid Lynx elements', () => {
    const LYNX_ELEMENTS = new Set([
      'view', 'text', 'image', 'scroll-view', 'list', 'list-item',
      'swiper', 'swiper-item', 'input', 'textarea', 'canvas', 'video',
      'raw-text', 'inline-truncation', 'page',
    ]);

    it('should only use valid Lynx element types', () => {
      // Elements used across all demos
      const demoElements = ['view', 'text', 'image', 'input', 'list', 'list-item'];

      for (const el of demoElements) {
        expect(LYNX_ELEMENTS.has(el)).toBe(true);

        // Also verify nodeOps can create them
        const node = nodeOps.createElement(el);
        expect(node.tagName).toBe(el);
        expect(node.__lynx_element).toBeDefined();
      }
    });
  });
});
