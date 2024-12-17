import BackgroundService from 'react-native-background-actions';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

// Define TaskData type
type TaskData = {
  delay: number;
};

export class StepCounter {
  // Method to calculate steps
  private calculateSteps(x: number, y: number, z: number): void {
    console.log('Accelerometer data:', x, y, z);
  }

  // Background task
  public startBackgroundTask = async (): Promise<void> => {
    // Task function
    const task = async (taskData?: TaskData): Promise<void> => {
      const { delay } = taskData || { delay: 1000 }; // Default delay if undefined

      // Set update interval for accelerometer
      setUpdateIntervalForType(SensorTypes.accelerometer, 200); // Update every 200ms

      // Subscribe to accelerometer sensor
      const subscription = accelerometer.subscribe(({ x, y, z }) => {
        this.calculateSteps(x, y, z);
      });

      // Keep task alive
      await new Promise<void>(async (resolve) => {
        for (;;) {
          console.log('Background task running...');
          await new Promise<void>((res) => {
            setTimeout(() => res(), 1000);
          });
        }
      });

      // Unsubscribe when done
      subscription.unsubscribe();
    };

    // Options for BackgroundService
    const options = {
      taskName: 'StepCounterTask',
      taskTitle: 'Step Counter Running',
      taskDesc: 'Counting your steps in the background',
      taskIcon: {
        name: 'ic_launcher', // Ensure this icon exists in mipmap
        type: 'mipmap',
      },
      color: '#FF5733',
      parameters: {
        delay: 1000, // Pass a default delay
      },
    };

    try {
      // Start background service
      await BackgroundService.start(task, options);
      console.log('Background Step Counter Started');
    } catch (error) {
      console.error('Error starting background task:', error);
    }
  };
}
