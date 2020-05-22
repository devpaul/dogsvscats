var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@nestjs/common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@nestjs/common");
    var AppService = /** @class */ (function () {
        function AppService() {
            this.counts = new Map();
            this.records = new Map();
        }
        AppService.prototype.vote = function (uuid, subject) {
            if (!uuid || !subject) {
                return false;
            }
            var previousRecord = this.records.get(uuid);
            this.records.set(uuid, {
                recorded: new Date(),
                subject: subject,
                uuid: uuid
            });
            previousRecord && this.decrementCount(previousRecord.subject);
            this.incrementCount(subject);
        };
        AppService.prototype.get = function () {
            var e_1, _a;
            var data = {};
            try {
                for (var _b = __values(this.counts.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), subject = _d[0], count = _d[1];
                    data[subject] = count;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return data;
        };
        AppService.prototype.setPassword = function (password) {
            if (!this.password) {
                this.password = password;
                return true;
            }
            return this.password === password;
        };
        AppService.prototype.reset = function (password) {
            if (this.password && this.password === password) {
                console.log('Resetting server');
                console.log('Values before reset', this.get());
                this.counts = new Map();
                this.records = new Map();
                return true;
            }
            return false;
        };
        AppService.prototype.incrementCount = function (subject) {
            var count = (this.counts.get(subject) || 0) + 1;
            this.counts.set(subject, count);
        };
        AppService.prototype.decrementCount = function (subject) {
            var count = (this.counts.get(subject) || 0) - 1;
            this.counts.set(subject, count);
        };
        AppService = __decorate([
            common_1.Injectable()
        ], AppService);
        return AppService;
    }());
    exports.AppService = AppService;
});
//# sourceMappingURL=app.service.js.map