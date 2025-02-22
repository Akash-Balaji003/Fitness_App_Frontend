import React, { useEffect, useState } from 'react';
import { View, Text, Button, NativeEventEmitter, NativeModules, StyleSheet } from 'react-native';

const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const TypeStepCount = () => {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    const subscription = stepCounterEvent.addListener('StepCounter', (stepCount) => {
      setSteps(parseInt(stepCount, 10));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const startCounter = () => {
    TypeStepCounterModule.startStepCounter();
  };

  const stopCounter = () => {
    TypeStepCounterModule.stopStepCounter();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Counter</Text>
      <Text style={styles.steps}>Steps: {steps}</Text>
      <Button title="Start Step Counter" onPress={startCounter} />
      <Button title="Stop Step Counter" onPress={stopCounter} />
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
