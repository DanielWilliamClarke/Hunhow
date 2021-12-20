package com.qrfilesharing.app;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;

import com.google.zxing.WriterException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "QRFileShare";

    public static QRFileSharingWebSocket qrFileSharingWebSocket;
    private Bitmap qrCodeBitmap;
    private QRCodeContents qrCodeContents;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // start the webSocket
        qrFileSharingWebSocket = new QRFileSharingWebSocket(this);
        qrFileSharingWebSocket.start();

        // init the view
        final Button sendButton = findViewById(R.id.sendFileButton);
        final Button receiveButton = findViewById(R.id.receiveFileButton);
        final TextView textStatus = findViewById(R.id.textStatus);
        final Button shareButton = findViewById(R.id.shareButton);
        final ImageView imageViewQrCode = findViewById(R.id.qrCodeImageView);

        // send a file
        sendButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    qrCodeBitmap = createQrCode(qrFileSharingWebSocket.connectionID);
                    imageViewQrCode.setImageBitmap(qrCodeBitmap);

                    shareButton.setVisibility(View.VISIBLE);
                    textStatus.setText(R.string.transfer_waiting);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        // receive a file
        receiveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(MainActivity.this, PictureBarcodeActivity.class));
            }
        });

        // share a qr code
        shareButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                qrCodeShare(qrCodeBitmap);
            }
        });

    }

    // create a qr code
    private Bitmap createQrCode(String connectionID) throws WriterException {
        // <version>;<connectionIDLen>;<connectionID><textHashLen>;<textHash>
        final String version = "0.1";
        String mex = version + ";" + connectionID + ";" + TextToTransfer.textHash;
        return QRUtilities.encode(mex, 400, 400, 0xFFFFFF, 0xFF004483);
    }

    // share qr code as image
    private void qrCodeShare(@NonNull Bitmap bitmap) {

        //---Save bitmap to external cache directory---//
        //get cache directory
        File cachePath = new File(getExternalCacheDir(), "my_images/");
        if (!cachePath.mkdirs()) {
            System.out.println("error on creating a cache dir");
        }

        //create png file
        File file = new File(cachePath, "Image_123.png");
        FileOutputStream fileOutputStream;
        try {
            fileOutputStream = new FileOutputStream(file);
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
            fileOutputStream.flush();
            fileOutputStream.close();

        } catch (IOException e) {
            e.printStackTrace();
        }

        //---Share File---//
        //get file uri
        Uri myImageFileUri = FileProvider.getUriForFile(this, getApplicationContext().getPackageName() + ".provider", file);

        //create a intent
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.putExtra(Intent.EXTRA_STREAM, myImageFileUri);
        intent.setType("image/png");
        startActivity(Intent.createChooser(intent, "Share with"));
    }
}
