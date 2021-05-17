SHELL := /bin/bash

errors_txt := $(wildcard errors/*/error.txt)
examples_pkg := $(wildcard examples/*/package.json)
examples_dst := $(subst package.json,_site,examples/*/package.json)
examples_npm := $(subst package.json,node_modules,$(examples_npm))

11tysass.js: node_modules
	yarn tsc

.PHONY: clean
clean:
	rm -f 11tysass.d.ts
	rm -f 11tysass.js

.PHONY: distclean
distclean: clean
	rm -rf errors/*/node_modules
	rm -rf examples/*/node_modules
	rm -rf node_modules

.PHONY: errors
errors: errors_before $(errors_txt)

.PHONY: errors_before
errors_before:
	rm -f errors/*/error.txt

errors/%/error.txt: errors/%/node_modules
	- cd errors/$*; yarn eleventy | grep @hendotcat/11tysass | grep -v "  at " | awk '{$$1=""}1' | grep -v "rendered style" > error.txt
	@if [[ `git status --porcelain errors/$*/error.txt` ]]; then \
		git --no-pager diff errors/$*/error.txt; \
		git clean -df errors; \
		git checkout -- errors; \
		exit -1; \
	fi

errors/%/node_modules:
	cd errors/$* && yarn --pure-lockfile

.PHONY: examples
examples: examples_before $(examples_dst)

.PHONY: examples_before
examples_before:
	rm -rf examples/*/_site

examples/%/_site: examples/%/node_modules
	cd examples/$* && yarn eleventy
	@if [[ `git status --porcelain examples/$*/_site` ]]; then \
		git --no-pager diff examples/$*/_site; \
		git clean -df examples; \
		git checkout -- examples; \
		exit -1; \
	fi

examples/%/node_modules:
	cd examples/$* && yarn --pure-lockfile

node_modules:
	yarn

.PHONY: test
test: clean 11tysass.js errors examples
	
