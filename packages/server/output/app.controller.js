var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@nestjs/common", "./app.service"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@nestjs/common");
    var app_service_1 = require("./app.service");
    function isBallot(value) {
        return value && typeof value.uuid === 'string' && typeof value.subject == 'string';
    }
    function isAuth(value) {
        return value && typeof value === 'object' && typeof value.password === 'string';
    }
    var AppController = /** @class */ (function () {
        function AppController(appService) {
            this.appService = appService;
        }
        AppController.prototype.tallies = function () {
            return this.appService.get();
        };
        AppController.prototype.setPassword = function (auth) {
            if (isAuth(auth)) {
                return this.appService.setPassword(auth.password);
            }
            else {
                throw new common_1.HttpException('invalid auth', common_1.HttpStatus.BAD_REQUEST);
            }
        };
        AppController.prototype.reset = function (auth) {
            if (isAuth(auth)) {
                return this.appService.reset(auth.password);
            }
            else {
                throw new common_1.HttpException('invalid auth', common_1.HttpStatus.FORBIDDEN);
            }
        };
        AppController.prototype.createRecord = function (ballot) {
            if (isBallot(ballot)) {
                this.appService.vote(ballot.uuid, ballot.subject);
            }
            else {
                throw new common_1.HttpException('invalid ballot', common_1.HttpStatus.BAD_REQUEST);
            }
        };
        __decorate([
            common_1.Get(),
            common_1.Header('Cache-Control', 'none'),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], AppController.prototype, "tallies", null);
        __decorate([
            common_1.Post('/password'),
            __param(0, common_1.Body()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], AppController.prototype, "setPassword", null);
        __decorate([
            common_1.Delete(),
            __param(0, common_1.Body()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], AppController.prototype, "reset", null);
        __decorate([
            common_1.Post(),
            __param(0, common_1.Body()),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], AppController.prototype, "createRecord", null);
        AppController = __decorate([
            common_1.Controller('api'),
            __metadata("design:paramtypes", [app_service_1.AppService])
        ], AppController);
        return AppController;
    }());
    exports.AppController = AppController;
});
//# sourceMappingURL=app.controller.js.map