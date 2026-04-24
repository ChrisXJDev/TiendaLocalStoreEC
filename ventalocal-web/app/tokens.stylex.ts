import * as stylex from '@stylexjs/stylex';

/**
 * VentaLocal Obsidian - StyleX Design Tokens
 */
export const tokens = stylex.defineVars({
  // Colors
  bgMain: '#000000',
  bgSurface: '#0a0a0a',
  bgElevated: '#111111',
  textMain: '#ffffff',
  textDim: '#888888',
  textMuted: '#444444',
  accent: '#ff5a1f',
  success: '#10b981',
  
  // Spacing (Separación Total)
  spaceS: '1rem',      // 16px
  spaceM: '2.5rem',    // 40px
  spaceL: '5rem',      // 80px
  spaceXL: '8rem',     // 128px
  
  // Borders
  border: 'rgba(255, 255, 255, 0.05)',
  radiusCard: '4rem',
  radiusItem: '2rem',
});
