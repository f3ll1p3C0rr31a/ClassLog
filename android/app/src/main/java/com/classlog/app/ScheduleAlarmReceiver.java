package com.classlog.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Recebe o alarme agendado, faz o aviso e agenda o próximo. */
public class ScheduleAlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Context appContext = context.getApplicationContext();
        Timetable timetable = Timetable.load(appContext);

        String type = intent == null ? null : intent.getStringExtra(ScheduleAlarms.EXTRA_TYPE);
        String entryId = intent == null ? null : intent.getStringExtra(ScheduleAlarms.EXTRA_ENTRY_ID);

        if (timetable.notificationsEnabled) {
            ScheduleNotifier.ensureChannels(appContext);

            if (ScheduleAlarms.TYPE_REMINDER.equals(type) && entryId != null) {
                for (Timetable.Entry entry : timetable.entries) {
                    if (entry.id.equals(entryId)) {
                        ScheduleNotifier.notifyReminder(appContext, timetable, entry);
                        break;
                    }
                }
            } else if (ScheduleAlarms.TYPE_SUMMARY.equals(type)) {
                ScheduleNotifier.notifyDailySummary(appContext, timetable);
            }
        }

        ScheduleWidget.refresh(appContext);
        ScheduleAlarms.scheduleNext(appContext);
    }
}
