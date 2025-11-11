"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fn2 = exports.fn1 = exports.fn = exports.ExportedClass = void 0;
var UnexportedClass = /** @class */ (function () {
    function UnexportedClass() {
    }
    UnexportedClass.prototype._internal_method = function () {
        return { _internal_a: 123, _internal_b: 321 };
    };
    return UnexportedClass;
}());
function privateFunctionWithDeclaredType1() {
    var a = new UnexportedClass()._internal_method()._internal_a;
    return {
        _internal_a: a,
        _internal_b: 'str',
    };
}
function privateFunctionWithUndeclaredType() {
    return {
        f: 1,
        f2: 2,
    };
}
function privateFunctionWithDeclaredType2() {
    // note that if you extract returned value to a variable it won't work
    return {
        f: 1,
        f2: 2,
    };
}
function privateFunctionWhichUsesPublic() {
    console.log(fn().a, fn1().f, fn2().f2);
}
var ExportedClass = /** @class */ (function () {
    function ExportedClass() {
    }
    ExportedClass.prototype.method = function () {
        return { a: 123, b: 321 };
    };
    ExportedClass.prototype._private_privateMethod = function () {
        return { _internal_a: 123, _internal_b: 321 };
    };
    return ExportedClass;
}());
exports.ExportedClass = ExportedClass;
function fn() {
    var a = privateFunctionWithDeclaredType1()._internal_a;
    return {
        a: a,
        b: 'str',
    };
}
exports.fn = fn;
function fn1() {
    return privateFunctionWithUndeclaredType();
}
exports.fn1 = fn1;
function fn2() {
    return privateFunctionWithDeclaredType2();
}
exports.fn2 = fn2;
