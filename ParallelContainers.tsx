import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ParallelContainers: React.FC = () => {
  return (
    <View style={styles.infoContainer1}>
      <View style={styles.box1}>
      <Text style={styles.infoText}>Height: 155 cm</Text>
      </View>
      <View style={styles.box2}>
        <Text>Container 2</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer1: {
    flexDirection: 'row', // Align containers side by side (parallel)
    justifyContent: 'space-between',
    width: '100%',
  },
  box1: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'lightblue',
    padding: 20,
  },
  box2: {
    flex: 1,
    backgroundColor: 'lightgreen',
    padding: 20,
  },
  infoText: {
    color: "black",
    fontSize: 14,
    marginLeft: 10,
  },
});

export default ParallelContainers;
