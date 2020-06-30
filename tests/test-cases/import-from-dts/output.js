"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doNothing = void 0;
var class_name_1 = require("./class-name");
function doNothing() {
    var classObj = new class_name_1.ClassName();
    classObj.doSomething();
}
exports.doNothing = doNothing;
