import React, { useEffect, useRef } from "react";
import { View, Animated, Image, Easing, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const SplashScreen = ({ onAnimationEnd }: { onAnimationEnd: () => void }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => { // 500ms delay before starting animation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => { // Extra 500ms delay before navigating
          onAnimationEnd();
        }, 500);
      });
    }, 500);
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "90deg", "180deg"],
  });

  return (
    <LinearGradient
      colors={["#ffffff", "#B1F0F7"]} // White to #0095B7 gradient
      style={styles.container}
      start={{ x: 0, y: 0 }} // Gradient direction (top-left)
      end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
    >
      <View style={styles.imageContainer}>
        {/* Front Image */}
        <Animated.Image
          source={require("../assets/SRM_Logo.jpeg")}
          style={[
            styles.image,
            {
              transform: [{ rotateY: rotateInterpolate }],
              opacity: rotateAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0, 0],
              }),
            },
          ]}
        />
        {/* Back Image */}
        <Animated.Image
          source={require("../assets/SRM_Sports_Logo.jpeg")}
          style={[
            styles.image,
            {
              position: "absolute",
              transform: [{ rotateY: rotateInterpolate }, { scaleX: -1 }],
              opacity: rotateAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0, 1],
              }),
            },
          ]}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: 150,
    height: 150,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
});

export default SplashScreen;
