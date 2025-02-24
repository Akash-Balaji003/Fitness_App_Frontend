import React, { useEffect, useState } from 'react';
import { View, Text, NativeEventEmitter, NativeModules, StyleSheet } from 'react-native';

const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const TypeStepCount = () => {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    // Start step counter when the screen loads
    TypeStepCounterModule.startStepCounter();

    const subscription = stepCounterEvent.addListener('StepCounter', (stepCount) => {
      setSteps(parseInt(stepCount, 10));
    });

    return () => {
      // Stop counter when component unmounts
      TypeStepCounterModule.stopStepCounter();
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Counter</Text>
      <Text style={styles.steps}>Steps: {steps}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  steps: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default TypeStepCount;
