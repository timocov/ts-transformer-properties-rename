interface Foo {
	field: string;
	field2: number;
}

type ReadonlyFoo = Readonly<Foo>;

function bar(foo: ReadonlyFoo): void {
	console.log(foo.field, foo.field2);
}

function baz(): void {
	const foo: Foo = {
		field: '',
		field2: 0,
	};

	bar(foo);

	bar({
		field: '',
		field2: 0,
	});
}
