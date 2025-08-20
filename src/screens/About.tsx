import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../App';

interface DeveloperProfile {
  name: string;
  role: string;
  description: string;
  githubUrl: string;
}

const developers: DeveloperProfile[] = [
  {
    name: 'Akash Balaji',
    role: 'Project Lead & Backend Developer',
    description: 'Led the project and architected the backend framework.',
    githubUrl: 'https://github.com/Akash-Balaji003'
  },
  {
    name: 'Piyush Prakash',
    role: 'Backend Developer',
    description: 'Worked on backend services and database integrations.',
    githubUrl: 'https://github.com/Piyush240604'
  },
  {
    name: 'Abishek S R',
    role: 'Frontend Developer',
    description: 'Implemented user-facing features ensuring smooth UX.',
    githubUrl: 'https://github.com/Abishek0411'
  },
  {
    name: 'Deekshith Parthasarathy',
    role: 'Frontend Developer',
    description: 'Developed interactive components for the application.',
    githubUrl: 'https://github.com/technoboy07'
  },
  {
    name: 'Bobby George',
    role: 'Frontend Developer',
    description: 'Focused on responsiveness and design consistency.',
    githubUrl: 'https://github.com/BobbyGeorgeKJ'
  },
  {
    name: 'Gladdin Shruthi',
    role: 'UI/UX Designer',
    description: 'Designed wireframes and improved user experience.',
    githubUrl: 'https://github.com/gladdyjoh11'
  },
  {
    name: 'Chetna Rajeev',
    role: 'UI/UX Designer',
    description: 'Worked on the visual appeal and user-friendly layouts.',
    githubUrl: 'https://github.com/ChetnaRajeev'
  }
];


const About = ({ navigation }: NativeStackScreenProps<RootStackParamList, "About">) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const openGitHub = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#ffffff', '#B1F0F7']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Meet the Development Team</Text>
            <Text style={styles.headerSubtitle}>
              Proudly developed by a dedicated team from SRM University.
            </Text>
          </View>

          {developers.map((dev, index) => (
            <TouchableOpacity
              key={index}
              style={styles.developerCard}
              onPress={() => openGitHub(dev.githubUrl)}
            >
              <Image
                source={{ uri: 'https://avatars.githubusercontent.com/u/9919?v=4' }}
                style={styles.developerImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.developerName}>{dev.name}</Text>
                <Text style={styles.developerRole}>{dev.role}</Text>
                <Text style={styles.developerDescription}>{dev.description}</Text>
              </View>
            </TouchableOpacity>

          ))}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16
  },
  header: {
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0077b6',
    textAlign: 'center',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#0f172a',
    textAlign: 'center',
    maxWidth: '90%'
  },
  developerCard: {
  position: 'relative', // allows image positioning
  backgroundColor: '#f0f9ff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3
},
developerImage: {
  width: 60,
  height: 60,
  borderRadius: 30,
  borderWidth: 2,
  borderColor: '#38bdf8',
  position: 'absolute',
  top: 16,
  right: 16
},
textContainer: {
  paddingRight: 80 // ensures text does not overlap with image
},
developerName: {
  fontSize: 18,
  fontWeight: '700',
  color: '#0f172a',
  marginBottom: 4
},
developerRole: {
  fontSize: 15,
  color: '#0077b6',
  marginBottom: 6
},
developerDescription: {
  fontSize: 14,
  color: '#334155',
  lineHeight: 20
},

  footer: {
    alignItems: 'center',
    marginTop: 24
  },
  backButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  }
});

export default About;
