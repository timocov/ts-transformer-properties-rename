"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Foo = /** @class */ (function () {
    function Foo() {
    }
    Foo.prototype._internal_search = function () { };
    return Foo;
}());
var Bar = /** @class */ (function () {
    function Bar() {
        this._private_foo = new Foo();
    }
    Bar.prototype._internal_doSomething = function () {
        this._private_foo._internal_search();
    };
    return Bar;
}());
