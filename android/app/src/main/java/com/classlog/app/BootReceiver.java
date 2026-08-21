package com.classlog.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Alarmes não sobrevivem a reboot nem a atualização do app — sem isto, as
 * notificações do horário parariam em silêncio até o app ser aberto de novo.
 */
public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Context appContext = context.getApplicationContext();
        ScheduleNotifier.ensureChannels(appContext);
        ScheduleWidget.refresh(appContext);
        ScheduleAlarms.scheduleNext(appContext);
    }
}
