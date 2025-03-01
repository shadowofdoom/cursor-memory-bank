"use strict";
/**
 * Types for the Cursor Memory Bank MCP Server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryBankCommandType = void 0;
var MemoryBankCommandType;
(function (MemoryBankCommandType) {
    MemoryBankCommandType["INITIALIZE"] = "initialize memory bank";
    MemoryBankCommandType["UPDATE"] = "update memory bank";
    MemoryBankCommandType["FOLLOW"] = "follow memory bank";
})(MemoryBankCommandType || (exports.MemoryBankCommandType = MemoryBankCommandType = {}));
