"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.func = void 0;
function func(type) {
    if ('isAnother' in type) {
        console.log(type.bar);
    }
    else {
        console.log(type.foo);
    }
    var nonExportedVar = getNonExported();
    if ("_internal_isAnother" in nonExportedVar) {
        console.log(nonExportedVar._internal_bar);
    }
    else {
        console.log(nonExportedVar._internal_foo);
    }
    if ('onorientationchange' in window || 'button' in moveEvent) {
        console.log('check');
    }
}
exports.func = func;
