"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertMessage = alertMessage;
function showMessage(opts) {
    if (opts === void 0) { opts = { _internal_message: 'hello' }; }
    alert(opts._internal_message);
}
function alertMessage(message) {
    showMessage({ _internal_message: message });
}
