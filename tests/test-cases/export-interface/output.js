"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClass = void 0;
var Class = /** @class */ (function () {
    function Class() {
        this.publicProperty = 123;
    }
    Class.prototype.publicMethod = function (opts) {
        opts.foo = 123;
        var opts1 = {
            foo: 321,
        };
        this._private_privateMethod(this.publicProperty, opts1.foo);
    };
    Class.prototype._private_privateMethod = function (a, b) { };
    return Class;
}());
function createClass() {
    return new Class();
}
exports.createClass = createClass;
