/**
 * CSS Transform
 *
 * Transforms CSS to be compatible with Lynx's style system.
 * - Filters unsupported properties
 * - Converts units (rpx support)
 * - Validates property values
 *
 * [CR-036 FIX] Removed Grid CSS properties from unsupported list.
 * Lynx 2.x supports CSS Grid (grid-template-columns, grid-template-rows, etc.)
 *
 * [CR-037 FIX] rpx conversion now uses consistent px-based formula:
 *   rpx → px = value / designWidth * 375
 * This matches the standard mini-program rpx specification.
 */

export interface CSSTransformOptions {
  /** Design width for rpx conversion (default: 750) */
  designWidth?: number;
  /** Target platform */
  platform?: 'android' | 'ios' | 'web';
  /** Whether to show warnings for unsupported properties */
  showWarnings?: boolean;
}

/**
 * CSS properties that are NOT supported by Lynx.
 *
 * NOTE: Grid layout IS supported in Lynx 2.x — do not add grid-* here.
 * See: https://lynxjs.org/guide/styling/layout
 */
const UNSUPPORTED_PROPERTIES = new Set([
  // Traditional layout modes not applicable in Lynx
  'float',
  'clear',

  // Multi-column layout (not supported)
  'column-count',
  'column-gap',
  'column-rule',

  // Table layout (not applicable — Lynx has no <table>)
  'table-layout',
  'caption-side',
  'empty-cells',

  // List styles (not applicable — Lynx has no <ul>/<ol>)
  'list-style',
  'list-style-type',
  'list-style-position',
  'list-style-image',

  // Desktop-specific interactions (not applicable on mobile)
  'cursor',
  'resize',
]);

/**
 * CSS properties that may have limited support — warn but don't remove.
 */
const LIMITED_SUPPORT_PROPERTIES = new Set([
  'user-select',
  'pointer-events',
  'appearance',
  'outline',
  'outline-width',
  'outline-style',
  'outline-color',
  'outline-offset',
]);

/**
 * Transform CSS source code for Lynx compatibility.
 */
export function transformCSS(
  source: string,
  options: CSSTransformOptions = {}
): { code: string; warnings: string[] } {
  const { designWidth = 750, showWarnings = true } = options;
  const warnings: string[] = [];

  let result = source;

  // Convert rpx units to px based on design width
  // Standard: 750rpx = screen width (375pt on iPhone)
  // Formula: px = rpx_value / designWidth * 375
  result = result.replace(/(\d+(?:\.\d+)?)rpx/g, (_match, value) => {
    const px = (parseFloat(value) / designWidth) * 375;
    return `${px.toFixed(2)}px`;
  });

  // Warn about unsupported properties
  if (showWarnings) {
    for (const prop of UNSUPPORTED_PROPERTIES) {
      const regex = new RegExp(`\\b${prop}\\s*:`, 'g');
      if (regex.test(result)) {
        warnings.push(
          `[vue-lynx] CSS property "${prop}" is not supported by Lynx and will be removed.`
        );
      }
    }

    for (const prop of LIMITED_SUPPORT_PROPERTIES) {
      const regex = new RegExp(`\\b${prop}\\s*:`, 'g');
      if (regex.test(result)) {
        warnings.push(
          `[vue-lynx] CSS property "${prop}" has limited support in Lynx.`
        );
      }
    }
  }

  // Remove only truly unsupported properties (not limited-support ones)
  for (const prop of UNSUPPORTED_PROPERTIES) {
    const regex = new RegExp(`\\s*${prop}\\s*:[^;]+;?`, 'g');
    result = result.replace(regex, '');
  }

  return { code: result, warnings };
}
