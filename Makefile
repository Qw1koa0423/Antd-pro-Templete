SHELL := /bin/bash -o pipefail

branch			?= master

all: build install

.PHONY: install
install: build
		if [ "${branch}" == "master" ]; then \
			rsync -avtogpz -e "ssh -J root@180.76.113.59" ./dist/ root@172.16.1.10:/mnt/html/******; \
			ssh -J root@180.76.113.59 root@172.16.1.10 "chown -R www.www /mnt/html/******"; \
		fi; if [ "${branch}" == "hotfix" ]; then \
			rsync -avtogpz -e "ssh -J root@180.76.113.59" ./dist/ root@172.16.1.10:/mnt/html/******; \
			ssh -J root@180.76.113.59 root@172.16.1.10 "chown -R www.www /mnt/html/******"; \
		fi; if [ "${branch}" == "release" ]; then \
			rsync -avtogpz -e "ssh -J root@180.76.113.59" ./dist/ root@172.16.1.10:/mnt/html/******; \
			ssh -J root@180.76.113.59 root@172.16.1.10 "chown -R www.www /mnt/html/******"; \
		fi; if [ "${branch}" == "develop" ]; then \
			rsync -avtogpz -e "ssh -J root@180.76.113.59" ./dist/ root@172.16.1.10:/mnt/html/******; \
			ssh -J root@180.76.113.59 root@172.16.1.10 "chown -R www.www /mnt/html//mnt/html/******"; \
		fi

.PHONY: build
build:
		rm -rf ./dist/; \
		npm run build:$(branch);