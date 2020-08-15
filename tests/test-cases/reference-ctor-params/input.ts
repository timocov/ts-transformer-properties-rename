interface Foo {
	bar: number;
	baz: number;
}

class Measure {
	height: number;

	constructor(public width: number, public ascent: number, public descent: number) {
		this.height = ascent + descent;
	}
}

class Test {
	constructor(public pub: number, protected prot: number, private priv: number) {
		console.log(pub, prot, priv, this.pub, this.prot, this.priv);
	}
}

export class ExportedClass {
	constructor(public pub: number, protected prot: number, private priv: number) {
		console.log(pub, prot, priv, this.pub, this.prot, this.priv);
	}
}

class FooImpl implements Foo {
	baz: number = 15;

	constructor(public bar: number) {}
}

export class Class {
	public constructor(
		private privateField: number
	) {
		console.log(privateField);
	}

	public getFoo(): Foo {
		return new FooImpl(42);
	}
}
