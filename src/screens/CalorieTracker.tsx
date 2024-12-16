import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../components/BottomNavBar";

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
  (percentage / 100) * dimension;

type CalorieTrackerProps = NativeStackScreenProps<RootStackParamList, "CalorieTracker">;


const CalorieTracker = ({ navigation }: CalorieTrackerProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Title */}
        <Text style={styles.title}>CALORIE TRACKER</Text>

        {/* Intermittent Fasting Section */}
        <ImageBackground
          source={require("../assets/intermittent-fasting.jpg")} // Placeholder for image background
          style={styles.fastingContainer}
          imageStyle={styles.fastingImage}>
          <View>
            <Text style={styles.fastingText}>
              Set Up Intermittent Fasting{"\n"}Recommendation..{"\n"}
            </Text>
            <Text style={styles.fastingText12}>
              12 hours
            </Text>
            <TouchableOpacity
              style={styles.fastingButton}
              onPress={() => navigation.navigate("DietRecommendation")}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Calorie Bar */}
        <View style={styles.calorieBar}>
          <FontAwesome name="cutlery" size={24} color="white" />
          <Text style={styles.calorieText}>Eat Up to 2000 cal</Text>
        </View>

        {/* Dietary Goals */}
        <Text style={styles.sectionTitle}>Recommended dietary goals</Text>
        <View style={styles.goalsContainer}>
          {[
            { label: "Protein goal of\n the day", goal: "0/60", icon: FontAwesome5, iconName: "fish" },
            { label: "Carb goal of \nthe day", goal: "0/110", icon: Entypo, iconName: "bowl" },
            { label: "Fat goal of \nthe day", goal: "0/25", icon: MaterialCommunityIcons, iconName: "food" },
          ].map((item, index) => (
            <View key={index} style={styles.goalBox}>
              <item.icon name={item.iconName} size={24} color="white" style={styles.goalIcon} />
              <Text style={styles.goalValue}>{item.goal}</Text>
              <Text style={styles.goalLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Food Entry Section */}
        {[
          { meal: "Breakfast", cal: "0 of 480 Cal", foodText: "Select your Yummy Breakfast 😋" },
          { meal: "Morning Snack", cal: "0 of 292 Cal", foodText: "Grab a Delicious Morning Snack 🍏" },
          { meal: "Lunch", cal: "0 of 495 Cal", foodText: "Have a Scrumptious Lunch 🍽️" },
          { meal: "Evening Snack", cal: "0 of 235 Cal", foodText: "Healthy Snack Time 🍪" },
          { meal: "Dinner", cal: "0 of 462 Cal", foodText: "Early dinner can help you sleep better 🍛" },
        ].map((item, index) => (
          <View key={index} style={styles.foodEntry}>
            <Text style={styles.mealLabel}>{item.meal}</Text>
            <Text style={styles.mealCalories}>{item.cal}</Text>
            <View style={styles.foodBar}>
              <Text style={styles.foodText}>
                {item.foodText}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("FoodSelectionPage")}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Extras Button after Dinner */}
        <View style={styles.extrasButtonContainer}>
          <TouchableOpacity
            style={styles.extrasButton}
            onPress={() => navigation.navigate("ExtrasPage")} // Navigate to the Extras Page (placeholder)
          >
            <Text style={styles.extrasButtonText}>Extras +</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>  
        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNavContainer}>
        <BottomNavBar navigation={navigation} activeTab="CalorieTracker" setActiveTab={() => {}} />
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    paddingHorizontal: calculatePercentage(5, width),
    paddingTop: calculatePercentage(2, height),
  },
  scrollViewContent: {
    paddingBottom: calculatePercentage(15, height), // Adds space for bottom nav
  },
  title: {
    color: "white",
    fontSize: calculatePercentage(7, width),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: calculatePercentage(3, height),
  },
  fastingContainer: {
    height: calculatePercentage(20, height),
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: calculatePercentage(2, height),
    justifyContent: "center",
    padding: calculatePercentage(3, width),
  },
  fastingImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  fastingText: {
    color: "white",
    fontSize: calculatePercentage(4, width),
    fontWeight: "bold",
  },
  fastingText12: {
    color: "white",
    fontSize: calculatePercentage(5, width),
    fontWeight: "bold",
  },
  fastingButton: {
    backgroundColor: "black",
    alignSelf: "flex-end",
    paddingVertical: calculatePercentage(1.5, height),
    paddingHorizontal: calculatePercentage(5, width),
    borderRadius: 20,
    marginTop: calculatePercentage(2, height),
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  
  calorieBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E37D00",
    padding: calculatePercentage(3, width),
    borderRadius: 12,
    marginBottom: calculatePercentage(3, height),
  },
  calorieText: {
    color: "white",
    fontSize: calculatePercentage(3.4, width),
    marginLeft: calculatePercentage(2, width),
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "white",
    fontSize: calculatePercentage(4, width),
    fontWeight: "bold",
    marginBottom: calculatePercentage(2, height),
  },
  goalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: calculatePercentage(3, height),
  },
  goalBox: {
    backgroundColor: "#2c2c2e",
    padding: calculatePercentage(3, width),
    borderRadius: 10,
    alignItems: "center",
    width: "30%",
  },
  goalIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  goalLabel: {
    color: "white",
    fontSize: calculatePercentage(3, width),
    textAlign: "center",
    marginTop: calculatePercentage(0.5, height),
    marginBottom: calculatePercentage(1, height),
  },
  goalValue: {
    marginTop: calculatePercentage(2, height),
    color: "#E37D00",
    fontWeight: "bold",
    fontSize: calculatePercentage(8, width),
  },
  foodEntry: {
    marginBottom: calculatePercentage(3, height),
  },
  mealLabel: {
    color: "white",
    fontSize: calculatePercentage(3, width),
    fontWeight: "bold",
  },
  mealCalories: {
    color: "#E37D00",
    fontSize: calculatePercentage(3, width),
    alignSelf: "flex-end",
  },
  foodBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2c2c2e",
    padding: calculatePercentage(3, width),
    borderRadius: 10,
  },
  foodText: {
    color: "white",
    fontSize: calculatePercentage(2.5, width),
  },
  addButton: {
    backgroundColor: "black",
    borderRadius: 50,
    width: calculatePercentage(8, width),
    height: calculatePercentage(8, width),
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: calculatePercentage(4.5, width),
    fontWeight: "bold",
  },
  bottomNavContainer: {
    marginTop: calculatePercentage(3, height),
  },
  extrasButtonContainer: {
    height: 50,
    marginTop: calculatePercentage(2, height),
    alignItems: "center", // Center the button
  },
  extrasButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  extrasButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CalorieTracker;
