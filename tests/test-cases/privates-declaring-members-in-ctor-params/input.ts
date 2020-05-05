interface PublicOptions {
	prop: number;
}

interface ProtectedOptions {
	prop2: number;
}

interface PrivateOptions {
	prop3: number;
}

export class Class {
	public constructor(
		public publicField: PublicOptions,
		protected protectedField: ProtectedOptions,
		private privateField: PrivateOptions
	) {
		console.log(privateField);
	}

	public method(): void {
		console.log(this.publicField.prop, this.protectedField.prop2, this.privateField.prop3);
	}
}
