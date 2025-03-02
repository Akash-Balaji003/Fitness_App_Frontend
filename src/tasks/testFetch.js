import { format } from 'date-fns';
import fetch from 'node-fetch'; 

var prevMidnightSteps = 0;
var steps = 0;

// Function to send steps to the server
const updateStepsAtEndOfDay = async (userId) => {
  const date = format(new Date(), 'yyyy-MM-dd');

  // Simulating a new step count (Replace this with real step data)
  steps = prevMidnightSteps + Math.floor(Math.random() * 1000);
  console.log("Steps:", steps);

  const today_step_count = steps - prevMidnightSteps;
  console.log("Today's Step Count:", today_step_count);

  try {
    const response = await fetch('http://0.0.0.0:80/update-steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        date: date,
        steps: today_step_count,
        midnight_step_count: steps,
      }),
    });

    if (!response.ok) throw new Error('Failed to update steps');
    console.log("Steps updated successfully!");

  } catch (error) {
    console.error('Error updating steps:', error);
  }
};

// Function to retrieve midnight step count
const fetch_midnight_step_count = async (userId) => {
  try {
    const response = await fetch(`http://0.0.0.0:80/get-total-sensor-steps?id=${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (data["total_steps"]) {
      console.log("Fetched Midnight Step Count:", data["total_steps"]);
      prevMidnightSteps = parseInt(data["total_steps"], 10);
      console.log("This is prevMidnightSteps = ", prevMidnightSteps);
    } else {
      console.log("No Steps Found for Midnight! Defaulting to 0.");
    }

  } catch (error) {
    console.log("Error fetching midnight_step_count:", error);
  }
};

// Execute functions in correct order
(async () => {
  const userId = "2";  
  console.log("Today's Date:", format(new Date(), 'yyyy-MM-dd'));

  await fetch_midnight_step_count(userId);  // Fetch midnight steps first
  await updateStepsAtEndOfDay(userId);      // Then update step count
})();
