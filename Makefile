help:
	@echo "make build     Build the app."
	@echo "make start     Start the app for development."
	@echo "make clean     Clean the build artifacts."
	@echo "make test      Run tests."

build : src/js

start: node_modules
	yarn dev

clean: node_modules
	yarn clean-dist

distclean: clean
	rm -rf node_modules

test: node_modules
	yarn test

######################################################################

src/js : node_modules src
	yarn build

node_modules : yarn.lock package.json
	yarn
	touch node_modules
