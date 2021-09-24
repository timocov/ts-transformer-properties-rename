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
        this._private_privateMethod(this.publicProperty, this.publicGetter, opts1.foo);
    };
    Object.defineProperty(Class.prototype, "publicGetter", {
        get: function () {
            return '123';
        },
        enumerable: false,
        configurable: true
    });
    Class.prototype._private_privateMethod = function (a, c, b) { };
    return Class;
}());
function createClass() {
    return new Class();
}
exports.createClass = createClass;
