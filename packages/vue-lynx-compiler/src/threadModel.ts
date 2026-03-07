export const MAIN_THREAD_ENTRY_SUFFIX = '__main-thread';

export interface SourceEntryDescriptor {
  [key: string]: unknown;
  import?: string | string[];
}

export type SourceEntryItem = string | string[] | SourceEntryDescriptor;
export type SourceEntryRecord = Record<string, SourceEntryItem>;

export interface DualThreadPrelude {
  background: string;
  mainThread: string;
}

export interface ThreadEntryPair {
  backgroundName: string;
  mainThreadName: string;
}

export function isMainThreadEntryName(entryName: string) {
  return entryName.endsWith(MAIN_THREAD_ENTRY_SUFFIX);
}

export function getMainThreadEntryName(entryName: string) {
  return isMainThreadEntryName(entryName) ? entryName : `${entryName}${MAIN_THREAD_ENTRY_SUFFIX}`;
}

export function getBackgroundEntryName(entryName: string) {
  return isMainThreadEntryName(entryName)
    ? entryName.slice(0, -MAIN_THREAD_ENTRY_SUFFIX.length)
    : entryName;
}

export function normalizeSourceEntries(sourceEntry: unknown): SourceEntryRecord {
  if (typeof sourceEntry === 'string' || Array.isArray(sourceEntry)) {
    return {
      main: sourceEntry,
    };
  }

  if (sourceEntry && typeof sourceEntry === 'object') {
    return Object.fromEntries(
      Object.entries(sourceEntry as Record<string, unknown>).filter(([, value]) => value != null),
    ) as SourceEntryRecord;
  }

  return {
    main: './src/main.ts',
  };
}

export function createDualThreadEntries(sourceEntry: unknown, prelude: DualThreadPrelude): SourceEntryRecord {
  const normalizedEntries = normalizeSourceEntries(sourceEntry);
  const dualEntries: SourceEntryRecord = {};

  Object.entries(normalizedEntries)
    .filter(([entryName]) => !isMainThreadEntryName(entryName))
    .forEach(([entryName, entryValue]) => {
      dualEntries[entryName] = prependPrelude(entryValue, prelude.background);
      dualEntries[getMainThreadEntryName(entryName)] = prependPrelude(entryValue, prelude.mainThread);
    });

  return dualEntries;
}

export function getThreadEntryPairs(entryNames: string[]): ThreadEntryPair[] {
  return entryNames
    .filter((entryName) => !isMainThreadEntryName(entryName))
    .map((entryName) => ({
      backgroundName: entryName,
      mainThreadName: getMainThreadEntryName(entryName),
    }));
}

function prependPrelude(entryValue: SourceEntryItem, preludeImport: string): SourceEntryDescriptor {
  if (typeof entryValue === 'string') {
    return {
      import: [preludeImport, entryValue],
    };
  }

  if (Array.isArray(entryValue)) {
    return {
      import: [preludeImport, ...entryValue],
    };
  }

  const importList = entryValue.import == null
    ? []
    : Array.isArray(entryValue.import)
      ? entryValue.import
      : [entryValue.import];

  return {
    ...entryValue,
    import: [preludeImport, ...importList],
  };
}
