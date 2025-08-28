import { NativeModules, NativeEventEmitter } from "react-native";
import { getUserData } from "./Storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SQLite from 'react-native-sqlite-storage';

const LAST_DATE_KEY = 'last_run_date';
export const MIDNIGHT_STEP_KEY = 'midnight_step_count';
const TEST_URL = "http://172.16.0.60:8002/test";

const testNetwork = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

  try {
    const res = await fetch(TEST_URL, {
      method: "GET",
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) return false;

    const data = await res.json();
    return data?.Test === "Working";
  } catch (err) {
    clearTimeout(timeout);
    return false;
  }
};

// Open your SQLite DB (you can customize the name)
const db = SQLite.openDatabase(
    { name: 'dailyData.db', location: 'default' },
    () => console.log('[Background Task] SQLite DB opened successfully.'),
    (error) => console.error('[Background Task] SQLite DB open error:', error)
);

// Create table if it doesn't exist
const initDB = () => {
    console.log('[Background Task] Initializing SQLite table...');
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
    console.log("[Background Task] SQLite table 'offline_log' ensured.");
};

const syncOfflineData = async (user_id: string | undefined) => {
    console.log('[Background Task] Starting syncOfflineData...');

    if (!user_id) {
        console.warn('[Background Task] user_id is undefined. Aborting sync.');
        return;
    }

    db.transaction(tx => {
        console.log('[Background Task] Querying offline_log table...');
        tx.executeSql(
            'SELECT * FROM offline_log',
            [],
            async (_, results) => {
                const logs = results.rows.raw();

                if (logs.length === 0) {
                    console.log('[Background Task] No offline data to sync.');
                    return;
                }

                console.log(`[Background Task] Found ${logs.length} record(s) to sync.`);
                const successfullySyncedIds: number[] = [];

                for (const item of logs) {
                    const payload = {
                        user_id: user_id,
                        date: item.date,
                        steps: item.daily_step_count,
                        midnight_step_count: item.midnight_step_count,
                    };

                    try {
                        console.log(`[Background Task] Sending step data for date: ${item.date}`);
                        const stepRes = await fetch('http://172.16.0.60:8002/update-steps', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        });

                        const stepData = await stepRes.json();

                        if (!stepRes.ok || stepData.status !== 'success') {
                            console.warn(`[Background Task] Server rejected step data for ID ${item.id}.`, stepData);
                            break;
                        }

                        console.log(`[Background Task] Step data synced for ID ${item.id}`);

                        await fetch('http://172.16.0.60:8002/new-transaction', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: user_id,
                                transaction_type: 'earn',
                                activity_type: 'steps',
                                amount: item.step_credits ?? 0,
                            }),
                        });
                        console.log(`[Background Task] Step credit sent for ID ${item.id}`);

                        await fetch('http://172.16.0.60:8002/new-transaction', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: user_id,
                                transaction_type: 'earn',
                                activity_type: 'calories',
                                amount: item.calorie_credits ?? 0,
                            }),
                        });
                        console.log(`[Background Task] Calorie credit sent for ID ${item.id}`);

                        successfullySyncedIds.push(item.id);

                    } catch (error) {
                        console.error(`[Background Task] Network error for ID ${item.id}. Halting sync.`, error);
                        break;
                    }
                }

                if (successfullySyncedIds.length > 0) {
                    console.log(`[Background Task] Cleaning up ${successfullySyncedIds.length} synced record(s)...`);
                    db.transaction(tx2 => {
                        const placeholders = successfullySyncedIds.map(() => '?').join(',');
                        tx2.executeSql(
                            `DELETE FROM offline_log WHERE id IN (${placeholders})`,
                            successfullySyncedIds,
                            () => {
                                console.log(`[Background Task] Deleted synced records from offline_log.`);
                            },
                            (_, err) => {
                                console.error('[Background Task] Failed to delete synced records:', err);
                                return false;
                            }
                        );
                    });
                } else {
                    console.log('[Background Task] No records were successfully synced.');
                }
            },
            (_, err) => {
                console.error('[Background Task] Failed to query offline_log:', err.message);
                return false;
            }
        );
    });
};

function calculateStepAndCalorieCredits(dailySteps: number, stepGoal: number, calorieGoal: number) {
    console.log('[Background Task] Calculating step and calorie credits...');
    const estimatedCalories = (dailySteps / 10000) * 300;

    let stepCredits = 0;
    if (dailySteps >= 0.6 * stepGoal) {
        stepCredits = Math.min(Math.round((dailySteps / stepGoal) * 10), 10);
    }

    let calorieCredits = 0;
    if (estimatedCalories >= 0.6 * calorieGoal) {
        calorieCredits = Math.min(Math.round((estimatedCalories / calorieGoal) * 10), 10);
    }

    console.log(`[Background Task] Calculated stepCredits: ${stepCredits}, calorieCredits: ${calorieCredits}`);
    return { stepCredits, calorieCredits };
}

const doWork = async () => {
    console.log('[Background Task] Background task started.');

    await initDB();

    const { TypeStepCounterModule } = NativeModules;
    const stepCounterEvent = new NativeEventEmitter(TypeStepCounterModule);
    const today = new Date().toISOString().split('T')[0];

    let currSteps = 0;

    const user_data = await getUserData();
    const user_id = user_data?.user_id;
    console.log("User id: ", user_id);
    if (!user_id) {
        console.warn("[Background Task] No user_id found. Exiting.");
        return;
    }

    const caloriegoal = parseInt(user_data?.caloriegoal || "300");
    const stepGoal = parseInt(user_data?.stepgoal || "0");
    console.log(`[Background Task] User ID: ${user_id}, Step Goal: ${stepGoal}, Calorie Goal: ${caloriegoal}`);

    const storedValue = await AsyncStorage.getItem(MIDNIGHT_STEP_KEY);
    const midnightStepCount = parseInt(storedValue || '0', 10);
    console.log("[Background Task] Stored midnight step count:", midnightStepCount);

    const getStepCount = (): Promise<number> => {
        console.log('[Background Task] Fetching current step count...');
        TypeStepCounterModule.stopStepCounter(); // If StepCounter is already started elsewhere, this will stop it, so the bottom code doesnt get stuck
        return new Promise((resolve) => {
            const listener = stepCounterEvent.addListener('StepCounter', (stepCount) => {
                console.log("[Background Task] Step count event received:", stepCount);
                const steps = parseInt(stepCount, 10);
                listener.remove();
                TypeStepCounterModule.stopStepCounter();
                resolve(steps);
            });

            TypeStepCounterModule.startStepCounter();
        });
    };

    currSteps = await getStepCount();
    TypeStepCounterModule.stopStepCounter(); // Ensure the step counter is stopped after fetching the count
    console.log(`[Background Task] Current steps: ${currSteps}`);

    const dailySteps = Math.max(0, currSteps - midnightStepCount);
    console.log(`[Background Task] Daily steps: ${dailySteps}`);

    try {
        const storedDate = await AsyncStorage.getItem(LAST_DATE_KEY);
        console.log(`[Background Task] Stored date: ${storedDate}, Today's date: ${today}`);

        if (storedDate === null) {
            console.log('[Background Task] First run. Saving today\'s date.');
            await AsyncStorage.setItem(LAST_DATE_KEY, today);

        } else if (storedDate !== today) {
            console.log('[Background Task] New day detected. Logging yesterday\'s data...');
            const credits = calculateStepAndCalorieCredits(dailySteps, stepGoal, caloriegoal);

            const insertLog = () =>
                new Promise<void>((resolve, reject) => {
                    try {
                        db.transaction(tx => {
                            tx.executeSql(
                                `INSERT INTO offline_log (date, daily_step_count, midnight_step_count, step_credits, calorie_credits) VALUES (?, ?, ?, ?, ?)`,
                                [storedDate, dailySteps, midnightStepCount, credits.stepCredits, credits.calorieCredits],
                                () => {
                                    console.log('[Background Task] Inserted log into SQLite.');
                                    resolve();
                                }, (_, error) => {
                                    console.error('[Background Task] DB insert error:', error?.message || JSON.stringify(error) || 'Unknown error');
                                    reject(error);
                                    return false;
                                }
                            );
                        });
                    } catch (err) {
                        console.error('[Background Task] Unexpected DB error:', (err as Error)?.message || err);
                        reject(err);
                    }
            });     

            await insertLog();
            await AsyncStorage.setItem(MIDNIGHT_STEP_KEY, currSteps.toString());
            await AsyncStorage.setItem(LAST_DATE_KEY, today);
            console.log("[Background Task] Midnight values updated for new day.");
        } else {
            console.log('[Background Task] Same day detected. No action needed.');
        }

    } catch (error) {
        console.error("[Background Task] Error in date comparison or logging:", error);
    }

    const test = await testNetwork();
    console.log("Lets check if its connecteddd!: ", test);

    if (test) {
        console.log("[Background Task] SRMIST network detected. Syncing data...");
        await syncOfflineData(user_id);
    } else {
        console.log("[Background Task] Not on SRMIST. Sync skipped.");
    }

    console.log("[Background Task] Background task completed.");
};

export const backgroundTask = async () => {
    console.log("-----------------------------------------------------");
    await doWork();
};