"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = exports.ExportedClass = void 0;
var Measure = /** @class */ (function () {
    function Measure(_internal_width, _internal_ascent, _internal_descent) {
        this._internal_width = _internal_width;
        this._internal_ascent = _internal_ascent;
        this._internal_descent = _internal_descent;
        this._internal_height = _internal_ascent + _internal_descent;
    }
    return Measure;
}());
var Test = /** @class */ (function () {
    function Test(_internal_pub, _internal_prot, _private_priv) {
        this._internal_pub = _internal_pub;
        this._internal_prot = _internal_prot;
        this._private_priv = _private_priv;
        console.log(_internal_pub, _internal_prot, _private_priv, this._internal_pub, this._internal_prot, this._private_priv);
    }
    return Test;
}());
var ExportedClass = /** @class */ (function () {
    function ExportedClass(pub, prot, _private_priv) {
        this.pub = pub;
        this.prot = prot;
        this._private_priv = _private_priv;
        console.log(pub, prot, _private_priv, this.pub, this.prot, this._private_priv);
    }
    return ExportedClass;
}());
exports.ExportedClass = ExportedClass;
var FooImpl = /** @class */ (function () {
    function FooImpl(bar) {
        this.bar = bar;
        this.baz = 15;
    }
    return FooImpl;
}());
var Class = /** @class */ (function () {
    function Class(_private_privateField) {
        this._private_privateField = _private_privateField;
        console.log(_private_privateField);
    }
    Class.prototype.getFoo = function () {
        return new FooImpl(42);
    };
    return Class;
}());
exports.Class = Class;
