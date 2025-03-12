import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

const WeightHeightPage = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'WeightHeightPage'>) => {

  const { username, phone_number, password, DOB, gender, email } = route.params;

  const [weight, setWeight] = useState(60);
  const [height, setHeight] = useState(150);

  const scrollWeightRef = useRef<ScrollView>(null);
  const scrollHeightRef = useRef<ScrollView>(null);

  const RULER_ITEM_WIDTH = 5; // Each line width
  const TOTAL_WEIGHT = 150;
  const TOTAL_HEIGHT = 250;

  // Generate a range for ruler items
  const generateRange = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const navigateNext = async() => {
    navigation.navigate('BloodGroup',{
        username: username,
        phone_number: phone_number,
        email: email,
        password: password,
        gender: gender,
        DOB: DOB,
        height: height,
        weight: weight

    })
  };

  return (
    <LinearGradient
            colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
            style={styles.container}
            start={{ x: 0, y: 0 }} // Gradient direction (top-left)
            end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
      >
      {/* Weight Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Current weight</Text>
        <Text style={styles.value}>
          <Text style={styles.highlight}>{weight}</Text> kgs
        </Text>
        <View style={styles.rulerWrapper}>
          <ScrollView
            ref={scrollWeightRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={RULER_ITEM_WIDTH}
            contentOffset={{ x: (weight - 40) * RULER_ITEM_WIDTH, y: 0 }}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / RULER_ITEM_WIDTH);
              setWeight(40 + index);
            }}
            scrollEventThrottle={16}
          >
            {generateRange(40, TOTAL_WEIGHT).map((value) => (
              <View
                key={value}
                style={[
                  styles.rulerItem,
                  value % 5 === 0 && styles.rulerItemBold,
                ]}
              />
            ))}
          </ScrollView>
          <View style={styles.indicator} />
        </View>
      </View>

      {/* Height Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Current height</Text>
        <Text style={styles.value}>
          <Text style={styles.highlight}>{height}</Text> cm
        </Text>
        <View style={styles.rulerWrapper}>
          <ScrollView
            ref={scrollHeightRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={RULER_ITEM_WIDTH}
            contentOffset={{ x: (height - 100) * RULER_ITEM_WIDTH, y: 0 }}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / RULER_ITEM_WIDTH);
              setHeight(100 + index);
            }}
            scrollEventThrottle={16}
          >
            {generateRange(100, TOTAL_HEIGHT).map((value) => (
              <View
                key={value}
                style={[
                  styles.rulerItem,
                  value % 5 === 0 && styles.rulerItemBold,
                ]}
              />
            ))}
          </ScrollView>
          <View style={styles.indicator} />
        </View>
      </View>
      <View style={{flexDirection:"row", justifyContent:"space-between", margin:10, width:"80%", alignSelf:"center"}}>
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
    paddingTop: 50,
    justifyContent:"center",
  },
  section: {
    alignItems: "center",
    marginVertical: 30,
  },
  label: {
    fontSize: 18,
    color: "black",
    marginBottom: 5,
  },
  value: {
    fontSize: 28,
    color: "black",
    fontWeight: "bold",
    marginBottom: 10,
  },
  highlight: {
    color: "black",
    fontSize: 36,
  },
  rulerWrapper: {
    position: "relative",
    height: 80,
    overflow: "hidden",
    width: "100%",
  },
  rulerItem: {
    width: 5,
    height: 17,
    backgroundColor: "grey",
    opacity: 0.8,
    marginRight: 1,
  },
  rulerItemBold: {
    height: 40,
    backgroundColor: "black",
    opacity: 0.8,
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#133E87",
    left: "50%",
    marginLeft: -1,
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

export default WeightHeightPage;
