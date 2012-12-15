all: clean build test docs

build:
	@mkdir dist
	@bigfile --write=dist/Protocol -pc

test:
	@mocha -R spec test/index.test.js

test-browser:
	@bigfile --entry=test/browser.js --write=test/browser-built.js -lb

clean:
	@rm -rf dist test/browser-built.js

docs:
	@cat docs/head.md > Readme.md
	@dox --api < src/index.js >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: all build test test-browser clean docs
