"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NamespaceName;
(function (NamespaceName) {
    function foobar() { }
    NamespaceName.foobar = foobar;
})(NamespaceName || (NamespaceName = {}));
exports.exportName = NamespaceName.foobar();
