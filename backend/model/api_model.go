package model

// ConnectMessageBody contains data required for the Connect route
type ConnectMessageBody struct {
	Action  string `json:"action"`
	Message struct {
		ConnectionID string `json:"connectionid"`
	} `json:"message"`
}

// RequestMessageBody contains data required for the Request route
type RequestMessageBody struct {
	Action  string `json:"action"`
	Message struct {
		ConnectionID string `json:"connectionid"`
		QRHash       string `json:"qrhash"`
		Message      string `json:"message"`
	} `json:"message"`
}

// TransferMessageBody contains data required for the Transfer route
type TransferMessageBody struct {
	Action  string `json:"action"`
	Message struct {
		ConnectionID string `json:"connectionid"`
		Data         string `json:"data"`
		ChunkID      int    `json:"chunkid"`
		ChunkTotal   int    `json:"chunktotal"`
		ChunkHash    string `json:"chunkhash"`
	} `json:"message"`
}

// AcknowledgeMessageBody contains data required for the Acknowledge route
type AcknowledgeMessageBody struct {
	Action  string `json:"action"`
	Message struct {
		ConnectionID    string `json:"connectionid"`
		Success         bool   `json:"success"`
		MissingChunkIDs []int  `json:"missingchunkids"`
	} `json:"message"`
}
