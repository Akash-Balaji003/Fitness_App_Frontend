import { NativeModules, NativeEventEmitter } from "react-native";
import { getUserData } from "./Storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SQLite from 'react-native-sqlite-storage';
import { NetworkInfo } from "react-native-network-info";

const LAST_DATE_KEY = 'last_run_date';
export const MIDNIGHT_STEP_KEY = 'midnight_step_count';

// Open your SQLite DB (you can customize the name)
const db = SQLite.openDatabase(
    { name: 'dailyData.db', location: 'default' },
    () => console.log('DB opened'),
    (error) => console.error('DB open error:', error)
);

// Create table if it doesn't exist
const initDB = () => {
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS offline_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE,
                daily_step_count INTEGER,
                midnight_step_count INTEGER,
                step_credits INTEGER,
                calorie_credits INTEGER
            )`
        );
    });
    console.log("Table Created!");
};


const syncOfflineData = async (user_id: string | undefined) => {
    if (!user_id) {
        console.warn('[Sync] user_id is undefined. Aborting sync.');
        return;
    }

    const ssid = await NetworkInfo.getSSID();
    console.log('[Sync] Currently on SSID:', ssid);

    if (ssid !== 'SRMIST') {
        console.log('[Sync] Not on SRMIST WiFi, skipping sync.');
        return;
    }

    db.transaction(tx => {
        tx.executeSql(
            'SELECT * FROM offline_log',
            [],
            async (_, results) => {
                const logs = results.rows.raw();

                if (logs.length === 0) {
                    console.log('[Sync] No offline data to sync.');
                    return;
                }

                console.log(`[Sync] Found ${logs.length} records to sync.`);
                const successfullySyncedIds: number[] = [];

                for (const item of logs) {
                    const payload = {
                        user_id: user_id,
                        date: item.date,
                        steps: item.daily_step_count,
                        midnight_step_count: item.midnight_step_count,
                    };

                    try {
                        const stepRes = await fetch('http://1psc5nc9-8000.inc1.devtunnels.ms/update-steps', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        });

                        const stepData = await stepRes.json();

                        if (!stepRes.ok || stepData.status !== 'success') {
                            console.warn(`[Sync] Server rejected step data for row ID ${item.id}.`, stepData);
                            break;
                        }

                        // Send step credits
                        await fetch('http://1psc5nc9-8000.inc1.devtunnels.ms/new-transaction', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: user_id,
                                transaction_type: 'credit',
                                activity_type: 'steps',
                                amount: item.step_credits ?? 0,
                            }),
                        });

                        // Send calorie credits
                        await fetch('http://1psc5nc9-8000.inc1.devtunnels.ms/new-transaction', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: user_id,
                                transaction_type: 'credit',
                                activity_type: 'calories',
                                amount: item.calorie_credits ?? 0,
                            }),
                        });

                        successfullySyncedIds.push(item.id);

                    } catch (error) {
                        console.error(`[Sync] Network error for row ID ${item.id}. Halting sync.`, error);
                        break;
                    }
                }

                if (successfullySyncedIds.length > 0) {
                    db.transaction(tx2 => {
                        const placeholders = successfullySyncedIds.map(() => '?').join(',');
                        tx2.executeSql(
                            `DELETE FROM offline_log WHERE id IN (${placeholders})`,
                            successfullySyncedIds,
                            () => {
                                console.log(`[Sync] Deleted ${successfullySyncedIds.length} synced records.`);
                            },
                            (_, err) => {
                                console.error('[Sync] Failed to delete synced records:', err);
                                return false;
                            }
                        );
                    });
                } else {
                    console.log('[Sync] No records were successfully synced.');
                }
            },
            (_, err) => {
                console.error('[Sync] Failed to query offline_log:', err.message);
                return false;
            }
        );
    });
};


function calculateStepAndCalorieCredits(dailySteps: number, stepGoal: number, calorieGoal: number) {
    const estimatedCalories = (dailySteps / 10000) * 300;

    let stepCredits = 0;
    if (dailySteps >= 0.6 * stepGoal) {
        stepCredits = Math.min(Math.round((dailySteps / stepGoal) * 10), 10);
    }

    let calorieCredits = 0;
    if (estimatedCalories >= 0.6 * calorieGoal) {
        calorieCredits = Math.min(Math.round((estimatedCalories / calorieGoal) * 10), 10);
    }

    return { stepCredits, calorieCredits };
}

export const backgroundTask = async () => {
    // Call db
    await initDB();

    // Initialize TypeStepCounter module
    const { TypeStepCounterModule } = NativeModules;
    const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);
    const today = new Date().toISOString().split('T')[0];
    let currSteps = 0;

    // Get user id
    const user_data = await getUserData();
    const user_id = user_data?.user_id;
    if (!user_id) {
        console.warn("[BackgroundTask] No user_id found. Exiting.");
        return;
    }

    // Initialize StepGoal and CalorieGoal
    const caloriegoal = parseInt(user_data?.caloriegoal || "0");
    const stepGoal = parseInt(user_data?.stepGoal || "0");

    /*
    First, get all the data required
        1. Midnight Step Count from async
        2. Get current Steps
        3. Get Daily Steps
        4. Get calorieGoal and stepGoal and calculate credits
        5. Get time, and find if its new day
            if its new day
                store data to sqlite
                set new midnight value
            if not time not set
                set time in asyncstorage
            else
                nothing, the day is going on.
        6. Check if its connected to SRMIST
            if connected
                send data to server
                delete data from sqlite
    */
    // Get Midnight Step Count from Async
    const storedValue = await AsyncStorage.getItem(MIDNIGHT_STEP_KEY);
    console.log("stored value: ", storedValue);
    const midnightStepCount = parseInt(storedValue || '0', 10);

    const getStepCount = (): Promise<number> => {
        return new Promise((resolve) => {
          const listener = stepCounterEvent.addListener('StepCounter', (stepCount) => {
            console.log("[BackgroundTask] Step Count: ", stepCount);
            const steps = parseInt(stepCount, 10);
            listener.remove();
            TypeStepCounterModule.stopStepCounter();
            resolve(steps);
          });

          TypeStepCounterModule.startStepCounter();
        });
    };

    currSteps = await getStepCount();

    // Calculate the steps at that time
    const dailySteps = currSteps - midnightStepCount;

    // Now compare the time
    try {
        const storedDate = await AsyncStorage.getItem(LAST_DATE_KEY);

        // If there is no LAST_DATE_KEY, store the current date
        if (storedDate === null) {
            console.log('[BackgroundTask] First time running. Saving today\'s date.');
            await AsyncStorage.setItem(LAST_DATE_KEY, today);

        // New day
        } else if (storedDate !== today) {
            // Calculated Credits
            const credits = await calculateStepAndCalorieCredits(dailySteps, stepGoal, caloriegoal);

            // Store to Async storage
            const insertLog = () =>
                new Promise<void>((resolve, reject) => {
                    db.transaction(tx => {
                        tx.executeSql(
                            `INSERT INTO offline_log (date, daily_step_count, midnight_step_count, stepCredits, calorieCredits) VALUES (?, ?, ?, ?, ?)`,
                            [storedDate, dailySteps, midnightStepCount, credits.stepCredits, credits.calorieCredits],
                            () => resolve(),
                            (_, error) => {
                                console.error('DB insert error:', error);
                                reject(error);
                                return false;
                            }
                        );
                    });
                });
            await insertLog();

            // Change midnightStepCount and time to current
            await AsyncStorage.setItem(MIDNIGHT_STEP_KEY, currSteps.toString());
            await AsyncStorage.setItem(LAST_DATE_KEY, today);

            console.log("[BACKGROUND TASK] Successfully performed Midnight Duties");
        }

    } catch (error) {
        console.log("Error: ", error);
    }

    // Check SSID
    const network_ssid = await NetworkInfo.getSSID();
    console.log("[BACKGROUND TASK] Connected to SSID: ", network_ssid);

    // Check if connected to SRMIST
    if (network_ssid === "SRMIST") {
        // Get all values from SQLITE and send to server
        await syncOfflineData(user_id);
    }
}