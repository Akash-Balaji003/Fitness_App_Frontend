package com.fitness_app_frontend

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class TypeStepCounterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var sensorManager: SensorManager? = null
    private var stepSensor: Sensor? = null

    /**
     * Listens to Sensor Events and sends step count to React Native
     */
    private val sensorEventListener = object : SensorEventListener {
        override fun onSensorChanged(sensorEvent: SensorEvent) {
            val steps = sensorEvent.values[0]
            sendEvent("StepCounter", steps.toString())
        }

        override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
            // Nothing to do here
        }
    }

    override fun getName(): String {
        return "TypeStepCounterModule"
    }

    /**
     * Initializes and starts the Step Counter Sensor
     */
    @ReactMethod
    fun startStepCounter() {
        sensorManager = reactApplicationContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

        if (stepSensor != null) {
            sensorManager?.registerListener(sensorEventListener, stepSensor, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    /**
     * Stops the Step Counter Sensor
     */
    @ReactMethod
    fun stopStepCounter() {
        sensorManager?.unregisterListener(sensorEventListener)
    }

    /**
     * Sends an event to React Native JavaScript side
     */
    private fun sendEvent(eventName: String, eventData: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, eventData)
    }
}
