"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class() {
        this._private_field = Math.random();
    }
    Class.prototype.compare = function (rhs) {
        return this._private_field > rhs._private_field;
    };
    return Class;
}());
exports.Class = Class;
