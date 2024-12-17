import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type ActivityMapProps = NativeStackScreenProps<RootStackParamList, "ActivityMap">;

const { width, height } = Dimensions.get("window");
const calculatePercentage = (percentage: number, dimension: number) =>
  (percentage / 100) * dimension;

const ActivityMap: React.FC<ActivityMapProps> = ({ navigation }) => {
  const [selectedActivity, setSelectedActivity] = useState<"WALK" | "RUN" | "CYCLE">("WALK");
  const [region, setRegion] = useState({
    latitude: 12.8239716,
    longitude: 80.0397352,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Fetch saved location on component mount
  useEffect(() => {
    (async () => {
      try {
        const savedLocation = await AsyncStorage.getItem("userLocation");
        if (savedLocation) {
          const { latitude, longitude } = JSON.parse(savedLocation);
          setRegion((prevRegion) => ({
            ...prevRegion,
            latitude,
            longitude,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch saved location:", error);
      }
    })();
  }, []);

  const handleActivityChange = (activity: "WALK" | "RUN" | "CYCLE") => {
    setSelectedActivity(activity);
  };

  const handleGetCurrentLocation = async () => {
    try {
      // Request location permissions
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission Denied", "Please allow location access to use this feature.");
        return;
      }

      // Fetch current location
      Geolocation.getCurrentPosition(
        async (position: { coords: { latitude: any; longitude: any; }; }) => {
          const { latitude, longitude } = position.coords;

          // Save current location
          await AsyncStorage.setItem(
            "userLocation",
            JSON.stringify({ latitude, longitude })
          );

          // Update map region
          setRegion((prevRegion) => ({
            ...prevRegion,
            latitude,
            longitude,
          }));
        },
        (error: { code: number; }) => {
          if (error.code === 2) {
            Alert.alert(
              "GPS Disabled",
              "Please enable GPS to get your current location.",
              [{ text: "OK", onPress: () => {} }]
            );
          } else {
            console.error("Error fetching location:", error);
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } catch (error) {
      console.error("Error handling location request:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Section */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>

      {/* Header Buttons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Entypo name="cross" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGetCurrentLocation}>
        <MaterialCommunityIcons name="crosshairs-gps" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        {/* Activity Selection */}
        <View style={styles.activitySelection}>
          <TouchableOpacity
            onPress={() => handleActivityChange("WALK")}
            style={styles.activityButton}>
            <Ionicons
              name="footsteps"
              size={24}
              color={selectedActivity === "WALK" ? "#E37D00" : "white"}
            />
            <Text style={styles.activityText}>Walk</Text>
            {selectedActivity === "WALK" && <View style={styles.highlight} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleActivityChange("RUN")}
            style={styles.activityButton}>
            <MaterialCommunityIcons
              name="run"
              size={24}
              color={selectedActivity === "RUN" ? "#E37D00" : "white"}
            />
            <Text style={styles.activityText}>Run</Text>
            {selectedActivity === "RUN" && <View style={styles.highlight} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleActivityChange("CYCLE")}
            style={styles.activityButton}>
            <MaterialCommunityIcons
              name="bike"
              size={24}
              color={selectedActivity === "CYCLE" ? "#E37D00" : "white"}
            />
            <Text style={styles.activityText}>Cycle</Text>
            {selectedActivity === "CYCLE" && <View style={styles.highlight} />}
          </TouchableOpacity>
        </View>

        {/* Start and History Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate("ActivityHistory")}>
            <FontAwesome name="calendar" size={20} color="white" />
            <Text style={styles.historyButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("ActivityStart")}>
            <Text style={styles.startButtonText}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: calculatePercentage(3, height),
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: calculatePercentage(40, height),
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: calculatePercentage(5, width),
  },
  activitySelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: calculatePercentage(5, height),
  },
  activityButton: {
    alignItems: "center",
  },
  activityText: {
    color: "white",
    fontSize: calculatePercentage(3, width),
    marginTop: calculatePercentage(1, height),
  },
  highlight: {
    width: "100%",
    height: 4,
    backgroundColor: "#E37D00",
    borderRadius: 10,
    marginTop: calculatePercentage(1, height),
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#E37D00",
    width: calculatePercentage(40, width),
    height: calculatePercentage(40, width),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: calculatePercentage(50, width) / 2,
    marginRight: calculatePercentage(23, width),

  },
  startButtonText: {
    color: "white",
    fontSize: calculatePercentage(7, width),
    fontWeight: "bold",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2e",
    padding: calculatePercentage(2, width),
    borderRadius: 20,
    marginRight: 30,
  },
  historyButtonText: {
    color: "white",
    fontSize: calculatePercentage(3, width),
    marginLeft: calculatePercentage(1, width),
  },
});

export default ActivityMap;
