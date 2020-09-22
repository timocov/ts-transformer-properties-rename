function bar(foo) {
    console.log(foo._internal_field, foo._internal_field2);
}
function baz() {
    var foo = {
        _internal_field: '',
        _internal_field2: 0,
    };
    bar(foo);
    bar({
        _internal_field: '',
        _internal_field2: 0,
    });
}
