"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (period) => {
    period = period.replace(' ', '').toUpperCase().trim();
    if (period.substring(-1) === 'S') {
        period = period.substring(0, -1);
    }
    const arr = [];
    for (let i = 1; i <= 90; i++) {
        arr.push(`${i}MINUTE`);
        arr.push(`${i}HOUR`);
        arr.push(`${i}DAY`);
        arr.push(`${i}WEEK`);
        arr.push(`${i}MONTH`);
    }
    if (period !== 'NOEXPIRY' && !arr.includes(period)) {
        throw new Error(`Invalid Cryptobox Period - ${period}`);
    }
    return period.replace(/(minute|hour|day|week|month)/i, (match) => ` ${match}`);
};
