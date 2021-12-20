package com.qrfilesharing.app;

import android.graphics.Bitmap;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.NotFoundException;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.Result;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;

import java.nio.ByteBuffer;

public class QRUtilities {

    @SuppressWarnings("unused")
    public static Bitmap encode(String message, int width, int height, int foreground, int background) throws IllegalArgumentException, WriterException {

        BitMatrix bitMatrix = new MultiFormatWriter().encode(message, BarcodeFormat.QR_CODE, width, height);

        final int w = bitMatrix.getWidth();
        final int h = bitMatrix.getHeight();
        final int[] pixels = new int[w * h];

        for (int y = 0; y < h; y++) {
            final int offset = y * w;
            for (int x = 0; x < w; x++) {
                pixels[offset + x] = bitMatrix.get(x, y) ? foreground : background;
            }
        }

        final Bitmap qrCodeBitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        qrCodeBitmap.setPixels(pixels, 0, width, 0, 0, w, h);

        return qrCodeBitmap;
    }

    @SuppressWarnings("unused")
    public static String decode(Bitmap qrCodeImage) throws NotFoundException {

        int[] intArray = new int[qrCodeImage.getWidth()*qrCodeImage.getHeight()];
        qrCodeImage.getPixels(intArray, 0, qrCodeImage.getWidth(), 0, 0, qrCodeImage.getWidth(), qrCodeImage.getHeight());

        LuminanceSource source = new RGBLuminanceSource(qrCodeImage.getWidth(), qrCodeImage.getHeight(), intArray);
        BinaryBitmap binaryBitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result result = new MultiFormatReader().decode(binaryBitmap);
        return result.getText();

    }

    @SuppressWarnings("unused")
    public static byte[] bitmapToByteArray(Bitmap qrCodeImage) {

        int size = qrCodeImage.getRowBytes() * qrCodeImage.getHeight();
        ByteBuffer byteBuffer = ByteBuffer.allocate(size);
        qrCodeImage.copyPixelsToBuffer(byteBuffer);
        return byteBuffer.array();

    }

    @SuppressWarnings("unused")
    public static Bitmap byteArrayToBitmap(byte[] byteArray, int width, int height) {

        Bitmap image = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        ByteBuffer buffer = ByteBuffer.wrap(byteArray);
        image.copyPixelsFromBuffer(buffer);
        return image;

    }

}
