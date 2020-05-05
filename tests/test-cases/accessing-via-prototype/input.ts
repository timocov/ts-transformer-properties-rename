export class Class {
	private privateField: string = 'string-value';

	public constructor() {
		Class.prototype.privateMethod.call(this, this.privateField);

		Class.prototype.publicMethod.call(this);
	}

	public publicMethod(): void {

	}

	private privateMethod(a: string): void {

	}
}
