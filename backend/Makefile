.PHONY: build

build:
	@GOOS=linux GOARCH=amd64 \
	go build -o ./build/file-sharing-2020
test: 
	@go test -v ./...

serverless: 
	@npm install -g serverless@1.73.1
	@sls plugin install -n serverless-pseudo-parameters

deploy:
	@serverless deploy --stage dev

die:
	@serverless remove