'use strict';

const path = require('path');

// override tsconfig for tests
process.env.TS_NODE_PROJECT = path.resolve(__dirname, './tests/tsconfig.json');

module.exports = {
	require: [
		'ts-node/register',
	],
	extension: ['ts'],
	timeout: 10000,
	checkLeaks: true,
	recursive: true,
	diff: true,
};
