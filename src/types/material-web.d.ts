import type { DetailedHTMLProps, HTMLAttributes } from 'react';

// Material Web components are custom elements. React 19 sets any extra props as element
// properties (or attributes), so they only need to be declared as valid JSX tags here.
type MdElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  [prop: string]: unknown;
};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'md-circular-progress': MdElement;
      'md-dialog': MdElement;
      'md-divider': MdElement;
      'md-filled-button': MdElement;
      'md-filled-text-field': MdElement;
      'md-filled-tonal-button': MdElement;
      'md-icon': MdElement;
      'md-icon-button': MdElement;
      'md-linear-progress': MdElement;
      'md-outlined-button': MdElement;
      'md-outlined-text-field': MdElement;
      'md-ripple': MdElement;
      'md-slider': MdElement;
      'md-switch': MdElement;
      'md-text-button': MdElement;
    }
  }
}
