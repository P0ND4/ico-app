import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useConnectivity } from '../../../hooks/useConnectivity';
import { useThemeColors } from '../../../hooks/useThemeColors';

export function OfflineBanner() {
  const isOnline = useConnectivity();
  const theme = useThemeColors();
  const translateY = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isOnline ? 60 : 0,
      useNativeDriver: true,
      damping: 15,
    }).start();
  }, [isOnline, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.danger, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.text}>Sin conexión — funcionalidades limitadas</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
