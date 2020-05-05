export class Class {
	private pimp: Record<string, Record<string, number>> = {};
	private my: Record<string, string> = {};
	private ride: string = 'x-zibit';
	private xzibit: string = 'mtv';

	public constructor() {
		console.log(this.pimp[this.my[this.ride]][this.xzibit]++);
	}
}
