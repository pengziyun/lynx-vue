import {
  BaseTransition,
  Fragment,
  defineComponent,
  type Directive,
  type ObjectDirective,
} from '@vue/runtime-core';
import * as runtimeCore from '@vue/runtime-core';
import { createLynxApp } from './app';
import { getLynx } from './lynxAPI';
import type { LynxElement } from './types';

type ModelAssigner = ((value: unknown) => void) | Array<(value: unknown) => void>;
type NativeDirectiveElement = LynxElement & {
  __vModelTextListener__?: (event: unknown) => void;
  __vOriginalDisplay__?: string;
};

type NativeEventWithValue = {
  detail?: { value?: unknown };
  value?: unknown;
  target?: { value?: unknown };
  currentTarget?: { value?: unknown };
};

type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';
type ModifierGuard = (event: EventLike, modifiers: string[]) => boolean;

const modifierGuards: Record<string, ModifierGuard> = {
  stop: (event: EventLike) => {
    event.stopPropagation?.();
    return false;
  },
  prevent: (event: EventLike) => {
    event.preventDefault?.();
    return false;
  },
  self: (event: EventLike) => event.target !== event.currentTarget,
  ctrl: (event: EventLike) => !event.ctrlKey,
  shift: (event: EventLike) => !event.shiftKey,
  alt: (event: EventLike) => !event.altKey,
  meta: (event: EventLike) => !event.metaKey,
  left: (event: EventLike) => 'button' in event && event.button !== 0,
  middle: (event: EventLike) => 'button' in event && event.button !== 1,
  right: (event: EventLike) => 'button' in event && event.button !== 2,
  exact: (event: EventLike, modifiers: string[]) =>
    (['ctrl', 'shift', 'alt', 'meta'] as ModifierKey[]).some((modifier) => {
      const key = `${modifier}Key` as const;
      return Boolean(event[key]) && !modifiers.includes(modifier);
    }),
};

interface EventLike {
  altKey?: boolean;
  button?: number;
  ctrlKey?: boolean;
  currentTarget?: unknown;
  metaKey?: boolean;
  preventDefault?: () => void;
  shiftKey?: boolean;
  stopPropagation?: () => void;
  target?: unknown;
}

function resolveModelValue(event: NativeEventWithValue) {
  return event?.detail?.value ?? event?.value ?? event?.target?.value ?? event?.currentTarget?.value ?? '';
}

function callModelAssigner(assigner: ModelAssigner | null | undefined, value: unknown) {
  if (Array.isArray(assigner)) {
    assigner.forEach((entry) => entry(value));
    return;
  }

  assigner?.(value);
}

function syncModelValue(el: NativeDirectiveElement, value: unknown) {
  if (!el.__lynx_element) {
    el.props.value = value ?? '';
    return;
  }

  getLynx().setProperty(el.__lynx_element, 'value', value ?? '');
  el.props.value = value ?? '';
}

function updateDisplay(el: NativeDirectiveElement, visible: boolean) {
  if (!el.__lynx_element) {
    return;
  }

  const lynx = getLynx();
  if (visible) {
    if (el.__vOriginalDisplay__) {
      lynx.setStyleProperty(el.__lynx_element, 'display', el.__vOriginalDisplay__);
    } else {
      lynx.removeStyleProperty(el.__lynx_element, 'display');
    }
    return;
  }

  if (typeof el.__vOriginalDisplay__ === 'undefined') {
    const style = el.props.style;
    el.__vOriginalDisplay__ = style && typeof style === 'object' && !Array.isArray(style)
      ? String((style as Record<string, unknown>).display ?? '')
      : '';
  }

  lynx.setStyleProperty(el.__lynx_element, 'display', 'none');
}

export const createApp = createLynxApp;

export * from '@vue/runtime-core';

export const KeepAlive = runtimeCore.KeepAlive;
export const Suspense = runtimeCore.Suspense;
export const Teleport = runtimeCore.Teleport;
export const withDirectives = runtimeCore.withDirectives;
export const resolveDirective = runtimeCore.resolveDirective;

// Lynx does not have a DOM transition runtime; treat these as structural wrappers.
export const Transition = BaseTransition;
export const TransitionGroup = defineComponent({
  name: 'NativeTransitionGroup',
  setup(_props, { slots }) {
    return () => runtimeCore.h(Fragment, null, slots.default?.());
  },
});

export function withModifiers<T extends (...args: any[]) => any>(fn: T, modifiers: string[]): T {
  return ((event: EventLike, ...args: unknown[]) => {
    for (const modifier of modifiers) {
      const guard = modifierGuards[modifier];
      if (guard && guard(event, modifiers)) {
        return;
      }
    }

    return fn(event, ...args);
  }) as T;
}

export const vShow: ObjectDirective<NativeDirectiveElement, boolean> = {
  beforeMount(el, binding) {
    updateDisplay(el, binding.value);
  },
  updated(el, binding) {
    updateDisplay(el, binding.value);
  },
};

export const vModelText: ObjectDirective<NativeDirectiveElement, unknown> = {
  mounted(el, binding) {
    syncModelValue(el, binding.value);

    if (!el.__lynx_element || el.__vModelTextListener__) {
      return;
    }

    const listener = (event: unknown) => {
      callModelAssigner(el.props['onUpdate:modelValue'] as ModelAssigner | null | undefined, resolveModelValue(event as NativeEventWithValue));
    };

    el.__vModelTextListener__ = listener;
    getLynx().addEventListener(el.__lynx_element, 'input', listener);
  },
  beforeUpdate(el, binding) {
    syncModelValue(el, binding.value);
  },
  updated(el, binding) {
    syncModelValue(el, binding.value);
  },
  beforeUnmount(el) {
    if (!el.__lynx_element || !el.__vModelTextListener__) {
      return;
    }

    getLynx().removeEventListener(el.__lynx_element, 'input', el.__vModelTextListener__);
    delete el.__vModelTextListener__;
  },
};

export const vModelDynamic = vModelText as Directive;
export const vModelCheckbox = vModelText as Directive;
export const vModelRadio = vModelText as Directive;
export const vModelSelect = vModelText as Directive;
