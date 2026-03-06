import { createWebApp, installWebPlatform } from '@pgg/vue-lynx/web';
import AppWeb from './AppWeb.vue';

installWebPlatform();
createWebApp(AppWeb).mount('#app');
