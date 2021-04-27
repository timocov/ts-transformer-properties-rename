"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foo = void 0;
var DoubleUnderscoreProperty = /** @class */ (function () {
    function DoubleUnderscoreProperty() {
        this._internal___foo = "bar";
    }
    return DoubleUnderscoreProperty;
}());
var testObject = new DoubleUnderscoreProperty();
exports.foo = testObject._internal___foo + "baz";
