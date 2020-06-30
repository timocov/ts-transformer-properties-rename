"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColor = void 0;
/** @public */
var myColors = {
    foo: 'red',
    bar: 'blue',
};
function getColor(name) {
    return myColors[name];
}
exports.getColor = getColor;
