import { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from "react-native";
import { Colors } from "../app/constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PhotoCarouselProps {
    /** Image URLs in display order. The first one is treated as the cover. */
    images: string[];
    /** Render width of each image (defaults to full screen width). */
    width?: number;
    /** Render height of each image (defaults to a 16:10 ratio of screen width). */
    height?: number;
    /** Border radius of each image / the carousel viewport (defaults to 0). */
    borderRadius?: number;
    /** Hide the pagination dots even when there are multiple images. */
    showDots?: boolean;
    /** Optional callback when the visible page changes. */
    onIndexChange?: (index: number) => void;
}

/**
 * Horizontal swipeable image viewer with pagination dots.
 *
 * - Single image: renders identically to a plain <Image>; dots hidden.
 * - Multiple images: paged horizontal scroll, dots underneath.
 */
export function PhotoCarousel({
    images,
    width,
    height,
    borderRadius = 0,
    showDots = true,
    onIndexChange,
}: PhotoCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<FlatList<string>>(null);

    const itemWidth = width ?? SCREEN_WIDTH;
    const itemHeight = height ?? Math.round(itemWidth * 0.625);

    const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const newIndex = Math.round(e.nativeEvent.contentOffset.x / itemWidth);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
            onIndexChange?.(newIndex);
        }
    };

    if (images.length === 0) {
        return (
            <View style={[styles.placeholder, { width: itemWidth, height: itemHeight, borderRadius, alignSelf: "center" }]} />
        );
    }

    return (
        <View style={styles.outer}>
            <View style={{ width: itemWidth, height: itemHeight, borderRadius, overflow: "hidden" }}>
                <FlatList
                    ref={listRef}
                    data={images}
                    keyExtractor={(item, idx) => `${idx}-${item}`}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleMomentumEnd}
                    renderItem={({ item }) => (
                        <Image
                            source={{ uri: item }}
                            style={{ width: itemWidth, height: itemHeight }}
                            resizeMode="cover"
                        />
                    )}
                />
            </View>

            {showDots && images.length > 1 && (
                <View style={styles.dotsRow}>
                    {images.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === activeIndex && styles.dotActive]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        alignItems: "center",
    },
    placeholder: {
        backgroundColor: Colors.surface,
    },
    dotsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.border,
    },
    dotActive: {
        backgroundColor: Colors.primary,
        width: 18,
    },
});
