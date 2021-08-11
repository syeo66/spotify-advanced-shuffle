help:
	@echo "make build     Build the app."
	@echo "make start     Start the app for development."
	@echo "make clean     Clean the build artifacts."
	@echo "make test      Run tests."

build: .pnp.cjs src
	yarn build
	touch src/js

start: .pnp.cjs
	yarn dev

clean: .pnp.cjs
	yarn clean-dist

distclean: clean
	rm -rf .pnp.cjs

test: .pnp.cjs
	yarn test

######################################################################

.pnp.cjs : yarn.lock package.json
	yarn
	touch .pnp.cjs
