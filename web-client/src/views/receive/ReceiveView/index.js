/* eslint-disable linebreak-style */
import React, { Component } from 'react';
import QrReader from 'react-qr-scanner'
// import CryptoJS from 'crypto-js';

import {
  Grid,
  Typography,
  Box
} from '@material-ui/core';

import Image from 'material-ui-image'

const URL = 'wss://9mxi3j1vqd.execute-api.eu-west-1.amazonaws.com/dev'

class ReceiveView extends Component {

  ws = new WebSocket(URL);

  connectionID = "";
  senderConnectionId = "";
  version = "0.1";

  constructor(props) {
    super(props)
    this.state = { cameraId: undefined, delay: 500, devices: [], loading: false, readerfile: "" , mime: "", IsImage: false, fileName: "" }
  }

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

  sendRequest = data => {
    const message = { action: "Request", message: {connectionid: data[1], qrhash: data[2],message: "I would like to get your file..."}}
    this.ws.send(JSON.stringify(message))
  };

  sendAcknowledge = (connectionId, status, missingchunks) => {
    const message = { action: "Acknowledge", message: {connectionid: connectionId, success: status, missingchunkids: missingchunks}}
    this.ws.send(JSON.stringify(message))
  };

  handleScan = data => {
    console.log(data)
    //Send request to get data
    //parse data
    if(data && data !== "Empty"){
      var dataArray = data.split(";");
      this.senderConnectionId = dataArray[1];
      console.log(dataArray);

      this.sendRequest(dataArray);
    }
  };

  handleError(err) {
    console.error(err)
  };

  chooseDevice = () => {
    console.log("called chooseDevice()")
  };

  getConnectionIdRequest = () => {
    const message = { action: "Connect" }
    this.ws.send(JSON.stringify(message))
  };

  componentDidMount() {
    const { selectFacingMode } = this.props

    if (navigator && selectFacingMode) {
      this.setState({
        loading: true,
      })

      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoSelect = []
          devices.forEach((device) => {
            if (device.kind === 'videoinput') {
              videoSelect.push(device)
            }
          })
          return videoSelect
        })
        .then((devices) => {
          this.setState({
            cameraId: devices[0].deviceId,
            devices,
            loading: false,
          })
        })
        .catch((error) => {
          console.log(error)
        })
    }

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
          console.log("Unexpected response...");
          break;
        case "Transfer":
          //decode base64 data
          var isImage = false;

          var decodedFileData = "";
          var decodedArray = atob(message.message.data).split("base64,");
          console.log(decodedArray); 
          var mimeCode = ((decodedArray[0]).split(":")[1]).slice(0, -1);
          var encodedData = decodedArray[1];

          if (mimeCode.indexOf("image") === -1) {
            console.log("Not image");
            decodedFileData = atob(encodedData);
          } else {
            console.log("Image...");
            decodedFileData = encodedData
            isImage = true;
          }
    
          console.log("Got data...", mimeCode);
          
          this.setState({
            readerFile: decodedFileData,
            mime: mimeCode,
            IsImage : isImage,
          });

          //Send Acknowledge
          this.sendAcknowledge(this.senderConnectionId, true, []);
          break;
        case "Acknowledge":
          console.log("Unexpected response...");
          break;
        default:
          break;
      }
    };

    this.ws.onclose = () => {
      console.log('disconnected')
    };
  }

  selectCamera = () => {
    return this.state.cameraId
  }

  render() {
    const { selectFacingMode, selectDelay, legacyMode } = this.props
    const { cameraId, devices } = this.state

    const previewStyle = { width: 256 }
    return (
      <div>
        {
          selectFacingMode && devices.length && (
            <select
              onChange={e => {
                const value = e.target.value
                this.setState({ cameraId: undefined }, () => {
                  this.setState({ cameraId: value })
                })
              }}
            >
              {devices.map((deviceInfo, index) => (
                <React.Fragment key={deviceInfo.deviceId}><option value={deviceInfo.deviceId}>{deviceInfo.label || `camera ${index}`}</option></React.Fragment>
              ))}
            </select>
          )
        }
        {
          selectDelay && (
            <div>
              <button onClick={() => this.setState({ delay: false })}>
                Disable Delay
                </button>
              <input
                placeholder="Delay in ms"
                type="number"
                value={this.state.delay}
                onChange={e =>
                  this.setState({ delay: parseInt(e.target.value) })}
              />
            </div>
          )
        }
        {(cameraId || !selectFacingMode) && (<QrReader
          chooseDeviceId={this.selectCamera}
          style={previewStyle}
          onError={this.handleError}
          onScan={this.handleScan}
          ref="reader"
          maxImageSize={1000}
          delay={this.state.delay}
          className="reader-container"
        />)}
        {
          legacyMode && (
            <button onClick={() => this.refs.reader.openImageDialog()}>
              Open Image Dialog
            </button>
          )
        }
        {<Grid
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
            <Box padding={2} border={2} width={"256px"} height={"256px"}>
              {!this.state.IsImage && this.state.readerFile}
              {this.state.IsImage && <Image src = {global.URL.createObjectURL(this.base64toBlob(this.state.readerFile, this.state.mime))} /> }
            </Box>
          </Typography>
        </Grid>
      </Grid>}
      </div>
    )
  }
}

export default ReceiveView;
