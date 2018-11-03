/*!
 * 
 * [Dojo](https://dojo.io/)
 * Copyright [JS Foundation](https://js.foundation/) & contributors
 * [New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
 * All rights reserved
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("catsvsdogs", [], factory);
	else if(typeof exports === 'object')
		exports["catsvsdogs"] = factory();
	else
		root["catsvsdogs"] = factory();
})(this, function() {
return dojoWebpackJsonpcatsvsdogs(["main"],{

/***/ "./node_modules/@dojo/framework/core/Destroyable.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Promise__ = __webpack_require__("./node_modules/@dojo/framework/shim/Promise.mjs");

/**
 * No op function used to replace a Destroyable instance's `destroy` method, once the instance has been destroyed
 */
function noop() {
    return __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */].resolve(false);
}
/**
 * No op function used to replace a Destroyable instance's `own` method, once the instance has been destroyed
 */
function destroyed() {
    throw new Error('Call made to destroyed method');
}
class Destroyable {
    /**
     * @constructor
     */
    constructor() {
        this.handles = [];
    }
    /**
     * Register handles for the instance that will be destroyed when `this.destroy` is called
     *
     * @param {Handle} handle The handle to add for the instance
     * @returns {Handle} A wrapper Handle. When the wrapper Handle's `destroy` method is invoked, the original handle is
     *                   removed from the instance, and its `destroy` method is invoked.
     */
    own(handle) {
        const { handles: _handles } = this;
        _handles.push(handle);
        return {
            destroy() {
                _handles.splice(_handles.indexOf(handle));
                handle.destroy();
            }
        };
    }
    /**
     * Destroys all handlers registered for the instance
     *
     * @returns {Promise<any} A Promise that resolves once all handles have been destroyed
     */
    destroy() {
        return new __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]((resolve) => {
            this.handles.forEach((handle) => {
                handle && handle.destroy && handle.destroy();
            });
            this.destroy = noop;
            this.own = destroyed;
            resolve(true);
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Destroyable;

/* unused harmony default export */ var _unused_webpack_default_export = (Destroyable);
//# sourceMappingURL=Destroyable.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/core/Evented.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = isGlobMatch;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Destroyable__ = __webpack_require__("./node_modules/@dojo/framework/core/Destroyable.mjs");


/**
 * Map of computed regular expressions, keyed by string
 */
const regexMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
/**
 * Determines if the event type glob has been matched
 *
 * @returns boolean that indicates if the glob is matched
 */
function isGlobMatch(globString, targetString) {
    if (typeof targetString === 'string' && typeof globString === 'string' && globString.indexOf('*') !== -1) {
        let regex;
        if (regexMap.has(globString)) {
            regex = regexMap.get(globString);
        }
        else {
            regex = new RegExp(`^${globString.replace(/\*/g, '.*')}$`);
            regexMap.set(globString, regex);
        }
        return regex.test(targetString);
    }
    else {
        return globString === targetString;
    }
}
/**
 * Event Class
 */
class Evented extends __WEBPACK_IMPORTED_MODULE_1__Destroyable__["a" /* Destroyable */] {
    constructor() {
        super(...arguments);
        /**
         * map of listeners keyed by event type
         */
        this.listenersMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
    }
    emit(event) {
        this.listenersMap.forEach((methods, type) => {
            if (isGlobMatch(type, event.type)) {
                [...methods].forEach((method) => {
                    method.call(this, event);
                });
            }
        });
    }
    on(type, listener) {
        if (Array.isArray(listener)) {
            const handles = listener.map((listener) => this._addListener(type, listener));
            return {
                destroy() {
                    handles.forEach((handle) => handle.destroy());
                }
            };
        }
        return this._addListener(type, listener);
    }
    _addListener(type, listener) {
        const listeners = this.listenersMap.get(type) || [];
        listeners.push(listener);
        this.listenersMap.set(type, listeners);
        return {
            destroy: () => {
                const listeners = this.listenersMap.get(type) || [];
                listeners.splice(listeners.indexOf(listener), 1);
            }
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Evented;

/* harmony default export */ __webpack_exports__["b"] = (Evented);
//# sourceMappingURL=Evented.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/core/QueuingEvented.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");


/**
 * An implementation of the Evented class that queues up events when no listeners are
 * listening. When a listener is subscribed, the queue will be published to the listener.
 * When the queue is full, the oldest events will be discarded to make room for the newest ones.
 *
 * @property maxEvents  The number of events to queue before old events are discarded. If zero (default), an unlimited number of events is queued.
 */
class QueuingEvented extends __WEBPACK_IMPORTED_MODULE_1__Evented__["b" /* default */] {
    constructor() {
        super(...arguments);
        this._queue = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
        this.maxEvents = 0;
    }
    emit(event) {
        super.emit(event);
        let hasMatch = false;
        this.listenersMap.forEach((method, type) => {
            // Since `type` is generic, the compiler doesn't know what type it is and `isGlobMatch` requires `string | symbol`
            if (Object(__WEBPACK_IMPORTED_MODULE_1__Evented__["c" /* isGlobMatch */])(type, event.type)) {
                hasMatch = true;
            }
        });
        if (!hasMatch) {
            let queue = this._queue.get(event.type);
            if (!queue) {
                queue = [];
                this._queue.set(event.type, queue);
            }
            queue.push(event);
            if (this.maxEvents > 0) {
                while (queue.length > this.maxEvents) {
                    queue.shift();
                }
            }
        }
    }
    on(type, listener) {
        let handle = super.on(type, listener);
        this.listenersMap.forEach((method, listenerType) => {
            this._queue.forEach((events, queuedType) => {
                if (Object(__WEBPACK_IMPORTED_MODULE_1__Evented__["c" /* isGlobMatch */])(listenerType, queuedType)) {
                    events.forEach((event) => this.emit(event));
                    this._queue.delete(queuedType);
                }
            });
        });
        return handle;
    }
}
/* harmony default export */ __webpack_exports__["a"] = (QueuingEvented);
//# sourceMappingURL=QueuingEvented.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/has/has.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(global, process) {/* harmony export (immutable) */ __webpack_exports__["load"] = load;
/* harmony export (immutable) */ __webpack_exports__["normalize"] = normalize;
/* harmony export (immutable) */ __webpack_exports__["exists"] = exists;
/* harmony export (immutable) */ __webpack_exports__["add"] = add;
/* harmony export (immutable) */ __webpack_exports__["default"] = has;
function isFeatureTestThenable(value) {
    return value && value.then;
}
/**
 * A cache of results of feature tests
 */
const testCache = {};
/* harmony export (immutable) */ __webpack_exports__["testCache"] = testCache;

/**
 * A cache of the un-resolved feature tests
 */
const testFunctions = {};
/* harmony export (immutable) */ __webpack_exports__["testFunctions"] = testFunctions;

/**
 * A cache of unresolved thenables (probably promises)
 * @type {{}}
 */
const testThenables = {};
/**
 * A reference to the global scope (`window` in a browser, `global` in NodeJS)
 */
const globalScope = (function () {
    /* istanbul ignore else */
    if (typeof window !== 'undefined') {
        // Browsers
        return window;
    }
    else if (typeof global !== 'undefined') {
        // Node
        return global;
    }
    else if (typeof self !== 'undefined') {
        // Web workers
        return self;
    }
    /* istanbul ignore next */
    return {};
})();
/* Grab the staticFeatures if there are available */
const { staticFeatures } = globalScope.DojoHasEnvironment || {};
/* Cleaning up the DojoHasEnviornment */
if ('DojoHasEnvironment' in globalScope) {
    delete globalScope.DojoHasEnvironment;
}
/**
 * Custom type guard to narrow the `staticFeatures` to either a map or a function that
 * returns a map.
 *
 * @param value The value to guard for
 */
function isStaticFeatureFunction(value) {
    return typeof value === 'function';
}
/**
 * The cache of asserted features that were available in the global scope when the
 * module loaded
 */
const staticCache = staticFeatures
    ? isStaticFeatureFunction(staticFeatures)
        ? staticFeatures.apply(globalScope)
        : staticFeatures
    : {}; /* Providing an empty cache, if none was in the environment

/**
* AMD plugin function.
*
* Conditional loads modules based on a has feature test value.
*
* @param resourceId Gives the resolved module id to load.
* @param require The loader require function with respect to the module that contained the plugin resource in its
*                dependency list.
* @param load Callback to loader that consumes result of plugin demand.
*/
function load(resourceId, require, load, config) {
    resourceId ? require([resourceId], load) : load();
}
/**
 * AMD plugin function.
 *
 * Resolves resourceId into a module id based on possibly-nested tenary expression that branches on has feature test
 * value(s).
 *
 * @param resourceId The id of the module
 * @param normalize Resolves a relative module id into an absolute module id
 */
function normalize(resourceId, normalize) {
    const tokens = resourceId.match(/[\?:]|[^:\?]*/g) || [];
    let i = 0;
    function get(skip) {
        const term = tokens[i++];
        if (term === ':') {
            // empty string module name, resolves to null
            return null;
        }
        else {
            // postfixed with a ? means it is a feature to branch on, the term is the name of the feature
            if (tokens[i++] === '?') {
                if (!skip && has(term)) {
                    // matched the feature, get the first value from the options
                    return get();
                }
                else {
                    // did not match, get the second value, passing over the first
                    get(true);
                    return get(skip);
                }
            }
            // a module
            return term;
        }
    }
    const id = get();
    return id && normalize(id);
}
/**
 * Check if a feature has already been registered
 *
 * @param feature the name of the feature
 */
function exists(feature) {
    const normalizedFeature = feature.toLowerCase();
    return Boolean(normalizedFeature in staticCache || normalizedFeature in testCache || testFunctions[normalizedFeature]);
}
/**
 * Register a new test for a named feature.
 *
 * @example
 * has.add('dom-addeventlistener', !!document.addEventListener);
 *
 * @example
 * has.add('touch-events', function () {
 *    return 'ontouchstart' in document
 * });
 *
 * @param feature the name of the feature
 * @param value the value reported of the feature, or a function that will be executed once on first test
 * @param overwrite if an existing value should be overwritten. Defaults to false.
 */
function add(feature, value, overwrite = false) {
    const normalizedFeature = feature.toLowerCase();
    if (exists(normalizedFeature) && !overwrite && !(normalizedFeature in staticCache)) {
        throw new TypeError(`Feature "${feature}" exists and overwrite not true.`);
    }
    if (typeof value === 'function') {
        testFunctions[normalizedFeature] = value;
    }
    else if (isFeatureTestThenable(value)) {
        testThenables[feature] = value.then((resolvedValue) => {
            testCache[feature] = resolvedValue;
            delete testThenables[feature];
        }, () => {
            delete testThenables[feature];
        });
    }
    else {
        testCache[normalizedFeature] = value;
        delete testFunctions[normalizedFeature];
    }
}
/**
 * Return the current value of a named feature.
 *
 * @param feature The name of the feature to test.
 */
function has(feature) {
    let result;
    const normalizedFeature = feature.toLowerCase();
    if (normalizedFeature in staticCache) {
        result = staticCache[normalizedFeature];
    }
    else if (testFunctions[normalizedFeature]) {
        result = testCache[normalizedFeature] = testFunctions[normalizedFeature].call(null);
        delete testFunctions[normalizedFeature];
    }
    else if (normalizedFeature in testCache) {
        result = testCache[normalizedFeature];
    }
    else if (feature in testThenables) {
        return false;
    }
    else {
        throw new TypeError(`Attempt to detect unregistered has feature "${feature}"`);
    }
    return result;
}
/*
 * Out of the box feature tests
 */
/* Environments */
/* Used as a value to provide a debug only code path */
add('debug', true);
/* flag for dojo debug, default to false */
add('dojo-debug', false);
/* Detects if the environment is "browser like" */
add('host-browser', typeof document !== 'undefined' && typeof location !== 'undefined');
/* Detects if the environment appears to be NodeJS */
add('host-node', function () {
    if (typeof process === 'object' && process.versions && process.versions.node) {
        return process.versions.node;
    }
});
//# sourceMappingURL=has.mjs.map
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/global.js"), __webpack_require__("./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/@dojo/framework/routing/Link.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");



class Link extends __WEBPACK_IMPORTED_MODULE_1__widget_core_WidgetBase__["a" /* WidgetBase */] {
    _getProperties() {
        let _a = this.properties, { routerKey = 'router', to, isOutlet = true, target, params = {}, onClick } = _a, props = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __rest */](_a, ["routerKey", "to", "isOutlet", "target", "params", "onClick"]);
        const item = this.registry.getInjector(routerKey);
        let href = to;
        if (item) {
            const router = item.injector();
            if (isOutlet) {
                href = router.link(href, params);
            }
            const onclick = (event) => {
                onClick && onClick(event);
                if (!event.defaultPrevented && event.button === 0 && !target) {
                    event.preventDefault();
                    href !== undefined && router.setPath(href);
                }
            };
            props = Object.assign({}, props, { onclick, href });
        }
        else {
            props = Object.assign({}, props, { href });
        }
        return props;
    }
    render() {
        return Object(__WEBPACK_IMPORTED_MODULE_2__widget_core_d__["f" /* v */])('a', this._getProperties(), this.children);
    }
}
/* unused harmony export Link */

/* harmony default export */ __webpack_exports__["a"] = (Link);
//# sourceMappingURL=Link.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/routing/Outlet.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Outlet */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__widget_core_decorators_alwaysRender__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__widget_core_decorators_diffProperty__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");




let Outlet = class Outlet extends __WEBPACK_IMPORTED_MODULE_1__widget_core_WidgetBase__["a" /* WidgetBase */] {
    onRouterKeyChange(current, next) {
        const { routerKey = 'router' } = next;
        const item = this.registry.getInjector(routerKey);
        if (this._handle) {
            this._handle.destroy();
            this._handle = undefined;
        }
        if (item) {
            this._handle = item.invalidator.on('invalidate', () => {
                this.invalidate();
            });
            this.own(this._handle);
        }
    }
    onAttach() {
        if (!this._handle) {
            this.onRouterKeyChange(this.properties, this.properties);
        }
    }
    render() {
        const { renderer, id, routerKey = 'router' } = this.properties;
        const item = this.registry.getInjector(routerKey);
        if (item) {
            const router = item.injector();
            const outletContext = router.getOutlet(id);
            if (outletContext) {
                const { queryParams, params, type, isError, isExact } = outletContext;
                const result = renderer({ queryParams, params, type, isError, isExact, router });
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }
};
__WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_3__widget_core_decorators_diffProperty__["a" /* diffProperty */])('routerKey')
], Outlet.prototype, "onRouterKeyChange", null);
Outlet = __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_2__widget_core_decorators_alwaysRender__["a" /* alwaysRender */])()
], Outlet);

/* harmony default export */ __webpack_exports__["a"] = (Outlet);
//# sourceMappingURL=Outlet.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/routing/Router.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_QueuingEvented__ = __webpack_require__("./node_modules/@dojo/framework/core/QueuingEvented.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__history_HashHistory__ = __webpack_require__("./node_modules/@dojo/framework/routing/history/HashHistory.mjs");


const PARAM = '__PARAM__';
const paramRegExp = new RegExp(/^{.+}$/);
const ROUTE_SEGMENT_SCORE = 7;
const DYNAMIC_SEGMENT_PENALTY = 2;
function matchingParams({ params: previousParams }, { params }) {
    const matching = Object.keys(previousParams).every((key) => previousParams[key] === params[key]);
    if (!matching) {
        return false;
    }
    return Object.keys(params).every((key) => previousParams[key] === params[key]);
}
class Router extends __WEBPACK_IMPORTED_MODULE_0__core_QueuingEvented__["a" /* default */] {
    constructor(config, options = {}) {
        super();
        this._routes = [];
        this._outletMap = Object.create(null);
        this._matchedOutlets = Object.create(null);
        this._currentParams = {};
        this._currentQueryParams = {};
        /**
         * Called on change of the route by the the registered history manager. Matches the path against
         * the registered outlets.
         *
         * @param requestedPath The path of the requested route
         */
        this._onChange = (requestedPath) => {
            requestedPath = this._stripLeadingSlash(requestedPath);
            const previousMatchedOutlets = this._matchedOutlets;
            this._matchedOutlets = Object.create(null);
            const [path, queryParamString] = requestedPath.split('?');
            this._currentQueryParams = this._getQueryParams(queryParamString);
            const segments = path.split('/');
            let routeConfigs = this._routes.map((route) => ({
                route,
                segments: [...segments],
                parent: undefined,
                params: {}
            }));
            let routeConfig;
            let matchedRoutes = [];
            while ((routeConfig = routeConfigs.pop())) {
                const { route, parent, segments, params } = routeConfig;
                let segmentIndex = 0;
                let type = 'index';
                let paramIndex = 0;
                let routeMatch = true;
                if (segments.length < route.segments.length) {
                    routeMatch = false;
                }
                else {
                    while (segments.length > 0) {
                        if (route.segments[segmentIndex] === undefined) {
                            type = 'partial';
                            break;
                        }
                        const segment = segments.shift();
                        if (route.segments[segmentIndex] === PARAM) {
                            params[route.params[paramIndex++]] = segment;
                            this._currentParams = Object.assign({}, this._currentParams, params);
                        }
                        else if (route.segments[segmentIndex] !== segment) {
                            routeMatch = false;
                            break;
                        }
                        segmentIndex++;
                    }
                }
                if (routeMatch) {
                    routeConfig.type = type;
                    matchedRoutes.push({ route, parent, type, params, segments: [] });
                    if (segments.length) {
                        routeConfigs = [
                            ...routeConfigs,
                            ...route.children.map((childRoute) => ({
                                route: childRoute,
                                segments: [...segments],
                                parent: routeConfig,
                                type,
                                params: Object.assign({}, params)
                            }))
                        ];
                    }
                }
            }
            let matchedOutletName = undefined;
            let matchedRoute = matchedRoutes.reduce((match, matchedRoute) => {
                if (!match) {
                    return matchedRoute;
                }
                if (match.route.score > matchedRoute.route.score) {
                    return match;
                }
                return matchedRoute;
            }, undefined);
            if (matchedRoute) {
                if (matchedRoute.type === 'partial') {
                    matchedRoute.type = 'error';
                }
                matchedOutletName = matchedRoute.route.outlet;
                while (matchedRoute) {
                    let { type, params, parent, route } = matchedRoute;
                    const matchedOutlet = {
                        id: route.outlet,
                        queryParams: this._currentQueryParams,
                        params,
                        type,
                        isError: () => type === 'error',
                        isExact: () => type === 'index'
                    };
                    const previousMatchedOutlet = previousMatchedOutlets[route.outlet];
                    this._matchedOutlets[route.outlet] = matchedOutlet;
                    if (!previousMatchedOutlet || !matchingParams(previousMatchedOutlet, matchedOutlet)) {
                        this.emit({ type: 'outlet', outlet: matchedOutlet, action: 'enter' });
                    }
                    matchedRoute = parent;
                }
            }
            else {
                this._matchedOutlets.errorOutlet = {
                    id: 'errorOutlet',
                    queryParams: {},
                    params: {},
                    isError: () => true,
                    isExact: () => false,
                    type: 'error'
                };
            }
            const previousMatchedOutletKeys = Object.keys(previousMatchedOutlets);
            for (let i = 0; i < previousMatchedOutletKeys.length; i++) {
                const key = previousMatchedOutletKeys[i];
                const matchedOutlet = this._matchedOutlets[key];
                if (!matchedOutlet || !matchingParams(previousMatchedOutlets[key], matchedOutlet)) {
                    this.emit({ type: 'outlet', outlet: previousMatchedOutlets[key], action: 'exit' });
                }
            }
            this.emit({
                type: 'nav',
                outlet: matchedOutletName,
                context: matchedOutletName ? this._matchedOutlets[matchedOutletName] : undefined
            });
        };
        const { HistoryManager = __WEBPACK_IMPORTED_MODULE_1__history_HashHistory__["a" /* HashHistory */], base, window } = options;
        this._register(config);
        this._history = new HistoryManager({ onChange: this._onChange, base, window });
        if (this._matchedOutlets.errorOutlet && this._defaultOutlet) {
            const path = this.link(this._defaultOutlet);
            if (path) {
                this.setPath(path);
            }
        }
    }
    /**
     * Sets the path against the registered history manager
     *
     * @param path The path to set on the history manager
     */
    setPath(path) {
        this._history.set(path);
    }
    /**
     * Generate a link for a given outlet identifier and optional params.
     *
     * @param outlet The outlet to generate a link for
     * @param params Optional Params for the generated link
     */
    link(outlet, params = {}) {
        const { _outletMap, _currentParams, _currentQueryParams } = this;
        let route = _outletMap[outlet];
        if (route === undefined) {
            return;
        }
        let linkPath = route.fullPath;
        if (route.fullQueryParams.length > 0) {
            let queryString = route.fullQueryParams.reduce((queryParamString, param, index) => {
                if (index > 0) {
                    return `${queryParamString}&${param}={${param}}`;
                }
                return `?${param}={${param}}`;
            }, '');
            linkPath = `${linkPath}${queryString}`;
        }
        params = Object.assign({}, route.defaultParams, _currentQueryParams, _currentParams, params);
        if (Object.keys(params).length === 0 && route.fullParams.length > 0) {
            return undefined;
        }
        const fullParams = [...route.fullParams, ...route.fullQueryParams];
        for (let i = 0; i < fullParams.length; i++) {
            const param = fullParams[i];
            if (params[param]) {
                linkPath = linkPath.replace(`{${param}}`, params[param]);
            }
            else {
                return undefined;
            }
        }
        return linkPath;
    }
    /**
     * Returns the outlet context for the outlet identifier if one has been matched
     *
     * @param outletIdentifier The outlet identifer
     */
    getOutlet(outletIdentifier) {
        return this._matchedOutlets[outletIdentifier];
    }
    /**
     * Returns all the params for the current matched outlets
     */
    get currentParams() {
        return this._currentParams;
    }
    /**
     * Strips the leading slash on a path if one exists
     *
     * @param path The path to strip a leading slash
     */
    _stripLeadingSlash(path) {
        if (path[0] === '/') {
            return path.slice(1);
        }
        return path;
    }
    /**
     * Registers the routing configuration
     *
     * @param config The configuration
     * @param routes The routes
     * @param parentRoute The parent route
     */
    _register(config, routes, parentRoute) {
        routes = routes ? routes : this._routes;
        for (let i = 0; i < config.length; i++) {
            let { path, outlet, children, defaultRoute = false, defaultParams = {} } = config[i];
            let [parsedPath, queryParamString] = path.split('?');
            let queryParams = [];
            parsedPath = this._stripLeadingSlash(parsedPath);
            const segments = parsedPath.split('/');
            const route = {
                params: [],
                outlet,
                path: parsedPath,
                segments,
                defaultParams: parentRoute ? Object.assign({}, parentRoute.defaultParams, defaultParams) : defaultParams,
                children: [],
                fullPath: parentRoute ? `${parentRoute.fullPath}/${parsedPath}` : parsedPath,
                fullParams: [],
                fullQueryParams: [],
                score: parentRoute ? parentRoute.score : 0
            };
            if (defaultRoute) {
                this._defaultOutlet = outlet;
            }
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                route.score += ROUTE_SEGMENT_SCORE;
                if (paramRegExp.test(segment)) {
                    route.score -= DYNAMIC_SEGMENT_PENALTY;
                    route.params.push(segment.replace('{', '').replace('}', ''));
                    segments[i] = PARAM;
                }
            }
            if (queryParamString) {
                queryParams = queryParamString.split('&').map((queryParam) => {
                    return queryParam.replace('{', '').replace('}', '');
                });
            }
            route.fullQueryParams = parentRoute ? [...parentRoute.fullQueryParams, ...queryParams] : queryParams;
            route.fullParams = parentRoute ? [...parentRoute.fullParams, ...route.params] : route.params;
            if (children && children.length > 0) {
                this._register(children, route.children, route);
            }
            this._outletMap[outlet] = route;
            routes.push(route);
        }
    }
    /**
     * Returns an object of query params
     *
     * @param queryParamString The string of query params, e.g `paramOne=one&paramTwo=two`
     */
    _getQueryParams(queryParamString) {
        const queryParams = {};
        if (queryParamString) {
            const queryParameters = queryParamString.split('&');
            for (let i = 0; i < queryParameters.length; i++) {
                const [key, value] = queryParameters[i].split('=');
                queryParams[key] = value;
            }
        }
        return queryParams;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Router;

/* unused harmony default export */ var _unused_webpack_default_export = (Router);
//# sourceMappingURL=Router.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/routing/RouterInjector.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = registerRouterInjector;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Router__ = __webpack_require__("./node_modules/@dojo/framework/routing/Router.mjs");


/**
 * Creates a router instance for a specific History manager (default is `HashHistory`) and registers
 * the route configuration.
 *
 * @param config The route config to register for the router
 * @param registry An optional registry that defaults to the global registry
 * @param options The router injector options
 */
function registerRouterInjector(config, registry, options = {}) {
    const { key = 'router' } = options, routerOptions = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __rest */](options, ["key"]);
    if (registry.hasInjector(key)) {
        throw new Error('Router has already been defined');
    }
    const router = new __WEBPACK_IMPORTED_MODULE_1__Router__["a" /* Router */](config, routerOptions);
    registry.defineInjector(key, (invalidator) => {
        router.on('nav', () => invalidator());
        return () => router;
    });
    return router;
}
//# sourceMappingURL=RouterInjector.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/routing/history/HashHistory.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");

class HashHistory {
    constructor({ window = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].window, onChange }) {
        this._onChange = () => {
            this._current = this.normalizePath(this._window.location.hash);
            this._onChangeFunction(this._current);
        };
        this._onChangeFunction = onChange;
        this._window = window;
        this._window.addEventListener('hashchange', this._onChange, false);
        this._current = this.normalizePath(this._window.location.hash);
        this._onChangeFunction(this._current);
    }
    normalizePath(path) {
        return path.replace('#', '');
    }
    prefix(path) {
        if (path[0] !== '#') {
            return `#${path}`;
        }
        return path;
    }
    set(path) {
        this._window.location.hash = this.prefix(path);
    }
    get current() {
        return this._current;
    }
    destroy() {
        this._window.removeEventListener('hashchange', this._onChange);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = HashHistory;

/* unused harmony default export */ var _unused_webpack_default_export = (HashHistory);
//# sourceMappingURL=HashHistory.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Map.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Map; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__object__ = __webpack_require__("./node_modules/@dojo/framework/shim/object.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");





let Map = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map;
if (false) {
    Map = (_a = class Map {
            constructor(iterable) {
                this._keys = [];
                this._values = [];
                this[Symbol.toStringTag] = 'Map';
                if (iterable) {
                    if (isArrayLike(iterable)) {
                        for (let i = 0; i < iterable.length; i++) {
                            const value = iterable[i];
                            this.set(value[0], value[1]);
                        }
                    }
                    else {
                        for (const value of iterable) {
                            this.set(value[0], value[1]);
                        }
                    }
                }
            }
            /**
             * An alternative to Array.prototype.indexOf using Object.is
             * to check for equality. See http://mzl.la/1zuKO2V
             */
            _indexOfKey(keys, key) {
                for (let i = 0, length = keys.length; i < length; i++) {
                    if (objectIs(keys[i], key)) {
                        return i;
                    }
                }
                return -1;
            }
            get size() {
                return this._keys.length;
            }
            clear() {
                this._keys.length = this._values.length = 0;
            }
            delete(key) {
                const index = this._indexOfKey(this._keys, key);
                if (index < 0) {
                    return false;
                }
                this._keys.splice(index, 1);
                this._values.splice(index, 1);
                return true;
            }
            entries() {
                const values = this._keys.map((key, i) => {
                    return [key, this._values[i]];
                });
                return new ShimIterator(values);
            }
            forEach(callback, context) {
                const keys = this._keys;
                const values = this._values;
                for (let i = 0, length = keys.length; i < length; i++) {
                    callback.call(context, values[i], keys[i], this);
                }
            }
            get(key) {
                const index = this._indexOfKey(this._keys, key);
                return index < 0 ? undefined : this._values[index];
            }
            has(key) {
                return this._indexOfKey(this._keys, key) > -1;
            }
            keys() {
                return new ShimIterator(this._keys);
            }
            set(key, value) {
                let index = this._indexOfKey(this._keys, key);
                index = index < 0 ? this._keys.length : index;
                this._keys[index] = key;
                this._values[index] = value;
                return this;
            }
            values() {
                return new ShimIterator(this._values);
            }
            [Symbol.iterator]() {
                return this.entries();
            }
        },
        _a[Symbol.species] = _a,
        _a);
}
/* harmony default export */ __webpack_exports__["b"] = (Map);
var _a;
//# sourceMappingURL=Map.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Promise.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ShimPromise */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_queue__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/queue.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");




let ShimPromise = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Promise;
const isThenable = function isThenable(value) {
    return value && typeof value.then === 'function';
};
/* unused harmony export isThenable */

if (false) {
    global.Promise = ShimPromise = (_a = class Promise {
            /**
             * Creates a new Promise.
             *
             * @constructor
             *
             * @param executor
             * The executor function is called immediately when the Promise is instantiated. It is responsible for
             * starting the asynchronous operation when it is invoked.
             *
             * The executor must call either the passed `resolve` function when the asynchronous operation has completed
             * successfully, or the `reject` function when the operation fails.
             */
            constructor(executor) {
                /**
                 * The current state of this promise.
                 */
                this.state = 1 /* Pending */;
                this[Symbol.toStringTag] = 'Promise';
                /**
                 * If true, the resolution of this promise is chained ("locked in") to another promise.
                 */
                let isChained = false;
                /**
                 * Whether or not this promise is in a resolved state.
                 */
                const isResolved = () => {
                    return this.state !== 1 /* Pending */ || isChained;
                };
                /**
                 * Callbacks that should be invoked once the asynchronous operation has completed.
                 */
                let callbacks = [];
                /**
                 * Initially pushes callbacks onto a queue for execution once this promise settles. After the promise settles,
                 * enqueues callbacks for execution on the next event loop turn.
                 */
                let whenFinished = function (callback) {
                    if (callbacks) {
                        callbacks.push(callback);
                    }
                };
                /**
                 * Settles this promise.
                 *
                 * @param newState The resolved state for this promise.
                 * @param {T|any} value The resolved value for this promise.
                 */
                const settle = (newState, value) => {
                    // A promise can only be settled once.
                    if (this.state !== 1 /* Pending */) {
                        return;
                    }
                    this.state = newState;
                    this.resolvedValue = value;
                    whenFinished = queueMicroTask;
                    // Only enqueue a callback runner if there are callbacks so that initially fulfilled Promises don't have to
                    // wait an extra turn.
                    if (callbacks && callbacks.length > 0) {
                        queueMicroTask(function () {
                            if (callbacks) {
                                let count = callbacks.length;
                                for (let i = 0; i < count; ++i) {
                                    callbacks[i].call(null);
                                }
                                callbacks = null;
                            }
                        });
                    }
                };
                /**
                 * Resolves this promise.
                 *
                 * @param newState The resolved state for this promise.
                 * @param {T|any} value The resolved value for this promise.
                 */
                const resolve = (newState, value) => {
                    if (isResolved()) {
                        return;
                    }
                    if (isThenable(value)) {
                        value.then(settle.bind(null, 0 /* Fulfilled */), settle.bind(null, 2 /* Rejected */));
                        isChained = true;
                    }
                    else {
                        settle(newState, value);
                    }
                };
                this.then = (onFulfilled, onRejected) => {
                    return new Promise((resolve, reject) => {
                        // whenFinished initially queues up callbacks for execution after the promise has settled. Once the
                        // promise has settled, whenFinished will schedule callbacks for execution on the next turn through the
                        // event loop.
                        whenFinished(() => {
                            const callback = this.state === 2 /* Rejected */ ? onRejected : onFulfilled;
                            if (typeof callback === 'function') {
                                try {
                                    resolve(callback(this.resolvedValue));
                                }
                                catch (error) {
                                    reject(error);
                                }
                            }
                            else if (this.state === 2 /* Rejected */) {
                                reject(this.resolvedValue);
                            }
                            else {
                                resolve(this.resolvedValue);
                            }
                        });
                    });
                };
                try {
                    executor(resolve.bind(null, 0 /* Fulfilled */), resolve.bind(null, 2 /* Rejected */));
                }
                catch (error) {
                    settle(2 /* Rejected */, error);
                }
            }
            static all(iterable) {
                return new this(function (resolve, reject) {
                    const values = [];
                    let complete = 0;
                    let total = 0;
                    let populating = true;
                    function fulfill(index, value) {
                        values[index] = value;
                        ++complete;
                        finish();
                    }
                    function finish() {
                        if (populating || complete < total) {
                            return;
                        }
                        resolve(values);
                    }
                    function processItem(index, item) {
                        ++total;
                        if (isThenable(item)) {
                            // If an item Promise rejects, this Promise is immediately rejected with the item
                            // Promise's rejection error.
                            item.then(fulfill.bind(null, index), reject);
                        }
                        else {
                            Promise.resolve(item).then(fulfill.bind(null, index));
                        }
                    }
                    let i = 0;
                    for (const value of iterable) {
                        processItem(i, value);
                        i++;
                    }
                    populating = false;
                    finish();
                });
            }
            static race(iterable) {
                return new this(function (resolve, reject) {
                    for (const item of iterable) {
                        if (item instanceof Promise) {
                            // If a Promise item rejects, this Promise is immediately rejected with the item
                            // Promise's rejection error.
                            item.then(resolve, reject);
                        }
                        else {
                            Promise.resolve(item).then(resolve);
                        }
                    }
                });
            }
            static reject(reason) {
                return new this(function (resolve, reject) {
                    reject(reason);
                });
            }
            static resolve(value) {
                return new this(function (resolve) {
                    resolve(value);
                });
            }
            catch(onRejected) {
                return this.then(undefined, onRejected);
            }
        },
        _a[Symbol.species] = ShimPromise,
        _a);
}
/* harmony default export */ __webpack_exports__["a"] = (ShimPromise);
var _a;
//# sourceMappingURL=Promise.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Set.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Set */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");




let Set = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Set;
if (false) {
    Set = (_a = class Set {
            constructor(iterable) {
                this._setData = [];
                this[Symbol.toStringTag] = 'Set';
                if (iterable) {
                    if (isArrayLike(iterable)) {
                        for (let i = 0; i < iterable.length; i++) {
                            this.add(iterable[i]);
                        }
                    }
                    else {
                        for (const value of iterable) {
                            this.add(value);
                        }
                    }
                }
            }
            add(value) {
                if (this.has(value)) {
                    return this;
                }
                this._setData.push(value);
                return this;
            }
            clear() {
                this._setData.length = 0;
            }
            delete(value) {
                const idx = this._setData.indexOf(value);
                if (idx === -1) {
                    return false;
                }
                this._setData.splice(idx, 1);
                return true;
            }
            entries() {
                return new ShimIterator(this._setData.map((value) => [value, value]));
            }
            forEach(callbackfn, thisArg) {
                const iterator = this.values();
                let result = iterator.next();
                while (!result.done) {
                    callbackfn.call(thisArg, result.value, result.value, this);
                    result = iterator.next();
                }
            }
            has(value) {
                return this._setData.indexOf(value) > -1;
            }
            keys() {
                return new ShimIterator(this._setData);
            }
            get size() {
                return this._setData.length;
            }
            values() {
                return new ShimIterator(this._setData);
            }
            [Symbol.iterator]() {
                return new ShimIterator(this._setData);
            }
        },
        _a[Symbol.species] = _a,
        _a);
}
/* harmony default export */ __webpack_exports__["a"] = (Set);
var _a;
//# sourceMappingURL=Set.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/Symbol.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Symbol */
/* unused harmony export isSymbol */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");



let Symbol = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Symbol;
if (false) {
    /**
     * Throws if the value is not a symbol, used internally within the Shim
     * @param  {any}    value The value to check
     * @return {symbol}       Returns the symbol or throws
     */
    const validateSymbol = function validateSymbol(value) {
        if (!isSymbol(value)) {
            throw new TypeError(value + ' is not a symbol');
        }
        return value;
    };
    const defineProperties = Object.defineProperties;
    const defineProperty = Object.defineProperty;
    const create = Object.create;
    const objPrototype = Object.prototype;
    const globalSymbols = {};
    const getSymbolName = (function () {
        const created = create(null);
        return function (desc) {
            let postfix = 0;
            let name;
            while (created[String(desc) + (postfix || '')]) {
                ++postfix;
            }
            desc += String(postfix || '');
            created[desc] = true;
            name = '@@' + desc;
            // FIXME: Temporary guard until the duplicate execution when testing can be
            // pinned down.
            if (!Object.getOwnPropertyDescriptor(objPrototype, name)) {
                defineProperty(objPrototype, name, {
                    set: function (value) {
                        defineProperty(this, name, getValueDescriptor(value));
                    }
                });
            }
            return name;
        };
    })();
    const InternalSymbol = function Symbol(description) {
        if (this instanceof InternalSymbol) {
            throw new TypeError('TypeError: Symbol is not a constructor');
        }
        return Symbol(description);
    };
    Symbol = global.Symbol = function Symbol(description) {
        if (this instanceof Symbol) {
            throw new TypeError('TypeError: Symbol is not a constructor');
        }
        const sym = Object.create(InternalSymbol.prototype);
        description = description === undefined ? '' : String(description);
        return defineProperties(sym, {
            __description__: getValueDescriptor(description),
            __name__: getValueDescriptor(getSymbolName(description))
        });
    };
    /* Decorate the Symbol function with the appropriate properties */
    defineProperty(Symbol, 'for', getValueDescriptor(function (key) {
        if (globalSymbols[key]) {
            return globalSymbols[key];
        }
        return (globalSymbols[key] = Symbol(String(key)));
    }));
    defineProperties(Symbol, {
        keyFor: getValueDescriptor(function (sym) {
            let key;
            validateSymbol(sym);
            for (key in globalSymbols) {
                if (globalSymbols[key] === sym) {
                    return key;
                }
            }
        }),
        hasInstance: getValueDescriptor(Symbol.for('hasInstance'), false, false),
        isConcatSpreadable: getValueDescriptor(Symbol.for('isConcatSpreadable'), false, false),
        iterator: getValueDescriptor(Symbol.for('iterator'), false, false),
        match: getValueDescriptor(Symbol.for('match'), false, false),
        observable: getValueDescriptor(Symbol.for('observable'), false, false),
        replace: getValueDescriptor(Symbol.for('replace'), false, false),
        search: getValueDescriptor(Symbol.for('search'), false, false),
        species: getValueDescriptor(Symbol.for('species'), false, false),
        split: getValueDescriptor(Symbol.for('split'), false, false),
        toPrimitive: getValueDescriptor(Symbol.for('toPrimitive'), false, false),
        toStringTag: getValueDescriptor(Symbol.for('toStringTag'), false, false),
        unscopables: getValueDescriptor(Symbol.for('unscopables'), false, false)
    });
    /* Decorate the InternalSymbol object */
    defineProperties(InternalSymbol.prototype, {
        constructor: getValueDescriptor(Symbol),
        toString: getValueDescriptor(function () {
            return this.__name__;
        }, false, false)
    });
    /* Decorate the Symbol.prototype */
    defineProperties(Symbol.prototype, {
        toString: getValueDescriptor(function () {
            return 'Symbol (' + validateSymbol(this).__description__ + ')';
        }),
        valueOf: getValueDescriptor(function () {
            return validateSymbol(this);
        })
    });
    defineProperty(Symbol.prototype, Symbol.toPrimitive, getValueDescriptor(function () {
        return validateSymbol(this);
    }));
    defineProperty(Symbol.prototype, Symbol.toStringTag, getValueDescriptor('Symbol', false, false, true));
    defineProperty(InternalSymbol.prototype, Symbol.toPrimitive, getValueDescriptor(Symbol.prototype[Symbol.toPrimitive], false, false, true));
    defineProperty(InternalSymbol.prototype, Symbol.toStringTag, getValueDescriptor(Symbol.prototype[Symbol.toStringTag], false, false, true));
}
/**
 * A custom guard function that determines if an object is a symbol or not
 * @param  {any}       value The value to check to see if it is a symbol or not
 * @return {is symbol}       Returns true if a symbol or not (and narrows the type guard)
 */
function isSymbol(value) {
    return (value && (typeof value === 'symbol' || value['@@toStringTag'] === 'Symbol')) || false;
}
/**
 * Fill any missing well known symbols if the native Symbol is missing them
 */
[
    'hasInstance',
    'isConcatSpreadable',
    'iterator',
    'species',
    'replace',
    'search',
    'split',
    'match',
    'toPrimitive',
    'toStringTag',
    'unscopables',
    'observable'
].forEach((wellKnown) => {
    if (!Symbol[wellKnown]) {
        Object.defineProperty(Symbol, wellKnown, Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["a" /* getValueDescriptor */])(Symbol.for(wellKnown), false, false));
    }
});
/* unused harmony default export */ var _unused_webpack_default_export = (Symbol);
//# sourceMappingURL=Symbol.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/WeakMap.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WeakMap; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__iterator__ = __webpack_require__("./node_modules/@dojo/framework/shim/iterator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");




let WeakMap = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].WeakMap;
if (false) {
    const DELETED = {};
    const getUID = function getUID() {
        return Math.floor(Math.random() * 100000000);
    };
    const generateName = (function () {
        let startId = Math.floor(Date.now() % 100000000);
        return function generateName() {
            return '__wm' + getUID() + (startId++ + '__');
        };
    })();
    WeakMap = class WeakMap {
        constructor(iterable) {
            this[Symbol.toStringTag] = 'WeakMap';
            this._name = generateName();
            this._frozenEntries = [];
            if (iterable) {
                if (isArrayLike(iterable)) {
                    for (let i = 0; i < iterable.length; i++) {
                        const item = iterable[i];
                        this.set(item[0], item[1]);
                    }
                }
                else {
                    for (const [key, value] of iterable) {
                        this.set(key, value);
                    }
                }
            }
        }
        _getFrozenEntryIndex(key) {
            for (let i = 0; i < this._frozenEntries.length; i++) {
                if (this._frozenEntries[i].key === key) {
                    return i;
                }
            }
            return -1;
        }
        delete(key) {
            if (key === undefined || key === null) {
                return false;
            }
            const entry = key[this._name];
            if (entry && entry.key === key && entry.value !== DELETED) {
                entry.value = DELETED;
                return true;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                this._frozenEntries.splice(frozenIndex, 1);
                return true;
            }
            return false;
        }
        get(key) {
            if (key === undefined || key === null) {
                return undefined;
            }
            const entry = key[this._name];
            if (entry && entry.key === key && entry.value !== DELETED) {
                return entry.value;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                return this._frozenEntries[frozenIndex].value;
            }
        }
        has(key) {
            if (key === undefined || key === null) {
                return false;
            }
            const entry = key[this._name];
            if (Boolean(entry && entry.key === key && entry.value !== DELETED)) {
                return true;
            }
            const frozenIndex = this._getFrozenEntryIndex(key);
            if (frozenIndex >= 0) {
                return true;
            }
            return false;
        }
        set(key, value) {
            if (!key || (typeof key !== 'object' && typeof key !== 'function')) {
                throw new TypeError('Invalid value used as weak map key');
            }
            let entry = key[this._name];
            if (!entry || entry.key !== key) {
                entry = Object.create(null, {
                    key: { value: key }
                });
                if (Object.isFrozen(key)) {
                    this._frozenEntries.push(entry);
                }
                else {
                    Object.defineProperty(key, this._name, {
                        value: entry
                    });
                }
            }
            entry.value = value;
            return this;
        }
    };
}
/* harmony default export */ __webpack_exports__["b"] = (WeakMap);
//# sourceMappingURL=WeakMap.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/global.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {const globalObject = (function () {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
})();
/* harmony default export */ __webpack_exports__["a"] = (globalObject);
//# sourceMappingURL=global.mjs.map
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/iterator.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isIterable */
/* unused harmony export isArrayLike */
/* unused harmony export get */
/* unused harmony export forOf */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__string__ = __webpack_require__("./node_modules/@dojo/framework/shim/string.mjs");


const staticDone = { done: true, value: undefined };
/**
 * A class that _shims_ an iterator interface on array like objects.
 */
class ShimIterator {
    constructor(list) {
        this._nextIndex = -1;
        if (isIterable(list)) {
            this._nativeIterator = list[Symbol.iterator]();
        }
        else {
            this._list = list;
        }
    }
    /**
     * Return the next iteration result for the Iterator
     */
    next() {
        if (this._nativeIterator) {
            return this._nativeIterator.next();
        }
        if (!this._list) {
            return staticDone;
        }
        if (++this._nextIndex < this._list.length) {
            return {
                done: false,
                value: this._list[this._nextIndex]
            };
        }
        return staticDone;
    }
    [Symbol.iterator]() {
        return this;
    }
}
/* unused harmony export ShimIterator */

/**
 * A type guard for checking if something has an Iterable interface
 *
 * @param value The value to type guard against
 */
function isIterable(value) {
    return value && typeof value[Symbol.iterator] === 'function';
}
/**
 * A type guard for checking if something is ArrayLike
 *
 * @param value The value to type guard against
 */
function isArrayLike(value) {
    return value && typeof value.length === 'number';
}
/**
 * Returns the iterator for an object
 *
 * @param iterable The iterable object to return the iterator for
 */
function get(iterable) {
    if (isIterable(iterable)) {
        return iterable[Symbol.iterator]();
    }
    else if (isArrayLike(iterable)) {
        return new ShimIterator(iterable);
    }
}
/**
 * Shims the functionality of `for ... of` blocks
 *
 * @param iterable The object the provides an interator interface
 * @param callback The callback which will be called for each item of the iterable
 * @param thisArg Optional scope to pass the callback
 */
function forOf(iterable, callback, thisArg) {
    let broken = false;
    function doBreak() {
        broken = true;
    }
    /* We need to handle iteration of double byte strings properly */
    if (isArrayLike(iterable) && typeof iterable === 'string') {
        const l = iterable.length;
        for (let i = 0; i < l; ++i) {
            let char = iterable[i];
            if (i + 1 < l) {
                const code = char.charCodeAt(0);
                if (code >= __WEBPACK_IMPORTED_MODULE_1__string__["b" /* HIGH_SURROGATE_MIN */] && code <= __WEBPACK_IMPORTED_MODULE_1__string__["a" /* HIGH_SURROGATE_MAX */]) {
                    char += iterable[++i];
                }
            }
            callback.call(thisArg, char, iterable, doBreak);
            if (broken) {
                return;
            }
        }
    }
    else {
        const iterator = get(iterable);
        if (iterator) {
            let result = iterator.next();
            while (!result.done) {
                callback.call(thisArg, result.value, iterable, doBreak);
                if (broken) {
                    return;
                }
                result = iterator.next();
            }
        }
    }
}
//# sourceMappingURL=iterator.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/object.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export assign */
/* unused harmony export getOwnPropertyDescriptor */
/* unused harmony export getOwnPropertyNames */
/* unused harmony export getOwnPropertySymbols */
/* unused harmony export is */
/* unused harmony export keys */
/* unused harmony export getOwnPropertyDescriptors */
/* unused harmony export entries */
/* unused harmony export values */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Symbol__ = __webpack_require__("./node_modules/@dojo/framework/shim/Symbol.mjs");



let assign;
/**
 * Gets the own property descriptor of the specified object.
 * An own property descriptor is one that is defined directly on the object and is not
 * inherited from the object's prototype.
 * @param o Object that contains the property.
 * @param p Name of the property.
 */
let getOwnPropertyDescriptor;
/**
 * Returns the names of the own properties of an object. The own properties of an object are those that are defined directly
 * on that object, and are not inherited from the object's prototype. The properties of an object include both fields (objects) and functions.
 * @param o Object that contains the own properties.
 */
let getOwnPropertyNames;
/**
 * Returns an array of all symbol properties found directly on object o.
 * @param o Object to retrieve the symbols from.
 */
let getOwnPropertySymbols;
/**
 * Returns true if the values are the same value, false otherwise.
 * @param value1 The first value.
 * @param value2 The second value.
 */
let is;
/**
 * Returns the names of the enumerable properties and methods of an object.
 * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
 */
let keys;
/* ES7 Object static methods */
let getOwnPropertyDescriptors;
let entries;
let values;
if (true) {
    const globalObject = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Object;
    assign = globalObject.assign;
    getOwnPropertyDescriptor = globalObject.getOwnPropertyDescriptor;
    getOwnPropertyNames = globalObject.getOwnPropertyNames;
    getOwnPropertySymbols = globalObject.getOwnPropertySymbols;
    is = globalObject.is;
    keys = globalObject.keys;
}
else {
    keys = function symbolAwareKeys(o) {
        return Object.keys(o).filter((key) => !Boolean(key.match(/^@@.+/)));
    };
    assign = function assign(target, ...sources) {
        if (target == null) {
            // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        sources.forEach((nextSource) => {
            if (nextSource) {
                // Skip over if undefined or null
                keys(nextSource).forEach((nextKey) => {
                    to[nextKey] = nextSource[nextKey];
                });
            }
        });
        return to;
    };
    getOwnPropertyDescriptor = function (o, prop) {
        if (isSymbol(prop)) {
            return Object.getOwnPropertyDescriptor(o, prop);
        }
        else {
            return Object.getOwnPropertyDescriptor(o, prop);
        }
    };
    getOwnPropertyNames = function getOwnPropertyNames(o) {
        return Object.getOwnPropertyNames(o).filter((key) => !Boolean(key.match(/^@@.+/)));
    };
    getOwnPropertySymbols = function getOwnPropertySymbols(o) {
        return Object.getOwnPropertyNames(o)
            .filter((key) => Boolean(key.match(/^@@.+/)))
            .map((key) => Symbol.for(key.substring(2)));
    };
    is = function is(value1, value2) {
        if (value1 === value2) {
            return value1 !== 0 || 1 / value1 === 1 / value2; // -0
        }
        return value1 !== value1 && value2 !== value2; // NaN
    };
}
if (true) {
    const globalObject = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Object;
    getOwnPropertyDescriptors = globalObject.getOwnPropertyDescriptors;
    entries = globalObject.entries;
    values = globalObject.values;
}
else {
    getOwnPropertyDescriptors = function getOwnPropertyDescriptors(o) {
        return getOwnPropertyNames(o).reduce((previous, key) => {
            previous[key] = getOwnPropertyDescriptor(o, key);
            return previous;
        }, {});
    };
    entries = function entries(o) {
        return keys(o).map((key) => [key, o[key]]);
    };
    values = function values(o) {
        return keys(o).map((key) => o[key]);
    };
}
//# sourceMappingURL=object.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/string.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export fromCodePoint */
/* unused harmony export raw */
/* unused harmony export codePointAt */
/* unused harmony export endsWith */
/* unused harmony export includes */
/* unused harmony export normalize */
/* unused harmony export repeat */
/* unused harmony export startsWith */
/* unused harmony export padEnd */
/* unused harmony export padStart */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__support_has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__support_util__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/util.mjs");



/**
 * The minimum location of high surrogates
 */
const HIGH_SURROGATE_MIN = 0xd800;
/* harmony export (immutable) */ __webpack_exports__["b"] = HIGH_SURROGATE_MIN;

/**
 * The maximum location of high surrogates
 */
const HIGH_SURROGATE_MAX = 0xdbff;
/* harmony export (immutable) */ __webpack_exports__["a"] = HIGH_SURROGATE_MAX;

/**
 * The minimum location of low surrogates
 */
const LOW_SURROGATE_MIN = 0xdc00;
/* unused harmony export LOW_SURROGATE_MIN */

/**
 * The maximum location of low surrogates
 */
const LOW_SURROGATE_MAX = 0xdfff;
/* unused harmony export LOW_SURROGATE_MAX */

/* ES6 static methods */
/**
 * Return the String value whose elements are, in order, the elements in the List elements.
 * If length is 0, the empty string is returned.
 * @param codePoints The code points to generate the string
 */
let fromCodePoint;
/**
 * `raw` is intended for use as a tag function of a Tagged Template String. When called
 * as such the first argument will be a well formed template call site object and the rest
 * parameter will contain the substitution values.
 * @param template A well-formed template string call site representation.
 * @param substitutions A set of substitution values.
 */
let raw;
/* ES6 instance methods */
/**
 * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
 * value of the UTF-16 encoded code point starting at the string element at position pos in
 * the String resulting from converting this object to a String.
 * If there is no element at that position, the result is undefined.
 * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
 */
let codePointAt;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * endPosition – length(this). Otherwise returns false.
 */
let endsWith;
/**
 * Returns true if searchString appears as a substring of the result of converting this
 * object to a String, at one or more positions that are
 * greater than or equal to position; otherwise, returns false.
 * @param target The target string
 * @param searchString search string
 * @param position If position is undefined, 0 is assumed, so as to search all of the String.
 */
let includes;
/**
 * Returns the String value result of normalizing the string into the normalization form
 * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
 * @param target The target string
 * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
 * is "NFC"
 */
let normalize;
/**
 * Returns a String value that is made from count copies appended together. If count is 0,
 * T is the empty String is returned.
 * @param count number of copies to append
 */
let repeat;
/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * position. Otherwise returns false.
 */
let startsWith;
/* ES7 instance methods */
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the end (right) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padEnd;
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the start (left) of the current string.
 *
 * @param target The target string
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
let padStart;
if (true) {
    fromCodePoint = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.fromCodePoint;
    raw = __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.raw;
    codePointAt = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.codePointAt);
    endsWith = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.endsWith);
    includes = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.includes);
    normalize = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.normalize);
    repeat = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.repeat);
    startsWith = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.startsWith);
}
else {
    /**
     * Validates that text is defined, and normalizes position (based on the given default if the input is NaN).
     * Used by startsWith, includes, and endsWith.
     *
     * @return Normalized position.
     */
    const normalizeSubstringArgs = function (name, text, search, position, isEnd = false) {
        if (text == null) {
            throw new TypeError('string.' + name + ' requires a valid string to search against.');
        }
        const length = text.length;
        position = position !== position ? (isEnd ? length : 0) : position;
        return [text, String(search), Math.min(Math.max(position, 0), length)];
    };
    fromCodePoint = function fromCodePoint(...codePoints) {
        // Adapted from https://github.com/mathiasbynens/String.fromCodePoint
        const length = arguments.length;
        if (!length) {
            return '';
        }
        const fromCharCode = String.fromCharCode;
        const MAX_SIZE = 0x4000;
        let codeUnits = [];
        let index = -1;
        let result = '';
        while (++index < length) {
            let codePoint = Number(arguments[index]);
            // Code points must be finite integers within the valid range
            let isValid = isFinite(codePoint) && Math.floor(codePoint) === codePoint && codePoint >= 0 && codePoint <= 0x10ffff;
            if (!isValid) {
                throw RangeError('string.fromCodePoint: Invalid code point ' + codePoint);
            }
            if (codePoint <= 0xffff) {
                // BMP code point
                codeUnits.push(codePoint);
            }
            else {
                // Astral code point; split in surrogate halves
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                codePoint -= 0x10000;
                let highSurrogate = (codePoint >> 10) + HIGH_SURROGATE_MIN;
                let lowSurrogate = (codePoint % 0x400) + LOW_SURROGATE_MIN;
                codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += fromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result;
    };
    raw = function raw(callSite, ...substitutions) {
        let rawStrings = callSite.raw;
        let result = '';
        let numSubstitutions = substitutions.length;
        if (callSite == null || callSite.raw == null) {
            throw new TypeError('string.raw requires a valid callSite object with a raw value');
        }
        for (let i = 0, length = rawStrings.length; i < length; i++) {
            result += rawStrings[i] + (i < numSubstitutions && i < length - 1 ? substitutions[i] : '');
        }
        return result;
    };
    codePointAt = function codePointAt(text, position = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.codePointAt
        if (text == null) {
            throw new TypeError('string.codePointAt requries a valid string.');
        }
        const length = text.length;
        if (position !== position) {
            position = 0;
        }
        if (position < 0 || position >= length) {
            return undefined;
        }
        // Get the first code unit
        const first = text.charCodeAt(position);
        if (first >= HIGH_SURROGATE_MIN && first <= HIGH_SURROGATE_MAX && length > position + 1) {
            // Start of a surrogate pair (high surrogate and there is a next code unit); check for low surrogate
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            const second = text.charCodeAt(position + 1);
            if (second >= LOW_SURROGATE_MIN && second <= LOW_SURROGATE_MAX) {
                return (first - HIGH_SURROGATE_MIN) * 0x400 + second - LOW_SURROGATE_MIN + 0x10000;
            }
        }
        return first;
    };
    endsWith = function endsWith(text, search, endPosition) {
        if (search === '') {
            return true;
        }
        if (typeof endPosition === 'undefined') {
            endPosition = text.length;
        }
        else if (endPosition === null || isNaN(endPosition)) {
            return false;
        }
        [text, search, endPosition] = normalizeSubstringArgs('endsWith', text, search, endPosition, true);
        const start = endPosition - search.length;
        if (start < 0) {
            return false;
        }
        return text.slice(start, endPosition) === search;
    };
    includes = function includes(text, search, position = 0) {
        [text, search, position] = normalizeSubstringArgs('includes', text, search, position);
        return text.indexOf(search, position) !== -1;
    };
    repeat = function repeat(text, count = 0) {
        // Adapted from https://github.com/mathiasbynens/String.prototype.repeat
        if (text == null) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (count !== count) {
            count = 0;
        }
        if (count < 0 || count === Infinity) {
            throw new RangeError('string.repeat requires a non-negative finite count.');
        }
        let result = '';
        while (count) {
            if (count % 2) {
                result += text;
            }
            if (count > 1) {
                text += text;
            }
            count >>= 1;
        }
        return result;
    };
    startsWith = function startsWith(text, search, position = 0) {
        search = String(search);
        [text, search, position] = normalizeSubstringArgs('startsWith', text, search, position);
        const end = position + search.length;
        if (end > text.length) {
            return false;
        }
        return text.slice(position, end) === search;
    };
}
if (true) {
    padEnd = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.padEnd);
    padStart = Object(__WEBPACK_IMPORTED_MODULE_2__support_util__["b" /* wrapNative */])(__WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].String.prototype.padStart);
}
else {
    padEnd = function padEnd(text, maxLength, fillString = ' ') {
        if (text === null || text === undefined) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (maxLength === Infinity) {
            throw new RangeError('string.padEnd requires a non-negative finite count.');
        }
        if (maxLength === null || maxLength === undefined || maxLength < 0) {
            maxLength = 0;
        }
        let strText = String(text);
        const padding = maxLength - strText.length;
        if (padding > 0) {
            strText +=
                repeat(fillString, Math.floor(padding / fillString.length)) +
                    fillString.slice(0, padding % fillString.length);
        }
        return strText;
    };
    padStart = function padStart(text, maxLength, fillString = ' ') {
        if (text === null || text === undefined) {
            throw new TypeError('string.repeat requires a valid string.');
        }
        if (maxLength === Infinity) {
            throw new RangeError('string.padStart requires a non-negative finite count.');
        }
        if (maxLength === null || maxLength === undefined || maxLength < 0) {
            maxLength = 0;
        }
        let strText = String(text);
        const padding = maxLength - strText.length;
        if (padding > 0) {
            strText =
                repeat(fillString, Math.floor(padding / fillString.length)) +
                    fillString.slice(0, padding % fillString.length) +
                    strText;
        }
        return strText;
    };
}
//# sourceMappingURL=string.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/has.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__has_has__ = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* unused harmony reexport namespace */


/* unused harmony default export */ var _unused_webpack_default_export = (__WEBPACK_IMPORTED_MODULE_0__has_has__["default"]);

/* ECMAScript 6 and 7 Features */
/* Array */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-array', () => {
    return (['from', 'of'].every((key) => key in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array) &&
        ['findIndex', 'find', 'copyWithin'].every((key) => key in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype));
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-array-fill', () => {
    if ('fill' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype) {
        /* Some versions of Safari do not properly implement this */
        return [1].fill(9, Number.POSITIVE_INFINITY)[0] === 1;
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es7-array', () => 'includes' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Array.prototype, true);
/* Map */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-map', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map === 'function') {
        /*
    IE11 and older versions of Safari are missing critical ES6 Map functionality
    We wrap this in a try/catch because sometimes the Map constructor exists, but does not
    take arguments (iOS 8.4)
     */
        try {
            const map = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Map([[0, 1]]);
            return map.has(0) &&
                typeof map.keys === 'function' &&
                true &&
                typeof map.values === 'function' &&
                typeof map.entries === 'function';
        }
        catch (e) {
            /* istanbul ignore next: not testing on iOS at the moment */
            return false;
        }
    }
    return false;
}, true);
/* Math */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-math', () => {
    return [
        'clz32',
        'sign',
        'log10',
        'log2',
        'log1p',
        'expm1',
        'cosh',
        'sinh',
        'tanh',
        'acosh',
        'asinh',
        'atanh',
        'trunc',
        'fround',
        'cbrt',
        'hypot'
    ].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Math[name] === 'function');
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-math-imul', () => {
    if ('imul' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Math) {
        /* Some versions of Safari on ios do not properly implement this */
        return Math.imul(0xffffffff, 5) === -5;
    }
    return false;
}, true);
/* Object */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-object', () => {
    return true &&
        ['assign', 'is', 'getOwnPropertySymbols', 'setPrototypeOf'].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Object[name] === 'function');
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es2017-object', () => {
    return ['values', 'entries', 'getOwnPropertyDescriptors'].every((name) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Object[name] === 'function');
}, true);
/* Observable */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es-observable', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Observable !== 'undefined', true);
/* Promise */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-promise', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Promise !== 'undefined' && true, true);
/* Set */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-set', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Set === 'function') {
        /* IE11 and older versions of Safari are missing critical ES6 Set functionality */
        const set = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Set([1]);
        return set.has(1) && 'keys' in set && typeof set.keys === 'function' && true;
    }
    return false;
}, true);
/* String */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-string', () => {
    return ([
        /* static methods */
        'fromCodePoint'
    ].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String[key] === 'function') &&
        [
            /* instance methods */
            'codePointAt',
            'normalize',
            'repeat',
            'startsWith',
            'endsWith',
            'includes'
        ].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.prototype[key] === 'function'));
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-string-raw', () => {
    function getCallSite(callSite, ...substitutions) {
        const result = [...callSite];
        result.raw = callSite.raw;
        return result;
    }
    if ('raw' in __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String) {
        let b = 1;
        let callSite = getCallSite `a\n${b}`;
        callSite.raw = ['a\\n'];
        const supportsTrunc = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.raw(callSite, 42) === 'a\\n';
        return supportsTrunc;
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es2017-string', () => {
    return ['padStart', 'padEnd'].every((key) => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].String.prototype[key] === 'function');
}, true);
/* Symbol */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-symbol', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Symbol !== 'undefined' && typeof Symbol() === 'symbol', true);
/* WeakMap */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('es6-weakmap', () => {
    if (typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WeakMap !== 'undefined') {
        /* IE11 and older versions of Safari are missing critical ES6 Map functionality */
        const key1 = {};
        const key2 = {};
        const map = new __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WeakMap([[key1, 1]]);
        Object.freeze(key1);
        return map.get(key1) === 1 && map.set(key2, 2) === map && true;
    }
    return false;
}, true);
/* Miscellaneous features */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('microtasks', () => true || false || true, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('postmessage', () => {
    // If window is undefined, and we have postMessage, it probably means we're in a web worker. Web workers have
    // post message but it doesn't work how we expect it to, so it's best just to pretend it doesn't exist.
    return typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].window !== 'undefined' && typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].postMessage === 'function';
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('raf', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].requestAnimationFrame === 'function', true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('setimmediate', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].setImmediate !== 'undefined', true);
/* DOM Features */
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('dom-mutationobserver', () => {
    if (true && Boolean(__WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].MutationObserver || __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WebKitMutationObserver)) {
        // IE11 has an unreliable MutationObserver implementation where setProperty() does not
        // generate a mutation event, observers can crash, and the queue does not drain
        // reliably. The following feature test was adapted from
        // https://gist.github.com/t10ko/4aceb8c71681fdb275e33efe5e576b14
        const example = document.createElement('div');
        /* tslint:disable-next-line:variable-name */
        const HostMutationObserver = __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].MutationObserver || __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].WebKitMutationObserver;
        const observer = new HostMutationObserver(function () { });
        observer.observe(example, { attributes: true });
        example.style.setProperty('display', 'block');
        return Boolean(observer.takeRecords().length);
    }
    return false;
}, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('dom-webanimation', () => true && __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].Animation !== undefined && __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].KeyframeEffect !== undefined, true);
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('abort-controller', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].AbortController !== 'undefined');
Object(__WEBPACK_IMPORTED_MODULE_0__has_has__["add"])('abort-signal', () => typeof __WEBPACK_IMPORTED_MODULE_1__global__["a" /* default */].AbortSignal !== 'undefined');
//# sourceMappingURL=has.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/queue.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export queueMicroTask */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__has__ = __webpack_require__("./node_modules/@dojo/framework/shim/support/has.mjs");


function executeTask(item) {
    if (item && item.isActive && item.callback) {
        item.callback();
    }
}
function getQueueHandle(item, destructor) {
    return {
        destroy: function () {
            this.destroy = function () { };
            item.isActive = false;
            item.callback = null;
            if (destructor) {
                destructor();
            }
        }
    };
}
let checkMicroTaskQueue;
let microTasks;
/**
 * Schedules a callback to the macrotask queue.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
const queueTask = (function () {
    let destructor;
    let enqueue;
    // Since the IE implementation of `setImmediate` is not flawless, we will test for `postMessage` first.
    if (true) {
        const queue = [];
        __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].addEventListener('message', function (event) {
            // Confirm that the event was triggered by the current window and by this particular implementation.
            if (event.source === __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */] && event.data === 'dojo-queue-message') {
                event.stopPropagation();
                if (queue.length) {
                    executeTask(queue.shift());
                }
            }
        });
        enqueue = function (item) {
            queue.push(item);
            __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].postMessage('dojo-queue-message', '*');
        };
    }
    else if (false) {
        destructor = global.clearImmediate;
        enqueue = function (item) {
            return setImmediate(executeTask.bind(null, item));
        };
    }
    else {
        destructor = global.clearTimeout;
        enqueue = function (item) {
            return setTimeout(executeTask.bind(null, item), 0);
        };
    }
    function queueTask(callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        const id = enqueue(item);
        return getQueueHandle(item, destructor &&
            function () {
                destructor(id);
            });
    }
    // TODO: Use aspect.before when it is available.
    return true
        ? queueTask
        : function (callback) {
            checkMicroTaskQueue();
            return queueTask(callback);
        };
})();
/* unused harmony export queueTask */

// When no mechanism for registering microtasks is exposed by the environment, microtasks will
// be queued and then executed in a single macrotask before the other macrotasks are executed.
if (false) {
    let isMicroTaskQueued = false;
    microTasks = [];
    checkMicroTaskQueue = function () {
        if (!isMicroTaskQueued) {
            isMicroTaskQueued = true;
            queueTask(function () {
                isMicroTaskQueued = false;
                if (microTasks.length) {
                    let item;
                    while ((item = microTasks.shift())) {
                        executeTask(item);
                    }
                }
            });
        }
    };
}
/**
 * Schedules an animation task with `window.requestAnimationFrame` if it exists, or with `queueTask` otherwise.
 *
 * Since requestAnimationFrame's behavior does not match that expected from `queueTask`, it is not used there.
 * However, at times it makes more sense to delegate to requestAnimationFrame; hence the following method.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
const queueAnimationTask = (function () {
    if (false) {
        return queueTask;
    }
    function queueAnimationTask(callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        const rafId = requestAnimationFrame(executeTask.bind(null, item));
        return getQueueHandle(item, function () {
            cancelAnimationFrame(rafId);
        });
    }
    // TODO: Use aspect.before when it is available.
    return true
        ? queueAnimationTask
        : function (callback) {
            checkMicroTaskQueue();
            return queueAnimationTask(callback);
        };
})();
/* unused harmony export queueAnimationTask */

/**
 * Schedules a callback to the microtask queue.
 *
 * Any callbacks registered with `queueMicroTask` will be executed before the next macrotask. If no native
 * mechanism for scheduling macrotasks is exposed, then any callbacks will be fired before any macrotask
 * registered with `queueTask` or `queueAnimationTask`.
 *
 * @param callback the function to be queued and later executed.
 * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
 */
let queueMicroTask = (function () {
    let enqueue;
    if (false) {
        enqueue = function (item) {
            global.process.nextTick(executeTask.bind(null, item));
        };
    }
    else if (true) {
        enqueue = function (item) {
            __WEBPACK_IMPORTED_MODULE_0__global__["a" /* default */].Promise.resolve(item).then(executeTask);
        };
    }
    else if (true) {
        /* tslint:disable-next-line:variable-name */
        const HostMutationObserver = global.MutationObserver || global.WebKitMutationObserver;
        const node = document.createElement('div');
        const queue = [];
        const observer = new HostMutationObserver(function () {
            while (queue.length > 0) {
                const item = queue.shift();
                if (item && item.isActive && item.callback) {
                    item.callback();
                }
            }
        });
        observer.observe(node, { attributes: true });
        enqueue = function (item) {
            queue.push(item);
            node.setAttribute('queueStatus', '1');
        };
    }
    else {
        enqueue = function (item) {
            checkMicroTaskQueue();
            microTasks.push(item);
        };
    }
    return function (callback) {
        const item = {
            isActive: true,
            callback: callback
        };
        enqueue(item);
        return getQueueHandle(item);
    };
})();
//# sourceMappingURL=queue.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/shim/support/util.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getValueDescriptor;
/* harmony export (immutable) */ __webpack_exports__["b"] = wrapNative;
/**
 * Helper function to generate a value property descriptor
 *
 * @param value        The value the property descriptor should be set to
 * @param enumerable   If the property should be enumberable, defaults to false
 * @param writable     If the property should be writable, defaults to true
 * @param configurable If the property should be configurable, defaults to true
 * @return             The property descriptor object
 */
function getValueDescriptor(value, enumerable = false, writable = true, configurable = true) {
    return {
        value: value,
        enumerable: enumerable,
        writable: writable,
        configurable: configurable
    };
}
function wrapNative(nativeFunction) {
    return function (target, ...args) {
        return nativeFunction.apply(target, args);
    };
}
//# sourceMappingURL=util.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Injector.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");

class Injector extends __WEBPACK_IMPORTED_MODULE_0__core_Evented__["a" /* Evented */] {
    constructor(payload) {
        super();
        this._payload = payload;
    }
    setInvalidator(invalidator) {
        this._invalidator = invalidator;
    }
    get() {
        return this._payload;
    }
    set(payload) {
        this._payload = payload;
        if (this._invalidator) {
            this._invalidator();
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Injector;

/* unused harmony default export */ var _unused_webpack_default_export = (Injector);
//# sourceMappingURL=Injector.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/NodeHandler.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export NodeEventType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");


/**
 * Enum to identify the type of event.
 * Listening to 'Projector' will notify when projector is created or updated
 * Listening to 'Widget' will notify when widget root is created or updated
 */
var NodeEventType;
(function (NodeEventType) {
    NodeEventType["Projector"] = "Projector";
    NodeEventType["Widget"] = "Widget";
})(NodeEventType || (NodeEventType = {}));
class NodeHandler extends __WEBPACK_IMPORTED_MODULE_0__core_Evented__["a" /* Evented */] {
    constructor() {
        super(...arguments);
        this._nodeMap = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
    }
    get(key) {
        return this._nodeMap.get(key);
    }
    has(key) {
        return this._nodeMap.has(key);
    }
    add(element, key) {
        this._nodeMap.set(key, element);
        this.emit({ type: key });
    }
    addRoot() {
        this.emit({ type: NodeEventType.Widget });
    }
    addProjector() {
        this.emit({ type: NodeEventType.Projector });
    }
    clear() {
        this._nodeMap.clear();
    }
}
/* unused harmony export NodeHandler */

/* harmony default export */ __webpack_exports__["a"] = (NodeHandler);
//# sourceMappingURL=NodeHandler.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/Registry.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["d"] = isWidgetBaseConstructor;
/* unused harmony export isWidgetConstructorDefaultExport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Promise__ = __webpack_require__("./node_modules/@dojo/framework/shim/Promise.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");



/**
 * Widget base type
 */
const WIDGET_BASE_TYPE = '__widget_base_type';
/* harmony export (immutable) */ __webpack_exports__["b"] = WIDGET_BASE_TYPE;

/**
 * Checks is the item is a subclass of WidgetBase (or a WidgetBase)
 *
 * @param item the item to check
 * @returns true/false indicating if the item is a WidgetBaseConstructor
 */
function isWidgetBaseConstructor(item) {
    return Boolean(item && item._type === WIDGET_BASE_TYPE);
}
function isWidgetConstructorDefaultExport(item) {
    return Boolean(item &&
        item.hasOwnProperty('__esModule') &&
        item.hasOwnProperty('default') &&
        isWidgetBaseConstructor(item.default));
}
/**
 * The Registry implementation
 */
class Registry extends __WEBPACK_IMPORTED_MODULE_2__core_Evented__["a" /* Evented */] {
    /**
     * Emit loaded event for registry label
     */
    emitLoadedEvent(widgetLabel, item) {
        this.emit({
            type: widgetLabel,
            action: 'loaded',
            item
        });
    }
    define(label, item) {
        if (this._widgetRegistry === undefined) {
            this._widgetRegistry = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
        }
        if (this._widgetRegistry.has(label)) {
            throw new Error(`widget has already been registered for '${label.toString()}'`);
        }
        this._widgetRegistry.set(label, item);
        if (item instanceof __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]) {
            item.then((widgetCtor) => {
                this._widgetRegistry.set(label, widgetCtor);
                this.emitLoadedEvent(label, widgetCtor);
                return widgetCtor;
            }, (error) => {
                throw error;
            });
        }
        else if (isWidgetBaseConstructor(item)) {
            this.emitLoadedEvent(label, item);
        }
    }
    defineInjector(label, injectorFactory) {
        if (this._injectorRegistry === undefined) {
            this._injectorRegistry = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
        }
        if (this._injectorRegistry.has(label)) {
            throw new Error(`injector has already been registered for '${label.toString()}'`);
        }
        const invalidator = new __WEBPACK_IMPORTED_MODULE_2__core_Evented__["a" /* Evented */]();
        const injectorItem = {
            injector: injectorFactory(() => invalidator.emit({ type: 'invalidate' })),
            invalidator
        };
        this._injectorRegistry.set(label, injectorItem);
        this.emitLoadedEvent(label, injectorItem);
    }
    get(label) {
        if (!this._widgetRegistry || !this.has(label)) {
            return null;
        }
        const item = this._widgetRegistry.get(label);
        if (isWidgetBaseConstructor(item)) {
            return item;
        }
        if (item instanceof __WEBPACK_IMPORTED_MODULE_0__shim_Promise__["a" /* default */]) {
            return null;
        }
        const promise = item();
        this._widgetRegistry.set(label, promise);
        promise.then((widgetCtor) => {
            if (isWidgetConstructorDefaultExport(widgetCtor)) {
                widgetCtor = widgetCtor.default;
            }
            this._widgetRegistry.set(label, widgetCtor);
            this.emitLoadedEvent(label, widgetCtor);
            return widgetCtor;
        }, (error) => {
            throw error;
        });
        return null;
    }
    getInjector(label) {
        if (!this._injectorRegistry || !this.hasInjector(label)) {
            return null;
        }
        return this._injectorRegistry.get(label);
    }
    has(label) {
        return Boolean(this._widgetRegistry && this._widgetRegistry.has(label));
    }
    hasInjector(label) {
        return Boolean(this._injectorRegistry && this._injectorRegistry.has(label));
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Registry;

/* harmony default export */ __webpack_exports__["c"] = (Registry);
//# sourceMappingURL=Registry.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core_Evented__ = __webpack_require__("./node_modules/@dojo/framework/core/Evented.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");



class RegistryHandler extends __WEBPACK_IMPORTED_MODULE_1__core_Evented__["a" /* Evented */] {
    constructor() {
        super();
        this._registry = new __WEBPACK_IMPORTED_MODULE_2__Registry__["a" /* Registry */]();
        this._registryWidgetLabelMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["a" /* Map */]();
        this._registryInjectorLabelMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["a" /* Map */]();
        this.own(this._registry);
        const destroy = () => {
            if (this.baseRegistry) {
                this._registryWidgetLabelMap.delete(this.baseRegistry);
                this._registryInjectorLabelMap.delete(this.baseRegistry);
                this.baseRegistry = undefined;
            }
        };
        this.own({ destroy });
    }
    set base(baseRegistry) {
        if (this.baseRegistry) {
            this._registryWidgetLabelMap.delete(this.baseRegistry);
            this._registryInjectorLabelMap.delete(this.baseRegistry);
        }
        this.baseRegistry = baseRegistry;
    }
    define(label, widget) {
        this._registry.define(label, widget);
    }
    defineInjector(label, injector) {
        this._registry.defineInjector(label, injector);
    }
    has(label) {
        return this._registry.has(label) || Boolean(this.baseRegistry && this.baseRegistry.has(label));
    }
    hasInjector(label) {
        return this._registry.hasInjector(label) || Boolean(this.baseRegistry && this.baseRegistry.hasInjector(label));
    }
    get(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'get', this._registryWidgetLabelMap);
    }
    getInjector(label, globalPrecedence = false) {
        return this._get(label, globalPrecedence, 'getInjector', this._registryInjectorLabelMap);
    }
    _get(label, globalPrecedence, getFunctionName, labelMap) {
        const registries = globalPrecedence ? [this.baseRegistry, this._registry] : [this._registry, this.baseRegistry];
        for (let i = 0; i < registries.length; i++) {
            const registry = registries[i];
            if (!registry) {
                continue;
            }
            const item = registry[getFunctionName](label);
            const registeredLabels = labelMap.get(registry) || [];
            if (item) {
                return item;
            }
            else if (registeredLabels.indexOf(label) === -1) {
                const handle = registry.on(label, (event) => {
                    if (event.action === 'loaded' &&
                        this[getFunctionName](label, globalPrecedence) === event.item) {
                        this.emit({ type: 'invalidate' });
                    }
                });
                this.own(handle);
                labelMap.set(registry, [...registeredLabels, label]);
            }
        }
        return null;
    }
}
/* unused harmony export RegistryHandler */

/* harmony default export */ __webpack_exports__["a"] = (RegistryHandler);
//# sourceMappingURL=RegistryHandler.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/WidgetBase.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RegistryHandler__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/RegistryHandler.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__NodeHandler__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/NodeHandler.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");







let lazyWidgetId = 0;
const lazyWidgetIdMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
const decoratorMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
const widgetInstanceMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
/* harmony export (immutable) */ __webpack_exports__["c"] = widgetInstanceMap;

const boundAuto = __WEBPACK_IMPORTED_MODULE_3__diff__["a" /* auto */].bind(null);
const noBind = '__dojo_no_bind';
/* unused harmony export noBind */

function toTextVNode(data) {
    return {
        tag: '',
        properties: {},
        children: undefined,
        text: `${data}`,
        type: __WEBPACK_IMPORTED_MODULE_2__d__["a" /* VNODE */]
    };
}
function isLazyDefine(item) {
    return Boolean(item && item.label);
}
/**
 * Main widget base for all widgets to extend
 */
class WidgetBase {
    /**
     * @constructor
     */
    constructor() {
        /**
         * Indicates if it is the initial set properties cycle
         */
        this._initialProperties = true;
        /**
         * Array of property keys considered changed from the previous set properties
         */
        this._changedPropertyKeys = [];
        this._nodeHandler = new __WEBPACK_IMPORTED_MODULE_5__NodeHandler__["a" /* default */]();
        this._handles = [];
        this._children = [];
        this._decoratorCache = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
        this._properties = {};
        this._boundRenderFunc = this.render.bind(this);
        this._boundInvalidate = this.invalidate.bind(this);
        widgetInstanceMap.set(this, {
            dirty: true,
            onAttach: () => {
                this.onAttach();
            },
            onDetach: () => {
                this.onDetach();
                this.destroy();
            },
            nodeHandler: this._nodeHandler,
            rendering: false,
            inputProperties: {}
        });
        this.own({
            destroy: () => {
                widgetInstanceMap.delete(this);
                this._nodeHandler.clear();
                this._nodeHandler.destroy();
            }
        });
        this._runAfterConstructors();
    }
    meta(MetaType) {
        if (this._metaMap === undefined) {
            this._metaMap = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
        }
        let cached = this._metaMap.get(MetaType);
        if (!cached) {
            cached = new MetaType({
                invalidate: this._boundInvalidate,
                nodeHandler: this._nodeHandler,
                bind: this
            });
            this.own(cached);
            this._metaMap.set(MetaType, cached);
        }
        return cached;
    }
    onAttach() {
        // Do nothing by default.
    }
    onDetach() {
        // Do nothing by default.
    }
    get properties() {
        return this._properties;
    }
    get changedPropertyKeys() {
        return [...this._changedPropertyKeys];
    }
    __setProperties__(originalProperties, bind) {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.inputProperties = originalProperties;
        }
        const properties = this._runBeforeProperties(originalProperties);
        const registeredDiffPropertyNames = this.getDecorator('registeredDiffProperty');
        const changedPropertyKeys = [];
        const propertyNames = Object.keys(properties);
        if (this._initialProperties === false || registeredDiffPropertyNames.length !== 0) {
            const allProperties = [...propertyNames, ...Object.keys(this._properties)];
            const checkedProperties = [];
            const diffPropertyResults = {};
            let runReactions = false;
            for (let i = 0; i < allProperties.length; i++) {
                const propertyName = allProperties[i];
                if (checkedProperties.indexOf(propertyName) !== -1) {
                    continue;
                }
                checkedProperties.push(propertyName);
                const previousProperty = this._properties[propertyName];
                const newProperty = this._bindFunctionProperty(properties[propertyName], bind);
                if (registeredDiffPropertyNames.indexOf(propertyName) !== -1) {
                    runReactions = true;
                    const diffFunctions = this.getDecorator(`diffProperty:${propertyName}`);
                    for (let i = 0; i < diffFunctions.length; i++) {
                        const result = diffFunctions[i](previousProperty, newProperty);
                        if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                            changedPropertyKeys.push(propertyName);
                        }
                        if (propertyName in properties) {
                            diffPropertyResults[propertyName] = result.value;
                        }
                    }
                }
                else {
                    const result = boundAuto(previousProperty, newProperty);
                    if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                        changedPropertyKeys.push(propertyName);
                    }
                    if (propertyName in properties) {
                        diffPropertyResults[propertyName] = result.value;
                    }
                }
            }
            if (runReactions) {
                const reactionFunctions = this.getDecorator('diffReaction');
                const executedReactions = [];
                reactionFunctions.forEach(({ reaction, propertyName }) => {
                    const propertyChanged = changedPropertyKeys.indexOf(propertyName) !== -1;
                    const reactionRun = executedReactions.indexOf(reaction) !== -1;
                    if (propertyChanged && !reactionRun) {
                        reaction.call(this, this._properties, diffPropertyResults);
                        executedReactions.push(reaction);
                    }
                });
            }
            this._properties = diffPropertyResults;
            this._changedPropertyKeys = changedPropertyKeys;
        }
        else {
            this._initialProperties = false;
            for (let i = 0; i < propertyNames.length; i++) {
                const propertyName = propertyNames[i];
                if (typeof properties[propertyName] === 'function') {
                    properties[propertyName] = this._bindFunctionProperty(properties[propertyName], bind);
                }
                else {
                    changedPropertyKeys.push(propertyName);
                }
            }
            this._changedPropertyKeys = changedPropertyKeys;
            this._properties = Object.assign({}, properties);
        }
        if (this._changedPropertyKeys.length > 0) {
            this.invalidate();
        }
    }
    get children() {
        return this._children;
    }
    __setChildren__(children) {
        if (this._children.length > 0 || children.length > 0) {
            this._children = children;
            this.invalidate();
        }
    }
    _filterAndConvert(nodes) {
        const isArray = Array.isArray(nodes);
        const filteredNodes = Array.isArray(nodes) ? nodes : [nodes];
        const convertedNodes = [];
        for (let i = 0; i < filteredNodes.length; i++) {
            const node = filteredNodes[i];
            if (!node) {
                continue;
            }
            if (typeof node === 'string') {
                convertedNodes.push(toTextVNode(node));
                continue;
            }
            if (Object(__WEBPACK_IMPORTED_MODULE_2__d__["d" /* isVNode */])(node) && node.deferredPropertiesCallback) {
                const properties = node.deferredPropertiesCallback(false);
                node.originalProperties = node.properties;
                node.properties = Object.assign({}, properties, node.properties);
            }
            if (Object(__WEBPACK_IMPORTED_MODULE_2__d__["e" /* isWNode */])(node) && !Object(__WEBPACK_IMPORTED_MODULE_6__Registry__["d" /* isWidgetBaseConstructor */])(node.widgetConstructor)) {
                if (typeof node.widgetConstructor === 'function') {
                    let id = lazyWidgetIdMap.get(node.widgetConstructor);
                    if (!id) {
                        id = `__lazy_widget_${lazyWidgetId++}`;
                        lazyWidgetIdMap.set(node.widgetConstructor, id);
                        this.registry.define(id, node.widgetConstructor);
                    }
                    node.widgetConstructor = id;
                }
                else if (isLazyDefine(node.widgetConstructor)) {
                    const { label, registryItem } = node.widgetConstructor;
                    if (!this.registry.has(label)) {
                        this.registry.define(label, registryItem);
                    }
                    node.widgetConstructor = label;
                }
                node.widgetConstructor =
                    this.registry.get(node.widgetConstructor) || node.widgetConstructor;
            }
            if (!node.bind) {
                node.bind = this;
            }
            convertedNodes.push(node);
            if (node.children && node.children.length) {
                node.children = this._filterAndConvert(node.children);
            }
        }
        return isArray ? convertedNodes : convertedNodes[0];
    }
    __render__() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData) {
            instanceData.dirty = false;
        }
        const render = this._runBeforeRenders();
        const dNode = this._filterAndConvert(this._runAfterRenders(render()));
        this._nodeHandler.clear();
        return dNode;
    }
    invalidate() {
        const instanceData = widgetInstanceMap.get(this);
        if (instanceData && instanceData.invalidate) {
            instanceData.invalidate();
        }
    }
    render() {
        return Object(__WEBPACK_IMPORTED_MODULE_2__d__["f" /* v */])('div', {}, this.children);
    }
    /**
     * Function to add decorators to WidgetBase
     *
     * @param decoratorKey The key of the decorator
     * @param value The value of the decorator
     */
    addDecorator(decoratorKey, value) {
        value = Array.isArray(value) ? value : [value];
        if (this.hasOwnProperty('constructor')) {
            let decoratorList = decoratorMap.get(this.constructor);
            if (!decoratorList) {
                decoratorList = new __WEBPACK_IMPORTED_MODULE_0__shim_Map__["b" /* default */]();
                decoratorMap.set(this.constructor, decoratorList);
            }
            let specificDecoratorList = decoratorList.get(decoratorKey);
            if (!specificDecoratorList) {
                specificDecoratorList = [];
                decoratorList.set(decoratorKey, specificDecoratorList);
            }
            specificDecoratorList.push(...value);
        }
        else {
            const decorators = this.getDecorator(decoratorKey);
            this._decoratorCache.set(decoratorKey, [...decorators, ...value]);
        }
    }
    /**
     * Function to build the list of decorators from the global decorator map.
     *
     * @param decoratorKey  The key of the decorator
     * @return An array of decorator values
     * @private
     */
    _buildDecoratorList(decoratorKey) {
        const allDecorators = [];
        let constructor = this.constructor;
        while (constructor) {
            const instanceMap = decoratorMap.get(constructor);
            if (instanceMap) {
                const decorators = instanceMap.get(decoratorKey);
                if (decorators) {
                    allDecorators.unshift(...decorators);
                }
            }
            constructor = Object.getPrototypeOf(constructor);
        }
        return allDecorators;
    }
    /**
     * Function to retrieve decorator values
     *
     * @param decoratorKey The key of the decorator
     * @returns An array of decorator values
     */
    getDecorator(decoratorKey) {
        let allDecorators = this._decoratorCache.get(decoratorKey);
        if (allDecorators !== undefined) {
            return allDecorators;
        }
        allDecorators = this._buildDecoratorList(decoratorKey);
        this._decoratorCache.set(decoratorKey, allDecorators);
        return allDecorators;
    }
    /**
     * Binds unbound property functions to the specified `bind` property
     *
     * @param properties properties to check for functions
     */
    _bindFunctionProperty(property, bind) {
        if (typeof property === 'function' && !property[noBind] && Object(__WEBPACK_IMPORTED_MODULE_6__Registry__["d" /* isWidgetBaseConstructor */])(property) === false) {
            if (this._bindFunctionPropertyMap === undefined) {
                this._bindFunctionPropertyMap = new __WEBPACK_IMPORTED_MODULE_1__shim_WeakMap__["b" /* default */]();
            }
            const bindInfo = this._bindFunctionPropertyMap.get(property) || {};
            let { boundFunc, scope } = bindInfo;
            if (boundFunc === undefined || scope !== bind) {
                boundFunc = property.bind(bind);
                this._bindFunctionPropertyMap.set(property, { boundFunc, scope: bind });
            }
            return boundFunc;
        }
        return property;
    }
    get registry() {
        if (this._registry === undefined) {
            this._registry = new __WEBPACK_IMPORTED_MODULE_4__RegistryHandler__["a" /* default */]();
            this.own(this._registry);
            this.own(this._registry.on('invalidate', this._boundInvalidate));
        }
        return this._registry;
    }
    _runBeforeProperties(properties) {
        const beforeProperties = this.getDecorator('beforeProperties');
        if (beforeProperties.length > 0) {
            return beforeProperties.reduce((properties, beforePropertiesFunction) => {
                return Object.assign({}, properties, beforePropertiesFunction.call(this, properties));
            }, Object.assign({}, properties));
        }
        return properties;
    }
    /**
     * Run all registered before renders and return the updated render method
     */
    _runBeforeRenders() {
        const beforeRenders = this.getDecorator('beforeRender');
        if (beforeRenders.length > 0) {
            return beforeRenders.reduce((render, beforeRenderFunction) => {
                const updatedRender = beforeRenderFunction.call(this, render, this._properties, this._children);
                if (!updatedRender) {
                    console.warn('Render function not returned from beforeRender, using previous render');
                    return render;
                }
                return updatedRender;
            }, this._boundRenderFunc);
        }
        return this._boundRenderFunc;
    }
    /**
     * Run all registered after renders and return the decorated DNodes
     *
     * @param dNode The DNodes to run through the after renders
     */
    _runAfterRenders(dNode) {
        const afterRenders = this.getDecorator('afterRender');
        if (afterRenders.length > 0) {
            dNode = afterRenders.reduce((dNode, afterRenderFunction) => {
                return afterRenderFunction.call(this, dNode);
            }, dNode);
        }
        if (this._metaMap !== undefined) {
            this._metaMap.forEach((meta) => {
                meta.afterRender();
            });
        }
        return dNode;
    }
    _runAfterConstructors() {
        const afterConstructors = this.getDecorator('afterConstructor');
        if (afterConstructors.length > 0) {
            afterConstructors.forEach((afterConstructor) => afterConstructor.call(this));
        }
    }
    own(handle) {
        this._handles.push(handle);
    }
    destroy() {
        while (this._handles.length > 0) {
            const handle = this._handles.pop();
            if (handle) {
                handle.destroy();
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = WidgetBase;

/**
 * static identifier
 */
WidgetBase._type = __WEBPACK_IMPORTED_MODULE_6__Registry__["b" /* WIDGET_BASE_TYPE */];
/* harmony default export */ __webpack_exports__["b"] = (WidgetBase);
//# sourceMappingURL=WidgetBase.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let browserSpecificTransitionEndEventName = '';
let browserSpecificAnimationEndEventName = '';
function determineBrowserStyleNames(element) {
    if ('WebkitTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'webkitTransitionEnd';
        browserSpecificAnimationEndEventName = 'webkitAnimationEnd';
    }
    else if ('transition' in element.style || 'MozTransition' in element.style) {
        browserSpecificTransitionEndEventName = 'transitionend';
        browserSpecificAnimationEndEventName = 'animationend';
    }
    else {
        throw new Error('Your browser is not supported');
    }
}
function initialize(element) {
    if (browserSpecificAnimationEndEventName === '') {
        determineBrowserStyleNames(element);
    }
}
function runAndCleanUp(element, startAnimation, finishAnimation) {
    initialize(element);
    let finished = false;
    let transitionEnd = function () {
        if (!finished) {
            finished = true;
            element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
            element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
            finishAnimation();
        }
    };
    startAnimation();
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
}
function exit(node, properties, exitAnimation, removeNode) {
    const activeClass = properties.exitAnimationActive || `${exitAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(exitAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        removeNode();
    });
}
function enter(node, properties, enterAnimation) {
    const activeClass = properties.enterAnimationActive || `${enterAnimation}-active`;
    runAndCleanUp(node, () => {
        node.classList.add(enterAnimation);
        requestAnimationFrame(function () {
            node.classList.add(activeClass);
        });
    }, () => {
        node.classList.remove(enterAnimation);
        node.classList.remove(activeClass);
    });
}
/* harmony default export */ __webpack_exports__["a"] = ({
    enter,
    exit
});
//# sourceMappingURL=cssTransitions.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/d.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["e"] = isWNode;
/* harmony export (immutable) */ __webpack_exports__["d"] = isVNode;
/* harmony export (immutable) */ __webpack_exports__["c"] = isDomVNode;
/* unused harmony export isElementNode */
/* unused harmony export decorate */
/* harmony export (immutable) */ __webpack_exports__["g"] = w;
/* harmony export (immutable) */ __webpack_exports__["f"] = v;
/* unused harmony export dom */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");

/**
 * The identifier for a WNode type
 */
const WNODE = '__WNODE_TYPE';
/* harmony export (immutable) */ __webpack_exports__["b"] = WNODE;

/**
 * The identifier for a VNode type
 */
const VNODE = '__VNODE_TYPE';
/* harmony export (immutable) */ __webpack_exports__["a"] = VNODE;

/**
 * The identifier for a VNode type created using dom()
 */
const DOMVNODE = '__DOMVNODE_TYPE';
/* unused harmony export DOMVNODE */

/**
 * Helper function that returns true if the `DNode` is a `WNode` using the `type` property
 */
function isWNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === WNODE);
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` using the `type` property
 */
function isVNode(child) {
    return Boolean(child && typeof child !== 'string' && (child.type === VNODE || child.type === DOMVNODE));
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` created with `dom()` using the `type` property
 */
function isDomVNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === DOMVNODE);
}
function isElementNode(value) {
    return !!value.tagName;
}
function decorate(dNodes, optionsOrModifier, predicate) {
    let shallow = false;
    let modifier;
    if (typeof optionsOrModifier === 'function') {
        modifier = optionsOrModifier;
    }
    else {
        modifier = optionsOrModifier.modifier;
        predicate = optionsOrModifier.predicate;
        shallow = optionsOrModifier.shallow || false;
    }
    let nodes = Array.isArray(dNodes) ? [...dNodes] : [dNodes];
    function breaker() {
        nodes = [];
    }
    while (nodes.length) {
        const node = nodes.shift();
        if (node) {
            if (!shallow && (isWNode(node) || isVNode(node)) && node.children) {
                nodes = [...nodes, ...node.children];
            }
            if (!predicate || predicate(node)) {
                modifier(node, breaker);
            }
        }
    }
    return dNodes;
}
function w(widgetConstructorOrNode, properties, children) {
    if (isWNode(widgetConstructorOrNode)) {
        properties = Object.assign({}, widgetConstructorOrNode.properties, properties);
        children = children ? children : widgetConstructorOrNode.children;
        widgetConstructorOrNode = widgetConstructorOrNode.widgetConstructor;
    }
    return {
        children: children || [],
        widgetConstructor: widgetConstructorOrNode,
        properties,
        type: WNODE
    };
}
function v(tag, propertiesOrChildren = {}, children = undefined) {
    let properties = propertiesOrChildren;
    let deferredPropertiesCallback;
    if (Array.isArray(propertiesOrChildren)) {
        children = propertiesOrChildren;
        properties = {};
    }
    if (typeof properties === 'function') {
        deferredPropertiesCallback = properties;
        properties = {};
    }
    if (isVNode(tag)) {
        let { classes = [], styles = {} } = properties, newProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __rest */](properties, ["classes", "styles"]);
        let _a = tag.properties, { classes: nodeClasses = [], styles: nodeStyles = {} } = _a, nodeProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __rest */](_a, ["classes", "styles"]);
        nodeClasses = Array.isArray(nodeClasses) ? nodeClasses : [nodeClasses];
        classes = Array.isArray(classes) ? classes : [classes];
        styles = Object.assign({}, nodeStyles, styles);
        properties = Object.assign({}, nodeProperties, newProperties, { classes: [...nodeClasses, ...classes], styles });
        children = children ? children : tag.children;
        tag = tag.tag;
    }
    return {
        tag,
        deferredPropertiesCallback,
        originalProperties: {},
        children,
        properties,
        type: VNODE
    };
}
/**
 * Create a VNode for an existing DOM Node.
 */
function dom({ node, attrs = {}, props = {}, on = {}, diffType = 'none', onAttach }, children) {
    return {
        tag: isElementNode(node) ? node.tagName.toLowerCase() : '',
        properties: props,
        attributes: attrs,
        events: on,
        children,
        type: DOMVNODE,
        domNode: node,
        text: isElementNode(node) ? undefined : node.data,
        diffType,
        onAttach
    };
}
//# sourceMappingURL=d.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = alwaysRender;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__beforeProperties__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");


function alwaysRender() {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        Object(__WEBPACK_IMPORTED_MODULE_1__beforeProperties__["a" /* beforeProperties */])(function () {
            this.invalidate();
        })(target);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (alwaysRender);
//# sourceMappingURL=alwaysRender.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = beforeProperties;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");

function beforeProperties(method) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        target.addDecorator('beforeProperties', propertyKey ? target[propertyKey] : method);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (beforeProperties);
//# sourceMappingURL=beforeProperties.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = diffProperty;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");


/**
 * Decorator that can be used to register a function as a specific property diff
 *
 * @param propertyName  The name of the property of which the diff function is applied
 * @param diffType      The diff type, default is DiffType.AUTO.
 * @param diffFunction  A diff function to run if diffType if DiffType.CUSTOM
 */
function diffProperty(propertyName, diffFunction = __WEBPACK_IMPORTED_MODULE_1__diff__["a" /* auto */], reactionFunction) {
    return Object(__WEBPACK_IMPORTED_MODULE_0__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        target.addDecorator(`diffProperty:${propertyName}`, diffFunction.bind(null));
        target.addDecorator('registeredDiffProperty', propertyName);
        if (reactionFunction || propertyKey) {
            target.addDecorator('diffReaction', {
                propertyName,
                reaction: propertyKey ? target[propertyKey] : reactionFunction
            });
        }
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (diffProperty);
//# sourceMappingURL=diffProperty.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = handleDecorator;
/**
 * Generic decorator handler to take care of whether or not the decorator was called at the class level
 * or the method level.
 *
 * @param handler
 */
function handleDecorator(handler) {
    return function (target, propertyKey, descriptor) {
        if (typeof target === 'function') {
            handler(target.prototype, undefined);
        }
        else {
            handler(target, propertyKey);
        }
    };
}
/* unused harmony default export */ var _unused_webpack_default_export = (handleDecorator);
//# sourceMappingURL=handleDecorator.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/decorators/inject.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = inject;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__beforeProperties__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/beforeProperties.mjs");



/**
 * Map of instances against registered injectors.
 */
const registeredInjectorsMap = new __WEBPACK_IMPORTED_MODULE_0__shim_WeakMap__["b" /* default */]();
/**
 * Decorator retrieves an injector from an available registry using the name and
 * calls the `getProperties` function with the payload from the injector
 * and current properties with the the injected properties returned.
 *
 * @param InjectConfig the inject configuration
 */
function inject({ name, getProperties }) {
    return Object(__WEBPACK_IMPORTED_MODULE_1__handleDecorator__["a" /* handleDecorator */])((target, propertyKey) => {
        Object(__WEBPACK_IMPORTED_MODULE_2__beforeProperties__["a" /* beforeProperties */])(function (properties) {
            const injectorItem = this.registry.getInjector(name);
            if (injectorItem) {
                const { injector, invalidator } = injectorItem;
                const registeredInjectors = registeredInjectorsMap.get(this) || [];
                if (registeredInjectors.length === 0) {
                    registeredInjectorsMap.set(this, registeredInjectors);
                }
                if (registeredInjectors.indexOf(injectorItem) === -1) {
                    this.own(invalidator.on('invalidate', () => {
                        this.invalidate();
                    }));
                    registeredInjectors.push(injectorItem);
                }
                return getProperties(injector(), properties);
            }
        })(target);
    });
}
/* unused harmony default export */ var _unused_webpack_default_export = (inject);
//# sourceMappingURL=inject.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/diff.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export always */
/* unused harmony export ignore */
/* unused harmony export reference */
/* harmony export (immutable) */ __webpack_exports__["b"] = shallow;
/* harmony export (immutable) */ __webpack_exports__["a"] = auto;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");

function isObjectOrArray(value) {
    return Object.prototype.toString.call(value) === '[object Object]' || Array.isArray(value);
}
function always(previousProperty, newProperty) {
    return {
        changed: true,
        value: newProperty
    };
}
function ignore(previousProperty, newProperty) {
    return {
        changed: false,
        value: newProperty
    };
}
function reference(previousProperty, newProperty) {
    return {
        changed: previousProperty !== newProperty,
        value: newProperty
    };
}
function shallow(previousProperty, newProperty) {
    let changed = false;
    const validOldProperty = previousProperty && isObjectOrArray(previousProperty);
    const validNewProperty = newProperty && isObjectOrArray(newProperty);
    if (!validOldProperty || !validNewProperty) {
        return {
            changed: true,
            value: newProperty
        };
    }
    const previousKeys = Object.keys(previousProperty);
    const newKeys = Object.keys(newProperty);
    if (previousKeys.length !== newKeys.length) {
        changed = true;
    }
    else {
        changed = newKeys.some((key) => {
            return newProperty[key] !== previousProperty[key];
        });
    }
    return {
        changed,
        value: newProperty
    };
}
function auto(previousProperty, newProperty) {
    let result;
    if (typeof newProperty === 'function') {
        if (newProperty._type === __WEBPACK_IMPORTED_MODULE_0__Registry__["b" /* WIDGET_BASE_TYPE */]) {
            result = reference(previousProperty, newProperty);
        }
        else {
            result = ignore(previousProperty, newProperty);
        }
    }
    else if (isObjectOrArray(newProperty)) {
        result = shallow(previousProperty, newProperty);
    }
    else {
        result = reference(previousProperty, newProperty);
    }
    return result;
}
//# sourceMappingURL=diff.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/Base.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_Destroyable__ = __webpack_require__("./node_modules/@dojo/framework/core/Destroyable.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Set__ = __webpack_require__("./node_modules/@dojo/framework/shim/Set.mjs");


class Base extends __WEBPACK_IMPORTED_MODULE_0__core_Destroyable__["a" /* Destroyable */] {
    constructor(properties) {
        super();
        this._requestedNodeKeys = new __WEBPACK_IMPORTED_MODULE_1__shim_Set__["a" /* default */]();
        this._invalidate = properties.invalidate;
        this.nodeHandler = properties.nodeHandler;
        if (properties.bind) {
            this._bind = properties.bind;
        }
    }
    has(key) {
        return this.nodeHandler.has(key);
    }
    getNode(key) {
        const stringKey = `${key}`;
        const node = this.nodeHandler.get(stringKey);
        if (!node && !this._requestedNodeKeys.has(stringKey)) {
            const handle = this.nodeHandler.on(stringKey, () => {
                handle.destroy();
                this._requestedNodeKeys.delete(stringKey);
                this.invalidate();
            });
            this.own(handle);
            this._requestedNodeKeys.add(stringKey);
        }
        return node;
    }
    invalidate() {
        this._invalidate();
    }
    afterRender() {
        // Do nothing by default.
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Base;

/* unused harmony default export */ var _unused_webpack_default_export = (Base);
//# sourceMappingURL=Base.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Base__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/Base.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__shim_Map__ = __webpack_require__("./node_modules/@dojo/framework/shim/Map.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");



class WebAnimations extends __WEBPACK_IMPORTED_MODULE_0__Base__["a" /* Base */] {
    constructor() {
        super(...arguments);
        this._animationMap = new __WEBPACK_IMPORTED_MODULE_1__shim_Map__["b" /* default */]();
    }
    _createPlayer(node, properties) {
        const { effects, timing = {} } = properties;
        const fx = typeof effects === 'function' ? effects() : effects;
        const keyframeEffect = new __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].KeyframeEffect(node, fx, timing);
        return new __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].Animation(keyframeEffect, __WEBPACK_IMPORTED_MODULE_2__shim_global__["a" /* default */].document.timeline);
    }
    _updatePlayer(player, controls) {
        const { play, reverse, cancel, finish, onFinish, onCancel, playbackRate, startTime, currentTime } = controls;
        if (playbackRate !== undefined) {
            player.playbackRate = playbackRate;
        }
        if (reverse) {
            player.reverse();
        }
        if (cancel) {
            player.cancel();
        }
        if (finish) {
            player.finish();
        }
        if (startTime !== undefined) {
            player.startTime = startTime;
        }
        if (currentTime !== undefined) {
            player.currentTime = currentTime;
        }
        if (play) {
            player.play();
        }
        else {
            player.pause();
        }
        if (onFinish) {
            player.onfinish = onFinish.bind(this._bind);
        }
        if (onCancel) {
            player.oncancel = onCancel.bind(this._bind);
        }
    }
    animate(key, animateProperties) {
        const node = this.getNode(key);
        if (node) {
            if (!Array.isArray(animateProperties)) {
                animateProperties = [animateProperties];
            }
            animateProperties.forEach((properties) => {
                properties = typeof properties === 'function' ? properties() : properties;
                if (properties) {
                    const { id } = properties;
                    if (!this._animationMap.has(id)) {
                        this._animationMap.set(id, {
                            player: this._createPlayer(node, properties),
                            used: true
                        });
                    }
                    const animation = this._animationMap.get(id);
                    const { controls = {} } = properties;
                    if (animation) {
                        this._updatePlayer(animation.player, controls);
                        this._animationMap.set(id, {
                            player: animation.player,
                            used: true
                        });
                    }
                }
            });
        }
    }
    get(id) {
        const animation = this._animationMap.get(id);
        if (animation) {
            const { currentTime, playState, playbackRate, startTime } = animation.player;
            return {
                currentTime: currentTime || 0,
                playState,
                playbackRate,
                startTime: startTime || 0
            };
        }
    }
    afterRender() {
        this._animationMap.forEach((animation, key) => {
            if (!animation.used) {
                animation.player.cancel();
                this._animationMap.delete(key);
            }
            animation.used = false;
        });
    }
}
/* unused harmony export WebAnimations */

/* harmony default export */ __webpack_exports__["a"] = (WebAnimations);
//# sourceMappingURL=WebAnimation.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = theme;
/* harmony export (immutable) */ __webpack_exports__["b"] = registerThemeInjector;
/* harmony export (immutable) */ __webpack_exports__["a"] = ThemedMixin;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Injector__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Injector.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__decorators_inject__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/inject.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__decorators_handleDecorator__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/handleDecorator.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__diff__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/diff.mjs");






const THEME_KEY = ' _key';
const INJECTED_THEME_KEY = '__theme_injector';
/* unused harmony export INJECTED_THEME_KEY */

/**
 * Decorator for base css classes
 */
function theme(theme) {
    return Object(__WEBPACK_IMPORTED_MODULE_3__decorators_handleDecorator__["a" /* handleDecorator */])((target) => {
        target.addDecorator('baseThemeClasses', theme);
    });
}
/**
 * Creates a reverse lookup for the classes passed in via the `theme` function.
 *
 * @param classes The baseClasses object
 * @requires
 */
function createThemeClassesLookup(classes) {
    return classes.reduce((currentClassNames, baseClass) => {
        Object.keys(baseClass).forEach((key) => {
            currentClassNames[baseClass[key]] = key;
        });
        return currentClassNames;
    }, {});
}
/**
 * Convenience function that is given a theme and an optional registry, the theme
 * injector is defined against the registry, returning the theme.
 *
 * @param theme the theme to set
 * @param themeRegistry registry to define the theme injector against. Defaults
 * to the global registry
 *
 * @returns the theme injector used to set the theme
 */
function registerThemeInjector(theme, themeRegistry) {
    const themeInjector = new __WEBPACK_IMPORTED_MODULE_1__Injector__["a" /* Injector */](theme);
    themeRegistry.defineInjector(INJECTED_THEME_KEY, (invalidator) => {
        themeInjector.setInvalidator(invalidator);
        return () => themeInjector.get();
    });
    return themeInjector;
}
/**
 * Function that returns a class decorated with with Themed functionality
 */
function ThemedMixin(Base) {
    let Themed = class Themed extends Base {
        constructor() {
            super(...arguments);
            /**
             * Registered base theme keys
             */
            this._registeredBaseThemeKeys = [];
            /**
             * Indicates if classes meta data need to be calculated.
             */
            this._recalculateClasses = true;
            /**
             * Loaded theme
             */
            this._theme = {};
        }
        theme(classes) {
            if (this._recalculateClasses) {
                this._recalculateThemeClasses();
            }
            if (Array.isArray(classes)) {
                return classes.map((className) => this._getThemeClass(className));
            }
            return this._getThemeClass(classes);
        }
        /**
         * Function fired when `theme` or `extraClasses` are changed.
         */
        onPropertiesChanged() {
            this._recalculateClasses = true;
        }
        _getThemeClass(className) {
            if (className === undefined || className === null) {
                return className;
            }
            const extraClasses = this.properties.extraClasses || {};
            const themeClassName = this._baseThemeClassesReverseLookup[className];
            let resultClassNames = [];
            if (!themeClassName) {
                console.warn(`Class name: '${className}' not found in theme`);
                return null;
            }
            if (extraClasses[themeClassName]) {
                resultClassNames.push(extraClasses[themeClassName]);
            }
            if (this._theme[themeClassName]) {
                resultClassNames.push(this._theme[themeClassName]);
            }
            else {
                resultClassNames.push(this._registeredBaseTheme[themeClassName]);
            }
            return resultClassNames.join(' ');
        }
        _recalculateThemeClasses() {
            const { theme = {} } = this.properties;
            if (!this._registeredBaseTheme) {
                const baseThemes = this.getDecorator('baseThemeClasses');
                if (baseThemes.length === 0) {
                    console.warn('A base theme has not been provided to this widget. Please use the @theme decorator to add a theme.');
                }
                this._registeredBaseTheme = baseThemes.reduce((finalBaseTheme, baseTheme) => {
                    const _a = THEME_KEY, key = baseTheme[_a], classes = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __rest */](baseTheme, [typeof _a === "symbol" ? _a : _a + ""]);
                    this._registeredBaseThemeKeys.push(key);
                    return Object.assign({}, finalBaseTheme, classes);
                }, {});
                this._baseThemeClassesReverseLookup = createThemeClassesLookup(baseThemes);
            }
            this._theme = this._registeredBaseThemeKeys.reduce((baseTheme, themeKey) => {
                return Object.assign({}, baseTheme, theme[themeKey]);
            }, {});
            this._recalculateClasses = false;
        }
    };
    __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('theme', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */]),
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('extraClasses', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */])
    ], Themed.prototype, "onPropertiesChanged", null);
    Themed = __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_2__decorators_inject__["a" /* inject */])({
            name: INJECTED_THEME_KEY,
            getProperties: (theme, properties) => {
                if (!properties.theme) {
                    return { theme };
                }
                return {};
            }
        })
    ], Themed);
    return Themed;
}
/* unused harmony default export */ var _unused_webpack_default_export = (ThemedMixin);
//# sourceMappingURL=Themed.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/framework/widget-core/vdom.mjs":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export renderer */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shim_global__ = __webpack_require__("./node_modules/@dojo/framework/shim/global.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__has_has__ = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__ = __webpack_require__("./node_modules/@dojo/framework/shim/WeakMap.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__animations_cssTransitions__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/animations/cssTransitions.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");







const EMPTY_ARRAY = [];
const nodeOperations = ['focus', 'blur', 'scrollIntoView', 'click'];
const NAMESPACE_W3 = 'http://www.w3.org/';
const NAMESPACE_SVG = NAMESPACE_W3 + '2000/svg';
const NAMESPACE_XLINK = NAMESPACE_W3 + '1999/xlink';
function isWNodeWrapper(child) {
    return child && Object(__WEBPACK_IMPORTED_MODULE_4__d__["e" /* isWNode */])(child.node);
}
function isVNodeWrapper(child) {
    return !!child && Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isVNode */])(child.node);
}
function isAttachApplication(value) {
    return !!value.type;
}
function updateAttributes(domNode, previousAttributes, attributes, namespace) {
    const attrNames = Object.keys(attributes);
    const attrCount = attrNames.length;
    for (let i = 0; i < attrCount; i++) {
        const attrName = attrNames[i];
        const attrValue = attributes[attrName];
        const previousAttrValue = previousAttributes[attrName];
        if (attrValue !== previousAttrValue) {
            updateAttribute(domNode, attrName, attrValue, namespace);
        }
    }
}
function buildPreviousProperties(domNode, current, next) {
    const { node: { diffType, properties, attributes } } = current;
    if (!diffType || diffType === 'vdom') {
        return {
            properties: current.node.properties,
            attributes: current.node.attributes,
            events: current.node.events
        };
    }
    else if (diffType === 'none') {
        return { properties: {}, attributes: current.node.attributes ? {} : undefined, events: current.node.events };
    }
    let newProperties = {
        properties: {}
    };
    if (attributes) {
        newProperties.attributes = {};
        newProperties.events = current.node.events;
        Object.keys(properties).forEach((propName) => {
            newProperties.properties[propName] = domNode[propName];
        });
        Object.keys(attributes).forEach((attrName) => {
            newProperties.attributes[attrName] = domNode.getAttribute(attrName);
        });
        return newProperties;
    }
    newProperties.properties = Object.keys(properties).reduce((props, property) => {
        props[property] = domNode.getAttribute(property) || domNode[property];
        return props;
    }, {});
    return newProperties;
}
function checkDistinguishable(wrappers, index, parentWNodeWrapper) {
    const wrapperToCheck = wrappers[index];
    if (isVNodeWrapper(wrapperToCheck) && !wrapperToCheck.node.tag) {
        return;
    }
    const { key } = wrapperToCheck.node.properties;
    let parentName = 'unknown';
    if (parentWNodeWrapper) {
        const { node: { widgetConstructor } } = parentWNodeWrapper;
        parentName = widgetConstructor.name || 'unknown';
    }
    if (key === undefined || key === null) {
        for (let i = 0; i < wrappers.length; i++) {
            if (i !== index) {
                const wrapper = wrappers[i];
                if (same(wrapper, wrapperToCheck)) {
                    let nodeIdentifier;
                    if (isWNodeWrapper(wrapper)) {
                        nodeIdentifier = wrapper.node.widgetConstructor.name || 'unknown';
                    }
                    else {
                        nodeIdentifier = wrapper.node.tag;
                    }
                    console.warn(`A widget (${parentName}) has had a child added or removed, but they were not able to uniquely identified. It is recommended to provide a unique 'key' property when using the same widget or element (${nodeIdentifier}) multiple times as siblings`);
                    break;
                }
            }
        }
    }
}
function same(dnode1, dnode2) {
    if (isVNodeWrapper(dnode1) && isVNodeWrapper(dnode2)) {
        if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["c" /* isDomVNode */])(dnode1.node) && Object(__WEBPACK_IMPORTED_MODULE_4__d__["c" /* isDomVNode */])(dnode2.node)) {
            if (dnode1.node.domNode !== dnode2.node.domNode) {
                return false;
            }
        }
        if (dnode1.node.tag !== dnode2.node.tag) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    else if (isWNodeWrapper(dnode1) && isWNodeWrapper(dnode2)) {
        if (dnode1.instance === undefined && typeof dnode2.node.widgetConstructor === 'string') {
            return false;
        }
        if (dnode1.node.widgetConstructor !== dnode2.node.widgetConstructor) {
            return false;
        }
        if (dnode1.node.properties.key !== dnode2.node.properties.key) {
            return false;
        }
        return true;
    }
    return false;
}
function findIndexOfChild(children, sameAs, start) {
    for (let i = start; i < children.length; i++) {
        if (same(children[i], sameAs)) {
            return i;
        }
    }
    return -1;
}
function createClassPropValue(classes = []) {
    classes = Array.isArray(classes) ? classes : [classes];
    return classes.join(' ').trim();
}
function updateAttribute(domNode, attrName, attrValue, namespace) {
    if (namespace === NAMESPACE_SVG && attrName === 'href' && attrValue) {
        domNode.setAttributeNS(NAMESPACE_XLINK, attrName, attrValue);
    }
    else if ((attrName === 'role' && attrValue === '') || attrValue === undefined) {
        domNode.removeAttribute(attrName);
    }
    else {
        domNode.setAttribute(attrName, attrValue);
    }
}
function runEnterAnimation(next, transitions) {
    const { domNode, node: { properties }, node: { properties: { enterAnimation } } } = next;
    if (enterAnimation) {
        if (typeof enterAnimation === 'function') {
            return enterAnimation(domNode, properties);
        }
        transitions.enter(domNode, properties, enterAnimation);
    }
}
function runExitAnimation(current, transitions) {
    const { domNode, node: { properties }, node: { properties: { exitAnimation } } } = current;
    const removeDomNode = () => {
        domNode && domNode.parentNode && domNode.parentNode.removeChild(domNode);
        current.domNode = undefined;
    };
    if (typeof exitAnimation === 'function') {
        return exitAnimation(domNode, removeDomNode, properties);
    }
    transitions.exit(domNode, properties, exitAnimation, removeDomNode);
}
function arrayFrom(arr) {
    return Array.prototype.slice.call(arr);
}
function wrapVNodes(nodes) {
    return class extends __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["a" /* WidgetBase */] {
        render() {
            return nodes;
        }
    };
}
function renderer(renderer) {
    let _mountOptions = {
        sync: false,
        merge: true,
        transition: __WEBPACK_IMPORTED_MODULE_3__animations_cssTransitions__["a" /* default */],
        domNode: __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.body,
        registry: null
    };
    let _invalidationQueue = [];
    let _processQueue = [];
    let _applicationQueue = [];
    let _eventMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _instanceToWrapperMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _parentWrapperMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _wrapperSiblingMap = new __WEBPACK_IMPORTED_MODULE_2__shim_WeakMap__["a" /* WeakMap */]();
    let _renderScheduled;
    let _afterRenderCallbacks = [];
    let _deferredRenderCallbacks = [];
    let parentInvalidate;
    function nodeOperation(propName, propValue, previousValue, domNode) {
        let result = propValue && !previousValue;
        if (typeof propValue === 'function') {
            result = propValue();
        }
        if (result === true) {
            _afterRenderCallbacks.push(() => {
                domNode[propName]();
            });
        }
    }
    function updateEvent(domNode, eventName, currentValue, bind, previousValue) {
        if (previousValue) {
            const previousEvent = _eventMap.get(previousValue);
            domNode.removeEventListener(eventName, previousEvent);
        }
        let callback = currentValue.bind(bind);
        if (eventName === 'input') {
            callback = function (evt) {
                currentValue.call(this, evt);
                evt.target['oninput-value'] = evt.target.value;
            }.bind(bind);
        }
        domNode.addEventListener(eventName, callback);
        _eventMap.set(currentValue, callback);
    }
    function removeOrphanedEvents(domNode, previousProperties, properties, onlyEvents = false) {
        Object.keys(previousProperties).forEach((propName) => {
            const isEvent = propName.substr(0, 2) === 'on' || onlyEvents;
            const eventName = onlyEvents ? propName : propName.substr(2);
            if (isEvent && !properties[propName]) {
                const eventCallback = _eventMap.get(previousProperties[propName]);
                if (eventCallback) {
                    domNode.removeEventListener(eventName, eventCallback);
                }
            }
        });
    }
    function renderedToWrapper(rendered, parent, currentParent) {
        const wrappedRendered = [];
        const hasParentWNode = isWNodeWrapper(parent);
        const currentParentLength = isVNodeWrapper(currentParent) && (currentParent.childrenWrappers || []).length > 1;
        const requiresInsertBefore = ((parent.requiresInsertBefore || parent.hasPreviousSiblings !== false) && hasParentWNode) ||
            currentParentLength;
        let previousItem;
        for (let i = 0; i < rendered.length; i++) {
            const renderedItem = rendered[i];
            const wrapper = {
                node: renderedItem,
                depth: parent.depth + 1,
                requiresInsertBefore,
                hasParentWNode,
                namespace: parent.namespace
            };
            if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isVNode */])(renderedItem) && renderedItem.properties.exitAnimation) {
                parent.hasAnimations = true;
                let nextParent = _parentWrapperMap.get(parent);
                while (nextParent) {
                    if (nextParent.hasAnimations) {
                        break;
                    }
                    nextParent.hasAnimations = true;
                    nextParent = _parentWrapperMap.get(nextParent);
                }
            }
            _parentWrapperMap.set(wrapper, parent);
            if (previousItem) {
                _wrapperSiblingMap.set(previousItem, wrapper);
            }
            wrappedRendered.push(wrapper);
            previousItem = wrapper;
        }
        return wrappedRendered;
    }
    function findParentWNodeWrapper(currentNode) {
        let parentWNodeWrapper;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentWNodeWrapper && parentWrapper) {
            if (!parentWNodeWrapper && isWNodeWrapper(parentWrapper)) {
                parentWNodeWrapper = parentWrapper;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentWNodeWrapper;
    }
    function findParentDomNode(currentNode) {
        let parentDomNode;
        let parentWrapper = _parentWrapperMap.get(currentNode);
        while (!parentDomNode && parentWrapper) {
            if (!parentDomNode && isVNodeWrapper(parentWrapper) && parentWrapper.domNode) {
                parentDomNode = parentWrapper.domNode;
            }
            parentWrapper = _parentWrapperMap.get(parentWrapper);
        }
        return parentDomNode;
    }
    function runDeferredProperties(next) {
        if (next.node.deferredPropertiesCallback) {
            const properties = next.node.properties;
            next.node.properties = Object.assign({}, next.node.deferredPropertiesCallback(true), next.node.originalProperties);
            _afterRenderCallbacks.push(() => {
                processProperties(next, { properties });
            });
        }
    }
    function findInsertBefore(next) {
        let insertBefore = null;
        let searchNode = next;
        while (!insertBefore) {
            const nextSibling = _wrapperSiblingMap.get(searchNode);
            if (nextSibling) {
                if (isVNodeWrapper(nextSibling)) {
                    if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                        insertBefore = nextSibling.domNode;
                        break;
                    }
                    searchNode = nextSibling;
                    continue;
                }
                if (nextSibling.domNode && nextSibling.domNode.parentNode) {
                    insertBefore = nextSibling.domNode;
                    break;
                }
                searchNode = nextSibling;
                continue;
            }
            searchNode = _parentWrapperMap.get(searchNode);
            if (!searchNode || isVNodeWrapper(searchNode)) {
                break;
            }
        }
        return insertBefore;
    }
    function setProperties(domNode, currentProperties = {}, nextWrapper, includesEventsAndAttributes = true) {
        const propNames = Object.keys(nextWrapper.node.properties);
        const propCount = propNames.length;
        if (propNames.indexOf('classes') === -1 && currentProperties.classes) {
            domNode.removeAttribute('class');
        }
        includesEventsAndAttributes && removeOrphanedEvents(domNode, currentProperties, nextWrapper.node.properties);
        for (let i = 0; i < propCount; i++) {
            const propName = propNames[i];
            let propValue = nextWrapper.node.properties[propName];
            const previousValue = currentProperties[propName];
            if (propName === 'classes') {
                const previousClassString = createClassPropValue(previousValue);
                let currentClassString = createClassPropValue(propValue);
                if (previousClassString !== currentClassString) {
                    if (currentClassString) {
                        if (nextWrapper.merged) {
                            const domClasses = (domNode.getAttribute('class') || '').split(' ');
                            for (let i = 0; i < domClasses.length; i++) {
                                if (currentClassString.indexOf(domClasses[i]) === -1) {
                                    currentClassString = `${domClasses[i]} ${currentClassString}`;
                                }
                            }
                        }
                        domNode.setAttribute('class', currentClassString);
                    }
                    else {
                        domNode.removeAttribute('class');
                    }
                }
            }
            else if (nodeOperations.indexOf(propName) !== -1) {
                nodeOperation(propName, propValue, previousValue, domNode);
            }
            else if (propName === 'styles') {
                const styleNames = Object.keys(propValue);
                const styleCount = styleNames.length;
                for (let j = 0; j < styleCount; j++) {
                    const styleName = styleNames[j];
                    const newStyleValue = propValue[styleName];
                    const oldStyleValue = previousValue && previousValue[styleName];
                    if (newStyleValue === oldStyleValue) {
                        continue;
                    }
                    domNode.style[styleName] = newStyleValue || '';
                }
            }
            else {
                if (!propValue && typeof previousValue === 'string') {
                    propValue = '';
                }
                if (propName === 'value') {
                    const domValue = domNode[propName];
                    if (domValue !== propValue &&
                        (domNode['oninput-value']
                            ? domValue === domNode['oninput-value']
                            : propValue !== previousValue)) {
                        domNode[propName] = propValue;
                        domNode['oninput-value'] = undefined;
                    }
                }
                else if (propName !== 'key' && propValue !== previousValue) {
                    const type = typeof propValue;
                    if (type === 'function' && propName.lastIndexOf('on', 0) === 0 && includesEventsAndAttributes) {
                        updateEvent(domNode, propName.substr(2), propValue, nextWrapper.node.bind, previousValue);
                    }
                    else if (type === 'string' && propName !== 'innerHTML' && includesEventsAndAttributes) {
                        updateAttribute(domNode, propName, propValue, nextWrapper.namespace);
                    }
                    else if (propName === 'scrollLeft' || propName === 'scrollTop') {
                        if (domNode[propName] !== propValue) {
                            domNode[propName] = propValue;
                        }
                    }
                    else {
                        domNode[propName] = propValue;
                    }
                }
            }
        }
    }
    function runDeferredRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _deferredRenderCallbacks;
        _deferredRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestAnimationFrame(run);
            }
        }
    }
    function runAfterRenderCallbacks() {
        const { sync } = _mountOptions;
        const callbacks = _afterRenderCallbacks;
        _afterRenderCallbacks = [];
        if (callbacks.length) {
            const run = () => {
                let callback;
                while ((callback = callbacks.shift())) {
                    callback();
                }
            };
            if (sync) {
                run();
            }
            else {
                if (__WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestIdleCallback) {
                    __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestIdleCallback(run);
                }
                else {
                    setTimeout(run);
                }
            }
        }
    }
    function processProperties(next, previousProperties) {
        if (next.node.attributes && next.node.events) {
            updateAttributes(next.domNode, previousProperties.attributes || {}, next.node.attributes, next.namespace);
            setProperties(next.domNode, previousProperties.properties, next, false);
            const events = next.node.events || {};
            if (previousProperties.events) {
                removeOrphanedEvents(next.domNode, previousProperties.events || {}, next.node.events, true);
            }
            previousProperties.events = previousProperties.events || {};
            Object.keys(events).forEach((event) => {
                updateEvent(next.domNode, event, events[event], next.node.bind, previousProperties.events[event]);
            });
        }
        else {
            setProperties(next.domNode, previousProperties.properties, next);
        }
    }
    function mount(mountOptions = {}) {
        _mountOptions = Object.assign({}, _mountOptions, mountOptions);
        const { domNode } = _mountOptions;
        let renderResult = renderer();
        if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["d" /* isVNode */])(renderResult)) {
            renderResult = Object(__WEBPACK_IMPORTED_MODULE_4__d__["g" /* w */])(wrapVNodes(renderResult), {});
        }
        const nextWrapper = {
            node: renderResult,
            depth: 1
        };
        _parentWrapperMap.set(nextWrapper, { depth: 0, domNode, node: Object(__WEBPACK_IMPORTED_MODULE_4__d__["f" /* v */])('fake') });
        _processQueue.push({
            current: [],
            next: [nextWrapper],
            meta: { mergeNodes: arrayFrom(domNode.childNodes) }
        });
        _runProcessQueue();
        _mountOptions.merge = false;
        _runDomInstructionQueue();
        _runCallbacks();
    }
    function invalidate() {
        parentInvalidate && parentInvalidate();
    }
    function _schedule() {
        const { sync } = _mountOptions;
        if (sync) {
            _runInvalidationQueue();
        }
        else if (!_renderScheduled) {
            _renderScheduled = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].requestAnimationFrame(() => {
                _runInvalidationQueue();
            });
        }
    }
    function _runInvalidationQueue() {
        _renderScheduled = undefined;
        const invalidationQueue = [..._invalidationQueue];
        const previouslyRendered = [];
        _invalidationQueue = [];
        invalidationQueue.sort((a, b) => b.depth - a.depth);
        let item;
        while ((item = invalidationQueue.pop())) {
            let { instance } = item;
            if (previouslyRendered.indexOf(instance) === -1 && _instanceToWrapperMap.has(instance)) {
                previouslyRendered.push(instance);
                const current = _instanceToWrapperMap.get(instance);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(instance);
                const parent = _parentWrapperMap.get(current);
                const sibling = _wrapperSiblingMap.get(current);
                const { constructor, children } = instance;
                const next = {
                    node: {
                        type: __WEBPACK_IMPORTED_MODULE_4__d__["b" /* WNODE */],
                        widgetConstructor: constructor,
                        properties: instanceData.inputProperties,
                        children: children,
                        bind: current.node.bind
                    },
                    instance,
                    depth: current.depth
                };
                parent && _parentWrapperMap.set(next, parent);
                sibling && _wrapperSiblingMap.set(next, sibling);
                const { item } = _updateWidget({ current, next });
                if (item) {
                    _processQueue.push(item);
                    instance && _instanceToWrapperMap.set(instance, next);
                    _runProcessQueue();
                }
            }
        }
        _runDomInstructionQueue();
        _runCallbacks();
    }
    function _runProcessQueue() {
        let item;
        while ((item = _processQueue.pop())) {
            if (isAttachApplication(item)) {
                _applicationQueue.push(item);
            }
            else {
                const { current, next, meta } = item;
                _process(current || EMPTY_ARRAY, next || EMPTY_ARRAY, meta);
            }
        }
    }
    function _runDomInstructionQueue() {
        _applicationQueue.reverse();
        let item;
        while ((item = _applicationQueue.pop())) {
            if (item.type === 'create') {
                const { parentDomNode, next, next: { domNode, merged, requiresInsertBefore, node: { properties } } } = item;
                processProperties(next, { properties: {} });
                runDeferredProperties(next);
                if (!merged) {
                    let insertBefore;
                    if (requiresInsertBefore) {
                        insertBefore = findInsertBefore(next);
                    }
                    parentDomNode.insertBefore(domNode, insertBefore);
                    if (Object(__WEBPACK_IMPORTED_MODULE_4__d__["c" /* isDomVNode */])(next.node) && next.node.onAttach) {
                        next.node.onAttach();
                    }
                }
                runEnterAnimation(next, _mountOptions.transition);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(next.node.bind);
                if (properties.key != null && instanceData) {
                    instanceData.nodeHandler.add(domNode, `${properties.key}`);
                }
                item.next.inserted = true;
            }
            else if (item.type === 'update') {
                const { next, next: { domNode, node }, current } = item;
                const parent = _parentWrapperMap.get(next);
                if (parent && isWNodeWrapper(parent) && parent.instance) {
                    const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(parent.instance);
                    instanceData && instanceData.nodeHandler.addRoot();
                }
                const previousProperties = buildPreviousProperties(domNode, current, next);
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(next.node.bind);
                processProperties(next, previousProperties);
                runDeferredProperties(next);
                if (instanceData && node.properties.key != null) {
                    instanceData.nodeHandler.add(next.domNode, `${node.properties.key}`);
                }
            }
            else if (item.type === 'delete') {
                const { current } = item;
                if (current.node.properties.exitAnimation) {
                    runExitAnimation(current, _mountOptions.transition);
                }
                else {
                    current.domNode.parentNode.removeChild(current.domNode);
                    current.domNode = undefined;
                }
            }
            else if (item.type === 'attach') {
                const { instance, attached } = item;
                const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(instance);
                instanceData.nodeHandler.addRoot();
                attached && instanceData.onAttach();
            }
            else if (item.type === 'detach') {
                if (item.current.instance) {
                    const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(item.current.instance);
                    instanceData && instanceData.onDetach();
                }
                item.current.domNode = undefined;
                item.current.node.bind = undefined;
                item.current.instance = undefined;
            }
        }
    }
    function _runCallbacks() {
        runAfterRenderCallbacks();
        runDeferredRenderCallbacks();
    }
    function _processMergeNodes(next, mergeNodes) {
        const { merge } = _mountOptions;
        if (merge && mergeNodes.length) {
            if (isVNodeWrapper(next)) {
                let { node: { tag } } = next;
                for (let i = 0; i < mergeNodes.length; i++) {
                    const domElement = mergeNodes[i];
                    if (tag.toUpperCase() === (domElement.tagName || '')) {
                        mergeNodes.splice(i, 1);
                        next.domNode = domElement;
                        break;
                    }
                }
            }
            else {
                next.mergeNodes = mergeNodes;
            }
        }
    }
    function registerDistinguishableCallback(childNodes, index) {
        _afterRenderCallbacks.push(() => {
            const parentWNodeWrapper = findParentWNodeWrapper(childNodes[index]);
            checkDistinguishable(childNodes, index, parentWNodeWrapper);
        });
    }
    function _process(current, next, meta = {}) {
        let { mergeNodes = [], oldIndex = 0, newIndex = 0 } = meta;
        const currentLength = current.length;
        const nextLength = next.length;
        const hasPreviousSiblings = currentLength > 1 || (currentLength > 0 && currentLength < nextLength);
        const instructions = [];
        if (newIndex < nextLength) {
            let currentWrapper = oldIndex < currentLength ? current[oldIndex] : undefined;
            const nextWrapper = next[newIndex];
            nextWrapper.hasPreviousSiblings = hasPreviousSiblings;
            _processMergeNodes(nextWrapper, mergeNodes);
            if (currentWrapper && same(currentWrapper, nextWrapper)) {
                oldIndex++;
                newIndex++;
                if (isVNodeWrapper(currentWrapper) && isVNodeWrapper(nextWrapper)) {
                    nextWrapper.inserted = currentWrapper.inserted;
                }
                instructions.push({ current: currentWrapper, next: nextWrapper });
            }
            else if (!currentWrapper || findIndexOfChild(current, nextWrapper, oldIndex + 1) === -1) {
                true && current.length && registerDistinguishableCallback(next, newIndex);
                instructions.push({ current: undefined, next: nextWrapper });
                newIndex++;
            }
            else if (findIndexOfChild(next, currentWrapper, newIndex + 1) === -1) {
                true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                oldIndex++;
            }
            else {
                true && registerDistinguishableCallback(next, newIndex);
                true && registerDistinguishableCallback(current, oldIndex);
                instructions.push({ current: currentWrapper, next: undefined });
                instructions.push({ current: undefined, next: nextWrapper });
                oldIndex++;
                newIndex++;
            }
        }
        if (newIndex < nextLength) {
            _processQueue.push({ current, next, meta: { mergeNodes, oldIndex, newIndex } });
        }
        if (currentLength > oldIndex && newIndex >= nextLength) {
            for (let i = oldIndex; i < currentLength; i++) {
                true && registerDistinguishableCallback(current, i);
                instructions.push({ current: current[i], next: undefined });
            }
        }
        for (let i = 0; i < instructions.length; i++) {
            const { item, dom, widget } = _processOne(instructions[i]);
            widget && _processQueue.push(widget);
            item && _processQueue.push(item);
            dom && _applicationQueue.push(dom);
        }
    }
    function _processOne({ current, next }) {
        if (current !== next) {
            if (!current && next) {
                if (isVNodeWrapper(next)) {
                    return _createDom({ next });
                }
                else {
                    return _createWidget({ next });
                }
            }
            else if (current && next) {
                if (isVNodeWrapper(current) && isVNodeWrapper(next)) {
                    return _updateDom({ current, next });
                }
                else if (isWNodeWrapper(current) && isWNodeWrapper(next)) {
                    return _updateWidget({ current, next });
                }
            }
            else if (current && !next) {
                if (isVNodeWrapper(current)) {
                    return _removeDom({ current });
                }
                else if (isWNodeWrapper(current)) {
                    return _removeWidget({ current });
                }
            }
        }
        return {};
    }
    function _createWidget({ next }) {
        let { node: { widgetConstructor } } = next;
        let { registry } = _mountOptions;
        if (!Object(__WEBPACK_IMPORTED_MODULE_5__Registry__["d" /* isWidgetBaseConstructor */])(widgetConstructor)) {
            return {};
        }
        const instance = new widgetConstructor();
        if (registry) {
            instance.registry.base = registry;
        }
        const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(instance);
        instanceData.invalidate = () => {
            instanceData.dirty = true;
            if (!instanceData.rendering && _instanceToWrapperMap.has(instance)) {
                _invalidationQueue.push({ instance, depth: next.depth });
                _schedule();
            }
        };
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        next.instance = instance;
        let rendered = instance.__render__();
        instanceData.rendering = false;
        if (rendered) {
            rendered = Array.isArray(rendered) ? rendered : [rendered];
            next.childrenWrappers = renderedToWrapper(rendered, next, null);
        }
        if (next.instance) {
            _instanceToWrapperMap.set(next.instance, next);
            if (!parentInvalidate) {
                parentInvalidate = next.instance.invalidate.bind(next.instance);
            }
        }
        return {
            item: { next: next.childrenWrappers, meta: { mergeNodes: next.mergeNodes } },
            widget: { type: 'attach', instance, attached: true }
        };
    }
    function _updateWidget({ current, next }) {
        current = (current.instance && _instanceToWrapperMap.get(current.instance)) || current;
        const { instance, domNode, hasAnimations } = current;
        if (!instance) {
            return [];
        }
        const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(instance);
        next.instance = instance;
        next.domNode = domNode;
        next.hasAnimations = hasAnimations;
        instanceData.rendering = true;
        instance.__setProperties__(next.node.properties, next.node.bind);
        instance.__setChildren__(next.node.children);
        _instanceToWrapperMap.set(next.instance, next);
        if (instanceData.dirty) {
            let rendered = instance.__render__();
            instanceData.rendering = false;
            if (rendered) {
                rendered = Array.isArray(rendered) ? rendered : [rendered];
                next.childrenWrappers = renderedToWrapper(rendered, next, current);
            }
            return {
                item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
                widget: { type: 'attach', instance, attached: false }
            };
        }
        instanceData.rendering = false;
        next.childrenWrappers = current.childrenWrappers;
        return {
            widget: { type: 'attach', instance, attached: false }
        };
    }
    function _removeWidget({ current }) {
        current = current.instance ? _instanceToWrapperMap.get(current.instance) : current;
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        _instanceToWrapperMap.delete(current.instance);
        return {
            item: { current: current.childrenWrappers, meta: {} },
            widget: { type: 'detach', current }
        };
    }
    function _createDom({ next }) {
        let mergeNodes = [];
        if (!next.domNode) {
            if (next.node.domNode) {
                next.domNode = next.node.domNode;
            }
            else {
                if (next.node.tag === 'svg') {
                    next.namespace = NAMESPACE_SVG;
                }
                if (next.node.tag) {
                    if (next.namespace) {
                        next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createElementNS(next.namespace, next.node.tag);
                    }
                    else {
                        next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createElement(next.node.tag);
                    }
                }
                else if (next.node.text != null) {
                    next.domNode = __WEBPACK_IMPORTED_MODULE_0__shim_global__["a" /* default */].document.createTextNode(next.node.text);
                }
            }
        }
        else {
            next.merged = true;
        }
        if (next.domNode) {
            if (_mountOptions.merge) {
                mergeNodes = arrayFrom(next.domNode.childNodes);
            }
            if (next.node.children) {
                next.childrenWrappers = renderedToWrapper(next.node.children, next, null);
            }
        }
        const parentWNodeWrapper = findParentWNodeWrapper(next);
        if (parentWNodeWrapper && !parentWNodeWrapper.domNode) {
            parentWNodeWrapper.domNode = next.domNode;
        }
        const dom = {
            next: next,
            parentDomNode: findParentDomNode(next),
            type: 'create'
        };
        if (next.childrenWrappers) {
            return {
                item: { current: [], next: next.childrenWrappers, meta: { mergeNodes } },
                dom
            };
        }
        return { dom };
    }
    function _updateDom({ current, next }) {
        const parentDomNode = findParentDomNode(current);
        next.domNode = current.domNode;
        next.namespace = current.namespace;
        if (next.node.text && next.node.text !== current.node.text) {
            const updatedTextNode = parentDomNode.ownerDocument.createTextNode(next.node.text);
            parentDomNode.replaceChild(updatedTextNode, next.domNode);
            next.domNode = updatedTextNode;
        }
        else if (next.node.children) {
            const children = renderedToWrapper(next.node.children, next, current);
            next.childrenWrappers = children;
        }
        return {
            item: { current: current.childrenWrappers, next: next.childrenWrappers, meta: {} },
            dom: { type: 'update', next, current }
        };
    }
    function _removeDom({ current }) {
        _wrapperSiblingMap.delete(current);
        _parentWrapperMap.delete(current);
        current.node.bind = undefined;
        if (current.hasAnimations) {
            return {
                item: { current: current.childrenWrappers, meta: {} },
                dom: { type: 'delete', current }
            };
        }
        if (current.childrenWrappers) {
            _afterRenderCallbacks.push(() => {
                let wrappers = current.childrenWrappers || [];
                let wrapper;
                while ((wrapper = wrappers.pop())) {
                    if (wrapper.childrenWrappers) {
                        wrappers.push(...wrapper.childrenWrappers);
                        wrapper.childrenWrappers = undefined;
                    }
                    if (isWNodeWrapper(wrapper)) {
                        if (wrapper.instance) {
                            _instanceToWrapperMap.delete(wrapper.instance);
                            const instanceData = __WEBPACK_IMPORTED_MODULE_6__WidgetBase__["c" /* widgetInstanceMap */].get(wrapper.instance);
                            instanceData && instanceData.onDetach();
                        }
                        wrapper.instance = undefined;
                    }
                    _wrapperSiblingMap.delete(wrapper);
                    _parentWrapperMap.delete(wrapper);
                    wrapper.domNode = undefined;
                    wrapper.node.bind = undefined;
                }
            });
        }
        return {
            dom: { type: 'delete', current }
        };
    }
    return {
        mount,
        invalidate
    };
}
/* harmony default export */ __webpack_exports__["a"] = (renderer);
//# sourceMappingURL=vdom.mjs.map

/***/ }),

/***/ "./node_modules/@dojo/themes/dojo/index.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./node_modules/@dojo/themes/dojo/index.js":
/***/ (function(module, exports, __webpack_require__) {

!function(_,o){ true?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports.dojo=o():_.dojo=o()}(this,function(){return function(_){var o={};function e(t){if(o[t])return o[t].exports;var i=o[t]={i:t,l:!1,exports:{}};return _[t].call(i.exports,i,i.exports,e),i.l=!0,i.exports}return e.m=_,e.c=o,e.d=function(_,o,t){e.o(_,o)||Object.defineProperty(_,o,{configurable:!1,enumerable:!0,get:t})},e.n=function(_){var o=_&&_.__esModule?function(){return _.default}:function(){return _};return e.d(o,"a",o),o},e.o=function(_,o){return Object.prototype.hasOwnProperty.call(_,o)},e.p="",e(e.s=0)}([function(_,o,e){"use strict";Object.defineProperty(o,"__esModule",{value:!0});var t=e(1),i=e(2),n=e(3),r=e(4),d=e(5),a=e(6),l=e(7),c=e(8),m=e(9),s=e(10),p=e(11),u=e(12),b=e(13),g=e(14),h=e(15),x=e(16),f=e(17),y=e(18),k=e(19),j=e(20),w=e(21),I=e(22),v=e(23),T=e(24),R=e(25),B=e(26),L=e(27),F=e(28),W=e(29),A=e(30);o.default={"@dojo/widgets/accordion-pane":t,"@dojo/widgets/button":i,"@dojo/widgets/calendar":n,"@dojo/widgets/checkbox":r,"@dojo/widgets/combobox":d,"@dojo/widgets/dialog":a,"@dojo/widgets/icon":l,"@dojo/widgets/grid":c,"@dojo/widgets/grid-body":m,"@dojo/widgets/grid-cell":s,"@dojo/widgets/grid-footer":p,"@dojo/widgets/grid-header":u,"@dojo/widgets/grid-placeholder-row":b,"@dojo/widgets/grid-row":g,"@dojo/widgets/label":h,"@dojo/widgets/listbox":x,"@dojo/widgets/progress":f,"@dojo/widgets/radio":y,"@dojo/widgets/select":k,"@dojo/widgets/slide-pane":j,"@dojo/widgets/slider":w,"@dojo/widgets/split-pane":I,"@dojo/widgets/tab-controller":v,"@dojo/widgets/text-area":T,"@dojo/widgets/text-input":R,"@dojo/widgets/enhanced-text-input":B,"@dojo/widgets/time-picker":L,"@dojo/widgets/title-pane":F,"@dojo/widgets/toolbar":W,"@dojo/widgets/tooltip":A}},function(_,o){_.exports={" _key":"@dojo/themes/accordion-pane",root:"accordion-pane-m__root__3ppCW"}},function(_,o){_.exports={" _key":"@dojo/themes/button",root:"button-m__root__1MVuO",addon:"button-m__addon__d0lqb",pressed:"button-m__pressed__sEK8Q",popup:"button-m__popup__itwag",disabled:"button-m__disabled__GWYZh"}},function(_,o){_.exports={" _key":"@dojo/themes/calendar",root:"calendar-m__root__2EiY8",dateGrid:"calendar-m__dateGrid__1QYFL",weekday:"calendar-m__weekday__ec1JA",date:"calendar-m__date__2B1PP",todayDate:"calendar-m__todayDate__3hfl8",inactiveDate:"calendar-m__inactiveDate__2mvSn",selectedDate:"calendar-m__selectedDate__2C9wP",topMatter:"calendar-m__topMatter__1M9iQ",monthTrigger:"calendar-m__monthTrigger__bogJ1",yearTrigger:"calendar-m__yearTrigger__3IHT8",previous:"calendar-m__previous__2FNGk",next:"calendar-m__next__2bXlc",monthTriggerActive:"calendar-m__monthTriggerActive__33Pfs",yearTriggerActive:"calendar-m__yearTriggerActive__1Eg8e",monthGrid:"calendar-m__monthGrid__-1hB1",yearGrid:"calendar-m__yearGrid__3YnyC",monthFields:"calendar-m__monthFields__pBbwV",yearFields:"calendar-m__yearFields__GMX-8",monthRadio:"calendar-m__monthRadio__3Z2Fm",yearRadio:"calendar-m__yearRadio__1XT6o",monthRadioLabel:"calendar-m__monthRadioLabel__3K2Rw",yearRadioLabel:"calendar-m__yearRadioLabel__2Xjap",monthRadioChecked:"calendar-m__monthRadioChecked__2uTbR",yearRadioChecked:"calendar-m__yearRadioChecked__24knw",monthRadioInput:"calendar-m__monthRadioInput__YiMtl",yearRadioInput:"calendar-m__yearRadioInput__KKsoy"}},function(_,o){_.exports={" _key":"@dojo/themes/checkbox",root:"checkbox-m__root__1nHit",input:"checkbox-m__input__2atd0",inputWrapper:"checkbox-m__inputWrapper__1sJil icon-m__checkIcon__2okHr icon-m__icon__26UsN",checked:"checkbox-m__checked__2pIKR",toggle:"checkbox-m__toggle__3dchN",toggleSwitch:"checkbox-m__toggleSwitch__1vHmY",onLabel:"checkbox-m__onLabel__1SHTI",offLabel:"checkbox-m__offLabel__23A6g",focused:"checkbox-m__focused__2XX1u",disabled:"checkbox-m__disabled__5VW5X",readonly:"checkbox-m__readonly__3APS0",invalid:"checkbox-m__invalid__3_sMq",valid:"checkbox-m__valid__3SiEb"}},function(_,o){_.exports={" _key":"@dojo/themes/combobox",root:"combobox-m__root__1p5FL",clearable:"combobox-m__clearable__13m2i",trigger:"combobox-m__trigger__3RU42",dropdown:"combobox-m__dropdown__3S1Dz",open:"combobox-m__open__1_qJ1",option:"combobox-m__option__2TFjT",selected:"combobox-m__selected__2Xij1",invalid:"combobox-m__invalid__2_MAf",valid:"combobox-m__valid__3hYjp",clear:"combobox-m__clear__2_xtS"}},function(_,o){_.exports={" _key":"@dojo/themes/dialog",root:"dialog-m__root__cMla0",main:"dialog-m__main__3KvMB",underlayVisible:"dialog-m__underlayVisible__1Ukhr",title:"dialog-m__title__3ggRI",content:"dialog-m__content__2E80F",close:"dialog-m__close__36aOS"}},function(_,o){_.exports={" _key":"@dojo/themes/icon",icon:"icon-m__icon__26UsN",plusIcon:"icon-m__plusIcon__2wul7",minusIcon:"icon-m__minusIcon__241VU",checkIcon:"icon-m__checkIcon__2okHr",closeIcon:"icon-m__closeIcon__2QBL2",leftIcon:"icon-m__leftIcon__Z8kYy",rightIcon:"icon-m__rightIcon__3nnua",upIcon:"icon-m__upIcon__Vsi9Z",downIcon:"icon-m__downIcon__36OvL",upAltIcon:"icon-m__upAltIcon__1xGTm",downAltIcon:"icon-m__downAltIcon__CSBMv",searchIcon:"icon-m__searchIcon__7sc46",barsIcon:"icon-m__barsIcon__36Ike",settingsIcon:"icon-m__settingsIcon__1uFzr",alertIcon:"icon-m__alertIcon__123PB",helpIcon:"icon-m__helpIcon__3gOZv",infoIcon:"icon-m__infoIcon__27cc7",phoneIcon:"icon-m__phoneIcon__3mVep",editIcon:"icon-m__editIcon__2BoEN",dateIcon:"icon-m__dateIcon__3M-Pw",linkIcon:"icon-m__linkIcon__3cy5K",locationIcon:"icon-m__locationIcon__1Nc3Z",secureIcon:"icon-m__secureIcon__2C8AF",mailIcon:"icon-m__mailIcon__jsfXR"}},function(_,o){_.exports={" _key":"@dojo/themes/grid",root:"grid-m__root__2ocGI",header:"grid-m__header__2N-I-",filterGroup:"grid-m__filterGroup__1D3DO"}},function(_,o){_.exports={" _key":"@dojo/themes/grid-body",root:"grid-body-m__root__tncFe"}},function(_,o){_.exports={" _key":"@dojo/themes/grid-cell",root:"grid-cell-m__root__2Evjv",input:"grid-cell-m__input__2uwqs",edit:"grid-cell-m__edit__3dx8u"}},function(_,o){_.exports={" _key":"@dojo/themes/grid-footer",root:"grid-footer-m__root__3Ivmq"}},function(_,o){_.exports={" _key":"@dojo/themes/grid-header",root:"grid-header-m__root__HIRoQ",cell:"grid-header-m__cell__2KZIg",sortable:"grid-header-m__sortable__2EnYr",sorted:"grid-header-m__sorted__3uwvN",sort:"grid-header-m__sort__2K8Vp",filter:"grid-header-m__filter__1_dPv"}},function(_,o){_.exports={" _key":"@dojo/themes/grid-placeholder-row",root:"grid-placeholder-row-m__root__2yulP grid-row-m__root__mq7NT",loading:"grid-placeholder-row-m__loading__2DRT5",spin:"grid-placeholder-row-m__spin__2IFS-"}},function(_,o){_.exports={" _key":"@dojo/themes/grid-row",root:"grid-row-m__root__mq7NT"}},function(_,o){_.exports={" _key":"@dojo/themes/label",root:"label-m__root__3U-EK",secondary:"label-m__secondary__1B3TI",required:"label-m__required__1Ql4y"}},function(_,o){_.exports={" _key":"@dojo/themes/listbox",root:"listbox-m__root__35ZYA",option:"listbox-m__option__1IV13",focused:"listbox-m__focused__277HP",activeOption:"listbox-m__activeOption__110Hd",disabledOption:"listbox-m__disabledOption__1NTRE",selectedOption:"listbox-m__selectedOption__1xFcI icon-m__checkIcon__2okHr"}},function(_,o){_.exports={" _key":"@dojo/themes/progress",output:"progress-m__output__mxTmH",bar:"progress-m__bar__xZnwN",progress:"progress-m__progress__36k_Y"}},function(_,o){_.exports={" _key":"@dojo/themes/radio",root:"radio-m__root__lsfpz",input:"radio-m__input__2fUTa",inputWrapper:"radio-m__inputWrapper__3MQj6",focused:"radio-m__focused__1obl4",checked:"radio-m__checked__3bCQm",disabled:"radio-m__disabled__152Px",readonly:"radio-m__readonly__3s-00",required:"radio-m__required__1eLln",invalid:"radio-m__invalid__1DOXV",valid:"radio-m__valid__3He1t"}},function(_,o){_.exports={" _key":"@dojo/themes/select",root:"select-m__root__1csaR",inputWrapper:"select-m__inputWrapper__1C3Ty",trigger:"select-m__trigger__XASoe",placeholder:"select-m__placeholder__1PmiY",arrow:"select-m__arrow__1Oo3j",dropdown:"select-m__dropdown__3lTnv",open:"select-m__open__1LojE",input:"select-m__input__3oMSX",disabled:"select-m__disabled__2StD4",readonly:"select-m__readonly__1w_BL",invalid:"select-m__invalid__SXz8o",valid:"select-m__valid__3-SNX"}},function(_,o){_.exports={" _key":"@dojo/themes/slide-pane",root:"slide-pane-m__root__3bzte",underlayVisible:"slide-pane-m__underlayVisible__FvoeL",pane:"slide-pane-m__pane__1-VQ3",content:"slide-pane-m__content__1NhWK",title:"slide-pane-m__title__3MrBR",close:"slide-pane-m__close__2703d",left:"slide-pane-m__left__1pQ7V",right:"slide-pane-m__right__YBXBI",top:"slide-pane-m__top__2b7n6",bottom:"slide-pane-m__bottom__32LMa",slideIn:"slide-pane-m__slideIn__15kN0",slideOut:"slide-pane-m__slideOut__2m1E9",open:"slide-pane-m__open__2vENP"}},function(_,o){_.exports={" _key":"@dojo/themes/slider",root:"slider-m__root__1s4Lq",inputWrapper:"slider-m__inputWrapper__1V41W",track:"slider-m__track__2yZWR",fill:"slider-m__fill__3cD3s",thumb:"slider-m__thumb__2xSHr",input:"slider-m__input__1hGFs",outputTooltip:"slider-m__outputTooltip__2IEFf",output:"slider-m__output__igL5T",vertical:"slider-m__vertical__2k5-2",disabled:"slider-m__disabled__1K1Xr",readonly:"slider-m__readonly__3kr0l",invalid:"slider-m__invalid__1tl5C",valid:"slider-m__valid__21bG6"}},function(_,o){_.exports={" _key":"@dojo/themes/split-pane",root:"split-pane-m__root__2107S",divider:"split-pane-m__divider__12rZl",row:"split-pane-m__row__3lV1p",column:"split-pane-m__column__QieWN"}},function(_,o){_.exports={" _key":"@dojo/themes/tab-controller",root:"tab-controller-m__root__1qieF",tabButtons:"tab-controller-m__tabButtons__1qG3m",tabButton:"tab-controller-m__tabButton__3MeC3",disabledTabButton:"tab-controller-m__disabledTabButton__lbBEm",activeTabButton:"tab-controller-m__activeTabButton__1HTKp",close:"tab-controller-m__close__3lwGk",closeable:"tab-controller-m__closeable__2FIET",tab:"tab-controller-m__tab__3C-05",alignLeft:"tab-controller-m__alignLeft__2FDRK",tabs:"tab-controller-m__tabs__1QBqg",alignRight:"tab-controller-m__alignRight__1nQPg",alignBottom:"tab-controller-m__alignBottom__oSwLT"}},function(_,o){_.exports={" _key":"@dojo/themes/text-area",root:"text-area-m__root__1RyvK",input:"text-area-m__input__SEenV",disabled:"text-area-m__disabled__3te6s",readonly:"text-area-m__readonly__YfAha",invalid:"text-area-m__invalid__2K4Ey",valid:"text-area-m__valid__243za"}},function(_,o){_.exports={" _key":"@dojo/themes/text-input",root:"text-input-m__root__2CiCT",input:"text-input-m__input__3uQih",inputWrapper:"text-input-m__inputWrapper__1itFc",disabled:"text-input-m__disabled__3WR1U",readonly:"text-input-m__readonly__1snDI",invalid:"text-input-m__invalid__3x2Jc",valid:"text-input-m__valid__L-ktw"}},function(_,o){_.exports={" _key":"@dojo/themes/enhanced-text-input",addon:"enhanced-text-input-m__addon__3kE3Z",addonAfter:"enhanced-text-input-m__addonAfter__3ye5V",addonBefore:"enhanced-text-input-m__addonBefore__24wFJ",input:"enhanced-text-input-m__input__2YJ8E text-input-m__input__3uQih",inputWrapper:"enhanced-text-input-m__inputWrapper__2pyw9 text-input-m__inputWrapper__1itFc",focused:"enhanced-text-input-m__focused__1BKuc"}},function(_,o){_.exports={" _key":"@dojo/themes/time-picker",root:"time-picker-m__root__3xa9L",input:"time-picker-m__input__1A6Lz",disabled:"time-picker-m__disabled__21cqk",readonly:"time-picker-m__readonly__3hGaf",invalid:"time-picker-m__invalid__24GU_",valid:"time-picker-m__valid__CIe9R"}},function(_,o){_.exports={" _key":"@dojo/themes/title-pane",root:"title-pane-m__root__2ZFNC",titleButton:"title-pane-m__titleButton__2_brT",content:"title-pane-m__content__3ZnZ7",contentTransition:"title-pane-m__contentTransition__2kjHe",open:"title-pane-m__open__l7DLu",arrow:"title-pane-m__arrow__1DOqd"}},function(_,o){_.exports={" _key":"@dojo/themes/toolbar",root:"toolbar-m__root__2W9AV",title:"toolbar-m__title__2rqmN",menuButton:"toolbar-m__menuButton__3yOG1"}},function(_,o){_.exports={" _key":"@dojo/themes/tooltip",root:"tooltip-m__root__2Tsf4",content:"tooltip-m__content__3JRNB",bottom:"tooltip-m__bottom__3-b-l",top:"tooltip-m__top__1sADL",left:"tooltip-m__left___Ld1s",right:"tooltip-m__right__324h5"}}])});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@dojo/webpack-contrib/build-time-render/hasBuildTimeRender.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable-next-line
var has = __webpack_require__("./node_modules/@dojo/framework/has/has.mjs");
if (!has.exists('build-time-render')) {
    has.add('build-time-render', false, false);
}
//# sourceMappingURL=hasBuildTimeRender.js.map

/***/ }),

/***/ "./node_modules/process/browser.js":
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export __extends */
/* unused harmony export __assign */
/* harmony export (immutable) */ __webpack_exports__["b"] = __rest;
/* harmony export (immutable) */ __webpack_exports__["a"] = __decorate;
/* unused harmony export __param */
/* unused harmony export __metadata */
/* unused harmony export __awaiter */
/* unused harmony export __generator */
/* unused harmony export __exportStar */
/* unused harmony export __values */
/* unused harmony export __read */
/* unused harmony export __spread */
/* unused harmony export __await */
/* unused harmony export __asyncGenerator */
/* unused harmony export __asyncDelegator */
/* unused harmony export __asyncValues */
/* unused harmony export __makeTemplateObject */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
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
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator];
    return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};


/***/ }),

/***/ "./node_modules/web-animations-js/web-animations-next-lite.min.js":
/***/ (function(module, exports) {

// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

!function(a,b){var c={},d={},e={};!function(a,b){function c(a){if("number"==typeof a)return a;var b={};for(var c in a)b[c]=a[c];return b}function d(){this._delay=0,this._endDelay=0,this._fill="none",this._iterationStart=0,this._iterations=1,this._duration=0,this._playbackRate=1,this._direction="normal",this._easing="linear",this._easingFunction=x}function e(){return a.isDeprecated("Invalid timing inputs","2016-03-02","TypeError exceptions will be thrown instead.",!0)}function f(b,c,e){var f=new d;return c&&(f.fill="both",f.duration="auto"),"number"!=typeof b||isNaN(b)?void 0!==b&&Object.getOwnPropertyNames(b).forEach(function(c){if("auto"!=b[c]){if(("number"==typeof f[c]||"duration"==c)&&("number"!=typeof b[c]||isNaN(b[c])))return;if("fill"==c&&-1==v.indexOf(b[c]))return;if("direction"==c&&-1==w.indexOf(b[c]))return;if("playbackRate"==c&&1!==b[c]&&a.isDeprecated("AnimationEffectTiming.playbackRate","2014-11-28","Use Animation.playbackRate instead."))return;f[c]=b[c]}}):f.duration=b,f}function g(a){return"number"==typeof a&&(a=isNaN(a)?{duration:0}:{duration:a}),a}function h(b,c){return b=a.numericTimingToObject(b),f(b,c)}function i(a,b,c,d){return a<0||a>1||c<0||c>1?x:function(e){function f(a,b,c){return 3*a*(1-c)*(1-c)*c+3*b*(1-c)*c*c+c*c*c}if(e<=0){var g=0;return a>0?g=b/a:!b&&c>0&&(g=d/c),g*e}if(e>=1){var h=0;return c<1?h=(d-1)/(c-1):1==c&&a<1&&(h=(b-1)/(a-1)),1+h*(e-1)}for(var i=0,j=1;i<j;){var k=(i+j)/2,l=f(a,c,k);if(Math.abs(e-l)<1e-5)return f(b,d,k);l<e?i=k:j=k}return f(b,d,k)}}function j(a,b){return function(c){if(c>=1)return 1;var d=1/a;return(c+=b*d)-c%d}}function k(a){C||(C=document.createElement("div").style),C.animationTimingFunction="",C.animationTimingFunction=a;var b=C.animationTimingFunction;if(""==b&&e())throw new TypeError(a+" is not a valid value for easing");return b}function l(a){if("linear"==a)return x;var b=E.exec(a);if(b)return i.apply(this,b.slice(1).map(Number));var c=F.exec(a);return c?j(Number(c[1]),{start:y,middle:z,end:A}[c[2]]):B[a]||x}function m(a){return Math.abs(n(a)/a.playbackRate)}function n(a){return 0===a.duration||0===a.iterations?0:a.duration*a.iterations}function o(a,b,c){if(null==b)return G;var d=c.delay+a+c.endDelay;return b<Math.min(c.delay,d)?H:b>=Math.min(c.delay+a,d)?I:J}function p(a,b,c,d,e){switch(d){case H:return"backwards"==b||"both"==b?0:null;case J:return c-e;case I:return"forwards"==b||"both"==b?a:null;case G:return null}}function q(a,b,c,d,e){var f=e;return 0===a?b!==H&&(f+=c):f+=d/a,f}function r(a,b,c,d,e,f){var g=a===1/0?b%1:a%1;return 0!==g||c!==I||0===d||0===e&&0!==f||(g=1),g}function s(a,b,c,d){return a===I&&b===1/0?1/0:1===c?Math.floor(d)-1:Math.floor(d)}function t(a,b,c){var d=a;if("normal"!==a&&"reverse"!==a){var e=b;"alternate-reverse"===a&&(e+=1),d="normal",e!==1/0&&e%2!=0&&(d="reverse")}return"normal"===d?c:1-c}function u(a,b,c){var d=o(a,b,c),e=p(a,c.fill,b,d,c.delay);if(null===e)return null;var f=q(c.duration,d,c.iterations,e,c.iterationStart),g=r(f,c.iterationStart,d,c.iterations,e,c.duration),h=s(d,c.iterations,g,f),i=t(c.direction,h,g);return c._easingFunction(i)}var v="backwards|forwards|both|none".split("|"),w="reverse|alternate|alternate-reverse".split("|"),x=function(a){return a};d.prototype={_setMember:function(b,c){this["_"+b]=c,this._effect&&(this._effect._timingInput[b]=c,this._effect._timing=a.normalizeTimingInput(this._effect._timingInput),this._effect.activeDuration=a.calculateActiveDuration(this._effect._timing),this._effect._animation&&this._effect._animation._rebuildUnderlyingAnimation())},get playbackRate(){return this._playbackRate},set delay(a){this._setMember("delay",a)},get delay(){return this._delay},set endDelay(a){this._setMember("endDelay",a)},get endDelay(){return this._endDelay},set fill(a){this._setMember("fill",a)},get fill(){return this._fill},set iterationStart(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterationStart must be a non-negative number, received: "+timing.iterationStart);this._setMember("iterationStart",a)},get iterationStart(){return this._iterationStart},set duration(a){if("auto"!=a&&(isNaN(a)||a<0)&&e())throw new TypeError("duration must be non-negative or auto, received: "+a);this._setMember("duration",a)},get duration(){return this._duration},set direction(a){this._setMember("direction",a)},get direction(){return this._direction},set easing(a){this._easingFunction=l(k(a)),this._setMember("easing",a)},get easing(){return this._easing},set iterations(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterations must be non-negative, received: "+a);this._setMember("iterations",a)},get iterations(){return this._iterations}};var y=1,z=.5,A=0,B={ease:i(.25,.1,.25,1),"ease-in":i(.42,0,1,1),"ease-out":i(0,0,.58,1),"ease-in-out":i(.42,0,.58,1),"step-start":j(1,y),"step-middle":j(1,z),"step-end":j(1,A)},C=null,D="\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*",E=new RegExp("cubic-bezier\\("+D+","+D+","+D+","+D+"\\)"),F=/steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/,G=0,H=1,I=2,J=3;a.cloneTimingInput=c,a.makeTiming=f,a.numericTimingToObject=g,a.normalizeTimingInput=h,a.calculateActiveDuration=m,a.calculateIterationProgress=u,a.calculatePhase=o,a.normalizeEasing=k,a.parseEasingFunction=l}(c),function(a,b){function c(a,b){return a in k?k[a][b]||b:b}function d(a){return"display"===a||0===a.lastIndexOf("animation",0)||0===a.lastIndexOf("transition",0)}function e(a,b,e){if(!d(a)){var f=h[a];if(f){i.style[a]=b;for(var g in f){var j=f[g],k=i.style[j];e[j]=c(j,k)}}else e[a]=c(a,b)}}function f(a){var b=[];for(var c in a)if(!(c in["easing","offset","composite"])){var d=a[c];Array.isArray(d)||(d=[d]);for(var e,f=d.length,g=0;g<f;g++)e={},e.offset="offset"in a?a.offset:1==f?1:g/(f-1),"easing"in a&&(e.easing=a.easing),"composite"in a&&(e.composite=a.composite),e[c]=d[g],b.push(e)}return b.sort(function(a,b){return a.offset-b.offset}),b}function g(b){function c(){var a=d.length;null==d[a-1].offset&&(d[a-1].offset=1),a>1&&null==d[0].offset&&(d[0].offset=0);for(var b=0,c=d[0].offset,e=1;e<a;e++){var f=d[e].offset;if(null!=f){for(var g=1;g<e-b;g++)d[b+g].offset=c+(f-c)*g/(e-b);b=e,c=f}}}if(null==b)return[];window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||(b=f(b));for(var d=b.map(function(b){var c={};for(var d in b){var f=b[d];if("offset"==d){if(null!=f){if(f=Number(f),!isFinite(f))throw new TypeError("Keyframe offsets must be numbers.");if(f<0||f>1)throw new TypeError("Keyframe offsets must be between 0 and 1.")}}else if("composite"==d){if("add"==f||"accumulate"==f)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"add compositing is not supported"};if("replace"!=f)throw new TypeError("Invalid composite mode "+f+".")}else f="easing"==d?a.normalizeEasing(f):""+f;e(d,f,c)}return void 0==c.offset&&(c.offset=null),void 0==c.easing&&(c.easing="linear"),c}),g=!0,h=-1/0,i=0;i<d.length;i++){var j=d[i].offset;if(null!=j){if(j<h)throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");h=j}else g=!1}return d=d.filter(function(a){return a.offset>=0&&a.offset<=1}),g||c(),d}var h={background:["backgroundImage","backgroundPosition","backgroundSize","backgroundRepeat","backgroundAttachment","backgroundOrigin","backgroundClip","backgroundColor"],border:["borderTopColor","borderTopStyle","borderTopWidth","borderRightColor","borderRightStyle","borderRightWidth","borderBottomColor","borderBottomStyle","borderBottomWidth","borderLeftColor","borderLeftStyle","borderLeftWidth"],borderBottom:["borderBottomWidth","borderBottomStyle","borderBottomColor"],borderColor:["borderTopColor","borderRightColor","borderBottomColor","borderLeftColor"],borderLeft:["borderLeftWidth","borderLeftStyle","borderLeftColor"],borderRadius:["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],borderRight:["borderRightWidth","borderRightStyle","borderRightColor"],borderTop:["borderTopWidth","borderTopStyle","borderTopColor"],borderWidth:["borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"],flex:["flexGrow","flexShrink","flexBasis"],font:["fontFamily","fontSize","fontStyle","fontVariant","fontWeight","lineHeight"],margin:["marginTop","marginRight","marginBottom","marginLeft"],outline:["outlineColor","outlineStyle","outlineWidth"],padding:["paddingTop","paddingRight","paddingBottom","paddingLeft"]},i=document.createElementNS("http://www.w3.org/1999/xhtml","div"),j={thin:"1px",medium:"3px",thick:"5px"},k={borderBottomWidth:j,borderLeftWidth:j,borderRightWidth:j,borderTopWidth:j,fontSize:{"xx-small":"60%","x-small":"75%",small:"89%",medium:"100%",large:"120%","x-large":"150%","xx-large":"200%"},fontWeight:{normal:"400",bold:"700"},outlineWidth:j,textShadow:{none:"0px 0px 0px transparent"},boxShadow:{none:"0px 0px 0px 0px transparent"}};a.convertToArrayForm=f,a.normalizeKeyframes=g}(c),function(a){var b={};a.isDeprecated=function(a,c,d,e){var f=e?"are":"is",g=new Date,h=new Date(c);return h.setMonth(h.getMonth()+3),!(g<h&&(a in b||console.warn("Web Animations: "+a+" "+f+" deprecated and will stop working on "+h.toDateString()+". "+d),b[a]=!0,1))},a.deprecated=function(b,c,d,e){var f=e?"are":"is";if(a.isDeprecated(b,c,d,e))throw new Error(b+" "+f+" no longer supported. "+d)}}(c),function(){if(document.documentElement.animate){var a=document.documentElement.animate([],0),b=!0;if(a&&(b=!1,"play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState".split("|").forEach(function(c){void 0===a[c]&&(b=!0)})),!b)return}!function(a,b,c){function d(a){for(var b={},c=0;c<a.length;c++)for(var d in a[c])if("offset"!=d&&"easing"!=d&&"composite"!=d){var e={offset:a[c].offset,easing:a[c].easing,value:a[c][d]};b[d]=b[d]||[],b[d].push(e)}for(var f in b){var g=b[f];if(0!=g[0].offset||1!=g[g.length-1].offset)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"Partial keyframes are not supported"}}return b}function e(c){var d=[];for(var e in c)for(var f=c[e],g=0;g<f.length-1;g++){var h=g,i=g+1,j=f[h].offset,k=f[i].offset,l=j,m=k;0==g&&(l=-1/0,0==k&&(i=h)),g==f.length-2&&(m=1/0,1==j&&(h=i)),d.push({applyFrom:l,applyTo:m,startOffset:f[h].offset,endOffset:f[i].offset,easingFunction:a.parseEasingFunction(f[h].easing),property:e,interpolation:b.propertyInterpolation(e,f[h].value,f[i].value)})}return d.sort(function(a,b){return a.startOffset-b.startOffset}),d}b.convertEffectInput=function(c){var f=a.normalizeKeyframes(c),g=d(f),h=e(g);return function(a,c){if(null!=c)h.filter(function(a){return c>=a.applyFrom&&c<a.applyTo}).forEach(function(d){var e=c-d.startOffset,f=d.endOffset-d.startOffset,g=0==f?0:d.easingFunction(e/f);b.apply(a,d.property,d.interpolation(g))});else for(var d in g)"offset"!=d&&"easing"!=d&&"composite"!=d&&b.clear(a,d)}}}(c,d),function(a,b,c){function d(a){return a.replace(/-(.)/g,function(a,b){return b.toUpperCase()})}function e(a,b,c){h[c]=h[c]||[],h[c].push([a,b])}function f(a,b,c){for(var f=0;f<c.length;f++){e(a,b,d(c[f]))}}function g(c,e,f){var g=c;/-/.test(c)&&!a.isDeprecated("Hyphenated property names","2016-03-22","Use camelCase instead.",!0)&&(g=d(c)),"initial"!=e&&"initial"!=f||("initial"==e&&(e=i[g]),"initial"==f&&(f=i[g]));for(var j=e==f?[]:h[g],k=0;j&&k<j.length;k++){var l=j[k][0](e),m=j[k][0](f);if(void 0!==l&&void 0!==m){var n=j[k][1](l,m);if(n){var o=b.Interpolation.apply(null,n);return function(a){return 0==a?e:1==a?f:o(a)}}}}return b.Interpolation(!1,!0,function(a){return a?f:e})}var h={};b.addPropertiesHandler=f;var i={backgroundColor:"transparent",backgroundPosition:"0% 0%",borderBottomColor:"currentColor",borderBottomLeftRadius:"0px",borderBottomRightRadius:"0px",borderBottomWidth:"3px",borderLeftColor:"currentColor",borderLeftWidth:"3px",borderRightColor:"currentColor",borderRightWidth:"3px",borderSpacing:"2px",borderTopColor:"currentColor",borderTopLeftRadius:"0px",borderTopRightRadius:"0px",borderTopWidth:"3px",bottom:"auto",clip:"rect(0px, 0px, 0px, 0px)",color:"black",fontSize:"100%",fontWeight:"400",height:"auto",left:"auto",letterSpacing:"normal",lineHeight:"120%",marginBottom:"0px",marginLeft:"0px",marginRight:"0px",marginTop:"0px",maxHeight:"none",maxWidth:"none",minHeight:"0px",minWidth:"0px",opacity:"1.0",outlineColor:"invert",outlineOffset:"0px",outlineWidth:"3px",paddingBottom:"0px",paddingLeft:"0px",paddingRight:"0px",paddingTop:"0px",right:"auto",strokeDasharray:"none",strokeDashoffset:"0px",textIndent:"0px",textShadow:"0px 0px 0px transparent",top:"auto",transform:"",verticalAlign:"0px",visibility:"visible",width:"auto",wordSpacing:"normal",zIndex:"auto"};b.propertyInterpolation=g}(c,d),function(a,b,c){function d(b){var c=a.calculateActiveDuration(b),d=function(d){return a.calculateIterationProgress(c,d,b)};return d._totalDuration=b.delay+c+b.endDelay,d}b.KeyframeEffect=function(c,e,f,g){var h,i=d(a.normalizeTimingInput(f)),j=b.convertEffectInput(e),k=function(){j(c,h)};return k._update=function(a){return null!==(h=i(a))},k._clear=function(){j(c,null)},k._hasSameTarget=function(a){return c===a},k._target=c,k._totalDuration=i._totalDuration,k._id=g,k}}(c,d),function(a,b){a.apply=function(b,c,d){b.style[a.propertyName(c)]=d},a.clear=function(b,c){b.style[a.propertyName(c)]=""}}(d),function(a){window.Element.prototype.animate=function(b,c){var d="";return c&&c.id&&(d=c.id),a.timeline._play(a.KeyframeEffect(this,b,c,d))}}(d),function(a,b){function c(a,b,d){if("number"==typeof a&&"number"==typeof b)return a*(1-d)+b*d;if("boolean"==typeof a&&"boolean"==typeof b)return d<.5?a:b;if(a.length==b.length){for(var e=[],f=0;f<a.length;f++)e.push(c(a[f],b[f],d));return e}throw"Mismatched interpolation arguments "+a+":"+b}a.Interpolation=function(a,b,d){return function(e){return d(c(a,b,e))}}}(d),function(a,b,c){a.sequenceNumber=0;var d=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="finish",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()};b.Animation=function(b){this.id="",b&&b._id&&(this.id=b._id),this._sequenceNumber=a.sequenceNumber++,this._currentTime=0,this._startTime=null,this._paused=!1,this._playbackRate=1,this._inTimeline=!0,this._finishedFlag=!0,this.onfinish=null,this._finishHandlers=[],this._effect=b,this._inEffect=this._effect._update(0),this._idle=!0,this._currentTimePending=!1},b.Animation.prototype={_ensureAlive:function(){this.playbackRate<0&&0===this.currentTime?this._inEffect=this._effect._update(-1):this._inEffect=this._effect._update(this.currentTime),this._inTimeline||!this._inEffect&&this._finishedFlag||(this._inTimeline=!0,b.timeline._animations.push(this))},_tickCurrentTime:function(a,b){a!=this._currentTime&&(this._currentTime=a,this._isFinished&&!b&&(this._currentTime=this._playbackRate>0?this._totalDuration:0),this._ensureAlive())},get currentTime(){return this._idle||this._currentTimePending?null:this._currentTime},set currentTime(a){a=+a,isNaN(a)||(b.restart(),this._paused||null==this._startTime||(this._startTime=this._timeline.currentTime-a/this._playbackRate),this._currentTimePending=!1,this._currentTime!=a&&(this._idle&&(this._idle=!1,this._paused=!0),this._tickCurrentTime(a,!0),b.applyDirtiedAnimation(this)))},get startTime(){return this._startTime},set startTime(a){a=+a,isNaN(a)||this._paused||this._idle||(this._startTime=a,this._tickCurrentTime((this._timeline.currentTime-this._startTime)*this.playbackRate),b.applyDirtiedAnimation(this))},get playbackRate(){return this._playbackRate},set playbackRate(a){if(a!=this._playbackRate){var c=this.currentTime;this._playbackRate=a,this._startTime=null,"paused"!=this.playState&&"idle"!=this.playState&&(this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)),null!=c&&(this.currentTime=c)}},get _isFinished(){return!this._idle&&(this._playbackRate>0&&this._currentTime>=this._totalDuration||this._playbackRate<0&&this._currentTime<=0)},get _totalDuration(){return this._effect._totalDuration},get playState(){return this._idle?"idle":null==this._startTime&&!this._paused&&0!=this.playbackRate||this._currentTimePending?"pending":this._paused?"paused":this._isFinished?"finished":"running"},_rewind:function(){if(this._playbackRate>=0)this._currentTime=0;else{if(!(this._totalDuration<1/0))throw new DOMException("Unable to rewind negative playback rate animation with infinite duration","InvalidStateError");this._currentTime=this._totalDuration}},play:function(){this._paused=!1,(this._isFinished||this._idle)&&(this._rewind(),this._startTime=null),this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)},pause:function(){this._isFinished||this._paused||this._idle?this._idle&&(this._rewind(),this._idle=!1):this._currentTimePending=!0,this._startTime=null,this._paused=!0},finish:function(){this._idle||(this.currentTime=this._playbackRate>0?this._totalDuration:0,this._startTime=this._totalDuration-this.currentTime,this._currentTimePending=!1,b.applyDirtiedAnimation(this))},cancel:function(){this._inEffect&&(this._inEffect=!1,this._idle=!0,this._paused=!1,this._isFinished=!0,this._finishedFlag=!0,this._currentTime=0,this._startTime=null,this._effect._update(null),b.applyDirtiedAnimation(this))},reverse:function(){this.playbackRate*=-1,this.play()},addEventListener:function(a,b){"function"==typeof b&&"finish"==a&&this._finishHandlers.push(b)},removeEventListener:function(a,b){if("finish"==a){var c=this._finishHandlers.indexOf(b);c>=0&&this._finishHandlers.splice(c,1)}},_fireEvents:function(a){if(this._isFinished){if(!this._finishedFlag){var b=new d(this,this._currentTime,a),c=this._finishHandlers.concat(this.onfinish?[this.onfinish]:[]);setTimeout(function(){c.forEach(function(a){a.call(b.target,b)})},0),this._finishedFlag=!0}}else this._finishedFlag=!1},_tick:function(a,b){this._idle||this._paused||(null==this._startTime?b&&(this.startTime=a-this._currentTime/this.playbackRate):this._isFinished||this._tickCurrentTime((a-this._startTime)*this.playbackRate)),b&&(this._currentTimePending=!1,this._fireEvents(a))},get _needsTick(){return this.playState in{pending:1,running:1}||!this._finishedFlag},_targetAnimations:function(){var a=this._effect._target;return a._activeAnimations||(a._activeAnimations=[]),a._activeAnimations},_markTarget:function(){var a=this._targetAnimations();-1===a.indexOf(this)&&a.push(this)},_unmarkTarget:function(){var a=this._targetAnimations(),b=a.indexOf(this);-1!==b&&a.splice(b,1)}}}(c,d),function(a,b,c){function d(a){var b=j;j=[],a<q.currentTime&&(a=q.currentTime),q._animations.sort(e),q._animations=h(a,!0,q._animations)[0],b.forEach(function(b){b[1](a)}),g(),l=void 0}function e(a,b){return a._sequenceNumber-b._sequenceNumber}function f(){this._animations=[],this.currentTime=window.performance&&performance.now?performance.now():0}function g(){o.forEach(function(a){a()}),o.length=0}function h(a,c,d){p=!0,n=!1,b.timeline.currentTime=a,m=!1;var e=[],f=[],g=[],h=[];return d.forEach(function(b){b._tick(a,c),b._inEffect?(f.push(b._effect),b._markTarget()):(e.push(b._effect),b._unmarkTarget()),b._needsTick&&(m=!0);var d=b._inEffect||b._needsTick;b._inTimeline=d,d?g.push(b):h.push(b)}),o.push.apply(o,e),o.push.apply(o,f),m&&requestAnimationFrame(function(){}),p=!1,[g,h]}var i=window.requestAnimationFrame,j=[],k=0;window.requestAnimationFrame=function(a){var b=k++;return 0==j.length&&i(d),j.push([b,a]),b},window.cancelAnimationFrame=function(a){j.forEach(function(b){b[0]==a&&(b[1]=function(){})})},f.prototype={_play:function(c){c._timing=a.normalizeTimingInput(c.timing);var d=new b.Animation(c);return d._idle=!1,d._timeline=this,this._animations.push(d),b.restart(),b.applyDirtiedAnimation(d),d}};var l=void 0,m=!1,n=!1;b.restart=function(){return m||(m=!0,requestAnimationFrame(function(){}),n=!0),n},b.applyDirtiedAnimation=function(a){if(!p){a._markTarget();var c=a._targetAnimations();c.sort(e),h(b.timeline.currentTime,!1,c.slice())[1].forEach(function(a){var b=q._animations.indexOf(a);-1!==b&&q._animations.splice(b,1)}),g()}};var o=[],p=!1,q=new f;b.timeline=q}(c,d),function(a){function b(a,b){var c=a.exec(b);if(c)return c=a.ignoreCase?c[0].toLowerCase():c[0],[c,b.substr(c.length)]}function c(a,b){b=b.replace(/^\s*/,"");var c=a(b);if(c)return[c[0],c[1].replace(/^\s*/,"")]}function d(a,d,e){a=c.bind(null,a);for(var f=[];;){var g=a(e);if(!g)return[f,e];if(f.push(g[0]),e=g[1],!(g=b(d,e))||""==g[1])return[f,e];e=g[1]}}function e(a,b){for(var c=0,d=0;d<b.length&&(!/\s|,/.test(b[d])||0!=c);d++)if("("==b[d])c++;else if(")"==b[d]&&(c--,0==c&&d++,c<=0))break;var e=a(b.substr(0,d));return void 0==e?void 0:[e,b.substr(d)]}function f(a,b){for(var c=a,d=b;c&&d;)c>d?c%=d:d%=c;return c=a*b/(c+d)}function g(a){return function(b){var c=a(b);return c&&(c[0]=void 0),c}}function h(a,b){return function(c){return a(c)||[b,c]}}function i(b,c){for(var d=[],e=0;e<b.length;e++){var f=a.consumeTrimmed(b[e],c);if(!f||""==f[0])return;void 0!==f[0]&&d.push(f[0]),c=f[1]}if(""==c)return d}function j(a,b,c,d,e){for(var g=[],h=[],i=[],j=f(d.length,e.length),k=0;k<j;k++){var l=b(d[k%d.length],e[k%e.length]);if(!l)return;g.push(l[0]),h.push(l[1]),i.push(l[2])}return[g,h,function(b){var d=b.map(function(a,b){return i[b](a)}).join(c);return a?a(d):d}]}function k(a,b,c){for(var d=[],e=[],f=[],g=0,h=0;h<c.length;h++)if("function"==typeof c[h]){var i=c[h](a[g],b[g++]);d.push(i[0]),e.push(i[1]),f.push(i[2])}else!function(a){d.push(!1),e.push(!1),f.push(function(){return c[a]})}(h);return[d,e,function(a){for(var b="",c=0;c<a.length;c++)b+=f[c](a[c]);return b}]}a.consumeToken=b,a.consumeTrimmed=c,a.consumeRepeated=d,a.consumeParenthesised=e,a.ignore=g,a.optional=h,a.consumeList=i,a.mergeNestedRepeated=j.bind(null,null),a.mergeWrappedNestedRepeated=j,a.mergeList=k}(d),function(a){function b(b){function c(b){var c=a.consumeToken(/^inset/i,b);if(c)return d.inset=!0,c;var c=a.consumeLengthOrPercent(b);if(c)return d.lengths.push(c[0]),c;var c=a.consumeColor(b);return c?(d.color=c[0],c):void 0}var d={inset:!1,lengths:[],color:null},e=a.consumeRepeated(c,/^/,b);if(e&&e[0].length)return[d,e[1]]}function c(c){var d=a.consumeRepeated(b,/^,/,c);if(d&&""==d[1])return d[0]}function d(b,c){for(;b.lengths.length<Math.max(b.lengths.length,c.lengths.length);)b.lengths.push({px:0});for(;c.lengths.length<Math.max(b.lengths.length,c.lengths.length);)c.lengths.push({px:0});if(b.inset==c.inset&&!!b.color==!!c.color){for(var d,e=[],f=[[],0],g=[[],0],h=0;h<b.lengths.length;h++){var i=a.mergeDimensions(b.lengths[h],c.lengths[h],2==h);f[0].push(i[0]),g[0].push(i[1]),e.push(i[2])}if(b.color&&c.color){var j=a.mergeColors(b.color,c.color);f[1]=j[0],g[1]=j[1],d=j[2]}return[f,g,function(a){for(var c=b.inset?"inset ":" ",f=0;f<e.length;f++)c+=e[f](a[0][f])+" ";return d&&(c+=d(a[1])),c}]}}function e(b,c,d,e){function f(a){return{inset:a,color:[0,0,0,0],lengths:[{px:0},{px:0},{px:0},{px:0}]}}for(var g=[],h=[],i=0;i<d.length||i<e.length;i++){var j=d[i]||f(e[i].inset),k=e[i]||f(d[i].inset);g.push(j),h.push(k)}return a.mergeNestedRepeated(b,c,g,h)}var f=e.bind(null,d,", ");a.addPropertiesHandler(c,f,["box-shadow","text-shadow"])}(d),function(a,b){function c(a){return a.toFixed(3).replace(/0+$/,"").replace(/\.$/,"")}function d(a,b,c){return Math.min(b,Math.max(a,c))}function e(a){if(/^\s*[-+]?(\d*\.)?\d+\s*$/.test(a))return Number(a)}function f(a,b){return[a,b,c]}function g(a,b){if(0!=a)return i(0,1/0)(a,b)}function h(a,b){return[a,b,function(a){return Math.round(d(1,1/0,a))}]}function i(a,b){return function(e,f){return[e,f,function(e){return c(d(a,b,e))}]}}function j(a){var b=a.trim().split(/\s*[\s,]\s*/);if(0!==b.length){for(var c=[],d=0;d<b.length;d++){var f=e(b[d]);if(void 0===f)return;c.push(f)}return c}}function k(a,b){if(a.length==b.length)return[a,b,function(a){return a.map(c).join(" ")}]}function l(a,b){return[a,b,Math.round]}a.clamp=d,a.addPropertiesHandler(j,k,["stroke-dasharray"]),a.addPropertiesHandler(e,i(0,1/0),["border-image-width","line-height"]),a.addPropertiesHandler(e,i(0,1),["opacity","shape-image-threshold"]),a.addPropertiesHandler(e,g,["flex-grow","flex-shrink"]),a.addPropertiesHandler(e,h,["orphans","widows"]),a.addPropertiesHandler(e,l,["z-index"]),a.parseNumber=e,a.parseNumberList=j,a.mergeNumbers=f,a.numberToString=c}(d),function(a,b){function c(a,b){if("visible"==a||"visible"==b)return[0,1,function(c){return c<=0?a:c>=1?b:"visible"}]}a.addPropertiesHandler(String,c,["visibility"])}(d),function(a,b){function c(a){a=a.trim(),f.fillStyle="#000",f.fillStyle=a;var b=f.fillStyle;if(f.fillStyle="#fff",f.fillStyle=a,b==f.fillStyle){f.fillRect(0,0,1,1);var c=f.getImageData(0,0,1,1).data;f.clearRect(0,0,1,1);var d=c[3]/255;return[c[0]*d,c[1]*d,c[2]*d,d]}}function d(b,c){return[b,c,function(b){function c(a){return Math.max(0,Math.min(255,a))}if(b[3])for(var d=0;d<3;d++)b[d]=Math.round(c(b[d]/b[3]));return b[3]=a.numberToString(a.clamp(0,1,b[3])),"rgba("+b.join(",")+")"}]}var e=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");e.width=e.height=1;var f=e.getContext("2d");a.addPropertiesHandler(c,d,["background-color","border-bottom-color","border-left-color","border-right-color","border-top-color","color","fill","flood-color","lighting-color","outline-color","stop-color","stroke","text-decoration-color"]),a.consumeColor=a.consumeParenthesised.bind(null,c),a.mergeColors=d}(d),function(a,b){function c(a){function b(){var b=h.exec(a);g=b?b[0]:void 0}function c(){var a=Number(g);return b(),a}function d(){if("("!==g)return c();b();var a=f();return")"!==g?NaN:(b(),a)}function e(){for(var a=d();"*"===g||"/"===g;){var c=g;b();var e=d();"*"===c?a*=e:a/=e}return a}function f(){for(var a=e();"+"===g||"-"===g;){var c=g;b();var d=e();"+"===c?a+=d:a-=d}return a}var g,h=/([\+\-\w\.]+|[\(\)\*\/])/g;return b(),f()}function d(a,b){if("0"==(b=b.trim().toLowerCase())&&"px".search(a)>=0)return{px:0};if(/^[^(]*$|^calc/.test(b)){b=b.replace(/calc\(/g,"(");var d={};b=b.replace(a,function(a){return d[a]=null,"U"+a});for(var e="U("+a.source+")",f=b.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g,"N").replace(new RegExp("N"+e,"g"),"D").replace(/\s[+-]\s/g,"O").replace(/\s/g,""),g=[/N\*(D)/g,/(N|D)[*\/]N/g,/(N|D)O\1/g,/\((N|D)\)/g],h=0;h<g.length;)g[h].test(f)?(f=f.replace(g[h],"$1"),h=0):h++;if("D"==f){for(var i in d){var j=c(b.replace(new RegExp("U"+i,"g"),"").replace(new RegExp(e,"g"),"*0"));if(!isFinite(j))return;d[i]=j}return d}}}function e(a,b){return f(a,b,!0)}function f(b,c,d){var e,f=[];for(e in b)f.push(e);for(e in c)f.indexOf(e)<0&&f.push(e);return b=f.map(function(a){return b[a]||0}),c=f.map(function(a){return c[a]||0}),[b,c,function(b){var c=b.map(function(c,e){return 1==b.length&&d&&(c=Math.max(c,0)),a.numberToString(c)+f[e]}).join(" + ");return b.length>1?"calc("+c+")":c}]}var g="px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc",h=d.bind(null,new RegExp(g,"g")),i=d.bind(null,new RegExp(g+"|%","g")),j=d.bind(null,/deg|rad|grad|turn/g);a.parseLength=h,a.parseLengthOrPercent=i,a.consumeLengthOrPercent=a.consumeParenthesised.bind(null,i),a.parseAngle=j,a.mergeDimensions=f;var k=a.consumeParenthesised.bind(null,h),l=a.consumeRepeated.bind(void 0,k,/^/),m=a.consumeRepeated.bind(void 0,l,/^,/);a.consumeSizePairList=m;var n=function(a){var b=m(a);if(b&&""==b[1])return b[0]},o=a.mergeNestedRepeated.bind(void 0,e," "),p=a.mergeNestedRepeated.bind(void 0,o,",");a.mergeNonNegativeSizePair=o,a.addPropertiesHandler(n,p,["background-size"]),a.addPropertiesHandler(i,e,["border-bottom-width","border-image-width","border-left-width","border-right-width","border-top-width","flex-basis","font-size","height","line-height","max-height","max-width","outline-width","width"]),a.addPropertiesHandler(i,f,["border-bottom-left-radius","border-bottom-right-radius","border-top-left-radius","border-top-right-radius","bottom","left","letter-spacing","margin-bottom","margin-left","margin-right","margin-top","min-height","min-width","outline-offset","padding-bottom","padding-left","padding-right","padding-top","perspective","right","shape-margin","stroke-dashoffset","text-indent","top","vertical-align","word-spacing"])}(d),function(a,b){function c(b){return a.consumeLengthOrPercent(b)||a.consumeToken(/^auto/,b)}function d(b){var d=a.consumeList([a.ignore(a.consumeToken.bind(null,/^rect/)),a.ignore(a.consumeToken.bind(null,/^\(/)),a.consumeRepeated.bind(null,c,/^,/),a.ignore(a.consumeToken.bind(null,/^\)/))],b);if(d&&4==d[0].length)return d[0]}function e(b,c){return"auto"==b||"auto"==c?[!0,!1,function(d){var e=d?b:c;if("auto"==e)return"auto";var f=a.mergeDimensions(e,e);return f[2](f[0])}]:a.mergeDimensions(b,c)}function f(a){return"rect("+a+")"}var g=a.mergeWrappedNestedRepeated.bind(null,f,e,", ");a.parseBox=d,a.mergeBoxes=g,a.addPropertiesHandler(d,g,["clip"])}(d),function(a,b){function c(a){return function(b){var c=0;return a.map(function(a){return a===k?b[c++]:a})}}function d(a){return a}function e(b){if("none"==(b=b.toLowerCase().trim()))return[];for(var c,d=/\s*(\w+)\(([^)]*)\)/g,e=[],f=0;c=d.exec(b);){if(c.index!=f)return;f=c.index+c[0].length;var g=c[1],h=n[g];if(!h)return;var i=c[2].split(","),j=h[0];if(j.length<i.length)return;for(var k=[],o=0;o<j.length;o++){var p,q=i[o],r=j[o];if(void 0===(p=q?{A:function(b){return"0"==b.trim()?m:a.parseAngle(b)},N:a.parseNumber,T:a.parseLengthOrPercent,L:a.parseLength}[r.toUpperCase()](q):{a:m,n:k[0],t:l}[r]))return;k.push(p)}if(e.push({t:g,d:k}),d.lastIndex==b.length)return e}}function f(a){return a.toFixed(6).replace(".000000","")}function g(b,c){if(b.decompositionPair!==c){b.decompositionPair=c;var d=a.makeMatrixDecomposition(b)}if(c.decompositionPair!==b){c.decompositionPair=b;var e=a.makeMatrixDecomposition(c)}return null==d[0]||null==e[0]?[[!1],[!0],function(a){return a?c[0].d:b[0].d}]:(d[0].push(0),e[0].push(1),[d,e,function(b){var c=a.quat(d[0][3],e[0][3],b[5]);return a.composeMatrix(b[0],b[1],b[2],c,b[4]).map(f).join(",")}])}function h(a){return a.replace(/[xy]/,"")}function i(a){return a.replace(/(x|y|z|3d)?$/,"3d")}function j(b,c){var d=a.makeMatrixDecomposition&&!0,e=!1;if(!b.length||!c.length){b.length||(e=!0,b=c,c=[]);for(var f=0;f<b.length;f++){var j=b[f].t,k=b[f].d,l="scale"==j.substr(0,5)?1:0;c.push({t:j,d:k.map(function(a){if("number"==typeof a)return l;var b={};for(var c in a)b[c]=l;return b})})}}var m=function(a,b){return"perspective"==a&&"perspective"==b||("matrix"==a||"matrix3d"==a)&&("matrix"==b||"matrix3d"==b)},o=[],p=[],q=[];if(b.length!=c.length){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]]}else for(var f=0;f<b.length;f++){var j,s=b[f].t,t=c[f].t,u=b[f].d,v=c[f].d,w=n[s],x=n[t];if(m(s,t)){if(!d)return;var r=g([b[f]],[c[f]]);o.push(r[0]),p.push(r[1]),q.push(["matrix",[r[2]]])}else{if(s==t)j=s;else if(w[2]&&x[2]&&h(s)==h(t))j=h(s),u=w[2](u),v=x[2](v);else{if(!w[1]||!x[1]||i(s)!=i(t)){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]];break}j=i(s),u=w[1](u),v=x[1](v)}for(var y=[],z=[],A=[],B=0;B<u.length;B++){var C="number"==typeof u[B]?a.mergeNumbers:a.mergeDimensions,r=C(u[B],v[B]);y[B]=r[0],z[B]=r[1],A.push(r[2])}o.push(y),p.push(z),q.push([j,A])}}if(e){var D=o;o=p,p=D}return[o,p,function(a){return a.map(function(a,b){var c=a.map(function(a,c){return q[b][1][c](a)}).join(",");return"matrix"==q[b][0]&&16==c.split(",").length&&(q[b][0]="matrix3d"),q[b][0]+"("+c+")"}).join(" ")}]}var k=null,l={px:0},m={deg:0},n={matrix:["NNNNNN",[k,k,0,0,k,k,0,0,0,0,1,0,k,k,0,1],d],matrix3d:["NNNNNNNNNNNNNNNN",d],rotate:["A"],rotatex:["A"],rotatey:["A"],rotatez:["A"],rotate3d:["NNNA"],perspective:["L"],scale:["Nn",c([k,k,1]),d],scalex:["N",c([k,1,1]),c([k,1])],scaley:["N",c([1,k,1]),c([1,k])],scalez:["N",c([1,1,k])],scale3d:["NNN",d],skew:["Aa",null,d],skewx:["A",null,c([k,m])],skewy:["A",null,c([m,k])],translate:["Tt",c([k,k,l]),d],translatex:["T",c([k,l,l]),c([k,l])],translatey:["T",c([l,k,l]),c([l,k])],translatez:["L",c([l,l,k])],translate3d:["TTL",d]};a.addPropertiesHandler(e,j,["transform"]),a.transformToSvgMatrix=function(b){var c=a.transformListToMatrix(e(b));return"matrix("+f(c[0])+" "+f(c[1])+" "+f(c[4])+" "+f(c[5])+" "+f(c[12])+" "+f(c[13])+")"}}(d),function(a,b){function c(a,b){b.concat([a]).forEach(function(b){b in document.documentElement.style&&(d[a]=b),e[b]=a})}var d={},e={};c("transform",["webkitTransform","msTransform"]),c("transformOrigin",["webkitTransformOrigin"]),c("perspective",["webkitPerspective"]),c("perspectiveOrigin",["webkitPerspectiveOrigin"]),a.propertyName=function(a){return d[a]||a},a.unprefixedPropertyName=function(a){return e[a]||a}}(d)}(),function(){if(void 0===document.createElement("div").animate([]).oncancel){var a;if(window.performance&&performance.now)var a=function(){return performance.now()};else var a=function(){return Date.now()};var b=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="cancel",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()},c=window.Element.prototype.animate;window.Element.prototype.animate=function(d,e){var f=c.call(this,d,e);f._cancelHandlers=[],f.oncancel=null;var g=f.cancel;f.cancel=function(){g.call(this);var c=new b(this,null,a()),d=this._cancelHandlers.concat(this.oncancel?[this.oncancel]:[]);setTimeout(function(){d.forEach(function(a){a.call(c.target,c)})},0)};var h=f.addEventListener;f.addEventListener=function(a,b){"function"==typeof b&&"cancel"==a?this._cancelHandlers.push(b):h.call(this,a,b)};var i=f.removeEventListener;return f.removeEventListener=function(a,b){if("cancel"==a){var c=this._cancelHandlers.indexOf(b);c>=0&&this._cancelHandlers.splice(c,1)}else i.call(this,a,b)},f}}}(),function(a){var b=document.documentElement,c=null,d=!1;try{var e=getComputedStyle(b).getPropertyValue("opacity"),f="0"==e?"1":"0";c=b.animate({opacity:[f,f]},{duration:1}),c.currentTime=0,d=getComputedStyle(b).getPropertyValue("opacity")==f}catch(a){}finally{c&&c.cancel()}if(!d){var g=window.Element.prototype.animate;window.Element.prototype.animate=function(b,c){return window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||null===b||(b=a.convertToArrayForm(b)),g.call(this,b,c)}}}(c),function(a,b,c){function d(a){var c=b.timeline;c.currentTime=a,c._discardAnimations(),0==c._animations.length?f=!1:requestAnimationFrame(d)}var e=window.requestAnimationFrame;window.requestAnimationFrame=function(a){return e(function(c){b.timeline._updateAnimationsPromises(),a(c),b.timeline._updateAnimationsPromises()})},b.AnimationTimeline=function(){this._animations=[],this.currentTime=void 0},b.AnimationTimeline.prototype={getAnimations:function(){return this._discardAnimations(),this._animations.slice()},_updateAnimationsPromises:function(){b.animationsWithPromises=b.animationsWithPromises.filter(function(a){return a._updatePromises()})},_discardAnimations:function(){this._updateAnimationsPromises(),this._animations=this._animations.filter(function(a){return"finished"!=a.playState&&"idle"!=a.playState})},_play:function(a){var c=new b.Animation(a,this);return this._animations.push(c),b.restartWebAnimationsNextTick(),c._updatePromises(),c._animation.play(),c._updatePromises(),c},play:function(a){return a&&a.remove(),this._play(a)}};var f=!1;b.restartWebAnimationsNextTick=function(){f||(f=!0,requestAnimationFrame(d))};var g=new b.AnimationTimeline;b.timeline=g;try{Object.defineProperty(window.document,"timeline",{configurable:!0,get:function(){return g}})}catch(a){}try{window.document.timeline=g}catch(a){}}(0,e),function(a,b,c){b.animationsWithPromises=[],b.Animation=function(b,c){if(this.id="",b&&b._id&&(this.id=b._id),this.effect=b,b&&(b._animation=this),!c)throw new Error("Animation with null timeline is not supported");this._timeline=c,this._sequenceNumber=a.sequenceNumber++,this._holdTime=0,this._paused=!1,this._isGroup=!1,this._animation=null,this._childAnimations=[],this._callback=null,this._oldPlayState="idle",this._rebuildUnderlyingAnimation(),this._animation.cancel(),this._updatePromises()},b.Animation.prototype={_updatePromises:function(){var a=this._oldPlayState,b=this.playState;return this._readyPromise&&b!==a&&("idle"==b?(this._rejectReadyPromise(),this._readyPromise=void 0):"pending"==a?this._resolveReadyPromise():"pending"==b&&(this._readyPromise=void 0)),this._finishedPromise&&b!==a&&("idle"==b?(this._rejectFinishedPromise(),this._finishedPromise=void 0):"finished"==b?this._resolveFinishedPromise():"finished"==a&&(this._finishedPromise=void 0)),this._oldPlayState=this.playState,this._readyPromise||this._finishedPromise},_rebuildUnderlyingAnimation:function(){this._updatePromises();var a,c,d,e,f=!!this._animation;f&&(a=this.playbackRate,c=this._paused,d=this.startTime,e=this.currentTime,this._animation.cancel(),this._animation._wrapper=null,this._animation=null),(!this.effect||this.effect instanceof window.KeyframeEffect)&&(this._animation=b.newUnderlyingAnimationForKeyframeEffect(this.effect),b.bindAnimationForKeyframeEffect(this)),(this.effect instanceof window.SequenceEffect||this.effect instanceof window.GroupEffect)&&(this._animation=b.newUnderlyingAnimationForGroup(this.effect),b.bindAnimationForGroup(this)),this.effect&&this.effect._onsample&&b.bindAnimationForCustomEffect(this),f&&(1!=a&&(this.playbackRate=a),null!==d?this.startTime=d:null!==e?this.currentTime=e:null!==this._holdTime&&(this.currentTime=this._holdTime),c&&this.pause()),this._updatePromises()},_updateChildren:function(){if(this.effect&&"idle"!=this.playState){var a=this.effect._timing.delay;this._childAnimations.forEach(function(c){this._arrangeChildren(c,a),this.effect instanceof window.SequenceEffect&&(a+=b.groupChildDuration(c.effect))}.bind(this))}},_setExternalAnimation:function(a){if(this.effect&&this._isGroup)for(var b=0;b<this.effect.children.length;b++)this.effect.children[b]._animation=a,this._childAnimations[b]._setExternalAnimation(a)},_constructChildAnimations:function(){if(this.effect&&this._isGroup){var a=this.effect._timing.delay;this._removeChildAnimations(),this.effect.children.forEach(function(c){var d=b.timeline._play(c);this._childAnimations.push(d),d.playbackRate=this.playbackRate,this._paused&&d.pause(),c._animation=this.effect._animation,this._arrangeChildren(d,a),this.effect instanceof window.SequenceEffect&&(a+=b.groupChildDuration(c))}.bind(this))}},_arrangeChildren:function(a,b){null===this.startTime?a.currentTime=this.currentTime-b/this.playbackRate:a.startTime!==this.startTime+b/this.playbackRate&&(a.startTime=this.startTime+b/this.playbackRate)},get timeline(){return this._timeline},get playState(){return this._animation?this._animation.playState:"idle"},get finished(){return window.Promise?(this._finishedPromise||(-1==b.animationsWithPromises.indexOf(this)&&b.animationsWithPromises.push(this),this._finishedPromise=new Promise(function(a,b){this._resolveFinishedPromise=function(){a(this)},this._rejectFinishedPromise=function(){b({type:DOMException.ABORT_ERR,name:"AbortError"})}}.bind(this)),"finished"==this.playState&&this._resolveFinishedPromise()),this._finishedPromise):(console.warn("Animation Promises require JavaScript Promise constructor"),null)},get ready(){return window.Promise?(this._readyPromise||(-1==b.animationsWithPromises.indexOf(this)&&b.animationsWithPromises.push(this),this._readyPromise=new Promise(function(a,b){this._resolveReadyPromise=function(){a(this)},this._rejectReadyPromise=function(){b({type:DOMException.ABORT_ERR,name:"AbortError"})}}.bind(this)),"pending"!==this.playState&&this._resolveReadyPromise()),this._readyPromise):(console.warn("Animation Promises require JavaScript Promise constructor"),null)},get onfinish(){return this._animation.onfinish},set onfinish(a){this._animation.onfinish="function"==typeof a?function(b){b.target=this,a.call(this,b)}.bind(this):a},get oncancel(){return this._animation.oncancel},set oncancel(a){this._animation.oncancel="function"==typeof a?function(b){b.target=this,a.call(this,b)}.bind(this):a},get currentTime(){this._updatePromises();var a=this._animation.currentTime;return this._updatePromises(),a},set currentTime(a){this._updatePromises(),this._animation.currentTime=isFinite(a)?a:Math.sign(a)*Number.MAX_VALUE,this._register(),this._forEachChild(function(b,c){b.currentTime=a-c}),this._updatePromises()},get startTime(){return this._animation.startTime},set startTime(a){this._updatePromises(),this._animation.startTime=isFinite(a)?a:Math.sign(a)*Number.MAX_VALUE,this._register(),this._forEachChild(function(b,c){b.startTime=a+c}),this._updatePromises()},get playbackRate(){return this._animation.playbackRate},set playbackRate(a){this._updatePromises();var b=this.currentTime;this._animation.playbackRate=a,this._forEachChild(function(b){b.playbackRate=a}),null!==b&&(this.currentTime=b),this._updatePromises()},play:function(){this._updatePromises(),this._paused=!1,this._animation.play(),-1==this._timeline._animations.indexOf(this)&&this._timeline._animations.push(this),this._register(),b.awaitStartTime(this),this._forEachChild(function(a){var b=a.currentTime;a.play(),a.currentTime=b}),this._updatePromises()},pause:function(){this._updatePromises(),this.currentTime&&(this._holdTime=this.currentTime),this._animation.pause(),this._register(),this._forEachChild(function(a){a.pause()}),this._paused=!0,this._updatePromises()},finish:function(){this._updatePromises(),this._animation.finish(),this._register(),this._updatePromises()},cancel:function(){this._updatePromises(),this._animation.cancel(),this._register(),this._removeChildAnimations(),this._updatePromises()},reverse:function(){this._updatePromises();var a=this.currentTime;this._animation.reverse(),this._forEachChild(function(a){a.reverse()}),null!==a&&(this.currentTime=a),this._updatePromises()},addEventListener:function(a,b){var c=b;"function"==typeof b&&(c=function(a){a.target=this,b.call(this,a)}.bind(this),b._wrapper=c),this._animation.addEventListener(a,c)},removeEventListener:function(a,b){this._animation.removeEventListener(a,b&&b._wrapper||b)},_removeChildAnimations:function(){for(;this._childAnimations.length;)this._childAnimations.pop().cancel()},_forEachChild:function(b){var c=0;if(this.effect.children&&this._childAnimations.length<this.effect.children.length&&this._constructChildAnimations(),this._childAnimations.forEach(function(a){b.call(this,a,c),this.effect instanceof window.SequenceEffect&&(c+=a.effect.activeDuration)}.bind(this)),"pending"!=this.playState){var d=this.effect._timing,e=this.currentTime;null!==e&&(e=a.calculateIterationProgress(a.calculateActiveDuration(d),e,d)),(null==e||isNaN(e))&&this._removeChildAnimations()}}},window.Animation=b.Animation}(c,e),function(a,b,c){function d(b){this._frames=a.normalizeKeyframes(b)}function e(){for(var a=!1;i.length;)i.shift()._updateChildren(),a=!0;return a}var f=function(a){if(a._animation=void 0,a instanceof window.SequenceEffect||a instanceof window.GroupEffect)for(var b=0;b<a.children.length;b++)f(a.children[b])};b.removeMulti=function(a){for(var b=[],c=0;c<a.length;c++){var d=a[c];d._parent?(-1==b.indexOf(d._parent)&&b.push(d._parent),d._parent.children.splice(d._parent.children.indexOf(d),1),d._parent=null,f(d)):d._animation&&d._animation.effect==d&&(d._animation.cancel(),d._animation.effect=new KeyframeEffect(null,[]),d._animation._callback&&(d._animation._callback._animation=null),d._animation._rebuildUnderlyingAnimation(),f(d))}for(c=0;c<b.length;c++)b[c]._rebuild()},b.KeyframeEffect=function(b,c,e,f){return this.target=b,this._parent=null,e=a.numericTimingToObject(e),this._timingInput=a.cloneTimingInput(e),this._timing=a.normalizeTimingInput(e),this.timing=a.makeTiming(e,!1,this),this.timing._effect=this,"function"==typeof c?(a.deprecated("Custom KeyframeEffect","2015-06-22","Use KeyframeEffect.onsample instead."),this._normalizedKeyframes=c):this._normalizedKeyframes=new d(c),this._keyframes=c,this.activeDuration=a.calculateActiveDuration(this._timing),this._id=f,this},b.KeyframeEffect.prototype={getFrames:function(){return"function"==typeof this._normalizedKeyframes?this._normalizedKeyframes:this._normalizedKeyframes._frames},set onsample(a){if("function"==typeof this.getFrames())throw new Error("Setting onsample on custom effect KeyframeEffect is not supported.");this._onsample=a,this._animation&&this._animation._rebuildUnderlyingAnimation()},get parent(){return this._parent},clone:function(){if("function"==typeof this.getFrames())throw new Error("Cloning custom effects is not supported.");var b=new KeyframeEffect(this.target,[],a.cloneTimingInput(this._timingInput),this._id);return b._normalizedKeyframes=this._normalizedKeyframes,b._keyframes=this._keyframes,b},remove:function(){b.removeMulti([this])}};var g=Element.prototype.animate;Element.prototype.animate=function(a,c){var d="";return c&&c.id&&(d=c.id),b.timeline._play(new b.KeyframeEffect(this,a,c,d))};var h=document.createElementNS("http://www.w3.org/1999/xhtml","div");b.newUnderlyingAnimationForKeyframeEffect=function(a){if(a){var b=a.target||h,c=a._keyframes;"function"==typeof c&&(c=[]);var d=a._timingInput;d.id=a._id}else var b=h,c=[],d=0;return g.apply(b,[c,d])},b.bindAnimationForKeyframeEffect=function(a){a.effect&&"function"==typeof a.effect._normalizedKeyframes&&b.bindAnimationForCustomEffect(a)};var i=[];b.awaitStartTime=function(a){null===a.startTime&&a._isGroup&&(0==i.length&&requestAnimationFrame(e),i.push(a))};var j=window.getComputedStyle;Object.defineProperty(window,"getComputedStyle",{configurable:!0,enumerable:!0,value:function(){b.timeline._updateAnimationsPromises();var a=j.apply(this,arguments);return e()&&(a=j.apply(this,arguments)),b.timeline._updateAnimationsPromises(),a}}),window.KeyframeEffect=b.KeyframeEffect,window.Element.prototype.getAnimations=function(){return document.timeline.getAnimations().filter(function(a){return null!==a.effect&&a.effect.target==this}.bind(this))}}(c,e),function(a,b,c){function d(a){a._registered||(a._registered=!0,g.push(a),h||(h=!0,requestAnimationFrame(e)))}function e(a){var b=g;g=[],b.sort(function(a,b){return a._sequenceNumber-b._sequenceNumber}),b=b.filter(function(a){a();var b=a._animation?a._animation.playState:"idle";return"running"!=b&&"pending"!=b&&(a._registered=!1),a._registered}),g.push.apply(g,b),g.length?(h=!0,requestAnimationFrame(e)):h=!1}var f=(document.createElementNS("http://www.w3.org/1999/xhtml","div"),0);b.bindAnimationForCustomEffect=function(b){var c,e=b.effect.target,g="function"==typeof b.effect.getFrames();c=g?b.effect.getFrames():b.effect._onsample;var h=b.effect.timing,i=null;h=a.normalizeTimingInput(h);var j=function(){var d=j._animation?j._animation.currentTime:null;null!==d&&(d=a.calculateIterationProgress(a.calculateActiveDuration(h),d,h),isNaN(d)&&(d=null)),d!==i&&(g?c(d,e,b.effect):c(d,b.effect,b.effect._animation)),i=d};j._animation=b,j._registered=!1,j._sequenceNumber=f++,b._callback=j,d(j)};var g=[],h=!1;b.Animation.prototype._register=function(){this._callback&&d(this._callback)}}(c,e),function(a,b,c){function d(a){return a._timing.delay+a.activeDuration+a._timing.endDelay}function e(b,c,d){this._id=d,this._parent=null,this.children=b||[],this._reparent(this.children),c=a.numericTimingToObject(c),this._timingInput=a.cloneTimingInput(c),this._timing=a.normalizeTimingInput(c,!0),this.timing=a.makeTiming(c,!0,this),this.timing._effect=this,"auto"===this._timing.duration&&(this._timing.duration=this.activeDuration)}window.SequenceEffect=function(){e.apply(this,arguments)},window.GroupEffect=function(){e.apply(this,arguments)},e.prototype={_isAncestor:function(a){for(var b=this;null!==b;){if(b==a)return!0;b=b._parent}return!1},_rebuild:function(){for(var a=this;a;)"auto"===a.timing.duration&&(a._timing.duration=a.activeDuration),a=a._parent;this._animation&&this._animation._rebuildUnderlyingAnimation()},_reparent:function(a){b.removeMulti(a);for(var c=0;c<a.length;c++)a[c]._parent=this},_putChild:function(a,b){for(var c=b?"Cannot append an ancestor or self":"Cannot prepend an ancestor or self",d=0;d<a.length;d++)if(this._isAncestor(a[d]))throw{type:DOMException.HIERARCHY_REQUEST_ERR,name:"HierarchyRequestError",message:c};for(var d=0;d<a.length;d++)b?this.children.push(a[d]):this.children.unshift(a[d]);this._reparent(a),this._rebuild()},append:function(){this._putChild(arguments,!0)},prepend:function(){this._putChild(arguments,!1)},get parent(){return this._parent},get firstChild(){return this.children.length?this.children[0]:null},get lastChild(){return this.children.length?this.children[this.children.length-1]:null},clone:function(){for(var b=a.cloneTimingInput(this._timingInput),c=[],d=0;d<this.children.length;d++)c.push(this.children[d].clone());return this instanceof GroupEffect?new GroupEffect(c,b):new SequenceEffect(c,b)},remove:function(){b.removeMulti([this])}},window.SequenceEffect.prototype=Object.create(e.prototype),Object.defineProperty(window.SequenceEffect.prototype,"activeDuration",{get:function(){var a=0;return this.children.forEach(function(b){a+=d(b)}),Math.max(a,0)}}),window.GroupEffect.prototype=Object.create(e.prototype),Object.defineProperty(window.GroupEffect.prototype,"activeDuration",{get:function(){var a=0;return this.children.forEach(function(b){a=Math.max(a,d(b))}),a}}),b.newUnderlyingAnimationForGroup=function(c){var d,e=null,f=function(b){var c=d._wrapper;if(c&&"pending"!=c.playState&&c.effect)return null==b?void c._removeChildAnimations():0==b&&c.playbackRate<0&&(e||(e=a.normalizeTimingInput(c.effect.timing)),b=a.calculateIterationProgress(a.calculateActiveDuration(e),-1,e),isNaN(b)||null==b)?(c._forEachChild(function(a){a.currentTime=-1}),void c._removeChildAnimations()):void 0},g=new KeyframeEffect(null,[],c._timing,c._id);return g.onsample=f,d=b.timeline._play(g)},b.bindAnimationForGroup=function(a){a._animation._wrapper=a,a._isGroup=!0,b.awaitStartTime(a),a._constructChildAnimations(),a._setExternalAnimation(a)},b.groupChildDuration=d}(c,e),b.true=a}({},function(){return this}());
//# sourceMappingURL=web-animations-next-lite.min.js.map

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/main.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min__ = __webpack_require__("./node_modules/web-animations-js/web-animations-next-lite.min.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_web_animations_js_web_animations_next_lite_min__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_vdom__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/vdom.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_Registry__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/Registry.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_routing_RouterInjector__ = __webpack_require__("./node_modules/@dojo/framework/routing/RouterInjector.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__dojo_themes_dojo__ = __webpack_require__("./node_modules/@dojo/themes/dojo/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__dojo_themes_dojo___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__dojo_themes_dojo__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__dojo_themes_dojo_index_css__ = __webpack_require__("./node_modules/@dojo/themes/dojo/index.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__dojo_themes_dojo_index_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__dojo_themes_dojo_index_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__routes__ = __webpack_require__("./src/routes.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__widgets_App__ = __webpack_require__("./src/widgets/App.ts");










const registry = new __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_Registry__["c" /* default */]();
Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_routing_RouterInjector__["a" /* registerRouterInjector */])(__WEBPACK_IMPORTED_MODULE_8__routes__["a" /* default */], registry);
Object(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_mixins_Themed__["b" /* registerThemeInjector */])(__WEBPACK_IMPORTED_MODULE_6__dojo_themes_dojo___default.a, registry);
const r = Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_vdom__["a" /* default */])(() => Object(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_9__widgets_App__["a" /* default */], {}));
r.mount({ registry });


/***/ }),

/***/ "./src/routes.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ([
    {
        path: 'home',
        outlet: 'home',
        defaultRoute: true
    },
    {
        path: 'cat',
        outlet: 'cat'
    },
    {
        path: 'dog',
        outlet: 'dog'
    }
]);


/***/ }),

/***/ "./src/widgets/App.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__dojo_framework_routing_Outlet__ = __webpack_require__("./node_modules/@dojo/framework/routing/Outlet.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Button__ = __webpack_require__("./src/widgets/Button.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__CatContainer__ = __webpack_require__("./src/widgets/CatContainer.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__DogContainer__ = __webpack_require__("./src/widgets/DogContainer.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__styles_App_m_css__ = __webpack_require__("./src/widgets/styles/App.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__styles_App_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__styles_App_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__CoreAudio__ = __webpack_require__("./src/widgets/CoreAudio.ts");








class App extends __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__["b" /* default */] {
    constructor() {
        super(...arguments);
        this.coreAudio = new __WEBPACK_IMPORTED_MODULE_7__CoreAudio__["a" /* CoreAudio */]();
    }
    render() {
        const coreAudio = this.coreAudio;
        const onPlaySound = (sound) => {
            coreAudio.play(sound);
        };
        return Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["f" /* v */])('div', { classes: [__WEBPACK_IMPORTED_MODULE_6__styles_App_m_css__["root"]] }, [
            Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["f" /* v */])('header', { classes: [__WEBPACK_IMPORTED_MODULE_6__styles_App_m_css__["header"]] }, [
                Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_3__Button__["a" /* Button */], { to: 'cat' }, ['Cats']),
                Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["f" /* v */])('p', {}, ['vs']),
                Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_3__Button__["a" /* Button */], { to: 'dog' }, ['Dogs'])
            ]),
            Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_routing_Outlet__["a" /* default */], { key: 'cat', id: 'cat', renderer: () => Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_4__CatContainer__["a" /* CatContainer */], { onPlaySound }) }),
            Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_0__dojo_framework_routing_Outlet__["a" /* default */], { key: 'dog', id: 'dog', renderer: () => Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_5__DogContainer__["a" /* DogContainer */], { onPlaySound }) })
        ]);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = App;



/***/ }),

/***/ "./src/widgets/Button.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Button; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_routing_Link__ = __webpack_require__("./node_modules/@dojo/framework/routing/Link.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_decorators_alwaysRender__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/alwaysRender.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_decorators_diffProperty__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/decorators/diffProperty.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__styles_Button_m_css__ = __webpack_require__("./src/widgets/styles/Button.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__styles_Button_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__styles_Button_m_css__);







let Button = class Button extends __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_WidgetBase__["b" /* default */] {
    onRouterKeyChange(current, next) {
        const { routerKey = 'router' } = next;
        const item = this.registry.getInjector(routerKey);
        if (this._handle) {
            this._handle.destroy();
            this._handle = undefined;
        }
        if (item) {
            this._handle = item.invalidator.on('invalidate', () => {
                this.invalidate();
            });
            this.own(this._handle);
        }
    }
    onAttach() {
        if (!this._handle) {
            this.onRouterKeyChange(this.properties, this.properties);
        }
    }
    render() {
        const selected = this.isSelected();
        return Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["g" /* w */])(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_routing_Link__["a" /* default */], Object.assign({}, this.properties, { classes: __WEBPACK_IMPORTED_MODULE_6__styles_Button_m_css__["root"] }), [
            Object(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_d__["f" /* v */])('div', { classes: [__WEBPACK_IMPORTED_MODULE_6__styles_Button_m_css__["container"], selected ? __WEBPACK_IMPORTED_MODULE_6__styles_Button_m_css__["selected"] : undefined] }, this.children)
        ]);
    }
    isSelected() {
        const { to, routerKey = 'router' } = this.properties;
        const item = this.registry.getInjector(routerKey);
        if (item) {
            const router = item.injector();
            const outletContext = router.getOutlet(to);
            if (outletContext) {
                return true;
            }
        }
        return false;
    }
};
__WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_decorators_diffProperty__["a" /* diffProperty */])('routerKey')
], Button.prototype, "onRouterKeyChange", null);
Button = __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_3__dojo_framework_widget_core_decorators_alwaysRender__["a" /* alwaysRender */])()
], Button);



/***/ }),

/***/ "./src/widgets/CatContainer.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CatContainer; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css__ = __webpack_require__("./src/widgets/styles/catContainer.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__util_animations__ = __webpack_require__("./src/widgets/util/animations.ts");







const head = __webpack_require__("./src/widgets/assets/cat-head.png");
const body = __webpack_require__("./src/widgets/assets/cat-body.png");
const ThemedBase = Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]);
/* unused harmony export ThemedBase */

let CatContainer = class CatContainer extends ThemedBase {
    render() {
        const key = 'cathead';
        this.meta(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate(key, Object(__WEBPACK_IMPORTED_MODULE_6__util_animations__["a" /* headTilt */])('catHeadTilt'));
        return Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('img', { key, src: head, classes: __WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css__["head"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('img', { src: body, classes: __WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css__["body"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('button', { onclick: this.onClick }, ['Meow'])
        ]);
    }
    onClick() {
        const { onPlaySound } = this.properties;
        if (onPlaySound) {
            onPlaySound('meow');
        }
    }
};
CatContainer = __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["c" /* theme */])(__WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css__)
], CatContainer);



/***/ }),

/***/ "./src/widgets/CoreAudio.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class CoreAudio {
    play(sound) {
        const audio = this.load();
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        audio.start();
        setTimeout(() => {
            audio.stop();
        }, 500);
        console.log(sound);
    }
    load() {
        if (!this.context) {
            this.context = new AudioContext();
        }
        const osc = this.context.createOscillator();
        osc.frequency.setValueAtTime(440, this.context.currentTime);
        osc.connect(this.context.destination);
        return osc;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CoreAudio;



/***/ }),

/***/ "./src/widgets/DogContainer.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DogContainer; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/mixins/Themed.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/WidgetBase.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_dogContainer_m_css__ = __webpack_require__("./src/widgets/styles/dogContainer.m.css");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__styles_dogContainer_m_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__styles_dogContainer_m_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/d.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__ = __webpack_require__("./node_modules/@dojo/framework/widget-core/meta/WebAnimation.mjs");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__util_animations__ = __webpack_require__("./src/widgets/util/animations.ts");







const head = __webpack_require__("./src/widgets/assets/dog-head.png");
const body = __webpack_require__("./src/widgets/assets/dog-body.png");
const ThemedBase = Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["a" /* ThemedMixin */])(__WEBPACK_IMPORTED_MODULE_2__dojo_framework_widget_core_WidgetBase__["a" /* WidgetBase */]);
/* unused harmony export ThemedBase */

let DogContainer = class DogContainer extends ThemedBase {
    render() {
        const key = 'dogHead';
        this.meta(__WEBPACK_IMPORTED_MODULE_5__dojo_framework_widget_core_meta_WebAnimation__["a" /* default */]).animate(key, Object(__WEBPACK_IMPORTED_MODULE_6__util_animations__["a" /* headTilt */])('dogHeadTilt'));
        return Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('div', { classes: __WEBPACK_IMPORTED_MODULE_3__styles_dogContainer_m_css__["root"] }, [
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('img', { key, src: head, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dogContainer_m_css__["head"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('img', { src: body, classes: __WEBPACK_IMPORTED_MODULE_3__styles_dogContainer_m_css__["body"] }),
            Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_d__["f" /* v */])('button', { onclick: this.onClick }, ['Woof'])
        ]);
    }
    onClick() {
        const { onPlaySound } = this.properties;
        if (onPlaySound) {
            onPlaySound('woof');
        }
    }
};
DogContainer = __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["c" /* theme */])(__WEBPACK_IMPORTED_MODULE_3__styles_dogContainer_m_css__)
], DogContainer);



/***/ }),

/***/ "./src/widgets/assets/cat-body.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-body.2y-z8Gw6.png";

/***/ }),

/***/ "./src/widgets/assets/cat-head.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cat-head.3nEndgfJ.png";

/***/ }),

/***/ "./src/widgets/assets/dog-body.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-body.3vbSHvWa.png";

/***/ }),

/***/ "./src/widgets/assets/dog-head.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "dog-head.FwbHTjMD.png";

/***/ }),

/***/ "./src/widgets/styles/App.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/App","root":"App-m__root__2cT6t","header":"App-m__header__1dJkP"};

/***/ }),

/***/ "./src/widgets/styles/Button.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/Button","root":"Button-m__root__1UYFw","container":"Button-m__container__ONZDO","selected":"Button-m__selected__nasmH"};

/***/ }),

/***/ "./src/widgets/styles/catContainer.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/catContainer","root":"catContainer-m__root__33_kx","head":"catContainer-m__head__2M1oE","body":"catContainer-m__body__2iIru"};

/***/ }),

/***/ "./src/widgets/styles/dogContainer.m.css":
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin
module.exports = {" _key":"catsvsdogs/dogContainer","root":"dogContainer-m__root__DLDrB","head":"dogContainer-m__head__1ahUL","body":"dogContainer-m__body__1USSZ"};

/***/ }),

/***/ "./src/widgets/util/animations.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = headTilt;
function headTilt(id) {
    const effects = [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-5deg)' },
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(5deg)' },
        { transform: 'rotate(0deg)' }
    ];
    return {
        id,
        effects,
        timing: {
            duration: 1000,
            iterations: Infinity
        },
        controls: {
            play: true
        }
    };
}


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__("./node_modules/@dojo/webpack-contrib/build-time-render/hasBuildTimeRender.js");
__webpack_require__("./src/main.css");
module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
});
typeof define === 'function' && define.amd && require(['catsvsdogs']);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvY29yZS9EZXN0cm95YWJsZS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9jb3JlL0V2ZW50ZWQubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvY29yZS9RdWV1aW5nRXZlbnRlZC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9oYXMvaGFzLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvTGluay5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL091dGxldC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlci5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlckluamVjdG9yLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvaGlzdG9yeS9IYXNoSGlzdG9yeS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL01hcC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1Byb21pc2UubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9TZXQubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9TeW1ib2wubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9XZWFrTWFwLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vZ2xvYmFsLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vaXRlcmF0b3IubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9vYmplY3QubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdHJpbmcubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L2hhcy5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N1cHBvcnQvcXVldWUubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L3V0aWwubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvSW5qZWN0b3IubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvTm9kZUhhbmRsZXIubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnkubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnlIYW5kbGVyLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvYW5pbWF0aW9ucy9jc3NUcmFuc2l0aW9ucy5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYWx3YXlzUmVuZGVyLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYmVmb3JlUHJvcGVydGllcy5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2RpZmZQcm9wZXJ0eS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2hhbmRsZURlY29yYXRvci5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2luamVjdC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kaWZmLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvQmFzZS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL1dlYkFuaW1hdGlvbi5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL3Zkb20ubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby90aGVtZXMvZG9qby9pbmRleC5jc3M/Nzc0MSIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9idWlsZC10aW1lLXJlbmRlci9oYXNCdWlsZFRpbWVSZW5kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy93ZWItYW5pbWF0aW9ucy1qcy93ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uY3NzPzM4ZGIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9BcHAudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvQnV0dG9uLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL0NhdENvbnRhaW5lci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9Db3JlQXVkaW8udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvRG9nQ29udGFpbmVyLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtYm9keS5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC1oZWFkLnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctaGVhZC5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvc3R5bGVzL0FwcC5tLmNzcz9kODA5Iiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL3N0eWxlcy9CdXR0b24ubS5jc3M/YjFlOSIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9zdHlsZXMvY2F0Q29udGFpbmVyLm0uY3NzP2EwZjEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvc3R5bGVzL2RvZ0NvbnRhaW5lci5tLmNzcz9kMGM1Iiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL3V0aWwvYW5pbWF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7QUNWQTtBQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsOERBQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixpQkFBaUIsT0FBTztBQUN4QjtBQUNBO0FBQ0E7QUFDQSxlQUFlLG9CQUFvQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBLG1CQUFtQiw4REFBTztBQUMxQjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLENBQUM7QUFBQTtBQUFBO0FBQ2MscUZBQVcsRUFBQztBQUMzQix3Qzs7Ozs7Ozs7QUN0REE7QUFBQTtBQUFBO0FBQThCO0FBQ2M7QUFDNUM7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLDBEQUFHO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxnQ0FBZ0M7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Qjs7Ozs7OztBQ0F4QztBQUNBLGtCQUFrQixzRjs7Ozs7OztBQ0RsQjtBQUNBLGtCQUFrQiw0STs7Ozs7OztBQ0RsQjtBQUNBLGtCQUFrQixrSjs7Ozs7OztBQ0RsQjtBQUNBLGtCQUFrQixrSjs7Ozs7Ozs7QUNDbEI7QUFBTyxTQUFTLFFBQVEsQ0FBQyxFQUFVO0lBQ2xDLE1BQU0sT0FBTyxHQUFHO1FBQ2YsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFO1FBQzdCLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRTtRQUM5QixFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUU7UUFDN0IsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFO1FBQzdCLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRTtLQUM3QixDQUFDO0lBRUYsT0FBTztRQUNOLEVBQUU7UUFDRixPQUFPO1FBQ1AsTUFBTSxFQUFFO1lBQ1AsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsUUFBUTtTQUNwQjtRQUNELFFBQVEsRUFBRTtZQUNULElBQUksRUFBRSxJQUFJO1NBQ1Y7S0FDRCxDQUFDO0FBQ0gsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJjYXRzdnNkb2dzXCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImNhdHN2c2RvZ3NcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiY2F0c3ZzZG9nc1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIFxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJpbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9zaGltL1Byb21pc2UnO1xuLyoqXG4gKiBObyBvcCBmdW5jdGlvbiB1c2VkIHRvIHJlcGxhY2UgYSBEZXN0cm95YWJsZSBpbnN0YW5jZSdzIGBkZXN0cm95YCBtZXRob2QsIG9uY2UgdGhlIGluc3RhbmNlIGhhcyBiZWVuIGRlc3Ryb3llZFxuICovXG5mdW5jdGlvbiBub29wKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xufVxuLyoqXG4gKiBObyBvcCBmdW5jdGlvbiB1c2VkIHRvIHJlcGxhY2UgYSBEZXN0cm95YWJsZSBpbnN0YW5jZSdzIGBvd25gIG1ldGhvZCwgb25jZSB0aGUgaW5zdGFuY2UgaGFzIGJlZW4gZGVzdHJveWVkXG4gKi9cbmZ1bmN0aW9uIGRlc3Ryb3llZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbGwgbWFkZSB0byBkZXN0cm95ZWQgbWV0aG9kJyk7XG59XG5leHBvcnQgY2xhc3MgRGVzdHJveWFibGUge1xuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmhhbmRsZXMgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgaGFuZGxlcyBmb3IgdGhlIGluc3RhbmNlIHRoYXQgd2lsbCBiZSBkZXN0cm95ZWQgd2hlbiBgdGhpcy5kZXN0cm95YCBpcyBjYWxsZWRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SGFuZGxlfSBoYW5kbGUgVGhlIGhhbmRsZSB0byBhZGQgZm9yIHRoZSBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHtIYW5kbGV9IEEgd3JhcHBlciBIYW5kbGUuIFdoZW4gdGhlIHdyYXBwZXIgSGFuZGxlJ3MgYGRlc3Ryb3lgIG1ldGhvZCBpcyBpbnZva2VkLCB0aGUgb3JpZ2luYWwgaGFuZGxlIGlzXG4gICAgICogICAgICAgICAgICAgICAgICAgcmVtb3ZlZCBmcm9tIHRoZSBpbnN0YW5jZSwgYW5kIGl0cyBgZGVzdHJveWAgbWV0aG9kIGlzIGludm9rZWQuXG4gICAgICovXG4gICAgb3duKGhhbmRsZSkge1xuICAgICAgICBjb25zdCB7IGhhbmRsZXM6IF9oYW5kbGVzIH0gPSB0aGlzO1xuICAgICAgICBfaGFuZGxlcy5wdXNoKGhhbmRsZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXN0cm95KCkge1xuICAgICAgICAgICAgICAgIF9oYW5kbGVzLnNwbGljZShfaGFuZGxlcy5pbmRleE9mKGhhbmRsZSkpO1xuICAgICAgICAgICAgICAgIGhhbmRsZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIGFsbCBoYW5kbGVycyByZWdpc3RlcmVkIGZvciB0aGUgaW5zdGFuY2VcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueX0gQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgb25jZSBhbGwgaGFuZGxlcyBoYXZlIGJlZW4gZGVzdHJveWVkXG4gICAgICovXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZXMuZm9yRWFjaCgoaGFuZGxlKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlICYmIGhhbmRsZS5kZXN0cm95ICYmIGhhbmRsZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZGVzdHJveSA9IG5vb3A7XG4gICAgICAgICAgICB0aGlzLm93biA9IGRlc3Ryb3llZDtcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IERlc3Ryb3lhYmxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RGVzdHJveWFibGUubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9jb3JlL0Rlc3Ryb3lhYmxlLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL2NvcmUvRGVzdHJveWFibGUubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBNYXAgZnJvbSAnLi4vc2hpbS9NYXAnO1xyXG5pbXBvcnQgeyBEZXN0cm95YWJsZSB9IGZyb20gJy4vRGVzdHJveWFibGUnO1xyXG4vKipcclxuICogTWFwIG9mIGNvbXB1dGVkIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGtleWVkIGJ5IHN0cmluZ1xyXG4gKi9cclxuY29uc3QgcmVnZXhNYXAgPSBuZXcgTWFwKCk7XHJcbi8qKlxyXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBldmVudCB0eXBlIGdsb2IgaGFzIGJlZW4gbWF0Y2hlZFxyXG4gKlxyXG4gKiBAcmV0dXJucyBib29sZWFuIHRoYXQgaW5kaWNhdGVzIGlmIHRoZSBnbG9iIGlzIG1hdGNoZWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0dsb2JNYXRjaChnbG9iU3RyaW5nLCB0YXJnZXRTdHJpbmcpIHtcclxuICAgIGlmICh0eXBlb2YgdGFyZ2V0U3RyaW5nID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZ2xvYlN0cmluZyA9PT0gJ3N0cmluZycgJiYgZ2xvYlN0cmluZy5pbmRleE9mKCcqJykgIT09IC0xKSB7XHJcbiAgICAgICAgbGV0IHJlZ2V4O1xyXG4gICAgICAgIGlmIChyZWdleE1hcC5oYXMoZ2xvYlN0cmluZykpIHtcclxuICAgICAgICAgICAgcmVnZXggPSByZWdleE1hcC5nZXQoZ2xvYlN0cmluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZWdleCA9IG5ldyBSZWdFeHAoYF4ke2dsb2JTdHJpbmcucmVwbGFjZSgvXFwqL2csICcuKicpfSRgKTtcclxuICAgICAgICAgICAgcmVnZXhNYXAuc2V0KGdsb2JTdHJpbmcsIHJlZ2V4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlZ2V4LnRlc3QodGFyZ2V0U3RyaW5nKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBnbG9iU3RyaW5nID09PSB0YXJnZXRTdHJpbmc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEV2ZW50IENsYXNzXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRXZlbnRlZCBleHRlbmRzIERlc3Ryb3lhYmxlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogbWFwIG9mIGxpc3RlbmVycyBrZXllZCBieSBldmVudCB0eXBlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBlbWl0KGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNNYXAuZm9yRWFjaCgobWV0aG9kcywgdHlwZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXNHbG9iTWF0Y2godHlwZSwgZXZlbnQudHlwZSkpIHtcclxuICAgICAgICAgICAgICAgIFsuLi5tZXRob2RzXS5mb3JFYWNoKChtZXRob2QpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2QuY2FsbCh0aGlzLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgb24odHlwZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShsaXN0ZW5lcikpIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlcyA9IGxpc3RlbmVyLm1hcCgobGlzdGVuZXIpID0+IHRoaXMuX2FkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBkZXN0cm95KCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXMuZm9yRWFjaCgoaGFuZGxlKSA9PiBoYW5kbGUuZGVzdHJveSgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcclxuICAgIH1cclxuICAgIF9hZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzTWFwLmdldCh0eXBlKSB8fCBbXTtcclxuICAgICAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNNYXAuc2V0KHR5cGUsIGxpc3RlbmVycyk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZGVzdHJveTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNNYXAuZ2V0KHR5cGUpIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lciksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBFdmVudGVkO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1FdmVudGVkLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvY29yZS9FdmVudGVkLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL2NvcmUvRXZlbnRlZC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IE1hcCBmcm9tICcuLi9zaGltL01hcCc7XG5pbXBvcnQgRXZlbnRlZCwgeyBpc0dsb2JNYXRjaCB9IGZyb20gJy4vRXZlbnRlZCc7XG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHRoZSBFdmVudGVkIGNsYXNzIHRoYXQgcXVldWVzIHVwIGV2ZW50cyB3aGVuIG5vIGxpc3RlbmVycyBhcmVcbiAqIGxpc3RlbmluZy4gV2hlbiBhIGxpc3RlbmVyIGlzIHN1YnNjcmliZWQsIHRoZSBxdWV1ZSB3aWxsIGJlIHB1Ymxpc2hlZCB0byB0aGUgbGlzdGVuZXIuXG4gKiBXaGVuIHRoZSBxdWV1ZSBpcyBmdWxsLCB0aGUgb2xkZXN0IGV2ZW50cyB3aWxsIGJlIGRpc2NhcmRlZCB0byBtYWtlIHJvb20gZm9yIHRoZSBuZXdlc3Qgb25lcy5cbiAqXG4gKiBAcHJvcGVydHkgbWF4RXZlbnRzICBUaGUgbnVtYmVyIG9mIGV2ZW50cyB0byBxdWV1ZSBiZWZvcmUgb2xkIGV2ZW50cyBhcmUgZGlzY2FyZGVkLiBJZiB6ZXJvIChkZWZhdWx0KSwgYW4gdW5saW1pdGVkIG51bWJlciBvZiBldmVudHMgaXMgcXVldWVkLlxuICovXG5jbGFzcyBRdWV1aW5nRXZlbnRlZCBleHRlbmRzIEV2ZW50ZWQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLl9xdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5tYXhFdmVudHMgPSAwO1xuICAgIH1cbiAgICBlbWl0KGV2ZW50KSB7XG4gICAgICAgIHN1cGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICBsZXQgaGFzTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNNYXAuZm9yRWFjaCgobWV0aG9kLCB0eXBlKSA9PiB7XG4gICAgICAgICAgICAvLyBTaW5jZSBgdHlwZWAgaXMgZ2VuZXJpYywgdGhlIGNvbXBpbGVyIGRvZXNuJ3Qga25vdyB3aGF0IHR5cGUgaXQgaXMgYW5kIGBpc0dsb2JNYXRjaGAgcmVxdWlyZXMgYHN0cmluZyB8IHN5bWJvbGBcbiAgICAgICAgICAgIGlmIChpc0dsb2JNYXRjaCh0eXBlLCBldmVudC50eXBlKSkge1xuICAgICAgICAgICAgICAgIGhhc01hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghaGFzTWF0Y2gpIHtcbiAgICAgICAgICAgIGxldCBxdWV1ZSA9IHRoaXMuX3F1ZXVlLmdldChldmVudC50eXBlKTtcbiAgICAgICAgICAgIGlmICghcXVldWUpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuX3F1ZXVlLnNldChldmVudC50eXBlLCBxdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1heEV2ZW50cyA+IDApIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gdGhpcy5tYXhFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgbGV0IGhhbmRsZSA9IHN1cGVyLm9uKHR5cGUsIGxpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNNYXAuZm9yRWFjaCgobWV0aG9kLCBsaXN0ZW5lclR5cGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3F1ZXVlLmZvckVhY2goKGV2ZW50cywgcXVldWVkVHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0dsb2JNYXRjaChsaXN0ZW5lclR5cGUsIHF1ZXVlZFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4gdGhpcy5lbWl0KGV2ZW50KSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3F1ZXVlLmRlbGV0ZShxdWV1ZWRUeXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBoYW5kbGU7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgUXVldWluZ0V2ZW50ZWQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1RdWV1aW5nRXZlbnRlZC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL2NvcmUvUXVldWluZ0V2ZW50ZWQubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvY29yZS9RdWV1aW5nRXZlbnRlZC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiZnVuY3Rpb24gaXNGZWF0dXJlVGVzdFRoZW5hYmxlKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgJiYgdmFsdWUudGhlbjtcclxufVxyXG4vKipcclxuICogQSBjYWNoZSBvZiByZXN1bHRzIG9mIGZlYXR1cmUgdGVzdHNcclxuICovXHJcbmV4cG9ydCBjb25zdCB0ZXN0Q2FjaGUgPSB7fTtcclxuLyoqXHJcbiAqIEEgY2FjaGUgb2YgdGhlIHVuLXJlc29sdmVkIGZlYXR1cmUgdGVzdHNcclxuICovXHJcbmV4cG9ydCBjb25zdCB0ZXN0RnVuY3Rpb25zID0ge307XHJcbi8qKlxyXG4gKiBBIGNhY2hlIG9mIHVucmVzb2x2ZWQgdGhlbmFibGVzIChwcm9iYWJseSBwcm9taXNlcylcclxuICogQHR5cGUge3t9fVxyXG4gKi9cclxuY29uc3QgdGVzdFRoZW5hYmxlcyA9IHt9O1xyXG4vKipcclxuICogQSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBzY29wZSAoYHdpbmRvd2AgaW4gYSBicm93c2VyLCBgZ2xvYmFsYCBpbiBOb2RlSlMpXHJcbiAqL1xyXG5jb25zdCBnbG9iYWxTY29wZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgLy8gQnJvd3NlcnNcclxuICAgICAgICByZXR1cm4gd2luZG93O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAvLyBOb2RlXHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIC8vIFdlYiB3b3JrZXJzXHJcbiAgICAgICAgcmV0dXJuIHNlbGY7XHJcbiAgICB9XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgcmV0dXJuIHt9O1xyXG59KSgpO1xyXG4vKiBHcmFiIHRoZSBzdGF0aWNGZWF0dXJlcyBpZiB0aGVyZSBhcmUgYXZhaWxhYmxlICovXHJcbmNvbnN0IHsgc3RhdGljRmVhdHVyZXMgfSA9IGdsb2JhbFNjb3BlLkRvam9IYXNFbnZpcm9ubWVudCB8fCB7fTtcclxuLyogQ2xlYW5pbmcgdXAgdGhlIERvam9IYXNFbnZpb3JubWVudCAqL1xyXG5pZiAoJ0Rvam9IYXNFbnZpcm9ubWVudCcgaW4gZ2xvYmFsU2NvcGUpIHtcclxuICAgIGRlbGV0ZSBnbG9iYWxTY29wZS5Eb2pvSGFzRW52aXJvbm1lbnQ7XHJcbn1cclxuLyoqXHJcbiAqIEN1c3RvbSB0eXBlIGd1YXJkIHRvIG5hcnJvdyB0aGUgYHN0YXRpY0ZlYXR1cmVzYCB0byBlaXRoZXIgYSBtYXAgb3IgYSBmdW5jdGlvbiB0aGF0XHJcbiAqIHJldHVybnMgYSBtYXAuXHJcbiAqXHJcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZ3VhcmQgZm9yXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1N0YXRpY0ZlYXR1cmVGdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcclxufVxyXG4vKipcclxuICogVGhlIGNhY2hlIG9mIGFzc2VydGVkIGZlYXR1cmVzIHRoYXQgd2VyZSBhdmFpbGFibGUgaW4gdGhlIGdsb2JhbCBzY29wZSB3aGVuIHRoZVxyXG4gKiBtb2R1bGUgbG9hZGVkXHJcbiAqL1xyXG5jb25zdCBzdGF0aWNDYWNoZSA9IHN0YXRpY0ZlYXR1cmVzXHJcbiAgICA/IGlzU3RhdGljRmVhdHVyZUZ1bmN0aW9uKHN0YXRpY0ZlYXR1cmVzKVxyXG4gICAgICAgID8gc3RhdGljRmVhdHVyZXMuYXBwbHkoZ2xvYmFsU2NvcGUpXHJcbiAgICAgICAgOiBzdGF0aWNGZWF0dXJlc1xyXG4gICAgOiB7fTsgLyogUHJvdmlkaW5nIGFuIGVtcHR5IGNhY2hlLCBpZiBub25lIHdhcyBpbiB0aGUgZW52aXJvbm1lbnRcclxuXHJcbi8qKlxyXG4qIEFNRCBwbHVnaW4gZnVuY3Rpb24uXHJcbipcclxuKiBDb25kaXRpb25hbCBsb2FkcyBtb2R1bGVzIGJhc2VkIG9uIGEgaGFzIGZlYXR1cmUgdGVzdCB2YWx1ZS5cclxuKlxyXG4qIEBwYXJhbSByZXNvdXJjZUlkIEdpdmVzIHRoZSByZXNvbHZlZCBtb2R1bGUgaWQgdG8gbG9hZC5cclxuKiBAcGFyYW0gcmVxdWlyZSBUaGUgbG9hZGVyIHJlcXVpcmUgZnVuY3Rpb24gd2l0aCByZXNwZWN0IHRvIHRoZSBtb2R1bGUgdGhhdCBjb250YWluZWQgdGhlIHBsdWdpbiByZXNvdXJjZSBpbiBpdHNcclxuKiAgICAgICAgICAgICAgICBkZXBlbmRlbmN5IGxpc3QuXHJcbiogQHBhcmFtIGxvYWQgQ2FsbGJhY2sgdG8gbG9hZGVyIHRoYXQgY29uc3VtZXMgcmVzdWx0IG9mIHBsdWdpbiBkZW1hbmQuXHJcbiovXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2FkKHJlc291cmNlSWQsIHJlcXVpcmUsIGxvYWQsIGNvbmZpZykge1xyXG4gICAgcmVzb3VyY2VJZCA/IHJlcXVpcmUoW3Jlc291cmNlSWRdLCBsb2FkKSA6IGxvYWQoKTtcclxufVxyXG4vKipcclxuICogQU1EIHBsdWdpbiBmdW5jdGlvbi5cclxuICpcclxuICogUmVzb2x2ZXMgcmVzb3VyY2VJZCBpbnRvIGEgbW9kdWxlIGlkIGJhc2VkIG9uIHBvc3NpYmx5LW5lc3RlZCB0ZW5hcnkgZXhwcmVzc2lvbiB0aGF0IGJyYW5jaGVzIG9uIGhhcyBmZWF0dXJlIHRlc3RcclxuICogdmFsdWUocykuXHJcbiAqXHJcbiAqIEBwYXJhbSByZXNvdXJjZUlkIFRoZSBpZCBvZiB0aGUgbW9kdWxlXHJcbiAqIEBwYXJhbSBub3JtYWxpemUgUmVzb2x2ZXMgYSByZWxhdGl2ZSBtb2R1bGUgaWQgaW50byBhbiBhYnNvbHV0ZSBtb2R1bGUgaWRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUocmVzb3VyY2VJZCwgbm9ybWFsaXplKSB7XHJcbiAgICBjb25zdCB0b2tlbnMgPSByZXNvdXJjZUlkLm1hdGNoKC9bXFw/Ol18W146XFw/XSovZykgfHwgW107XHJcbiAgICBsZXQgaSA9IDA7XHJcbiAgICBmdW5jdGlvbiBnZXQoc2tpcCkge1xyXG4gICAgICAgIGNvbnN0IHRlcm0gPSB0b2tlbnNbaSsrXTtcclxuICAgICAgICBpZiAodGVybSA9PT0gJzonKSB7XHJcbiAgICAgICAgICAgIC8vIGVtcHR5IHN0cmluZyBtb2R1bGUgbmFtZSwgcmVzb2x2ZXMgdG8gbnVsbFxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIHBvc3RmaXhlZCB3aXRoIGEgPyBtZWFucyBpdCBpcyBhIGZlYXR1cmUgdG8gYnJhbmNoIG9uLCB0aGUgdGVybSBpcyB0aGUgbmFtZSBvZiB0aGUgZmVhdHVyZVxyXG4gICAgICAgICAgICBpZiAodG9rZW5zW2krK10gPT09ICc/Jykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFza2lwICYmIGhhcyh0ZXJtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1hdGNoZWQgdGhlIGZlYXR1cmUsIGdldCB0aGUgZmlyc3QgdmFsdWUgZnJvbSB0aGUgb3B0aW9uc1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRpZCBub3QgbWF0Y2gsIGdldCB0aGUgc2Vjb25kIHZhbHVlLCBwYXNzaW5nIG92ZXIgdGhlIGZpcnN0XHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXQoc2tpcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gYSBtb2R1bGVcclxuICAgICAgICAgICAgcmV0dXJuIHRlcm07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3QgaWQgPSBnZXQoKTtcclxuICAgIHJldHVybiBpZCAmJiBub3JtYWxpemUoaWQpO1xyXG59XHJcbi8qKlxyXG4gKiBDaGVjayBpZiBhIGZlYXR1cmUgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkXHJcbiAqXHJcbiAqIEBwYXJhbSBmZWF0dXJlIHRoZSBuYW1lIG9mIHRoZSBmZWF0dXJlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzKGZlYXR1cmUpIHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWRGZWF0dXJlID0gZmVhdHVyZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIEJvb2xlYW4obm9ybWFsaXplZEZlYXR1cmUgaW4gc3RhdGljQ2FjaGUgfHwgbm9ybWFsaXplZEZlYXR1cmUgaW4gdGVzdENhY2hlIHx8IHRlc3RGdW5jdGlvbnNbbm9ybWFsaXplZEZlYXR1cmVdKTtcclxufVxyXG4vKipcclxuICogUmVnaXN0ZXIgYSBuZXcgdGVzdCBmb3IgYSBuYW1lZCBmZWF0dXJlLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBoYXMuYWRkKCdkb20tYWRkZXZlbnRsaXN0ZW5lcicsICEhZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcik7XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGhhcy5hZGQoJ3RvdWNoLWV2ZW50cycsIGZ1bmN0aW9uICgpIHtcclxuICogICAgcmV0dXJuICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50XHJcbiAqIH0pO1xyXG4gKlxyXG4gKiBAcGFyYW0gZmVhdHVyZSB0aGUgbmFtZSBvZiB0aGUgZmVhdHVyZVxyXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHJlcG9ydGVkIG9mIHRoZSBmZWF0dXJlLCBvciBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbmNlIG9uIGZpcnN0IHRlc3RcclxuICogQHBhcmFtIG92ZXJ3cml0ZSBpZiBhbiBleGlzdGluZyB2YWx1ZSBzaG91bGQgYmUgb3ZlcndyaXR0ZW4uIERlZmF1bHRzIHRvIGZhbHNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZChmZWF0dXJlLCB2YWx1ZSwgb3ZlcndyaXRlID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWRGZWF0dXJlID0gZmVhdHVyZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKGV4aXN0cyhub3JtYWxpemVkRmVhdHVyZSkgJiYgIW92ZXJ3cml0ZSAmJiAhKG5vcm1hbGl6ZWRGZWF0dXJlIGluIHN0YXRpY0NhY2hlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZlYXR1cmUgXCIke2ZlYXR1cmV9XCIgZXhpc3RzIGFuZCBvdmVyd3JpdGUgbm90IHRydWUuYCk7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgdGVzdEZ1bmN0aW9uc1tub3JtYWxpemVkRmVhdHVyZV0gPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGlzRmVhdHVyZVRlc3RUaGVuYWJsZSh2YWx1ZSkpIHtcclxuICAgICAgICB0ZXN0VGhlbmFibGVzW2ZlYXR1cmVdID0gdmFsdWUudGhlbigocmVzb2x2ZWRWYWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0ZXN0Q2FjaGVbZmVhdHVyZV0gPSByZXNvbHZlZFZhbHVlO1xyXG4gICAgICAgICAgICBkZWxldGUgdGVzdFRoZW5hYmxlc1tmZWF0dXJlXTtcclxuICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0ZXN0VGhlbmFibGVzW2ZlYXR1cmVdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGVzdENhY2hlW25vcm1hbGl6ZWRGZWF0dXJlXSA9IHZhbHVlO1xyXG4gICAgICAgIGRlbGV0ZSB0ZXN0RnVuY3Rpb25zW25vcm1hbGl6ZWRGZWF0dXJlXTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogUmV0dXJuIHRoZSBjdXJyZW50IHZhbHVlIG9mIGEgbmFtZWQgZmVhdHVyZS5cclxuICpcclxuICogQHBhcmFtIGZlYXR1cmUgVGhlIG5hbWUgb2YgdGhlIGZlYXR1cmUgdG8gdGVzdC5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGhhcyhmZWF0dXJlKSB7XHJcbiAgICBsZXQgcmVzdWx0O1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZEZlYXR1cmUgPSBmZWF0dXJlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAobm9ybWFsaXplZEZlYXR1cmUgaW4gc3RhdGljQ2FjaGUpIHtcclxuICAgICAgICByZXN1bHQgPSBzdGF0aWNDYWNoZVtub3JtYWxpemVkRmVhdHVyZV07XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0ZXN0RnVuY3Rpb25zW25vcm1hbGl6ZWRGZWF0dXJlXSkge1xyXG4gICAgICAgIHJlc3VsdCA9IHRlc3RDYWNoZVtub3JtYWxpemVkRmVhdHVyZV0gPSB0ZXN0RnVuY3Rpb25zW25vcm1hbGl6ZWRGZWF0dXJlXS5jYWxsKG51bGwpO1xyXG4gICAgICAgIGRlbGV0ZSB0ZXN0RnVuY3Rpb25zW25vcm1hbGl6ZWRGZWF0dXJlXTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKG5vcm1hbGl6ZWRGZWF0dXJlIGluIHRlc3RDYWNoZSkge1xyXG4gICAgICAgIHJlc3VsdCA9IHRlc3RDYWNoZVtub3JtYWxpemVkRmVhdHVyZV07XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChmZWF0dXJlIGluIHRlc3RUaGVuYWJsZXMpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBBdHRlbXB0IHRvIGRldGVjdCB1bnJlZ2lzdGVyZWQgaGFzIGZlYXR1cmUgXCIke2ZlYXR1cmV9XCJgKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLypcclxuICogT3V0IG9mIHRoZSBib3ggZmVhdHVyZSB0ZXN0c1xyXG4gKi9cclxuLyogRW52aXJvbm1lbnRzICovXHJcbi8qIFVzZWQgYXMgYSB2YWx1ZSB0byBwcm92aWRlIGEgZGVidWcgb25seSBjb2RlIHBhdGggKi9cclxuYWRkKCdkZWJ1ZycsIHRydWUpO1xyXG4vKiBmbGFnIGZvciBkb2pvIGRlYnVnLCBkZWZhdWx0IHRvIGZhbHNlICovXHJcbmFkZCgnZG9qby1kZWJ1ZycsIGZhbHNlKTtcclxuLyogRGV0ZWN0cyBpZiB0aGUgZW52aXJvbm1lbnQgaXMgXCJicm93c2VyIGxpa2VcIiAqL1xyXG5hZGQoJ2hvc3QtYnJvd3NlcicsIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGxvY2F0aW9uICE9PSAndW5kZWZpbmVkJyk7XHJcbi8qIERldGVjdHMgaWYgdGhlIGVudmlyb25tZW50IGFwcGVhcnMgdG8gYmUgTm9kZUpTICovXHJcbmFkZCgnaG9zdC1ub2RlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xyXG4gICAgICAgIHJldHVybiBwcm9jZXNzLnZlcnNpb25zLm5vZGU7XHJcbiAgICB9XHJcbn0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYXMubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9oYXMvaGFzLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL2hhcy9oYXMubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCAqIGFzIHRzbGliXzEgZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnLi4vd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyB2IH0gZnJvbSAnLi4vd2lkZ2V0LWNvcmUvZCc7XG5leHBvcnQgY2xhc3MgTGluayBleHRlbmRzIFdpZGdldEJhc2Uge1xuICAgIF9nZXRQcm9wZXJ0aWVzKCkge1xuICAgICAgICBsZXQgX2EgPSB0aGlzLnByb3BlcnRpZXMsIHsgcm91dGVyS2V5ID0gJ3JvdXRlcicsIHRvLCBpc091dGxldCA9IHRydWUsIHRhcmdldCwgcGFyYW1zID0ge30sIG9uQ2xpY2sgfSA9IF9hLCBwcm9wcyA9IHRzbGliXzEuX19yZXN0KF9hLCBbXCJyb3V0ZXJLZXlcIiwgXCJ0b1wiLCBcImlzT3V0bGV0XCIsIFwidGFyZ2V0XCIsIFwicGFyYW1zXCIsIFwib25DbGlja1wiXSk7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnJlZ2lzdHJ5LmdldEluamVjdG9yKHJvdXRlcktleSk7XG4gICAgICAgIGxldCBocmVmID0gdG87XG4gICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICBjb25zdCByb3V0ZXIgPSBpdGVtLmluamVjdG9yKCk7XG4gICAgICAgICAgICBpZiAoaXNPdXRsZXQpIHtcbiAgICAgICAgICAgICAgICBocmVmID0gcm91dGVyLmxpbmsoaHJlZiwgcGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBvbkNsaWNrICYmIG9uQ2xpY2soZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiBldmVudC5idXR0b24gPT09IDAgJiYgIXRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBocmVmICE9PSB1bmRlZmluZWQgJiYgcm91dGVyLnNldFBhdGgoaHJlZik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHsgb25jbGljaywgaHJlZiB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcHMsIHsgaHJlZiB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIHYoJ2EnLCB0aGlzLl9nZXRQcm9wZXJ0aWVzKCksIHRoaXMuY2hpbGRyZW4pO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IExpbms7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1MaW5rLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvcm91dGluZy9MaW5rLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvTGluay5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0ICogYXMgdHNsaWJfMSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFdpZGdldEJhc2UgfSBmcm9tICcuLi93aWRnZXQtY29yZS9XaWRnZXRCYXNlJztcbmltcG9ydCB7IGFsd2F5c1JlbmRlciB9IGZyb20gJy4uL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYWx3YXlzUmVuZGVyJztcbmltcG9ydCB7IGRpZmZQcm9wZXJ0eSB9IGZyb20gJy4uL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvZGlmZlByb3BlcnR5JztcbmxldCBPdXRsZXQgPSBjbGFzcyBPdXRsZXQgZXh0ZW5kcyBXaWRnZXRCYXNlIHtcbiAgICBvblJvdXRlcktleUNoYW5nZShjdXJyZW50LCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IHsgcm91dGVyS2V5ID0gJ3JvdXRlcicgfSA9IG5leHQ7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnJlZ2lzdHJ5LmdldEluamVjdG9yKHJvdXRlcktleSk7XG4gICAgICAgIGlmICh0aGlzLl9oYW5kbGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZSA9IGl0ZW0uaW52YWxpZGF0b3Iub24oJ2ludmFsaWRhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMub3duKHRoaXMuX2hhbmRsZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25BdHRhY2goKSB7XG4gICAgICAgIGlmICghdGhpcy5faGFuZGxlKSB7XG4gICAgICAgICAgICB0aGlzLm9uUm91dGVyS2V5Q2hhbmdlKHRoaXMucHJvcGVydGllcywgdGhpcy5wcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgcmVuZGVyZXIsIGlkLCByb3V0ZXJLZXkgPSAncm91dGVyJyB9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5yZWdpc3RyeS5nZXRJbmplY3Rvcihyb3V0ZXJLZXkpO1xuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgY29uc3Qgcm91dGVyID0gaXRlbS5pbmplY3RvcigpO1xuICAgICAgICAgICAgY29uc3Qgb3V0bGV0Q29udGV4dCA9IHJvdXRlci5nZXRPdXRsZXQoaWQpO1xuICAgICAgICAgICAgaWYgKG91dGxldENvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHF1ZXJ5UGFyYW1zLCBwYXJhbXMsIHR5cGUsIGlzRXJyb3IsIGlzRXhhY3QgfSA9IG91dGxldENvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVuZGVyZXIoeyBxdWVyeVBhcmFtcywgcGFyYW1zLCB0eXBlLCBpc0Vycm9yLCBpc0V4YWN0LCByb3V0ZXIgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59O1xudHNsaWJfMS5fX2RlY29yYXRlKFtcbiAgICBkaWZmUHJvcGVydHkoJ3JvdXRlcktleScpXG5dLCBPdXRsZXQucHJvdG90eXBlLCBcIm9uUm91dGVyS2V5Q2hhbmdlXCIsIG51bGwpO1xuT3V0bGV0ID0gdHNsaWJfMS5fX2RlY29yYXRlKFtcbiAgICBhbHdheXNSZW5kZXIoKVxuXSwgT3V0bGV0KTtcbmV4cG9ydCB7IE91dGxldCB9O1xuZXhwb3J0IGRlZmF1bHQgT3V0bGV0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9T3V0bGV0Lm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvcm91dGluZy9PdXRsZXQubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvcm91dGluZy9PdXRsZXQubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBRdWV1aW5nRXZlbnRlZCBmcm9tICcuLi9jb3JlL1F1ZXVpbmdFdmVudGVkJztcbmltcG9ydCB7IEhhc2hIaXN0b3J5IH0gZnJvbSAnLi9oaXN0b3J5L0hhc2hIaXN0b3J5JztcbmNvbnN0IFBBUkFNID0gJ19fUEFSQU1fXyc7XG5jb25zdCBwYXJhbVJlZ0V4cCA9IG5ldyBSZWdFeHAoL157Lit9JC8pO1xuY29uc3QgUk9VVEVfU0VHTUVOVF9TQ09SRSA9IDc7XG5jb25zdCBEWU5BTUlDX1NFR01FTlRfUEVOQUxUWSA9IDI7XG5mdW5jdGlvbiBtYXRjaGluZ1BhcmFtcyh7IHBhcmFtczogcHJldmlvdXNQYXJhbXMgfSwgeyBwYXJhbXMgfSkge1xuICAgIGNvbnN0IG1hdGNoaW5nID0gT2JqZWN0LmtleXMocHJldmlvdXNQYXJhbXMpLmV2ZXJ5KChrZXkpID0+IHByZXZpb3VzUGFyYW1zW2tleV0gPT09IHBhcmFtc1trZXldKTtcbiAgICBpZiAoIW1hdGNoaW5nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBhcmFtcykuZXZlcnkoKGtleSkgPT4gcHJldmlvdXNQYXJhbXNba2V5XSA9PT0gcGFyYW1zW2tleV0pO1xufVxuZXhwb3J0IGNsYXNzIFJvdXRlciBleHRlbmRzIFF1ZXVpbmdFdmVudGVkIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9yb3V0ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fb3V0bGV0TWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fbWF0Y2hlZE91dGxldHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9jdXJyZW50UGFyYW1zID0ge307XG4gICAgICAgIHRoaXMuX2N1cnJlbnRRdWVyeVBhcmFtcyA9IHt9O1xuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbGVkIG9uIGNoYW5nZSBvZiB0aGUgcm91dGUgYnkgdGhlIHRoZSByZWdpc3RlcmVkIGhpc3RvcnkgbWFuYWdlci4gTWF0Y2hlcyB0aGUgcGF0aCBhZ2FpbnN0XG4gICAgICAgICAqIHRoZSByZWdpc3RlcmVkIG91dGxldHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSByZXF1ZXN0ZWRQYXRoIFRoZSBwYXRoIG9mIHRoZSByZXF1ZXN0ZWQgcm91dGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29uQ2hhbmdlID0gKHJlcXVlc3RlZFBhdGgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3RlZFBhdGggPSB0aGlzLl9zdHJpcExlYWRpbmdTbGFzaChyZXF1ZXN0ZWRQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzTWF0Y2hlZE91dGxldHMgPSB0aGlzLl9tYXRjaGVkT3V0bGV0cztcbiAgICAgICAgICAgIHRoaXMuX21hdGNoZWRPdXRsZXRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICAgIGNvbnN0IFtwYXRoLCBxdWVyeVBhcmFtU3RyaW5nXSA9IHJlcXVlc3RlZFBhdGguc3BsaXQoJz8nKTtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRRdWVyeVBhcmFtcyA9IHRoaXMuX2dldFF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1TdHJpbmcpO1xuICAgICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBsZXQgcm91dGVDb25maWdzID0gdGhpcy5fcm91dGVzLm1hcCgocm91dGUpID0+ICh7XG4gICAgICAgICAgICAgICAgcm91dGUsXG4gICAgICAgICAgICAgICAgc2VnbWVudHM6IFsuLi5zZWdtZW50c10sXG4gICAgICAgICAgICAgICAgcGFyZW50OiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7fVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgbGV0IHJvdXRlQ29uZmlnO1xuICAgICAgICAgICAgbGV0IG1hdGNoZWRSb3V0ZXMgPSBbXTtcbiAgICAgICAgICAgIHdoaWxlICgocm91dGVDb25maWcgPSByb3V0ZUNvbmZpZ3MucG9wKCkpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyByb3V0ZSwgcGFyZW50LCBzZWdtZW50cywgcGFyYW1zIH0gPSByb3V0ZUNvbmZpZztcbiAgICAgICAgICAgICAgICBsZXQgc2VnbWVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9ICdpbmRleCc7XG4gICAgICAgICAgICAgICAgbGV0IHBhcmFtSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGxldCByb3V0ZU1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoIDwgcm91dGUuc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzZWdtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm91dGUuc2VnbWVudHNbc2VnbWVudEluZGV4XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdwYXJ0aWFsJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlZ21lbnQgPSBzZWdtZW50cy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlLnNlZ21lbnRzW3NlZ21lbnRJbmRleF0gPT09IFBBUkFNKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3JvdXRlLnBhcmFtc1twYXJhbUluZGV4KytdXSA9IHNlZ21lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudFBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX2N1cnJlbnRQYXJhbXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChyb3V0ZS5zZWdtZW50c1tzZWdtZW50SW5kZXhdICE9PSBzZWdtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVNYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJvdXRlTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVDb25maWcudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZWRSb3V0ZXMucHVzaCh7IHJvdXRlLCBwYXJlbnQsIHR5cGUsIHBhcmFtcywgc2VnbWVudHM6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3V0ZUNvbmZpZ3MgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucm91dGVDb25maWdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJvdXRlLmNoaWxkcmVuLm1hcCgoY2hpbGRSb3V0ZSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91dGU6IGNoaWxkUm91dGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzOiBbLi4uc2VnbWVudHNdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHJvdXRlQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IE9iamVjdC5hc3NpZ24oe30sIHBhcmFtcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbWF0Y2hlZE91dGxldE5hbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBsZXQgbWF0Y2hlZFJvdXRlID0gbWF0Y2hlZFJvdXRlcy5yZWR1Y2UoKG1hdGNoLCBtYXRjaGVkUm91dGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVkUm91dGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtYXRjaC5yb3V0ZS5zY29yZSA+IG1hdGNoZWRSb3V0ZS5yb3V0ZS5zY29yZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVkUm91dGU7XG4gICAgICAgICAgICB9LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgaWYgKG1hdGNoZWRSb3V0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaGVkUm91dGUudHlwZSA9PT0gJ3BhcnRpYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZWRSb3V0ZS50eXBlID0gJ2Vycm9yJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF0Y2hlZE91dGxldE5hbWUgPSBtYXRjaGVkUm91dGUucm91dGUub3V0bGV0O1xuICAgICAgICAgICAgICAgIHdoaWxlIChtYXRjaGVkUm91dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHsgdHlwZSwgcGFyYW1zLCBwYXJlbnQsIHJvdXRlIH0gPSBtYXRjaGVkUm91dGU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZWRPdXRsZXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcm91dGUub3V0bGV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlQYXJhbXM6IHRoaXMuX2N1cnJlbnRRdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0Vycm9yOiAoKSA9PiB0eXBlID09PSAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNFeGFjdDogKCkgPT4gdHlwZSA9PT0gJ2luZGV4J1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c01hdGNoZWRPdXRsZXQgPSBwcmV2aW91c01hdGNoZWRPdXRsZXRzW3JvdXRlLm91dGxldF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hdGNoZWRPdXRsZXRzW3JvdXRlLm91dGxldF0gPSBtYXRjaGVkT3V0bGV0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXByZXZpb3VzTWF0Y2hlZE91dGxldCB8fCAhbWF0Y2hpbmdQYXJhbXMocHJldmlvdXNNYXRjaGVkT3V0bGV0LCBtYXRjaGVkT3V0bGV0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KHsgdHlwZTogJ291dGxldCcsIG91dGxldDogbWF0Y2hlZE91dGxldCwgYWN0aW9uOiAnZW50ZXInIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZWRSb3V0ZSA9IHBhcmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXRjaGVkT3V0bGV0cy5lcnJvck91dGxldCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdlcnJvck91dGxldCcsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgaXNFcnJvcjogKCkgPT4gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaXNFeGFjdDogKCkgPT4gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNNYXRjaGVkT3V0bGV0S2V5cyA9IE9iamVjdC5rZXlzKHByZXZpb3VzTWF0Y2hlZE91dGxldHMpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmV2aW91c01hdGNoZWRPdXRsZXRLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gcHJldmlvdXNNYXRjaGVkT3V0bGV0S2V5c1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVkT3V0bGV0ID0gdGhpcy5fbWF0Y2hlZE91dGxldHNba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRPdXRsZXQgfHwgIW1hdGNoaW5nUGFyYW1zKHByZXZpb3VzTWF0Y2hlZE91dGxldHNba2V5XSwgbWF0Y2hlZE91dGxldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KHsgdHlwZTogJ291dGxldCcsIG91dGxldDogcHJldmlvdXNNYXRjaGVkT3V0bGV0c1trZXldLCBhY3Rpb246ICdleGl0JyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmVtaXQoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICduYXYnLFxuICAgICAgICAgICAgICAgIG91dGxldDogbWF0Y2hlZE91dGxldE5hbWUsXG4gICAgICAgICAgICAgICAgY29udGV4dDogbWF0Y2hlZE91dGxldE5hbWUgPyB0aGlzLl9tYXRjaGVkT3V0bGV0c1ttYXRjaGVkT3V0bGV0TmFtZV0gOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7IEhpc3RvcnlNYW5hZ2VyID0gSGFzaEhpc3RvcnksIGJhc2UsIHdpbmRvdyB9ID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXIoY29uZmlnKTtcbiAgICAgICAgdGhpcy5faGlzdG9yeSA9IG5ldyBIaXN0b3J5TWFuYWdlcih7IG9uQ2hhbmdlOiB0aGlzLl9vbkNoYW5nZSwgYmFzZSwgd2luZG93IH0pO1xuICAgICAgICBpZiAodGhpcy5fbWF0Y2hlZE91dGxldHMuZXJyb3JPdXRsZXQgJiYgdGhpcy5fZGVmYXVsdE91dGxldCkge1xuICAgICAgICAgICAgY29uc3QgcGF0aCA9IHRoaXMubGluayh0aGlzLl9kZWZhdWx0T3V0bGV0KTtcbiAgICAgICAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHBhdGggYWdhaW5zdCB0aGUgcmVnaXN0ZXJlZCBoaXN0b3J5IG1hbmFnZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHRvIHNldCBvbiB0aGUgaGlzdG9yeSBtYW5hZ2VyXG4gICAgICovXG4gICAgc2V0UGF0aChwYXRoKSB7XG4gICAgICAgIHRoaXMuX2hpc3Rvcnkuc2V0KHBhdGgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIGxpbmsgZm9yIGEgZ2l2ZW4gb3V0bGV0IGlkZW50aWZpZXIgYW5kIG9wdGlvbmFsIHBhcmFtcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvdXRsZXQgVGhlIG91dGxldCB0byBnZW5lcmF0ZSBhIGxpbmsgZm9yXG4gICAgICogQHBhcmFtIHBhcmFtcyBPcHRpb25hbCBQYXJhbXMgZm9yIHRoZSBnZW5lcmF0ZWQgbGlua1xuICAgICAqL1xuICAgIGxpbmsob3V0bGV0LCBwYXJhbXMgPSB7fSkge1xuICAgICAgICBjb25zdCB7IF9vdXRsZXRNYXAsIF9jdXJyZW50UGFyYW1zLCBfY3VycmVudFF1ZXJ5UGFyYW1zIH0gPSB0aGlzO1xuICAgICAgICBsZXQgcm91dGUgPSBfb3V0bGV0TWFwW291dGxldF07XG4gICAgICAgIGlmIChyb3V0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxpbmtQYXRoID0gcm91dGUuZnVsbFBhdGg7XG4gICAgICAgIGlmIChyb3V0ZS5mdWxsUXVlcnlQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5U3RyaW5nID0gcm91dGUuZnVsbFF1ZXJ5UGFyYW1zLnJlZHVjZSgocXVlcnlQYXJhbVN0cmluZywgcGFyYW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7cXVlcnlQYXJhbVN0cmluZ30mJHtwYXJhbX09eyR7cGFyYW19fWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBgPyR7cGFyYW19PXske3BhcmFtfX1gO1xuICAgICAgICAgICAgfSwgJycpO1xuICAgICAgICAgICAgbGlua1BhdGggPSBgJHtsaW5rUGF0aH0ke3F1ZXJ5U3RyaW5nfWA7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgcm91dGUuZGVmYXVsdFBhcmFtcywgX2N1cnJlbnRRdWVyeVBhcmFtcywgX2N1cnJlbnRQYXJhbXMsIHBhcmFtcyk7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCA9PT0gMCAmJiByb3V0ZS5mdWxsUGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnVsbFBhcmFtcyA9IFsuLi5yb3V0ZS5mdWxsUGFyYW1zLCAuLi5yb3V0ZS5mdWxsUXVlcnlQYXJhbXNdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZ1bGxQYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtID0gZnVsbFBhcmFtc1tpXTtcbiAgICAgICAgICAgIGlmIChwYXJhbXNbcGFyYW1dKSB7XG4gICAgICAgICAgICAgICAgbGlua1BhdGggPSBsaW5rUGF0aC5yZXBsYWNlKGB7JHtwYXJhbX19YCwgcGFyYW1zW3BhcmFtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5rUGF0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgb3V0bGV0IGNvbnRleHQgZm9yIHRoZSBvdXRsZXQgaWRlbnRpZmllciBpZiBvbmUgaGFzIGJlZW4gbWF0Y2hlZFxuICAgICAqXG4gICAgICogQHBhcmFtIG91dGxldElkZW50aWZpZXIgVGhlIG91dGxldCBpZGVudGlmZXJcbiAgICAgKi9cbiAgICBnZXRPdXRsZXQob3V0bGV0SWRlbnRpZmllcikge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWF0Y2hlZE91dGxldHNbb3V0bGV0SWRlbnRpZmllcl07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIHRoZSBwYXJhbXMgZm9yIHRoZSBjdXJyZW50IG1hdGNoZWQgb3V0bGV0c1xuICAgICAqL1xuICAgIGdldCBjdXJyZW50UGFyYW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudFBhcmFtcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RyaXBzIHRoZSBsZWFkaW5nIHNsYXNoIG9uIGEgcGF0aCBpZiBvbmUgZXhpc3RzXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byBzdHJpcCBhIGxlYWRpbmcgc2xhc2hcbiAgICAgKi9cbiAgICBfc3RyaXBMZWFkaW5nU2xhc2gocGF0aCkge1xuICAgICAgICBpZiAocGF0aFswXSA9PT0gJy8nKSB7XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIHRoZSByb3V0aW5nIGNvbmZpZ3VyYXRpb25cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAcGFyYW0gcm91dGVzIFRoZSByb3V0ZXNcbiAgICAgKiBAcGFyYW0gcGFyZW50Um91dGUgVGhlIHBhcmVudCByb3V0ZVxuICAgICAqL1xuICAgIF9yZWdpc3Rlcihjb25maWcsIHJvdXRlcywgcGFyZW50Um91dGUpIHtcbiAgICAgICAgcm91dGVzID0gcm91dGVzID8gcm91dGVzIDogdGhpcy5fcm91dGVzO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbmZpZy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHsgcGF0aCwgb3V0bGV0LCBjaGlsZHJlbiwgZGVmYXVsdFJvdXRlID0gZmFsc2UsIGRlZmF1bHRQYXJhbXMgPSB7fSB9ID0gY29uZmlnW2ldO1xuICAgICAgICAgICAgbGV0IFtwYXJzZWRQYXRoLCBxdWVyeVBhcmFtU3RyaW5nXSA9IHBhdGguc3BsaXQoJz8nKTtcbiAgICAgICAgICAgIGxldCBxdWVyeVBhcmFtcyA9IFtdO1xuICAgICAgICAgICAgcGFyc2VkUGF0aCA9IHRoaXMuX3N0cmlwTGVhZGluZ1NsYXNoKHBhcnNlZFBhdGgpO1xuICAgICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBwYXJzZWRQYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBjb25zdCByb3V0ZSA9IHtcbiAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgIG91dGxldCxcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXJzZWRQYXRoLFxuICAgICAgICAgICAgICAgIHNlZ21lbnRzLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRQYXJhbXM6IHBhcmVudFJvdXRlID8gT2JqZWN0LmFzc2lnbih7fSwgcGFyZW50Um91dGUuZGVmYXVsdFBhcmFtcywgZGVmYXVsdFBhcmFtcykgOiBkZWZhdWx0UGFyYW1zLFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgICAgICBmdWxsUGF0aDogcGFyZW50Um91dGUgPyBgJHtwYXJlbnRSb3V0ZS5mdWxsUGF0aH0vJHtwYXJzZWRQYXRofWAgOiBwYXJzZWRQYXRoLFxuICAgICAgICAgICAgICAgIGZ1bGxQYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgIGZ1bGxRdWVyeVBhcmFtczogW10sXG4gICAgICAgICAgICAgICAgc2NvcmU6IHBhcmVudFJvdXRlID8gcGFyZW50Um91dGUuc2NvcmUgOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRSb3V0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRPdXRsZXQgPSBvdXRsZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VnbWVudCA9IHNlZ21lbnRzW2ldO1xuICAgICAgICAgICAgICAgIHJvdXRlLnNjb3JlICs9IFJPVVRFX1NFR01FTlRfU0NPUkU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtUmVnRXhwLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcm91dGUuc2NvcmUgLT0gRFlOQU1JQ19TRUdNRU5UX1BFTkFMVFk7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlLnBhcmFtcy5wdXNoKHNlZ21lbnQucmVwbGFjZSgneycsICcnKS5yZXBsYWNlKCd9JywgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgc2VnbWVudHNbaV0gPSBQQVJBTTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocXVlcnlQYXJhbVN0cmluZykge1xuICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW1zID0gcXVlcnlQYXJhbVN0cmluZy5zcGxpdCgnJicpLm1hcCgocXVlcnlQYXJhbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVlcnlQYXJhbS5yZXBsYWNlKCd7JywgJycpLnJlcGxhY2UoJ30nLCAnJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByb3V0ZS5mdWxsUXVlcnlQYXJhbXMgPSBwYXJlbnRSb3V0ZSA/IFsuLi5wYXJlbnRSb3V0ZS5mdWxsUXVlcnlQYXJhbXMsIC4uLnF1ZXJ5UGFyYW1zXSA6IHF1ZXJ5UGFyYW1zO1xuICAgICAgICAgICAgcm91dGUuZnVsbFBhcmFtcyA9IHBhcmVudFJvdXRlID8gWy4uLnBhcmVudFJvdXRlLmZ1bGxQYXJhbXMsIC4uLnJvdXRlLnBhcmFtc10gOiByb3V0ZS5wYXJhbXM7XG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyKGNoaWxkcmVuLCByb3V0ZS5jaGlsZHJlbiwgcm91dGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fb3V0bGV0TWFwW291dGxldF0gPSByb3V0ZTtcbiAgICAgICAgICAgIHJvdXRlcy5wdXNoKHJvdXRlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIG9iamVjdCBvZiBxdWVyeSBwYXJhbXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBxdWVyeVBhcmFtU3RyaW5nIFRoZSBzdHJpbmcgb2YgcXVlcnkgcGFyYW1zLCBlLmcgYHBhcmFtT25lPW9uZSZwYXJhbVR3bz10d29gXG4gICAgICovXG4gICAgX2dldFF1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1TdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSB7fTtcbiAgICAgICAgaWYgKHF1ZXJ5UGFyYW1TdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1ldGVycyA9IHF1ZXJ5UGFyYW1TdHJpbmcuc3BsaXQoJyYnKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcXVlcnlQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gcXVlcnlQYXJhbWV0ZXJzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICAgICAgcXVlcnlQYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeVBhcmFtcztcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBSb3V0ZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Sb3V0ZXIubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlci5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlci5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0ICogYXMgdHNsaWJfMSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJy4vUm91dGVyJztcbi8qKlxuICogQ3JlYXRlcyBhIHJvdXRlciBpbnN0YW5jZSBmb3IgYSBzcGVjaWZpYyBIaXN0b3J5IG1hbmFnZXIgKGRlZmF1bHQgaXMgYEhhc2hIaXN0b3J5YCkgYW5kIHJlZ2lzdGVyc1xuICogdGhlIHJvdXRlIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogQHBhcmFtIGNvbmZpZyBUaGUgcm91dGUgY29uZmlnIHRvIHJlZ2lzdGVyIGZvciB0aGUgcm91dGVyXG4gKiBAcGFyYW0gcmVnaXN0cnkgQW4gb3B0aW9uYWwgcmVnaXN0cnkgdGhhdCBkZWZhdWx0cyB0byB0aGUgZ2xvYmFsIHJlZ2lzdHJ5XG4gKiBAcGFyYW0gb3B0aW9ucyBUaGUgcm91dGVyIGluamVjdG9yIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyUm91dGVySW5qZWN0b3IoY29uZmlnLCByZWdpc3RyeSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBrZXkgPSAncm91dGVyJyB9ID0gb3B0aW9ucywgcm91dGVyT3B0aW9ucyA9IHRzbGliXzEuX19yZXN0KG9wdGlvbnMsIFtcImtleVwiXSk7XG4gICAgaWYgKHJlZ2lzdHJ5Lmhhc0luamVjdG9yKGtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSb3V0ZXIgaGFzIGFscmVhZHkgYmVlbiBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGNvbnN0IHJvdXRlciA9IG5ldyBSb3V0ZXIoY29uZmlnLCByb3V0ZXJPcHRpb25zKTtcbiAgICByZWdpc3RyeS5kZWZpbmVJbmplY3RvcihrZXksIChpbnZhbGlkYXRvcikgPT4ge1xuICAgICAgICByb3V0ZXIub24oJ25hdicsICgpID0+IGludmFsaWRhdG9yKCkpO1xuICAgICAgICByZXR1cm4gKCkgPT4gcm91dGVyO1xuICAgIH0pO1xuICAgIHJldHVybiByb3V0ZXI7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Sb3V0ZXJJbmplY3Rvci5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvUm91dGVySW5qZWN0b3IubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvcm91dGluZy9Sb3V0ZXJJbmplY3Rvci5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuLi8uLi9zaGltL2dsb2JhbCc7XG5leHBvcnQgY2xhc3MgSGFzaEhpc3Rvcnkge1xuICAgIGNvbnN0cnVjdG9yKHsgd2luZG93ID0gZ2xvYmFsLndpbmRvdywgb25DaGFuZ2UgfSkge1xuICAgICAgICB0aGlzLl9vbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQgPSB0aGlzLm5vcm1hbGl6ZVBhdGgodGhpcy5fd2luZG93LmxvY2F0aW9uLmhhc2gpO1xuICAgICAgICAgICAgdGhpcy5fb25DaGFuZ2VGdW5jdGlvbih0aGlzLl9jdXJyZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2VGdW5jdGlvbiA9IG9uQ2hhbmdlO1xuICAgICAgICB0aGlzLl93aW5kb3cgPSB3aW5kb3c7XG4gICAgICAgIHRoaXMuX3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IHRoaXMubm9ybWFsaXplUGF0aCh0aGlzLl93aW5kb3cubG9jYXRpb24uaGFzaCk7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlRnVuY3Rpb24odGhpcy5fY3VycmVudCk7XG4gICAgfVxuICAgIG5vcm1hbGl6ZVBhdGgocGF0aCkge1xuICAgICAgICByZXR1cm4gcGF0aC5yZXBsYWNlKCcjJywgJycpO1xuICAgIH1cbiAgICBwcmVmaXgocGF0aCkge1xuICAgICAgICBpZiAocGF0aFswXSAhPT0gJyMnKSB7XG4gICAgICAgICAgICByZXR1cm4gYCMke3BhdGh9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aDtcbiAgICB9XG4gICAgc2V0KHBhdGgpIHtcbiAgICAgICAgdGhpcy5fd2luZG93LmxvY2F0aW9uLmhhc2ggPSB0aGlzLnByZWZpeChwYXRoKTtcbiAgICB9XG4gICAgZ2V0IGN1cnJlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50O1xuICAgIH1cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLl93aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRoaXMuX29uQ2hhbmdlKTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBIYXNoSGlzdG9yeTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUhhc2hIaXN0b3J5Lm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvcm91dGluZy9oaXN0b3J5L0hhc2hIaXN0b3J5Lm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvaGlzdG9yeS9IYXNoSGlzdG9yeS5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgaXNBcnJheUxpa2UsIFNoaW1JdGVyYXRvciB9IGZyb20gJy4vaXRlcmF0b3InO1xyXG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IHsgaXMgYXMgb2JqZWN0SXMgfSBmcm9tICcuL29iamVjdCc7XHJcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XHJcbmltcG9ydCAnLi9TeW1ib2wnO1xyXG5leHBvcnQgbGV0IE1hcCA9IGdsb2JhbC5NYXA7XHJcbmlmICghdHJ1ZSkge1xyXG4gICAgTWFwID0gKF9hID0gY2xhc3MgTWFwIHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IoaXRlcmFibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpc1tTeW1ib2wudG9TdHJpbmdUYWddID0gJ01hcCc7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlcmFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBcnJheUxpa2UoaXRlcmFibGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaXRlcmFibGVbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCh2YWx1ZVswXSwgdmFsdWVbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldCh2YWx1ZVswXSwgdmFsdWVbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBBbiBhbHRlcm5hdGl2ZSB0byBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiB1c2luZyBPYmplY3QuaXNcclxuICAgICAgICAgICAgICogdG8gY2hlY2sgZm9yIGVxdWFsaXR5LiBTZWUgaHR0cDovL216bC5sYS8xenVLTzJWXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBfaW5kZXhPZktleShrZXlzLCBrZXkpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iamVjdElzKGtleXNbaV0sIGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdldCBzaXplKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2tleXMubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5sZW5ndGggPSB0aGlzLl92YWx1ZXMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGUoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVudHJpZXMoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLl9rZXlzLm1hcCgoa2V5LCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtrZXksIHRoaXMuX3ZhbHVlc1tpXV07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHZhbHVlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yRWFjaChjYWxsYmFjaywgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qga2V5cyA9IHRoaXMuX2tleXM7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLl92YWx1ZXM7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdmFsdWVzW2ldLCBrZXlzW2ldLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnZXQoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiB0aGlzLl92YWx1ZXNbaW5kZXhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhcyhrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSkgPiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBrZXlzKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fa2V5cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0KGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KTtcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gaW5kZXggPCAwID8gdGhpcy5fa2V5cy5sZW5ndGggOiBpbmRleDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXNbaW5kZXhdID0ga2V5O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFsdWVzKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fdmFsdWVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVudHJpZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX2FbU3ltYm9sLnNwZWNpZXNdID0gX2EsXHJcbiAgICAgICAgX2EpO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IE1hcDtcclxudmFyIF9hO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1NYXAubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL01hcC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL01hcC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCB7IHF1ZXVlTWljcm9UYXNrIH0gZnJvbSAnLi9zdXBwb3J0L3F1ZXVlJztcclxuaW1wb3J0ICcuL1N5bWJvbCc7XHJcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XHJcbmV4cG9ydCBsZXQgU2hpbVByb21pc2UgPSBnbG9iYWwuUHJvbWlzZTtcclxuZXhwb3J0IGNvbnN0IGlzVGhlbmFibGUgPSBmdW5jdGlvbiBpc1RoZW5hYmxlKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XHJcbn07XHJcbmlmICghdHJ1ZSkge1xyXG4gICAgZ2xvYmFsLlByb21pc2UgPSBTaGltUHJvbWlzZSA9IChfYSA9IGNsYXNzIFByb21pc2Uge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogQ3JlYXRlcyBhIG5ldyBQcm9taXNlLlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogQHBhcmFtIGV4ZWN1dG9yXHJcbiAgICAgICAgICAgICAqIFRoZSBleGVjdXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgaW1tZWRpYXRlbHkgd2hlbiB0aGUgUHJvbWlzZSBpcyBpbnN0YW50aWF0ZWQuIEl0IGlzIHJlc3BvbnNpYmxlIGZvclxyXG4gICAgICAgICAgICAgKiBzdGFydGluZyB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiB3aGVuIGl0IGlzIGludm9rZWQuXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIFRoZSBleGVjdXRvciBtdXN0IGNhbGwgZWl0aGVyIHRoZSBwYXNzZWQgYHJlc29sdmVgIGZ1bmN0aW9uIHdoZW4gdGhlIGFzeW5jaHJvbm91cyBvcGVyYXRpb24gaGFzIGNvbXBsZXRlZFxyXG4gICAgICAgICAgICAgKiBzdWNjZXNzZnVsbHksIG9yIHRoZSBgcmVqZWN0YCBmdW5jdGlvbiB3aGVuIHRoZSBvcGVyYXRpb24gZmFpbHMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihleGVjdXRvcikge1xyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGlzIHByb21pc2UuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAxIC8qIFBlbmRpbmcgKi87XHJcbiAgICAgICAgICAgICAgICB0aGlzW1N5bWJvbC50b1N0cmluZ1RhZ10gPSAnUHJvbWlzZSc7XHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIElmIHRydWUsIHRoZSByZXNvbHV0aW9uIG9mIHRoaXMgcHJvbWlzZSBpcyBjaGFpbmVkIChcImxvY2tlZCBpblwiKSB0byBhbm90aGVyIHByb21pc2UuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBpc0NoYWluZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogV2hldGhlciBvciBub3QgdGhpcyBwcm9taXNlIGlzIGluIGEgcmVzb2x2ZWQgc3RhdGUuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmVzb2x2ZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgIT09IDEgLyogUGVuZGluZyAqLyB8fCBpc0NoYWluZWQ7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBDYWxsYmFja3MgdGhhdCBzaG91bGQgYmUgaW52b2tlZCBvbmNlIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWQuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFja3MgPSBbXTtcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogSW5pdGlhbGx5IHB1c2hlcyBjYWxsYmFja3Mgb250byBhIHF1ZXVlIGZvciBleGVjdXRpb24gb25jZSB0aGlzIHByb21pc2Ugc2V0dGxlcy4gQWZ0ZXIgdGhlIHByb21pc2Ugc2V0dGxlcyxcclxuICAgICAgICAgICAgICAgICAqIGVucXVldWVzIGNhbGxiYWNrcyBmb3IgZXhlY3V0aW9uIG9uIHRoZSBuZXh0IGV2ZW50IGxvb3AgdHVybi5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgbGV0IHdoZW5GaW5pc2hlZCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIFNldHRsZXMgdGhpcyBwcm9taXNlLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSBuZXdTdGF0ZSBUaGUgcmVzb2x2ZWQgc3RhdGUgZm9yIHRoaXMgcHJvbWlzZS5cclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7VHxhbnl9IHZhbHVlIFRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhpcyBwcm9taXNlLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0bGUgPSAobmV3U3RhdGUsIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBwcm9taXNlIGNhbiBvbmx5IGJlIHNldHRsZWQgb25jZS5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZSAhPT0gMSAvKiBQZW5kaW5nICovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IG5ld1N0YXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZWRWYWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHdoZW5GaW5pc2hlZCA9IHF1ZXVlTWljcm9UYXNrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgZW5xdWV1ZSBhIGNhbGxiYWNrIHJ1bm5lciBpZiB0aGVyZSBhcmUgY2FsbGJhY2tzIHNvIHRoYXQgaW5pdGlhbGx5IGZ1bGZpbGxlZCBQcm9taXNlcyBkb24ndCBoYXZlIHRvXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2FpdCBhbiBleHRyYSB0dXJuLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3MgJiYgY2FsbGJhY2tzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb1Rhc2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb3VudCA9IGNhbGxiYWNrcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrc1tpXS5jYWxsKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja3MgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBSZXNvbHZlcyB0aGlzIHByb21pc2UuXHJcbiAgICAgICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIG5ld1N0YXRlIFRoZSByZXNvbHZlZCBzdGF0ZSBmb3IgdGhpcyBwcm9taXNlLlxyXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtUfGFueX0gdmFsdWUgVGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGlzIHByb21pc2UuXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc29sdmUgPSAobmV3U3RhdGUsIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUmVzb2x2ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1RoZW5hYmxlKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS50aGVuKHNldHRsZS5iaW5kKG51bGwsIDAgLyogRnVsZmlsbGVkICovKSwgc2V0dGxlLmJpbmQobnVsbCwgMiAvKiBSZWplY3RlZCAqLykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0NoYWluZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGxlKG5ld1N0YXRlLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGhlbiA9IChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoZW5GaW5pc2hlZCBpbml0aWFsbHkgcXVldWVzIHVwIGNhbGxiYWNrcyBmb3IgZXhlY3V0aW9uIGFmdGVyIHRoZSBwcm9taXNlIGhhcyBzZXR0bGVkLiBPbmNlIHRoZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm9taXNlIGhhcyBzZXR0bGVkLCB3aGVuRmluaXNoZWQgd2lsbCBzY2hlZHVsZSBjYWxsYmFja3MgZm9yIGV4ZWN1dGlvbiBvbiB0aGUgbmV4dCB0dXJuIHRocm91Z2ggdGhlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV2ZW50IGxvb3AuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW5GaW5pc2hlZCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMuc3RhdGUgPT09IDIgLyogUmVqZWN0ZWQgKi8gPyBvblJlamVjdGVkIDogb25GdWxmaWxsZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYWxsYmFjayh0aGlzLnJlc29sdmVkVmFsdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gMiAvKiBSZWplY3RlZCAqLykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh0aGlzLnJlc29sdmVkVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc29sdmVkVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4ZWN1dG9yKHJlc29sdmUuYmluZChudWxsLCAwIC8qIEZ1bGZpbGxlZCAqLyksIHJlc29sdmUuYmluZChudWxsLCAyIC8qIFJlamVjdGVkICovKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXR0bGUoMiAvKiBSZWplY3RlZCAqLywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0YXRpYyBhbGwoaXRlcmFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBsZXRlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG90YWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3B1bGF0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsrY29tcGxldGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3B1bGF0aW5nIHx8IGNvbXBsZXRlIDwgdG90YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NJdGVtKGluZGV4LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsrdG90YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1RoZW5hYmxlKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBhbiBpdGVtIFByb21pc2UgcmVqZWN0cywgdGhpcyBQcm9taXNlIGlzIGltbWVkaWF0ZWx5IHJlamVjdGVkIHdpdGggdGhlIGl0ZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb21pc2UncyByZWplY3Rpb24gZXJyb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRoZW4oZnVsZmlsbC5iaW5kKG51bGwsIGluZGV4KSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShpdGVtKS50aGVuKGZ1bGZpbGwuYmluZChudWxsLCBpbmRleCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NJdGVtKGksIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwb3B1bGF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGF0aWMgcmFjZShpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlcmFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIFByb21pc2UgaXRlbSByZWplY3RzLCB0aGlzIFByb21pc2UgaXMgaW1tZWRpYXRlbHkgcmVqZWN0ZWQgd2l0aCB0aGUgaXRlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvbWlzZSdzIHJlamVjdGlvbiBlcnJvci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGl0ZW0pLnRoZW4ocmVzb2x2ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGF0aWMgcmVqZWN0KHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0YXRpYyByZXNvbHZlKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24gKHJlc29sdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoKG9uUmVqZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX2FbU3ltYm9sLnNwZWNpZXNdID0gU2hpbVByb21pc2UsXHJcbiAgICAgICAgX2EpO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFNoaW1Qcm9taXNlO1xyXG52YXIgX2E7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVByb21pc2UubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1Byb21pc2UubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9Qcm9taXNlLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IHsgaXNBcnJheUxpa2UsIFNoaW1JdGVyYXRvciB9IGZyb20gJy4vaXRlcmF0b3InO1xyXG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xyXG5pbXBvcnQgJy4vU3ltYm9sJztcclxuZXhwb3J0IGxldCBTZXQgPSBnbG9iYWwuU2V0O1xyXG5pZiAoIXRydWUpIHtcclxuICAgIFNldCA9IChfYSA9IGNsYXNzIFNldCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXREYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzW1N5bWJvbC50b1N0cmluZ1RhZ10gPSAnU2V0JztcclxuICAgICAgICAgICAgICAgIGlmIChpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0FycmF5TGlrZShpdGVyYWJsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGQoaXRlcmFibGVbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oYXModmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXREYXRhLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xlYXIoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXREYXRhLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSB0aGlzLl9zZXREYXRhLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXREYXRhLnNwbGljZShpZHgsIDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZW50cmllcygpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX3NldERhdGEubWFwKCh2YWx1ZSkgPT4gW3ZhbHVlLCB2YWx1ZV0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gdGhpcy52YWx1ZXMoKTtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIXJlc3VsdC5kb25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tmbi5jYWxsKHRoaXNBcmcsIHJlc3VsdC52YWx1ZSwgcmVzdWx0LnZhbHVlLCB0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFzKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0RGF0YS5pbmRleE9mKHZhbHVlKSA+IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGtleXMoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih0aGlzLl9zZXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnZXQgc2l6ZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZXREYXRhLmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YWx1ZXMoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih0aGlzLl9zZXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX3NldERhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfYVtTeW1ib2wuc3BlY2llc10gPSBfYSxcclxuICAgICAgICBfYSk7XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgU2V0O1xyXG52YXIgX2E7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNldC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vU2V0Lm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vU2V0Lm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xyXG5pbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IHsgZ2V0VmFsdWVEZXNjcmlwdG9yIH0gZnJvbSAnLi9zdXBwb3J0L3V0aWwnO1xyXG5leHBvcnQgbGV0IFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XHJcbmlmICghdHJ1ZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaHJvd3MgaWYgdGhlIHZhbHVlIGlzIG5vdCBhIHN5bWJvbCwgdXNlZCBpbnRlcm5hbGx5IHdpdGhpbiB0aGUgU2hpbVxyXG4gICAgICogQHBhcmFtICB7YW55fSAgICB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2tcclxuICAgICAqIEByZXR1cm4ge3N5bWJvbH0gICAgICAgUmV0dXJucyB0aGUgc3ltYm9sIG9yIHRocm93c1xyXG4gICAgICovXHJcbiAgICBjb25zdCB2YWxpZGF0ZVN5bWJvbCA9IGZ1bmN0aW9uIHZhbGlkYXRlU3ltYm9sKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcih2YWx1ZSArICcgaXMgbm90IGEgc3ltYm9sJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH07XHJcbiAgICBjb25zdCBkZWZpbmVQcm9wZXJ0aWVzID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XHJcbiAgICBjb25zdCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcclxuICAgIGNvbnN0IGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XHJcbiAgICBjb25zdCBvYmpQcm90b3R5cGUgPSBPYmplY3QucHJvdG90eXBlO1xyXG4gICAgY29uc3QgZ2xvYmFsU3ltYm9scyA9IHt9O1xyXG4gICAgY29uc3QgZ2V0U3ltYm9sTmFtZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc3QgY3JlYXRlZCA9IGNyZWF0ZShudWxsKTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRlc2MpIHtcclxuICAgICAgICAgICAgbGV0IHBvc3RmaXggPSAwO1xyXG4gICAgICAgICAgICBsZXQgbmFtZTtcclxuICAgICAgICAgICAgd2hpbGUgKGNyZWF0ZWRbU3RyaW5nKGRlc2MpICsgKHBvc3RmaXggfHwgJycpXSkge1xyXG4gICAgICAgICAgICAgICAgKytwb3N0Zml4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlc2MgKz0gU3RyaW5nKHBvc3RmaXggfHwgJycpO1xyXG4gICAgICAgICAgICBjcmVhdGVkW2Rlc2NdID0gdHJ1ZTtcclxuICAgICAgICAgICAgbmFtZSA9ICdAQCcgKyBkZXNjO1xyXG4gICAgICAgICAgICAvLyBGSVhNRTogVGVtcG9yYXJ5IGd1YXJkIHVudGlsIHRoZSBkdXBsaWNhdGUgZXhlY3V0aW9uIHdoZW4gdGVzdGluZyBjYW4gYmVcclxuICAgICAgICAgICAgLy8gcGlubmVkIGRvd24uXHJcbiAgICAgICAgICAgIGlmICghT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmpQcm90b3R5cGUsIG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShvYmpQcm90b3R5cGUsIG5hbWUsIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCBnZXRWYWx1ZURlc2NyaXB0b3IodmFsdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICB9O1xyXG4gICAgfSkoKTtcclxuICAgIGNvbnN0IEludGVybmFsU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKGRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBJbnRlcm5hbFN5bWJvbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUeXBlRXJyb3I6IFN5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gU3ltYm9sKGRlc2NyaXB0aW9uKTtcclxuICAgIH07XHJcbiAgICBTeW1ib2wgPSBnbG9iYWwuU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKGRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBTeW1ib2wpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVHlwZUVycm9yOiBTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3InKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3ltID0gT2JqZWN0LmNyZWF0ZShJbnRlcm5hbFN5bWJvbC5wcm90b3R5cGUpO1xyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24gPT09IHVuZGVmaW5lZCA/ICcnIDogU3RyaW5nKGRlc2NyaXB0aW9uKTtcclxuICAgICAgICByZXR1cm4gZGVmaW5lUHJvcGVydGllcyhzeW0sIHtcclxuICAgICAgICAgICAgX19kZXNjcmlwdGlvbl9fOiBnZXRWYWx1ZURlc2NyaXB0b3IoZGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICBfX25hbWVfXzogZ2V0VmFsdWVEZXNjcmlwdG9yKGdldFN5bWJvbE5hbWUoZGVzY3JpcHRpb24pKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIC8qIERlY29yYXRlIHRoZSBTeW1ib2wgZnVuY3Rpb24gd2l0aCB0aGUgYXBwcm9wcmlhdGUgcHJvcGVydGllcyAqL1xyXG4gICAgZGVmaW5lUHJvcGVydHkoU3ltYm9sLCAnZm9yJywgZ2V0VmFsdWVEZXNjcmlwdG9yKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICBpZiAoZ2xvYmFsU3ltYm9sc1trZXldKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWxTeW1ib2xzW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoZ2xvYmFsU3ltYm9sc1trZXldID0gU3ltYm9sKFN0cmluZyhrZXkpKSk7XHJcbiAgICB9KSk7XHJcbiAgICBkZWZpbmVQcm9wZXJ0aWVzKFN5bWJvbCwge1xyXG4gICAgICAgIGtleUZvcjogZ2V0VmFsdWVEZXNjcmlwdG9yKGZ1bmN0aW9uIChzeW0pIHtcclxuICAgICAgICAgICAgbGV0IGtleTtcclxuICAgICAgICAgICAgdmFsaWRhdGVTeW1ib2woc3ltKTtcclxuICAgICAgICAgICAgZm9yIChrZXkgaW4gZ2xvYmFsU3ltYm9scykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGdsb2JhbFN5bWJvbHNba2V5XSA9PT0gc3ltKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIGhhc0luc3RhbmNlOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignaGFzSW5zdGFuY2UnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICBpc0NvbmNhdFNwcmVhZGFibGU6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdpc0NvbmNhdFNwcmVhZGFibGUnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICBpdGVyYXRvcjogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ2l0ZXJhdG9yJyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgbWF0Y2g6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdtYXRjaCcpLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIG9ic2VydmFibGU6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdvYnNlcnZhYmxlJyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgcmVwbGFjZTogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3JlcGxhY2UnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICBzZWFyY2g6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdzZWFyY2gnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICBzcGVjaWVzOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignc3BlY2llcycpLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHNwbGl0OiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignc3BsaXQnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICB0b1ByaW1pdGl2ZTogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3RvUHJpbWl0aXZlJyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgdG9TdHJpbmdUYWc6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCd0b1N0cmluZ1RhZycpLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHVuc2NvcGFibGVzOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcigndW5zY29wYWJsZXMnKSwgZmFsc2UsIGZhbHNlKVxyXG4gICAgfSk7XHJcbiAgICAvKiBEZWNvcmF0ZSB0aGUgSW50ZXJuYWxTeW1ib2wgb2JqZWN0ICovXHJcbiAgICBkZWZpbmVQcm9wZXJ0aWVzKEludGVybmFsU3ltYm9sLnByb3RvdHlwZSwge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sKSxcclxuICAgICAgICB0b1N0cmluZzogZ2V0VmFsdWVEZXNjcmlwdG9yKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX19uYW1lX187XHJcbiAgICAgICAgfSwgZmFsc2UsIGZhbHNlKVxyXG4gICAgfSk7XHJcbiAgICAvKiBEZWNvcmF0ZSB0aGUgU3ltYm9sLnByb3RvdHlwZSAqL1xyXG4gICAgZGVmaW5lUHJvcGVydGllcyhTeW1ib2wucHJvdG90eXBlLCB7XHJcbiAgICAgICAgdG9TdHJpbmc6IGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnU3ltYm9sICgnICsgdmFsaWRhdGVTeW1ib2wodGhpcykuX19kZXNjcmlwdGlvbl9fICsgJyknO1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHZhbHVlT2Y6IGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWxpZGF0ZVN5bWJvbCh0aGlzKTtcclxuICAgICAgICB9KVxyXG4gICAgfSk7XHJcbiAgICBkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCBTeW1ib2wudG9QcmltaXRpdmUsIGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU3ltYm9sKHRoaXMpO1xyXG4gICAgfSkpO1xyXG4gICAgZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgU3ltYm9sLnRvU3RyaW5nVGFnLCBnZXRWYWx1ZURlc2NyaXB0b3IoJ1N5bWJvbCcsIGZhbHNlLCBmYWxzZSwgdHJ1ZSkpO1xyXG4gICAgZGVmaW5lUHJvcGVydHkoSW50ZXJuYWxTeW1ib2wucHJvdG90eXBlLCBTeW1ib2wudG9QcmltaXRpdmUsIGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wucHJvdG90eXBlW1N5bWJvbC50b1ByaW1pdGl2ZV0sIGZhbHNlLCBmYWxzZSwgdHJ1ZSkpO1xyXG4gICAgZGVmaW5lUHJvcGVydHkoSW50ZXJuYWxTeW1ib2wucHJvdG90eXBlLCBTeW1ib2wudG9TdHJpbmdUYWcsIGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wucHJvdG90eXBlW1N5bWJvbC50b1N0cmluZ1RhZ10sIGZhbHNlLCBmYWxzZSwgdHJ1ZSkpO1xyXG59XHJcbi8qKlxyXG4gKiBBIGN1c3RvbSBndWFyZCBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgaWYgYW4gb2JqZWN0IGlzIGEgc3ltYm9sIG9yIG5vdFxyXG4gKiBAcGFyYW0gIHthbnl9ICAgICAgIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjayB0byBzZWUgaWYgaXQgaXMgYSBzeW1ib2wgb3Igbm90XHJcbiAqIEByZXR1cm4ge2lzIHN5bWJvbH0gICAgICAgUmV0dXJucyB0cnVlIGlmIGEgc3ltYm9sIG9yIG5vdCAoYW5kIG5hcnJvd3MgdGhlIHR5cGUgZ3VhcmQpXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcclxuICAgIHJldHVybiAodmFsdWUgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcgfHwgdmFsdWVbJ0BAdG9TdHJpbmdUYWcnXSA9PT0gJ1N5bWJvbCcpKSB8fCBmYWxzZTtcclxufVxyXG4vKipcclxuICogRmlsbCBhbnkgbWlzc2luZyB3ZWxsIGtub3duIHN5bWJvbHMgaWYgdGhlIG5hdGl2ZSBTeW1ib2wgaXMgbWlzc2luZyB0aGVtXHJcbiAqL1xyXG5bXHJcbiAgICAnaGFzSW5zdGFuY2UnLFxyXG4gICAgJ2lzQ29uY2F0U3ByZWFkYWJsZScsXHJcbiAgICAnaXRlcmF0b3InLFxyXG4gICAgJ3NwZWNpZXMnLFxyXG4gICAgJ3JlcGxhY2UnLFxyXG4gICAgJ3NlYXJjaCcsXHJcbiAgICAnc3BsaXQnLFxyXG4gICAgJ21hdGNoJyxcclxuICAgICd0b1ByaW1pdGl2ZScsXHJcbiAgICAndG9TdHJpbmdUYWcnLFxyXG4gICAgJ3Vuc2NvcGFibGVzJyxcclxuICAgICdvYnNlcnZhYmxlJ1xyXG5dLmZvckVhY2goKHdlbGxLbm93bikgPT4ge1xyXG4gICAgaWYgKCFTeW1ib2xbd2VsbEtub3duXSkge1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTeW1ib2wsIHdlbGxLbm93biwgZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3Iod2VsbEtub3duKSwgZmFsc2UsIGZhbHNlKSk7XHJcbiAgICB9XHJcbn0pO1xyXG5leHBvcnQgZGVmYXVsdCBTeW1ib2w7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVN5bWJvbC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vU3ltYm9sLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vU3ltYm9sLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IHsgaXNBcnJheUxpa2UgfSBmcm9tICcuL2l0ZXJhdG9yJztcclxuaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcclxuaW1wb3J0ICcuL1N5bWJvbCc7XHJcbmV4cG9ydCBsZXQgV2Vha01hcCA9IGdsb2JhbC5XZWFrTWFwO1xyXG5pZiAoIXRydWUpIHtcclxuICAgIGNvbnN0IERFTEVURUQgPSB7fTtcclxuICAgIGNvbnN0IGdldFVJRCA9IGZ1bmN0aW9uIGdldFVJRCgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwKTtcclxuICAgIH07XHJcbiAgICBjb25zdCBnZW5lcmF0ZU5hbWUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxldCBzdGFydElkID0gTWF0aC5mbG9vcihEYXRlLm5vdygpICUgMTAwMDAwMDAwKTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gZ2VuZXJhdGVOYW1lKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ19fd20nICsgZ2V0VUlEKCkgKyAoc3RhcnRJZCsrICsgJ19fJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pKCk7XHJcbiAgICBXZWFrTWFwID0gY2xhc3MgV2Vha01hcCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoaXRlcmFibGUpIHtcclxuICAgICAgICAgICAgdGhpc1tTeW1ib2wudG9TdHJpbmdUYWddID0gJ1dlYWtNYXAnO1xyXG4gICAgICAgICAgICB0aGlzLl9uYW1lID0gZ2VuZXJhdGVOYW1lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2Zyb3plbkVudHJpZXMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNBcnJheUxpa2UoaXRlcmFibGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gaXRlcmFibGVbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KGl0ZW1bMF0sIGl0ZW1bMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBfZ2V0RnJvemVuRW50cnlJbmRleChrZXkpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9mcm96ZW5FbnRyaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZnJvemVuRW50cmllc1tpXS5rZXkgPT09IGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlKGtleSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQgfHwga2V5ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBrZXlbdGhpcy5fbmFtZV07XHJcbiAgICAgICAgICAgIGlmIChlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCkge1xyXG4gICAgICAgICAgICAgICAgZW50cnkudmFsdWUgPSBERUxFVEVEO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZnJvemVuSW5kZXggPSB0aGlzLl9nZXRGcm96ZW5FbnRyeUluZGV4KGtleSk7XHJcbiAgICAgICAgICAgIGlmIChmcm96ZW5JbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mcm96ZW5FbnRyaWVzLnNwbGljZShmcm96ZW5JbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldChrZXkpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkIHx8IGtleSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IGtleVt0aGlzLl9uYW1lXTtcclxuICAgICAgICAgICAgaWYgKGVudHJ5ICYmIGVudHJ5LmtleSA9PT0ga2V5ICYmIGVudHJ5LnZhbHVlICE9PSBERUxFVEVEKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50cnkudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZnJvemVuSW5kZXggPSB0aGlzLl9nZXRGcm96ZW5FbnRyeUluZGV4KGtleSk7XHJcbiAgICAgICAgICAgIGlmIChmcm96ZW5JbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZnJvemVuRW50cmllc1tmcm96ZW5JbmRleF0udmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaGFzKGtleSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQgfHwga2V5ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBrZXlbdGhpcy5fbmFtZV07XHJcbiAgICAgICAgICAgIGlmIChCb29sZWFuKGVudHJ5ICYmIGVudHJ5LmtleSA9PT0ga2V5ICYmIGVudHJ5LnZhbHVlICE9PSBERUxFVEVEKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZnJvemVuSW5kZXggPSB0aGlzLl9nZXRGcm96ZW5FbnRyeUluZGV4KGtleSk7XHJcbiAgICAgICAgICAgIGlmIChmcm96ZW5JbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldChrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGlmICgha2V5IHx8ICh0eXBlb2Yga2V5ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Yga2V5ICE9PSAnZnVuY3Rpb24nKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCB2YWx1ZSB1c2VkIGFzIHdlYWsgbWFwIGtleScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IGtleVt0aGlzLl9uYW1lXTtcclxuICAgICAgICAgICAgaWYgKCFlbnRyeSB8fCBlbnRyeS5rZXkgIT09IGtleSkge1xyXG4gICAgICAgICAgICAgICAgZW50cnkgPSBPYmplY3QuY3JlYXRlKG51bGwsIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IHsgdmFsdWU6IGtleSB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChPYmplY3QuaXNGcm96ZW4oa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Zyb3plbkVudHJpZXMucHVzaChlbnRyeSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoa2V5LCB0aGlzLl9uYW1lLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVudHJ5LnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgV2Vha01hcDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V2Vha01hcC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vV2Vha01hcC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1dlYWtNYXAubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImNvbnN0IGdsb2JhbE9iamVjdCA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gdGhlIG9ubHkgcmVsaWFibGUgbWVhbnMgdG8gZ2V0IHRoZSBnbG9iYWwgb2JqZWN0IGlzXG4gICAgLy8gYEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKClgXG4gICAgLy8gSG93ZXZlciwgdGhpcyBjYXVzZXMgQ1NQIHZpb2xhdGlvbnMgaW4gQ2hyb21lIGFwcHMuXG4gICAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gZ2xvYmFsO1xuICAgIH1cbn0pKCk7XG5leHBvcnQgZGVmYXVsdCBnbG9iYWxPYmplY3Q7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nbG9iYWwubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL2dsb2JhbC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL2dsb2JhbC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0ICcuL1N5bWJvbCc7XG5pbXBvcnQgeyBISUdIX1NVUlJPR0FURV9NQVgsIEhJR0hfU1VSUk9HQVRFX01JTiB9IGZyb20gJy4vc3RyaW5nJztcbmNvbnN0IHN0YXRpY0RvbmUgPSB7IGRvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWQgfTtcbi8qKlxuICogQSBjbGFzcyB0aGF0IF9zaGltc18gYW4gaXRlcmF0b3IgaW50ZXJmYWNlIG9uIGFycmF5IGxpa2Ugb2JqZWN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNoaW1JdGVyYXRvciB7XG4gICAgY29uc3RydWN0b3IobGlzdCkge1xuICAgICAgICB0aGlzLl9uZXh0SW5kZXggPSAtMTtcbiAgICAgICAgaWYgKGlzSXRlcmFibGUobGlzdCkpIHtcbiAgICAgICAgICAgIHRoaXMuX25hdGl2ZUl0ZXJhdG9yID0gbGlzdFtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ID0gbGlzdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIG5leHQgaXRlcmF0aW9uIHJlc3VsdCBmb3IgdGhlIEl0ZXJhdG9yXG4gICAgICovXG4gICAgbmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX25hdGl2ZUl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbmF0aXZlSXRlcmF0b3IubmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fbGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRpY0RvbmU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCsrdGhpcy5fbmV4dEluZGV4IDwgdGhpcy5fbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZG9uZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuX2xpc3RbdGhpcy5fbmV4dEluZGV4XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RhdGljRG9uZTtcbiAgICB9XG4gICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciBjaGVja2luZyBpZiBzb21ldGhpbmcgaGFzIGFuIEl0ZXJhYmxlIGludGVyZmFjZVxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gdHlwZSBndWFyZCBhZ2FpbnN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0l0ZXJhYmxlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZVtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIGNoZWNraW5nIGlmIHNvbWV0aGluZyBpcyBBcnJheUxpa2VcbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHR5cGUgZ3VhcmQgYWdhaW5zdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PT0gJ251bWJlcic7XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGl0ZXJhdG9yIGZvciBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gaXRlcmFibGUgVGhlIGl0ZXJhYmxlIG9iamVjdCB0byByZXR1cm4gdGhlIGl0ZXJhdG9yIGZvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0KGl0ZXJhYmxlKSB7XG4gICAgaWYgKGlzSXRlcmFibGUoaXRlcmFibGUpKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSkge1xuICAgICAgICByZXR1cm4gbmV3IFNoaW1JdGVyYXRvcihpdGVyYWJsZSk7XG4gICAgfVxufVxuLyoqXG4gKiBTaGltcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiBgZm9yIC4uLiBvZmAgYmxvY2tzXG4gKlxuICogQHBhcmFtIGl0ZXJhYmxlIFRoZSBvYmplY3QgdGhlIHByb3ZpZGVzIGFuIGludGVyYXRvciBpbnRlcmZhY2VcbiAqIEBwYXJhbSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgd2hpY2ggd2lsbCBiZSBjYWxsZWQgZm9yIGVhY2ggaXRlbSBvZiB0aGUgaXRlcmFibGVcbiAqIEBwYXJhbSB0aGlzQXJnIE9wdGlvbmFsIHNjb3BlIHRvIHBhc3MgdGhlIGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JPZihpdGVyYWJsZSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBsZXQgYnJva2VuID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gZG9CcmVhaygpIHtcbiAgICAgICAgYnJva2VuID0gdHJ1ZTtcbiAgICB9XG4gICAgLyogV2UgbmVlZCB0byBoYW5kbGUgaXRlcmF0aW9uIG9mIGRvdWJsZSBieXRlIHN0cmluZ3MgcHJvcGVybHkgKi9cbiAgICBpZiAoaXNBcnJheUxpa2UoaXRlcmFibGUpICYmIHR5cGVvZiBpdGVyYWJsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgbCA9IGl0ZXJhYmxlLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBjaGFyID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICBpZiAoaSArIDEgPCBsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IGNoYXIuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgICAgICBpZiAoY29kZSA+PSBISUdIX1NVUlJPR0FURV9NSU4gJiYgY29kZSA8PSBISUdIX1NVUlJPR0FURV9NQVgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhciArPSBpdGVyYWJsZVsrK2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgY2hhciwgaXRlcmFibGUsIGRvQnJlYWspO1xuICAgICAgICAgICAgaWYgKGJyb2tlbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgaXRlcmF0b3IgPSBnZXQoaXRlcmFibGUpO1xuICAgICAgICBpZiAoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICB3aGlsZSAoIXJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCByZXN1bHQudmFsdWUsIGl0ZXJhYmxlLCBkb0JyZWFrKTtcbiAgICAgICAgICAgICAgICBpZiAoYnJva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXRlcmF0b3IubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL2l0ZXJhdG9yLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vaXRlcmF0b3IubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xyXG5pbXBvcnQgeyBpc1N5bWJvbCB9IGZyb20gJy4vU3ltYm9sJztcclxuZXhwb3J0IGxldCBhc3NpZ247XHJcbi8qKlxyXG4gKiBHZXRzIHRoZSBvd24gcHJvcGVydHkgZGVzY3JpcHRvciBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuICogQW4gb3duIHByb3BlcnR5IGRlc2NyaXB0b3IgaXMgb25lIHRoYXQgaXMgZGVmaW5lZCBkaXJlY3RseSBvbiB0aGUgb2JqZWN0IGFuZCBpcyBub3RcclxuICogaW5oZXJpdGVkIGZyb20gdGhlIG9iamVjdCdzIHByb3RvdHlwZS5cclxuICogQHBhcmFtIG8gT2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHByb3BlcnR5LlxyXG4gKiBAcGFyYW0gcCBOYW1lIG9mIHRoZSBwcm9wZXJ0eS5cclxuICovXHJcbmV4cG9ydCBsZXQgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIG93biBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdC4gVGhlIG93biBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCBhcmUgdGhvc2UgdGhhdCBhcmUgZGVmaW5lZCBkaXJlY3RseVxyXG4gKiBvbiB0aGF0IG9iamVjdCwgYW5kIGFyZSBub3QgaW5oZXJpdGVkIGZyb20gdGhlIG9iamVjdCdzIHByb3RvdHlwZS4gVGhlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0IGluY2x1ZGUgYm90aCBmaWVsZHMgKG9iamVjdHMpIGFuZCBmdW5jdGlvbnMuXHJcbiAqIEBwYXJhbSBvIE9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBvd24gcHJvcGVydGllcy5cclxuICovXHJcbmV4cG9ydCBsZXQgZ2V0T3duUHJvcGVydHlOYW1lcztcclxuLyoqXHJcbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHN5bWJvbCBwcm9wZXJ0aWVzIGZvdW5kIGRpcmVjdGx5IG9uIG9iamVjdCBvLlxyXG4gKiBAcGFyYW0gbyBPYmplY3QgdG8gcmV0cmlldmUgdGhlIHN5bWJvbHMgZnJvbS5cclxuICovXHJcbmV4cG9ydCBsZXQgZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB2YWx1ZXMgYXJlIHRoZSBzYW1lIHZhbHVlLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqIEBwYXJhbSB2YWx1ZTEgVGhlIGZpcnN0IHZhbHVlLlxyXG4gKiBAcGFyYW0gdmFsdWUyIFRoZSBzZWNvbmQgdmFsdWUuXHJcbiAqL1xyXG5leHBvcnQgbGV0IGlzO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBhbmQgbWV0aG9kcyBvZiBhbiBvYmplY3QuXHJcbiAqIEBwYXJhbSBvIE9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzLiBUaGlzIGNhbiBiZSBhbiBvYmplY3QgdGhhdCB5b3UgY3JlYXRlZCBvciBhbiBleGlzdGluZyBEb2N1bWVudCBPYmplY3QgTW9kZWwgKERPTSkgb2JqZWN0LlxyXG4gKi9cclxuZXhwb3J0IGxldCBrZXlzO1xyXG4vKiBFUzcgT2JqZWN0IHN0YXRpYyBtZXRob2RzICovXHJcbmV4cG9ydCBsZXQgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycztcclxuZXhwb3J0IGxldCBlbnRyaWVzO1xyXG5leHBvcnQgbGV0IHZhbHVlcztcclxuaWYgKHRydWUpIHtcclxuICAgIGNvbnN0IGdsb2JhbE9iamVjdCA9IGdsb2JhbC5PYmplY3Q7XHJcbiAgICBhc3NpZ24gPSBnbG9iYWxPYmplY3QuYXNzaWduO1xyXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZ2xvYmFsT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcclxuICAgIGdldE93blByb3BlcnR5TmFtZXMgPSBnbG9iYWxPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcclxuICAgIGdldE93blByb3BlcnR5U3ltYm9scyA9IGdsb2JhbE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XHJcbiAgICBpcyA9IGdsb2JhbE9iamVjdC5pcztcclxuICAgIGtleXMgPSBnbG9iYWxPYmplY3Qua2V5cztcclxufVxyXG5lbHNlIHtcclxuICAgIGtleXMgPSBmdW5jdGlvbiBzeW1ib2xBd2FyZUtleXMobykge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvKS5maWx0ZXIoKGtleSkgPT4gIUJvb2xlYW4oa2V5Lm1hdGNoKC9eQEAuKy8pKSk7XHJcbiAgICB9O1xyXG4gICAgYXNzaWduID0gZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgLi4uc291cmNlcykge1xyXG4gICAgICAgIGlmICh0YXJnZXQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBUeXBlRXJyb3IgaWYgdW5kZWZpbmVkIG9yIG51bGxcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRvID0gT2JqZWN0KHRhcmdldCk7XHJcbiAgICAgICAgc291cmNlcy5mb3JFYWNoKChuZXh0U291cmNlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChuZXh0U291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTa2lwIG92ZXIgaWYgdW5kZWZpbmVkIG9yIG51bGxcclxuICAgICAgICAgICAgICAgIGtleXMobmV4dFNvdXJjZSkuZm9yRWFjaCgobmV4dEtleSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRvO1xyXG4gICAgfTtcclxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIChvLCBwcm9wKSB7XHJcbiAgICAgICAgaWYgKGlzU3ltYm9sKHByb3ApKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8sIHByb3ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobywgcHJvcCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKG8pIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobykuZmlsdGVyKChrZXkpID0+ICFCb29sZWFuKGtleS5tYXRjaCgvXkBALisvKSkpO1xyXG4gICAgfTtcclxuICAgIGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhvKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG8pXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGtleSkgPT4gQm9vbGVhbihrZXkubWF0Y2goL15AQC4rLykpKVxyXG4gICAgICAgICAgICAubWFwKChrZXkpID0+IFN5bWJvbC5mb3Ioa2V5LnN1YnN0cmluZygyKSkpO1xyXG4gICAgfTtcclxuICAgIGlzID0gZnVuY3Rpb24gaXModmFsdWUxLCB2YWx1ZTIpIHtcclxuICAgICAgICBpZiAodmFsdWUxID09PSB2YWx1ZTIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlMSAhPT0gMCB8fCAxIC8gdmFsdWUxID09PSAxIC8gdmFsdWUyOyAvLyAtMFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWUxICE9PSB2YWx1ZTEgJiYgdmFsdWUyICE9PSB2YWx1ZTI7IC8vIE5hTlxyXG4gICAgfTtcclxufVxyXG5pZiAodHJ1ZSkge1xyXG4gICAgY29uc3QgZ2xvYmFsT2JqZWN0ID0gZ2xvYmFsLk9iamVjdDtcclxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPSBnbG9iYWxPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycztcclxuICAgIGVudHJpZXMgPSBnbG9iYWxPYmplY3QuZW50cmllcztcclxuICAgIHZhbHVlcyA9IGdsb2JhbE9iamVjdC52YWx1ZXM7XHJcbn1cclxuZWxzZSB7XHJcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldE93blByb3BlcnR5TmFtZXMobykucmVkdWNlKChwcmV2aW91cywga2V5KSA9PiB7XHJcbiAgICAgICAgICAgIHByZXZpb3VzW2tleV0gPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iobywga2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzO1xyXG4gICAgICAgIH0sIHt9KTtcclxuICAgIH07XHJcbiAgICBlbnRyaWVzID0gZnVuY3Rpb24gZW50cmllcyhvKSB7XHJcbiAgICAgICAgcmV0dXJuIGtleXMobykubWFwKChrZXkpID0+IFtrZXksIG9ba2V5XV0pO1xyXG4gICAgfTtcclxuICAgIHZhbHVlcyA9IGZ1bmN0aW9uIHZhbHVlcyhvKSB7XHJcbiAgICAgICAgcmV0dXJuIGtleXMobykubWFwKChrZXkpID0+IG9ba2V5XSk7XHJcbiAgICB9O1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW9iamVjdC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vb2JqZWN0Lm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vb2JqZWN0Lm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcclxuaW1wb3J0IHsgd3JhcE5hdGl2ZSB9IGZyb20gJy4vc3VwcG9ydC91dGlsJztcclxuLyoqXHJcbiAqIFRoZSBtaW5pbXVtIGxvY2F0aW9uIG9mIGhpZ2ggc3Vycm9nYXRlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEhJR0hfU1VSUk9HQVRFX01JTiA9IDB4ZDgwMDtcclxuLyoqXHJcbiAqIFRoZSBtYXhpbXVtIGxvY2F0aW9uIG9mIGhpZ2ggc3Vycm9nYXRlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IEhJR0hfU1VSUk9HQVRFX01BWCA9IDB4ZGJmZjtcclxuLyoqXHJcbiAqIFRoZSBtaW5pbXVtIGxvY2F0aW9uIG9mIGxvdyBzdXJyb2dhdGVzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgTE9XX1NVUlJPR0FURV9NSU4gPSAweGRjMDA7XHJcbi8qKlxyXG4gKiBUaGUgbWF4aW11bSBsb2NhdGlvbiBvZiBsb3cgc3Vycm9nYXRlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IExPV19TVVJST0dBVEVfTUFYID0gMHhkZmZmO1xyXG4vKiBFUzYgc3RhdGljIG1ldGhvZHMgKi9cclxuLyoqXHJcbiAqIFJldHVybiB0aGUgU3RyaW5nIHZhbHVlIHdob3NlIGVsZW1lbnRzIGFyZSwgaW4gb3JkZXIsIHRoZSBlbGVtZW50cyBpbiB0aGUgTGlzdCBlbGVtZW50cy5cclxuICogSWYgbGVuZ3RoIGlzIDAsIHRoZSBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQuXHJcbiAqIEBwYXJhbSBjb2RlUG9pbnRzIFRoZSBjb2RlIHBvaW50cyB0byBnZW5lcmF0ZSB0aGUgc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgbGV0IGZyb21Db2RlUG9pbnQ7XHJcbi8qKlxyXG4gKiBgcmF3YCBpcyBpbnRlbmRlZCBmb3IgdXNlIGFzIGEgdGFnIGZ1bmN0aW9uIG9mIGEgVGFnZ2VkIFRlbXBsYXRlIFN0cmluZy4gV2hlbiBjYWxsZWRcclxuICogYXMgc3VjaCB0aGUgZmlyc3QgYXJndW1lbnQgd2lsbCBiZSBhIHdlbGwgZm9ybWVkIHRlbXBsYXRlIGNhbGwgc2l0ZSBvYmplY3QgYW5kIHRoZSByZXN0XHJcbiAqIHBhcmFtZXRlciB3aWxsIGNvbnRhaW4gdGhlIHN1YnN0aXR1dGlvbiB2YWx1ZXMuXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZSBBIHdlbGwtZm9ybWVkIHRlbXBsYXRlIHN0cmluZyBjYWxsIHNpdGUgcmVwcmVzZW50YXRpb24uXHJcbiAqIEBwYXJhbSBzdWJzdGl0dXRpb25zIEEgc2V0IG9mIHN1YnN0aXR1dGlvbiB2YWx1ZXMuXHJcbiAqL1xyXG5leHBvcnQgbGV0IHJhdztcclxuLyogRVM2IGluc3RhbmNlIG1ldGhvZHMgKi9cclxuLyoqXHJcbiAqIFJldHVybnMgYSBub25uZWdhdGl2ZSBpbnRlZ2VyIE51bWJlciBsZXNzIHRoYW4gMTExNDExMiAoMHgxMTAwMDApIHRoYXQgaXMgdGhlIGNvZGUgcG9pbnRcclxuICogdmFsdWUgb2YgdGhlIFVURi0xNiBlbmNvZGVkIGNvZGUgcG9pbnQgc3RhcnRpbmcgYXQgdGhlIHN0cmluZyBlbGVtZW50IGF0IHBvc2l0aW9uIHBvcyBpblxyXG4gKiB0aGUgU3RyaW5nIHJlc3VsdGluZyBmcm9tIGNvbnZlcnRpbmcgdGhpcyBvYmplY3QgdG8gYSBTdHJpbmcuXHJcbiAqIElmIHRoZXJlIGlzIG5vIGVsZW1lbnQgYXQgdGhhdCBwb3NpdGlvbiwgdGhlIHJlc3VsdCBpcyB1bmRlZmluZWQuXHJcbiAqIElmIGEgdmFsaWQgVVRGLTE2IHN1cnJvZ2F0ZSBwYWlyIGRvZXMgbm90IGJlZ2luIGF0IHBvcywgdGhlIHJlc3VsdCBpcyB0aGUgY29kZSB1bml0IGF0IHBvcy5cclxuICovXHJcbmV4cG9ydCBsZXQgY29kZVBvaW50QXQ7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNlcXVlbmNlIG9mIGVsZW1lbnRzIG9mIHNlYXJjaFN0cmluZyBjb252ZXJ0ZWQgdG8gYSBTdHJpbmcgaXMgdGhlXHJcbiAqIHNhbWUgYXMgdGhlIGNvcnJlc3BvbmRpbmcgZWxlbWVudHMgb2YgdGhpcyBvYmplY3QgKGNvbnZlcnRlZCB0byBhIFN0cmluZykgc3RhcnRpbmcgYXRcclxuICogZW5kUG9zaXRpb24g4oCTIGxlbmd0aCh0aGlzKS4gT3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAqL1xyXG5leHBvcnQgbGV0IGVuZHNXaXRoO1xyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHNlYXJjaFN0cmluZyBhcHBlYXJzIGFzIGEgc3Vic3RyaW5nIG9mIHRoZSByZXN1bHQgb2YgY29udmVydGluZyB0aGlzXHJcbiAqIG9iamVjdCB0byBhIFN0cmluZywgYXQgb25lIG9yIG1vcmUgcG9zaXRpb25zIHRoYXQgYXJlXHJcbiAqIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBwb3NpdGlvbjsgb3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLlxyXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc3RyaW5nXHJcbiAqIEBwYXJhbSBzZWFyY2hTdHJpbmcgc2VhcmNoIHN0cmluZ1xyXG4gKiBAcGFyYW0gcG9zaXRpb24gSWYgcG9zaXRpb24gaXMgdW5kZWZpbmVkLCAwIGlzIGFzc3VtZWQsIHNvIGFzIHRvIHNlYXJjaCBhbGwgb2YgdGhlIFN0cmluZy5cclxuICovXHJcbmV4cG9ydCBsZXQgaW5jbHVkZXM7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBTdHJpbmcgdmFsdWUgcmVzdWx0IG9mIG5vcm1hbGl6aW5nIHRoZSBzdHJpbmcgaW50byB0aGUgbm9ybWFsaXphdGlvbiBmb3JtXHJcbiAqIG5hbWVkIGJ5IGZvcm0gYXMgc3BlY2lmaWVkIGluIFVuaWNvZGUgU3RhbmRhcmQgQW5uZXggIzE1LCBVbmljb2RlIE5vcm1hbGl6YXRpb24gRm9ybXMuXHJcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcclxuICogQHBhcmFtIGZvcm0gQXBwbGljYWJsZSB2YWx1ZXM6IFwiTkZDXCIsIFwiTkZEXCIsIFwiTkZLQ1wiLCBvciBcIk5GS0RcIiwgSWYgbm90IHNwZWNpZmllZCBkZWZhdWx0XHJcbiAqIGlzIFwiTkZDXCJcclxuICovXHJcbmV4cG9ydCBsZXQgbm9ybWFsaXplO1xyXG4vKipcclxuICogUmV0dXJucyBhIFN0cmluZyB2YWx1ZSB0aGF0IGlzIG1hZGUgZnJvbSBjb3VudCBjb3BpZXMgYXBwZW5kZWQgdG9nZXRoZXIuIElmIGNvdW50IGlzIDAsXHJcbiAqIFQgaXMgdGhlIGVtcHR5IFN0cmluZyBpcyByZXR1cm5lZC5cclxuICogQHBhcmFtIGNvdW50IG51bWJlciBvZiBjb3BpZXMgdG8gYXBwZW5kXHJcbiAqL1xyXG5leHBvcnQgbGV0IHJlcGVhdDtcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc2VxdWVuY2Ugb2YgZWxlbWVudHMgb2Ygc2VhcmNoU3RyaW5nIGNvbnZlcnRlZCB0byBhIFN0cmluZyBpcyB0aGVcclxuICogc2FtZSBhcyB0aGUgY29ycmVzcG9uZGluZyBlbGVtZW50cyBvZiB0aGlzIG9iamVjdCAoY29udmVydGVkIHRvIGEgU3RyaW5nKSBzdGFydGluZyBhdFxyXG4gKiBwb3NpdGlvbi4gT3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAqL1xyXG5leHBvcnQgbGV0IHN0YXJ0c1dpdGg7XHJcbi8qIEVTNyBpbnN0YW5jZSBtZXRob2RzICovXHJcbi8qKlxyXG4gKiBQYWRzIHRoZSBjdXJyZW50IHN0cmluZyB3aXRoIGEgZ2l2ZW4gc3RyaW5nIChwb3NzaWJseSByZXBlYXRlZCkgc28gdGhhdCB0aGUgcmVzdWx0aW5nIHN0cmluZyByZWFjaGVzIGEgZ2l2ZW4gbGVuZ3RoLlxyXG4gKiBUaGUgcGFkZGluZyBpcyBhcHBsaWVkIGZyb20gdGhlIGVuZCAocmlnaHQpIG9mIHRoZSBjdXJyZW50IHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHN0cmluZ1xyXG4gKiBAcGFyYW0gbWF4TGVuZ3RoIFRoZSBsZW5ndGggb2YgdGhlIHJlc3VsdGluZyBzdHJpbmcgb25jZSB0aGUgY3VycmVudCBzdHJpbmcgaGFzIGJlZW4gcGFkZGVkLlxyXG4gKiAgICAgICAgSWYgdGhpcyBwYXJhbWV0ZXIgaXMgc21hbGxlciB0aGFuIHRoZSBjdXJyZW50IHN0cmluZydzIGxlbmd0aCwgdGhlIGN1cnJlbnQgc3RyaW5nIHdpbGwgYmUgcmV0dXJuZWQgYXMgaXQgaXMuXHJcbiAqXHJcbiAqIEBwYXJhbSBmaWxsU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFkIHRoZSBjdXJyZW50IHN0cmluZyB3aXRoLlxyXG4gKiAgICAgICAgSWYgdGhpcyBzdHJpbmcgaXMgdG9vIGxvbmcsIGl0IHdpbGwgYmUgdHJ1bmNhdGVkIGFuZCB0aGUgbGVmdC1tb3N0IHBhcnQgd2lsbCBiZSBhcHBsaWVkLlxyXG4gKiAgICAgICAgVGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoaXMgcGFyYW1ldGVyIGlzIFwiIFwiIChVKzAwMjApLlxyXG4gKi9cclxuZXhwb3J0IGxldCBwYWRFbmQ7XHJcbi8qKlxyXG4gKiBQYWRzIHRoZSBjdXJyZW50IHN0cmluZyB3aXRoIGEgZ2l2ZW4gc3RyaW5nIChwb3NzaWJseSByZXBlYXRlZCkgc28gdGhhdCB0aGUgcmVzdWx0aW5nIHN0cmluZyByZWFjaGVzIGEgZ2l2ZW4gbGVuZ3RoLlxyXG4gKiBUaGUgcGFkZGluZyBpcyBhcHBsaWVkIGZyb20gdGhlIHN0YXJ0IChsZWZ0KSBvZiB0aGUgY3VycmVudCBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcclxuICogQHBhcmFtIG1heExlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgc3RyaW5nIG9uY2UgdGhlIGN1cnJlbnQgc3RyaW5nIGhhcyBiZWVuIHBhZGRlZC5cclxuICogICAgICAgIElmIHRoaXMgcGFyYW1ldGVyIGlzIHNtYWxsZXIgdGhhbiB0aGUgY3VycmVudCBzdHJpbmcncyBsZW5ndGgsIHRoZSBjdXJyZW50IHN0cmluZyB3aWxsIGJlIHJldHVybmVkIGFzIGl0IGlzLlxyXG4gKlxyXG4gKiBAcGFyYW0gZmlsbFN0cmluZyBUaGUgc3RyaW5nIHRvIHBhZCB0aGUgY3VycmVudCBzdHJpbmcgd2l0aC5cclxuICogICAgICAgIElmIHRoaXMgc3RyaW5nIGlzIHRvbyBsb25nLCBpdCB3aWxsIGJlIHRydW5jYXRlZCBhbmQgdGhlIGxlZnQtbW9zdCBwYXJ0IHdpbGwgYmUgYXBwbGllZC5cclxuICogICAgICAgIFRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGlzIHBhcmFtZXRlciBpcyBcIiBcIiAoVSswMDIwKS5cclxuICovXHJcbmV4cG9ydCBsZXQgcGFkU3RhcnQ7XHJcbmlmICh0cnVlICYmIHRydWUpIHtcclxuICAgIGZyb21Db2RlUG9pbnQgPSBnbG9iYWwuU3RyaW5nLmZyb21Db2RlUG9pbnQ7XHJcbiAgICByYXcgPSBnbG9iYWwuU3RyaW5nLnJhdztcclxuICAgIGNvZGVQb2ludEF0ID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5jb2RlUG9pbnRBdCk7XHJcbiAgICBlbmRzV2l0aCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUuZW5kc1dpdGgpO1xyXG4gICAgaW5jbHVkZXMgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzKTtcclxuICAgIG5vcm1hbGl6ZSA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUubm9ybWFsaXplKTtcclxuICAgIHJlcGVhdCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUucmVwZWF0KTtcclxuICAgIHN0YXJ0c1dpdGggPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgpO1xyXG59XHJcbmVsc2Uge1xyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZXMgdGhhdCB0ZXh0IGlzIGRlZmluZWQsIGFuZCBub3JtYWxpemVzIHBvc2l0aW9uIChiYXNlZCBvbiB0aGUgZ2l2ZW4gZGVmYXVsdCBpZiB0aGUgaW5wdXQgaXMgTmFOKS5cclxuICAgICAqIFVzZWQgYnkgc3RhcnRzV2l0aCwgaW5jbHVkZXMsIGFuZCBlbmRzV2l0aC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIE5vcm1hbGl6ZWQgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IG5vcm1hbGl6ZVN1YnN0cmluZ0FyZ3MgPSBmdW5jdGlvbiAobmFtZSwgdGV4dCwgc2VhcmNoLCBwb3NpdGlvbiwgaXNFbmQgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICh0ZXh0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLicgKyBuYW1lICsgJyByZXF1aXJlcyBhIHZhbGlkIHN0cmluZyB0byBzZWFyY2ggYWdhaW5zdC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gdGV4dC5sZW5ndGg7XHJcbiAgICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbiAhPT0gcG9zaXRpb24gPyAoaXNFbmQgPyBsZW5ndGggOiAwKSA6IHBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiBbdGV4dCwgU3RyaW5nKHNlYXJjaCksIE1hdGgubWluKE1hdGgubWF4KHBvc2l0aW9uLCAwKSwgbGVuZ3RoKV07XHJcbiAgICB9O1xyXG4gICAgZnJvbUNvZGVQb2ludCA9IGZ1bmN0aW9uIGZyb21Db2RlUG9pbnQoLi4uY29kZVBvaW50cykge1xyXG4gICAgICAgIC8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcuZnJvbUNvZGVQb2ludFxyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCFsZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xyXG4gICAgICAgIGNvbnN0IE1BWF9TSVpFID0gMHg0MDAwO1xyXG4gICAgICAgIGxldCBjb2RlVW5pdHMgPSBbXTtcclxuICAgICAgICBsZXQgaW5kZXggPSAtMTtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcclxuICAgICAgICAgICAgbGV0IGNvZGVQb2ludCA9IE51bWJlcihhcmd1bWVudHNbaW5kZXhdKTtcclxuICAgICAgICAgICAgLy8gQ29kZSBwb2ludHMgbXVzdCBiZSBmaW5pdGUgaW50ZWdlcnMgd2l0aGluIHRoZSB2YWxpZCByYW5nZVxyXG4gICAgICAgICAgICBsZXQgaXNWYWxpZCA9IGlzRmluaXRlKGNvZGVQb2ludCkgJiYgTWF0aC5mbG9vcihjb2RlUG9pbnQpID09PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50ID49IDAgJiYgY29kZVBvaW50IDw9IDB4MTBmZmZmO1xyXG4gICAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IFJhbmdlRXJyb3IoJ3N0cmluZy5mcm9tQ29kZVBvaW50OiBJbnZhbGlkIGNvZGUgcG9pbnQgJyArIGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA8PSAweGZmZmYpIHtcclxuICAgICAgICAgICAgICAgIC8vIEJNUCBjb2RlIHBvaW50XHJcbiAgICAgICAgICAgICAgICBjb2RlVW5pdHMucHVzaChjb2RlUG9pbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gQXN0cmFsIGNvZGUgcG9pbnQ7IHNwbGl0IGluIHN1cnJvZ2F0ZSBoYWx2ZXNcclxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxyXG4gICAgICAgICAgICAgICAgY29kZVBvaW50IC09IDB4MTAwMDA7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGlnaFN1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgPj4gMTApICsgSElHSF9TVVJST0dBVEVfTUlOO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxvd1N1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgJSAweDQwMCkgKyBMT1dfU1VSUk9HQVRFX01JTjtcclxuICAgICAgICAgICAgICAgIGNvZGVVbml0cy5wdXNoKGhpZ2hTdXJyb2dhdGUsIGxvd1N1cnJvZ2F0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGluZGV4ICsgMSA9PT0gbGVuZ3RoIHx8IGNvZGVVbml0cy5sZW5ndGggPiBNQVhfU0laRSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGZyb21DaGFyQ29kZS5hcHBseShudWxsLCBjb2RlVW5pdHMpO1xyXG4gICAgICAgICAgICAgICAgY29kZVVuaXRzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByYXcgPSBmdW5jdGlvbiByYXcoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpIHtcclxuICAgICAgICBsZXQgcmF3U3RyaW5ncyA9IGNhbGxTaXRlLnJhdztcclxuICAgICAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICAgICAgbGV0IG51bVN1YnN0aXR1dGlvbnMgPSBzdWJzdGl0dXRpb25zLmxlbmd0aDtcclxuICAgICAgICBpZiAoY2FsbFNpdGUgPT0gbnVsbCB8fCBjYWxsU2l0ZS5yYXcgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcucmF3IHJlcXVpcmVzIGEgdmFsaWQgY2FsbFNpdGUgb2JqZWN0IHdpdGggYSByYXcgdmFsdWUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJhd1N0cmluZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IHJhd1N0cmluZ3NbaV0gKyAoaSA8IG51bVN1YnN0aXR1dGlvbnMgJiYgaSA8IGxlbmd0aCAtIDEgPyBzdWJzdGl0dXRpb25zW2ldIDogJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIGNvZGVQb2ludEF0ID0gZnVuY3Rpb24gY29kZVBvaW50QXQodGV4dCwgcG9zaXRpb24gPSAwKSB7XHJcbiAgICAgICAgLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXRcclxuICAgICAgICBpZiAodGV4dCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5jb2RlUG9pbnRBdCByZXF1cmllcyBhIHZhbGlkIHN0cmluZy4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gdGV4dC5sZW5ndGg7XHJcbiAgICAgICAgaWYgKHBvc2l0aW9uICE9PSBwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEdldCB0aGUgZmlyc3QgY29kZSB1bml0XHJcbiAgICAgICAgY29uc3QgZmlyc3QgPSB0ZXh0LmNoYXJDb2RlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmIChmaXJzdCA+PSBISUdIX1NVUlJPR0FURV9NSU4gJiYgZmlyc3QgPD0gSElHSF9TVVJST0dBVEVfTUFYICYmIGxlbmd0aCA+IHBvc2l0aW9uICsgMSkge1xyXG4gICAgICAgICAgICAvLyBTdGFydCBvZiBhIHN1cnJvZ2F0ZSBwYWlyIChoaWdoIHN1cnJvZ2F0ZSBhbmQgdGhlcmUgaXMgYSBuZXh0IGNvZGUgdW5pdCk7IGNoZWNrIGZvciBsb3cgc3Vycm9nYXRlXHJcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxyXG4gICAgICAgICAgICBjb25zdCBzZWNvbmQgPSB0ZXh0LmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKTtcclxuICAgICAgICAgICAgaWYgKHNlY29uZCA+PSBMT1dfU1VSUk9HQVRFX01JTiAmJiBzZWNvbmQgPD0gTE9XX1NVUlJPR0FURV9NQVgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoZmlyc3QgLSBISUdIX1NVUlJPR0FURV9NSU4pICogMHg0MDAgKyBzZWNvbmQgLSBMT1dfU1VSUk9HQVRFX01JTiArIDB4MTAwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZpcnN0O1xyXG4gICAgfTtcclxuICAgIGVuZHNXaXRoID0gZnVuY3Rpb24gZW5kc1dpdGgodGV4dCwgc2VhcmNoLCBlbmRQb3NpdGlvbikge1xyXG4gICAgICAgIGlmIChzZWFyY2ggPT09ICcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGVuZFBvc2l0aW9uID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBlbmRQb3NpdGlvbiA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChlbmRQb3NpdGlvbiA9PT0gbnVsbCB8fCBpc05hTihlbmRQb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBbdGV4dCwgc2VhcmNoLCBlbmRQb3NpdGlvbl0gPSBub3JtYWxpemVTdWJzdHJpbmdBcmdzKCdlbmRzV2l0aCcsIHRleHQsIHNlYXJjaCwgZW5kUG9zaXRpb24sIHRydWUpO1xyXG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gZW5kUG9zaXRpb24gLSBzZWFyY2gubGVuZ3RoO1xyXG4gICAgICAgIGlmIChzdGFydCA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShzdGFydCwgZW5kUG9zaXRpb24pID09PSBzZWFyY2g7XHJcbiAgICB9O1xyXG4gICAgaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyh0ZXh0LCBzZWFyY2gsIHBvc2l0aW9uID0gMCkge1xyXG4gICAgICAgIFt0ZXh0LCBzZWFyY2gsIHBvc2l0aW9uXSA9IG5vcm1hbGl6ZVN1YnN0cmluZ0FyZ3MoJ2luY2x1ZGVzJywgdGV4dCwgc2VhcmNoLCBwb3NpdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHRleHQuaW5kZXhPZihzZWFyY2gsIHBvc2l0aW9uKSAhPT0gLTE7XHJcbiAgICB9O1xyXG4gICAgcmVwZWF0ID0gZnVuY3Rpb24gcmVwZWF0KHRleHQsIGNvdW50ID0gMCkge1xyXG4gICAgICAgIC8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLnJlcGVhdFxyXG4gICAgICAgIGlmICh0ZXh0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLnJlcGVhdCByZXF1aXJlcyBhIHZhbGlkIHN0cmluZy4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvdW50ICE9PSBjb3VudCkge1xyXG4gICAgICAgICAgICBjb3VudCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb3VudCA8IDAgfHwgY291bnQgPT09IEluZmluaXR5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdzdHJpbmcucmVwZWF0IHJlcXVpcmVzIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBjb3VudC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIHdoaWxlIChjb3VudCkge1xyXG4gICAgICAgICAgICBpZiAoY291bnQgJSAyKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gdGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0ICs9IHRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY291bnQgPj49IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgc3RhcnRzV2l0aCA9IGZ1bmN0aW9uIHN0YXJ0c1dpdGgodGV4dCwgc2VhcmNoLCBwb3NpdGlvbiA9IDApIHtcclxuICAgICAgICBzZWFyY2ggPSBTdHJpbmcoc2VhcmNoKTtcclxuICAgICAgICBbdGV4dCwgc2VhcmNoLCBwb3NpdGlvbl0gPSBub3JtYWxpemVTdWJzdHJpbmdBcmdzKCdzdGFydHNXaXRoJywgdGV4dCwgc2VhcmNoLCBwb3NpdGlvbik7XHJcbiAgICAgICAgY29uc3QgZW5kID0gcG9zaXRpb24gKyBzZWFyY2gubGVuZ3RoO1xyXG4gICAgICAgIGlmIChlbmQgPiB0ZXh0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKHBvc2l0aW9uLCBlbmQpID09PSBzZWFyY2g7XHJcbiAgICB9O1xyXG59XHJcbmlmICh0cnVlKSB7XHJcbiAgICBwYWRFbmQgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLnBhZEVuZCk7XHJcbiAgICBwYWRTdGFydCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUucGFkU3RhcnQpO1xyXG59XHJcbmVsc2Uge1xyXG4gICAgcGFkRW5kID0gZnVuY3Rpb24gcGFkRW5kKHRleHQsIG1heExlbmd0aCwgZmlsbFN0cmluZyA9ICcgJykge1xyXG4gICAgICAgIGlmICh0ZXh0ID09PSBudWxsIHx8IHRleHQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcucmVwZWF0IHJlcXVpcmVzIGEgdmFsaWQgc3RyaW5nLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWF4TGVuZ3RoID09PSBJbmZpbml0eSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3RyaW5nLnBhZEVuZCByZXF1aXJlcyBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgY291bnQuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtYXhMZW5ndGggPT09IG51bGwgfHwgbWF4TGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbWF4TGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICBtYXhMZW5ndGggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3RyVGV4dCA9IFN0cmluZyh0ZXh0KTtcclxuICAgICAgICBjb25zdCBwYWRkaW5nID0gbWF4TGVuZ3RoIC0gc3RyVGV4dC5sZW5ndGg7XHJcbiAgICAgICAgaWYgKHBhZGRpbmcgPiAwKSB7XHJcbiAgICAgICAgICAgIHN0clRleHQgKz1cclxuICAgICAgICAgICAgICAgIHJlcGVhdChmaWxsU3RyaW5nLCBNYXRoLmZsb29yKHBhZGRpbmcgLyBmaWxsU3RyaW5nLmxlbmd0aCkpICtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsU3RyaW5nLnNsaWNlKDAsIHBhZGRpbmcgJSBmaWxsU3RyaW5nLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHJUZXh0O1xyXG4gICAgfTtcclxuICAgIHBhZFN0YXJ0ID0gZnVuY3Rpb24gcGFkU3RhcnQodGV4dCwgbWF4TGVuZ3RoLCBmaWxsU3RyaW5nID0gJyAnKSB7XHJcbiAgICAgICAgaWYgKHRleHQgPT09IG51bGwgfHwgdGV4dCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yZXBlYXQgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtYXhMZW5ndGggPT09IEluZmluaXR5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdzdHJpbmcucGFkU3RhcnQgcmVxdWlyZXMgYSBub24tbmVnYXRpdmUgZmluaXRlIGNvdW50LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWF4TGVuZ3RoID09PSBudWxsIHx8IG1heExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IG1heExlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgbWF4TGVuZ3RoID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHN0clRleHQgPSBTdHJpbmcodGV4dCk7XHJcbiAgICAgICAgY29uc3QgcGFkZGluZyA9IG1heExlbmd0aCAtIHN0clRleHQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChwYWRkaW5nID4gMCkge1xyXG4gICAgICAgICAgICBzdHJUZXh0ID1cclxuICAgICAgICAgICAgICAgIHJlcGVhdChmaWxsU3RyaW5nLCBNYXRoLmZsb29yKHBhZGRpbmcgLyBmaWxsU3RyaW5nLmxlbmd0aCkpICtcclxuICAgICAgICAgICAgICAgICAgICBmaWxsU3RyaW5nLnNsaWNlKDAsIHBhZGRpbmcgJSBmaWxsU3RyaW5nLmxlbmd0aCkgK1xyXG4gICAgICAgICAgICAgICAgICAgIHN0clRleHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHJUZXh0O1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdHJpbmcubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N0cmluZy5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N0cmluZy5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGhhcywgeyBhZGQgfSBmcm9tICcuLi8uLi9oYXMvaGFzJztcclxuaW1wb3J0IGdsb2JhbCBmcm9tICcuLi9nbG9iYWwnO1xyXG5leHBvcnQgZGVmYXVsdCBoYXM7XHJcbmV4cG9ydCAqIGZyb20gJy4uLy4uL2hhcy9oYXMnO1xyXG4vKiBFQ01BU2NyaXB0IDYgYW5kIDcgRmVhdHVyZXMgKi9cclxuLyogQXJyYXkgKi9cclxuYWRkKCdlczYtYXJyYXknLCAoKSA9PiB7XHJcbiAgICByZXR1cm4gKFsnZnJvbScsICdvZiddLmV2ZXJ5KChrZXkpID0+IGtleSBpbiBnbG9iYWwuQXJyYXkpICYmXHJcbiAgICAgICAgWydmaW5kSW5kZXgnLCAnZmluZCcsICdjb3B5V2l0aGluJ10uZXZlcnkoKGtleSkgPT4ga2V5IGluIGdsb2JhbC5BcnJheS5wcm90b3R5cGUpKTtcclxufSwgdHJ1ZSk7XHJcbmFkZCgnZXM2LWFycmF5LWZpbGwnLCAoKSA9PiB7XHJcbiAgICBpZiAoJ2ZpbGwnIGluIGdsb2JhbC5BcnJheS5wcm90b3R5cGUpIHtcclxuICAgICAgICAvKiBTb21lIHZlcnNpb25zIG9mIFNhZmFyaSBkbyBub3QgcHJvcGVybHkgaW1wbGVtZW50IHRoaXMgKi9cclxuICAgICAgICByZXR1cm4gWzFdLmZpbGwoOSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVswXSA9PT0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufSwgdHJ1ZSk7XHJcbmFkZCgnZXM3LWFycmF5JywgKCkgPT4gJ2luY2x1ZGVzJyBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlLCB0cnVlKTtcclxuLyogTWFwICovXHJcbmFkZCgnZXM2LW1hcCcsICgpID0+IHtcclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsLk1hcCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8qXHJcbiAgICBJRTExIGFuZCBvbGRlciB2ZXJzaW9ucyBvZiBTYWZhcmkgYXJlIG1pc3NpbmcgY3JpdGljYWwgRVM2IE1hcCBmdW5jdGlvbmFsaXR5XHJcbiAgICBXZSB3cmFwIHRoaXMgaW4gYSB0cnkvY2F0Y2ggYmVjYXVzZSBzb21ldGltZXMgdGhlIE1hcCBjb25zdHJ1Y3RvciBleGlzdHMsIGJ1dCBkb2VzIG5vdFxyXG4gICAgdGFrZSBhcmd1bWVudHMgKGlPUyA4LjQpXHJcbiAgICAgKi9cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgZ2xvYmFsLk1hcChbWzAsIDFdXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXAuaGFzKDApICYmXHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgbWFwLmtleXMgPT09ICdmdW5jdGlvbicgJiZcclxuICAgICAgICAgICAgICAgIHRydWUgJiZcclxuICAgICAgICAgICAgICAgIHR5cGVvZiBtYXAudmFsdWVzID09PSAnZnVuY3Rpb24nICYmXHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgbWFwLmVudHJpZXMgPT09ICdmdW5jdGlvbic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiBub3QgdGVzdGluZyBvbiBpT1MgYXQgdGhlIG1vbWVudCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59LCB0cnVlKTtcclxuLyogTWF0aCAqL1xyXG5hZGQoJ2VzNi1tYXRoJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICAnY2x6MzInLFxyXG4gICAgICAgICdzaWduJyxcclxuICAgICAgICAnbG9nMTAnLFxyXG4gICAgICAgICdsb2cyJyxcclxuICAgICAgICAnbG9nMXAnLFxyXG4gICAgICAgICdleHBtMScsXHJcbiAgICAgICAgJ2Nvc2gnLFxyXG4gICAgICAgICdzaW5oJyxcclxuICAgICAgICAndGFuaCcsXHJcbiAgICAgICAgJ2Fjb3NoJyxcclxuICAgICAgICAnYXNpbmgnLFxyXG4gICAgICAgICdhdGFuaCcsXHJcbiAgICAgICAgJ3RydW5jJyxcclxuICAgICAgICAnZnJvdW5kJyxcclxuICAgICAgICAnY2JydCcsXHJcbiAgICAgICAgJ2h5cG90J1xyXG4gICAgXS5ldmVyeSgobmFtZSkgPT4gdHlwZW9mIGdsb2JhbC5NYXRoW25hbWVdID09PSAnZnVuY3Rpb24nKTtcclxufSwgdHJ1ZSk7XHJcbmFkZCgnZXM2LW1hdGgtaW11bCcsICgpID0+IHtcclxuICAgIGlmICgnaW11bCcgaW4gZ2xvYmFsLk1hdGgpIHtcclxuICAgICAgICAvKiBTb21lIHZlcnNpb25zIG9mIFNhZmFyaSBvbiBpb3MgZG8gbm90IHByb3Blcmx5IGltcGxlbWVudCB0aGlzICovXHJcbiAgICAgICAgcmV0dXJuIE1hdGguaW11bCgweGZmZmZmZmZmLCA1KSA9PT0gLTU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn0sIHRydWUpO1xyXG4vKiBPYmplY3QgKi9cclxuYWRkKCdlczYtb2JqZWN0JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHRydWUgJiZcclxuICAgICAgICBbJ2Fzc2lnbicsICdpcycsICdnZXRPd25Qcm9wZXJ0eVN5bWJvbHMnLCAnc2V0UHJvdG90eXBlT2YnXS5ldmVyeSgobmFtZSkgPT4gdHlwZW9mIGdsb2JhbC5PYmplY3RbbmFtZV0gPT09ICdmdW5jdGlvbicpO1xyXG59LCB0cnVlKTtcclxuYWRkKCdlczIwMTctb2JqZWN0JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIFsndmFsdWVzJywgJ2VudHJpZXMnLCAnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyddLmV2ZXJ5KChuYW1lKSA9PiB0eXBlb2YgZ2xvYmFsLk9iamVjdFtuYW1lXSA9PT0gJ2Z1bmN0aW9uJyk7XHJcbn0sIHRydWUpO1xyXG4vKiBPYnNlcnZhYmxlICovXHJcbmFkZCgnZXMtb2JzZXJ2YWJsZScsICgpID0+IHR5cGVvZiBnbG9iYWwuT2JzZXJ2YWJsZSAhPT0gJ3VuZGVmaW5lZCcsIHRydWUpO1xyXG4vKiBQcm9taXNlICovXHJcbmFkZCgnZXM2LXByb21pc2UnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLlByb21pc2UgIT09ICd1bmRlZmluZWQnICYmIHRydWUsIHRydWUpO1xyXG4vKiBTZXQgKi9cclxuYWRkKCdlczYtc2V0JywgKCkgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiBnbG9iYWwuU2V0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLyogSUUxMSBhbmQgb2xkZXIgdmVyc2lvbnMgb2YgU2FmYXJpIGFyZSBtaXNzaW5nIGNyaXRpY2FsIEVTNiBTZXQgZnVuY3Rpb25hbGl0eSAqL1xyXG4gICAgICAgIGNvbnN0IHNldCA9IG5ldyBnbG9iYWwuU2V0KFsxXSk7XHJcbiAgICAgICAgcmV0dXJuIHNldC5oYXMoMSkgJiYgJ2tleXMnIGluIHNldCAmJiB0eXBlb2Ygc2V0LmtleXMgPT09ICdmdW5jdGlvbicgJiYgdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufSwgdHJ1ZSk7XHJcbi8qIFN0cmluZyAqL1xyXG5hZGQoJ2VzNi1zdHJpbmcnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4gKFtcclxuICAgICAgICAvKiBzdGF0aWMgbWV0aG9kcyAqL1xyXG4gICAgICAgICdmcm9tQ29kZVBvaW50J1xyXG4gICAgXS5ldmVyeSgoa2V5KSA9PiB0eXBlb2YgZ2xvYmFsLlN0cmluZ1trZXldID09PSAnZnVuY3Rpb24nKSAmJlxyXG4gICAgICAgIFtcclxuICAgICAgICAgICAgLyogaW5zdGFuY2UgbWV0aG9kcyAqL1xyXG4gICAgICAgICAgICAnY29kZVBvaW50QXQnLFxyXG4gICAgICAgICAgICAnbm9ybWFsaXplJyxcclxuICAgICAgICAgICAgJ3JlcGVhdCcsXHJcbiAgICAgICAgICAgICdzdGFydHNXaXRoJyxcclxuICAgICAgICAgICAgJ2VuZHNXaXRoJyxcclxuICAgICAgICAgICAgJ2luY2x1ZGVzJ1xyXG4gICAgICAgIF0uZXZlcnkoKGtleSkgPT4gdHlwZW9mIGdsb2JhbC5TdHJpbmcucHJvdG90eXBlW2tleV0gPT09ICdmdW5jdGlvbicpKTtcclxufSwgdHJ1ZSk7XHJcbmFkZCgnZXM2LXN0cmluZy1yYXcnLCAoKSA9PiB7XHJcbiAgICBmdW5jdGlvbiBnZXRDYWxsU2l0ZShjYWxsU2l0ZSwgLi4uc3Vic3RpdHV0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5jYWxsU2l0ZV07XHJcbiAgICAgICAgcmVzdWx0LnJhdyA9IGNhbGxTaXRlLnJhdztcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgaWYgKCdyYXcnIGluIGdsb2JhbC5TdHJpbmcpIHtcclxuICAgICAgICBsZXQgYiA9IDE7XHJcbiAgICAgICAgbGV0IGNhbGxTaXRlID0gZ2V0Q2FsbFNpdGUgYGFcXG4ke2J9YDtcclxuICAgICAgICBjYWxsU2l0ZS5yYXcgPSBbJ2FcXFxcbiddO1xyXG4gICAgICAgIGNvbnN0IHN1cHBvcnRzVHJ1bmMgPSBnbG9iYWwuU3RyaW5nLnJhdyhjYWxsU2l0ZSwgNDIpID09PSAnYVxcXFxuJztcclxuICAgICAgICByZXR1cm4gc3VwcG9ydHNUcnVuYztcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufSwgdHJ1ZSk7XHJcbmFkZCgnZXMyMDE3LXN0cmluZycsICgpID0+IHtcclxuICAgIHJldHVybiBbJ3BhZFN0YXJ0JywgJ3BhZEVuZCddLmV2ZXJ5KChrZXkpID0+IHR5cGVvZiBnbG9iYWwuU3RyaW5nLnByb3RvdHlwZVtrZXldID09PSAnZnVuY3Rpb24nKTtcclxufSwgdHJ1ZSk7XHJcbi8qIFN5bWJvbCAqL1xyXG5hZGQoJ2VzNi1zeW1ib2wnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLlN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIFN5bWJvbCgpID09PSAnc3ltYm9sJywgdHJ1ZSk7XHJcbi8qIFdlYWtNYXAgKi9cclxuYWRkKCdlczYtd2Vha21hcCcsICgpID0+IHtcclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsLldlYWtNYXAgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgLyogSUUxMSBhbmQgb2xkZXIgdmVyc2lvbnMgb2YgU2FmYXJpIGFyZSBtaXNzaW5nIGNyaXRpY2FsIEVTNiBNYXAgZnVuY3Rpb25hbGl0eSAqL1xyXG4gICAgICAgIGNvbnN0IGtleTEgPSB7fTtcclxuICAgICAgICBjb25zdCBrZXkyID0ge307XHJcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IGdsb2JhbC5XZWFrTWFwKFtba2V5MSwgMV1dKTtcclxuICAgICAgICBPYmplY3QuZnJlZXplKGtleTEpO1xyXG4gICAgICAgIHJldHVybiBtYXAuZ2V0KGtleTEpID09PSAxICYmIG1hcC5zZXQoa2V5MiwgMikgPT09IG1hcCAmJiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59LCB0cnVlKTtcclxuLyogTWlzY2VsbGFuZW91cyBmZWF0dXJlcyAqL1xyXG5hZGQoJ21pY3JvdGFza3MnLCAoKSA9PiB0cnVlIHx8IGZhbHNlIHx8IHRydWUsIHRydWUpO1xyXG5hZGQoJ3Bvc3RtZXNzYWdlJywgKCkgPT4ge1xyXG4gICAgLy8gSWYgd2luZG93IGlzIHVuZGVmaW5lZCwgYW5kIHdlIGhhdmUgcG9zdE1lc3NhZ2UsIGl0IHByb2JhYmx5IG1lYW5zIHdlJ3JlIGluIGEgd2ViIHdvcmtlci4gV2ViIHdvcmtlcnMgaGF2ZVxyXG4gICAgLy8gcG9zdCBtZXNzYWdlIGJ1dCBpdCBkb2Vzbid0IHdvcmsgaG93IHdlIGV4cGVjdCBpdCB0bywgc28gaXQncyBiZXN0IGp1c3QgdG8gcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxyXG4gICAgcmV0dXJuIHR5cGVvZiBnbG9iYWwud2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZ2xvYmFsLnBvc3RNZXNzYWdlID09PSAnZnVuY3Rpb24nO1xyXG59LCB0cnVlKTtcclxuYWRkKCdyYWYnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gJ2Z1bmN0aW9uJywgdHJ1ZSk7XHJcbmFkZCgnc2V0aW1tZWRpYXRlJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5zZXRJbW1lZGlhdGUgIT09ICd1bmRlZmluZWQnLCB0cnVlKTtcclxuLyogRE9NIEZlYXR1cmVzICovXHJcbmFkZCgnZG9tLW11dGF0aW9ub2JzZXJ2ZXInLCAoKSA9PiB7XHJcbiAgICBpZiAodHJ1ZSAmJiBCb29sZWFuKGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyKSkge1xyXG4gICAgICAgIC8vIElFMTEgaGFzIGFuIHVucmVsaWFibGUgTXV0YXRpb25PYnNlcnZlciBpbXBsZW1lbnRhdGlvbiB3aGVyZSBzZXRQcm9wZXJ0eSgpIGRvZXMgbm90XHJcbiAgICAgICAgLy8gZ2VuZXJhdGUgYSBtdXRhdGlvbiBldmVudCwgb2JzZXJ2ZXJzIGNhbiBjcmFzaCwgYW5kIHRoZSBxdWV1ZSBkb2VzIG5vdCBkcmFpblxyXG4gICAgICAgIC8vIHJlbGlhYmx5LiBUaGUgZm9sbG93aW5nIGZlYXR1cmUgdGVzdCB3YXMgYWRhcHRlZCBmcm9tXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdDEwa28vNGFjZWI4YzcxNjgxZmRiMjc1ZTMzZWZlNWU1NzZiMTRcclxuICAgICAgICBjb25zdCBleGFtcGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhcmlhYmxlLW5hbWUgKi9cclxuICAgICAgICBjb25zdCBIb3N0TXV0YXRpb25PYnNlcnZlciA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xyXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IEhvc3RNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHsgfSk7XHJcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShleGFtcGxlLCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XHJcbiAgICAgICAgZXhhbXBsZS5zdHlsZS5zZXRQcm9wZXJ0eSgnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgIHJldHVybiBCb29sZWFuKG9ic2VydmVyLnRha2VSZWNvcmRzKCkubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufSwgdHJ1ZSk7XHJcbmFkZCgnZG9tLXdlYmFuaW1hdGlvbicsICgpID0+IHRydWUgJiYgZ2xvYmFsLkFuaW1hdGlvbiAhPT0gdW5kZWZpbmVkICYmIGdsb2JhbC5LZXlmcmFtZUVmZmVjdCAhPT0gdW5kZWZpbmVkLCB0cnVlKTtcclxuYWRkKCdhYm9ydC1jb250cm9sbGVyJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5BYm9ydENvbnRyb2xsZXIgIT09ICd1bmRlZmluZWQnKTtcclxuYWRkKCdhYm9ydC1zaWduYWwnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLkFib3J0U2lnbmFsICE9PSAndW5kZWZpbmVkJyk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhhcy5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vc3VwcG9ydC9oYXMubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L2hhcy5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuLi9nbG9iYWwnO1xyXG5pbXBvcnQgaGFzIGZyb20gJy4vaGFzJztcclxuZnVuY3Rpb24gZXhlY3V0ZVRhc2soaXRlbSkge1xyXG4gICAgaWYgKGl0ZW0gJiYgaXRlbS5pc0FjdGl2ZSAmJiBpdGVtLmNhbGxiYWNrKSB7XHJcbiAgICAgICAgaXRlbS5jYWxsYmFjaygpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGdldFF1ZXVlSGFuZGxlKGl0ZW0sIGRlc3RydWN0b3IpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7IH07XHJcbiAgICAgICAgICAgIGl0ZW0uaXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaXRlbS5jYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChkZXN0cnVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0cnVjdG9yKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcbmxldCBjaGVja01pY3JvVGFza1F1ZXVlO1xyXG5sZXQgbWljcm9UYXNrcztcclxuLyoqXHJcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHRoZSBtYWNyb3Rhc2sgcXVldWUuXHJcbiAqXHJcbiAqIEBwYXJhbSBjYWxsYmFjayB0aGUgZnVuY3Rpb24gdG8gYmUgcXVldWVkIGFuZCBsYXRlciBleGVjdXRlZC5cclxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYSBgZGVzdHJveWAgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBwcmV2ZW50cyB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjayBmcm9tIGV4ZWN1dGluZy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBxdWV1ZVRhc2sgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IGRlc3RydWN0b3I7XHJcbiAgICBsZXQgZW5xdWV1ZTtcclxuICAgIC8vIFNpbmNlIHRoZSBJRSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0SW1tZWRpYXRlYCBpcyBub3QgZmxhd2xlc3MsIHdlIHdpbGwgdGVzdCBmb3IgYHBvc3RNZXNzYWdlYCBmaXJzdC5cclxuICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgY29uc3QgcXVldWUgPSBbXTtcclxuICAgICAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAvLyBDb25maXJtIHRoYXQgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgdGhlIGN1cnJlbnQgd2luZG93IGFuZCBieSB0aGlzIHBhcnRpY3VsYXIgaW1wbGVtZW50YXRpb24uXHJcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IGdsb2JhbCAmJiBldmVudC5kYXRhID09PSAnZG9qby1xdWV1ZS1tZXNzYWdlJykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhlY3V0ZVRhc2socXVldWUuc2hpZnQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgcXVldWUucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKCdkb2pvLXF1ZXVlLW1lc3NhZ2UnLCAnKicpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChmYWxzZSkge1xyXG4gICAgICAgIGRlc3RydWN0b3IgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGU7XHJcbiAgICAgICAgZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRJbW1lZGlhdGUoZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGRlc3RydWN0b3IgPSBnbG9iYWwuY2xlYXJUaW1lb3V0O1xyXG4gICAgICAgIGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChleGVjdXRlVGFzay5iaW5kKG51bGwsIGl0ZW0pLCAwKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcXVldWVUYXNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IHtcclxuICAgICAgICAgICAgaXNBY3RpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFja1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgaWQgPSBlbnF1ZXVlKGl0ZW0pO1xyXG4gICAgICAgIHJldHVybiBnZXRRdWV1ZUhhbmRsZShpdGVtLCBkZXN0cnVjdG9yICYmXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRlc3RydWN0b3IoaWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIFRPRE86IFVzZSBhc3BlY3QuYmVmb3JlIHdoZW4gaXQgaXMgYXZhaWxhYmxlLlxyXG4gICAgcmV0dXJuIHRydWVcclxuICAgICAgICA/IHF1ZXVlVGFza1xyXG4gICAgICAgIDogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTWljcm9UYXNrUXVldWUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHF1ZXVlVGFzayhjYWxsYmFjayk7XHJcbiAgICAgICAgfTtcclxufSkoKTtcclxuLy8gV2hlbiBubyBtZWNoYW5pc20gZm9yIHJlZ2lzdGVyaW5nIG1pY3JvdGFza3MgaXMgZXhwb3NlZCBieSB0aGUgZW52aXJvbm1lbnQsIG1pY3JvdGFza3Mgd2lsbFxyXG4vLyBiZSBxdWV1ZWQgYW5kIHRoZW4gZXhlY3V0ZWQgaW4gYSBzaW5nbGUgbWFjcm90YXNrIGJlZm9yZSB0aGUgb3RoZXIgbWFjcm90YXNrcyBhcmUgZXhlY3V0ZWQuXHJcbmlmICghdHJ1ZSkge1xyXG4gICAgbGV0IGlzTWljcm9UYXNrUXVldWVkID0gZmFsc2U7XHJcbiAgICBtaWNyb1Rhc2tzID0gW107XHJcbiAgICBjaGVja01pY3JvVGFza1F1ZXVlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghaXNNaWNyb1Rhc2tRdWV1ZWQpIHtcclxuICAgICAgICAgICAgaXNNaWNyb1Rhc2tRdWV1ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBxdWV1ZVRhc2soZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaXNNaWNyb1Rhc2tRdWV1ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmIChtaWNyb1Rhc2tzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtO1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgoaXRlbSA9IG1pY3JvVGFza3Muc2hpZnQoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0ZVRhc2soaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcbi8qKlxyXG4gKiBTY2hlZHVsZXMgYW4gYW5pbWF0aW9uIHRhc2sgd2l0aCBgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZWAgaWYgaXQgZXhpc3RzLCBvciB3aXRoIGBxdWV1ZVRhc2tgIG90aGVyd2lzZS5cclxuICpcclxuICogU2luY2UgcmVxdWVzdEFuaW1hdGlvbkZyYW1lJ3MgYmVoYXZpb3IgZG9lcyBub3QgbWF0Y2ggdGhhdCBleHBlY3RlZCBmcm9tIGBxdWV1ZVRhc2tgLCBpdCBpcyBub3QgdXNlZCB0aGVyZS5cclxuICogSG93ZXZlciwgYXQgdGltZXMgaXQgbWFrZXMgbW9yZSBzZW5zZSB0byBkZWxlZ2F0ZSB0byByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7IGhlbmNlIHRoZSBmb2xsb3dpbmcgbWV0aG9kLlxyXG4gKlxyXG4gKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGZ1bmN0aW9uIHRvIGJlIHF1ZXVlZCBhbmQgbGF0ZXIgZXhlY3V0ZWQuXHJcbiAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGEgYGRlc3Ryb3lgIG1ldGhvZCB0aGF0LCB3aGVuIGNhbGxlZCwgcHJldmVudHMgdGhlIHJlZ2lzdGVyZWQgY2FsbGJhY2sgZnJvbSBleGVjdXRpbmcuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgcXVldWVBbmltYXRpb25UYXNrID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBxdWV1ZVRhc2s7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBxdWV1ZUFuaW1hdGlvblRhc2soY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zdCBpdGVtID0ge1xyXG4gICAgICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCByYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShleGVjdXRlVGFzay5iaW5kKG51bGwsIGl0ZW0pKTtcclxuICAgICAgICByZXR1cm4gZ2V0UXVldWVIYW5kbGUoaXRlbSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShyYWZJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyBUT0RPOiBVc2UgYXNwZWN0LmJlZm9yZSB3aGVuIGl0IGlzIGF2YWlsYWJsZS5cclxuICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgPyBxdWV1ZUFuaW1hdGlvblRhc2tcclxuICAgICAgICA6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjaGVja01pY3JvVGFza1F1ZXVlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBxdWV1ZUFuaW1hdGlvblRhc2soY2FsbGJhY2spO1xyXG4gICAgICAgIH07XHJcbn0pKCk7XHJcbi8qKlxyXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byB0aGUgbWljcm90YXNrIHF1ZXVlLlxyXG4gKlxyXG4gKiBBbnkgY2FsbGJhY2tzIHJlZ2lzdGVyZWQgd2l0aCBgcXVldWVNaWNyb1Rhc2tgIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIHRoZSBuZXh0IG1hY3JvdGFzay4gSWYgbm8gbmF0aXZlXHJcbiAqIG1lY2hhbmlzbSBmb3Igc2NoZWR1bGluZyBtYWNyb3Rhc2tzIGlzIGV4cG9zZWQsIHRoZW4gYW55IGNhbGxiYWNrcyB3aWxsIGJlIGZpcmVkIGJlZm9yZSBhbnkgbWFjcm90YXNrXHJcbiAqIHJlZ2lzdGVyZWQgd2l0aCBgcXVldWVUYXNrYCBvciBgcXVldWVBbmltYXRpb25UYXNrYC5cclxuICpcclxuICogQHBhcmFtIGNhbGxiYWNrIHRoZSBmdW5jdGlvbiB0byBiZSBxdWV1ZWQgYW5kIGxhdGVyIGV4ZWN1dGVkLlxyXG4gKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBhIGBkZXN0cm95YCBtZXRob2QgdGhhdCwgd2hlbiBjYWxsZWQsIHByZXZlbnRzIHRoZSByZWdpc3RlcmVkIGNhbGxiYWNrIGZyb20gZXhlY3V0aW5nLlxyXG4gKi9cclxuZXhwb3J0IGxldCBxdWV1ZU1pY3JvVGFzayA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQgZW5xdWV1ZTtcclxuICAgIGlmIChmYWxzZSkge1xyXG4gICAgICAgIGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICBnbG9iYWwucHJvY2Vzcy5uZXh0VGljayhleGVjdXRlVGFzay5iaW5kKG51bGwsIGl0ZW0pKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodHJ1ZSkge1xyXG4gICAgICAgIGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICBnbG9iYWwuUHJvbWlzZS5yZXNvbHZlKGl0ZW0pLnRoZW4oZXhlY3V0ZVRhc2spO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0cnVlKSB7XHJcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhcmlhYmxlLW5hbWUgKi9cclxuICAgICAgICBjb25zdCBIb3N0TXV0YXRpb25PYnNlcnZlciA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBjb25zdCBxdWV1ZSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IEhvc3RNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBxdWV1ZS5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5pc0FjdGl2ZSAmJiBpdGVtLmNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XHJcbiAgICAgICAgZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdxdWV1ZVN0YXR1cycsICcxJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICBjaGVja01pY3JvVGFza1F1ZXVlKCk7XHJcbiAgICAgICAgICAgIG1pY3JvVGFza3MucHVzaChpdGVtKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSB7XHJcbiAgICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVucXVldWUoaXRlbSk7XHJcbiAgICAgICAgcmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0pO1xyXG4gICAgfTtcclxufSkoKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cXVldWUubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N1cHBvcnQvcXVldWUubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L3F1ZXVlLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBnZW5lcmF0ZSBhIHZhbHVlIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICAgIFRoZSB2YWx1ZSB0aGUgcHJvcGVydHkgZGVzY3JpcHRvciBzaG91bGQgYmUgc2V0IHRvXG4gKiBAcGFyYW0gZW51bWVyYWJsZSAgIElmIHRoZSBwcm9wZXJ0eSBzaG91bGQgYmUgZW51bWJlcmFibGUsIGRlZmF1bHRzIHRvIGZhbHNlXG4gKiBAcGFyYW0gd3JpdGFibGUgICAgIElmIHRoZSBwcm9wZXJ0eSBzaG91bGQgYmUgd3JpdGFibGUsIGRlZmF1bHRzIHRvIHRydWVcbiAqIEBwYXJhbSBjb25maWd1cmFibGUgSWYgdGhlIHByb3BlcnR5IHNob3VsZCBiZSBjb25maWd1cmFibGUsIGRlZmF1bHRzIHRvIHRydWVcbiAqIEByZXR1cm4gICAgICAgICAgICAgVGhlIHByb3BlcnR5IGRlc2NyaXB0b3Igb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWYWx1ZURlc2NyaXB0b3IodmFsdWUsIGVudW1lcmFibGUgPSBmYWxzZSwgd3JpdGFibGUgPSB0cnVlLCBjb25maWd1cmFibGUgPSB0cnVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBlbnVtZXJhYmxlLFxuICAgICAgICB3cml0YWJsZTogd3JpdGFibGUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogY29uZmlndXJhYmxlXG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3cmFwTmF0aXZlKG5hdGl2ZUZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIC4uLmFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZUZ1bmN0aW9uLmFwcGx5KHRhcmdldCwgYXJncyk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWwubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N1cHBvcnQvdXRpbC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N1cHBvcnQvdXRpbC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgRXZlbnRlZCB9IGZyb20gJy4uL2NvcmUvRXZlbnRlZCc7XG5leHBvcnQgY2xhc3MgSW5qZWN0b3IgZXh0ZW5kcyBFdmVudGVkIHtcbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX3BheWxvYWQgPSBwYXlsb2FkO1xuICAgIH1cbiAgICBzZXRJbnZhbGlkYXRvcihpbnZhbGlkYXRvcikge1xuICAgICAgICB0aGlzLl9pbnZhbGlkYXRvciA9IGludmFsaWRhdG9yO1xuICAgIH1cbiAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXlsb2FkO1xuICAgIH1cbiAgICBzZXQocGF5bG9hZCkge1xuICAgICAgICB0aGlzLl9wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgaWYgKHRoaXMuX2ludmFsaWRhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnZhbGlkYXRvcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgSW5qZWN0b3I7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1JbmplY3Rvci5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL0luamVjdG9yLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL0luamVjdG9yLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBFdmVudGVkIH0gZnJvbSAnLi4vY29yZS9FdmVudGVkJztcclxuaW1wb3J0IE1hcCBmcm9tICcuLi9zaGltL01hcCc7XHJcbi8qKlxyXG4gKiBFbnVtIHRvIGlkZW50aWZ5IHRoZSB0eXBlIG9mIGV2ZW50LlxyXG4gKiBMaXN0ZW5pbmcgdG8gJ1Byb2plY3Rvcicgd2lsbCBub3RpZnkgd2hlbiBwcm9qZWN0b3IgaXMgY3JlYXRlZCBvciB1cGRhdGVkXHJcbiAqIExpc3RlbmluZyB0byAnV2lkZ2V0JyB3aWxsIG5vdGlmeSB3aGVuIHdpZGdldCByb290IGlzIGNyZWF0ZWQgb3IgdXBkYXRlZFxyXG4gKi9cclxuZXhwb3J0IHZhciBOb2RlRXZlbnRUeXBlO1xyXG4oZnVuY3Rpb24gKE5vZGVFdmVudFR5cGUpIHtcclxuICAgIE5vZGVFdmVudFR5cGVbXCJQcm9qZWN0b3JcIl0gPSBcIlByb2plY3RvclwiO1xyXG4gICAgTm9kZUV2ZW50VHlwZVtcIldpZGdldFwiXSA9IFwiV2lkZ2V0XCI7XHJcbn0pKE5vZGVFdmVudFR5cGUgfHwgKE5vZGVFdmVudFR5cGUgPSB7fSkpO1xyXG5leHBvcnQgY2xhc3MgTm9kZUhhbmRsZXIgZXh0ZW5kcyBFdmVudGVkIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XHJcbiAgICAgICAgdGhpcy5fbm9kZU1hcCA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIGdldChrZXkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZU1hcC5nZXQoa2V5KTtcclxuICAgIH1cclxuICAgIGhhcyhrZXkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZU1hcC5oYXMoa2V5KTtcclxuICAgIH1cclxuICAgIGFkZChlbGVtZW50LCBrZXkpIHtcclxuICAgICAgICB0aGlzLl9ub2RlTWFwLnNldChrZXksIGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuZW1pdCh7IHR5cGU6IGtleSB9KTtcclxuICAgIH1cclxuICAgIGFkZFJvb3QoKSB7XHJcbiAgICAgICAgdGhpcy5lbWl0KHsgdHlwZTogTm9kZUV2ZW50VHlwZS5XaWRnZXQgfSk7XHJcbiAgICB9XHJcbiAgICBhZGRQcm9qZWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lbWl0KHsgdHlwZTogTm9kZUV2ZW50VHlwZS5Qcm9qZWN0b3IgfSk7XHJcbiAgICB9XHJcbiAgICBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLl9ub2RlTWFwLmNsZWFyKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgTm9kZUhhbmRsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU5vZGVIYW5kbGVyLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvTm9kZUhhbmRsZXIubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvTm9kZUhhbmRsZXIubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBQcm9taXNlIGZyb20gJy4uL3NoaW0vUHJvbWlzZSc7XHJcbmltcG9ydCBNYXAgZnJvbSAnLi4vc2hpbS9NYXAnO1xyXG5pbXBvcnQgeyBFdmVudGVkIH0gZnJvbSAnLi4vY29yZS9FdmVudGVkJztcclxuLyoqXHJcbiAqIFdpZGdldCBiYXNlIHR5cGVcclxuICovXHJcbmV4cG9ydCBjb25zdCBXSURHRVRfQkFTRV9UWVBFID0gJ19fd2lkZ2V0X2Jhc2VfdHlwZSc7XHJcbi8qKlxyXG4gKiBDaGVja3MgaXMgdGhlIGl0ZW0gaXMgYSBzdWJjbGFzcyBvZiBXaWRnZXRCYXNlIChvciBhIFdpZGdldEJhc2UpXHJcbiAqXHJcbiAqIEBwYXJhbSBpdGVtIHRoZSBpdGVtIHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIHRydWUvZmFsc2UgaW5kaWNhdGluZyBpZiB0aGUgaXRlbSBpcyBhIFdpZGdldEJhc2VDb25zdHJ1Y3RvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yKGl0ZW0pIHtcclxuICAgIHJldHVybiBCb29sZWFuKGl0ZW0gJiYgaXRlbS5fdHlwZSA9PT0gV0lER0VUX0JBU0VfVFlQRSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzV2lkZ2V0Q29uc3RydWN0b3JEZWZhdWx0RXhwb3J0KGl0ZW0pIHtcclxuICAgIHJldHVybiBCb29sZWFuKGl0ZW0gJiZcclxuICAgICAgICBpdGVtLmhhc093blByb3BlcnR5KCdfX2VzTW9kdWxlJykgJiZcclxuICAgICAgICBpdGVtLmhhc093blByb3BlcnR5KCdkZWZhdWx0JykgJiZcclxuICAgICAgICBpc1dpZGdldEJhc2VDb25zdHJ1Y3RvcihpdGVtLmRlZmF1bHQpKTtcclxufVxyXG4vKipcclxuICogVGhlIFJlZ2lzdHJ5IGltcGxlbWVudGF0aW9uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmVnaXN0cnkgZXh0ZW5kcyBFdmVudGVkIHtcclxuICAgIC8qKlxyXG4gICAgICogRW1pdCBsb2FkZWQgZXZlbnQgZm9yIHJlZ2lzdHJ5IGxhYmVsXHJcbiAgICAgKi9cclxuICAgIGVtaXRMb2FkZWRFdmVudCh3aWRnZXRMYWJlbCwgaXRlbSkge1xyXG4gICAgICAgIHRoaXMuZW1pdCh7XHJcbiAgICAgICAgICAgIHR5cGU6IHdpZGdldExhYmVsLFxyXG4gICAgICAgICAgICBhY3Rpb246ICdsb2FkZWQnLFxyXG4gICAgICAgICAgICBpdGVtXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBkZWZpbmUobGFiZWwsIGl0ZW0pIHtcclxuICAgICAgICBpZiAodGhpcy5fd2lkZ2V0UmVnaXN0cnkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl93aWRnZXRSZWdpc3RyeSA9IG5ldyBNYXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3dpZGdldFJlZ2lzdHJ5LmhhcyhsYWJlbCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB3aWRnZXQgaGFzIGFscmVhZHkgYmVlbiByZWdpc3RlcmVkIGZvciAnJHtsYWJlbC50b1N0cmluZygpfSdgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2lkZ2V0UmVnaXN0cnkuc2V0KGxhYmVsLCBpdGVtKTtcclxuICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgaXRlbS50aGVuKCh3aWRnZXRDdG9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl93aWRnZXRSZWdpc3RyeS5zZXQobGFiZWwsIHdpZGdldEN0b3IpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0TG9hZGVkRXZlbnQobGFiZWwsIHdpZGdldEN0b3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldEN0b3I7XHJcbiAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpc1dpZGdldEJhc2VDb25zdHJ1Y3RvcihpdGVtKSkge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXRMb2FkZWRFdmVudChsYWJlbCwgaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGVmaW5lSW5qZWN0b3IobGFiZWwsIGluamVjdG9yRmFjdG9yeSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbmplY3RvclJlZ2lzdHJ5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5faW5qZWN0b3JSZWdpc3RyeSA9IG5ldyBNYXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2luamVjdG9yUmVnaXN0cnkuaGFzKGxhYmVsKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGluamVjdG9yIGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCBmb3IgJyR7bGFiZWwudG9TdHJpbmcoKX0nYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGludmFsaWRhdG9yID0gbmV3IEV2ZW50ZWQoKTtcclxuICAgICAgICBjb25zdCBpbmplY3Rvckl0ZW0gPSB7XHJcbiAgICAgICAgICAgIGluamVjdG9yOiBpbmplY3RvckZhY3RvcnkoKCkgPT4gaW52YWxpZGF0b3IuZW1pdCh7IHR5cGU6ICdpbnZhbGlkYXRlJyB9KSksXHJcbiAgICAgICAgICAgIGludmFsaWRhdG9yXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLl9pbmplY3RvclJlZ2lzdHJ5LnNldChsYWJlbCwgaW5qZWN0b3JJdGVtKTtcclxuICAgICAgICB0aGlzLmVtaXRMb2FkZWRFdmVudChsYWJlbCwgaW5qZWN0b3JJdGVtKTtcclxuICAgIH1cclxuICAgIGdldChsYWJlbCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fd2lkZ2V0UmVnaXN0cnkgfHwgIXRoaXMuaGFzKGxhYmVsKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX3dpZGdldFJlZ2lzdHJ5LmdldChsYWJlbCk7XHJcbiAgICAgICAgaWYgKGlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yKGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBpdGVtKCk7XHJcbiAgICAgICAgdGhpcy5fd2lkZ2V0UmVnaXN0cnkuc2V0KGxhYmVsLCBwcm9taXNlKTtcclxuICAgICAgICBwcm9taXNlLnRoZW4oKHdpZGdldEN0b3IpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlzV2lkZ2V0Q29uc3RydWN0b3JEZWZhdWx0RXhwb3J0KHdpZGdldEN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXRDdG9yID0gd2lkZ2V0Q3Rvci5kZWZhdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3dpZGdldFJlZ2lzdHJ5LnNldChsYWJlbCwgd2lkZ2V0Q3Rvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZW1pdExvYWRlZEV2ZW50KGxhYmVsLCB3aWRnZXRDdG9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIHdpZGdldEN0b3I7XHJcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZ2V0SW5qZWN0b3IobGFiZWwpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2luamVjdG9yUmVnaXN0cnkgfHwgIXRoaXMuaGFzSW5qZWN0b3IobGFiZWwpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5faW5qZWN0b3JSZWdpc3RyeS5nZXQobGFiZWwpO1xyXG4gICAgfVxyXG4gICAgaGFzKGxhYmVsKSB7XHJcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fd2lkZ2V0UmVnaXN0cnkgJiYgdGhpcy5fd2lkZ2V0UmVnaXN0cnkuaGFzKGxhYmVsKSk7XHJcbiAgICB9XHJcbiAgICBoYXNJbmplY3RvcihsYWJlbCkge1xyXG4gICAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2luamVjdG9yUmVnaXN0cnkgJiYgdGhpcy5faW5qZWN0b3JSZWdpc3RyeS5oYXMobGFiZWwpKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBSZWdpc3RyeTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UmVnaXN0cnkubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9SZWdpc3RyeS5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9SZWdpc3RyeS5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi4vc2hpbS9NYXAnO1xyXG5pbXBvcnQgeyBFdmVudGVkIH0gZnJvbSAnLi4vY29yZS9FdmVudGVkJztcclxuaW1wb3J0IHsgUmVnaXN0cnkgfSBmcm9tICcuL1JlZ2lzdHJ5JztcclxuZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5SGFuZGxlciBleHRlbmRzIEV2ZW50ZWQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLl9yZWdpc3RyeSA9IG5ldyBSZWdpc3RyeSgpO1xyXG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5V2lkZ2V0TGFiZWxNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5fcmVnaXN0cnlJbmplY3RvckxhYmVsTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMub3duKHRoaXMuX3JlZ2lzdHJ5KTtcclxuICAgICAgICBjb25zdCBkZXN0cm95ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5iYXNlUmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZ2lzdHJ5V2lkZ2V0TGFiZWxNYXAuZGVsZXRlKHRoaXMuYmFzZVJlZ2lzdHJ5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZ2lzdHJ5SW5qZWN0b3JMYWJlbE1hcC5kZWxldGUodGhpcy5iYXNlUmVnaXN0cnkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iYXNlUmVnaXN0cnkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMub3duKHsgZGVzdHJveSB9KTtcclxuICAgIH1cclxuICAgIHNldCBiYXNlKGJhc2VSZWdpc3RyeSkge1xyXG4gICAgICAgIGlmICh0aGlzLmJhc2VSZWdpc3RyeSkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RyeVdpZGdldExhYmVsTWFwLmRlbGV0ZSh0aGlzLmJhc2VSZWdpc3RyeSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZ2lzdHJ5SW5qZWN0b3JMYWJlbE1hcC5kZWxldGUodGhpcy5iYXNlUmVnaXN0cnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJhc2VSZWdpc3RyeSA9IGJhc2VSZWdpc3RyeTtcclxuICAgIH1cclxuICAgIGRlZmluZShsYWJlbCwgd2lkZ2V0KSB7XHJcbiAgICAgICAgdGhpcy5fcmVnaXN0cnkuZGVmaW5lKGxhYmVsLCB3aWRnZXQpO1xyXG4gICAgfVxyXG4gICAgZGVmaW5lSW5qZWN0b3IobGFiZWwsIGluamVjdG9yKSB7XHJcbiAgICAgICAgdGhpcy5fcmVnaXN0cnkuZGVmaW5lSW5qZWN0b3IobGFiZWwsIGluamVjdG9yKTtcclxuICAgIH1cclxuICAgIGhhcyhsYWJlbCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWdpc3RyeS5oYXMobGFiZWwpIHx8IEJvb2xlYW4odGhpcy5iYXNlUmVnaXN0cnkgJiYgdGhpcy5iYXNlUmVnaXN0cnkuaGFzKGxhYmVsKSk7XHJcbiAgICB9XHJcbiAgICBoYXNJbmplY3RvcihsYWJlbCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZWdpc3RyeS5oYXNJbmplY3RvcihsYWJlbCkgfHwgQm9vbGVhbih0aGlzLmJhc2VSZWdpc3RyeSAmJiB0aGlzLmJhc2VSZWdpc3RyeS5oYXNJbmplY3RvcihsYWJlbCkpO1xyXG4gICAgfVxyXG4gICAgZ2V0KGxhYmVsLCBnbG9iYWxQcmVjZWRlbmNlID0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0KGxhYmVsLCBnbG9iYWxQcmVjZWRlbmNlLCAnZ2V0JywgdGhpcy5fcmVnaXN0cnlXaWRnZXRMYWJlbE1hcCk7XHJcbiAgICB9XHJcbiAgICBnZXRJbmplY3RvcihsYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldChsYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZSwgJ2dldEluamVjdG9yJywgdGhpcy5fcmVnaXN0cnlJbmplY3RvckxhYmVsTWFwKTtcclxuICAgIH1cclxuICAgIF9nZXQobGFiZWwsIGdsb2JhbFByZWNlZGVuY2UsIGdldEZ1bmN0aW9uTmFtZSwgbGFiZWxNYXApIHtcclxuICAgICAgICBjb25zdCByZWdpc3RyaWVzID0gZ2xvYmFsUHJlY2VkZW5jZSA/IFt0aGlzLmJhc2VSZWdpc3RyeSwgdGhpcy5fcmVnaXN0cnldIDogW3RoaXMuX3JlZ2lzdHJ5LCB0aGlzLmJhc2VSZWdpc3RyeV07XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWdpc3RyaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gcmVnaXN0cmllc1tpXTtcclxuICAgICAgICAgICAgaWYgKCFyZWdpc3RyeSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHJlZ2lzdHJ5W2dldEZ1bmN0aW9uTmFtZV0obGFiZWwpO1xyXG4gICAgICAgICAgICBjb25zdCByZWdpc3RlcmVkTGFiZWxzID0gbGFiZWxNYXAuZ2V0KHJlZ2lzdHJ5KSB8fCBbXTtcclxuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlZ2lzdGVyZWRMYWJlbHMuaW5kZXhPZihsYWJlbCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGUgPSByZWdpc3RyeS5vbihsYWJlbCwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmFjdGlvbiA9PT0gJ2xvYWRlZCcgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1tnZXRGdW5jdGlvbk5hbWVdKGxhYmVsLCBnbG9iYWxQcmVjZWRlbmNlKSA9PT0gZXZlbnQuaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoeyB0eXBlOiAnaW52YWxpZGF0ZScgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm93bihoYW5kbGUpO1xyXG4gICAgICAgICAgICAgICAgbGFiZWxNYXAuc2V0KHJlZ2lzdHJ5LCBbLi4ucmVnaXN0ZXJlZExhYmVscywgbGFiZWxdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBSZWdpc3RyeUhhbmRsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVJlZ2lzdHJ5SGFuZGxlci5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1JlZ2lzdHJ5SGFuZGxlci5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9SZWdpc3RyeUhhbmRsZXIubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBNYXAgZnJvbSAnLi4vc2hpbS9NYXAnO1xyXG5pbXBvcnQgV2Vha01hcCBmcm9tICcuLi9zaGltL1dlYWtNYXAnO1xyXG5pbXBvcnQgeyB2LCBWTk9ERSwgaXNWTm9kZSwgaXNXTm9kZSB9IGZyb20gJy4vZCc7XHJcbmltcG9ydCB7IGF1dG8gfSBmcm9tICcuL2RpZmYnO1xyXG5pbXBvcnQgUmVnaXN0cnlIYW5kbGVyIGZyb20gJy4vUmVnaXN0cnlIYW5kbGVyJztcclxuaW1wb3J0IE5vZGVIYW5kbGVyIGZyb20gJy4vTm9kZUhhbmRsZXInO1xyXG5pbXBvcnQgeyBpc1dpZGdldEJhc2VDb25zdHJ1Y3RvciwgV0lER0VUX0JBU0VfVFlQRSB9IGZyb20gJy4vUmVnaXN0cnknO1xyXG5sZXQgbGF6eVdpZGdldElkID0gMDtcclxuY29uc3QgbGF6eVdpZGdldElkTWFwID0gbmV3IFdlYWtNYXAoKTtcclxuY29uc3QgZGVjb3JhdG9yTWFwID0gbmV3IE1hcCgpO1xyXG5leHBvcnQgY29uc3Qgd2lkZ2V0SW5zdGFuY2VNYXAgPSBuZXcgV2Vha01hcCgpO1xyXG5jb25zdCBib3VuZEF1dG8gPSBhdXRvLmJpbmQobnVsbCk7XHJcbmV4cG9ydCBjb25zdCBub0JpbmQgPSAnX19kb2pvX25vX2JpbmQnO1xyXG5mdW5jdGlvbiB0b1RleHRWTm9kZShkYXRhKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRhZzogJycsXHJcbiAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgY2hpbGRyZW46IHVuZGVmaW5lZCxcclxuICAgICAgICB0ZXh0OiBgJHtkYXRhfWAsXHJcbiAgICAgICAgdHlwZTogVk5PREVcclxuICAgIH07XHJcbn1cclxuZnVuY3Rpb24gaXNMYXp5RGVmaW5lKGl0ZW0pIHtcclxuICAgIHJldHVybiBCb29sZWFuKGl0ZW0gJiYgaXRlbS5sYWJlbCk7XHJcbn1cclxuLyoqXHJcbiAqIE1haW4gd2lkZ2V0IGJhc2UgZm9yIGFsbCB3aWRnZXRzIHRvIGV4dGVuZFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFdpZGdldEJhc2Uge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5kaWNhdGVzIGlmIGl0IGlzIHRoZSBpbml0aWFsIHNldCBwcm9wZXJ0aWVzIGN5Y2xlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5faW5pdGlhbFByb3BlcnRpZXMgPSB0cnVlO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFycmF5IG9mIHByb3BlcnR5IGtleXMgY29uc2lkZXJlZCBjaGFuZ2VkIGZyb20gdGhlIHByZXZpb3VzIHNldCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnR5S2V5cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX25vZGVIYW5kbGVyID0gbmV3IE5vZGVIYW5kbGVyKCk7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gW107XHJcbiAgICAgICAgdGhpcy5fZGVjb3JhdG9yQ2FjaGUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5fcHJvcGVydGllcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2JvdW5kUmVuZGVyRnVuYyA9IHRoaXMucmVuZGVyLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fYm91bmRJbnZhbGlkYXRlID0gdGhpcy5pbnZhbGlkYXRlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgd2lkZ2V0SW5zdGFuY2VNYXAuc2V0KHRoaXMsIHtcclxuICAgICAgICAgICAgZGlydHk6IHRydWUsXHJcbiAgICAgICAgICAgIG9uQXR0YWNoOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uQXR0YWNoKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRGV0YWNoOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRGV0YWNoKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbm9kZUhhbmRsZXI6IHRoaXMuX25vZGVIYW5kbGVyLFxyXG4gICAgICAgICAgICByZW5kZXJpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbnB1dFByb3BlcnRpZXM6IHt9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vd24oe1xyXG4gICAgICAgICAgICBkZXN0cm95OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXRJbnN0YW5jZU1hcC5kZWxldGUodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub2RlSGFuZGxlci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9kZUhhbmRsZXIuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcnVuQWZ0ZXJDb25zdHJ1Y3RvcnMoKTtcclxuICAgIH1cclxuICAgIG1ldGEoTWV0YVR5cGUpIHtcclxuICAgICAgICBpZiAodGhpcy5fbWV0YU1hcCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21ldGFNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjYWNoZWQgPSB0aGlzLl9tZXRhTWFwLmdldChNZXRhVHlwZSk7XHJcbiAgICAgICAgaWYgKCFjYWNoZWQpIHtcclxuICAgICAgICAgICAgY2FjaGVkID0gbmV3IE1ldGFUeXBlKHtcclxuICAgICAgICAgICAgICAgIGludmFsaWRhdGU6IHRoaXMuX2JvdW5kSW52YWxpZGF0ZSxcclxuICAgICAgICAgICAgICAgIG5vZGVIYW5kbGVyOiB0aGlzLl9ub2RlSGFuZGxlcixcclxuICAgICAgICAgICAgICAgIGJpbmQ6IHRoaXNcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMub3duKGNhY2hlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuX21ldGFNYXAuc2V0KE1ldGFUeXBlLCBjYWNoZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2FjaGVkO1xyXG4gICAgfVxyXG4gICAgb25BdHRhY2goKSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBieSBkZWZhdWx0LlxyXG4gICAgfVxyXG4gICAgb25EZXRhY2goKSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBieSBkZWZhdWx0LlxyXG4gICAgfVxyXG4gICAgZ2V0IHByb3BlcnRpZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb3BlcnRpZXM7XHJcbiAgICB9XHJcbiAgICBnZXQgY2hhbmdlZFByb3BlcnR5S2V5cygpIHtcclxuICAgICAgICByZXR1cm4gWy4uLnRoaXMuX2NoYW5nZWRQcm9wZXJ0eUtleXNdO1xyXG4gICAgfVxyXG4gICAgX19zZXRQcm9wZXJ0aWVzX18ob3JpZ2luYWxQcm9wZXJ0aWVzLCBiaW5kKSB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHRoaXMpO1xyXG4gICAgICAgIGlmIChpbnN0YW5jZURhdGEpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2VEYXRhLmlucHV0UHJvcGVydGllcyA9IG9yaWdpbmFsUHJvcGVydGllcztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX3J1bkJlZm9yZVByb3BlcnRpZXMob3JpZ2luYWxQcm9wZXJ0aWVzKTtcclxuICAgICAgICBjb25zdCByZWdpc3RlcmVkRGlmZlByb3BlcnR5TmFtZXMgPSB0aGlzLmdldERlY29yYXRvcigncmVnaXN0ZXJlZERpZmZQcm9wZXJ0eScpO1xyXG4gICAgICAgIGNvbnN0IGNoYW5nZWRQcm9wZXJ0eUtleXMgPSBbXTtcclxuICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmtleXMocHJvcGVydGllcyk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxQcm9wZXJ0aWVzID09PSBmYWxzZSB8fCByZWdpc3RlcmVkRGlmZlByb3BlcnR5TmFtZXMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFsbFByb3BlcnRpZXMgPSBbLi4ucHJvcGVydHlOYW1lcywgLi4uT2JqZWN0LmtleXModGhpcy5fcHJvcGVydGllcyldO1xyXG4gICAgICAgICAgICBjb25zdCBjaGVja2VkUHJvcGVydGllcyA9IFtdO1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmUHJvcGVydHlSZXN1bHRzID0ge307XHJcbiAgICAgICAgICAgIGxldCBydW5SZWFjdGlvbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWUgPSBhbGxQcm9wZXJ0aWVzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrZWRQcm9wZXJ0aWVzLmluZGV4T2YocHJvcGVydHlOYW1lKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNoZWNrZWRQcm9wZXJ0aWVzLnB1c2gocHJvcGVydHlOYW1lKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzUHJvcGVydHkgPSB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQcm9wZXJ0eSA9IHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5KHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSwgYmluZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVnaXN0ZXJlZERpZmZQcm9wZXJ0eU5hbWVzLmluZGV4T2YocHJvcGVydHlOYW1lKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBydW5SZWFjdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpZmZGdW5jdGlvbnMgPSB0aGlzLmdldERlY29yYXRvcihgZGlmZlByb3BlcnR5OiR7cHJvcGVydHlOYW1lfWApO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGlmZkZ1bmN0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkaWZmRnVuY3Rpb25zW2ldKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5jaGFuZ2VkICYmIGNoYW5nZWRQcm9wZXJ0eUtleXMuaW5kZXhPZihwcm9wZXJ0eU5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlZFByb3BlcnR5S2V5cy5wdXNoKHByb3BlcnR5TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5TmFtZSBpbiBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmUHJvcGVydHlSZXN1bHRzW3Byb3BlcnR5TmFtZV0gPSByZXN1bHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBib3VuZEF1dG8ocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuY2hhbmdlZCAmJiBjaGFuZ2VkUHJvcGVydHlLZXlzLmluZGV4T2YocHJvcGVydHlOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlZFByb3BlcnR5S2V5cy5wdXNoKHByb3BlcnR5TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmUHJvcGVydHlSZXN1bHRzW3Byb3BlcnR5TmFtZV0gPSByZXN1bHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChydW5SZWFjdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlYWN0aW9uRnVuY3Rpb25zID0gdGhpcy5nZXREZWNvcmF0b3IoJ2RpZmZSZWFjdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXhlY3V0ZWRSZWFjdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHJlYWN0aW9uRnVuY3Rpb25zLmZvckVhY2goKHsgcmVhY3Rpb24sIHByb3BlcnR5TmFtZSB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlDaGFuZ2VkID0gY2hhbmdlZFByb3BlcnR5S2V5cy5pbmRleE9mKHByb3BlcnR5TmFtZSkgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlYWN0aW9uUnVuID0gZXhlY3V0ZWRSZWFjdGlvbnMuaW5kZXhPZihyZWFjdGlvbikgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eUNoYW5nZWQgJiYgIXJlYWN0aW9uUnVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWN0aW9uLmNhbGwodGhpcywgdGhpcy5fcHJvcGVydGllcywgZGlmZlByb3BlcnR5UmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGVkUmVhY3Rpb25zLnB1c2gocmVhY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXMgPSBkaWZmUHJvcGVydHlSZXN1bHRzO1xyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydHlLZXlzID0gY2hhbmdlZFByb3BlcnR5S2V5cztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxQcm9wZXJ0aWVzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcGVydHlOYW1lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gdGhpcy5fYmluZEZ1bmN0aW9uUHJvcGVydHkocHJvcGVydGllc1twcm9wZXJ0eU5hbWVdLCBiaW5kKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWRQcm9wZXJ0eUtleXMucHVzaChwcm9wZXJ0eU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0eUtleXMgPSBjaGFuZ2VkUHJvcGVydHlLZXlzO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcGVydGllcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9jaGFuZ2VkUHJvcGVydHlLZXlzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0IGNoaWxkcmVuKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbjtcclxuICAgIH1cclxuICAgIF9fc2V0Q2hpbGRyZW5fXyhjaGlsZHJlbikge1xyXG4gICAgICAgIGlmICh0aGlzLl9jaGlsZHJlbi5sZW5ndGggPiAwIHx8IGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgX2ZpbHRlckFuZENvbnZlcnQobm9kZXMpIHtcclxuICAgICAgICBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheShub2Rlcyk7XHJcbiAgICAgICAgY29uc3QgZmlsdGVyZWROb2RlcyA9IEFycmF5LmlzQXJyYXkobm9kZXMpID8gbm9kZXMgOiBbbm9kZXNdO1xyXG4gICAgICAgIGNvbnN0IGNvbnZlcnRlZE5vZGVzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXJlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBmaWx0ZXJlZE5vZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGNvbnZlcnRlZE5vZGVzLnB1c2godG9UZXh0Vk5vZGUobm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzVk5vZGUobm9kZSkgJiYgbm9kZS5kZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IG5vZGUuZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2soZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5vcmlnaW5hbFByb3BlcnRpZXMgPSBub2RlLnByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICAgICBub2RlLnByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0aWVzLCBub2RlLnByb3BlcnRpZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc1dOb2RlKG5vZGUpICYmICFpc1dpZGdldEJhc2VDb25zdHJ1Y3Rvcihub2RlLndpZGdldENvbnN0cnVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBub2RlLndpZGdldENvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlkID0gbGF6eVdpZGdldElkTWFwLmdldChub2RlLndpZGdldENvbnN0cnVjdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gYF9fbGF6eV93aWRnZXRfJHtsYXp5V2lkZ2V0SWQrK31gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXp5V2lkZ2V0SWRNYXAuc2V0KG5vZGUud2lkZ2V0Q29uc3RydWN0b3IsIGlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RyeS5kZWZpbmUoaWQsIG5vZGUud2lkZ2V0Q29uc3RydWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBub2RlLndpZGdldENvbnN0cnVjdG9yID0gaWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0xhenlEZWZpbmUobm9kZS53aWRnZXRDb25zdHJ1Y3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGxhYmVsLCByZWdpc3RyeUl0ZW0gfSA9IG5vZGUud2lkZ2V0Q29uc3RydWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnJlZ2lzdHJ5LmhhcyhsYWJlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RyeS5kZWZpbmUobGFiZWwsIHJlZ2lzdHJ5SXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUud2lkZ2V0Q29uc3RydWN0b3IgPSBsYWJlbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5vZGUud2lkZ2V0Q29uc3RydWN0b3IgPVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0cnkuZ2V0KG5vZGUud2lkZ2V0Q29uc3RydWN0b3IpIHx8IG5vZGUud2lkZ2V0Q29uc3RydWN0b3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFub2RlLmJpbmQpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuYmluZCA9IHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udmVydGVkTm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4gPSB0aGlzLl9maWx0ZXJBbmRDb252ZXJ0KG5vZGUuY2hpbGRyZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0FycmF5ID8gY29udmVydGVkTm9kZXMgOiBjb252ZXJ0ZWROb2Rlc1swXTtcclxuICAgIH1cclxuICAgIF9fcmVuZGVyX18oKSB7XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHRoaXMpO1xyXG4gICAgICAgIGlmIChpbnN0YW5jZURhdGEpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2VEYXRhLmRpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlbmRlciA9IHRoaXMuX3J1bkJlZm9yZVJlbmRlcnMoKTtcclxuICAgICAgICBjb25zdCBkTm9kZSA9IHRoaXMuX2ZpbHRlckFuZENvbnZlcnQodGhpcy5fcnVuQWZ0ZXJSZW5kZXJzKHJlbmRlcigpKSk7XHJcbiAgICAgICAgdGhpcy5fbm9kZUhhbmRsZXIuY2xlYXIoKTtcclxuICAgICAgICByZXR1cm4gZE5vZGU7XHJcbiAgICB9XHJcbiAgICBpbnZhbGlkYXRlKCkge1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldCh0aGlzKTtcclxuICAgICAgICBpZiAoaW5zdGFuY2VEYXRhICYmIGluc3RhbmNlRGF0YS5pbnZhbGlkYXRlKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlRGF0YS5pbnZhbGlkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICAgIHJldHVybiB2KCdkaXYnLCB7fSwgdGhpcy5jaGlsZHJlbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEZ1bmN0aW9uIHRvIGFkZCBkZWNvcmF0b3JzIHRvIFdpZGdldEJhc2VcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGVjb3JhdG9yS2V5IFRoZSBrZXkgb2YgdGhlIGRlY29yYXRvclxyXG4gICAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgZGVjb3JhdG9yXHJcbiAgICAgKi9cclxuICAgIGFkZERlY29yYXRvcihkZWNvcmF0b3JLZXksIHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXTtcclxuICAgICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xyXG4gICAgICAgICAgICBsZXQgZGVjb3JhdG9yTGlzdCA9IGRlY29yYXRvck1hcC5nZXQodGhpcy5jb25zdHJ1Y3Rvcik7XHJcbiAgICAgICAgICAgIGlmICghZGVjb3JhdG9yTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yTGlzdCA9IG5ldyBNYXAoKTtcclxuICAgICAgICAgICAgICAgIGRlY29yYXRvck1hcC5zZXQodGhpcy5jb25zdHJ1Y3RvciwgZGVjb3JhdG9yTGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHNwZWNpZmljRGVjb3JhdG9yTGlzdCA9IGRlY29yYXRvckxpc3QuZ2V0KGRlY29yYXRvcktleSk7XHJcbiAgICAgICAgICAgIGlmICghc3BlY2lmaWNEZWNvcmF0b3JMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBzcGVjaWZpY0RlY29yYXRvckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIGRlY29yYXRvckxpc3Quc2V0KGRlY29yYXRvcktleSwgc3BlY2lmaWNEZWNvcmF0b3JMaXN0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzcGVjaWZpY0RlY29yYXRvckxpc3QucHVzaCguLi52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gdGhpcy5nZXREZWNvcmF0b3IoZGVjb3JhdG9yS2V5KTtcclxuICAgICAgICAgICAgdGhpcy5fZGVjb3JhdG9yQ2FjaGUuc2V0KGRlY29yYXRvcktleSwgWy4uLmRlY29yYXRvcnMsIC4uLnZhbHVlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0byBidWlsZCB0aGUgbGlzdCBvZiBkZWNvcmF0b3JzIGZyb20gdGhlIGdsb2JhbCBkZWNvcmF0b3IgbWFwLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkZWNvcmF0b3JLZXkgIFRoZSBrZXkgb2YgdGhlIGRlY29yYXRvclxyXG4gICAgICogQHJldHVybiBBbiBhcnJheSBvZiBkZWNvcmF0b3IgdmFsdWVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYnVpbGREZWNvcmF0b3JMaXN0KGRlY29yYXRvcktleSkge1xyXG4gICAgICAgIGNvbnN0IGFsbERlY29yYXRvcnMgPSBbXTtcclxuICAgICAgICBsZXQgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xyXG4gICAgICAgIHdoaWxlIChjb25zdHJ1Y3Rvcikge1xyXG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZU1hcCA9IGRlY29yYXRvck1hcC5nZXQoY29uc3RydWN0b3IpO1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2VNYXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlY29yYXRvcnMgPSBpbnN0YW5jZU1hcC5nZXQoZGVjb3JhdG9yS2V5KTtcclxuICAgICAgICAgICAgICAgIGlmIChkZWNvcmF0b3JzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsRGVjb3JhdG9ycy51bnNoaWZ0KC4uLmRlY29yYXRvcnMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGNvbnN0cnVjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFsbERlY29yYXRvcnM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEZ1bmN0aW9uIHRvIHJldHJpZXZlIGRlY29yYXRvciB2YWx1ZXNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGVjb3JhdG9yS2V5IFRoZSBrZXkgb2YgdGhlIGRlY29yYXRvclxyXG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgZGVjb3JhdG9yIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBnZXREZWNvcmF0b3IoZGVjb3JhdG9yS2V5KSB7XHJcbiAgICAgICAgbGV0IGFsbERlY29yYXRvcnMgPSB0aGlzLl9kZWNvcmF0b3JDYWNoZS5nZXQoZGVjb3JhdG9yS2V5KTtcclxuICAgICAgICBpZiAoYWxsRGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhbGxEZWNvcmF0b3JzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhbGxEZWNvcmF0b3JzID0gdGhpcy5fYnVpbGREZWNvcmF0b3JMaXN0KGRlY29yYXRvcktleSk7XHJcbiAgICAgICAgdGhpcy5fZGVjb3JhdG9yQ2FjaGUuc2V0KGRlY29yYXRvcktleSwgYWxsRGVjb3JhdG9ycyk7XHJcbiAgICAgICAgcmV0dXJuIGFsbERlY29yYXRvcnM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEJpbmRzIHVuYm91bmQgcHJvcGVydHkgZnVuY3Rpb25zIHRvIHRoZSBzcGVjaWZpZWQgYGJpbmRgIHByb3BlcnR5XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHByb3BlcnRpZXMgcHJvcGVydGllcyB0byBjaGVjayBmb3IgZnVuY3Rpb25zXHJcbiAgICAgKi9cclxuICAgIF9iaW5kRnVuY3Rpb25Qcm9wZXJ0eShwcm9wZXJ0eSwgYmluZCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgIXByb3BlcnR5W25vQmluZF0gJiYgaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IocHJvcGVydHkpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYmluZEZ1bmN0aW9uUHJvcGVydHlNYXAgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZEZ1bmN0aW9uUHJvcGVydHlNYXAgPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGJpbmRJbmZvID0gdGhpcy5fYmluZEZ1bmN0aW9uUHJvcGVydHlNYXAuZ2V0KHByb3BlcnR5KSB8fCB7fTtcclxuICAgICAgICAgICAgbGV0IHsgYm91bmRGdW5jLCBzY29wZSB9ID0gYmluZEluZm87XHJcbiAgICAgICAgICAgIGlmIChib3VuZEZ1bmMgPT09IHVuZGVmaW5lZCB8fCBzY29wZSAhPT0gYmluZCkge1xyXG4gICAgICAgICAgICAgICAgYm91bmRGdW5jID0gcHJvcGVydHkuYmluZChiaW5kKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwLnNldChwcm9wZXJ0eSwgeyBib3VuZEZ1bmMsIHNjb3BlOiBiaW5kIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBib3VuZEZ1bmM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwcm9wZXJ0eTtcclxuICAgIH1cclxuICAgIGdldCByZWdpc3RyeSgpIHtcclxuICAgICAgICBpZiAodGhpcy5fcmVnaXN0cnkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RyeSA9IG5ldyBSZWdpc3RyeUhhbmRsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5vd24odGhpcy5fcmVnaXN0cnkpO1xyXG4gICAgICAgICAgICB0aGlzLm93bih0aGlzLl9yZWdpc3RyeS5vbignaW52YWxpZGF0ZScsIHRoaXMuX2JvdW5kSW52YWxpZGF0ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVnaXN0cnk7XHJcbiAgICB9XHJcbiAgICBfcnVuQmVmb3JlUHJvcGVydGllcyhwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgY29uc3QgYmVmb3JlUHJvcGVydGllcyA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdiZWZvcmVQcm9wZXJ0aWVzJyk7XHJcbiAgICAgICAgaWYgKGJlZm9yZVByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmVmb3JlUHJvcGVydGllcy5yZWR1Y2UoKHByb3BlcnRpZXMsIGJlZm9yZVByb3BlcnRpZXNGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMsIGJlZm9yZVByb3BlcnRpZXNGdW5jdGlvbi5jYWxsKHRoaXMsIHByb3BlcnRpZXMpKTtcclxuICAgICAgICAgICAgfSwgT2JqZWN0LmFzc2lnbih7fSwgcHJvcGVydGllcykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJvcGVydGllcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUnVuIGFsbCByZWdpc3RlcmVkIGJlZm9yZSByZW5kZXJzIGFuZCByZXR1cm4gdGhlIHVwZGF0ZWQgcmVuZGVyIG1ldGhvZFxyXG4gICAgICovXHJcbiAgICBfcnVuQmVmb3JlUmVuZGVycygpIHtcclxuICAgICAgICBjb25zdCBiZWZvcmVSZW5kZXJzID0gdGhpcy5nZXREZWNvcmF0b3IoJ2JlZm9yZVJlbmRlcicpO1xyXG4gICAgICAgIGlmIChiZWZvcmVSZW5kZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJlZm9yZVJlbmRlcnMucmVkdWNlKChyZW5kZXIsIGJlZm9yZVJlbmRlckZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkUmVuZGVyID0gYmVmb3JlUmVuZGVyRnVuY3Rpb24uY2FsbCh0aGlzLCByZW5kZXIsIHRoaXMuX3Byb3BlcnRpZXMsIHRoaXMuX2NoaWxkcmVuKTtcclxuICAgICAgICAgICAgICAgIGlmICghdXBkYXRlZFJlbmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUmVuZGVyIGZ1bmN0aW9uIG5vdCByZXR1cm5lZCBmcm9tIGJlZm9yZVJlbmRlciwgdXNpbmcgcHJldmlvdXMgcmVuZGVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbmRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVkUmVuZGVyO1xyXG4gICAgICAgICAgICB9LCB0aGlzLl9ib3VuZFJlbmRlckZ1bmMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fYm91bmRSZW5kZXJGdW5jO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSdW4gYWxsIHJlZ2lzdGVyZWQgYWZ0ZXIgcmVuZGVycyBhbmQgcmV0dXJuIHRoZSBkZWNvcmF0ZWQgRE5vZGVzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGROb2RlIFRoZSBETm9kZXMgdG8gcnVuIHRocm91Z2ggdGhlIGFmdGVyIHJlbmRlcnNcclxuICAgICAqL1xyXG4gICAgX3J1bkFmdGVyUmVuZGVycyhkTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IGFmdGVyUmVuZGVycyA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdhZnRlclJlbmRlcicpO1xyXG4gICAgICAgIGlmIChhZnRlclJlbmRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBkTm9kZSA9IGFmdGVyUmVuZGVycy5yZWR1Y2UoKGROb2RlLCBhZnRlclJlbmRlckZ1bmN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWZ0ZXJSZW5kZXJGdW5jdGlvbi5jYWxsKHRoaXMsIGROb2RlKTtcclxuICAgICAgICAgICAgfSwgZE5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fbWV0YU1hcCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21ldGFNYXAuZm9yRWFjaCgobWV0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbWV0YS5hZnRlclJlbmRlcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGROb2RlO1xyXG4gICAgfVxyXG4gICAgX3J1bkFmdGVyQ29uc3RydWN0b3JzKCkge1xyXG4gICAgICAgIGNvbnN0IGFmdGVyQ29uc3RydWN0b3JzID0gdGhpcy5nZXREZWNvcmF0b3IoJ2FmdGVyQ29uc3RydWN0b3InKTtcclxuICAgICAgICBpZiAoYWZ0ZXJDb25zdHJ1Y3RvcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBhZnRlckNvbnN0cnVjdG9ycy5mb3JFYWNoKChhZnRlckNvbnN0cnVjdG9yKSA9PiBhZnRlckNvbnN0cnVjdG9yLmNhbGwodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG93bihoYW5kbGUpIHtcclxuICAgICAgICB0aGlzLl9oYW5kbGVzLnB1c2goaGFuZGxlKTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMuX2hhbmRsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSB0aGlzLl9oYW5kbGVzLnBvcCgpO1xyXG4gICAgICAgICAgICBpZiAoaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBzdGF0aWMgaWRlbnRpZmllclxyXG4gKi9cclxuV2lkZ2V0QmFzZS5fdHlwZSA9IFdJREdFVF9CQVNFX1RZUEU7XHJcbmV4cG9ydCBkZWZhdWx0IFdpZGdldEJhc2U7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdpZGdldEJhc2UubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImxldCBicm93c2VyU3BlY2lmaWNUcmFuc2l0aW9uRW5kRXZlbnROYW1lID0gJyc7XG5sZXQgYnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lID0gJyc7XG5mdW5jdGlvbiBkZXRlcm1pbmVCcm93c2VyU3R5bGVOYW1lcyhlbGVtZW50KSB7XG4gICAgaWYgKCdXZWJraXRUcmFuc2l0aW9uJyBpbiBlbGVtZW50LnN0eWxlKSB7XG4gICAgICAgIGJyb3dzZXJTcGVjaWZpY1RyYW5zaXRpb25FbmRFdmVudE5hbWUgPSAnd2Via2l0VHJhbnNpdGlvbkVuZCc7XG4gICAgICAgIGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSA9ICd3ZWJraXRBbmltYXRpb25FbmQnO1xuICAgIH1cbiAgICBlbHNlIGlmICgndHJhbnNpdGlvbicgaW4gZWxlbWVudC5zdHlsZSB8fCAnTW96VHJhbnNpdGlvbicgaW4gZWxlbWVudC5zdHlsZSkge1xuICAgICAgICBicm93c2VyU3BlY2lmaWNUcmFuc2l0aW9uRW5kRXZlbnROYW1lID0gJ3RyYW5zaXRpb25lbmQnO1xuICAgICAgICBicm93c2VyU3BlY2lmaWNBbmltYXRpb25FbmRFdmVudE5hbWUgPSAnYW5pbWF0aW9uZW5kJztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBicm93c2VyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpbml0aWFsaXplKGVsZW1lbnQpIHtcbiAgICBpZiAoYnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lID09PSAnJykge1xuICAgICAgICBkZXRlcm1pbmVCcm93c2VyU3R5bGVOYW1lcyhlbGVtZW50KTtcbiAgICB9XG59XG5mdW5jdGlvbiBydW5BbmRDbGVhblVwKGVsZW1lbnQsIHN0YXJ0QW5pbWF0aW9uLCBmaW5pc2hBbmltYXRpb24pIHtcbiAgICBpbml0aWFsaXplKGVsZW1lbnQpO1xuICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICAgIGxldCB0cmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWZpbmlzaGVkKSB7XG4gICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoYnJvd3NlclNwZWNpZmljVHJhbnNpdGlvbkVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZCk7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoYnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lLCB0cmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICAgIGZpbmlzaEFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzdGFydEFuaW1hdGlvbigpO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyU3BlY2lmaWNBbmltYXRpb25FbmRFdmVudE5hbWUsIHRyYW5zaXRpb25FbmQpO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihicm93c2VyU3BlY2lmaWNUcmFuc2l0aW9uRW5kRXZlbnROYW1lLCB0cmFuc2l0aW9uRW5kKTtcbn1cbmZ1bmN0aW9uIGV4aXQobm9kZSwgcHJvcGVydGllcywgZXhpdEFuaW1hdGlvbiwgcmVtb3ZlTm9kZSkge1xuICAgIGNvbnN0IGFjdGl2ZUNsYXNzID0gcHJvcGVydGllcy5leGl0QW5pbWF0aW9uQWN0aXZlIHx8IGAke2V4aXRBbmltYXRpb259LWFjdGl2ZWA7XG4gICAgcnVuQW5kQ2xlYW5VcChub2RlLCAoKSA9PiB7XG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChleGl0QW5pbWF0aW9uKTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChhY3RpdmVDbGFzcyk7XG4gICAgICAgIH0pO1xuICAgIH0sICgpID0+IHtcbiAgICAgICAgcmVtb3ZlTm9kZSgpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZW50ZXIobm9kZSwgcHJvcGVydGllcywgZW50ZXJBbmltYXRpb24pIHtcbiAgICBjb25zdCBhY3RpdmVDbGFzcyA9IHByb3BlcnRpZXMuZW50ZXJBbmltYXRpb25BY3RpdmUgfHwgYCR7ZW50ZXJBbmltYXRpb259LWFjdGl2ZWA7XG4gICAgcnVuQW5kQ2xlYW5VcChub2RlLCAoKSA9PiB7XG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChlbnRlckFuaW1hdGlvbik7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoYWN0aXZlQ2xhc3MpO1xuICAgICAgICB9KTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LnJlbW92ZShlbnRlckFuaW1hdGlvbik7XG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LnJlbW92ZShhY3RpdmVDbGFzcyk7XG4gICAgfSk7XG59XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgZW50ZXIsXG4gICAgZXhpdFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNzc1RyYW5zaXRpb25zLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvYW5pbWF0aW9ucy9jc3NUcmFuc2l0aW9ucy5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9hbmltYXRpb25zL2Nzc1RyYW5zaXRpb25zLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgKiBhcyB0c2xpYl8xIGZyb20gXCJ0c2xpYlwiO1xuLyoqXG4gKiBUaGUgaWRlbnRpZmllciBmb3IgYSBXTm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCBXTk9ERSA9ICdfX1dOT0RFX1RZUEUnO1xuLyoqXG4gKiBUaGUgaWRlbnRpZmllciBmb3IgYSBWTm9kZSB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCBWTk9ERSA9ICdfX1ZOT0RFX1RZUEUnO1xuLyoqXG4gKiBUaGUgaWRlbnRpZmllciBmb3IgYSBWTm9kZSB0eXBlIGNyZWF0ZWQgdXNpbmcgZG9tKClcbiAqL1xuZXhwb3J0IGNvbnN0IERPTVZOT0RFID0gJ19fRE9NVk5PREVfVFlQRSc7XG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZSBpZiB0aGUgYEROb2RlYCBpcyBhIGBXTm9kZWAgdXNpbmcgdGhlIGB0eXBlYCBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNXTm9kZShjaGlsZCkge1xuICAgIHJldHVybiBCb29sZWFuKGNoaWxkICYmIHR5cGVvZiBjaGlsZCAhPT0gJ3N0cmluZycgJiYgY2hpbGQudHlwZSA9PT0gV05PREUpO1xufVxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgdGhlIGBETm9kZWAgaXMgYSBgVk5vZGVgIHVzaW5nIHRoZSBgdHlwZWAgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVk5vZGUoY2hpbGQpIHtcbiAgICByZXR1cm4gQm9vbGVhbihjaGlsZCAmJiB0eXBlb2YgY2hpbGQgIT09ICdzdHJpbmcnICYmIChjaGlsZC50eXBlID09PSBWTk9ERSB8fCBjaGlsZC50eXBlID09PSBET01WTk9ERSkpO1xufVxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgdGhlIGBETm9kZWAgaXMgYSBgVk5vZGVgIGNyZWF0ZWQgd2l0aCBgZG9tKClgIHVzaW5nIHRoZSBgdHlwZWAgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tVk5vZGUoY2hpbGQpIHtcbiAgICByZXR1cm4gQm9vbGVhbihjaGlsZCAmJiB0eXBlb2YgY2hpbGQgIT09ICdzdHJpbmcnICYmIGNoaWxkLnR5cGUgPT09IERPTVZOT0RFKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnROb2RlKHZhbHVlKSB7XG4gICAgcmV0dXJuICEhdmFsdWUudGFnTmFtZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZShkTm9kZXMsIG9wdGlvbnNPck1vZGlmaWVyLCBwcmVkaWNhdGUpIHtcbiAgICBsZXQgc2hhbGxvdyA9IGZhbHNlO1xuICAgIGxldCBtb2RpZmllcjtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnNPck1vZGlmaWVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG1vZGlmaWVyID0gb3B0aW9uc09yTW9kaWZpZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBtb2RpZmllciA9IG9wdGlvbnNPck1vZGlmaWVyLm1vZGlmaWVyO1xuICAgICAgICBwcmVkaWNhdGUgPSBvcHRpb25zT3JNb2RpZmllci5wcmVkaWNhdGU7XG4gICAgICAgIHNoYWxsb3cgPSBvcHRpb25zT3JNb2RpZmllci5zaGFsbG93IHx8IGZhbHNlO1xuICAgIH1cbiAgICBsZXQgbm9kZXMgPSBBcnJheS5pc0FycmF5KGROb2RlcykgPyBbLi4uZE5vZGVzXSA6IFtkTm9kZXNdO1xuICAgIGZ1bmN0aW9uIGJyZWFrZXIoKSB7XG4gICAgICAgIG5vZGVzID0gW107XG4gICAgfVxuICAgIHdoaWxlIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzLnNoaWZ0KCk7XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBpZiAoIXNoYWxsb3cgJiYgKGlzV05vZGUobm9kZSkgfHwgaXNWTm9kZShub2RlKSkgJiYgbm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIG5vZGVzID0gWy4uLm5vZGVzLCAuLi5ub2RlLmNoaWxkcmVuXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcHJlZGljYXRlIHx8IHByZWRpY2F0ZShub2RlKSkge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVyKG5vZGUsIGJyZWFrZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkTm9kZXM7XG59XG5leHBvcnQgZnVuY3Rpb24gdyh3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZSwgcHJvcGVydGllcywgY2hpbGRyZW4pIHtcbiAgICBpZiAoaXNXTm9kZSh3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZSkpIHtcbiAgICAgICAgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIHdpZGdldENvbnN0cnVjdG9yT3JOb2RlLnByb3BlcnRpZXMsIHByb3BlcnRpZXMpO1xuICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuID8gY2hpbGRyZW4gOiB3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZS5jaGlsZHJlbjtcbiAgICAgICAgd2lkZ2V0Q29uc3RydWN0b3JPck5vZGUgPSB3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZS53aWRnZXRDb25zdHJ1Y3RvcjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuIHx8IFtdLFxuICAgICAgICB3aWRnZXRDb25zdHJ1Y3Rvcjogd2lkZ2V0Q29uc3RydWN0b3JPck5vZGUsXG4gICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgIHR5cGU6IFdOT0RFXG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB2KHRhZywgcHJvcGVydGllc09yQ2hpbGRyZW4gPSB7fSwgY2hpbGRyZW4gPSB1bmRlZmluZWQpIHtcbiAgICBsZXQgcHJvcGVydGllcyA9IHByb3BlcnRpZXNPckNoaWxkcmVuO1xuICAgIGxldCBkZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjaztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzT3JDaGlsZHJlbikpIHtcbiAgICAgICAgY2hpbGRyZW4gPSBwcm9wZXJ0aWVzT3JDaGlsZHJlbjtcbiAgICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2sgPSBwcm9wZXJ0aWVzO1xuICAgICAgICBwcm9wZXJ0aWVzID0ge307XG4gICAgfVxuICAgIGlmIChpc1ZOb2RlKHRhZykpIHtcbiAgICAgICAgbGV0IHsgY2xhc3NlcyA9IFtdLCBzdHlsZXMgPSB7fSB9ID0gcHJvcGVydGllcywgbmV3UHJvcGVydGllcyA9IHRzbGliXzEuX19yZXN0KHByb3BlcnRpZXMsIFtcImNsYXNzZXNcIiwgXCJzdHlsZXNcIl0pO1xuICAgICAgICBsZXQgX2EgPSB0YWcucHJvcGVydGllcywgeyBjbGFzc2VzOiBub2RlQ2xhc3NlcyA9IFtdLCBzdHlsZXM6IG5vZGVTdHlsZXMgPSB7fSB9ID0gX2EsIG5vZGVQcm9wZXJ0aWVzID0gdHNsaWJfMS5fX3Jlc3QoX2EsIFtcImNsYXNzZXNcIiwgXCJzdHlsZXNcIl0pO1xuICAgICAgICBub2RlQ2xhc3NlcyA9IEFycmF5LmlzQXJyYXkobm9kZUNsYXNzZXMpID8gbm9kZUNsYXNzZXMgOiBbbm9kZUNsYXNzZXNdO1xuICAgICAgICBjbGFzc2VzID0gQXJyYXkuaXNBcnJheShjbGFzc2VzKSA/IGNsYXNzZXMgOiBbY2xhc3Nlc107XG4gICAgICAgIHN0eWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIG5vZGVTdHlsZXMsIHN0eWxlcyk7XG4gICAgICAgIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBub2RlUHJvcGVydGllcywgbmV3UHJvcGVydGllcywgeyBjbGFzc2VzOiBbLi4ubm9kZUNsYXNzZXMsIC4uLmNsYXNzZXNdLCBzdHlsZXMgfSk7XG4gICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbiA6IHRhZy5jaGlsZHJlbjtcbiAgICAgICAgdGFnID0gdGFnLnRhZztcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFnLFxuICAgICAgICBkZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjayxcbiAgICAgICAgb3JpZ2luYWxQcm9wZXJ0aWVzOiB7fSxcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgIHByb3BlcnRpZXMsXG4gICAgICAgIHR5cGU6IFZOT0RFXG4gICAgfTtcbn1cbi8qKlxuICogQ3JlYXRlIGEgVk5vZGUgZm9yIGFuIGV4aXN0aW5nIERPTSBOb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG9tKHsgbm9kZSwgYXR0cnMgPSB7fSwgcHJvcHMgPSB7fSwgb24gPSB7fSwgZGlmZlR5cGUgPSAnbm9uZScsIG9uQXR0YWNoIH0sIGNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGFnOiBpc0VsZW1lbnROb2RlKG5vZGUpID8gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgOiAnJyxcbiAgICAgICAgcHJvcGVydGllczogcHJvcHMsXG4gICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJzLFxuICAgICAgICBldmVudHM6IG9uLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgdHlwZTogRE9NVk5PREUsXG4gICAgICAgIGRvbU5vZGU6IG5vZGUsXG4gICAgICAgIHRleHQ6IGlzRWxlbWVudE5vZGUobm9kZSkgPyB1bmRlZmluZWQgOiBub2RlLmRhdGEsXG4gICAgICAgIGRpZmZUeXBlLFxuICAgICAgICBvbkF0dGFjaFxuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBiZWZvcmVQcm9wZXJ0aWVzIH0gZnJvbSAnLi9iZWZvcmVQcm9wZXJ0aWVzJztcbmV4cG9ydCBmdW5jdGlvbiBhbHdheXNSZW5kZXIoKSB7XG4gICAgcmV0dXJuIGhhbmRsZURlY29yYXRvcigodGFyZ2V0LCBwcm9wZXJ0eUtleSkgPT4ge1xuICAgICAgICBiZWZvcmVQcm9wZXJ0aWVzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICB9KSh0YXJnZXQpO1xuICAgIH0pO1xufVxuZXhwb3J0IGRlZmF1bHQgYWx3YXlzUmVuZGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YWx3YXlzUmVuZGVyLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9hbHdheXNSZW5kZXIubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9hbHdheXNSZW5kZXIubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IGhhbmRsZURlY29yYXRvciB9IGZyb20gJy4vaGFuZGxlRGVjb3JhdG9yJztcbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVQcm9wZXJ0aWVzKG1ldGhvZCkge1xuICAgIHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcbiAgICAgICAgdGFyZ2V0LmFkZERlY29yYXRvcignYmVmb3JlUHJvcGVydGllcycsIHByb3BlcnR5S2V5ID8gdGFyZ2V0W3Byb3BlcnR5S2V5XSA6IG1ldGhvZCk7XG4gICAgfSk7XG59XG5leHBvcnQgZGVmYXVsdCBiZWZvcmVQcm9wZXJ0aWVzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmVmb3JlUHJvcGVydGllcy5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYmVmb3JlUHJvcGVydGllcy5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2JlZm9yZVByb3BlcnRpZXMubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IGhhbmRsZURlY29yYXRvciB9IGZyb20gJy4vaGFuZGxlRGVjb3JhdG9yJztcbmltcG9ydCB7IGF1dG8gfSBmcm9tICcuLy4uL2RpZmYnO1xuLyoqXG4gKiBEZWNvcmF0b3IgdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciBhIGZ1bmN0aW9uIGFzIGEgc3BlY2lmaWMgcHJvcGVydHkgZGlmZlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSBvZiB3aGljaCB0aGUgZGlmZiBmdW5jdGlvbiBpcyBhcHBsaWVkXG4gKiBAcGFyYW0gZGlmZlR5cGUgICAgICBUaGUgZGlmZiB0eXBlLCBkZWZhdWx0IGlzIERpZmZUeXBlLkFVVE8uXG4gKiBAcGFyYW0gZGlmZkZ1bmN0aW9uICBBIGRpZmYgZnVuY3Rpb24gdG8gcnVuIGlmIGRpZmZUeXBlIGlmIERpZmZUeXBlLkNVU1RPTVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZlByb3BlcnR5KHByb3BlcnR5TmFtZSwgZGlmZkZ1bmN0aW9uID0gYXV0bywgcmVhY3Rpb25GdW5jdGlvbikge1xuICAgIHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcbiAgICAgICAgdGFyZ2V0LmFkZERlY29yYXRvcihgZGlmZlByb3BlcnR5OiR7cHJvcGVydHlOYW1lfWAsIGRpZmZGdW5jdGlvbi5iaW5kKG51bGwpKTtcbiAgICAgICAgdGFyZ2V0LmFkZERlY29yYXRvcigncmVnaXN0ZXJlZERpZmZQcm9wZXJ0eScsIHByb3BlcnR5TmFtZSk7XG4gICAgICAgIGlmIChyZWFjdGlvbkZ1bmN0aW9uIHx8IHByb3BlcnR5S2V5KSB7XG4gICAgICAgICAgICB0YXJnZXQuYWRkRGVjb3JhdG9yKCdkaWZmUmVhY3Rpb24nLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgIHJlYWN0aW9uOiBwcm9wZXJ0eUtleSA/IHRhcmdldFtwcm9wZXJ0eUtleV0gOiByZWFjdGlvbkZ1bmN0aW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZXhwb3J0IGRlZmF1bHQgZGlmZlByb3BlcnR5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlmZlByb3BlcnR5Lm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9kaWZmUHJvcGVydHkubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9kaWZmUHJvcGVydHkubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8qKlxuICogR2VuZXJpYyBkZWNvcmF0b3IgaGFuZGxlciB0byB0YWtlIGNhcmUgb2Ygd2hldGhlciBvciBub3QgdGhlIGRlY29yYXRvciB3YXMgY2FsbGVkIGF0IHRoZSBjbGFzcyBsZXZlbFxuICogb3IgdGhlIG1ldGhvZCBsZXZlbC5cbiAqXG4gKiBAcGFyYW0gaGFuZGxlclxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGVjb3JhdG9yKGhhbmRsZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwgcHJvcGVydHlLZXksIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGhhbmRsZXIodGFyZ2V0LnByb3RvdHlwZSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhhbmRsZXIodGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0IGRlZmF1bHQgaGFuZGxlRGVjb3JhdG9yO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGFuZGxlRGVjb3JhdG9yLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9oYW5kbGVEZWNvcmF0b3IubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9oYW5kbGVEZWNvcmF0b3IubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBXZWFrTWFwIGZyb20gJy4uLy4uL3NoaW0vV2Vha01hcCc7XG5pbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBiZWZvcmVQcm9wZXJ0aWVzIH0gZnJvbSAnLi9iZWZvcmVQcm9wZXJ0aWVzJztcbi8qKlxuICogTWFwIG9mIGluc3RhbmNlcyBhZ2FpbnN0IHJlZ2lzdGVyZWQgaW5qZWN0b3JzLlxuICovXG5jb25zdCByZWdpc3RlcmVkSW5qZWN0b3JzTWFwID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuICogRGVjb3JhdG9yIHJldHJpZXZlcyBhbiBpbmplY3RvciBmcm9tIGFuIGF2YWlsYWJsZSByZWdpc3RyeSB1c2luZyB0aGUgbmFtZSBhbmRcbiAqIGNhbGxzIHRoZSBgZ2V0UHJvcGVydGllc2AgZnVuY3Rpb24gd2l0aCB0aGUgcGF5bG9hZCBmcm9tIHRoZSBpbmplY3RvclxuICogYW5kIGN1cnJlbnQgcHJvcGVydGllcyB3aXRoIHRoZSB0aGUgaW5qZWN0ZWQgcHJvcGVydGllcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0gSW5qZWN0Q29uZmlnIHRoZSBpbmplY3QgY29uZmlndXJhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0KHsgbmFtZSwgZ2V0UHJvcGVydGllcyB9KSB7XG4gICAgcmV0dXJuIGhhbmRsZURlY29yYXRvcigodGFyZ2V0LCBwcm9wZXJ0eUtleSkgPT4ge1xuICAgICAgICBiZWZvcmVQcm9wZXJ0aWVzKGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmplY3Rvckl0ZW0gPSB0aGlzLnJlZ2lzdHJ5LmdldEluamVjdG9yKG5hbWUpO1xuICAgICAgICAgICAgaWYgKGluamVjdG9ySXRlbSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgaW5qZWN0b3IsIGludmFsaWRhdG9yIH0gPSBpbmplY3Rvckl0ZW07XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnaXN0ZXJlZEluamVjdG9ycyA9IHJlZ2lzdGVyZWRJbmplY3RvcnNNYXAuZ2V0KHRoaXMpIHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmIChyZWdpc3RlcmVkSW5qZWN0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZWdpc3RlcmVkSW5qZWN0b3JzTWFwLnNldCh0aGlzLCByZWdpc3RlcmVkSW5qZWN0b3JzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lzdGVyZWRJbmplY3RvcnMuaW5kZXhPZihpbmplY3Rvckl0ZW0pID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm93bihpbnZhbGlkYXRvci5vbignaW52YWxpZGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdGVyZWRJbmplY3RvcnMucHVzaChpbmplY3Rvckl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UHJvcGVydGllcyhpbmplY3RvcigpLCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkodGFyZ2V0KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IGluamVjdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluamVjdC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvaW5qZWN0Lm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvaW5qZWN0Lm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBXSURHRVRfQkFTRV9UWVBFIH0gZnJvbSAnLi9SZWdpc3RyeSc7XG5mdW5jdGlvbiBpc09iamVjdE9yQXJyYXkodmFsdWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gYWx3YXlzKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2hhbmdlZDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IG5ld1Byb3BlcnR5XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpZ25vcmUocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjaGFuZ2VkOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IG5ld1Byb3BlcnR5XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZWZlcmVuY2UocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjaGFuZ2VkOiBwcmV2aW91c1Byb3BlcnR5ICE9PSBuZXdQcm9wZXJ0eSxcbiAgICAgICAgdmFsdWU6IG5ld1Byb3BlcnR5XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93KHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KSB7XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICBjb25zdCB2YWxpZE9sZFByb3BlcnR5ID0gcHJldmlvdXNQcm9wZXJ0eSAmJiBpc09iamVjdE9yQXJyYXkocHJldmlvdXNQcm9wZXJ0eSk7XG4gICAgY29uc3QgdmFsaWROZXdQcm9wZXJ0eSA9IG5ld1Byb3BlcnR5ICYmIGlzT2JqZWN0T3JBcnJheShuZXdQcm9wZXJ0eSk7XG4gICAgaWYgKCF2YWxpZE9sZFByb3BlcnR5IHx8ICF2YWxpZE5ld1Byb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGFuZ2VkOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ld1Byb3BlcnR5XG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHByZXZpb3VzS2V5cyA9IE9iamVjdC5rZXlzKHByZXZpb3VzUHJvcGVydHkpO1xuICAgIGNvbnN0IG5ld0tleXMgPSBPYmplY3Qua2V5cyhuZXdQcm9wZXJ0eSk7XG4gICAgaWYgKHByZXZpb3VzS2V5cy5sZW5ndGggIT09IG5ld0tleXMubGVuZ3RoKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY2hhbmdlZCA9IG5ld0tleXMuc29tZSgoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3UHJvcGVydHlba2V5XSAhPT0gcHJldmlvdXNQcm9wZXJ0eVtrZXldO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2hhbmdlZCxcbiAgICAgICAgdmFsdWU6IG5ld1Byb3BlcnR5XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhdXRvKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAodHlwZW9mIG5ld1Byb3BlcnR5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChuZXdQcm9wZXJ0eS5fdHlwZSA9PT0gV0lER0VUX0JBU0VfVFlQRSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVmZXJlbmNlKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGlnbm9yZShwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNPYmplY3RPckFycmF5KG5ld1Byb3BlcnR5KSkge1xuICAgICAgICByZXN1bHQgPSBzaGFsbG93KHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHJlZmVyZW5jZShwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaWZmLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGlmZi5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kaWZmLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBEZXN0cm95YWJsZSB9IGZyb20gJy4uLy4uL2NvcmUvRGVzdHJveWFibGUnO1xyXG5pbXBvcnQgU2V0IGZyb20gJy4uLy4uL3NoaW0vU2V0JztcclxuZXhwb3J0IGNsYXNzIEJhc2UgZXh0ZW5kcyBEZXN0cm95YWJsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLl9yZXF1ZXN0ZWROb2RlS2V5cyA9IG5ldyBTZXQoKTtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlID0gcHJvcGVydGllcy5pbnZhbGlkYXRlO1xyXG4gICAgICAgIHRoaXMubm9kZUhhbmRsZXIgPSBwcm9wZXJ0aWVzLm5vZGVIYW5kbGVyO1xyXG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmJpbmQpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmluZCA9IHByb3BlcnRpZXMuYmluZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBoYXMoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZUhhbmRsZXIuaGFzKGtleSk7XHJcbiAgICB9XHJcbiAgICBnZXROb2RlKGtleSkge1xyXG4gICAgICAgIGNvbnN0IHN0cmluZ0tleSA9IGAke2tleX1gO1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGVIYW5kbGVyLmdldChzdHJpbmdLZXkpO1xyXG4gICAgICAgIGlmICghbm9kZSAmJiAhdGhpcy5fcmVxdWVzdGVkTm9kZUtleXMuaGFzKHN0cmluZ0tleSkpIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gdGhpcy5ub2RlSGFuZGxlci5vbihzdHJpbmdLZXksICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXF1ZXN0ZWROb2RlS2V5cy5kZWxldGUoc3RyaW5nS2V5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5vd24oaGFuZGxlKTtcclxuICAgICAgICAgICAgdGhpcy5fcmVxdWVzdGVkTm9kZUtleXMuYWRkKHN0cmluZ0tleSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG4gICAgaW52YWxpZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBhZnRlclJlbmRlcigpIHtcclxuICAgICAgICAvLyBEbyBub3RoaW5nIGJ5IGRlZmF1bHQuXHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgQmFzZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QmFzZS5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvQmFzZS5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL0Jhc2UubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IEJhc2UgfSBmcm9tICcuL0Jhc2UnO1xyXG5pbXBvcnQgTWFwIGZyb20gJy4uLy4uL3NoaW0vTWFwJztcclxuaW1wb3J0IGdsb2JhbCBmcm9tICcuLi8uLi9zaGltL2dsb2JhbCc7XHJcbmV4cG9ydCBjbGFzcyBXZWJBbmltYXRpb25zIGV4dGVuZHMgQmFzZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbk1hcCA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIF9jcmVhdGVQbGF5ZXIobm9kZSwgcHJvcGVydGllcykge1xyXG4gICAgICAgIGNvbnN0IHsgZWZmZWN0cywgdGltaW5nID0ge30gfSA9IHByb3BlcnRpZXM7XHJcbiAgICAgICAgY29uc3QgZnggPSB0eXBlb2YgZWZmZWN0cyA9PT0gJ2Z1bmN0aW9uJyA/IGVmZmVjdHMoKSA6IGVmZmVjdHM7XHJcbiAgICAgICAgY29uc3Qga2V5ZnJhbWVFZmZlY3QgPSBuZXcgZ2xvYmFsLktleWZyYW1lRWZmZWN0KG5vZGUsIGZ4LCB0aW1pbmcpO1xyXG4gICAgICAgIHJldHVybiBuZXcgZ2xvYmFsLkFuaW1hdGlvbihrZXlmcmFtZUVmZmVjdCwgZ2xvYmFsLmRvY3VtZW50LnRpbWVsaW5lKTtcclxuICAgIH1cclxuICAgIF91cGRhdGVQbGF5ZXIocGxheWVyLCBjb250cm9scykge1xyXG4gICAgICAgIGNvbnN0IHsgcGxheSwgcmV2ZXJzZSwgY2FuY2VsLCBmaW5pc2gsIG9uRmluaXNoLCBvbkNhbmNlbCwgcGxheWJhY2tSYXRlLCBzdGFydFRpbWUsIGN1cnJlbnRUaW1lIH0gPSBjb250cm9scztcclxuICAgICAgICBpZiAocGxheWJhY2tSYXRlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcGxheWVyLnBsYXliYWNrUmF0ZSA9IHBsYXliYWNrUmF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJldmVyc2UpIHtcclxuICAgICAgICAgICAgcGxheWVyLnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNhbmNlbCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIuY2FuY2VsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmaW5pc2gpIHtcclxuICAgICAgICAgICAgcGxheWVyLmZpbmlzaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RhcnRUaW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcGxheWVyLnN0YXJ0VGltZSA9IHN0YXJ0VGltZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1cnJlbnRUaW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcGxheWVyLmN1cnJlbnRUaW1lID0gY3VycmVudFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwbGF5KSB7XHJcbiAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9uRmluaXNoKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5vbmZpbmlzaCA9IG9uRmluaXNoLmJpbmQodGhpcy5fYmluZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbkNhbmNlbCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIub25jYW5jZWwgPSBvbkNhbmNlbC5iaW5kKHRoaXMuX2JpbmQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFuaW1hdGUoa2V5LCBhbmltYXRlUHJvcGVydGllcykge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGUoa2V5KTtcclxuICAgICAgICBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYW5pbWF0ZVByb3BlcnRpZXMpKSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRlUHJvcGVydGllcyA9IFthbmltYXRlUHJvcGVydGllc107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYW5pbWF0ZVByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydGllcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcyA9IHR5cGVvZiBwcm9wZXJ0aWVzID09PSAnZnVuY3Rpb24nID8gcHJvcGVydGllcygpIDogcHJvcGVydGllcztcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcHJvcGVydGllcztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2FuaW1hdGlvbk1hcC5oYXMoaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbk1hcC5zZXQoaWQsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcjogdGhpcy5fY3JlYXRlUGxheWVyKG5vZGUsIHByb3BlcnRpZXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5pbWF0aW9uID0gdGhpcy5fYW5pbWF0aW9uTWFwLmdldChpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBjb250cm9scyA9IHt9IH0gPSBwcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlUGxheWVyKGFuaW1hdGlvbi5wbGF5ZXIsIGNvbnRyb2xzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uTWFwLnNldChpZCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyOiBhbmltYXRpb24ucGxheWVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldChpZCkge1xyXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbk1hcC5nZXQoaWQpO1xyXG4gICAgICAgIGlmIChhbmltYXRpb24pIHtcclxuICAgICAgICAgICAgY29uc3QgeyBjdXJyZW50VGltZSwgcGxheVN0YXRlLCBwbGF5YmFja1JhdGUsIHN0YXJ0VGltZSB9ID0gYW5pbWF0aW9uLnBsYXllcjtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lOiBjdXJyZW50VGltZSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgcGxheVN0YXRlLFxyXG4gICAgICAgICAgICAgICAgcGxheWJhY2tSYXRlLFxyXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUgfHwgMFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFmdGVyUmVuZGVyKCkge1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbk1hcC5mb3JFYWNoKChhbmltYXRpb24sIGtleSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIWFuaW1hdGlvbi51c2VkKSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb24ucGxheWVyLmNhbmNlbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uTWFwLmRlbGV0ZShrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbi51c2VkID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgV2ViQW5pbWF0aW9ucztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V2ViQW5pbWF0aW9uLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWV0YS9XZWJBbmltYXRpb24ubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWV0YS9XZWJBbmltYXRpb24ubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCAqIGFzIHRzbGliXzEgZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBJbmplY3RvciB9IGZyb20gJy4vLi4vSW5qZWN0b3InO1xuaW1wb3J0IHsgaW5qZWN0IH0gZnJvbSAnLi8uLi9kZWNvcmF0b3JzL2luamVjdCc7XG5pbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuLy4uL2RlY29yYXRvcnMvaGFuZGxlRGVjb3JhdG9yJztcbmltcG9ydCB7IGRpZmZQcm9wZXJ0eSB9IGZyb20gJy4vLi4vZGVjb3JhdG9ycy9kaWZmUHJvcGVydHknO1xuaW1wb3J0IHsgc2hhbGxvdyB9IGZyb20gJy4vLi4vZGlmZic7XG5jb25zdCBUSEVNRV9LRVkgPSAnIF9rZXknO1xuZXhwb3J0IGNvbnN0IElOSkVDVEVEX1RIRU1FX0tFWSA9ICdfX3RoZW1lX2luamVjdG9yJztcbi8qKlxuICogRGVjb3JhdG9yIGZvciBiYXNlIGNzcyBjbGFzc2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aGVtZSh0aGVtZSkge1xuICAgIHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCkgPT4ge1xuICAgICAgICB0YXJnZXQuYWRkRGVjb3JhdG9yKCdiYXNlVGhlbWVDbGFzc2VzJywgdGhlbWUpO1xuICAgIH0pO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgcmV2ZXJzZSBsb29rdXAgZm9yIHRoZSBjbGFzc2VzIHBhc3NlZCBpbiB2aWEgdGhlIGB0aGVtZWAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGNsYXNzZXMgVGhlIGJhc2VDbGFzc2VzIG9iamVjdFxuICogQHJlcXVpcmVzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRoZW1lQ2xhc3Nlc0xvb2t1cChjbGFzc2VzKSB7XG4gICAgcmV0dXJuIGNsYXNzZXMucmVkdWNlKChjdXJyZW50Q2xhc3NOYW1lcywgYmFzZUNsYXNzKSA9PiB7XG4gICAgICAgIE9iamVjdC5rZXlzKGJhc2VDbGFzcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBjdXJyZW50Q2xhc3NOYW1lc1tiYXNlQ2xhc3Nba2V5XV0gPSBrZXk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY3VycmVudENsYXNzTmFtZXM7XG4gICAgfSwge30pO1xufVxuLyoqXG4gKiBDb252ZW5pZW5jZSBmdW5jdGlvbiB0aGF0IGlzIGdpdmVuIGEgdGhlbWUgYW5kIGFuIG9wdGlvbmFsIHJlZ2lzdHJ5LCB0aGUgdGhlbWVcbiAqIGluamVjdG9yIGlzIGRlZmluZWQgYWdhaW5zdCB0aGUgcmVnaXN0cnksIHJldHVybmluZyB0aGUgdGhlbWUuXG4gKlxuICogQHBhcmFtIHRoZW1lIHRoZSB0aGVtZSB0byBzZXRcbiAqIEBwYXJhbSB0aGVtZVJlZ2lzdHJ5IHJlZ2lzdHJ5IHRvIGRlZmluZSB0aGUgdGhlbWUgaW5qZWN0b3IgYWdhaW5zdC4gRGVmYXVsdHNcbiAqIHRvIHRoZSBnbG9iYWwgcmVnaXN0cnlcbiAqXG4gKiBAcmV0dXJucyB0aGUgdGhlbWUgaW5qZWN0b3IgdXNlZCB0byBzZXQgdGhlIHRoZW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclRoZW1lSW5qZWN0b3IodGhlbWUsIHRoZW1lUmVnaXN0cnkpIHtcbiAgICBjb25zdCB0aGVtZUluamVjdG9yID0gbmV3IEluamVjdG9yKHRoZW1lKTtcbiAgICB0aGVtZVJlZ2lzdHJ5LmRlZmluZUluamVjdG9yKElOSkVDVEVEX1RIRU1FX0tFWSwgKGludmFsaWRhdG9yKSA9PiB7XG4gICAgICAgIHRoZW1lSW5qZWN0b3Iuc2V0SW52YWxpZGF0b3IoaW52YWxpZGF0b3IpO1xuICAgICAgICByZXR1cm4gKCkgPT4gdGhlbWVJbmplY3Rvci5nZXQoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhlbWVJbmplY3Rvcjtcbn1cbi8qKlxuICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgY2xhc3MgZGVjb3JhdGVkIHdpdGggd2l0aCBUaGVtZWQgZnVuY3Rpb25hbGl0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gVGhlbWVkTWl4aW4oQmFzZSkge1xuICAgIGxldCBUaGVtZWQgPSBjbGFzcyBUaGVtZWQgZXh0ZW5kcyBCYXNlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZWdpc3RlcmVkIGJhc2UgdGhlbWUga2V5c1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lS2V5cyA9IFtdO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgY2xhc3NlcyBtZXRhIGRhdGEgbmVlZCB0byBiZSBjYWxjdWxhdGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9yZWNhbGN1bGF0ZUNsYXNzZXMgPSB0cnVlO1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBMb2FkZWQgdGhlbWVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5fdGhlbWUgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0aGVtZShjbGFzc2VzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fcmVjYWxjdWxhdGVDbGFzc2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVjYWxjdWxhdGVUaGVtZUNsYXNzZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNsYXNzZXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzZXMubWFwKChjbGFzc05hbWUpID0+IHRoaXMuX2dldFRoZW1lQ2xhc3MoY2xhc3NOYW1lKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0VGhlbWVDbGFzcyhjbGFzc2VzKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogRnVuY3Rpb24gZmlyZWQgd2hlbiBgdGhlbWVgIG9yIGBleHRyYUNsYXNzZXNgIGFyZSBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICAgICAgb25Qcm9wZXJ0aWVzQ2hhbmdlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlY2FsY3VsYXRlQ2xhc3NlcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgX2dldFRoZW1lQ2xhc3MoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lID09PSB1bmRlZmluZWQgfHwgY2xhc3NOYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGV4dHJhQ2xhc3NlcyA9IHRoaXMucHJvcGVydGllcy5leHRyYUNsYXNzZXMgfHwge307XG4gICAgICAgICAgICBjb25zdCB0aGVtZUNsYXNzTmFtZSA9IHRoaXMuX2Jhc2VUaGVtZUNsYXNzZXNSZXZlcnNlTG9va3VwW2NsYXNzTmFtZV07XG4gICAgICAgICAgICBsZXQgcmVzdWx0Q2xhc3NOYW1lcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCF0aGVtZUNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ2xhc3MgbmFtZTogJyR7Y2xhc3NOYW1lfScgbm90IGZvdW5kIGluIHRoZW1lYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXh0cmFDbGFzc2VzW3RoZW1lQ2xhc3NOYW1lXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdENsYXNzTmFtZXMucHVzaChleHRyYUNsYXNzZXNbdGhlbWVDbGFzc05hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl90aGVtZVt0aGVtZUNsYXNzTmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRDbGFzc05hbWVzLnB1c2godGhpcy5fdGhlbWVbdGhlbWVDbGFzc05hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdENsYXNzTmFtZXMucHVzaCh0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lW3RoZW1lQ2xhc3NOYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0Q2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gICAgICAgIH1cbiAgICAgICAgX3JlY2FsY3VsYXRlVGhlbWVDbGFzc2VzKCkge1xuICAgICAgICAgICAgY29uc3QgeyB0aGVtZSA9IHt9IH0gPSB0aGlzLnByb3BlcnRpZXM7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3JlZ2lzdGVyZWRCYXNlVGhlbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlVGhlbWVzID0gdGhpcy5nZXREZWNvcmF0b3IoJ2Jhc2VUaGVtZUNsYXNzZXMnKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZVRoZW1lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdBIGJhc2UgdGhlbWUgaGFzIG5vdCBiZWVuIHByb3ZpZGVkIHRvIHRoaXMgd2lkZ2V0LiBQbGVhc2UgdXNlIHRoZSBAdGhlbWUgZGVjb3JhdG9yIHRvIGFkZCBhIHRoZW1lLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lID0gYmFzZVRoZW1lcy5yZWR1Y2UoKGZpbmFsQmFzZVRoZW1lLCBiYXNlVGhlbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgX2EgPSBUSEVNRV9LRVksIGtleSA9IGJhc2VUaGVtZVtfYV0sIGNsYXNzZXMgPSB0c2xpYl8xLl9fcmVzdChiYXNlVGhlbWUsIFt0eXBlb2YgX2EgPT09IFwic3ltYm9sXCIgPyBfYSA6IF9hICsgXCJcIl0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBmaW5hbEJhc2VUaGVtZSwgY2xhc3Nlcyk7XG4gICAgICAgICAgICAgICAgfSwge30pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Jhc2VUaGVtZUNsYXNzZXNSZXZlcnNlTG9va3VwID0gY3JlYXRlVGhlbWVDbGFzc2VzTG9va3VwKGJhc2VUaGVtZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdGhlbWUgPSB0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lS2V5cy5yZWR1Y2UoKGJhc2VUaGVtZSwgdGhlbWVLZXkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgYmFzZVRoZW1lLCB0aGVtZVt0aGVtZUtleV0pO1xuICAgICAgICAgICAgfSwge30pO1xuICAgICAgICAgICAgdGhpcy5fcmVjYWxjdWxhdGVDbGFzc2VzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRzbGliXzEuX19kZWNvcmF0ZShbXG4gICAgICAgIGRpZmZQcm9wZXJ0eSgndGhlbWUnLCBzaGFsbG93KSxcbiAgICAgICAgZGlmZlByb3BlcnR5KCdleHRyYUNsYXNzZXMnLCBzaGFsbG93KVxuICAgIF0sIFRoZW1lZC5wcm90b3R5cGUsIFwib25Qcm9wZXJ0aWVzQ2hhbmdlZFwiLCBudWxsKTtcbiAgICBUaGVtZWQgPSB0c2xpYl8xLl9fZGVjb3JhdGUoW1xuICAgICAgICBpbmplY3Qoe1xuICAgICAgICAgICAgbmFtZTogSU5KRUNURURfVEhFTUVfS0VZLFxuICAgICAgICAgICAgZ2V0UHJvcGVydGllczogKHRoZW1lLCBwcm9wZXJ0aWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcm9wZXJ0aWVzLnRoZW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHRoZW1lIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICBdLCBUaGVtZWQpO1xuICAgIHJldHVybiBUaGVtZWQ7XG59XG5leHBvcnQgZGVmYXVsdCBUaGVtZWRNaXhpbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVRoZW1lZC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWl4aW5zL1RoZW1lZC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuLi9zaGltL2dsb2JhbCc7XHJcbmltcG9ydCBoYXMgZnJvbSAnLi4vaGFzL2hhcyc7XHJcbmltcG9ydCB7IFdlYWtNYXAgfSBmcm9tICcuLi9zaGltL1dlYWtNYXAnO1xyXG5pbXBvcnQgdHJhbnNpdGlvblN0cmF0ZWd5IGZyb20gJy4vYW5pbWF0aW9ucy9jc3NUcmFuc2l0aW9ucyc7XHJcbmltcG9ydCB7IGlzVk5vZGUsIGlzV05vZGUsIFdOT0RFLCB2LCBpc0RvbVZOb2RlLCB3IH0gZnJvbSAnLi9kJztcclxuaW1wb3J0IHsgaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IgfSBmcm9tICcuL1JlZ2lzdHJ5JztcclxuaW1wb3J0IHsgV2lkZ2V0QmFzZSwgd2lkZ2V0SW5zdGFuY2VNYXAgfSBmcm9tICcuL1dpZGdldEJhc2UnO1xyXG5jb25zdCBFTVBUWV9BUlJBWSA9IFtdO1xyXG5jb25zdCBub2RlT3BlcmF0aW9ucyA9IFsnZm9jdXMnLCAnYmx1cicsICdzY3JvbGxJbnRvVmlldycsICdjbGljayddO1xyXG5jb25zdCBOQU1FU1BBQ0VfVzMgPSAnaHR0cDovL3d3dy53My5vcmcvJztcclxuY29uc3QgTkFNRVNQQUNFX1NWRyA9IE5BTUVTUEFDRV9XMyArICcyMDAwL3N2Zyc7XHJcbmNvbnN0IE5BTUVTUEFDRV9YTElOSyA9IE5BTUVTUEFDRV9XMyArICcxOTk5L3hsaW5rJztcclxuZnVuY3Rpb24gaXNXTm9kZVdyYXBwZXIoY2hpbGQpIHtcclxuICAgIHJldHVybiBjaGlsZCAmJiBpc1dOb2RlKGNoaWxkLm5vZGUpO1xyXG59XHJcbmZ1bmN0aW9uIGlzVk5vZGVXcmFwcGVyKGNoaWxkKSB7XHJcbiAgICByZXR1cm4gISFjaGlsZCAmJiBpc1ZOb2RlKGNoaWxkLm5vZGUpO1xyXG59XHJcbmZ1bmN0aW9uIGlzQXR0YWNoQXBwbGljYXRpb24odmFsdWUpIHtcclxuICAgIHJldHVybiAhIXZhbHVlLnR5cGU7XHJcbn1cclxuZnVuY3Rpb24gdXBkYXRlQXR0cmlidXRlcyhkb21Ob2RlLCBwcmV2aW91c0F0dHJpYnV0ZXMsIGF0dHJpYnV0ZXMsIG5hbWVzcGFjZSkge1xyXG4gICAgY29uc3QgYXR0ck5hbWVzID0gT2JqZWN0LmtleXMoYXR0cmlidXRlcyk7XHJcbiAgICBjb25zdCBhdHRyQ291bnQgPSBhdHRyTmFtZXMubGVuZ3RoO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyQ291bnQ7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGF0dHJOYW1lID0gYXR0ck5hbWVzW2ldO1xyXG4gICAgICAgIGNvbnN0IGF0dHJWYWx1ZSA9IGF0dHJpYnV0ZXNbYXR0ck5hbWVdO1xyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQXR0clZhbHVlID0gcHJldmlvdXNBdHRyaWJ1dGVzW2F0dHJOYW1lXTtcclxuICAgICAgICBpZiAoYXR0clZhbHVlICE9PSBwcmV2aW91c0F0dHJWYWx1ZSkge1xyXG4gICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGUoZG9tTm9kZSwgYXR0ck5hbWUsIGF0dHJWYWx1ZSwgbmFtZXNwYWNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gYnVpbGRQcmV2aW91c1Byb3BlcnRpZXMoZG9tTm9kZSwgY3VycmVudCwgbmV4dCkge1xyXG4gICAgY29uc3QgeyBub2RlOiB7IGRpZmZUeXBlLCBwcm9wZXJ0aWVzLCBhdHRyaWJ1dGVzIH0gfSA9IGN1cnJlbnQ7XHJcbiAgICBpZiAoIWRpZmZUeXBlIHx8IGRpZmZUeXBlID09PSAndmRvbScpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiBjdXJyZW50Lm5vZGUucHJvcGVydGllcyxcclxuICAgICAgICAgICAgYXR0cmlidXRlczogY3VycmVudC5ub2RlLmF0dHJpYnV0ZXMsXHJcbiAgICAgICAgICAgIGV2ZW50czogY3VycmVudC5ub2RlLmV2ZW50c1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChkaWZmVHlwZSA9PT0gJ25vbmUnKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgcHJvcGVydGllczoge30sIGF0dHJpYnV0ZXM6IGN1cnJlbnQubm9kZS5hdHRyaWJ1dGVzID8ge30gOiB1bmRlZmluZWQsIGV2ZW50czogY3VycmVudC5ub2RlLmV2ZW50cyB9O1xyXG4gICAgfVxyXG4gICAgbGV0IG5ld1Byb3BlcnRpZXMgPSB7XHJcbiAgICAgICAgcHJvcGVydGllczoge31cclxuICAgIH07XHJcbiAgICBpZiAoYXR0cmlidXRlcykge1xyXG4gICAgICAgIG5ld1Byb3BlcnRpZXMuYXR0cmlidXRlcyA9IHt9O1xyXG4gICAgICAgIG5ld1Byb3BlcnRpZXMuZXZlbnRzID0gY3VycmVudC5ub2RlLmV2ZW50cztcclxuICAgICAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBuZXdQcm9wZXJ0aWVzLnByb3BlcnRpZXNbcHJvcE5hbWVdID0gZG9tTm9kZVtwcm9wTmFtZV07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoYXR0ck5hbWUpID0+IHtcclxuICAgICAgICAgICAgbmV3UHJvcGVydGllcy5hdHRyaWJ1dGVzW2F0dHJOYW1lXSA9IGRvbU5vZGUuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbmV3UHJvcGVydGllcztcclxuICAgIH1cclxuICAgIG5ld1Byb3BlcnRpZXMucHJvcGVydGllcyA9IE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLnJlZHVjZSgocHJvcHMsIHByb3BlcnR5KSA9PiB7XHJcbiAgICAgICAgcHJvcHNbcHJvcGVydHldID0gZG9tTm9kZS5nZXRBdHRyaWJ1dGUocHJvcGVydHkpIHx8IGRvbU5vZGVbcHJvcGVydHldO1xyXG4gICAgICAgIHJldHVybiBwcm9wcztcclxuICAgIH0sIHt9KTtcclxuICAgIHJldHVybiBuZXdQcm9wZXJ0aWVzO1xyXG59XHJcbmZ1bmN0aW9uIGNoZWNrRGlzdGluZ3Vpc2hhYmxlKHdyYXBwZXJzLCBpbmRleCwgcGFyZW50V05vZGVXcmFwcGVyKSB7XHJcbiAgICBjb25zdCB3cmFwcGVyVG9DaGVjayA9IHdyYXBwZXJzW2luZGV4XTtcclxuICAgIGlmIChpc1ZOb2RlV3JhcHBlcih3cmFwcGVyVG9DaGVjaykgJiYgIXdyYXBwZXJUb0NoZWNrLm5vZGUudGFnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgeyBrZXkgfSA9IHdyYXBwZXJUb0NoZWNrLm5vZGUucHJvcGVydGllcztcclxuICAgIGxldCBwYXJlbnROYW1lID0gJ3Vua25vd24nO1xyXG4gICAgaWYgKHBhcmVudFdOb2RlV3JhcHBlcikge1xyXG4gICAgICAgIGNvbnN0IHsgbm9kZTogeyB3aWRnZXRDb25zdHJ1Y3RvciB9IH0gPSBwYXJlbnRXTm9kZVdyYXBwZXI7XHJcbiAgICAgICAgcGFyZW50TmFtZSA9IHdpZGdldENvbnN0cnVjdG9yLm5hbWUgfHwgJ3Vua25vd24nO1xyXG4gICAgfVxyXG4gICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkIHx8IGtleSA9PT0gbnVsbCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd3JhcHBlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGkgIT09IGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB3cmFwcGVyID0gd3JhcHBlcnNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoc2FtZSh3cmFwcGVyLCB3cmFwcGVyVG9DaGVjaykpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZUlkZW50aWZpZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzV05vZGVXcmFwcGVyKHdyYXBwZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVJZGVudGlmaWVyID0gd3JhcHBlci5ub2RlLndpZGdldENvbnN0cnVjdG9yLm5hbWUgfHwgJ3Vua25vd24nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUlkZW50aWZpZXIgPSB3cmFwcGVyLm5vZGUudGFnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEEgd2lkZ2V0ICgke3BhcmVudE5hbWV9KSBoYXMgaGFkIGEgY2hpbGQgYWRkZWQgb3IgcmVtb3ZlZCwgYnV0IHRoZXkgd2VyZSBub3QgYWJsZSB0byB1bmlxdWVseSBpZGVudGlmaWVkLiBJdCBpcyByZWNvbW1lbmRlZCB0byBwcm92aWRlIGEgdW5pcXVlICdrZXknIHByb3BlcnR5IHdoZW4gdXNpbmcgdGhlIHNhbWUgd2lkZ2V0IG9yIGVsZW1lbnQgKCR7bm9kZUlkZW50aWZpZXJ9KSBtdWx0aXBsZSB0aW1lcyBhcyBzaWJsaW5nc2ApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIHNhbWUoZG5vZGUxLCBkbm9kZTIpIHtcclxuICAgIGlmIChpc1ZOb2RlV3JhcHBlcihkbm9kZTEpICYmIGlzVk5vZGVXcmFwcGVyKGRub2RlMikpIHtcclxuICAgICAgICBpZiAoaXNEb21WTm9kZShkbm9kZTEubm9kZSkgJiYgaXNEb21WTm9kZShkbm9kZTIubm9kZSkpIHtcclxuICAgICAgICAgICAgaWYgKGRub2RlMS5ub2RlLmRvbU5vZGUgIT09IGRub2RlMi5ub2RlLmRvbU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZG5vZGUxLm5vZGUudGFnICE9PSBkbm9kZTIubm9kZS50YWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZG5vZGUxLm5vZGUucHJvcGVydGllcy5rZXkgIT09IGRub2RlMi5ub2RlLnByb3BlcnRpZXMua2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpc1dOb2RlV3JhcHBlcihkbm9kZTEpICYmIGlzV05vZGVXcmFwcGVyKGRub2RlMikpIHtcclxuICAgICAgICBpZiAoZG5vZGUxLmluc3RhbmNlID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIGRub2RlMi5ub2RlLndpZGdldENvbnN0cnVjdG9yID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkbm9kZTEubm9kZS53aWRnZXRDb25zdHJ1Y3RvciAhPT0gZG5vZGUyLm5vZGUud2lkZ2V0Q29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZG5vZGUxLm5vZGUucHJvcGVydGllcy5rZXkgIT09IGRub2RlMi5ub2RlLnByb3BlcnRpZXMua2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuZnVuY3Rpb24gZmluZEluZGV4T2ZDaGlsZChjaGlsZHJlbiwgc2FtZUFzLCBzdGFydCkge1xyXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoc2FtZShjaGlsZHJlbltpXSwgc2FtZUFzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gLTE7XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlQ2xhc3NQcm9wVmFsdWUoY2xhc3NlcyA9IFtdKSB7XHJcbiAgICBjbGFzc2VzID0gQXJyYXkuaXNBcnJheShjbGFzc2VzKSA/IGNsYXNzZXMgOiBbY2xhc3Nlc107XHJcbiAgICByZXR1cm4gY2xhc3Nlcy5qb2luKCcgJykudHJpbSgpO1xyXG59XHJcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZShkb21Ob2RlLCBhdHRyTmFtZSwgYXR0clZhbHVlLCBuYW1lc3BhY2UpIHtcclxuICAgIGlmIChuYW1lc3BhY2UgPT09IE5BTUVTUEFDRV9TVkcgJiYgYXR0ck5hbWUgPT09ICdocmVmJyAmJiBhdHRyVmFsdWUpIHtcclxuICAgICAgICBkb21Ob2RlLnNldEF0dHJpYnV0ZU5TKE5BTUVTUEFDRV9YTElOSywgYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICgoYXR0ck5hbWUgPT09ICdyb2xlJyAmJiBhdHRyVmFsdWUgPT09ICcnKSB8fCBhdHRyVmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGRvbU5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGRvbU5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIHJ1bkVudGVyQW5pbWF0aW9uKG5leHQsIHRyYW5zaXRpb25zKSB7XHJcbiAgICBjb25zdCB7IGRvbU5vZGUsIG5vZGU6IHsgcHJvcGVydGllcyB9LCBub2RlOiB7IHByb3BlcnRpZXM6IHsgZW50ZXJBbmltYXRpb24gfSB9IH0gPSBuZXh0O1xyXG4gICAgaWYgKGVudGVyQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBlbnRlckFuaW1hdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZW50ZXJBbmltYXRpb24oZG9tTm9kZSwgcHJvcGVydGllcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyYW5zaXRpb25zLmVudGVyKGRvbU5vZGUsIHByb3BlcnRpZXMsIGVudGVyQW5pbWF0aW9uKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBydW5FeGl0QW5pbWF0aW9uKGN1cnJlbnQsIHRyYW5zaXRpb25zKSB7XHJcbiAgICBjb25zdCB7IGRvbU5vZGUsIG5vZGU6IHsgcHJvcGVydGllcyB9LCBub2RlOiB7IHByb3BlcnRpZXM6IHsgZXhpdEFuaW1hdGlvbiB9IH0gfSA9IGN1cnJlbnQ7XHJcbiAgICBjb25zdCByZW1vdmVEb21Ob2RlID0gKCkgPT4ge1xyXG4gICAgICAgIGRvbU5vZGUgJiYgZG9tTm9kZS5wYXJlbnROb2RlICYmIGRvbU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb21Ob2RlKTtcclxuICAgICAgICBjdXJyZW50LmRvbU5vZGUgPSB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG4gICAgaWYgKHR5cGVvZiBleGl0QW5pbWF0aW9uID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIGV4aXRBbmltYXRpb24oZG9tTm9kZSwgcmVtb3ZlRG9tTm9kZSwgcHJvcGVydGllcyk7XHJcbiAgICB9XHJcbiAgICB0cmFuc2l0aW9ucy5leGl0KGRvbU5vZGUsIHByb3BlcnRpZXMsIGV4aXRBbmltYXRpb24sIHJlbW92ZURvbU5vZGUpO1xyXG59XHJcbmZ1bmN0aW9uIGFycmF5RnJvbShhcnIpIHtcclxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xyXG59XHJcbmZ1bmN0aW9uIHdyYXBWTm9kZXMobm9kZXMpIHtcclxuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIFdpZGdldEJhc2Uge1xyXG4gICAgICAgIHJlbmRlcigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVzO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcmVyKHJlbmRlcmVyKSB7XHJcbiAgICBsZXQgX21vdW50T3B0aW9ucyA9IHtcclxuICAgICAgICBzeW5jOiBmYWxzZSxcclxuICAgICAgICBtZXJnZTogdHJ1ZSxcclxuICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uU3RyYXRlZ3ksXHJcbiAgICAgICAgZG9tTm9kZTogZ2xvYmFsLmRvY3VtZW50LmJvZHksXHJcbiAgICAgICAgcmVnaXN0cnk6IG51bGxcclxuICAgIH07XHJcbiAgICBsZXQgX2ludmFsaWRhdGlvblF1ZXVlID0gW107XHJcbiAgICBsZXQgX3Byb2Nlc3NRdWV1ZSA9IFtdO1xyXG4gICAgbGV0IF9hcHBsaWNhdGlvblF1ZXVlID0gW107XHJcbiAgICBsZXQgX2V2ZW50TWFwID0gbmV3IFdlYWtNYXAoKTtcclxuICAgIGxldCBfaW5zdGFuY2VUb1dyYXBwZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgbGV0IF9wYXJlbnRXcmFwcGVyTWFwID0gbmV3IFdlYWtNYXAoKTtcclxuICAgIGxldCBfd3JhcHBlclNpYmxpbmdNYXAgPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgbGV0IF9yZW5kZXJTY2hlZHVsZWQ7XHJcbiAgICBsZXQgX2FmdGVyUmVuZGVyQ2FsbGJhY2tzID0gW107XHJcbiAgICBsZXQgX2RlZmVycmVkUmVuZGVyQ2FsbGJhY2tzID0gW107XHJcbiAgICBsZXQgcGFyZW50SW52YWxpZGF0ZTtcclxuICAgIGZ1bmN0aW9uIG5vZGVPcGVyYXRpb24ocHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXNWYWx1ZSwgZG9tTm9kZSkge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBwcm9wVmFsdWUgJiYgIXByZXZpb3VzVmFsdWU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHJvcFZhbHVlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgX2FmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZG9tTm9kZVtwcm9wTmFtZV0oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gdXBkYXRlRXZlbnQoZG9tTm9kZSwgZXZlbnROYW1lLCBjdXJyZW50VmFsdWUsIGJpbmQsIHByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICBpZiAocHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c0V2ZW50ID0gX2V2ZW50TWFwLmdldChwcmV2aW91c1ZhbHVlKTtcclxuICAgICAgICAgICAgZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgcHJldmlvdXNFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjYWxsYmFjayA9IGN1cnJlbnRWYWx1ZS5iaW5kKGJpbmQpO1xyXG4gICAgICAgIGlmIChldmVudE5hbWUgPT09ICdpbnB1dCcpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUuY2FsbCh0aGlzLCBldnQpO1xyXG4gICAgICAgICAgICAgICAgZXZ0LnRhcmdldFsnb25pbnB1dC12YWx1ZSddID0gZXZ0LnRhcmdldC52YWx1ZTtcclxuICAgICAgICAgICAgfS5iaW5kKGJpbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkb21Ob2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XHJcbiAgICAgICAgX2V2ZW50TWFwLnNldChjdXJyZW50VmFsdWUsIGNhbGxiYWNrKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlbW92ZU9ycGhhbmVkRXZlbnRzKGRvbU5vZGUsIHByZXZpb3VzUHJvcGVydGllcywgcHJvcGVydGllcywgb25seUV2ZW50cyA9IGZhbHNlKSB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMocHJldmlvdXNQcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpc0V2ZW50ID0gcHJvcE5hbWUuc3Vic3RyKDAsIDIpID09PSAnb24nIHx8IG9ubHlFdmVudHM7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IG9ubHlFdmVudHMgPyBwcm9wTmFtZSA6IHByb3BOYW1lLnN1YnN0cigyKTtcclxuICAgICAgICAgICAgaWYgKGlzRXZlbnQgJiYgIXByb3BlcnRpZXNbcHJvcE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudENhbGxiYWNrID0gX2V2ZW50TWFwLmdldChwcmV2aW91c1Byb3BlcnRpZXNbcHJvcE5hbWVdKTtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZlbnRDYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlbmRlcmVkVG9XcmFwcGVyKHJlbmRlcmVkLCBwYXJlbnQsIGN1cnJlbnRQYXJlbnQpIHtcclxuICAgICAgICBjb25zdCB3cmFwcGVkUmVuZGVyZWQgPSBbXTtcclxuICAgICAgICBjb25zdCBoYXNQYXJlbnRXTm9kZSA9IGlzV05vZGVXcmFwcGVyKHBhcmVudCk7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFBhcmVudExlbmd0aCA9IGlzVk5vZGVXcmFwcGVyKGN1cnJlbnRQYXJlbnQpICYmIChjdXJyZW50UGFyZW50LmNoaWxkcmVuV3JhcHBlcnMgfHwgW10pLmxlbmd0aCA+IDE7XHJcbiAgICAgICAgY29uc3QgcmVxdWlyZXNJbnNlcnRCZWZvcmUgPSAoKHBhcmVudC5yZXF1aXJlc0luc2VydEJlZm9yZSB8fCBwYXJlbnQuaGFzUHJldmlvdXNTaWJsaW5ncyAhPT0gZmFsc2UpICYmIGhhc1BhcmVudFdOb2RlKSB8fFxyXG4gICAgICAgICAgICBjdXJyZW50UGFyZW50TGVuZ3RoO1xyXG4gICAgICAgIGxldCBwcmV2aW91c0l0ZW07XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW5kZXJlZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByZW5kZXJlZEl0ZW0gPSByZW5kZXJlZFtpXTtcclxuICAgICAgICAgICAgY29uc3Qgd3JhcHBlciA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IHJlbmRlcmVkSXRlbSxcclxuICAgICAgICAgICAgICAgIGRlcHRoOiBwYXJlbnQuZGVwdGggKyAxLFxyXG4gICAgICAgICAgICAgICAgcmVxdWlyZXNJbnNlcnRCZWZvcmUsXHJcbiAgICAgICAgICAgICAgICBoYXNQYXJlbnRXTm9kZSxcclxuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogcGFyZW50Lm5hbWVzcGFjZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoaXNWTm9kZShyZW5kZXJlZEl0ZW0pICYmIHJlbmRlcmVkSXRlbS5wcm9wZXJ0aWVzLmV4aXRBbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5oYXNBbmltYXRpb25zID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0UGFyZW50ID0gX3BhcmVudFdyYXBwZXJNYXAuZ2V0KHBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV4dFBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0UGFyZW50Lmhhc0FuaW1hdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5leHRQYXJlbnQuaGFzQW5pbWF0aW9ucyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dFBhcmVudCA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChuZXh0UGFyZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfcGFyZW50V3JhcHBlck1hcC5zZXQod3JhcHBlciwgcGFyZW50KTtcclxuICAgICAgICAgICAgaWYgKHByZXZpb3VzSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgX3dyYXBwZXJTaWJsaW5nTWFwLnNldChwcmV2aW91c0l0ZW0sIHdyYXBwZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdyYXBwZWRSZW5kZXJlZC5wdXNoKHdyYXBwZXIpO1xyXG4gICAgICAgICAgICBwcmV2aW91c0l0ZW0gPSB3cmFwcGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gd3JhcHBlZFJlbmRlcmVkO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZmluZFBhcmVudFdOb2RlV3JhcHBlcihjdXJyZW50Tm9kZSkge1xyXG4gICAgICAgIGxldCBwYXJlbnRXTm9kZVdyYXBwZXI7XHJcbiAgICAgICAgbGV0IHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQoY3VycmVudE5vZGUpO1xyXG4gICAgICAgIHdoaWxlICghcGFyZW50V05vZGVXcmFwcGVyICYmIHBhcmVudFdyYXBwZXIpIHtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnRXTm9kZVdyYXBwZXIgJiYgaXNXTm9kZVdyYXBwZXIocGFyZW50V3JhcHBlcikpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudFdOb2RlV3JhcHBlciA9IHBhcmVudFdyYXBwZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50V3JhcHBlciA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChwYXJlbnRXcmFwcGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhcmVudFdOb2RlV3JhcHBlcjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGZpbmRQYXJlbnREb21Ob2RlKGN1cnJlbnROb2RlKSB7XHJcbiAgICAgICAgbGV0IHBhcmVudERvbU5vZGU7XHJcbiAgICAgICAgbGV0IHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQoY3VycmVudE5vZGUpO1xyXG4gICAgICAgIHdoaWxlICghcGFyZW50RG9tTm9kZSAmJiBwYXJlbnRXcmFwcGVyKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50RG9tTm9kZSAmJiBpc1ZOb2RlV3JhcHBlcihwYXJlbnRXcmFwcGVyKSAmJiBwYXJlbnRXcmFwcGVyLmRvbU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudERvbU5vZGUgPSBwYXJlbnRXcmFwcGVyLmRvbU5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50V3JhcHBlciA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChwYXJlbnRXcmFwcGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhcmVudERvbU5vZGU7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBydW5EZWZlcnJlZFByb3BlcnRpZXMobmV4dCkge1xyXG4gICAgICAgIGlmIChuZXh0Lm5vZGUuZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IG5leHQubm9kZS5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICBuZXh0Lm5vZGUucHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIG5leHQubm9kZS5kZWZlcnJlZFByb3BlcnRpZXNDYWxsYmFjayh0cnVlKSwgbmV4dC5ub2RlLm9yaWdpbmFsUHJvcGVydGllcyk7XHJcbiAgICAgICAgICAgIF9hZnRlclJlbmRlckNhbGxiYWNrcy5wdXNoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9wZXJ0aWVzKG5leHQsIHsgcHJvcGVydGllcyB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZmluZEluc2VydEJlZm9yZShuZXh0KSB7XHJcbiAgICAgICAgbGV0IGluc2VydEJlZm9yZSA9IG51bGw7XHJcbiAgICAgICAgbGV0IHNlYXJjaE5vZGUgPSBuZXh0O1xyXG4gICAgICAgIHdoaWxlICghaW5zZXJ0QmVmb3JlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gX3dyYXBwZXJTaWJsaW5nTWFwLmdldChzZWFyY2hOb2RlKTtcclxuICAgICAgICAgICAgaWYgKG5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZVdyYXBwZXIobmV4dFNpYmxpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRTaWJsaW5nLmRvbU5vZGUgJiYgbmV4dFNpYmxpbmcuZG9tTm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydEJlZm9yZSA9IG5leHRTaWJsaW5nLmRvbU5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hOb2RlID0gbmV4dFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dFNpYmxpbmcuZG9tTm9kZSAmJiBuZXh0U2libGluZy5kb21Ob2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRCZWZvcmUgPSBuZXh0U2libGluZy5kb21Ob2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VhcmNoTm9kZSA9IG5leHRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VhcmNoTm9kZSA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChzZWFyY2hOb2RlKTtcclxuICAgICAgICAgICAgaWYgKCFzZWFyY2hOb2RlIHx8IGlzVk5vZGVXcmFwcGVyKHNlYXJjaE5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5zZXJ0QmVmb3JlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2V0UHJvcGVydGllcyhkb21Ob2RlLCBjdXJyZW50UHJvcGVydGllcyA9IHt9LCBuZXh0V3JhcHBlciwgaW5jbHVkZXNFdmVudHNBbmRBdHRyaWJ1dGVzID0gdHJ1ZSkge1xyXG4gICAgICAgIGNvbnN0IHByb3BOYW1lcyA9IE9iamVjdC5rZXlzKG5leHRXcmFwcGVyLm5vZGUucHJvcGVydGllcyk7XHJcbiAgICAgICAgY29uc3QgcHJvcENvdW50ID0gcHJvcE5hbWVzLmxlbmd0aDtcclxuICAgICAgICBpZiAocHJvcE5hbWVzLmluZGV4T2YoJ2NsYXNzZXMnKSA9PT0gLTEgJiYgY3VycmVudFByb3BlcnRpZXMuY2xhc3Nlcykge1xyXG4gICAgICAgICAgICBkb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZSgnY2xhc3MnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5jbHVkZXNFdmVudHNBbmRBdHRyaWJ1dGVzICYmIHJlbW92ZU9ycGhhbmVkRXZlbnRzKGRvbU5vZGUsIGN1cnJlbnRQcm9wZXJ0aWVzLCBuZXh0V3JhcHBlci5ub2RlLnByb3BlcnRpZXMpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcENvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcHJvcE5hbWUgPSBwcm9wTmFtZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBwcm9wVmFsdWUgPSBuZXh0V3JhcHBlci5ub2RlLnByb3BlcnRpZXNbcHJvcE5hbWVdO1xyXG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c1ZhbHVlID0gY3VycmVudFByb3BlcnRpZXNbcHJvcE5hbWVdO1xyXG4gICAgICAgICAgICBpZiAocHJvcE5hbWUgPT09ICdjbGFzc2VzJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNDbGFzc1N0cmluZyA9IGNyZWF0ZUNsYXNzUHJvcFZhbHVlKHByZXZpb3VzVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRDbGFzc1N0cmluZyA9IGNyZWF0ZUNsYXNzUHJvcFZhbHVlKHByb3BWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDbGFzc1N0cmluZyAhPT0gY3VycmVudENsYXNzU3RyaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDbGFzc1N0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFdyYXBwZXIubWVyZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21DbGFzc2VzID0gKGRvbU5vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpIHx8ICcnKS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkb21DbGFzc2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDbGFzc1N0cmluZy5pbmRleE9mKGRvbUNsYXNzZXNbaV0pID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q2xhc3NTdHJpbmcgPSBgJHtkb21DbGFzc2VzW2ldfSAke2N1cnJlbnRDbGFzc1N0cmluZ31gO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjdXJyZW50Q2xhc3NTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGVPcGVyYXRpb25zLmluZGV4T2YocHJvcE5hbWUpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZU9wZXJhdGlvbihwcm9wTmFtZSwgcHJvcFZhbHVlLCBwcmV2aW91c1ZhbHVlLCBkb21Ob2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwcm9wTmFtZSA9PT0gJ3N0eWxlcycpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0eWxlTmFtZXMgPSBPYmplY3Qua2V5cyhwcm9wVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3R5bGVDb3VudCA9IHN0eWxlTmFtZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzdHlsZUNvdW50OyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHlsZU5hbWUgPSBzdHlsZU5hbWVzW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N0eWxlVmFsdWUgPSBwcm9wVmFsdWVbc3R5bGVOYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRTdHlsZVZhbHVlID0gcHJldmlvdXNWYWx1ZSAmJiBwcmV2aW91c1ZhbHVlW3N0eWxlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1N0eWxlVmFsdWUgPT09IG9sZFN0eWxlVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuc3R5bGVbc3R5bGVOYW1lXSA9IG5ld1N0eWxlVmFsdWUgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb3BWYWx1ZSAmJiB0eXBlb2YgcHJldmlvdXNWYWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wVmFsdWUgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwcm9wTmFtZSA9PT0gJ3ZhbHVlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbVZhbHVlID0gZG9tTm9kZVtwcm9wTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbVZhbHVlICE9PSBwcm9wVmFsdWUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGRvbU5vZGVbJ29uaW5wdXQtdmFsdWUnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBkb21WYWx1ZSA9PT0gZG9tTm9kZVsnb25pbnB1dC12YWx1ZSddXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHByb3BWYWx1ZSAhPT0gcHJldmlvdXNWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZVtwcm9wTmFtZV0gPSBwcm9wVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGVbJ29uaW5wdXQtdmFsdWUnXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwcm9wTmFtZSAhPT0gJ2tleScgJiYgcHJvcFZhbHVlICE9PSBwcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IHR5cGVvZiBwcm9wVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicgJiYgcHJvcE5hbWUubGFzdEluZGV4T2YoJ29uJywgMCkgPT09IDAgJiYgaW5jbHVkZXNFdmVudHNBbmRBdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUV2ZW50KGRvbU5vZGUsIHByb3BOYW1lLnN1YnN0cigyKSwgcHJvcFZhbHVlLCBuZXh0V3JhcHBlci5ub2RlLmJpbmQsIHByZXZpb3VzVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBwcm9wTmFtZSAhPT0gJ2lubmVySFRNTCcgJiYgaW5jbHVkZXNFdmVudHNBbmRBdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUF0dHJpYnV0ZShkb21Ob2RlLCBwcm9wTmFtZSwgcHJvcFZhbHVlLCBuZXh0V3JhcHBlci5uYW1lc3BhY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChwcm9wTmFtZSA9PT0gJ3Njcm9sbExlZnQnIHx8IHByb3BOYW1lID09PSAnc2Nyb2xsVG9wJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9tTm9kZVtwcm9wTmFtZV0gIT09IHByb3BWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZVtwcm9wTmFtZV0gPSBwcm9wVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGVbcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJ1bkRlZmVycmVkUmVuZGVyQ2FsbGJhY2tzKCkge1xyXG4gICAgICAgIGNvbnN0IHsgc3luYyB9ID0gX21vdW50T3B0aW9ucztcclxuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSBfZGVmZXJyZWRSZW5kZXJDYWxsYmFja3M7XHJcbiAgICAgICAgX2RlZmVycmVkUmVuZGVyQ2FsbGJhY2tzID0gW107XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgcnVuID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChjYWxsYmFjayA9IGNhbGxiYWNrcy5zaGlmdCgpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChzeW5jKSB7XHJcbiAgICAgICAgICAgICAgICBydW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocnVuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJ1bkFmdGVyUmVuZGVyQ2FsbGJhY2tzKCkge1xyXG4gICAgICAgIGNvbnN0IHsgc3luYyB9ID0gX21vdW50T3B0aW9ucztcclxuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSBfYWZ0ZXJSZW5kZXJDYWxsYmFja3M7XHJcbiAgICAgICAgX2FmdGVyUmVuZGVyQ2FsbGJhY2tzID0gW107XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgcnVuID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChjYWxsYmFjayA9IGNhbGxiYWNrcy5zaGlmdCgpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChzeW5jKSB7XHJcbiAgICAgICAgICAgICAgICBydW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChnbG9iYWwucmVxdWVzdElkbGVDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5yZXF1ZXN0SWRsZUNhbGxiYWNrKHJ1bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHJ1bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBwcm9jZXNzUHJvcGVydGllcyhuZXh0LCBwcmV2aW91c1Byb3BlcnRpZXMpIHtcclxuICAgICAgICBpZiAobmV4dC5ub2RlLmF0dHJpYnV0ZXMgJiYgbmV4dC5ub2RlLmV2ZW50cykge1xyXG4gICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGVzKG5leHQuZG9tTm9kZSwgcHJldmlvdXNQcm9wZXJ0aWVzLmF0dHJpYnV0ZXMgfHwge30sIG5leHQubm9kZS5hdHRyaWJ1dGVzLCBuZXh0Lm5hbWVzcGFjZSk7XHJcbiAgICAgICAgICAgIHNldFByb3BlcnRpZXMobmV4dC5kb21Ob2RlLCBwcmV2aW91c1Byb3BlcnRpZXMucHJvcGVydGllcywgbmV4dCwgZmFsc2UpO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudHMgPSBuZXh0Lm5vZGUuZXZlbnRzIHx8IHt9O1xyXG4gICAgICAgICAgICBpZiAocHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50cykge1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlT3JwaGFuZWRFdmVudHMobmV4dC5kb21Ob2RlLCBwcmV2aW91c1Byb3BlcnRpZXMuZXZlbnRzIHx8IHt9LCBuZXh0Lm5vZGUuZXZlbnRzLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2aW91c1Byb3BlcnRpZXMuZXZlbnRzID0gcHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50cyB8fCB7fTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXMoZXZlbnRzKS5mb3JFYWNoKChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlRXZlbnQobmV4dC5kb21Ob2RlLCBldmVudCwgZXZlbnRzW2V2ZW50XSwgbmV4dC5ub2RlLmJpbmQsIHByZXZpb3VzUHJvcGVydGllcy5ldmVudHNbZXZlbnRdKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZXRQcm9wZXJ0aWVzKG5leHQuZG9tTm9kZSwgcHJldmlvdXNQcm9wZXJ0aWVzLnByb3BlcnRpZXMsIG5leHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG1vdW50KG1vdW50T3B0aW9ucyA9IHt9KSB7XHJcbiAgICAgICAgX21vdW50T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIF9tb3VudE9wdGlvbnMsIG1vdW50T3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3QgeyBkb21Ob2RlIH0gPSBfbW91bnRPcHRpb25zO1xyXG4gICAgICAgIGxldCByZW5kZXJSZXN1bHQgPSByZW5kZXJlcigpO1xyXG4gICAgICAgIGlmIChpc1ZOb2RlKHJlbmRlclJlc3VsdCkpIHtcclxuICAgICAgICAgICAgcmVuZGVyUmVzdWx0ID0gdyh3cmFwVk5vZGVzKHJlbmRlclJlc3VsdCksIHt9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV4dFdyYXBwZXIgPSB7XHJcbiAgICAgICAgICAgIG5vZGU6IHJlbmRlclJlc3VsdCxcclxuICAgICAgICAgICAgZGVwdGg6IDFcclxuICAgICAgICB9O1xyXG4gICAgICAgIF9wYXJlbnRXcmFwcGVyTWFwLnNldChuZXh0V3JhcHBlciwgeyBkZXB0aDogMCwgZG9tTm9kZSwgbm9kZTogdignZmFrZScpIH0pO1xyXG4gICAgICAgIF9wcm9jZXNzUXVldWUucHVzaCh7XHJcbiAgICAgICAgICAgIGN1cnJlbnQ6IFtdLFxyXG4gICAgICAgICAgICBuZXh0OiBbbmV4dFdyYXBwZXJdLFxyXG4gICAgICAgICAgICBtZXRhOiB7IG1lcmdlTm9kZXM6IGFycmF5RnJvbShkb21Ob2RlLmNoaWxkTm9kZXMpIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBfcnVuUHJvY2Vzc1F1ZXVlKCk7XHJcbiAgICAgICAgX21vdW50T3B0aW9ucy5tZXJnZSA9IGZhbHNlO1xyXG4gICAgICAgIF9ydW5Eb21JbnN0cnVjdGlvblF1ZXVlKCk7XHJcbiAgICAgICAgX3J1bkNhbGxiYWNrcygpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW52YWxpZGF0ZSgpIHtcclxuICAgICAgICBwYXJlbnRJbnZhbGlkYXRlICYmIHBhcmVudEludmFsaWRhdGUoKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9zY2hlZHVsZSgpIHtcclxuICAgICAgICBjb25zdCB7IHN5bmMgfSA9IF9tb3VudE9wdGlvbnM7XHJcbiAgICAgICAgaWYgKHN5bmMpIHtcclxuICAgICAgICAgICAgX3J1bkludmFsaWRhdGlvblF1ZXVlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFfcmVuZGVyU2NoZWR1bGVkKSB7XHJcbiAgICAgICAgICAgIF9yZW5kZXJTY2hlZHVsZWQgPSBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIF9ydW5JbnZhbGlkYXRpb25RdWV1ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfcnVuSW52YWxpZGF0aW9uUXVldWUoKSB7XHJcbiAgICAgICAgX3JlbmRlclNjaGVkdWxlZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBpbnZhbGlkYXRpb25RdWV1ZSA9IFsuLi5faW52YWxpZGF0aW9uUXVldWVdO1xyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzbHlSZW5kZXJlZCA9IFtdO1xyXG4gICAgICAgIF9pbnZhbGlkYXRpb25RdWV1ZSA9IFtdO1xyXG4gICAgICAgIGludmFsaWRhdGlvblF1ZXVlLnNvcnQoKGEsIGIpID0+IGIuZGVwdGggLSBhLmRlcHRoKTtcclxuICAgICAgICBsZXQgaXRlbTtcclxuICAgICAgICB3aGlsZSAoKGl0ZW0gPSBpbnZhbGlkYXRpb25RdWV1ZS5wb3AoKSkpIHtcclxuICAgICAgICAgICAgbGV0IHsgaW5zdGFuY2UgfSA9IGl0ZW07XHJcbiAgICAgICAgICAgIGlmIChwcmV2aW91c2x5UmVuZGVyZWQuaW5kZXhPZihpbnN0YW5jZSkgPT09IC0xICYmIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5oYXMoaW5zdGFuY2UpKSB7XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91c2x5UmVuZGVyZWQucHVzaChpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gX2luc3RhbmNlVG9XcmFwcGVyTWFwLmdldChpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gX3BhcmVudFdyYXBwZXJNYXAuZ2V0KGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2libGluZyA9IF93cmFwcGVyU2libGluZ01hcC5nZXQoY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGNvbnN0cnVjdG9yLCBjaGlsZHJlbiB9ID0gaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogV05PREUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldENvbnN0cnVjdG9yOiBjb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogaW5zdGFuY2VEYXRhLmlucHV0UHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kOiBjdXJyZW50Lm5vZGUuYmluZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVwdGg6IGN1cnJlbnQuZGVwdGhcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgJiYgX3BhcmVudFdyYXBwZXJNYXAuc2V0KG5leHQsIHBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICBzaWJsaW5nICYmIF93cmFwcGVyU2libGluZ01hcC5zZXQobmV4dCwgc2libGluZyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGl0ZW0gfSA9IF91cGRhdGVXaWRnZXQoeyBjdXJyZW50LCBuZXh0IH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBfcHJvY2Vzc1F1ZXVlLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UgJiYgX2luc3RhbmNlVG9XcmFwcGVyTWFwLnNldChpbnN0YW5jZSwgbmV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX3J1blByb2Nlc3NRdWV1ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIF9ydW5Eb21JbnN0cnVjdGlvblF1ZXVlKCk7XHJcbiAgICAgICAgX3J1bkNhbGxiYWNrcygpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX3J1blByb2Nlc3NRdWV1ZSgpIHtcclxuICAgICAgICBsZXQgaXRlbTtcclxuICAgICAgICB3aGlsZSAoKGl0ZW0gPSBfcHJvY2Vzc1F1ZXVlLnBvcCgpKSkge1xyXG4gICAgICAgICAgICBpZiAoaXNBdHRhY2hBcHBsaWNhdGlvbihpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgX2FwcGxpY2F0aW9uUXVldWUucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgY3VycmVudCwgbmV4dCwgbWV0YSB9ID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIF9wcm9jZXNzKGN1cnJlbnQgfHwgRU1QVFlfQVJSQVksIG5leHQgfHwgRU1QVFlfQVJSQVksIG1ldGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX3J1bkRvbUluc3RydWN0aW9uUXVldWUoKSB7XHJcbiAgICAgICAgX2FwcGxpY2F0aW9uUXVldWUucmV2ZXJzZSgpO1xyXG4gICAgICAgIGxldCBpdGVtO1xyXG4gICAgICAgIHdoaWxlICgoaXRlbSA9IF9hcHBsaWNhdGlvblF1ZXVlLnBvcCgpKSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnY3JlYXRlJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBwYXJlbnREb21Ob2RlLCBuZXh0LCBuZXh0OiB7IGRvbU5vZGUsIG1lcmdlZCwgcmVxdWlyZXNJbnNlcnRCZWZvcmUsIG5vZGU6IHsgcHJvcGVydGllcyB9IH0gfSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzUHJvcGVydGllcyhuZXh0LCB7IHByb3BlcnRpZXM6IHt9IH0pO1xyXG4gICAgICAgICAgICAgICAgcnVuRGVmZXJyZWRQcm9wZXJ0aWVzKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtZXJnZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5zZXJ0QmVmb3JlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXF1aXJlc0luc2VydEJlZm9yZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRCZWZvcmUgPSBmaW5kSW5zZXJ0QmVmb3JlKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnREb21Ob2RlLmluc2VydEJlZm9yZShkb21Ob2RlLCBpbnNlcnRCZWZvcmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RvbVZOb2RlKG5leHQubm9kZSkgJiYgbmV4dC5ub2RlLm9uQXR0YWNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQubm9kZS5vbkF0dGFjaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJ1bkVudGVyQW5pbWF0aW9uKG5leHQsIF9tb3VudE9wdGlvbnMudHJhbnNpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQobmV4dC5ub2RlLmJpbmQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMua2V5ICE9IG51bGwgJiYgaW5zdGFuY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VEYXRhLm5vZGVIYW5kbGVyLmFkZChkb21Ob2RlLCBgJHtwcm9wZXJ0aWVzLmtleX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGl0ZW0ubmV4dC5pbnNlcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS50eXBlID09PSAndXBkYXRlJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBuZXh0LCBuZXh0OiB7IGRvbU5vZGUsIG5vZGUgfSwgY3VycmVudCB9ID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChuZXh0KTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgaXNXTm9kZVdyYXBwZXIocGFyZW50KSAmJiBwYXJlbnQuaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQocGFyZW50Lmluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZURhdGEgJiYgaW5zdGFuY2VEYXRhLm5vZGVIYW5kbGVyLmFkZFJvb3QoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzUHJvcGVydGllcyA9IGJ1aWxkUHJldmlvdXNQcm9wZXJ0aWVzKGRvbU5vZGUsIGN1cnJlbnQsIG5leHQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KG5leHQubm9kZS5iaW5kKTtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9wZXJ0aWVzKG5leHQsIHByZXZpb3VzUHJvcGVydGllcyk7XHJcbiAgICAgICAgICAgICAgICBydW5EZWZlcnJlZFByb3BlcnRpZXMobmV4dCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2VEYXRhICYmIG5vZGUucHJvcGVydGllcy5rZXkgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlRGF0YS5ub2RlSGFuZGxlci5hZGQobmV4dC5kb21Ob2RlLCBgJHtub2RlLnByb3BlcnRpZXMua2V5fWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ2RlbGV0ZScpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgY3VycmVudCB9ID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Lm5vZGUucHJvcGVydGllcy5leGl0QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVuRXhpdEFuaW1hdGlvbihjdXJyZW50LCBfbW91bnRPcHRpb25zLnRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY3VycmVudC5kb21Ob2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmRvbU5vZGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS50eXBlID09PSAnYXR0YWNoJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBpbnN0YW5jZSwgYXR0YWNoZWQgfSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VEYXRhLm5vZGVIYW5kbGVyLmFkZFJvb3QoKTtcclxuICAgICAgICAgICAgICAgIGF0dGFjaGVkICYmIGluc3RhbmNlRGF0YS5vbkF0dGFjaCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ2RldGFjaCcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLmN1cnJlbnQuaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaXRlbS5jdXJyZW50Lmluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZURhdGEgJiYgaW5zdGFuY2VEYXRhLm9uRGV0YWNoKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpdGVtLmN1cnJlbnQuZG9tTm9kZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIGl0ZW0uY3VycmVudC5ub2RlLmJpbmQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmN1cnJlbnQuaW5zdGFuY2UgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfcnVuQ2FsbGJhY2tzKCkge1xyXG4gICAgICAgIHJ1bkFmdGVyUmVuZGVyQ2FsbGJhY2tzKCk7XHJcbiAgICAgICAgcnVuRGVmZXJyZWRSZW5kZXJDYWxsYmFja3MoKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9wcm9jZXNzTWVyZ2VOb2RlcyhuZXh0LCBtZXJnZU5vZGVzKSB7XHJcbiAgICAgICAgY29uc3QgeyBtZXJnZSB9ID0gX21vdW50T3B0aW9ucztcclxuICAgICAgICBpZiAobWVyZ2UgJiYgbWVyZ2VOb2Rlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKGlzVk5vZGVXcmFwcGVyKG5leHQpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeyBub2RlOiB7IHRhZyB9IH0gPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXJnZU5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9tRWxlbWVudCA9IG1lcmdlTm9kZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhZy50b1VwcGVyQ2FzZSgpID09PSAoZG9tRWxlbWVudC50YWdOYW1lIHx8ICcnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZU5vZGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dC5kb21Ob2RlID0gZG9tRWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbmV4dC5tZXJnZU5vZGVzID0gbWVyZ2VOb2RlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY2hpbGROb2RlcywgaW5kZXgpIHtcclxuICAgICAgICBfYWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudFdOb2RlV3JhcHBlciA9IGZpbmRQYXJlbnRXTm9kZVdyYXBwZXIoY2hpbGROb2Rlc1tpbmRleF0pO1xyXG4gICAgICAgICAgICBjaGVja0Rpc3Rpbmd1aXNoYWJsZShjaGlsZE5vZGVzLCBpbmRleCwgcGFyZW50V05vZGVXcmFwcGVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9wcm9jZXNzKGN1cnJlbnQsIG5leHQsIG1ldGEgPSB7fSkge1xyXG4gICAgICAgIGxldCB7IG1lcmdlTm9kZXMgPSBbXSwgb2xkSW5kZXggPSAwLCBuZXdJbmRleCA9IDAgfSA9IG1ldGE7XHJcbiAgICAgICAgY29uc3QgY3VycmVudExlbmd0aCA9IGN1cnJlbnQubGVuZ3RoO1xyXG4gICAgICAgIGNvbnN0IG5leHRMZW5ndGggPSBuZXh0Lmxlbmd0aDtcclxuICAgICAgICBjb25zdCBoYXNQcmV2aW91c1NpYmxpbmdzID0gY3VycmVudExlbmd0aCA+IDEgfHwgKGN1cnJlbnRMZW5ndGggPiAwICYmIGN1cnJlbnRMZW5ndGggPCBuZXh0TGVuZ3RoKTtcclxuICAgICAgICBjb25zdCBpbnN0cnVjdGlvbnMgPSBbXTtcclxuICAgICAgICBpZiAobmV3SW5kZXggPCBuZXh0TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50V3JhcHBlciA9IG9sZEluZGV4IDwgY3VycmVudExlbmd0aCA/IGN1cnJlbnRbb2xkSW5kZXhdIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjb25zdCBuZXh0V3JhcHBlciA9IG5leHRbbmV3SW5kZXhdO1xyXG4gICAgICAgICAgICBuZXh0V3JhcHBlci5oYXNQcmV2aW91c1NpYmxpbmdzID0gaGFzUHJldmlvdXNTaWJsaW5ncztcclxuICAgICAgICAgICAgX3Byb2Nlc3NNZXJnZU5vZGVzKG5leHRXcmFwcGVyLCBtZXJnZU5vZGVzKTtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRXcmFwcGVyICYmIHNhbWUoY3VycmVudFdyYXBwZXIsIG5leHRXcmFwcGVyKSkge1xyXG4gICAgICAgICAgICAgICAgb2xkSW5kZXgrKztcclxuICAgICAgICAgICAgICAgIG5ld0luZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZVdyYXBwZXIoY3VycmVudFdyYXBwZXIpICYmIGlzVk5vZGVXcmFwcGVyKG5leHRXcmFwcGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHRXcmFwcGVyLmluc2VydGVkID0gY3VycmVudFdyYXBwZXIuaW5zZXJ0ZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbnMucHVzaCh7IGN1cnJlbnQ6IGN1cnJlbnRXcmFwcGVyLCBuZXh0OiBuZXh0V3JhcHBlciB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghY3VycmVudFdyYXBwZXIgfHwgZmluZEluZGV4T2ZDaGlsZChjdXJyZW50LCBuZXh0V3JhcHBlciwgb2xkSW5kZXggKyAxKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRydWUgJiYgY3VycmVudC5sZW5ndGggJiYgcmVnaXN0ZXJEaXN0aW5ndWlzaGFibGVDYWxsYmFjayhuZXh0LCBuZXdJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbnMucHVzaCh7IGN1cnJlbnQ6IHVuZGVmaW5lZCwgbmV4dDogbmV4dFdyYXBwZXIgfSk7XHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGZpbmRJbmRleE9mQ2hpbGQobmV4dCwgY3VycmVudFdyYXBwZXIsIG5ld0luZGV4ICsgMSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0cnVlICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY3VycmVudCwgb2xkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiBjdXJyZW50V3JhcHBlciwgbmV4dDogdW5kZWZpbmVkIH0pO1xyXG4gICAgICAgICAgICAgICAgb2xkSW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRydWUgJiYgcmVnaXN0ZXJEaXN0aW5ndWlzaGFibGVDYWxsYmFjayhuZXh0LCBuZXdJbmRleCk7XHJcbiAgICAgICAgICAgICAgICB0cnVlICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY3VycmVudCwgb2xkSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiBjdXJyZW50V3JhcHBlciwgbmV4dDogdW5kZWZpbmVkIH0pO1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiB1bmRlZmluZWQsIG5leHQ6IG5leHRXcmFwcGVyIH0pO1xyXG4gICAgICAgICAgICAgICAgb2xkSW5kZXgrKztcclxuICAgICAgICAgICAgICAgIG5ld0luZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5ld0luZGV4IDwgbmV4dExlbmd0aCkge1xyXG4gICAgICAgICAgICBfcHJvY2Vzc1F1ZXVlLnB1c2goeyBjdXJyZW50LCBuZXh0LCBtZXRhOiB7IG1lcmdlTm9kZXMsIG9sZEluZGV4LCBuZXdJbmRleCB9IH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3VycmVudExlbmd0aCA+IG9sZEluZGV4ICYmIG5ld0luZGV4ID49IG5leHRMZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IG9sZEluZGV4OyBpIDwgY3VycmVudExlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0cnVlICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2soY3VycmVudCwgaSk7XHJcbiAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbnMucHVzaCh7IGN1cnJlbnQ6IGN1cnJlbnRbaV0sIG5leHQ6IHVuZGVmaW5lZCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluc3RydWN0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCB7IGl0ZW0sIGRvbSwgd2lkZ2V0IH0gPSBfcHJvY2Vzc09uZShpbnN0cnVjdGlvbnNbaV0pO1xyXG4gICAgICAgICAgICB3aWRnZXQgJiYgX3Byb2Nlc3NRdWV1ZS5wdXNoKHdpZGdldCk7XHJcbiAgICAgICAgICAgIGl0ZW0gJiYgX3Byb2Nlc3NRdWV1ZS5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICBkb20gJiYgX2FwcGxpY2F0aW9uUXVldWUucHVzaChkb20pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9wcm9jZXNzT25lKHsgY3VycmVudCwgbmV4dCB9KSB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQgIT09IG5leHQpIHtcclxuICAgICAgICAgICAgaWYgKCFjdXJyZW50ICYmIG5leHQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1ZOb2RlV3JhcHBlcihuZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfY3JlYXRlRG9tKHsgbmV4dCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfY3JlYXRlV2lkZ2V0KHsgbmV4dCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChjdXJyZW50ICYmIG5leHQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1ZOb2RlV3JhcHBlcihjdXJyZW50KSAmJiBpc1ZOb2RlV3JhcHBlcihuZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdXBkYXRlRG9tKHsgY3VycmVudCwgbmV4dCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzV05vZGVXcmFwcGVyKGN1cnJlbnQpICYmIGlzV05vZGVXcmFwcGVyKG5leHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF91cGRhdGVXaWRnZXQoeyBjdXJyZW50LCBuZXh0IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGN1cnJlbnQgJiYgIW5leHQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1ZOb2RlV3JhcHBlcihjdXJyZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVtb3ZlRG9tKHsgY3VycmVudCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzV05vZGVXcmFwcGVyKGN1cnJlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZW1vdmVXaWRnZXQoeyBjdXJyZW50IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7fTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9jcmVhdGVXaWRnZXQoeyBuZXh0IH0pIHtcclxuICAgICAgICBsZXQgeyBub2RlOiB7IHdpZGdldENvbnN0cnVjdG9yIH0gfSA9IG5leHQ7XHJcbiAgICAgICAgbGV0IHsgcmVnaXN0cnkgfSA9IF9tb3VudE9wdGlvbnM7XHJcbiAgICAgICAgaWYgKCFpc1dpZGdldEJhc2VDb25zdHJ1Y3Rvcih3aWRnZXRDb25zdHJ1Y3RvcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyB3aWRnZXRDb25zdHJ1Y3RvcigpO1xyXG4gICAgICAgIGlmIChyZWdpc3RyeSkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5yZWdpc3RyeS5iYXNlID0gcmVnaXN0cnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChpbnN0YW5jZSk7XHJcbiAgICAgICAgaW5zdGFuY2VEYXRhLmludmFsaWRhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlRGF0YS5kaXJ0eSA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2VEYXRhLnJlbmRlcmluZyAmJiBfaW5zdGFuY2VUb1dyYXBwZXJNYXAuaGFzKGluc3RhbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgX2ludmFsaWRhdGlvblF1ZXVlLnB1c2goeyBpbnN0YW5jZSwgZGVwdGg6IG5leHQuZGVwdGggfSk7XHJcbiAgICAgICAgICAgICAgICBfc2NoZWR1bGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaW5zdGFuY2VEYXRhLnJlbmRlcmluZyA9IHRydWU7XHJcbiAgICAgICAgaW5zdGFuY2UuX19zZXRQcm9wZXJ0aWVzX18obmV4dC5ub2RlLnByb3BlcnRpZXMsIG5leHQubm9kZS5iaW5kKTtcclxuICAgICAgICBpbnN0YW5jZS5fX3NldENoaWxkcmVuX18obmV4dC5ub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICBuZXh0Lmluc3RhbmNlID0gaW5zdGFuY2U7XHJcbiAgICAgICAgbGV0IHJlbmRlcmVkID0gaW5zdGFuY2UuX19yZW5kZXJfXygpO1xyXG4gICAgICAgIGluc3RhbmNlRGF0YS5yZW5kZXJpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAocmVuZGVyZWQpIHtcclxuICAgICAgICAgICAgcmVuZGVyZWQgPSBBcnJheS5pc0FycmF5KHJlbmRlcmVkKSA/IHJlbmRlcmVkIDogW3JlbmRlcmVkXTtcclxuICAgICAgICAgICAgbmV4dC5jaGlsZHJlbldyYXBwZXJzID0gcmVuZGVyZWRUb1dyYXBwZXIocmVuZGVyZWQsIG5leHQsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobmV4dC5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBfaW5zdGFuY2VUb1dyYXBwZXJNYXAuc2V0KG5leHQuaW5zdGFuY2UsIG5leHQpO1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudEludmFsaWRhdGUpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudEludmFsaWRhdGUgPSBuZXh0Lmluc3RhbmNlLmludmFsaWRhdGUuYmluZChuZXh0Lmluc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpdGVtOiB7IG5leHQ6IG5leHQuY2hpbGRyZW5XcmFwcGVycywgbWV0YTogeyBtZXJnZU5vZGVzOiBuZXh0Lm1lcmdlTm9kZXMgfSB9LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IHsgdHlwZTogJ2F0dGFjaCcsIGluc3RhbmNlLCBhdHRhY2hlZDogdHJ1ZSB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF91cGRhdGVXaWRnZXQoeyBjdXJyZW50LCBuZXh0IH0pIHtcclxuICAgICAgICBjdXJyZW50ID0gKGN1cnJlbnQuaW5zdGFuY2UgJiYgX2luc3RhbmNlVG9XcmFwcGVyTWFwLmdldChjdXJyZW50Lmluc3RhbmNlKSkgfHwgY3VycmVudDtcclxuICAgICAgICBjb25zdCB7IGluc3RhbmNlLCBkb21Ob2RlLCBoYXNBbmltYXRpb25zIH0gPSBjdXJyZW50O1xyXG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaW5zdGFuY2UpO1xyXG4gICAgICAgIG5leHQuaW5zdGFuY2UgPSBpbnN0YW5jZTtcclxuICAgICAgICBuZXh0LmRvbU5vZGUgPSBkb21Ob2RlO1xyXG4gICAgICAgIG5leHQuaGFzQW5pbWF0aW9ucyA9IGhhc0FuaW1hdGlvbnM7XHJcbiAgICAgICAgaW5zdGFuY2VEYXRhLnJlbmRlcmluZyA9IHRydWU7XHJcbiAgICAgICAgaW5zdGFuY2UuX19zZXRQcm9wZXJ0aWVzX18obmV4dC5ub2RlLnByb3BlcnRpZXMsIG5leHQubm9kZS5iaW5kKTtcclxuICAgICAgICBpbnN0YW5jZS5fX3NldENoaWxkcmVuX18obmV4dC5ub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICBfaW5zdGFuY2VUb1dyYXBwZXJNYXAuc2V0KG5leHQuaW5zdGFuY2UsIG5leHQpO1xyXG4gICAgICAgIGlmIChpbnN0YW5jZURhdGEuZGlydHkpIHtcclxuICAgICAgICAgICAgbGV0IHJlbmRlcmVkID0gaW5zdGFuY2UuX19yZW5kZXJfXygpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZURhdGEucmVuZGVyaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChyZW5kZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyZWQgPSBBcnJheS5pc0FycmF5KHJlbmRlcmVkKSA/IHJlbmRlcmVkIDogW3JlbmRlcmVkXTtcclxuICAgICAgICAgICAgICAgIG5leHQuY2hpbGRyZW5XcmFwcGVycyA9IHJlbmRlcmVkVG9XcmFwcGVyKHJlbmRlcmVkLCBuZXh0LCBjdXJyZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbTogeyBjdXJyZW50OiBjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMsIG5leHQ6IG5leHQuY2hpbGRyZW5XcmFwcGVycywgbWV0YToge30gfSxcclxuICAgICAgICAgICAgICAgIHdpZGdldDogeyB0eXBlOiAnYXR0YWNoJywgaW5zdGFuY2UsIGF0dGFjaGVkOiBmYWxzZSB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluc3RhbmNlRGF0YS5yZW5kZXJpbmcgPSBmYWxzZTtcclxuICAgICAgICBuZXh0LmNoaWxkcmVuV3JhcHBlcnMgPSBjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnM7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2lkZ2V0OiB7IHR5cGU6ICdhdHRhY2gnLCBpbnN0YW5jZSwgYXR0YWNoZWQ6IGZhbHNlIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX3JlbW92ZVdpZGdldCh7IGN1cnJlbnQgfSkge1xyXG4gICAgICAgIGN1cnJlbnQgPSBjdXJyZW50Lmluc3RhbmNlID8gX2luc3RhbmNlVG9XcmFwcGVyTWFwLmdldChjdXJyZW50Lmluc3RhbmNlKSA6IGN1cnJlbnQ7XHJcbiAgICAgICAgX3dyYXBwZXJTaWJsaW5nTWFwLmRlbGV0ZShjdXJyZW50KTtcclxuICAgICAgICBfcGFyZW50V3JhcHBlck1hcC5kZWxldGUoY3VycmVudCk7XHJcbiAgICAgICAgX2luc3RhbmNlVG9XcmFwcGVyTWFwLmRlbGV0ZShjdXJyZW50Lmluc3RhbmNlKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBpdGVtOiB7IGN1cnJlbnQ6IGN1cnJlbnQuY2hpbGRyZW5XcmFwcGVycywgbWV0YToge30gfSxcclxuICAgICAgICAgICAgd2lkZ2V0OiB7IHR5cGU6ICdkZXRhY2gnLCBjdXJyZW50IH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX2NyZWF0ZURvbSh7IG5leHQgfSkge1xyXG4gICAgICAgIGxldCBtZXJnZU5vZGVzID0gW107XHJcbiAgICAgICAgaWYgKCFuZXh0LmRvbU5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKG5leHQubm9kZS5kb21Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0LmRvbU5vZGUgPSBuZXh0Lm5vZGUuZG9tTm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXh0Lm5vZGUudGFnID09PSAnc3ZnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQubmFtZXNwYWNlID0gTkFNRVNQQUNFX1NWRztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChuZXh0Lm5vZGUudGFnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQubmFtZXNwYWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQuZG9tTm9kZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmV4dC5uYW1lc3BhY2UsIG5leHQubm9kZS50YWcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dC5kb21Ob2RlID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmV4dC5ub2RlLnRhZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobmV4dC5ub2RlLnRleHQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQuZG9tTm9kZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuZXh0Lm5vZGUudGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5leHQubWVyZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5leHQuZG9tTm9kZSkge1xyXG4gICAgICAgICAgICBpZiAoX21vdW50T3B0aW9ucy5tZXJnZSkge1xyXG4gICAgICAgICAgICAgICAgbWVyZ2VOb2RlcyA9IGFycmF5RnJvbShuZXh0LmRvbU5vZGUuY2hpbGROb2Rlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5leHQubm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgbmV4dC5jaGlsZHJlbldyYXBwZXJzID0gcmVuZGVyZWRUb1dyYXBwZXIobmV4dC5ub2RlLmNoaWxkcmVuLCBuZXh0LCBudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwYXJlbnRXTm9kZVdyYXBwZXIgPSBmaW5kUGFyZW50V05vZGVXcmFwcGVyKG5leHQpO1xyXG4gICAgICAgIGlmIChwYXJlbnRXTm9kZVdyYXBwZXIgJiYgIXBhcmVudFdOb2RlV3JhcHBlci5kb21Ob2RlKSB7XHJcbiAgICAgICAgICAgIHBhcmVudFdOb2RlV3JhcHBlci5kb21Ob2RlID0gbmV4dC5kb21Ob2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkb20gPSB7XHJcbiAgICAgICAgICAgIG5leHQ6IG5leHQsXHJcbiAgICAgICAgICAgIHBhcmVudERvbU5vZGU6IGZpbmRQYXJlbnREb21Ob2RlKG5leHQpLFxyXG4gICAgICAgICAgICB0eXBlOiAnY3JlYXRlJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKG5leHQuY2hpbGRyZW5XcmFwcGVycykge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbTogeyBjdXJyZW50OiBbXSwgbmV4dDogbmV4dC5jaGlsZHJlbldyYXBwZXJzLCBtZXRhOiB7IG1lcmdlTm9kZXMgfSB9LFxyXG4gICAgICAgICAgICAgICAgZG9tXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IGRvbSB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX3VwZGF0ZURvbSh7IGN1cnJlbnQsIG5leHQgfSkge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudERvbU5vZGUgPSBmaW5kUGFyZW50RG9tTm9kZShjdXJyZW50KTtcclxuICAgICAgICBuZXh0LmRvbU5vZGUgPSBjdXJyZW50LmRvbU5vZGU7XHJcbiAgICAgICAgbmV4dC5uYW1lc3BhY2UgPSBjdXJyZW50Lm5hbWVzcGFjZTtcclxuICAgICAgICBpZiAobmV4dC5ub2RlLnRleHQgJiYgbmV4dC5ub2RlLnRleHQgIT09IGN1cnJlbnQubm9kZS50ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRUZXh0Tm9kZSA9IHBhcmVudERvbU5vZGUub3duZXJEb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuZXh0Lm5vZGUudGV4dCk7XHJcbiAgICAgICAgICAgIHBhcmVudERvbU5vZGUucmVwbGFjZUNoaWxkKHVwZGF0ZWRUZXh0Tm9kZSwgbmV4dC5kb21Ob2RlKTtcclxuICAgICAgICAgICAgbmV4dC5kb21Ob2RlID0gdXBkYXRlZFRleHROb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuZXh0Lm5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSByZW5kZXJlZFRvV3JhcHBlcihuZXh0Lm5vZGUuY2hpbGRyZW4sIG5leHQsIGN1cnJlbnQpO1xyXG4gICAgICAgICAgICBuZXh0LmNoaWxkcmVuV3JhcHBlcnMgPSBjaGlsZHJlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXRlbTogeyBjdXJyZW50OiBjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMsIG5leHQ6IG5leHQuY2hpbGRyZW5XcmFwcGVycywgbWV0YToge30gfSxcclxuICAgICAgICAgICAgZG9tOiB7IHR5cGU6ICd1cGRhdGUnLCBuZXh0LCBjdXJyZW50IH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX3JlbW92ZURvbSh7IGN1cnJlbnQgfSkge1xyXG4gICAgICAgIF93cmFwcGVyU2libGluZ01hcC5kZWxldGUoY3VycmVudCk7XHJcbiAgICAgICAgX3BhcmVudFdyYXBwZXJNYXAuZGVsZXRlKGN1cnJlbnQpO1xyXG4gICAgICAgIGN1cnJlbnQubm9kZS5iaW5kID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmIChjdXJyZW50Lmhhc0FuaW1hdGlvbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW06IHsgY3VycmVudDogY3VycmVudC5jaGlsZHJlbldyYXBwZXJzLCBtZXRhOiB7fSB9LFxyXG4gICAgICAgICAgICAgICAgZG9tOiB7IHR5cGU6ICdkZWxldGUnLCBjdXJyZW50IH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuY2hpbGRyZW5XcmFwcGVycykge1xyXG4gICAgICAgICAgICBfYWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgd3JhcHBlcnMgPSBjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMgfHwgW107XHJcbiAgICAgICAgICAgICAgICBsZXQgd3JhcHBlcjtcclxuICAgICAgICAgICAgICAgIHdoaWxlICgod3JhcHBlciA9IHdyYXBwZXJzLnBvcCgpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3cmFwcGVyLmNoaWxkcmVuV3JhcHBlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcHBlcnMucHVzaCguLi53cmFwcGVyLmNoaWxkcmVuV3JhcHBlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLmNoaWxkcmVuV3JhcHBlcnMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1dOb2RlV3JhcHBlcih3cmFwcGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod3JhcHBlci5pbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2luc3RhbmNlVG9XcmFwcGVyTWFwLmRlbGV0ZSh3cmFwcGVyLmluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldCh3cmFwcGVyLmluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlRGF0YSAmJiBpbnN0YW5jZURhdGEub25EZXRhY2goKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLmluc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBfd3JhcHBlclNpYmxpbmdNYXAuZGVsZXRlKHdyYXBwZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9wYXJlbnRXcmFwcGVyTWFwLmRlbGV0ZSh3cmFwcGVyKTtcclxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLmRvbU5vZGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5ub2RlLmJpbmQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBkb206IHsgdHlwZTogJ2RlbGV0ZScsIGN1cnJlbnQgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vdW50LFxyXG4gICAgICAgIGludmFsaWRhdGVcclxuICAgIH07XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgcmVuZGVyZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZkb20ubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS92ZG9tLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL3Zkb20ubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguY3NzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby90aGVtZXMvZG9qby9pbmRleC5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiIWZ1bmN0aW9uKF8sbyl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9bygpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW10sbyk6XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHM/ZXhwb3J0cy5kb2pvPW8oKTpfLmRvam89bygpfSh0aGlzLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKF8pe3ZhciBvPXt9O2Z1bmN0aW9uIGUodCl7aWYob1t0XSlyZXR1cm4gb1t0XS5leHBvcnRzO3ZhciBpPW9bdF09e2k6dCxsOiExLGV4cG9ydHM6e319O3JldHVybiBfW3RdLmNhbGwoaS5leHBvcnRzLGksaS5leHBvcnRzLGUpLGkubD0hMCxpLmV4cG9ydHN9cmV0dXJuIGUubT1fLGUuYz1vLGUuZD1mdW5jdGlvbihfLG8sdCl7ZS5vKF8sbyl8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfLG8se2NvbmZpZ3VyYWJsZTohMSxlbnVtZXJhYmxlOiEwLGdldDp0fSl9LGUubj1mdW5jdGlvbihfKXt2YXIgbz1fJiZfLl9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gXy5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiBffTtyZXR1cm4gZS5kKG8sXCJhXCIsbyksb30sZS5vPWZ1bmN0aW9uKF8sbyl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChfLG8pfSxlLnA9XCJcIixlKGUucz0wKX0oW2Z1bmN0aW9uKF8sbyxlKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkobyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgdD1lKDEpLGk9ZSgyKSxuPWUoMykscj1lKDQpLGQ9ZSg1KSxhPWUoNiksbD1lKDcpLGM9ZSg4KSxtPWUoOSkscz1lKDEwKSxwPWUoMTEpLHU9ZSgxMiksYj1lKDEzKSxnPWUoMTQpLGg9ZSgxNSkseD1lKDE2KSxmPWUoMTcpLHk9ZSgxOCksaz1lKDE5KSxqPWUoMjApLHc9ZSgyMSksST1lKDIyKSx2PWUoMjMpLFQ9ZSgyNCksUj1lKDI1KSxCPWUoMjYpLEw9ZSgyNyksRj1lKDI4KSxXPWUoMjkpLEE9ZSgzMCk7by5kZWZhdWx0PXtcIkBkb2pvL3dpZGdldHMvYWNjb3JkaW9uLXBhbmVcIjp0LFwiQGRvam8vd2lkZ2V0cy9idXR0b25cIjppLFwiQGRvam8vd2lkZ2V0cy9jYWxlbmRhclwiOm4sXCJAZG9qby93aWRnZXRzL2NoZWNrYm94XCI6cixcIkBkb2pvL3dpZGdldHMvY29tYm9ib3hcIjpkLFwiQGRvam8vd2lkZ2V0cy9kaWFsb2dcIjphLFwiQGRvam8vd2lkZ2V0cy9pY29uXCI6bCxcIkBkb2pvL3dpZGdldHMvZ3JpZFwiOmMsXCJAZG9qby93aWRnZXRzL2dyaWQtYm9keVwiOm0sXCJAZG9qby93aWRnZXRzL2dyaWQtY2VsbFwiOnMsXCJAZG9qby93aWRnZXRzL2dyaWQtZm9vdGVyXCI6cCxcIkBkb2pvL3dpZGdldHMvZ3JpZC1oZWFkZXJcIjp1LFwiQGRvam8vd2lkZ2V0cy9ncmlkLXBsYWNlaG9sZGVyLXJvd1wiOmIsXCJAZG9qby93aWRnZXRzL2dyaWQtcm93XCI6ZyxcIkBkb2pvL3dpZGdldHMvbGFiZWxcIjpoLFwiQGRvam8vd2lkZ2V0cy9saXN0Ym94XCI6eCxcIkBkb2pvL3dpZGdldHMvcHJvZ3Jlc3NcIjpmLFwiQGRvam8vd2lkZ2V0cy9yYWRpb1wiOnksXCJAZG9qby93aWRnZXRzL3NlbGVjdFwiOmssXCJAZG9qby93aWRnZXRzL3NsaWRlLXBhbmVcIjpqLFwiQGRvam8vd2lkZ2V0cy9zbGlkZXJcIjp3LFwiQGRvam8vd2lkZ2V0cy9zcGxpdC1wYW5lXCI6SSxcIkBkb2pvL3dpZGdldHMvdGFiLWNvbnRyb2xsZXJcIjp2LFwiQGRvam8vd2lkZ2V0cy90ZXh0LWFyZWFcIjpULFwiQGRvam8vd2lkZ2V0cy90ZXh0LWlucHV0XCI6UixcIkBkb2pvL3dpZGdldHMvZW5oYW5jZWQtdGV4dC1pbnB1dFwiOkIsXCJAZG9qby93aWRnZXRzL3RpbWUtcGlja2VyXCI6TCxcIkBkb2pvL3dpZGdldHMvdGl0bGUtcGFuZVwiOkYsXCJAZG9qby93aWRnZXRzL3Rvb2xiYXJcIjpXLFwiQGRvam8vd2lkZ2V0cy90b29sdGlwXCI6QX19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvYWNjb3JkaW9uLXBhbmVcIixyb290OlwiYWNjb3JkaW9uLXBhbmUtbV9fcm9vdF9fM3BwQ1dcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvYnV0dG9uXCIscm9vdDpcImJ1dHRvbi1tX19yb290X18xTVZ1T1wiLGFkZG9uOlwiYnV0dG9uLW1fX2FkZG9uX19kMGxxYlwiLHByZXNzZWQ6XCJidXR0b24tbV9fcHJlc3NlZF9fc0VLOFFcIixwb3B1cDpcImJ1dHRvbi1tX19wb3B1cF9faXR3YWdcIixkaXNhYmxlZDpcImJ1dHRvbi1tX19kaXNhYmxlZF9fR1dZWmhcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvY2FsZW5kYXJcIixyb290OlwiY2FsZW5kYXItbV9fcm9vdF9fMkVpWThcIixkYXRlR3JpZDpcImNhbGVuZGFyLW1fX2RhdGVHcmlkX18xUVlGTFwiLHdlZWtkYXk6XCJjYWxlbmRhci1tX193ZWVrZGF5X19lYzFKQVwiLGRhdGU6XCJjYWxlbmRhci1tX19kYXRlX18yQjFQUFwiLHRvZGF5RGF0ZTpcImNhbGVuZGFyLW1fX3RvZGF5RGF0ZV9fM2hmbDhcIixpbmFjdGl2ZURhdGU6XCJjYWxlbmRhci1tX19pbmFjdGl2ZURhdGVfXzJtdlNuXCIsc2VsZWN0ZWREYXRlOlwiY2FsZW5kYXItbV9fc2VsZWN0ZWREYXRlX18yQzl3UFwiLHRvcE1hdHRlcjpcImNhbGVuZGFyLW1fX3RvcE1hdHRlcl9fMU05aVFcIixtb250aFRyaWdnZXI6XCJjYWxlbmRhci1tX19tb250aFRyaWdnZXJfX2JvZ0oxXCIseWVhclRyaWdnZXI6XCJjYWxlbmRhci1tX195ZWFyVHJpZ2dlcl9fM0lIVDhcIixwcmV2aW91czpcImNhbGVuZGFyLW1fX3ByZXZpb3VzX18yRk5Ha1wiLG5leHQ6XCJjYWxlbmRhci1tX19uZXh0X18yYlhsY1wiLG1vbnRoVHJpZ2dlckFjdGl2ZTpcImNhbGVuZGFyLW1fX21vbnRoVHJpZ2dlckFjdGl2ZV9fMzNQZnNcIix5ZWFyVHJpZ2dlckFjdGl2ZTpcImNhbGVuZGFyLW1fX3llYXJUcmlnZ2VyQWN0aXZlX18xRWc4ZVwiLG1vbnRoR3JpZDpcImNhbGVuZGFyLW1fX21vbnRoR3JpZF9fLTFoQjFcIix5ZWFyR3JpZDpcImNhbGVuZGFyLW1fX3llYXJHcmlkX18zWW55Q1wiLG1vbnRoRmllbGRzOlwiY2FsZW5kYXItbV9fbW9udGhGaWVsZHNfX3BCYndWXCIseWVhckZpZWxkczpcImNhbGVuZGFyLW1fX3llYXJGaWVsZHNfX0dNWC04XCIsbW9udGhSYWRpbzpcImNhbGVuZGFyLW1fX21vbnRoUmFkaW9fXzNaMkZtXCIseWVhclJhZGlvOlwiY2FsZW5kYXItbV9feWVhclJhZGlvX18xWFQ2b1wiLG1vbnRoUmFkaW9MYWJlbDpcImNhbGVuZGFyLW1fX21vbnRoUmFkaW9MYWJlbF9fM0syUndcIix5ZWFyUmFkaW9MYWJlbDpcImNhbGVuZGFyLW1fX3llYXJSYWRpb0xhYmVsX18yWGphcFwiLG1vbnRoUmFkaW9DaGVja2VkOlwiY2FsZW5kYXItbV9fbW9udGhSYWRpb0NoZWNrZWRfXzJ1VGJSXCIseWVhclJhZGlvQ2hlY2tlZDpcImNhbGVuZGFyLW1fX3llYXJSYWRpb0NoZWNrZWRfXzI0a253XCIsbW9udGhSYWRpb0lucHV0OlwiY2FsZW5kYXItbV9fbW9udGhSYWRpb0lucHV0X19ZaU10bFwiLHllYXJSYWRpb0lucHV0OlwiY2FsZW5kYXItbV9feWVhclJhZGlvSW5wdXRfX0tLc295XCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2NoZWNrYm94XCIscm9vdDpcImNoZWNrYm94LW1fX3Jvb3RfXzFuSGl0XCIsaW5wdXQ6XCJjaGVja2JveC1tX19pbnB1dF9fMmF0ZDBcIixpbnB1dFdyYXBwZXI6XCJjaGVja2JveC1tX19pbnB1dFdyYXBwZXJfXzFzSmlsIGljb24tbV9fY2hlY2tJY29uX18yb2tIciBpY29uLW1fX2ljb25fXzI2VXNOXCIsY2hlY2tlZDpcImNoZWNrYm94LW1fX2NoZWNrZWRfXzJwSUtSXCIsdG9nZ2xlOlwiY2hlY2tib3gtbV9fdG9nZ2xlX18zZGNoTlwiLHRvZ2dsZVN3aXRjaDpcImNoZWNrYm94LW1fX3RvZ2dsZVN3aXRjaF9fMXZIbVlcIixvbkxhYmVsOlwiY2hlY2tib3gtbV9fb25MYWJlbF9fMVNIVElcIixvZmZMYWJlbDpcImNoZWNrYm94LW1fX29mZkxhYmVsX18yM0E2Z1wiLGZvY3VzZWQ6XCJjaGVja2JveC1tX19mb2N1c2VkX18yWFgxdVwiLGRpc2FibGVkOlwiY2hlY2tib3gtbV9fZGlzYWJsZWRfXzVWVzVYXCIscmVhZG9ubHk6XCJjaGVja2JveC1tX19yZWFkb25seV9fM0FQUzBcIixpbnZhbGlkOlwiY2hlY2tib3gtbV9faW52YWxpZF9fM19zTXFcIix2YWxpZDpcImNoZWNrYm94LW1fX3ZhbGlkX18zU2lFYlwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9jb21ib2JveFwiLHJvb3Q6XCJjb21ib2JveC1tX19yb290X18xcDVGTFwiLGNsZWFyYWJsZTpcImNvbWJvYm94LW1fX2NsZWFyYWJsZV9fMTNtMmlcIix0cmlnZ2VyOlwiY29tYm9ib3gtbV9fdHJpZ2dlcl9fM1JVNDJcIixkcm9wZG93bjpcImNvbWJvYm94LW1fX2Ryb3Bkb3duX18zUzFEelwiLG9wZW46XCJjb21ib2JveC1tX19vcGVuX18xX3FKMVwiLG9wdGlvbjpcImNvbWJvYm94LW1fX29wdGlvbl9fMlRGalRcIixzZWxlY3RlZDpcImNvbWJvYm94LW1fX3NlbGVjdGVkX18yWGlqMVwiLGludmFsaWQ6XCJjb21ib2JveC1tX19pbnZhbGlkX18yX01BZlwiLHZhbGlkOlwiY29tYm9ib3gtbV9fdmFsaWRfXzNoWWpwXCIsY2xlYXI6XCJjb21ib2JveC1tX19jbGVhcl9fMl94dFNcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvZGlhbG9nXCIscm9vdDpcImRpYWxvZy1tX19yb290X19jTWxhMFwiLG1haW46XCJkaWFsb2ctbV9fbWFpbl9fM0t2TUJcIix1bmRlcmxheVZpc2libGU6XCJkaWFsb2ctbV9fdW5kZXJsYXlWaXNpYmxlX18xVWtoclwiLHRpdGxlOlwiZGlhbG9nLW1fX3RpdGxlX18zZ2dSSVwiLGNvbnRlbnQ6XCJkaWFsb2ctbV9fY29udGVudF9fMkU4MEZcIixjbG9zZTpcImRpYWxvZy1tX19jbG9zZV9fMzZhT1NcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvaWNvblwiLGljb246XCJpY29uLW1fX2ljb25fXzI2VXNOXCIscGx1c0ljb246XCJpY29uLW1fX3BsdXNJY29uX18yd3VsN1wiLG1pbnVzSWNvbjpcImljb24tbV9fbWludXNJY29uX18yNDFWVVwiLGNoZWNrSWNvbjpcImljb24tbV9fY2hlY2tJY29uX18yb2tIclwiLGNsb3NlSWNvbjpcImljb24tbV9fY2xvc2VJY29uX18yUUJMMlwiLGxlZnRJY29uOlwiaWNvbi1tX19sZWZ0SWNvbl9fWjhrWXlcIixyaWdodEljb246XCJpY29uLW1fX3JpZ2h0SWNvbl9fM25udWFcIix1cEljb246XCJpY29uLW1fX3VwSWNvbl9fVnNpOVpcIixkb3duSWNvbjpcImljb24tbV9fZG93bkljb25fXzM2T3ZMXCIsdXBBbHRJY29uOlwiaWNvbi1tX191cEFsdEljb25fXzF4R1RtXCIsZG93bkFsdEljb246XCJpY29uLW1fX2Rvd25BbHRJY29uX19DU0JNdlwiLHNlYXJjaEljb246XCJpY29uLW1fX3NlYXJjaEljb25fXzdzYzQ2XCIsYmFyc0ljb246XCJpY29uLW1fX2JhcnNJY29uX18zNklrZVwiLHNldHRpbmdzSWNvbjpcImljb24tbV9fc2V0dGluZ3NJY29uX18xdUZ6clwiLGFsZXJ0SWNvbjpcImljb24tbV9fYWxlcnRJY29uX18xMjNQQlwiLGhlbHBJY29uOlwiaWNvbi1tX19oZWxwSWNvbl9fM2dPWnZcIixpbmZvSWNvbjpcImljb24tbV9faW5mb0ljb25fXzI3Y2M3XCIscGhvbmVJY29uOlwiaWNvbi1tX19waG9uZUljb25fXzNtVmVwXCIsZWRpdEljb246XCJpY29uLW1fX2VkaXRJY29uX18yQm9FTlwiLGRhdGVJY29uOlwiaWNvbi1tX19kYXRlSWNvbl9fM00tUHdcIixsaW5rSWNvbjpcImljb24tbV9fbGlua0ljb25fXzNjeTVLXCIsbG9jYXRpb25JY29uOlwiaWNvbi1tX19sb2NhdGlvbkljb25fXzFOYzNaXCIsc2VjdXJlSWNvbjpcImljb24tbV9fc2VjdXJlSWNvbl9fMkM4QUZcIixtYWlsSWNvbjpcImljb24tbV9fbWFpbEljb25fX2pzZlhSXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2dyaWRcIixyb290OlwiZ3JpZC1tX19yb290X18yb2NHSVwiLGhlYWRlcjpcImdyaWQtbV9faGVhZGVyX18yTi1JLVwiLGZpbHRlckdyb3VwOlwiZ3JpZC1tX19maWx0ZXJHcm91cF9fMUQzRE9cIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvZ3JpZC1ib2R5XCIscm9vdDpcImdyaWQtYm9keS1tX19yb290X190bmNGZVwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9ncmlkLWNlbGxcIixyb290OlwiZ3JpZC1jZWxsLW1fX3Jvb3RfXzJFdmp2XCIsaW5wdXQ6XCJncmlkLWNlbGwtbV9faW5wdXRfXzJ1d3FzXCIsZWRpdDpcImdyaWQtY2VsbC1tX19lZGl0X18zZHg4dVwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9ncmlkLWZvb3RlclwiLHJvb3Q6XCJncmlkLWZvb3Rlci1tX19yb290X18zSXZtcVwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9ncmlkLWhlYWRlclwiLHJvb3Q6XCJncmlkLWhlYWRlci1tX19yb290X19ISVJvUVwiLGNlbGw6XCJncmlkLWhlYWRlci1tX19jZWxsX18yS1pJZ1wiLHNvcnRhYmxlOlwiZ3JpZC1oZWFkZXItbV9fc29ydGFibGVfXzJFbllyXCIsc29ydGVkOlwiZ3JpZC1oZWFkZXItbV9fc29ydGVkX18zdXd2TlwiLHNvcnQ6XCJncmlkLWhlYWRlci1tX19zb3J0X18ySzhWcFwiLGZpbHRlcjpcImdyaWQtaGVhZGVyLW1fX2ZpbHRlcl9fMV9kUHZcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvZ3JpZC1wbGFjZWhvbGRlci1yb3dcIixyb290OlwiZ3JpZC1wbGFjZWhvbGRlci1yb3ctbV9fcm9vdF9fMnl1bFAgZ3JpZC1yb3ctbV9fcm9vdF9fbXE3TlRcIixsb2FkaW5nOlwiZ3JpZC1wbGFjZWhvbGRlci1yb3ctbV9fbG9hZGluZ19fMkRSVDVcIixzcGluOlwiZ3JpZC1wbGFjZWhvbGRlci1yb3ctbV9fc3Bpbl9fMklGUy1cIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvZ3JpZC1yb3dcIixyb290OlwiZ3JpZC1yb3ctbV9fcm9vdF9fbXE3TlRcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvbGFiZWxcIixyb290OlwibGFiZWwtbV9fcm9vdF9fM1UtRUtcIixzZWNvbmRhcnk6XCJsYWJlbC1tX19zZWNvbmRhcnlfXzFCM1RJXCIscmVxdWlyZWQ6XCJsYWJlbC1tX19yZXF1aXJlZF9fMVFsNHlcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvbGlzdGJveFwiLHJvb3Q6XCJsaXN0Ym94LW1fX3Jvb3RfXzM1WllBXCIsb3B0aW9uOlwibGlzdGJveC1tX19vcHRpb25fXzFJVjEzXCIsZm9jdXNlZDpcImxpc3Rib3gtbV9fZm9jdXNlZF9fMjc3SFBcIixhY3RpdmVPcHRpb246XCJsaXN0Ym94LW1fX2FjdGl2ZU9wdGlvbl9fMTEwSGRcIixkaXNhYmxlZE9wdGlvbjpcImxpc3Rib3gtbV9fZGlzYWJsZWRPcHRpb25fXzFOVFJFXCIsc2VsZWN0ZWRPcHRpb246XCJsaXN0Ym94LW1fX3NlbGVjdGVkT3B0aW9uX18xeEZjSSBpY29uLW1fX2NoZWNrSWNvbl9fMm9rSHJcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvcHJvZ3Jlc3NcIixvdXRwdXQ6XCJwcm9ncmVzcy1tX19vdXRwdXRfX214VG1IXCIsYmFyOlwicHJvZ3Jlc3MtbV9fYmFyX194Wm53TlwiLHByb2dyZXNzOlwicHJvZ3Jlc3MtbV9fcHJvZ3Jlc3NfXzM2a19ZXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3JhZGlvXCIscm9vdDpcInJhZGlvLW1fX3Jvb3RfX2xzZnB6XCIsaW5wdXQ6XCJyYWRpby1tX19pbnB1dF9fMmZVVGFcIixpbnB1dFdyYXBwZXI6XCJyYWRpby1tX19pbnB1dFdyYXBwZXJfXzNNUWo2XCIsZm9jdXNlZDpcInJhZGlvLW1fX2ZvY3VzZWRfXzFvYmw0XCIsY2hlY2tlZDpcInJhZGlvLW1fX2NoZWNrZWRfXzNiQ1FtXCIsZGlzYWJsZWQ6XCJyYWRpby1tX19kaXNhYmxlZF9fMTUyUHhcIixyZWFkb25seTpcInJhZGlvLW1fX3JlYWRvbmx5X18zcy0wMFwiLHJlcXVpcmVkOlwicmFkaW8tbV9fcmVxdWlyZWRfXzFlTGxuXCIsaW52YWxpZDpcInJhZGlvLW1fX2ludmFsaWRfXzFET1hWXCIsdmFsaWQ6XCJyYWRpby1tX192YWxpZF9fM0hlMXRcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvc2VsZWN0XCIscm9vdDpcInNlbGVjdC1tX19yb290X18xY3NhUlwiLGlucHV0V3JhcHBlcjpcInNlbGVjdC1tX19pbnB1dFdyYXBwZXJfXzFDM1R5XCIsdHJpZ2dlcjpcInNlbGVjdC1tX190cmlnZ2VyX19YQVNvZVwiLHBsYWNlaG9sZGVyOlwic2VsZWN0LW1fX3BsYWNlaG9sZGVyX18xUG1pWVwiLGFycm93Olwic2VsZWN0LW1fX2Fycm93X18xT28zalwiLGRyb3Bkb3duOlwic2VsZWN0LW1fX2Ryb3Bkb3duX18zbFRudlwiLG9wZW46XCJzZWxlY3QtbV9fb3Blbl9fMUxvakVcIixpbnB1dDpcInNlbGVjdC1tX19pbnB1dF9fM29NU1hcIixkaXNhYmxlZDpcInNlbGVjdC1tX19kaXNhYmxlZF9fMlN0RDRcIixyZWFkb25seTpcInNlbGVjdC1tX19yZWFkb25seV9fMXdfQkxcIixpbnZhbGlkOlwic2VsZWN0LW1fX2ludmFsaWRfX1NYejhvXCIsdmFsaWQ6XCJzZWxlY3QtbV9fdmFsaWRfXzMtU05YXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3NsaWRlLXBhbmVcIixyb290Olwic2xpZGUtcGFuZS1tX19yb290X18zYnp0ZVwiLHVuZGVybGF5VmlzaWJsZTpcInNsaWRlLXBhbmUtbV9fdW5kZXJsYXlWaXNpYmxlX19Gdm9lTFwiLHBhbmU6XCJzbGlkZS1wYW5lLW1fX3BhbmVfXzEtVlEzXCIsY29udGVudDpcInNsaWRlLXBhbmUtbV9fY29udGVudF9fMU5oV0tcIix0aXRsZTpcInNsaWRlLXBhbmUtbV9fdGl0bGVfXzNNckJSXCIsY2xvc2U6XCJzbGlkZS1wYW5lLW1fX2Nsb3NlX18yNzAzZFwiLGxlZnQ6XCJzbGlkZS1wYW5lLW1fX2xlZnRfXzFwUTdWXCIscmlnaHQ6XCJzbGlkZS1wYW5lLW1fX3JpZ2h0X19ZQlhCSVwiLHRvcDpcInNsaWRlLXBhbmUtbV9fdG9wX18yYjduNlwiLGJvdHRvbTpcInNsaWRlLXBhbmUtbV9fYm90dG9tX18zMkxNYVwiLHNsaWRlSW46XCJzbGlkZS1wYW5lLW1fX3NsaWRlSW5fXzE1a04wXCIsc2xpZGVPdXQ6XCJzbGlkZS1wYW5lLW1fX3NsaWRlT3V0X18ybTFFOVwiLG9wZW46XCJzbGlkZS1wYW5lLW1fX29wZW5fXzJ2RU5QXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3NsaWRlclwiLHJvb3Q6XCJzbGlkZXItbV9fcm9vdF9fMXM0THFcIixpbnB1dFdyYXBwZXI6XCJzbGlkZXItbV9faW5wdXRXcmFwcGVyX18xVjQxV1wiLHRyYWNrOlwic2xpZGVyLW1fX3RyYWNrX18yeVpXUlwiLGZpbGw6XCJzbGlkZXItbV9fZmlsbF9fM2NEM3NcIix0aHVtYjpcInNsaWRlci1tX190aHVtYl9fMnhTSHJcIixpbnB1dDpcInNsaWRlci1tX19pbnB1dF9fMWhHRnNcIixvdXRwdXRUb29sdGlwOlwic2xpZGVyLW1fX291dHB1dFRvb2x0aXBfXzJJRUZmXCIsb3V0cHV0Olwic2xpZGVyLW1fX291dHB1dF9faWdMNVRcIix2ZXJ0aWNhbDpcInNsaWRlci1tX192ZXJ0aWNhbF9fMms1LTJcIixkaXNhYmxlZDpcInNsaWRlci1tX19kaXNhYmxlZF9fMUsxWHJcIixyZWFkb25seTpcInNsaWRlci1tX19yZWFkb25seV9fM2tyMGxcIixpbnZhbGlkOlwic2xpZGVyLW1fX2ludmFsaWRfXzF0bDVDXCIsdmFsaWQ6XCJzbGlkZXItbV9fdmFsaWRfXzIxYkc2XCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3NwbGl0LXBhbmVcIixyb290Olwic3BsaXQtcGFuZS1tX19yb290X18yMTA3U1wiLGRpdmlkZXI6XCJzcGxpdC1wYW5lLW1fX2RpdmlkZXJfXzEyclpsXCIscm93Olwic3BsaXQtcGFuZS1tX19yb3dfXzNsVjFwXCIsY29sdW1uOlwic3BsaXQtcGFuZS1tX19jb2x1bW5fX1FpZVdOXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3RhYi1jb250cm9sbGVyXCIscm9vdDpcInRhYi1jb250cm9sbGVyLW1fX3Jvb3RfXzFxaWVGXCIsdGFiQnV0dG9uczpcInRhYi1jb250cm9sbGVyLW1fX3RhYkJ1dHRvbnNfXzFxRzNtXCIsdGFiQnV0dG9uOlwidGFiLWNvbnRyb2xsZXItbV9fdGFiQnV0dG9uX18zTWVDM1wiLGRpc2FibGVkVGFiQnV0dG9uOlwidGFiLWNvbnRyb2xsZXItbV9fZGlzYWJsZWRUYWJCdXR0b25fX2xiQkVtXCIsYWN0aXZlVGFiQnV0dG9uOlwidGFiLWNvbnRyb2xsZXItbV9fYWN0aXZlVGFiQnV0dG9uX18xSFRLcFwiLGNsb3NlOlwidGFiLWNvbnRyb2xsZXItbV9fY2xvc2VfXzNsd0drXCIsY2xvc2VhYmxlOlwidGFiLWNvbnRyb2xsZXItbV9fY2xvc2VhYmxlX18yRklFVFwiLHRhYjpcInRhYi1jb250cm9sbGVyLW1fX3RhYl9fM0MtMDVcIixhbGlnbkxlZnQ6XCJ0YWItY29udHJvbGxlci1tX19hbGlnbkxlZnRfXzJGRFJLXCIsdGFiczpcInRhYi1jb250cm9sbGVyLW1fX3RhYnNfXzFRQnFnXCIsYWxpZ25SaWdodDpcInRhYi1jb250cm9sbGVyLW1fX2FsaWduUmlnaHRfXzFuUVBnXCIsYWxpZ25Cb3R0b206XCJ0YWItY29udHJvbGxlci1tX19hbGlnbkJvdHRvbV9fb1N3TFRcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvdGV4dC1hcmVhXCIscm9vdDpcInRleHQtYXJlYS1tX19yb290X18xUnl2S1wiLGlucHV0OlwidGV4dC1hcmVhLW1fX2lucHV0X19TRWVuVlwiLGRpc2FibGVkOlwidGV4dC1hcmVhLW1fX2Rpc2FibGVkX18zdGU2c1wiLHJlYWRvbmx5OlwidGV4dC1hcmVhLW1fX3JlYWRvbmx5X19ZZkFoYVwiLGludmFsaWQ6XCJ0ZXh0LWFyZWEtbV9faW52YWxpZF9fMks0RXlcIix2YWxpZDpcInRleHQtYXJlYS1tX192YWxpZF9fMjQzemFcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvdGV4dC1pbnB1dFwiLHJvb3Q6XCJ0ZXh0LWlucHV0LW1fX3Jvb3RfXzJDaUNUXCIsaW5wdXQ6XCJ0ZXh0LWlucHV0LW1fX2lucHV0X18zdVFpaFwiLGlucHV0V3JhcHBlcjpcInRleHQtaW5wdXQtbV9faW5wdXRXcmFwcGVyX18xaXRGY1wiLGRpc2FibGVkOlwidGV4dC1pbnB1dC1tX19kaXNhYmxlZF9fM1dSMVVcIixyZWFkb25seTpcInRleHQtaW5wdXQtbV9fcmVhZG9ubHlfXzFzbkRJXCIsaW52YWxpZDpcInRleHQtaW5wdXQtbV9faW52YWxpZF9fM3gySmNcIix2YWxpZDpcInRleHQtaW5wdXQtbV9fdmFsaWRfX0wta3R3XCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2VuaGFuY2VkLXRleHQtaW5wdXRcIixhZGRvbjpcImVuaGFuY2VkLXRleHQtaW5wdXQtbV9fYWRkb25fXzNrRTNaXCIsYWRkb25BZnRlcjpcImVuaGFuY2VkLXRleHQtaW5wdXQtbV9fYWRkb25BZnRlcl9fM3llNVZcIixhZGRvbkJlZm9yZTpcImVuaGFuY2VkLXRleHQtaW5wdXQtbV9fYWRkb25CZWZvcmVfXzI0d0ZKXCIsaW5wdXQ6XCJlbmhhbmNlZC10ZXh0LWlucHV0LW1fX2lucHV0X18yWUo4RSB0ZXh0LWlucHV0LW1fX2lucHV0X18zdVFpaFwiLGlucHV0V3JhcHBlcjpcImVuaGFuY2VkLXRleHQtaW5wdXQtbV9faW5wdXRXcmFwcGVyX18ycHl3OSB0ZXh0LWlucHV0LW1fX2lucHV0V3JhcHBlcl9fMWl0RmNcIixmb2N1c2VkOlwiZW5oYW5jZWQtdGV4dC1pbnB1dC1tX19mb2N1c2VkX18xQkt1Y1wifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy90aW1lLXBpY2tlclwiLHJvb3Q6XCJ0aW1lLXBpY2tlci1tX19yb290X18zeGE5TFwiLGlucHV0OlwidGltZS1waWNrZXItbV9faW5wdXRfXzFBNkx6XCIsZGlzYWJsZWQ6XCJ0aW1lLXBpY2tlci1tX19kaXNhYmxlZF9fMjFjcWtcIixyZWFkb25seTpcInRpbWUtcGlja2VyLW1fX3JlYWRvbmx5X18zaEdhZlwiLGludmFsaWQ6XCJ0aW1lLXBpY2tlci1tX19pbnZhbGlkX18yNEdVX1wiLHZhbGlkOlwidGltZS1waWNrZXItbV9fdmFsaWRfX0NJZTlSXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3RpdGxlLXBhbmVcIixyb290OlwidGl0bGUtcGFuZS1tX19yb290X18yWkZOQ1wiLHRpdGxlQnV0dG9uOlwidGl0bGUtcGFuZS1tX190aXRsZUJ1dHRvbl9fMl9iclRcIixjb250ZW50OlwidGl0bGUtcGFuZS1tX19jb250ZW50X18zWm5aN1wiLGNvbnRlbnRUcmFuc2l0aW9uOlwidGl0bGUtcGFuZS1tX19jb250ZW50VHJhbnNpdGlvbl9fMmtqSGVcIixvcGVuOlwidGl0bGUtcGFuZS1tX19vcGVuX19sN0RMdVwiLGFycm93OlwidGl0bGUtcGFuZS1tX19hcnJvd19fMURPcWRcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvdG9vbGJhclwiLHJvb3Q6XCJ0b29sYmFyLW1fX3Jvb3RfXzJXOUFWXCIsdGl0bGU6XCJ0b29sYmFyLW1fX3RpdGxlX18ycnFtTlwiLG1lbnVCdXR0b246XCJ0b29sYmFyLW1fX21lbnVCdXR0b25fXzN5T0cxXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3Rvb2x0aXBcIixyb290OlwidG9vbHRpcC1tX19yb290X18yVHNmNFwiLGNvbnRlbnQ6XCJ0b29sdGlwLW1fX2NvbnRlbnRfXzNKUk5CXCIsYm90dG9tOlwidG9vbHRpcC1tX19ib3R0b21fXzMtYi1sXCIsdG9wOlwidG9vbHRpcC1tX190b3BfXzFzQURMXCIsbGVmdDpcInRvb2x0aXAtbV9fbGVmdF9fX0xkMXNcIixyaWdodDpcInRvb2x0aXAtbV9fcmlnaHRfXzMyNGg1XCJ9fV0pfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby90aGVtZXMvZG9qby9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZVxyXG52YXIgaGFzID0gcmVxdWlyZSgnQGRvam8vZnJhbWV3b3JrL2hhcy9oYXMnKTtcclxuaWYgKCFoYXMuZXhpc3RzKCdidWlsZC10aW1lLXJlbmRlcicpKSB7XHJcbiAgICBoYXMuYWRkKCdidWlsZC10aW1lLXJlbmRlcicsIGZhbHNlLCBmYWxzZSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGFzQnVpbGRUaW1lUmVuZGVyLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9idWlsZC10aW1lLXJlbmRlci9oYXNCdWlsZFRpbWVSZW5kZXIuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9idWlsZC10aW1lLXJlbmRlci9oYXNCdWlsZFRpbWVSZW5kZXIuanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlXHJcbnRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXHJcbkxpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcblxyXG5USElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXHJcbktJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcclxuV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIFRJVExFLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSxcclxuTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC5cclxuXHJcblNlZSB0aGUgQXBhY2hlIFZlcnNpb24gMi4wIExpY2Vuc2UgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9uc1xyXG5hbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIGlmIChlLmluZGV4T2YocFtpXSkgPCAwKVxyXG4gICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHJlc3VsdC52YWx1ZSk7IH0pLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0geVtvcFswXSAmIDIgPyBcInJldHVyblwiIDogb3BbMF0gPyBcInRocm93XCIgOiBcIm5leHRcIl0pICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gWzAsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl0sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7ICB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpZiAob1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyBDb3B5cmlnaHQgMjAxNCBHb29nbGUgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyAgICAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyAgICAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiFmdW5jdGlvbihhLGIpe3ZhciBjPXt9LGQ9e30sZT17fTshZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe2lmKFwibnVtYmVyXCI9PXR5cGVvZiBhKXJldHVybiBhO3ZhciBiPXt9O2Zvcih2YXIgYyBpbiBhKWJbY109YVtjXTtyZXR1cm4gYn1mdW5jdGlvbiBkKCl7dGhpcy5fZGVsYXk9MCx0aGlzLl9lbmREZWxheT0wLHRoaXMuX2ZpbGw9XCJub25lXCIsdGhpcy5faXRlcmF0aW9uU3RhcnQ9MCx0aGlzLl9pdGVyYXRpb25zPTEsdGhpcy5fZHVyYXRpb249MCx0aGlzLl9wbGF5YmFja1JhdGU9MSx0aGlzLl9kaXJlY3Rpb249XCJub3JtYWxcIix0aGlzLl9lYXNpbmc9XCJsaW5lYXJcIix0aGlzLl9lYXNpbmdGdW5jdGlvbj14fWZ1bmN0aW9uIGUoKXtyZXR1cm4gYS5pc0RlcHJlY2F0ZWQoXCJJbnZhbGlkIHRpbWluZyBpbnB1dHNcIixcIjIwMTYtMDMtMDJcIixcIlR5cGVFcnJvciBleGNlcHRpb25zIHdpbGwgYmUgdGhyb3duIGluc3RlYWQuXCIsITApfWZ1bmN0aW9uIGYoYixjLGUpe3ZhciBmPW5ldyBkO3JldHVybiBjJiYoZi5maWxsPVwiYm90aFwiLGYuZHVyYXRpb249XCJhdXRvXCIpLFwibnVtYmVyXCIhPXR5cGVvZiBifHxpc05hTihiKT92b2lkIDAhPT1iJiZPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhiKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe2lmKFwiYXV0b1wiIT1iW2NdKXtpZigoXCJudW1iZXJcIj09dHlwZW9mIGZbY118fFwiZHVyYXRpb25cIj09YykmJihcIm51bWJlclwiIT10eXBlb2YgYltjXXx8aXNOYU4oYltjXSkpKXJldHVybjtpZihcImZpbGxcIj09YyYmLTE9PXYuaW5kZXhPZihiW2NdKSlyZXR1cm47aWYoXCJkaXJlY3Rpb25cIj09YyYmLTE9PXcuaW5kZXhPZihiW2NdKSlyZXR1cm47aWYoXCJwbGF5YmFja1JhdGVcIj09YyYmMSE9PWJbY10mJmEuaXNEZXByZWNhdGVkKFwiQW5pbWF0aW9uRWZmZWN0VGltaW5nLnBsYXliYWNrUmF0ZVwiLFwiMjAxNC0xMS0yOFwiLFwiVXNlIEFuaW1hdGlvbi5wbGF5YmFja1JhdGUgaW5zdGVhZC5cIikpcmV0dXJuO2ZbY109YltjXX19KTpmLmR1cmF0aW9uPWIsZn1mdW5jdGlvbiBnKGEpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiBhJiYoYT1pc05hTihhKT97ZHVyYXRpb246MH06e2R1cmF0aW9uOmF9KSxhfWZ1bmN0aW9uIGgoYixjKXtyZXR1cm4gYj1hLm51bWVyaWNUaW1pbmdUb09iamVjdChiKSxmKGIsYyl9ZnVuY3Rpb24gaShhLGIsYyxkKXtyZXR1cm4gYTwwfHxhPjF8fGM8MHx8Yz4xP3g6ZnVuY3Rpb24oZSl7ZnVuY3Rpb24gZihhLGIsYyl7cmV0dXJuIDMqYSooMS1jKSooMS1jKSpjKzMqYiooMS1jKSpjKmMrYypjKmN9aWYoZTw9MCl7dmFyIGc9MDtyZXR1cm4gYT4wP2c9Yi9hOiFiJiZjPjAmJihnPWQvYyksZyplfWlmKGU+PTEpe3ZhciBoPTA7cmV0dXJuIGM8MT9oPShkLTEpLyhjLTEpOjE9PWMmJmE8MSYmKGg9KGItMSkvKGEtMSkpLDEraCooZS0xKX1mb3IodmFyIGk9MCxqPTE7aTxqOyl7dmFyIGs9KGkraikvMixsPWYoYSxjLGspO2lmKE1hdGguYWJzKGUtbCk8MWUtNSlyZXR1cm4gZihiLGQsayk7bDxlP2k9azpqPWt9cmV0dXJuIGYoYixkLGspfX1mdW5jdGlvbiBqKGEsYil7cmV0dXJuIGZ1bmN0aW9uKGMpe2lmKGM+PTEpcmV0dXJuIDE7dmFyIGQ9MS9hO3JldHVybihjKz1iKmQpLWMlZH19ZnVuY3Rpb24gayhhKXtDfHwoQz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLnN0eWxlKSxDLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uPVwiXCIsQy5hbmltYXRpb25UaW1pbmdGdW5jdGlvbj1hO3ZhciBiPUMuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb247aWYoXCJcIj09YiYmZSgpKXRocm93IG5ldyBUeXBlRXJyb3IoYStcIiBpcyBub3QgYSB2YWxpZCB2YWx1ZSBmb3IgZWFzaW5nXCIpO3JldHVybiBifWZ1bmN0aW9uIGwoYSl7aWYoXCJsaW5lYXJcIj09YSlyZXR1cm4geDt2YXIgYj1FLmV4ZWMoYSk7aWYoYilyZXR1cm4gaS5hcHBseSh0aGlzLGIuc2xpY2UoMSkubWFwKE51bWJlcikpO3ZhciBjPUYuZXhlYyhhKTtyZXR1cm4gYz9qKE51bWJlcihjWzFdKSx7c3RhcnQ6eSxtaWRkbGU6eixlbmQ6QX1bY1syXV0pOkJbYV18fHh9ZnVuY3Rpb24gbShhKXtyZXR1cm4gTWF0aC5hYnMobihhKS9hLnBsYXliYWNrUmF0ZSl9ZnVuY3Rpb24gbihhKXtyZXR1cm4gMD09PWEuZHVyYXRpb258fDA9PT1hLml0ZXJhdGlvbnM/MDphLmR1cmF0aW9uKmEuaXRlcmF0aW9uc31mdW5jdGlvbiBvKGEsYixjKXtpZihudWxsPT1iKXJldHVybiBHO3ZhciBkPWMuZGVsYXkrYStjLmVuZERlbGF5O3JldHVybiBiPE1hdGgubWluKGMuZGVsYXksZCk/SDpiPj1NYXRoLm1pbihjLmRlbGF5K2EsZCk/STpKfWZ1bmN0aW9uIHAoYSxiLGMsZCxlKXtzd2l0Y2goZCl7Y2FzZSBIOnJldHVyblwiYmFja3dhcmRzXCI9PWJ8fFwiYm90aFwiPT1iPzA6bnVsbDtjYXNlIEo6cmV0dXJuIGMtZTtjYXNlIEk6cmV0dXJuXCJmb3J3YXJkc1wiPT1ifHxcImJvdGhcIj09Yj9hOm51bGw7Y2FzZSBHOnJldHVybiBudWxsfX1mdW5jdGlvbiBxKGEsYixjLGQsZSl7dmFyIGY9ZTtyZXR1cm4gMD09PWE/YiE9PUgmJihmKz1jKTpmKz1kL2EsZn1mdW5jdGlvbiByKGEsYixjLGQsZSxmKXt2YXIgZz1hPT09MS8wP2IlMTphJTE7cmV0dXJuIDAhPT1nfHxjIT09SXx8MD09PWR8fDA9PT1lJiYwIT09Znx8KGc9MSksZ31mdW5jdGlvbiBzKGEsYixjLGQpe3JldHVybiBhPT09SSYmYj09PTEvMD8xLzA6MT09PWM/TWF0aC5mbG9vcihkKS0xOk1hdGguZmxvb3IoZCl9ZnVuY3Rpb24gdChhLGIsYyl7dmFyIGQ9YTtpZihcIm5vcm1hbFwiIT09YSYmXCJyZXZlcnNlXCIhPT1hKXt2YXIgZT1iO1wiYWx0ZXJuYXRlLXJldmVyc2VcIj09PWEmJihlKz0xKSxkPVwibm9ybWFsXCIsZSE9PTEvMCYmZSUyIT0wJiYoZD1cInJldmVyc2VcIil9cmV0dXJuXCJub3JtYWxcIj09PWQ/YzoxLWN9ZnVuY3Rpb24gdShhLGIsYyl7dmFyIGQ9byhhLGIsYyksZT1wKGEsYy5maWxsLGIsZCxjLmRlbGF5KTtpZihudWxsPT09ZSlyZXR1cm4gbnVsbDt2YXIgZj1xKGMuZHVyYXRpb24sZCxjLml0ZXJhdGlvbnMsZSxjLml0ZXJhdGlvblN0YXJ0KSxnPXIoZixjLml0ZXJhdGlvblN0YXJ0LGQsYy5pdGVyYXRpb25zLGUsYy5kdXJhdGlvbiksaD1zKGQsYy5pdGVyYXRpb25zLGcsZiksaT10KGMuZGlyZWN0aW9uLGgsZyk7cmV0dXJuIGMuX2Vhc2luZ0Z1bmN0aW9uKGkpfXZhciB2PVwiYmFja3dhcmRzfGZvcndhcmRzfGJvdGh8bm9uZVwiLnNwbGl0KFwifFwiKSx3PVwicmV2ZXJzZXxhbHRlcm5hdGV8YWx0ZXJuYXRlLXJldmVyc2VcIi5zcGxpdChcInxcIikseD1mdW5jdGlvbihhKXtyZXR1cm4gYX07ZC5wcm90b3R5cGU9e19zZXRNZW1iZXI6ZnVuY3Rpb24oYixjKXt0aGlzW1wiX1wiK2JdPWMsdGhpcy5fZWZmZWN0JiYodGhpcy5fZWZmZWN0Ll90aW1pbmdJbnB1dFtiXT1jLHRoaXMuX2VmZmVjdC5fdGltaW5nPWEubm9ybWFsaXplVGltaW5nSW5wdXQodGhpcy5fZWZmZWN0Ll90aW1pbmdJbnB1dCksdGhpcy5fZWZmZWN0LmFjdGl2ZUR1cmF0aW9uPWEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24odGhpcy5fZWZmZWN0Ll90aW1pbmcpLHRoaXMuX2VmZmVjdC5fYW5pbWF0aW9uJiZ0aGlzLl9lZmZlY3QuX2FuaW1hdGlvbi5fcmVidWlsZFVuZGVybHlpbmdBbmltYXRpb24oKSl9LGdldCBwbGF5YmFja1JhdGUoKXtyZXR1cm4gdGhpcy5fcGxheWJhY2tSYXRlfSxzZXQgZGVsYXkoYSl7dGhpcy5fc2V0TWVtYmVyKFwiZGVsYXlcIixhKX0sZ2V0IGRlbGF5KCl7cmV0dXJuIHRoaXMuX2RlbGF5fSxzZXQgZW5kRGVsYXkoYSl7dGhpcy5fc2V0TWVtYmVyKFwiZW5kRGVsYXlcIixhKX0sZ2V0IGVuZERlbGF5KCl7cmV0dXJuIHRoaXMuX2VuZERlbGF5fSxzZXQgZmlsbChhKXt0aGlzLl9zZXRNZW1iZXIoXCJmaWxsXCIsYSl9LGdldCBmaWxsKCl7cmV0dXJuIHRoaXMuX2ZpbGx9LHNldCBpdGVyYXRpb25TdGFydChhKXtpZigoaXNOYU4oYSl8fGE8MCkmJmUoKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiaXRlcmF0aW9uU3RhcnQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIsIHJlY2VpdmVkOiBcIit0aW1pbmcuaXRlcmF0aW9uU3RhcnQpO3RoaXMuX3NldE1lbWJlcihcIml0ZXJhdGlvblN0YXJ0XCIsYSl9LGdldCBpdGVyYXRpb25TdGFydCgpe3JldHVybiB0aGlzLl9pdGVyYXRpb25TdGFydH0sc2V0IGR1cmF0aW9uKGEpe2lmKFwiYXV0b1wiIT1hJiYoaXNOYU4oYSl8fGE8MCkmJmUoKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiZHVyYXRpb24gbXVzdCBiZSBub24tbmVnYXRpdmUgb3IgYXV0bywgcmVjZWl2ZWQ6IFwiK2EpO3RoaXMuX3NldE1lbWJlcihcImR1cmF0aW9uXCIsYSl9LGdldCBkdXJhdGlvbigpe3JldHVybiB0aGlzLl9kdXJhdGlvbn0sc2V0IGRpcmVjdGlvbihhKXt0aGlzLl9zZXRNZW1iZXIoXCJkaXJlY3Rpb25cIixhKX0sZ2V0IGRpcmVjdGlvbigpe3JldHVybiB0aGlzLl9kaXJlY3Rpb259LHNldCBlYXNpbmcoYSl7dGhpcy5fZWFzaW5nRnVuY3Rpb249bChrKGEpKSx0aGlzLl9zZXRNZW1iZXIoXCJlYXNpbmdcIixhKX0sZ2V0IGVhc2luZygpe3JldHVybiB0aGlzLl9lYXNpbmd9LHNldCBpdGVyYXRpb25zKGEpe2lmKChpc05hTihhKXx8YTwwKSYmZSgpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRpb25zIG11c3QgYmUgbm9uLW5lZ2F0aXZlLCByZWNlaXZlZDogXCIrYSk7dGhpcy5fc2V0TWVtYmVyKFwiaXRlcmF0aW9uc1wiLGEpfSxnZXQgaXRlcmF0aW9ucygpe3JldHVybiB0aGlzLl9pdGVyYXRpb25zfX07dmFyIHk9MSx6PS41LEE9MCxCPXtlYXNlOmkoLjI1LC4xLC4yNSwxKSxcImVhc2UtaW5cIjppKC40MiwwLDEsMSksXCJlYXNlLW91dFwiOmkoMCwwLC41OCwxKSxcImVhc2UtaW4tb3V0XCI6aSguNDIsMCwuNTgsMSksXCJzdGVwLXN0YXJ0XCI6aigxLHkpLFwic3RlcC1taWRkbGVcIjpqKDEseiksXCJzdGVwLWVuZFwiOmooMSxBKX0sQz1udWxsLEQ9XCJcXFxccyooLT9cXFxcZCtcXFxcLj9cXFxcZCp8LT9cXFxcLlxcXFxkKylcXFxccypcIixFPW5ldyBSZWdFeHAoXCJjdWJpYy1iZXppZXJcXFxcKFwiK0QrXCIsXCIrRCtcIixcIitEK1wiLFwiK0QrXCJcXFxcKVwiKSxGPS9zdGVwc1xcKFxccyooXFxkKylcXHMqLFxccyooc3RhcnR8bWlkZGxlfGVuZClcXHMqXFwpLyxHPTAsSD0xLEk9MixKPTM7YS5jbG9uZVRpbWluZ0lucHV0PWMsYS5tYWtlVGltaW5nPWYsYS5udW1lcmljVGltaW5nVG9PYmplY3Q9ZyxhLm5vcm1hbGl6ZVRpbWluZ0lucHV0PWgsYS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbj1tLGEuY2FsY3VsYXRlSXRlcmF0aW9uUHJvZ3Jlc3M9dSxhLmNhbGN1bGF0ZVBoYXNlPW8sYS5ub3JtYWxpemVFYXNpbmc9ayxhLnBhcnNlRWFzaW5nRnVuY3Rpb249bH0oYyksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7cmV0dXJuIGEgaW4gaz9rW2FdW2JdfHxiOmJ9ZnVuY3Rpb24gZChhKXtyZXR1cm5cImRpc3BsYXlcIj09PWF8fDA9PT1hLmxhc3RJbmRleE9mKFwiYW5pbWF0aW9uXCIsMCl8fDA9PT1hLmxhc3RJbmRleE9mKFwidHJhbnNpdGlvblwiLDApfWZ1bmN0aW9uIGUoYSxiLGUpe2lmKCFkKGEpKXt2YXIgZj1oW2FdO2lmKGYpe2kuc3R5bGVbYV09Yjtmb3IodmFyIGcgaW4gZil7dmFyIGo9ZltnXSxrPWkuc3R5bGVbal07ZVtqXT1jKGosayl9fWVsc2UgZVthXT1jKGEsYil9fWZ1bmN0aW9uIGYoYSl7dmFyIGI9W107Zm9yKHZhciBjIGluIGEpaWYoIShjIGluW1wiZWFzaW5nXCIsXCJvZmZzZXRcIixcImNvbXBvc2l0ZVwiXSkpe3ZhciBkPWFbY107QXJyYXkuaXNBcnJheShkKXx8KGQ9W2RdKTtmb3IodmFyIGUsZj1kLmxlbmd0aCxnPTA7ZzxmO2crKyllPXt9LGUub2Zmc2V0PVwib2Zmc2V0XCJpbiBhP2Eub2Zmc2V0OjE9PWY/MTpnLyhmLTEpLFwiZWFzaW5nXCJpbiBhJiYoZS5lYXNpbmc9YS5lYXNpbmcpLFwiY29tcG9zaXRlXCJpbiBhJiYoZS5jb21wb3NpdGU9YS5jb21wb3NpdGUpLGVbY109ZFtnXSxiLnB1c2goZSl9cmV0dXJuIGIuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhLm9mZnNldC1iLm9mZnNldH0pLGJ9ZnVuY3Rpb24gZyhiKXtmdW5jdGlvbiBjKCl7dmFyIGE9ZC5sZW5ndGg7bnVsbD09ZFthLTFdLm9mZnNldCYmKGRbYS0xXS5vZmZzZXQ9MSksYT4xJiZudWxsPT1kWzBdLm9mZnNldCYmKGRbMF0ub2Zmc2V0PTApO2Zvcih2YXIgYj0wLGM9ZFswXS5vZmZzZXQsZT0xO2U8YTtlKyspe3ZhciBmPWRbZV0ub2Zmc2V0O2lmKG51bGwhPWYpe2Zvcih2YXIgZz0xO2c8ZS1iO2crKylkW2IrZ10ub2Zmc2V0PWMrKGYtYykqZy8oZS1iKTtiPWUsYz1mfX19aWYobnVsbD09YilyZXR1cm5bXTt3aW5kb3cuU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3ImJkFycmF5LnByb3RvdHlwZS5mcm9tJiZiW1N5bWJvbC5pdGVyYXRvcl0mJihiPUFycmF5LmZyb20oYikpLEFycmF5LmlzQXJyYXkoYil8fChiPWYoYikpO2Zvcih2YXIgZD1iLm1hcChmdW5jdGlvbihiKXt2YXIgYz17fTtmb3IodmFyIGQgaW4gYil7dmFyIGY9YltkXTtpZihcIm9mZnNldFwiPT1kKXtpZihudWxsIT1mKXtpZihmPU51bWJlcihmKSwhaXNGaW5pdGUoZikpdGhyb3cgbmV3IFR5cGVFcnJvcihcIktleWZyYW1lIG9mZnNldHMgbXVzdCBiZSBudW1iZXJzLlwiKTtpZihmPDB8fGY+MSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiS2V5ZnJhbWUgb2Zmc2V0cyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMS5cIil9fWVsc2UgaWYoXCJjb21wb3NpdGVcIj09ZCl7aWYoXCJhZGRcIj09Znx8XCJhY2N1bXVsYXRlXCI9PWYpdGhyb3d7dHlwZTpET01FeGNlcHRpb24uTk9UX1NVUFBPUlRFRF9FUlIsbmFtZTpcIk5vdFN1cHBvcnRlZEVycm9yXCIsbWVzc2FnZTpcImFkZCBjb21wb3NpdGluZyBpcyBub3Qgc3VwcG9ydGVkXCJ9O2lmKFwicmVwbGFjZVwiIT1mKXRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGNvbXBvc2l0ZSBtb2RlIFwiK2YrXCIuXCIpfWVsc2UgZj1cImVhc2luZ1wiPT1kP2Eubm9ybWFsaXplRWFzaW5nKGYpOlwiXCIrZjtlKGQsZixjKX1yZXR1cm4gdm9pZCAwPT1jLm9mZnNldCYmKGMub2Zmc2V0PW51bGwpLHZvaWQgMD09Yy5lYXNpbmcmJihjLmVhc2luZz1cImxpbmVhclwiKSxjfSksZz0hMCxoPS0xLzAsaT0wO2k8ZC5sZW5ndGg7aSsrKXt2YXIgaj1kW2ldLm9mZnNldDtpZihudWxsIT1qKXtpZihqPGgpdGhyb3cgbmV3IFR5cGVFcnJvcihcIktleWZyYW1lcyBhcmUgbm90IGxvb3NlbHkgc29ydGVkIGJ5IG9mZnNldC4gU29ydCBvciBzcGVjaWZ5IG9mZnNldHMuXCIpO2g9an1lbHNlIGc9ITF9cmV0dXJuIGQ9ZC5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIGEub2Zmc2V0Pj0wJiZhLm9mZnNldDw9MX0pLGd8fGMoKSxkfXZhciBoPXtiYWNrZ3JvdW5kOltcImJhY2tncm91bmRJbWFnZVwiLFwiYmFja2dyb3VuZFBvc2l0aW9uXCIsXCJiYWNrZ3JvdW5kU2l6ZVwiLFwiYmFja2dyb3VuZFJlcGVhdFwiLFwiYmFja2dyb3VuZEF0dGFjaG1lbnRcIixcImJhY2tncm91bmRPcmlnaW5cIixcImJhY2tncm91bmRDbGlwXCIsXCJiYWNrZ3JvdW5kQ29sb3JcIl0sYm9yZGVyOltcImJvcmRlclRvcENvbG9yXCIsXCJib3JkZXJUb3BTdHlsZVwiLFwiYm9yZGVyVG9wV2lkdGhcIixcImJvcmRlclJpZ2h0Q29sb3JcIixcImJvcmRlclJpZ2h0U3R5bGVcIixcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlckJvdHRvbUNvbG9yXCIsXCJib3JkZXJCb3R0b21TdHlsZVwiLFwiYm9yZGVyQm90dG9tV2lkdGhcIixcImJvcmRlckxlZnRDb2xvclwiLFwiYm9yZGVyTGVmdFN0eWxlXCIsXCJib3JkZXJMZWZ0V2lkdGhcIl0sYm9yZGVyQm90dG9tOltcImJvcmRlckJvdHRvbVdpZHRoXCIsXCJib3JkZXJCb3R0b21TdHlsZVwiLFwiYm9yZGVyQm90dG9tQ29sb3JcIl0sYm9yZGVyQ29sb3I6W1wiYm9yZGVyVG9wQ29sb3JcIixcImJvcmRlclJpZ2h0Q29sb3JcIixcImJvcmRlckJvdHRvbUNvbG9yXCIsXCJib3JkZXJMZWZ0Q29sb3JcIl0sYm9yZGVyTGVmdDpbXCJib3JkZXJMZWZ0V2lkdGhcIixcImJvcmRlckxlZnRTdHlsZVwiLFwiYm9yZGVyTGVmdENvbG9yXCJdLGJvcmRlclJhZGl1czpbXCJib3JkZXJUb3BMZWZ0UmFkaXVzXCIsXCJib3JkZXJUb3BSaWdodFJhZGl1c1wiLFwiYm9yZGVyQm90dG9tUmlnaHRSYWRpdXNcIixcImJvcmRlckJvdHRvbUxlZnRSYWRpdXNcIl0sYm9yZGVyUmlnaHQ6W1wiYm9yZGVyUmlnaHRXaWR0aFwiLFwiYm9yZGVyUmlnaHRTdHlsZVwiLFwiYm9yZGVyUmlnaHRDb2xvclwiXSxib3JkZXJUb3A6W1wiYm9yZGVyVG9wV2lkdGhcIixcImJvcmRlclRvcFN0eWxlXCIsXCJib3JkZXJUb3BDb2xvclwiXSxib3JkZXJXaWR0aDpbXCJib3JkZXJUb3BXaWR0aFwiLFwiYm9yZGVyUmlnaHRXaWR0aFwiLFwiYm9yZGVyQm90dG9tV2lkdGhcIixcImJvcmRlckxlZnRXaWR0aFwiXSxmbGV4OltcImZsZXhHcm93XCIsXCJmbGV4U2hyaW5rXCIsXCJmbGV4QmFzaXNcIl0sZm9udDpbXCJmb250RmFtaWx5XCIsXCJmb250U2l6ZVwiLFwiZm9udFN0eWxlXCIsXCJmb250VmFyaWFudFwiLFwiZm9udFdlaWdodFwiLFwibGluZUhlaWdodFwiXSxtYXJnaW46W1wibWFyZ2luVG9wXCIsXCJtYXJnaW5SaWdodFwiLFwibWFyZ2luQm90dG9tXCIsXCJtYXJnaW5MZWZ0XCJdLG91dGxpbmU6W1wib3V0bGluZUNvbG9yXCIsXCJvdXRsaW5lU3R5bGVcIixcIm91dGxpbmVXaWR0aFwiXSxwYWRkaW5nOltcInBhZGRpbmdUb3BcIixcInBhZGRpbmdSaWdodFwiLFwicGFkZGluZ0JvdHRvbVwiLFwicGFkZGluZ0xlZnRcIl19LGk9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiZGl2XCIpLGo9e3RoaW46XCIxcHhcIixtZWRpdW06XCIzcHhcIix0aGljazpcIjVweFwifSxrPXtib3JkZXJCb3R0b21XaWR0aDpqLGJvcmRlckxlZnRXaWR0aDpqLGJvcmRlclJpZ2h0V2lkdGg6aixib3JkZXJUb3BXaWR0aDpqLGZvbnRTaXplOntcInh4LXNtYWxsXCI6XCI2MCVcIixcIngtc21hbGxcIjpcIjc1JVwiLHNtYWxsOlwiODklXCIsbWVkaXVtOlwiMTAwJVwiLGxhcmdlOlwiMTIwJVwiLFwieC1sYXJnZVwiOlwiMTUwJVwiLFwieHgtbGFyZ2VcIjpcIjIwMCVcIn0sZm9udFdlaWdodDp7bm9ybWFsOlwiNDAwXCIsYm9sZDpcIjcwMFwifSxvdXRsaW5lV2lkdGg6aix0ZXh0U2hhZG93Ontub25lOlwiMHB4IDBweCAwcHggdHJhbnNwYXJlbnRcIn0sYm94U2hhZG93Ontub25lOlwiMHB4IDBweCAwcHggMHB4IHRyYW5zcGFyZW50XCJ9fTthLmNvbnZlcnRUb0FycmF5Rm9ybT1mLGEubm9ybWFsaXplS2V5ZnJhbWVzPWd9KGMpLGZ1bmN0aW9uKGEpe3ZhciBiPXt9O2EuaXNEZXByZWNhdGVkPWZ1bmN0aW9uKGEsYyxkLGUpe3ZhciBmPWU/XCJhcmVcIjpcImlzXCIsZz1uZXcgRGF0ZSxoPW5ldyBEYXRlKGMpO3JldHVybiBoLnNldE1vbnRoKGguZ2V0TW9udGgoKSszKSwhKGc8aCYmKGEgaW4gYnx8Y29uc29sZS53YXJuKFwiV2ViIEFuaW1hdGlvbnM6IFwiK2ErXCIgXCIrZitcIiBkZXByZWNhdGVkIGFuZCB3aWxsIHN0b3Agd29ya2luZyBvbiBcIitoLnRvRGF0ZVN0cmluZygpK1wiLiBcIitkKSxiW2FdPSEwLDEpKX0sYS5kZXByZWNhdGVkPWZ1bmN0aW9uKGIsYyxkLGUpe3ZhciBmPWU/XCJhcmVcIjpcImlzXCI7aWYoYS5pc0RlcHJlY2F0ZWQoYixjLGQsZSkpdGhyb3cgbmV3IEVycm9yKGIrXCIgXCIrZitcIiBubyBsb25nZXIgc3VwcG9ydGVkLiBcIitkKX19KGMpLGZ1bmN0aW9uKCl7aWYoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFuaW1hdGUpe3ZhciBhPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hbmltYXRlKFtdLDApLGI9ITA7aWYoYSYmKGI9ITEsXCJwbGF5fGN1cnJlbnRUaW1lfHBhdXNlfHJldmVyc2V8cGxheWJhY2tSYXRlfGNhbmNlbHxmaW5pc2h8c3RhcnRUaW1lfHBsYXlTdGF0ZVwiLnNwbGl0KFwifFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGMpe3ZvaWQgMD09PWFbY10mJihiPSEwKX0pKSwhYilyZXR1cm59IWZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe2Zvcih2YXIgYj17fSxjPTA7YzxhLmxlbmd0aDtjKyspZm9yKHZhciBkIGluIGFbY10paWYoXCJvZmZzZXRcIiE9ZCYmXCJlYXNpbmdcIiE9ZCYmXCJjb21wb3NpdGVcIiE9ZCl7dmFyIGU9e29mZnNldDphW2NdLm9mZnNldCxlYXNpbmc6YVtjXS5lYXNpbmcsdmFsdWU6YVtjXVtkXX07YltkXT1iW2RdfHxbXSxiW2RdLnB1c2goZSl9Zm9yKHZhciBmIGluIGIpe3ZhciBnPWJbZl07aWYoMCE9Z1swXS5vZmZzZXR8fDEhPWdbZy5sZW5ndGgtMV0ub2Zmc2V0KXRocm93e3R5cGU6RE9NRXhjZXB0aW9uLk5PVF9TVVBQT1JURURfRVJSLG5hbWU6XCJOb3RTdXBwb3J0ZWRFcnJvclwiLG1lc3NhZ2U6XCJQYXJ0aWFsIGtleWZyYW1lcyBhcmUgbm90IHN1cHBvcnRlZFwifX1yZXR1cm4gYn1mdW5jdGlvbiBlKGMpe3ZhciBkPVtdO2Zvcih2YXIgZSBpbiBjKWZvcih2YXIgZj1jW2VdLGc9MDtnPGYubGVuZ3RoLTE7ZysrKXt2YXIgaD1nLGk9ZysxLGo9ZltoXS5vZmZzZXQsaz1mW2ldLm9mZnNldCxsPWosbT1rOzA9PWcmJihsPS0xLzAsMD09ayYmKGk9aCkpLGc9PWYubGVuZ3RoLTImJihtPTEvMCwxPT1qJiYoaD1pKSksZC5wdXNoKHthcHBseUZyb206bCxhcHBseVRvOm0sc3RhcnRPZmZzZXQ6ZltoXS5vZmZzZXQsZW5kT2Zmc2V0OmZbaV0ub2Zmc2V0LGVhc2luZ0Z1bmN0aW9uOmEucGFyc2VFYXNpbmdGdW5jdGlvbihmW2hdLmVhc2luZykscHJvcGVydHk6ZSxpbnRlcnBvbGF0aW9uOmIucHJvcGVydHlJbnRlcnBvbGF0aW9uKGUsZltoXS52YWx1ZSxmW2ldLnZhbHVlKX0pfXJldHVybiBkLnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS5zdGFydE9mZnNldC1iLnN0YXJ0T2Zmc2V0fSksZH1iLmNvbnZlcnRFZmZlY3RJbnB1dD1mdW5jdGlvbihjKXt2YXIgZj1hLm5vcm1hbGl6ZUtleWZyYW1lcyhjKSxnPWQoZiksaD1lKGcpO3JldHVybiBmdW5jdGlvbihhLGMpe2lmKG51bGwhPWMpaC5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIGM+PWEuYXBwbHlGcm9tJiZjPGEuYXBwbHlUb30pLmZvckVhY2goZnVuY3Rpb24oZCl7dmFyIGU9Yy1kLnN0YXJ0T2Zmc2V0LGY9ZC5lbmRPZmZzZXQtZC5zdGFydE9mZnNldCxnPTA9PWY/MDpkLmVhc2luZ0Z1bmN0aW9uKGUvZik7Yi5hcHBseShhLGQucHJvcGVydHksZC5pbnRlcnBvbGF0aW9uKGcpKX0pO2Vsc2UgZm9yKHZhciBkIGluIGcpXCJvZmZzZXRcIiE9ZCYmXCJlYXNpbmdcIiE9ZCYmXCJjb21wb3NpdGVcIiE9ZCYmYi5jbGVhcihhLGQpfX19KGMsZCksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSl7cmV0dXJuIGEucmVwbGFjZSgvLSguKS9nLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIudG9VcHBlckNhc2UoKX0pfWZ1bmN0aW9uIGUoYSxiLGMpe2hbY109aFtjXXx8W10saFtjXS5wdXNoKFthLGJdKX1mdW5jdGlvbiBmKGEsYixjKXtmb3IodmFyIGY9MDtmPGMubGVuZ3RoO2YrKyl7ZShhLGIsZChjW2ZdKSl9fWZ1bmN0aW9uIGcoYyxlLGYpe3ZhciBnPWM7Ly0vLnRlc3QoYykmJiFhLmlzRGVwcmVjYXRlZChcIkh5cGhlbmF0ZWQgcHJvcGVydHkgbmFtZXNcIixcIjIwMTYtMDMtMjJcIixcIlVzZSBjYW1lbENhc2UgaW5zdGVhZC5cIiwhMCkmJihnPWQoYykpLFwiaW5pdGlhbFwiIT1lJiZcImluaXRpYWxcIiE9Znx8KFwiaW5pdGlhbFwiPT1lJiYoZT1pW2ddKSxcImluaXRpYWxcIj09ZiYmKGY9aVtnXSkpO2Zvcih2YXIgaj1lPT1mP1tdOmhbZ10saz0wO2omJms8ai5sZW5ndGg7aysrKXt2YXIgbD1qW2tdWzBdKGUpLG09altrXVswXShmKTtpZih2b2lkIDAhPT1sJiZ2b2lkIDAhPT1tKXt2YXIgbj1qW2tdWzFdKGwsbSk7aWYobil7dmFyIG89Yi5JbnRlcnBvbGF0aW9uLmFwcGx5KG51bGwsbik7cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiAwPT1hP2U6MT09YT9mOm8oYSl9fX19cmV0dXJuIGIuSW50ZXJwb2xhdGlvbighMSwhMCxmdW5jdGlvbihhKXtyZXR1cm4gYT9mOmV9KX12YXIgaD17fTtiLmFkZFByb3BlcnRpZXNIYW5kbGVyPWY7dmFyIGk9e2JhY2tncm91bmRDb2xvcjpcInRyYW5zcGFyZW50XCIsYmFja2dyb3VuZFBvc2l0aW9uOlwiMCUgMCVcIixib3JkZXJCb3R0b21Db2xvcjpcImN1cnJlbnRDb2xvclwiLGJvcmRlckJvdHRvbUxlZnRSYWRpdXM6XCIwcHhcIixib3JkZXJCb3R0b21SaWdodFJhZGl1czpcIjBweFwiLGJvcmRlckJvdHRvbVdpZHRoOlwiM3B4XCIsYm9yZGVyTGVmdENvbG9yOlwiY3VycmVudENvbG9yXCIsYm9yZGVyTGVmdFdpZHRoOlwiM3B4XCIsYm9yZGVyUmlnaHRDb2xvcjpcImN1cnJlbnRDb2xvclwiLGJvcmRlclJpZ2h0V2lkdGg6XCIzcHhcIixib3JkZXJTcGFjaW5nOlwiMnB4XCIsYm9yZGVyVG9wQ29sb3I6XCJjdXJyZW50Q29sb3JcIixib3JkZXJUb3BMZWZ0UmFkaXVzOlwiMHB4XCIsYm9yZGVyVG9wUmlnaHRSYWRpdXM6XCIwcHhcIixib3JkZXJUb3BXaWR0aDpcIjNweFwiLGJvdHRvbTpcImF1dG9cIixjbGlwOlwicmVjdCgwcHgsIDBweCwgMHB4LCAwcHgpXCIsY29sb3I6XCJibGFja1wiLGZvbnRTaXplOlwiMTAwJVwiLGZvbnRXZWlnaHQ6XCI0MDBcIixoZWlnaHQ6XCJhdXRvXCIsbGVmdDpcImF1dG9cIixsZXR0ZXJTcGFjaW5nOlwibm9ybWFsXCIsbGluZUhlaWdodDpcIjEyMCVcIixtYXJnaW5Cb3R0b206XCIwcHhcIixtYXJnaW5MZWZ0OlwiMHB4XCIsbWFyZ2luUmlnaHQ6XCIwcHhcIixtYXJnaW5Ub3A6XCIwcHhcIixtYXhIZWlnaHQ6XCJub25lXCIsbWF4V2lkdGg6XCJub25lXCIsbWluSGVpZ2h0OlwiMHB4XCIsbWluV2lkdGg6XCIwcHhcIixvcGFjaXR5OlwiMS4wXCIsb3V0bGluZUNvbG9yOlwiaW52ZXJ0XCIsb3V0bGluZU9mZnNldDpcIjBweFwiLG91dGxpbmVXaWR0aDpcIjNweFwiLHBhZGRpbmdCb3R0b206XCIwcHhcIixwYWRkaW5nTGVmdDpcIjBweFwiLHBhZGRpbmdSaWdodDpcIjBweFwiLHBhZGRpbmdUb3A6XCIwcHhcIixyaWdodDpcImF1dG9cIixzdHJva2VEYXNoYXJyYXk6XCJub25lXCIsc3Ryb2tlRGFzaG9mZnNldDpcIjBweFwiLHRleHRJbmRlbnQ6XCIwcHhcIix0ZXh0U2hhZG93OlwiMHB4IDBweCAwcHggdHJhbnNwYXJlbnRcIix0b3A6XCJhdXRvXCIsdHJhbnNmb3JtOlwiXCIsdmVydGljYWxBbGlnbjpcIjBweFwiLHZpc2liaWxpdHk6XCJ2aXNpYmxlXCIsd2lkdGg6XCJhdXRvXCIsd29yZFNwYWNpbmc6XCJub3JtYWxcIix6SW5kZXg6XCJhdXRvXCJ9O2IucHJvcGVydHlJbnRlcnBvbGF0aW9uPWd9KGMsZCksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYil7dmFyIGM9YS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbihiKSxkPWZ1bmN0aW9uKGQpe3JldHVybiBhLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzKGMsZCxiKX07cmV0dXJuIGQuX3RvdGFsRHVyYXRpb249Yi5kZWxheStjK2IuZW5kRGVsYXksZH1iLktleWZyYW1lRWZmZWN0PWZ1bmN0aW9uKGMsZSxmLGcpe3ZhciBoLGk9ZChhLm5vcm1hbGl6ZVRpbWluZ0lucHV0KGYpKSxqPWIuY29udmVydEVmZmVjdElucHV0KGUpLGs9ZnVuY3Rpb24oKXtqKGMsaCl9O3JldHVybiBrLl91cGRhdGU9ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPT0oaD1pKGEpKX0say5fY2xlYXI9ZnVuY3Rpb24oKXtqKGMsbnVsbCl9LGsuX2hhc1NhbWVUYXJnZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGM9PT1hfSxrLl90YXJnZXQ9YyxrLl90b3RhbER1cmF0aW9uPWkuX3RvdGFsRHVyYXRpb24say5faWQ9ZyxrfX0oYyxkKSxmdW5jdGlvbihhLGIpe2EuYXBwbHk9ZnVuY3Rpb24oYixjLGQpe2Iuc3R5bGVbYS5wcm9wZXJ0eU5hbWUoYyldPWR9LGEuY2xlYXI9ZnVuY3Rpb24oYixjKXtiLnN0eWxlW2EucHJvcGVydHlOYW1lKGMpXT1cIlwifX0oZCksZnVuY3Rpb24oYSl7d2luZG93LkVsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU9ZnVuY3Rpb24oYixjKXt2YXIgZD1cIlwiO3JldHVybiBjJiZjLmlkJiYoZD1jLmlkKSxhLnRpbWVsaW5lLl9wbGF5KGEuS2V5ZnJhbWVFZmZlY3QodGhpcyxiLGMsZCkpfX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYixkKXtpZihcIm51bWJlclwiPT10eXBlb2YgYSYmXCJudW1iZXJcIj09dHlwZW9mIGIpcmV0dXJuIGEqKDEtZCkrYipkO2lmKFwiYm9vbGVhblwiPT10eXBlb2YgYSYmXCJib29sZWFuXCI9PXR5cGVvZiBiKXJldHVybiBkPC41P2E6YjtpZihhLmxlbmd0aD09Yi5sZW5ndGgpe2Zvcih2YXIgZT1bXSxmPTA7ZjxhLmxlbmd0aDtmKyspZS5wdXNoKGMoYVtmXSxiW2ZdLGQpKTtyZXR1cm4gZX10aHJvd1wiTWlzbWF0Y2hlZCBpbnRlcnBvbGF0aW9uIGFyZ3VtZW50cyBcIithK1wiOlwiK2J9YS5JbnRlcnBvbGF0aW9uPWZ1bmN0aW9uKGEsYixkKXtyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIGQoYyhhLGIsZSkpfX19KGQpLGZ1bmN0aW9uKGEsYixjKXthLnNlcXVlbmNlTnVtYmVyPTA7dmFyIGQ9ZnVuY3Rpb24oYSxiLGMpe3RoaXMudGFyZ2V0PWEsdGhpcy5jdXJyZW50VGltZT1iLHRoaXMudGltZWxpbmVUaW1lPWMsdGhpcy50eXBlPVwiZmluaXNoXCIsdGhpcy5idWJibGVzPSExLHRoaXMuY2FuY2VsYWJsZT0hMSx0aGlzLmN1cnJlbnRUYXJnZXQ9YSx0aGlzLmRlZmF1bHRQcmV2ZW50ZWQ9ITEsdGhpcy5ldmVudFBoYXNlPUV2ZW50LkFUX1RBUkdFVCx0aGlzLnRpbWVTdGFtcD1EYXRlLm5vdygpfTtiLkFuaW1hdGlvbj1mdW5jdGlvbihiKXt0aGlzLmlkPVwiXCIsYiYmYi5faWQmJih0aGlzLmlkPWIuX2lkKSx0aGlzLl9zZXF1ZW5jZU51bWJlcj1hLnNlcXVlbmNlTnVtYmVyKyssdGhpcy5fY3VycmVudFRpbWU9MCx0aGlzLl9zdGFydFRpbWU9bnVsbCx0aGlzLl9wYXVzZWQ9ITEsdGhpcy5fcGxheWJhY2tSYXRlPTEsdGhpcy5faW5UaW1lbGluZT0hMCx0aGlzLl9maW5pc2hlZEZsYWc9ITAsdGhpcy5vbmZpbmlzaD1udWxsLHRoaXMuX2ZpbmlzaEhhbmRsZXJzPVtdLHRoaXMuX2VmZmVjdD1iLHRoaXMuX2luRWZmZWN0PXRoaXMuX2VmZmVjdC5fdXBkYXRlKDApLHRoaXMuX2lkbGU9ITAsdGhpcy5fY3VycmVudFRpbWVQZW5kaW5nPSExfSxiLkFuaW1hdGlvbi5wcm90b3R5cGU9e19lbnN1cmVBbGl2ZTpmdW5jdGlvbigpe3RoaXMucGxheWJhY2tSYXRlPDAmJjA9PT10aGlzLmN1cnJlbnRUaW1lP3RoaXMuX2luRWZmZWN0PXRoaXMuX2VmZmVjdC5fdXBkYXRlKC0xKTp0aGlzLl9pbkVmZmVjdD10aGlzLl9lZmZlY3QuX3VwZGF0ZSh0aGlzLmN1cnJlbnRUaW1lKSx0aGlzLl9pblRpbWVsaW5lfHwhdGhpcy5faW5FZmZlY3QmJnRoaXMuX2ZpbmlzaGVkRmxhZ3x8KHRoaXMuX2luVGltZWxpbmU9ITAsYi50aW1lbGluZS5fYW5pbWF0aW9ucy5wdXNoKHRoaXMpKX0sX3RpY2tDdXJyZW50VGltZTpmdW5jdGlvbihhLGIpe2EhPXRoaXMuX2N1cnJlbnRUaW1lJiYodGhpcy5fY3VycmVudFRpbWU9YSx0aGlzLl9pc0ZpbmlzaGVkJiYhYiYmKHRoaXMuX2N1cnJlbnRUaW1lPXRoaXMuX3BsYXliYWNrUmF0ZT4wP3RoaXMuX3RvdGFsRHVyYXRpb246MCksdGhpcy5fZW5zdXJlQWxpdmUoKSl9LGdldCBjdXJyZW50VGltZSgpe3JldHVybiB0aGlzLl9pZGxlfHx0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc/bnVsbDp0aGlzLl9jdXJyZW50VGltZX0sc2V0IGN1cnJlbnRUaW1lKGEpe2E9K2EsaXNOYU4oYSl8fChiLnJlc3RhcnQoKSx0aGlzLl9wYXVzZWR8fG51bGw9PXRoaXMuX3N0YXJ0VGltZXx8KHRoaXMuX3N0YXJ0VGltZT10aGlzLl90aW1lbGluZS5jdXJyZW50VGltZS1hL3RoaXMuX3BsYXliYWNrUmF0ZSksdGhpcy5fY3VycmVudFRpbWVQZW5kaW5nPSExLHRoaXMuX2N1cnJlbnRUaW1lIT1hJiYodGhpcy5faWRsZSYmKHRoaXMuX2lkbGU9ITEsdGhpcy5fcGF1c2VkPSEwKSx0aGlzLl90aWNrQ3VycmVudFRpbWUoYSwhMCksYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcykpKX0sZ2V0IHN0YXJ0VGltZSgpe3JldHVybiB0aGlzLl9zdGFydFRpbWV9LHNldCBzdGFydFRpbWUoYSl7YT0rYSxpc05hTihhKXx8dGhpcy5fcGF1c2VkfHx0aGlzLl9pZGxlfHwodGhpcy5fc3RhcnRUaW1lPWEsdGhpcy5fdGlja0N1cnJlbnRUaW1lKCh0aGlzLl90aW1lbGluZS5jdXJyZW50VGltZS10aGlzLl9zdGFydFRpbWUpKnRoaXMucGxheWJhY2tSYXRlKSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbih0aGlzKSl9LGdldCBwbGF5YmFja1JhdGUoKXtyZXR1cm4gdGhpcy5fcGxheWJhY2tSYXRlfSxzZXQgcGxheWJhY2tSYXRlKGEpe2lmKGEhPXRoaXMuX3BsYXliYWNrUmF0ZSl7dmFyIGM9dGhpcy5jdXJyZW50VGltZTt0aGlzLl9wbGF5YmFja1JhdGU9YSx0aGlzLl9zdGFydFRpbWU9bnVsbCxcInBhdXNlZFwiIT10aGlzLnBsYXlTdGF0ZSYmXCJpZGxlXCIhPXRoaXMucGxheVN0YXRlJiYodGhpcy5fZmluaXNoZWRGbGFnPSExLHRoaXMuX2lkbGU9ITEsdGhpcy5fZW5zdXJlQWxpdmUoKSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbih0aGlzKSksbnVsbCE9YyYmKHRoaXMuY3VycmVudFRpbWU9Yyl9fSxnZXQgX2lzRmluaXNoZWQoKXtyZXR1cm4hdGhpcy5faWRsZSYmKHRoaXMuX3BsYXliYWNrUmF0ZT4wJiZ0aGlzLl9jdXJyZW50VGltZT49dGhpcy5fdG90YWxEdXJhdGlvbnx8dGhpcy5fcGxheWJhY2tSYXRlPDAmJnRoaXMuX2N1cnJlbnRUaW1lPD0wKX0sZ2V0IF90b3RhbER1cmF0aW9uKCl7cmV0dXJuIHRoaXMuX2VmZmVjdC5fdG90YWxEdXJhdGlvbn0sZ2V0IHBsYXlTdGF0ZSgpe3JldHVybiB0aGlzLl9pZGxlP1wiaWRsZVwiOm51bGw9PXRoaXMuX3N0YXJ0VGltZSYmIXRoaXMuX3BhdXNlZCYmMCE9dGhpcy5wbGF5YmFja1JhdGV8fHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz9cInBlbmRpbmdcIjp0aGlzLl9wYXVzZWQ/XCJwYXVzZWRcIjp0aGlzLl9pc0ZpbmlzaGVkP1wiZmluaXNoZWRcIjpcInJ1bm5pbmdcIn0sX3Jld2luZDpmdW5jdGlvbigpe2lmKHRoaXMuX3BsYXliYWNrUmF0ZT49MCl0aGlzLl9jdXJyZW50VGltZT0wO2Vsc2V7aWYoISh0aGlzLl90b3RhbER1cmF0aW9uPDEvMCkpdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcIlVuYWJsZSB0byByZXdpbmQgbmVnYXRpdmUgcGxheWJhY2sgcmF0ZSBhbmltYXRpb24gd2l0aCBpbmZpbml0ZSBkdXJhdGlvblwiLFwiSW52YWxpZFN0YXRlRXJyb3JcIik7dGhpcy5fY3VycmVudFRpbWU9dGhpcy5fdG90YWxEdXJhdGlvbn19LHBsYXk6ZnVuY3Rpb24oKXt0aGlzLl9wYXVzZWQ9ITEsKHRoaXMuX2lzRmluaXNoZWR8fHRoaXMuX2lkbGUpJiYodGhpcy5fcmV3aW5kKCksdGhpcy5fc3RhcnRUaW1lPW51bGwpLHRoaXMuX2ZpbmlzaGVkRmxhZz0hMSx0aGlzLl9pZGxlPSExLHRoaXMuX2Vuc3VyZUFsaXZlKCksYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcyl9LHBhdXNlOmZ1bmN0aW9uKCl7dGhpcy5faXNGaW5pc2hlZHx8dGhpcy5fcGF1c2VkfHx0aGlzLl9pZGxlP3RoaXMuX2lkbGUmJih0aGlzLl9yZXdpbmQoKSx0aGlzLl9pZGxlPSExKTp0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc9ITAsdGhpcy5fc3RhcnRUaW1lPW51bGwsdGhpcy5fcGF1c2VkPSEwfSxmaW5pc2g6ZnVuY3Rpb24oKXt0aGlzLl9pZGxlfHwodGhpcy5jdXJyZW50VGltZT10aGlzLl9wbGF5YmFja1JhdGU+MD90aGlzLl90b3RhbER1cmF0aW9uOjAsdGhpcy5fc3RhcnRUaW1lPXRoaXMuX3RvdGFsRHVyYXRpb24tdGhpcy5jdXJyZW50VGltZSx0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc9ITEsYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcykpfSxjYW5jZWw6ZnVuY3Rpb24oKXt0aGlzLl9pbkVmZmVjdCYmKHRoaXMuX2luRWZmZWN0PSExLHRoaXMuX2lkbGU9ITAsdGhpcy5fcGF1c2VkPSExLHRoaXMuX2lzRmluaXNoZWQ9ITAsdGhpcy5fZmluaXNoZWRGbGFnPSEwLHRoaXMuX2N1cnJlbnRUaW1lPTAsdGhpcy5fc3RhcnRUaW1lPW51bGwsdGhpcy5fZWZmZWN0Ll91cGRhdGUobnVsbCksYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcykpfSxyZXZlcnNlOmZ1bmN0aW9uKCl7dGhpcy5wbGF5YmFja1JhdGUqPS0xLHRoaXMucGxheSgpfSxhZGRFdmVudExpc3RlbmVyOmZ1bmN0aW9uKGEsYil7XCJmdW5jdGlvblwiPT10eXBlb2YgYiYmXCJmaW5pc2hcIj09YSYmdGhpcy5fZmluaXNoSGFuZGxlcnMucHVzaChiKX0scmVtb3ZlRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbihhLGIpe2lmKFwiZmluaXNoXCI9PWEpe3ZhciBjPXRoaXMuX2ZpbmlzaEhhbmRsZXJzLmluZGV4T2YoYik7Yz49MCYmdGhpcy5fZmluaXNoSGFuZGxlcnMuc3BsaWNlKGMsMSl9fSxfZmlyZUV2ZW50czpmdW5jdGlvbihhKXtpZih0aGlzLl9pc0ZpbmlzaGVkKXtpZighdGhpcy5fZmluaXNoZWRGbGFnKXt2YXIgYj1uZXcgZCh0aGlzLHRoaXMuX2N1cnJlbnRUaW1lLGEpLGM9dGhpcy5fZmluaXNoSGFuZGxlcnMuY29uY2F0KHRoaXMub25maW5pc2g/W3RoaXMub25maW5pc2hdOltdKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Yy5mb3JFYWNoKGZ1bmN0aW9uKGEpe2EuY2FsbChiLnRhcmdldCxiKX0pfSwwKSx0aGlzLl9maW5pc2hlZEZsYWc9ITB9fWVsc2UgdGhpcy5fZmluaXNoZWRGbGFnPSExfSxfdGljazpmdW5jdGlvbihhLGIpe3RoaXMuX2lkbGV8fHRoaXMuX3BhdXNlZHx8KG51bGw9PXRoaXMuX3N0YXJ0VGltZT9iJiYodGhpcy5zdGFydFRpbWU9YS10aGlzLl9jdXJyZW50VGltZS90aGlzLnBsYXliYWNrUmF0ZSk6dGhpcy5faXNGaW5pc2hlZHx8dGhpcy5fdGlja0N1cnJlbnRUaW1lKChhLXRoaXMuX3N0YXJ0VGltZSkqdGhpcy5wbGF5YmFja1JhdGUpKSxiJiYodGhpcy5fY3VycmVudFRpbWVQZW5kaW5nPSExLHRoaXMuX2ZpcmVFdmVudHMoYSkpfSxnZXQgX25lZWRzVGljaygpe3JldHVybiB0aGlzLnBsYXlTdGF0ZSBpbntwZW5kaW5nOjEscnVubmluZzoxfXx8IXRoaXMuX2ZpbmlzaGVkRmxhZ30sX3RhcmdldEFuaW1hdGlvbnM6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLl9lZmZlY3QuX3RhcmdldDtyZXR1cm4gYS5fYWN0aXZlQW5pbWF0aW9uc3x8KGEuX2FjdGl2ZUFuaW1hdGlvbnM9W10pLGEuX2FjdGl2ZUFuaW1hdGlvbnN9LF9tYXJrVGFyZ2V0OmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fdGFyZ2V0QW5pbWF0aW9ucygpOy0xPT09YS5pbmRleE9mKHRoaXMpJiZhLnB1c2godGhpcyl9LF91bm1hcmtUYXJnZXQ6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLl90YXJnZXRBbmltYXRpb25zKCksYj1hLmluZGV4T2YodGhpcyk7LTEhPT1iJiZhLnNwbGljZShiLDEpfX19KGMsZCksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSl7dmFyIGI9ajtqPVtdLGE8cS5jdXJyZW50VGltZSYmKGE9cS5jdXJyZW50VGltZSkscS5fYW5pbWF0aW9ucy5zb3J0KGUpLHEuX2FuaW1hdGlvbnM9aChhLCEwLHEuX2FuaW1hdGlvbnMpWzBdLGIuZm9yRWFjaChmdW5jdGlvbihiKXtiWzFdKGEpfSksZygpLGw9dm9pZCAwfWZ1bmN0aW9uIGUoYSxiKXtyZXR1cm4gYS5fc2VxdWVuY2VOdW1iZXItYi5fc2VxdWVuY2VOdW1iZXJ9ZnVuY3Rpb24gZigpe3RoaXMuX2FuaW1hdGlvbnM9W10sdGhpcy5jdXJyZW50VGltZT13aW5kb3cucGVyZm9ybWFuY2UmJnBlcmZvcm1hbmNlLm5vdz9wZXJmb3JtYW5jZS5ub3coKTowfWZ1bmN0aW9uIGcoKXtvLmZvckVhY2goZnVuY3Rpb24oYSl7YSgpfSksby5sZW5ndGg9MH1mdW5jdGlvbiBoKGEsYyxkKXtwPSEwLG49ITEsYi50aW1lbGluZS5jdXJyZW50VGltZT1hLG09ITE7dmFyIGU9W10sZj1bXSxnPVtdLGg9W107cmV0dXJuIGQuZm9yRWFjaChmdW5jdGlvbihiKXtiLl90aWNrKGEsYyksYi5faW5FZmZlY3Q/KGYucHVzaChiLl9lZmZlY3QpLGIuX21hcmtUYXJnZXQoKSk6KGUucHVzaChiLl9lZmZlY3QpLGIuX3VubWFya1RhcmdldCgpKSxiLl9uZWVkc1RpY2smJihtPSEwKTt2YXIgZD1iLl9pbkVmZmVjdHx8Yi5fbmVlZHNUaWNrO2IuX2luVGltZWxpbmU9ZCxkP2cucHVzaChiKTpoLnB1c2goYil9KSxvLnB1c2guYXBwbHkobyxlKSxvLnB1c2guYXBwbHkobyxmKSxtJiZyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXt9KSxwPSExLFtnLGhdfXZhciBpPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUsaj1bXSxrPTA7d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZT1mdW5jdGlvbihhKXt2YXIgYj1rKys7cmV0dXJuIDA9PWoubGVuZ3RoJiZpKGQpLGoucHVzaChbYixhXSksYn0sd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGEpe2ouZm9yRWFjaChmdW5jdGlvbihiKXtiWzBdPT1hJiYoYlsxXT1mdW5jdGlvbigpe30pfSl9LGYucHJvdG90eXBlPXtfcGxheTpmdW5jdGlvbihjKXtjLl90aW1pbmc9YS5ub3JtYWxpemVUaW1pbmdJbnB1dChjLnRpbWluZyk7dmFyIGQ9bmV3IGIuQW5pbWF0aW9uKGMpO3JldHVybiBkLl9pZGxlPSExLGQuX3RpbWVsaW5lPXRoaXMsdGhpcy5fYW5pbWF0aW9ucy5wdXNoKGQpLGIucmVzdGFydCgpLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKGQpLGR9fTt2YXIgbD12b2lkIDAsbT0hMSxuPSExO2IucmVzdGFydD1mdW5jdGlvbigpe3JldHVybiBtfHwobT0hMCxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXt9KSxuPSEwKSxufSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbj1mdW5jdGlvbihhKXtpZighcCl7YS5fbWFya1RhcmdldCgpO3ZhciBjPWEuX3RhcmdldEFuaW1hdGlvbnMoKTtjLnNvcnQoZSksaChiLnRpbWVsaW5lLmN1cnJlbnRUaW1lLCExLGMuc2xpY2UoKSlbMV0uZm9yRWFjaChmdW5jdGlvbihhKXt2YXIgYj1xLl9hbmltYXRpb25zLmluZGV4T2YoYSk7LTEhPT1iJiZxLl9hbmltYXRpb25zLnNwbGljZShiLDEpfSksZygpfX07dmFyIG89W10scD0hMSxxPW5ldyBmO2IudGltZWxpbmU9cX0oYyxkKSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGEsYil7dmFyIGM9YS5leGVjKGIpO2lmKGMpcmV0dXJuIGM9YS5pZ25vcmVDYXNlP2NbMF0udG9Mb3dlckNhc2UoKTpjWzBdLFtjLGIuc3Vic3RyKGMubGVuZ3RoKV19ZnVuY3Rpb24gYyhhLGIpe2I9Yi5yZXBsYWNlKC9eXFxzKi8sXCJcIik7dmFyIGM9YShiKTtpZihjKXJldHVybltjWzBdLGNbMV0ucmVwbGFjZSgvXlxccyovLFwiXCIpXX1mdW5jdGlvbiBkKGEsZCxlKXthPWMuYmluZChudWxsLGEpO2Zvcih2YXIgZj1bXTs7KXt2YXIgZz1hKGUpO2lmKCFnKXJldHVybltmLGVdO2lmKGYucHVzaChnWzBdKSxlPWdbMV0sIShnPWIoZCxlKSl8fFwiXCI9PWdbMV0pcmV0dXJuW2YsZV07ZT1nWzFdfX1mdW5jdGlvbiBlKGEsYil7Zm9yKHZhciBjPTAsZD0wO2Q8Yi5sZW5ndGgmJighL1xcc3wsLy50ZXN0KGJbZF0pfHwwIT1jKTtkKyspaWYoXCIoXCI9PWJbZF0pYysrO2Vsc2UgaWYoXCIpXCI9PWJbZF0mJihjLS0sMD09YyYmZCsrLGM8PTApKWJyZWFrO3ZhciBlPWEoYi5zdWJzdHIoMCxkKSk7cmV0dXJuIHZvaWQgMD09ZT92b2lkIDA6W2UsYi5zdWJzdHIoZCldfWZ1bmN0aW9uIGYoYSxiKXtmb3IodmFyIGM9YSxkPWI7YyYmZDspYz5kP2MlPWQ6ZCU9YztyZXR1cm4gYz1hKmIvKGMrZCl9ZnVuY3Rpb24gZyhhKXtyZXR1cm4gZnVuY3Rpb24oYil7dmFyIGM9YShiKTtyZXR1cm4gYyYmKGNbMF09dm9pZCAwKSxjfX1mdW5jdGlvbiBoKGEsYil7cmV0dXJuIGZ1bmN0aW9uKGMpe3JldHVybiBhKGMpfHxbYixjXX19ZnVuY3Rpb24gaShiLGMpe2Zvcih2YXIgZD1bXSxlPTA7ZTxiLmxlbmd0aDtlKyspe3ZhciBmPWEuY29uc3VtZVRyaW1tZWQoYltlXSxjKTtpZighZnx8XCJcIj09ZlswXSlyZXR1cm47dm9pZCAwIT09ZlswXSYmZC5wdXNoKGZbMF0pLGM9ZlsxXX1pZihcIlwiPT1jKXJldHVybiBkfWZ1bmN0aW9uIGooYSxiLGMsZCxlKXtmb3IodmFyIGc9W10saD1bXSxpPVtdLGo9ZihkLmxlbmd0aCxlLmxlbmd0aCksaz0wO2s8ajtrKyspe3ZhciBsPWIoZFtrJWQubGVuZ3RoXSxlW2slZS5sZW5ndGhdKTtpZighbClyZXR1cm47Zy5wdXNoKGxbMF0pLGgucHVzaChsWzFdKSxpLnB1c2gobFsyXSl9cmV0dXJuW2csaCxmdW5jdGlvbihiKXt2YXIgZD1iLm1hcChmdW5jdGlvbihhLGIpe3JldHVybiBpW2JdKGEpfSkuam9pbihjKTtyZXR1cm4gYT9hKGQpOmR9XX1mdW5jdGlvbiBrKGEsYixjKXtmb3IodmFyIGQ9W10sZT1bXSxmPVtdLGc9MCxoPTA7aDxjLmxlbmd0aDtoKyspaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgY1toXSl7dmFyIGk9Y1toXShhW2ddLGJbZysrXSk7ZC5wdXNoKGlbMF0pLGUucHVzaChpWzFdKSxmLnB1c2goaVsyXSl9ZWxzZSFmdW5jdGlvbihhKXtkLnB1c2goITEpLGUucHVzaCghMSksZi5wdXNoKGZ1bmN0aW9uKCl7cmV0dXJuIGNbYV19KX0oaCk7cmV0dXJuW2QsZSxmdW5jdGlvbihhKXtmb3IodmFyIGI9XCJcIixjPTA7YzxhLmxlbmd0aDtjKyspYis9ZltjXShhW2NdKTtyZXR1cm4gYn1dfWEuY29uc3VtZVRva2VuPWIsYS5jb25zdW1lVHJpbW1lZD1jLGEuY29uc3VtZVJlcGVhdGVkPWQsYS5jb25zdW1lUGFyZW50aGVzaXNlZD1lLGEuaWdub3JlPWcsYS5vcHRpb25hbD1oLGEuY29uc3VtZUxpc3Q9aSxhLm1lcmdlTmVzdGVkUmVwZWF0ZWQ9ai5iaW5kKG51bGwsbnVsbCksYS5tZXJnZVdyYXBwZWROZXN0ZWRSZXBlYXRlZD1qLGEubWVyZ2VMaXN0PWt9KGQpLGZ1bmN0aW9uKGEpe2Z1bmN0aW9uIGIoYil7ZnVuY3Rpb24gYyhiKXt2YXIgYz1hLmNvbnN1bWVUb2tlbigvXmluc2V0L2ksYik7aWYoYylyZXR1cm4gZC5pbnNldD0hMCxjO3ZhciBjPWEuY29uc3VtZUxlbmd0aE9yUGVyY2VudChiKTtpZihjKXJldHVybiBkLmxlbmd0aHMucHVzaChjWzBdKSxjO3ZhciBjPWEuY29uc3VtZUNvbG9yKGIpO3JldHVybiBjPyhkLmNvbG9yPWNbMF0sYyk6dm9pZCAwfXZhciBkPXtpbnNldDohMSxsZW5ndGhzOltdLGNvbG9yOm51bGx9LGU9YS5jb25zdW1lUmVwZWF0ZWQoYywvXi8sYik7aWYoZSYmZVswXS5sZW5ndGgpcmV0dXJuW2QsZVsxXV19ZnVuY3Rpb24gYyhjKXt2YXIgZD1hLmNvbnN1bWVSZXBlYXRlZChiLC9eLC8sYyk7aWYoZCYmXCJcIj09ZFsxXSlyZXR1cm4gZFswXX1mdW5jdGlvbiBkKGIsYyl7Zm9yKDtiLmxlbmd0aHMubGVuZ3RoPE1hdGgubWF4KGIubGVuZ3Rocy5sZW5ndGgsYy5sZW5ndGhzLmxlbmd0aCk7KWIubGVuZ3Rocy5wdXNoKHtweDowfSk7Zm9yKDtjLmxlbmd0aHMubGVuZ3RoPE1hdGgubWF4KGIubGVuZ3Rocy5sZW5ndGgsYy5sZW5ndGhzLmxlbmd0aCk7KWMubGVuZ3Rocy5wdXNoKHtweDowfSk7aWYoYi5pbnNldD09Yy5pbnNldCYmISFiLmNvbG9yPT0hIWMuY29sb3Ipe2Zvcih2YXIgZCxlPVtdLGY9W1tdLDBdLGc9W1tdLDBdLGg9MDtoPGIubGVuZ3Rocy5sZW5ndGg7aCsrKXt2YXIgaT1hLm1lcmdlRGltZW5zaW9ucyhiLmxlbmd0aHNbaF0sYy5sZW5ndGhzW2hdLDI9PWgpO2ZbMF0ucHVzaChpWzBdKSxnWzBdLnB1c2goaVsxXSksZS5wdXNoKGlbMl0pfWlmKGIuY29sb3ImJmMuY29sb3Ipe3ZhciBqPWEubWVyZ2VDb2xvcnMoYi5jb2xvcixjLmNvbG9yKTtmWzFdPWpbMF0sZ1sxXT1qWzFdLGQ9alsyXX1yZXR1cm5bZixnLGZ1bmN0aW9uKGEpe2Zvcih2YXIgYz1iLmluc2V0P1wiaW5zZXQgXCI6XCIgXCIsZj0wO2Y8ZS5sZW5ndGg7ZisrKWMrPWVbZl0oYVswXVtmXSkrXCIgXCI7cmV0dXJuIGQmJihjKz1kKGFbMV0pKSxjfV19fWZ1bmN0aW9uIGUoYixjLGQsZSl7ZnVuY3Rpb24gZihhKXtyZXR1cm57aW5zZXQ6YSxjb2xvcjpbMCwwLDAsMF0sbGVuZ3Roczpbe3B4OjB9LHtweDowfSx7cHg6MH0se3B4OjB9XX19Zm9yKHZhciBnPVtdLGg9W10saT0wO2k8ZC5sZW5ndGh8fGk8ZS5sZW5ndGg7aSsrKXt2YXIgaj1kW2ldfHxmKGVbaV0uaW5zZXQpLGs9ZVtpXXx8ZihkW2ldLmluc2V0KTtnLnB1c2goaiksaC5wdXNoKGspfXJldHVybiBhLm1lcmdlTmVzdGVkUmVwZWF0ZWQoYixjLGcsaCl9dmFyIGY9ZS5iaW5kKG51bGwsZCxcIiwgXCIpO2EuYWRkUHJvcGVydGllc0hhbmRsZXIoYyxmLFtcImJveC1zaGFkb3dcIixcInRleHQtc2hhZG93XCJdKX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBhLnRvRml4ZWQoMykucmVwbGFjZSgvMCskLyxcIlwiKS5yZXBsYWNlKC9cXC4kLyxcIlwiKX1mdW5jdGlvbiBkKGEsYixjKXtyZXR1cm4gTWF0aC5taW4oYixNYXRoLm1heChhLGMpKX1mdW5jdGlvbiBlKGEpe2lmKC9eXFxzKlstK10/KFxcZCpcXC4pP1xcZCtcXHMqJC8udGVzdChhKSlyZXR1cm4gTnVtYmVyKGEpfWZ1bmN0aW9uIGYoYSxiKXtyZXR1cm5bYSxiLGNdfWZ1bmN0aW9uIGcoYSxiKXtpZigwIT1hKXJldHVybiBpKDAsMS8wKShhLGIpfWZ1bmN0aW9uIGgoYSxiKXtyZXR1cm5bYSxiLGZ1bmN0aW9uKGEpe3JldHVybiBNYXRoLnJvdW5kKGQoMSwxLzAsYSkpfV19ZnVuY3Rpb24gaShhLGIpe3JldHVybiBmdW5jdGlvbihlLGYpe3JldHVybltlLGYsZnVuY3Rpb24oZSl7cmV0dXJuIGMoZChhLGIsZSkpfV19fWZ1bmN0aW9uIGooYSl7dmFyIGI9YS50cmltKCkuc3BsaXQoL1xccypbXFxzLF1cXHMqLyk7aWYoMCE9PWIubGVuZ3RoKXtmb3IodmFyIGM9W10sZD0wO2Q8Yi5sZW5ndGg7ZCsrKXt2YXIgZj1lKGJbZF0pO2lmKHZvaWQgMD09PWYpcmV0dXJuO2MucHVzaChmKX1yZXR1cm4gY319ZnVuY3Rpb24gayhhLGIpe2lmKGEubGVuZ3RoPT1iLmxlbmd0aClyZXR1cm5bYSxiLGZ1bmN0aW9uKGEpe3JldHVybiBhLm1hcChjKS5qb2luKFwiIFwiKX1dfWZ1bmN0aW9uIGwoYSxiKXtyZXR1cm5bYSxiLE1hdGgucm91bmRdfWEuY2xhbXA9ZCxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGosayxbXCJzdHJva2UtZGFzaGFycmF5XCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsaSgwLDEvMCksW1wiYm9yZGVyLWltYWdlLXdpZHRoXCIsXCJsaW5lLWhlaWdodFwiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihlLGkoMCwxKSxbXCJvcGFjaXR5XCIsXCJzaGFwZS1pbWFnZS10aHJlc2hvbGRcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxnLFtcImZsZXgtZ3Jvd1wiLFwiZmxleC1zaHJpbmtcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxoLFtcIm9ycGhhbnNcIixcIndpZG93c1wiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihlLGwsW1wiei1pbmRleFwiXSksYS5wYXJzZU51bWJlcj1lLGEucGFyc2VOdW1iZXJMaXN0PWosYS5tZXJnZU51bWJlcnM9ZixhLm51bWJlclRvU3RyaW5nPWN9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIpe2lmKFwidmlzaWJsZVwiPT1hfHxcInZpc2libGVcIj09YilyZXR1cm5bMCwxLGZ1bmN0aW9uKGMpe3JldHVybiBjPD0wP2E6Yz49MT9iOlwidmlzaWJsZVwifV19YS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihTdHJpbmcsYyxbXCJ2aXNpYmlsaXR5XCJdKX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe2E9YS50cmltKCksZi5maWxsU3R5bGU9XCIjMDAwXCIsZi5maWxsU3R5bGU9YTt2YXIgYj1mLmZpbGxTdHlsZTtpZihmLmZpbGxTdHlsZT1cIiNmZmZcIixmLmZpbGxTdHlsZT1hLGI9PWYuZmlsbFN0eWxlKXtmLmZpbGxSZWN0KDAsMCwxLDEpO3ZhciBjPWYuZ2V0SW1hZ2VEYXRhKDAsMCwxLDEpLmRhdGE7Zi5jbGVhclJlY3QoMCwwLDEsMSk7dmFyIGQ9Y1szXS8yNTU7cmV0dXJuW2NbMF0qZCxjWzFdKmQsY1syXSpkLGRdfX1mdW5jdGlvbiBkKGIsYyl7cmV0dXJuW2IsYyxmdW5jdGlvbihiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBNYXRoLm1heCgwLE1hdGgubWluKDI1NSxhKSl9aWYoYlszXSlmb3IodmFyIGQ9MDtkPDM7ZCsrKWJbZF09TWF0aC5yb3VuZChjKGJbZF0vYlszXSkpO3JldHVybiBiWzNdPWEubnVtYmVyVG9TdHJpbmcoYS5jbGFtcCgwLDEsYlszXSkpLFwicmdiYShcIitiLmpvaW4oXCIsXCIpK1wiKVwifV19dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiY2FudmFzXCIpO2Uud2lkdGg9ZS5oZWlnaHQ9MTt2YXIgZj1lLmdldENvbnRleHQoXCIyZFwiKTthLmFkZFByb3BlcnRpZXNIYW5kbGVyKGMsZCxbXCJiYWNrZ3JvdW5kLWNvbG9yXCIsXCJib3JkZXItYm90dG9tLWNvbG9yXCIsXCJib3JkZXItbGVmdC1jb2xvclwiLFwiYm9yZGVyLXJpZ2h0LWNvbG9yXCIsXCJib3JkZXItdG9wLWNvbG9yXCIsXCJjb2xvclwiLFwiZmlsbFwiLFwiZmxvb2QtY29sb3JcIixcImxpZ2h0aW5nLWNvbG9yXCIsXCJvdXRsaW5lLWNvbG9yXCIsXCJzdG9wLWNvbG9yXCIsXCJzdHJva2VcIixcInRleHQtZGVjb3JhdGlvbi1jb2xvclwiXSksYS5jb25zdW1lQ29sb3I9YS5jb25zdW1lUGFyZW50aGVzaXNlZC5iaW5kKG51bGwsYyksYS5tZXJnZUNvbG9ycz1kfShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7ZnVuY3Rpb24gYigpe3ZhciBiPWguZXhlYyhhKTtnPWI/YlswXTp2b2lkIDB9ZnVuY3Rpb24gYygpe3ZhciBhPU51bWJlcihnKTtyZXR1cm4gYigpLGF9ZnVuY3Rpb24gZCgpe2lmKFwiKFwiIT09ZylyZXR1cm4gYygpO2IoKTt2YXIgYT1mKCk7cmV0dXJuXCIpXCIhPT1nP05hTjooYigpLGEpfWZ1bmN0aW9uIGUoKXtmb3IodmFyIGE9ZCgpO1wiKlwiPT09Z3x8XCIvXCI9PT1nOyl7dmFyIGM9ZztiKCk7dmFyIGU9ZCgpO1wiKlwiPT09Yz9hKj1lOmEvPWV9cmV0dXJuIGF9ZnVuY3Rpb24gZigpe2Zvcih2YXIgYT1lKCk7XCIrXCI9PT1nfHxcIi1cIj09PWc7KXt2YXIgYz1nO2IoKTt2YXIgZD1lKCk7XCIrXCI9PT1jP2ErPWQ6YS09ZH1yZXR1cm4gYX12YXIgZyxoPS8oW1xcK1xcLVxcd1xcLl0rfFtcXChcXClcXCpcXC9dKS9nO3JldHVybiBiKCksZigpfWZ1bmN0aW9uIGQoYSxiKXtpZihcIjBcIj09KGI9Yi50cmltKCkudG9Mb3dlckNhc2UoKSkmJlwicHhcIi5zZWFyY2goYSk+PTApcmV0dXJue3B4OjB9O2lmKC9eW14oXSokfF5jYWxjLy50ZXN0KGIpKXtiPWIucmVwbGFjZSgvY2FsY1xcKC9nLFwiKFwiKTt2YXIgZD17fTtiPWIucmVwbGFjZShhLGZ1bmN0aW9uKGEpe3JldHVybiBkW2FdPW51bGwsXCJVXCIrYX0pO2Zvcih2YXIgZT1cIlUoXCIrYS5zb3VyY2UrXCIpXCIsZj1iLnJlcGxhY2UoL1stK10/KFxcZCpcXC4pP1xcZCsoW0VlXVstK10/XFxkKyk/L2csXCJOXCIpLnJlcGxhY2UobmV3IFJlZ0V4cChcIk5cIitlLFwiZ1wiKSxcIkRcIikucmVwbGFjZSgvXFxzWystXVxccy9nLFwiT1wiKS5yZXBsYWNlKC9cXHMvZyxcIlwiKSxnPVsvTlxcKihEKS9nLC8oTnxEKVsqXFwvXU4vZywvKE58RClPXFwxL2csL1xcKChOfEQpXFwpL2ddLGg9MDtoPGcubGVuZ3RoOylnW2hdLnRlc3QoZik/KGY9Zi5yZXBsYWNlKGdbaF0sXCIkMVwiKSxoPTApOmgrKztpZihcIkRcIj09Zil7Zm9yKHZhciBpIGluIGQpe3ZhciBqPWMoYi5yZXBsYWNlKG5ldyBSZWdFeHAoXCJVXCIraSxcImdcIiksXCJcIikucmVwbGFjZShuZXcgUmVnRXhwKGUsXCJnXCIpLFwiKjBcIikpO2lmKCFpc0Zpbml0ZShqKSlyZXR1cm47ZFtpXT1qfXJldHVybiBkfX19ZnVuY3Rpb24gZShhLGIpe3JldHVybiBmKGEsYiwhMCl9ZnVuY3Rpb24gZihiLGMsZCl7dmFyIGUsZj1bXTtmb3IoZSBpbiBiKWYucHVzaChlKTtmb3IoZSBpbiBjKWYuaW5kZXhPZihlKTwwJiZmLnB1c2goZSk7cmV0dXJuIGI9Zi5tYXAoZnVuY3Rpb24oYSl7cmV0dXJuIGJbYV18fDB9KSxjPWYubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBjW2FdfHwwfSksW2IsYyxmdW5jdGlvbihiKXt2YXIgYz1iLm1hcChmdW5jdGlvbihjLGUpe3JldHVybiAxPT1iLmxlbmd0aCYmZCYmKGM9TWF0aC5tYXgoYywwKSksYS5udW1iZXJUb1N0cmluZyhjKStmW2VdfSkuam9pbihcIiArIFwiKTtyZXR1cm4gYi5sZW5ndGg+MT9cImNhbGMoXCIrYytcIilcIjpjfV19dmFyIGc9XCJweHxlbXxleHxjaHxyZW18dnd8dmh8dm1pbnx2bWF4fGNtfG1tfGlufHB0fHBjXCIsaD1kLmJpbmQobnVsbCxuZXcgUmVnRXhwKGcsXCJnXCIpKSxpPWQuYmluZChudWxsLG5ldyBSZWdFeHAoZytcInwlXCIsXCJnXCIpKSxqPWQuYmluZChudWxsLC9kZWd8cmFkfGdyYWR8dHVybi9nKTthLnBhcnNlTGVuZ3RoPWgsYS5wYXJzZUxlbmd0aE9yUGVyY2VudD1pLGEuY29uc3VtZUxlbmd0aE9yUGVyY2VudD1hLmNvbnN1bWVQYXJlbnRoZXNpc2VkLmJpbmQobnVsbCxpKSxhLnBhcnNlQW5nbGU9aixhLm1lcmdlRGltZW5zaW9ucz1mO3ZhciBrPWEuY29uc3VtZVBhcmVudGhlc2lzZWQuYmluZChudWxsLGgpLGw9YS5jb25zdW1lUmVwZWF0ZWQuYmluZCh2b2lkIDAsaywvXi8pLG09YS5jb25zdW1lUmVwZWF0ZWQuYmluZCh2b2lkIDAsbCwvXiwvKTthLmNvbnN1bWVTaXplUGFpckxpc3Q9bTt2YXIgbj1mdW5jdGlvbihhKXt2YXIgYj1tKGEpO2lmKGImJlwiXCI9PWJbMV0pcmV0dXJuIGJbMF19LG89YS5tZXJnZU5lc3RlZFJlcGVhdGVkLmJpbmQodm9pZCAwLGUsXCIgXCIpLHA9YS5tZXJnZU5lc3RlZFJlcGVhdGVkLmJpbmQodm9pZCAwLG8sXCIsXCIpO2EubWVyZ2VOb25OZWdhdGl2ZVNpemVQYWlyPW8sYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihuLHAsW1wiYmFja2dyb3VuZC1zaXplXCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGksZSxbXCJib3JkZXItYm90dG9tLXdpZHRoXCIsXCJib3JkZXItaW1hZ2Utd2lkdGhcIixcImJvcmRlci1sZWZ0LXdpZHRoXCIsXCJib3JkZXItcmlnaHQtd2lkdGhcIixcImJvcmRlci10b3Atd2lkdGhcIixcImZsZXgtYmFzaXNcIixcImZvbnQtc2l6ZVwiLFwiaGVpZ2h0XCIsXCJsaW5lLWhlaWdodFwiLFwibWF4LWhlaWdodFwiLFwibWF4LXdpZHRoXCIsXCJvdXRsaW5lLXdpZHRoXCIsXCJ3aWR0aFwiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihpLGYsW1wiYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1c1wiLFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIixcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIixcImJvcmRlci10b3AtcmlnaHQtcmFkaXVzXCIsXCJib3R0b21cIixcImxlZnRcIixcImxldHRlci1zcGFjaW5nXCIsXCJtYXJnaW4tYm90dG9tXCIsXCJtYXJnaW4tbGVmdFwiLFwibWFyZ2luLXJpZ2h0XCIsXCJtYXJnaW4tdG9wXCIsXCJtaW4taGVpZ2h0XCIsXCJtaW4td2lkdGhcIixcIm91dGxpbmUtb2Zmc2V0XCIsXCJwYWRkaW5nLWJvdHRvbVwiLFwicGFkZGluZy1sZWZ0XCIsXCJwYWRkaW5nLXJpZ2h0XCIsXCJwYWRkaW5nLXRvcFwiLFwicGVyc3BlY3RpdmVcIixcInJpZ2h0XCIsXCJzaGFwZS1tYXJnaW5cIixcInN0cm9rZS1kYXNob2Zmc2V0XCIsXCJ0ZXh0LWluZGVudFwiLFwidG9wXCIsXCJ2ZXJ0aWNhbC1hbGlnblwiLFwid29yZC1zcGFjaW5nXCJdKX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGIpe3JldHVybiBhLmNvbnN1bWVMZW5ndGhPclBlcmNlbnQoYil8fGEuY29uc3VtZVRva2VuKC9eYXV0by8sYil9ZnVuY3Rpb24gZChiKXt2YXIgZD1hLmNvbnN1bWVMaXN0KFthLmlnbm9yZShhLmNvbnN1bWVUb2tlbi5iaW5kKG51bGwsL15yZWN0LykpLGEuaWdub3JlKGEuY29uc3VtZVRva2VuLmJpbmQobnVsbCwvXlxcKC8pKSxhLmNvbnN1bWVSZXBlYXRlZC5iaW5kKG51bGwsYywvXiwvKSxhLmlnbm9yZShhLmNvbnN1bWVUb2tlbi5iaW5kKG51bGwsL15cXCkvKSldLGIpO2lmKGQmJjQ9PWRbMF0ubGVuZ3RoKXJldHVybiBkWzBdfWZ1bmN0aW9uIGUoYixjKXtyZXR1cm5cImF1dG9cIj09Ynx8XCJhdXRvXCI9PWM/WyEwLCExLGZ1bmN0aW9uKGQpe3ZhciBlPWQ/YjpjO2lmKFwiYXV0b1wiPT1lKXJldHVyblwiYXV0b1wiO3ZhciBmPWEubWVyZ2VEaW1lbnNpb25zKGUsZSk7cmV0dXJuIGZbMl0oZlswXSl9XTphLm1lcmdlRGltZW5zaW9ucyhiLGMpfWZ1bmN0aW9uIGYoYSl7cmV0dXJuXCJyZWN0KFwiK2ErXCIpXCJ9dmFyIGc9YS5tZXJnZVdyYXBwZWROZXN0ZWRSZXBlYXRlZC5iaW5kKG51bGwsZixlLFwiLCBcIik7YS5wYXJzZUJveD1kLGEubWVyZ2VCb3hlcz1nLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZCxnLFtcImNsaXBcIl0pfShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3ZhciBjPTA7cmV0dXJuIGEubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBhPT09az9iW2MrK106YX0pfX1mdW5jdGlvbiBkKGEpe3JldHVybiBhfWZ1bmN0aW9uIGUoYil7aWYoXCJub25lXCI9PShiPWIudG9Mb3dlckNhc2UoKS50cmltKCkpKXJldHVybltdO2Zvcih2YXIgYyxkPS9cXHMqKFxcdyspXFwoKFteKV0qKVxcKS9nLGU9W10sZj0wO2M9ZC5leGVjKGIpOyl7aWYoYy5pbmRleCE9ZilyZXR1cm47Zj1jLmluZGV4K2NbMF0ubGVuZ3RoO3ZhciBnPWNbMV0saD1uW2ddO2lmKCFoKXJldHVybjt2YXIgaT1jWzJdLnNwbGl0KFwiLFwiKSxqPWhbMF07aWYoai5sZW5ndGg8aS5sZW5ndGgpcmV0dXJuO2Zvcih2YXIgaz1bXSxvPTA7bzxqLmxlbmd0aDtvKyspe3ZhciBwLHE9aVtvXSxyPWpbb107aWYodm9pZCAwPT09KHA9cT97QTpmdW5jdGlvbihiKXtyZXR1cm5cIjBcIj09Yi50cmltKCk/bTphLnBhcnNlQW5nbGUoYil9LE46YS5wYXJzZU51bWJlcixUOmEucGFyc2VMZW5ndGhPclBlcmNlbnQsTDphLnBhcnNlTGVuZ3RofVtyLnRvVXBwZXJDYXNlKCldKHEpOnthOm0sbjprWzBdLHQ6bH1bcl0pKXJldHVybjtrLnB1c2gocCl9aWYoZS5wdXNoKHt0OmcsZDprfSksZC5sYXN0SW5kZXg9PWIubGVuZ3RoKXJldHVybiBlfX1mdW5jdGlvbiBmKGEpe3JldHVybiBhLnRvRml4ZWQoNikucmVwbGFjZShcIi4wMDAwMDBcIixcIlwiKX1mdW5jdGlvbiBnKGIsYyl7aWYoYi5kZWNvbXBvc2l0aW9uUGFpciE9PWMpe2IuZGVjb21wb3NpdGlvblBhaXI9Yzt2YXIgZD1hLm1ha2VNYXRyaXhEZWNvbXBvc2l0aW9uKGIpfWlmKGMuZGVjb21wb3NpdGlvblBhaXIhPT1iKXtjLmRlY29tcG9zaXRpb25QYWlyPWI7dmFyIGU9YS5tYWtlTWF0cml4RGVjb21wb3NpdGlvbihjKX1yZXR1cm4gbnVsbD09ZFswXXx8bnVsbD09ZVswXT9bWyExXSxbITBdLGZ1bmN0aW9uKGEpe3JldHVybiBhP2NbMF0uZDpiWzBdLmR9XTooZFswXS5wdXNoKDApLGVbMF0ucHVzaCgxKSxbZCxlLGZ1bmN0aW9uKGIpe3ZhciBjPWEucXVhdChkWzBdWzNdLGVbMF1bM10sYls1XSk7cmV0dXJuIGEuY29tcG9zZU1hdHJpeChiWzBdLGJbMV0sYlsyXSxjLGJbNF0pLm1hcChmKS5qb2luKFwiLFwiKX1dKX1mdW5jdGlvbiBoKGEpe3JldHVybiBhLnJlcGxhY2UoL1t4eV0vLFwiXCIpfWZ1bmN0aW9uIGkoYSl7cmV0dXJuIGEucmVwbGFjZSgvKHh8eXx6fDNkKT8kLyxcIjNkXCIpfWZ1bmN0aW9uIGooYixjKXt2YXIgZD1hLm1ha2VNYXRyaXhEZWNvbXBvc2l0aW9uJiYhMCxlPSExO2lmKCFiLmxlbmd0aHx8IWMubGVuZ3RoKXtiLmxlbmd0aHx8KGU9ITAsYj1jLGM9W10pO2Zvcih2YXIgZj0wO2Y8Yi5sZW5ndGg7ZisrKXt2YXIgaj1iW2ZdLnQsaz1iW2ZdLmQsbD1cInNjYWxlXCI9PWouc3Vic3RyKDAsNSk/MTowO2MucHVzaCh7dDpqLGQ6ay5tYXAoZnVuY3Rpb24oYSl7aWYoXCJudW1iZXJcIj09dHlwZW9mIGEpcmV0dXJuIGw7dmFyIGI9e307Zm9yKHZhciBjIGluIGEpYltjXT1sO3JldHVybiBifSl9KX19dmFyIG09ZnVuY3Rpb24oYSxiKXtyZXR1cm5cInBlcnNwZWN0aXZlXCI9PWEmJlwicGVyc3BlY3RpdmVcIj09Ynx8KFwibWF0cml4XCI9PWF8fFwibWF0cml4M2RcIj09YSkmJihcIm1hdHJpeFwiPT1ifHxcIm1hdHJpeDNkXCI9PWIpfSxvPVtdLHA9W10scT1bXTtpZihiLmxlbmd0aCE9Yy5sZW5ndGgpe2lmKCFkKXJldHVybjt2YXIgcj1nKGIsYyk7bz1bclswXV0scD1bclsxXV0scT1bW1wibWF0cml4XCIsW3JbMl1dXV19ZWxzZSBmb3IodmFyIGY9MDtmPGIubGVuZ3RoO2YrKyl7dmFyIGoscz1iW2ZdLnQsdD1jW2ZdLnQsdT1iW2ZdLmQsdj1jW2ZdLmQsdz1uW3NdLHg9blt0XTtpZihtKHMsdCkpe2lmKCFkKXJldHVybjt2YXIgcj1nKFtiW2ZdXSxbY1tmXV0pO28ucHVzaChyWzBdKSxwLnB1c2goclsxXSkscS5wdXNoKFtcIm1hdHJpeFwiLFtyWzJdXV0pfWVsc2V7aWYocz09dClqPXM7ZWxzZSBpZih3WzJdJiZ4WzJdJiZoKHMpPT1oKHQpKWo9aChzKSx1PXdbMl0odSksdj14WzJdKHYpO2Vsc2V7aWYoIXdbMV18fCF4WzFdfHxpKHMpIT1pKHQpKXtpZighZClyZXR1cm47dmFyIHI9ZyhiLGMpO289W3JbMF1dLHA9W3JbMV1dLHE9W1tcIm1hdHJpeFwiLFtyWzJdXV1dO2JyZWFrfWo9aShzKSx1PXdbMV0odSksdj14WzFdKHYpfWZvcih2YXIgeT1bXSx6PVtdLEE9W10sQj0wO0I8dS5sZW5ndGg7QisrKXt2YXIgQz1cIm51bWJlclwiPT10eXBlb2YgdVtCXT9hLm1lcmdlTnVtYmVyczphLm1lcmdlRGltZW5zaW9ucyxyPUModVtCXSx2W0JdKTt5W0JdPXJbMF0seltCXT1yWzFdLEEucHVzaChyWzJdKX1vLnB1c2goeSkscC5wdXNoKHopLHEucHVzaChbaixBXSl9fWlmKGUpe3ZhciBEPW87bz1wLHA9RH1yZXR1cm5bbyxwLGZ1bmN0aW9uKGEpe3JldHVybiBhLm1hcChmdW5jdGlvbihhLGIpe3ZhciBjPWEubWFwKGZ1bmN0aW9uKGEsYyl7cmV0dXJuIHFbYl1bMV1bY10oYSl9KS5qb2luKFwiLFwiKTtyZXR1cm5cIm1hdHJpeFwiPT1xW2JdWzBdJiYxNj09Yy5zcGxpdChcIixcIikubGVuZ3RoJiYocVtiXVswXT1cIm1hdHJpeDNkXCIpLHFbYl1bMF0rXCIoXCIrYytcIilcIn0pLmpvaW4oXCIgXCIpfV19dmFyIGs9bnVsbCxsPXtweDowfSxtPXtkZWc6MH0sbj17bWF0cml4OltcIk5OTk5OTlwiLFtrLGssMCwwLGssaywwLDAsMCwwLDEsMCxrLGssMCwxXSxkXSxtYXRyaXgzZDpbXCJOTk5OTk5OTk5OTk5OTk5OXCIsZF0scm90YXRlOltcIkFcIl0scm90YXRleDpbXCJBXCJdLHJvdGF0ZXk6W1wiQVwiXSxyb3RhdGV6OltcIkFcIl0scm90YXRlM2Q6W1wiTk5OQVwiXSxwZXJzcGVjdGl2ZTpbXCJMXCJdLHNjYWxlOltcIk5uXCIsYyhbayxrLDFdKSxkXSxzY2FsZXg6W1wiTlwiLGMoW2ssMSwxXSksYyhbaywxXSldLHNjYWxleTpbXCJOXCIsYyhbMSxrLDFdKSxjKFsxLGtdKV0sc2NhbGV6OltcIk5cIixjKFsxLDEsa10pXSxzY2FsZTNkOltcIk5OTlwiLGRdLHNrZXc6W1wiQWFcIixudWxsLGRdLHNrZXd4OltcIkFcIixudWxsLGMoW2ssbV0pXSxza2V3eTpbXCJBXCIsbnVsbCxjKFttLGtdKV0sdHJhbnNsYXRlOltcIlR0XCIsYyhbayxrLGxdKSxkXSx0cmFuc2xhdGV4OltcIlRcIixjKFtrLGwsbF0pLGMoW2ssbF0pXSx0cmFuc2xhdGV5OltcIlRcIixjKFtsLGssbF0pLGMoW2wsa10pXSx0cmFuc2xhdGV6OltcIkxcIixjKFtsLGwsa10pXSx0cmFuc2xhdGUzZDpbXCJUVExcIixkXX07YS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihlLGosW1widHJhbnNmb3JtXCJdKSxhLnRyYW5zZm9ybVRvU3ZnTWF0cml4PWZ1bmN0aW9uKGIpe3ZhciBjPWEudHJhbnNmb3JtTGlzdFRvTWF0cml4KGUoYikpO3JldHVyblwibWF0cml4KFwiK2YoY1swXSkrXCIgXCIrZihjWzFdKStcIiBcIitmKGNbNF0pK1wiIFwiK2YoY1s1XSkrXCIgXCIrZihjWzEyXSkrXCIgXCIrZihjWzEzXSkrXCIpXCJ9fShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXtiLmNvbmNhdChbYV0pLmZvckVhY2goZnVuY3Rpb24oYil7YiBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUmJihkW2FdPWIpLGVbYl09YX0pfXZhciBkPXt9LGU9e307YyhcInRyYW5zZm9ybVwiLFtcIndlYmtpdFRyYW5zZm9ybVwiLFwibXNUcmFuc2Zvcm1cIl0pLGMoXCJ0cmFuc2Zvcm1PcmlnaW5cIixbXCJ3ZWJraXRUcmFuc2Zvcm1PcmlnaW5cIl0pLGMoXCJwZXJzcGVjdGl2ZVwiLFtcIndlYmtpdFBlcnNwZWN0aXZlXCJdKSxjKFwicGVyc3BlY3RpdmVPcmlnaW5cIixbXCJ3ZWJraXRQZXJzcGVjdGl2ZU9yaWdpblwiXSksYS5wcm9wZXJ0eU5hbWU9ZnVuY3Rpb24oYSl7cmV0dXJuIGRbYV18fGF9LGEudW5wcmVmaXhlZFByb3BlcnR5TmFtZT1mdW5jdGlvbihhKXtyZXR1cm4gZVthXXx8YX19KGQpfSgpLGZ1bmN0aW9uKCl7aWYodm9pZCAwPT09ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKS5hbmltYXRlKFtdKS5vbmNhbmNlbCl7dmFyIGE7aWYod2luZG93LnBlcmZvcm1hbmNlJiZwZXJmb3JtYW5jZS5ub3cpdmFyIGE9ZnVuY3Rpb24oKXtyZXR1cm4gcGVyZm9ybWFuY2Uubm93KCl9O2Vsc2UgdmFyIGE9ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3coKX07dmFyIGI9ZnVuY3Rpb24oYSxiLGMpe3RoaXMudGFyZ2V0PWEsdGhpcy5jdXJyZW50VGltZT1iLHRoaXMudGltZWxpbmVUaW1lPWMsdGhpcy50eXBlPVwiY2FuY2VsXCIsdGhpcy5idWJibGVzPSExLHRoaXMuY2FuY2VsYWJsZT0hMSx0aGlzLmN1cnJlbnRUYXJnZXQ9YSx0aGlzLmRlZmF1bHRQcmV2ZW50ZWQ9ITEsdGhpcy5ldmVudFBoYXNlPUV2ZW50LkFUX1RBUkdFVCx0aGlzLnRpbWVTdGFtcD1EYXRlLm5vdygpfSxjPXdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlO3dpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlPWZ1bmN0aW9uKGQsZSl7dmFyIGY9Yy5jYWxsKHRoaXMsZCxlKTtmLl9jYW5jZWxIYW5kbGVycz1bXSxmLm9uY2FuY2VsPW51bGw7dmFyIGc9Zi5jYW5jZWw7Zi5jYW5jZWw9ZnVuY3Rpb24oKXtnLmNhbGwodGhpcyk7dmFyIGM9bmV3IGIodGhpcyxudWxsLGEoKSksZD10aGlzLl9jYW5jZWxIYW5kbGVycy5jb25jYXQodGhpcy5vbmNhbmNlbD9bdGhpcy5vbmNhbmNlbF06W10pO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkLmZvckVhY2goZnVuY3Rpb24oYSl7YS5jYWxsKGMudGFyZ2V0LGMpfSl9LDApfTt2YXIgaD1mLmFkZEV2ZW50TGlzdGVuZXI7Zi5hZGRFdmVudExpc3RlbmVyPWZ1bmN0aW9uKGEsYil7XCJmdW5jdGlvblwiPT10eXBlb2YgYiYmXCJjYW5jZWxcIj09YT90aGlzLl9jYW5jZWxIYW5kbGVycy5wdXNoKGIpOmguY2FsbCh0aGlzLGEsYil9O3ZhciBpPWYucmVtb3ZlRXZlbnRMaXN0ZW5lcjtyZXR1cm4gZi5yZW1vdmVFdmVudExpc3RlbmVyPWZ1bmN0aW9uKGEsYil7aWYoXCJjYW5jZWxcIj09YSl7dmFyIGM9dGhpcy5fY2FuY2VsSGFuZGxlcnMuaW5kZXhPZihiKTtjPj0wJiZ0aGlzLl9jYW5jZWxIYW5kbGVycy5zcGxpY2UoYywxKX1lbHNlIGkuY2FsbCh0aGlzLGEsYil9LGZ9fX0oKSxmdW5jdGlvbihhKXt2YXIgYj1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsYz1udWxsLGQ9ITE7dHJ5e3ZhciBlPWdldENvbXB1dGVkU3R5bGUoYikuZ2V0UHJvcGVydHlWYWx1ZShcIm9wYWNpdHlcIiksZj1cIjBcIj09ZT9cIjFcIjpcIjBcIjtjPWIuYW5pbWF0ZSh7b3BhY2l0eTpbZixmXX0se2R1cmF0aW9uOjF9KSxjLmN1cnJlbnRUaW1lPTAsZD1nZXRDb21wdXRlZFN0eWxlKGIpLmdldFByb3BlcnR5VmFsdWUoXCJvcGFjaXR5XCIpPT1mfWNhdGNoKGEpe31maW5hbGx5e2MmJmMuY2FuY2VsKCl9aWYoIWQpe3ZhciBnPXdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlO3dpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlPWZ1bmN0aW9uKGIsYyl7cmV0dXJuIHdpbmRvdy5TeW1ib2wmJlN5bWJvbC5pdGVyYXRvciYmQXJyYXkucHJvdG90eXBlLmZyb20mJmJbU3ltYm9sLml0ZXJhdG9yXSYmKGI9QXJyYXkuZnJvbShiKSksQXJyYXkuaXNBcnJheShiKXx8bnVsbD09PWJ8fChiPWEuY29udmVydFRvQXJyYXlGb3JtKGIpKSxnLmNhbGwodGhpcyxiLGMpfX19KGMpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe3ZhciBjPWIudGltZWxpbmU7Yy5jdXJyZW50VGltZT1hLGMuX2Rpc2NhcmRBbmltYXRpb25zKCksMD09Yy5fYW5pbWF0aW9ucy5sZW5ndGg/Zj0hMTpyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZCl9dmFyIGU9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTt3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGEpe3JldHVybiBlKGZ1bmN0aW9uKGMpe2IudGltZWxpbmUuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpLGEoYyksYi50aW1lbGluZS5fdXBkYXRlQW5pbWF0aW9uc1Byb21pc2VzKCl9KX0sYi5BbmltYXRpb25UaW1lbGluZT1mdW5jdGlvbigpe3RoaXMuX2FuaW1hdGlvbnM9W10sdGhpcy5jdXJyZW50VGltZT12b2lkIDB9LGIuQW5pbWF0aW9uVGltZWxpbmUucHJvdG90eXBlPXtnZXRBbmltYXRpb25zOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2Rpc2NhcmRBbmltYXRpb25zKCksdGhpcy5fYW5pbWF0aW9ucy5zbGljZSgpfSxfdXBkYXRlQW5pbWF0aW9uc1Byb21pc2VzOmZ1bmN0aW9uKCl7Yi5hbmltYXRpb25zV2l0aFByb21pc2VzPWIuYW5pbWF0aW9uc1dpdGhQcm9taXNlcy5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIGEuX3VwZGF0ZVByb21pc2VzKCl9KX0sX2Rpc2NhcmRBbmltYXRpb25zOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlQW5pbWF0aW9uc1Byb21pc2VzKCksdGhpcy5fYW5pbWF0aW9ucz10aGlzLl9hbmltYXRpb25zLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm5cImZpbmlzaGVkXCIhPWEucGxheVN0YXRlJiZcImlkbGVcIiE9YS5wbGF5U3RhdGV9KX0sX3BsYXk6ZnVuY3Rpb24oYSl7dmFyIGM9bmV3IGIuQW5pbWF0aW9uKGEsdGhpcyk7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbnMucHVzaChjKSxiLnJlc3RhcnRXZWJBbmltYXRpb25zTmV4dFRpY2soKSxjLl91cGRhdGVQcm9taXNlcygpLGMuX2FuaW1hdGlvbi5wbGF5KCksYy5fdXBkYXRlUHJvbWlzZXMoKSxjfSxwbGF5OmZ1bmN0aW9uKGEpe3JldHVybiBhJiZhLnJlbW92ZSgpLHRoaXMuX3BsYXkoYSl9fTt2YXIgZj0hMTtiLnJlc3RhcnRXZWJBbmltYXRpb25zTmV4dFRpY2s9ZnVuY3Rpb24oKXtmfHwoZj0hMCxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZCkpfTt2YXIgZz1uZXcgYi5BbmltYXRpb25UaW1lbGluZTtiLnRpbWVsaW5lPWc7dHJ5e09iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuZG9jdW1lbnQsXCJ0aW1lbGluZVwiLHtjb25maWd1cmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGd9fSl9Y2F0Y2goYSl7fXRyeXt3aW5kb3cuZG9jdW1lbnQudGltZWxpbmU9Z31jYXRjaChhKXt9fSgwLGUpLGZ1bmN0aW9uKGEsYixjKXtiLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXM9W10sYi5BbmltYXRpb249ZnVuY3Rpb24oYixjKXtpZih0aGlzLmlkPVwiXCIsYiYmYi5faWQmJih0aGlzLmlkPWIuX2lkKSx0aGlzLmVmZmVjdD1iLGImJihiLl9hbmltYXRpb249dGhpcyksIWMpdGhyb3cgbmV3IEVycm9yKFwiQW5pbWF0aW9uIHdpdGggbnVsbCB0aW1lbGluZSBpcyBub3Qgc3VwcG9ydGVkXCIpO3RoaXMuX3RpbWVsaW5lPWMsdGhpcy5fc2VxdWVuY2VOdW1iZXI9YS5zZXF1ZW5jZU51bWJlcisrLHRoaXMuX2hvbGRUaW1lPTAsdGhpcy5fcGF1c2VkPSExLHRoaXMuX2lzR3JvdXA9ITEsdGhpcy5fYW5pbWF0aW9uPW51bGwsdGhpcy5fY2hpbGRBbmltYXRpb25zPVtdLHRoaXMuX2NhbGxiYWNrPW51bGwsdGhpcy5fb2xkUGxheVN0YXRlPVwiaWRsZVwiLHRoaXMuX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uKCksdGhpcy5fYW5pbWF0aW9uLmNhbmNlbCgpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LGIuQW5pbWF0aW9uLnByb3RvdHlwZT17X3VwZGF0ZVByb21pc2VzOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fb2xkUGxheVN0YXRlLGI9dGhpcy5wbGF5U3RhdGU7cmV0dXJuIHRoaXMuX3JlYWR5UHJvbWlzZSYmYiE9PWEmJihcImlkbGVcIj09Yj8odGhpcy5fcmVqZWN0UmVhZHlQcm9taXNlKCksdGhpcy5fcmVhZHlQcm9taXNlPXZvaWQgMCk6XCJwZW5kaW5nXCI9PWE/dGhpcy5fcmVzb2x2ZVJlYWR5UHJvbWlzZSgpOlwicGVuZGluZ1wiPT1iJiYodGhpcy5fcmVhZHlQcm9taXNlPXZvaWQgMCkpLHRoaXMuX2ZpbmlzaGVkUHJvbWlzZSYmYiE9PWEmJihcImlkbGVcIj09Yj8odGhpcy5fcmVqZWN0RmluaXNoZWRQcm9taXNlKCksdGhpcy5fZmluaXNoZWRQcm9taXNlPXZvaWQgMCk6XCJmaW5pc2hlZFwiPT1iP3RoaXMuX3Jlc29sdmVGaW5pc2hlZFByb21pc2UoKTpcImZpbmlzaGVkXCI9PWEmJih0aGlzLl9maW5pc2hlZFByb21pc2U9dm9pZCAwKSksdGhpcy5fb2xkUGxheVN0YXRlPXRoaXMucGxheVN0YXRlLHRoaXMuX3JlYWR5UHJvbWlzZXx8dGhpcy5fZmluaXNoZWRQcm9taXNlfSxfcmVidWlsZFVuZGVybHlpbmdBbmltYXRpb246ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpO3ZhciBhLGMsZCxlLGY9ISF0aGlzLl9hbmltYXRpb247ZiYmKGE9dGhpcy5wbGF5YmFja1JhdGUsYz10aGlzLl9wYXVzZWQsZD10aGlzLnN0YXJ0VGltZSxlPXRoaXMuY3VycmVudFRpbWUsdGhpcy5fYW5pbWF0aW9uLmNhbmNlbCgpLHRoaXMuX2FuaW1hdGlvbi5fd3JhcHBlcj1udWxsLHRoaXMuX2FuaW1hdGlvbj1udWxsKSwoIXRoaXMuZWZmZWN0fHx0aGlzLmVmZmVjdCBpbnN0YW5jZW9mIHdpbmRvdy5LZXlmcmFtZUVmZmVjdCkmJih0aGlzLl9hbmltYXRpb249Yi5uZXdVbmRlcmx5aW5nQW5pbWF0aW9uRm9yS2V5ZnJhbWVFZmZlY3QodGhpcy5lZmZlY3QpLGIuYmluZEFuaW1hdGlvbkZvcktleWZyYW1lRWZmZWN0KHRoaXMpKSwodGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3R8fHRoaXMuZWZmZWN0IGluc3RhbmNlb2Ygd2luZG93Lkdyb3VwRWZmZWN0KSYmKHRoaXMuX2FuaW1hdGlvbj1iLm5ld1VuZGVybHlpbmdBbmltYXRpb25Gb3JHcm91cCh0aGlzLmVmZmVjdCksYi5iaW5kQW5pbWF0aW9uRm9yR3JvdXAodGhpcykpLHRoaXMuZWZmZWN0JiZ0aGlzLmVmZmVjdC5fb25zYW1wbGUmJmIuYmluZEFuaW1hdGlvbkZvckN1c3RvbUVmZmVjdCh0aGlzKSxmJiYoMSE9YSYmKHRoaXMucGxheWJhY2tSYXRlPWEpLG51bGwhPT1kP3RoaXMuc3RhcnRUaW1lPWQ6bnVsbCE9PWU/dGhpcy5jdXJyZW50VGltZT1lOm51bGwhPT10aGlzLl9ob2xkVGltZSYmKHRoaXMuY3VycmVudFRpbWU9dGhpcy5faG9sZFRpbWUpLGMmJnRoaXMucGF1c2UoKSksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sX3VwZGF0ZUNoaWxkcmVuOmZ1bmN0aW9uKCl7aWYodGhpcy5lZmZlY3QmJlwiaWRsZVwiIT10aGlzLnBsYXlTdGF0ZSl7dmFyIGE9dGhpcy5lZmZlY3QuX3RpbWluZy5kZWxheTt0aGlzLl9jaGlsZEFuaW1hdGlvbnMuZm9yRWFjaChmdW5jdGlvbihjKXt0aGlzLl9hcnJhbmdlQ2hpbGRyZW4oYyxhKSx0aGlzLmVmZmVjdCBpbnN0YW5jZW9mIHdpbmRvdy5TZXF1ZW5jZUVmZmVjdCYmKGErPWIuZ3JvdXBDaGlsZER1cmF0aW9uKGMuZWZmZWN0KSl9LmJpbmQodGhpcykpfX0sX3NldEV4dGVybmFsQW5pbWF0aW9uOmZ1bmN0aW9uKGEpe2lmKHRoaXMuZWZmZWN0JiZ0aGlzLl9pc0dyb3VwKWZvcih2YXIgYj0wO2I8dGhpcy5lZmZlY3QuY2hpbGRyZW4ubGVuZ3RoO2IrKyl0aGlzLmVmZmVjdC5jaGlsZHJlbltiXS5fYW5pbWF0aW9uPWEsdGhpcy5fY2hpbGRBbmltYXRpb25zW2JdLl9zZXRFeHRlcm5hbEFuaW1hdGlvbihhKX0sX2NvbnN0cnVjdENoaWxkQW5pbWF0aW9uczpmdW5jdGlvbigpe2lmKHRoaXMuZWZmZWN0JiZ0aGlzLl9pc0dyb3VwKXt2YXIgYT10aGlzLmVmZmVjdC5fdGltaW5nLmRlbGF5O3RoaXMuX3JlbW92ZUNoaWxkQW5pbWF0aW9ucygpLHRoaXMuZWZmZWN0LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7dmFyIGQ9Yi50aW1lbGluZS5fcGxheShjKTt0aGlzLl9jaGlsZEFuaW1hdGlvbnMucHVzaChkKSxkLnBsYXliYWNrUmF0ZT10aGlzLnBsYXliYWNrUmF0ZSx0aGlzLl9wYXVzZWQmJmQucGF1c2UoKSxjLl9hbmltYXRpb249dGhpcy5lZmZlY3QuX2FuaW1hdGlvbix0aGlzLl9hcnJhbmdlQ2hpbGRyZW4oZCxhKSx0aGlzLmVmZmVjdCBpbnN0YW5jZW9mIHdpbmRvdy5TZXF1ZW5jZUVmZmVjdCYmKGErPWIuZ3JvdXBDaGlsZER1cmF0aW9uKGMpKX0uYmluZCh0aGlzKSl9fSxfYXJyYW5nZUNoaWxkcmVuOmZ1bmN0aW9uKGEsYil7bnVsbD09PXRoaXMuc3RhcnRUaW1lP2EuY3VycmVudFRpbWU9dGhpcy5jdXJyZW50VGltZS1iL3RoaXMucGxheWJhY2tSYXRlOmEuc3RhcnRUaW1lIT09dGhpcy5zdGFydFRpbWUrYi90aGlzLnBsYXliYWNrUmF0ZSYmKGEuc3RhcnRUaW1lPXRoaXMuc3RhcnRUaW1lK2IvdGhpcy5wbGF5YmFja1JhdGUpfSxnZXQgdGltZWxpbmUoKXtyZXR1cm4gdGhpcy5fdGltZWxpbmV9LGdldCBwbGF5U3RhdGUoKXtyZXR1cm4gdGhpcy5fYW5pbWF0aW9uP3RoaXMuX2FuaW1hdGlvbi5wbGF5U3RhdGU6XCJpZGxlXCJ9LGdldCBmaW5pc2hlZCgpe3JldHVybiB3aW5kb3cuUHJvbWlzZT8odGhpcy5fZmluaXNoZWRQcm9taXNlfHwoLTE9PWIuYW5pbWF0aW9uc1dpdGhQcm9taXNlcy5pbmRleE9mKHRoaXMpJiZiLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXMucHVzaCh0aGlzKSx0aGlzLl9maW5pc2hlZFByb21pc2U9bmV3IFByb21pc2UoZnVuY3Rpb24oYSxiKXt0aGlzLl9yZXNvbHZlRmluaXNoZWRQcm9taXNlPWZ1bmN0aW9uKCl7YSh0aGlzKX0sdGhpcy5fcmVqZWN0RmluaXNoZWRQcm9taXNlPWZ1bmN0aW9uKCl7Yih7dHlwZTpET01FeGNlcHRpb24uQUJPUlRfRVJSLG5hbWU6XCJBYm9ydEVycm9yXCJ9KX19LmJpbmQodGhpcykpLFwiZmluaXNoZWRcIj09dGhpcy5wbGF5U3RhdGUmJnRoaXMuX3Jlc29sdmVGaW5pc2hlZFByb21pc2UoKSksdGhpcy5fZmluaXNoZWRQcm9taXNlKTooY29uc29sZS53YXJuKFwiQW5pbWF0aW9uIFByb21pc2VzIHJlcXVpcmUgSmF2YVNjcmlwdCBQcm9taXNlIGNvbnN0cnVjdG9yXCIpLG51bGwpfSxnZXQgcmVhZHkoKXtyZXR1cm4gd2luZG93LlByb21pc2U/KHRoaXMuX3JlYWR5UHJvbWlzZXx8KC0xPT1iLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXMuaW5kZXhPZih0aGlzKSYmYi5hbmltYXRpb25zV2l0aFByb21pc2VzLnB1c2godGhpcyksdGhpcy5fcmVhZHlQcm9taXNlPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGEsYil7dGhpcy5fcmVzb2x2ZVJlYWR5UHJvbWlzZT1mdW5jdGlvbigpe2EodGhpcyl9LHRoaXMuX3JlamVjdFJlYWR5UHJvbWlzZT1mdW5jdGlvbigpe2Ioe3R5cGU6RE9NRXhjZXB0aW9uLkFCT1JUX0VSUixuYW1lOlwiQWJvcnRFcnJvclwifSl9fS5iaW5kKHRoaXMpKSxcInBlbmRpbmdcIiE9PXRoaXMucGxheVN0YXRlJiZ0aGlzLl9yZXNvbHZlUmVhZHlQcm9taXNlKCkpLHRoaXMuX3JlYWR5UHJvbWlzZSk6KGNvbnNvbGUud2FybihcIkFuaW1hdGlvbiBQcm9taXNlcyByZXF1aXJlIEphdmFTY3JpcHQgUHJvbWlzZSBjb25zdHJ1Y3RvclwiKSxudWxsKX0sZ2V0IG9uZmluaXNoKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbi5vbmZpbmlzaH0sc2V0IG9uZmluaXNoKGEpe3RoaXMuX2FuaW1hdGlvbi5vbmZpbmlzaD1cImZ1bmN0aW9uXCI9PXR5cGVvZiBhP2Z1bmN0aW9uKGIpe2IudGFyZ2V0PXRoaXMsYS5jYWxsKHRoaXMsYil9LmJpbmQodGhpcyk6YX0sZ2V0IG9uY2FuY2VsKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbi5vbmNhbmNlbH0sc2V0IG9uY2FuY2VsKGEpe3RoaXMuX2FuaW1hdGlvbi5vbmNhbmNlbD1cImZ1bmN0aW9uXCI9PXR5cGVvZiBhP2Z1bmN0aW9uKGIpe2IudGFyZ2V0PXRoaXMsYS5jYWxsKHRoaXMsYil9LmJpbmQodGhpcyk6YX0sZ2V0IGN1cnJlbnRUaW1lKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKTt2YXIgYT10aGlzLl9hbmltYXRpb24uY3VycmVudFRpbWU7cmV0dXJuIHRoaXMuX3VwZGF0ZVByb21pc2VzKCksYX0sc2V0IGN1cnJlbnRUaW1lKGEpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCksdGhpcy5fYW5pbWF0aW9uLmN1cnJlbnRUaW1lPWlzRmluaXRlKGEpP2E6TWF0aC5zaWduKGEpKk51bWJlci5NQVhfVkFMVUUsdGhpcy5fcmVnaXN0ZXIoKSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYixjKXtiLmN1cnJlbnRUaW1lPWEtY30pLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LGdldCBzdGFydFRpbWUoKXtyZXR1cm4gdGhpcy5fYW5pbWF0aW9uLnN0YXJ0VGltZX0sc2V0IHN0YXJ0VGltZShhKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbi5zdGFydFRpbWU9aXNGaW5pdGUoYSk/YTpNYXRoLnNpZ24oYSkqTnVtYmVyLk1BWF9WQUxVRSx0aGlzLl9yZWdpc3RlcigpLHRoaXMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihiLGMpe2Iuc3RhcnRUaW1lPWErY30pLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LGdldCBwbGF5YmFja1JhdGUoKXtyZXR1cm4gdGhpcy5fYW5pbWF0aW9uLnBsYXliYWNrUmF0ZX0sc2V0IHBsYXliYWNrUmF0ZShhKXt0aGlzLl91cGRhdGVQcm9taXNlcygpO3ZhciBiPXRoaXMuY3VycmVudFRpbWU7dGhpcy5fYW5pbWF0aW9uLnBsYXliYWNrUmF0ZT1hLHRoaXMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihiKXtiLnBsYXliYWNrUmF0ZT1hfSksbnVsbCE9PWImJih0aGlzLmN1cnJlbnRUaW1lPWIpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LHBsYXk6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuX3BhdXNlZD0hMSx0aGlzLl9hbmltYXRpb24ucGxheSgpLC0xPT10aGlzLl90aW1lbGluZS5fYW5pbWF0aW9ucy5pbmRleE9mKHRoaXMpJiZ0aGlzLl90aW1lbGluZS5fYW5pbWF0aW9ucy5wdXNoKHRoaXMpLHRoaXMuX3JlZ2lzdGVyKCksYi5hd2FpdFN0YXJ0VGltZSh0aGlzKSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYSl7dmFyIGI9YS5jdXJyZW50VGltZTthLnBsYXkoKSxhLmN1cnJlbnRUaW1lPWJ9KSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxwYXVzZTpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCksdGhpcy5jdXJyZW50VGltZSYmKHRoaXMuX2hvbGRUaW1lPXRoaXMuY3VycmVudFRpbWUpLHRoaXMuX2FuaW1hdGlvbi5wYXVzZSgpLHRoaXMuX3JlZ2lzdGVyKCksdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGEpe2EucGF1c2UoKX0pLHRoaXMuX3BhdXNlZD0hMCx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxmaW5pc2g6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbi5maW5pc2goKSx0aGlzLl9yZWdpc3RlcigpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LGNhbmNlbDpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCksdGhpcy5fYW5pbWF0aW9uLmNhbmNlbCgpLHRoaXMuX3JlZ2lzdGVyKCksdGhpcy5fcmVtb3ZlQ2hpbGRBbmltYXRpb25zKCksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0scmV2ZXJzZTpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCk7dmFyIGE9dGhpcy5jdXJyZW50VGltZTt0aGlzLl9hbmltYXRpb24ucmV2ZXJzZSgpLHRoaXMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihhKXthLnJldmVyc2UoKX0pLG51bGwhPT1hJiYodGhpcy5jdXJyZW50VGltZT1hKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxhZGRFdmVudExpc3RlbmVyOmZ1bmN0aW9uKGEsYil7dmFyIGM9YjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBiJiYoYz1mdW5jdGlvbihhKXthLnRhcmdldD10aGlzLGIuY2FsbCh0aGlzLGEpfS5iaW5kKHRoaXMpLGIuX3dyYXBwZXI9YyksdGhpcy5fYW5pbWF0aW9uLmFkZEV2ZW50TGlzdGVuZXIoYSxjKX0scmVtb3ZlRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbihhLGIpe3RoaXMuX2FuaW1hdGlvbi5yZW1vdmVFdmVudExpc3RlbmVyKGEsYiYmYi5fd3JhcHBlcnx8Yil9LF9yZW1vdmVDaGlsZEFuaW1hdGlvbnM6ZnVuY3Rpb24oKXtmb3IoO3RoaXMuX2NoaWxkQW5pbWF0aW9ucy5sZW5ndGg7KXRoaXMuX2NoaWxkQW5pbWF0aW9ucy5wb3AoKS5jYW5jZWwoKX0sX2ZvckVhY2hDaGlsZDpmdW5jdGlvbihiKXt2YXIgYz0wO2lmKHRoaXMuZWZmZWN0LmNoaWxkcmVuJiZ0aGlzLl9jaGlsZEFuaW1hdGlvbnMubGVuZ3RoPHRoaXMuZWZmZWN0LmNoaWxkcmVuLmxlbmd0aCYmdGhpcy5fY29uc3RydWN0Q2hpbGRBbmltYXRpb25zKCksdGhpcy5fY2hpbGRBbmltYXRpb25zLmZvckVhY2goZnVuY3Rpb24oYSl7Yi5jYWxsKHRoaXMsYSxjKSx0aGlzLmVmZmVjdCBpbnN0YW5jZW9mIHdpbmRvdy5TZXF1ZW5jZUVmZmVjdCYmKGMrPWEuZWZmZWN0LmFjdGl2ZUR1cmF0aW9uKX0uYmluZCh0aGlzKSksXCJwZW5kaW5nXCIhPXRoaXMucGxheVN0YXRlKXt2YXIgZD10aGlzLmVmZmVjdC5fdGltaW5nLGU9dGhpcy5jdXJyZW50VGltZTtudWxsIT09ZSYmKGU9YS5jYWxjdWxhdGVJdGVyYXRpb25Qcm9ncmVzcyhhLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uKGQpLGUsZCkpLChudWxsPT1lfHxpc05hTihlKSkmJnRoaXMuX3JlbW92ZUNoaWxkQW5pbWF0aW9ucygpfX19LHdpbmRvdy5BbmltYXRpb249Yi5BbmltYXRpb259KGMsZSksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYil7dGhpcy5fZnJhbWVzPWEubm9ybWFsaXplS2V5ZnJhbWVzKGIpfWZ1bmN0aW9uIGUoKXtmb3IodmFyIGE9ITE7aS5sZW5ndGg7KWkuc2hpZnQoKS5fdXBkYXRlQ2hpbGRyZW4oKSxhPSEwO3JldHVybiBhfXZhciBmPWZ1bmN0aW9uKGEpe2lmKGEuX2FuaW1hdGlvbj12b2lkIDAsYSBpbnN0YW5jZW9mIHdpbmRvdy5TZXF1ZW5jZUVmZmVjdHx8YSBpbnN0YW5jZW9mIHdpbmRvdy5Hcm91cEVmZmVjdClmb3IodmFyIGI9MDtiPGEuY2hpbGRyZW4ubGVuZ3RoO2IrKylmKGEuY2hpbGRyZW5bYl0pfTtiLnJlbW92ZU11bHRpPWZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1bXSxjPTA7YzxhLmxlbmd0aDtjKyspe3ZhciBkPWFbY107ZC5fcGFyZW50PygtMT09Yi5pbmRleE9mKGQuX3BhcmVudCkmJmIucHVzaChkLl9wYXJlbnQpLGQuX3BhcmVudC5jaGlsZHJlbi5zcGxpY2UoZC5fcGFyZW50LmNoaWxkcmVuLmluZGV4T2YoZCksMSksZC5fcGFyZW50PW51bGwsZihkKSk6ZC5fYW5pbWF0aW9uJiZkLl9hbmltYXRpb24uZWZmZWN0PT1kJiYoZC5fYW5pbWF0aW9uLmNhbmNlbCgpLGQuX2FuaW1hdGlvbi5lZmZlY3Q9bmV3IEtleWZyYW1lRWZmZWN0KG51bGwsW10pLGQuX2FuaW1hdGlvbi5fY2FsbGJhY2smJihkLl9hbmltYXRpb24uX2NhbGxiYWNrLl9hbmltYXRpb249bnVsbCksZC5fYW5pbWF0aW9uLl9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbigpLGYoZCkpfWZvcihjPTA7YzxiLmxlbmd0aDtjKyspYltjXS5fcmVidWlsZCgpfSxiLktleWZyYW1lRWZmZWN0PWZ1bmN0aW9uKGIsYyxlLGYpe3JldHVybiB0aGlzLnRhcmdldD1iLHRoaXMuX3BhcmVudD1udWxsLGU9YS5udW1lcmljVGltaW5nVG9PYmplY3QoZSksdGhpcy5fdGltaW5nSW5wdXQ9YS5jbG9uZVRpbWluZ0lucHV0KGUpLHRoaXMuX3RpbWluZz1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KGUpLHRoaXMudGltaW5nPWEubWFrZVRpbWluZyhlLCExLHRoaXMpLHRoaXMudGltaW5nLl9lZmZlY3Q9dGhpcyxcImZ1bmN0aW9uXCI9PXR5cGVvZiBjPyhhLmRlcHJlY2F0ZWQoXCJDdXN0b20gS2V5ZnJhbWVFZmZlY3RcIixcIjIwMTUtMDYtMjJcIixcIlVzZSBLZXlmcmFtZUVmZmVjdC5vbnNhbXBsZSBpbnN0ZWFkLlwiKSx0aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzPWMpOnRoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXM9bmV3IGQoYyksdGhpcy5fa2V5ZnJhbWVzPWMsdGhpcy5hY3RpdmVEdXJhdGlvbj1hLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uKHRoaXMuX3RpbWluZyksdGhpcy5faWQ9Zix0aGlzfSxiLktleWZyYW1lRWZmZWN0LnByb3RvdHlwZT17Z2V0RnJhbWVzOmZ1bmN0aW9uKCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdGhpcy5fbm9ybWFsaXplZEtleWZyYW1lcz90aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzOnRoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXMuX2ZyYW1lc30sc2V0IG9uc2FtcGxlKGEpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHRoaXMuZ2V0RnJhbWVzKCkpdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyBvbnNhbXBsZSBvbiBjdXN0b20gZWZmZWN0IEtleWZyYW1lRWZmZWN0IGlzIG5vdCBzdXBwb3J0ZWQuXCIpO3RoaXMuX29uc2FtcGxlPWEsdGhpcy5fYW5pbWF0aW9uJiZ0aGlzLl9hbmltYXRpb24uX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uKCl9LGdldCBwYXJlbnQoKXtyZXR1cm4gdGhpcy5fcGFyZW50fSxjbG9uZTpmdW5jdGlvbigpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHRoaXMuZ2V0RnJhbWVzKCkpdGhyb3cgbmV3IEVycm9yKFwiQ2xvbmluZyBjdXN0b20gZWZmZWN0cyBpcyBub3Qgc3VwcG9ydGVkLlwiKTt2YXIgYj1uZXcgS2V5ZnJhbWVFZmZlY3QodGhpcy50YXJnZXQsW10sYS5jbG9uZVRpbWluZ0lucHV0KHRoaXMuX3RpbWluZ0lucHV0KSx0aGlzLl9pZCk7cmV0dXJuIGIuX25vcm1hbGl6ZWRLZXlmcmFtZXM9dGhpcy5fbm9ybWFsaXplZEtleWZyYW1lcyxiLl9rZXlmcmFtZXM9dGhpcy5fa2V5ZnJhbWVzLGJ9LHJlbW92ZTpmdW5jdGlvbigpe2IucmVtb3ZlTXVsdGkoW3RoaXNdKX19O3ZhciBnPUVsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU7RWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZT1mdW5jdGlvbihhLGMpe3ZhciBkPVwiXCI7cmV0dXJuIGMmJmMuaWQmJihkPWMuaWQpLGIudGltZWxpbmUuX3BsYXkobmV3IGIuS2V5ZnJhbWVFZmZlY3QodGhpcyxhLGMsZCkpfTt2YXIgaD1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJkaXZcIik7Yi5uZXdVbmRlcmx5aW5nQW5pbWF0aW9uRm9yS2V5ZnJhbWVFZmZlY3Q9ZnVuY3Rpb24oYSl7aWYoYSl7dmFyIGI9YS50YXJnZXR8fGgsYz1hLl9rZXlmcmFtZXM7XCJmdW5jdGlvblwiPT10eXBlb2YgYyYmKGM9W10pO3ZhciBkPWEuX3RpbWluZ0lucHV0O2QuaWQ9YS5faWR9ZWxzZSB2YXIgYj1oLGM9W10sZD0wO3JldHVybiBnLmFwcGx5KGIsW2MsZF0pfSxiLmJpbmRBbmltYXRpb25Gb3JLZXlmcmFtZUVmZmVjdD1mdW5jdGlvbihhKXthLmVmZmVjdCYmXCJmdW5jdGlvblwiPT10eXBlb2YgYS5lZmZlY3QuX25vcm1hbGl6ZWRLZXlmcmFtZXMmJmIuYmluZEFuaW1hdGlvbkZvckN1c3RvbUVmZmVjdChhKX07dmFyIGk9W107Yi5hd2FpdFN0YXJ0VGltZT1mdW5jdGlvbihhKXtudWxsPT09YS5zdGFydFRpbWUmJmEuX2lzR3JvdXAmJigwPT1pLmxlbmd0aCYmcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGUpLGkucHVzaChhKSl9O3ZhciBqPXdpbmRvdy5nZXRDb21wdXRlZFN0eWxlO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3csXCJnZXRDb21wdXRlZFN0eWxlXCIse2NvbmZpZ3VyYWJsZTohMCxlbnVtZXJhYmxlOiEwLHZhbHVlOmZ1bmN0aW9uKCl7Yi50aW1lbGluZS5fdXBkYXRlQW5pbWF0aW9uc1Byb21pc2VzKCk7dmFyIGE9ai5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIGUoKSYmKGE9ai5hcHBseSh0aGlzLGFyZ3VtZW50cykpLGIudGltZWxpbmUuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpLGF9fSksd2luZG93LktleWZyYW1lRWZmZWN0PWIuS2V5ZnJhbWVFZmZlY3Qsd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmdldEFuaW1hdGlvbnM9ZnVuY3Rpb24oKXtyZXR1cm4gZG9jdW1lbnQudGltZWxpbmUuZ2V0QW5pbWF0aW9ucygpLmZpbHRlcihmdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9PWEuZWZmZWN0JiZhLmVmZmVjdC50YXJnZXQ9PXRoaXN9LmJpbmQodGhpcykpfX0oYyxlKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXthLl9yZWdpc3RlcmVkfHwoYS5fcmVnaXN0ZXJlZD0hMCxnLnB1c2goYSksaHx8KGg9ITAscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGUpKSl9ZnVuY3Rpb24gZShhKXt2YXIgYj1nO2c9W10sYi5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGEuX3NlcXVlbmNlTnVtYmVyLWIuX3NlcXVlbmNlTnVtYmVyfSksYj1iLmZpbHRlcihmdW5jdGlvbihhKXthKCk7dmFyIGI9YS5fYW5pbWF0aW9uP2EuX2FuaW1hdGlvbi5wbGF5U3RhdGU6XCJpZGxlXCI7cmV0dXJuXCJydW5uaW5nXCIhPWImJlwicGVuZGluZ1wiIT1iJiYoYS5fcmVnaXN0ZXJlZD0hMSksYS5fcmVnaXN0ZXJlZH0pLGcucHVzaC5hcHBseShnLGIpLGcubGVuZ3RoPyhoPSEwLHJlcXVlc3RBbmltYXRpb25GcmFtZShlKSk6aD0hMX12YXIgZj0oZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiZGl2XCIpLDApO2IuYmluZEFuaW1hdGlvbkZvckN1c3RvbUVmZmVjdD1mdW5jdGlvbihiKXt2YXIgYyxlPWIuZWZmZWN0LnRhcmdldCxnPVwiZnVuY3Rpb25cIj09dHlwZW9mIGIuZWZmZWN0LmdldEZyYW1lcygpO2M9Zz9iLmVmZmVjdC5nZXRGcmFtZXMoKTpiLmVmZmVjdC5fb25zYW1wbGU7dmFyIGg9Yi5lZmZlY3QudGltaW5nLGk9bnVsbDtoPWEubm9ybWFsaXplVGltaW5nSW5wdXQoaCk7dmFyIGo9ZnVuY3Rpb24oKXt2YXIgZD1qLl9hbmltYXRpb24/ai5fYW5pbWF0aW9uLmN1cnJlbnRUaW1lOm51bGw7bnVsbCE9PWQmJihkPWEuY2FsY3VsYXRlSXRlcmF0aW9uUHJvZ3Jlc3MoYS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbihoKSxkLGgpLGlzTmFOKGQpJiYoZD1udWxsKSksZCE9PWkmJihnP2MoZCxlLGIuZWZmZWN0KTpjKGQsYi5lZmZlY3QsYi5lZmZlY3QuX2FuaW1hdGlvbikpLGk9ZH07ai5fYW5pbWF0aW9uPWIsai5fcmVnaXN0ZXJlZD0hMSxqLl9zZXF1ZW5jZU51bWJlcj1mKyssYi5fY2FsbGJhY2s9aixkKGopfTt2YXIgZz1bXSxoPSExO2IuQW5pbWF0aW9uLnByb3RvdHlwZS5fcmVnaXN0ZXI9ZnVuY3Rpb24oKXt0aGlzLl9jYWxsYmFjayYmZCh0aGlzLl9jYWxsYmFjayl9fShjLGUpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe3JldHVybiBhLl90aW1pbmcuZGVsYXkrYS5hY3RpdmVEdXJhdGlvbithLl90aW1pbmcuZW5kRGVsYXl9ZnVuY3Rpb24gZShiLGMsZCl7dGhpcy5faWQ9ZCx0aGlzLl9wYXJlbnQ9bnVsbCx0aGlzLmNoaWxkcmVuPWJ8fFtdLHRoaXMuX3JlcGFyZW50KHRoaXMuY2hpbGRyZW4pLGM9YS5udW1lcmljVGltaW5nVG9PYmplY3QoYyksdGhpcy5fdGltaW5nSW5wdXQ9YS5jbG9uZVRpbWluZ0lucHV0KGMpLHRoaXMuX3RpbWluZz1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KGMsITApLHRoaXMudGltaW5nPWEubWFrZVRpbWluZyhjLCEwLHRoaXMpLHRoaXMudGltaW5nLl9lZmZlY3Q9dGhpcyxcImF1dG9cIj09PXRoaXMuX3RpbWluZy5kdXJhdGlvbiYmKHRoaXMuX3RpbWluZy5kdXJhdGlvbj10aGlzLmFjdGl2ZUR1cmF0aW9uKX13aW5kb3cuU2VxdWVuY2VFZmZlY3Q9ZnVuY3Rpb24oKXtlLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sd2luZG93Lkdyb3VwRWZmZWN0PWZ1bmN0aW9uKCl7ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LGUucHJvdG90eXBlPXtfaXNBbmNlc3RvcjpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcztudWxsIT09Yjspe2lmKGI9PWEpcmV0dXJuITA7Yj1iLl9wYXJlbnR9cmV0dXJuITF9LF9yZWJ1aWxkOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXM7YTspXCJhdXRvXCI9PT1hLnRpbWluZy5kdXJhdGlvbiYmKGEuX3RpbWluZy5kdXJhdGlvbj1hLmFjdGl2ZUR1cmF0aW9uKSxhPWEuX3BhcmVudDt0aGlzLl9hbmltYXRpb24mJnRoaXMuX2FuaW1hdGlvbi5fcmVidWlsZFVuZGVybHlpbmdBbmltYXRpb24oKX0sX3JlcGFyZW50OmZ1bmN0aW9uKGEpe2IucmVtb3ZlTXVsdGkoYSk7Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDtjKyspYVtjXS5fcGFyZW50PXRoaXN9LF9wdXRDaGlsZDpmdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1iP1wiQ2Fubm90IGFwcGVuZCBhbiBhbmNlc3RvciBvciBzZWxmXCI6XCJDYW5ub3QgcHJlcGVuZCBhbiBhbmNlc3RvciBvciBzZWxmXCIsZD0wO2Q8YS5sZW5ndGg7ZCsrKWlmKHRoaXMuX2lzQW5jZXN0b3IoYVtkXSkpdGhyb3d7dHlwZTpET01FeGNlcHRpb24uSElFUkFSQ0hZX1JFUVVFU1RfRVJSLG5hbWU6XCJIaWVyYXJjaHlSZXF1ZXN0RXJyb3JcIixtZXNzYWdlOmN9O2Zvcih2YXIgZD0wO2Q8YS5sZW5ndGg7ZCsrKWI/dGhpcy5jaGlsZHJlbi5wdXNoKGFbZF0pOnRoaXMuY2hpbGRyZW4udW5zaGlmdChhW2RdKTt0aGlzLl9yZXBhcmVudChhKSx0aGlzLl9yZWJ1aWxkKCl9LGFwcGVuZDpmdW5jdGlvbigpe3RoaXMuX3B1dENoaWxkKGFyZ3VtZW50cywhMCl9LHByZXBlbmQ6ZnVuY3Rpb24oKXt0aGlzLl9wdXRDaGlsZChhcmd1bWVudHMsITEpfSxnZXQgcGFyZW50KCl7cmV0dXJuIHRoaXMuX3BhcmVudH0sZ2V0IGZpcnN0Q2hpbGQoKXtyZXR1cm4gdGhpcy5jaGlsZHJlbi5sZW5ndGg/dGhpcy5jaGlsZHJlblswXTpudWxsfSxnZXQgbGFzdENoaWxkKCl7cmV0dXJuIHRoaXMuY2hpbGRyZW4ubGVuZ3RoP3RoaXMuY2hpbGRyZW5bdGhpcy5jaGlsZHJlbi5sZW5ndGgtMV06bnVsbH0sY2xvbmU6ZnVuY3Rpb24oKXtmb3IodmFyIGI9YS5jbG9uZVRpbWluZ0lucHV0KHRoaXMuX3RpbWluZ0lucHV0KSxjPVtdLGQ9MDtkPHRoaXMuY2hpbGRyZW4ubGVuZ3RoO2QrKyljLnB1c2godGhpcy5jaGlsZHJlbltkXS5jbG9uZSgpKTtyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEdyb3VwRWZmZWN0P25ldyBHcm91cEVmZmVjdChjLGIpOm5ldyBTZXF1ZW5jZUVmZmVjdChjLGIpfSxyZW1vdmU6ZnVuY3Rpb24oKXtiLnJlbW92ZU11bHRpKFt0aGlzXSl9fSx3aW5kb3cuU2VxdWVuY2VFZmZlY3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuU2VxdWVuY2VFZmZlY3QucHJvdG90eXBlLFwiYWN0aXZlRHVyYXRpb25cIix7Z2V0OmZ1bmN0aW9uKCl7dmFyIGE9MDtyZXR1cm4gdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGIpe2ErPWQoYil9KSxNYXRoLm1heChhLDApfX0pLHdpbmRvdy5Hcm91cEVmZmVjdC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSksT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5Hcm91cEVmZmVjdC5wcm90b3R5cGUsXCJhY3RpdmVEdXJhdGlvblwiLHtnZXQ6ZnVuY3Rpb24oKXt2YXIgYT0wO3JldHVybiB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYil7YT1NYXRoLm1heChhLGQoYikpfSksYX19KSxiLm5ld1VuZGVybHlpbmdBbmltYXRpb25Gb3JHcm91cD1mdW5jdGlvbihjKXt2YXIgZCxlPW51bGwsZj1mdW5jdGlvbihiKXt2YXIgYz1kLl93cmFwcGVyO2lmKGMmJlwicGVuZGluZ1wiIT1jLnBsYXlTdGF0ZSYmYy5lZmZlY3QpcmV0dXJuIG51bGw9PWI/dm9pZCBjLl9yZW1vdmVDaGlsZEFuaW1hdGlvbnMoKTowPT1iJiZjLnBsYXliYWNrUmF0ZTwwJiYoZXx8KGU9YS5ub3JtYWxpemVUaW1pbmdJbnB1dChjLmVmZmVjdC50aW1pbmcpKSxiPWEuY2FsY3VsYXRlSXRlcmF0aW9uUHJvZ3Jlc3MoYS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbihlKSwtMSxlKSxpc05hTihiKXx8bnVsbD09Yik/KGMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihhKXthLmN1cnJlbnRUaW1lPS0xfSksdm9pZCBjLl9yZW1vdmVDaGlsZEFuaW1hdGlvbnMoKSk6dm9pZCAwfSxnPW5ldyBLZXlmcmFtZUVmZmVjdChudWxsLFtdLGMuX3RpbWluZyxjLl9pZCk7cmV0dXJuIGcub25zYW1wbGU9ZixkPWIudGltZWxpbmUuX3BsYXkoZyl9LGIuYmluZEFuaW1hdGlvbkZvckdyb3VwPWZ1bmN0aW9uKGEpe2EuX2FuaW1hdGlvbi5fd3JhcHBlcj1hLGEuX2lzR3JvdXA9ITAsYi5hd2FpdFN0YXJ0VGltZShhKSxhLl9jb25zdHJ1Y3RDaGlsZEFuaW1hdGlvbnMoKSxhLl9zZXRFeHRlcm5hbEFuaW1hdGlvbihhKX0sYi5ncm91cENoaWxkRHVyYXRpb249ZH0oYyxlKSxiLnRydWU9YX0oe30sZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30oKSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3dlYi1hbmltYXRpb25zLWpzL3dlYi1hbmltYXRpb25zLW5leHQtbGl0ZS5taW4uanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL3dlYi1hbmltYXRpb25zLWpzL3dlYi1hbmltYXRpb25zLW5leHQtbGl0ZS5taW4uanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwidmFyIGc7XG5cbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXG5nID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcztcbn0pKCk7XG5cbnRyeSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xufSBjYXRjaChlKSB7XG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXG5cdFx0ZyA9IHdpbmRvdztcbn1cblxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3Ncbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cblxubW9kdWxlLmV4cG9ydHMgPSBnO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy93ZWJwYWNrL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbWFpbi5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vc3JjL21haW4uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCAnd2ViLWFuaW1hdGlvbnMtanMvd2ViLWFuaW1hdGlvbnMtbmV4dC1saXRlLm1pbic7XHJcbmltcG9ydCByZW5kZXJlciBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvdmRvbSc7XHJcbmltcG9ydCBSZWdpc3RyeSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnknO1xyXG5pbXBvcnQgeyB3IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2QnO1xyXG5pbXBvcnQgeyByZWdpc3RlclJvdXRlckluamVjdG9yIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvUm91dGVySW5qZWN0b3InO1xyXG5pbXBvcnQgeyByZWdpc3RlclRoZW1lSW5qZWN0b3IgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWl4aW5zL1RoZW1lZCc7XHJcbmltcG9ydCBkb2pvIGZyb20gJ0Bkb2pvL3RoZW1lcy9kb2pvJztcclxuaW1wb3J0ICdAZG9qby90aGVtZXMvZG9qby9pbmRleC5jc3MnO1xyXG5cclxuaW1wb3J0IHJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XHJcbmltcG9ydCBBcHAgZnJvbSAnLi93aWRnZXRzL0FwcCc7XHJcblxyXG5jb25zdCByZWdpc3RyeSA9IG5ldyBSZWdpc3RyeSgpO1xyXG5yZWdpc3RlclJvdXRlckluamVjdG9yKHJvdXRlcywgcmVnaXN0cnkpO1xyXG5yZWdpc3RlclRoZW1lSW5qZWN0b3IoZG9qbywgcmVnaXN0cnkpO1xyXG5cclxuY29uc3QgciA9IHJlbmRlcmVyKCgpID0+IHcoQXBwLCB7fSkpO1xyXG5yLm1vdW50KHsgcmVnaXN0cnkgfSk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy9tYWluLnRzIiwiZXhwb3J0IGRlZmF1bHQgW1xuXHR7XG5cdFx0cGF0aDogJ2hvbWUnLFxuXHRcdG91dGxldDogJ2hvbWUnLFxuXHRcdGRlZmF1bHRSb3V0ZTogdHJ1ZVxuXHR9LFxuXHR7XG5cdFx0cGF0aDogJ2NhdCcsXG5cdFx0b3V0bGV0OiAnY2F0J1xuXHR9LFxuXHR7XG5cdFx0cGF0aDogJ2RvZycsXG5cdFx0b3V0bGV0OiAnZG9nJ1xuXHR9XG5dO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9jc3MtbW9kdWxlLWR0cy1sb2FkZXI/dHlwZT10cyZpbnN0YW5jZU5hbWU9MF9kb2pvIS4vc3JjL3JvdXRlcy50cyIsImltcG9ydCBPdXRsZXQgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvT3V0bGV0JztcbmltcG9ydCB7IHYsIHcgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XG5pbXBvcnQgV2lkZ2V0QmFzZSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZSc7XG5cbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vQnV0dG9uJztcbmltcG9ydCB7IENhdENvbnRhaW5lciB9IGZyb20gJy4vQ2F0Q29udGFpbmVyJztcbmltcG9ydCB7IERvZ0NvbnRhaW5lciB9IGZyb20gJy4vRG9nQ29udGFpbmVyJztcbmltcG9ydCAqIGFzIGNzcyBmcm9tICcuL3N0eWxlcy9BcHAubS5jc3MnO1xuaW1wb3J0IHsgQ29yZUF1ZGlvIH0gZnJvbSAnLi9Db3JlQXVkaW8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHAgZXh0ZW5kcyBXaWRnZXRCYXNlIHtcblx0cHJpdmF0ZSBjb3JlQXVkaW8gPSBuZXcgQ29yZUF1ZGlvKCk7XG5cblx0cHJvdGVjdGVkIHJlbmRlcigpIHtcblx0XHRjb25zdCBjb3JlQXVkaW8gPSB0aGlzLmNvcmVBdWRpbztcblx0XHRjb25zdCBvblBsYXlTb3VuZCA9IChzb3VuZDogYW55KSA9PiB7XG5cdFx0XHRjb3JlQXVkaW8ucGxheShzb3VuZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHYoJ2RpdicsIHsgY2xhc3NlczogW2Nzcy5yb290XSB9LCBbXG5cdFx0XHR2KCdoZWFkZXInLCB7IGNsYXNzZXM6IFtjc3MuaGVhZGVyXSB9LCBbXG5cdFx0XHRcdHcoQnV0dG9uLCB7IHRvOiAnY2F0JyB9LCBbJ0NhdHMnXSksXG5cdFx0XHRcdHYoJ3AnLCB7fSwgWyd2cyddKSxcblx0XHRcdFx0dyhCdXR0b24sIHsgdG86ICdkb2cnIH0sIFsnRG9ncyddKVxuXHRcdFx0XSksXG5cdFx0XHR3KE91dGxldCwgeyBrZXk6ICdjYXQnLCBpZDogJ2NhdCcsIHJlbmRlcmVyOiAoKSA9PiB3KENhdENvbnRhaW5lciwgeyBvblBsYXlTb3VuZCB9KSB9KSxcblx0XHRcdHcoT3V0bGV0LCB7IGtleTogJ2RvZycsIGlkOiAnZG9nJywgcmVuZGVyZXI6ICgpID0+IHcoRG9nQ29udGFpbmVyLCB7IG9uUGxheVNvdW5kIH0pIH0pXG5cdFx0XSk7XG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL0FwcC50cyIsImltcG9ydCB7IEhhbmRsZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay9jb3JlL0Rlc3Ryb3lhYmxlJztcclxuaW1wb3J0IHsgTGlua1Byb3BlcnRpZXMgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvcm91dGluZy9pbnRlcmZhY2VzJztcclxuaW1wb3J0IExpbmsgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvTGluayc7XHJcbmltcG9ydCBSb3V0ZXIgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvUm91dGVyJztcclxuaW1wb3J0IHsgdiwgdyB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcclxuaW1wb3J0IHsgYWx3YXlzUmVuZGVyIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYWx3YXlzUmVuZGVyJztcclxuaW1wb3J0IHsgZGlmZlByb3BlcnR5IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvZGlmZlByb3BlcnR5JztcclxuaW1wb3J0IFdpZGdldEJhc2UgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xyXG5cclxuaW1wb3J0ICogYXMgY3NzIGZyb20gJy4vc3R5bGVzL0J1dHRvbi5tLmNzcyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1dHRvbkxpbmtQcm9wZXJ0aWVzIGV4dGVuZHMgTGlua1Byb3BlcnRpZXMge1xyXG5cdHNlbGVjdGVkPzogYm9vbGVhbjtcclxufVxyXG5cclxuQGFsd2F5c1JlbmRlcigpXHJcbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBXaWRnZXRCYXNlPEJ1dHRvbkxpbmtQcm9wZXJ0aWVzPiB7XHJcblx0cHJpdmF0ZSBfaGFuZGxlOiBIYW5kbGUgfCB1bmRlZmluZWQ7XHJcblxyXG5cdEBkaWZmUHJvcGVydHkoJ3JvdXRlcktleScpXHJcblx0cHJvdGVjdGVkIG9uUm91dGVyS2V5Q2hhbmdlKGN1cnJlbnQ6IEJ1dHRvbkxpbmtQcm9wZXJ0aWVzLCBuZXh0OiBCdXR0b25MaW5rUHJvcGVydGllcykge1xyXG5cdFx0Y29uc3QgeyByb3V0ZXJLZXkgPSAncm91dGVyJyB9ID0gbmV4dDtcclxuXHRcdGNvbnN0IGl0ZW0gPSB0aGlzLnJlZ2lzdHJ5LmdldEluamVjdG9yPFJvdXRlcj4ocm91dGVyS2V5KTtcclxuXHRcdGlmICh0aGlzLl9oYW5kbGUpIHtcclxuXHRcdFx0dGhpcy5faGFuZGxlLmRlc3Ryb3koKTtcclxuXHRcdFx0dGhpcy5faGFuZGxlID0gdW5kZWZpbmVkO1xyXG5cdFx0fVxyXG5cdFx0aWYgKGl0ZW0pIHtcclxuXHRcdFx0dGhpcy5faGFuZGxlID0gaXRlbS5pbnZhbGlkYXRvci5vbignaW52YWxpZGF0ZScsICgpID0+IHtcclxuXHRcdFx0XHR0aGlzLmludmFsaWRhdGUoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHRoaXMub3duKHRoaXMuX2hhbmRsZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcm90ZWN0ZWQgb25BdHRhY2goKSB7XHJcblx0XHRpZiAoIXRoaXMuX2hhbmRsZSkge1xyXG5cdFx0XHR0aGlzLm9uUm91dGVyS2V5Q2hhbmdlKHRoaXMucHJvcGVydGllcywgdGhpcy5wcm9wZXJ0aWVzKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByb3RlY3RlZCByZW5kZXIoKSB7XHJcblx0XHRjb25zdCBzZWxlY3RlZCA9IHRoaXMuaXNTZWxlY3RlZCgpO1xyXG5cclxuXHRcdHJldHVybiB3KExpbmssIHsgLi4udGhpcy5wcm9wZXJ0aWVzLCBjbGFzc2VzOiBjc3Mucm9vdCB9LCBbXHJcblx0XHRcdHYoJ2RpdicsIHsgY2xhc3NlczogW2Nzcy5jb250YWluZXIsIHNlbGVjdGVkID8gY3NzLnNlbGVjdGVkIDogdW5kZWZpbmVkXSB9LCB0aGlzLmNoaWxkcmVuKVxyXG5cdFx0XSk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGlzU2VsZWN0ZWQoKSB7XHJcblx0XHRjb25zdCB7IHRvLCByb3V0ZXJLZXkgPSAncm91dGVyJyB9ID0gdGhpcy5wcm9wZXJ0aWVzO1xyXG5cdFx0Y29uc3QgaXRlbSA9IHRoaXMucmVnaXN0cnkuZ2V0SW5qZWN0b3I8Um91dGVyPihyb3V0ZXJLZXkpO1xyXG5cclxuXHRcdGlmIChpdGVtKSB7XHJcblx0XHRcdGNvbnN0IHJvdXRlciA9IGl0ZW0uaW5qZWN0b3IoKTtcclxuXHRcdFx0Y29uc3Qgb3V0bGV0Q29udGV4dCA9IHJvdXRlci5nZXRPdXRsZXQodG8pO1xyXG5cdFx0XHRpZiAob3V0bGV0Q29udGV4dCkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL0J1dHRvbi50cyIsImltcG9ydCB7IEROb2RlIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgVGhlbWVkTWl4aW4sIHRoZW1lIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQnO1xuaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlJztcbmltcG9ydCAqIGFzIGNzcyBmcm9tICcuL3N0eWxlcy9jYXRDb250YWluZXIubS5jc3MnO1xuaW1wb3J0IHsgdiB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcbmltcG9ydCBXZWJBbmltYXRpb24gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvV2ViQW5pbWF0aW9uJztcbmltcG9ydCB7IGhlYWRUaWx0IH0gZnJvbSAnLi91dGlsL2FuaW1hdGlvbnMnO1xuXG5jb25zdCBoZWFkID0gcmVxdWlyZSgnLi9hc3NldHMvY2F0LWhlYWQucG5nJyk7XG5jb25zdCBib2R5ID0gcmVxdWlyZSgnLi9hc3NldHMvY2F0LWJvZHkucG5nJyk7XG4vLyBjb25zdCBzb3VuZCA9IHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9tZW93Lm1wMycpO1xuXG4vKipcbiAqIEB0eXBlIENhdENvbnRhaW5lclByb3BlcnRpZXNcbiAqXG4gKiBQcm9wZXJ0aWVzIHRoYXQgY2FuIGJlIHNldCBvbiBBbmltYWwgY29tcG9uZW50c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENhdENvbnRhaW5lclByb3BlcnRpZXMge1xuXHRvblBsYXlTb3VuZD8oYXVkaW86IGFueSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBUaGVtZWRCYXNlID0gVGhlbWVkTWl4aW4oV2lkZ2V0QmFzZSk7XG5cbkB0aGVtZShjc3MpXG5leHBvcnQgY2xhc3MgQ2F0Q29udGFpbmVyPFAgZXh0ZW5kcyBDYXRDb250YWluZXJQcm9wZXJ0aWVzID0gQ2F0Q29udGFpbmVyUHJvcGVydGllcz4gZXh0ZW5kcyBUaGVtZWRCYXNlPFA+IHtcblx0cHJvdGVjdGVkIHJlbmRlcigpOiBETm9kZSB8IEROb2RlW10ge1xuXHRcdGNvbnN0IGtleSA9ICdjYXRoZWFkJztcblx0XHR0aGlzLm1ldGEoV2ViQW5pbWF0aW9uKS5hbmltYXRlKGtleSwgaGVhZFRpbHQoJ2NhdEhlYWRUaWx0JykpO1xuXG5cdFx0cmV0dXJuIHYoJ2RpdicsIHsgY2xhc3NlczogY3NzLnJvb3QgfSwgW1xuXHRcdFx0dignaW1nJywgeyBrZXksIHNyYzogaGVhZCwgY2xhc3NlczogY3NzLmhlYWQgfSksXG5cdFx0XHR2KCdpbWcnLCB7IHNyYzogYm9keSwgY2xhc3NlczogY3NzLmJvZHkgfSksXG5cdFx0XHR2KCdidXR0b24nLCB7IG9uY2xpY2s6IHRoaXMub25DbGljayB9LCBbJ01lb3cnXSlcblx0XHRdKTtcblx0fVxuXG5cdHByaXZhdGUgb25DbGljaygpIHtcblx0XHRjb25zdCB7IG9uUGxheVNvdW5kIH0gPSB0aGlzLnByb3BlcnRpZXM7XG5cblx0XHRpZiAob25QbGF5U291bmQpIHtcblx0XHRcdG9uUGxheVNvdW5kKCdtZW93Jyk7XG5cdFx0fVxuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvd2lkZ2V0cy9DYXRDb250YWluZXIudHMiLCJleHBvcnQgY2xhc3MgQ29yZUF1ZGlvIHtcblx0cHJpdmF0ZSBjb250ZXh0ITogQXVkaW9Db250ZXh0O1xuXG5cdHBsYXkoc291bmQ6IGFueSkge1xuXHRcdGNvbnN0IGF1ZGlvID0gdGhpcy5sb2FkKCk7XG5cblx0XHRpZiAodGhpcy5jb250ZXh0LnN0YXRlID09PSAnc3VzcGVuZGVkJykge1xuXHRcdFx0dGhpcy5jb250ZXh0LnJlc3VtZSgpO1xuXHRcdH1cblxuXHRcdGF1ZGlvLnN0YXJ0KCk7XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRhdWRpby5zdG9wKClcblx0XHR9LCA1MDApO1xuXG5cdFx0Y29uc29sZS5sb2coc291bmQpO1xuXHR9XG5cblx0cHJpdmF0ZSBsb2FkKCk6IEF1ZGlvU2NoZWR1bGVkU291cmNlTm9kZSB7XG5cdFx0aWYgKCF0aGlzLmNvbnRleHQpIHtcblx0XHRcdHRoaXMuY29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblx0XHR9XG5cblx0XHRjb25zdCBvc2MgPSB0aGlzLmNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuXHRcdG9zYy5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoNDQwLCB0aGlzLmNvbnRleHQuY3VycmVudFRpbWUpO1xuXHRcdG9zYy5jb25uZWN0KHRoaXMuY29udGV4dC5kZXN0aW5hdGlvbik7XG5cblx0XHRyZXR1cm4gb3NjO1xuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvd2lkZ2V0cy9Db3JlQXVkaW8udHMiLCJpbXBvcnQgeyBETm9kZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRoZW1lZE1peGluLCB0aGVtZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkJztcbmltcG9ydCB7IFdpZGdldEJhc2UgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZSc7XG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9zdHlsZXMvZG9nQ29udGFpbmVyLm0uY3NzJztcbmltcG9ydCB7IHYgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XG5pbXBvcnQgV2ViQW5pbWF0aW9uIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL1dlYkFuaW1hdGlvbic7XG5pbXBvcnQgeyBoZWFkVGlsdCB9IGZyb20gJy4vdXRpbC9hbmltYXRpb25zJztcblxuY29uc3QgaGVhZCA9IHJlcXVpcmUoJy4vYXNzZXRzL2RvZy1oZWFkLnBuZycpO1xuY29uc3QgYm9keSA9IHJlcXVpcmUoJy4vYXNzZXRzL2RvZy1ib2R5LnBuZycpO1xuLy8gY29uc3Qgc291bmQgPSByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvbWVvdy5tcDMnKTtcblxuLyoqXG4gKiBAdHlwZSBEb2dDb250YWluZXJQcm9wZXJ0aWVzXG4gKlxuICogUHJvcGVydGllcyB0aGF0IGNhbiBiZSBzZXQgb24gQW5pbWFsIGNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEb2dDb250YWluZXJQcm9wZXJ0aWVzIHtcblx0b25QbGF5U291bmQ/KGF1ZGlvOiBhbnkpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgVGhlbWVkQmFzZSA9IFRoZW1lZE1peGluKFdpZGdldEJhc2UpO1xuXG5AdGhlbWUoY3NzKVxuZXhwb3J0IGNsYXNzIERvZ0NvbnRhaW5lcjxQIGV4dGVuZHMgRG9nQ29udGFpbmVyUHJvcGVydGllcyA9IERvZ0NvbnRhaW5lclByb3BlcnRpZXM+IGV4dGVuZHMgVGhlbWVkQmFzZTxQPiB7XG5cdHByb3RlY3RlZCByZW5kZXIoKTogRE5vZGUgfCBETm9kZVtdIHtcblx0XHRjb25zdCBrZXkgPSAnZG9nSGVhZCc7XG5cdFx0dGhpcy5tZXRhKFdlYkFuaW1hdGlvbikuYW5pbWF0ZShrZXksIGhlYWRUaWx0KCdkb2dIZWFkVGlsdCcpKTtcblxuXHRcdHJldHVybiB2KCdkaXYnLCB7IGNsYXNzZXM6IGNzcy5yb290IH0sIFtcblx0XHRcdHYoJ2ltZycsIHsga2V5LCBzcmM6IGhlYWQsIGNsYXNzZXM6IGNzcy5oZWFkIH0pLFxuXHRcdFx0dignaW1nJywgeyBzcmM6IGJvZHksIGNsYXNzZXM6IGNzcy5ib2R5IH0pLFxuXHRcdFx0dignYnV0dG9uJywgeyBvbmNsaWNrOiB0aGlzLm9uQ2xpY2sgfSwgWydXb29mJ10pXG5cdFx0XSk7XG5cdH1cblxuXHRwcml2YXRlIG9uQ2xpY2soKSB7XG5cdFx0Y29uc3QgeyBvblBsYXlTb3VuZCB9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuXG5cdFx0aWYgKG9uUGxheVNvdW5kKSB7XG5cdFx0XHRvblBsYXlTb3VuZCgnd29vZicpO1xuXHRcdH1cblx0fVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9jc3MtbW9kdWxlLWR0cy1sb2FkZXI/dHlwZT10cyZpbnN0YW5jZU5hbWU9MF9kb2pvIS4vc3JjL3dpZGdldHMvRG9nQ29udGFpbmVyLnRzIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiY2F0LWJvZHkuMnktejhHdzYucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWJvZHkucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtYm9keS5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiY2F0LWhlYWQuM25FbmRnZkoucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWhlYWQucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtaGVhZC5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZG9nLWJvZHkuM3ZiU0h2V2EucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctYm9keS5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZG9nLWhlYWQuRndiSFRqTUQucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWhlYWQucG5nXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctaGVhZC5wbmdcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cbm1vZHVsZS5leHBvcnRzID0ge1wiIF9rZXlcIjpcImNhdHN2c2RvZ3MvQXBwXCIsXCJyb290XCI6XCJBcHAtbV9fcm9vdF9fMmNUNnRcIixcImhlYWRlclwiOlwiQXBwLW1fX2hlYWRlcl9fMWRKa1BcIn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvQXBwLm0uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL3N0eWxlcy9BcHAubS5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cbm1vZHVsZS5leHBvcnRzID0ge1wiIF9rZXlcIjpcImNhdHN2c2RvZ3MvQnV0dG9uXCIsXCJyb290XCI6XCJCdXR0b24tbV9fcm9vdF9fMVVZRndcIixcImNvbnRhaW5lclwiOlwiQnV0dG9uLW1fX2NvbnRhaW5lcl9fT05aRE9cIixcInNlbGVjdGVkXCI6XCJCdXR0b24tbV9fc2VsZWN0ZWRfX25hc21IXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvc3R5bGVzL0J1dHRvbi5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvQnV0dG9uLm0uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL2NhdENvbnRhaW5lclwiLFwicm9vdFwiOlwiY2F0Q29udGFpbmVyLW1fX3Jvb3RfXzMzX2t4XCIsXCJoZWFkXCI6XCJjYXRDb250YWluZXItbV9faGVhZF9fMk0xb0VcIixcImJvZHlcIjpcImNhdENvbnRhaW5lci1tX19ib2R5X18yaUlydVwifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy93aWRnZXRzL3N0eWxlcy9jYXRDb250YWluZXIubS5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vc3JjL3dpZGdldHMvc3R5bGVzL2NhdENvbnRhaW5lci5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9kb2dDb250YWluZXJcIixcInJvb3RcIjpcImRvZ0NvbnRhaW5lci1tX19yb290X19ETERyQlwiLFwiaGVhZFwiOlwiZG9nQ29udGFpbmVyLW1fX2hlYWRfXzFhaFVMXCIsXCJib2R5XCI6XCJkb2dDb250YWluZXItbV9fYm9keV9fMVVTU1pcIn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvZG9nQ29udGFpbmVyLm0uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL3N0eWxlcy9kb2dDb250YWluZXIubS5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgQW5pbWF0aW9uUHJvcGVydGllcyB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL1dlYkFuaW1hdGlvbic7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGVhZFRpbHQoaWQ6IHN0cmluZyk6IEFuaW1hdGlvblByb3BlcnRpZXMge1xyXG5cdGNvbnN0IGVmZmVjdHMgPSBbXHJcblx0XHR7IHRyYW5zZm9ybTogJ3JvdGF0ZSgwZGVnKScgfSxcclxuXHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKC01ZGVnKScgfSxcclxuXHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKDBkZWcpJyB9LFxyXG5cdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoNWRlZyknIH0sXHJcblx0XHR7IHRyYW5zZm9ybTogJ3JvdGF0ZSgwZGVnKScgfVxyXG5cdF07XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRpZCxcclxuXHRcdGVmZmVjdHMsXHJcblx0XHR0aW1pbmc6IHtcclxuXHRcdFx0ZHVyYXRpb246IDEwMDAsXHJcblx0XHRcdGl0ZXJhdGlvbnM6IEluZmluaXR5XHJcblx0XHR9LFxyXG5cdFx0Y29udHJvbHM6IHtcclxuXHRcdFx0cGxheTogdHJ1ZVxyXG5cdFx0fVxyXG5cdH07XHJcbn1cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9jc3MtbW9kdWxlLWR0cy1sb2FkZXI/dHlwZT10cyZpbnN0YW5jZU5hbWU9MF9kb2pvIS4vc3JjL3dpZGdldHMvdXRpbC9hbmltYXRpb25zLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==