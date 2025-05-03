import BackgroundService from "react-native-background-actions";
import { backgroundTask } from "./DailyStepUpdate";


const updateSteps = async (user_id: string) => {

    // Sleep Function
    const sleep = (time: any) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

    // Start Background Task
    const task = async () => {
        console.log("[BACKGROUND TASK] Background task started");

        let targetTime = new Date();
        targetTime.setHours(18, 47, 0, 0); // Midnight of the current day

        // If the current time is already past midnight, set targetTime to tomorrow
        const now = new Date();
        console.log("[TASK] Current Time: ", now);
        if (now.getTime() > targetTime.getTime()) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        console.log("[TASK] Initial Target Date: ", targetTime);

        await new Promise( async(resolve) => {
            while (BackgroundService.isRunning()) {
                const currentTime = new Date();
    
                if (currentTime.getTime() >= targetTime.getTime()) {
                    console.log("[TASK] Doing something...");
                    await backgroundTask(user_id);
    
                    // Move targetTime to the next day
                    // targetTime.setMinutes(currentTime.getMinutes() + 1);
                    targetTime.setDate(targetTime.getDate() + 1);
                    console.log("[TASK] Next Target Date: ", targetTime);
                }
    
                // Calculate sleep time until the *next* targetTime
                const sleepTime = targetTime.getTime() - currentTime.getTime();
                console.log("[TASK] Sleeping for: ", sleepTime, "ms");
                await sleep(sleepTime);
                console.log("[TASK] Woke up from sleep");
                // Check if BackgroundService is still running
                if (BackgroundService.isRunning()) {
                    console.log("[TASK] Background service still running.");
                }
                else console.log("[TASK] Background service stopped.");
            }
        });
    };

    const options = {
        taskName: "UpdateSteps",
        taskTitle: "Updating Steps at Midnight",
        taskDesc: "Waiting till Midnight for updating Steps!",
        taskIcon: {
            name: "ic_launcher",
            type: "mipmap",
        },
        parameters: {},
        linkingURI: "yourapp://home",
    };

    await BackgroundService.start(task, options);
    await BackgroundService.updateNotification({taskDesc: 'Waiting till Midnight for updating Steps!'});
    // await BackgroundService.stop();
};

export default updateSteps;
