import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
    <View style={styles.container}>
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
            <Icon name={icon} size={28} color={selectedGender === label ? "white" : "white"} />
            <Text style={styles.genderText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>When is your birthday?</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDay}
          style={styles.Daypicker}
          dropdownIconColor={"#FF8C00"}
          onValueChange={(itemValue) => setSelectedDay(itemValue)}
        >
          {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((day) => (
            <Picker.Item key={day} label={day} value={day} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedMonth}
          style={styles.Monthpicker}
          dropdownIconColor={"#FF8C00"}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        >
          {Object.keys(monthMap).map((month) => (
            <Picker.Item key={month} label={month} value={month} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedYear}
          style={styles.Yearpicker}
          dropdownIconColor={"#FF8C00"}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={navigateNext}>
        <Icon name="arrow-right" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
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
    color: "#FFF",
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
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  selectedButton: {
    backgroundColor: "#FF8C00",
  },
  genderText: {
    color: "#FFF",
    fontSize: 14,
  },
  subtitle: {
    color: "#FFF",
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
    color: "#FF8C00",
    backgroundColor: "#333",
    borderRadius: 10,
    width: "40%",
  },
  Daypicker: {
    color: "#FF8C00",
    backgroundColor: "#333",
    borderRadius: 10,
    width: "26%",
  },
  Monthpicker: {
    color: "#FF8C00",
    backgroundColor: "#333",
    borderRadius: 10,
    width: "30%",
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF8C00",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GenderDOBPage;
