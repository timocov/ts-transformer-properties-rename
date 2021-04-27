class DoubleUnderscoreProperty {
	public __foo: string = "bar";
}

const testObject = new DoubleUnderscoreProperty();
export const foo = testObject.__foo + "baz";
