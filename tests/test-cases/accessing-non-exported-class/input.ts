class Helpers {
	public doNothing(): void {}
}

export class Class {
	public doSomething(): void {
		const helpers = new Helpers();
		helpers.doNothing();
	}
}
