package main

import (
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"dev.azure.com/slb-swt/gtc-euro-hackathon/file-sharing-2020/fileshare"
	"dev.azure.com/slb-swt/gtc-euro-hackathon/file-sharing-2020/model"
)

func main() {
	lambda.Start(func(request model.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {

		fmt.Printf("Websocket request endpoint: %s", request.RequestContext.RouteKey)
		share := fileshare.New(request)

		switch request.RequestContext.RouteKey {
		case "Connect":
			return share.Connect()
		case "Request":
			return share.Request()
		case "Transfer":
			return share.Transfer()
		case "Acknowledge":
			return share.Acknowledge()
		default:
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusNoContent,
			}, nil
		}
	})
}
