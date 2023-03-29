class Class {
	public declare publicField: number;
	protected declare protectedField: number;
	private declare privateField: number;

	public method() {
		console.log(this.publicField, this.protectedField, this.privateField);
	}
}
