"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Class = /** @class */ (function () {
    function Class() {
        console.log('hey');
    }
    Class.factory = function () {
        return new Class();
    };
    return Class;
}());
exports.Class = Class;
