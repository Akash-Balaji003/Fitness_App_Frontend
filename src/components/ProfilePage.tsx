import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import Feather from 'react-native-vector-icons/Feather';


const ProfilePage: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.header}>
            <Image
                      source={require('./assets/us.jpg')} // Replace with local image file
                      style={styles.profileImage}
                    />
            <View style={styles.headerText}>
              <Text style={styles.name}>Deekshith P, 38</Text>
              <Text style={styles.gender}>Male</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.rowContainer}>
            <View style={styles.infoBox}>
              <Feather name="phone" size={20} color="white" />
              <Text style={styles.infoText}>+91 7755003232</Text>
            </View>
            <View style={styles.infoBox}>
              <Feather name="mail" size={20} color="white" />
              <Text style={styles.infoText}>akashif@gmail.com</Text>
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.infoBox}>
              <Feather name="ruler" size={20} color="white" />
              <Text style={styles.infoText}>Height: 155 cm</Text>
            </View>
            <View style={styles.infoBox}>
              <Feather name="sliders" size={20} color="white" />
              <Text style={styles.infoText}>Weight: 69 kg</Text>
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.infoBox}>
              <Feather name="map-pin" size={20} color="white" />
              <Text style={styles.infoText}>Location: Chennai</Text>
            </View>
            <View style={styles.infoBox}>
              <Feather name="calendar" size={20} color="white" />
              <Text style={styles.infoText}>DOB: 11-11-2004</Text>
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.infoBox}>
              <Feather name="leaf" size={20} color="white" />
              <Text style={styles.infoText}>Diet: Vegan</Text>
            </View>
            <View style={styles.infoBox}>
              <Feather name="activity" size={20} color="white" />
              <Text style={styles.infoText}>BMI: 19.3</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <View style={styles.progressPlaceholder} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 20,
  },
  scrollView: {
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  gender: {
    color: "#CCC",
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#F0A500",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  infoSection: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 15,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: "#444",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  infoText: {
    color: "#FFF",
    marginLeft: 10,
    fontSize: 14,
  },
  progressSection: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  progressTitle: {
    color: "#FFF",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  progressPlaceholder: {
    height: 100,
    backgroundColor: "#555",
    borderRadius: 5,
  },
});

export default ProfilePage;
