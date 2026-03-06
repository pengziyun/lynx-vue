import type { Directive } from 'vue';

export const vAutofocus: Directive = {
  mounted(el) {
    if (el && typeof (el as { focus?: () => void }).focus === 'function') {
      (el as { focus: () => void }).focus();
    }
  },
};
