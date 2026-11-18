// src/components/charts/SpendingChart.tsx
// Grafik keuangan berbasis react-native-svg (web-safe, tanpa native module)
// Dua mode: BarChart (tren mingguan) dan PieChart (per kategori)

import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Rect, Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { formatCompact } from '../../utils/formatters';

// ── Bar Chart ─────────────────────────────────────────────────────────────────
interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  style?: ViewStyle;
  title?: string;
}

export function BarChart({ data, height = 160, style, title }: BarChartProps) {
  const { theme } = useTheme();
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = 32;
  const gap  = 12;
  const paddingV = 24;
  const chartH = height - paddingV * 2;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <View style={[{ backgroundColor: theme.colors.surface }, style]}>
      {title && (
        <ThemedText variant="caption" semibold muted style={{ marginBottom: 8 }}>
          {title}
        </ThemedText>
      )}
      <Svg width={totalW} height={height} style={{ overflow: 'visible' }}>
        {data.map((d, i) => {
          const x = i * (barW + gap);
          const barH = max > 0 ? Math.max(4, (d.value / max) * chartH) : 4;
          const y = paddingV + chartH - barH;
          const color = d.color ?? theme.colors.primary;

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={color}
                opacity={0.85}
              />
              {/* Label bawah */}
              <SvgText
                x={x + barW / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize={10}
                fill={theme.colors.textMuted}
              >
                {d.label}
              </SvgText>
              {/* Nilai atas */}
              {d.value > 0 && (
                <SvgText
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill={color}
                  fontWeight="600"
                >
                  {formatCompact(d.value)}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ── Pie / Donut Chart ─────────────────────────────────────────────────────────
interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: PieSlice[];
  size?: number;
  style?: ViewStyle;
  centerLabel?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  // Jika hampir full circle, tutup sedikit agar path benar
  const end = endDeg >= 360 ? 359.99 : endDeg;
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, end);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export function DonutChart({ data, size = 160, style, centerLabel }: DonutChartProps) {
  const { theme } = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.55;

  const slices = useMemo(() => {
    let angle = 0;
    return data
      .filter((d) => d.value > 0)
      .map((d) => {
        const deg = total > 0 ? (d.value / total) * 360 : 0;
        const start = angle;
        angle += deg;
        return { ...d, startDeg: start, endDeg: angle };
      });
  }, [data, total]);

  if (total === 0) {
    return (
      <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
        <ThemedText variant="caption" muted>Tidak ada data</ThemedText>
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {slices.map((s, i) => (
          <Path
            key={i}
            d={slicePath(cx, cy, outerR, s.startDeg, s.endDeg)}
            fill={s.color}
            stroke={theme.colors.surface}
            strokeWidth={2}
          />
        ))}
        {/* Lubang donut */}
        <Circle cx={cx} cy={cy} r={innerR} fill={theme.colors.surface} />
        {/* Label tengah */}
        {centerLabel && (
          <SvgText
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fontSize={12}
            fontWeight="600"
            fill={theme.colors.textPrimary}
          >
            {centerLabel}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}
