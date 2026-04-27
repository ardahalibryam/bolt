import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, Platform, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = ["#22c55e", "#1374F6", "#fbbf24", "#ec4899", "#a855f7", "#ffffff", "#f97316"];

interface SuccessCelebrationProps {
  /** Controls visibility and triggers the animation */
  visible: boolean;
  /** Bulgarian message shown below the checkmark */
  message: string;
  /** Total visible duration before onComplete fires (default 1500ms) */
  duration?: number;
  /** Called when the celebration finishes auto-dismissing */
  onComplete: () => void;
}

interface ConfettiPiece {
  startX: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  rotateEnd: number;
  delay: number;
}

export function SuccessCelebration({
  visible,
  message,
  duration = 1500,
  onComplete,
}: SuccessCelebrationProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const pieces: ConfettiPiece[] = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, () => ({
        startX: SCREEN_W / 2,
        endX: SCREEN_W / 2 + (Math.random() - 0.5) * SCREEN_W * 1.2,
        endY: SCREEN_H * (0.5 + Math.random() * 0.6),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        rotateEnd: (Math.random() - 0.5) * 720,
        delay: Math.random() * 100,
      })),
    [visible]
  );

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      checkScale.setValue(0);
      progress.setValue(0);
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(checkScale, {
          toValue: 1.15,
          duration: 280,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(checkScale, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const dismiss = setTimeout(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, duration);

    return () => clearTimeout(dismiss);
  }, [visible, duration, onComplete, overlayOpacity, checkScale, progress]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="auto">
      {pieces.map((p, i) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.endX - p.startX],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.endY - SCREEN_H / 2],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${p.rotateEnd}deg`],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.confettiPiece,
              {
                left: p.startX - p.size / 2,
                top: SCREEN_H / 2 - p.size / 2,
                width: p.size,
                height: p.size * 0.5,
                backgroundColor: p.color,
                transform: [{ translateX }, { translateY }, { rotate }],
                opacity,
              },
            ]}
          />
        );
      })}

      <View style={styles.centerWrapper} pointerEvents="none">
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>
        <Animated.Text style={[styles.message, { opacity: checkScale }]}>{message}</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 9999,
    elevation: 9999,
  },
  confettiPiece: {
    position: "absolute",
    borderRadius: 2,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 64,
    fontWeight: "900",
    lineHeight: 70,
  },
  message: {
    marginTop: 24,
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
