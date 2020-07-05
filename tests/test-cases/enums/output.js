"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportedEnum = void 0;
var TestEnum;
(function (TestEnum) {
    TestEnum[TestEnum["_internal_Test1"] = 0] = "_internal_Test1";
    TestEnum[TestEnum["_internal_Test2"] = 1] = "_internal_Test2";
    TestEnum[TestEnum["_internal_Test3"] = 2] = "_internal_Test3";
})(TestEnum || (TestEnum = {}));
console.log(TestEnum._internal_Test1);
console.log(TestEnum["_internal_Test2"]);
var ExportedEnum;
(function (ExportedEnum) {
    ExportedEnum[ExportedEnum["Foo"] = 0] = "Foo";
})(ExportedEnum = exports.ExportedEnum || (exports.ExportedEnum = {}));
