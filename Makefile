help:
	@echo "make build     Build the app."
	@echo "make start     Start the app for development."
	@echo "make clean     Clean the build artifacts."
	@echo "make test      Run tests."

build: .yarn/cache src
	yarn build
	touch src/js

start: .yarn/cache
	yarn dev

clean: .yarn/cache
	yarn clean-dist

distclean: clean
	rm -rf .yarn/cache

test: .yarn/cache
	yarn test

######################################################################

.yarn/cache : yarn.lock package.json
	yarn
	touch .yarn/cache
