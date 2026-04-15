import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleProp, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../theme/colors';
import { PetAnimal } from '../types';

interface PenguinSpriteProps {
  size: number;
  mood: string;
  animal?: PetAnimal;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
}

const STUDYING_MOODS = ['focused', 'studying', 'proud', 'session'];

const ANIMAL_EMOJI: Record<PetAnimal, string> = {
  penguin: '🐧',
  cat:     '🐱',
  fox:     '🦊',
  frog:    '🐸',
  panda:   '🐼',
};

export const PenguinSprite: React.FC<PenguinSpriteProps> = ({
  size,
  mood,
  animal = 'penguin',
  style,
  glowColor,
}) => {
  const isStudying = STUDYING_MOODS.includes(mood);
  const breathScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const player = useVideoPlayer(
    isStudying ? require('../../assets/images/penguin-studying.mp4') : null,
    (p) => {
      if (isStudying) { p.loop = true; p.muted = true; p.play(); }
    }
  );

  const radius = size * 0.28;
  const resolvedGlow = glowColor ?? colors.primary;
  const emoji = ANIMAL_EMOJI[animal] ?? '🐧';

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          transform: [{ scale: breathScale }],
          // Glow lives here — outer view must NOT have overflow:hidden
          shadowColor: resolvedGlow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: size * 0.25,
          elevation: 12,
          borderRadius: radius,
        },
        style,
      ]}
    >
      {/* Inner clip wrapper — rounds off content without killing the glow above */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: colors.surfaceContainerHigh,
          borderWidth: 2,
          borderColor: 'rgba(183,159,255,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isStudying ? (
          <VideoView
            player={player}
            style={{ width: size - 4, height: size - 4 }}
            contentFit="contain"
            nativeControls={false}
          />
        ) : (
          <Text style={{ fontSize: size * 0.52, textAlign: 'center' }}>{emoji}</Text>
        )}
      </View>
    </Animated.View>
  );
};
