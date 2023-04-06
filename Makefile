help:
	@echo "make build     Build the app."
	@echo "make start     Start the app for development."
	@echo "make clean     Clean the build artifacts."
	@echo "make test      Run tests."

build: node_modules src
	yarn build
	touch src/js

start: node_modules
	yarn dev

clean: node_modules
	yarn clean-dist

deploy: node_modules
	git switch main && git push all && git push
	git switch stage && git pull && git merge main && git push all && git push
	git switch main

distclean: clean
	rm -rf node_modules

test: node_modules
	yarn test

######################################################################

node_modules : yarn.lock package.json
	yarn
	touch node_modules
