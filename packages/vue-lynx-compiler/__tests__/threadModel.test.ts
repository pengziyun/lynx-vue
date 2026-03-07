import { describe, expect, it } from 'vitest';
import {
  MAIN_THREAD_ENTRY_SUFFIX,
  createDualThreadEntries,
  getBackgroundEntryName,
  getMainThreadEntryName,
  getThreadEntryPairs,
  isMainThreadEntryName,
  normalizeSourceEntries,
} from '../src/threadModel';

describe('threadModel', () => {
  it('normalizes string entries to a main entry map', () => {
    expect(normalizeSourceEntries('./src/main.ts')).toEqual({
      main: './src/main.ts',
    });
  });

  it('creates dual thread entries from string and object entries', () => {
    expect(createDualThreadEntries('./src/main.ts', {
      background: '@pgg/vue-lynx/internal/thread-background',
      mainThread: '@pgg/vue-lynx/internal/thread-main',
    })).toEqual({
      main: {
        import: ['@pgg/vue-lynx/internal/thread-background', './src/main.ts'],
      },
      [`main${MAIN_THREAD_ENTRY_SUFFIX}`]: {
        import: ['@pgg/vue-lynx/internal/thread-main', './src/main.ts'],
      },
    });

    expect(createDualThreadEntries({
      feed: {
        import: ['./src/feed.ts'],
        filename: 'feed.js',
      },
    }, {
      background: 'background-prelude',
      mainThread: 'main-prelude',
    })).toEqual({
      feed: {
        import: ['background-prelude', './src/feed.ts'],
        filename: 'feed.js',
      },
      [`feed${MAIN_THREAD_ENTRY_SUFFIX}`]: {
        import: ['main-prelude', './src/feed.ts'],
        filename: 'feed.js',
      },
    });
  });

  it('detects and strips main-thread entry names', () => {
    expect(isMainThreadEntryName(`demo${MAIN_THREAD_ENTRY_SUFFIX}`)).toBe(true);
    expect(isMainThreadEntryName('demo')).toBe(false);
    expect(getMainThreadEntryName('demo')).toBe(`demo${MAIN_THREAD_ENTRY_SUFFIX}`);
    expect(getBackgroundEntryName(`demo${MAIN_THREAD_ENTRY_SUFFIX}`)).toBe('demo');
  });

  it('builds template entry pairs from entry names', () => {
    expect(getThreadEntryPairs(['main', `main${MAIN_THREAD_ENTRY_SUFFIX}`, 'profile', `profile${MAIN_THREAD_ENTRY_SUFFIX}`]))
      .toEqual([
        {
          backgroundName: 'main',
          mainThreadName: `main${MAIN_THREAD_ENTRY_SUFFIX}`,
        },
        {
          backgroundName: 'profile',
          mainThreadName: `profile${MAIN_THREAD_ENTRY_SUFFIX}`,
        },
      ]);
  });
});
