import BackgroundService from "react-native-background-actions";
import { runDailyStepSync } from "./DailyStepUpdate"; 

const sleep = (time: any) => new Promise<void>((resolve) => setTimeout(resolve, time));

// By typing taskData as 'any', we avoid all the complex type-checking 
// issues from the library. This is the simplest way to resolve the conflict.
const periodicSyncTask = async (taskData : any) => {
    // We still use optional chaining ('?.') for runtime safety
    const userId = taskData?.userId;
    const stepGoal = taskData?.stepGoal;
    const calorieGoal = taskData?.calorieGoal;
    const height = taskData?.height;
    const weight = taskData?. weight;

    console.log('[Background Sync] Task starting with user ID:', userId);

    if (!userId) {
        console.error('[Background Sync] No user ID available. Stopping task logic for this run.');
        return;
    }

    await new Promise(async (resolve) => {
        while (BackgroundService.isRunning()) {
            console.log('[Background Sync] Performing periodic step sync...');
            await runDailyStepSync(userId, stepGoal, calorieGoal, height, weight);

            console.log('[Background Sync] Sync complete. Sleeping for 2 hours.');
            await sleep(2 * 60 * 60 * 1000);
        }
    });
};

export const startBackgroundSync = async (userId: string, stepGoal: number, calorieGoal: number, height: number, weight: number) => {
    console.log("[START BACKGROUND SYNC] UserID: ", userId);
    if (BackgroundService.isRunning()) {
        console.log('Background sync is already running.');
        return;
    }
    
    try {
        console.log('Starting background sync service with user ID:', userId);

        const options = {
            taskName: "PeriodicStepSync",
            taskTitle: "Syncing Steps",
            taskDesc: "Ensuring your step data is up to date.",
            taskIcon: {
                name: "ic_launcher",
                type: "mipmap",
            },
            parameters: {
                userId: userId.toString(),
                stepGoal: stepGoal,
                calorieGoal: calorieGoal,
                height: height,
                weight: weight,
            },
            linkingURI: "yourapp://home",
        };
        
        await BackgroundService.start(periodicSyncTask, options);
        
        console.log('Background sync service started successfully.');
    } catch (e) {
        console.error('Failed to start background sync service', e);
    }
};

export const stopBackgroundSync = async () => {
    console.log('Stopping background sync service.');
    await BackgroundService.stop();
};