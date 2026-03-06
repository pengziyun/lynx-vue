import { createSSRApp } from '@pgg/vue-lynx/ssr';
import { installHydrationPlatform } from '@pgg/vue-lynx/ssr';
import AppWeb from './AppWeb.vue';

installHydrationPlatform();
createSSRApp(AppWeb).mount('#app');
