"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Helpers.prototype._internal_doNothing = function () { };
    return Helpers;
}());
var Class = /** @class */ (function () {
    function Class() {
    }
    Class.prototype.doSomething = function () {
        var helpers = new Helpers();
        helpers._internal_doNothing();
    };
    return Class;
}());
exports.Class = Class;
