import React from "react";
import { View, Text, StyleSheet } from "react-native";

const FoodSelectionPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Food Selection Page</Text>
      <Text style={styles.subText}>This screen is under construction 🚧</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    color: "gray",
    fontSize: 16,
  },
});

export default FoodSelectionPage;
