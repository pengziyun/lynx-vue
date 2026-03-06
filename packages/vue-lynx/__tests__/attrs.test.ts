/**
 * Tests for Attributes Module
 */

import { describe, it, expect } from 'vitest';
import { normalizeClass } from '../src/modules/attrs';

describe('attrs module', () => {
  describe('normalizeClass', () => {
    it('should handle string class', () => {
      expect(normalizeClass('foo bar')).toBe('foo bar');
    });

    it('should handle object class', () => {
      expect(normalizeClass({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('should handle array class', () => {
      expect(normalizeClass(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle mixed array class', () => {
      expect(normalizeClass(['foo', { bar: true, baz: false }])).toBe('foo bar');
    });

    it('should handle null/undefined', () => {
      expect(normalizeClass(null)).toBe('');
      expect(normalizeClass(undefined)).toBe('');
    });

    it('should handle empty object', () => {
      expect(normalizeClass({})).toBe('');
    });

    it('should handle empty array', () => {
      expect(normalizeClass([])).toBe('');
    });

    it('should handle nested arrays', () => {
      // Note: nested arrays are flattened through recursive normalization
      expect(normalizeClass(['foo', ['bar', { baz: true }]] as any)).toBe('foo bar baz');
    });
  });
});
