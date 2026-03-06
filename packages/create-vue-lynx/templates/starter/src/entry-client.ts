import { installHydrationPlatform, mountWebApp } from '@pgg/vue-lynx/ssr';
import App from './App.vue';

installHydrationPlatform();
mountWebApp(App, '#app');
