SRCS := $(shell find . -type f -name '*.go')
MAIN := cmd/main.go
BIN := bin/server
DB := main.db

.PHONY: a all
a all: fmt docs build db

.PHONY: b build
b build: $(BIN)

$(BIN): $(SRCS)
		go build -o $@ $(MAIN)

.PHONY: fmt
fmt:
		go fmt ./...
		swag fmt

.PHONY: clean
clean:
		rm -rf bin

.PHONY: db
db: $(DB)

$(DB):
	touch $(DB)

.PHONY: docs
docs: docs/swagger.json

docs/swagger.json: $(SRCS)
	swag init -q -g ./cmd/main.go
