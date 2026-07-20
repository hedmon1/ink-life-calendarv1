import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { C, F } from '../theme';

type BaseProps = TextProps & {
  size?: number;
  color?: string;
  spacing?: number;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

/** IBM Plex Mono — the small, letter-spaced uppercase labels. */
export function Mono({ size = 11, color = C.muted, spacing = 0.16, medium, style, children, ...rest }: BaseProps & { medium?: boolean }) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: medium ? F.monoMed : F.mono, fontSize: size, color, letterSpacing: size * spacing }, style]}
    >
      {children}
    </Text>
  );
}

/** Newsreader serif — the body / display type. */
export function Serif({
  size = 17,
  color = C.ink,
  weight = 'regular',
  italic = false,
  style,
  children,
  ...rest
}: BaseProps & { weight?: 'regular' | 'medium' | 'semi'; italic?: boolean }) {
  const fam =
    weight === 'semi'
      ? italic
        ? F.italicSemi
        : F.serifSemi
      : weight === 'medium'
        ? italic
          ? F.italicMed
          : F.serifMed
        : italic
          ? F.italic
          : F.serif;
  return (
    <Text {...rest} style={[{ fontFamily: fam, fontSize: size, color }, style]}>
      {children}
    </Text>
  );
}
