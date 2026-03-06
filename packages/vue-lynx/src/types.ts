/**
 * Vue-Lynx Type Definitions
 *
 * Core types for the Vue-Lynx rendering layer.
 */

// ============================================================
// Lynx Global API Types (provided by Lynx runtime)
// ============================================================

/**
 * Lynx native element reference.
 * This is an opaque handle to a native Lynx element managed by the engine.
 */
export type LynxNativeElement = unknown;

/**
 * Lynx global API interface.
 * These methods are provided by the Lynx JavaScript runtime environment.
 */
export interface LynxGlobalAPI {
  // Element creation
  createElement(type: string): LynxNativeElement;
  createTextNode(text: string): LynxNativeElement;

  // Tree operations
  appendChild(parent: LynxNativeElement, child: LynxNativeElement): void;
  removeChild(parent: LynxNativeElement, child: LynxNativeElement): void;
  insertBefore(
    parent: LynxNativeElement,
    child: LynxNativeElement,
    anchor: LynxNativeElement
  ): void;

  // Properties
  setAttribute(element: LynxNativeElement, key: string, value: any): void;
  removeAttribute(element: LynxNativeElement, key: string): void;
  setProperty(element: LynxNativeElement, key: string, value: any): void;

  // Text
  setTextContent(element: LynxNativeElement, text: string): void;

  // Style
  setStyleProperty(element: LynxNativeElement, key: string, value: string): void;
  removeStyleProperty(element: LynxNativeElement, key: string): void;

  // Events
  addEventListener(
    element: LynxNativeElement,
    event: string,
    handler: Function
  ): void;
  removeEventListener(
    element: LynxNativeElement,
    event: string,
    handler: Function
  ): void;

  // Root element
  getRootElement(): LynxNativeElement;

  // Navigation
  navigateTo(options: { url: string; params?: Record<string, any> }): void;
  navigateBack(options?: { delta?: number }): void;
  redirectTo(options: { url: string; params?: Record<string, any> }): void;

  // Lifecycle hooks
  onPageShow(callback: () => void): () => void;
  onPageHide(callback: () => void): () => void;
  onPageScroll(callback: (info: { scrollTop: number }) => void): () => void;
}

// ============================================================
// Vue-Lynx Node Types
// ============================================================

/** Supported Lynx built-in element types */
export type LynxElementType =
  | 'view'
  | 'text'
  | 'image'
  | 'scroll-view'
  | 'list'
  | 'list-item'
  | 'swiper'
  | 'swiper-item'
  | 'input'
  | 'textarea'
  | 'canvas'
  | 'video'
  | 'raw-text'
  | 'inline-truncation'
  | string; // Allow custom elements

/** Base node in the Vue-Lynx virtual tree */
export interface LynxNode {
  /** Unique node ID */
  id: number;
  /** Node type identifier */
  type: string;
  /** Reference to parent node */
  parentNode: LynxNode | null;
  /** Child nodes */
  children: LynxNode[];
  /** Node properties/attributes */
  props: Record<string, any>;
  /** Text content (for text nodes) */
  text?: string;
  /** Event listeners map */
  eventListeners: Map<string, Function>;
  /** Reference to the underlying Lynx native element */
  __lynx_element?: LynxNativeElement;
}

/** An element node in the Vue-Lynx tree */
export interface LynxElement extends LynxNode {
  /** The element tag name (view, text, image, etc.) */
  tagName: string;
}

/** A text node in the Vue-Lynx tree */
export interface LynxTextNode extends LynxNode {
  type: '__text__';
  text: string;
}

/** A comment node (placeholder, Lynx doesn't support comments) */
export interface LynxCommentNode extends LynxNode {
  type: '__comment__';
  text: string;
}

// ============================================================
// Event Types
// ============================================================

/** Normalized event object from Lynx */
export interface LynxEvent {
  type: string;
  target: any;
  currentTarget: any;
  detail: any;
  touches?: any[];
  changedTouches?: any[];
  timestamp: number;
  preventDefault(): void;
  stopPropagation(): void;
  /** Raw Lynx event object */
  _raw: any;
}

/** Tap (click) event */
export interface LynxTapEvent extends LynxEvent {
  type: 'tap';
  detail: {
    x: number;
    y: number;
  };
}

/** Scroll event */
export interface LynxScrollEvent extends LynxEvent {
  type: 'scroll';
  detail: {
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
  };
}

/** Input event */
export interface LynxInputEvent extends LynxEvent {
  type: 'input';
  detail: {
    value: string;
  };
}

// ============================================================
// Style Types
// ============================================================

/** Subset of CSS properties supported by Lynx */
export interface LynxStyleProperties {
  // Layout
  display?: 'flex' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;

  // Box Model
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;

  // Border
  borderWidth?: number | string;
  borderTopWidth?: number | string;
  borderRightWidth?: number | string;
  borderBottomWidth?: number | string;
  borderLeftWidth?: number | string;
  borderColor?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number | string;
  borderTopLeftRadius?: number | string;
  borderTopRightRadius?: number | string;
  borderBottomLeftRadius?: number | string;
  borderBottomRightRadius?: number | string;

  // Position
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;

  // Visual
  backgroundColor?: string;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';

  // Text
  color?: string;
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  lineHeight?: number | string;
  letterSpacing?: number | string;
  numberOfLines?: number;

  // Transform
  transform?: string;
  transformOrigin?: string;

  // Shadow
  boxShadow?: string;

  // Allow additional string-keyed properties
  [key: string]: any;
}

// ============================================================
// Component Props Types
// ============================================================

/** Common props for all Lynx elements */
export interface LynxCommonProps {
  style?: LynxStyleProperties | string;
  class?: string | Record<string, boolean> | Array<string | Record<string, boolean>>;
  id?: string;

  // Common events
  onTap?: (event: LynxTapEvent) => void;
  onClick?: (event: LynxTapEvent) => void;
  onLongPress?: (event: LynxEvent) => void;
  onTouchStart?: (event: LynxEvent) => void;
  onTouchMove?: (event: LynxEvent) => void;
  onTouchEnd?: (event: LynxEvent) => void;
  onTouchCancel?: (event: LynxEvent) => void;
}

/** Props for <view> element */
export interface ViewProps extends LynxCommonProps {}

/** Props for <text> element */
export interface TextProps extends LynxCommonProps {
  numberOfLines?: number;
  selectable?: boolean;
}

/** Props for <image> element */
export interface ImageProps extends LynxCommonProps {
  src: string;
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix';
  onLoad?: (event: LynxEvent) => void;
  onError?: (event: LynxEvent) => void;
}

/** Props for <scroll-view> element */
export interface ScrollViewProps extends LynxCommonProps {
  scrollX?: boolean;
  scrollY?: boolean;
  scrollTop?: number;
  scrollLeft?: number;
  upperThreshold?: number;
  lowerThreshold?: number;
  onScroll?: (event: LynxScrollEvent) => void;
  onScrollToUpper?: (event: LynxEvent) => void;
  onScrollToLower?: (event: LynxEvent) => void;
}

/** Props for <input> element */
export interface InputProps extends LynxCommonProps {
  value?: string;
  type?: 'text' | 'number' | 'password' | 'tel' | 'email';
  placeholder?: string;
  placeholderStyle?: string;
  maxlength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onInput?: (event: LynxInputEvent) => void;
  onFocus?: (event: LynxEvent) => void;
  onBlur?: (event: LynxEvent) => void;
  onConfirm?: (event: LynxEvent) => void;
}

/** Props for <list> element */
export interface ListProps extends LynxCommonProps {
  scrollY?: boolean;
  onScroll?: (event: LynxScrollEvent) => void;
}

/** Props for <list-item> element */
export interface ListItemProps extends LynxCommonProps {
  itemKey?: string | number;
}
