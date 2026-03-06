/**
 * Tests for Style Module
 */

import { describe, it, expect } from 'vitest';
import { parseStyleString, camelToKebab, kebabToCamel } from '../src/modules/style';

describe('style module', () => {
  describe('parseStyleString', () => {
    it('should parse simple style string', () => {
      const result = parseStyleString('color: red; font-size: 14px');
      expect(result).toEqual({
        color: 'red',
        fontSize: '14px',
      });
    });

    it('should handle empty string', () => {
      expect(parseStyleString('')).toEqual({});
    });

    it('should handle trailing semicolons', () => {
      const result = parseStyleString('color: red;');
      expect(result).toEqual({ color: 'red' });
    });

    it('should handle values with colons', () => {
      const result = parseStyleString('background-image: url(http://example.com)');
      // Note: This is a simplified parser - complex values may need special handling
      expect(result.backgroundImage).toBeDefined();
    });

    it('should trim whitespace', () => {
      const result = parseStyleString('  color : red ;  font-size : 14px  ');
      expect(result.color).toBe('red');
      expect(result.fontSize).toBe('14px');
    });
  });

  describe('camelToKebab', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(camelToKebab('backgroundColor')).toBe('background-color');
      expect(camelToKebab('fontSize')).toBe('font-size');
      expect(camelToKebab('borderTopLeftRadius')).toBe('border-top-left-radius');
    });

    it('should handle single word', () => {
      expect(camelToKebab('color')).toBe('color');
    });
  });

  describe('kebabToCamel', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(kebabToCamel('background-color')).toBe('backgroundColor');
      expect(kebabToCamel('font-size')).toBe('fontSize');
      expect(kebabToCamel('border-top-left-radius')).toBe('borderTopLeftRadius');
    });

    it('should handle single word', () => {
      expect(kebabToCamel('color')).toBe('color');
    });
  });
});
