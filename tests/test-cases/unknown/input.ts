interface InternalInterface {
	int: number;
}

function func(): unknown {
	const b = (({ value: 321 }) as unknown);
	const c = (({ int: 222 }) as unknown) as InternalInterface;

	return {
		foo: 1,
		bar: b,
		baz: 3,
		c: c,
	};
}
