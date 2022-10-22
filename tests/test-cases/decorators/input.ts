declare const foo: any;

class Foo {
	@foo private field = 1;
}

@foo
class Foo2 {
	private field = 1;
}
