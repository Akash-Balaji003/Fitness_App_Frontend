package com.fitness_app_frontend

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.IBinder
import android.app.Service
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.NativeModule

class StepCounterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var sensorManager: SensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private var stepCounterSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
    private var stepCountListener: SensorEventListener? = null
    private var currentStepCount = 0

    init {
        // Initialize step count listener
        stepCountListener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent?) {
                if (event != null && event.sensor.type == Sensor.TYPE_STEP_COUNTER) {
                    currentStepCount = event.values[0].toInt()
                    sendStepCountToJS(currentStepCount)
                }
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }
    }

    override fun getName(): String {
        return "StepCounter"
    }

    @ReactMethod
    fun startStepCounting() {
        stepCounterSensor?.let {
            sensorManager.registerListener(stepCountListener, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    @ReactMethod
    fun stopStepCounting() {
        sensorManager.unregisterListener(stepCountListener)
    }

    @ReactMethod
    fun getSteps(callback: Callback) {
        callback.invoke(currentStepCount)
    }

    private fun sendStepCountToJS(stepCount: Int) {
        val params = mapOf("stepCount" to stepCount)
        sendEvent(reactApplicationContext, "StepCountUpdated", params)
    }

    private fun sendEvent(reactContext: ReactApplicationContext, eventName: String, params: Map<String, Any>) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
