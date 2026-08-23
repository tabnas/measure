.PHONY: setup build test measure site clean

HOST_ID ?= $(TABNAS_MEASURE_HOST_ID)
HOST_LABEL ?= $(TABNAS_MEASURE_HOST_LABEL)

setup:
	npm ci
	GOWORK=off go mod download

build:
	npm run build

test:
	npm test

measure:
	TABNAS_MEASURE_HOST_ID="$(HOST_ID)" TABNAS_MEASURE_HOST_LABEL="$(HOST_LABEL)" npm run measure

site:
	npm run site

clean:
	npm run clean
