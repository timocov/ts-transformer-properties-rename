class TestProperties {
	private _salad: number = 0;
	public dressing: number = 0;
	public get salad(): number { return this._salad; }
	public set salad(val: number) { this._salad = val; }
}

const test1 = new TestProperties();
test1.salad = 0;
test1.dressing = 0;
const totalSalad = test1.salad + 1;
const totalDressing = test1.dressing + 0;

export const temp = 1;
