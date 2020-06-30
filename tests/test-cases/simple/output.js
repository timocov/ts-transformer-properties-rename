"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
var Class = /** @class */ (function () {
    function Class() {
        this.publicField = 123;
        this._private_privateField = 'string-value';
        this._private_privateMethod(this._private_privateField);
        this._private_privateMethod(this.publicField);
        this["_private_privateMethod"](this._private_privateField);
    }
    Class.prototype._private_privateMethod = function (a) { };
    return Class;
}());
exports.Class = Class;
