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
