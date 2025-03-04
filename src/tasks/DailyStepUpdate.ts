import BackgroundService from 'react-native-background-actions';
import { format } from 'date-fns';
import { NativeModules, NativeEventEmitter } from 'react-native';

// Initialize Step Counter Module
const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const taskOptions = {
  taskName: 'Update Steps Task',
  taskTitle: 'Updating Steps',
  taskDesc: 'Syncing step count at the end of the day.',
  taskIcon: { name: 'ic_launcher', type: 'mipmap' },
  parameters: { delay: 1000 },
};

// Function to get the current step count
const getCurrentStepCount = async (): Promise<number> => {
  return new Promise((resolve) => {
    let stepCount = 0;

    TypeStepCounterModule.startStepCounter();

    const subscription = stepCounterEvent.addListener('StepCounter', (data) => {
      stepCount = parseInt(data, 10);
      subscription.remove(); // Properly remove listener
      resolve(stepCount);
      console.log('Current Step Count:', stepCount);
    });

    setTimeout(() => {
      TypeStepCounterModule.stopStepCounter();
      resolve(stepCount); // Resolve even if no data received
    }, 3000);
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
        headers: { 'Content-Type': 'application/json' },
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
    const currentSteps = await getCurrentStepCount();
    console.log('Current Sensor Step Count:', currentSteps);

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
      headers: { 'Content-Type': 'application/json' },
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

  console.log(`Task will run until: ${stopTime.toISOString()}`);

  // Fetch midnight step count
  const prevMidnightSteps = await fetchMidnightStepCount(userId);
  let attempts = 0;
  const maxAttempts = 5; // Limit retries

  while (new Date().getTime() < stopTime.getTime()) {
    console.log('Updating steps...');

    try {
      await updateStepsAtEndOfDay(userId, prevMidnightSteps);
      console.log('Steps updated successfully, stopping background task.');
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

  console.log('Stopping Task at 12:00 AM or after successful update');
  await BackgroundService.stop();
};

// Function to schedule background task execution
const scheduleTask = (userId: string) => {
  const now = new Date();
  let targetTime = new Date();
  targetTime.setHours(19, 20, 0, 0); // Set to 11:45 PM

  // If time has already passed, schedule for tomorrow
  if (now.getTime() > targetTime.getTime()) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  let delay = targetTime.getTime() - now.getTime();
  console.log(`Task scheduled to start in ${(delay / 1000 / 60).toFixed(2)} minutes`);

  setTimeout(async () => {
    await BackgroundService.start(() => backgroundTask(userId), taskOptions);
  }, delay);
};

export { scheduleTask };
