/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';

import * as assert from 'assert';
import { describe, it } from 'mocha';

import * as ts from 'typescript';

import propertiesRenameTransformer from '../src/transformer';

interface TestCase {
	name: string;
	inputFileName: string;
	outputFileContent: string;
}

const testCasesDir = path.resolve(__dirname, 'test-cases');

function isDirectory(filePath: string): boolean {
	return fs.lstatSync(path.resolve(testCasesDir, filePath)).isDirectory();
}

function prepareString(str: string): string {
	return str.trim().replace(/\r\n/g, '\n');
}

function getTestCases(): TestCase[] {
	if (!fs.existsSync(testCasesDir) || !fs.lstatSync(testCasesDir).isDirectory()) {
		throw new Error(`${testCasesDir} folder does not exist`);
	}

	return fs.readdirSync(testCasesDir)
		.filter((filePath: string) => {
			return isDirectory(filePath) && path.basename(filePath) !== 'node_modules';
		})
		.map((directoryName: string) => {
			const testCaseDir = path.resolve(testCasesDir, directoryName);
			const outputFileName = path.resolve(testCaseDir, 'output.js');
			const inputFileName = path.relative(process.cwd(), path.resolve(testCaseDir, 'input.ts'));

			assert(fs.existsSync(inputFileName), `Input file doesn't exist for ${directoryName}`);
			assert(fs.existsSync(outputFileName), `Output file doesn't exist for ${directoryName}`);

			const result: TestCase = {
				name: directoryName,
				inputFileName,
				outputFileContent: prepareString(fs.readFileSync(outputFileName, 'utf-8')),
			};

			return result;
		});
}

const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
	getCanonicalFileName: (fileName: string) => ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
	getCurrentDirectory: ts.sys.getCurrentDirectory,
	getNewLine: () => ts.sys.newLine,
};

function checkProgramDiagnosticsErrors(program: ts.Program): void {
	checkDiagnosticsErrors(ts.getPreEmitDiagnostics(program));
	checkDiagnosticsErrors(program.getDeclarationDiagnostics());
}

function checkDiagnosticsErrors(diagnostics: readonly ts.Diagnostic[]): void {
	assert.strictEqual(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, formatDiagnosticsHost).trim());
}

describe(`Functional tests for typescript v${ts.versionMajorMinor}`, () => {
	for (const testCase of getTestCases()) {
		it(testCase.name, () => {
			const program = ts.createProgram({
				rootNames: [testCase.inputFileName],
				options: {
					target: ts.ScriptTarget.ES5,
				},
			});

			checkProgramDiagnosticsErrors(program);

			let output: string | undefined;

			const transformer = propertiesRenameTransformer(
				program,
				{
					entrySourceFiles: [testCase.inputFileName],
					privatePrefix: '_private_',
					internalPrefix: '_internal_',
					publicJSDocTag: 'public',
				}
			);

			program.emit(
				undefined,
				(fileName: string, data: string) => {
					output = prepareString(data);
				},
				undefined,
				false,
				{
					before: [
						transformer,
					],
				}
			);

			assert.strictEqual(output, testCase.outputFileContent, 'Output should be the same as expected');
		});
	}
});
