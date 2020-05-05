export class Class {
	private field: number = Math.random();

	public compare(rhs: Class): boolean {
		return this.field > rhs.field;
	}
}
