all: test/built.js test Readme.md

test:
	@node_modules/.bin/mocha -R spec test/index.test.js

test/built.js: src/* test/*
	@node_modules/.bin/sourcegraph.js test/browser.js \
		--plugins mocha,nodeish,javascript \
		| node_modules/.bin/bigfile \
		 	--export null \
		 	--plugins nodeish > $@

Readme.md: docs/* src/*
	@cat docs/head.md > Readme.md
	@cat src/index.js | dox --api >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: all test
