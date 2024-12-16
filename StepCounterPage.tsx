import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const StepCountPage = () => {
  const [stepCount, setStepCount] = useState(8000);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Set your daily minimum step count</Text>
      <View style={styles.stepContainer}>
        <TouchableOpacity onPress={() => setStepCount((prev) => Math.max(3000, prev - 1000))}>
          <Text style={styles.stepButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{stepCount}</Text>
        <TouchableOpacity onPress={() => setStepCount((prev) => Math.min(11000, prev + 1000))}>
          <Text style={styles.stepButton}>+</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default StepCountPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { fontSize: 20, color: '#FFF', textAlign: 'center', marginVertical: 20 },
  stepContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  stepButton: { fontSize: 40, color: '#F0A500', marginHorizontal: 20 },
  stepValue: { fontSize: 28, color: '#FFF', fontWeight: 'bold' },
});
