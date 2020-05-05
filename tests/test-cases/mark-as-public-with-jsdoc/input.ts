/** @public */
const myColors: Record<string, string> = {
	foo: 'red',
	bar: 'blue',
};

export function getColor(name: string): string {
	return myColors[name];
}
