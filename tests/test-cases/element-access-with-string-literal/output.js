"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function doNothing(fooBar) {
    var internalOptions = { _internal_fooBar: fooBar };
    console.log(internalOptions["_internal_fooBar"]);
}
exports.doNothing = doNothing;
