.PHONY: setup build test measure site clean

setup:
	npm ci
	GOWORK=off go mod download

build:
	npm run build

test:
	npm test

measure:
	npm run measure

site:
	npm run site

clean:
	npm run clean
