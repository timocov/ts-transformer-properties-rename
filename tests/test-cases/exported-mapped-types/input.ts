type TestKey = 'a';

export type MappedType = {
	[P in TestKey]?: {};
};

export interface Interface {
	a?: {};
}

class TestMappedClass {
	private interfaced: Interface = {
		a: {},
	};

	private mapped: MappedType = {
		a: {},
	};

	public constructor() {
		this.interfaced.a = {};
		this.mapped.a = {};
	}
}
