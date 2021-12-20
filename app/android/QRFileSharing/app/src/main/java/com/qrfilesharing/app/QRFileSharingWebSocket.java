package com.qrfilesharing.app;

import android.app.Activity;
import android.util.Log;
import android.widget.TextView;

import com.neovisionaries.ws.client.WebSocket;
import com.neovisionaries.ws.client.WebSocketAdapter;
import com.neovisionaries.ws.client.WebSocketException;
import com.neovisionaries.ws.client.WebSocketExtension;
import com.neovisionaries.ws.client.WebSocketFactory;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;

public class QRFileSharingWebSocket extends Thread {

    public String connectionID;
    private Activity parent;
    private TextView textStatus;
    private String receiveConnectionId;
    private WebSocket webSocket;
    private boolean receiveMode = false;
    private boolean firstTransfer = false;
    private int totalChunksRecieved = 0;

    public QRFileSharingWebSocket(Activity activity) {
        parent = activity;
        parent.runOnUiThread(new Runnable() {
            @Override
            public final void run() {
                textStatus = parent.findViewById(R.id.textStatus);
            }
        });
    }

    public void receiveFile(QRCodeContents qrcode) {
        //this.receiveConnectionId = qrcode.getConnectionId();
        //String qrHash = qrcode.getTexthash();
        this.receiveConnectionId = "TbeepeCvjoECG3A=";
        String qrHash = "-1085532208";
        Log.v("QRsharing", "DAB: QRFileSharingWebSocket: got connection id " + this.receiveConnectionId);
        String text_to_send = "{\"action\":\"Request\",\"message\":{\"connectionid\":\"" + receiveConnectionId + "\",\"qrhash\":\"" + qrHash + "\",\"message\":\"\"}}";
        Log.v("QRsharing", "DAB: sending test_to_send: " + text_to_send);
        receiveMode = true;
        firstTransfer = true;
        webSocket.sendText(text_to_send);
    }

    public void run() {
        try {
            webSocket = new WebSocketFactory()
                    .setConnectionTimeout(5000)
                    .createSocket("wss://9mxi3j1vqd.execute-api.eu-west-1.amazonaws.com/dev")
                    .addListener(new WebSocketAdapter() {

                        @Override
                        public void onTextMessage(WebSocket websocket, String message) throws JSONException {

                             System.out.println("--- Message: " + message);

                            JSONObject jsonMex = new JSONObject(message);
                            final String rcvAction = jsonMex.getString("action");

                                if (rcvAction.toLowerCase().equals("connect")) {
                                    connectionID = jsonMex.getJSONObject("message").getString("connectionid");
                                    return;
                                }

                            if (! receiveMode) {
                                if (rcvAction.toLowerCase().equals("request")) {
                                    int totTrx = 10;
                                    final String rcvConnectionID = jsonMex.getJSONObject("message").getString("connectionid");
                                    final String qrHash = jsonMex.getJSONObject("message").getString("qrhash");
                                    if (qrHash.equals("" + TextToTransfer.text.hashCode())) {
                                        for (int ii = 0; ii < totTrx; ii++)
                                            websocket.sendText("{\"action\":\"Transfer\",\"message\":" +
                                                    "{\"connectionid\":\"" + rcvConnectionID + "\"," +
                                                    "\"data\":\"" + TextToTransfer.text + " " + ii + "\"," +
                                                    "\"chunkid\":" + ii + ",\"chunktotal\":" + totTrx + ",\"chunkhash\":\"\"}}");
                                        textStatus.setText(R.string.transfer_in_progress);
                                    } else {
                                        System.out.println("qr hash not recognized - request ignored");
                                    }
                                    return;
                                }

                                if (rcvAction.toLowerCase().equals("acknowledge")) {
                                    final String success = jsonMex.getJSONObject("message").getString("success");
                                    if (success.toLowerCase().equals("true")) {
                                        textStatus.setText(R.string.transfer_completed);
                                    } else {
                                        System.out.println("Transfer Error");
                                    }
                                }
                            } else {
                                // called once per chunk
                                if (rcvAction.toLowerCase().equals("transfer")) {
                                    totalChunksRecieved++;
                                    if (totalChunksRecieved == 10) {
                                        String text_to_send = "{\"action\":\"Acknowledge\",\"message\":{\"connectionid\":\"" + receiveConnectionId + "\",\"success\":true,\"missingchunkids:\":[]}}";
                                        Log.v("QRsharing", "DAB: sending acknowledgment: " + text_to_send);
                                        websocket.sendText(text_to_send);
                                    }
                                }
                            }
                        }

                        @Override
                        public  void onConnected(WebSocket websocket, Map map) {
                            textStatus.setText(R.string.transfer_connected);
                            websocket.sendText("{\"action\": \"Connect\"}");
                        }

                    })
                    .addExtension(WebSocketExtension.PERMESSAGE_DEFLATE)
                    .connect();
        } catch (WebSocketException | IOException e) {
            e.printStackTrace();
        }
    }
}
