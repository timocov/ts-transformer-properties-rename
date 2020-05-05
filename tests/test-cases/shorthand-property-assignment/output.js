"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getOptions(fooBar) {
    var result = { fooBar: fooBar };
    var internalOptions = { _internal_fooBar: fooBar };
    console.log(internalOptions);
    return result;
}
exports.getOptions = getOptions;
