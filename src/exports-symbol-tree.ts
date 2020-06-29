import * as ts from 'typescript';

import {
	getActualSymbol,
	splitTransientSymbol,
	isClassMember,
	hasPrivateKeyword,
	getExportsForSourceFile,
	getDeclarationsForSymbol,
} from './typescript-helpers';

export class ExportsSymbolTree {
	private readonly program: ts.Program;
	private readonly exportsTree: Map<ts.Symbol, Set<ts.Symbol>> = new Map();

	public constructor(program: ts.Program, entrySourceFiles: readonly string[]) {
		this.program = program;
		this.computeTreeForExports(entrySourceFiles);
	}

	public isSymbolAccessibleFromExports(symbol: ts.Symbol): boolean {
		symbol = this.getActualSymbol(symbol);

		let result = false;
		this.exportsTree.forEach((set: Set<ts.Symbol>) => {
			result = result || set.has(symbol);
		});

		return result;
	}

	private computeTreeForExports(entrySourceFiles: readonly string[]): void {
		this.exportsTree.clear();

		const typeChecker = this.program.getTypeChecker();
		for (const filePath of entrySourceFiles) {
			const entrySourceFile = typeChecker.getSymbolAtLocation(this.program.getSourceFile(filePath) as ts.SourceFile);
			if (entrySourceFile === undefined) {
				throw new Error(`Cannot find symbol for source file ${filePath}`);
			}

			for (const entryExportSymbol of getExportsForSourceFile(typeChecker, entrySourceFile)) {
				const exportSymbolsSet = new Set<ts.Symbol>();
				this.exportsTree.set(entryExportSymbol, exportSymbolsSet);

				for (const exportDeclaration of getDeclarationsForSymbol(entryExportSymbol)) {
					this.computeTreeForChildren(exportSymbolsSet, exportDeclaration, new Set<ts.Symbol>());
				}
			}
		}
	}

	private computeTreeForChildren(targetSymbolsSet: Set<ts.Symbol>, node: ts.Node, visitedSymbols: Set<ts.Symbol>): void {
		// it's similar to handling ts.Block node - both Block and variable's initializer are part of _implementation_
		// and we don't care about that implementation at all - we just only need to worry it's definition
		// for functions it is arguments and return type
		// for variables - the type of a variable
		if (ts.isVariableDeclaration(node)) {
			const typeChecker = this.program.getTypeChecker();
			const variableType = typeChecker.getTypeAtLocation(node);
			const variableTypeSymbol = variableType.getSymbol();
			if (variableTypeSymbol !== undefined) {
				targetSymbolsSet.add(variableTypeSymbol);
			}

			return;
		}

		ts.forEachChild(node, (childNode: ts.Node) => this.computeTreeForNode(targetSymbolsSet, childNode, visitedSymbols));
	}

	private computeTreeForNode(targetSymbolsSet: Set<ts.Symbol>, node: ts.Node, visitedSymbols: Set<ts.Symbol>): void {
		if (ts.isVariableStatement(node)) {
			for (const varDeclaration of node.declarationList.declarations) {
				this.computeTreeForNode(targetSymbolsSet, varDeclaration, visitedSymbols);
			}

			return;
		}

		if (node.kind === ts.SyntaxKind.JSDocComment || ts.isBlock(node)) {
			return;
		}

		if (isClassMember(node) && hasPrivateKeyword(node)) {
			return;
		}

		if (ts.isIdentifier(node)) {
			const symbol = this.getSymbol(node);
			if (symbol === null) {
				return;
			}

			if (visitedSymbols.has(symbol)) {
				return;
			}

			visitedSymbols.add(symbol);

			for (const childSymbol of splitTransientSymbol(symbol, this.program.getTypeChecker())) {
				targetSymbolsSet.add(childSymbol);

				for (const exportDeclaration of getDeclarationsForSymbol(childSymbol)) {
					this.computeTreeForChildren(targetSymbolsSet, exportDeclaration, visitedSymbols);
				}
			}
		}

		this.computeTreeForChildren(targetSymbolsSet, node, visitedSymbols);
	}

	private getSymbol(node: ts.Node): ts.Symbol | null {
		const nodeSymbol = this.program.getTypeChecker().getSymbolAtLocation(node);
		if (nodeSymbol === undefined) {
			return null;
		}

		return this.getActualSymbol(nodeSymbol);
	}

	private getActualSymbol(symbol: ts.Symbol): ts.Symbol {
		return getActualSymbol(symbol, this.program.getTypeChecker());
	}
}
