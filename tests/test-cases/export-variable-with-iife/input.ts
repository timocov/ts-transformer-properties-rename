class InternalClass {
	public publicProperty: number = 1;
}

class InternalClass2 {
	public publicProperty: number = 1;
}

export const exportedVariable = (() => {
	return new InternalClass();
})();

export const exportedVariable2 = (() => {
	return new InternalClass2().publicProperty;
})();
