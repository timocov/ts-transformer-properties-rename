export interface ExportedInterface {
	foo: number;
}

export interface AnotherExportedInterface {
	bar: number;
	isAnother: boolean;
}

export type ExportedType = ExportedInterface | AnotherExportedInterface;

interface NonExportedInterface {
	foo: number;
}

interface AnotherNonExportedInterface {
	bar: number;
	isAnother: boolean;
}

type NonExportedType = NonExportedInterface | AnotherNonExportedInterface;

declare function getNonExported(): NonExportedType;
declare const moveEvent: MouseEvent | TouchEvent;

export function func(type: ExportedType): void {
	if ('isAnother' in type) {
		console.log(type.bar);
	} else {
		console.log(type.foo);
	}

	const nonExportedVar = getNonExported();
	if ('isAnother' in nonExportedVar) {
		console.log(nonExportedVar.bar);
	} else {
		console.log(nonExportedVar.foo);
	}

	if ('onorientationchange' in window || 'button' in moveEvent) {
		console.log('check');
	}
}
