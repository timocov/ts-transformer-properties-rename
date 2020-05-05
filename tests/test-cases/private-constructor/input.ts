export class Class {
	private constructor() {
		console.log('hey');
	}

	public static factory(): Class {
		return new Class();
	}
}
