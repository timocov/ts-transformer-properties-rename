"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class() {
        this._private_privateField = 'string-value';
        Class.prototype._private_privateMethod.call(this, this._private_privateField);
        Class.prototype.publicMethod.call(this);
    }
    Class.prototype.publicMethod = function () {
    };
    Class.prototype._private_privateMethod = function (a) {
    };
    return Class;
}());
exports.Class = Class;
