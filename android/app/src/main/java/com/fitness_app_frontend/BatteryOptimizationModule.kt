package com.fitness_app_frontend

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BatteryOptimizationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BatteryOptimization"
    }

    @ReactMethod
    fun checkBatteryOptimization(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val context: Context = reactApplicationContext
            val activity: Activity? = currentActivity

            if (activity == null) {
                promise.reject("ACTIVITY_NULL", "Activity is null")
                return
            }

            val packageName = context.packageName
            val isIgnoringOptimization =
                Settings.System.canWrite(context)

            if (!isIgnoringOptimization) {
                promise.resolve(false) // Optimization is enabled
            } else {
                promise.resolve(true) // Optimization is disabled
            }
        } else {
            promise.resolve(true) // Not applicable for versions below Android M
        }
    }

    @ReactMethod
    fun requestDisableBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val activity: Activity? = currentActivity

            if (activity == null) {
                return
            }

            val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
            activity.startActivity(intent)
        }
    }
}
