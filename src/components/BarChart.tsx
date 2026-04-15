import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface BarChartProps {
  data: number[];
  labels: string[];
  highlightIndex?: number;
  accentColor: string;
}

const CHART_HEIGHT = 192;
const BAR_AREA_HEIGHT = CHART_HEIGHT - 44; // Reserve space for labels + value tags

export const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  highlightIndex,
  accentColor,
}) => {
  const maxValue = Math.max(...data, 1);

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {data.map((value, index) => {
          const barHeight = Math.max((value / maxValue) * BAR_AREA_HEIGHT, value > 0 ? 4 : 0);
          const isHighlighted = index === highlightIndex;
          const hasValue = value > 0;

          return (
            <View key={index} style={styles.barColumn}>
              {/* Value label above bar */}
              {hasValue && (
                <Text style={[styles.valueLabel, isHighlighted && { color: accentColor }]}>
                  {value}
                </Text>
              )}
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: isHighlighted
                        ? accentColor
                        : `${accentColor}30`,
                    },
                    isHighlighted && {
                      shadowColor: accentColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.7,
                      shadowRadius: 10,
                      elevation: 5,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  isHighlighted && { color: accentColor },
                ]}
              >
                {labels[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CHART_HEIGHT,
    borderRadius: 12,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    marginBottom: 2,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: spacing.xs,
  },
  bar: {
    width: '100%',
    minHeight: 2,
    borderRadius: 10,
  },
  label: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontSize: 9,
  },
});
