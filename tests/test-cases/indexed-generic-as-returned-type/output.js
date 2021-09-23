"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBarValue(value, seriesType) {
    if (seriesType === 'Bar') {
        return {
            open: value,
            high: value,
            low: value,
            close: value,
        };
    }
    else {
        return value;
    }
}
