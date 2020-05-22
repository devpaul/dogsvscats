(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PORT = process.env.PORT || 3000;
    exports.ENV = process.env.NODE_ENV === 'dev' ? 'dev' : 'dist';
    exports.MONGO_PASSWORD = process.env.MONGO_PASSWORD;
    exports.MONGO_URL = "mongodb+srv://devpaul:" + exports.MONGO_PASSWORD + "@cluster0-o29qo.mongodb.net/test?retryWrites=true&w=majority";
});
//# sourceMappingURL=config.js.map