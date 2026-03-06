/**
 * Template Transform
 *
 * Transforms Vue template elements for Lynx compatibility.
 * - Validates element names
 * - Transforms event names
 * - Warns about unsupported elements
 */

export interface TemplateTransformOptions {
  /** Additional custom element names */
  customElements?: string[];
  /** Whether to show warnings */
  showWarnings?: boolean;
}

/** All known Lynx built-in elements */
const LYNX_BUILT_IN_ELEMENTS = new Set([
  'view',
  'text',
  'image',
  'scroll-view',
  'list',
  'list-item',
  'swiper',
  'swiper-item',
  'input',
  'textarea',
  'canvas',
  'video',
  'raw-text',
  'inline-truncation',
]);

/** HTML elements that should be mapped to Lynx elements */
const HTML_TO_LYNX_MAP: Record<string, string> = {
  div: 'view',
  span: 'text',
  p: 'text',
  img: 'image',
  ul: 'list',
  ol: 'list',
  li: 'list-item',
  button: 'view',
  a: 'view',
  h1: 'text',
  h2: 'text',
  h3: 'text',
  h4: 'text',
  h5: 'text',
  h6: 'text',
  section: 'view',
  article: 'view',
  nav: 'view',
  header: 'view',
  footer: 'view',
  main: 'view',
  aside: 'view',
  label: 'text',
};

/**
 * Check if a tag is a valid Lynx element.
 */
export function isValidLynxElement(tag: string, customElements?: string[]): boolean {
  if (LYNX_BUILT_IN_ELEMENTS.has(tag)) return true;
  if (customElements?.includes(tag)) return true;
  return false;
}

/**
 * Get the Lynx equivalent for an HTML element.
 */
export function mapHTMLToLynx(tag: string): string | null {
  return HTML_TO_LYNX_MAP[tag] || null;
}

/**
 * Transform template source for Lynx compatibility.
 * This is a simple text-level transform; for full AST-level transforms,
 * use Vue's compiler plugin API.
 */
export function transformTemplate(
  source: string,
  options: TemplateTransformOptions = {}
): { code: string; warnings: string[] } {
  const { customElements = [], showWarnings = true } = options;
  const warnings: string[] = [];

  let result = source;

  // Replace HTML tags with Lynx equivalents
  for (const [htmlTag, lynxTag] of Object.entries(HTML_TO_LYNX_MAP)) {
    const openingRegex = new RegExp(`<${htmlTag}(\\s|>|\\/)`, 'g');
    const closingRegex = new RegExp(`</${htmlTag}>`, 'g');

    if (openingRegex.test(result)) {
      if (showWarnings) {
        warnings.push(
          `[vue-lynx] HTML element <${htmlTag}> is mapped to <${lynxTag}>. ` +
            `Consider using <${lynxTag}> directly.`
        );
      }
      result = result.replace(openingRegex, `<${lynxTag}$1`);
      result = result.replace(closingRegex, `</${lynxTag}>`);
    }
  }

  return { code: result, warnings };
}
