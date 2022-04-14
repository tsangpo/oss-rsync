

build:
	pnpx tsc

publish: build
	#npm adduser
	#npm login
	npm publish
