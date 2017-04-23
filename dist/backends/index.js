"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backends
var ASM_1 = require("./ASM");
var BLAS_1 = require("./BLAS");
var CPU_1 = require("./CPU");
var GPU_1 = require("./GPU");
var Paper_1 = require("./Paper");
var WebWorker_1 = require("./WebWorker");
exports.default = {
    ASM: ASM_1.default,
    BLAS: BLAS_1.default,
    CPU: CPU_1.default,
    GPU: GPU_1.default,
    Paper: Paper_1.default,
    WebWorker: WebWorker_1.default
};
//# sourceMappingURL=index.js.map