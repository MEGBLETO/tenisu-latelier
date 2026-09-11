build-ApiFunction:
	npm ci
	npx nest build
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/"
	cp -R dist "$(ARTIFACTS_DIR)/"
	rm -rf node_modules
	rm -rf "$(ARTIFACTS_DIR)/node_modules"
	cd "$(ARTIFACTS_DIR)" && npm ci --omit=dev
	rm -rf "$(ARTIFACTS_DIR)/node_modules/prisma" \
		"$(ARTIFACTS_DIR)/node_modules/typescript" \
		"$(ARTIFACTS_DIR)/node_modules/@prisma/dev" \
		"$(ARTIFACTS_DIR)/node_modules/@prisma/studio-core" \
		"$(ARTIFACTS_DIR)/node_modules/@prisma/fetch-engine" \
		"$(ARTIFACTS_DIR)/node_modules/.bin/prisma"
	find "$(ARTIFACTS_DIR)/node_modules/.bin" -type l -exec sh -c 'test -e "$$1" || rm "$$1"' _ {} \;
