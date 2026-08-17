"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = __importDefault(require("./config/logger"));
const PORT = env_1.env.PORT || 5000;
app_1.default.listen(PORT, '0.0.0.0', () => {
    logger_1.default.info(`=================================`);
    logger_1.default.info(`🚀 SENA Backend API`);
    logger_1.default.info(`=================================`);
    logger_1.default.info(`Environment: ${env_1.env.NODE_ENV}`);
    logger_1.default.info(`Server listening on port ${PORT}`);
    logger_1.default.info(`Health check: http://localhost:${PORT}/api/health`);
    logger_1.default.info(`=================================`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error(`Unhandled Rejection: ${err.message}`);
    // In production you might want to close the server and exit process
});
