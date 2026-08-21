package com.classlog.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import java.util.List;

/** Avisos locais do horário: lembrete antes da aula e resumo do dia. */
public final class ScheduleNotifier {

    private static final String CHANNEL_CLASSES = "classlog-aulas";
    private static final String CHANNEL_SUMMARY = "classlog-resumo";
    private static final int ID_REMINDER = 2001;
    private static final int ID_SUMMARY = 2002;

    private ScheduleNotifier() {}

    public static void ensureChannels(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;

        NotificationChannel classes = new NotificationChannel(
                CHANNEL_CLASSES, "Aulas", NotificationManager.IMPORTANCE_HIGH);
        classes.setDescription("Aviso alguns minutos antes de cada aula da grade.");

        NotificationChannel summary = new NotificationChannel(
                CHANNEL_SUMMARY, "Resumo do dia", NotificationManager.IMPORTANCE_DEFAULT);
        summary.setDescription("Lista das aulas do dia, de manhã cedo.");

        manager.createNotificationChannel(classes);
        manager.createNotificationChannel(summary);
    }

    public static void notifyReminder(Context context, Timetable timetable, Timetable.Entry entry) {
        String place = timetable.schoolNameFor(entry);
        String range = entry.startLabel() + " – " + entry.endLabel();
        String body = place.isEmpty() ? range : range + " · " + place;

        show(context, ID_REMINDER, CHANNEL_CLASSES,
                entry.title,
                body,
                NotificationCompat.PRIORITY_HIGH);
    }

    public static void notifyDailySummary(Context context, Timetable timetable) {
        List<Timetable.Occurrence> today = timetable.forDay(System.currentTimeMillis());
        if (today.isEmpty()) return;

        StringBuilder lines = new StringBuilder();
        int classes = 0;
        for (Timetable.Occurrence occurrence : today) {
            if (lines.length() > 0) lines.append('\n');
            lines.append(occurrence.entry.startLabel())
                    .append("  ")
                    .append(occurrence.entry.title);

            String place = timetable.schoolNameFor(occurrence.entry);
            if (!place.isEmpty()) lines.append("  ·  ").append(place);
            if (occurrence.entry.isClass()) classes++;
        }

        String title = classes == 1 ? "1 aula hoje" : classes + " aulas hoje";
        Notification notification = baseBuilder(context, CHANNEL_SUMMARY)
                .setContentTitle(title)
                .setContentText(today.get(0).entry.startLabel() + " " + today.get(0).entry.title)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(lines.toString()))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .build();

        post(context, ID_SUMMARY, notification);
    }

    private static void show(Context context, int id, String channelId, String title, String body, int priority) {
        Notification notification = baseBuilder(context, channelId)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(priority)
                .build();
        post(context, id, notification);
    }

    private static NotificationCompat.Builder baseBuilder(Context context, String channelId) {
        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
                context, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(context, channelId)
                .setSmallIcon(R.drawable.ic_stat_classlog)
                .setContentIntent(contentIntent)
                .setAutoCancel(true)
                .setCategory(NotificationCompat.CATEGORY_REMINDER);
    }

    private static void post(Context context, int id, Notification notification) {
        // Sem POST_NOTIFICATIONS no Android 13+ o notify() é ignorado em silêncio;
        // checar antes evita a SecurityException do NotificationManagerCompat.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && ContextCompat.checkSelfPermission(context, android.Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        NotificationManagerCompat.from(context).notify(id, notification);
    }
}
