import { installMainThreadBootstrap } from './lynx-bootstrap';
import { setLynxThreadMode } from './thread-mode';

setLynxThreadMode('main-thread');
installMainThreadBootstrap();
