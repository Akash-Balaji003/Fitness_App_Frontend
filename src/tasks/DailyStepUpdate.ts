import BackgroundService from 'react-native-background-actions';
import { format } from 'date-fns';

const taskOptions = {
  taskName: 'Update Steps Task',
  taskTitle: 'Updating Steps',
  taskDesc: 'Syncing step count at the end of the day.',
  taskIcon: { name: 'ic_launcher', type: 'mipmap' },
  parameters: { delay: 1000 },
};

// Function to send steps to the server
const updateStepsAtEndOfDay = async (userId: string, stepCount: number) => {
  const date = format(new Date(), 'yyyy-MM-dd');

  try {
    const response = await fetch('https://fitness-backend-server-gkdme7bxcng6g9cn.southeastasia-01.azurewebsites.net/update-steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, date: date, steps: stepCount }),
    });

    if (!response.ok) throw new Error('Failed to update steps');

  } catch (error) {
    console.error('Error updating steps:', error);
  }
};

// Background Task: Runs from 11:50 PM to 12:00 AM
const backgroundTask = async ({ userId, stepCount }: { userId: string; stepCount: number }) => {
    console.log('Background Task Started');

    // Set stop time to 12:00 AM of the next day
    const stopTime = new Date();
    stopTime.setDate(stopTime.getDate() + 1);
    stopTime.setHours(0, 0, 0, 0);

    console.log(`Task will run until: ${stopTime.toISOString()}`);

    while (new Date().getTime() < stopTime.getTime()) {
        console.log('Updating steps...');
        
        try {
            await updateStepsAtEndOfDay(userId, stepCount);
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

  

// Function to Schedule Task Execution
const scheduleTask = (userId: string, stepCount: number) => {
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
    await BackgroundService.start(() => backgroundTask({ userId, stepCount }), taskOptions);
  }, delay);
};

export { scheduleTask };
