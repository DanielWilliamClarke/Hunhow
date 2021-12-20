package fileshare

import (
	"fmt"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"

	"dev.azure.com/slb-swt/gtc-euro-hackathon/file-sharing-2020/model"
)

// New instantiates a Fileshare
func New(request model.APIGatewayWebsocketProxyRequest) *Share {
	return &Share{
		request: request,
	}
}

// Share implements file sharing lambda routes
type Share struct {
	request model.APIGatewayWebsocketProxyRequest
}

// Connect extracts websocket id from request and returns it to the client
func (s Share) Connect() (events.APIGatewayProxyResponse, error) {

	requestBody := model.ConnectMessageBody{}
	err := s.decode(&requestBody)
	if err != nil {
		log.Printf("Decode failure: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// replace with our connection id
	connectionID := s.request.RequestContext.ConnectionID
	requestBody.Message.ConnectionID = connectionID

	fmt.Printf("Connecting: %s", connectionID)
	return s.handover(connectionID, requestBody)
}

// Request ...
func (s Share) Request() (events.APIGatewayProxyResponse, error) {

	requestBody := model.RequestMessageBody{}
	err := s.decode(&requestBody)
	if err != nil {
		log.Printf("Decode failure: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// Extract receiptient connection id
	connectionID := requestBody.Message.ConnectionID
	// replace with our connection id
	requestBody.Message.ConnectionID = s.request.RequestContext.ConnectionID

	fmt.Printf("Requesting: %s", connectionID)
	return s.handover(connectionID, requestBody)
}

// Transfer ...
func (s Share) Transfer() (events.APIGatewayProxyResponse, error) {

	requestBody := model.TransferMessageBody{}
	err := s.decode(&requestBody)
	if err != nil {
		log.Printf("Decode failure: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// Extract receiptient connection id
	connectionID := requestBody.Message.ConnectionID
	// replace with our connection id
	requestBody.Message.ConnectionID = s.request.RequestContext.ConnectionID

	fmt.Printf("Transfering: %s", connectionID)
	return s.handover(connectionID, requestBody)
}

// Acknowledge ...
func (s Share) Acknowledge() (events.APIGatewayProxyResponse, error) {

	requestBody := model.AcknowledgeMessageBody{}
	err := s.decode(&requestBody)
	if err != nil {
		log.Printf("Decode failure: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	// Extract receiptient connection id
	connectionID := requestBody.Message.ConnectionID
	// replace with our connection id
	requestBody.Message.ConnectionID = s.request.RequestContext.ConnectionID

	fmt.Printf("Acknowledging: %s", connectionID)
	return s.handover(connectionID, requestBody)
}
