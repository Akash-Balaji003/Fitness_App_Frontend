import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // For date dropdowns
import Feather from "react-native-vector-icons/Feather";

const QuizScreens: React.FC = () => {
  return (
    <ScrollView horizontal pagingEnabled style={styles.container}>
      {/* Welcome Page */}
      <View style={styles.page}>
        <Image
            source={require('./assets/us.jpg')} // Replace with local image file
                style={styles.backgroundImage}
         />
        <View style={styles.overlay}>
          <Text style={styles.welcomeText}>
            Welcome <Text style={styles.highlighted}>Akash!</Text>
          </Text>
          <Text style={styles.description}>
            Thank you for choosing our app. Take your time and answer this quiz
            to elevate your experience with us.
          </Text>
          <TouchableOpacity style={styles.startQuizButton}>
            <Text style={styles.startQuizButtonText}>Start quiz</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gender and DOB Page */}
      <View style={styles.page}>
        <Text style={styles.title}>Select your gender</Text>
        <View style={styles.genderSection}>
          <TouchableOpacity style={styles.genderButton}>
            <Feather name="male" size={40} color="orange" />
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.genderButton}>
            <Feather name="female" size={40} color="orange" />
            <Text style={styles.genderText}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.genderButton}>
            <Feather name="user" size={40} color="orange" />
            <Text style={styles.genderText}>Other</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>When is your birthday?</Text>
        <View style={styles.datePickerRow}>
          <Picker style={styles.picker}>
            <Picker.Item label="00" value="00" />
            <Picker.Item label="01" value="01" />
            <Picker.Item label="02" value="02" />
          </Picker>
          <Picker style={styles.picker}>
            <Picker.Item label="Jan" value="Jan" />
            <Picker.Item label="Feb" value="Feb" />
            <Picker.Item label="Mar" value="Mar" />
          </Picker>
          <Picker style={styles.picker}>
            <Picker.Item label="2000" value="2000" />
            <Picker.Item label="2001" value="2001" />
            <Picker.Item label="2002" value="2002" />
          </Picker>
        </View>
      </View>

      {/* Weight and Height Page */}
      <View style={styles.page}>
        <Text style={styles.metricTitle}>Current weight</Text>
        <Text style={styles.metricValue}>
          <Text style={styles.highlighted}>60</Text> kgs
        </Text>
        <View style={styles.scaleLine} />
        <Text style={styles.metricTitle}>Current height</Text>
        <Text style={styles.metricValue}>
          <Text style={styles.highlighted}>150</Text> cm
        </Text>
        <View style={styles.scaleLine} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  page: {
    width: 375, // Screen width
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#212121",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  highlighted: {
    color: "orange",
  },
  description: {
    color: "#CCC",
    textAlign: "center",
    marginBottom: 20,
  },
  startQuizButton: {
    backgroundColor: "orange",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  startQuizButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 20,
  },
  genderSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  genderButton: {
    alignItems: "center",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
  },
  genderText: {
    color: "#FFF",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFF",
    marginBottom: 10,
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    color: "white",
  },
  metricTitle: {
    fontSize: 20,
    color: "#FFF",
    marginVertical: 10,
  },
  metricValue: {
    fontSize: 36,
    color: "#FFF",
    fontWeight: "bold",
  },
  scaleLine: {
    height: 2,
    width: "80%",
    backgroundColor: "orange",
    marginVertical: 10,
  },
});

export default QuizScreens;
