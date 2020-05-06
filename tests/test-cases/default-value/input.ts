function showMessage(opts: { message: string } = { message: 'hello' }): void {
	alert(opts.message);
}
export function alertMessage(message: string): void {
	showMessage({ message });
}
