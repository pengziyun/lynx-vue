import { renderLynxToString } from '@pgg/vue-lynx/ssr';
import App from './App.vue';

export function render() {
  return renderLynxToString(App);
}
