"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = getOptions;
var internalOptions = { _internal_fooBar2: 12 };
function shorthandBindingElement1() {
    var mixed = {
        fooBar: 123,
    };
    var fooBar = mixed.fooBar;
    console.log(fooBar);
}
function shorthandBindingElement2() {
    var mixed2 = {
        fooBar: 123,
        _internal_fooBar2: 321,
    };
    var fooBar = mixed2.fooBar, fooBar2 = mixed2._internal_fooBar2;
    console.log(fooBar, fooBar2);
}
function bindingElement3() {
    var mixed = {
        fooBar: 123,
    };
    var newPropName = mixed.fooBar;
    var mixed2 = {
        fooBar: 123,
        _internal_fooBar2: 321,
    };
    var newPropName1 = mixed2.fooBar, newPropName2 = mixed2._internal_fooBar2;
    console.log(newPropName, newPropName1, newPropName2);
}
function getOptions(opts) {
    var fooBar = opts.fooBar;
    var newPropName = opts.fooBar;
    var fooBar2 = internalOptions._internal_fooBar2;
    var newPropName2 = internalOptions._internal_fooBar2;
    console.log(fooBar, newPropName, fooBar2, newPropName2);
    return 42;
}
