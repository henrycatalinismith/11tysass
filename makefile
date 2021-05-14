test_nm := $(subst package.json,node_modules,$(wildcard tests/*/package.json))

test_deps: $(test_nm)
	
tests/%/node_modules:
	cd tests/$* && yarn --pure-lockfile

.PHONY: test_deps