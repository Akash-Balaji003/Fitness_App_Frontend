import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";

const GenderDOBPage = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'GenderDOBPage'>) => {
  const { username, phone_number, password, email } = route.params;

  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("01");
  const [selectedMonth, setSelectedMonth] = useState<string>("Jan");
  const [selectedYear, setSelectedYear] = useState<string>("2000");

  const monthMap: { [key: string]: string } = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

  const navigateNext = () => {
    if (!selectedGender) {
      Alert.alert("Error", "Please select your gender.");
      return;
    }

    const formattedDOB = `${selectedYear}-${monthMap[selectedMonth]}-${selectedDay.padStart(2, "0")}`;
    navigation.navigate('WeightHeightPage', {
      username: username,
      phone_number: phone_number,
      email: email,
      password: password,
      gender: selectedGender,
      DOB: formattedDOB,
    });
  };

  return (
    <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
      >
      <Text style={styles.title}>Select your gender</Text>
      <View style={styles.genderContainer}>
        {[
          { label: "Male", icon: "mars" },
          { label: "Female", icon: "venus" },
          { label: "Other", icon: "transgender" },
        ].map(({ label, icon }) => (
          <TouchableOpacity
            key={label}
            style={[
              styles.genderButton,
              selectedGender === label && styles.selectedButton,
            ]}
            onPress={() => setSelectedGender(label)}
          >
            <Icon name={icon} size={28} color={selectedGender === label ? "white" : "black"} />
            <Text style={[styles.genderText,{ color: selectedGender === label ? "white" : "black" }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>When is your birthday?</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDay}
          style={styles.Daypicker}
          dropdownIconColor={"#333"}
          onValueChange={(itemValue) => setSelectedDay(itemValue)}
        >
          {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((day) => (
            <Picker.Item key={day} label={day} value={day} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedMonth}
          style={styles.Monthpicker}
          dropdownIconColor={"#333"}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        >
          {Object.keys(monthMap).map((month) => (
            <Picker.Item key={month} label={month} value={month} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedYear}
          style={styles.Yearpicker}
          dropdownIconColor={"#333"}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>
      </View>

      <View style={{flexDirection:"row", justifyContent:"space-between", margin:10, marginTop:50, width:"80%"}}>
        <TouchableOpacity style={styles.nextButton} onPress={()=>navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={navigateNext}>
          <Icon name="arrow-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "black",
    marginBottom: 30,
    textAlign: "center",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40,
  },
  genderButton: {
    width: 90,
    height: 90,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  selectedButton: {
    backgroundColor: "#133E87",
  },
  genderText: {
    color: "#333",
    fontSize: 14,
  },
  subtitle: {
    color: "black",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: 40,
  },
  Yearpicker: {
    color: "#333",
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "40%",
  },
  Daypicker: {
    color: "#333",
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "26%",
  },
  Monthpicker: {
    color: "#333",
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "30%",
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#133E87",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GenderDOBPage;
