import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App.tsx"; 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>🔒</Text>
        </View>
        <Text style={styles.header}>Hello!</Text>
        <Text style={styles.subHeader}>Login to your account</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter 10 Digit Mobile Number"
          value={mobileNumber}
          keyboardType="phone-pad"
          maxLength={10}
          onChangeText={setMobileNumber}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter Your Password"
            value={password}
            secureTextEntry={!passwordVisible}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text style={styles.eyeIcon}>
              {passwordVisible ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("SignUp")}
        style={styles.signUpLink}
      >
        <Text style={styles.signUpText}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: "#e0f7fa",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
    color: "#00bcd4",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 16,
  },
  subHeader: {
    fontSize: 16,
    color: "#757575",
  },
  formContainer: {
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    color:"00bcd4",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#b0bec5",
    fontSize: 16,
    marginBottom: 16,
    padding: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    fontSize: 18,
    paddingHorizontal: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: "#00bcd4",
    alignSelf: "flex-end",
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: "#607d8b",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpText: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
  },
  signUpLink: {
    color: "#00bcd4",
    fontWeight: "bold",
  },
});

export default LoginScreen;