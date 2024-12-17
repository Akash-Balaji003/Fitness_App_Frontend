package com.fitness_app_frontend


import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.content.Context

class StepCountingService : Service() {
    
    private var sensorManager: SensorManager? = null
    private var stepCounterSensor: Sensor? = null
    private var stepCountListener: SensorEventListener? = null
    private var currentStepCount = 0

    override fun onCreate() {
        super.onCreate()

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepCounterSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

        stepCountListener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent?) {
                if (event != null && event.sensor.type == Sensor.TYPE_STEP_COUNTER) {
                    currentStepCount = event.values[0].toInt()
                }
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }
        
        // Start listening to the sensor
        stepCounterSensor?.let {
            sensorManager?.registerListener(stepCountListener, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY // Keep service alive until stopped
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onDestroy() {
        super.onDestroy()
        // Unregister the sensor listener when service is stopped
        sensorManager?.unregisterListener(stepCountListener)
    }
}
