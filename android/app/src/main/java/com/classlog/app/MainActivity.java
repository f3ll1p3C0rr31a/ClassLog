package com.classlog.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Precisa vir antes do super: o bridge lê a lista de plugins no onCreate.
        registerPlugin(ClassLogNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
