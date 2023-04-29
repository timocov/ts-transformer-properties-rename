class UnexportedClass {
	public method() {
		return { a: 123, b: 321 };
	}
}

function privateFunctionWithDeclaredType1(): { a: number; b: string } {
	const { a } = new UnexportedClass().method();
	return {
		a,
		b: 'str',
	};
}

function privateFunctionWithUndeclaredType() {
	return {
		f: 1,
		f2: 2,
	};
}

function privateFunctionWithDeclaredType2(): { f: number, f2: number } {
	// note that if you extract returned value to a variable it won't work
	return {
		f: 1,
		f2: 2,
	};
}

function privateFunctionWhichUsesPublic(): void {
	console.log(fn().a, fn1().f, fn2().f2);
}

export class ExportedClass {
	public method() {
		return { a: 123, b: 321 };
	}

	private privateMethod() {
		return { a: 123, b: 321 };
	}
}

export function fn() {
	const { a } = privateFunctionWithDeclaredType1();

	return {
		a,
		b: 'str',
	};
}

export function fn1() {
	return privateFunctionWithUndeclaredType();
}

export function fn2() {
	return privateFunctionWithDeclaredType2();
}
