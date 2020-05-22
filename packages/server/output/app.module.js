var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@nestjs/common", "./app.controller", "./app.service"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@nestjs/common");
    var app_controller_1 = require("./app.controller");
    var app_service_1 = require("./app.service");
    var AppModule = /** @class */ (function () {
        function AppModule() {
        }
        AppModule.prototype.configure = function (consumer) {
            consumer
                .apply(function (req, _res, next) {
                console.log("[" + new Date() + "] [" + req.method + "]: " + req.url);
                next();
            })
                .forRoutes('api');
        };
        AppModule = __decorate([
            common_1.Module({
                imports: [],
                controllers: [app_controller_1.AppController],
                providers: [app_service_1.AppService]
            })
        ], AppModule);
        return AppModule;
    }());
    exports.AppModule = AppModule;
});
//# sourceMappingURL=app.module.js.map