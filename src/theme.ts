// Ink design system — dark / cool palette + Inter, matching inkcalendar.ink.
// (Token keys are kept stable so components don't need to change; the "serif"
// family is now Inter, and "ink" is the light foreground on a dark surface.)

export const C = {
  // surfaces (dark)
  bg: '#08090a', // page background (deepest)
  stone: '#101216', // tutorial stage / faintly elevated backdrop
  paper: '#16181d', // cards + text drawn on light buttons
  ink: '#f7f8f8', // primary foreground: text, filled cells, light buttons
  // pencil (empty / weeks ahead)
  pencil: '#1a1c21',
  pencilBorder: '#2a2d34',
  // accents (cool)
  amber: '#e8b84b', // prime window + gold accents
  gold: '#f0c668', // goal accent (lighter gold)
  slate: '#5ba8f5', // proximity window (blue)
  green: '#4bd865', // the week you installed Ink
  brand: '#5e6ad2', // signature indigo
  // text
  body: '#c2c5cc',
  muted: '#878b93',
  muted2: '#6f747d',
  faint: '#5a5e66',
  // lines
  line: '#23252b',
  cardLine: '#23252b',
  inputLine: '#2e323a',
  // goal tag (dark gold)
  goalTagBg: '#241d09',
  goalTagBorder: '#5a440d',
  goalTagText: '#e8b84b',
  goalTagText2: '#f0c668',
  // dark card internals
  darkBar: '#23252b',
  darkLabel: '#878b93',
  // misc
  starOff: '#3a3f47',
  reviewBackdrop: '#0c0d0f',
} as const;

export const F = {
  serif: 'Inter_400Regular',
  serifMed: 'Inter_500Medium',
  serifSemi: 'Inter_600SemiBold',
  italic: 'Inter_400Regular_Italic',
  italicMed: 'Inter_500Medium_Italic',
  italicSemi: 'Inter_600SemiBold_Italic',
  mono: 'IBMPlexMono_400Regular',
  monoMed: 'IBMPlexMono_500Medium',
} as const;
