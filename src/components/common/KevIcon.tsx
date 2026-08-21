//src/components/common/KevIcon.tsx
import React from 'react';
import Svg, { Path, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';

interface KevIconProps {
  size?: number;
  color?: string;
  style?: any;
}

export default function KevIcon({ size = 18, color = '#2DD4BF', style }: KevIconProps) {
  const gradientId = `kevGrad_${color.replace('#', '')}`;
  const facetId = `facetGrad_${color.replace('#', '')}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style}>
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#5EEAD4" />
          <Stop offset="50%" stopColor={color} />
          <Stop offset="100%" stopColor="#0F766E" />
        </LinearGradient>
        <LinearGradient id={facetId} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
        </LinearGradient>
      </Defs>

      {/* Cristal Minéral Hexagonal */}
      <Polygon
        points="16,2 29,8 29,24 16,30 3,24 3,8"
        fill={`url(#${gradientId})`}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Facettes Minérales Lumineuses */}
      <Polygon points="16,2 29,8 16,14 3,8" fill={`url(#${facetId})`} />
      <Polygon points="3,8 16,14 16,30 3,24" fill="rgba(0,0,0,0.12)" />

      {/* K Crystalline Minéral Gravé */}
      <Path
        d="M12 9 L12 23 M12 16 L20 9 M14.5 14 L20.5 23"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}