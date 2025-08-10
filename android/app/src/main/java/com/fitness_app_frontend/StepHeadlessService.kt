package com.fitness_app_frontend

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class StepHeadlessService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        return HeadlessJsTaskConfig(
            "BackgroundStepTask",           // must match JS task name
            Arguments.createMap(),          
            5000,                           // timeout in ms
            true                            // allow running while app is in foreground
        )
    }
}