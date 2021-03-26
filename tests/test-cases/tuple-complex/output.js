function drawRoundRect(tupleOrNumber) {
    if (!Array.isArray(tupleOrNumber)) {
        console.log(tupleOrNumber.toExponential());
    }
    else if (tupleOrNumber.length === 2) {
        var first = tupleOrNumber[0], second = tupleOrNumber[1];
        console.log(first.toExponential(), second.toExponential());
    }
    else if (tupleOrNumber.length === 4) {
        var first = tupleOrNumber[0], second = tupleOrNumber[1], third = tupleOrNumber[2], fourth = tupleOrNumber[3];
        console.log(first.toExponential(), second.toExponential(), third.toExponential(), fourth.toExponential());
    }
}
