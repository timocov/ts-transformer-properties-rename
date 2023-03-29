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

const enum Constants {
	NoInputsWereFoundDiagnosticCode = 18003,
}

const parseConfigHost: ts.ParseConfigHost = {
	useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
	readDirectory: ts.sys.readDirectory,
	fileExists: ts.sys.fileExists,
	readFile: ts.sys.readFile,
};

function getCompilerOptions(configFileName: string): ts.CompilerOptions | null {
	if (!fs.existsSync(configFileName)) {
		return null;
	}

	const configParseResult = ts.readConfigFile(configFileName, ts.sys.readFile);

	checkDiagnosticsErrors(configParseResult.error !== undefined ? [configParseResult.error] : []);

	const compilerOptionsParseResult = ts.parseJsonConfigFileContent(
		configParseResult.config,
		parseConfigHost,
		path.resolve(path.dirname(configFileName)),
		undefined,
		configFileName
	);

	// we don't want to raise an error if no inputs found in a config file
	// because this error is mostly for CLI, but we'll pass an inputs in createProgram
	const diagnostics = compilerOptionsParseResult.errors
		.filter((d: ts.Diagnostic) => d.code !== Constants.NoInputsWereFoundDiagnosticCode);

	checkDiagnosticsErrors(diagnostics);

	return compilerOptionsParseResult.options;
}

describe(`Functional tests for typescript v${ts.versionMajorMinor}`, () => {
	for (const testCase of getTestCases()) {
		it(testCase.name, () => {
			const program = ts.createProgram({
				rootNames: [testCase.inputFileName],
				options: {
					target: ts.ScriptTarget.ES5,
					...getCompilerOptions(path.join(testCase.inputFileName, '..', 'tsconfig.json')),
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
					ignoreDecorated: true,
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
