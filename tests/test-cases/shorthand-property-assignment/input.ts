export interface Options {
	fooBar: number;
}

interface InternalInterface {
	fooBar: number;
}

export function getOptions(fooBar: number): Options {
	const result: Options = { fooBar };
	const internalOptions: InternalInterface = { fooBar };
	console.log(internalOptions);
	return result;
}
