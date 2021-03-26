type TwoItems = [number, number];
type FourItems = [number, number, number, number];
type TupleOrNumber = number | TwoItems | FourItems;

function drawRoundRect(tupleOrNumber: TupleOrNumber): void {
	if (!Array.isArray(tupleOrNumber)) {
		console.log(tupleOrNumber.toExponential());
	} else if (tupleOrNumber.length === 2) {
		const [first, second] = tupleOrNumber;
		console.log(first.toExponential(), second.toExponential());
	} else if (tupleOrNumber.length === 4) {
		const [first, second, third, fourth] = tupleOrNumber;
		console.log(first.toExponential(), second.toExponential(), third.toExponential(), fourth.toExponential());
	}
}
