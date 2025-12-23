#!/bin/bash

# Navigate to android directory
cd android

# Set JAVA_HOME to Java 17
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
echo "Using JAVA_HOME: $JAVA_HOME"

# Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Build Debug APK
echo "Building Debug APK..."
./gradlew assembleDebug --no-daemon --refresh-dependencies

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build Successful!"
    
    # Path to the generated APK
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy to project root
    if [ -f "$APK_PATH" ]; then
        cd ..
        cp "android/$APK_PATH" ./maps_indoor_su.apk
        echo "APK copied to project root: maps_indoor_su.apk"
    else
        echo "Error: APK file not found at $APK_PATH"
        exit 1
    fi
else
    echo "Build Failed!"
    exit 1
fi
