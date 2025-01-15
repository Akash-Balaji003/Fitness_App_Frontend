import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome for icons
import { RootStackParamList } from '../App';
import BottomNavBar from '../components/BottomNavBar';
import { BarChart } from 'react-native-chart-kit';
import { useUser } from '../contexts/UserContext';
import LinearGradient from 'react-native-linear-gradient';

interface WeeklyData {
    labels: string[];
    steps: number[];
}

interface ProcessedData {
    labels: string[];
    steps: number[];
}

const ProfileScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, "Profile">) => {
    const { user } = useUser();
    const [stepData, setStepData] = useState<ProcessedData | undefined>(undefined);
    const [activeTab, setActiveTab] = useState('Profile');

    const processWeeklyData = (rawData: WeeklyData): ProcessedData => {
        const fullWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const stepsByDay: Record<string, number> = {};
    
        // Ensure rawData has labels and steps before proceeding
        if (!rawData.labels || !rawData.steps) {
            console.error("Missing labels or steps in the data.");
            return {
                labels: fullWeek,
                steps: new Array(7).fill(0), // Default to 0 steps for each day
            };
        }
    
        rawData.labels.forEach((day, index) => {
            stepsByDay[day] = rawData.steps[index];
        });
    
        const processedSteps = fullWeek.map((day) => stepsByDay[day] || 0);
    
        return {
            labels: fullWeek,
            steps: processedSteps,
        };
    };

    function calculateBMI(weight: number, height: number): number {
      console.log("Weight: ", weight)
      console.log("Height: ", height)
      height = height / 100;
      console.log("Height (converted to meters): ", height);
      if (height <= 0 || weight <= 0) {
        throw new Error("Invalid input. Weight and height must be positive numbers.");
      }
    
      const bmi = weight / (height * height); // height in meters
      console.log("BMI: ", bmi)
      return parseFloat(bmi.toFixed(1)); // Return BMI rounded to one decimal place
    }    
    
    useEffect(() => {
        // Fetch weekly data once user data is available
        const fetchWeeklyData = async () => {
          if (!user?.user_id) {
            console.error('User ID is missing!');
            return;
          }
    
          try {
            console.log("Fetching weekly data for user ID:", user?.user_id);
            const response = await fetch(
              `https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/weekly-steps?id=${user?.user_id}`
            );
            const rawData: WeeklyData = await response.json(); // Cast the response data
            console.log('rawData: ', rawData);
    
            const processedData = processWeeklyData(rawData);
            setStepData(processedData);
          } catch (error) {
            console.error('Error fetching weekly data:', error);
          }
        };
    
        if (user) {
          fetchWeeklyData(); // Fetch weekly data once user data is available
        }
    }, [user]); // Triggered when userData changes


    const calculateAverageSteps = (steps: number[]): number => {
        const totalSteps = steps.reduce((acc, curr) => acc + curr, 0);
        return totalSteps / steps.length;
    };
    if (!stepData || !user) {
        return (
          <LinearGradient
              colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
              style={styles.loadingContainer}
              start={{ x: 0, y: 0 }} // Gradient direction (top-left)
              end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
          >
            <ActivityIndicator size="large" color="blue" />
            <Text style={styles.loadingText}>Loading...</Text>
          </LinearGradient>
        );
    }
    const averageSteps = calculateAverageSteps(stepData.steps);
    const userBMI = calculateBMI(user?.weight, user?.height);
  return (
    <LinearGradient
          colors={['#ffffff', '#B1F0F7']} // White to #0095B7 gradient
          style={styles.safeArea}
          start={{ x: 0, y: 0 }} // Gradient direction (top-left)
          end={{ x: 1, y: 1 }} // Gradient direction (bottom-right)
      >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.headerText}>YOUR PROFILE</Text>

          {/* Top Section (Profile Picture and Info) */}
          <View style={styles.topSection}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://via.placeholder.com/100' }} // Replace with the actual image URL
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editIcon}>
                {/* Changed to pencil icon */}
                <Icon name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.basicInfo}>
              <Text style={styles.nameText}>{user?.username}</Text>
              <Text style={styles.genderText}>{user.gender}</Text>
              <TouchableOpacity style={styles.editButton} onPress={()=> navigation.navigate("EditProfile")}>
                <Text style={styles.editButtonText}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Information Section */}
          <View style={styles.infoContainer}>
            <InfoItem icon="phone" text={user?.phone_number || "NULL"} />
            <InfoItem icon="envelope" text={user?.email || "NULL"} />
            <InfoItem icon="calendar" text="00-00-2004" />
            <InfoItem icon="leaf" text={user?.diet || "NULL"} />

            {/* Height, Weight, and BMI in one row with spacing */}
            <View style={styles.inlineInfo}>
              <InfoItem icon="arrows-v" text={String(user?.height) || "NULL"} style={styles.inlineInfoItem} />
              {/* Replaced icon with letter "W" for Weight */}
              <View style={[styles.infoItem, styles.inlineInfoItem]}>
                <Text style={styles.icon}>W</Text>
                <Text style={styles.infoText}>{user?.weight} kg</Text>
              </View>
              {/* Removed icon for BMI */}
              <View style={[styles.infoItem, styles.inlineInfoItem]}>
                <Text style={styles.infoText}>BMI: {userBMI}</Text>
              </View>
            </View>
          </View>

          {/* Graph Section */}
          <View style={styles.graphSection}>
            <Text style={styles.graphTitle}>Overall Progress</Text>
            <View style={styles.graphContainer}>
                <Text style={styles.cardTitle}>Step Count</Text>
                <Text style={styles.averageText}>AVERAGE</Text>
                <Text style={styles.highlightText}>{averageSteps.toFixed(0)} Steps</Text>
                <BarChart
                    data={{
                        labels: stepData.labels, // Full week labels
                        datasets: [{ data: stepData.steps }], // Full week steps
                    }}
                    width={Dimensions.get('window').width - 40}
                    height={180}
                    chartConfig={{
                        backgroundGradientFrom: '#B1F0F7',
                        backgroundGradientTo: '#B1F0F7',
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Set bars to black
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Set labels to black
                        barPercentage: 0.7,
                        formatYLabel: (yLabel) => parseInt(yLabel).toString(),
                        propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: '#000000', // Set dot border color to black
                        },
                        propsForBackgroundLines: {
                            stroke: '#000000', // Set grid line color to black
                            strokeWidth: 0.5, // Line thickness
                        },
                        propsForLabels: {
                            fontSize: 12, // Adjust label font size if needed
                        },
                    }}
                    style={styles.chart}
                    yAxisLabel=""
                    yAxisSuffix=""
                />

            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavBar
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
    </LinearGradient>
  );
};

const InfoItem: React.FC<{ icon: string; text: string; style?: any }> = ({ icon, text, style }) => (
    <View style={[styles.infoItem, style]}>
      {/* Dynamically render icons */}
      <Icon name={icon} size={18} color="#f7941d" style={styles.icon} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
  

const styles = StyleSheet.create({

    card: { backgroundColor: '#EAF8FF', padding: 5, borderRadius: 10, marginBottom:'auto', marginTop:'auto', height:190 },
    BottomCard: { backgroundColor: '#3A3A3A', padding: 5, borderRadius: 10, marginBottom: 100 },
    cardTitle: { color: 'black', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    chart: { borderRadius: 10, marginTop: 10, marginRight:0, },
    text: { color: '#333', fontSize: 14, marginTop: 5 },
    highlightText: { color: 'black', fontSize: 16, fontWeight: 'bold' },
    averageText: { color: '#BBBBBB', fontSize: 12, marginTop: 5 },
    subtitle: { color: '#BBBBBB', fontSize: 12, marginTop: 5 },
  safeArea: {
    flex: 1,
    backgroundColor: '#1c1c1e', // Updated background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 80, // Adjust padding to accommodate content
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft:10
  },
  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    marginRight: 20,
  },
  profileImage: {
    width: '90%',
    height: '90%',
    borderRadius: 60,
  },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#133E87',
    borderRadius: 30,
    padding: 7,
  },
  basicInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  genderText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#133E87',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    marginBottom: 5,
    paddingHorizontal: 15,

  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8FF',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    elevation:3
  },
  inlineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 1,
    paddingHorizontal: 1,
    gap:5
  },
  inlineInfoItem: {
    flex: 1,
    marginHorizontal: 1,
  },
  icon: {
    fontSize: 18,
    color: '#133E87',
    marginRight: 10,
  },
  infoText: {
    fontSize: 13,
    color: 'black',
  },
  graphSection: {
    marginTop: 5,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  graphContainer: {
    height: 275,
    width: "98%",
    backgroundColor: '#EAF8FF',
    borderRadius: 10,
    paddingLeft:5,
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf:"center",
    elevation:3
  },
  graphPlaceholderText: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default ProfileScreen;