import { useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, "style"> {
  /** Static style applied to the pressable. */
  style?: StyleProp<ViewStyle>;
  /** Target scale on press-in. Default 0.96. */
  scaleTo?: number;
  /** Target opacity on press-in. Default 0.85. Set to 1 to disable opacity dim. */
  pressedOpacity?: number;
  /** Press-in animation duration in ms. Default 80. */
  duration?: number;
}

/**
 * Drop-in TouchableOpacity replacement with a subtle press-down scale + dim.
 * Provides modern iOS-style press feedback across the whole app.
 */
export function PressableScale({
  style,
  scaleTo = 0.96,
  pressedOpacity = 0.85,
  duration = 80,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    if (disabled) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: scaleTo,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: pressedOpacity,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (disabled) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { transform: [{ scale }], opacity }]}
    />
  );
}
