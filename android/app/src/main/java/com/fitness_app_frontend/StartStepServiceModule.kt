package com.fitness_app_frontend

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class StartStepServiceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "StartStepServiceModule"

    @ReactMethod
    fun startService() {
        val intent = Intent(reactContext, StepForegroundService::class.java)
        reactContext.startForegroundService(intent)
    }
}
