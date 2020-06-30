"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
var Class = /** @class */ (function () {
    function Class() {
        this.publicField = 123;
        Class._private_privateStaticPropertyMethod();
        Class._private_privateStaticMethod();
    }
    Class._private_privateStaticMethod = function () {
    };
    Class._private_privateStaticPropertyMethod = function () {
    };
    return Class;
}());
exports.Class = Class;
