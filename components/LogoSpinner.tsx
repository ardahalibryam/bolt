import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

interface LogoSpinnerProps {
  /** Size in pixels for both width and height */
  size?: number;
  /** Rotation duration in milliseconds for one full turn */
  durationMs?: number;
}

/**
 * Animated spinning Bolt logo, used as a branded replacement for ActivityIndicator
 * during AI processing and other long operations.
 */
export function LogoSpinner({ size = 80, durationMs = 1200 }: LogoSpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotation, durationMs]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.Image
      source={require("../assets/images/logo2.png")}
      style={[styles.logo, { width: size, height: size, transform: [{ rotate: spin }] }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: "transparent",
  },
});
