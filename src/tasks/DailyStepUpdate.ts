import { format } from 'date-fns';
import { NativeModules, NativeEventEmitter } from 'react-native';

// Initialize Step Counter Module
const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const getCurrentStepCount = async (): Promise<number> => {
  return new Promise((resolve) => {
    let stepCount = 0;
    let receivedData = false; // Flag to check if data was received

    // Stop any TypeStepCounterModule thats going on
    TypeStepCounterModule.stopStepCounter();

    // Start for get current step count
    TypeStepCounterModule.startStepCounter();

    const subscription = stepCounterEvent.addListener("StepCounter", (data) => {
      stepCount = parseInt(data, 10);
      receivedData = true;
      console.log("[GET CURRENT STEP COUNT] Current Step Count:", stepCount);

      // Resolve only after receiving data
      subscription.remove(); // Remove listener
      TypeStepCounterModule.stopStepCounter();
      resolve(stepCount);
    });

    // Ensure step counter has enough time to gather data
    setTimeout(() => {
      if (!receivedData) {
        console.warn("[GET CURRENT STEP COUNT] No step data received, resolving with 0.");
        subscription.remove();
        TypeStepCounterModule.stopStepCounter(); // Stop only if we started it
        resolve(0);
      }
    }, 3000); // Give it more time to detect steps
  });
};

// Function to fetch midnight step count
const fetchMidnightStepCount = async (userId: string): Promise<number> => {
  try {
    console.log('Fetching midnight step count... for:', userId);
    const response = await fetch(
      `https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-total-sensor-steps?id=${userId}`,
      {
        method: 'GET',
      }
    );
    const data = await response.json();
    console.log('Midnight Step Count Data:', data);
    console.log('Midnight Step Count:', data['total_steps']);
    return data['total_steps'] ? parseInt(data['total_steps'], 10) : 0;
  } catch (error) {
    console.error('Error fetching midnight step count:', error);
    return 0;
  }
};

// Function to update step count at the end of the day
const updateStepsAtEndOfDay = async (userId: string, prevMidnightSteps: number) => {
  try {
    console.log("[UPDATE STEPS AT END OF DAY] Inside the Function...");
    const currentSteps = await getCurrentStepCount();
    console.log('[UPDATE STEPS AT END OF DAY] Current Sensor Step Count:', currentSteps);

    let todayStepCount;
    if (currentSteps < prevMidnightSteps) {
        todayStepCount = currentSteps; // Reset scenario
    } else {
        todayStepCount = Math.max(currentSteps - prevMidnightSteps, 0);
    }

    const date = format(new Date(), 'yyyy-MM-dd');
    console.log(`Updating steps for ${date}: ${todayStepCount}`);

    const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/update-steps', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "69420"
      },
      body: JSON.stringify({ user_id: userId, date, steps: todayStepCount, midnight_step_count: currentSteps }),
    });

    if (!response.ok) throw new Error('Failed to update steps');
    console.log('Steps updated successfully.');
  } catch (error) {
    console.error('Error updating steps:', error);
    throw error; // Allow retry mechanism in backgroundTask
  }
};

// Background Task: Runs from 11:50 PM to 12:00 AM
const backgroundTask = async (userId: string) => {
  console.log('Background Task Started');

  // Set stop time to 12:00 AM of the next day
  const stopTime = new Date();
  stopTime.setDate(stopTime.getDate() + 1);
  stopTime.setHours(0, 0, 0, 0);

  console.log(`[BACKGROUND TASK] Task will run until: ${stopTime.toISOString()}`);

  // Fetch midnight step count
  const prevMidnightSteps = await fetchMidnightStepCount(userId);
  console.log("[BACKGROUND TASK] PREVIOUS NIGHT STEPS: ", prevMidnightSteps);
  let attempts = 0;
  const maxAttempts = 5; // Limit retries

  while (new Date().getTime() < stopTime.getTime()) {
    console.log('[BACKGROUND TASK] Updating steps...');

    try {
      await updateStepsAtEndOfDay(userId, prevMidnightSteps);
      console.log('[BACKGROUND TASK] Steps updated successfully, stopping background task.');
      break; // Exit loop after successful update
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Max retry limit reached. Stopping task.');
        break;
      }
      console.error('Error updating steps, retrying in 3 minutes...');
    }

    await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000)); // Retry every 3 minutes
  }
};

export { backgroundTask };
