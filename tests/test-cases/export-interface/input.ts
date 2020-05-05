export interface Interface {
	publicMethod(opts: Options, b: number): void;
	publicProperty: number;
}

export interface Options {
	foo: number;
}

class Class implements Interface {
	public publicProperty: number = 123;

	public publicMethod(opts: Partial<Options>): void {
		opts.foo = 123;

		const opts1: Partial<Options> = {
			foo: 321,
		};

		this.privateMethod(this.publicProperty, opts1.foo);
	}

	private privateMethod(a: string | number, b?: number): void { }
}

export function createClass(): Interface {
	return new Class();
}
