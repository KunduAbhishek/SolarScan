import { describe, expect, test } from 'vitest';
import { clamp, colorToRGB, createPalette, lerp, normalize, rgbToColor } from './visualize';

describe('createPalette', () => {
  test('always has 256 colors, starting and ending at the given colors', () => {
    const palette = createPalette(['000000', 'ffffff']);
    expect(palette).toHaveLength(256);
    expect(palette[0]).toEqual({ r: 0, g: 0, b: 0 });
    expect(palette[255]).toEqual({ r: 255, g: 255, b: 255 });
  });

  test('interpolates between more than two colors', () => {
    const palette = createPalette(['ff0000', '00ff00', '0000ff']);
    expect(palette).toHaveLength(256);
    expect(palette[0]).toEqual({ r: 255, g: 0, b: 0 });
    expect(palette[255]).toEqual({ r: 0, g: 0, b: 255 });
    // The middle color is reached around half of the palette.
    expect(Math.max(...palette.map((c) => c.g))).toBeGreaterThan(250);
  });
});

describe('colors', () => {
  test('colorToRGB accepts colors with and without #', () => {
    expect(colorToRGB('#0099FF')).toEqual({ r: 0, g: 153, b: 255 });
    expect(colorToRGB('0099FF')).toEqual({ r: 0, g: 153, b: 255 });
  });

  test('rgbToColor pads and rounds', () => {
    expect(rgbToColor({ r: 0, g: 153, b: 255 })).toBe('#0099ff');
    expect(rgbToColor({ r: 1.4, g: 0, b: 15.6 })).toBe('#010010');
  });
});

describe('math', () => {
  test('normalize clamps to [0, 1]', () => {
    expect(normalize(5, 10, 0)).toBe(0.5);
    expect(normalize(-5, 10, 0)).toBe(0);
    expect(normalize(50, 10, 0)).toBe(1);
  });

  test('lerp and clamp', () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});
