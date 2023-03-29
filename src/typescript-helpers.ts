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
	ts.SyntaxKind.Parameter,
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

		const sym = typeChecker.getSymbolAtLocation(declaration.name);
		if (sym === undefined) {
			continue;
		}

		result.push(getActualSymbol(sym, typeChecker));
	}

	return result;
}

export function getDeclarationsForSymbol(symbol: ts.Symbol): ts.Declaration[] {
	const result: ts.Declaration[] = [];

	if (symbol.declarations !== undefined) {
		result.push(...symbol.declarations);
	}

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

export type ClassMember =
	| ts.MethodDeclaration
	| ts.PropertyDeclaration
	| ts.GetAccessorDeclaration
	| ts.SetAccessorDeclaration;

export function isClassMember(node: ts.Node): node is ClassMember {
	return ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node);
}

export function getClassOfMemberSymbol(nodeSymbol: ts.Symbol): ts.ClassLikeDeclaration | ts.ObjectLiteralExpression | ts.TypeLiteralNode | ts.InterfaceDeclaration | null {
	const classMembers = getClassMemberDeclarations(nodeSymbol);
	if (classMembers.length !== 0) {
		// we need any member to get class' declaration
		const classMember = classMembers[0];
		if (isConstructorParameter(classMember)) {
			return (classMember.parent as ts.ConstructorDeclaration).parent;
		}

		// we're sure that it is a class, not interface
		return classMember.parent as ts.ClassLikeDeclaration | ts.ObjectLiteralExpression;
	}

	return null;
}

export function hasPrivateKeyword(node: ClassMember | ts.ParameterDeclaration): boolean {
	return hasModifier(node, ts.SyntaxKind.PrivateKeyword);
}

function getModifiers(node: ts.Node): readonly NonNullable<ts.Node['modifiers']>[number][] {
	if (isBreakingTypeScriptApi(ts)) {
		if (!ts.canHaveModifiers(node)) {
			return [];
		}

		return ts.getModifiers(node) || [];
	}

	// eslint-disable-next-line deprecation/deprecation
	return node.modifiers || [];
}

export function hasModifier(node: ts.Node, modifier: ts.SyntaxKind): boolean {
	return getModifiers(node).some(mod => mod.kind === modifier);
}

function getDecorators(node: ts.Node): readonly unknown[] {
	if (isBreakingTypeScriptApi(ts)) {
		if (!ts.canHaveDecorators(node)) {
			return [];
		}

		return ts.getDecorators(node) || [];
	}

	// eslint-disable-next-line deprecation/deprecation
	return node.decorators || [];
}

export function hasDecorators(node: ts.Node): boolean {
	return getDecorators(node).length !== 0;
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

function getClassMemberDeclarations(symbol: ts.Symbol | undefined): (ClassMember | ts.ParameterDeclaration)[] {
	if (symbol === undefined) {
		return [];
	}

	const declarations = symbol.getDeclarations();
	if (declarations === undefined) {
		return [];
	}

	return declarations.filter((x: ts.Declaration): x is (ClassMember | ts.ParameterDeclaration) => {
		return isClassMember(x) || isConstructorParameter(x);
	});
}

export function isSymbolClassMember(symbol: ts.Symbol | undefined): boolean {
	return getClassMemberDeclarations(symbol).length !== 0;
}

export function isPrivateClassMember(symbol: ts.Symbol | undefined): boolean {
	return getClassMemberDeclarations(symbol).some(hasPrivateKeyword);
}

export function getNodeJSDocComment(node: ts.Node): string {
	const start = node.getStart();
	const jsDocStart = node.getStart(undefined, true);
	return node.getSourceFile().getFullText().substring(jsDocStart, start).trim();
}

// decorators and modifiers-related api added in ts 4.8
interface BreakingTypeScriptApi {
	canHaveDecorators(node: ts.Node): boolean;
	getDecorators(node: ts.Node): readonly ts.Decorator[] | undefined;
	canHaveModifiers(node: ts.Node): boolean;
	getModifiers(node: ts.Node): readonly ts.Modifier[] | undefined;
}

function isBreakingTypeScriptApi(compiler: object): compiler is BreakingTypeScriptApi {
	return 'canHaveDecorators' in compiler;
}
