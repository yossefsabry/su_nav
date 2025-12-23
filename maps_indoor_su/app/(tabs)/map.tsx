import { useTheme } from '@/contexts/theme-context';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View, Animated, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';



export default function MapScreen() {
    const { colorScheme, colors } = useTheme();

    return (
        //   <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        //     <View style={[styles.container, { backgroundColor: colors.background }]}>
        //       <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        //
        //       <MapLibreGL.MapView
        //         style={styles.map}
        //         logoEnabled={false}
        //         mapStyle="https://demotiles.maplibre.org/style.json"
        //       >
        //         <MapLibreGL.Camera
        //           defaultSettings={{
        //             centerCoordinate: [-74.006, 40.7128], // New York as default/example
        //             zoomLevel: 9,
        //           }}
        //         />
        //       </MapLibreGL.MapView>
        //     </View>
        //   </SafeAreaView>

        <View style={styles.container}>
            <Text style={styles.text}>
                working on it
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    text: {
        color: 'red',
        fontSize: 28,       // big text
        fontWeight: 'bold', // bold
    },


    safeArea: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});
