package com.classlog.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import java.util.List;

/**
 * Widget de tela inicial: aula atual em destaque e os próximos três blocos.
 *
 * O layout usa só views que o RemoteViews aceita (LinearLayout, TextView,
 * ImageView, ProgressBar). Qualquer view fora dessa lista compila normalmente e
 * só falha no aparelho, na hora de adicionar o widget.
 */
public class ScheduleWidget extends AppWidgetProvider {

    public static final String ACTION_REFRESH = "com.classlog.app.WIDGET_REFRESH";
    private static final int UPCOMING_ROWS = 3;

    private static final int[] ROW_TIME = { R.id.upcoming_time_1, R.id.upcoming_time_2, R.id.upcoming_time_3 };
    private static final int[] ROW_TITLE = { R.id.upcoming_title_1, R.id.upcoming_title_2, R.id.upcoming_title_3 };
    private static final int[] ROW_PLACE = { R.id.upcoming_place_1, R.id.upcoming_place_2, R.id.upcoming_place_3 };
    private static final int[] ROW_ROOT = { R.id.upcoming_row_1, R.id.upcoming_row_2, R.id.upcoming_row_3 };

    /** Redesenha todas as instâncias do widget. Seguro de chamar de qualquer lugar. */
    public static void refresh(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, ScheduleWidget.class);
        int[] ids = manager.getAppWidgetIds(component);
        if (ids == null || ids.length == 0) return;

        for (int id : ids) {
            manager.updateAppWidget(id, buildViews(context));
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) {
            manager.updateAppWidget(id, buildViews(context));
        }
        ScheduleAlarms.scheduleNext(context);
    }

    @Override
    public void onEnabled(Context context) {
        ScheduleNotifier.ensureChannels(context);
        ScheduleAlarms.scheduleNext(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (intent != null && ACTION_REFRESH.equals(intent.getAction())) {
            refresh(context);
            ScheduleAlarms.scheduleNext(context);
        }
    }

    private static RemoteViews buildViews(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_schedule);
        Timetable timetable = Timetable.load(context);
        long now = System.currentTimeMillis();

        views.setOnClickPendingIntent(R.id.widget_root, openAppIntent(context));
        views.setOnClickPendingIntent(R.id.widget_refresh, refreshIntent(context));

        Timetable.Occurrence current = timetable.currentAt(now);
        List<Timetable.Occurrence> upcoming = timetable.upcomingFrom(now, UPCOMING_ROWS);

        if (timetable.isEmpty()) {
            views.setTextViewText(R.id.now_eyebrow, context.getString(R.string.widget_no_timetable_eyebrow));
            views.setTextViewText(R.id.now_title, context.getString(R.string.widget_no_timetable_title));
            views.setTextViewText(R.id.now_meta, context.getString(R.string.widget_no_timetable_meta));
            views.setViewVisibility(R.id.now_progress, View.GONE);
        } else if (current != null) {
            views.setTextViewText(R.id.now_eyebrow, context.getString(R.string.widget_now));
            views.setTextViewText(R.id.now_title, current.entry.title);
            views.setTextViewText(R.id.now_meta, describe(timetable, current.entry));
            views.setViewVisibility(R.id.now_progress, View.VISIBLE);

            long total = Math.max(current.endMillis - current.startMillis, 1L);
            long elapsed = Math.min(Math.max(now - current.startMillis, 0L), total);
            views.setProgressBar(R.id.now_progress, 100, (int) (elapsed * 100 / total), false);
        } else {
            views.setTextViewText(R.id.now_eyebrow, context.getString(R.string.widget_free));
            views.setViewVisibility(R.id.now_progress, View.GONE);

            if (upcoming.isEmpty()) {
                views.setTextViewText(R.id.now_title, context.getString(R.string.widget_nothing_ahead));
                views.setTextViewText(R.id.now_meta, "");
            } else {
                Timetable.Occurrence next = upcoming.get(0);
                views.setTextViewText(R.id.now_title, next.entry.title);
                views.setTextViewText(R.id.now_meta,
                        context.getString(R.string.widget_starts_in, countdown(next.startMillis - now))
                                + " · " + describe(timetable, next.entry));
            }
        }

        for (int index = 0; index < UPCOMING_ROWS; index++) {
            if (index < upcoming.size()) {
                Timetable.Occurrence occurrence = upcoming.get(index);
                views.setViewVisibility(ROW_ROOT[index], View.VISIBLE);
                views.setTextViewText(ROW_TIME[index], occurrence.entry.startLabel());
                views.setTextViewText(ROW_TITLE[index], occurrence.entry.title);

                String place = timetable.schoolNameFor(occurrence.entry);
                String dayLabel = occurrence.dayOffset == 0 ? "" : dayPrefix(context, occurrence.dayOffset);
                String detail = dayLabel.isEmpty() ? place : (place.isEmpty() ? dayLabel : dayLabel + " · " + place);
                views.setTextViewText(ROW_PLACE[index], detail);
            } else {
                views.setViewVisibility(ROW_ROOT[index], View.GONE);
            }
        }

        return views;
    }

    private static String dayPrefix(Context context, int dayOffset) {
        if (dayOffset == 1) return context.getString(R.string.widget_tomorrow);
        java.util.Calendar cursor = java.util.Calendar.getInstance();
        cursor.add(java.util.Calendar.DAY_OF_YEAR, dayOffset);
        return new java.text.SimpleDateFormat("EEE", new java.util.Locale("pt", "BR")).format(cursor.getTime());
    }

    private static String describe(Timetable timetable, Timetable.Entry entry) {
        String range = entry.startLabel() + " – " + entry.endLabel();
        String place = timetable.schoolNameFor(entry);
        return place.isEmpty() ? range : range + " · " + place;
    }

    private static String countdown(long deltaMillis) {
        long minutes = Math.max(Math.round(deltaMillis / 60000.0), 0);
        if (minutes < 60) return minutes + " min";
        long hours = minutes / 60;
        long rest = minutes % 60;
        if (hours < 24) return rest == 0 ? hours + "h" : hours + "h" + String.format(java.util.Locale.getDefault(), "%02d", rest);
        return Math.round(hours / 24.0) + "d";
    }

    private static PendingIntent openAppIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static PendingIntent refreshIntent(Context context) {
        Intent intent = new Intent(context, ScheduleWidget.class);
        intent.setAction(ACTION_REFRESH);
        return PendingIntent.getBroadcast(context, 1, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
