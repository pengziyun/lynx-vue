/**
 * Thread Code Splitting
 *
 * Lynx uses a dual-thread model where:
 * - Background Thread: runs the main application logic (Vue components)
 * - Main Thread: handles UI rendering and can run "Main Thread Script" (MTS)
 *   for immediate UI interactions
 *
 * This module identifies and splits code marked for main thread execution.
 */

export interface ThreadSplitResult {
  /** Code to run on the background thread (default) */
  backgroundCode: string;
  /** Code to run on the main thread (MTS) */
  mainThreadCode: string | null;
}

/**
 * Marker comment that indicates main thread script code.
 *
 * Usage in Vue SFC:
 * ```vue
 * <script>
 * // @main-thread
 * export function handleGesture(event) {
 *   // This runs on the main thread for immediate response
 * }
 * </script>
 * ```
 */
const MTS_MARKER = '@main-thread';
const MTS_MARKER_REGEX = /\/[/*]\s*@main-thread\b/;

/**
 * Check if source code contains main thread script markers.
 */
export function hasMTSMarker(code: string): boolean {
  return MTS_MARKER_REGEX.test(code);
}

/**
 * Split code into background thread and main thread portions.
 *
 * This is a simplified implementation. In production, this would:
 * 1. Parse the AST
 * 2. Extract @main-thread annotated functions/blocks
 * 3. Generate communication bridge code between threads
 */
export function splitThreadCode(code: string): ThreadSplitResult {
  if (!hasMTSMarker(code)) {
    return {
      backgroundCode: code,
      mainThreadCode: null,
    };
  }

  const lines = code.split('\n');
  const backgroundLines: string[] = [];
  const mainThreadLines: string[] = [];

  let isMainThread = false;
  let braceDepth = 0;
  let mtsStartBraceDepth = 0;

  for (const line of lines) {
    if (MTS_MARKER_REGEX.test(line)) {
      isMainThread = true;
      mtsStartBraceDepth = braceDepth;
      mainThreadLines.push(line.replace(MTS_MARKER_REGEX, '// [MTS]'));
      continue;
    }

    // Simple brace tracking (not fully accurate without proper AST parsing)
    for (const char of line) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
    }

    if (isMainThread) {
      mainThreadLines.push(line);
      // Exit main thread block when we return to the starting brace depth
      if (braceDepth <= mtsStartBraceDepth) {
        isMainThread = false;
      }
    } else {
      backgroundLines.push(line);
    }
  }

  return {
    backgroundCode: backgroundLines.join('\n'),
    mainThreadCode: mainThreadLines.length > 0 ? mainThreadLines.join('\n') : null,
  };
}
