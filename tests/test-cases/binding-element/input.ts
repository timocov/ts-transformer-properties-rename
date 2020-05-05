export interface Options {
	fooBar: number;
}

interface InternalInterface {
	fooBar?: number;
	fooBar2: number;
}

const internalOptions: InternalInterface = { fooBar2: 12 };

function shorthandBindingElement1(): void {
	const mixed: Options | InternalInterface = {
		fooBar: 123,
	} as Options | InternalInterface;

	const { fooBar } = mixed;

	console.log(fooBar);
}

function shorthandBindingElement2(): void {
	const mixed2: Options & InternalInterface = {
		fooBar: 123,
		fooBar2: 321,
	};

	const { fooBar, fooBar2 } = mixed2;

	console.log(fooBar, fooBar2);
}

function bindingElement3(): void {
	const mixed: Options | InternalInterface = {
		fooBar: 123,
	} as Options | InternalInterface;

	const { fooBar: newPropName } = mixed;

	const mixed2: Options & InternalInterface = {
		fooBar: 123,
		fooBar2: 321,
	};

	const { fooBar: newPropName1, fooBar2: newPropName2 } = mixed2;

	console.log(newPropName, newPropName1, newPropName2);
}

export function getOptions(opts: Options): number {
	const { fooBar } = opts;
	const { fooBar: newPropName } = opts;

	const { fooBar2 } = internalOptions;
	const { fooBar2: newPropName2 } = internalOptions;

	console.log(fooBar, newPropName, fooBar2, newPropName2);

	return 42;
}
