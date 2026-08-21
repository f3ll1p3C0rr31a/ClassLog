package com.classlog.app;

import android.Manifest;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Ponte entre o app web e o que só existe no Android: a grade que alimenta o
 * widget e as notificações, e a impressão em PDF (o WebView não implementa
 * window.print(), então o relatório precisa passar pelo PrintManager).
 */
@CapacitorPlugin(
        name = "ClassLogNative",
        permissions = {
                @Permission(alias = ClassLogNativePlugin.NOTIFICATIONS, strings = { Manifest.permission.POST_NOTIFICATIONS })
        }
)
public class ClassLogNativePlugin extends Plugin {

    static final String NOTIFICATIONS = "notifications";

    // O adapter de impressão morre junto com a WebView; sem esta referência o GC
    // pode levar a view embaixo do diálogo de impressão e o PDF sai em branco.
    private WebView printWebView;

    @PluginMethod
    public void setTimetable(PluginCall call) {
        String payload = call.getString("payload");
        if (payload == null) {
            call.reject("payload obrigatório");
            return;
        }

        Timetable.save(getContext(), payload);
        ScheduleNotifier.ensureChannels(getContext());
        ScheduleWidget.refresh(getContext());
        ScheduleAlarms.scheduleNext(getContext());

        // Pedir a permissão na primeira sincronização evita uma tela de setup só
        // para isso; se o usuário negar, o resto continua funcionando.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && getPermissionState(NOTIFICATIONS) != PermissionState.GRANTED) {
            requestPermissionForAlias(NOTIFICATIONS, call, "afterNotificationPermission");
            return;
        }

        call.resolve(status());
    }

    @PermissionCallback
    private void afterNotificationPermission(PluginCall call) {
        call.resolve(status());
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
                || getPermissionState(NOTIFICATIONS) == PermissionState.GRANTED) {
            call.resolve(status());
            return;
        }
        requestPermissionForAlias(NOTIFICATIONS, call, "afterNotificationPermission");
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(status());
    }

    @PluginMethod
    public void printDocument(PluginCall call) {
        String html = call.getString("html");
        if (html == null || html.isEmpty()) {
            call.reject("html obrigatório");
            return;
        }
        String fileName = call.getString("fileName", "ClassLog");

        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = new WebView(getContext());
                webView.getSettings().setJavaScriptEnabled(false);
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        PrintManager printManager = (PrintManager) getContext().getSystemService(android.content.Context.PRINT_SERVICE);
                        if (printManager == null) {
                            call.reject("serviço de impressão indisponível");
                            printWebView = null;
                            return;
                        }

                        PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(fileName);
                        printManager.print(
                                fileName,
                                adapter,
                                new PrintAttributes.Builder()
                                        .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                        .build()
                        );
                        call.resolve();
                    }
                });

                printWebView = webView;
                webView.loadDataWithBaseURL(null, html, "text/HTML", "UTF-8", null);
            } catch (Exception error) {
                printWebView = null;
                call.reject("falha ao imprimir: " + error.getMessage());
            }
        });
    }

    private JSObject status() {
        JSObject result = new JSObject();
        result.put("notifications", Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
                || getPermissionState(NOTIFICATIONS) == PermissionState.GRANTED);
        return result;
    }
}
