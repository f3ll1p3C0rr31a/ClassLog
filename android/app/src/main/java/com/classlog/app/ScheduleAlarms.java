package com.classlog.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;

/**
 * Agenda um único alarme por vez: o do próximo instante interessante.
 *
 * Quando ele dispara, o receiver faz o trabalho e agenda o seguinte. Isso evita
 * manter dezenas de PendingIntents vivos e sobrevive a mudanças na grade — basta
 * chamar {@link #scheduleNext(Context)} de novo depois de salvar.
 */
public final class ScheduleAlarms {

    public static final String ACTION_FIRE = "com.classlog.app.SCHEDULE_ALARM";
    public static final String EXTRA_TYPE = "type";
    public static final String EXTRA_ENTRY_ID = "entryId";

    public static final String TYPE_REMINDER = "reminder";
    public static final String TYPE_SUMMARY = "summary";
    public static final String TYPE_TICK = "tick";

    private static final int REQUEST_CODE = 4711;

    private ScheduleAlarms() {}

    private static final class Moment implements Comparable<Moment> {
        final long millis;
        final String type;
        final String entryId;

        Moment(long millis, String type, String entryId) {
            this.millis = millis;
            this.type = type;
            this.entryId = entryId;
        }

        @Override
        public int compareTo(Moment other) {
            return Long.compare(millis, other.millis);
        }
    }

    public static void scheduleNext(Context context) {
        Context appContext = context.getApplicationContext();
        AlarmManager alarmManager = (AlarmManager) appContext.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Timetable timetable = Timetable.load(appContext);
        PendingIntent pendingIntent = buildPendingIntent(appContext);

        if (timetable.isEmpty()) {
            alarmManager.cancel(pendingIntent);
            return;
        }

        long now = System.currentTimeMillis();
        Moment next = nextMoment(timetable, now);
        if (next == null) {
            alarmManager.cancel(pendingIntent);
            return;
        }

        Intent intent = new Intent(appContext, ScheduleAlarmReceiver.class);
        intent.setAction(ACTION_FIRE);
        intent.putExtra(EXTRA_TYPE, next.type);
        intent.putExtra(EXTRA_ENTRY_ID, next.entryId);

        // FLAG_UPDATE_CURRENT para os extras do novo alarme substituírem os do anterior.
        PendingIntent target = PendingIntent.getBroadcast(
                appContext,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        if (canScheduleExact(alarmManager)) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.millis, target);
        } else {
            // Sem permissão de alarme exato o aviso ainda sai, só com folga do sistema.
            alarmManager.setWindow(AlarmManager.RTC_WAKEUP, next.millis, 5 * 60_000L, target);
        }
    }

    private static boolean canScheduleExact(AlarmManager alarmManager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true;
        return alarmManager.canScheduleExactAlarms();
    }

    private static PendingIntent buildPendingIntent(Context context) {
        Intent intent = new Intent(context, ScheduleAlarmReceiver.class);
        intent.setAction(ACTION_FIRE);
        return PendingIntent.getBroadcast(
                context,
                REQUEST_CODE,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static Moment nextMoment(Timetable timetable, long now) {
        List<Moment> moments = new ArrayList<>();

        for (Timetable.Occurrence occurrence : timetable.occurrencesFrom(now, 8)) {
            // Início e fim mantêm o widget em dia sem depender do updatePeriodMillis
            // de 30 min, que é o mínimo que o Android permite.
            moments.add(new Moment(occurrence.startMillis, TYPE_TICK, occurrence.entry.id));
            moments.add(new Moment(occurrence.endMillis, TYPE_TICK, occurrence.entry.id));

            if (timetable.notificationsEnabled && occurrence.entry.isClass()) {
                long reminderAt = occurrence.startMillis - timetable.reminderMinutes * 60_000L;
                moments.add(new Moment(reminderAt, TYPE_REMINDER, occurrence.entry.id));
            }
        }

        if (timetable.notificationsEnabled) {
            Calendar day = Calendar.getInstance();
            day.setTimeInMillis(now);
            day.set(Calendar.SECOND, 0);
            day.set(Calendar.MILLISECOND, 0);
            day.set(Calendar.HOUR_OF_DAY, timetable.dailySummaryMinutes / 60);
            day.set(Calendar.MINUTE, timetable.dailySummaryMinutes % 60);

            for (int offset = 0; offset < 8; offset++) {
                Calendar cursor = Calendar.getInstance();
                cursor.setTimeInMillis(day.getTimeInMillis());
                cursor.add(Calendar.DAY_OF_YEAR, offset);
                moments.add(new Moment(cursor.getTimeInMillis(), TYPE_SUMMARY, ""));
            }
        }

        Collections.sort(moments);
        for (Moment moment : moments) {
            if (moment.millis > now) return moment;
        }
        return null;
    }
}
