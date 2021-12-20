# Backend

- [Backend](#backend)
  - [Build Golang](#build-golang)
  - [Test Golang](#test-golang)
  - [Deploy AWS Lambda](#deploy-aws-lambda)
  - [Tear down AWS Lambda](#tear-down-aws-lambda)
  - [Notes + Links](#notes--links)
    - [AWS Lambda + Websocket Gateway + Golang](#aws-lambda--websocket-gateway--golang)
    - [AWS Lambda Serverless](#aws-lambda-serverless)
  - [Ping Lambda with `WSCAT`](#ping-lambda-with-wscat)
  - [Websocket Actions](#websocket-actions)
    - [Connect](#connect)
    - [Request](#request)
    - [Transfer](#transfer)
    - [Acknowledge](#acknowledge)
  
## Build Golang

```bash
make build
```

## Test Golang

```bash
make test

# We dont have any tests, but you can use this as a playground for updates
```

## Deploy AWS Lambda

```bash
# If serverless is not installed
make serverless

# Deploy lambda to aws
make deploy
```

## Tear down AWS Lambda

```bash
make die
```

## Notes + Links

### AWS Lambda + Websocket Gateway + Golang

- <https://medium.com/@techinscribed/authenticated-serverless-websockets-using-api-gateway-golang-lambda-6e661216638>
- <https://yalantis.com/blog/how-to-build-websockets-in-go/>
- <https://docs.aws.amazon.com/lambda/latest/dg/golang-handler.html>
- <https://docs.aws.amazon.com/lambda/latest/dg/lambda-golang.html>

### AWS Lambda Serverless

- <https://www.freecodecamp.org/news/real-time-applications-using-websockets-with-aws-api-gateway-and-lambda-a5bb493e9452/>
- <https://www.serverless.com/blog/api-gateway-websockets-example>
- <https://medium.com/@sumindaniro/infrastructure-as-code-with-serverless-framework-in-aws-6c47172aab8b>

## Ping Lambda with `WSCAT`

```bash
# Install with npm
npm install -g wscat

# Ping lambda via websocket
WEBSOCKET_URL=wss://9mxi3j1vqd.execute-api.eu-west-1.amazonaws.com/dev

wscat -c $WEBSOCKET_URL -x { action: "Connect" }
```

## Websocket Actions
> Client A is sharing a file to Client B

### Connect
```Javascript
Request [JSON]: Client A
{ 
    action: "Connect"
}

Response [JSON]: Client A
{
    action: "Connect",
    message: {
        connectionid: "<ID for Client A>"
    }
}
```
### Request
```Javascript
Request [JSON]: Client B
{
    action: "Request",
    message: {
        connectionid: "<ID for Client A>",
        qrhash: "<Some Hash from QR code>",
        message: ""
    }
}

Response [JSON]: Client A
{
    action: "Request",
    message: {
        connectionid: "<ID for client B>",
        qrhash: "<Some Hash from QR code>",
        message: ""
    }
}
```
### Transfer
```Javascript
Request [JSON]: Client A
{
    action: "Transfer",
    message: {
        connectionid: "<ID for Client B>",
        data: "<data chunk>",
        chunkid: 0,
        chunktotal: 1,
        chunkhash: "<chunk hash>"
    }
}

Response [JSON]: Client B
{
    action: "Transfer",
    message: {
        connectionid:"<ID for client A>",
        data: "<data chunk>",
        chunkid: 0,
        chunktotal: 1,
        chunkhash: "<chunk hash>"
    }
}
```
### Acknowledge
```Javascript
Request [JSON]: Client B
{
    action: "Acknowledge",
    message: {
        connectionid: "<ID for Client A",
        success: false,
        missingchunkids: [2, 4, 8]
    }
}

Response [JSON]: Client A
{
    action: "Acknowledge",
    message: {
        connectionid: "<ID for Client B",
        success: false,
        missingchunkids: [2, 4, 8]
    }
}
```