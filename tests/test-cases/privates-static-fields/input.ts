export class Class {
	public publicField: number = 123;

	public constructor() {
		Class.privateStaticPropertyMethod();
		Class.privateStaticMethod();
	}

	private static privateStaticMethod(): void {

	}

	private static privateStaticPropertyMethod = () => {

	}
}
