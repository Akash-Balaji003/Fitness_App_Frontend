import BackgroundService from "react-native-background-actions";
import { AppState } from "react-native";
import { backgroundTask } from "./DailyStepUpdate";

let appStateSubscription: any = null;
let intervalId: NodeJS.Timeout | null = null;

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

const executeScheduledTask = async (user_id: string) => {
    console.log(`[${new Date().toLocaleTimeString()}] 🎯 Scheduled task executed at 2:05 AM!`);
    await backgroundTask(user_id);
};

const waitUntilTargetTime = async () => {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(2, 5, 0, 0); // Set time to 2:05 AM

    if (now >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1); // Move to next day if already past
    }

    const delay = targetTime.getTime() - now.getTime();
    console.log(`⏳ Sleeping for ${(delay / 1000 / 60).toFixed(2)} minutes until 2:05 AM...`);
    
    await sleep(delay);
};

const stepDetector = async (user_id: string) => {
    // Remove previous listeners
    if (appStateSubscription) {
        appStateSubscription.remove();
        console.log("Previous AppState listener removed.");
    }

    // App state listener
    const handleAppStateChange = (nextAppState: string) => {
        console.log(`[${new Date().toLocaleTimeString()}] App state changed to: ${nextAppState}`);
    };

    appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
    console.log("AppState listener added.");

    const task = async () => {
        console.log("🔄 Background task started.");
        await waitUntilTargetTime(); // Sleep until 2:05 AM

        console.log("⚡ Starting 5-minute time checks from 2:00 AM to 2:05 AM...");

        if (intervalId) {
            clearInterval(intervalId);
        }

        intervalId = setInterval(async () => {
            const now = new Date();
            console.log(`[${now.toLocaleTimeString()}] Checking time...`);

            const targetTime = new Date();
            targetTime.setHours(2, 5, 0, 0);

            if (now.getTime() >= targetTime.getTime()) {
                await executeScheduledTask(user_id);
                console.log("🎯 Task executed. Resetting timer for next day...");
                clearInterval(intervalId);
                await waitUntilTargetTime(); // Reset and wait for next 2:05 AM
            } else {
                console.log(`[${now.toLocaleTimeString()}] ❌ Not 2:05 AM yet. Waiting...`);
            }
        }, 5 * 60 * 1000); // Every 5 minutes

        await new Promise(() => {}); // Keeps task running
    };

    const options = {
        taskName: "StepDetector",
        taskTitle: "Step Counter Running",
        taskDesc: "Detecting steps in background",
        taskIcon: {
            name: "ic_launcher",
            type: "mipmap",
        },
        parameters: {},
        linkingURI: "yourapp://home",
        isForeground: true, // Keeps it running when the app is closed
    };

    await BackgroundService.start(task, options);

    BackgroundService.on("expiration", () => {
        if (intervalId) {
            clearInterval(intervalId);
            console.log("🔻 Background service expired. Interval cleared.");
        }
    });
};

export default stepDetector;
