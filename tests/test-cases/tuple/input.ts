type Tuple = [number, string] | [];

declare function getTuple(): Tuple;

export function doSomething(): void {
	console.log(getTuple().length);
}
