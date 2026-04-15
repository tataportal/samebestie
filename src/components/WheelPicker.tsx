import React, { useRef, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const ITEM_HEIGHT = 44;
const VISIBLE = 3; // items visible at once — center is selected

interface WheelPickerProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
  accentColor?: string;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  selectedIndex,
  onChange,
  width = 90,
  accentColor = colors.primary,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  // Scroll to index when driven externally (e.g. preset tap)
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
  }, [selectedIndex]);

  const handleScrollEnd = useCallback(
    (y: number) => {
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      onChange(clamped);
    },
    [items.length, onChange]
  );

  return (
    <View style={[styles.wrapper, { width }]}>
      {/* Center selection highlight */}
      <View
        style={[
          styles.highlight,
          { top: ITEM_HEIGHT * 1, borderColor: accentColor },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 1,
        }}
        onMomentumScrollEnd={(e) => handleScrollEnd(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => handleScrollEnd(e.nativeEvent.contentOffset.y)}
        style={{ height: ITEM_HEIGHT * VISIBLE }}
      >
        {items.map((item, index) => {
          const dist = Math.abs(index - selectedIndex);
          const isSelected = dist === 0;
          const opacity = isSelected ? 1 : dist === 1 ? 0.45 : 0.2;
          const fontSize = isSelected ? 26 : dist === 1 ? 18 : 14;

          return (
            <View key={index} style={styles.item}>
              <Text
                style={[
                  styles.itemText,
                  {
                    opacity,
                    fontSize,
                    color: isSelected ? accentColor : colors.onSurface,
                    fontFamily: isSelected ? fonts.headlineBold : fonts.body,
                    ...(isSelected && {
                      textShadowColor: accentColor,
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 10,
                    }),
                  },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
    pointerEvents: 'none',
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});
