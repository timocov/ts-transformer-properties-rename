class Foo<Type extends string> {
	public search(): void {}
}

type StringFoo<T extends string> = Foo<T>;

class Bar {
	private foo: StringFoo<string> = new Foo();

	public doSomething(): void {
		this.foo.search();
	}
}

export interface FooBar {}
