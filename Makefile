all: clean build test

build:
	@mkdir -p dist
	@bigfile --write=dist/Protocol.js -pc -x Protocol

test:
	@mocha -R spec test/index.test.js

test-browser:
	@bigfile --entry=test/browser.js --write=test/browser-built.js -lb

clean:
	@rm -rf dist test/browser-built.js

Readme.md: docs/head.md docs/tail.md src/index.js
	@cat docs/head.md > Readme.md
	@cat src/index.js | sed s/^[^a-z]// | dox --api >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: all build test test-browser clean
