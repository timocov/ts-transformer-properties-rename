"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InternalClass = /** @class */ (function () {
    function InternalClass() {
        this.publicProperty = 1;
    }
    return InternalClass;
}());
var InternalClass2 = /** @class */ (function () {
    function InternalClass2() {
        this._internal_publicProperty = 1;
    }
    return InternalClass2;
}());
exports.exportedVariable = (function () {
    return new InternalClass();
})();
exports.exportedVariable2 = (function () {
    return new InternalClass2()._internal_publicProperty;
})();
