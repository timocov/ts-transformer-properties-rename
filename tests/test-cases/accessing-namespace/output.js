"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportName = void 0;
var NamespaceName;
(function (NamespaceName) {
    function foobar() { }
    NamespaceName.foobar = foobar;
})(NamespaceName || (NamespaceName = {}));
exports.exportName = NamespaceName.foobar();
