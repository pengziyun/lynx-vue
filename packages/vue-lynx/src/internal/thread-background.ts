import { installBackgroundBootstrap } from './lynx-bootstrap';
import { setLynxThreadMode } from './thread-mode';

setLynxThreadMode('background');
installBackgroundBootstrap();
