SHELL := /bin/bash -o pipefail

branch			?= master

all: build install

.PHONY: install
install: build
		if [ "${branch}" == "master" ]; then \
			rsync -avtogpz -e ssh ./dist/ root@172.16.1.10:/mnt/html/yyj.insitpace.com; \
			ssh root@172.16.1.10 "chown -R www.www /mnt/html/yyj.insitpace.com"; \
		fi; if [ "${branch}" == "hotfix" ]; then \
			rsync -avtogpz -e ssh ./dist/ root@172.16.1.10:/mnt/html/yyj-rc.insitpace.com; \
			ssh root@172.16.1.10 "chown -R www.www /mnt/html/yyj-rc.insitpace.com"; \
		fi; if [ "${branch}" == "release" ]; then \
			rsync -avtogpz -e ssh ./dist/ root@172.16.1.10:/mnt/html/yyj-beta.insitpace.com; \
			ssh root@172.16.1.10 "chown -R www.www /mnt/html/yyj-beta.insitpace.com"; \
		fi; if [ "${branch}" == "develop" ]; then \
			rsync -avtogpz -e ssh ./dist/ root@172.16.1.10:/mnt/html/yyj-alpha.insitpace.com; \
			ssh root@172.16.1.10 "chown -R www.www /mnt/html/yyj-alpha.insitpace.com"; \
		fi

.PHONY: build
build:
		rm -rf ./dist/; \
		npm run build:$(branch);