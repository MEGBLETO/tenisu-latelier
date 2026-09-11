build-ApiFunction:
	npm ci
	npx nest build
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/"
	cp -R dist "$(ARTIFACTS_DIR)/"
	rm -rf "$(ARTIFACTS_DIR)/node_modules"
	cd "$(ARTIFACTS_DIR)" && npm ci --omit=dev
