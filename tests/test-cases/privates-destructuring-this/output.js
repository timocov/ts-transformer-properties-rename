"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class() {
        this._private_privateField = 'string-value';
        this._private_privateField2 = { _internal_prop: 'string-value' };
        this.publicField = 123;
        this.publicMethod();
        this._private_privateMethod(this._private_privateField, this.publicField, this._private_privateField2._internal_prop);
    }
    Class.prototype.publicMethod = function () {
        var _a = this, privateField = _a._private_privateField, publicField = _a.publicField;
        var prop = this._private_privateField2._internal_prop;
        this._private_privateMethod(privateField, publicField, prop, { _internal_prop: prop });
    };
    Class.prototype._private_privateMethod = function (a, b, c, d) {
        if (d) {
            console.log(d._internal_prop);
        }
    };
    return Class;
}());
exports.Class = Class;
