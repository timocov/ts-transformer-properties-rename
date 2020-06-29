"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestProperties = /** @class */ (function () {
    function TestProperties() {
        this._private__salad = 0;
        this._internal_dressing = 0;
    }
    Object.defineProperty(TestProperties.prototype, "_internal_salad", {
        get: function () { return this._private__salad; },
        set: function (val) { this._private__salad = val; },
        enumerable: true,
        configurable: true
    });
    return TestProperties;
}());
var test1 = new TestProperties();
test1._internal_salad = 0;
test1._internal_dressing = 0;
var totalSalad = test1._internal_salad + 1;
var totalDressing = test1._internal_dressing + 0;
exports.temp = 1;
