"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColor = getColor;
/** @public */
var myColors = {
    foo: 'red',
    bar: 'blue',
};
function getColor(name) {
    return myColors[name];
}
