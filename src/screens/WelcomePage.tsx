import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { RootStackParamList } from "../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const WelcomePage = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'WelcomePage'>) => {

    const { username, phone_number, password, email } = route.params;

    const navigateNext = async() => {
        navigation.navigate('GenderDOBPage',{
            username: username,
            phone_number: phone_number,
            email: email,
            password: password,
        })
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/Sample.jpeg')} // Replace with local image file
                style={styles.profileImage}
            />
            <View style={styles.overlay}>
                <Text style={styles.welcomeText}>
                    Welcome <Text style={styles.highlighted}>{username}!</Text>
                </Text>
                <Text style={styles.description}>
                    Thank you for choosing our app. Take your time and answer this quiz to
                    elevate your experience with us.
                </Text>
                <TouchableOpacity style={styles.startQuizButton} onPress={navigateNext}>
                    <Text style={styles.startQuizButtonText}>Start Journey</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    gap:50
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
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
});

export default WelcomePage;
