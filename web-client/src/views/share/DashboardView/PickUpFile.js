import React, { Component } from 'react';
// import { FilePicker } from 'react-file-picker';
import QRCode from "react-qr-code";
import CryptoJS from 'crypto-js';
import ReactFileReader from 'react-file-reader';

import {
  Grid,
  Typography,
  Box,
  Button
} from '@material-ui/core';

import Image from 'material-ui-image'

const URL = 'wss://9mxi3j1vqd.execute-api.eu-west-1.amazonaws.com/dev'

class PickUpFile extends Component {
  constructor() {
    super()
    this.state = { value: "Empty", textFromFile: "NO CONTENT", count: 0, readerfile: "" , mime: "", IsImage: false, fileName: ""};
  }

  ws = new WebSocket(URL);

  connectionID = "";

  dataToSend = "";
  hashMD5 = "";
  version = "0.1";

  messageToSend = "";

  getConnectionIdRequest = () => {
    const message = { action: "Connect" }
    this.ws.send(JSON.stringify(message))
  };

  transferData = (connectionId, data, hash) => {
    //encode data to base64
    var base64EncodedData = btoa(data);
    const message = { action: "Transfer", message: { connectionid: connectionId, data: base64EncodedData, chunkid: 0, chunktotal: 1, chunkhash: hash } }
    this.ws.send(JSON.stringify(message))
  };

  base64toBlob = (b64Data, contentType) => {
    console.log("...mime: ", contentType);
    contentType = contentType || '';
    var sliceSize = 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  handleFiles = files => {
    var decodedFileData = "";
    var isImage = false;
    var name = "";
    if(files.fileList[0].size < 30000){
      var mimeCode = (((files.base64).split("base64,")[0]).split(":")[1]).slice(0, -1);
      var encodedData = (files.base64).split("base64,")[1];
      console.log("Mime code:", mimeCode);
      if (mimeCode.indexOf("image") === -1) {
        console.log("Not image");
        decodedFileData = atob(encodedData);
      } else {
        console.log("Image...");
        decodedFileData = encodedData
              isImage = true;
      }
      name = files.fileList[0].name;
    }else{
      name = "File size exceed 30kBytes!!!"
    }

    this.setState({
      readerFile: decodedFileData,
      mime: mimeCode,
      IsImage : isImage,
      fileName: name
    });
    console.log(files)
    this.createQRCode(files.fileList[0], files.base64);
  };

  createQRCode = (file, encodedData) => {
    // "Hermod;" + connedtionID + ";" + qrHash + ";" + fName + ";" 
    console.log('Creating QR code to send file', file.name, file.type);
    this.dataToSend = encodedData;
    this.hashMD5 = CryptoJS.MD5(encodedData).toString();
    this.messageToSend = "Hermod;" + this.connectionID + ";" + this.hashMD5 + ";" + file.name;
    this.setState({ value: this.messageToSend });
    console.log('message to Transfer:', this.messageToSend);
  };

  componentDidMount() {

    this.ws.onopen = () => {
      console.log('Web socket endpoint connected')
      this.getConnectionIdRequest();
    };

    this.ws.onmessage = evt => {
      const message = JSON.parse(evt.data)
      console.log("Incomming message:", message);
      switch (message.action) {
        case "Connect":
          this.connectionID = message.message.connectionid
          console.log("ConnectionID:", this.connectionID);
          break;
        case "Request":
          //Starts transfer data
          this.transferData(message.message.connectionid, this.dataToSend, this.hashMD5);
          break;
        case "Transfer":
          console.log("Unexpected response...");
          break;
        case "Acknowledge":
          console.log("Got response from Receiver about transfer status", message);
          break;
        default:
          break;
      }
    };

    this.ws.onclose = () => {
      console.log('disconnected')
    };
  }

  render() {
    return (
      <Grid
        container
        justify="space-between"
        spacing={3}
      >
        <Grid
          item
        >
          <Typography
            color="textSecondary"
            gutterBottom
            variant="h6"
          >
            <ReactFileReader base64={true} multipleFiles={false} handleFiles={this.handleFiles}>
              <Button variant="contained" color="primary">Pick up file</Button>
            </ReactFileReader>
          </Typography>
        </Grid>
        <Grid
          item
          border={1}
        >
          <Typography
            color="textSecondary"
            gutterBottom
            variant="h6"
          >
            <Box padding={2} border={2} >
              {this.state.value && <QRCode value={this.state.value} />}
            </Box>
          </Typography>
        </Grid>
        <Grid
          item
        >
          <Typography
            color="textSecondary"
            gutterBottom
            variant="h6"
          >
            <Box padding={2} border={2}>
              {this.state.fileName}
            </Box>
            <Box padding={2} border={2} width={"256px"} height={"256px"}>
              {!this.state.IsImage && this.state.readerFile}
              {this.state.IsImage && <Image src = {global.URL.createObjectURL(this.base64toBlob(this.state.readerFile, this.state.mime))} /> }
            </Box>
          </Typography>
        </Grid>
      </Grid>
    )
  }
}

export default PickUpFile;
