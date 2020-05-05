interface InternalInterface {
	fooBar: number;
}

export function doNothing(fooBar: number): void {
	const internalOptions: InternalInterface = { fooBar };
	console.log(internalOptions['fooBar']);
}
