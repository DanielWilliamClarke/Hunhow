package com.qrfilesharing.app;

public class QRCodeContents {
    final private String DEFAULT_VERSION = "0.1";
    private String connectionId = "";
    private String texthash = "";
    private String version = DEFAULT_VERSION;

    public QRCodeContents (String results) {
        String[] parts = new String [3];
        parts = results.split(";");
        this.setVersion(parts[0]);
        this.setConnectionId(parts[1]);
        this.setTexthash(parts[2]);
    }
    public void setConnectionId(String id) {
        this.connectionId = id;
    }
    public String getConnectionId() {
        return this.connectionId;
    }

    public void setTexthash(String texthash) {
        this.texthash = texthash;
    }
    public String getTexthash() {
        return this.texthash;
    }

    public void setVersion(String version) {
        this.version = version;
    }
    public String getVersion() {
        return this.version;
    }
}
