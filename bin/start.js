#!/usr/bin/env node

require('babel-polyfill');
require("babel-register")({
	"presets": ["es2015", "stage-0"],
	"plugins": [
		["transform-decorators-legacy", "transform-async-to-generator"]
	]
});

require('../src/index.js');
