"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class(publicField, protectedField, _private_privateField) {
        this.publicField = publicField;
        this.protectedField = protectedField;
        this._private_privateField = _private_privateField;
        console.log(_private_privateField);
    }
    Class.prototype.method = function () {
        console.log(this.publicField.prop, this.protectedField.prop2, this._private_privateField.prop3);
    };
    return Class;
}());
exports.Class = Class;
