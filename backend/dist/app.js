"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_2 = require("./config/cors");
const maintenance_middleware_1 = require("./middlewares/maintenance.middleware");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
const logger_1 = __importDefault(require("./config/logger"));
const app = (0, express_1.default)();
// Middlewareเส
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(maintenance_middleware_1.maintenanceMiddleware);
// HTTP Request Logging
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.default.info(message.trim())
    }
}));
// Routes
app.use('/api', routes_1.default);
// Error Handling Middleware (should be last)
app.use(errorHandler_middleware_1.errorHandler);
exports.default = app;
