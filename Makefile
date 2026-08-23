.PHONY: setup build test measure site clean

HOST_KEY ?= $(TABNAS_MEASURE_HOST_KEY)

setup:
	npm ci
	GOWORK=off go mod download

build:
	npm run build

test:
	npm test

measure:
	@TABNAS_MEASURE_HOST_KEY="$(HOST_KEY)" npm run measure

site:
	npm run site

clean:
	npm run clean
