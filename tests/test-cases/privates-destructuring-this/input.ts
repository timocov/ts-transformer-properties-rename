export class Class {
	private privateField: string = 'string-value';
	private privateField2: { prop: string } = { prop: 'string-value' };
	public publicField: number = 123;

	public constructor() {
		this.publicMethod();
		this.privateMethod(this.privateField, this.publicField, this.privateField2.prop);
	}

	public publicMethod(): void {
		const {
			privateField,
			publicField,
		} = this;

		const {
			privateField2: {
				prop,
			},
		} = this;

		this.privateMethod(privateField, publicField, prop, { prop });
	}

	private privateMethod(a: string, b: number, c: string, d?: { prop: string }): void {
		if (d) {
			console.log(d.prop);
		}
	}
}
