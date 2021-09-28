"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function func(obj1, obj2, obj3) {
    console.log(obj1.field.f1Any, obj2._internal_field.f2Any, obj3.field.f3Any);
}
function func2() {
    var b = ({ value: 321 });
    var c = (((((({ _internal_field: 222 }))))));
    return {
        foo: 1,
        bar: b,
        baz: 3,
        c: c,
    };
}
