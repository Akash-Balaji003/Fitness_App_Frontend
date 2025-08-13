package com.fitness_app_frontend

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // This method is called when the alarm fires
        val serviceIntent = Intent(context, StepHeadlessService::class.java)
        context.startService(serviceIntent)
    }
}