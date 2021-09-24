export interface PublicInterface {
	field: any;
}

interface InternalInterface {
	field: any;
}

/** @public */
interface PublicByJSDocInterface {
	field: any;
}

function func(obj1: PublicInterface, obj2: InternalInterface, obj3: PublicByJSDocInterface): void {
	console.log(obj1.field.f1Any, obj2.field.f2Any, obj3.field.f3Any);
}

function func2(): any {
	const b = (({ value: 321 }) as any);
	const c = (({ field: 222 }) as any) as InternalInterface;
	return {
		foo: 1,
		bar: b,
		baz: 3,
		c: c,
	};
}
