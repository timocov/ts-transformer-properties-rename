import * as ts from 'typescript';

const namedDeclarationKinds = [
	ts.SyntaxKind.InterfaceDeclaration,
	ts.SyntaxKind.ClassDeclaration,
	ts.SyntaxKind.EnumDeclaration,
	ts.SyntaxKind.TypeAliasDeclaration,
	ts.SyntaxKind.ModuleDeclaration,
	ts.SyntaxKind.FunctionDeclaration,
	ts.SyntaxKind.VariableDeclaration,
	ts.SyntaxKind.PropertySignature,
];

export function isNodeNamedDeclaration(node: ts.Node): node is ts.NamedDeclaration {
	return namedDeclarationKinds.indexOf(node.kind) !== -1;
}

export function getActualSymbol(symbol: ts.Symbol, typeChecker: ts.TypeChecker): ts.Symbol {
	if (symbol.flags & ts.SymbolFlags.Alias) {
		symbol = typeChecker.getAliasedSymbol(symbol);
	}

	return symbol;
}

export function splitTransientSymbol(symbol: ts.Symbol, typeChecker: ts.TypeChecker): ts.Symbol[] {
	// actually I think we even don't need to operate/use "Transient" symbols anywhere
	// it's kind of aliased symbol, but just merged
	// but it's hard to refractor everything to use array of symbols instead of just symbol
	// so let's fix it for some places
	if ((symbol.flags & ts.SymbolFlags.Transient) === 0) {
		return [symbol];
	}

	// "Transient" symbol is kinda "merged" symbol
	// I don't really know is this way to "split" is correct
	// but it seems that it works for now ¯\_(ツ)_/¯
	const declarations = getDeclarationsForSymbol(symbol);
	const result: ts.Symbol[] = [];
	for (const declaration of declarations) {
		if (!isNodeNamedDeclaration(declaration) || declaration.name === undefined) {
			continue;
		}

		const symbol = typeChecker.getSymbolAtLocation(declaration.name);
		if (symbol === undefined) {
			continue;
		}

		result.push(getActualSymbol(symbol, typeChecker));
	}

	return result;
}

export function getDeclarationsForSymbol(symbol: ts.Symbol): ts.Declaration[] {
	const result: ts.Declaration[] = [];

	// Disabling tslint is for backward compat with TypeScript < 3
	// tslint:disable-next-line:strict-type-predicates
	if (symbol.declarations !== undefined) {
		result.push(...symbol.declarations);
	}

	// Disabling tslint is for backward compat with TypeScript < 3
	// tslint:disable-next-line:strict-type-predicates
	if (symbol.valueDeclaration !== undefined) {
		// push valueDeclaration might be already in declarations array
		// so let's check first to avoid duplication nodes
		if (!result.includes(symbol.valueDeclaration)) {
			result.push(symbol.valueDeclaration);
		}
	}

	return result;
}

export function getExportsForSourceFile(typeChecker: ts.TypeChecker, sourceFileSymbol: ts.Symbol): ts.Symbol[] {
	if (sourceFileSymbol.exports !== undefined) {
		const commonJsExport = sourceFileSymbol.exports.get(ts.InternalSymbolName.ExportEquals);
		if (commonJsExport !== undefined) {
			return [
				getActualSymbol(commonJsExport, typeChecker),
			];
		}
	}

	const result: ts.Symbol[] = typeChecker.getExportsOfModule(sourceFileSymbol);

	if (sourceFileSymbol.exports !== undefined) {
		const defaultExportSymbol = sourceFileSymbol.exports.get(ts.InternalSymbolName.Default);
		if (defaultExportSymbol !== undefined) {
			if (!result.includes(defaultExportSymbol)) {
				// it seems that default export is always returned by getExportsOfModule
				// but let's add it to be sure add if there is no such export
				result.push(defaultExportSymbol);
			}
		}
	}

	return result.map((symbol: ts.Symbol) => getActualSymbol(symbol, typeChecker));
}

export type ClassMember = ts.MethodDeclaration | ts.PropertyDeclaration;

export function isClassMember(node: ts.Node): node is ClassMember {
	return ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node);
}

export function hasPrivateKeyword(node: ClassMember | ts.ParameterDeclaration): boolean {
	return hasModifier(node, ts.SyntaxKind.PrivateKeyword);
}

export function hasModifier(node: ts.Node, modifier: ts.SyntaxKind): boolean {
	return node.modifiers !== undefined && node.modifiers.some((mod: ts.Modifier) => mod.kind === modifier);
}

export function isConstructorParameter(node: ts.Node): node is ts.ParameterDeclaration {
	return ts.isParameter(node) &&
		ts.isConstructorDeclaration(node.parent as ts.Node) &&
		(
			hasModifier(node, ts.SyntaxKind.PublicKeyword) ||
			hasModifier(node, ts.SyntaxKind.ProtectedKeyword) ||
			hasModifier(node, ts.SyntaxKind.PrivateKeyword)
		);
}

export function isPrivateClassMember(symbol: ts.Symbol | undefined): boolean {
	// for some reason ts.Symbol.declarations can be undefined (for example in order to accessing to proto member)
	if (symbol === undefined || symbol.declarations === undefined) { // tslint:disable-line:strict-type-predicates
		return false;
	}

	return symbol.declarations.some((x: ts.Declaration) => {
		return (isClassMember(x) || isConstructorParameter(x)) && hasPrivateKeyword(x);
	});
}

export function getNodeJSDocComment(node: ts.Node): string {
	const start = node.getStart();
	const jsDocStart = node.getStart(undefined, true);
	return node.getSourceFile().getFullText().substring(jsDocStart, start).trim();
}
