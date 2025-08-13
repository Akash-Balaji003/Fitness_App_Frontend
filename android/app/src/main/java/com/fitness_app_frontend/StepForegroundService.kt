package com.fitness_app_frontend

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.SystemClock
import android.util.Log
import androidx.core.app.NotificationCompat

class StepForegroundService : Service() {

    private var alarmManager: AlarmManager? = null
    private var alarmIntent: PendingIntent? = null

    override fun onCreate() {
        super.onCreate()
        Log.d("StepForegroundService", "Service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("StepForegroundService", "Service started")
        startForegroundNotification()

        alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intentToFire = Intent(this, AlarmReceiver::class.java)

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        alarmIntent = PendingIntent.getBroadcast(this, 0, intentToFire, pendingIntentFlags)

        // --- MODIFIED: Use a null-safe 'let' block ---
        // This ensures the code only runs if alarmIntent is not null.
        alarmIntent?.let { pendingIntent ->
            val interval = 15 * 60 * 1000L
            alarmManager?.setRepeating(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + interval,
                interval,
                pendingIntent // 'pendingIntent' is now guaranteed to be non-null here
            )
        }
        // --- END MODIFIED ---

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("StepForegroundService", "Service destroyed, cancelling alarm.")
        // --- MODIFIED: Safely cancel the alarm ---
        // This checks if alarmIntent is not null before trying to use it.
        alarmIntent?.let {
            alarmManager?.cancel(it)
        }
        // --- END MODIFIED ---
    }

    private fun startForegroundNotification() {
        val channelId = "step_service_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Step Tracking",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Step tracking active")
            .setContentText("Tracking steps in background")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(1, notification)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}