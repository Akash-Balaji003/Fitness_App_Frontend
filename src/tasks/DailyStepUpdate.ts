import BackgroundService from 'react-native-background-actions';
import { format } from 'date-fns';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { useState } from 'react';

// Initialize Type Step Counter Module
const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const taskOptions = {
  taskName: 'Update Steps Task',
  taskTitle: 'Updating Steps',
  taskDesc: 'Syncing step count at the end of the day.',
  taskIcon: { name: 'ic_launcher', type: 'mipmap' },
  parameters: { delay: 1000 },
};

const daily_step_update = async (user_id: string) => {
  // Initialize variable to hold value of current_step_count
  const [prevMidnightSteps, setPrevMidnightSteps] = useState(0);
  const [steps, setSteps] = useState(0);


  // Function to get the CURRENT step count
  const getCurrentStepCount = () => {
    TypeStepCounterModule.startStepCounter();

    const subscription = stepCounterEvent.addListener('StepCounter', (stepCount) => {
      setSteps(parseInt(stepCount, 10));
    });

    TypeStepCounterModule.stopStepCounter();
    subscription.remove();
  }

  // Function to send steps to the server
  const updateStepsAtEndOfDay = async (userId: string) => {
    // Get new Date
    const date = format(new Date(), 'yyyy-MM-dd');

    // Get current step count value
    getCurrentStepCount();

    // Subtract stepcount with midnight step to get the step count for the day
    const today_step_count = steps - prevMidnightSteps;
    console.log("Today's Step Count: ", today_step_count);

    try {
      const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/update-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, date: date, steps: today_step_count, midnight_step_count: steps }),
      });

      if (!response.ok) throw new Error('Failed to update steps');

    } catch (error) {
      console.error('Error updating steps:', error);
    }
  };

  // Function to retrieve the value of the midnight_step_count
  const fetch_midnight_step_count = async (userId: string) => {
    try {
      const response = await fetch(
        `https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/get-total-sensor-steps?id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      // If mightnight steps are found
      if (data["total_steps"]) {
        console.log("Fetched Midnight Step Count: ", data["total_steps"]);
        setPrevMidnightSteps(parseInt(data["total_steps"], 10));
      }
      // No midnight value found, so default will be set to 0, and everything will go to shit.
      else {
        console.log("No Steps Found for Midnight!");
      }
    } catch (error) {
      console.log("Something went wrong fetching midnight_step_count: ", error);
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

      // Fetch the value of the midnight_step_count
      await fetch_midnight_step_count(userId);

      while (new Date().getTime() < stopTime.getTime()) {
          console.log('Updating steps...');
          
          try {
              await updateStepsAtEndOfDay(userId);
              console.log('Steps updated successfully, stopping background task.');
              break; // Exit loop after successful update
          } catch (error) {
              console.error('Error updating steps, retrying in 3 minutes...');
          }

          await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000)); // Run every 3 minutes
      }

      console.log('Stopping Task at 12:00 AM or after successful update');
      await BackgroundService.stop();
  };

  await backgroundTask(user_id);
}

// Function to Schedule Task Execution
const scheduleTask = (userId: string) => {
  const now = new Date();
  let targetTime = new Date();
  targetTime.setHours(23, 45, 0, 0); // Set to 11:50 PM

  // If time has already passed for today, schedule for tomorrow
  if (now.getTime() > targetTime.getTime()) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  let delay = targetTime.getTime() - now.getTime();
  console.log(`Task scheduled to start in ${(delay / 1000 / 60).toFixed(2)} minutes`);

  setTimeout(async () => {
    await BackgroundService.start(() => daily_step_update(userId), taskOptions);
  }, delay);
};

export { scheduleTask };
