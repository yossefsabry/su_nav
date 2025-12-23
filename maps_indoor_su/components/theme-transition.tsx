import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    runOnJS,
    Easing,
    interpolate,
    useDerivedValue
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/theme-context';
import ViewShot, { captureRef } from 'react-native-view-shot';
import MaskedView from '@react-native-masked-view/masked-view';

const { width, height } = Dimensions.get('window');
// Calculate diagonal to cover entire screen
const MAX_RADIUS = Math.sqrt(width * width + height * height);

export function ThemeTransition({ children }: { children: React.ReactNode }) {
    const { transitionState, completeCapture, completeTransition } = useTheme();
    const viewShotRef = useRef<ViewShot>(null);
    const progress = useSharedValue(0);

    // When stage enters 'capturing', we take the snapshot
    useEffect(() => {
        if (transitionState.stage === 'capturing' && viewShotRef.current) {
            // Slight delay to ensure UI is stable? No, we want instant capture.
            captureRef(viewShotRef, {
                format: 'png',
                quality: 0.9,
                result: 'tmpfile'
            }).then(uri => {
                completeCapture(uri);
            }).catch(err => {
                console.error("Snapshot failed", err);
                completeTransition(); // Abort
            });
        }
    }, [transitionState.stage]);

    // When stage enters 'animating', we run the expansion
    useEffect(() => {
        if (transitionState.stage === 'animating') {
            progress.value = 0;
            progress.value = withTiming(1, {
                duration: 800,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }, (finished) => {
                if (finished) {
                    runOnJS(completeTransition)();
                }
            });
        }
    }, [transitionState.stage]);

    const maskStyle = useAnimatedStyle(() => {
        const radius = interpolate(progress.value, [0, 1], [0, MAX_RADIUS]);
        return {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            left: transitionState.x - radius,
            top: transitionState.y - radius,
            backgroundColor: 'black', // Mask color doesn't matter, opacity does
        };
    });

    // Render Strategy:
    // 1. We wrap children in ViewShot to capture them.
    // 2. If 'idle' or 'capturing', we just show children.
    // 3. If 'animating':
    //    - Layer 0 (Bottom): The Snapshot Image (Absolute Fill) - Represents OLD Theme
    //    - Layer 1 (Top): The Live App (MaskedView) - Represents NEW Theme
    //      - The Mask is the expanding circle.
    //      - This means inside the circle = Visible Live App (New Theme).
    //      - Outside the circle = Transparent (See Snapshot/Old Theme).

    if (transitionState.stage === 'animating' && transitionState.snapshotUri) {
        return (
            <View style={styles.container}>
                {/* Layer 0: Old Theme Snapshot */}
                <Image
                    source={{ uri: transitionState.snapshotUri }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                />

                {/* Layer 1: New Theme (Live App) revealed by Mask */}
                <MaskedView
                    style={StyleSheet.absoluteFill}
                    maskElement={
                        <View style={styles.maskContainer}>
                            <Animated.View style={[styles.circle, maskStyle]} />
                        </View>
                    }
                >
                    {/* The Live Content (now with new theme applied) */}
                    <View style={{ flex: 1 }}>
                        {children}
                    </View>
                </MaskedView>
            </View>
        );
    }

    return (
        <ViewShot ref={viewShotRef} style={{ flex: 1 }} options={{ format: 'png', quality: 0.9 }}>
            {children}
        </ViewShot>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    maskContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        // We need the background of the mask container to be transparent (invisible)
        // and the circle to be opaque (visible).
        // MaskedView: Opaque parts of mask = Show content. Transparent parts = Hide content.
        // So: Circle = Opaque = Show New Theme.
        // Background = Transparent = Hide New Theme (Show Snapshot underneath).
    },
    circle: {
        position: 'absolute',
    },
});
