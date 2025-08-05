import { format } from 'date-fns';
import { NativeModules, NativeEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- AsyncStorage Keys ---
const UNSYNCED_STEPS_KEY = '@unsynced_steps_queue';
const UNSYNCED_TRANSACTIONS_KEY = '@unsynced_transactions_queue'; 
export const LAST_MIDNIGHT_STEPS_KEY = '@last_midnight_steps';

// --- Initialize Step Counter (No changes here) ---
const { TypeStepCounterModule } = NativeModules;
const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);

const addTransactionToQueue = async (transactionData: object) => {
  try {
      console.log('Server unreachable. Adding transaction to local queue.');
      const existingQueue = await AsyncStorage.getItem(UNSYNCED_TRANSACTIONS_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push(transactionData);
      await AsyncStorage.setItem(UNSYNCED_TRANSACTIONS_KEY, JSON.stringify(queue));
  } catch (error) {
      console.error('Failed to add transaction to local queue:', error);
  }
};

const syncQueuedTransactions = async () => {
  const queuedData = await AsyncStorage.getItem(UNSYNCED_TRANSACTIONS_KEY);
  if (!queuedData) return;

  let queue = JSON.parse(queuedData);
  if (queue.length === 0) return;
  
  console.log(`Sync Transactions: Found ${queue.length} transaction(s) to sync.`);
  let remainingQueue = [...queue];

  for (const [index, transactionData] of queue.entries()) {
      try {
          const response = await fetch('http://172.16.0.60:8002/new-transaction', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transactionData),
          });
          if (response.ok) {
              console.log(`Successfully synced transaction: ${transactionData.activity_type}`);
              // On success, mark for removal by setting to null
              remainingQueue[index] = null;
          } else {
              console.warn(`Failed to sync transaction for ${transactionData.activity_type}. It will be retried.`);
          }
      } catch (error) {
          console.error(`Network error while syncing transaction for ${transactionData.activity_type}.`, error);
          break;
      }
  }
  
  // Filter out successfully synced (null) items and update storage
  const newQueue = remainingQueue.filter(item => item !== null);
  await AsyncStorage.setItem(UNSYNCED_TRANSACTIONS_KEY, JSON.stringify(newQueue));
};

const getCurrentStepCount = async (): Promise<number> => {
  return new Promise((resolve) => {
    let stepCount = 0;
    let receivedData = false;
    TypeStepCounterModule.stopStepCounter();
    TypeStepCounterModule.startStepCounter();
    const subscription = stepCounterEvent.addListener("StepCounter", (data) => {
      stepCount = parseInt(data, 10);
      receivedData = true;
      console.log("[GET CURRENT STEP COUNT] Current Step Count:", stepCount);
      subscription.remove();
      TypeStepCounterModule.stopStepCounter();
      resolve(stepCount);
    });
    setTimeout(() => {
      if (!receivedData) {
        console.warn("[GET CURRENT STEP COUNT] No step data received, resolving with 0.");
        subscription.remove();
        TypeStepCounterModule.stopStepCounter();
        resolve(0);
      }
    }, 3000);
  });
};

// --- MODIFIED: Function to fetch midnight step count with local fallback ---
const fetchMidnightStepCount = async (userId: string): Promise<number> => {
  try {
    console.log('Fetching midnight step count from server for:', userId);
    const response = await fetch(
      `http://172.16.0.60:8002/get-total-sensor-steps?id=${userId}`,
      { method: 'GET' }
    );
    if (!response.ok) throw new Error('Server response not OK');

    const data = await response.json();
    const midnightSteps = data['total_steps'] ? parseInt(data['total_steps'], 10) : 0;

    // Save the latest successful value to AsyncStorage
    await AsyncStorage.setItem(LAST_MIDNIGHT_STEPS_KEY, JSON.stringify({ steps: midnightSteps }));
    console.log('Successfully fetched and stored midnight steps:', midnightSteps);
    return midnightSteps;

  } catch (error) {
    console.error('Error fetching midnight step count from server:', error);
    console.log('Attempting to retrieve last known midnight steps from local storage...');
    
    // Fallback to AsyncStorage
    const localData = await AsyncStorage.getItem(LAST_MIDNIGHT_STEPS_KEY);
    if (localData) {
        const parsedData = JSON.parse(localData);
        console.log('Retrieved midnight steps from local storage:', parsedData.steps);
        return parsedData.steps;
    }
    
    console.warn('No midnight steps found in local storage. Defaulting to 0.');
    return 0;
  }
};

// You'll need a reusable function for credit calculation
const calculateCredits = (stepsToday: number, stepGoal: number, calorieGoal: number, height: number, weight: number) => {
  let earnedStepCredits = 0;
  let earnedCalorieCredits = 0;

  if (stepGoal > 0) {
      const stepPercent = stepsToday / stepGoal;
      let achievementPercent = (stepPercent >= 0.6) ? Math.min(stepPercent, 1.0) : 0;
      earnedStepCredits = Math.round((stepGoal / 1000) * achievementPercent);
  }

  if (calorieGoal > 0 && height > 0 && weight > 0) {
      const totalCalories = stepsToday * ((0.236 * height * weight) / 100000);
      const caloriePercent = totalCalories / calorieGoal;
      let achievementPercent = (caloriePercent >= 0.6) ? Math.min(caloriePercent, 1.0) : 0;
      earnedCalorieCredits = Math.round(((calorieGoal / 100) + 7) * achievementPercent);
  }

  return { earnedStepCredits, earnedCalorieCredits };
}

const addStepsToQueue = async (stepData: any) => {
  try {
      console.log('Server unreachable. Adding data to local queues.');
      const existingQueue = await AsyncStorage.getItem(UNSYNCED_STEPS_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      
      const existingIndex = queue.findIndex((item: { date: string; }) => item.date === stepData.date);

      // Queue the step data
      if (existingIndex > -1) { 
          queue[existingIndex] = stepData;
      } else {
          queue.push(stepData);
      }
      await AsyncStorage.setItem(UNSYNCED_STEPS_KEY, JSON.stringify(queue));
      
      // --- NEW: If it's a new day, also queue the transactions ---
      if (existingIndex === -1) {
          const { earnedStepCredits, earnedCalorieCredits } = calculateCredits(
              stepData.steps, stepData.stepGoal, stepData.calorieGoal, stepData.height, stepData.weight
          );

          if (earnedStepCredits > 0) {
              await addTransactionToQueue({
                  user_id: stepData.user_id,
                  transaction_type: 'earned',
                  activity_type: 'steps',
                  amount: earnedStepCredits,
              });
          }
          if (earnedCalorieCredits > 0) {
              await addTransactionToQueue({
                  user_id: stepData.user_id,
                  transaction_type: 'earned',
                  activity_type: 'calories',
                  amount: earnedCalorieCredits,
              });
          }
      }
  } catch (error) {
      console.error('Failed to add data to local queues:', error);
  }
};

// --- NEW: Function to sync queued data with the server ---
const syncQueuedSteps = async () => {
  try {
      const queuedData = await AsyncStorage.getItem(UNSYNCED_STEPS_KEY);
      if (!queuedData) return;

      let queue = JSON.parse(queuedData);
      if (queue.length === 0) return;

      console.log(`Sync Steps: Found ${queue.length} item(s) to sync.`);
      let remainingQueue = [...queue];

      for (const stepData of queue) {
          // --- NEW: Create the trimmed payload before sending ---
          const payloadToSend = {
              user_id: stepData.user_id,
              date: stepData.date,
              steps: stepData.steps,
              midnight_step_count: stepData.midnight_step_count
          };

          try {
              const response = await fetch('http://172.16.0.60:8002/update-steps', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payloadToSend), // Send the trimmed payload
              });

              if (response.ok) {
                  console.log(`Successfully synced step data for ${stepData.date}.`);
                  remainingQueue = remainingQueue.filter(item => item.date !== stepData.date);
              } else {
                 console.warn(`Failed to sync step data for ${stepData.date}. It will be retried.`);
              }
          } catch (error) {
              console.error(`Network error while syncing step data for ${stepData.date}.`, error);
              break; 
          }
      }
      
      await AsyncStorage.setItem(UNSYNCED_STEPS_KEY, JSON.stringify(remainingQueue));

  } catch (error) {
      console.error('An error occurred during the step sync process:', error);
  }
};

const runDailyStepSync = async (userId: string, stepGoal: number, calorieGoal: number, height: number, weight: number) => {
  console.log("--- Starting Daily Step Sync Process ---");

  // 1. First, try to sync any data stored in the local queues
  await syncQueuedSteps();
  await syncQueuedTransactions(); // Sync transactions as well

  // 2. Then, process today's steps
  console.log("Processing today's step count...");
  
  let endOfDaySensorSteps = 0;

  try {
      const prevMidnightSteps = await fetchMidnightStepCount(userId);
      const currentSteps = await getCurrentStepCount();
      endOfDaySensorSteps = currentSteps;

      const todayStepCount = currentSteps < prevMidnightSteps 
          ? currentSteps
          : Math.max(currentSteps - prevMidnightSteps, 0);

      const date = format(new Date(), 'yyyy-MM-dd');
      
      // --- TRIMMED PAYLOAD for /update-steps ---
      const stepPayload = {
          user_id: userId,
          date: date,
          steps: todayStepCount,
          midnight_step_count: currentSteps,
      };

      const response = await fetch('http://172.16.0.60:8002/update-steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stepPayload),
      });

      if (response.ok) {
          console.log('Successfully updated today\'s steps on the server.');
          
          // --- NEW: If steps update is successful, process and send/queue transactions ---
          // The credit calculation logic is now here for the online path
          const { earnedStepCredits, earnedCalorieCredits } = calculateCredits(todayStepCount, stepGoal, calorieGoal, height, weight);

          // Transaction for Steps
          if (earnedStepCredits > 0) {
              const stepTransaction = {
                  user_id: userId,
                  transaction_type: 'earned',
                  activity_type: 'steps',
                  amount: earnedStepCredits,
              };
              try {
                  const txResponse = await fetch('http://172.16.0.60:8002/new-transaction', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(stepTransaction)
                  });
                  if (!txResponse.ok) throw new Error('Step transaction failed');
              } catch {
                  await addTransactionToQueue(stepTransaction); // Queue if it fails
              }
          }
          
          // Transaction for Calories
          if (earnedCalorieCredits > 0) {
              const calorieTransaction = {
                  user_id: userId,
                  transaction_type: 'earned',
                  activity_type: 'calories',
                  amount: earnedCalorieCredits,
              };
               try {
                  const txResponse = await fetch('http://172.16.0.60:8002/new-transaction', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(calorieTransaction)
                  });
                  if (!txResponse.ok) throw new Error('Calorie transaction failed');
              } catch {
                  await addTransactionToQueue(calorieTransaction); // Queue if it fails
              }
          }

      } else {
          throw new Error('Server update failed, adding to queue.');
      }
  } catch (error) {
      console.error('Failed to send today\'s steps directly:', error);
      
      const prevMidnightSteps = await fetchMidnightStepCount(userId);
      const currentSteps = await getCurrentStepCount();
      endOfDaySensorSteps = currentSteps;

      const todayStepCount = currentSteps < prevMidnightSteps 
          ? currentSteps 
          : Math.max(currentSteps - prevMidnightSteps, 0);
      const date = format(new Date(), 'yyyy-MM-dd');
      
      // This payload includes everything needed for both step and credit queuing
      const fullPayload = {
          user_id: userId,
          date: date,
          steps: todayStepCount,
          midnight_step_count: currentSteps,
          stepGoal, calorieGoal, height, weight
      };
      await addStepsToQueue(fullPayload);
  }

  // --- NEW LOGIC ---
  // This block runs every time, whether online or offline.
  // It saves today's final sensor count as the starting point for tomorrow.
  if (endOfDaySensorSteps > 0) {
      try {
          console.log(`[OFFLINE-SAFE] Updating local midnight steps for next day with: ${endOfDaySensorSteps}`);
          await AsyncStorage.setItem(LAST_MIDNIGHT_STEPS_KEY, JSON.stringify({ steps: endOfDaySensorSteps }));
      } catch (e) {
          console.error("Failed to update local midnight steps for next day.", e);
      }
  }

  console.log("--- Daily Step Sync Process Finished ---");
};

// --- EXPORT the main function to be used by your background task scheduler ---
export { runDailyStepSync };