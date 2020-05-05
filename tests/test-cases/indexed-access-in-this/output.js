"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var obj = {};
var Class = /** @class */ (function () {
    function Class() {
        this._private_privateField = 'string-value';
        this.publicField = 123;
        this[356] = 3;
        var that = this;
        this["_private_privateMethod"](this._private_privateField);
        that["_private_privateMethod"](this._private_privateField);
        obj['privateMethod'] = this._private_privateField;
        that._private_privateMethod2(this[356]);
    }
    Class.prototype._private_privateMethod = function (a) {
    };
    Class.prototype._private_privateMethod2 = function (a) {
    };
    return Class;
}());
exports.Class = Class;
