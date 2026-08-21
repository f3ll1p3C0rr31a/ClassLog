package com.classlog.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Espelho nativo da grade horária que o WebView grava em SharedPreferences.
 *
 * O formato do JSON é o mesmo produzido por getTimetable()/syncTimetableToNative()
 * em app.js. Mudar campo lá exige mudar aqui — não há validação em tempo de
 * compilação entre os dois lados.
 */
public final class Timetable {

    public static final String PREFS = "classlog_timetable";
    private static final String KEY_PAYLOAD = "payload";

    /** Um bloco da grade, do jeito que está cadastrado (dia da semana + hora). */
    public static final class Entry {
        public final String id;
        public final int weekday; // 1 = segunda ... 7 = domingo (ISO)
        public final int startMinutes;
        public final int endMinutes;
        public final String title;
        public final String kind;
        public final String schoolId;
        public final String classKey;
        public final String location;

        Entry(String id, int weekday, int startMinutes, int endMinutes, String title,
              String kind, String schoolId, String classKey, String location) {
            this.id = id;
            this.weekday = weekday;
            this.startMinutes = startMinutes;
            this.endMinutes = endMinutes;
            this.title = title;
            this.kind = kind;
            this.schoolId = schoolId;
            this.classKey = classKey;
            this.location = location;
        }

        public String startLabel() {
            return formatMinutes(startMinutes);
        }

        public String endLabel() {
            return formatMinutes(endMinutes);
        }

        public boolean isClass() {
            return "class".equals(kind);
        }
    }

    /** Um bloco projetado num dia concreto, com instantes absolutos. */
    public static final class Occurrence {
        public final Entry entry;
        public final long startMillis;
        public final long endMillis;
        public final int dayOffset;

        Occurrence(Entry entry, long startMillis, long endMillis, int dayOffset) {
            this.entry = entry;
            this.startMillis = startMillis;
            this.endMillis = endMillis;
            this.dayOffset = dayOffset;
        }
    }

    public final List<Entry> entries;
    public final Map<String, String> schoolNames;
    public final boolean notificationsEnabled;
    public final int reminderMinutes;
    public final int dailySummaryMinutes;

    private Timetable(List<Entry> entries, Map<String, String> schoolNames, boolean notificationsEnabled,
                      int reminderMinutes, int dailySummaryMinutes) {
        this.entries = entries;
        this.schoolNames = schoolNames;
        this.notificationsEnabled = notificationsEnabled;
        this.reminderMinutes = reminderMinutes;
        this.dailySummaryMinutes = dailySummaryMinutes;
    }

    public boolean isEmpty() {
        return entries.isEmpty();
    }

    public String schoolNameFor(Entry entry) {
        if (entry.location != null && !entry.location.isEmpty()) {
            return entry.location;
        }
        String name = schoolNames.get(entry.schoolId);
        return name == null ? "" : name;
    }

    /* ---------------------------------------------------------------- */

    public static void save(Context context, String payload) {
        prefs(context).edit().putString(KEY_PAYLOAD, payload).apply();
    }

    public static Timetable load(Context context) {
        return parse(prefs(context).getString(KEY_PAYLOAD, null));
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static Timetable parse(String payload) {
        List<Entry> entries = new ArrayList<>();
        Map<String, String> schools = new HashMap<>();
        boolean notificationsEnabled = true;
        int reminderMinutes = 5;
        int summaryMinutes = 6 * 60 + 30;

        if (payload == null || payload.isEmpty()) {
            return new Timetable(entries, schools, notificationsEnabled, reminderMinutes, summaryMinutes);
        }

        try {
            JSONObject root = new JSONObject(payload);
            notificationsEnabled = root.optBoolean("notificationsEnabled", true);
            reminderMinutes = root.optInt("reminderMinutes", 5);

            int parsedSummary = parseTime(root.optString("dailySummaryTime", "06:30"));
            if (parsedSummary >= 0) {
                summaryMinutes = parsedSummary;
            }

            JSONObject schoolsJson = root.optJSONObject("schools");
            if (schoolsJson != null) {
                for (java.util.Iterator<String> it = schoolsJson.keys(); it.hasNext(); ) {
                    String key = it.next();
                    JSONObject school = schoolsJson.optJSONObject(key);
                    if (school != null) {
                        schools.put(key, school.optString("name", ""));
                    }
                }
            }

            JSONArray array = root.optJSONArray("entries");
            if (array != null) {
                for (int index = 0; index < array.length(); index++) {
                    JSONObject item = array.optJSONObject(index);
                    if (item == null) continue;

                    int weekday = item.optInt("weekday", 0);
                    int start = parseTime(item.optString("start", ""));
                    int end = parseTime(item.optString("end", ""));
                    String title = item.optString("title", "").trim();

                    if (weekday < 1 || weekday > 7 || start < 0 || end <= start || title.isEmpty()) {
                        continue;
                    }

                    entries.add(new Entry(
                            item.optString("id", "entry-" + index),
                            weekday,
                            start,
                            end,
                            title,
                            item.optString("kind", "class"),
                            item.optString("schoolId", ""),
                            item.optString("classKey", ""),
                            item.optString("location", "")
                    ));
                }
            }
        } catch (Exception error) {
            // Payload corrompido vira grade vazia: o widget mostra "sem aulas"
            // em vez de derrubar o processo do launcher.
            entries.clear();
        }

        Collections.sort(entries, (a, b) -> {
            if (a.weekday != b.weekday) return a.weekday - b.weekday;
            return a.startMinutes - b.startMinutes;
        });

        return new Timetable(entries, schools, notificationsEnabled, reminderMinutes, summaryMinutes);
    }

    private static int parseTime(String value) {
        if (value == null) return -1;
        String[] parts = value.trim().split(":");
        if (parts.length != 2) return -1;
        try {
            int hours = Integer.parseInt(parts[0]);
            int minutes = Integer.parseInt(parts[1]);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;
            return hours * 60 + minutes;
        } catch (NumberFormatException error) {
            return -1;
        }
    }

    public static String formatMinutes(int minutes) {
        return String.format(java.util.Locale.getDefault(), "%02d:%02d", minutes / 60, minutes % 60);
    }

    public static int isoWeekday(Calendar calendar) {
        int day = calendar.get(Calendar.DAY_OF_WEEK);
        return day == Calendar.SUNDAY ? 7 : day - 1;
    }

    /** Projeta a grade em ocorrências absolutas, a partir de agora, em ordem. */
    public List<Occurrence> occurrencesFrom(long referenceMillis, int daysAhead) {
        List<Occurrence> result = new ArrayList<>();
        if (entries.isEmpty()) return result;

        Calendar day = Calendar.getInstance();
        day.setTimeInMillis(referenceMillis);
        day.set(Calendar.HOUR_OF_DAY, 0);
        day.set(Calendar.MINUTE, 0);
        day.set(Calendar.SECOND, 0);
        day.set(Calendar.MILLISECOND, 0);
        long midnight = day.getTimeInMillis();

        for (int offset = 0; offset < daysAhead; offset++) {
            Calendar cursor = Calendar.getInstance();
            cursor.setTimeInMillis(midnight);
            cursor.add(Calendar.DAY_OF_YEAR, offset);
            int weekday = isoWeekday(cursor);
            long dayStart = cursor.getTimeInMillis();

            for (Entry entry : entries) {
                if (entry.weekday != weekday) continue;
                result.add(new Occurrence(
                        entry,
                        dayStart + entry.startMinutes * 60_000L,
                        dayStart + entry.endMinutes * 60_000L,
                        offset
                ));
            }
        }

        Collections.sort(result, (a, b) -> Long.compare(a.startMillis, b.startMillis));
        return result;
    }

    public Occurrence currentAt(long referenceMillis) {
        for (Occurrence occurrence : occurrencesFrom(referenceMillis, 1)) {
            if (occurrence.startMillis <= referenceMillis && referenceMillis < occurrence.endMillis) {
                return occurrence;
            }
        }
        return null;
    }

    public List<Occurrence> upcomingFrom(long referenceMillis, int limit) {
        List<Occurrence> upcoming = new ArrayList<>();
        for (Occurrence occurrence : occurrencesFrom(referenceMillis, 8)) {
            if (occurrence.startMillis > referenceMillis) {
                upcoming.add(occurrence);
                if (upcoming.size() >= limit) break;
            }
        }
        return upcoming;
    }

    public List<Occurrence> forDay(long referenceMillis) {
        List<Occurrence> today = new ArrayList<>();
        for (Occurrence occurrence : occurrencesFrom(referenceMillis, 1)) {
            if (occurrence.dayOffset == 0) today.add(occurrence);
        }
        return today;
    }
}
