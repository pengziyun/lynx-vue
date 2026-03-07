import { describe, expect, it } from 'vitest';
import {
  MAIN_THREAD_ENTRY_SUFFIX,
  createDualThreadEntries,
  getThreadEntryPairs,
} from '@pgg/vue-lynx-compiler';

describe('pluginVueLynx dual-thread entry model', () => {
  it('derives background and main-thread entries from a single app entry', () => {
    const entries = createDualThreadEntries('./src/main.ts', {
      background: '@pgg/vue-lynx/internal/thread-background',
      mainThread: '@pgg/vue-lynx/internal/thread-main',
    });

    expect(Object.keys(entries)).toEqual(['main', `main${MAIN_THREAD_ENTRY_SUFFIX}`]);
    expect(entries[`main${MAIN_THREAD_ENTRY_SUFFIX}`]).toEqual({
      import: ['@pgg/vue-lynx/internal/thread-main', './src/main.ts'],
    });
  });

  it('maps entry names to a single template pair', () => {
    expect(getThreadEntryPairs(['main', `main${MAIN_THREAD_ENTRY_SUFFIX}`])).toEqual([
      {
        backgroundName: 'main',
        mainThreadName: `main${MAIN_THREAD_ENTRY_SUFFIX}`,
      },
    ]);
  });
});
