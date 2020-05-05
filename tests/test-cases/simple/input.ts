export class Class {
	public publicField: number = 123;
	private privateField: string = 'string-value';

	public constructor() {
		this.privateMethod(this.privateField);
		this.privateMethod(this.publicField);

		this['privateMethod'](this.privateField);
	}

	private privateMethod(a: string | number): void { }
}
