/**
 * Vue-Lynx Compiler Extensions
 *
 * Provides CSS transformation, template transformation,
 * and thread splitting for Vue-Lynx builds.
 */

export { transformCSS, type CSSTransformOptions } from './cssTransform';
export { transformTemplate, type TemplateTransformOptions } from './templateTransform';
export { splitThreadCode, hasMTSMarker, type ThreadSplitResult } from './threadSplit';
