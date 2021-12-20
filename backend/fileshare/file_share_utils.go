package fileshare

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
)

func (s Share) decode(requestBody interface{}) error {
	// Decode request body
	err := json.NewDecoder(strings.NewReader(s.request.Body)).Decode(requestBody)
	if err != nil {
		log.Printf("Unable to decode body: %v", err)
		return err
	}

	return nil
}

func (s Share) handover(connectionID string, data interface{}) (events.APIGatewayProxyResponse, error) {

	// Safely re-encode data to ensure no extra fields slip through
	responseBody, err := json.Marshal(data)
	if err != nil {
		log.Printf("Unable to encode body: %v", err)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
		}, err
	}

	response, err := s.send(connectionID, string(responseBody))
	if err != nil {
		log.Printf("Reply failure: %v", err)
		return response, err
	}

	return response, err
}

func (s Share) send(connectionID string, data string) (events.APIGatewayProxyResponse, error) {
	// Create session
	sesh, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-west-1"),
	})
	if err != nil {
		log.Println("Failed to get AWS session")
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusServiceUnavailable,
		}, err
	}

	// Create response config
	config := aws.NewConfig().WithEndpoint(
		fmt.Sprintf("https://%s/%s", s.request.RequestContext.DomainName, s.request.RequestContext.Stage))

	// Create gateway and post message back
	apigateway := apigatewaymanagementapi.New(sesh, config)

	// Reply with data
	_, err = apigateway.PostToConnection(&apigatewaymanagementapi.PostToConnectionInput{
		ConnectionId: aws.String(connectionID),
		Data:         []byte(data),
	})
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadGateway,
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}
