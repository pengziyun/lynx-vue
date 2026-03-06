import { renderLynxToString } from '@pgg/vue-lynx/ssr';
import AppWeb from './AppWeb.vue';

export async function render() {
  return renderLynxToString(AppWeb);
}

export default render;
