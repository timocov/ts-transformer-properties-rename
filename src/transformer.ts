import * as ts from 'typescript';

import { ExportsSymbolTree } from './exports-symbol-tree';
import {
	getDeclarationsForSymbol,
	isClassMember,
	isConstructorParameter,
	isPrivateClassMember,
	splitTransientSymbol,
	getNodeJSDocComment,
} from './typescript-helpers';

// https://github.com/microsoft/TypeScript/issues/38344
interface TSSymbolInternal extends ts.Symbol {
	parent?: TSSymbolInternal;
}

export interface RenameOptions {
	/**
	 * An array of entry source files which will used to detect exported and internal fields.
	 * Basically it should be entry point(s) of the library/project.
	 * @example ['./src/index.ts']
	 */
	entrySourceFiles: string[];

	/**
	 * Prefix of generated names for private fields
	 * @example '_private_' // default
	 * @example '$p$'
	 */
	privatePrefix: string;

	/**
	 * Prefix of generated names for internal fields
	 * @example '_internal_' // default
	 * @example '$i$'
	 */
	internalPrefix: string;

	/**
	 * Comment which will treat a class/interface/type/property/etc and all its children as "public".
	 * Set it to empty string to disable using JSDoc comment to detecting "visibility level".
	 * @example 'public' // default
	 * @example 'external'
	 * @example ''
	 */
	publicJSDocTag: string;
}

const defaultOptions: RenameOptions = {
	entrySourceFiles: [],
	privatePrefix: '_private_',
	internalPrefix: '_internal_',
	publicJSDocTag: 'public',
};

// tslint:disable-next-line:no-default-export
export default function propertiesRenameTransformer(program: ts.Program, config?: Partial<RenameOptions>): ts.TransformerFactory<ts.SourceFile> {
	return createTransformerFactory(program, config);
}

function createTransformerFactory(program: ts.Program, options?: Partial<RenameOptions>): ts.TransformerFactory<ts.SourceFile> {
	const fullOptions: RenameOptions = { ...defaultOptions, ...options };
	const typeChecker = program.getTypeChecker();
	const exportsSymbolTree = new ExportsSymbolTree(program, fullOptions.entrySourceFiles);

	return (context: ts.TransformationContext) => {
		function transformNodeAndChildren(node: ts.SourceFile, context: ts.TransformationContext): ts.SourceFile;
		function transformNodeAndChildren(node: ts.Node, context: ts.TransformationContext): ts.Node;
		function transformNodeAndChildren(node: ts.Node, context: ts.TransformationContext): ts.Node {
			return ts.visitEachChild(
				transformNode(node),
				(childNode: ts.Node) => transformNodeAndChildren(childNode, context),
				context
			);
		}

		// tslint:disable-next-line:cyclomatic-complexity
		function transformNode(node: ts.Node): ts.Node {
			// const a = { node }
			if (ts.isShorthandPropertyAssignment(node)) {
				return handleShorthandPropertyAssignment(node);
			}

			// const { node } = obj;
			if (ts.isBindingElement(node) && node.propertyName === undefined && ts.isObjectBindingPattern(node.parent)) {
				return handleShorthandObjectBindingElement(node);
			}

			if (ts.isIdentifier(node) && node.parent) {
				// obj.node
				if (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) {
					return handlePropertyAccessIdentifier(node);
				}

				// private node
				// public node()
				if (isClassMember(node.parent) && node.parent.name === node) {
					return handleClassMember(node);
				}

				// const a = { node: 123 }
				if (ts.isPropertyAssignment(node.parent) && node.parent.name === node) {
					return handlePropertyAssignment(node);
				}

				// const { node: localName } = obj;
				if (ts.isBindingElement(node.parent) && node.parent.propertyName === node) {
					return handleBindingElement(node);
				}

				// constructor(public node: string) { // <--- this
				//     console.log(node); // <--- and this
				// }
				if (
					isConstructorParameter(node.parent) && node.parent.name === node
					|| isConstructorParameterReference(node)
				) {
					return handleCtorParameter(node);
				}
			}

			// obj['fooBar']
			if (ts.isStringLiteral(node)
				&& ts.isElementAccessExpression(node.parent)
				&& node.parent.argumentExpression === node
			) {
				return handleElementAccessExpression(node);
			}

			return node;
		}

		// obj.node
		function handlePropertyAccessIdentifier(node: ts.Identifier): ts.Identifier {
			return createNewIdentifier(node);
		}

		// obj['fooBar']
		function handleElementAccessExpression(node: ts.StringLiteral): ts.StringLiteral {
			const visibilityType = getNodeVisibilityType(node);
			if (visibilityType === VisibilityType.External) {
				return node;
			}

			return createNewNode(node, visibilityType, ts.createStringLiteral);
		}

		// private node
		// public node()
		function handleClassMember(node: ts.Identifier): ts.Identifier {
			return createNewIdentifier(node);
		}

		// const { node: localName } = obj;
		function handleBindingElement(node: ts.Identifier): ts.Identifier {
			return createNewIdentifier(node);
		}

		// const a = { node: 123 }
		function handlePropertyAssignment(node: ts.Identifier): ts.Identifier {
			return createNewIdentifier(node);
		}

		// const a = { node }
		function handleShorthandPropertyAssignment(node: ts.ShorthandPropertyAssignment): ts.PropertyAssignment | ts.ShorthandPropertyAssignment {
			const visibilityType = getNodeVisibilityType(node.name);
			if (visibilityType === VisibilityType.External) {
				return node;
			}

			return createNewNode(node.name, visibilityType, (newName: string) => {
				return ts.createPropertyAssignment(newName, node.name);
			});
		}

		// const { node } = obj;
		function handleShorthandObjectBindingElement(node: ts.BindingElement): ts.BindingElement {
			if (!ts.isIdentifier(node.name)) {
				return node;
			}

			const visibilityType = getNodeVisibilityType(node);
			if (visibilityType === VisibilityType.External) {
				return node;
			}

			return createNewNode(node.name, visibilityType, (newName: string) => {
				return ts.createBindingElement(node.dotDotDotToken, newName, node.name, node.initializer);
			});
		}

		// constructor(public node: string) { // <--- this
		//     console.log(node); // <--- and this
		// }
		function handleCtorParameter(node: ts.Identifier): ts.Identifier {
			return createNewIdentifier(node);
		}

		function createNewIdentifier(oldIdentifier: ts.Identifier): ts.Identifier {
			const visibilityType = getNodeVisibilityType(oldIdentifier);
			if (visibilityType === VisibilityType.External) {
				return oldIdentifier;
			}

			return createNewNode(oldIdentifier, visibilityType, ts.createIdentifier);
		}

		function createNewNode<T extends ts.Node>(oldProperty: ts.PropertyName, type: VisibilityType, createNode: (newName: string) => T): T {
			const symbol = typeChecker.getSymbolAtLocation(oldProperty);
			if (symbol === undefined) {
				throw new Error(`Cannot get symbol for node "${oldProperty.getText()}"`);
			}

			const oldPropertyName = symbol.escapedName as string;

			const newPropertyName = getNewName(oldPropertyName, type);
			const newProperty = createNode(newPropertyName);

			return newProperty;
		}

		function getNewName(originalName: string, type: VisibilityType): string {
			return `${type === VisibilityType.Private ? fullOptions.privatePrefix : fullOptions.internalPrefix}${originalName}`;
		}

		function getActualSymbol(symbol: ts.Symbol): ts.Symbol {
			if (symbol.flags & ts.SymbolFlags.Alias) {
				symbol = typeChecker.getAliasedSymbol(symbol);
			}

			return symbol;
		}

		function getNodeSymbol(node: ts.Expression | ts.Identifier | ts.StringLiteral | ts.NamedDeclaration): ts.Symbol | null {
			const symbol = typeChecker.getSymbolAtLocation(node);
			if (symbol === undefined) {
				return null;
			}

			return getActualSymbol(symbol);
		}

		const enum VisibilityType {
			Internal,
			Private,
			External,
		}

		// tslint:disable-next-line:cyclomatic-complexity
		function isTypePropertyExternal(type: ts.Type, typePropertyName: string): boolean {
			if (type.isUnionOrIntersection()) {
				const hasExternalSubType = type.types.some((t: ts.Type) => isTypePropertyExternal(t, typePropertyName));
				if (hasExternalSubType) {
					return hasExternalSubType;
				}
			}

			if (type.aliasTypeArguments !== undefined) {
				const hasExternalSubType = type.aliasTypeArguments.some((t: ts.Type) => isTypePropertyExternal(t, typePropertyName));
				if (hasExternalSubType) {
					return hasExternalSubType;
				}
			}

			const symbol = type.getSymbol();
			if (symbol !== undefined) {
				const declarations = getDeclarationsForSymbol(symbol);
				for (const declaration of declarations) {
					if ((ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)) && declaration.heritageClauses !== undefined) {
						const hasHeritageClausesExternals = declaration.heritageClauses.some((clause: ts.HeritageClause) => {
							return clause.types.some((expr: ts.ExpressionWithTypeArguments) => {
								return isTypePropertyExternal(typeChecker.getTypeAtLocation(expr), typePropertyName);
							});
						});

						if (hasHeritageClausesExternals) {
							return true;
						}
					}
				}
			}

			const propertySymbol = typeChecker.getPropertyOfType(type, typePropertyName);
			if (propertySymbol === undefined) {
				return false;
			}

			return [propertySymbol, ...splitTransientSymbol(propertySymbol, typeChecker)]
				.some((sym: ts.Symbol) => getSymbolVisibilityType(sym) === VisibilityType.External);
		}

		// tslint:disable-next-line:cyclomatic-complexity
		function getNodeVisibilityType(node: ts.Expression | ts.Identifier | ts.StringLiteral | ts.BindingElement): VisibilityType {
			if (ts.isPropertyAssignment(node.parent) || ts.isShorthandPropertyAssignment(node.parent)) {
				const type = typeChecker.getContextualType(node.parent.parent);
				if (type !== undefined && isTypePropertyExternal(type, node.getText())) {
					return VisibilityType.External;
				}
			}

			if (ts.isPropertyAccessExpression(node.parent) || ts.isElementAccessExpression(node.parent)) {
				if (ts.isIdentifier(node.parent.expression)) {
					const expressionSymbol = typeChecker.getSymbolAtLocation(node.parent.expression);
					if (expressionSymbol !== undefined) {
						// import * as foo from '...';
						// foo.node;
						// foo['node'];
						// or
						// namespace Foo { ... }
						// Foo.node
						// Foo['node'];
						const isModuleOrStarImport = getDeclarationsForSymbol(expressionSymbol)
							.some((decl: ts.Declaration) => ts.isNamespaceImport(decl) || ts.isModuleDeclaration(decl));
						if (isModuleOrStarImport) {
							// treat accessing to import-star or namespace as external one
							// because we can't rename them yet
							return VisibilityType.External;
						}
					}
				}

				if (isTypePropertyExternal(typeChecker.getTypeAtLocation(node.parent.expression), node.getText())) {
					return VisibilityType.External;
				}
			}

			// shorthand binding element
			// const { node } = obj;
			if (ts.isBindingElement(node) && isTypePropertyExternal(typeChecker.getTypeAtLocation(node.parent), node.getText())) {
				return VisibilityType.External;
			}

			// full binding element
			// const { node: propName } = obj;
			if (ts.isBindingElement(node.parent) && isTypePropertyExternal(typeChecker.getTypeAtLocation(node.parent.parent), node.getText())) {
				return VisibilityType.External;
			}

			if (isClassMember(node.parent) && isTypePropertyExternal(typeChecker.getTypeAtLocation(node.parent.parent), node.getText())) {
				return VisibilityType.External;
			}

			const symbol = ts.isBindingElement(node) ? getShorthandObjectBindingElementSymbol(node) : getNodeSymbol(node);
			if (symbol === null) {
				return VisibilityType.External;
			}

			return getSymbolVisibilityType(symbol);
		}

		function getSymbolVisibilityType(nodeSymbol: ts.Symbol): VisibilityType {
			nodeSymbol = getActualSymbol(nodeSymbol);

			const symbolDeclarations = getDeclarationsForSymbol(nodeSymbol);
			if (symbolDeclarations.some(isDeclarationFromExternals)) {
				return VisibilityType.External;
			}

			if (isPrivateClassMember(nodeSymbol)) {
				return VisibilityType.Private;
			}

			if (nodeSymbol.escapedName === 'prototype') {
				// accessing to prototype
				return VisibilityType.External;
			}

			if (fullOptions.publicJSDocTag.length !== 0) {
				for (const declaration of symbolDeclarations) {
					let currentNode: ts.Node = declaration;
					while (!ts.isSourceFile(currentNode)) {
						if (getNodeJSDocComment(currentNode).includes(`@${fullOptions.publicJSDocTag}`)) {
							return VisibilityType.External;
						}

						currentNode = currentNode.parent;
					}
				}
			}

			// if declaration is "exported" somehow
			let symbol: TSSymbolInternal | undefined = nodeSymbol as TSSymbolInternal;
			while (symbol !== undefined) {
				if (exportsSymbolTree.isSymbolAccessibleFromExports(symbol)) {
					return VisibilityType.External;
				}

				symbol = symbol.parent;
			}

			return VisibilityType.Internal;
		}

		function getShorthandObjectBindingElementSymbol(element: ts.BindingElement): ts.Symbol | null {
			if (element.propertyName !== undefined) {
				throw new Error(`Cannot handle binding element with property name: ${element.getText()} in ${element.getSourceFile().fileName}`);
			}

			if (!ts.isIdentifier(element.name)) {
				return null;
			}

			// if no property name is set (const { a } = foo)
			// then node.propertyName is undefined and we need to find this property ourselves
			// so let's use go-to-definition algorithm from TSServer
			// see https://github.com/microsoft/TypeScript/blob/672b0e3e16ad18b422dbe0cec5a98fce49881b76/src/services/goToDefinition.ts#L58-L77
			const type = typeChecker.getTypeAtLocation(element.parent as ts.Node);
			if (type.isUnion()) {
				return null;
			}

			return type.getProperty(ts.idText(element.name)) || null;
		}

		function isDeclarationFromExternals(declaration: ts.Declaration): boolean {
			const sourceFile = declaration.getSourceFile();

			// all declarations from declaration source files are external by default
			return sourceFile.isDeclarationFile
				|| program.isSourceFileDefaultLibrary(sourceFile)
				|| /[\\\/]node_modules[\\\/]/.test(sourceFile.fileName);
		}

		function isConstructorParameterReference(node: ts.Node): node is ts.Identifier {
			if (!ts.isIdentifier(node)) {
				return false;
			}

			return isPrivateClassMember(typeChecker.getSymbolAtLocation(node));
		}

		return (sourceFile: ts.SourceFile) => transformNodeAndChildren(sourceFile, context);
	};
}
