type TestKey = 'a' | 'b';

/** @public */
type TestMappedType = {
	[P in TestKey]?: {};
};

class TestMappedClass {
	private mapped: TestMappedType = {
		a: {},
	};

	public constructor() {
		this.mapped.a = {};
	}
}
