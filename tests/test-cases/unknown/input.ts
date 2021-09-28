interface InternalInterface {
	int: number;
}

/** @public */
interface PublicInterface {
	int: number;
}

function func(): unknown {
	const b = (({ value: 321 }) as unknown);
	const c = ((((((((({ int: 222 })))) as unknown)) as unknown as any as PublicInterface) as InternalInterface));

	return {
		foo: 1,
		bar: b,
		baz: 3,
		c: c,
	};
}
