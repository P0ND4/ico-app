import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '../../../hooks/useConnectivity';
import { useThemeColors } from '../../../hooks/useThemeColors';

export const OFFLINE_BANNER_HEIGHT = 44;

export function OfflineBanner() {
  const isOnline = useConnectivity();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const totalHeight = OFFLINE_BANNER_HEIGHT + insets.bottom;
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedHeight, {
      toValue: isOnline ? 0 : totalHeight,
      useNativeDriver: false,
      damping: 15,
    }).start();
  }, [isOnline, totalHeight, animatedHeight]);

  return (
    <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
      <View
        style={[
          styles.container,
          {
            height: totalHeight,
            paddingBottom: insets.bottom,
            backgroundColor: theme.danger,
          },
        ]}
      >
        <Text style={styles.text}>Sin conexión — funcionalidades limitadas</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
