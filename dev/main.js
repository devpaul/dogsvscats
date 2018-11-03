/*!
 * 
 * [Dojo](https://dojo.io/) devserver
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
        let _a = this.properties, { routerKey = 'router', to, isOutlet = true, target, params = {}, onClick } = _a, props = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](_a, ["routerKey", "to", "isOutlet", "target", "params", "onClick"]);
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
__WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_3__widget_core_decorators_diffProperty__["a" /* diffProperty */])('routerKey')
], Outlet.prototype, "onRouterKeyChange", null);
Outlet = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
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
    const { key = 'router' } = options, routerOptions = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](options, ["key"]);
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
        let { classes = [], styles = {} } = properties, newProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](properties, ["classes", "styles"]);
        let _a = tag.properties, { classes: nodeClasses = [], styles: nodeStyles = {} } = _a, nodeProperties = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](_a, ["classes", "styles"]);
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
                    const _a = THEME_KEY, key = baseTheme[_a], classes = __WEBPACK_IMPORTED_MODULE_0_tslib__["c" /* __rest */](baseTheme, [typeof _a === "symbol" ? _a : _a + ""]);
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
    __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('theme', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */]),
        Object(__WEBPACK_IMPORTED_MODULE_4__decorators_diffProperty__["a" /* diffProperty */])('extraClasses', __WEBPACK_IMPORTED_MODULE_5__diff__["b" /* shallow */])
    ], Themed.prototype, "onPropertiesChanged", null);
    Themed = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
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
/* harmony export (immutable) */ __webpack_exports__["c"] = __rest;
/* harmony export (immutable) */ __webpack_exports__["b"] = __decorate;
/* unused harmony export __param */
/* unused harmony export __metadata */
/* harmony export (immutable) */ __webpack_exports__["a"] = __awaiter;
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
__WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_4__dojo_framework_widget_core_decorators_diffProperty__["a" /* diffProperty */])('routerKey')
], Button.prototype, "onRouterKeyChange", null);
Button = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
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
CatContainer = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
    Object(__WEBPACK_IMPORTED_MODULE_1__dojo_framework_widget_core_mixins_Themed__["c" /* theme */])(__WEBPACK_IMPORTED_MODULE_3__styles_catContainer_m_css__)
], CatContainer);



/***/ }),

/***/ "./src/widgets/CoreAudio.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tslib__ = __webpack_require__("./node_modules/tslib/tslib.es6.js");

class CoreAudio {
    constructor() {
        this.audioMap = new Map();
    }
    play(sound) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            if (!this.context) {
                this.context = new AudioContext();
            }
            // Chrome and Safari are both awful
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            const source = this.context.createBufferSource();
            source.buffer = yield this.loadCached(sound);
            source.connect(this.context.destination);
            source.start(this.context.currentTime);
            console.log(sound);
        });
    }
    loadCached(sound) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            if (this.audioMap.has(sound)) {
                return this.audioMap.get(sound);
            }
            const buffer = yield this.loadAudio(sound);
            this.audioMap.set(sound, buffer);
            return buffer;
        });
    }
    loadAudio(sound) {
        return __WEBPACK_IMPORTED_MODULE_0_tslib__["a" /* __awaiter */](this, void 0, void 0, function* () {
            const result = yield fetch(`assets/sounds/${sound}.mp3`);
            const audioData = yield result.arrayBuffer();
            return yield this.context.decodeAudioData(audioData);
        });
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
DogContainer = __WEBPACK_IMPORTED_MODULE_0_tslib__["b" /* __decorate */]([
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvY29yZS9EZXN0cm95YWJsZS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9jb3JlL0V2ZW50ZWQubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvY29yZS9RdWV1aW5nRXZlbnRlZC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9oYXMvaGFzLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvTGluay5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL091dGxldC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlci5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlckluamVjdG9yLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvaGlzdG9yeS9IYXNoSGlzdG9yeS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL01hcC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1Byb21pc2UubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9TZXQubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9TeW1ib2wubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9XZWFrTWFwLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vZ2xvYmFsLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vaXRlcmF0b3IubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9vYmplY3QubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdHJpbmcubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L2hhcy5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N1cHBvcnQvcXVldWUubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L3V0aWwubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvSW5qZWN0b3IubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvTm9kZUhhbmRsZXIubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnkubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnlIYW5kbGVyLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvYW5pbWF0aW9ucy9jc3NUcmFuc2l0aW9ucy5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYWx3YXlzUmVuZGVyLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYmVmb3JlUHJvcGVydGllcy5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2RpZmZQcm9wZXJ0eS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2hhbmRsZURlY29yYXRvci5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2luamVjdC5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kaWZmLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvQmFzZS5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL1dlYkFuaW1hdGlvbi5tanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkLm1qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL3Zkb20ubWpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9AZG9qby90aGVtZXMvZG9qby9pbmRleC5jc3M/Nzc0MSIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9idWlsZC10aW1lLXJlbmRlci9oYXNCdWlsZFRpbWVSZW5kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy93ZWItYW5pbWF0aW9ucy1qcy93ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluLmpzIiwid2VicGFjazovLy8od2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uY3NzPzM4ZGIiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9BcHAudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvQnV0dG9uLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL0NhdENvbnRhaW5lci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9Db3JlQXVkaW8udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvRG9nQ29udGFpbmVyLnRzIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9jYXQtYm9keS5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC1oZWFkLnBuZyIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nIiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL2Fzc2V0cy9kb2ctaGVhZC5wbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvc3R5bGVzL0FwcC5tLmNzcz9kODA5Iiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL3N0eWxlcy9CdXR0b24ubS5jc3M/YjFlOSIsIndlYnBhY2s6Ly8vLi9zcmMvd2lkZ2V0cy9zdHlsZXMvY2F0Q29udGFpbmVyLm0uY3NzP2EwZjEiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpZGdldHMvc3R5bGVzL2RvZ0NvbnRhaW5lci5tLmNzcz9kMGM1Iiwid2VicGFjazovLy8uL3NyYy93aWRnZXRzL3V0aWwvYW5pbWF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7QUNWQTtBQUFzQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsOERBQU87QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixpQkFBaUIsT0FBTztBQUN4QjtBQUNBO0FBQ0E7QUFDQSxlQUFlLG9CQUFvQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBLG1CQUFtQiw4REFBTztBQUMxQjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLENBQUM7QUFBQTtBQUFBO0FBQ2MscUZBQVcsRUFBQztBQUMzQix3Qzs7Ozs7Ozs7QUN0REE7QUFBQTtBQUFBO0FBQThCO0FBQ2M7QUFDNUM7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLDBEQUFHO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxnQ0FBZ0M7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0lBRU8sT0FBTztRQUNkLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBRXhDLElBQUksV0FBVyxFQUFFO1lBQ2hCLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNwQjtJQUNGLENBQUM7Q0FDRDtBQW5CWSxZQUFZO0lBRHhCLGdHQUFLLENBQUMsd0RBQUcsQ0FBQztHQUNFLFlBQVksQ0FtQnhCO0FBbkJ3Qjs7Ozs7Ozs7QUN2QnpCLGlCQUFpQixxQkFBdUIsMkI7Ozs7Ozs7QUNBeEMsaUJBQWlCLHFCQUF1QiwyQjs7Ozs7OztBQ0F4QyxpQkFBaUIscUJBQXVCLDJCOzs7Ozs7O0FDQXhDLGlCQUFpQixxQkFBdUIsMkI7Ozs7Ozs7QUNBeEM7QUFDQSxrQkFBa0Isc0Y7Ozs7Ozs7QUNEbEI7QUFDQSxrQkFBa0IsNEk7Ozs7Ozs7QUNEbEI7QUFDQSxrQkFBa0Isa0o7Ozs7Ozs7QUNEbEI7QUFDQSxrQkFBa0Isa0o7Ozs7Ozs7O0FDQ2xCO0FBQU8sU0FBUyxRQUFRLENBQUMsRUFBVTtJQUNsQyxNQUFNLE9BQU8sR0FBRztRQUNmLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRTtRQUM3QixFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUU7UUFDOUIsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFO1FBQzdCLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRTtRQUM3QixFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUU7S0FDN0IsQ0FBQztJQUVGLE9BQU87UUFDTixFQUFFO1FBQ0YsT0FBTztRQUNQLE1BQU0sRUFBRTtZQUNQLFFBQVEsRUFBRSxJQUFJO1lBQ2QsVUFBVSxFQUFFLFFBQVE7U0FDcEI7UUFDRCxRQUFRLEVBQUU7WUFDVCxJQUFJLEVBQUUsSUFBSTtTQUNWO0tBQ0QsQ0FBQztBQUNILENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwiY2F0c3ZzZG9nc1wiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJjYXRzdnNkb2dzXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImNhdHN2c2RvZ3NcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vc2hpbS9Qcm9taXNlJztcbi8qKlxuICogTm8gb3AgZnVuY3Rpb24gdXNlZCB0byByZXBsYWNlIGEgRGVzdHJveWFibGUgaW5zdGFuY2UncyBgZGVzdHJveWAgbWV0aG9kLCBvbmNlIHRoZSBpbnN0YW5jZSBoYXMgYmVlbiBkZXN0cm95ZWRcbiAqL1xuZnVuY3Rpb24gbm9vcCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbn1cbi8qKlxuICogTm8gb3AgZnVuY3Rpb24gdXNlZCB0byByZXBsYWNlIGEgRGVzdHJveWFibGUgaW5zdGFuY2UncyBgb3duYCBtZXRob2QsIG9uY2UgdGhlIGluc3RhbmNlIGhhcyBiZWVuIGRlc3Ryb3llZFxuICovXG5mdW5jdGlvbiBkZXN0cm95ZWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsIG1hZGUgdG8gZGVzdHJveWVkIG1ldGhvZCcpO1xufVxuZXhwb3J0IGNsYXNzIERlc3Ryb3lhYmxlIHtcbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGhhbmRsZXMgZm9yIHRoZSBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgZGVzdHJveWVkIHdoZW4gYHRoaXMuZGVzdHJveWAgaXMgY2FsbGVkXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hhbmRsZX0gaGFuZGxlIFRoZSBoYW5kbGUgdG8gYWRkIGZvciB0aGUgaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyB7SGFuZGxlfSBBIHdyYXBwZXIgSGFuZGxlLiBXaGVuIHRoZSB3cmFwcGVyIEhhbmRsZSdzIGBkZXN0cm95YCBtZXRob2QgaXMgaW52b2tlZCwgdGhlIG9yaWdpbmFsIGhhbmRsZSBpc1xuICAgICAqICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgZnJvbSB0aGUgaW5zdGFuY2UsIGFuZCBpdHMgYGRlc3Ryb3lgIG1ldGhvZCBpcyBpbnZva2VkLlxuICAgICAqL1xuICAgIG93bihoYW5kbGUpIHtcbiAgICAgICAgY29uc3QgeyBoYW5kbGVzOiBfaGFuZGxlcyB9ID0gdGhpcztcbiAgICAgICAgX2hhbmRsZXMucHVzaChoYW5kbGUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgICAgICAgICBfaGFuZGxlcy5zcGxpY2UoX2hhbmRsZXMuaW5kZXhPZihoYW5kbGUpKTtcbiAgICAgICAgICAgICAgICBoYW5kbGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyBhbGwgaGFuZGxlcnMgcmVnaXN0ZXJlZCBmb3IgdGhlIGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnl9IEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIG9uY2UgYWxsIGhhbmRsZXMgaGF2ZSBiZWVuIGRlc3Ryb3llZFxuICAgICAqL1xuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVzLmZvckVhY2goKGhhbmRsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGhhbmRsZSAmJiBoYW5kbGUuZGVzdHJveSAmJiBoYW5kbGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3kgPSBub29wO1xuICAgICAgICAgICAgdGhpcy5vd24gPSBkZXN0cm95ZWQ7XG4gICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBEZXN0cm95YWJsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURlc3Ryb3lhYmxlLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvY29yZS9EZXN0cm95YWJsZS5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9jb3JlL0Rlc3Ryb3lhYmxlLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgTWFwIGZyb20gJy4uL3NoaW0vTWFwJztcclxuaW1wb3J0IHsgRGVzdHJveWFibGUgfSBmcm9tICcuL0Rlc3Ryb3lhYmxlJztcclxuLyoqXHJcbiAqIE1hcCBvZiBjb21wdXRlZCByZWd1bGFyIGV4cHJlc3Npb25zLCBrZXllZCBieSBzdHJpbmdcclxuICovXHJcbmNvbnN0IHJlZ2V4TWFwID0gbmV3IE1hcCgpO1xyXG4vKipcclxuICogRGV0ZXJtaW5lcyBpZiB0aGUgZXZlbnQgdHlwZSBnbG9iIGhhcyBiZWVuIG1hdGNoZWRcclxuICpcclxuICogQHJldHVybnMgYm9vbGVhbiB0aGF0IGluZGljYXRlcyBpZiB0aGUgZ2xvYiBpcyBtYXRjaGVkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNHbG9iTWF0Y2goZ2xvYlN0cmluZywgdGFyZ2V0U3RyaW5nKSB7XHJcbiAgICBpZiAodHlwZW9mIHRhcmdldFN0cmluZyA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGdsb2JTdHJpbmcgPT09ICdzdHJpbmcnICYmIGdsb2JTdHJpbmcuaW5kZXhPZignKicpICE9PSAtMSkge1xyXG4gICAgICAgIGxldCByZWdleDtcclxuICAgICAgICBpZiAocmVnZXhNYXAuaGFzKGdsb2JTdHJpbmcpKSB7XHJcbiAgICAgICAgICAgIHJlZ2V4ID0gcmVnZXhNYXAuZ2V0KGdsb2JTdHJpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKGBeJHtnbG9iU3RyaW5nLnJlcGxhY2UoL1xcKi9nLCAnLionKX0kYCk7XHJcbiAgICAgICAgICAgIHJlZ2V4TWFwLnNldChnbG9iU3RyaW5nLCByZWdleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZWdleC50ZXN0KHRhcmdldFN0cmluZyk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZ2xvYlN0cmluZyA9PT0gdGFyZ2V0U3RyaW5nO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBFdmVudCBDbGFzc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEV2ZW50ZWQgZXh0ZW5kcyBEZXN0cm95YWJsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIG1hcCBvZiBsaXN0ZW5lcnMga2V5ZWQgYnkgZXZlbnQgdHlwZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG4gICAgZW1pdChldmVudCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzTWFwLmZvckVhY2goKG1ldGhvZHMsIHR5cGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlzR2xvYk1hdGNoKHR5cGUsIGV2ZW50LnR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICBbLi4ubWV0aG9kc10uZm9yRWFjaCgobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kLmNhbGwodGhpcywgZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIG9uKHR5cGUsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobGlzdGVuZXIpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXMgPSBsaXN0ZW5lci5tYXAoKGxpc3RlbmVyKSA9PiB0aGlzLl9hZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZGVzdHJveSgpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVzLmZvckVhY2goKGhhbmRsZSkgPT4gaGFuZGxlLmRlc3Ryb3koKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XHJcbiAgICB9XHJcbiAgICBfYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc01hcC5nZXQodHlwZSkgfHwgW107XHJcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzTWFwLnNldCh0eXBlLCBsaXN0ZW5lcnMpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGRlc3Ryb3k6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzTWFwLmdldCh0eXBlKSB8fCBbXTtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UobGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgRXZlbnRlZDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RXZlbnRlZC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL2NvcmUvRXZlbnRlZC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9jb3JlL0V2ZW50ZWQubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBNYXAgZnJvbSAnLi4vc2hpbS9NYXAnO1xuaW1wb3J0IEV2ZW50ZWQsIHsgaXNHbG9iTWF0Y2ggfSBmcm9tICcuL0V2ZW50ZWQnO1xuLyoqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgRXZlbnRlZCBjbGFzcyB0aGF0IHF1ZXVlcyB1cCBldmVudHMgd2hlbiBubyBsaXN0ZW5lcnMgYXJlXG4gKiBsaXN0ZW5pbmcuIFdoZW4gYSBsaXN0ZW5lciBpcyBzdWJzY3JpYmVkLCB0aGUgcXVldWUgd2lsbCBiZSBwdWJsaXNoZWQgdG8gdGhlIGxpc3RlbmVyLlxuICogV2hlbiB0aGUgcXVldWUgaXMgZnVsbCwgdGhlIG9sZGVzdCBldmVudHMgd2lsbCBiZSBkaXNjYXJkZWQgdG8gbWFrZSByb29tIGZvciB0aGUgbmV3ZXN0IG9uZXMuXG4gKlxuICogQHByb3BlcnR5IG1heEV2ZW50cyAgVGhlIG51bWJlciBvZiBldmVudHMgdG8gcXVldWUgYmVmb3JlIG9sZCBldmVudHMgYXJlIGRpc2NhcmRlZC4gSWYgemVybyAoZGVmYXVsdCksIGFuIHVubGltaXRlZCBudW1iZXIgb2YgZXZlbnRzIGlzIHF1ZXVlZC5cbiAqL1xuY2xhc3MgUXVldWluZ0V2ZW50ZWQgZXh0ZW5kcyBFdmVudGVkIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5fcXVldWUgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMubWF4RXZlbnRzID0gMDtcbiAgICB9XG4gICAgZW1pdChldmVudCkge1xuICAgICAgICBzdXBlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgbGV0IGhhc01hdGNoID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzTWFwLmZvckVhY2goKG1ldGhvZCwgdHlwZSkgPT4ge1xuICAgICAgICAgICAgLy8gU2luY2UgYHR5cGVgIGlzIGdlbmVyaWMsIHRoZSBjb21waWxlciBkb2Vzbid0IGtub3cgd2hhdCB0eXBlIGl0IGlzIGFuZCBgaXNHbG9iTWF0Y2hgIHJlcXVpcmVzIGBzdHJpbmcgfCBzeW1ib2xgXG4gICAgICAgICAgICBpZiAoaXNHbG9iTWF0Y2godHlwZSwgZXZlbnQudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBoYXNNYXRjaCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhc01hdGNoKSB7XG4gICAgICAgICAgICBsZXQgcXVldWUgPSB0aGlzLl9xdWV1ZS5nZXQoZXZlbnQudHlwZSk7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZS5zZXQoZXZlbnQudHlwZSwgcXVldWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChldmVudCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tYXhFdmVudHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHF1ZXVlLmxlbmd0aCA+IHRoaXMubWF4RXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGxldCBoYW5kbGUgPSBzdXBlci5vbih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzTWFwLmZvckVhY2goKG1ldGhvZCwgbGlzdGVuZXJUeXBlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9xdWV1ZS5mb3JFYWNoKChldmVudHMsIHF1ZXVlZFR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaXNHbG9iTWF0Y2gobGlzdGVuZXJUeXBlLCBxdWV1ZWRUeXBlKSkge1xuICAgICAgICAgICAgICAgICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHRoaXMuZW1pdChldmVudCkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZS5kZWxldGUocXVldWVkVHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaGFuZGxlO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFF1ZXVpbmdFdmVudGVkO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UXVldWluZ0V2ZW50ZWQubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9jb3JlL1F1ZXVpbmdFdmVudGVkLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL2NvcmUvUXVldWluZ0V2ZW50ZWQubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImZ1bmN0aW9uIGlzRmVhdHVyZVRlc3RUaGVuYWJsZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlICYmIHZhbHVlLnRoZW47XHJcbn1cclxuLyoqXHJcbiAqIEEgY2FjaGUgb2YgcmVzdWx0cyBvZiBmZWF0dXJlIHRlc3RzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdGVzdENhY2hlID0ge307XHJcbi8qKlxyXG4gKiBBIGNhY2hlIG9mIHRoZSB1bi1yZXNvbHZlZCBmZWF0dXJlIHRlc3RzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdGVzdEZ1bmN0aW9ucyA9IHt9O1xyXG4vKipcclxuICogQSBjYWNoZSBvZiB1bnJlc29sdmVkIHRoZW5hYmxlcyAocHJvYmFibHkgcHJvbWlzZXMpXHJcbiAqIEB0eXBlIHt7fX1cclxuICovXHJcbmNvbnN0IHRlc3RUaGVuYWJsZXMgPSB7fTtcclxuLyoqXHJcbiAqIEEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgc2NvcGUgKGB3aW5kb3dgIGluIGEgYnJvd3NlciwgYGdsb2JhbGAgaW4gTm9kZUpTKVxyXG4gKi9cclxuY29uc3QgZ2xvYmFsU2NvcGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cclxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIC8vIEJyb3dzZXJzXHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdztcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgLy8gTm9kZVxyXG4gICAgICAgIHJldHVybiBnbG9iYWw7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAvLyBXZWIgd29ya2Vyc1xyXG4gICAgICAgIHJldHVybiBzZWxmO1xyXG4gICAgfVxyXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgIHJldHVybiB7fTtcclxufSkoKTtcclxuLyogR3JhYiB0aGUgc3RhdGljRmVhdHVyZXMgaWYgdGhlcmUgYXJlIGF2YWlsYWJsZSAqL1xyXG5jb25zdCB7IHN0YXRpY0ZlYXR1cmVzIH0gPSBnbG9iYWxTY29wZS5Eb2pvSGFzRW52aXJvbm1lbnQgfHwge307XHJcbi8qIENsZWFuaW5nIHVwIHRoZSBEb2pvSGFzRW52aW9ybm1lbnQgKi9cclxuaWYgKCdEb2pvSGFzRW52aXJvbm1lbnQnIGluIGdsb2JhbFNjb3BlKSB7XHJcbiAgICBkZWxldGUgZ2xvYmFsU2NvcGUuRG9qb0hhc0Vudmlyb25tZW50O1xyXG59XHJcbi8qKlxyXG4gKiBDdXN0b20gdHlwZSBndWFyZCB0byBuYXJyb3cgdGhlIGBzdGF0aWNGZWF0dXJlc2AgdG8gZWl0aGVyIGEgbWFwIG9yIGEgZnVuY3Rpb24gdGhhdFxyXG4gKiByZXR1cm5zIGEgbWFwLlxyXG4gKlxyXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGd1YXJkIGZvclxyXG4gKi9cclxuZnVuY3Rpb24gaXNTdGF0aWNGZWF0dXJlRnVuY3Rpb24odmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XHJcbn1cclxuLyoqXHJcbiAqIFRoZSBjYWNoZSBvZiBhc3NlcnRlZCBmZWF0dXJlcyB0aGF0IHdlcmUgYXZhaWxhYmxlIGluIHRoZSBnbG9iYWwgc2NvcGUgd2hlbiB0aGVcclxuICogbW9kdWxlIGxvYWRlZFxyXG4gKi9cclxuY29uc3Qgc3RhdGljQ2FjaGUgPSBzdGF0aWNGZWF0dXJlc1xyXG4gICAgPyBpc1N0YXRpY0ZlYXR1cmVGdW5jdGlvbihzdGF0aWNGZWF0dXJlcylcclxuICAgICAgICA/IHN0YXRpY0ZlYXR1cmVzLmFwcGx5KGdsb2JhbFNjb3BlKVxyXG4gICAgICAgIDogc3RhdGljRmVhdHVyZXNcclxuICAgIDoge307IC8qIFByb3ZpZGluZyBhbiBlbXB0eSBjYWNoZSwgaWYgbm9uZSB3YXMgaW4gdGhlIGVudmlyb25tZW50XHJcblxyXG4vKipcclxuKiBBTUQgcGx1Z2luIGZ1bmN0aW9uLlxyXG4qXHJcbiogQ29uZGl0aW9uYWwgbG9hZHMgbW9kdWxlcyBiYXNlZCBvbiBhIGhhcyBmZWF0dXJlIHRlc3QgdmFsdWUuXHJcbipcclxuKiBAcGFyYW0gcmVzb3VyY2VJZCBHaXZlcyB0aGUgcmVzb2x2ZWQgbW9kdWxlIGlkIHRvIGxvYWQuXHJcbiogQHBhcmFtIHJlcXVpcmUgVGhlIGxvYWRlciByZXF1aXJlIGZ1bmN0aW9uIHdpdGggcmVzcGVjdCB0byB0aGUgbW9kdWxlIHRoYXQgY29udGFpbmVkIHRoZSBwbHVnaW4gcmVzb3VyY2UgaW4gaXRzXHJcbiogICAgICAgICAgICAgICAgZGVwZW5kZW5jeSBsaXN0LlxyXG4qIEBwYXJhbSBsb2FkIENhbGxiYWNrIHRvIGxvYWRlciB0aGF0IGNvbnN1bWVzIHJlc3VsdCBvZiBwbHVnaW4gZGVtYW5kLlxyXG4qL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9hZChyZXNvdXJjZUlkLCByZXF1aXJlLCBsb2FkLCBjb25maWcpIHtcclxuICAgIHJlc291cmNlSWQgPyByZXF1aXJlKFtyZXNvdXJjZUlkXSwgbG9hZCkgOiBsb2FkKCk7XHJcbn1cclxuLyoqXHJcbiAqIEFNRCBwbHVnaW4gZnVuY3Rpb24uXHJcbiAqXHJcbiAqIFJlc29sdmVzIHJlc291cmNlSWQgaW50byBhIG1vZHVsZSBpZCBiYXNlZCBvbiBwb3NzaWJseS1uZXN0ZWQgdGVuYXJ5IGV4cHJlc3Npb24gdGhhdCBicmFuY2hlcyBvbiBoYXMgZmVhdHVyZSB0ZXN0XHJcbiAqIHZhbHVlKHMpLlxyXG4gKlxyXG4gKiBAcGFyYW0gcmVzb3VyY2VJZCBUaGUgaWQgb2YgdGhlIG1vZHVsZVxyXG4gKiBAcGFyYW0gbm9ybWFsaXplIFJlc29sdmVzIGEgcmVsYXRpdmUgbW9kdWxlIGlkIGludG8gYW4gYWJzb2x1dGUgbW9kdWxlIGlkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHJlc291cmNlSWQsIG5vcm1hbGl6ZSkge1xyXG4gICAgY29uc3QgdG9rZW5zID0gcmVzb3VyY2VJZC5tYXRjaCgvW1xcPzpdfFteOlxcP10qL2cpIHx8IFtdO1xyXG4gICAgbGV0IGkgPSAwO1xyXG4gICAgZnVuY3Rpb24gZ2V0KHNraXApIHtcclxuICAgICAgICBjb25zdCB0ZXJtID0gdG9rZW5zW2krK107XHJcbiAgICAgICAgaWYgKHRlcm0gPT09ICc6Jykge1xyXG4gICAgICAgICAgICAvLyBlbXB0eSBzdHJpbmcgbW9kdWxlIG5hbWUsIHJlc29sdmVzIHRvIG51bGxcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBwb3N0Zml4ZWQgd2l0aCBhID8gbWVhbnMgaXQgaXMgYSBmZWF0dXJlIHRvIGJyYW5jaCBvbiwgdGhlIHRlcm0gaXMgdGhlIG5hbWUgb2YgdGhlIGZlYXR1cmVcclxuICAgICAgICAgICAgaWYgKHRva2Vuc1tpKytdID09PSAnPycpIHtcclxuICAgICAgICAgICAgICAgIGlmICghc2tpcCAmJiBoYXModGVybSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaGVkIHRoZSBmZWF0dXJlLCBnZXQgdGhlIGZpcnN0IHZhbHVlIGZyb20gdGhlIG9wdGlvbnNcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBkaWQgbm90IG1hdGNoLCBnZXQgdGhlIHNlY29uZCB2YWx1ZSwgcGFzc2luZyBvdmVyIHRoZSBmaXJzdFxyXG4gICAgICAgICAgICAgICAgICAgIGdldCh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0KHNraXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGEgbW9kdWxlXHJcbiAgICAgICAgICAgIHJldHVybiB0ZXJtO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IGlkID0gZ2V0KCk7XHJcbiAgICByZXR1cm4gaWQgJiYgbm9ybWFsaXplKGlkKTtcclxufVxyXG4vKipcclxuICogQ2hlY2sgaWYgYSBmZWF0dXJlIGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZFxyXG4gKlxyXG4gKiBAcGFyYW0gZmVhdHVyZSB0aGUgbmFtZSBvZiB0aGUgZmVhdHVyZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0cyhmZWF0dXJlKSB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkRmVhdHVyZSA9IGZlYXR1cmUudG9Mb3dlckNhc2UoKTtcclxuICAgIHJldHVybiBCb29sZWFuKG5vcm1hbGl6ZWRGZWF0dXJlIGluIHN0YXRpY0NhY2hlIHx8IG5vcm1hbGl6ZWRGZWF0dXJlIGluIHRlc3RDYWNoZSB8fCB0ZXN0RnVuY3Rpb25zW25vcm1hbGl6ZWRGZWF0dXJlXSk7XHJcbn1cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgbmV3IHRlc3QgZm9yIGEgbmFtZWQgZmVhdHVyZS5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogaGFzLmFkZCgnZG9tLWFkZGV2ZW50bGlzdGVuZXInLCAhIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpO1xyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBoYXMuYWRkKCd0b3VjaC1ldmVudHMnLCBmdW5jdGlvbiAoKSB7XHJcbiAqICAgIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudFxyXG4gKiB9KTtcclxuICpcclxuICogQHBhcmFtIGZlYXR1cmUgdGhlIG5hbWUgb2YgdGhlIGZlYXR1cmVcclxuICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSByZXBvcnRlZCBvZiB0aGUgZmVhdHVyZSwgb3IgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb25jZSBvbiBmaXJzdCB0ZXN0XHJcbiAqIEBwYXJhbSBvdmVyd3JpdGUgaWYgYW4gZXhpc3RpbmcgdmFsdWUgc2hvdWxkIGJlIG92ZXJ3cml0dGVuLiBEZWZhdWx0cyB0byBmYWxzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGQoZmVhdHVyZSwgdmFsdWUsIG92ZXJ3cml0ZSA9IGZhbHNlKSB7XHJcbiAgICBjb25zdCBub3JtYWxpemVkRmVhdHVyZSA9IGZlYXR1cmUudG9Mb3dlckNhc2UoKTtcclxuICAgIGlmIChleGlzdHMobm9ybWFsaXplZEZlYXR1cmUpICYmICFvdmVyd3JpdGUgJiYgIShub3JtYWxpemVkRmVhdHVyZSBpbiBzdGF0aWNDYWNoZSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGZWF0dXJlIFwiJHtmZWF0dXJlfVwiIGV4aXN0cyBhbmQgb3ZlcndyaXRlIG5vdCB0cnVlLmApO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHRlc3RGdW5jdGlvbnNbbm9ybWFsaXplZEZlYXR1cmVdID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpc0ZlYXR1cmVUZXN0VGhlbmFibGUodmFsdWUpKSB7XHJcbiAgICAgICAgdGVzdFRoZW5hYmxlc1tmZWF0dXJlXSA9IHZhbHVlLnRoZW4oKHJlc29sdmVkVmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGVzdENhY2hlW2ZlYXR1cmVdID0gcmVzb2x2ZWRWYWx1ZTtcclxuICAgICAgICAgICAgZGVsZXRlIHRlc3RUaGVuYWJsZXNbZmVhdHVyZV07XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBkZWxldGUgdGVzdFRoZW5hYmxlc1tmZWF0dXJlXTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRlc3RDYWNoZVtub3JtYWxpemVkRmVhdHVyZV0gPSB2YWx1ZTtcclxuICAgICAgICBkZWxldGUgdGVzdEZ1bmN0aW9uc1tub3JtYWxpemVkRmVhdHVyZV07XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIFJldHVybiB0aGUgY3VycmVudCB2YWx1ZSBvZiBhIG5hbWVkIGZlYXR1cmUuXHJcbiAqXHJcbiAqIEBwYXJhbSBmZWF0dXJlIFRoZSBuYW1lIG9mIHRoZSBmZWF0dXJlIHRvIHRlc3QuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYXMoZmVhdHVyZSkge1xyXG4gICAgbGV0IHJlc3VsdDtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWRGZWF0dXJlID0gZmVhdHVyZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgaWYgKG5vcm1hbGl6ZWRGZWF0dXJlIGluIHN0YXRpY0NhY2hlKSB7XHJcbiAgICAgICAgcmVzdWx0ID0gc3RhdGljQ2FjaGVbbm9ybWFsaXplZEZlYXR1cmVdO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodGVzdEZ1bmN0aW9uc1tub3JtYWxpemVkRmVhdHVyZV0pIHtcclxuICAgICAgICByZXN1bHQgPSB0ZXN0Q2FjaGVbbm9ybWFsaXplZEZlYXR1cmVdID0gdGVzdEZ1bmN0aW9uc1tub3JtYWxpemVkRmVhdHVyZV0uY2FsbChudWxsKTtcclxuICAgICAgICBkZWxldGUgdGVzdEZ1bmN0aW9uc1tub3JtYWxpemVkRmVhdHVyZV07XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChub3JtYWxpemVkRmVhdHVyZSBpbiB0ZXN0Q2FjaGUpIHtcclxuICAgICAgICByZXN1bHQgPSB0ZXN0Q2FjaGVbbm9ybWFsaXplZEZlYXR1cmVdO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZmVhdHVyZSBpbiB0ZXN0VGhlbmFibGVzKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQXR0ZW1wdCB0byBkZXRlY3QgdW5yZWdpc3RlcmVkIGhhcyBmZWF0dXJlIFwiJHtmZWF0dXJlfVwiYCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qXHJcbiAqIE91dCBvZiB0aGUgYm94IGZlYXR1cmUgdGVzdHNcclxuICovXHJcbi8qIEVudmlyb25tZW50cyAqL1xyXG4vKiBVc2VkIGFzIGEgdmFsdWUgdG8gcHJvdmlkZSBhIGRlYnVnIG9ubHkgY29kZSBwYXRoICovXHJcbmFkZCgnZGVidWcnLCB0cnVlKTtcclxuLyogZmxhZyBmb3IgZG9qbyBkZWJ1ZywgZGVmYXVsdCB0byBmYWxzZSAqL1xyXG5hZGQoJ2Rvam8tZGVidWcnLCBmYWxzZSk7XHJcbi8qIERldGVjdHMgaWYgdGhlIGVudmlyb25tZW50IGlzIFwiYnJvd3NlciBsaWtlXCIgKi9cclxuYWRkKCdob3N0LWJyb3dzZXInLCB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpO1xyXG4vKiBEZXRlY3RzIGlmIHRoZSBlbnZpcm9ubWVudCBhcHBlYXJzIHRvIGJlIE5vZGVKUyAqL1xyXG5hZGQoJ2hvc3Qtbm9kZScsIGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpIHtcclxuICAgICAgICByZXR1cm4gcHJvY2Vzcy52ZXJzaW9ucy5ub2RlO1xyXG4gICAgfVxyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGFzLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvaGFzL2hhcy5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9oYXMvaGFzLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgKiBhcyB0c2xpYl8xIGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJy4uL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xuaW1wb3J0IHsgdiB9IGZyb20gJy4uL3dpZGdldC1jb3JlL2QnO1xuZXhwb3J0IGNsYXNzIExpbmsgZXh0ZW5kcyBXaWRnZXRCYXNlIHtcbiAgICBfZ2V0UHJvcGVydGllcygpIHtcbiAgICAgICAgbGV0IF9hID0gdGhpcy5wcm9wZXJ0aWVzLCB7IHJvdXRlcktleSA9ICdyb3V0ZXInLCB0bywgaXNPdXRsZXQgPSB0cnVlLCB0YXJnZXQsIHBhcmFtcyA9IHt9LCBvbkNsaWNrIH0gPSBfYSwgcHJvcHMgPSB0c2xpYl8xLl9fcmVzdChfYSwgW1wicm91dGVyS2V5XCIsIFwidG9cIiwgXCJpc091dGxldFwiLCBcInRhcmdldFwiLCBcInBhcmFtc1wiLCBcIm9uQ2xpY2tcIl0pO1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5yZWdpc3RyeS5nZXRJbmplY3Rvcihyb3V0ZXJLZXkpO1xuICAgICAgICBsZXQgaHJlZiA9IHRvO1xuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgY29uc3Qgcm91dGVyID0gaXRlbS5pbmplY3RvcigpO1xuICAgICAgICAgICAgaWYgKGlzT3V0bGV0KSB7XG4gICAgICAgICAgICAgICAgaHJlZiA9IHJvdXRlci5saW5rKGhyZWYsIHBhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvbmNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgb25DbGljayAmJiBvbkNsaWNrKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgZXZlbnQuYnV0dG9uID09PSAwICYmICF0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaHJlZiAhPT0gdW5kZWZpbmVkICYmIHJvdXRlci5zZXRQYXRoKGhyZWYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7IG9uY2xpY2ssIGhyZWYgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7IGhyZWYgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiB2KCdhJywgdGhpcy5fZ2V0UHJvcGVydGllcygpLCB0aGlzLmNoaWxkcmVuKTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBMaW5rO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TGluay5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvTGluay5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL0xpbmsubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCAqIGFzIHRzbGliXzEgZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBXaWRnZXRCYXNlIH0gZnJvbSAnLi4vd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZSc7XG5pbXBvcnQgeyBhbHdheXNSZW5kZXIgfSBmcm9tICcuLi93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2Fsd2F5c1JlbmRlcic7XG5pbXBvcnQgeyBkaWZmUHJvcGVydHkgfSBmcm9tICcuLi93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2RpZmZQcm9wZXJ0eSc7XG5sZXQgT3V0bGV0ID0gY2xhc3MgT3V0bGV0IGV4dGVuZHMgV2lkZ2V0QmFzZSB7XG4gICAgb25Sb3V0ZXJLZXlDaGFuZ2UoY3VycmVudCwgbmV4dCkge1xuICAgICAgICBjb25zdCB7IHJvdXRlcktleSA9ICdyb3V0ZXInIH0gPSBuZXh0O1xuICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5yZWdpc3RyeS5nZXRJbmplY3Rvcihyb3V0ZXJLZXkpO1xuICAgICAgICBpZiAodGhpcy5faGFuZGxlKSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGUgPSBpdGVtLmludmFsaWRhdG9yLm9uKCdpbnZhbGlkYXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm93bih0aGlzLl9oYW5kbGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uQXR0YWNoKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2hhbmRsZSkge1xuICAgICAgICAgICAgdGhpcy5vblJvdXRlcktleUNoYW5nZSh0aGlzLnByb3BlcnRpZXMsIHRoaXMucHJvcGVydGllcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IHJlbmRlcmVyLCBpZCwgcm91dGVyS2V5ID0gJ3JvdXRlcicgfSA9IHRoaXMucHJvcGVydGllcztcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucmVnaXN0cnkuZ2V0SW5qZWN0b3Iocm91dGVyS2V5KTtcbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdXRlciA9IGl0ZW0uaW5qZWN0b3IoKTtcbiAgICAgICAgICAgIGNvbnN0IG91dGxldENvbnRleHQgPSByb3V0ZXIuZ2V0T3V0bGV0KGlkKTtcbiAgICAgICAgICAgIGlmIChvdXRsZXRDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBxdWVyeVBhcmFtcywgcGFyYW1zLCB0eXBlLCBpc0Vycm9yLCBpc0V4YWN0IH0gPSBvdXRsZXRDb250ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlbmRlcmVyKHsgcXVlcnlQYXJhbXMsIHBhcmFtcywgdHlwZSwgaXNFcnJvciwgaXNFeGFjdCwgcm91dGVyIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufTtcbnRzbGliXzEuX19kZWNvcmF0ZShbXG4gICAgZGlmZlByb3BlcnR5KCdyb3V0ZXJLZXknKVxuXSwgT3V0bGV0LnByb3RvdHlwZSwgXCJvblJvdXRlcktleUNoYW5nZVwiLCBudWxsKTtcbk91dGxldCA9IHRzbGliXzEuX19kZWNvcmF0ZShbXG4gICAgYWx3YXlzUmVuZGVyKClcbl0sIE91dGxldCk7XG5leHBvcnQgeyBPdXRsZXQgfTtcbmV4cG9ydCBkZWZhdWx0IE91dGxldDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU91dGxldC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvT3V0bGV0Lm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvT3V0bGV0Lm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgUXVldWluZ0V2ZW50ZWQgZnJvbSAnLi4vY29yZS9RdWV1aW5nRXZlbnRlZCc7XG5pbXBvcnQgeyBIYXNoSGlzdG9yeSB9IGZyb20gJy4vaGlzdG9yeS9IYXNoSGlzdG9yeSc7XG5jb25zdCBQQVJBTSA9ICdfX1BBUkFNX18nO1xuY29uc3QgcGFyYW1SZWdFeHAgPSBuZXcgUmVnRXhwKC9eey4rfSQvKTtcbmNvbnN0IFJPVVRFX1NFR01FTlRfU0NPUkUgPSA3O1xuY29uc3QgRFlOQU1JQ19TRUdNRU5UX1BFTkFMVFkgPSAyO1xuZnVuY3Rpb24gbWF0Y2hpbmdQYXJhbXMoeyBwYXJhbXM6IHByZXZpb3VzUGFyYW1zIH0sIHsgcGFyYW1zIH0pIHtcbiAgICBjb25zdCBtYXRjaGluZyA9IE9iamVjdC5rZXlzKHByZXZpb3VzUGFyYW1zKS5ldmVyeSgoa2V5KSA9PiBwcmV2aW91c1BhcmFtc1trZXldID09PSBwYXJhbXNba2V5XSk7XG4gICAgaWYgKCFtYXRjaGluZykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3Qua2V5cyhwYXJhbXMpLmV2ZXJ5KChrZXkpID0+IHByZXZpb3VzUGFyYW1zW2tleV0gPT09IHBhcmFtc1trZXldKTtcbn1cbmV4cG9ydCBjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBRdWV1aW5nRXZlbnRlZCB7XG4gICAgY29uc3RydWN0b3IoY29uZmlnLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fcm91dGVzID0gW107XG4gICAgICAgIHRoaXMuX291dGxldE1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX21hdGNoZWRPdXRsZXRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fY3VycmVudFBhcmFtcyA9IHt9O1xuICAgICAgICB0aGlzLl9jdXJyZW50UXVlcnlQYXJhbXMgPSB7fTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxlZCBvbiBjaGFuZ2Ugb2YgdGhlIHJvdXRlIGJ5IHRoZSB0aGUgcmVnaXN0ZXJlZCBoaXN0b3J5IG1hbmFnZXIuIE1hdGNoZXMgdGhlIHBhdGggYWdhaW5zdFxuICAgICAgICAgKiB0aGUgcmVnaXN0ZXJlZCBvdXRsZXRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gcmVxdWVzdGVkUGF0aCBUaGUgcGF0aCBvZiB0aGUgcmVxdWVzdGVkIHJvdXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vbkNoYW5nZSA9IChyZXF1ZXN0ZWRQYXRoKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0ZWRQYXRoID0gdGhpcy5fc3RyaXBMZWFkaW5nU2xhc2gocmVxdWVzdGVkUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c01hdGNoZWRPdXRsZXRzID0gdGhpcy5fbWF0Y2hlZE91dGxldHM7XG4gICAgICAgICAgICB0aGlzLl9tYXRjaGVkT3V0bGV0cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgICBjb25zdCBbcGF0aCwgcXVlcnlQYXJhbVN0cmluZ10gPSByZXF1ZXN0ZWRQYXRoLnNwbGl0KCc/Jyk7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50UXVlcnlQYXJhbXMgPSB0aGlzLl9nZXRRdWVyeVBhcmFtcyhxdWVyeVBhcmFtU3RyaW5nKTtcbiAgICAgICAgICAgIGNvbnN0IHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgbGV0IHJvdXRlQ29uZmlncyA9IHRoaXMuX3JvdXRlcy5tYXAoKHJvdXRlKSA9PiAoe1xuICAgICAgICAgICAgICAgIHJvdXRlLFxuICAgICAgICAgICAgICAgIHNlZ21lbnRzOiBbLi4uc2VnbWVudHNdLFxuICAgICAgICAgICAgICAgIHBhcmVudDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge31cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGxldCByb3V0ZUNvbmZpZztcbiAgICAgICAgICAgIGxldCBtYXRjaGVkUm91dGVzID0gW107XG4gICAgICAgICAgICB3aGlsZSAoKHJvdXRlQ29uZmlnID0gcm91dGVDb25maWdzLnBvcCgpKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcm91dGUsIHBhcmVudCwgc2VnbWVudHMsIHBhcmFtcyB9ID0gcm91dGVDb25maWc7XG4gICAgICAgICAgICAgICAgbGV0IHNlZ21lbnRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IHR5cGUgPSAnaW5kZXgnO1xuICAgICAgICAgICAgICAgIGxldCBwYXJhbUluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgcm91dGVNYXRjaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA8IHJvdXRlLnNlZ21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByb3V0ZU1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdXRlLnNlZ21lbnRzW3NlZ21lbnRJbmRleF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAncGFydGlhbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWdtZW50ID0gc2VnbWVudHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZS5zZWdtZW50c1tzZWdtZW50SW5kZXhdID09PSBQQVJBTSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tyb3V0ZS5wYXJhbXNbcGFyYW1JbmRleCsrXV0gPSBzZWdtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnRQYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9jdXJyZW50UGFyYW1zLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocm91dGUuc2VnbWVudHNbc2VnbWVudEluZGV4XSAhPT0gc2VnbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyb3V0ZU1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlQ29uZmlnLnR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkUm91dGVzLnB1c2goeyByb3V0ZSwgcGFyZW50LCB0eXBlLCBwYXJhbXMsIHNlZ21lbnRzOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm91dGVDb25maWdzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJvdXRlQ29uZmlncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yb3V0ZS5jaGlsZHJlbi5tYXAoKGNoaWxkUm91dGUpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdXRlOiBjaGlsZFJvdXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWdtZW50czogWy4uLnNlZ21lbnRzXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiByb3V0ZUNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBPYmplY3QuYXNzaWduKHt9LCBwYXJhbXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IG1hdGNoZWRPdXRsZXROYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgbGV0IG1hdGNoZWRSb3V0ZSA9IG1hdGNoZWRSb3V0ZXMucmVkdWNlKChtYXRjaCwgbWF0Y2hlZFJvdXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlZFJvdXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gucm91dGUuc2NvcmUgPiBtYXRjaGVkUm91dGUucm91dGUuc2NvcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlZFJvdXRlO1xuICAgICAgICAgICAgfSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVkUm91dGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlZFJvdXRlLnR5cGUgPT09ICdwYXJ0aWFsJykge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkUm91dGUudHlwZSA9ICdlcnJvcic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1hdGNoZWRPdXRsZXROYW1lID0gbWF0Y2hlZFJvdXRlLnJvdXRlLm91dGxldDtcbiAgICAgICAgICAgICAgICB3aGlsZSAobWF0Y2hlZFJvdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB7IHR5cGUsIHBhcmFtcywgcGFyZW50LCByb3V0ZSB9ID0gbWF0Y2hlZFJvdXRlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVkT3V0bGV0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJvdXRlLm91dGxldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW1zOiB0aGlzLl9jdXJyZW50UXVlcnlQYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNFcnJvcjogKCkgPT4gdHlwZSA9PT0gJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRXhhY3Q6ICgpID0+IHR5cGUgPT09ICdpbmRleCdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNNYXRjaGVkT3V0bGV0ID0gcHJldmlvdXNNYXRjaGVkT3V0bGV0c1tyb3V0ZS5vdXRsZXRdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXRjaGVkT3V0bGV0c1tyb3V0ZS5vdXRsZXRdID0gbWF0Y2hlZE91dGxldDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcmV2aW91c01hdGNoZWRPdXRsZXQgfHwgIW1hdGNoaW5nUGFyYW1zKHByZXZpb3VzTWF0Y2hlZE91dGxldCwgbWF0Y2hlZE91dGxldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCh7IHR5cGU6ICdvdXRsZXQnLCBvdXRsZXQ6IG1hdGNoZWRPdXRsZXQsIGFjdGlvbjogJ2VudGVyJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkUm91dGUgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWF0Y2hlZE91dGxldHMuZXJyb3JPdXRsZXQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnZXJyb3JPdXRsZXQnLFxuICAgICAgICAgICAgICAgICAgICBxdWVyeVBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgICAgIGlzRXJyb3I6ICgpID0+IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGlzRXhhY3Q6ICgpID0+IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzTWF0Y2hlZE91dGxldEtleXMgPSBPYmplY3Qua2V5cyhwcmV2aW91c01hdGNoZWRPdXRsZXRzKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJldmlvdXNNYXRjaGVkT3V0bGV0S2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHByZXZpb3VzTWF0Y2hlZE91dGxldEtleXNbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlZE91dGxldCA9IHRoaXMuX21hdGNoZWRPdXRsZXRzW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVkT3V0bGV0IHx8ICFtYXRjaGluZ1BhcmFtcyhwcmV2aW91c01hdGNoZWRPdXRsZXRzW2tleV0sIG1hdGNoZWRPdXRsZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCh7IHR5cGU6ICdvdXRsZXQnLCBvdXRsZXQ6IHByZXZpb3VzTWF0Y2hlZE91dGxldHNba2V5XSwgYWN0aW9uOiAnZXhpdCcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbWl0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbmF2JyxcbiAgICAgICAgICAgICAgICBvdXRsZXQ6IG1hdGNoZWRPdXRsZXROYW1lLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IG1hdGNoZWRPdXRsZXROYW1lID8gdGhpcy5fbWF0Y2hlZE91dGxldHNbbWF0Y2hlZE91dGxldE5hbWVdIDogdW5kZWZpbmVkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgeyBIaXN0b3J5TWFuYWdlciA9IEhhc2hIaXN0b3J5LCBiYXNlLCB3aW5kb3cgfSA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyKGNvbmZpZyk7XG4gICAgICAgIHRoaXMuX2hpc3RvcnkgPSBuZXcgSGlzdG9yeU1hbmFnZXIoeyBvbkNoYW5nZTogdGhpcy5fb25DaGFuZ2UsIGJhc2UsIHdpbmRvdyB9KTtcbiAgICAgICAgaWYgKHRoaXMuX21hdGNoZWRPdXRsZXRzLmVycm9yT3V0bGV0ICYmIHRoaXMuX2RlZmF1bHRPdXRsZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmxpbmsodGhpcy5fZGVmYXVsdE91dGxldCk7XG4gICAgICAgICAgICBpZiAocGF0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBwYXRoIGFnYWluc3QgdGhlIHJlZ2lzdGVyZWQgaGlzdG9yeSBtYW5hZ2VyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byBzZXQgb24gdGhlIGhpc3RvcnkgbWFuYWdlclxuICAgICAqL1xuICAgIHNldFBhdGgocGF0aCkge1xuICAgICAgICB0aGlzLl9oaXN0b3J5LnNldChwYXRoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSBsaW5rIGZvciBhIGdpdmVuIG91dGxldCBpZGVudGlmaWVyIGFuZCBvcHRpb25hbCBwYXJhbXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3V0bGV0IFRoZSBvdXRsZXQgdG8gZ2VuZXJhdGUgYSBsaW5rIGZvclxuICAgICAqIEBwYXJhbSBwYXJhbXMgT3B0aW9uYWwgUGFyYW1zIGZvciB0aGUgZ2VuZXJhdGVkIGxpbmtcbiAgICAgKi9cbiAgICBsaW5rKG91dGxldCwgcGFyYW1zID0ge30pIHtcbiAgICAgICAgY29uc3QgeyBfb3V0bGV0TWFwLCBfY3VycmVudFBhcmFtcywgX2N1cnJlbnRRdWVyeVBhcmFtcyB9ID0gdGhpcztcbiAgICAgICAgbGV0IHJvdXRlID0gX291dGxldE1hcFtvdXRsZXRdO1xuICAgICAgICBpZiAocm91dGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsaW5rUGF0aCA9IHJvdXRlLmZ1bGxQYXRoO1xuICAgICAgICBpZiAocm91dGUuZnVsbFF1ZXJ5UGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxldCBxdWVyeVN0cmluZyA9IHJvdXRlLmZ1bGxRdWVyeVBhcmFtcy5yZWR1Y2UoKHF1ZXJ5UGFyYW1TdHJpbmcsIHBhcmFtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3F1ZXJ5UGFyYW1TdHJpbmd9JiR7cGFyYW19PXske3BhcmFtfX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYD8ke3BhcmFtfT17JHtwYXJhbX19YDtcbiAgICAgICAgICAgIH0sICcnKTtcbiAgICAgICAgICAgIGxpbmtQYXRoID0gYCR7bGlua1BhdGh9JHtxdWVyeVN0cmluZ31gO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHJvdXRlLmRlZmF1bHRQYXJhbXMsIF9jdXJyZW50UXVlcnlQYXJhbXMsIF9jdXJyZW50UGFyYW1zLCBwYXJhbXMpO1xuICAgICAgICBpZiAoT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGggPT09IDAgJiYgcm91dGUuZnVsbFBhcmFtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZ1bGxQYXJhbXMgPSBbLi4ucm91dGUuZnVsbFBhcmFtcywgLi4ucm91dGUuZnVsbFF1ZXJ5UGFyYW1zXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmdWxsUGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJhbSA9IGZ1bGxQYXJhbXNbaV07XG4gICAgICAgICAgICBpZiAocGFyYW1zW3BhcmFtXSkge1xuICAgICAgICAgICAgICAgIGxpbmtQYXRoID0gbGlua1BhdGgucmVwbGFjZShgeyR7cGFyYW19fWAsIHBhcmFtc1twYXJhbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlua1BhdGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG91dGxldCBjb250ZXh0IGZvciB0aGUgb3V0bGV0IGlkZW50aWZpZXIgaWYgb25lIGhhcyBiZWVuIG1hdGNoZWRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvdXRsZXRJZGVudGlmaWVyIFRoZSBvdXRsZXQgaWRlbnRpZmVyXG4gICAgICovXG4gICAgZ2V0T3V0bGV0KG91dGxldElkZW50aWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hdGNoZWRPdXRsZXRzW291dGxldElkZW50aWZpZXJdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCB0aGUgcGFyYW1zIGZvciB0aGUgY3VycmVudCBtYXRjaGVkIG91dGxldHNcbiAgICAgKi9cbiAgICBnZXQgY3VycmVudFBhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRQYXJhbXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0cmlwcyB0aGUgbGVhZGluZyBzbGFzaCBvbiBhIHBhdGggaWYgb25lIGV4aXN0c1xuICAgICAqXG4gICAgICogQHBhcmFtIHBhdGggVGhlIHBhdGggdG8gc3RyaXAgYSBsZWFkaW5nIHNsYXNoXG4gICAgICovXG4gICAgX3N0cmlwTGVhZGluZ1NsYXNoKHBhdGgpIHtcbiAgICAgICAgaWYgKHBhdGhbMF0gPT09ICcvJykge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGguc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyB0aGUgcm91dGluZyBjb25maWd1cmF0aW9uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29uZmlnIFRoZSBjb25maWd1cmF0aW9uXG4gICAgICogQHBhcmFtIHJvdXRlcyBUaGUgcm91dGVzXG4gICAgICogQHBhcmFtIHBhcmVudFJvdXRlIFRoZSBwYXJlbnQgcm91dGVcbiAgICAgKi9cbiAgICBfcmVnaXN0ZXIoY29uZmlnLCByb3V0ZXMsIHBhcmVudFJvdXRlKSB7XG4gICAgICAgIHJvdXRlcyA9IHJvdXRlcyA/IHJvdXRlcyA6IHRoaXMuX3JvdXRlcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCB7IHBhdGgsIG91dGxldCwgY2hpbGRyZW4sIGRlZmF1bHRSb3V0ZSA9IGZhbHNlLCBkZWZhdWx0UGFyYW1zID0ge30gfSA9IGNvbmZpZ1tpXTtcbiAgICAgICAgICAgIGxldCBbcGFyc2VkUGF0aCwgcXVlcnlQYXJhbVN0cmluZ10gPSBwYXRoLnNwbGl0KCc/Jyk7XG4gICAgICAgICAgICBsZXQgcXVlcnlQYXJhbXMgPSBbXTtcbiAgICAgICAgICAgIHBhcnNlZFBhdGggPSB0aGlzLl9zdHJpcExlYWRpbmdTbGFzaChwYXJzZWRQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IHNlZ21lbnRzID0gcGFyc2VkUGF0aC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgY29uc3Qgcm91dGUgPSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgICAgICAgICBvdXRsZXQsXG4gICAgICAgICAgICAgICAgcGF0aDogcGFyc2VkUGF0aCxcbiAgICAgICAgICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0UGFyYW1zOiBwYXJlbnRSb3V0ZSA/IE9iamVjdC5hc3NpZ24oe30sIHBhcmVudFJvdXRlLmRlZmF1bHRQYXJhbXMsIGRlZmF1bHRQYXJhbXMpIDogZGVmYXVsdFBhcmFtcyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgICAgICAgICAgZnVsbFBhdGg6IHBhcmVudFJvdXRlID8gYCR7cGFyZW50Um91dGUuZnVsbFBhdGh9LyR7cGFyc2VkUGF0aH1gIDogcGFyc2VkUGF0aCxcbiAgICAgICAgICAgICAgICBmdWxsUGFyYW1zOiBbXSxcbiAgICAgICAgICAgICAgICBmdWxsUXVlcnlQYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBwYXJlbnRSb3V0ZSA/IHBhcmVudFJvdXRlLnNjb3JlIDogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChkZWZhdWx0Um91dGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0T3V0bGV0ID0gb3V0bGV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlZ21lbnQgPSBzZWdtZW50c1tpXTtcbiAgICAgICAgICAgICAgICByb3V0ZS5zY29yZSArPSBST1VURV9TRUdNRU5UX1NDT1JFO1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbVJlZ0V4cC50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlLnNjb3JlIC09IERZTkFNSUNfU0VHTUVOVF9QRU5BTFRZO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZS5wYXJhbXMucHVzaChzZWdtZW50LnJlcGxhY2UoJ3snLCAnJykucmVwbGFjZSgnfScsICcnKSk7XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzW2ldID0gUEFSQU07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHF1ZXJ5UGFyYW1TdHJpbmcpIHtcbiAgICAgICAgICAgICAgICBxdWVyeVBhcmFtcyA9IHF1ZXJ5UGFyYW1TdHJpbmcuc3BsaXQoJyYnKS5tYXAoKHF1ZXJ5UGFyYW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5UGFyYW0ucmVwbGFjZSgneycsICcnKS5yZXBsYWNlKCd9JywgJycpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcm91dGUuZnVsbFF1ZXJ5UGFyYW1zID0gcGFyZW50Um91dGUgPyBbLi4ucGFyZW50Um91dGUuZnVsbFF1ZXJ5UGFyYW1zLCAuLi5xdWVyeVBhcmFtc10gOiBxdWVyeVBhcmFtcztcbiAgICAgICAgICAgIHJvdXRlLmZ1bGxQYXJhbXMgPSBwYXJlbnRSb3V0ZSA/IFsuLi5wYXJlbnRSb3V0ZS5mdWxsUGFyYW1zLCAuLi5yb3V0ZS5wYXJhbXNdIDogcm91dGUucGFyYW1zO1xuICAgICAgICAgICAgaWYgKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWdpc3RlcihjaGlsZHJlbiwgcm91dGUuY2hpbGRyZW4sIHJvdXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX291dGxldE1hcFtvdXRsZXRdID0gcm91dGU7XG4gICAgICAgICAgICByb3V0ZXMucHVzaChyb3V0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBvYmplY3Qgb2YgcXVlcnkgcGFyYW1zXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcXVlcnlQYXJhbVN0cmluZyBUaGUgc3RyaW5nIG9mIHF1ZXJ5IHBhcmFtcywgZS5nIGBwYXJhbU9uZT1vbmUmcGFyYW1Ud289dHdvYFxuICAgICAqL1xuICAgIF9nZXRRdWVyeVBhcmFtcyhxdWVyeVBhcmFtU3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0ge307XG4gICAgICAgIGlmIChxdWVyeVBhcmFtU3RyaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBxdWVyeVBhcmFtZXRlcnMgPSBxdWVyeVBhcmFtU3RyaW5nLnNwbGl0KCcmJyk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHF1ZXJ5UGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IHF1ZXJ5UGFyYW1ldGVyc1tpXS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgICAgIHF1ZXJ5UGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcXVlcnlQYXJhbXM7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgUm91dGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Um91dGVyLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvcm91dGluZy9Sb3V0ZXIubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvcm91dGluZy9Sb3V0ZXIubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCAqIGFzIHRzbGliXzEgZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICcuL1JvdXRlcic7XG4vKipcbiAqIENyZWF0ZXMgYSByb3V0ZXIgaW5zdGFuY2UgZm9yIGEgc3BlY2lmaWMgSGlzdG9yeSBtYW5hZ2VyIChkZWZhdWx0IGlzIGBIYXNoSGlzdG9yeWApIGFuZCByZWdpc3RlcnNcbiAqIHRoZSByb3V0ZSBjb25maWd1cmF0aW9uLlxuICpcbiAqIEBwYXJhbSBjb25maWcgVGhlIHJvdXRlIGNvbmZpZyB0byByZWdpc3RlciBmb3IgdGhlIHJvdXRlclxuICogQHBhcmFtIHJlZ2lzdHJ5IEFuIG9wdGlvbmFsIHJlZ2lzdHJ5IHRoYXQgZGVmYXVsdHMgdG8gdGhlIGdsb2JhbCByZWdpc3RyeVxuICogQHBhcmFtIG9wdGlvbnMgVGhlIHJvdXRlciBpbmplY3RvciBvcHRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclJvdXRlckluamVjdG9yKGNvbmZpZywgcmVnaXN0cnksIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsga2V5ID0gJ3JvdXRlcicgfSA9IG9wdGlvbnMsIHJvdXRlck9wdGlvbnMgPSB0c2xpYl8xLl9fcmVzdChvcHRpb25zLCBbXCJrZXlcIl0pO1xuICAgIGlmIChyZWdpc3RyeS5oYXNJbmplY3RvcihrZXkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUm91dGVyIGhhcyBhbHJlYWR5IGJlZW4gZGVmaW5lZCcpO1xuICAgIH1cbiAgICBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKGNvbmZpZywgcm91dGVyT3B0aW9ucyk7XG4gICAgcmVnaXN0cnkuZGVmaW5lSW5qZWN0b3Ioa2V5LCAoaW52YWxpZGF0b3IpID0+IHtcbiAgICAgICAgcm91dGVyLm9uKCduYXYnLCAoKSA9PiBpbnZhbGlkYXRvcigpKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHJvdXRlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gcm91dGVyO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Um91dGVySW5qZWN0b3IubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlckluamVjdG9yLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvUm91dGVySW5qZWN0b3IubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi4vLi4vc2hpbS9nbG9iYWwnO1xuZXhwb3J0IGNsYXNzIEhhc2hIaXN0b3J5IHtcbiAgICBjb25zdHJ1Y3Rvcih7IHdpbmRvdyA9IGdsb2JhbC53aW5kb3csIG9uQ2hhbmdlIH0pIHtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50ID0gdGhpcy5ub3JtYWxpemVQYXRoKHRoaXMuX3dpbmRvdy5sb2NhdGlvbi5oYXNoKTtcbiAgICAgICAgICAgIHRoaXMuX29uQ2hhbmdlRnVuY3Rpb24odGhpcy5fY3VycmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlRnVuY3Rpb24gPSBvbkNoYW5nZTtcbiAgICAgICAgdGhpcy5fd2luZG93ID0gd2luZG93O1xuICAgICAgICB0aGlzLl93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRoaXMuX29uQ2hhbmdlLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSB0aGlzLm5vcm1hbGl6ZVBhdGgodGhpcy5fd2luZG93LmxvY2F0aW9uLmhhc2gpO1xuICAgICAgICB0aGlzLl9vbkNoYW5nZUZ1bmN0aW9uKHRoaXMuX2N1cnJlbnQpO1xuICAgIH1cbiAgICBub3JtYWxpemVQYXRoKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZSgnIycsICcnKTtcbiAgICB9XG4gICAgcHJlZml4KHBhdGgpIHtcbiAgICAgICAgaWYgKHBhdGhbMF0gIT09ICcjJykge1xuICAgICAgICAgICAgcmV0dXJuIGAjJHtwYXRofWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICAgIHNldChwYXRoKSB7XG4gICAgICAgIHRoaXMuX3dpbmRvdy5sb2NhdGlvbi5oYXNoID0gdGhpcy5wcmVmaXgocGF0aCk7XG4gICAgfVxuICAgIGdldCBjdXJyZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudDtcbiAgICB9XG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5fd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZSk7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgSGFzaEhpc3Rvcnk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1IYXNoSGlzdG9yeS5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvaGlzdG9yeS9IYXNoSGlzdG9yeS5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL2hpc3RvcnkvSGFzaEhpc3RvcnkubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IGlzQXJyYXlMaWtlLCBTaGltSXRlcmF0b3IgfSBmcm9tICcuL2l0ZXJhdG9yJztcclxuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCB7IGlzIGFzIG9iamVjdElzIH0gZnJvbSAnLi9vYmplY3QnO1xyXG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xyXG5pbXBvcnQgJy4vU3ltYm9sJztcclxuZXhwb3J0IGxldCBNYXAgPSBnbG9iYWwuTWFwO1xyXG5pZiAoIXRydWUpIHtcclxuICAgIE1hcCA9IChfYSA9IGNsYXNzIE1hcCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXNbU3ltYm9sLnRvU3RyaW5nVGFnXSA9ICdNYXAnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhYmxlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGl0ZXJhYmxlW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQodmFsdWVbMF0sIHZhbHVlWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQodmFsdWVbMF0sIHZhbHVlWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogQW4gYWx0ZXJuYXRpdmUgdG8gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgdXNpbmcgT2JqZWN0LmlzXHJcbiAgICAgICAgICAgICAqIHRvIGNoZWNrIGZvciBlcXVhbGl0eS4gU2VlIGh0dHA6Ly9temwubGEvMXp1S08yVlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgX2luZGV4T2ZLZXkoa2V5cywga2V5KSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmplY3RJcyhrZXlzW2ldLCBrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBnZXQgc2l6ZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9rZXlzLmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGVhcigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXMubGVuZ3RoID0gdGhpcy5fdmFsdWVzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlKGtleSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbnRyaWVzKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy5fa2V5cy5tYXAoKGtleSwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBba2V5LCB0aGlzLl92YWx1ZXNbaV1dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih2YWx1ZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvckVhY2goY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSB0aGlzLl9rZXlzO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy5fdmFsdWVzO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQsIHZhbHVlc1tpXSwga2V5c1tpXSwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ2V0KGtleSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogdGhpcy5fdmFsdWVzW2luZGV4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYXMoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpID4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAga2V5cygpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX2tleXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldChrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLl9pbmRleE9mS2V5KHRoaXMuX2tleXMsIGtleSk7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IGluZGV4IDwgMCA/IHRoaXMuX2tleXMubGVuZ3RoIDogaW5kZXg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2luZGV4XSA9IGtleTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhbHVlcygpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU2hpbUl0ZXJhdG9yKHRoaXMuX3ZhbHVlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbnRyaWVzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIF9hW1N5bWJvbC5zcGVjaWVzXSA9IF9hLFxyXG4gICAgICAgIF9hKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCBNYXA7XHJcbnZhciBfYTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TWFwLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9NYXAubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9NYXAubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi9nbG9iYWwnO1xyXG5pbXBvcnQgeyBxdWV1ZU1pY3JvVGFzayB9IGZyb20gJy4vc3VwcG9ydC9xdWV1ZSc7XHJcbmltcG9ydCAnLi9TeW1ib2wnO1xyXG5pbXBvcnQgaGFzIGZyb20gJy4vc3VwcG9ydC9oYXMnO1xyXG5leHBvcnQgbGV0IFNoaW1Qcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XHJcbmV4cG9ydCBjb25zdCBpc1RoZW5hYmxlID0gZnVuY3Rpb24gaXNUaGVuYWJsZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nO1xyXG59O1xyXG5pZiAoIXRydWUpIHtcclxuICAgIGdsb2JhbC5Qcm9taXNlID0gU2hpbVByb21pc2UgPSAoX2EgPSBjbGFzcyBQcm9taXNlIHtcclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIENyZWF0ZXMgYSBuZXcgUHJvbWlzZS5cclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBleGVjdXRvclxyXG4gICAgICAgICAgICAgKiBUaGUgZXhlY3V0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIGltbWVkaWF0ZWx5IHdoZW4gdGhlIFByb21pc2UgaXMgaW5zdGFudGlhdGVkLiBJdCBpcyByZXNwb25zaWJsZSBmb3JcclxuICAgICAgICAgICAgICogc3RhcnRpbmcgdGhlIGFzeW5jaHJvbm91cyBvcGVyYXRpb24gd2hlbiBpdCBpcyBpbnZva2VkLlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBUaGUgZXhlY3V0b3IgbXVzdCBjYWxsIGVpdGhlciB0aGUgcGFzc2VkIGByZXNvbHZlYCBmdW5jdGlvbiB3aGVuIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWRcclxuICAgICAgICAgICAgICogc3VjY2Vzc2Z1bGx5LCBvciB0aGUgYHJlamVjdGAgZnVuY3Rpb24gd2hlbiB0aGUgb3BlcmF0aW9uIGZhaWxzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgY29uc3RydWN0b3IoZXhlY3V0b3IpIHtcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhpcyBwcm9taXNlLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gMSAvKiBQZW5kaW5nICovO1xyXG4gICAgICAgICAgICAgICAgdGhpc1tTeW1ib2wudG9TdHJpbmdUYWddID0gJ1Byb21pc2UnO1xyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBJZiB0cnVlLCB0aGUgcmVzb2x1dGlvbiBvZiB0aGlzIHByb21pc2UgaXMgY2hhaW5lZCAoXCJsb2NrZWQgaW5cIikgdG8gYW5vdGhlciBwcm9taXNlLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgaXNDaGFpbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIFdoZXRoZXIgb3Igbm90IHRoaXMgcHJvbWlzZSBpcyBpbiBhIHJlc29sdmVkIHN0YXRlLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpc1Jlc29sdmVkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlICE9PSAxIC8qIFBlbmRpbmcgKi8gfHwgaXNDaGFpbmVkO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogQ2FsbGJhY2tzIHRoYXQgc2hvdWxkIGJlIGludm9rZWQgb25jZSB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiBoYXMgY29tcGxldGVkLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBsZXQgY2FsbGJhY2tzID0gW107XHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIEluaXRpYWxseSBwdXNoZXMgY2FsbGJhY2tzIG9udG8gYSBxdWV1ZSBmb3IgZXhlY3V0aW9uIG9uY2UgdGhpcyBwcm9taXNlIHNldHRsZXMuIEFmdGVyIHRoZSBwcm9taXNlIHNldHRsZXMsXHJcbiAgICAgICAgICAgICAgICAgKiBlbnF1ZXVlcyBjYWxsYmFja3MgZm9yIGV4ZWN1dGlvbiBvbiB0aGUgbmV4dCBldmVudCBsb29wIHR1cm4uXHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIGxldCB3aGVuRmluaXNoZWQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICAgKiBTZXR0bGVzIHRoaXMgcHJvbWlzZS5cclxuICAgICAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gbmV3U3RhdGUgVGhlIHJlc29sdmVkIHN0YXRlIGZvciB0aGlzIHByb21pc2UuXHJcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge1R8YW55fSB2YWx1ZSBUaGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoaXMgcHJvbWlzZS5cclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGxlID0gKG5ld1N0YXRlLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcHJvbWlzZSBjYW4gb25seSBiZSBzZXR0bGVkIG9uY2UuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IDEgLyogUGVuZGluZyAqLykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBuZXdTdGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29sdmVkVmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB3aGVuRmluaXNoZWQgPSBxdWV1ZU1pY3JvVGFzaztcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IGVucXVldWUgYSBjYWxsYmFjayBydW5uZXIgaWYgdGhlcmUgYXJlIGNhbGxiYWNrcyBzbyB0aGF0IGluaXRpYWxseSBmdWxmaWxsZWQgUHJvbWlzZXMgZG9uJ3QgaGF2ZSB0b1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdhaXQgYW4gZXh0cmEgdHVybi5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tzICYmIGNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTWljcm9UYXNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY291bnQgPSBjYWxsYmFja3MubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja3NbaV0uY2FsbChudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogUmVzb2x2ZXMgdGhpcyBwcm9taXNlLlxyXG4gICAgICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSBuZXdTdGF0ZSBUaGUgcmVzb2x2ZWQgc3RhdGUgZm9yIHRoaXMgcHJvbWlzZS5cclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7VHxhbnl9IHZhbHVlIFRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhpcyBwcm9taXNlLlxyXG4gICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXNvbHZlID0gKG5ld1N0YXRlLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1Jlc29sdmVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNUaGVuYWJsZSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUudGhlbihzZXR0bGUuYmluZChudWxsLCAwIC8qIEZ1bGZpbGxlZCAqLyksIHNldHRsZS5iaW5kKG51bGwsIDIgLyogUmVqZWN0ZWQgKi8pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNDaGFpbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRsZShuZXdTdGF0ZSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRoZW4gPSAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGVuRmluaXNoZWQgaW5pdGlhbGx5IHF1ZXVlcyB1cCBjYWxsYmFja3MgZm9yIGV4ZWN1dGlvbiBhZnRlciB0aGUgcHJvbWlzZSBoYXMgc2V0dGxlZC4gT25jZSB0aGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcHJvbWlzZSBoYXMgc2V0dGxlZCwgd2hlbkZpbmlzaGVkIHdpbGwgc2NoZWR1bGUgY2FsbGJhY2tzIGZvciBleGVjdXRpb24gb24gdGhlIG5leHQgdHVybiB0aHJvdWdoIHRoZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBldmVudCBsb29wLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuRmluaXNoZWQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLnN0YXRlID09PSAyIC8qIFJlamVjdGVkICovID8gb25SZWplY3RlZCA6IG9uRnVsZmlsbGVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2FsbGJhY2sodGhpcy5yZXNvbHZlZFZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09IDIgLyogUmVqZWN0ZWQgKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QodGhpcy5yZXNvbHZlZFZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNvbHZlZFZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBleGVjdXRvcihyZXNvbHZlLmJpbmQobnVsbCwgMCAvKiBGdWxmaWxsZWQgKi8pLCByZXNvbHZlLmJpbmQobnVsbCwgMiAvKiBSZWplY3RlZCAqLykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGxlKDIgLyogUmVqZWN0ZWQgKi8sIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGF0aWMgYWxsKGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21wbGV0ZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRvdGFsID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9wdWxhdGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZnVsZmlsbChpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK2NvbXBsZXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2goKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9wdWxhdGluZyB8fCBjb21wbGV0ZSA8IHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBwcm9jZXNzSXRlbShpbmRleCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3RvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNUaGVuYWJsZShpdGVtKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYW4gaXRlbSBQcm9taXNlIHJlamVjdHMsIHRoaXMgUHJvbWlzZSBpcyBpbW1lZGlhdGVseSByZWplY3RlZCB3aXRoIHRoZSBpdGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9taXNlJ3MgcmVqZWN0aW9uIGVycm9yLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50aGVuKGZ1bGZpbGwuYmluZChudWxsLCBpbmRleCksIHJlamVjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoaXRlbSkudGhlbihmdWxmaWxsLmJpbmQobnVsbCwgaW5kZXgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzSXRlbShpLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcG9wdWxhdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhdGljIHJhY2UoaXRlcmFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYSBQcm9taXNlIGl0ZW0gcmVqZWN0cywgdGhpcyBQcm9taXNlIGlzIGltbWVkaWF0ZWx5IHJlamVjdGVkIHdpdGggdGhlIGl0ZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByb21pc2UncyByZWplY3Rpb24gZXJyb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShpdGVtKS50aGVuKHJlc29sdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhdGljIHJlamVjdChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGF0aWMgcmVzb2x2ZSh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uIChyZXNvbHZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaChvblJlamVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIF9hW1N5bWJvbC5zcGVjaWVzXSA9IFNoaW1Qcm9taXNlLFxyXG4gICAgICAgIF9hKTtcclxufVxyXG5leHBvcnQgZGVmYXVsdCBTaGltUHJvbWlzZTtcclxudmFyIF9hO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Qcm9taXNlLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9Qcm9taXNlLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vUHJvbWlzZS5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCB7IGlzQXJyYXlMaWtlLCBTaGltSXRlcmF0b3IgfSBmcm9tICcuL2l0ZXJhdG9yJztcclxuaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcclxuaW1wb3J0ICcuL1N5bWJvbCc7XHJcbmV4cG9ydCBsZXQgU2V0ID0gZ2xvYmFsLlNldDtcclxuaWYgKCF0cnVlKSB7XHJcbiAgICBTZXQgPSAoX2EgPSBjbGFzcyBTZXQge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcihpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0RGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpc1tTeW1ib2wudG9TdHJpbmdUYWddID0gJ1NldCc7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlcmFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNBcnJheUxpa2UoaXRlcmFibGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkKGl0ZXJhYmxlW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGQodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFkZCh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0RGF0YS5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0RGF0YS5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5fc2V0RGF0YS5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChpZHggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0RGF0YS5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVudHJpZXMoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih0aGlzLl9zZXREYXRhLm1hcCgodmFsdWUpID0+IFt2YWx1ZSwgdmFsdWVdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVyYXRvciA9IHRoaXMudmFsdWVzKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFyZXN1bHQuZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrZm4uY2FsbCh0aGlzQXJnLCByZXN1bHQudmFsdWUsIHJlc3VsdC52YWx1ZSwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhcyh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldERhdGEuaW5kZXhPZih2YWx1ZSkgPiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBrZXlzKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fc2V0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ2V0IHNpemUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0RGF0YS5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFsdWVzKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTaGltSXRlcmF0b3IodGhpcy5fc2V0RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFNoaW1JdGVyYXRvcih0aGlzLl9zZXREYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgX2FbU3ltYm9sLnNwZWNpZXNdID0gX2EsXHJcbiAgICAgICAgX2EpO1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFNldDtcclxudmFyIF9hO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1TZXQubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1NldC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1NldC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcclxuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCB7IGdldFZhbHVlRGVzY3JpcHRvciB9IGZyb20gJy4vc3VwcG9ydC91dGlsJztcclxuZXhwb3J0IGxldCBTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xyXG5pZiAoIXRydWUpIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhyb3dzIGlmIHRoZSB2YWx1ZSBpcyBub3QgYSBzeW1ib2wsIHVzZWQgaW50ZXJuYWxseSB3aXRoaW4gdGhlIFNoaW1cclxuICAgICAqIEBwYXJhbSAge2FueX0gICAgdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrXHJcbiAgICAgKiBAcmV0dXJuIHtzeW1ib2x9ICAgICAgIFJldHVybnMgdGhlIHN5bWJvbCBvciB0aHJvd3NcclxuICAgICAqL1xyXG4gICAgY29uc3QgdmFsaWRhdGVTeW1ib2wgPSBmdW5jdGlvbiB2YWxpZGF0ZVN5bWJvbCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICghaXNTeW1ib2wodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IodmFsdWUgKyAnIGlzIG5vdCBhIHN5bWJvbCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgZGVmaW5lUHJvcGVydGllcyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xyXG4gICAgY29uc3QgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XHJcbiAgICBjb25zdCBjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xyXG4gICAgY29uc3Qgb2JqUHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcclxuICAgIGNvbnN0IGdsb2JhbFN5bWJvbHMgPSB7fTtcclxuICAgIGNvbnN0IGdldFN5bWJvbE5hbWUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBjcmVhdGUobnVsbCk7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkZXNjKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3N0Zml4ID0gMDtcclxuICAgICAgICAgICAgbGV0IG5hbWU7XHJcbiAgICAgICAgICAgIHdoaWxlIChjcmVhdGVkW1N0cmluZyhkZXNjKSArIChwb3N0Zml4IHx8ICcnKV0pIHtcclxuICAgICAgICAgICAgICAgICsrcG9zdGZpeDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZXNjICs9IFN0cmluZyhwb3N0Zml4IHx8ICcnKTtcclxuICAgICAgICAgICAgY3JlYXRlZFtkZXNjXSA9IHRydWU7XHJcbiAgICAgICAgICAgIG5hbWUgPSAnQEAnICsgZGVzYztcclxuICAgICAgICAgICAgLy8gRklYTUU6IFRlbXBvcmFyeSBndWFyZCB1bnRpbCB0aGUgZHVwbGljYXRlIGV4ZWN1dGlvbiB3aGVuIHRlc3RpbmcgY2FuIGJlXHJcbiAgICAgICAgICAgIC8vIHBpbm5lZCBkb3duLlxyXG4gICAgICAgICAgICBpZiAoIU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqUHJvdG90eXBlLCBuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkob2JqUHJvdG90eXBlLCBuYW1lLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwgZ2V0VmFsdWVEZXNjcmlwdG9yKHZhbHVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XHJcbiAgICAgICAgfTtcclxuICAgIH0pKCk7XHJcbiAgICBjb25zdCBJbnRlcm5hbFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbChkZXNjcmlwdGlvbikge1xyXG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgSW50ZXJuYWxTeW1ib2wpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVHlwZUVycm9yOiBTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3InKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFN5bWJvbChkZXNjcmlwdGlvbik7XHJcbiAgICB9O1xyXG4gICAgU3ltYm9sID0gZ2xvYmFsLlN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbChkZXNjcmlwdGlvbikge1xyXG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgU3ltYm9sKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1R5cGVFcnJvcjogU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN5bSA9IE9iamVjdC5jcmVhdGUoSW50ZXJuYWxTeW1ib2wucHJvdG90eXBlKTtcclxuICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uID09PSB1bmRlZmluZWQgPyAnJyA6IFN0cmluZyhkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnRpZXMoc3ltLCB7XHJcbiAgICAgICAgICAgIF9fZGVzY3JpcHRpb25fXzogZ2V0VmFsdWVEZXNjcmlwdG9yKGRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgX19uYW1lX186IGdldFZhbHVlRGVzY3JpcHRvcihnZXRTeW1ib2xOYW1lKGRlc2NyaXB0aW9uKSlcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICAvKiBEZWNvcmF0ZSB0aGUgU3ltYm9sIGZ1bmN0aW9uIHdpdGggdGhlIGFwcHJvcHJpYXRlIHByb3BlcnRpZXMgKi9cclxuICAgIGRlZmluZVByb3BlcnR5KFN5bWJvbCwgJ2ZvcicsIGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgaWYgKGdsb2JhbFN5bWJvbHNba2V5XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsU3ltYm9sc1trZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKGdsb2JhbFN5bWJvbHNba2V5XSA9IFN5bWJvbChTdHJpbmcoa2V5KSkpO1xyXG4gICAgfSkpO1xyXG4gICAgZGVmaW5lUHJvcGVydGllcyhTeW1ib2wsIHtcclxuICAgICAgICBrZXlGb3I6IGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbiAoc3ltKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXk7XHJcbiAgICAgICAgICAgIHZhbGlkYXRlU3ltYm9sKHN5bSk7XHJcbiAgICAgICAgICAgIGZvciAoa2V5IGluIGdsb2JhbFN5bWJvbHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnbG9iYWxTeW1ib2xzW2tleV0gPT09IHN5bSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgICAgICBoYXNJbnN0YW5jZTogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ2hhc0luc3RhbmNlJyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgaXNDb25jYXRTcHJlYWRhYmxlOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignaXNDb25jYXRTcHJlYWRhYmxlJyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgaXRlcmF0b3I6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdpdGVyYXRvcicpLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIG1hdGNoOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignbWF0Y2gnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICBvYnNlcnZhYmxlOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignb2JzZXJ2YWJsZScpLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHJlcGxhY2U6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCdyZXBsYWNlJyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgc2VhcmNoOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcignc2VhcmNoJyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgc3BlY2llczogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3NwZWNpZXMnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICBzcGxpdDogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3NwbGl0JyksIGZhbHNlLCBmYWxzZSksXHJcbiAgICAgICAgdG9QcmltaXRpdmU6IGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKCd0b1ByaW1pdGl2ZScpLCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgIHRvU3RyaW5nVGFnOiBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLmZvcigndG9TdHJpbmdUYWcnKSwgZmFsc2UsIGZhbHNlKSxcclxuICAgICAgICB1bnNjb3BhYmxlczogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbC5mb3IoJ3Vuc2NvcGFibGVzJyksIGZhbHNlLCBmYWxzZSlcclxuICAgIH0pO1xyXG4gICAgLyogRGVjb3JhdGUgdGhlIEludGVybmFsU3ltYm9sIG9iamVjdCAqL1xyXG4gICAgZGVmaW5lUHJvcGVydGllcyhJbnRlcm5hbFN5bWJvbC5wcm90b3R5cGUsIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcjogZ2V0VmFsdWVEZXNjcmlwdG9yKFN5bWJvbCksXHJcbiAgICAgICAgdG9TdHJpbmc6IGdldFZhbHVlRGVzY3JpcHRvcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9fbmFtZV9fO1xyXG4gICAgICAgIH0sIGZhbHNlLCBmYWxzZSlcclxuICAgIH0pO1xyXG4gICAgLyogRGVjb3JhdGUgdGhlIFN5bWJvbC5wcm90b3R5cGUgKi9cclxuICAgIGRlZmluZVByb3BlcnRpZXMoU3ltYm9sLnByb3RvdHlwZSwge1xyXG4gICAgICAgIHRvU3RyaW5nOiBnZXRWYWx1ZURlc2NyaXB0b3IoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ1N5bWJvbCAoJyArIHZhbGlkYXRlU3ltYm9sKHRoaXMpLl9fZGVzY3JpcHRpb25fXyArICcpJztcclxuICAgICAgICB9KSxcclxuICAgICAgICB2YWx1ZU9mOiBnZXRWYWx1ZURlc2NyaXB0b3IoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsaWRhdGVTeW1ib2wodGhpcyk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG4gICAgZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgU3ltYm9sLnRvUHJpbWl0aXZlLCBnZXRWYWx1ZURlc2NyaXB0b3IoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVN5bWJvbCh0aGlzKTtcclxuICAgIH0pKTtcclxuICAgIGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsIFN5bWJvbC50b1N0cmluZ1RhZywgZ2V0VmFsdWVEZXNjcmlwdG9yKCdTeW1ib2wnLCBmYWxzZSwgZmFsc2UsIHRydWUpKTtcclxuICAgIGRlZmluZVByb3BlcnR5KEludGVybmFsU3ltYm9sLnByb3RvdHlwZSwgU3ltYm9sLnRvUHJpbWl0aXZlLCBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLnByb3RvdHlwZVtTeW1ib2wudG9QcmltaXRpdmVdLCBmYWxzZSwgZmFsc2UsIHRydWUpKTtcclxuICAgIGRlZmluZVByb3BlcnR5KEludGVybmFsU3ltYm9sLnByb3RvdHlwZSwgU3ltYm9sLnRvU3RyaW5nVGFnLCBnZXRWYWx1ZURlc2NyaXB0b3IoU3ltYm9sLnByb3RvdHlwZVtTeW1ib2wudG9TdHJpbmdUYWddLCBmYWxzZSwgZmFsc2UsIHRydWUpKTtcclxufVxyXG4vKipcclxuICogQSBjdXN0b20gZ3VhcmQgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGlmIGFuIG9iamVjdCBpcyBhIHN5bWJvbCBvciBub3RcclxuICogQHBhcmFtICB7YW55fSAgICAgICB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2sgdG8gc2VlIGlmIGl0IGlzIGEgc3ltYm9sIG9yIG5vdFxyXG4gKiBAcmV0dXJuIHtpcyBzeW1ib2x9ICAgICAgIFJldHVybnMgdHJ1ZSBpZiBhIHN5bWJvbCBvciBub3QgKGFuZCBuYXJyb3dzIHRoZSB0eXBlIGd1YXJkKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gKHZhbHVlICYmICh0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnIHx8IHZhbHVlWydAQHRvU3RyaW5nVGFnJ10gPT09ICdTeW1ib2wnKSkgfHwgZmFsc2U7XHJcbn1cclxuLyoqXHJcbiAqIEZpbGwgYW55IG1pc3Npbmcgd2VsbCBrbm93biBzeW1ib2xzIGlmIHRoZSBuYXRpdmUgU3ltYm9sIGlzIG1pc3NpbmcgdGhlbVxyXG4gKi9cclxuW1xyXG4gICAgJ2hhc0luc3RhbmNlJyxcclxuICAgICdpc0NvbmNhdFNwcmVhZGFibGUnLFxyXG4gICAgJ2l0ZXJhdG9yJyxcclxuICAgICdzcGVjaWVzJyxcclxuICAgICdyZXBsYWNlJyxcclxuICAgICdzZWFyY2gnLFxyXG4gICAgJ3NwbGl0JyxcclxuICAgICdtYXRjaCcsXHJcbiAgICAndG9QcmltaXRpdmUnLFxyXG4gICAgJ3RvU3RyaW5nVGFnJyxcclxuICAgICd1bnNjb3BhYmxlcycsXHJcbiAgICAnb2JzZXJ2YWJsZSdcclxuXS5mb3JFYWNoKCh3ZWxsS25vd24pID0+IHtcclxuICAgIGlmICghU3ltYm9sW3dlbGxLbm93bl0pIHtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3ltYm9sLCB3ZWxsS25vd24sIGdldFZhbHVlRGVzY3JpcHRvcihTeW1ib2wuZm9yKHdlbGxLbm93biksIGZhbHNlLCBmYWxzZSkpO1xyXG4gICAgfVxyXG59KTtcclxuZXhwb3J0IGRlZmF1bHQgU3ltYm9sO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1TeW1ib2wubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1N5bWJvbC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1N5bWJvbC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCB7IGlzQXJyYXlMaWtlIH0gZnJvbSAnLi9pdGVyYXRvcic7XHJcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XHJcbmltcG9ydCAnLi9TeW1ib2wnO1xyXG5leHBvcnQgbGV0IFdlYWtNYXAgPSBnbG9iYWwuV2Vha01hcDtcclxuaWYgKCF0cnVlKSB7XHJcbiAgICBjb25zdCBERUxFVEVEID0ge307XHJcbiAgICBjb25zdCBnZXRVSUQgPSBmdW5jdGlvbiBnZXRVSUQoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgY29uc3QgZ2VuZXJhdGVOYW1lID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQgc3RhcnRJZCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAlIDEwMDAwMDAwMCk7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGdlbmVyYXRlTmFtZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdfX3dtJyArIGdldFVJRCgpICsgKHN0YXJ0SWQrKyArICdfXycpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KSgpO1xyXG4gICAgV2Vha01hcCA9IGNsYXNzIFdlYWtNYXAge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXNbU3ltYm9sLnRvU3RyaW5nVGFnXSA9ICdXZWFrTWFwJztcclxuICAgICAgICAgICAgdGhpcy5fbmFtZSA9IGdlbmVyYXRlTmFtZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mcm96ZW5FbnRyaWVzID0gW107XHJcbiAgICAgICAgICAgIGlmIChpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZXJhYmxlW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldChpdGVtWzBdLCBpdGVtWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgX2dldEZyb3plbkVudHJ5SW5kZXgoa2V5KSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZnJvemVuRW50cmllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Zyb3plbkVudHJpZXNbaV0ua2V5ID09PSBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZShrZXkpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkIHx8IGtleSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0ga2V5W3RoaXMuX25hbWVdO1xyXG4gICAgICAgICAgICBpZiAoZW50cnkgJiYgZW50cnkua2V5ID09PSBrZXkgJiYgZW50cnkudmFsdWUgIT09IERFTEVURUQpIHtcclxuICAgICAgICAgICAgICAgIGVudHJ5LnZhbHVlID0gREVMRVRFRDtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGZyb3plbkluZGV4ID0gdGhpcy5fZ2V0RnJvemVuRW50cnlJbmRleChrZXkpO1xyXG4gICAgICAgICAgICBpZiAoZnJvemVuSW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZnJvemVuRW50cmllcy5zcGxpY2UoZnJvemVuSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQoa2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCB8fCBrZXkgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZW50cnkgPSBrZXlbdGhpcy5fbmFtZV07XHJcbiAgICAgICAgICAgIGlmIChlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudHJ5LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGZyb3plbkluZGV4ID0gdGhpcy5fZ2V0RnJvemVuRW50cnlJbmRleChrZXkpO1xyXG4gICAgICAgICAgICBpZiAoZnJvemVuSW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Zyb3plbkVudHJpZXNbZnJvemVuSW5kZXhdLnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhcyhrZXkpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkIHx8IGtleSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0ga2V5W3RoaXMuX25hbWVdO1xyXG4gICAgICAgICAgICBpZiAoQm9vbGVhbihlbnRyeSAmJiBlbnRyeS5rZXkgPT09IGtleSAmJiBlbnRyeS52YWx1ZSAhPT0gREVMRVRFRCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGZyb3plbkluZGV4ID0gdGhpcy5fZ2V0RnJvemVuRW50cnlJbmRleChrZXkpO1xyXG4gICAgICAgICAgICBpZiAoZnJvemVuSW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQoa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIWtleSB8fCAodHlwZW9mIGtleSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGtleSAhPT0gJ2Z1bmN0aW9uJykpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgdmFsdWUgdXNlZCBhcyB3ZWFrIG1hcCBrZXknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZW50cnkgPSBrZXlbdGhpcy5fbmFtZV07XHJcbiAgICAgICAgICAgIGlmICghZW50cnkgfHwgZW50cnkua2V5ICE9PSBrZXkpIHtcclxuICAgICAgICAgICAgICAgIGVudHJ5ID0gT2JqZWN0LmNyZWF0ZShudWxsLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiB7IHZhbHVlOiBrZXkgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmlzRnJvemVuKGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9mcm96ZW5FbnRyaWVzLnB1c2goZW50cnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGtleSwgdGhpcy5fbmFtZSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZW50cnlcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbnRyeS52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFdlYWtNYXA7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdlYWtNYXAubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL1dlYWtNYXAubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9XZWFrTWFwLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJjb25zdCBnbG9iYWxPYmplY3QgPSAoZnVuY3Rpb24gKCkge1xuICAgIC8vIHRoZSBvbmx5IHJlbGlhYmxlIG1lYW5zIHRvIGdldCB0aGUgZ2xvYmFsIG9iamVjdCBpc1xuICAgIC8vIGBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpYFxuICAgIC8vIEhvd2V2ZXIsIHRoaXMgY2F1c2VzIENTUCB2aW9sYXRpb25zIGluIENocm9tZSBhcHBzLlxuICAgIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gd2luZG93O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbDtcbiAgICB9XG59KSgpO1xuZXhwb3J0IGRlZmF1bHQgZ2xvYmFsT2JqZWN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2xvYmFsLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9nbG9iYWwubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9nbG9iYWwubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCAnLi9TeW1ib2wnO1xuaW1wb3J0IHsgSElHSF9TVVJST0dBVEVfTUFYLCBISUdIX1NVUlJPR0FURV9NSU4gfSBmcm9tICcuL3N0cmluZyc7XG5jb25zdCBzdGF0aWNEb25lID0geyBkb25lOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG4vKipcbiAqIEEgY2xhc3MgdGhhdCBfc2hpbXNfIGFuIGl0ZXJhdG9yIGludGVyZmFjZSBvbiBhcnJheSBsaWtlIG9iamVjdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTaGltSXRlcmF0b3Ige1xuICAgIGNvbnN0cnVjdG9yKGxpc3QpIHtcbiAgICAgICAgdGhpcy5fbmV4dEluZGV4ID0gLTE7XG4gICAgICAgIGlmIChpc0l0ZXJhYmxlKGxpc3QpKSB7XG4gICAgICAgICAgICB0aGlzLl9uYXRpdmVJdGVyYXRvciA9IGxpc3RbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbGlzdCA9IGxpc3Q7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBuZXh0IGl0ZXJhdGlvbiByZXN1bHQgZm9yIHRoZSBJdGVyYXRvclxuICAgICAqL1xuICAgIG5leHQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9uYXRpdmVJdGVyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX25hdGl2ZUl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2xpc3QpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGF0aWNEb25lO1xuICAgICAgICB9XG4gICAgICAgIGlmICgrK3RoaXMuX25leHRJbmRleCA8IHRoaXMuX2xpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLl9saXN0W3RoaXMuX25leHRJbmRleF1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRpY0RvbmU7XG4gICAgfVxuICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3IgY2hlY2tpbmcgaWYgc29tZXRoaW5nIGhhcyBhbiBJdGVyYWJsZSBpbnRlcmZhY2VcbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHR5cGUgZ3VhcmQgYWdhaW5zdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJdGVyYWJsZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWVbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJztcbn1cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciBjaGVja2luZyBpZiBzb21ldGhpbmcgaXMgQXJyYXlMaWtlXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byB0eXBlIGd1YXJkIGFnYWluc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInO1xufVxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpdGVyYXRvciBmb3IgYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIGl0ZXJhYmxlIFRoZSBpdGVyYWJsZSBvYmplY3QgdG8gcmV0dXJuIHRoZSBpdGVyYXRvciBmb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldChpdGVyYWJsZSkge1xuICAgIGlmIChpc0l0ZXJhYmxlKGl0ZXJhYmxlKSkge1xuICAgICAgICByZXR1cm4gaXRlcmFibGVbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0FycmF5TGlrZShpdGVyYWJsZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTaGltSXRlcmF0b3IoaXRlcmFibGUpO1xuICAgIH1cbn1cbi8qKlxuICogU2hpbXMgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgYGZvciAuLi4gb2ZgIGJsb2Nrc1xuICpcbiAqIEBwYXJhbSBpdGVyYWJsZSBUaGUgb2JqZWN0IHRoZSBwcm92aWRlcyBhbiBpbnRlcmF0b3IgaW50ZXJmYWNlXG4gKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGZvciBlYWNoIGl0ZW0gb2YgdGhlIGl0ZXJhYmxlXG4gKiBAcGFyYW0gdGhpc0FyZyBPcHRpb25hbCBzY29wZSB0byBwYXNzIHRoZSBjYWxsYmFja1xuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yT2YoaXRlcmFibGUsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgbGV0IGJyb2tlbiA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIGRvQnJlYWsoKSB7XG4gICAgICAgIGJyb2tlbiA9IHRydWU7XG4gICAgfVxuICAgIC8qIFdlIG5lZWQgdG8gaGFuZGxlIGl0ZXJhdGlvbiBvZiBkb3VibGUgYnl0ZSBzdHJpbmdzIHByb3Blcmx5ICovXG4gICAgaWYgKGlzQXJyYXlMaWtlKGl0ZXJhYmxlKSAmJiB0eXBlb2YgaXRlcmFibGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IGwgPSBpdGVyYWJsZS5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICBsZXQgY2hhciA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgaWYgKGkgKyAxIDwgbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBjaGFyLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPj0gSElHSF9TVVJST0dBVEVfTUlOICYmIGNvZGUgPD0gSElHSF9TVVJST0dBVEVfTUFYKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXIgKz0gaXRlcmFibGVbKytpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGNoYXIsIGl0ZXJhYmxlLCBkb0JyZWFrKTtcbiAgICAgICAgICAgIGlmIChicm9rZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gZ2V0KGl0ZXJhYmxlKTtcbiAgICAgICAgaWYgKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgd2hpbGUgKCFyZXN1bHQuZG9uZSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgcmVzdWx0LnZhbHVlLCBpdGVyYWJsZSwgZG9CcmVhayk7XG4gICAgICAgICAgICAgICAgaWYgKGJyb2tlbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWl0ZXJhdG9yLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9pdGVyYXRvci5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL2l0ZXJhdG9yLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcclxuaW1wb3J0IGhhcyBmcm9tICcuL3N1cHBvcnQvaGFzJztcclxuaW1wb3J0IHsgaXNTeW1ib2wgfSBmcm9tICcuL1N5bWJvbCc7XHJcbmV4cG9ydCBsZXQgYXNzaWduO1xyXG4vKipcclxuICogR2V0cyB0aGUgb3duIHByb3BlcnR5IGRlc2NyaXB0b3Igb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcbiAqIEFuIG93biBwcm9wZXJ0eSBkZXNjcmlwdG9yIGlzIG9uZSB0aGF0IGlzIGRlZmluZWQgZGlyZWN0bHkgb24gdGhlIG9iamVjdCBhbmQgaXMgbm90XHJcbiAqIGluaGVyaXRlZCBmcm9tIHRoZSBvYmplY3QncyBwcm90b3R5cGUuXHJcbiAqIEBwYXJhbSBvIE9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBwcm9wZXJ0eS5cclxuICogQHBhcmFtIHAgTmFtZSBvZiB0aGUgcHJvcGVydHkuXHJcbiAqL1xyXG5leHBvcnQgbGV0IGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG5hbWVzIG9mIHRoZSBvd24gcHJvcGVydGllcyBvZiBhbiBvYmplY3QuIFRoZSBvd24gcHJvcGVydGllcyBvZiBhbiBvYmplY3QgYXJlIHRob3NlIHRoYXQgYXJlIGRlZmluZWQgZGlyZWN0bHlcclxuICogb24gdGhhdCBvYmplY3QsIGFuZCBhcmUgbm90IGluaGVyaXRlZCBmcm9tIHRoZSBvYmplY3QncyBwcm90b3R5cGUuIFRoZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCBpbmNsdWRlIGJvdGggZmllbGRzIChvYmplY3RzKSBhbmQgZnVuY3Rpb25zLlxyXG4gKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgb3duIHByb3BlcnRpZXMuXHJcbiAqL1xyXG5leHBvcnQgbGV0IGdldE93blByb3BlcnR5TmFtZXM7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBzeW1ib2wgcHJvcGVydGllcyBmb3VuZCBkaXJlY3RseSBvbiBvYmplY3Qgby5cclxuICogQHBhcmFtIG8gT2JqZWN0IHRvIHJldHJpZXZlIHRoZSBzeW1ib2xzIGZyb20uXHJcbiAqL1xyXG5leHBvcnQgbGV0IGdldE93blByb3BlcnR5U3ltYm9scztcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWVzIGFyZSB0aGUgc2FtZSB2YWx1ZSwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKiBAcGFyYW0gdmFsdWUxIFRoZSBmaXJzdCB2YWx1ZS5cclxuICogQHBhcmFtIHZhbHVlMiBUaGUgc2Vjb25kIHZhbHVlLlxyXG4gKi9cclxuZXhwb3J0IGxldCBpcztcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIG5hbWVzIG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMgb2YgYW4gb2JqZWN0LlxyXG4gKiBAcGFyYW0gbyBPYmplY3QgdGhhdCBjb250YWlucyB0aGUgcHJvcGVydGllcyBhbmQgbWV0aG9kcy4gVGhpcyBjYW4gYmUgYW4gb2JqZWN0IHRoYXQgeW91IGNyZWF0ZWQgb3IgYW4gZXhpc3RpbmcgRG9jdW1lbnQgT2JqZWN0IE1vZGVsIChET00pIG9iamVjdC5cclxuICovXHJcbmV4cG9ydCBsZXQga2V5cztcclxuLyogRVM3IE9iamVjdCBzdGF0aWMgbWV0aG9kcyAqL1xyXG5leHBvcnQgbGV0IGdldE93blByb3BlcnR5RGVzY3JpcHRvcnM7XHJcbmV4cG9ydCBsZXQgZW50cmllcztcclxuZXhwb3J0IGxldCB2YWx1ZXM7XHJcbmlmICh0cnVlKSB7XHJcbiAgICBjb25zdCBnbG9iYWxPYmplY3QgPSBnbG9iYWwuT2JqZWN0O1xyXG4gICAgYXNzaWduID0gZ2xvYmFsT2JqZWN0LmFzc2lnbjtcclxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGdsb2JhbE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XHJcbiAgICBnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZ2xvYmFsT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XHJcbiAgICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnbG9iYWxPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xyXG4gICAgaXMgPSBnbG9iYWxPYmplY3QuaXM7XHJcbiAgICBrZXlzID0gZ2xvYmFsT2JqZWN0LmtleXM7XHJcbn1cclxuZWxzZSB7XHJcbiAgICBrZXlzID0gZnVuY3Rpb24gc3ltYm9sQXdhcmVLZXlzKG8pIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMobykuZmlsdGVyKChrZXkpID0+ICFCb29sZWFuKGtleS5tYXRjaCgvXkBALisvKSkpO1xyXG4gICAgfTtcclxuICAgIGFzc2lnbiA9IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIC4uLnNvdXJjZXMpIHtcclxuICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gVHlwZUVycm9yIGlmIHVuZGVmaW5lZCBvciBudWxsXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0byA9IE9iamVjdCh0YXJnZXQpO1xyXG4gICAgICAgIHNvdXJjZXMuZm9yRWFjaCgobmV4dFNvdXJjZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAobmV4dFNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gU2tpcCBvdmVyIGlmIHVuZGVmaW5lZCBvciBudWxsXHJcbiAgICAgICAgICAgICAgICBrZXlzKG5leHRTb3VyY2UpLmZvckVhY2goKG5leHRLZXkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0bztcclxuICAgIH07XHJcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiAobywgcHJvcCkge1xyXG4gICAgICAgIGlmIChpc1N5bWJvbChwcm9wKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvLCBwcm9wKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8sIHByb3ApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhvKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG8pLmZpbHRlcigoa2V5KSA9PiAhQm9vbGVhbihrZXkubWF0Y2goL15AQC4rLykpKTtcclxuICAgIH07XHJcbiAgICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMobykge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvKVxyXG4gICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+IEJvb2xlYW4oa2V5Lm1hdGNoKC9eQEAuKy8pKSlcclxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiBTeW1ib2wuZm9yKGtleS5zdWJzdHJpbmcoMikpKTtcclxuICAgIH07XHJcbiAgICBpcyA9IGZ1bmN0aW9uIGlzKHZhbHVlMSwgdmFsdWUyKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlMSA9PT0gdmFsdWUyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTEgIT09IDAgfHwgMSAvIHZhbHVlMSA9PT0gMSAvIHZhbHVlMjsgLy8gLTBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlMSAhPT0gdmFsdWUxICYmIHZhbHVlMiAhPT0gdmFsdWUyOyAvLyBOYU5cclxuICAgIH07XHJcbn1cclxuaWYgKHRydWUpIHtcclxuICAgIGNvbnN0IGdsb2JhbE9iamVjdCA9IGdsb2JhbC5PYmplY3Q7XHJcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID0gZ2xvYmFsT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnM7XHJcbiAgICBlbnRyaWVzID0gZ2xvYmFsT2JqZWN0LmVudHJpZXM7XHJcbiAgICB2YWx1ZXMgPSBnbG9iYWxPYmplY3QudmFsdWVzO1xyXG59XHJcbmVsc2Uge1xyXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnMobykge1xyXG4gICAgICAgIHJldHVybiBnZXRPd25Qcm9wZXJ0eU5hbWVzKG8pLnJlZHVjZSgocHJldmlvdXMsIGtleSkgPT4ge1xyXG4gICAgICAgICAgICBwcmV2aW91c1trZXldID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8sIGtleSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91cztcclxuICAgICAgICB9LCB7fSk7XHJcbiAgICB9O1xyXG4gICAgZW50cmllcyA9IGZ1bmN0aW9uIGVudHJpZXMobykge1xyXG4gICAgICAgIHJldHVybiBrZXlzKG8pLm1hcCgoa2V5KSA9PiBba2V5LCBvW2tleV1dKTtcclxuICAgIH07XHJcbiAgICB2YWx1ZXMgPSBmdW5jdGlvbiB2YWx1ZXMobykge1xyXG4gICAgICAgIHJldHVybiBrZXlzKG8pLm1hcCgoa2V5KSA9PiBvW2tleV0pO1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1vYmplY3QubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL29iamVjdC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL29iamVjdC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XHJcbmltcG9ydCBoYXMgZnJvbSAnLi9zdXBwb3J0L2hhcyc7XHJcbmltcG9ydCB7IHdyYXBOYXRpdmUgfSBmcm9tICcuL3N1cHBvcnQvdXRpbCc7XHJcbi8qKlxyXG4gKiBUaGUgbWluaW11bSBsb2NhdGlvbiBvZiBoaWdoIHN1cnJvZ2F0ZXNcclxuICovXHJcbmV4cG9ydCBjb25zdCBISUdIX1NVUlJPR0FURV9NSU4gPSAweGQ4MDA7XHJcbi8qKlxyXG4gKiBUaGUgbWF4aW11bSBsb2NhdGlvbiBvZiBoaWdoIHN1cnJvZ2F0ZXNcclxuICovXHJcbmV4cG9ydCBjb25zdCBISUdIX1NVUlJPR0FURV9NQVggPSAweGRiZmY7XHJcbi8qKlxyXG4gKiBUaGUgbWluaW11bSBsb2NhdGlvbiBvZiBsb3cgc3Vycm9nYXRlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IExPV19TVVJST0dBVEVfTUlOID0gMHhkYzAwO1xyXG4vKipcclxuICogVGhlIG1heGltdW0gbG9jYXRpb24gb2YgbG93IHN1cnJvZ2F0ZXNcclxuICovXHJcbmV4cG9ydCBjb25zdCBMT1dfU1VSUk9HQVRFX01BWCA9IDB4ZGZmZjtcclxuLyogRVM2IHN0YXRpYyBtZXRob2RzICovXHJcbi8qKlxyXG4gKiBSZXR1cm4gdGhlIFN0cmluZyB2YWx1ZSB3aG9zZSBlbGVtZW50cyBhcmUsIGluIG9yZGVyLCB0aGUgZWxlbWVudHMgaW4gdGhlIExpc3QgZWxlbWVudHMuXHJcbiAqIElmIGxlbmd0aCBpcyAwLCB0aGUgZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkLlxyXG4gKiBAcGFyYW0gY29kZVBvaW50cyBUaGUgY29kZSBwb2ludHMgdG8gZ2VuZXJhdGUgdGhlIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGxldCBmcm9tQ29kZVBvaW50O1xyXG4vKipcclxuICogYHJhd2AgaXMgaW50ZW5kZWQgZm9yIHVzZSBhcyBhIHRhZyBmdW5jdGlvbiBvZiBhIFRhZ2dlZCBUZW1wbGF0ZSBTdHJpbmcuIFdoZW4gY2FsbGVkXHJcbiAqIGFzIHN1Y2ggdGhlIGZpcnN0IGFyZ3VtZW50IHdpbGwgYmUgYSB3ZWxsIGZvcm1lZCB0ZW1wbGF0ZSBjYWxsIHNpdGUgb2JqZWN0IGFuZCB0aGUgcmVzdFxyXG4gKiBwYXJhbWV0ZXIgd2lsbCBjb250YWluIHRoZSBzdWJzdGl0dXRpb24gdmFsdWVzLlxyXG4gKiBAcGFyYW0gdGVtcGxhdGUgQSB3ZWxsLWZvcm1lZCB0ZW1wbGF0ZSBzdHJpbmcgY2FsbCBzaXRlIHJlcHJlc2VudGF0aW9uLlxyXG4gKiBAcGFyYW0gc3Vic3RpdHV0aW9ucyBBIHNldCBvZiBzdWJzdGl0dXRpb24gdmFsdWVzLlxyXG4gKi9cclxuZXhwb3J0IGxldCByYXc7XHJcbi8qIEVTNiBpbnN0YW5jZSBtZXRob2RzICovXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgbm9ubmVnYXRpdmUgaW50ZWdlciBOdW1iZXIgbGVzcyB0aGFuIDExMTQxMTIgKDB4MTEwMDAwKSB0aGF0IGlzIHRoZSBjb2RlIHBvaW50XHJcbiAqIHZhbHVlIG9mIHRoZSBVVEYtMTYgZW5jb2RlZCBjb2RlIHBvaW50IHN0YXJ0aW5nIGF0IHRoZSBzdHJpbmcgZWxlbWVudCBhdCBwb3NpdGlvbiBwb3MgaW5cclxuICogdGhlIFN0cmluZyByZXN1bHRpbmcgZnJvbSBjb252ZXJ0aW5nIHRoaXMgb2JqZWN0IHRvIGEgU3RyaW5nLlxyXG4gKiBJZiB0aGVyZSBpcyBubyBlbGVtZW50IGF0IHRoYXQgcG9zaXRpb24sIHRoZSByZXN1bHQgaXMgdW5kZWZpbmVkLlxyXG4gKiBJZiBhIHZhbGlkIFVURi0xNiBzdXJyb2dhdGUgcGFpciBkb2VzIG5vdCBiZWdpbiBhdCBwb3MsIHRoZSByZXN1bHQgaXMgdGhlIGNvZGUgdW5pdCBhdCBwb3MuXHJcbiAqL1xyXG5leHBvcnQgbGV0IGNvZGVQb2ludEF0O1xyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzZXF1ZW5jZSBvZiBlbGVtZW50cyBvZiBzZWFyY2hTdHJpbmcgY29udmVydGVkIHRvIGEgU3RyaW5nIGlzIHRoZVxyXG4gKiBzYW1lIGFzIHRoZSBjb3JyZXNwb25kaW5nIGVsZW1lbnRzIG9mIHRoaXMgb2JqZWN0IChjb252ZXJ0ZWQgdG8gYSBTdHJpbmcpIHN0YXJ0aW5nIGF0XHJcbiAqIGVuZFBvc2l0aW9uIOKAkyBsZW5ndGgodGhpcykuIE90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gKi9cclxuZXhwb3J0IGxldCBlbmRzV2l0aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiBzZWFyY2hTdHJpbmcgYXBwZWFycyBhcyBhIHN1YnN0cmluZyBvZiB0aGUgcmVzdWx0IG9mIGNvbnZlcnRpbmcgdGhpc1xyXG4gKiBvYmplY3QgdG8gYSBTdHJpbmcsIGF0IG9uZSBvciBtb3JlIHBvc2l0aW9ucyB0aGF0IGFyZVxyXG4gKiBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gcG9zaXRpb247IG90aGVyd2lzZSwgcmV0dXJucyBmYWxzZS5cclxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHN0cmluZ1xyXG4gKiBAcGFyYW0gc2VhcmNoU3RyaW5nIHNlYXJjaCBzdHJpbmdcclxuICogQHBhcmFtIHBvc2l0aW9uIElmIHBvc2l0aW9uIGlzIHVuZGVmaW5lZCwgMCBpcyBhc3N1bWVkLCBzbyBhcyB0byBzZWFyY2ggYWxsIG9mIHRoZSBTdHJpbmcuXHJcbiAqL1xyXG5leHBvcnQgbGV0IGluY2x1ZGVzO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgU3RyaW5nIHZhbHVlIHJlc3VsdCBvZiBub3JtYWxpemluZyB0aGUgc3RyaW5nIGludG8gdGhlIG5vcm1hbGl6YXRpb24gZm9ybVxyXG4gKiBuYW1lZCBieSBmb3JtIGFzIHNwZWNpZmllZCBpbiBVbmljb2RlIFN0YW5kYXJkIEFubmV4ICMxNSwgVW5pY29kZSBOb3JtYWxpemF0aW9uIEZvcm1zLlxyXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc3RyaW5nXHJcbiAqIEBwYXJhbSBmb3JtIEFwcGxpY2FibGUgdmFsdWVzOiBcIk5GQ1wiLCBcIk5GRFwiLCBcIk5GS0NcIiwgb3IgXCJORktEXCIsIElmIG5vdCBzcGVjaWZpZWQgZGVmYXVsdFxyXG4gKiBpcyBcIk5GQ1wiXHJcbiAqL1xyXG5leHBvcnQgbGV0IG5vcm1hbGl6ZTtcclxuLyoqXHJcbiAqIFJldHVybnMgYSBTdHJpbmcgdmFsdWUgdGhhdCBpcyBtYWRlIGZyb20gY291bnQgY29waWVzIGFwcGVuZGVkIHRvZ2V0aGVyLiBJZiBjb3VudCBpcyAwLFxyXG4gKiBUIGlzIHRoZSBlbXB0eSBTdHJpbmcgaXMgcmV0dXJuZWQuXHJcbiAqIEBwYXJhbSBjb3VudCBudW1iZXIgb2YgY29waWVzIHRvIGFwcGVuZFxyXG4gKi9cclxuZXhwb3J0IGxldCByZXBlYXQ7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNlcXVlbmNlIG9mIGVsZW1lbnRzIG9mIHNlYXJjaFN0cmluZyBjb252ZXJ0ZWQgdG8gYSBTdHJpbmcgaXMgdGhlXHJcbiAqIHNhbWUgYXMgdGhlIGNvcnJlc3BvbmRpbmcgZWxlbWVudHMgb2YgdGhpcyBvYmplY3QgKGNvbnZlcnRlZCB0byBhIFN0cmluZykgc3RhcnRpbmcgYXRcclxuICogcG9zaXRpb24uIE90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gKi9cclxuZXhwb3J0IGxldCBzdGFydHNXaXRoO1xyXG4vKiBFUzcgaW5zdGFuY2UgbWV0aG9kcyAqL1xyXG4vKipcclxuICogUGFkcyB0aGUgY3VycmVudCBzdHJpbmcgd2l0aCBhIGdpdmVuIHN0cmluZyAocG9zc2libHkgcmVwZWF0ZWQpIHNvIHRoYXQgdGhlIHJlc3VsdGluZyBzdHJpbmcgcmVhY2hlcyBhIGdpdmVuIGxlbmd0aC5cclxuICogVGhlIHBhZGRpbmcgaXMgYXBwbGllZCBmcm9tIHRoZSBlbmQgKHJpZ2h0KSBvZiB0aGUgY3VycmVudCBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBzdHJpbmdcclxuICogQHBhcmFtIG1heExlbmd0aCBUaGUgbGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgc3RyaW5nIG9uY2UgdGhlIGN1cnJlbnQgc3RyaW5nIGhhcyBiZWVuIHBhZGRlZC5cclxuICogICAgICAgIElmIHRoaXMgcGFyYW1ldGVyIGlzIHNtYWxsZXIgdGhhbiB0aGUgY3VycmVudCBzdHJpbmcncyBsZW5ndGgsIHRoZSBjdXJyZW50IHN0cmluZyB3aWxsIGJlIHJldHVybmVkIGFzIGl0IGlzLlxyXG4gKlxyXG4gKiBAcGFyYW0gZmlsbFN0cmluZyBUaGUgc3RyaW5nIHRvIHBhZCB0aGUgY3VycmVudCBzdHJpbmcgd2l0aC5cclxuICogICAgICAgIElmIHRoaXMgc3RyaW5nIGlzIHRvbyBsb25nLCBpdCB3aWxsIGJlIHRydW5jYXRlZCBhbmQgdGhlIGxlZnQtbW9zdCBwYXJ0IHdpbGwgYmUgYXBwbGllZC5cclxuICogICAgICAgIFRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGlzIHBhcmFtZXRlciBpcyBcIiBcIiAoVSswMDIwKS5cclxuICovXHJcbmV4cG9ydCBsZXQgcGFkRW5kO1xyXG4vKipcclxuICogUGFkcyB0aGUgY3VycmVudCBzdHJpbmcgd2l0aCBhIGdpdmVuIHN0cmluZyAocG9zc2libHkgcmVwZWF0ZWQpIHNvIHRoYXQgdGhlIHJlc3VsdGluZyBzdHJpbmcgcmVhY2hlcyBhIGdpdmVuIGxlbmd0aC5cclxuICogVGhlIHBhZGRpbmcgaXMgYXBwbGllZCBmcm9tIHRoZSBzdGFydCAobGVmdCkgb2YgdGhlIGN1cnJlbnQgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgc3RyaW5nXHJcbiAqIEBwYXJhbSBtYXhMZW5ndGggVGhlIGxlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHN0cmluZyBvbmNlIHRoZSBjdXJyZW50IHN0cmluZyBoYXMgYmVlbiBwYWRkZWQuXHJcbiAqICAgICAgICBJZiB0aGlzIHBhcmFtZXRlciBpcyBzbWFsbGVyIHRoYW4gdGhlIGN1cnJlbnQgc3RyaW5nJ3MgbGVuZ3RoLCB0aGUgY3VycmVudCBzdHJpbmcgd2lsbCBiZSByZXR1cm5lZCBhcyBpdCBpcy5cclxuICpcclxuICogQHBhcmFtIGZpbGxTdHJpbmcgVGhlIHN0cmluZyB0byBwYWQgdGhlIGN1cnJlbnQgc3RyaW5nIHdpdGguXHJcbiAqICAgICAgICBJZiB0aGlzIHN0cmluZyBpcyB0b28gbG9uZywgaXQgd2lsbCBiZSB0cnVuY2F0ZWQgYW5kIHRoZSBsZWZ0LW1vc3QgcGFydCB3aWxsIGJlIGFwcGxpZWQuXHJcbiAqICAgICAgICBUaGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpcyBwYXJhbWV0ZXIgaXMgXCIgXCIgKFUrMDAyMCkuXHJcbiAqL1xyXG5leHBvcnQgbGV0IHBhZFN0YXJ0O1xyXG5pZiAodHJ1ZSAmJiB0cnVlKSB7XHJcbiAgICBmcm9tQ29kZVBvaW50ID0gZ2xvYmFsLlN0cmluZy5mcm9tQ29kZVBvaW50O1xyXG4gICAgcmF3ID0gZ2xvYmFsLlN0cmluZy5yYXc7XHJcbiAgICBjb2RlUG9pbnRBdCA9IHdyYXBOYXRpdmUoZ2xvYmFsLlN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXQpO1xyXG4gICAgZW5kc1dpdGggPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoKTtcclxuICAgIGluY2x1ZGVzID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyk7XHJcbiAgICBub3JtYWxpemUgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLm5vcm1hbGl6ZSk7XHJcbiAgICByZXBlYXQgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLnJlcGVhdCk7XHJcbiAgICBzdGFydHNXaXRoID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKTtcclxufVxyXG5lbHNlIHtcclxuICAgIC8qKlxyXG4gICAgICogVmFsaWRhdGVzIHRoYXQgdGV4dCBpcyBkZWZpbmVkLCBhbmQgbm9ybWFsaXplcyBwb3NpdGlvbiAoYmFzZWQgb24gdGhlIGdpdmVuIGRlZmF1bHQgaWYgdGhlIGlucHV0IGlzIE5hTikuXHJcbiAgICAgKiBVc2VkIGJ5IHN0YXJ0c1dpdGgsIGluY2x1ZGVzLCBhbmQgZW5kc1dpdGguXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBOb3JtYWxpemVkIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBub3JtYWxpemVTdWJzdHJpbmdBcmdzID0gZnVuY3Rpb24gKG5hbWUsIHRleHQsIHNlYXJjaCwgcG9zaXRpb24sIGlzRW5kID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAodGV4dCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy4nICsgbmFtZSArICcgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcgdG8gc2VhcmNoIGFnYWluc3QuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gIT09IHBvc2l0aW9uID8gKGlzRW5kID8gbGVuZ3RoIDogMCkgOiBwb3NpdGlvbjtcclxuICAgICAgICByZXR1cm4gW3RleHQsIFN0cmluZyhzZWFyY2gpLCBNYXRoLm1pbihNYXRoLm1heChwb3NpdGlvbiwgMCksIGxlbmd0aCldO1xyXG4gICAgfTtcclxuICAgIGZyb21Db2RlUG9pbnQgPSBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpIHtcclxuICAgICAgICAvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLmZyb21Db2RlUG9pbnRcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgICAgIGlmICghbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcclxuICAgICAgICBjb25zdCBNQVhfU0laRSA9IDB4NDAwMDtcclxuICAgICAgICBsZXQgY29kZVVuaXRzID0gW107XHJcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2RlUG9pbnQgPSBOdW1iZXIoYXJndW1lbnRzW2luZGV4XSk7XHJcbiAgICAgICAgICAgIC8vIENvZGUgcG9pbnRzIG11c3QgYmUgZmluaXRlIGludGVnZXJzIHdpdGhpbiB0aGUgdmFsaWQgcmFuZ2VcclxuICAgICAgICAgICAgbGV0IGlzVmFsaWQgPSBpc0Zpbml0ZShjb2RlUG9pbnQpICYmIE1hdGguZmxvb3IoY29kZVBvaW50KSA9PT0gY29kZVBvaW50ICYmIGNvZGVQb2ludCA+PSAwICYmIGNvZGVQb2ludCA8PSAweDEwZmZmZjtcclxuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdzdHJpbmcuZnJvbUNvZGVQb2ludDogSW52YWxpZCBjb2RlIHBvaW50ICcgKyBjb2RlUG9pbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlUG9pbnQgPD0gMHhmZmZmKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBCTVAgY29kZSBwb2ludFxyXG4gICAgICAgICAgICAgICAgY29kZVVuaXRzLnB1c2goY29kZVBvaW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEFzdHJhbCBjb2RlIHBvaW50OyBzcGxpdCBpbiBzdXJyb2dhdGUgaGFsdmVzXHJcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcclxuICAgICAgICAgICAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhpZ2hTdXJyb2dhdGUgPSAoY29kZVBvaW50ID4+IDEwKSArIEhJR0hfU1VSUk9HQVRFX01JTjtcclxuICAgICAgICAgICAgICAgIGxldCBsb3dTdXJyb2dhdGUgPSAoY29kZVBvaW50ICUgMHg0MDApICsgTE9XX1NVUlJPR0FURV9NSU47XHJcbiAgICAgICAgICAgICAgICBjb2RlVW5pdHMucHVzaChoaWdoU3Vycm9nYXRlLCBsb3dTdXJyb2dhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbmRleCArIDEgPT09IGxlbmd0aCB8fCBjb2RlVW5pdHMubGVuZ3RoID4gTUFYX1NJWkUpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBmcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgY29kZVVuaXRzKTtcclxuICAgICAgICAgICAgICAgIGNvZGVVbml0cy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgcmF3ID0gZnVuY3Rpb24gcmF3KGNhbGxTaXRlLCAuLi5zdWJzdGl0dXRpb25zKSB7XHJcbiAgICAgICAgbGV0IHJhd1N0cmluZ3MgPSBjYWxsU2l0ZS5yYXc7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIGxldCBudW1TdWJzdGl0dXRpb25zID0gc3Vic3RpdHV0aW9ucy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGNhbGxTaXRlID09IG51bGwgfHwgY2FsbFNpdGUucmF3ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLnJhdyByZXF1aXJlcyBhIHZhbGlkIGNhbGxTaXRlIG9iamVjdCB3aXRoIGEgcmF3IHZhbHVlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSByYXdTdHJpbmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSByYXdTdHJpbmdzW2ldICsgKGkgPCBudW1TdWJzdGl0dXRpb25zICYmIGkgPCBsZW5ndGggLSAxID8gc3Vic3RpdHV0aW9uc1tpXSA6ICcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICBjb2RlUG9pbnRBdCA9IGZ1bmN0aW9uIGNvZGVQb2ludEF0KHRleHQsIHBvc2l0aW9uID0gMCkge1xyXG4gICAgICAgIC8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0XHJcbiAgICAgICAgaWYgKHRleHQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcuY29kZVBvaW50QXQgcmVxdXJpZXMgYSB2YWxpZCBzdHJpbmcuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChwb3NpdGlvbiAhPT0gcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgcG9zaXRpb24gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocG9zaXRpb24gPCAwIHx8IHBvc2l0aW9uID49IGxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBHZXQgdGhlIGZpcnN0IGNvZGUgdW5pdFxyXG4gICAgICAgIGNvbnN0IGZpcnN0ID0gdGV4dC5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoZmlyc3QgPj0gSElHSF9TVVJST0dBVEVfTUlOICYmIGZpcnN0IDw9IEhJR0hfU1VSUk9HQVRFX01BWCAmJiBsZW5ndGggPiBwb3NpdGlvbiArIDEpIHtcclxuICAgICAgICAgICAgLy8gU3RhcnQgb2YgYSBzdXJyb2dhdGUgcGFpciAoaGlnaCBzdXJyb2dhdGUgYW5kIHRoZXJlIGlzIGEgbmV4dCBjb2RlIHVuaXQpOyBjaGVjayBmb3IgbG93IHN1cnJvZ2F0ZVxyXG4gICAgICAgICAgICAvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcclxuICAgICAgICAgICAgY29uc3Qgc2Vjb25kID0gdGV4dC5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSk7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmQgPj0gTE9XX1NVUlJPR0FURV9NSU4gJiYgc2Vjb25kIDw9IExPV19TVVJST0dBVEVfTUFYKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGZpcnN0IC0gSElHSF9TVVJST0dBVEVfTUlOKSAqIDB4NDAwICsgc2Vjb25kIC0gTE9XX1NVUlJPR0FURV9NSU4gKyAweDEwMDAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmaXJzdDtcclxuICAgIH07XHJcbiAgICBlbmRzV2l0aCA9IGZ1bmN0aW9uIGVuZHNXaXRoKHRleHQsIHNlYXJjaCwgZW5kUG9zaXRpb24pIHtcclxuICAgICAgICBpZiAoc2VhcmNoID09PSAnJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBlbmRQb3NpdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgZW5kUG9zaXRpb24gPSB0ZXh0Lmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZW5kUG9zaXRpb24gPT09IG51bGwgfHwgaXNOYU4oZW5kUG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgW3RleHQsIHNlYXJjaCwgZW5kUG9zaXRpb25dID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnZW5kc1dpdGgnLCB0ZXh0LCBzZWFyY2gsIGVuZFBvc2l0aW9uLCB0cnVlKTtcclxuICAgICAgICBjb25zdCBzdGFydCA9IGVuZFBvc2l0aW9uIC0gc2VhcmNoLmxlbmd0aDtcclxuICAgICAgICBpZiAoc3RhcnQgPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2Uoc3RhcnQsIGVuZFBvc2l0aW9uKSA9PT0gc2VhcmNoO1xyXG4gICAgfTtcclxuICAgIGluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXModGV4dCwgc2VhcmNoLCBwb3NpdGlvbiA9IDApIHtcclxuICAgICAgICBbdGV4dCwgc2VhcmNoLCBwb3NpdGlvbl0gPSBub3JtYWxpemVTdWJzdHJpbmdBcmdzKCdpbmNsdWRlcycsIHRleHQsIHNlYXJjaCwgcG9zaXRpb24pO1xyXG4gICAgICAgIHJldHVybiB0ZXh0LmluZGV4T2Yoc2VhcmNoLCBwb3NpdGlvbikgIT09IC0xO1xyXG4gICAgfTtcclxuICAgIHJlcGVhdCA9IGZ1bmN0aW9uIHJlcGVhdCh0ZXh0LCBjb3VudCA9IDApIHtcclxuICAgICAgICAvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5yZXBlYXRcclxuICAgICAgICBpZiAodGV4dCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0cmluZy5yZXBlYXQgcmVxdWlyZXMgYSB2YWxpZCBzdHJpbmcuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb3VudCAhPT0gY291bnQpIHtcclxuICAgICAgICAgICAgY291bnQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY291bnQgPCAwIHx8IGNvdW50ID09PSBJbmZpbml0eSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3RyaW5nLnJlcGVhdCByZXF1aXJlcyBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgY291bnQuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXN1bHQgPSAnJztcclxuICAgICAgICB3aGlsZSAoY291bnQpIHtcclxuICAgICAgICAgICAgaWYgKGNvdW50ICUgMikge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvdW50ID4gMSkge1xyXG4gICAgICAgICAgICAgICAgdGV4dCArPSB0ZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvdW50ID4+PSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIHN0YXJ0c1dpdGggPSBmdW5jdGlvbiBzdGFydHNXaXRoKHRleHQsIHNlYXJjaCwgcG9zaXRpb24gPSAwKSB7XHJcbiAgICAgICAgc2VhcmNoID0gU3RyaW5nKHNlYXJjaCk7XHJcbiAgICAgICAgW3RleHQsIHNlYXJjaCwgcG9zaXRpb25dID0gbm9ybWFsaXplU3Vic3RyaW5nQXJncygnc3RhcnRzV2l0aCcsIHRleHQsIHNlYXJjaCwgcG9zaXRpb24pO1xyXG4gICAgICAgIGNvbnN0IGVuZCA9IHBvc2l0aW9uICsgc2VhcmNoLmxlbmd0aDtcclxuICAgICAgICBpZiAoZW5kID4gdGV4dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShwb3NpdGlvbiwgZW5kKSA9PT0gc2VhcmNoO1xyXG4gICAgfTtcclxufVxyXG5pZiAodHJ1ZSkge1xyXG4gICAgcGFkRW5kID0gd3JhcE5hdGl2ZShnbG9iYWwuU3RyaW5nLnByb3RvdHlwZS5wYWRFbmQpO1xyXG4gICAgcGFkU3RhcnQgPSB3cmFwTmF0aXZlKGdsb2JhbC5TdHJpbmcucHJvdG90eXBlLnBhZFN0YXJ0KTtcclxufVxyXG5lbHNlIHtcclxuICAgIHBhZEVuZCA9IGZ1bmN0aW9uIHBhZEVuZCh0ZXh0LCBtYXhMZW5ndGgsIGZpbGxTdHJpbmcgPSAnICcpIHtcclxuICAgICAgICBpZiAodGV4dCA9PT0gbnVsbCB8fCB0ZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RyaW5nLnJlcGVhdCByZXF1aXJlcyBhIHZhbGlkIHN0cmluZy4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1heExlbmd0aCA9PT0gSW5maW5pdHkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3N0cmluZy5wYWRFbmQgcmVxdWlyZXMgYSBub24tbmVnYXRpdmUgZmluaXRlIGNvdW50LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWF4TGVuZ3RoID09PSBudWxsIHx8IG1heExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IG1heExlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgbWF4TGVuZ3RoID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHN0clRleHQgPSBTdHJpbmcodGV4dCk7XHJcbiAgICAgICAgY29uc3QgcGFkZGluZyA9IG1heExlbmd0aCAtIHN0clRleHQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChwYWRkaW5nID4gMCkge1xyXG4gICAgICAgICAgICBzdHJUZXh0ICs9XHJcbiAgICAgICAgICAgICAgICByZXBlYXQoZmlsbFN0cmluZywgTWF0aC5mbG9vcihwYWRkaW5nIC8gZmlsbFN0cmluZy5sZW5ndGgpKSArXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbFN0cmluZy5zbGljZSgwLCBwYWRkaW5nICUgZmlsbFN0cmluZy5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyVGV4dDtcclxuICAgIH07XHJcbiAgICBwYWRTdGFydCA9IGZ1bmN0aW9uIHBhZFN0YXJ0KHRleHQsIG1heExlbmd0aCwgZmlsbFN0cmluZyA9ICcgJykge1xyXG4gICAgICAgIGlmICh0ZXh0ID09PSBudWxsIHx8IHRleHQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdHJpbmcucmVwZWF0IHJlcXVpcmVzIGEgdmFsaWQgc3RyaW5nLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWF4TGVuZ3RoID09PSBJbmZpbml0eSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc3RyaW5nLnBhZFN0YXJ0IHJlcXVpcmVzIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBjb3VudC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1heExlbmd0aCA9PT0gbnVsbCB8fCBtYXhMZW5ndGggPT09IHVuZGVmaW5lZCB8fCBtYXhMZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIG1heExlbmd0aCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzdHJUZXh0ID0gU3RyaW5nKHRleHQpO1xyXG4gICAgICAgIGNvbnN0IHBhZGRpbmcgPSBtYXhMZW5ndGggLSBzdHJUZXh0Lmxlbmd0aDtcclxuICAgICAgICBpZiAocGFkZGluZyA+IDApIHtcclxuICAgICAgICAgICAgc3RyVGV4dCA9XHJcbiAgICAgICAgICAgICAgICByZXBlYXQoZmlsbFN0cmluZywgTWF0aC5mbG9vcihwYWRkaW5nIC8gZmlsbFN0cmluZy5sZW5ndGgpKSArXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbFN0cmluZy5zbGljZSgwLCBwYWRkaW5nICUgZmlsbFN0cmluZy5sZW5ndGgpICtcclxuICAgICAgICAgICAgICAgICAgICBzdHJUZXh0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyVGV4dDtcclxuICAgIH07XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RyaW5nLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdHJpbmcubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdHJpbmcubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBoYXMsIHsgYWRkIH0gZnJvbSAnLi4vLi4vaGFzL2hhcyc7XHJcbmltcG9ydCBnbG9iYWwgZnJvbSAnLi4vZ2xvYmFsJztcclxuZXhwb3J0IGRlZmF1bHQgaGFzO1xyXG5leHBvcnQgKiBmcm9tICcuLi8uLi9oYXMvaGFzJztcclxuLyogRUNNQVNjcmlwdCA2IGFuZCA3IEZlYXR1cmVzICovXHJcbi8qIEFycmF5ICovXHJcbmFkZCgnZXM2LWFycmF5JywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIChbJ2Zyb20nLCAnb2YnXS5ldmVyeSgoa2V5KSA9PiBrZXkgaW4gZ2xvYmFsLkFycmF5KSAmJlxyXG4gICAgICAgIFsnZmluZEluZGV4JywgJ2ZpbmQnLCAnY29weVdpdGhpbiddLmV2ZXJ5KChrZXkpID0+IGtleSBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlKSk7XHJcbn0sIHRydWUpO1xyXG5hZGQoJ2VzNi1hcnJheS1maWxsJywgKCkgPT4ge1xyXG4gICAgaWYgKCdmaWxsJyBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlKSB7XHJcbiAgICAgICAgLyogU29tZSB2ZXJzaW9ucyBvZiBTYWZhcmkgZG8gbm90IHByb3Blcmx5IGltcGxlbWVudCB0aGlzICovXHJcbiAgICAgICAgcmV0dXJuIFsxXS5maWxsKDksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlbMF0gPT09IDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn0sIHRydWUpO1xyXG5hZGQoJ2VzNy1hcnJheScsICgpID0+ICdpbmNsdWRlcycgaW4gZ2xvYmFsLkFycmF5LnByb3RvdHlwZSwgdHJ1ZSk7XHJcbi8qIE1hcCAqL1xyXG5hZGQoJ2VzNi1tYXAnLCAoKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIGdsb2JhbC5NYXAgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAvKlxyXG4gICAgSUUxMSBhbmQgb2xkZXIgdmVyc2lvbnMgb2YgU2FmYXJpIGFyZSBtaXNzaW5nIGNyaXRpY2FsIEVTNiBNYXAgZnVuY3Rpb25hbGl0eVxyXG4gICAgV2Ugd3JhcCB0aGlzIGluIGEgdHJ5L2NhdGNoIGJlY2F1c2Ugc29tZXRpbWVzIHRoZSBNYXAgY29uc3RydWN0b3IgZXhpc3RzLCBidXQgZG9lcyBub3RcclxuICAgIHRha2UgYXJndW1lbnRzIChpT1MgOC40KVxyXG4gICAgICovXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgbWFwID0gbmV3IGdsb2JhbC5NYXAoW1swLCAxXV0pO1xyXG4gICAgICAgICAgICByZXR1cm4gbWFwLmhhcygwKSAmJlxyXG4gICAgICAgICAgICAgICAgdHlwZW9mIG1hcC5rZXlzID09PSAnZnVuY3Rpb24nICYmXHJcbiAgICAgICAgICAgICAgICB0cnVlICYmXHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgbWFwLnZhbHVlcyA9PT0gJ2Z1bmN0aW9uJyAmJlxyXG4gICAgICAgICAgICAgICAgdHlwZW9mIG1hcC5lbnRyaWVzID09PSAnZnVuY3Rpb24nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dDogbm90IHRlc3Rpbmcgb24gaU9TIGF0IHRoZSBtb21lbnQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufSwgdHJ1ZSk7XHJcbi8qIE1hdGggKi9cclxuYWRkKCdlczYtbWF0aCcsICgpID0+IHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgICAgJ2NsejMyJyxcclxuICAgICAgICAnc2lnbicsXHJcbiAgICAgICAgJ2xvZzEwJyxcclxuICAgICAgICAnbG9nMicsXHJcbiAgICAgICAgJ2xvZzFwJyxcclxuICAgICAgICAnZXhwbTEnLFxyXG4gICAgICAgICdjb3NoJyxcclxuICAgICAgICAnc2luaCcsXHJcbiAgICAgICAgJ3RhbmgnLFxyXG4gICAgICAgICdhY29zaCcsXHJcbiAgICAgICAgJ2FzaW5oJyxcclxuICAgICAgICAnYXRhbmgnLFxyXG4gICAgICAgICd0cnVuYycsXHJcbiAgICAgICAgJ2Zyb3VuZCcsXHJcbiAgICAgICAgJ2NicnQnLFxyXG4gICAgICAgICdoeXBvdCdcclxuICAgIF0uZXZlcnkoKG5hbWUpID0+IHR5cGVvZiBnbG9iYWwuTWF0aFtuYW1lXSA9PT0gJ2Z1bmN0aW9uJyk7XHJcbn0sIHRydWUpO1xyXG5hZGQoJ2VzNi1tYXRoLWltdWwnLCAoKSA9PiB7XHJcbiAgICBpZiAoJ2ltdWwnIGluIGdsb2JhbC5NYXRoKSB7XHJcbiAgICAgICAgLyogU29tZSB2ZXJzaW9ucyBvZiBTYWZhcmkgb24gaW9zIGRvIG5vdCBwcm9wZXJseSBpbXBsZW1lbnQgdGhpcyAqL1xyXG4gICAgICAgIHJldHVybiBNYXRoLmltdWwoMHhmZmZmZmZmZiwgNSkgPT09IC01O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59LCB0cnVlKTtcclxuLyogT2JqZWN0ICovXHJcbmFkZCgnZXM2LW9iamVjdCcsICgpID0+IHtcclxuICAgIHJldHVybiB0cnVlICYmXHJcbiAgICAgICAgWydhc3NpZ24nLCAnaXMnLCAnZ2V0T3duUHJvcGVydHlTeW1ib2xzJywgJ3NldFByb3RvdHlwZU9mJ10uZXZlcnkoKG5hbWUpID0+IHR5cGVvZiBnbG9iYWwuT2JqZWN0W25hbWVdID09PSAnZnVuY3Rpb24nKTtcclxufSwgdHJ1ZSk7XHJcbmFkZCgnZXMyMDE3LW9iamVjdCcsICgpID0+IHtcclxuICAgIHJldHVybiBbJ3ZhbHVlcycsICdlbnRyaWVzJywgJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcnMnXS5ldmVyeSgobmFtZSkgPT4gdHlwZW9mIGdsb2JhbC5PYmplY3RbbmFtZV0gPT09ICdmdW5jdGlvbicpO1xyXG59LCB0cnVlKTtcclxuLyogT2JzZXJ2YWJsZSAqL1xyXG5hZGQoJ2VzLW9ic2VydmFibGUnLCAoKSA9PiB0eXBlb2YgZ2xvYmFsLk9ic2VydmFibGUgIT09ICd1bmRlZmluZWQnLCB0cnVlKTtcclxuLyogUHJvbWlzZSAqL1xyXG5hZGQoJ2VzNi1wcm9taXNlJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5Qcm9taXNlICE9PSAndW5kZWZpbmVkJyAmJiB0cnVlLCB0cnVlKTtcclxuLyogU2V0ICovXHJcbmFkZCgnZXM2LXNldCcsICgpID0+IHtcclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsLlNldCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIC8qIElFMTEgYW5kIG9sZGVyIHZlcnNpb25zIG9mIFNhZmFyaSBhcmUgbWlzc2luZyBjcml0aWNhbCBFUzYgU2V0IGZ1bmN0aW9uYWxpdHkgKi9cclxuICAgICAgICBjb25zdCBzZXQgPSBuZXcgZ2xvYmFsLlNldChbMV0pO1xyXG4gICAgICAgIHJldHVybiBzZXQuaGFzKDEpICYmICdrZXlzJyBpbiBzZXQgJiYgdHlwZW9mIHNldC5rZXlzID09PSAnZnVuY3Rpb24nICYmIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn0sIHRydWUpO1xyXG4vKiBTdHJpbmcgKi9cclxuYWRkKCdlczYtc3RyaW5nJywgKCkgPT4ge1xyXG4gICAgcmV0dXJuIChbXHJcbiAgICAgICAgLyogc3RhdGljIG1ldGhvZHMgKi9cclxuICAgICAgICAnZnJvbUNvZGVQb2ludCdcclxuICAgIF0uZXZlcnkoKGtleSkgPT4gdHlwZW9mIGdsb2JhbC5TdHJpbmdba2V5XSA9PT0gJ2Z1bmN0aW9uJykgJiZcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIC8qIGluc3RhbmNlIG1ldGhvZHMgKi9cclxuICAgICAgICAgICAgJ2NvZGVQb2ludEF0JyxcclxuICAgICAgICAgICAgJ25vcm1hbGl6ZScsXHJcbiAgICAgICAgICAgICdyZXBlYXQnLFxyXG4gICAgICAgICAgICAnc3RhcnRzV2l0aCcsXHJcbiAgICAgICAgICAgICdlbmRzV2l0aCcsXHJcbiAgICAgICAgICAgICdpbmNsdWRlcydcclxuICAgICAgICBdLmV2ZXJ5KChrZXkpID0+IHR5cGVvZiBnbG9iYWwuU3RyaW5nLnByb3RvdHlwZVtrZXldID09PSAnZnVuY3Rpb24nKSk7XHJcbn0sIHRydWUpO1xyXG5hZGQoJ2VzNi1zdHJpbmctcmF3JywgKCkgPT4ge1xyXG4gICAgZnVuY3Rpb24gZ2V0Q2FsbFNpdGUoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBbLi4uY2FsbFNpdGVdO1xyXG4gICAgICAgIHJlc3VsdC5yYXcgPSBjYWxsU2l0ZS5yYXc7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGlmICgncmF3JyBpbiBnbG9iYWwuU3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGIgPSAxO1xyXG4gICAgICAgIGxldCBjYWxsU2l0ZSA9IGdldENhbGxTaXRlIGBhXFxuJHtifWA7XHJcbiAgICAgICAgY2FsbFNpdGUucmF3ID0gWydhXFxcXG4nXTtcclxuICAgICAgICBjb25zdCBzdXBwb3J0c1RydW5jID0gZ2xvYmFsLlN0cmluZy5yYXcoY2FsbFNpdGUsIDQyKSA9PT0gJ2FcXFxcbic7XHJcbiAgICAgICAgcmV0dXJuIHN1cHBvcnRzVHJ1bmM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn0sIHRydWUpO1xyXG5hZGQoJ2VzMjAxNy1zdHJpbmcnLCAoKSA9PiB7XHJcbiAgICByZXR1cm4gWydwYWRTdGFydCcsICdwYWRFbmQnXS5ldmVyeSgoa2V5KSA9PiB0eXBlb2YgZ2xvYmFsLlN0cmluZy5wcm90b3R5cGVba2V5XSA9PT0gJ2Z1bmN0aW9uJyk7XHJcbn0sIHRydWUpO1xyXG4vKiBTeW1ib2wgKi9cclxuYWRkKCdlczYtc3ltYm9sJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5TeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBTeW1ib2woKSA9PT0gJ3N5bWJvbCcsIHRydWUpO1xyXG4vKiBXZWFrTWFwICovXHJcbmFkZCgnZXM2LXdlYWttYXAnLCAoKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIGdsb2JhbC5XZWFrTWFwICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIC8qIElFMTEgYW5kIG9sZGVyIHZlcnNpb25zIG9mIFNhZmFyaSBhcmUgbWlzc2luZyBjcml0aWNhbCBFUzYgTWFwIGZ1bmN0aW9uYWxpdHkgKi9cclxuICAgICAgICBjb25zdCBrZXkxID0ge307XHJcbiAgICAgICAgY29uc3Qga2V5MiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IG1hcCA9IG5ldyBnbG9iYWwuV2Vha01hcChbW2tleTEsIDFdXSk7XHJcbiAgICAgICAgT2JqZWN0LmZyZWV6ZShrZXkxKTtcclxuICAgICAgICByZXR1cm4gbWFwLmdldChrZXkxKSA9PT0gMSAmJiBtYXAuc2V0KGtleTIsIDIpID09PSBtYXAgJiYgdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufSwgdHJ1ZSk7XHJcbi8qIE1pc2NlbGxhbmVvdXMgZmVhdHVyZXMgKi9cclxuYWRkKCdtaWNyb3Rhc2tzJywgKCkgPT4gdHJ1ZSB8fCBmYWxzZSB8fCB0cnVlLCB0cnVlKTtcclxuYWRkKCdwb3N0bWVzc2FnZScsICgpID0+IHtcclxuICAgIC8vIElmIHdpbmRvdyBpcyB1bmRlZmluZWQsIGFuZCB3ZSBoYXZlIHBvc3RNZXNzYWdlLCBpdCBwcm9iYWJseSBtZWFucyB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIuIFdlYiB3b3JrZXJzIGhhdmVcclxuICAgIC8vIHBvc3QgbWVzc2FnZSBidXQgaXQgZG9lc24ndCB3b3JrIGhvdyB3ZSBleHBlY3QgaXQgdG8sIHNvIGl0J3MgYmVzdCBqdXN0IHRvIHByZXRlbmQgaXQgZG9lc24ndCBleGlzdC5cclxuICAgIHJldHVybiB0eXBlb2YgZ2xvYmFsLndpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGdsb2JhbC5wb3N0TWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJztcclxufSwgdHJ1ZSk7XHJcbmFkZCgncmFmJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicsIHRydWUpO1xyXG5hZGQoJ3NldGltbWVkaWF0ZScsICgpID0+IHR5cGVvZiBnbG9iYWwuc2V0SW1tZWRpYXRlICE9PSAndW5kZWZpbmVkJywgdHJ1ZSk7XHJcbi8qIERPTSBGZWF0dXJlcyAqL1xyXG5hZGQoJ2RvbS1tdXRhdGlvbm9ic2VydmVyJywgKCkgPT4ge1xyXG4gICAgaWYgKHRydWUgJiYgQm9vbGVhbihnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcikpIHtcclxuICAgICAgICAvLyBJRTExIGhhcyBhbiB1bnJlbGlhYmxlIE11dGF0aW9uT2JzZXJ2ZXIgaW1wbGVtZW50YXRpb24gd2hlcmUgc2V0UHJvcGVydHkoKSBkb2VzIG5vdFxyXG4gICAgICAgIC8vIGdlbmVyYXRlIGEgbXV0YXRpb24gZXZlbnQsIG9ic2VydmVycyBjYW4gY3Jhc2gsIGFuZCB0aGUgcXVldWUgZG9lcyBub3QgZHJhaW5cclxuICAgICAgICAvLyByZWxpYWJseS4gVGhlIGZvbGxvd2luZyBmZWF0dXJlIHRlc3Qgd2FzIGFkYXB0ZWQgZnJvbVxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3QxMGtvLzRhY2ViOGM3MTY4MWZkYjI3NWUzM2VmZTVlNTc2YjE0XHJcbiAgICAgICAgY29uc3QgZXhhbXBsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YXJpYWJsZS1uYW1lICovXHJcbiAgICAgICAgY29uc3QgSG9zdE11dGF0aW9uT2JzZXJ2ZXIgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcclxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBIb3N0TXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7IH0pO1xyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZXhhbXBsZSwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xyXG4gICAgICAgIGV4YW1wbGUuc3R5bGUuc2V0UHJvcGVydHkoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICByZXR1cm4gQm9vbGVhbihvYnNlcnZlci50YWtlUmVjb3JkcygpLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn0sIHRydWUpO1xyXG5hZGQoJ2RvbS13ZWJhbmltYXRpb24nLCAoKSA9PiB0cnVlICYmIGdsb2JhbC5BbmltYXRpb24gIT09IHVuZGVmaW5lZCAmJiBnbG9iYWwuS2V5ZnJhbWVFZmZlY3QgIT09IHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbmFkZCgnYWJvcnQtY29udHJvbGxlcicsICgpID0+IHR5cGVvZiBnbG9iYWwuQWJvcnRDb250cm9sbGVyICE9PSAndW5kZWZpbmVkJyk7XHJcbmFkZCgnYWJvcnQtc2lnbmFsJywgKCkgPT4gdHlwZW9mIGdsb2JhbC5BYm9ydFNpZ25hbCAhPT0gJ3VuZGVmaW5lZCcpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYXMubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay9zaGltL3N1cHBvcnQvaGFzLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vc3VwcG9ydC9oYXMubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi4vZ2xvYmFsJztcclxuaW1wb3J0IGhhcyBmcm9tICcuL2hhcyc7XHJcbmZ1bmN0aW9uIGV4ZWN1dGVUYXNrKGl0ZW0pIHtcclxuICAgIGlmIChpdGVtICYmIGl0ZW0uaXNBY3RpdmUgJiYgaXRlbS5jYWxsYmFjaykge1xyXG4gICAgICAgIGl0ZW0uY2FsbGJhY2soKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBnZXRRdWV1ZUhhbmRsZShpdGVtLCBkZXN0cnVjdG9yKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgICAgICAgICBpdGVtLmlzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGl0ZW0uY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoZGVzdHJ1Y3Rvcikge1xyXG4gICAgICAgICAgICAgICAgZGVzdHJ1Y3RvcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5sZXQgY2hlY2tNaWNyb1Rhc2tRdWV1ZTtcclxubGV0IG1pY3JvVGFza3M7XHJcbi8qKlxyXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byB0aGUgbWFjcm90YXNrIHF1ZXVlLlxyXG4gKlxyXG4gKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGZ1bmN0aW9uIHRvIGJlIHF1ZXVlZCBhbmQgbGF0ZXIgZXhlY3V0ZWQuXHJcbiAqIEByZXR1cm5zIEFuIG9iamVjdCB3aXRoIGEgYGRlc3Ryb3lgIG1ldGhvZCB0aGF0LCB3aGVuIGNhbGxlZCwgcHJldmVudHMgdGhlIHJlZ2lzdGVyZWQgY2FsbGJhY2sgZnJvbSBleGVjdXRpbmcuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgcXVldWVUYXNrID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCBkZXN0cnVjdG9yO1xyXG4gICAgbGV0IGVucXVldWU7XHJcbiAgICAvLyBTaW5jZSB0aGUgSUUgaW1wbGVtZW50YXRpb24gb2YgYHNldEltbWVkaWF0ZWAgaXMgbm90IGZsYXdsZXNzLCB3ZSB3aWxsIHRlc3QgZm9yIGBwb3N0TWVzc2FnZWAgZmlyc3QuXHJcbiAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgIGNvbnN0IHF1ZXVlID0gW107XHJcbiAgICAgICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gQ29uZmlybSB0aGF0IHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IHRoZSBjdXJyZW50IHdpbmRvdyBhbmQgYnkgdGhpcyBwYXJ0aWN1bGFyIGltcGxlbWVudGF0aW9uLlxyXG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBnbG9iYWwgJiYgZXZlbnQuZGF0YSA9PT0gJ2Rvam8tcXVldWUtbWVzc2FnZScpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4ZWN1dGVUYXNrKHF1ZXVlLnNoaWZ0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZSgnZG9qby1xdWV1ZS1tZXNzYWdlJywgJyonKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZmFsc2UpIHtcclxuICAgICAgICBkZXN0cnVjdG9yID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlO1xyXG4gICAgICAgIGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0SW1tZWRpYXRlKGV4ZWN1dGVUYXNrLmJpbmQobnVsbCwgaXRlbSkpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBkZXN0cnVjdG9yID0gZ2xvYmFsLmNsZWFyVGltZW91dDtcclxuICAgICAgICBlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSwgMCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHF1ZXVlVGFzayhjYWxsYmFjaykge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSB7XHJcbiAgICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGlkID0gZW5xdWV1ZShpdGVtKTtcclxuICAgICAgICByZXR1cm4gZ2V0UXVldWVIYW5kbGUoaXRlbSwgZGVzdHJ1Y3RvciAmJlxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0cnVjdG9yKGlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyBUT0RPOiBVc2UgYXNwZWN0LmJlZm9yZSB3aGVuIGl0IGlzIGF2YWlsYWJsZS5cclxuICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgPyBxdWV1ZVRhc2tcclxuICAgICAgICA6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjaGVja01pY3JvVGFza1F1ZXVlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBxdWV1ZVRhc2soY2FsbGJhY2spO1xyXG4gICAgICAgIH07XHJcbn0pKCk7XHJcbi8vIFdoZW4gbm8gbWVjaGFuaXNtIGZvciByZWdpc3RlcmluZyBtaWNyb3Rhc2tzIGlzIGV4cG9zZWQgYnkgdGhlIGVudmlyb25tZW50LCBtaWNyb3Rhc2tzIHdpbGxcclxuLy8gYmUgcXVldWVkIGFuZCB0aGVuIGV4ZWN1dGVkIGluIGEgc2luZ2xlIG1hY3JvdGFzayBiZWZvcmUgdGhlIG90aGVyIG1hY3JvdGFza3MgYXJlIGV4ZWN1dGVkLlxyXG5pZiAoIXRydWUpIHtcclxuICAgIGxldCBpc01pY3JvVGFza1F1ZXVlZCA9IGZhbHNlO1xyXG4gICAgbWljcm9UYXNrcyA9IFtdO1xyXG4gICAgY2hlY2tNaWNyb1Rhc2tRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIWlzTWljcm9UYXNrUXVldWVkKSB7XHJcbiAgICAgICAgICAgIGlzTWljcm9UYXNrUXVldWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgcXVldWVUYXNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlzTWljcm9UYXNrUXVldWVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAobWljcm9UYXNrcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbTtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoKGl0ZW0gPSBtaWNyb1Rhc2tzLnNoaWZ0KCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGVUYXNrKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG4vKipcclxuICogU2NoZWR1bGVzIGFuIGFuaW1hdGlvbiB0YXNrIHdpdGggYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGlmIGl0IGV4aXN0cywgb3Igd2l0aCBgcXVldWVUYXNrYCBvdGhlcndpc2UuXHJcbiAqXHJcbiAqIFNpbmNlIHJlcXVlc3RBbmltYXRpb25GcmFtZSdzIGJlaGF2aW9yIGRvZXMgbm90IG1hdGNoIHRoYXQgZXhwZWN0ZWQgZnJvbSBgcXVldWVUYXNrYCwgaXQgaXMgbm90IHVzZWQgdGhlcmUuXHJcbiAqIEhvd2V2ZXIsIGF0IHRpbWVzIGl0IG1ha2VzIG1vcmUgc2Vuc2UgdG8gZGVsZWdhdGUgdG8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lOyBoZW5jZSB0aGUgZm9sbG93aW5nIG1ldGhvZC5cclxuICpcclxuICogQHBhcmFtIGNhbGxiYWNrIHRoZSBmdW5jdGlvbiB0byBiZSBxdWV1ZWQgYW5kIGxhdGVyIGV4ZWN1dGVkLlxyXG4gKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBhIGBkZXN0cm95YCBtZXRob2QgdGhhdCwgd2hlbiBjYWxsZWQsIHByZXZlbnRzIHRoZSByZWdpc3RlcmVkIGNhbGxiYWNrIGZyb20gZXhlY3V0aW5nLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHF1ZXVlQW5pbWF0aW9uVGFzayA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIXRydWUpIHtcclxuICAgICAgICByZXR1cm4gcXVldWVUYXNrO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcXVldWVBbmltYXRpb25UYXNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IHtcclxuICAgICAgICAgICAgaXNBY3RpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFja1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSk7XHJcbiAgICAgICAgcmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmSWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gVE9ETzogVXNlIGFzcGVjdC5iZWZvcmUgd2hlbiBpdCBpcyBhdmFpbGFibGUuXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgID8gcXVldWVBbmltYXRpb25UYXNrXHJcbiAgICAgICAgOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY2hlY2tNaWNyb1Rhc2tRdWV1ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcXVldWVBbmltYXRpb25UYXNrKGNhbGxiYWNrKTtcclxuICAgICAgICB9O1xyXG59KSgpO1xyXG4vKipcclxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gdGhlIG1pY3JvdGFzayBxdWV1ZS5cclxuICpcclxuICogQW55IGNhbGxiYWNrcyByZWdpc3RlcmVkIHdpdGggYHF1ZXVlTWljcm9UYXNrYCB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSB0aGUgbmV4dCBtYWNyb3Rhc2suIElmIG5vIG5hdGl2ZVxyXG4gKiBtZWNoYW5pc20gZm9yIHNjaGVkdWxpbmcgbWFjcm90YXNrcyBpcyBleHBvc2VkLCB0aGVuIGFueSBjYWxsYmFja3Mgd2lsbCBiZSBmaXJlZCBiZWZvcmUgYW55IG1hY3JvdGFza1xyXG4gKiByZWdpc3RlcmVkIHdpdGggYHF1ZXVlVGFza2Agb3IgYHF1ZXVlQW5pbWF0aW9uVGFza2AuXHJcbiAqXHJcbiAqIEBwYXJhbSBjYWxsYmFjayB0aGUgZnVuY3Rpb24gdG8gYmUgcXVldWVkIGFuZCBsYXRlciBleGVjdXRlZC5cclxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYSBgZGVzdHJveWAgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBwcmV2ZW50cyB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjayBmcm9tIGV4ZWN1dGluZy5cclxuICovXHJcbmV4cG9ydCBsZXQgcXVldWVNaWNyb1Rhc2sgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IGVucXVldWU7XHJcbiAgICBpZiAoZmFsc2UpIHtcclxuICAgICAgICBlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgZ2xvYmFsLnByb2Nlc3MubmV4dFRpY2soZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRydWUpIHtcclxuICAgICAgICBlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgZ2xvYmFsLlByb21pc2UucmVzb2x2ZShpdGVtKS50aGVuKGV4ZWN1dGVUYXNrKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodHJ1ZSkge1xyXG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YXJpYWJsZS1uYW1lICovXHJcbiAgICAgICAgY29uc3QgSG9zdE11dGF0aW9uT2JzZXJ2ZXIgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcclxuICAgICAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgY29uc3QgcXVldWUgPSBbXTtcclxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBIb3N0TXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gcXVldWUuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtICYmIGl0ZW0uaXNBY3RpdmUgJiYgaXRlbS5jYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xyXG4gICAgICAgIGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZSgncXVldWVTdGF0dXMnLCAnMScpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgY2hlY2tNaWNyb1Rhc2tRdWV1ZSgpO1xyXG4gICAgICAgICAgICBtaWNyb1Rhc2tzLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zdCBpdGVtID0ge1xyXG4gICAgICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXHJcbiAgICAgICAgfTtcclxuICAgICAgICBlbnF1ZXVlKGl0ZW0pO1xyXG4gICAgICAgIHJldHVybiBnZXRRdWV1ZUhhbmRsZShpdGVtKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXF1ZXVlLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L3F1ZXVlLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3NoaW0vc3VwcG9ydC9xdWV1ZS5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgYSB2YWx1ZSBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gKlxuICogQHBhcmFtIHZhbHVlICAgICAgICBUaGUgdmFsdWUgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3Igc2hvdWxkIGJlIHNldCB0b1xuICogQHBhcmFtIGVudW1lcmFibGUgICBJZiB0aGUgcHJvcGVydHkgc2hvdWxkIGJlIGVudW1iZXJhYmxlLCBkZWZhdWx0cyB0byBmYWxzZVxuICogQHBhcmFtIHdyaXRhYmxlICAgICBJZiB0aGUgcHJvcGVydHkgc2hvdWxkIGJlIHdyaXRhYmxlLCBkZWZhdWx0cyB0byB0cnVlXG4gKiBAcGFyYW0gY29uZmlndXJhYmxlIElmIHRoZSBwcm9wZXJ0eSBzaG91bGQgYmUgY29uZmlndXJhYmxlLCBkZWZhdWx0cyB0byB0cnVlXG4gKiBAcmV0dXJuICAgICAgICAgICAgIFRoZSBwcm9wZXJ0eSBkZXNjcmlwdG9yIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsdWVEZXNjcmlwdG9yKHZhbHVlLCBlbnVtZXJhYmxlID0gZmFsc2UsIHdyaXRhYmxlID0gdHJ1ZSwgY29uZmlndXJhYmxlID0gdHJ1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZW51bWVyYWJsZSxcbiAgICAgICAgd3JpdGFibGU6IHdyaXRhYmxlLFxuICAgICAgICBjb25maWd1cmFibGU6IGNvbmZpZ3VyYWJsZVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gd3JhcE5hdGl2ZShuYXRpdmVGdW5jdGlvbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCAuLi5hcmdzKSB7XG4gICAgICAgIHJldHVybiBuYXRpdmVGdW5jdGlvbi5hcHBseSh0YXJnZXQsIGFyZ3MpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlsLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L3V0aWwubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvc2hpbS9zdXBwb3J0L3V0aWwubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IEV2ZW50ZWQgfSBmcm9tICcuLi9jb3JlL0V2ZW50ZWQnO1xuZXhwb3J0IGNsYXNzIEluamVjdG9yIGV4dGVuZHMgRXZlbnRlZCB7XG4gICAgY29uc3RydWN0b3IocGF5bG9hZCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLl9wYXlsb2FkID0gcGF5bG9hZDtcbiAgICB9XG4gICAgc2V0SW52YWxpZGF0b3IoaW52YWxpZGF0b3IpIHtcbiAgICAgICAgdGhpcy5faW52YWxpZGF0b3IgPSBpbnZhbGlkYXRvcjtcbiAgICB9XG4gICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGF5bG9hZDtcbiAgICB9XG4gICAgc2V0KHBheWxvYWQpIHtcbiAgICAgICAgdGhpcy5fcGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgICAgIGlmICh0aGlzLl9pbnZhbGlkYXRvcikge1xuICAgICAgICAgICAgdGhpcy5faW52YWxpZGF0b3IoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEluamVjdG9yO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9SW5qZWN0b3IubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9JbmplY3Rvci5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9JbmplY3Rvci5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgRXZlbnRlZCB9IGZyb20gJy4uL2NvcmUvRXZlbnRlZCc7XHJcbmltcG9ydCBNYXAgZnJvbSAnLi4vc2hpbS9NYXAnO1xyXG4vKipcclxuICogRW51bSB0byBpZGVudGlmeSB0aGUgdHlwZSBvZiBldmVudC5cclxuICogTGlzdGVuaW5nIHRvICdQcm9qZWN0b3InIHdpbGwgbm90aWZ5IHdoZW4gcHJvamVjdG9yIGlzIGNyZWF0ZWQgb3IgdXBkYXRlZFxyXG4gKiBMaXN0ZW5pbmcgdG8gJ1dpZGdldCcgd2lsbCBub3RpZnkgd2hlbiB3aWRnZXQgcm9vdCBpcyBjcmVhdGVkIG9yIHVwZGF0ZWRcclxuICovXHJcbmV4cG9ydCB2YXIgTm9kZUV2ZW50VHlwZTtcclxuKGZ1bmN0aW9uIChOb2RlRXZlbnRUeXBlKSB7XHJcbiAgICBOb2RlRXZlbnRUeXBlW1wiUHJvamVjdG9yXCJdID0gXCJQcm9qZWN0b3JcIjtcclxuICAgIE5vZGVFdmVudFR5cGVbXCJXaWRnZXRcIl0gPSBcIldpZGdldFwiO1xyXG59KShOb2RlRXZlbnRUeXBlIHx8IChOb2RlRXZlbnRUeXBlID0ge30pKTtcclxuZXhwb3J0IGNsYXNzIE5vZGVIYW5kbGVyIGV4dGVuZHMgRXZlbnRlZCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMuX25vZGVNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBnZXQoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGVNYXAuZ2V0KGtleSk7XHJcbiAgICB9XHJcbiAgICBoYXMoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGVNYXAuaGFzKGtleSk7XHJcbiAgICB9XHJcbiAgICBhZGQoZWxlbWVudCwga2V5KSB7XHJcbiAgICAgICAgdGhpcy5fbm9kZU1hcC5zZXQoa2V5LCBlbGVtZW50KTtcclxuICAgICAgICB0aGlzLmVtaXQoeyB0eXBlOiBrZXkgfSk7XHJcbiAgICB9XHJcbiAgICBhZGRSb290KCkge1xyXG4gICAgICAgIHRoaXMuZW1pdCh7IHR5cGU6IE5vZGVFdmVudFR5cGUuV2lkZ2V0IH0pO1xyXG4gICAgfVxyXG4gICAgYWRkUHJvamVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZW1pdCh7IHR5cGU6IE5vZGVFdmVudFR5cGUuUHJvamVjdG9yIH0pO1xyXG4gICAgfVxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5fbm9kZU1hcC5jbGVhcigpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IE5vZGVIYW5kbGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Ob2RlSGFuZGxlci5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL05vZGVIYW5kbGVyLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL05vZGVIYW5kbGVyLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9zaGltL1Byb21pc2UnO1xyXG5pbXBvcnQgTWFwIGZyb20gJy4uL3NoaW0vTWFwJztcclxuaW1wb3J0IHsgRXZlbnRlZCB9IGZyb20gJy4uL2NvcmUvRXZlbnRlZCc7XHJcbi8qKlxyXG4gKiBXaWRnZXQgYmFzZSB0eXBlXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgV0lER0VUX0JBU0VfVFlQRSA9ICdfX3dpZGdldF9iYXNlX3R5cGUnO1xyXG4vKipcclxuICogQ2hlY2tzIGlzIHRoZSBpdGVtIGlzIGEgc3ViY2xhc3Mgb2YgV2lkZ2V0QmFzZSAob3IgYSBXaWRnZXRCYXNlKVxyXG4gKlxyXG4gKiBAcGFyYW0gaXRlbSB0aGUgaXRlbSB0byBjaGVja1xyXG4gKiBAcmV0dXJucyB0cnVlL2ZhbHNlIGluZGljYXRpbmcgaWYgdGhlIGl0ZW0gaXMgYSBXaWRnZXRCYXNlQ29uc3RydWN0b3JcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1dpZGdldEJhc2VDb25zdHJ1Y3RvcihpdGVtKSB7XHJcbiAgICByZXR1cm4gQm9vbGVhbihpdGVtICYmIGl0ZW0uX3R5cGUgPT09IFdJREdFVF9CQVNFX1RZUEUpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpc1dpZGdldENvbnN0cnVjdG9yRGVmYXVsdEV4cG9ydChpdGVtKSB7XHJcbiAgICByZXR1cm4gQm9vbGVhbihpdGVtICYmXHJcbiAgICAgICAgaXRlbS5oYXNPd25Qcm9wZXJ0eSgnX19lc01vZHVsZScpICYmXHJcbiAgICAgICAgaXRlbS5oYXNPd25Qcm9wZXJ0eSgnZGVmYXVsdCcpICYmXHJcbiAgICAgICAgaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IoaXRlbS5kZWZhdWx0KSk7XHJcbn1cclxuLyoqXHJcbiAqIFRoZSBSZWdpc3RyeSBpbXBsZW1lbnRhdGlvblxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJlZ2lzdHJ5IGV4dGVuZHMgRXZlbnRlZCB7XHJcbiAgICAvKipcclxuICAgICAqIEVtaXQgbG9hZGVkIGV2ZW50IGZvciByZWdpc3RyeSBsYWJlbFxyXG4gICAgICovXHJcbiAgICBlbWl0TG9hZGVkRXZlbnQod2lkZ2V0TGFiZWwsIGl0ZW0pIHtcclxuICAgICAgICB0aGlzLmVtaXQoe1xyXG4gICAgICAgICAgICB0eXBlOiB3aWRnZXRMYWJlbCxcclxuICAgICAgICAgICAgYWN0aW9uOiAnbG9hZGVkJyxcclxuICAgICAgICAgICAgaXRlbVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZGVmaW5lKGxhYmVsLCBpdGVtKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dpZGdldFJlZ2lzdHJ5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fd2lkZ2V0UmVnaXN0cnkgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl93aWRnZXRSZWdpc3RyeS5oYXMobGFiZWwpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgd2lkZ2V0IGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCBmb3IgJyR7bGFiZWwudG9TdHJpbmcoKX0nYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dpZGdldFJlZ2lzdHJ5LnNldChsYWJlbCwgaXRlbSk7XHJcbiAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIGl0ZW0udGhlbigod2lkZ2V0Q3RvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fd2lkZ2V0UmVnaXN0cnkuc2V0KGxhYmVsLCB3aWRnZXRDdG9yKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdExvYWRlZEV2ZW50KGxhYmVsLCB3aWRnZXRDdG9yKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB3aWRnZXRDdG9yO1xyXG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IoaXRlbSkpIHtcclxuICAgICAgICAgICAgdGhpcy5lbWl0TG9hZGVkRXZlbnQobGFiZWwsIGl0ZW0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlZmluZUluamVjdG9yKGxhYmVsLCBpbmplY3RvckZhY3RvcnkpIHtcclxuICAgICAgICBpZiAodGhpcy5faW5qZWN0b3JSZWdpc3RyeSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2luamVjdG9yUmVnaXN0cnkgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9pbmplY3RvclJlZ2lzdHJ5LmhhcyhsYWJlbCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbmplY3RvciBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQgZm9yICcke2xhYmVsLnRvU3RyaW5nKCl9J2ApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnZhbGlkYXRvciA9IG5ldyBFdmVudGVkKCk7XHJcbiAgICAgICAgY29uc3QgaW5qZWN0b3JJdGVtID0ge1xyXG4gICAgICAgICAgICBpbmplY3RvcjogaW5qZWN0b3JGYWN0b3J5KCgpID0+IGludmFsaWRhdG9yLmVtaXQoeyB0eXBlOiAnaW52YWxpZGF0ZScgfSkpLFxyXG4gICAgICAgICAgICBpbnZhbGlkYXRvclxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5faW5qZWN0b3JSZWdpc3RyeS5zZXQobGFiZWwsIGluamVjdG9ySXRlbSk7XHJcbiAgICAgICAgdGhpcy5lbWl0TG9hZGVkRXZlbnQobGFiZWwsIGluamVjdG9ySXRlbSk7XHJcbiAgICB9XHJcbiAgICBnZXQobGFiZWwpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3dpZGdldFJlZ2lzdHJ5IHx8ICF0aGlzLmhhcyhsYWJlbCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl93aWRnZXRSZWdpc3RyeS5nZXQobGFiZWwpO1xyXG4gICAgICAgIGlmIChpc1dpZGdldEJhc2VDb25zdHJ1Y3RvcihpdGVtKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcm9taXNlID0gaXRlbSgpO1xyXG4gICAgICAgIHRoaXMuX3dpZGdldFJlZ2lzdHJ5LnNldChsYWJlbCwgcHJvbWlzZSk7XHJcbiAgICAgICAgcHJvbWlzZS50aGVuKCh3aWRnZXRDdG9yKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpc1dpZGdldENvbnN0cnVjdG9yRGVmYXVsdEV4cG9ydCh3aWRnZXRDdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0Q3RvciA9IHdpZGdldEN0b3IuZGVmYXVsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl93aWRnZXRSZWdpc3RyeS5zZXQobGFiZWwsIHdpZGdldEN0b3IpO1xyXG4gICAgICAgICAgICB0aGlzLmVtaXRMb2FkZWRFdmVudChsYWJlbCwgd2lkZ2V0Q3Rvcik7XHJcbiAgICAgICAgICAgIHJldHVybiB3aWRnZXRDdG9yO1xyXG4gICAgICAgIH0sIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGdldEluamVjdG9yKGxhYmVsKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pbmplY3RvclJlZ2lzdHJ5IHx8ICF0aGlzLmhhc0luamVjdG9yKGxhYmVsKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luamVjdG9yUmVnaXN0cnkuZ2V0KGxhYmVsKTtcclxuICAgIH1cclxuICAgIGhhcyhsYWJlbCkge1xyXG4gICAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuX3dpZGdldFJlZ2lzdHJ5ICYmIHRoaXMuX3dpZGdldFJlZ2lzdHJ5LmhhcyhsYWJlbCkpO1xyXG4gICAgfVxyXG4gICAgaGFzSW5qZWN0b3IobGFiZWwpIHtcclxuICAgICAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9pbmplY3RvclJlZ2lzdHJ5ICYmIHRoaXMuX2luamVjdG9yUmVnaXN0cnkuaGFzKGxhYmVsKSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgUmVnaXN0cnk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVJlZ2lzdHJ5Lm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnkubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnkubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IE1hcCB9IGZyb20gJy4uL3NoaW0vTWFwJztcclxuaW1wb3J0IHsgRXZlbnRlZCB9IGZyb20gJy4uL2NvcmUvRXZlbnRlZCc7XHJcbmltcG9ydCB7IFJlZ2lzdHJ5IH0gZnJvbSAnLi9SZWdpc3RyeSc7XHJcbmV4cG9ydCBjbGFzcyBSZWdpc3RyeUhhbmRsZXIgZXh0ZW5kcyBFdmVudGVkIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5fcmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkoKTtcclxuICAgICAgICB0aGlzLl9yZWdpc3RyeVdpZGdldExhYmVsTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5SW5qZWN0b3JMYWJlbE1hcCA9IG5ldyBNYXAoKTtcclxuICAgICAgICB0aGlzLm93bih0aGlzLl9yZWdpc3RyeSk7XHJcbiAgICAgICAgY29uc3QgZGVzdHJveSA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmFzZVJlZ2lzdHJ5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWdpc3RyeVdpZGdldExhYmVsTWFwLmRlbGV0ZSh0aGlzLmJhc2VSZWdpc3RyeSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWdpc3RyeUluamVjdG9yTGFiZWxNYXAuZGVsZXRlKHRoaXMuYmFzZVJlZ2lzdHJ5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmFzZVJlZ2lzdHJ5ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm93bih7IGRlc3Ryb3kgfSk7XHJcbiAgICB9XHJcbiAgICBzZXQgYmFzZShiYXNlUmVnaXN0cnkpIHtcclxuICAgICAgICBpZiAodGhpcy5iYXNlUmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVnaXN0cnlXaWRnZXRMYWJlbE1hcC5kZWxldGUodGhpcy5iYXNlUmVnaXN0cnkpO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWdpc3RyeUluamVjdG9yTGFiZWxNYXAuZGVsZXRlKHRoaXMuYmFzZVJlZ2lzdHJ5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5iYXNlUmVnaXN0cnkgPSBiYXNlUmVnaXN0cnk7XHJcbiAgICB9XHJcbiAgICBkZWZpbmUobGFiZWwsIHdpZGdldCkge1xyXG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5LmRlZmluZShsYWJlbCwgd2lkZ2V0KTtcclxuICAgIH1cclxuICAgIGRlZmluZUluamVjdG9yKGxhYmVsLCBpbmplY3Rvcikge1xyXG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5LmRlZmluZUluamVjdG9yKGxhYmVsLCBpbmplY3Rvcik7XHJcbiAgICB9XHJcbiAgICBoYXMobGFiZWwpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVnaXN0cnkuaGFzKGxhYmVsKSB8fCBCb29sZWFuKHRoaXMuYmFzZVJlZ2lzdHJ5ICYmIHRoaXMuYmFzZVJlZ2lzdHJ5LmhhcyhsYWJlbCkpO1xyXG4gICAgfVxyXG4gICAgaGFzSW5qZWN0b3IobGFiZWwpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVnaXN0cnkuaGFzSW5qZWN0b3IobGFiZWwpIHx8IEJvb2xlYW4odGhpcy5iYXNlUmVnaXN0cnkgJiYgdGhpcy5iYXNlUmVnaXN0cnkuaGFzSW5qZWN0b3IobGFiZWwpKTtcclxuICAgIH1cclxuICAgIGdldChsYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldChsYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZSwgJ2dldCcsIHRoaXMuX3JlZ2lzdHJ5V2lkZ2V0TGFiZWxNYXApO1xyXG4gICAgfVxyXG4gICAgZ2V0SW5qZWN0b3IobGFiZWwsIGdsb2JhbFByZWNlZGVuY2UgPSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9nZXQobGFiZWwsIGdsb2JhbFByZWNlZGVuY2UsICdnZXRJbmplY3RvcicsIHRoaXMuX3JlZ2lzdHJ5SW5qZWN0b3JMYWJlbE1hcCk7XHJcbiAgICB9XHJcbiAgICBfZ2V0KGxhYmVsLCBnbG9iYWxQcmVjZWRlbmNlLCBnZXRGdW5jdGlvbk5hbWUsIGxhYmVsTWFwKSB7XHJcbiAgICAgICAgY29uc3QgcmVnaXN0cmllcyA9IGdsb2JhbFByZWNlZGVuY2UgPyBbdGhpcy5iYXNlUmVnaXN0cnksIHRoaXMuX3JlZ2lzdHJ5XSA6IFt0aGlzLl9yZWdpc3RyeSwgdGhpcy5iYXNlUmVnaXN0cnldO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVnaXN0cmllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByZWdpc3RyeSA9IHJlZ2lzdHJpZXNbaV07XHJcbiAgICAgICAgICAgIGlmICghcmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSByZWdpc3RyeVtnZXRGdW5jdGlvbk5hbWVdKGxhYmVsKTtcclxuICAgICAgICAgICAgY29uc3QgcmVnaXN0ZXJlZExhYmVscyA9IGxhYmVsTWFwLmdldChyZWdpc3RyeSkgfHwgW107XHJcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyZWdpc3RlcmVkTGFiZWxzLmluZGV4T2YobGFiZWwpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gcmVnaXN0cnkub24obGFiZWwsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5hY3Rpb24gPT09ICdsb2FkZWQnICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbZ2V0RnVuY3Rpb25OYW1lXShsYWJlbCwgZ2xvYmFsUHJlY2VkZW5jZSkgPT09IGV2ZW50Lml0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KHsgdHlwZTogJ2ludmFsaWRhdGUnIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vd24oaGFuZGxlKTtcclxuICAgICAgICAgICAgICAgIGxhYmVsTWFwLnNldChyZWdpc3RyeSwgWy4uLnJlZ2lzdGVyZWRMYWJlbHMsIGxhYmVsXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgUmVnaXN0cnlIYW5kbGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1SZWdpc3RyeUhhbmRsZXIubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9SZWdpc3RyeUhhbmRsZXIubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvUmVnaXN0cnlIYW5kbGVyLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgTWFwIGZyb20gJy4uL3NoaW0vTWFwJztcclxuaW1wb3J0IFdlYWtNYXAgZnJvbSAnLi4vc2hpbS9XZWFrTWFwJztcclxuaW1wb3J0IHsgdiwgVk5PREUsIGlzVk5vZGUsIGlzV05vZGUgfSBmcm9tICcuL2QnO1xyXG5pbXBvcnQgeyBhdXRvIH0gZnJvbSAnLi9kaWZmJztcclxuaW1wb3J0IFJlZ2lzdHJ5SGFuZGxlciBmcm9tICcuL1JlZ2lzdHJ5SGFuZGxlcic7XHJcbmltcG9ydCBOb2RlSGFuZGxlciBmcm9tICcuL05vZGVIYW5kbGVyJztcclxuaW1wb3J0IHsgaXNXaWRnZXRCYXNlQ29uc3RydWN0b3IsIFdJREdFVF9CQVNFX1RZUEUgfSBmcm9tICcuL1JlZ2lzdHJ5JztcclxubGV0IGxhenlXaWRnZXRJZCA9IDA7XHJcbmNvbnN0IGxhenlXaWRnZXRJZE1hcCA9IG5ldyBXZWFrTWFwKCk7XHJcbmNvbnN0IGRlY29yYXRvck1hcCA9IG5ldyBNYXAoKTtcclxuZXhwb3J0IGNvbnN0IHdpZGdldEluc3RhbmNlTWFwID0gbmV3IFdlYWtNYXAoKTtcclxuY29uc3QgYm91bmRBdXRvID0gYXV0by5iaW5kKG51bGwpO1xyXG5leHBvcnQgY29uc3Qgbm9CaW5kID0gJ19fZG9qb19ub19iaW5kJztcclxuZnVuY3Rpb24gdG9UZXh0Vk5vZGUoZGF0YSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0YWc6ICcnLFxyXG4gICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgIGNoaWxkcmVuOiB1bmRlZmluZWQsXHJcbiAgICAgICAgdGV4dDogYCR7ZGF0YX1gLFxyXG4gICAgICAgIHR5cGU6IFZOT0RFXHJcbiAgICB9O1xyXG59XHJcbmZ1bmN0aW9uIGlzTGF6eURlZmluZShpdGVtKSB7XHJcbiAgICByZXR1cm4gQm9vbGVhbihpdGVtICYmIGl0ZW0ubGFiZWwpO1xyXG59XHJcbi8qKlxyXG4gKiBNYWluIHdpZGdldCBiYXNlIGZvciBhbGwgd2lkZ2V0cyB0byBleHRlbmRcclxuICovXHJcbmV4cG9ydCBjbGFzcyBXaWRnZXRCYXNlIHtcclxuICAgIC8qKlxyXG4gICAgICogQGNvbnN0cnVjdG9yXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluZGljYXRlcyBpZiBpdCBpcyB0aGUgaW5pdGlhbCBzZXQgcHJvcGVydGllcyBjeWNsZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX2luaXRpYWxQcm9wZXJ0aWVzID0gdHJ1ZTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBcnJheSBvZiBwcm9wZXJ0eSBrZXlzIGNvbnNpZGVyZWQgY2hhbmdlZCBmcm9tIHRoZSBwcmV2aW91cyBzZXQgcHJvcGVydGllc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZWRQcm9wZXJ0eUtleXMgPSBbXTtcclxuICAgICAgICB0aGlzLl9ub2RlSGFuZGxlciA9IG5ldyBOb2RlSGFuZGxlcigpO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZXMgPSBbXTtcclxuICAgICAgICB0aGlzLl9jaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2RlY29yYXRvckNhY2hlID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuX3Byb3BlcnRpZXMgPSB7fTtcclxuICAgICAgICB0aGlzLl9ib3VuZFJlbmRlckZ1bmMgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2JvdW5kSW52YWxpZGF0ZSA9IHRoaXMuaW52YWxpZGF0ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHdpZGdldEluc3RhbmNlTWFwLnNldCh0aGlzLCB7XHJcbiAgICAgICAgICAgIGRpcnR5OiB0cnVlLFxyXG4gICAgICAgICAgICBvbkF0dGFjaDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkF0dGFjaCgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkRldGFjaDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRldGFjaCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5vZGVIYW5kbGVyOiB0aGlzLl9ub2RlSGFuZGxlcixcclxuICAgICAgICAgICAgcmVuZGVyaW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5wdXRQcm9wZXJ0aWVzOiB7fVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub3duKHtcclxuICAgICAgICAgICAgZGVzdHJveTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0SW5zdGFuY2VNYXAuZGVsZXRlKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9kZUhhbmRsZXIuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vZGVIYW5kbGVyLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3J1bkFmdGVyQ29uc3RydWN0b3JzKCk7XHJcbiAgICB9XHJcbiAgICBtZXRhKE1ldGFUeXBlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX21ldGFNYXAgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9tZXRhTWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2FjaGVkID0gdGhpcy5fbWV0YU1hcC5nZXQoTWV0YVR5cGUpO1xyXG4gICAgICAgIGlmICghY2FjaGVkKSB7XHJcbiAgICAgICAgICAgIGNhY2hlZCA9IG5ldyBNZXRhVHlwZSh7XHJcbiAgICAgICAgICAgICAgICBpbnZhbGlkYXRlOiB0aGlzLl9ib3VuZEludmFsaWRhdGUsXHJcbiAgICAgICAgICAgICAgICBub2RlSGFuZGxlcjogdGhpcy5fbm9kZUhhbmRsZXIsXHJcbiAgICAgICAgICAgICAgICBiaW5kOiB0aGlzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLm93bihjYWNoZWQpO1xyXG4gICAgICAgICAgICB0aGlzLl9tZXRhTWFwLnNldChNZXRhVHlwZSwgY2FjaGVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNhY2hlZDtcclxuICAgIH1cclxuICAgIG9uQXR0YWNoKCkge1xyXG4gICAgICAgIC8vIERvIG5vdGhpbmcgYnkgZGVmYXVsdC5cclxuICAgIH1cclxuICAgIG9uRGV0YWNoKCkge1xyXG4gICAgICAgIC8vIERvIG5vdGhpbmcgYnkgZGVmYXVsdC5cclxuICAgIH1cclxuICAgIGdldCBwcm9wZXJ0aWVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9wZXJ0aWVzO1xyXG4gICAgfVxyXG4gICAgZ2V0IGNoYW5nZWRQcm9wZXJ0eUtleXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLl9jaGFuZ2VkUHJvcGVydHlLZXlzXTtcclxuICAgIH1cclxuICAgIF9fc2V0UHJvcGVydGllc19fKG9yaWdpbmFsUHJvcGVydGllcywgYmluZCkge1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldCh0aGlzKTtcclxuICAgICAgICBpZiAoaW5zdGFuY2VEYXRhKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlRGF0YS5pbnB1dFByb3BlcnRpZXMgPSBvcmlnaW5hbFByb3BlcnRpZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLl9ydW5CZWZvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsUHJvcGVydGllcyk7XHJcbiAgICAgICAgY29uc3QgcmVnaXN0ZXJlZERpZmZQcm9wZXJ0eU5hbWVzID0gdGhpcy5nZXREZWNvcmF0b3IoJ3JlZ2lzdGVyZWREaWZmUHJvcGVydHknKTtcclxuICAgICAgICBjb25zdCBjaGFuZ2VkUHJvcGVydHlLZXlzID0gW107XHJcbiAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lcyA9IE9iamVjdC5rZXlzKHByb3BlcnRpZXMpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsUHJvcGVydGllcyA9PT0gZmFsc2UgfHwgcmVnaXN0ZXJlZERpZmZQcm9wZXJ0eU5hbWVzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBhbGxQcm9wZXJ0aWVzID0gWy4uLnByb3BlcnR5TmFtZXMsIC4uLk9iamVjdC5rZXlzKHRoaXMuX3Byb3BlcnRpZXMpXTtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tlZFByb3BlcnRpZXMgPSBbXTtcclxuICAgICAgICAgICAgY29uc3QgZGlmZlByb3BlcnR5UmVzdWx0cyA9IHt9O1xyXG4gICAgICAgICAgICBsZXQgcnVuUmVhY3Rpb25zID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsUHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gYWxsUHJvcGVydGllc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjaGVja2VkUHJvcGVydGllcy5pbmRleE9mKHByb3BlcnR5TmFtZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjaGVja2VkUHJvcGVydGllcy5wdXNoKHByb3BlcnR5TmFtZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c1Byb3BlcnR5ID0gdGhpcy5fcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UHJvcGVydHkgPSB0aGlzLl9iaW5kRnVuY3Rpb25Qcm9wZXJ0eShwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0sIGJpbmQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lzdGVyZWREaWZmUHJvcGVydHlOYW1lcy5pbmRleE9mKHByb3BlcnR5TmFtZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVuUmVhY3Rpb25zID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaWZmRnVuY3Rpb25zID0gdGhpcy5nZXREZWNvcmF0b3IoYGRpZmZQcm9wZXJ0eToke3Byb3BlcnR5TmFtZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpZmZGdW5jdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZGlmZkZ1bmN0aW9uc1tpXShwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuY2hhbmdlZCAmJiBjaGFuZ2VkUHJvcGVydHlLZXlzLmluZGV4T2YocHJvcGVydHlOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWRQcm9wZXJ0eUtleXMucHVzaChwcm9wZXJ0eU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlByb3BlcnR5UmVzdWx0c1twcm9wZXJ0eU5hbWVdID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYm91bmRBdXRvKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmNoYW5nZWQgJiYgY2hhbmdlZFByb3BlcnR5S2V5cy5pbmRleE9mKHByb3BlcnR5TmFtZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWRQcm9wZXJ0eUtleXMucHVzaChwcm9wZXJ0eU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHlOYW1lIGluIHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlByb3BlcnR5UmVzdWx0c1twcm9wZXJ0eU5hbWVdID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocnVuUmVhY3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWFjdGlvbkZ1bmN0aW9ucyA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdkaWZmUmVhY3Rpb24nKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVkUmVhY3Rpb25zID0gW107XHJcbiAgICAgICAgICAgICAgICByZWFjdGlvbkZ1bmN0aW9ucy5mb3JFYWNoKCh7IHJlYWN0aW9uLCBwcm9wZXJ0eU5hbWUgfSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5Q2hhbmdlZCA9IGNoYW5nZWRQcm9wZXJ0eUtleXMuaW5kZXhPZihwcm9wZXJ0eU5hbWUpICE9PSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWFjdGlvblJ1biA9IGV4ZWN1dGVkUmVhY3Rpb25zLmluZGV4T2YocmVhY3Rpb24pICE9PSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHlDaGFuZ2VkICYmICFyZWFjdGlvblJ1bikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFjdGlvbi5jYWxsKHRoaXMsIHRoaXMuX3Byb3BlcnRpZXMsIGRpZmZQcm9wZXJ0eVJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRlZFJlYWN0aW9ucy5wdXNoKHJlYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9wcm9wZXJ0aWVzID0gZGlmZlByb3BlcnR5UmVzdWx0cztcclxuICAgICAgICAgICAgdGhpcy5fY2hhbmdlZFByb3BlcnR5S2V5cyA9IGNoYW5nZWRQcm9wZXJ0eUtleXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9pbml0aWFsUHJvcGVydGllcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BlcnR5TmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZSA9IHByb3BlcnR5TmFtZXNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5KHByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSwgYmluZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkUHJvcGVydHlLZXlzLnB1c2gocHJvcGVydHlOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VkUHJvcGVydHlLZXlzID0gY2hhbmdlZFByb3BlcnR5S2V5cztcclxuICAgICAgICAgICAgdGhpcy5fcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fY2hhbmdlZFByb3BlcnR5S2V5cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldCBjaGlsZHJlbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBfX3NldENoaWxkcmVuX18oY2hpbGRyZW4pIHtcclxuICAgICAgICBpZiAodGhpcy5fY2hpbGRyZW4ubGVuZ3RoID4gMCB8fCBjaGlsZHJlbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIF9maWx0ZXJBbmRDb252ZXJ0KG5vZGVzKSB7XHJcbiAgICAgICAgY29uc3QgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkobm9kZXMpO1xyXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkTm9kZXMgPSBBcnJheS5pc0FycmF5KG5vZGVzKSA/IG5vZGVzIDogW25vZGVzXTtcclxuICAgICAgICBjb25zdCBjb252ZXJ0ZWROb2RlcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsdGVyZWROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gZmlsdGVyZWROb2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZWROb2Rlcy5wdXNoKHRvVGV4dFZOb2RlKG5vZGUpKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc1ZOb2RlKG5vZGUpICYmIG5vZGUuZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBub2RlLmRlZmVycmVkUHJvcGVydGllc0NhbGxiYWNrKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIG5vZGUub3JpZ2luYWxQcm9wZXJ0aWVzID0gbm9kZS5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7fSwgcHJvcGVydGllcywgbm9kZS5wcm9wZXJ0aWVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNXTm9kZShub2RlKSAmJiAhaXNXaWRnZXRCYXNlQ29uc3RydWN0b3Iobm9kZS53aWRnZXRDb25zdHJ1Y3RvcikpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS53aWRnZXRDb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpZCA9IGxhenlXaWRnZXRJZE1hcC5nZXQobm9kZS53aWRnZXRDb25zdHJ1Y3Rvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGBfX2xhenlfd2lkZ2V0XyR7bGF6eVdpZGdldElkKyt9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF6eVdpZGdldElkTWFwLnNldChub2RlLndpZGdldENvbnN0cnVjdG9yLCBpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0cnkuZGVmaW5lKGlkLCBub2RlLndpZGdldENvbnN0cnVjdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS53aWRnZXRDb25zdHJ1Y3RvciA9IGlkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNMYXp5RGVmaW5lKG5vZGUud2lkZ2V0Q29uc3RydWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBsYWJlbCwgcmVnaXN0cnlJdGVtIH0gPSBub2RlLndpZGdldENvbnN0cnVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5yZWdpc3RyeS5oYXMobGFiZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0cnkuZGVmaW5lKGxhYmVsLCByZWdpc3RyeUl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBub2RlLndpZGdldENvbnN0cnVjdG9yID0gbGFiZWw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2RlLndpZGdldENvbnN0cnVjdG9yID1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdHJ5LmdldChub2RlLndpZGdldENvbnN0cnVjdG9yKSB8fCBub2RlLndpZGdldENvbnN0cnVjdG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghbm9kZS5iaW5kKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmJpbmQgPSB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnZlcnRlZE5vZGVzLnB1c2gobm9kZSk7XHJcbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuID0gdGhpcy5fZmlsdGVyQW5kQ29udmVydChub2RlLmNoaWxkcmVuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNBcnJheSA/IGNvbnZlcnRlZE5vZGVzIDogY29udmVydGVkTm9kZXNbMF07XHJcbiAgICB9XHJcbiAgICBfX3JlbmRlcl9fKCkge1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldCh0aGlzKTtcclxuICAgICAgICBpZiAoaW5zdGFuY2VEYXRhKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlRGF0YS5kaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZW5kZXIgPSB0aGlzLl9ydW5CZWZvcmVSZW5kZXJzKCk7XHJcbiAgICAgICAgY29uc3QgZE5vZGUgPSB0aGlzLl9maWx0ZXJBbmRDb252ZXJ0KHRoaXMuX3J1bkFmdGVyUmVuZGVycyhyZW5kZXIoKSkpO1xyXG4gICAgICAgIHRoaXMuX25vZGVIYW5kbGVyLmNsZWFyKCk7XHJcbiAgICAgICAgcmV0dXJuIGROb2RlO1xyXG4gICAgfVxyXG4gICAgaW52YWxpZGF0ZSgpIHtcclxuICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQodGhpcyk7XHJcbiAgICAgICAgaWYgKGluc3RhbmNlRGF0YSAmJiBpbnN0YW5jZURhdGEuaW52YWxpZGF0ZSkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZURhdGEuaW52YWxpZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbmRlcigpIHtcclxuICAgICAgICByZXR1cm4gdignZGl2Jywge30sIHRoaXMuY2hpbGRyZW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0byBhZGQgZGVjb3JhdG9ycyB0byBXaWRnZXRCYXNlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRlY29yYXRvcktleSBUaGUga2V5IG9mIHRoZSBkZWNvcmF0b3JcclxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGRlY29yYXRvclxyXG4gICAgICovXHJcbiAgICBhZGREZWNvcmF0b3IoZGVjb3JhdG9yS2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV07XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykpIHtcclxuICAgICAgICAgICAgbGV0IGRlY29yYXRvckxpc3QgPSBkZWNvcmF0b3JNYXAuZ2V0KHRoaXMuY29uc3RydWN0b3IpO1xyXG4gICAgICAgICAgICBpZiAoIWRlY29yYXRvckxpc3QpIHtcclxuICAgICAgICAgICAgICAgIGRlY29yYXRvckxpc3QgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3JNYXAuc2V0KHRoaXMuY29uc3RydWN0b3IsIGRlY29yYXRvckxpc3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY0RlY29yYXRvckxpc3QgPSBkZWNvcmF0b3JMaXN0LmdldChkZWNvcmF0b3JLZXkpO1xyXG4gICAgICAgICAgICBpZiAoIXNwZWNpZmljRGVjb3JhdG9yTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgc3BlY2lmaWNEZWNvcmF0b3JMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3JMaXN0LnNldChkZWNvcmF0b3JLZXksIHNwZWNpZmljRGVjb3JhdG9yTGlzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3BlY2lmaWNEZWNvcmF0b3JMaXN0LnB1c2goLi4udmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IHRoaXMuZ2V0RGVjb3JhdG9yKGRlY29yYXRvcktleSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlY29yYXRvckNhY2hlLnNldChkZWNvcmF0b3JLZXksIFsuLi5kZWNvcmF0b3JzLCAuLi52YWx1ZV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRnVuY3Rpb24gdG8gYnVpbGQgdGhlIGxpc3Qgb2YgZGVjb3JhdG9ycyBmcm9tIHRoZSBnbG9iYWwgZGVjb3JhdG9yIG1hcC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGVjb3JhdG9yS2V5ICBUaGUga2V5IG9mIHRoZSBkZWNvcmF0b3JcclxuICAgICAqIEByZXR1cm4gQW4gYXJyYXkgb2YgZGVjb3JhdG9yIHZhbHVlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2J1aWxkRGVjb3JhdG9yTGlzdChkZWNvcmF0b3JLZXkpIHtcclxuICAgICAgICBjb25zdCBhbGxEZWNvcmF0b3JzID0gW107XHJcbiAgICAgICAgbGV0IGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcclxuICAgICAgICB3aGlsZSAoY29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VNYXAgPSBkZWNvcmF0b3JNYXAuZ2V0KGNvbnN0cnVjdG9yKTtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlTWFwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gaW5zdGFuY2VNYXAuZ2V0KGRlY29yYXRvcktleSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjb3JhdG9ycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbERlY29yYXRvcnMudW5zaGlmdCguLi5kZWNvcmF0b3JzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjb25zdHJ1Y3Rvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhbGxEZWNvcmF0b3JzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBGdW5jdGlvbiB0byByZXRyaWV2ZSBkZWNvcmF0b3IgdmFsdWVzXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRlY29yYXRvcktleSBUaGUga2V5IG9mIHRoZSBkZWNvcmF0b3JcclxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGRlY29yYXRvciB2YWx1ZXNcclxuICAgICAqL1xyXG4gICAgZ2V0RGVjb3JhdG9yKGRlY29yYXRvcktleSkge1xyXG4gICAgICAgIGxldCBhbGxEZWNvcmF0b3JzID0gdGhpcy5fZGVjb3JhdG9yQ2FjaGUuZ2V0KGRlY29yYXRvcktleSk7XHJcbiAgICAgICAgaWYgKGFsbERlY29yYXRvcnMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYWxsRGVjb3JhdG9ycztcclxuICAgICAgICB9XHJcbiAgICAgICAgYWxsRGVjb3JhdG9ycyA9IHRoaXMuX2J1aWxkRGVjb3JhdG9yTGlzdChkZWNvcmF0b3JLZXkpO1xyXG4gICAgICAgIHRoaXMuX2RlY29yYXRvckNhY2hlLnNldChkZWNvcmF0b3JLZXksIGFsbERlY29yYXRvcnMpO1xyXG4gICAgICAgIHJldHVybiBhbGxEZWNvcmF0b3JzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kcyB1bmJvdW5kIHByb3BlcnR5IGZ1bmN0aW9ucyB0byB0aGUgc3BlY2lmaWVkIGBiaW5kYCBwcm9wZXJ0eVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwcm9wZXJ0aWVzIHByb3BlcnRpZXMgdG8gY2hlY2sgZm9yIGZ1bmN0aW9uc1xyXG4gICAgICovXHJcbiAgICBfYmluZEZ1bmN0aW9uUHJvcGVydHkocHJvcGVydHksIGJpbmQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5ID09PSAnZnVuY3Rpb24nICYmICFwcm9wZXJ0eVtub0JpbmRdICYmIGlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yKHByb3BlcnR5KSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwID0gbmV3IFdlYWtNYXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBiaW5kSW5mbyA9IHRoaXMuX2JpbmRGdW5jdGlvblByb3BlcnR5TWFwLmdldChwcm9wZXJ0eSkgfHwge307XHJcbiAgICAgICAgICAgIGxldCB7IGJvdW5kRnVuYywgc2NvcGUgfSA9IGJpbmRJbmZvO1xyXG4gICAgICAgICAgICBpZiAoYm91bmRGdW5jID09PSB1bmRlZmluZWQgfHwgc2NvcGUgIT09IGJpbmQpIHtcclxuICAgICAgICAgICAgICAgIGJvdW5kRnVuYyA9IHByb3BlcnR5LmJpbmQoYmluZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9iaW5kRnVuY3Rpb25Qcm9wZXJ0eU1hcC5zZXQocHJvcGVydHksIHsgYm91bmRGdW5jLCBzY29wZTogYmluZCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYm91bmRGdW5jO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJvcGVydHk7XHJcbiAgICB9XHJcbiAgICBnZXQgcmVnaXN0cnkoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3JlZ2lzdHJ5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVnaXN0cnkgPSBuZXcgUmVnaXN0cnlIYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3duKHRoaXMuX3JlZ2lzdHJ5KTtcclxuICAgICAgICAgICAgdGhpcy5vd24odGhpcy5fcmVnaXN0cnkub24oJ2ludmFsaWRhdGUnLCB0aGlzLl9ib3VuZEludmFsaWRhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZ2lzdHJ5O1xyXG4gICAgfVxyXG4gICAgX3J1bkJlZm9yZVByb3BlcnRpZXMocHJvcGVydGllcykge1xyXG4gICAgICAgIGNvbnN0IGJlZm9yZVByb3BlcnRpZXMgPSB0aGlzLmdldERlY29yYXRvcignYmVmb3JlUHJvcGVydGllcycpO1xyXG4gICAgICAgIGlmIChiZWZvcmVQcm9wZXJ0aWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJlZm9yZVByb3BlcnRpZXMucmVkdWNlKChwcm9wZXJ0aWVzLCBiZWZvcmVQcm9wZXJ0aWVzRnVuY3Rpb24pID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBwcm9wZXJ0aWVzLCBiZWZvcmVQcm9wZXJ0aWVzRnVuY3Rpb24uY2FsbCh0aGlzLCBwcm9wZXJ0aWVzKSk7XHJcbiAgICAgICAgICAgIH0sIE9iamVjdC5hc3NpZ24oe30sIHByb3BlcnRpZXMpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByb3BlcnRpZXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJ1biBhbGwgcmVnaXN0ZXJlZCBiZWZvcmUgcmVuZGVycyBhbmQgcmV0dXJuIHRoZSB1cGRhdGVkIHJlbmRlciBtZXRob2RcclxuICAgICAqL1xyXG4gICAgX3J1bkJlZm9yZVJlbmRlcnMoKSB7XHJcbiAgICAgICAgY29uc3QgYmVmb3JlUmVuZGVycyA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdiZWZvcmVSZW5kZXInKTtcclxuICAgICAgICBpZiAoYmVmb3JlUmVuZGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiZWZvcmVSZW5kZXJzLnJlZHVjZSgocmVuZGVyLCBiZWZvcmVSZW5kZXJGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlZFJlbmRlciA9IGJlZm9yZVJlbmRlckZ1bmN0aW9uLmNhbGwodGhpcywgcmVuZGVyLCB0aGlzLl9wcm9wZXJ0aWVzLCB0aGlzLl9jaGlsZHJlbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVwZGF0ZWRSZW5kZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1JlbmRlciBmdW5jdGlvbiBub3QgcmV0dXJuZWQgZnJvbSBiZWZvcmVSZW5kZXIsIHVzaW5nIHByZXZpb3VzIHJlbmRlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZW5kZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlZFJlbmRlcjtcclxuICAgICAgICAgICAgfSwgdGhpcy5fYm91bmRSZW5kZXJGdW5jKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvdW5kUmVuZGVyRnVuYztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUnVuIGFsbCByZWdpc3RlcmVkIGFmdGVyIHJlbmRlcnMgYW5kIHJldHVybiB0aGUgZGVjb3JhdGVkIEROb2Rlc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkTm9kZSBUaGUgRE5vZGVzIHRvIHJ1biB0aHJvdWdoIHRoZSBhZnRlciByZW5kZXJzXHJcbiAgICAgKi9cclxuICAgIF9ydW5BZnRlclJlbmRlcnMoZE5vZGUpIHtcclxuICAgICAgICBjb25zdCBhZnRlclJlbmRlcnMgPSB0aGlzLmdldERlY29yYXRvcignYWZ0ZXJSZW5kZXInKTtcclxuICAgICAgICBpZiAoYWZ0ZXJSZW5kZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZE5vZGUgPSBhZnRlclJlbmRlcnMucmVkdWNlKChkTm9kZSwgYWZ0ZXJSZW5kZXJGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFmdGVyUmVuZGVyRnVuY3Rpb24uY2FsbCh0aGlzLCBkTm9kZSk7XHJcbiAgICAgICAgICAgIH0sIGROb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX21ldGFNYXAgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9tZXRhTWFwLmZvckVhY2goKG1ldGEpID0+IHtcclxuICAgICAgICAgICAgICAgIG1ldGEuYWZ0ZXJSZW5kZXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkTm9kZTtcclxuICAgIH1cclxuICAgIF9ydW5BZnRlckNvbnN0cnVjdG9ycygpIHtcclxuICAgICAgICBjb25zdCBhZnRlckNvbnN0cnVjdG9ycyA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdhZnRlckNvbnN0cnVjdG9yJyk7XHJcbiAgICAgICAgaWYgKGFmdGVyQ29uc3RydWN0b3JzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgYWZ0ZXJDb25zdHJ1Y3RvcnMuZm9yRWFjaCgoYWZ0ZXJDb25zdHJ1Y3RvcikgPT4gYWZ0ZXJDb25zdHJ1Y3Rvci5jYWxsKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBvd24oaGFuZGxlKSB7XHJcbiAgICAgICAgdGhpcy5faGFuZGxlcy5wdXNoKGhhbmRsZSk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHdoaWxlICh0aGlzLl9oYW5kbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gdGhpcy5faGFuZGxlcy5wb3AoKTtcclxuICAgICAgICAgICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICogc3RhdGljIGlkZW50aWZpZXJcclxuICovXHJcbldpZGdldEJhc2UuX3R5cGUgPSBXSURHRVRfQkFTRV9UWVBFO1xyXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRCYXNlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1XaWRnZXRCYXNlLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZS5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJsZXQgYnJvd3NlclNwZWNpZmljVHJhbnNpdGlvbkVuZEV2ZW50TmFtZSA9ICcnO1xubGV0IGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSA9ICcnO1xuZnVuY3Rpb24gZGV0ZXJtaW5lQnJvd3NlclN0eWxlTmFtZXMoZWxlbWVudCkge1xuICAgIGlmICgnV2Via2l0VHJhbnNpdGlvbicgaW4gZWxlbWVudC5zdHlsZSkge1xuICAgICAgICBicm93c2VyU3BlY2lmaWNUcmFuc2l0aW9uRW5kRXZlbnROYW1lID0gJ3dlYmtpdFRyYW5zaXRpb25FbmQnO1xuICAgICAgICBicm93c2VyU3BlY2lmaWNBbmltYXRpb25FbmRFdmVudE5hbWUgPSAnd2Via2l0QW5pbWF0aW9uRW5kJztcbiAgICB9XG4gICAgZWxzZSBpZiAoJ3RyYW5zaXRpb24nIGluIGVsZW1lbnQuc3R5bGUgfHwgJ01velRyYW5zaXRpb24nIGluIGVsZW1lbnQuc3R5bGUpIHtcbiAgICAgICAgYnJvd3NlclNwZWNpZmljVHJhbnNpdGlvbkVuZEV2ZW50TmFtZSA9ICd0cmFuc2l0aW9uZW5kJztcbiAgICAgICAgYnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lID0gJ2FuaW1hdGlvbmVuZCc7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdXIgYnJvd3NlciBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfVxufVxuZnVuY3Rpb24gaW5pdGlhbGl6ZShlbGVtZW50KSB7XG4gICAgaWYgKGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSA9PT0gJycpIHtcbiAgICAgICAgZGV0ZXJtaW5lQnJvd3NlclN0eWxlTmFtZXMoZWxlbWVudCk7XG4gICAgfVxufVxuZnVuY3Rpb24gcnVuQW5kQ2xlYW5VcChlbGVtZW50LCBzdGFydEFuaW1hdGlvbiwgZmluaXNoQW5pbWF0aW9uKSB7XG4gICAgaW5pdGlhbGl6ZShlbGVtZW50KTtcbiAgICBsZXQgZmluaXNoZWQgPSBmYWxzZTtcbiAgICBsZXQgdHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFmaW5pc2hlZCkge1xuICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGJyb3dzZXJTcGVjaWZpY1RyYW5zaXRpb25FbmRFdmVudE5hbWUsIHRyYW5zaXRpb25FbmQpO1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGJyb3dzZXJTcGVjaWZpY0FuaW1hdGlvbkVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZCk7XG4gICAgICAgICAgICBmaW5pc2hBbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc3RhcnRBbmltYXRpb24oKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYnJvd3NlclNwZWNpZmljQW5pbWF0aW9uRW5kRXZlbnROYW1lLCB0cmFuc2l0aW9uRW5kKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoYnJvd3NlclNwZWNpZmljVHJhbnNpdGlvbkVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZCk7XG59XG5mdW5jdGlvbiBleGl0KG5vZGUsIHByb3BlcnRpZXMsIGV4aXRBbmltYXRpb24sIHJlbW92ZU5vZGUpIHtcbiAgICBjb25zdCBhY3RpdmVDbGFzcyA9IHByb3BlcnRpZXMuZXhpdEFuaW1hdGlvbkFjdGl2ZSB8fCBgJHtleGl0QW5pbWF0aW9ufS1hY3RpdmVgO1xuICAgIHJ1bkFuZENsZWFuVXAobm9kZSwgKCkgPT4ge1xuICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoZXhpdEFuaW1hdGlvbik7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoYWN0aXZlQ2xhc3MpO1xuICAgICAgICB9KTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAgIHJlbW92ZU5vZGUoKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGVudGVyKG5vZGUsIHByb3BlcnRpZXMsIGVudGVyQW5pbWF0aW9uKSB7XG4gICAgY29uc3QgYWN0aXZlQ2xhc3MgPSBwcm9wZXJ0aWVzLmVudGVyQW5pbWF0aW9uQWN0aXZlIHx8IGAke2VudGVyQW5pbWF0aW9ufS1hY3RpdmVgO1xuICAgIHJ1bkFuZENsZWFuVXAobm9kZSwgKCkgPT4ge1xuICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoZW50ZXJBbmltYXRpb24pO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKGFjdGl2ZUNsYXNzKTtcbiAgICAgICAgfSk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgICBub2RlLmNsYXNzTGlzdC5yZW1vdmUoZW50ZXJBbmltYXRpb24pO1xuICAgICAgICBub2RlLmNsYXNzTGlzdC5yZW1vdmUoYWN0aXZlQ2xhc3MpO1xuICAgIH0pO1xufVxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGVudGVyLFxuICAgIGV4aXRcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jc3NUcmFuc2l0aW9ucy5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2FuaW1hdGlvbnMvY3NzVHJhbnNpdGlvbnMubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvYW5pbWF0aW9ucy9jc3NUcmFuc2l0aW9ucy5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0ICogYXMgdHNsaWJfMSBmcm9tIFwidHNsaWJcIjtcbi8qKlxuICogVGhlIGlkZW50aWZpZXIgZm9yIGEgV05vZGUgdHlwZVxuICovXG5leHBvcnQgY29uc3QgV05PREUgPSAnX19XTk9ERV9UWVBFJztcbi8qKlxuICogVGhlIGlkZW50aWZpZXIgZm9yIGEgVk5vZGUgdHlwZVxuICovXG5leHBvcnQgY29uc3QgVk5PREUgPSAnX19WTk9ERV9UWVBFJztcbi8qKlxuICogVGhlIGlkZW50aWZpZXIgZm9yIGEgVk5vZGUgdHlwZSBjcmVhdGVkIHVzaW5nIGRvbSgpXG4gKi9cbmV4cG9ydCBjb25zdCBET01WTk9ERSA9ICdfX0RPTVZOT0RFX1RZUEUnO1xuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgdGhlIGBETm9kZWAgaXMgYSBgV05vZGVgIHVzaW5nIHRoZSBgdHlwZWAgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzV05vZGUoY2hpbGQpIHtcbiAgICByZXR1cm4gQm9vbGVhbihjaGlsZCAmJiB0eXBlb2YgY2hpbGQgIT09ICdzdHJpbmcnICYmIGNoaWxkLnR5cGUgPT09IFdOT0RFKTtcbn1cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGlmIHRoZSBgRE5vZGVgIGlzIGEgYFZOb2RlYCB1c2luZyB0aGUgYHR5cGVgIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZOb2RlKGNoaWxkKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oY2hpbGQgJiYgdHlwZW9mIGNoaWxkICE9PSAnc3RyaW5nJyAmJiAoY2hpbGQudHlwZSA9PT0gVk5PREUgfHwgY2hpbGQudHlwZSA9PT0gRE9NVk5PREUpKTtcbn1cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGlmIHRoZSBgRE5vZGVgIGlzIGEgYFZOb2RlYCBjcmVhdGVkIHdpdGggYGRvbSgpYCB1c2luZyB0aGUgYHR5cGVgIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RvbVZOb2RlKGNoaWxkKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oY2hpbGQgJiYgdHlwZW9mIGNoaWxkICE9PSAnc3RyaW5nJyAmJiBjaGlsZC50eXBlID09PSBET01WTk9ERSk7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNFbGVtZW50Tm9kZSh2YWx1ZSkge1xuICAgIHJldHVybiAhIXZhbHVlLnRhZ05hbWU7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVjb3JhdGUoZE5vZGVzLCBvcHRpb25zT3JNb2RpZmllciwgcHJlZGljYXRlKSB7XG4gICAgbGV0IHNoYWxsb3cgPSBmYWxzZTtcbiAgICBsZXQgbW9kaWZpZXI7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zT3JNb2RpZmllciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtb2RpZmllciA9IG9wdGlvbnNPck1vZGlmaWVyO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbW9kaWZpZXIgPSBvcHRpb25zT3JNb2RpZmllci5tb2RpZmllcjtcbiAgICAgICAgcHJlZGljYXRlID0gb3B0aW9uc09yTW9kaWZpZXIucHJlZGljYXRlO1xuICAgICAgICBzaGFsbG93ID0gb3B0aW9uc09yTW9kaWZpZXIuc2hhbGxvdyB8fCBmYWxzZTtcbiAgICB9XG4gICAgbGV0IG5vZGVzID0gQXJyYXkuaXNBcnJheShkTm9kZXMpID8gWy4uLmROb2Rlc10gOiBbZE5vZGVzXTtcbiAgICBmdW5jdGlvbiBicmVha2VyKCkge1xuICAgICAgICBub2RlcyA9IFtdO1xuICAgIH1cbiAgICB3aGlsZSAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlcy5zaGlmdCgpO1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgaWYgKCFzaGFsbG93ICYmIChpc1dOb2RlKG5vZGUpIHx8IGlzVk5vZGUobm9kZSkpICYmIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBub2RlcyA9IFsuLi5ub2RlcywgLi4ubm9kZS5jaGlsZHJlbl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXByZWRpY2F0ZSB8fCBwcmVkaWNhdGUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllcihub2RlLCBicmVha2VyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZE5vZGVzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHcod2lkZ2V0Q29uc3RydWN0b3JPck5vZGUsIHByb3BlcnRpZXMsIGNoaWxkcmVuKSB7XG4gICAgaWYgKGlzV05vZGUod2lkZ2V0Q29uc3RydWN0b3JPck5vZGUpKSB7XG4gICAgICAgIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB3aWRnZXRDb25zdHJ1Y3Rvck9yTm9kZS5wcm9wZXJ0aWVzLCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbiA/IGNoaWxkcmVuIDogd2lkZ2V0Q29uc3RydWN0b3JPck5vZGUuY2hpbGRyZW47XG4gICAgICAgIHdpZGdldENvbnN0cnVjdG9yT3JOb2RlID0gd2lkZ2V0Q29uc3RydWN0b3JPck5vZGUud2lkZ2V0Q29uc3RydWN0b3I7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbiB8fCBbXSxcbiAgICAgICAgd2lkZ2V0Q29uc3RydWN0b3I6IHdpZGdldENvbnN0cnVjdG9yT3JOb2RlLFxuICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICB0eXBlOiBXTk9ERVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gdih0YWcsIHByb3BlcnRpZXNPckNoaWxkcmVuID0ge30sIGNoaWxkcmVuID0gdW5kZWZpbmVkKSB7XG4gICAgbGV0IHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzT3JDaGlsZHJlbjtcbiAgICBsZXQgZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2s7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJvcGVydGllc09yQ2hpbGRyZW4pKSB7XG4gICAgICAgIGNoaWxkcmVuID0gcHJvcGVydGllc09yQ2hpbGRyZW47XG4gICAgICAgIHByb3BlcnRpZXMgPSB7fTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZmVycmVkUHJvcGVydGllc0NhbGxiYWNrID0gcHJvcGVydGllcztcbiAgICAgICAgcHJvcGVydGllcyA9IHt9O1xuICAgIH1cbiAgICBpZiAoaXNWTm9kZSh0YWcpKSB7XG4gICAgICAgIGxldCB7IGNsYXNzZXMgPSBbXSwgc3R5bGVzID0ge30gfSA9IHByb3BlcnRpZXMsIG5ld1Byb3BlcnRpZXMgPSB0c2xpYl8xLl9fcmVzdChwcm9wZXJ0aWVzLCBbXCJjbGFzc2VzXCIsIFwic3R5bGVzXCJdKTtcbiAgICAgICAgbGV0IF9hID0gdGFnLnByb3BlcnRpZXMsIHsgY2xhc3Nlczogbm9kZUNsYXNzZXMgPSBbXSwgc3R5bGVzOiBub2RlU3R5bGVzID0ge30gfSA9IF9hLCBub2RlUHJvcGVydGllcyA9IHRzbGliXzEuX19yZXN0KF9hLCBbXCJjbGFzc2VzXCIsIFwic3R5bGVzXCJdKTtcbiAgICAgICAgbm9kZUNsYXNzZXMgPSBBcnJheS5pc0FycmF5KG5vZGVDbGFzc2VzKSA/IG5vZGVDbGFzc2VzIDogW25vZGVDbGFzc2VzXTtcbiAgICAgICAgY2xhc3NlcyA9IEFycmF5LmlzQXJyYXkoY2xhc3NlcykgPyBjbGFzc2VzIDogW2NsYXNzZXNdO1xuICAgICAgICBzdHlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCBub2RlU3R5bGVzLCBzdHlsZXMpO1xuICAgICAgICBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7fSwgbm9kZVByb3BlcnRpZXMsIG5ld1Byb3BlcnRpZXMsIHsgY2xhc3NlczogWy4uLm5vZGVDbGFzc2VzLCAuLi5jbGFzc2VzXSwgc3R5bGVzIH0pO1xuICAgICAgICBjaGlsZHJlbiA9IGNoaWxkcmVuID8gY2hpbGRyZW4gOiB0YWcuY2hpbGRyZW47XG4gICAgICAgIHRhZyA9IHRhZy50YWc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHRhZyxcbiAgICAgICAgZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2ssXG4gICAgICAgIG9yaWdpbmFsUHJvcGVydGllczoge30sXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICB0eXBlOiBWTk9ERVxuICAgIH07XG59XG4vKipcbiAqIENyZWF0ZSBhIFZOb2RlIGZvciBhbiBleGlzdGluZyBET00gTm9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvbSh7IG5vZGUsIGF0dHJzID0ge30sIHByb3BzID0ge30sIG9uID0ge30sIGRpZmZUeXBlID0gJ25vbmUnLCBvbkF0dGFjaCB9LCBjaGlsZHJlbikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRhZzogaXNFbGVtZW50Tm9kZShub2RlKSA/IG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpIDogJycsXG4gICAgICAgIHByb3BlcnRpZXM6IHByb3BzLFxuICAgICAgICBhdHRyaWJ1dGVzOiBhdHRycyxcbiAgICAgICAgZXZlbnRzOiBvbixcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgIHR5cGU6IERPTVZOT0RFLFxuICAgICAgICBkb21Ob2RlOiBub2RlLFxuICAgICAgICB0ZXh0OiBpc0VsZW1lbnROb2RlKG5vZGUpID8gdW5kZWZpbmVkIDogbm9kZS5kYXRhLFxuICAgICAgICBkaWZmVHlwZSxcbiAgICAgICAgb25BdHRhY2hcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZC5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2QubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgaGFuZGxlRGVjb3JhdG9yIH0gZnJvbSAnLi9oYW5kbGVEZWNvcmF0b3InO1xuaW1wb3J0IHsgYmVmb3JlUHJvcGVydGllcyB9IGZyb20gJy4vYmVmb3JlUHJvcGVydGllcyc7XG5leHBvcnQgZnVuY3Rpb24gYWx3YXlzUmVuZGVyKCkge1xuICAgIHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcbiAgICAgICAgYmVmb3JlUHJvcGVydGllcyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgfSkodGFyZ2V0KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IGFsd2F5c1JlbmRlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFsd2F5c1JlbmRlci5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYWx3YXlzUmVuZGVyLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvYWx3YXlzUmVuZGVyLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlUHJvcGVydGllcyhtZXRob2QpIHtcbiAgICByZXR1cm4gaGFuZGxlRGVjb3JhdG9yKCh0YXJnZXQsIHByb3BlcnR5S2V5KSA9PiB7XG4gICAgICAgIHRhcmdldC5hZGREZWNvcmF0b3IoJ2JlZm9yZVByb3BlcnRpZXMnLCBwcm9wZXJ0eUtleSA/IHRhcmdldFtwcm9wZXJ0eUtleV0gOiBtZXRob2QpO1xuICAgIH0pO1xufVxuZXhwb3J0IGRlZmF1bHQgYmVmb3JlUHJvcGVydGllcztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJlZm9yZVByb3BlcnRpZXMubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2JlZm9yZVByb3BlcnRpZXMubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGVjb3JhdG9ycy9iZWZvcmVQcm9wZXJ0aWVzLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBoYW5kbGVEZWNvcmF0b3IgfSBmcm9tICcuL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBhdXRvIH0gZnJvbSAnLi8uLi9kaWZmJztcbi8qKlxuICogRGVjb3JhdG9yIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVnaXN0ZXIgYSBmdW5jdGlvbiBhcyBhIHNwZWNpZmljIHByb3BlcnR5IGRpZmZcbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlOYW1lICBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgb2Ygd2hpY2ggdGhlIGRpZmYgZnVuY3Rpb24gaXMgYXBwbGllZFxuICogQHBhcmFtIGRpZmZUeXBlICAgICAgVGhlIGRpZmYgdHlwZSwgZGVmYXVsdCBpcyBEaWZmVHlwZS5BVVRPLlxuICogQHBhcmFtIGRpZmZGdW5jdGlvbiAgQSBkaWZmIGZ1bmN0aW9uIHRvIHJ1biBpZiBkaWZmVHlwZSBpZiBEaWZmVHlwZS5DVVNUT01cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZQcm9wZXJ0eShwcm9wZXJ0eU5hbWUsIGRpZmZGdW5jdGlvbiA9IGF1dG8sIHJlYWN0aW9uRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gaGFuZGxlRGVjb3JhdG9yKCh0YXJnZXQsIHByb3BlcnR5S2V5KSA9PiB7XG4gICAgICAgIHRhcmdldC5hZGREZWNvcmF0b3IoYGRpZmZQcm9wZXJ0eToke3Byb3BlcnR5TmFtZX1gLCBkaWZmRnVuY3Rpb24uYmluZChudWxsKSk7XG4gICAgICAgIHRhcmdldC5hZGREZWNvcmF0b3IoJ3JlZ2lzdGVyZWREaWZmUHJvcGVydHknLCBwcm9wZXJ0eU5hbWUpO1xuICAgICAgICBpZiAocmVhY3Rpb25GdW5jdGlvbiB8fCBwcm9wZXJ0eUtleSkge1xuICAgICAgICAgICAgdGFyZ2V0LmFkZERlY29yYXRvcignZGlmZlJlYWN0aW9uJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZSxcbiAgICAgICAgICAgICAgICByZWFjdGlvbjogcHJvcGVydHlLZXkgPyB0YXJnZXRbcHJvcGVydHlLZXldIDogcmVhY3Rpb25GdW5jdGlvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IGRpZmZQcm9wZXJ0eTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpZmZQcm9wZXJ0eS5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvZGlmZlByb3BlcnR5Lm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvZGlmZlByb3BlcnR5Lm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvKipcbiAqIEdlbmVyaWMgZGVjb3JhdG9yIGhhbmRsZXIgdG8gdGFrZSBjYXJlIG9mIHdoZXRoZXIgb3Igbm90IHRoZSBkZWNvcmF0b3Igd2FzIGNhbGxlZCBhdCB0aGUgY2xhc3MgbGV2ZWxcbiAqIG9yIHRoZSBtZXRob2QgbGV2ZWwuXG4gKlxuICogQHBhcmFtIGhhbmRsZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZURlY29yYXRvcihoYW5kbGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBoYW5kbGVyKHRhcmdldC5wcm90b3R5cGUsIHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVyKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydCBkZWZhdWx0IGhhbmRsZURlY29yYXRvcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhhbmRsZURlY29yYXRvci5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvaGFuZGxlRGVjb3JhdG9yLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RlY29yYXRvcnMvaGFuZGxlRGVjb3JhdG9yLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgV2Vha01hcCBmcm9tICcuLi8uLi9zaGltL1dlYWtNYXAnO1xuaW1wb3J0IHsgaGFuZGxlRGVjb3JhdG9yIH0gZnJvbSAnLi9oYW5kbGVEZWNvcmF0b3InO1xuaW1wb3J0IHsgYmVmb3JlUHJvcGVydGllcyB9IGZyb20gJy4vYmVmb3JlUHJvcGVydGllcyc7XG4vKipcbiAqIE1hcCBvZiBpbnN0YW5jZXMgYWdhaW5zdCByZWdpc3RlcmVkIGluamVjdG9ycy5cbiAqL1xuY29uc3QgcmVnaXN0ZXJlZEluamVjdG9yc01hcCA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiAqIERlY29yYXRvciByZXRyaWV2ZXMgYW4gaW5qZWN0b3IgZnJvbSBhbiBhdmFpbGFibGUgcmVnaXN0cnkgdXNpbmcgdGhlIG5hbWUgYW5kXG4gKiBjYWxscyB0aGUgYGdldFByb3BlcnRpZXNgIGZ1bmN0aW9uIHdpdGggdGhlIHBheWxvYWQgZnJvbSB0aGUgaW5qZWN0b3JcbiAqIGFuZCBjdXJyZW50IHByb3BlcnRpZXMgd2l0aCB0aGUgdGhlIGluamVjdGVkIHByb3BlcnRpZXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIEluamVjdENvbmZpZyB0aGUgaW5qZWN0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluamVjdCh7IG5hbWUsIGdldFByb3BlcnRpZXMgfSkge1xuICAgIHJldHVybiBoYW5kbGVEZWNvcmF0b3IoKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcbiAgICAgICAgYmVmb3JlUHJvcGVydGllcyhmdW5jdGlvbiAocHJvcGVydGllcykge1xuICAgICAgICAgICAgY29uc3QgaW5qZWN0b3JJdGVtID0gdGhpcy5yZWdpc3RyeS5nZXRJbmplY3RvcihuYW1lKTtcbiAgICAgICAgICAgIGlmIChpbmplY3Rvckl0ZW0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGluamVjdG9yLCBpbnZhbGlkYXRvciB9ID0gaW5qZWN0b3JJdGVtO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2lzdGVyZWRJbmplY3RvcnMgPSByZWdpc3RlcmVkSW5qZWN0b3JzTWFwLmdldCh0aGlzKSB8fCBbXTtcbiAgICAgICAgICAgICAgICBpZiAocmVnaXN0ZXJlZEluamVjdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaXN0ZXJlZEluamVjdG9yc01hcC5zZXQodGhpcywgcmVnaXN0ZXJlZEluamVjdG9ycyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyZWdpc3RlcmVkSW5qZWN0b3JzLmluZGV4T2YoaW5qZWN0b3JJdGVtKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vd24oaW52YWxpZGF0b3Iub24oJ2ludmFsaWRhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICByZWdpc3RlcmVkSW5qZWN0b3JzLnB1c2goaW5qZWN0b3JJdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFByb3BlcnRpZXMoaW5qZWN0b3IoKSwgcHJvcGVydGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKHRhcmdldCk7XG4gICAgfSk7XG59XG5leHBvcnQgZGVmYXVsdCBpbmplY3Q7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmplY3QubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2luamVjdC5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2luamVjdC5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgV0lER0VUX0JBU0VfVFlQRSB9IGZyb20gJy4vUmVnaXN0cnknO1xuZnVuY3Rpb24gaXNPYmplY3RPckFycmF5KHZhbHVlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nIHx8IEFycmF5LmlzQXJyYXkodmFsdWUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFsd2F5cyhwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNoYW5nZWQ6IHRydWUsXG4gICAgICAgIHZhbHVlOiBuZXdQcm9wZXJ0eVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gaWdub3JlKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2hhbmdlZDogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBuZXdQcm9wZXJ0eVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gcmVmZXJlbmNlKHByZXZpb3VzUHJvcGVydHksIG5ld1Byb3BlcnR5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2hhbmdlZDogcHJldmlvdXNQcm9wZXJ0eSAhPT0gbmV3UHJvcGVydHksXG4gICAgICAgIHZhbHVlOiBuZXdQcm9wZXJ0eVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gc2hhbGxvdyhwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSkge1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgdmFsaWRPbGRQcm9wZXJ0eSA9IHByZXZpb3VzUHJvcGVydHkgJiYgaXNPYmplY3RPckFycmF5KHByZXZpb3VzUHJvcGVydHkpO1xuICAgIGNvbnN0IHZhbGlkTmV3UHJvcGVydHkgPSBuZXdQcm9wZXJ0eSAmJiBpc09iamVjdE9yQXJyYXkobmV3UHJvcGVydHkpO1xuICAgIGlmICghdmFsaWRPbGRQcm9wZXJ0eSB8fCAhdmFsaWROZXdQcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hhbmdlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBuZXdQcm9wZXJ0eVxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBwcmV2aW91c0tleXMgPSBPYmplY3Qua2V5cyhwcmV2aW91c1Byb3BlcnR5KTtcbiAgICBjb25zdCBuZXdLZXlzID0gT2JqZWN0LmtleXMobmV3UHJvcGVydHkpO1xuICAgIGlmIChwcmV2aW91c0tleXMubGVuZ3RoICE9PSBuZXdLZXlzLmxlbmd0aCkge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNoYW5nZWQgPSBuZXdLZXlzLnNvbWUoKGtleSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ld1Byb3BlcnR5W2tleV0gIT09IHByZXZpb3VzUHJvcGVydHlba2V5XTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGNoYW5nZWQsXG4gICAgICAgIHZhbHVlOiBuZXdQcm9wZXJ0eVxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gYXV0byhwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSkge1xuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKHR5cGVvZiBuZXdQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAobmV3UHJvcGVydHkuX3R5cGUgPT09IFdJREdFVF9CQVNFX1RZUEUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlZmVyZW5jZShwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBpZ25vcmUocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzT2JqZWN0T3JBcnJheShuZXdQcm9wZXJ0eSkpIHtcbiAgICAgICAgcmVzdWx0ID0gc2hhbGxvdyhwcmV2aW91c1Byb3BlcnR5LCBuZXdQcm9wZXJ0eSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXN1bHQgPSByZWZlcmVuY2UocHJldmlvdXNQcm9wZXJ0eSwgbmV3UHJvcGVydHkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlmZi5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2RpZmYubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZGlmZi5tanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiaW1wb3J0IHsgRGVzdHJveWFibGUgfSBmcm9tICcuLi8uLi9jb3JlL0Rlc3Ryb3lhYmxlJztcclxuaW1wb3J0IFNldCBmcm9tICcuLi8uLi9zaGltL1NldCc7XHJcbmV4cG9ydCBjbGFzcyBCYXNlIGV4dGVuZHMgRGVzdHJveWFibGUge1xyXG4gICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5fcmVxdWVzdGVkTm9kZUtleXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSA9IHByb3BlcnRpZXMuaW52YWxpZGF0ZTtcclxuICAgICAgICB0aGlzLm5vZGVIYW5kbGVyID0gcHJvcGVydGllcy5ub2RlSGFuZGxlcjtcclxuICAgICAgICBpZiAocHJvcGVydGllcy5iaW5kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JpbmQgPSBwcm9wZXJ0aWVzLmJpbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaGFzKGtleSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVIYW5kbGVyLmhhcyhrZXkpO1xyXG4gICAgfVxyXG4gICAgZ2V0Tm9kZShrZXkpIHtcclxuICAgICAgICBjb25zdCBzdHJpbmdLZXkgPSBgJHtrZXl9YDtcclxuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5ub2RlSGFuZGxlci5nZXQoc3RyaW5nS2V5KTtcclxuICAgICAgICBpZiAoIW5vZGUgJiYgIXRoaXMuX3JlcXVlc3RlZE5vZGVLZXlzLmhhcyhzdHJpbmdLZXkpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IHRoaXMubm9kZUhhbmRsZXIub24oc3RyaW5nS2V5LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVxdWVzdGVkTm9kZUtleXMuZGVsZXRlKHN0cmluZ0tleSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMub3duKGhhbmRsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RlZE5vZGVLZXlzLmFkZChzdHJpbmdLZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuICAgIGludmFsaWRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgYWZ0ZXJSZW5kZXIoKSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBieSBkZWZhdWx0LlxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IEJhc2U7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUJhc2UubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL0Jhc2UubWpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWV0YS9CYXNlLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgeyBCYXNlIH0gZnJvbSAnLi9CYXNlJztcclxuaW1wb3J0IE1hcCBmcm9tICcuLi8uLi9zaGltL01hcCc7XHJcbmltcG9ydCBnbG9iYWwgZnJvbSAnLi4vLi4vc2hpbS9nbG9iYWwnO1xyXG5leHBvcnQgY2xhc3MgV2ViQW5pbWF0aW9ucyBleHRlbmRzIEJhc2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB0aGlzLl9hbmltYXRpb25NYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBfY3JlYXRlUGxheWVyKG5vZGUsIHByb3BlcnRpZXMpIHtcclxuICAgICAgICBjb25zdCB7IGVmZmVjdHMsIHRpbWluZyA9IHt9IH0gPSBwcm9wZXJ0aWVzO1xyXG4gICAgICAgIGNvbnN0IGZ4ID0gdHlwZW9mIGVmZmVjdHMgPT09ICdmdW5jdGlvbicgPyBlZmZlY3RzKCkgOiBlZmZlY3RzO1xyXG4gICAgICAgIGNvbnN0IGtleWZyYW1lRWZmZWN0ID0gbmV3IGdsb2JhbC5LZXlmcmFtZUVmZmVjdChub2RlLCBmeCwgdGltaW5nKTtcclxuICAgICAgICByZXR1cm4gbmV3IGdsb2JhbC5BbmltYXRpb24oa2V5ZnJhbWVFZmZlY3QsIGdsb2JhbC5kb2N1bWVudC50aW1lbGluZSk7XHJcbiAgICB9XHJcbiAgICBfdXBkYXRlUGxheWVyKHBsYXllciwgY29udHJvbHMpIHtcclxuICAgICAgICBjb25zdCB7IHBsYXksIHJldmVyc2UsIGNhbmNlbCwgZmluaXNoLCBvbkZpbmlzaCwgb25DYW5jZWwsIHBsYXliYWNrUmF0ZSwgc3RhcnRUaW1lLCBjdXJyZW50VGltZSB9ID0gY29udHJvbHM7XHJcbiAgICAgICAgaWYgKHBsYXliYWNrUmF0ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5wbGF5YmFja1JhdGUgPSBwbGF5YmFja1JhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXZlcnNlKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjYW5jZWwpIHtcclxuICAgICAgICAgICAgcGxheWVyLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmluaXNoKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5maW5pc2goKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0YXJ0VGltZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zdGFydFRpbWUgPSBzdGFydFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjdXJyZW50VGltZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5jdXJyZW50VGltZSA9IGN1cnJlbnRUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGxheSkge1xyXG4gICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbkZpbmlzaCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIub25maW5pc2ggPSBvbkZpbmlzaC5iaW5kKHRoaXMuX2JpbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob25DYW5jZWwpIHtcclxuICAgICAgICAgICAgcGxheWVyLm9uY2FuY2VsID0gb25DYW5jZWwuYmluZCh0aGlzLl9iaW5kKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhbmltYXRlKGtleSwgYW5pbWF0ZVByb3BlcnRpZXMpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXROb2RlKGtleSk7XHJcbiAgICAgICAgaWYgKG5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFuaW1hdGVQcm9wZXJ0aWVzKSkge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0ZVByb3BlcnRpZXMgPSBbYW5pbWF0ZVByb3BlcnRpZXNdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFuaW1hdGVQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnRpZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMgPSB0eXBlb2YgcHJvcGVydGllcyA9PT0gJ2Z1bmN0aW9uJyA/IHByb3BlcnRpZXMoKSA6IHByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgaWQgfSA9IHByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9hbmltYXRpb25NYXAuaGFzKGlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25NYXAuc2V0KGlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXI6IHRoaXMuX2NyZWF0ZVBsYXllcihub2RlLCBwcm9wZXJ0aWVzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQ6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbk1hcC5nZXQoaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgY29udHJvbHMgPSB7fSB9ID0gcHJvcGVydGllcztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBsYXllcihhbmltYXRpb24ucGxheWVyLCBjb250cm9scyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbk1hcC5zZXQoaWQsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcjogYW5pbWF0aW9uLnBsYXllcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQ6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQoaWQpIHtcclxuICAgICAgICBjb25zdCBhbmltYXRpb24gPSB0aGlzLl9hbmltYXRpb25NYXAuZ2V0KGlkKTtcclxuICAgICAgICBpZiAoYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgY3VycmVudFRpbWUsIHBsYXlTdGF0ZSwgcGxheWJhY2tSYXRlLCBzdGFydFRpbWUgfSA9IGFuaW1hdGlvbi5wbGF5ZXI7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VGltZTogY3VycmVudFRpbWUgfHwgMCxcclxuICAgICAgICAgICAgICAgIHBsYXlTdGF0ZSxcclxuICAgICAgICAgICAgICAgIHBsYXliYWNrUmF0ZSxcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lIHx8IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZnRlclJlbmRlcigpIHtcclxuICAgICAgICB0aGlzLl9hbmltYXRpb25NYXAuZm9yRWFjaCgoYW5pbWF0aW9uLCBrZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFhbmltYXRpb24udXNlZCkge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uLnBsYXllci5jYW5jZWwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbk1hcC5kZWxldGUoa2V5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhbmltYXRpb24udXNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFdlYkFuaW1hdGlvbnM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdlYkFuaW1hdGlvbi5tanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvV2ViQW5pbWF0aW9uLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvV2ViQW5pbWF0aW9uLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgKiBhcyB0c2xpYl8xIGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgSW5qZWN0b3IgfSBmcm9tICcuLy4uL0luamVjdG9yJztcbmltcG9ydCB7IGluamVjdCB9IGZyb20gJy4vLi4vZGVjb3JhdG9ycy9pbmplY3QnO1xuaW1wb3J0IHsgaGFuZGxlRGVjb3JhdG9yIH0gZnJvbSAnLi8uLi9kZWNvcmF0b3JzL2hhbmRsZURlY29yYXRvcic7XG5pbXBvcnQgeyBkaWZmUHJvcGVydHkgfSBmcm9tICcuLy4uL2RlY29yYXRvcnMvZGlmZlByb3BlcnR5JztcbmltcG9ydCB7IHNoYWxsb3cgfSBmcm9tICcuLy4uL2RpZmYnO1xuY29uc3QgVEhFTUVfS0VZID0gJyBfa2V5JztcbmV4cG9ydCBjb25zdCBJTkpFQ1RFRF9USEVNRV9LRVkgPSAnX190aGVtZV9pbmplY3Rvcic7XG4vKipcbiAqIERlY29yYXRvciBmb3IgYmFzZSBjc3MgY2xhc3Nlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGhlbWUodGhlbWUpIHtcbiAgICByZXR1cm4gaGFuZGxlRGVjb3JhdG9yKCh0YXJnZXQpID0+IHtcbiAgICAgICAgdGFyZ2V0LmFkZERlY29yYXRvcignYmFzZVRoZW1lQ2xhc3NlcycsIHRoZW1lKTtcbiAgICB9KTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIHJldmVyc2UgbG9va3VwIGZvciB0aGUgY2xhc3NlcyBwYXNzZWQgaW4gdmlhIHRoZSBgdGhlbWVgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBjbGFzc2VzIFRoZSBiYXNlQ2xhc3NlcyBvYmplY3RcbiAqIEByZXF1aXJlc1xuICovXG5mdW5jdGlvbiBjcmVhdGVUaGVtZUNsYXNzZXNMb29rdXAoY2xhc3Nlcykge1xuICAgIHJldHVybiBjbGFzc2VzLnJlZHVjZSgoY3VycmVudENsYXNzTmFtZXMsIGJhc2VDbGFzcykgPT4ge1xuICAgICAgICBPYmplY3Qua2V5cyhiYXNlQ2xhc3MpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgY3VycmVudENsYXNzTmFtZXNbYmFzZUNsYXNzW2tleV1dID0ga2V5O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRDbGFzc05hbWVzO1xuICAgIH0sIHt9KTtcbn1cbi8qKlxuICogQ29udmVuaWVuY2UgZnVuY3Rpb24gdGhhdCBpcyBnaXZlbiBhIHRoZW1lIGFuZCBhbiBvcHRpb25hbCByZWdpc3RyeSwgdGhlIHRoZW1lXG4gKiBpbmplY3RvciBpcyBkZWZpbmVkIGFnYWluc3QgdGhlIHJlZ2lzdHJ5LCByZXR1cm5pbmcgdGhlIHRoZW1lLlxuICpcbiAqIEBwYXJhbSB0aGVtZSB0aGUgdGhlbWUgdG8gc2V0XG4gKiBAcGFyYW0gdGhlbWVSZWdpc3RyeSByZWdpc3RyeSB0byBkZWZpbmUgdGhlIHRoZW1lIGluamVjdG9yIGFnYWluc3QuIERlZmF1bHRzXG4gKiB0byB0aGUgZ2xvYmFsIHJlZ2lzdHJ5XG4gKlxuICogQHJldHVybnMgdGhlIHRoZW1lIGluamVjdG9yIHVzZWQgdG8gc2V0IHRoZSB0aGVtZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJUaGVtZUluamVjdG9yKHRoZW1lLCB0aGVtZVJlZ2lzdHJ5KSB7XG4gICAgY29uc3QgdGhlbWVJbmplY3RvciA9IG5ldyBJbmplY3Rvcih0aGVtZSk7XG4gICAgdGhlbWVSZWdpc3RyeS5kZWZpbmVJbmplY3RvcihJTkpFQ1RFRF9USEVNRV9LRVksIChpbnZhbGlkYXRvcikgPT4ge1xuICAgICAgICB0aGVtZUluamVjdG9yLnNldEludmFsaWRhdG9yKGludmFsaWRhdG9yKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHRoZW1lSW5qZWN0b3IuZ2V0KCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoZW1lSW5qZWN0b3I7XG59XG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIGNsYXNzIGRlY29yYXRlZCB3aXRoIHdpdGggVGhlbWVkIGZ1bmN0aW9uYWxpdHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRoZW1lZE1peGluKEJhc2UpIHtcbiAgICBsZXQgVGhlbWVkID0gY2xhc3MgVGhlbWVkIGV4dGVuZHMgQmFzZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmVnaXN0ZXJlZCBiYXNlIHRoZW1lIGtleXNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZUtleXMgPSBbXTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGNsYXNzZXMgbWV0YSBkYXRhIG5lZWQgdG8gYmUgY2FsY3VsYXRlZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5fcmVjYWxjdWxhdGVDbGFzc2VzID0gdHJ1ZTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTG9hZGVkIHRoZW1lXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdGhlbWUoY2xhc3Nlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3JlY2FsY3VsYXRlQ2xhc3Nlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlY2FsY3VsYXRlVGhlbWVDbGFzc2VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjbGFzc2VzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGFzc2VzLm1hcCgoY2xhc3NOYW1lKSA9PiB0aGlzLl9nZXRUaGVtZUNsYXNzKGNsYXNzTmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFRoZW1lQ2xhc3MoY2xhc3Nlcyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZ1bmN0aW9uIGZpcmVkIHdoZW4gYHRoZW1lYCBvciBgZXh0cmFDbGFzc2VzYCBhcmUgY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgICAgIG9uUHJvcGVydGllc0NoYW5nZWQoKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWNhbGN1bGF0ZUNsYXNzZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIF9nZXRUaGVtZUNsYXNzKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSA9PT0gdW5kZWZpbmVkIHx8IGNsYXNzTmFtZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGFzc05hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBleHRyYUNsYXNzZXMgPSB0aGlzLnByb3BlcnRpZXMuZXh0cmFDbGFzc2VzIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgdGhlbWVDbGFzc05hbWUgPSB0aGlzLl9iYXNlVGhlbWVDbGFzc2VzUmV2ZXJzZUxvb2t1cFtjbGFzc05hbWVdO1xuICAgICAgICAgICAgbGV0IHJlc3VsdENsYXNzTmFtZXMgPSBbXTtcbiAgICAgICAgICAgIGlmICghdGhlbWVDbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYENsYXNzIG5hbWU6ICcke2NsYXNzTmFtZX0nIG5vdCBmb3VuZCBpbiB0aGVtZWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4dHJhQ2xhc3Nlc1t0aGVtZUNsYXNzTmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHRDbGFzc05hbWVzLnB1c2goZXh0cmFDbGFzc2VzW3RoZW1lQ2xhc3NOYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fdGhlbWVbdGhlbWVDbGFzc05hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Q2xhc3NOYW1lcy5wdXNoKHRoaXMuX3RoZW1lW3RoZW1lQ2xhc3NOYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRDbGFzc05hbWVzLnB1c2godGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZVt0aGVtZUNsYXNzTmFtZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdENsYXNzTmFtZXMuam9pbignICcpO1xuICAgICAgICB9XG4gICAgICAgIF9yZWNhbGN1bGF0ZVRoZW1lQ2xhc3NlcygpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgdGhlbWUgPSB7fSB9ID0gdGhpcy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9yZWdpc3RlcmVkQmFzZVRoZW1lKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZVRoZW1lcyA9IHRoaXMuZ2V0RGVjb3JhdG9yKCdiYXNlVGhlbWVDbGFzc2VzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2VUaGVtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignQSBiYXNlIHRoZW1lIGhhcyBub3QgYmVlbiBwcm92aWRlZCB0byB0aGlzIHdpZGdldC4gUGxlYXNlIHVzZSB0aGUgQHRoZW1lIGRlY29yYXRvciB0byBhZGQgYSB0aGVtZS4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZSA9IGJhc2VUaGVtZXMucmVkdWNlKChmaW5hbEJhc2VUaGVtZSwgYmFzZVRoZW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IF9hID0gVEhFTUVfS0VZLCBrZXkgPSBiYXNlVGhlbWVbX2FdLCBjbGFzc2VzID0gdHNsaWJfMS5fX3Jlc3QoYmFzZVRoZW1lLCBbdHlwZW9mIF9hID09PSBcInN5bWJvbFwiID8gX2EgOiBfYSArIFwiXCJdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZUtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZmluYWxCYXNlVGhlbWUsIGNsYXNzZXMpO1xuICAgICAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9iYXNlVGhlbWVDbGFzc2VzUmV2ZXJzZUxvb2t1cCA9IGNyZWF0ZVRoZW1lQ2xhc3Nlc0xvb2t1cChiYXNlVGhlbWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3RoZW1lID0gdGhpcy5fcmVnaXN0ZXJlZEJhc2VUaGVtZUtleXMucmVkdWNlKChiYXNlVGhlbWUsIHRoZW1lS2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGJhc2VUaGVtZSwgdGhlbWVbdGhlbWVLZXldKTtcbiAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgIHRoaXMuX3JlY2FsY3VsYXRlQ2xhc3NlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0c2xpYl8xLl9fZGVjb3JhdGUoW1xuICAgICAgICBkaWZmUHJvcGVydHkoJ3RoZW1lJywgc2hhbGxvdyksXG4gICAgICAgIGRpZmZQcm9wZXJ0eSgnZXh0cmFDbGFzc2VzJywgc2hhbGxvdylcbiAgICBdLCBUaGVtZWQucHJvdG90eXBlLCBcIm9uUHJvcGVydGllc0NoYW5nZWRcIiwgbnVsbCk7XG4gICAgVGhlbWVkID0gdHNsaWJfMS5fX2RlY29yYXRlKFtcbiAgICAgICAgaW5qZWN0KHtcbiAgICAgICAgICAgIG5hbWU6IElOSkVDVEVEX1RIRU1FX0tFWSxcbiAgICAgICAgICAgIGdldFByb3BlcnRpZXM6ICh0aGVtZSwgcHJvcGVydGllcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvcGVydGllcy50aGVtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB0aGVtZSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgXSwgVGhlbWVkKTtcbiAgICByZXR1cm4gVGhlbWVkO1xufVxuZXhwb3J0IGRlZmF1bHQgVGhlbWVkTWl4aW47XG4vLyMgc291cmNlTWFwcGluZ1VSTD1UaGVtZWQubWpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkLm1qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQubWpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCBnbG9iYWwgZnJvbSAnLi4vc2hpbS9nbG9iYWwnO1xyXG5pbXBvcnQgaGFzIGZyb20gJy4uL2hhcy9oYXMnO1xyXG5pbXBvcnQgeyBXZWFrTWFwIH0gZnJvbSAnLi4vc2hpbS9XZWFrTWFwJztcclxuaW1wb3J0IHRyYW5zaXRpb25TdHJhdGVneSBmcm9tICcuL2FuaW1hdGlvbnMvY3NzVHJhbnNpdGlvbnMnO1xyXG5pbXBvcnQgeyBpc1ZOb2RlLCBpc1dOb2RlLCBXTk9ERSwgdiwgaXNEb21WTm9kZSwgdyB9IGZyb20gJy4vZCc7XHJcbmltcG9ydCB7IGlzV2lkZ2V0QmFzZUNvbnN0cnVjdG9yIH0gZnJvbSAnLi9SZWdpc3RyeSc7XHJcbmltcG9ydCB7IFdpZGdldEJhc2UsIHdpZGdldEluc3RhbmNlTWFwIH0gZnJvbSAnLi9XaWRnZXRCYXNlJztcclxuY29uc3QgRU1QVFlfQVJSQVkgPSBbXTtcclxuY29uc3Qgbm9kZU9wZXJhdGlvbnMgPSBbJ2ZvY3VzJywgJ2JsdXInLCAnc2Nyb2xsSW50b1ZpZXcnLCAnY2xpY2snXTtcclxuY29uc3QgTkFNRVNQQUNFX1czID0gJ2h0dHA6Ly93d3cudzMub3JnLyc7XHJcbmNvbnN0IE5BTUVTUEFDRV9TVkcgPSBOQU1FU1BBQ0VfVzMgKyAnMjAwMC9zdmcnO1xyXG5jb25zdCBOQU1FU1BBQ0VfWExJTksgPSBOQU1FU1BBQ0VfVzMgKyAnMTk5OS94bGluayc7XHJcbmZ1bmN0aW9uIGlzV05vZGVXcmFwcGVyKGNoaWxkKSB7XHJcbiAgICByZXR1cm4gY2hpbGQgJiYgaXNXTm9kZShjaGlsZC5ub2RlKTtcclxufVxyXG5mdW5jdGlvbiBpc1ZOb2RlV3JhcHBlcihjaGlsZCkge1xyXG4gICAgcmV0dXJuICEhY2hpbGQgJiYgaXNWTm9kZShjaGlsZC5ub2RlKTtcclxufVxyXG5mdW5jdGlvbiBpc0F0dGFjaEFwcGxpY2F0aW9uKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gISF2YWx1ZS50eXBlO1xyXG59XHJcbmZ1bmN0aW9uIHVwZGF0ZUF0dHJpYnV0ZXMoZG9tTm9kZSwgcHJldmlvdXNBdHRyaWJ1dGVzLCBhdHRyaWJ1dGVzLCBuYW1lc3BhY2UpIHtcclxuICAgIGNvbnN0IGF0dHJOYW1lcyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpO1xyXG4gICAgY29uc3QgYXR0ckNvdW50ID0gYXR0ck5hbWVzLmxlbmd0aDtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0ckNvdW50OyBpKyspIHtcclxuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGF0dHJOYW1lc1tpXTtcclxuICAgICAgICBjb25zdCBhdHRyVmFsdWUgPSBhdHRyaWJ1dGVzW2F0dHJOYW1lXTtcclxuICAgICAgICBjb25zdCBwcmV2aW91c0F0dHJWYWx1ZSA9IHByZXZpb3VzQXR0cmlidXRlc1thdHRyTmFtZV07XHJcbiAgICAgICAgaWYgKGF0dHJWYWx1ZSAhPT0gcHJldmlvdXNBdHRyVmFsdWUpIHtcclxuICAgICAgICAgICAgdXBkYXRlQXR0cmlidXRlKGRvbU5vZGUsIGF0dHJOYW1lLCBhdHRyVmFsdWUsIG5hbWVzcGFjZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGJ1aWxkUHJldmlvdXNQcm9wZXJ0aWVzKGRvbU5vZGUsIGN1cnJlbnQsIG5leHQpIHtcclxuICAgIGNvbnN0IHsgbm9kZTogeyBkaWZmVHlwZSwgcHJvcGVydGllcywgYXR0cmlidXRlcyB9IH0gPSBjdXJyZW50O1xyXG4gICAgaWYgKCFkaWZmVHlwZSB8fCBkaWZmVHlwZSA9PT0gJ3Zkb20nKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcHJvcGVydGllczogY3VycmVudC5ub2RlLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGN1cnJlbnQubm9kZS5hdHRyaWJ1dGVzLFxyXG4gICAgICAgICAgICBldmVudHM6IGN1cnJlbnQubm9kZS5ldmVudHNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoZGlmZlR5cGUgPT09ICdub25lJykge1xyXG4gICAgICAgIHJldHVybiB7IHByb3BlcnRpZXM6IHt9LCBhdHRyaWJ1dGVzOiBjdXJyZW50Lm5vZGUuYXR0cmlidXRlcyA/IHt9IDogdW5kZWZpbmVkLCBldmVudHM6IGN1cnJlbnQubm9kZS5ldmVudHMgfTtcclxuICAgIH1cclxuICAgIGxldCBuZXdQcm9wZXJ0aWVzID0ge1xyXG4gICAgICAgIHByb3BlcnRpZXM6IHt9XHJcbiAgICB9O1xyXG4gICAgaWYgKGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICBuZXdQcm9wZXJ0aWVzLmF0dHJpYnV0ZXMgPSB7fTtcclxuICAgICAgICBuZXdQcm9wZXJ0aWVzLmV2ZW50cyA9IGN1cnJlbnQubm9kZS5ldmVudHM7XHJcbiAgICAgICAgT2JqZWN0LmtleXMocHJvcGVydGllcykuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcclxuICAgICAgICAgICAgbmV3UHJvcGVydGllcy5wcm9wZXJ0aWVzW3Byb3BOYW1lXSA9IGRvbU5vZGVbcHJvcE5hbWVdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGF0dHJOYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIG5ld1Byb3BlcnRpZXMuYXR0cmlidXRlc1thdHRyTmFtZV0gPSBkb21Ob2RlLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG5ld1Byb3BlcnRpZXM7XHJcbiAgICB9XHJcbiAgICBuZXdQcm9wZXJ0aWVzLnByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5yZWR1Y2UoKHByb3BzLCBwcm9wZXJ0eSkgPT4ge1xyXG4gICAgICAgIHByb3BzW3Byb3BlcnR5XSA9IGRvbU5vZGUuZ2V0QXR0cmlidXRlKHByb3BlcnR5KSB8fCBkb21Ob2RlW3Byb3BlcnR5XTtcclxuICAgICAgICByZXR1cm4gcHJvcHM7XHJcbiAgICB9LCB7fSk7XHJcbiAgICByZXR1cm4gbmV3UHJvcGVydGllcztcclxufVxyXG5mdW5jdGlvbiBjaGVja0Rpc3Rpbmd1aXNoYWJsZSh3cmFwcGVycywgaW5kZXgsIHBhcmVudFdOb2RlV3JhcHBlcikge1xyXG4gICAgY29uc3Qgd3JhcHBlclRvQ2hlY2sgPSB3cmFwcGVyc1tpbmRleF07XHJcbiAgICBpZiAoaXNWTm9kZVdyYXBwZXIod3JhcHBlclRvQ2hlY2spICYmICF3cmFwcGVyVG9DaGVjay5ub2RlLnRhZykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHsga2V5IH0gPSB3cmFwcGVyVG9DaGVjay5ub2RlLnByb3BlcnRpZXM7XHJcbiAgICBsZXQgcGFyZW50TmFtZSA9ICd1bmtub3duJztcclxuICAgIGlmIChwYXJlbnRXTm9kZVdyYXBwZXIpIHtcclxuICAgICAgICBjb25zdCB7IG5vZGU6IHsgd2lkZ2V0Q29uc3RydWN0b3IgfSB9ID0gcGFyZW50V05vZGVXcmFwcGVyO1xyXG4gICAgICAgIHBhcmVudE5hbWUgPSB3aWRnZXRDb25zdHJ1Y3Rvci5uYW1lIHx8ICd1bmtub3duJztcclxuICAgIH1cclxuICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCB8fCBrZXkgPT09IG51bGwpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdyYXBwZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChpICE9PSBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgd3JhcHBlciA9IHdyYXBwZXJzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNhbWUod3JhcHBlciwgd3JhcHBlclRvQ2hlY2spKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vZGVJZGVudGlmaWVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1dOb2RlV3JhcHBlcih3cmFwcGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlSWRlbnRpZmllciA9IHdyYXBwZXIubm9kZS53aWRnZXRDb25zdHJ1Y3Rvci5uYW1lIHx8ICd1bmtub3duJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVJZGVudGlmaWVyID0gd3JhcHBlci5ub2RlLnRhZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBBIHdpZGdldCAoJHtwYXJlbnROYW1lfSkgaGFzIGhhZCBhIGNoaWxkIGFkZGVkIG9yIHJlbW92ZWQsIGJ1dCB0aGV5IHdlcmUgbm90IGFibGUgdG8gdW5pcXVlbHkgaWRlbnRpZmllZC4gSXQgaXMgcmVjb21tZW5kZWQgdG8gcHJvdmlkZSBhIHVuaXF1ZSAna2V5JyBwcm9wZXJ0eSB3aGVuIHVzaW5nIHRoZSBzYW1lIHdpZGdldCBvciBlbGVtZW50ICgke25vZGVJZGVudGlmaWVyfSkgbXVsdGlwbGUgdGltZXMgYXMgc2libGluZ3NgKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBzYW1lKGRub2RlMSwgZG5vZGUyKSB7XHJcbiAgICBpZiAoaXNWTm9kZVdyYXBwZXIoZG5vZGUxKSAmJiBpc1ZOb2RlV3JhcHBlcihkbm9kZTIpKSB7XHJcbiAgICAgICAgaWYgKGlzRG9tVk5vZGUoZG5vZGUxLm5vZGUpICYmIGlzRG9tVk5vZGUoZG5vZGUyLm5vZGUpKSB7XHJcbiAgICAgICAgICAgIGlmIChkbm9kZTEubm9kZS5kb21Ob2RlICE9PSBkbm9kZTIubm9kZS5kb21Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRub2RlMS5ub2RlLnRhZyAhPT0gZG5vZGUyLm5vZGUudGFnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRub2RlMS5ub2RlLnByb3BlcnRpZXMua2V5ICE9PSBkbm9kZTIubm9kZS5wcm9wZXJ0aWVzLmtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoaXNXTm9kZVdyYXBwZXIoZG5vZGUxKSAmJiBpc1dOb2RlV3JhcHBlcihkbm9kZTIpKSB7XHJcbiAgICAgICAgaWYgKGRub2RlMS5pbnN0YW5jZSA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBkbm9kZTIubm9kZS53aWRnZXRDb25zdHJ1Y3RvciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZG5vZGUxLm5vZGUud2lkZ2V0Q29uc3RydWN0b3IgIT09IGRub2RlMi5ub2RlLndpZGdldENvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRub2RlMS5ub2RlLnByb3BlcnRpZXMua2V5ICE9PSBkbm9kZTIubm9kZS5wcm9wZXJ0aWVzLmtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbmZ1bmN0aW9uIGZpbmRJbmRleE9mQ2hpbGQoY2hpbGRyZW4sIHNhbWVBcywgc3RhcnQpIHtcclxuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHNhbWUoY2hpbGRyZW5baV0sIHNhbWVBcykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xO1xyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZUNsYXNzUHJvcFZhbHVlKGNsYXNzZXMgPSBbXSkge1xyXG4gICAgY2xhc3NlcyA9IEFycmF5LmlzQXJyYXkoY2xhc3NlcykgPyBjbGFzc2VzIDogW2NsYXNzZXNdO1xyXG4gICAgcmV0dXJuIGNsYXNzZXMuam9pbignICcpLnRyaW0oKTtcclxufVxyXG5mdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGUoZG9tTm9kZSwgYXR0ck5hbWUsIGF0dHJWYWx1ZSwgbmFtZXNwYWNlKSB7XHJcbiAgICBpZiAobmFtZXNwYWNlID09PSBOQU1FU1BBQ0VfU1ZHICYmIGF0dHJOYW1lID09PSAnaHJlZicgJiYgYXR0clZhbHVlKSB7XHJcbiAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGVOUyhOQU1FU1BBQ0VfWExJTkssIGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoKGF0dHJOYW1lID09PSAncm9sZScgJiYgYXR0clZhbHVlID09PSAnJykgfHwgYXR0clZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBkb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBkb21Ob2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBydW5FbnRlckFuaW1hdGlvbihuZXh0LCB0cmFuc2l0aW9ucykge1xyXG4gICAgY29uc3QgeyBkb21Ob2RlLCBub2RlOiB7IHByb3BlcnRpZXMgfSwgbm9kZTogeyBwcm9wZXJ0aWVzOiB7IGVudGVyQW5pbWF0aW9uIH0gfSB9ID0gbmV4dDtcclxuICAgIGlmIChlbnRlckFuaW1hdGlvbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZW50ZXJBbmltYXRpb24gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVudGVyQW5pbWF0aW9uKGRvbU5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cmFuc2l0aW9ucy5lbnRlcihkb21Ob2RlLCBwcm9wZXJ0aWVzLCBlbnRlckFuaW1hdGlvbik7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gcnVuRXhpdEFuaW1hdGlvbihjdXJyZW50LCB0cmFuc2l0aW9ucykge1xyXG4gICAgY29uc3QgeyBkb21Ob2RlLCBub2RlOiB7IHByb3BlcnRpZXMgfSwgbm9kZTogeyBwcm9wZXJ0aWVzOiB7IGV4aXRBbmltYXRpb24gfSB9IH0gPSBjdXJyZW50O1xyXG4gICAgY29uc3QgcmVtb3ZlRG9tTm9kZSA9ICgpID0+IHtcclxuICAgICAgICBkb21Ob2RlICYmIGRvbU5vZGUucGFyZW50Tm9kZSAmJiBkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSk7XHJcbiAgICAgICAgY3VycmVudC5kb21Ob2RlID0gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIGlmICh0eXBlb2YgZXhpdEFuaW1hdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHJldHVybiBleGl0QW5pbWF0aW9uKGRvbU5vZGUsIHJlbW92ZURvbU5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgfVxyXG4gICAgdHJhbnNpdGlvbnMuZXhpdChkb21Ob2RlLCBwcm9wZXJ0aWVzLCBleGl0QW5pbWF0aW9uLCByZW1vdmVEb21Ob2RlKTtcclxufVxyXG5mdW5jdGlvbiBhcnJheUZyb20oYXJyKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcclxufVxyXG5mdW5jdGlvbiB3cmFwVk5vZGVzKG5vZGVzKSB7XHJcbiAgICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBXaWRnZXRCYXNlIHtcclxuICAgICAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlcztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJlcihyZW5kZXJlcikge1xyXG4gICAgbGV0IF9tb3VudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgc3luYzogZmFsc2UsXHJcbiAgICAgICAgbWVyZ2U6IHRydWUsXHJcbiAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvblN0cmF0ZWd5LFxyXG4gICAgICAgIGRvbU5vZGU6IGdsb2JhbC5kb2N1bWVudC5ib2R5LFxyXG4gICAgICAgIHJlZ2lzdHJ5OiBudWxsXHJcbiAgICB9O1xyXG4gICAgbGV0IF9pbnZhbGlkYXRpb25RdWV1ZSA9IFtdO1xyXG4gICAgbGV0IF9wcm9jZXNzUXVldWUgPSBbXTtcclxuICAgIGxldCBfYXBwbGljYXRpb25RdWV1ZSA9IFtdO1xyXG4gICAgbGV0IF9ldmVudE1hcCA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICBsZXQgX2luc3RhbmNlVG9XcmFwcGVyTWFwID0gbmV3IFdlYWtNYXAoKTtcclxuICAgIGxldCBfcGFyZW50V3JhcHBlck1hcCA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICBsZXQgX3dyYXBwZXJTaWJsaW5nTWFwID0gbmV3IFdlYWtNYXAoKTtcclxuICAgIGxldCBfcmVuZGVyU2NoZWR1bGVkO1xyXG4gICAgbGV0IF9hZnRlclJlbmRlckNhbGxiYWNrcyA9IFtdO1xyXG4gICAgbGV0IF9kZWZlcnJlZFJlbmRlckNhbGxiYWNrcyA9IFtdO1xyXG4gICAgbGV0IHBhcmVudEludmFsaWRhdGU7XHJcbiAgICBmdW5jdGlvbiBub2RlT3BlcmF0aW9uKHByb3BOYW1lLCBwcm9wVmFsdWUsIHByZXZpb3VzVmFsdWUsIGRvbU5vZGUpIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gcHJvcFZhbHVlICYmICFwcmV2aW91c1ZhbHVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgcHJvcFZhbHVlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHByb3BWYWx1ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIF9hZnRlclJlbmRlckNhbGxiYWNrcy5wdXNoKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGRvbU5vZGVbcHJvcE5hbWVdKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGRvbU5vZGUsIGV2ZW50TmFtZSwgY3VycmVudFZhbHVlLCBiaW5kLCBwcmV2aW91c1ZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNFdmVudCA9IF9ldmVudE1hcC5nZXQocHJldmlvdXNWYWx1ZSk7XHJcbiAgICAgICAgICAgIGRvbU5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHByZXZpb3VzRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2FsbGJhY2sgPSBjdXJyZW50VmFsdWUuYmluZChiaW5kKTtcclxuICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnaW5wdXQnKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLmNhbGwodGhpcywgZXZ0KTtcclxuICAgICAgICAgICAgICAgIGV2dC50YXJnZXRbJ29uaW5wdXQtdmFsdWUnXSA9IGV2dC50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgIH0uYmluZChiaW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZG9tTm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xyXG4gICAgICAgIF9ldmVudE1hcC5zZXQoY3VycmVudFZhbHVlLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZW1vdmVPcnBoYW5lZEV2ZW50cyhkb21Ob2RlLCBwcmV2aW91c1Byb3BlcnRpZXMsIHByb3BlcnRpZXMsIG9ubHlFdmVudHMgPSBmYWxzZSkge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHByZXZpb3VzUHJvcGVydGllcykuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgaXNFdmVudCA9IHByb3BOYW1lLnN1YnN0cigwLCAyKSA9PT0gJ29uJyB8fCBvbmx5RXZlbnRzO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudE5hbWUgPSBvbmx5RXZlbnRzID8gcHJvcE5hbWUgOiBwcm9wTmFtZS5zdWJzdHIoMik7XHJcbiAgICAgICAgICAgIGlmIChpc0V2ZW50ICYmICFwcm9wZXJ0aWVzW3Byb3BOYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRDYWxsYmFjayA9IF9ldmVudE1hcC5nZXQocHJldmlvdXNQcm9wZXJ0aWVzW3Byb3BOYW1lXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50Q2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZW5kZXJlZFRvV3JhcHBlcihyZW5kZXJlZCwgcGFyZW50LCBjdXJyZW50UGFyZW50KSB7XHJcbiAgICAgICAgY29uc3Qgd3JhcHBlZFJlbmRlcmVkID0gW107XHJcbiAgICAgICAgY29uc3QgaGFzUGFyZW50V05vZGUgPSBpc1dOb2RlV3JhcHBlcihwYXJlbnQpO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRQYXJlbnRMZW5ndGggPSBpc1ZOb2RlV3JhcHBlcihjdXJyZW50UGFyZW50KSAmJiAoY3VycmVudFBhcmVudC5jaGlsZHJlbldyYXBwZXJzIHx8IFtdKS5sZW5ndGggPiAxO1xyXG4gICAgICAgIGNvbnN0IHJlcXVpcmVzSW5zZXJ0QmVmb3JlID0gKChwYXJlbnQucmVxdWlyZXNJbnNlcnRCZWZvcmUgfHwgcGFyZW50Lmhhc1ByZXZpb3VzU2libGluZ3MgIT09IGZhbHNlKSAmJiBoYXNQYXJlbnRXTm9kZSkgfHxcclxuICAgICAgICAgICAgY3VycmVudFBhcmVudExlbmd0aDtcclxuICAgICAgICBsZXQgcHJldmlvdXNJdGVtO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVuZGVyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcmVuZGVyZWRJdGVtID0gcmVuZGVyZWRbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHdyYXBwZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBub2RlOiByZW5kZXJlZEl0ZW0sXHJcbiAgICAgICAgICAgICAgICBkZXB0aDogcGFyZW50LmRlcHRoICsgMSxcclxuICAgICAgICAgICAgICAgIHJlcXVpcmVzSW5zZXJ0QmVmb3JlLFxyXG4gICAgICAgICAgICAgICAgaGFzUGFyZW50V05vZGUsXHJcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IHBhcmVudC5uYW1lc3BhY2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGlzVk5vZGUocmVuZGVyZWRJdGVtKSAmJiByZW5kZXJlZEl0ZW0ucHJvcGVydGllcy5leGl0QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQuaGFzQW5pbWF0aW9ucyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBhcmVudCA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHRQYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFBhcmVudC5oYXNBbmltYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBuZXh0UGFyZW50Lmhhc0FuaW1hdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHRQYXJlbnQgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQobmV4dFBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgX3BhcmVudFdyYXBwZXJNYXAuc2V0KHdyYXBwZXIsIHBhcmVudCk7XHJcbiAgICAgICAgICAgIGlmIChwcmV2aW91c0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgIF93cmFwcGVyU2libGluZ01hcC5zZXQocHJldmlvdXNJdGVtLCB3cmFwcGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3cmFwcGVkUmVuZGVyZWQucHVzaCh3cmFwcGVyKTtcclxuICAgICAgICAgICAgcHJldmlvdXNJdGVtID0gd3JhcHBlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHdyYXBwZWRSZW5kZXJlZDtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGZpbmRQYXJlbnRXTm9kZVdyYXBwZXIoY3VycmVudE5vZGUpIHtcclxuICAgICAgICBsZXQgcGFyZW50V05vZGVXcmFwcGVyO1xyXG4gICAgICAgIGxldCBwYXJlbnRXcmFwcGVyID0gX3BhcmVudFdyYXBwZXJNYXAuZ2V0KGN1cnJlbnROb2RlKTtcclxuICAgICAgICB3aGlsZSAoIXBhcmVudFdOb2RlV3JhcHBlciAmJiBwYXJlbnRXcmFwcGVyKSB7XHJcbiAgICAgICAgICAgIGlmICghcGFyZW50V05vZGVXcmFwcGVyICYmIGlzV05vZGVXcmFwcGVyKHBhcmVudFdyYXBwZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRXTm9kZVdyYXBwZXIgPSBwYXJlbnRXcmFwcGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQocGFyZW50V3JhcHBlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXJlbnRXTm9kZVdyYXBwZXI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBmaW5kUGFyZW50RG9tTm9kZShjdXJyZW50Tm9kZSkge1xyXG4gICAgICAgIGxldCBwYXJlbnREb21Ob2RlO1xyXG4gICAgICAgIGxldCBwYXJlbnRXcmFwcGVyID0gX3BhcmVudFdyYXBwZXJNYXAuZ2V0KGN1cnJlbnROb2RlKTtcclxuICAgICAgICB3aGlsZSAoIXBhcmVudERvbU5vZGUgJiYgcGFyZW50V3JhcHBlcikge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudERvbU5vZGUgJiYgaXNWTm9kZVdyYXBwZXIocGFyZW50V3JhcHBlcikgJiYgcGFyZW50V3JhcHBlci5kb21Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnREb21Ob2RlID0gcGFyZW50V3JhcHBlci5kb21Ob2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudFdyYXBwZXIgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQocGFyZW50V3JhcHBlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXJlbnREb21Ob2RlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcnVuRGVmZXJyZWRQcm9wZXJ0aWVzKG5leHQpIHtcclxuICAgICAgICBpZiAobmV4dC5ub2RlLmRlZmVycmVkUHJvcGVydGllc0NhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBuZXh0Lm5vZGUucHJvcGVydGllcztcclxuICAgICAgICAgICAgbmV4dC5ub2RlLnByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBuZXh0Lm5vZGUuZGVmZXJyZWRQcm9wZXJ0aWVzQ2FsbGJhY2sodHJ1ZSksIG5leHQubm9kZS5vcmlnaW5hbFByb3BlcnRpZXMpO1xyXG4gICAgICAgICAgICBfYWZ0ZXJSZW5kZXJDYWxsYmFja3MucHVzaCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzUHJvcGVydGllcyhuZXh0LCB7IHByb3BlcnRpZXMgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGZpbmRJbnNlcnRCZWZvcmUobmV4dCkge1xyXG4gICAgICAgIGxldCBpbnNlcnRCZWZvcmUgPSBudWxsO1xyXG4gICAgICAgIGxldCBzZWFyY2hOb2RlID0gbmV4dDtcclxuICAgICAgICB3aGlsZSAoIWluc2VydEJlZm9yZSkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXh0U2libGluZyA9IF93cmFwcGVyU2libGluZ01hcC5nZXQoc2VhcmNoTm9kZSk7XHJcbiAgICAgICAgICAgIGlmIChuZXh0U2libGluZykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzVk5vZGVXcmFwcGVyKG5leHRTaWJsaW5nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0U2libGluZy5kb21Ob2RlICYmIG5leHRTaWJsaW5nLmRvbU5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnRCZWZvcmUgPSBuZXh0U2libGluZy5kb21Ob2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoTm9kZSA9IG5leHRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG5leHRTaWJsaW5nLmRvbU5vZGUgJiYgbmV4dFNpYmxpbmcuZG9tTm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0QmVmb3JlID0gbmV4dFNpYmxpbmcuZG9tTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNlYXJjaE5vZGUgPSBuZXh0U2libGluZztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlYXJjaE5vZGUgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQoc2VhcmNoTm9kZSk7XHJcbiAgICAgICAgICAgIGlmICghc2VhcmNoTm9kZSB8fCBpc1ZOb2RlV3JhcHBlcihzZWFyY2hOb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGluc2VydEJlZm9yZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHNldFByb3BlcnRpZXMoZG9tTm9kZSwgY3VycmVudFByb3BlcnRpZXMgPSB7fSwgbmV4dFdyYXBwZXIsIGluY2x1ZGVzRXZlbnRzQW5kQXR0cmlidXRlcyA9IHRydWUpIHtcclxuICAgICAgICBjb25zdCBwcm9wTmFtZXMgPSBPYmplY3Qua2V5cyhuZXh0V3JhcHBlci5ub2RlLnByb3BlcnRpZXMpO1xyXG4gICAgICAgIGNvbnN0IHByb3BDb3VudCA9IHByb3BOYW1lcy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKHByb3BOYW1lcy5pbmRleE9mKCdjbGFzc2VzJykgPT09IC0xICYmIGN1cnJlbnRQcm9wZXJ0aWVzLmNsYXNzZXMpIHtcclxuICAgICAgICAgICAgZG9tTm9kZS5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluY2x1ZGVzRXZlbnRzQW5kQXR0cmlidXRlcyAmJiByZW1vdmVPcnBoYW5lZEV2ZW50cyhkb21Ob2RlLCBjdXJyZW50UHJvcGVydGllcywgbmV4dFdyYXBwZXIubm9kZS5wcm9wZXJ0aWVzKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BOYW1lID0gcHJvcE5hbWVzW2ldO1xyXG4gICAgICAgICAgICBsZXQgcHJvcFZhbHVlID0gbmV4dFdyYXBwZXIubm9kZS5wcm9wZXJ0aWVzW3Byb3BOYW1lXTtcclxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IGN1cnJlbnRQcm9wZXJ0aWVzW3Byb3BOYW1lXTtcclxuICAgICAgICAgICAgaWYgKHByb3BOYW1lID09PSAnY2xhc3NlcycpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzQ2xhc3NTdHJpbmcgPSBjcmVhdGVDbGFzc1Byb3BWYWx1ZShwcmV2aW91c1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50Q2xhc3NTdHJpbmcgPSBjcmVhdGVDbGFzc1Byb3BWYWx1ZShwcm9wVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzQ2xhc3NTdHJpbmcgIT09IGN1cnJlbnRDbGFzc1N0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q2xhc3NTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRXcmFwcGVyLm1lcmdlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9tQ2xhc3NlcyA9IChkb21Ob2RlLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSB8fCAnJykuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG9tQ2xhc3Nlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q2xhc3NTdHJpbmcuaW5kZXhPZihkb21DbGFzc2VzW2ldKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudENsYXNzU3RyaW5nID0gYCR7ZG9tQ2xhc3Nlc1tpXX0gJHtjdXJyZW50Q2xhc3NTdHJpbmd9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY3VycmVudENsYXNzU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChub2RlT3BlcmF0aW9ucy5pbmRleE9mKHByb3BOYW1lKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVPcGVyYXRpb24ocHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXNWYWx1ZSwgZG9tTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocHJvcE5hbWUgPT09ICdzdHlsZXMnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdHlsZU5hbWVzID0gT2JqZWN0LmtleXMocHJvcFZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0eWxlQ291bnQgPSBzdHlsZU5hbWVzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc3R5bGVDb3VudDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3R5bGVOYW1lID0gc3R5bGVOYW1lc1tqXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdTdHlsZVZhbHVlID0gcHJvcFZhbHVlW3N0eWxlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkU3R5bGVWYWx1ZSA9IHByZXZpb3VzVmFsdWUgJiYgcHJldmlvdXNWYWx1ZVtzdHlsZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdTdHlsZVZhbHVlID09PSBvbGRTdHlsZVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnN0eWxlW3N0eWxlTmFtZV0gPSBuZXdTdHlsZVZhbHVlIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcm9wVmFsdWUgJiYgdHlwZW9mIHByZXZpb3VzVmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcFZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcE5hbWUgPT09ICd2YWx1ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21WYWx1ZSA9IGRvbU5vZGVbcHJvcE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21WYWx1ZSAhPT0gcHJvcFZhbHVlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChkb21Ob2RlWydvbmlucHV0LXZhbHVlJ11cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZG9tVmFsdWUgPT09IGRvbU5vZGVbJ29uaW5wdXQtdmFsdWUnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwcm9wVmFsdWUgIT09IHByZXZpb3VzVmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGVbcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlWydvbmlucHV0LXZhbHVlJ10gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcE5hbWUgIT09ICdrZXknICYmIHByb3BWYWx1ZSAhPT0gcHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgcHJvcFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnZnVuY3Rpb24nICYmIHByb3BOYW1lLmxhc3RJbmRleE9mKCdvbicsIDApID09PSAwICYmIGluY2x1ZGVzRXZlbnRzQW5kQXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVFdmVudChkb21Ob2RlLCBwcm9wTmFtZS5zdWJzdHIoMiksIHByb3BWYWx1ZSwgbmV4dFdyYXBwZXIubm9kZS5iaW5kLCBwcmV2aW91c1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgcHJvcE5hbWUgIT09ICdpbm5lckhUTUwnICYmIGluY2x1ZGVzRXZlbnRzQW5kQXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGUoZG9tTm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgbmV4dFdyYXBwZXIubmFtZXNwYWNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocHJvcE5hbWUgPT09ICdzY3JvbGxMZWZ0JyB8fCBwcm9wTmFtZSA9PT0gJ3Njcm9sbFRvcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbU5vZGVbcHJvcE5hbWVdICE9PSBwcm9wVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGVbcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlW3Byb3BOYW1lXSA9IHByb3BWYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBydW5EZWZlcnJlZFJlbmRlckNhbGxiYWNrcygpIHtcclxuICAgICAgICBjb25zdCB7IHN5bmMgfSA9IF9tb3VudE9wdGlvbnM7XHJcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gX2RlZmVycmVkUmVuZGVyQ2FsbGJhY2tzO1xyXG4gICAgICAgIF9kZWZlcnJlZFJlbmRlckNhbGxiYWNrcyA9IFtdO1xyXG4gICAgICAgIGlmIChjYWxsYmFja3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJ1biA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjaztcclxuICAgICAgICAgICAgICAgIHdoaWxlICgoY2FsbGJhY2sgPSBjYWxsYmFja3Muc2hpZnQoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoc3luYykge1xyXG4gICAgICAgICAgICAgICAgcnVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJ1bik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBydW5BZnRlclJlbmRlckNhbGxiYWNrcygpIHtcclxuICAgICAgICBjb25zdCB7IHN5bmMgfSA9IF9tb3VudE9wdGlvbnM7XHJcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gX2FmdGVyUmVuZGVyQ2FsbGJhY2tzO1xyXG4gICAgICAgIF9hZnRlclJlbmRlckNhbGxiYWNrcyA9IFtdO1xyXG4gICAgICAgIGlmIChjYWxsYmFja3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJ1biA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjaztcclxuICAgICAgICAgICAgICAgIHdoaWxlICgoY2FsbGJhY2sgPSBjYWxsYmFja3Muc2hpZnQoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoc3luYykge1xyXG4gICAgICAgICAgICAgICAgcnVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLnJlcXVlc3RJZGxlQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwucmVxdWVzdElkbGVDYWxsYmFjayhydW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChydW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1Byb3BlcnRpZXMobmV4dCwgcHJldmlvdXNQcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgaWYgKG5leHQubm9kZS5hdHRyaWJ1dGVzICYmIG5leHQubm9kZS5ldmVudHMpIHtcclxuICAgICAgICAgICAgdXBkYXRlQXR0cmlidXRlcyhuZXh0LmRvbU5vZGUsIHByZXZpb3VzUHJvcGVydGllcy5hdHRyaWJ1dGVzIHx8IHt9LCBuZXh0Lm5vZGUuYXR0cmlidXRlcywgbmV4dC5uYW1lc3BhY2UpO1xyXG4gICAgICAgICAgICBzZXRQcm9wZXJ0aWVzKG5leHQuZG9tTm9kZSwgcHJldmlvdXNQcm9wZXJ0aWVzLnByb3BlcnRpZXMsIG5leHQsIGZhbHNlKTtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gbmV4dC5ub2RlLmV2ZW50cyB8fCB7fTtcclxuICAgICAgICAgICAgaWYgKHByZXZpb3VzUHJvcGVydGllcy5ldmVudHMpIHtcclxuICAgICAgICAgICAgICAgIHJlbW92ZU9ycGhhbmVkRXZlbnRzKG5leHQuZG9tTm9kZSwgcHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50cyB8fCB7fSwgbmV4dC5ub2RlLmV2ZW50cywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJldmlvdXNQcm9wZXJ0aWVzLmV2ZW50cyA9IHByZXZpb3VzUHJvcGVydGllcy5ldmVudHMgfHwge307XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGV2ZW50cykuZm9yRWFjaCgoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUV2ZW50KG5leHQuZG9tTm9kZSwgZXZlbnQsIGV2ZW50c1tldmVudF0sIG5leHQubm9kZS5iaW5kLCBwcmV2aW91c1Byb3BlcnRpZXMuZXZlbnRzW2V2ZW50XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2V0UHJvcGVydGllcyhuZXh0LmRvbU5vZGUsIHByZXZpb3VzUHJvcGVydGllcy5wcm9wZXJ0aWVzLCBuZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBtb3VudChtb3VudE9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgIF9tb3VudE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBfbW91bnRPcHRpb25zLCBtb3VudE9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHsgZG9tTm9kZSB9ID0gX21vdW50T3B0aW9ucztcclxuICAgICAgICBsZXQgcmVuZGVyUmVzdWx0ID0gcmVuZGVyZXIoKTtcclxuICAgICAgICBpZiAoaXNWTm9kZShyZW5kZXJSZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIHJlbmRlclJlc3VsdCA9IHcod3JhcFZOb2RlcyhyZW5kZXJSZXN1bHQpLCB7fSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5leHRXcmFwcGVyID0ge1xyXG4gICAgICAgICAgICBub2RlOiByZW5kZXJSZXN1bHQsXHJcbiAgICAgICAgICAgIGRlcHRoOiAxXHJcbiAgICAgICAgfTtcclxuICAgICAgICBfcGFyZW50V3JhcHBlck1hcC5zZXQobmV4dFdyYXBwZXIsIHsgZGVwdGg6IDAsIGRvbU5vZGUsIG5vZGU6IHYoJ2Zha2UnKSB9KTtcclxuICAgICAgICBfcHJvY2Vzc1F1ZXVlLnB1c2goe1xyXG4gICAgICAgICAgICBjdXJyZW50OiBbXSxcclxuICAgICAgICAgICAgbmV4dDogW25leHRXcmFwcGVyXSxcclxuICAgICAgICAgICAgbWV0YTogeyBtZXJnZU5vZGVzOiBhcnJheUZyb20oZG9tTm9kZS5jaGlsZE5vZGVzKSB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgX3J1blByb2Nlc3NRdWV1ZSgpO1xyXG4gICAgICAgIF9tb3VudE9wdGlvbnMubWVyZ2UgPSBmYWxzZTtcclxuICAgICAgICBfcnVuRG9tSW5zdHJ1Y3Rpb25RdWV1ZSgpO1xyXG4gICAgICAgIF9ydW5DYWxsYmFja3MoKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGludmFsaWRhdGUoKSB7XHJcbiAgICAgICAgcGFyZW50SW52YWxpZGF0ZSAmJiBwYXJlbnRJbnZhbGlkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfc2NoZWR1bGUoKSB7XHJcbiAgICAgICAgY29uc3QgeyBzeW5jIH0gPSBfbW91bnRPcHRpb25zO1xyXG4gICAgICAgIGlmIChzeW5jKSB7XHJcbiAgICAgICAgICAgIF9ydW5JbnZhbGlkYXRpb25RdWV1ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghX3JlbmRlclNjaGVkdWxlZCkge1xyXG4gICAgICAgICAgICBfcmVuZGVyU2NoZWR1bGVkID0gZ2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfcnVuSW52YWxpZGF0aW9uUXVldWUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX3J1bkludmFsaWRhdGlvblF1ZXVlKCkge1xyXG4gICAgICAgIF9yZW5kZXJTY2hlZHVsZWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgaW52YWxpZGF0aW9uUXVldWUgPSBbLi4uX2ludmFsaWRhdGlvblF1ZXVlXTtcclxuICAgICAgICBjb25zdCBwcmV2aW91c2x5UmVuZGVyZWQgPSBbXTtcclxuICAgICAgICBfaW52YWxpZGF0aW9uUXVldWUgPSBbXTtcclxuICAgICAgICBpbnZhbGlkYXRpb25RdWV1ZS5zb3J0KChhLCBiKSA9PiBiLmRlcHRoIC0gYS5kZXB0aCk7XHJcbiAgICAgICAgbGV0IGl0ZW07XHJcbiAgICAgICAgd2hpbGUgKChpdGVtID0gaW52YWxpZGF0aW9uUXVldWUucG9wKCkpKSB7XHJcbiAgICAgICAgICAgIGxldCB7IGluc3RhbmNlIH0gPSBpdGVtO1xyXG4gICAgICAgICAgICBpZiAocHJldmlvdXNseVJlbmRlcmVkLmluZGV4T2YoaW5zdGFuY2UpID09PSAtMSAmJiBfaW5zdGFuY2VUb1dyYXBwZXJNYXAuaGFzKGluc3RhbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNseVJlbmRlcmVkLnB1c2goaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IF9pbnN0YW5jZVRvV3JhcHBlck1hcC5nZXQoaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KGluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IF9wYXJlbnRXcmFwcGVyTWFwLmdldChjdXJyZW50KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNpYmxpbmcgPSBfd3JhcHBlclNpYmxpbmdNYXAuZ2V0KGN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBjb25zdHJ1Y3RvciwgY2hpbGRyZW4gfSA9IGluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFdOT0RFLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXRDb25zdHJ1Y3RvcjogY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IGluc3RhbmNlRGF0YS5pbnB1dFByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZDogY3VycmVudC5ub2RlLmJpbmRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoOiBjdXJyZW50LmRlcHRoXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcGFyZW50ICYmIF9wYXJlbnRXcmFwcGVyTWFwLnNldChuZXh0LCBwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgc2libGluZyAmJiBfd3JhcHBlclNpYmxpbmdNYXAuc2V0KG5leHQsIHNpYmxpbmcpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBpdGVtIH0gPSBfdXBkYXRlV2lkZ2V0KHsgY3VycmVudCwgbmV4dCB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3Byb2Nlc3NRdWV1ZS5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlICYmIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5zZXQoaW5zdGFuY2UsIG5leHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9ydW5Qcm9jZXNzUXVldWUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBfcnVuRG9tSW5zdHJ1Y3Rpb25RdWV1ZSgpO1xyXG4gICAgICAgIF9ydW5DYWxsYmFja3MoKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9ydW5Qcm9jZXNzUXVldWUoKSB7XHJcbiAgICAgICAgbGV0IGl0ZW07XHJcbiAgICAgICAgd2hpbGUgKChpdGVtID0gX3Byb2Nlc3NRdWV1ZS5wb3AoKSkpIHtcclxuICAgICAgICAgICAgaWYgKGlzQXR0YWNoQXBwbGljYXRpb24oaXRlbSkpIHtcclxuICAgICAgICAgICAgICAgIF9hcHBsaWNhdGlvblF1ZXVlLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGN1cnJlbnQsIG5leHQsIG1ldGEgfSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICBfcHJvY2VzcyhjdXJyZW50IHx8IEVNUFRZX0FSUkFZLCBuZXh0IHx8IEVNUFRZX0FSUkFZLCBtZXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9ydW5Eb21JbnN0cnVjdGlvblF1ZXVlKCkge1xyXG4gICAgICAgIF9hcHBsaWNhdGlvblF1ZXVlLnJldmVyc2UoKTtcclxuICAgICAgICBsZXQgaXRlbTtcclxuICAgICAgICB3aGlsZSAoKGl0ZW0gPSBfYXBwbGljYXRpb25RdWV1ZS5wb3AoKSkpIHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgcGFyZW50RG9tTm9kZSwgbmV4dCwgbmV4dDogeyBkb21Ob2RlLCBtZXJnZWQsIHJlcXVpcmVzSW5zZXJ0QmVmb3JlLCBub2RlOiB7IHByb3BlcnRpZXMgfSB9IH0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Byb3BlcnRpZXMobmV4dCwgeyBwcm9wZXJ0aWVzOiB7fSB9KTtcclxuICAgICAgICAgICAgICAgIHJ1bkRlZmVycmVkUHJvcGVydGllcyhuZXh0KTtcclxuICAgICAgICAgICAgICAgIGlmICghbWVyZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluc2VydEJlZm9yZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVxdWlyZXNJbnNlcnRCZWZvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0QmVmb3JlID0gZmluZEluc2VydEJlZm9yZShuZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RG9tTm9kZS5pbnNlcnRCZWZvcmUoZG9tTm9kZSwgaW5zZXJ0QmVmb3JlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEb21WTm9kZShuZXh0Lm5vZGUpICYmIG5leHQubm9kZS5vbkF0dGFjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Lm5vZGUub25BdHRhY2goKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBydW5FbnRlckFuaW1hdGlvbihuZXh0LCBfbW91bnRPcHRpb25zLnRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KG5leHQubm9kZS5iaW5kKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLmtleSAhPSBudWxsICYmIGluc3RhbmNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlRGF0YS5ub2RlSGFuZGxlci5hZGQoZG9tTm9kZSwgYCR7cHJvcGVydGllcy5rZXl9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpdGVtLm5leHQuaW5zZXJ0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgbmV4dCwgbmV4dDogeyBkb21Ob2RlLCBub2RlIH0sIGN1cnJlbnQgfSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBfcGFyZW50V3JhcHBlck1hcC5nZXQobmV4dCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50ICYmIGlzV05vZGVXcmFwcGVyKHBhcmVudCkgJiYgcGFyZW50Lmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KHBhcmVudC5pbnN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VEYXRhICYmIGluc3RhbmNlRGF0YS5ub2RlSGFuZGxlci5hZGRSb290KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aW91c1Byb3BlcnRpZXMgPSBidWlsZFByZXZpb3VzUHJvcGVydGllcyhkb21Ob2RlLCBjdXJyZW50LCBuZXh0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlRGF0YSA9IHdpZGdldEluc3RhbmNlTWFwLmdldChuZXh0Lm5vZGUuYmluZCk7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzUHJvcGVydGllcyhuZXh0LCBwcmV2aW91c1Byb3BlcnRpZXMpO1xyXG4gICAgICAgICAgICAgICAgcnVuRGVmZXJyZWRQcm9wZXJ0aWVzKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlRGF0YSAmJiBub2RlLnByb3BlcnRpZXMua2V5ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZURhdGEubm9kZUhhbmRsZXIuYWRkKG5leHQuZG9tTm9kZSwgYCR7bm9kZS5wcm9wZXJ0aWVzLmtleX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdkZWxldGUnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IGN1cnJlbnQgfSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5ub2RlLnByb3BlcnRpZXMuZXhpdEFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bkV4aXRBbmltYXRpb24oY3VycmVudCwgX21vdW50T3B0aW9ucy50cmFuc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGN1cnJlbnQuZG9tTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5kb21Ob2RlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ2F0dGFjaCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgaW5zdGFuY2UsIGF0dGFjaGVkIH0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KGluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlRGF0YS5ub2RlSGFuZGxlci5hZGRSb290KCk7XHJcbiAgICAgICAgICAgICAgICBhdHRhY2hlZCAmJiBpbnN0YW5jZURhdGEub25BdHRhY2goKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdkZXRhY2gnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jdXJyZW50Lmluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KGl0ZW0uY3VycmVudC5pbnN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VEYXRhICYmIGluc3RhbmNlRGF0YS5vbkRldGFjaCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaXRlbS5jdXJyZW50LmRvbU5vZGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICBpdGVtLmN1cnJlbnQubm9kZS5iaW5kID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgaXRlbS5jdXJyZW50Lmluc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX3J1bkNhbGxiYWNrcygpIHtcclxuICAgICAgICBydW5BZnRlclJlbmRlckNhbGxiYWNrcygpO1xyXG4gICAgICAgIHJ1bkRlZmVycmVkUmVuZGVyQ2FsbGJhY2tzKCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfcHJvY2Vzc01lcmdlTm9kZXMobmV4dCwgbWVyZ2VOb2Rlcykge1xyXG4gICAgICAgIGNvbnN0IHsgbWVyZ2UgfSA9IF9tb3VudE9wdGlvbnM7XHJcbiAgICAgICAgaWYgKG1lcmdlICYmIG1lcmdlTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1ZOb2RlV3JhcHBlcihuZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHsgbm9kZTogeyB0YWcgfSB9ID0gbmV4dDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVyZ2VOb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbUVsZW1lbnQgPSBtZXJnZU5vZGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWcudG9VcHBlckNhc2UoKSA9PT0gKGRvbUVsZW1lbnQudGFnTmFtZSB8fCAnJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VOb2Rlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQuZG9tTm9kZSA9IGRvbUVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5leHQubWVyZ2VOb2RlcyA9IG1lcmdlTm9kZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKGNoaWxkTm9kZXMsIGluZGV4KSB7XHJcbiAgICAgICAgX2FmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnRXTm9kZVdyYXBwZXIgPSBmaW5kUGFyZW50V05vZGVXcmFwcGVyKGNoaWxkTm9kZXNbaW5kZXhdKTtcclxuICAgICAgICAgICAgY2hlY2tEaXN0aW5ndWlzaGFibGUoY2hpbGROb2RlcywgaW5kZXgsIHBhcmVudFdOb2RlV3JhcHBlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfcHJvY2VzcyhjdXJyZW50LCBuZXh0LCBtZXRhID0ge30pIHtcclxuICAgICAgICBsZXQgeyBtZXJnZU5vZGVzID0gW10sIG9sZEluZGV4ID0gMCwgbmV3SW5kZXggPSAwIH0gPSBtZXRhO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRMZW5ndGggPSBjdXJyZW50Lmxlbmd0aDtcclxuICAgICAgICBjb25zdCBuZXh0TGVuZ3RoID0gbmV4dC5sZW5ndGg7XHJcbiAgICAgICAgY29uc3QgaGFzUHJldmlvdXNTaWJsaW5ncyA9IGN1cnJlbnRMZW5ndGggPiAxIHx8IChjdXJyZW50TGVuZ3RoID4gMCAmJiBjdXJyZW50TGVuZ3RoIDwgbmV4dExlbmd0aCk7XHJcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25zID0gW107XHJcbiAgICAgICAgaWYgKG5ld0luZGV4IDwgbmV4dExlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudFdyYXBwZXIgPSBvbGRJbmRleCA8IGN1cnJlbnRMZW5ndGggPyBjdXJyZW50W29sZEluZGV4XSA6IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY29uc3QgbmV4dFdyYXBwZXIgPSBuZXh0W25ld0luZGV4XTtcclxuICAgICAgICAgICAgbmV4dFdyYXBwZXIuaGFzUHJldmlvdXNTaWJsaW5ncyA9IGhhc1ByZXZpb3VzU2libGluZ3M7XHJcbiAgICAgICAgICAgIF9wcm9jZXNzTWVyZ2VOb2RlcyhuZXh0V3JhcHBlciwgbWVyZ2VOb2Rlcyk7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50V3JhcHBlciAmJiBzYW1lKGN1cnJlbnRXcmFwcGVyLCBuZXh0V3JhcHBlcikpIHtcclxuICAgICAgICAgICAgICAgIG9sZEluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzVk5vZGVXcmFwcGVyKGN1cnJlbnRXcmFwcGVyKSAmJiBpc1ZOb2RlV3JhcHBlcihuZXh0V3JhcHBlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0V3JhcHBlci5pbnNlcnRlZCA9IGN1cnJlbnRXcmFwcGVyLmluc2VydGVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiBjdXJyZW50V3JhcHBlciwgbmV4dDogbmV4dFdyYXBwZXIgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIWN1cnJlbnRXcmFwcGVyIHx8IGZpbmRJbmRleE9mQ2hpbGQoY3VycmVudCwgbmV4dFdyYXBwZXIsIG9sZEluZGV4ICsgMSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0cnVlICYmIGN1cnJlbnQubGVuZ3RoICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2sobmV4dCwgbmV3SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiB1bmRlZmluZWQsIG5leHQ6IG5leHRXcmFwcGVyIH0pO1xyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChmaW5kSW5kZXhPZkNoaWxkKG5leHQsIGN1cnJlbnRXcmFwcGVyLCBuZXdJbmRleCArIDEpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdHJ1ZSAmJiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKGN1cnJlbnQsIG9sZEluZGV4KTtcclxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9ucy5wdXNoKHsgY3VycmVudDogY3VycmVudFdyYXBwZXIsIG5leHQ6IHVuZGVmaW5lZCB9KTtcclxuICAgICAgICAgICAgICAgIG9sZEluZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0cnVlICYmIHJlZ2lzdGVyRGlzdGluZ3Vpc2hhYmxlQ2FsbGJhY2sobmV4dCwgbmV3SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgdHJ1ZSAmJiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKGN1cnJlbnQsIG9sZEluZGV4KTtcclxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9ucy5wdXNoKHsgY3VycmVudDogY3VycmVudFdyYXBwZXIsIG5leHQ6IHVuZGVmaW5lZCB9KTtcclxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9ucy5wdXNoKHsgY3VycmVudDogdW5kZWZpbmVkLCBuZXh0OiBuZXh0V3JhcHBlciB9KTtcclxuICAgICAgICAgICAgICAgIG9sZEluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZXdJbmRleCA8IG5leHRMZW5ndGgpIHtcclxuICAgICAgICAgICAgX3Byb2Nlc3NRdWV1ZS5wdXNoKHsgY3VycmVudCwgbmV4dCwgbWV0YTogeyBtZXJnZU5vZGVzLCBvbGRJbmRleCwgbmV3SW5kZXggfSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1cnJlbnRMZW5ndGggPiBvbGRJbmRleCAmJiBuZXdJbmRleCA+PSBuZXh0TGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBvbGRJbmRleDsgaSA8IGN1cnJlbnRMZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdHJ1ZSAmJiByZWdpc3RlckRpc3Rpbmd1aXNoYWJsZUNhbGxiYWNrKGN1cnJlbnQsIGkpO1xyXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb25zLnB1c2goeyBjdXJyZW50OiBjdXJyZW50W2ldLCBuZXh0OiB1bmRlZmluZWQgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnN0cnVjdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgeyBpdGVtLCBkb20sIHdpZGdldCB9ID0gX3Byb2Nlc3NPbmUoaW5zdHJ1Y3Rpb25zW2ldKTtcclxuICAgICAgICAgICAgd2lkZ2V0ICYmIF9wcm9jZXNzUXVldWUucHVzaCh3aWRnZXQpO1xyXG4gICAgICAgICAgICBpdGVtICYmIF9wcm9jZXNzUXVldWUucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgZG9tICYmIF9hcHBsaWNhdGlvblF1ZXVlLnB1c2goZG9tKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfcHJvY2Vzc09uZSh7IGN1cnJlbnQsIG5leHQgfSkge1xyXG4gICAgICAgIGlmIChjdXJyZW50ICE9PSBuZXh0KSB7XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudCAmJiBuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZVdyYXBwZXIobmV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NyZWF0ZURvbSh7IG5leHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NyZWF0ZVdpZGdldCh7IG5leHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudCAmJiBuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZVdyYXBwZXIoY3VycmVudCkgJiYgaXNWTm9kZVdyYXBwZXIobmV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3VwZGF0ZURvbSh7IGN1cnJlbnQsIG5leHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc1dOb2RlV3JhcHBlcihjdXJyZW50KSAmJiBpc1dOb2RlV3JhcHBlcihuZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdXBkYXRlV2lkZ2V0KHsgY3VycmVudCwgbmV4dCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChjdXJyZW50ICYmICFuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZVdyYXBwZXIoY3VycmVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlbW92ZURvbSh7IGN1cnJlbnQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc1dOb2RlV3JhcHBlcihjdXJyZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVtb3ZlV2lkZ2V0KHsgY3VycmVudCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge307XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfY3JlYXRlV2lkZ2V0KHsgbmV4dCB9KSB7XHJcbiAgICAgICAgbGV0IHsgbm9kZTogeyB3aWRnZXRDb25zdHJ1Y3RvciB9IH0gPSBuZXh0O1xyXG4gICAgICAgIGxldCB7IHJlZ2lzdHJ5IH0gPSBfbW91bnRPcHRpb25zO1xyXG4gICAgICAgIGlmICghaXNXaWRnZXRCYXNlQ29uc3RydWN0b3Iod2lkZ2V0Q29uc3RydWN0b3IpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgd2lkZ2V0Q29uc3RydWN0b3IoKTtcclxuICAgICAgICBpZiAocmVnaXN0cnkpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UucmVnaXN0cnkuYmFzZSA9IHJlZ2lzdHJ5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQoaW5zdGFuY2UpO1xyXG4gICAgICAgIGluc3RhbmNlRGF0YS5pbnZhbGlkYXRlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBpbnN0YW5jZURhdGEuZGlydHkgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlRGF0YS5yZW5kZXJpbmcgJiYgX2luc3RhbmNlVG9XcmFwcGVyTWFwLmhhcyhpbnN0YW5jZSkpIHtcclxuICAgICAgICAgICAgICAgIF9pbnZhbGlkYXRpb25RdWV1ZS5wdXNoKHsgaW5zdGFuY2UsIGRlcHRoOiBuZXh0LmRlcHRoIH0pO1xyXG4gICAgICAgICAgICAgICAgX3NjaGVkdWxlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGluc3RhbmNlRGF0YS5yZW5kZXJpbmcgPSB0cnVlO1xyXG4gICAgICAgIGluc3RhbmNlLl9fc2V0UHJvcGVydGllc19fKG5leHQubm9kZS5wcm9wZXJ0aWVzLCBuZXh0Lm5vZGUuYmluZCk7XHJcbiAgICAgICAgaW5zdGFuY2UuX19zZXRDaGlsZHJlbl9fKG5leHQubm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgbmV4dC5pbnN0YW5jZSA9IGluc3RhbmNlO1xyXG4gICAgICAgIGxldCByZW5kZXJlZCA9IGluc3RhbmNlLl9fcmVuZGVyX18oKTtcclxuICAgICAgICBpbnN0YW5jZURhdGEucmVuZGVyaW5nID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHJlbmRlcmVkKSB7XHJcbiAgICAgICAgICAgIHJlbmRlcmVkID0gQXJyYXkuaXNBcnJheShyZW5kZXJlZCkgPyByZW5kZXJlZCA6IFtyZW5kZXJlZF07XHJcbiAgICAgICAgICAgIG5leHQuY2hpbGRyZW5XcmFwcGVycyA9IHJlbmRlcmVkVG9XcmFwcGVyKHJlbmRlcmVkLCBuZXh0LCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5leHQuaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgX2luc3RhbmNlVG9XcmFwcGVyTWFwLnNldChuZXh0Lmluc3RhbmNlLCBuZXh0KTtcclxuICAgICAgICAgICAgaWYgKCFwYXJlbnRJbnZhbGlkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRJbnZhbGlkYXRlID0gbmV4dC5pbnN0YW5jZS5pbnZhbGlkYXRlLmJpbmQobmV4dC5pbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXRlbTogeyBuZXh0OiBuZXh0LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHsgbWVyZ2VOb2RlczogbmV4dC5tZXJnZU5vZGVzIH0gfSxcclxuICAgICAgICAgICAgd2lkZ2V0OiB7IHR5cGU6ICdhdHRhY2gnLCBpbnN0YW5jZSwgYXR0YWNoZWQ6IHRydWUgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfdXBkYXRlV2lkZ2V0KHsgY3VycmVudCwgbmV4dCB9KSB7XHJcbiAgICAgICAgY3VycmVudCA9IChjdXJyZW50Lmluc3RhbmNlICYmIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5nZXQoY3VycmVudC5pbnN0YW5jZSkpIHx8IGN1cnJlbnQ7XHJcbiAgICAgICAgY29uc3QgeyBpbnN0YW5jZSwgZG9tTm9kZSwgaGFzQW5pbWF0aW9ucyB9ID0gY3VycmVudDtcclxuICAgICAgICBpZiAoIWluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5zdGFuY2VEYXRhID0gd2lkZ2V0SW5zdGFuY2VNYXAuZ2V0KGluc3RhbmNlKTtcclxuICAgICAgICBuZXh0Lmluc3RhbmNlID0gaW5zdGFuY2U7XHJcbiAgICAgICAgbmV4dC5kb21Ob2RlID0gZG9tTm9kZTtcclxuICAgICAgICBuZXh0Lmhhc0FuaW1hdGlvbnMgPSBoYXNBbmltYXRpb25zO1xyXG4gICAgICAgIGluc3RhbmNlRGF0YS5yZW5kZXJpbmcgPSB0cnVlO1xyXG4gICAgICAgIGluc3RhbmNlLl9fc2V0UHJvcGVydGllc19fKG5leHQubm9kZS5wcm9wZXJ0aWVzLCBuZXh0Lm5vZGUuYmluZCk7XHJcbiAgICAgICAgaW5zdGFuY2UuX19zZXRDaGlsZHJlbl9fKG5leHQubm9kZS5jaGlsZHJlbik7XHJcbiAgICAgICAgX2luc3RhbmNlVG9XcmFwcGVyTWFwLnNldChuZXh0Lmluc3RhbmNlLCBuZXh0KTtcclxuICAgICAgICBpZiAoaW5zdGFuY2VEYXRhLmRpcnR5KSB7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXJlZCA9IGluc3RhbmNlLl9fcmVuZGVyX18oKTtcclxuICAgICAgICAgICAgaW5zdGFuY2VEYXRhLnJlbmRlcmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAocmVuZGVyZWQpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlcmVkID0gQXJyYXkuaXNBcnJheShyZW5kZXJlZCkgPyByZW5kZXJlZCA6IFtyZW5kZXJlZF07XHJcbiAgICAgICAgICAgICAgICBuZXh0LmNoaWxkcmVuV3JhcHBlcnMgPSByZW5kZXJlZFRvV3JhcHBlcihyZW5kZXJlZCwgbmV4dCwgY3VycmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW06IHsgY3VycmVudDogY3VycmVudC5jaGlsZHJlbldyYXBwZXJzLCBuZXh0OiBuZXh0LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHt9IH0sXHJcbiAgICAgICAgICAgICAgICB3aWRnZXQ6IHsgdHlwZTogJ2F0dGFjaCcsIGluc3RhbmNlLCBhdHRhY2hlZDogZmFsc2UgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnN0YW5jZURhdGEucmVuZGVyaW5nID0gZmFsc2U7XHJcbiAgICAgICAgbmV4dC5jaGlsZHJlbldyYXBwZXJzID0gY3VycmVudC5jaGlsZHJlbldyYXBwZXJzO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHdpZGdldDogeyB0eXBlOiAnYXR0YWNoJywgaW5zdGFuY2UsIGF0dGFjaGVkOiBmYWxzZSB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9yZW1vdmVXaWRnZXQoeyBjdXJyZW50IH0pIHtcclxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5pbnN0YW5jZSA/IF9pbnN0YW5jZVRvV3JhcHBlck1hcC5nZXQoY3VycmVudC5pbnN0YW5jZSkgOiBjdXJyZW50O1xyXG4gICAgICAgIF93cmFwcGVyU2libGluZ01hcC5kZWxldGUoY3VycmVudCk7XHJcbiAgICAgICAgX3BhcmVudFdyYXBwZXJNYXAuZGVsZXRlKGN1cnJlbnQpO1xyXG4gICAgICAgIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5kZWxldGUoY3VycmVudC5pbnN0YW5jZSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaXRlbTogeyBjdXJyZW50OiBjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHt9IH0sXHJcbiAgICAgICAgICAgIHdpZGdldDogeyB0eXBlOiAnZGV0YWNoJywgY3VycmVudCB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9jcmVhdGVEb20oeyBuZXh0IH0pIHtcclxuICAgICAgICBsZXQgbWVyZ2VOb2RlcyA9IFtdO1xyXG4gICAgICAgIGlmICghbmV4dC5kb21Ob2RlKSB7XHJcbiAgICAgICAgICAgIGlmIChuZXh0Lm5vZGUuZG9tTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgbmV4dC5kb21Ob2RlID0gbmV4dC5ub2RlLmRvbU5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dC5ub2RlLnRhZyA9PT0gJ3N2ZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0Lm5hbWVzcGFjZSA9IE5BTUVTUEFDRV9TVkc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dC5ub2RlLnRhZykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Lm5hbWVzcGFjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0LmRvbU5vZGUgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5leHQubmFtZXNwYWNlLCBuZXh0Lm5vZGUudGFnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQuZG9tTm9kZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KG5leHQubm9kZS50YWcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5leHQubm9kZS50ZXh0ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0LmRvbU5vZGUgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobmV4dC5ub2RlLnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuZXh0Lm1lcmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZXh0LmRvbU5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKF9tb3VudE9wdGlvbnMubWVyZ2UpIHtcclxuICAgICAgICAgICAgICAgIG1lcmdlTm9kZXMgPSBhcnJheUZyb20obmV4dC5kb21Ob2RlLmNoaWxkTm9kZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXh0Lm5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIG5leHQuY2hpbGRyZW5XcmFwcGVycyA9IHJlbmRlcmVkVG9XcmFwcGVyKG5leHQubm9kZS5jaGlsZHJlbiwgbmV4dCwgbnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGFyZW50V05vZGVXcmFwcGVyID0gZmluZFBhcmVudFdOb2RlV3JhcHBlcihuZXh0KTtcclxuICAgICAgICBpZiAocGFyZW50V05vZGVXcmFwcGVyICYmICFwYXJlbnRXTm9kZVdyYXBwZXIuZG9tTm9kZSkge1xyXG4gICAgICAgICAgICBwYXJlbnRXTm9kZVdyYXBwZXIuZG9tTm9kZSA9IG5leHQuZG9tTm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZG9tID0ge1xyXG4gICAgICAgICAgICBuZXh0OiBuZXh0LFxyXG4gICAgICAgICAgICBwYXJlbnREb21Ob2RlOiBmaW5kUGFyZW50RG9tTm9kZShuZXh0KSxcclxuICAgICAgICAgICAgdHlwZTogJ2NyZWF0ZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChuZXh0LmNoaWxkcmVuV3JhcHBlcnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW06IHsgY3VycmVudDogW10sIG5leHQ6IG5leHQuY2hpbGRyZW5XcmFwcGVycywgbWV0YTogeyBtZXJnZU5vZGVzIH0gfSxcclxuICAgICAgICAgICAgICAgIGRvbVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyBkb20gfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF91cGRhdGVEb20oeyBjdXJyZW50LCBuZXh0IH0pIHtcclxuICAgICAgICBjb25zdCBwYXJlbnREb21Ob2RlID0gZmluZFBhcmVudERvbU5vZGUoY3VycmVudCk7XHJcbiAgICAgICAgbmV4dC5kb21Ob2RlID0gY3VycmVudC5kb21Ob2RlO1xyXG4gICAgICAgIG5leHQubmFtZXNwYWNlID0gY3VycmVudC5uYW1lc3BhY2U7XHJcbiAgICAgICAgaWYgKG5leHQubm9kZS50ZXh0ICYmIG5leHQubm9kZS50ZXh0ICE9PSBjdXJyZW50Lm5vZGUudGV4dCkge1xyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkVGV4dE5vZGUgPSBwYXJlbnREb21Ob2RlLm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobmV4dC5ub2RlLnRleHQpO1xyXG4gICAgICAgICAgICBwYXJlbnREb21Ob2RlLnJlcGxhY2VDaGlsZCh1cGRhdGVkVGV4dE5vZGUsIG5leHQuZG9tTm9kZSk7XHJcbiAgICAgICAgICAgIG5leHQuZG9tTm9kZSA9IHVwZGF0ZWRUZXh0Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobmV4dC5ub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gcmVuZGVyZWRUb1dyYXBwZXIobmV4dC5ub2RlLmNoaWxkcmVuLCBuZXh0LCBjdXJyZW50KTtcclxuICAgICAgICAgICAgbmV4dC5jaGlsZHJlbldyYXBwZXJzID0gY2hpbGRyZW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGl0ZW06IHsgY3VycmVudDogY3VycmVudC5jaGlsZHJlbldyYXBwZXJzLCBuZXh0OiBuZXh0LmNoaWxkcmVuV3JhcHBlcnMsIG1ldGE6IHt9IH0sXHJcbiAgICAgICAgICAgIGRvbTogeyB0eXBlOiAndXBkYXRlJywgbmV4dCwgY3VycmVudCB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9yZW1vdmVEb20oeyBjdXJyZW50IH0pIHtcclxuICAgICAgICBfd3JhcHBlclNpYmxpbmdNYXAuZGVsZXRlKGN1cnJlbnQpO1xyXG4gICAgICAgIF9wYXJlbnRXcmFwcGVyTWFwLmRlbGV0ZShjdXJyZW50KTtcclxuICAgICAgICBjdXJyZW50Lm5vZGUuYmluZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAoY3VycmVudC5oYXNBbmltYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtOiB7IGN1cnJlbnQ6IGN1cnJlbnQuY2hpbGRyZW5XcmFwcGVycywgbWV0YToge30gfSxcclxuICAgICAgICAgICAgICAgIGRvbTogeyB0eXBlOiAnZGVsZXRlJywgY3VycmVudCB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjdXJyZW50LmNoaWxkcmVuV3JhcHBlcnMpIHtcclxuICAgICAgICAgICAgX2FmdGVyUmVuZGVyQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdyYXBwZXJzID0gY3VycmVudC5jaGlsZHJlbldyYXBwZXJzIHx8IFtdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHdyYXBwZXI7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoKHdyYXBwZXIgPSB3cmFwcGVycy5wb3AoKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod3JhcHBlci5jaGlsZHJlbldyYXBwZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZXJzLnB1c2goLi4ud3JhcHBlci5jaGlsZHJlbldyYXBwZXJzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5jaGlsZHJlbldyYXBwZXJzID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNXTm9kZVdyYXBwZXIod3JhcHBlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdyYXBwZXIuaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pbnN0YW5jZVRvV3JhcHBlck1hcC5kZWxldGUod3JhcHBlci5pbnN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZURhdGEgPSB3aWRnZXRJbnN0YW5jZU1hcC5nZXQod3JhcHBlci5pbnN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZURhdGEgJiYgaW5zdGFuY2VEYXRhLm9uRGV0YWNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5pbnN0YW5jZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgX3dyYXBwZXJTaWJsaW5nTWFwLmRlbGV0ZSh3cmFwcGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBfcGFyZW50V3JhcHBlck1hcC5kZWxldGUod3JhcHBlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5kb21Ob2RlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIubm9kZS5iaW5kID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZG9tOiB7IHR5cGU6ICdkZWxldGUnLCBjdXJyZW50IH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtb3VudCxcclxuICAgICAgICBpbnZhbGlkYXRlXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IHJlbmRlcmVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD12ZG9tLm1qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvdmRvbS5tanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS92ZG9tLm1qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3RoZW1lcy9kb2pvL2luZGV4LmNzc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIiFmdW5jdGlvbihfLG8pe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPW8oKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLG8pOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuZG9qbz1vKCk6Xy5kb2pvPW8oKX0odGhpcyxmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihfKXt2YXIgbz17fTtmdW5jdGlvbiBlKHQpe2lmKG9bdF0pcmV0dXJuIG9bdF0uZXhwb3J0czt2YXIgaT1vW3RdPXtpOnQsbDohMSxleHBvcnRzOnt9fTtyZXR1cm4gX1t0XS5jYWxsKGkuZXhwb3J0cyxpLGkuZXhwb3J0cyxlKSxpLmw9ITAsaS5leHBvcnRzfXJldHVybiBlLm09XyxlLmM9byxlLmQ9ZnVuY3Rpb24oXyxvLHQpe2UubyhfLG8pfHxPYmplY3QuZGVmaW5lUHJvcGVydHkoXyxvLHtjb25maWd1cmFibGU6ITEsZW51bWVyYWJsZTohMCxnZXQ6dH0pfSxlLm49ZnVuY3Rpb24oXyl7dmFyIG89XyYmXy5fX2VzTW9kdWxlP2Z1bmN0aW9uKCl7cmV0dXJuIF8uZGVmYXVsdH06ZnVuY3Rpb24oKXtyZXR1cm4gX307cmV0dXJuIGUuZChvLFwiYVwiLG8pLG99LGUubz1mdW5jdGlvbihfLG8pe3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXyxvKX0sZS5wPVwiXCIsZShlLnM9MCl9KFtmdW5jdGlvbihfLG8sZSl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHQ9ZSgxKSxpPWUoMiksbj1lKDMpLHI9ZSg0KSxkPWUoNSksYT1lKDYpLGw9ZSg3KSxjPWUoOCksbT1lKDkpLHM9ZSgxMCkscD1lKDExKSx1PWUoMTIpLGI9ZSgxMyksZz1lKDE0KSxoPWUoMTUpLHg9ZSgxNiksZj1lKDE3KSx5PWUoMTgpLGs9ZSgxOSksaj1lKDIwKSx3PWUoMjEpLEk9ZSgyMiksdj1lKDIzKSxUPWUoMjQpLFI9ZSgyNSksQj1lKDI2KSxMPWUoMjcpLEY9ZSgyOCksVz1lKDI5KSxBPWUoMzApO28uZGVmYXVsdD17XCJAZG9qby93aWRnZXRzL2FjY29yZGlvbi1wYW5lXCI6dCxcIkBkb2pvL3dpZGdldHMvYnV0dG9uXCI6aSxcIkBkb2pvL3dpZGdldHMvY2FsZW5kYXJcIjpuLFwiQGRvam8vd2lkZ2V0cy9jaGVja2JveFwiOnIsXCJAZG9qby93aWRnZXRzL2NvbWJvYm94XCI6ZCxcIkBkb2pvL3dpZGdldHMvZGlhbG9nXCI6YSxcIkBkb2pvL3dpZGdldHMvaWNvblwiOmwsXCJAZG9qby93aWRnZXRzL2dyaWRcIjpjLFwiQGRvam8vd2lkZ2V0cy9ncmlkLWJvZHlcIjptLFwiQGRvam8vd2lkZ2V0cy9ncmlkLWNlbGxcIjpzLFwiQGRvam8vd2lkZ2V0cy9ncmlkLWZvb3RlclwiOnAsXCJAZG9qby93aWRnZXRzL2dyaWQtaGVhZGVyXCI6dSxcIkBkb2pvL3dpZGdldHMvZ3JpZC1wbGFjZWhvbGRlci1yb3dcIjpiLFwiQGRvam8vd2lkZ2V0cy9ncmlkLXJvd1wiOmcsXCJAZG9qby93aWRnZXRzL2xhYmVsXCI6aCxcIkBkb2pvL3dpZGdldHMvbGlzdGJveFwiOngsXCJAZG9qby93aWRnZXRzL3Byb2dyZXNzXCI6ZixcIkBkb2pvL3dpZGdldHMvcmFkaW9cIjp5LFwiQGRvam8vd2lkZ2V0cy9zZWxlY3RcIjprLFwiQGRvam8vd2lkZ2V0cy9zbGlkZS1wYW5lXCI6aixcIkBkb2pvL3dpZGdldHMvc2xpZGVyXCI6dyxcIkBkb2pvL3dpZGdldHMvc3BsaXQtcGFuZVwiOkksXCJAZG9qby93aWRnZXRzL3RhYi1jb250cm9sbGVyXCI6dixcIkBkb2pvL3dpZGdldHMvdGV4dC1hcmVhXCI6VCxcIkBkb2pvL3dpZGdldHMvdGV4dC1pbnB1dFwiOlIsXCJAZG9qby93aWRnZXRzL2VuaGFuY2VkLXRleHQtaW5wdXRcIjpCLFwiQGRvam8vd2lkZ2V0cy90aW1lLXBpY2tlclwiOkwsXCJAZG9qby93aWRnZXRzL3RpdGxlLXBhbmVcIjpGLFwiQGRvam8vd2lkZ2V0cy90b29sYmFyXCI6VyxcIkBkb2pvL3dpZGdldHMvdG9vbHRpcFwiOkF9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2FjY29yZGlvbi1wYW5lXCIscm9vdDpcImFjY29yZGlvbi1wYW5lLW1fX3Jvb3RfXzNwcENXXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2J1dHRvblwiLHJvb3Q6XCJidXR0b24tbV9fcm9vdF9fMU1WdU9cIixhZGRvbjpcImJ1dHRvbi1tX19hZGRvbl9fZDBscWJcIixwcmVzc2VkOlwiYnV0dG9uLW1fX3ByZXNzZWRfX3NFSzhRXCIscG9wdXA6XCJidXR0b24tbV9fcG9wdXBfX2l0d2FnXCIsZGlzYWJsZWQ6XCJidXR0b24tbV9fZGlzYWJsZWRfX0dXWVpoXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2NhbGVuZGFyXCIscm9vdDpcImNhbGVuZGFyLW1fX3Jvb3RfXzJFaVk4XCIsZGF0ZUdyaWQ6XCJjYWxlbmRhci1tX19kYXRlR3JpZF9fMVFZRkxcIix3ZWVrZGF5OlwiY2FsZW5kYXItbV9fd2Vla2RheV9fZWMxSkFcIixkYXRlOlwiY2FsZW5kYXItbV9fZGF0ZV9fMkIxUFBcIix0b2RheURhdGU6XCJjYWxlbmRhci1tX190b2RheURhdGVfXzNoZmw4XCIsaW5hY3RpdmVEYXRlOlwiY2FsZW5kYXItbV9faW5hY3RpdmVEYXRlX18ybXZTblwiLHNlbGVjdGVkRGF0ZTpcImNhbGVuZGFyLW1fX3NlbGVjdGVkRGF0ZV9fMkM5d1BcIix0b3BNYXR0ZXI6XCJjYWxlbmRhci1tX190b3BNYXR0ZXJfXzFNOWlRXCIsbW9udGhUcmlnZ2VyOlwiY2FsZW5kYXItbV9fbW9udGhUcmlnZ2VyX19ib2dKMVwiLHllYXJUcmlnZ2VyOlwiY2FsZW5kYXItbV9feWVhclRyaWdnZXJfXzNJSFQ4XCIscHJldmlvdXM6XCJjYWxlbmRhci1tX19wcmV2aW91c19fMkZOR2tcIixuZXh0OlwiY2FsZW5kYXItbV9fbmV4dF9fMmJYbGNcIixtb250aFRyaWdnZXJBY3RpdmU6XCJjYWxlbmRhci1tX19tb250aFRyaWdnZXJBY3RpdmVfXzMzUGZzXCIseWVhclRyaWdnZXJBY3RpdmU6XCJjYWxlbmRhci1tX195ZWFyVHJpZ2dlckFjdGl2ZV9fMUVnOGVcIixtb250aEdyaWQ6XCJjYWxlbmRhci1tX19tb250aEdyaWRfXy0xaEIxXCIseWVhckdyaWQ6XCJjYWxlbmRhci1tX195ZWFyR3JpZF9fM1lueUNcIixtb250aEZpZWxkczpcImNhbGVuZGFyLW1fX21vbnRoRmllbGRzX19wQmJ3VlwiLHllYXJGaWVsZHM6XCJjYWxlbmRhci1tX195ZWFyRmllbGRzX19HTVgtOFwiLG1vbnRoUmFkaW86XCJjYWxlbmRhci1tX19tb250aFJhZGlvX18zWjJGbVwiLHllYXJSYWRpbzpcImNhbGVuZGFyLW1fX3llYXJSYWRpb19fMVhUNm9cIixtb250aFJhZGlvTGFiZWw6XCJjYWxlbmRhci1tX19tb250aFJhZGlvTGFiZWxfXzNLMlJ3XCIseWVhclJhZGlvTGFiZWw6XCJjYWxlbmRhci1tX195ZWFyUmFkaW9MYWJlbF9fMlhqYXBcIixtb250aFJhZGlvQ2hlY2tlZDpcImNhbGVuZGFyLW1fX21vbnRoUmFkaW9DaGVja2VkX18ydVRiUlwiLHllYXJSYWRpb0NoZWNrZWQ6XCJjYWxlbmRhci1tX195ZWFyUmFkaW9DaGVja2VkX18yNGtud1wiLG1vbnRoUmFkaW9JbnB1dDpcImNhbGVuZGFyLW1fX21vbnRoUmFkaW9JbnB1dF9fWWlNdGxcIix5ZWFyUmFkaW9JbnB1dDpcImNhbGVuZGFyLW1fX3llYXJSYWRpb0lucHV0X19LS3NveVwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9jaGVja2JveFwiLHJvb3Q6XCJjaGVja2JveC1tX19yb290X18xbkhpdFwiLGlucHV0OlwiY2hlY2tib3gtbV9faW5wdXRfXzJhdGQwXCIsaW5wdXRXcmFwcGVyOlwiY2hlY2tib3gtbV9faW5wdXRXcmFwcGVyX18xc0ppbCBpY29uLW1fX2NoZWNrSWNvbl9fMm9rSHIgaWNvbi1tX19pY29uX18yNlVzTlwiLGNoZWNrZWQ6XCJjaGVja2JveC1tX19jaGVja2VkX18ycElLUlwiLHRvZ2dsZTpcImNoZWNrYm94LW1fX3RvZ2dsZV9fM2RjaE5cIix0b2dnbGVTd2l0Y2g6XCJjaGVja2JveC1tX190b2dnbGVTd2l0Y2hfXzF2SG1ZXCIsb25MYWJlbDpcImNoZWNrYm94LW1fX29uTGFiZWxfXzFTSFRJXCIsb2ZmTGFiZWw6XCJjaGVja2JveC1tX19vZmZMYWJlbF9fMjNBNmdcIixmb2N1c2VkOlwiY2hlY2tib3gtbV9fZm9jdXNlZF9fMlhYMXVcIixkaXNhYmxlZDpcImNoZWNrYm94LW1fX2Rpc2FibGVkX181Vlc1WFwiLHJlYWRvbmx5OlwiY2hlY2tib3gtbV9fcmVhZG9ubHlfXzNBUFMwXCIsaW52YWxpZDpcImNoZWNrYm94LW1fX2ludmFsaWRfXzNfc01xXCIsdmFsaWQ6XCJjaGVja2JveC1tX192YWxpZF9fM1NpRWJcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvY29tYm9ib3hcIixyb290OlwiY29tYm9ib3gtbV9fcm9vdF9fMXA1RkxcIixjbGVhcmFibGU6XCJjb21ib2JveC1tX19jbGVhcmFibGVfXzEzbTJpXCIsdHJpZ2dlcjpcImNvbWJvYm94LW1fX3RyaWdnZXJfXzNSVTQyXCIsZHJvcGRvd246XCJjb21ib2JveC1tX19kcm9wZG93bl9fM1MxRHpcIixvcGVuOlwiY29tYm9ib3gtbV9fb3Blbl9fMV9xSjFcIixvcHRpb246XCJjb21ib2JveC1tX19vcHRpb25fXzJURmpUXCIsc2VsZWN0ZWQ6XCJjb21ib2JveC1tX19zZWxlY3RlZF9fMlhpajFcIixpbnZhbGlkOlwiY29tYm9ib3gtbV9faW52YWxpZF9fMl9NQWZcIix2YWxpZDpcImNvbWJvYm94LW1fX3ZhbGlkX18zaFlqcFwiLGNsZWFyOlwiY29tYm9ib3gtbV9fY2xlYXJfXzJfeHRTXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2RpYWxvZ1wiLHJvb3Q6XCJkaWFsb2ctbV9fcm9vdF9fY01sYTBcIixtYWluOlwiZGlhbG9nLW1fX21haW5fXzNLdk1CXCIsdW5kZXJsYXlWaXNpYmxlOlwiZGlhbG9nLW1fX3VuZGVybGF5VmlzaWJsZV9fMVVraHJcIix0aXRsZTpcImRpYWxvZy1tX190aXRsZV9fM2dnUklcIixjb250ZW50OlwiZGlhbG9nLW1fX2NvbnRlbnRfXzJFODBGXCIsY2xvc2U6XCJkaWFsb2ctbV9fY2xvc2VfXzM2YU9TXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2ljb25cIixpY29uOlwiaWNvbi1tX19pY29uX18yNlVzTlwiLHBsdXNJY29uOlwiaWNvbi1tX19wbHVzSWNvbl9fMnd1bDdcIixtaW51c0ljb246XCJpY29uLW1fX21pbnVzSWNvbl9fMjQxVlVcIixjaGVja0ljb246XCJpY29uLW1fX2NoZWNrSWNvbl9fMm9rSHJcIixjbG9zZUljb246XCJpY29uLW1fX2Nsb3NlSWNvbl9fMlFCTDJcIixsZWZ0SWNvbjpcImljb24tbV9fbGVmdEljb25fX1o4a1l5XCIscmlnaHRJY29uOlwiaWNvbi1tX19yaWdodEljb25fXzNubnVhXCIsdXBJY29uOlwiaWNvbi1tX191cEljb25fX1ZzaTlaXCIsZG93bkljb246XCJpY29uLW1fX2Rvd25JY29uX18zNk92TFwiLHVwQWx0SWNvbjpcImljb24tbV9fdXBBbHRJY29uX18xeEdUbVwiLGRvd25BbHRJY29uOlwiaWNvbi1tX19kb3duQWx0SWNvbl9fQ1NCTXZcIixzZWFyY2hJY29uOlwiaWNvbi1tX19zZWFyY2hJY29uX183c2M0NlwiLGJhcnNJY29uOlwiaWNvbi1tX19iYXJzSWNvbl9fMzZJa2VcIixzZXR0aW5nc0ljb246XCJpY29uLW1fX3NldHRpbmdzSWNvbl9fMXVGenJcIixhbGVydEljb246XCJpY29uLW1fX2FsZXJ0SWNvbl9fMTIzUEJcIixoZWxwSWNvbjpcImljb24tbV9faGVscEljb25fXzNnT1p2XCIsaW5mb0ljb246XCJpY29uLW1fX2luZm9JY29uX18yN2NjN1wiLHBob25lSWNvbjpcImljb24tbV9fcGhvbmVJY29uX18zbVZlcFwiLGVkaXRJY29uOlwiaWNvbi1tX19lZGl0SWNvbl9fMkJvRU5cIixkYXRlSWNvbjpcImljb24tbV9fZGF0ZUljb25fXzNNLVB3XCIsbGlua0ljb246XCJpY29uLW1fX2xpbmtJY29uX18zY3k1S1wiLGxvY2F0aW9uSWNvbjpcImljb24tbV9fbG9jYXRpb25JY29uX18xTmMzWlwiLHNlY3VyZUljb246XCJpY29uLW1fX3NlY3VyZUljb25fXzJDOEFGXCIsbWFpbEljb246XCJpY29uLW1fX21haWxJY29uX19qc2ZYUlwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9ncmlkXCIscm9vdDpcImdyaWQtbV9fcm9vdF9fMm9jR0lcIixoZWFkZXI6XCJncmlkLW1fX2hlYWRlcl9fMk4tSS1cIixmaWx0ZXJHcm91cDpcImdyaWQtbV9fZmlsdGVyR3JvdXBfXzFEM0RPXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2dyaWQtYm9keVwiLHJvb3Q6XCJncmlkLWJvZHktbV9fcm9vdF9fdG5jRmVcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvZ3JpZC1jZWxsXCIscm9vdDpcImdyaWQtY2VsbC1tX19yb290X18yRXZqdlwiLGlucHV0OlwiZ3JpZC1jZWxsLW1fX2lucHV0X18ydXdxc1wiLGVkaXQ6XCJncmlkLWNlbGwtbV9fZWRpdF9fM2R4OHVcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvZ3JpZC1mb290ZXJcIixyb290OlwiZ3JpZC1mb290ZXItbV9fcm9vdF9fM0l2bXFcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvZ3JpZC1oZWFkZXJcIixyb290OlwiZ3JpZC1oZWFkZXItbV9fcm9vdF9fSElSb1FcIixjZWxsOlwiZ3JpZC1oZWFkZXItbV9fY2VsbF9fMktaSWdcIixzb3J0YWJsZTpcImdyaWQtaGVhZGVyLW1fX3NvcnRhYmxlX18yRW5ZclwiLHNvcnRlZDpcImdyaWQtaGVhZGVyLW1fX3NvcnRlZF9fM3V3dk5cIixzb3J0OlwiZ3JpZC1oZWFkZXItbV9fc29ydF9fMks4VnBcIixmaWx0ZXI6XCJncmlkLWhlYWRlci1tX19maWx0ZXJfXzFfZFB2XCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2dyaWQtcGxhY2Vob2xkZXItcm93XCIscm9vdDpcImdyaWQtcGxhY2Vob2xkZXItcm93LW1fX3Jvb3RfXzJ5dWxQIGdyaWQtcm93LW1fX3Jvb3RfX21xN05UXCIsbG9hZGluZzpcImdyaWQtcGxhY2Vob2xkZXItcm93LW1fX2xvYWRpbmdfXzJEUlQ1XCIsc3BpbjpcImdyaWQtcGxhY2Vob2xkZXItcm93LW1fX3NwaW5fXzJJRlMtXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2dyaWQtcm93XCIscm9vdDpcImdyaWQtcm93LW1fX3Jvb3RfX21xN05UXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2xhYmVsXCIscm9vdDpcImxhYmVsLW1fX3Jvb3RfXzNVLUVLXCIsc2Vjb25kYXJ5OlwibGFiZWwtbV9fc2Vjb25kYXJ5X18xQjNUSVwiLHJlcXVpcmVkOlwibGFiZWwtbV9fcmVxdWlyZWRfXzFRbDR5XCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL2xpc3Rib3hcIixyb290OlwibGlzdGJveC1tX19yb290X18zNVpZQVwiLG9wdGlvbjpcImxpc3Rib3gtbV9fb3B0aW9uX18xSVYxM1wiLGZvY3VzZWQ6XCJsaXN0Ym94LW1fX2ZvY3VzZWRfXzI3N0hQXCIsYWN0aXZlT3B0aW9uOlwibGlzdGJveC1tX19hY3RpdmVPcHRpb25fXzExMEhkXCIsZGlzYWJsZWRPcHRpb246XCJsaXN0Ym94LW1fX2Rpc2FibGVkT3B0aW9uX18xTlRSRVwiLHNlbGVjdGVkT3B0aW9uOlwibGlzdGJveC1tX19zZWxlY3RlZE9wdGlvbl9fMXhGY0kgaWNvbi1tX19jaGVja0ljb25fXzJva0hyXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3Byb2dyZXNzXCIsb3V0cHV0OlwicHJvZ3Jlc3MtbV9fb3V0cHV0X19teFRtSFwiLGJhcjpcInByb2dyZXNzLW1fX2Jhcl9feFpud05cIixwcm9ncmVzczpcInByb2dyZXNzLW1fX3Byb2dyZXNzX18zNmtfWVwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9yYWRpb1wiLHJvb3Q6XCJyYWRpby1tX19yb290X19sc2ZwelwiLGlucHV0OlwicmFkaW8tbV9faW5wdXRfXzJmVVRhXCIsaW5wdXRXcmFwcGVyOlwicmFkaW8tbV9faW5wdXRXcmFwcGVyX18zTVFqNlwiLGZvY3VzZWQ6XCJyYWRpby1tX19mb2N1c2VkX18xb2JsNFwiLGNoZWNrZWQ6XCJyYWRpby1tX19jaGVja2VkX18zYkNRbVwiLGRpc2FibGVkOlwicmFkaW8tbV9fZGlzYWJsZWRfXzE1MlB4XCIscmVhZG9ubHk6XCJyYWRpby1tX19yZWFkb25seV9fM3MtMDBcIixyZXF1aXJlZDpcInJhZGlvLW1fX3JlcXVpcmVkX18xZUxsblwiLGludmFsaWQ6XCJyYWRpby1tX19pbnZhbGlkX18xRE9YVlwiLHZhbGlkOlwicmFkaW8tbV9fdmFsaWRfXzNIZTF0XCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3NlbGVjdFwiLHJvb3Q6XCJzZWxlY3QtbV9fcm9vdF9fMWNzYVJcIixpbnB1dFdyYXBwZXI6XCJzZWxlY3QtbV9faW5wdXRXcmFwcGVyX18xQzNUeVwiLHRyaWdnZXI6XCJzZWxlY3QtbV9fdHJpZ2dlcl9fWEFTb2VcIixwbGFjZWhvbGRlcjpcInNlbGVjdC1tX19wbGFjZWhvbGRlcl9fMVBtaVlcIixhcnJvdzpcInNlbGVjdC1tX19hcnJvd19fMU9vM2pcIixkcm9wZG93bjpcInNlbGVjdC1tX19kcm9wZG93bl9fM2xUbnZcIixvcGVuOlwic2VsZWN0LW1fX29wZW5fXzFMb2pFXCIsaW5wdXQ6XCJzZWxlY3QtbV9faW5wdXRfXzNvTVNYXCIsZGlzYWJsZWQ6XCJzZWxlY3QtbV9fZGlzYWJsZWRfXzJTdEQ0XCIscmVhZG9ubHk6XCJzZWxlY3QtbV9fcmVhZG9ubHlfXzF3X0JMXCIsaW52YWxpZDpcInNlbGVjdC1tX19pbnZhbGlkX19TWHo4b1wiLHZhbGlkOlwic2VsZWN0LW1fX3ZhbGlkX18zLVNOWFwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9zbGlkZS1wYW5lXCIscm9vdDpcInNsaWRlLXBhbmUtbV9fcm9vdF9fM2J6dGVcIix1bmRlcmxheVZpc2libGU6XCJzbGlkZS1wYW5lLW1fX3VuZGVybGF5VmlzaWJsZV9fRnZvZUxcIixwYW5lOlwic2xpZGUtcGFuZS1tX19wYW5lX18xLVZRM1wiLGNvbnRlbnQ6XCJzbGlkZS1wYW5lLW1fX2NvbnRlbnRfXzFOaFdLXCIsdGl0bGU6XCJzbGlkZS1wYW5lLW1fX3RpdGxlX18zTXJCUlwiLGNsb3NlOlwic2xpZGUtcGFuZS1tX19jbG9zZV9fMjcwM2RcIixsZWZ0Olwic2xpZGUtcGFuZS1tX19sZWZ0X18xcFE3VlwiLHJpZ2h0Olwic2xpZGUtcGFuZS1tX19yaWdodF9fWUJYQklcIix0b3A6XCJzbGlkZS1wYW5lLW1fX3RvcF9fMmI3bjZcIixib3R0b206XCJzbGlkZS1wYW5lLW1fX2JvdHRvbV9fMzJMTWFcIixzbGlkZUluOlwic2xpZGUtcGFuZS1tX19zbGlkZUluX18xNWtOMFwiLHNsaWRlT3V0Olwic2xpZGUtcGFuZS1tX19zbGlkZU91dF9fMm0xRTlcIixvcGVuOlwic2xpZGUtcGFuZS1tX19vcGVuX18ydkVOUFwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9zbGlkZXJcIixyb290Olwic2xpZGVyLW1fX3Jvb3RfXzFzNExxXCIsaW5wdXRXcmFwcGVyOlwic2xpZGVyLW1fX2lucHV0V3JhcHBlcl9fMVY0MVdcIix0cmFjazpcInNsaWRlci1tX190cmFja19fMnlaV1JcIixmaWxsOlwic2xpZGVyLW1fX2ZpbGxfXzNjRDNzXCIsdGh1bWI6XCJzbGlkZXItbV9fdGh1bWJfXzJ4U0hyXCIsaW5wdXQ6XCJzbGlkZXItbV9faW5wdXRfXzFoR0ZzXCIsb3V0cHV0VG9vbHRpcDpcInNsaWRlci1tX19vdXRwdXRUb29sdGlwX18ySUVGZlwiLG91dHB1dDpcInNsaWRlci1tX19vdXRwdXRfX2lnTDVUXCIsdmVydGljYWw6XCJzbGlkZXItbV9fdmVydGljYWxfXzJrNS0yXCIsZGlzYWJsZWQ6XCJzbGlkZXItbV9fZGlzYWJsZWRfXzFLMVhyXCIscmVhZG9ubHk6XCJzbGlkZXItbV9fcmVhZG9ubHlfXzNrcjBsXCIsaW52YWxpZDpcInNsaWRlci1tX19pbnZhbGlkX18xdGw1Q1wiLHZhbGlkOlwic2xpZGVyLW1fX3ZhbGlkX18yMWJHNlwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9zcGxpdC1wYW5lXCIscm9vdDpcInNwbGl0LXBhbmUtbV9fcm9vdF9fMjEwN1NcIixkaXZpZGVyOlwic3BsaXQtcGFuZS1tX19kaXZpZGVyX18xMnJabFwiLHJvdzpcInNwbGl0LXBhbmUtbV9fcm93X18zbFYxcFwiLGNvbHVtbjpcInNwbGl0LXBhbmUtbV9fY29sdW1uX19RaWVXTlwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy90YWItY29udHJvbGxlclwiLHJvb3Q6XCJ0YWItY29udHJvbGxlci1tX19yb290X18xcWllRlwiLHRhYkJ1dHRvbnM6XCJ0YWItY29udHJvbGxlci1tX190YWJCdXR0b25zX18xcUczbVwiLHRhYkJ1dHRvbjpcInRhYi1jb250cm9sbGVyLW1fX3RhYkJ1dHRvbl9fM01lQzNcIixkaXNhYmxlZFRhYkJ1dHRvbjpcInRhYi1jb250cm9sbGVyLW1fX2Rpc2FibGVkVGFiQnV0dG9uX19sYkJFbVwiLGFjdGl2ZVRhYkJ1dHRvbjpcInRhYi1jb250cm9sbGVyLW1fX2FjdGl2ZVRhYkJ1dHRvbl9fMUhUS3BcIixjbG9zZTpcInRhYi1jb250cm9sbGVyLW1fX2Nsb3NlX18zbHdHa1wiLGNsb3NlYWJsZTpcInRhYi1jb250cm9sbGVyLW1fX2Nsb3NlYWJsZV9fMkZJRVRcIix0YWI6XCJ0YWItY29udHJvbGxlci1tX190YWJfXzNDLTA1XCIsYWxpZ25MZWZ0OlwidGFiLWNvbnRyb2xsZXItbV9fYWxpZ25MZWZ0X18yRkRSS1wiLHRhYnM6XCJ0YWItY29udHJvbGxlci1tX190YWJzX18xUUJxZ1wiLGFsaWduUmlnaHQ6XCJ0YWItY29udHJvbGxlci1tX19hbGlnblJpZ2h0X18xblFQZ1wiLGFsaWduQm90dG9tOlwidGFiLWNvbnRyb2xsZXItbV9fYWxpZ25Cb3R0b21fX29Td0xUXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3RleHQtYXJlYVwiLHJvb3Q6XCJ0ZXh0LWFyZWEtbV9fcm9vdF9fMVJ5dktcIixpbnB1dDpcInRleHQtYXJlYS1tX19pbnB1dF9fU0VlblZcIixkaXNhYmxlZDpcInRleHQtYXJlYS1tX19kaXNhYmxlZF9fM3RlNnNcIixyZWFkb25seTpcInRleHQtYXJlYS1tX19yZWFkb25seV9fWWZBaGFcIixpbnZhbGlkOlwidGV4dC1hcmVhLW1fX2ludmFsaWRfXzJLNEV5XCIsdmFsaWQ6XCJ0ZXh0LWFyZWEtbV9fdmFsaWRfXzI0M3phXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3RleHQtaW5wdXRcIixyb290OlwidGV4dC1pbnB1dC1tX19yb290X18yQ2lDVFwiLGlucHV0OlwidGV4dC1pbnB1dC1tX19pbnB1dF9fM3VRaWhcIixpbnB1dFdyYXBwZXI6XCJ0ZXh0LWlucHV0LW1fX2lucHV0V3JhcHBlcl9fMWl0RmNcIixkaXNhYmxlZDpcInRleHQtaW5wdXQtbV9fZGlzYWJsZWRfXzNXUjFVXCIscmVhZG9ubHk6XCJ0ZXh0LWlucHV0LW1fX3JlYWRvbmx5X18xc25ESVwiLGludmFsaWQ6XCJ0ZXh0LWlucHV0LW1fX2ludmFsaWRfXzN4MkpjXCIsdmFsaWQ6XCJ0ZXh0LWlucHV0LW1fX3ZhbGlkX19MLWt0d1wifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy9lbmhhbmNlZC10ZXh0LWlucHV0XCIsYWRkb246XCJlbmhhbmNlZC10ZXh0LWlucHV0LW1fX2FkZG9uX18za0UzWlwiLGFkZG9uQWZ0ZXI6XCJlbmhhbmNlZC10ZXh0LWlucHV0LW1fX2FkZG9uQWZ0ZXJfXzN5ZTVWXCIsYWRkb25CZWZvcmU6XCJlbmhhbmNlZC10ZXh0LWlucHV0LW1fX2FkZG9uQmVmb3JlX18yNHdGSlwiLGlucHV0OlwiZW5oYW5jZWQtdGV4dC1pbnB1dC1tX19pbnB1dF9fMllKOEUgdGV4dC1pbnB1dC1tX19pbnB1dF9fM3VRaWhcIixpbnB1dFdyYXBwZXI6XCJlbmhhbmNlZC10ZXh0LWlucHV0LW1fX2lucHV0V3JhcHBlcl9fMnB5dzkgdGV4dC1pbnB1dC1tX19pbnB1dFdyYXBwZXJfXzFpdEZjXCIsZm9jdXNlZDpcImVuaGFuY2VkLXRleHQtaW5wdXQtbV9fZm9jdXNlZF9fMUJLdWNcIn19LGZ1bmN0aW9uKF8sbyl7Xy5leHBvcnRzPXtcIiBfa2V5XCI6XCJAZG9qby90aGVtZXMvdGltZS1waWNrZXJcIixyb290OlwidGltZS1waWNrZXItbV9fcm9vdF9fM3hhOUxcIixpbnB1dDpcInRpbWUtcGlja2VyLW1fX2lucHV0X18xQTZMelwiLGRpc2FibGVkOlwidGltZS1waWNrZXItbV9fZGlzYWJsZWRfXzIxY3FrXCIscmVhZG9ubHk6XCJ0aW1lLXBpY2tlci1tX19yZWFkb25seV9fM2hHYWZcIixpbnZhbGlkOlwidGltZS1waWNrZXItbV9faW52YWxpZF9fMjRHVV9cIix2YWxpZDpcInRpbWUtcGlja2VyLW1fX3ZhbGlkX19DSWU5UlwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy90aXRsZS1wYW5lXCIscm9vdDpcInRpdGxlLXBhbmUtbV9fcm9vdF9fMlpGTkNcIix0aXRsZUJ1dHRvbjpcInRpdGxlLXBhbmUtbV9fdGl0bGVCdXR0b25fXzJfYnJUXCIsY29udGVudDpcInRpdGxlLXBhbmUtbV9fY29udGVudF9fM1puWjdcIixjb250ZW50VHJhbnNpdGlvbjpcInRpdGxlLXBhbmUtbV9fY29udGVudFRyYW5zaXRpb25fXzJrakhlXCIsb3BlbjpcInRpdGxlLXBhbmUtbV9fb3Blbl9fbDdETHVcIixhcnJvdzpcInRpdGxlLXBhbmUtbV9fYXJyb3dfXzFET3FkXCJ9fSxmdW5jdGlvbihfLG8pe18uZXhwb3J0cz17XCIgX2tleVwiOlwiQGRvam8vdGhlbWVzL3Rvb2xiYXJcIixyb290OlwidG9vbGJhci1tX19yb290X18yVzlBVlwiLHRpdGxlOlwidG9vbGJhci1tX190aXRsZV9fMnJxbU5cIixtZW51QnV0dG9uOlwidG9vbGJhci1tX19tZW51QnV0dG9uX18zeU9HMVwifX0sZnVuY3Rpb24oXyxvKXtfLmV4cG9ydHM9e1wiIF9rZXlcIjpcIkBkb2pvL3RoZW1lcy90b29sdGlwXCIscm9vdDpcInRvb2x0aXAtbV9fcm9vdF9fMlRzZjRcIixjb250ZW50OlwidG9vbHRpcC1tX19jb250ZW50X18zSlJOQlwiLGJvdHRvbTpcInRvb2x0aXAtbV9fYm90dG9tX18zLWItbFwiLHRvcDpcInRvb2x0aXAtbV9fdG9wX18xc0FETFwiLGxlZnQ6XCJ0b29sdGlwLW1fX2xlZnRfX19MZDFzXCIscmlnaHQ6XCJ0b29sdGlwLW1fX3JpZ2h0X18zMjRoNVwifX1dKX0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3RoZW1lcy9kb2pvL2luZGV4LmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIlwidXNlIHN0cmljdFwiO1xyXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmVcclxudmFyIGhhcyA9IHJlcXVpcmUoJ0Bkb2pvL2ZyYW1ld29yay9oYXMvaGFzJyk7XHJcbmlmICghaGFzLmV4aXN0cygnYnVpbGQtdGltZS1yZW5kZXInKSkge1xyXG4gICAgaGFzLmFkZCgnYnVpbGQtdGltZS1yZW5kZXInLCBmYWxzZSwgZmFsc2UpO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhhc0J1aWxkVGltZVJlbmRlci5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvYnVpbGQtdGltZS1yZW5kZXIvaGFzQnVpbGRUaW1lUmVuZGVyLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvYnVpbGQtdGltZS1yZW5kZXIvaGFzQnVpbGRUaW1lUmVuZGVyLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IC4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxyXG50aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZVxyXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuVEhJUyBDT0RFIElTIFBST1ZJREVEIE9OIEFOICpBUyBJUyogQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWVxyXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbk1FUkNIQU5UQUJMSVRZIE9SIE5PTi1JTkZSSU5HRU1FTlQuXHJcblxyXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcclxuYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMClcclxuICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShyZXN1bHQudmFsdWUpOyB9KS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IHlbb3BbMF0gJiAyID8gXCJyZXR1cm5cIiA6IG9wWzBdID8gXCJ0aHJvd1wiIDogXCJuZXh0XCJdKSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFswLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyAgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaWYgKG9bbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH07IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl07XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanNcbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gQ29weXJpZ2h0IDIwMTQgR29vZ2xlIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gICAgIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gICAgIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4hZnVuY3Rpb24oYSxiKXt2YXIgYz17fSxkPXt9LGU9e307IWZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtpZihcIm51bWJlclwiPT10eXBlb2YgYSlyZXR1cm4gYTt2YXIgYj17fTtmb3IodmFyIGMgaW4gYSliW2NdPWFbY107cmV0dXJuIGJ9ZnVuY3Rpb24gZCgpe3RoaXMuX2RlbGF5PTAsdGhpcy5fZW5kRGVsYXk9MCx0aGlzLl9maWxsPVwibm9uZVwiLHRoaXMuX2l0ZXJhdGlvblN0YXJ0PTAsdGhpcy5faXRlcmF0aW9ucz0xLHRoaXMuX2R1cmF0aW9uPTAsdGhpcy5fcGxheWJhY2tSYXRlPTEsdGhpcy5fZGlyZWN0aW9uPVwibm9ybWFsXCIsdGhpcy5fZWFzaW5nPVwibGluZWFyXCIsdGhpcy5fZWFzaW5nRnVuY3Rpb249eH1mdW5jdGlvbiBlKCl7cmV0dXJuIGEuaXNEZXByZWNhdGVkKFwiSW52YWxpZCB0aW1pbmcgaW5wdXRzXCIsXCIyMDE2LTAzLTAyXCIsXCJUeXBlRXJyb3IgZXhjZXB0aW9ucyB3aWxsIGJlIHRocm93biBpbnN0ZWFkLlwiLCEwKX1mdW5jdGlvbiBmKGIsYyxlKXt2YXIgZj1uZXcgZDtyZXR1cm4gYyYmKGYuZmlsbD1cImJvdGhcIixmLmR1cmF0aW9uPVwiYXV0b1wiKSxcIm51bWJlclwiIT10eXBlb2YgYnx8aXNOYU4oYik/dm9pZCAwIT09YiYmT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYikuZm9yRWFjaChmdW5jdGlvbihjKXtpZihcImF1dG9cIiE9YltjXSl7aWYoKFwibnVtYmVyXCI9PXR5cGVvZiBmW2NdfHxcImR1cmF0aW9uXCI9PWMpJiYoXCJudW1iZXJcIiE9dHlwZW9mIGJbY118fGlzTmFOKGJbY10pKSlyZXR1cm47aWYoXCJmaWxsXCI9PWMmJi0xPT12LmluZGV4T2YoYltjXSkpcmV0dXJuO2lmKFwiZGlyZWN0aW9uXCI9PWMmJi0xPT13LmluZGV4T2YoYltjXSkpcmV0dXJuO2lmKFwicGxheWJhY2tSYXRlXCI9PWMmJjEhPT1iW2NdJiZhLmlzRGVwcmVjYXRlZChcIkFuaW1hdGlvbkVmZmVjdFRpbWluZy5wbGF5YmFja1JhdGVcIixcIjIwMTQtMTEtMjhcIixcIlVzZSBBbmltYXRpb24ucGxheWJhY2tSYXRlIGluc3RlYWQuXCIpKXJldHVybjtmW2NdPWJbY119fSk6Zi5kdXJhdGlvbj1iLGZ9ZnVuY3Rpb24gZyhhKXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgYSYmKGE9aXNOYU4oYSk/e2R1cmF0aW9uOjB9OntkdXJhdGlvbjphfSksYX1mdW5jdGlvbiBoKGIsYyl7cmV0dXJuIGI9YS5udW1lcmljVGltaW5nVG9PYmplY3QoYiksZihiLGMpfWZ1bmN0aW9uIGkoYSxiLGMsZCl7cmV0dXJuIGE8MHx8YT4xfHxjPDB8fGM+MT94OmZ1bmN0aW9uKGUpe2Z1bmN0aW9uIGYoYSxiLGMpe3JldHVybiAzKmEqKDEtYykqKDEtYykqYyszKmIqKDEtYykqYypjK2MqYypjfWlmKGU8PTApe3ZhciBnPTA7cmV0dXJuIGE+MD9nPWIvYTohYiYmYz4wJiYoZz1kL2MpLGcqZX1pZihlPj0xKXt2YXIgaD0wO3JldHVybiBjPDE/aD0oZC0xKS8oYy0xKToxPT1jJiZhPDEmJihoPShiLTEpLyhhLTEpKSwxK2gqKGUtMSl9Zm9yKHZhciBpPTAsaj0xO2k8ajspe3ZhciBrPShpK2opLzIsbD1mKGEsYyxrKTtpZihNYXRoLmFicyhlLWwpPDFlLTUpcmV0dXJuIGYoYixkLGspO2w8ZT9pPWs6aj1rfXJldHVybiBmKGIsZCxrKX19ZnVuY3Rpb24gaihhLGIpe3JldHVybiBmdW5jdGlvbihjKXtpZihjPj0xKXJldHVybiAxO3ZhciBkPTEvYTtyZXR1cm4oYys9YipkKS1jJWR9fWZ1bmN0aW9uIGsoYSl7Q3x8KEM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKS5zdHlsZSksQy5hbmltYXRpb25UaW1pbmdGdW5jdGlvbj1cIlwiLEMuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb249YTt2YXIgYj1DLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uO2lmKFwiXCI9PWImJmUoKSl0aHJvdyBuZXcgVHlwZUVycm9yKGErXCIgaXMgbm90IGEgdmFsaWQgdmFsdWUgZm9yIGVhc2luZ1wiKTtyZXR1cm4gYn1mdW5jdGlvbiBsKGEpe2lmKFwibGluZWFyXCI9PWEpcmV0dXJuIHg7dmFyIGI9RS5leGVjKGEpO2lmKGIpcmV0dXJuIGkuYXBwbHkodGhpcyxiLnNsaWNlKDEpLm1hcChOdW1iZXIpKTt2YXIgYz1GLmV4ZWMoYSk7cmV0dXJuIGM/aihOdW1iZXIoY1sxXSkse3N0YXJ0OnksbWlkZGxlOnosZW5kOkF9W2NbMl1dKTpCW2FdfHx4fWZ1bmN0aW9uIG0oYSl7cmV0dXJuIE1hdGguYWJzKG4oYSkvYS5wbGF5YmFja1JhdGUpfWZ1bmN0aW9uIG4oYSl7cmV0dXJuIDA9PT1hLmR1cmF0aW9ufHwwPT09YS5pdGVyYXRpb25zPzA6YS5kdXJhdGlvbiphLml0ZXJhdGlvbnN9ZnVuY3Rpb24gbyhhLGIsYyl7aWYobnVsbD09YilyZXR1cm4gRzt2YXIgZD1jLmRlbGF5K2ErYy5lbmREZWxheTtyZXR1cm4gYjxNYXRoLm1pbihjLmRlbGF5LGQpP0g6Yj49TWF0aC5taW4oYy5kZWxheSthLGQpP0k6Sn1mdW5jdGlvbiBwKGEsYixjLGQsZSl7c3dpdGNoKGQpe2Nhc2UgSDpyZXR1cm5cImJhY2t3YXJkc1wiPT1ifHxcImJvdGhcIj09Yj8wOm51bGw7Y2FzZSBKOnJldHVybiBjLWU7Y2FzZSBJOnJldHVyblwiZm9yd2FyZHNcIj09Ynx8XCJib3RoXCI9PWI/YTpudWxsO2Nhc2UgRzpyZXR1cm4gbnVsbH19ZnVuY3Rpb24gcShhLGIsYyxkLGUpe3ZhciBmPWU7cmV0dXJuIDA9PT1hP2IhPT1IJiYoZis9Yyk6Zis9ZC9hLGZ9ZnVuY3Rpb24gcihhLGIsYyxkLGUsZil7dmFyIGc9YT09PTEvMD9iJTE6YSUxO3JldHVybiAwIT09Z3x8YyE9PUl8fDA9PT1kfHwwPT09ZSYmMCE9PWZ8fChnPTEpLGd9ZnVuY3Rpb24gcyhhLGIsYyxkKXtyZXR1cm4gYT09PUkmJmI9PT0xLzA/MS8wOjE9PT1jP01hdGguZmxvb3IoZCktMTpNYXRoLmZsb29yKGQpfWZ1bmN0aW9uIHQoYSxiLGMpe3ZhciBkPWE7aWYoXCJub3JtYWxcIiE9PWEmJlwicmV2ZXJzZVwiIT09YSl7dmFyIGU9YjtcImFsdGVybmF0ZS1yZXZlcnNlXCI9PT1hJiYoZSs9MSksZD1cIm5vcm1hbFwiLGUhPT0xLzAmJmUlMiE9MCYmKGQ9XCJyZXZlcnNlXCIpfXJldHVyblwibm9ybWFsXCI9PT1kP2M6MS1jfWZ1bmN0aW9uIHUoYSxiLGMpe3ZhciBkPW8oYSxiLGMpLGU9cChhLGMuZmlsbCxiLGQsYy5kZWxheSk7aWYobnVsbD09PWUpcmV0dXJuIG51bGw7dmFyIGY9cShjLmR1cmF0aW9uLGQsYy5pdGVyYXRpb25zLGUsYy5pdGVyYXRpb25TdGFydCksZz1yKGYsYy5pdGVyYXRpb25TdGFydCxkLGMuaXRlcmF0aW9ucyxlLGMuZHVyYXRpb24pLGg9cyhkLGMuaXRlcmF0aW9ucyxnLGYpLGk9dChjLmRpcmVjdGlvbixoLGcpO3JldHVybiBjLl9lYXNpbmdGdW5jdGlvbihpKX12YXIgdj1cImJhY2t3YXJkc3xmb3J3YXJkc3xib3RofG5vbmVcIi5zcGxpdChcInxcIiksdz1cInJldmVyc2V8YWx0ZXJuYXRlfGFsdGVybmF0ZS1yZXZlcnNlXCIuc3BsaXQoXCJ8XCIpLHg9ZnVuY3Rpb24oYSl7cmV0dXJuIGF9O2QucHJvdG90eXBlPXtfc2V0TWVtYmVyOmZ1bmN0aW9uKGIsYyl7dGhpc1tcIl9cIitiXT1jLHRoaXMuX2VmZmVjdCYmKHRoaXMuX2VmZmVjdC5fdGltaW5nSW5wdXRbYl09Yyx0aGlzLl9lZmZlY3QuX3RpbWluZz1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KHRoaXMuX2VmZmVjdC5fdGltaW5nSW5wdXQpLHRoaXMuX2VmZmVjdC5hY3RpdmVEdXJhdGlvbj1hLmNhbGN1bGF0ZUFjdGl2ZUR1cmF0aW9uKHRoaXMuX2VmZmVjdC5fdGltaW5nKSx0aGlzLl9lZmZlY3QuX2FuaW1hdGlvbiYmdGhpcy5fZWZmZWN0Ll9hbmltYXRpb24uX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uKCkpfSxnZXQgcGxheWJhY2tSYXRlKCl7cmV0dXJuIHRoaXMuX3BsYXliYWNrUmF0ZX0sc2V0IGRlbGF5KGEpe3RoaXMuX3NldE1lbWJlcihcImRlbGF5XCIsYSl9LGdldCBkZWxheSgpe3JldHVybiB0aGlzLl9kZWxheX0sc2V0IGVuZERlbGF5KGEpe3RoaXMuX3NldE1lbWJlcihcImVuZERlbGF5XCIsYSl9LGdldCBlbmREZWxheSgpe3JldHVybiB0aGlzLl9lbmREZWxheX0sc2V0IGZpbGwoYSl7dGhpcy5fc2V0TWVtYmVyKFwiZmlsbFwiLGEpfSxnZXQgZmlsbCgpe3JldHVybiB0aGlzLl9maWxsfSxzZXQgaXRlcmF0aW9uU3RhcnQoYSl7aWYoKGlzTmFOKGEpfHxhPDApJiZlKCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIml0ZXJhdGlvblN0YXJ0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLCByZWNlaXZlZDogXCIrdGltaW5nLml0ZXJhdGlvblN0YXJ0KTt0aGlzLl9zZXRNZW1iZXIoXCJpdGVyYXRpb25TdGFydFwiLGEpfSxnZXQgaXRlcmF0aW9uU3RhcnQoKXtyZXR1cm4gdGhpcy5faXRlcmF0aW9uU3RhcnR9LHNldCBkdXJhdGlvbihhKXtpZihcImF1dG9cIiE9YSYmKGlzTmFOKGEpfHxhPDApJiZlKCkpdGhyb3cgbmV3IFR5cGVFcnJvcihcImR1cmF0aW9uIG11c3QgYmUgbm9uLW5lZ2F0aXZlIG9yIGF1dG8sIHJlY2VpdmVkOiBcIithKTt0aGlzLl9zZXRNZW1iZXIoXCJkdXJhdGlvblwiLGEpfSxnZXQgZHVyYXRpb24oKXtyZXR1cm4gdGhpcy5fZHVyYXRpb259LHNldCBkaXJlY3Rpb24oYSl7dGhpcy5fc2V0TWVtYmVyKFwiZGlyZWN0aW9uXCIsYSl9LGdldCBkaXJlY3Rpb24oKXtyZXR1cm4gdGhpcy5fZGlyZWN0aW9ufSxzZXQgZWFzaW5nKGEpe3RoaXMuX2Vhc2luZ0Z1bmN0aW9uPWwoayhhKSksdGhpcy5fc2V0TWVtYmVyKFwiZWFzaW5nXCIsYSl9LGdldCBlYXNpbmcoKXtyZXR1cm4gdGhpcy5fZWFzaW5nfSxzZXQgaXRlcmF0aW9ucyhhKXtpZigoaXNOYU4oYSl8fGE8MCkmJmUoKSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiaXRlcmF0aW9ucyBtdXN0IGJlIG5vbi1uZWdhdGl2ZSwgcmVjZWl2ZWQ6IFwiK2EpO3RoaXMuX3NldE1lbWJlcihcIml0ZXJhdGlvbnNcIixhKX0sZ2V0IGl0ZXJhdGlvbnMoKXtyZXR1cm4gdGhpcy5faXRlcmF0aW9uc319O3ZhciB5PTEsej0uNSxBPTAsQj17ZWFzZTppKC4yNSwuMSwuMjUsMSksXCJlYXNlLWluXCI6aSguNDIsMCwxLDEpLFwiZWFzZS1vdXRcIjppKDAsMCwuNTgsMSksXCJlYXNlLWluLW91dFwiOmkoLjQyLDAsLjU4LDEpLFwic3RlcC1zdGFydFwiOmooMSx5KSxcInN0ZXAtbWlkZGxlXCI6aigxLHopLFwic3RlcC1lbmRcIjpqKDEsQSl9LEM9bnVsbCxEPVwiXFxcXHMqKC0/XFxcXGQrXFxcXC4/XFxcXGQqfC0/XFxcXC5cXFxcZCspXFxcXHMqXCIsRT1uZXcgUmVnRXhwKFwiY3ViaWMtYmV6aWVyXFxcXChcIitEK1wiLFwiK0QrXCIsXCIrRCtcIixcIitEK1wiXFxcXClcIiksRj0vc3RlcHNcXChcXHMqKFxcZCspXFxzKixcXHMqKHN0YXJ0fG1pZGRsZXxlbmQpXFxzKlxcKS8sRz0wLEg9MSxJPTIsSj0zO2EuY2xvbmVUaW1pbmdJbnB1dD1jLGEubWFrZVRpbWluZz1mLGEubnVtZXJpY1RpbWluZ1RvT2JqZWN0PWcsYS5ub3JtYWxpemVUaW1pbmdJbnB1dD1oLGEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb249bSxhLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzPXUsYS5jYWxjdWxhdGVQaGFzZT1vLGEubm9ybWFsaXplRWFzaW5nPWssYS5wYXJzZUVhc2luZ0Z1bmN0aW9uPWx9KGMpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIpe3JldHVybiBhIGluIGs/a1thXVtiXXx8YjpifWZ1bmN0aW9uIGQoYSl7cmV0dXJuXCJkaXNwbGF5XCI9PT1hfHwwPT09YS5sYXN0SW5kZXhPZihcImFuaW1hdGlvblwiLDApfHwwPT09YS5sYXN0SW5kZXhPZihcInRyYW5zaXRpb25cIiwwKX1mdW5jdGlvbiBlKGEsYixlKXtpZighZChhKSl7dmFyIGY9aFthXTtpZihmKXtpLnN0eWxlW2FdPWI7Zm9yKHZhciBnIGluIGYpe3ZhciBqPWZbZ10saz1pLnN0eWxlW2pdO2Vbal09YyhqLGspfX1lbHNlIGVbYV09YyhhLGIpfX1mdW5jdGlvbiBmKGEpe3ZhciBiPVtdO2Zvcih2YXIgYyBpbiBhKWlmKCEoYyBpbltcImVhc2luZ1wiLFwib2Zmc2V0XCIsXCJjb21wb3NpdGVcIl0pKXt2YXIgZD1hW2NdO0FycmF5LmlzQXJyYXkoZCl8fChkPVtkXSk7Zm9yKHZhciBlLGY9ZC5sZW5ndGgsZz0wO2c8ZjtnKyspZT17fSxlLm9mZnNldD1cIm9mZnNldFwiaW4gYT9hLm9mZnNldDoxPT1mPzE6Zy8oZi0xKSxcImVhc2luZ1wiaW4gYSYmKGUuZWFzaW5nPWEuZWFzaW5nKSxcImNvbXBvc2l0ZVwiaW4gYSYmKGUuY29tcG9zaXRlPWEuY29tcG9zaXRlKSxlW2NdPWRbZ10sYi5wdXNoKGUpfXJldHVybiBiLnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS5vZmZzZXQtYi5vZmZzZXR9KSxifWZ1bmN0aW9uIGcoYil7ZnVuY3Rpb24gYygpe3ZhciBhPWQubGVuZ3RoO251bGw9PWRbYS0xXS5vZmZzZXQmJihkW2EtMV0ub2Zmc2V0PTEpLGE+MSYmbnVsbD09ZFswXS5vZmZzZXQmJihkWzBdLm9mZnNldD0wKTtmb3IodmFyIGI9MCxjPWRbMF0ub2Zmc2V0LGU9MTtlPGE7ZSsrKXt2YXIgZj1kW2VdLm9mZnNldDtpZihudWxsIT1mKXtmb3IodmFyIGc9MTtnPGUtYjtnKyspZFtiK2ddLm9mZnNldD1jKyhmLWMpKmcvKGUtYik7Yj1lLGM9Zn19fWlmKG51bGw9PWIpcmV0dXJuW107d2luZG93LlN5bWJvbCYmU3ltYm9sLml0ZXJhdG9yJiZBcnJheS5wcm90b3R5cGUuZnJvbSYmYltTeW1ib2wuaXRlcmF0b3JdJiYoYj1BcnJheS5mcm9tKGIpKSxBcnJheS5pc0FycmF5KGIpfHwoYj1mKGIpKTtmb3IodmFyIGQ9Yi5tYXAoZnVuY3Rpb24oYil7dmFyIGM9e307Zm9yKHZhciBkIGluIGIpe3ZhciBmPWJbZF07aWYoXCJvZmZzZXRcIj09ZCl7aWYobnVsbCE9Zil7aWYoZj1OdW1iZXIoZiksIWlzRmluaXRlKGYpKXRocm93IG5ldyBUeXBlRXJyb3IoXCJLZXlmcmFtZSBvZmZzZXRzIG11c3QgYmUgbnVtYmVycy5cIik7aWYoZjwwfHxmPjEpdGhyb3cgbmV3IFR5cGVFcnJvcihcIktleWZyYW1lIG9mZnNldHMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEuXCIpfX1lbHNlIGlmKFwiY29tcG9zaXRlXCI9PWQpe2lmKFwiYWRkXCI9PWZ8fFwiYWNjdW11bGF0ZVwiPT1mKXRocm93e3R5cGU6RE9NRXhjZXB0aW9uLk5PVF9TVVBQT1JURURfRVJSLG5hbWU6XCJOb3RTdXBwb3J0ZWRFcnJvclwiLG1lc3NhZ2U6XCJhZGQgY29tcG9zaXRpbmcgaXMgbm90IHN1cHBvcnRlZFwifTtpZihcInJlcGxhY2VcIiE9Zil0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjb21wb3NpdGUgbW9kZSBcIitmK1wiLlwiKX1lbHNlIGY9XCJlYXNpbmdcIj09ZD9hLm5vcm1hbGl6ZUVhc2luZyhmKTpcIlwiK2Y7ZShkLGYsYyl9cmV0dXJuIHZvaWQgMD09Yy5vZmZzZXQmJihjLm9mZnNldD1udWxsKSx2b2lkIDA9PWMuZWFzaW5nJiYoYy5lYXNpbmc9XCJsaW5lYXJcIiksY30pLGc9ITAsaD0tMS8wLGk9MDtpPGQubGVuZ3RoO2krKyl7dmFyIGo9ZFtpXS5vZmZzZXQ7aWYobnVsbCE9ail7aWYoajxoKXRocm93IG5ldyBUeXBlRXJyb3IoXCJLZXlmcmFtZXMgYXJlIG5vdCBsb29zZWx5IHNvcnRlZCBieSBvZmZzZXQuIFNvcnQgb3Igc3BlY2lmeSBvZmZzZXRzLlwiKTtoPWp9ZWxzZSBnPSExfXJldHVybiBkPWQuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBhLm9mZnNldD49MCYmYS5vZmZzZXQ8PTF9KSxnfHxjKCksZH12YXIgaD17YmFja2dyb3VuZDpbXCJiYWNrZ3JvdW5kSW1hZ2VcIixcImJhY2tncm91bmRQb3NpdGlvblwiLFwiYmFja2dyb3VuZFNpemVcIixcImJhY2tncm91bmRSZXBlYXRcIixcImJhY2tncm91bmRBdHRhY2htZW50XCIsXCJiYWNrZ3JvdW5kT3JpZ2luXCIsXCJiYWNrZ3JvdW5kQ2xpcFwiLFwiYmFja2dyb3VuZENvbG9yXCJdLGJvcmRlcjpbXCJib3JkZXJUb3BDb2xvclwiLFwiYm9yZGVyVG9wU3R5bGVcIixcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJSaWdodENvbG9yXCIsXCJib3JkZXJSaWdodFN0eWxlXCIsXCJib3JkZXJSaWdodFdpZHRoXCIsXCJib3JkZXJCb3R0b21Db2xvclwiLFwiYm9yZGVyQm90dG9tU3R5bGVcIixcImJvcmRlckJvdHRvbVdpZHRoXCIsXCJib3JkZXJMZWZ0Q29sb3JcIixcImJvcmRlckxlZnRTdHlsZVwiLFwiYm9yZGVyTGVmdFdpZHRoXCJdLGJvcmRlckJvdHRvbTpbXCJib3JkZXJCb3R0b21XaWR0aFwiLFwiYm9yZGVyQm90dG9tU3R5bGVcIixcImJvcmRlckJvdHRvbUNvbG9yXCJdLGJvcmRlckNvbG9yOltcImJvcmRlclRvcENvbG9yXCIsXCJib3JkZXJSaWdodENvbG9yXCIsXCJib3JkZXJCb3R0b21Db2xvclwiLFwiYm9yZGVyTGVmdENvbG9yXCJdLGJvcmRlckxlZnQ6W1wiYm9yZGVyTGVmdFdpZHRoXCIsXCJib3JkZXJMZWZ0U3R5bGVcIixcImJvcmRlckxlZnRDb2xvclwiXSxib3JkZXJSYWRpdXM6W1wiYm9yZGVyVG9wTGVmdFJhZGl1c1wiLFwiYm9yZGVyVG9wUmlnaHRSYWRpdXNcIixcImJvcmRlckJvdHRvbVJpZ2h0UmFkaXVzXCIsXCJib3JkZXJCb3R0b21MZWZ0UmFkaXVzXCJdLGJvcmRlclJpZ2h0OltcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlclJpZ2h0U3R5bGVcIixcImJvcmRlclJpZ2h0Q29sb3JcIl0sYm9yZGVyVG9wOltcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJUb3BTdHlsZVwiLFwiYm9yZGVyVG9wQ29sb3JcIl0sYm9yZGVyV2lkdGg6W1wiYm9yZGVyVG9wV2lkdGhcIixcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlckJvdHRvbVdpZHRoXCIsXCJib3JkZXJMZWZ0V2lkdGhcIl0sZmxleDpbXCJmbGV4R3Jvd1wiLFwiZmxleFNocmlua1wiLFwiZmxleEJhc2lzXCJdLGZvbnQ6W1wiZm9udEZhbWlseVwiLFwiZm9udFNpemVcIixcImZvbnRTdHlsZVwiLFwiZm9udFZhcmlhbnRcIixcImZvbnRXZWlnaHRcIixcImxpbmVIZWlnaHRcIl0sbWFyZ2luOltcIm1hcmdpblRvcFwiLFwibWFyZ2luUmlnaHRcIixcIm1hcmdpbkJvdHRvbVwiLFwibWFyZ2luTGVmdFwiXSxvdXRsaW5lOltcIm91dGxpbmVDb2xvclwiLFwib3V0bGluZVN0eWxlXCIsXCJvdXRsaW5lV2lkdGhcIl0scGFkZGluZzpbXCJwYWRkaW5nVG9wXCIsXCJwYWRkaW5nUmlnaHRcIixcInBhZGRpbmdCb3R0b21cIixcInBhZGRpbmdMZWZ0XCJdfSxpPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImRpdlwiKSxqPXt0aGluOlwiMXB4XCIsbWVkaXVtOlwiM3B4XCIsdGhpY2s6XCI1cHhcIn0saz17Ym9yZGVyQm90dG9tV2lkdGg6aixib3JkZXJMZWZ0V2lkdGg6aixib3JkZXJSaWdodFdpZHRoOmosYm9yZGVyVG9wV2lkdGg6aixmb250U2l6ZTp7XCJ4eC1zbWFsbFwiOlwiNjAlXCIsXCJ4LXNtYWxsXCI6XCI3NSVcIixzbWFsbDpcIjg5JVwiLG1lZGl1bTpcIjEwMCVcIixsYXJnZTpcIjEyMCVcIixcIngtbGFyZ2VcIjpcIjE1MCVcIixcInh4LWxhcmdlXCI6XCIyMDAlXCJ9LGZvbnRXZWlnaHQ6e25vcm1hbDpcIjQwMFwiLGJvbGQ6XCI3MDBcIn0sb3V0bGluZVdpZHRoOmosdGV4dFNoYWRvdzp7bm9uZTpcIjBweCAwcHggMHB4IHRyYW5zcGFyZW50XCJ9LGJveFNoYWRvdzp7bm9uZTpcIjBweCAwcHggMHB4IDBweCB0cmFuc3BhcmVudFwifX07YS5jb252ZXJ0VG9BcnJheUZvcm09ZixhLm5vcm1hbGl6ZUtleWZyYW1lcz1nfShjKSxmdW5jdGlvbihhKXt2YXIgYj17fTthLmlzRGVwcmVjYXRlZD1mdW5jdGlvbihhLGMsZCxlKXt2YXIgZj1lP1wiYXJlXCI6XCJpc1wiLGc9bmV3IERhdGUsaD1uZXcgRGF0ZShjKTtyZXR1cm4gaC5zZXRNb250aChoLmdldE1vbnRoKCkrMyksIShnPGgmJihhIGluIGJ8fGNvbnNvbGUud2FybihcIldlYiBBbmltYXRpb25zOiBcIithK1wiIFwiK2YrXCIgZGVwcmVjYXRlZCBhbmQgd2lsbCBzdG9wIHdvcmtpbmcgb24gXCIraC50b0RhdGVTdHJpbmcoKStcIi4gXCIrZCksYlthXT0hMCwxKSl9LGEuZGVwcmVjYXRlZD1mdW5jdGlvbihiLGMsZCxlKXt2YXIgZj1lP1wiYXJlXCI6XCJpc1wiO2lmKGEuaXNEZXByZWNhdGVkKGIsYyxkLGUpKXRocm93IG5ldyBFcnJvcihiK1wiIFwiK2YrXCIgbm8gbG9uZ2VyIHN1cHBvcnRlZC4gXCIrZCl9fShjKSxmdW5jdGlvbigpe2lmKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hbmltYXRlKXt2YXIgYT1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYW5pbWF0ZShbXSwwKSxiPSEwO2lmKGEmJihiPSExLFwicGxheXxjdXJyZW50VGltZXxwYXVzZXxyZXZlcnNlfHBsYXliYWNrUmF0ZXxjYW5jZWx8ZmluaXNofHN0YXJ0VGltZXxwbGF5U3RhdGVcIi5zcGxpdChcInxcIikuZm9yRWFjaChmdW5jdGlvbihjKXt2b2lkIDA9PT1hW2NdJiYoYj0hMCl9KSksIWIpcmV0dXJufSFmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXtmb3IodmFyIGI9e30sYz0wO2M8YS5sZW5ndGg7YysrKWZvcih2YXIgZCBpbiBhW2NdKWlmKFwib2Zmc2V0XCIhPWQmJlwiZWFzaW5nXCIhPWQmJlwiY29tcG9zaXRlXCIhPWQpe3ZhciBlPXtvZmZzZXQ6YVtjXS5vZmZzZXQsZWFzaW5nOmFbY10uZWFzaW5nLHZhbHVlOmFbY11bZF19O2JbZF09YltkXXx8W10sYltkXS5wdXNoKGUpfWZvcih2YXIgZiBpbiBiKXt2YXIgZz1iW2ZdO2lmKDAhPWdbMF0ub2Zmc2V0fHwxIT1nW2cubGVuZ3RoLTFdLm9mZnNldCl0aHJvd3t0eXBlOkRPTUV4Y2VwdGlvbi5OT1RfU1VQUE9SVEVEX0VSUixuYW1lOlwiTm90U3VwcG9ydGVkRXJyb3JcIixtZXNzYWdlOlwiUGFydGlhbCBrZXlmcmFtZXMgYXJlIG5vdCBzdXBwb3J0ZWRcIn19cmV0dXJuIGJ9ZnVuY3Rpb24gZShjKXt2YXIgZD1bXTtmb3IodmFyIGUgaW4gYylmb3IodmFyIGY9Y1tlXSxnPTA7ZzxmLmxlbmd0aC0xO2crKyl7dmFyIGg9ZyxpPWcrMSxqPWZbaF0ub2Zmc2V0LGs9ZltpXS5vZmZzZXQsbD1qLG09azswPT1nJiYobD0tMS8wLDA9PWsmJihpPWgpKSxnPT1mLmxlbmd0aC0yJiYobT0xLzAsMT09aiYmKGg9aSkpLGQucHVzaCh7YXBwbHlGcm9tOmwsYXBwbHlUbzptLHN0YXJ0T2Zmc2V0OmZbaF0ub2Zmc2V0LGVuZE9mZnNldDpmW2ldLm9mZnNldCxlYXNpbmdGdW5jdGlvbjphLnBhcnNlRWFzaW5nRnVuY3Rpb24oZltoXS5lYXNpbmcpLHByb3BlcnR5OmUsaW50ZXJwb2xhdGlvbjpiLnByb3BlcnR5SW50ZXJwb2xhdGlvbihlLGZbaF0udmFsdWUsZltpXS52YWx1ZSl9KX1yZXR1cm4gZC5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGEuc3RhcnRPZmZzZXQtYi5zdGFydE9mZnNldH0pLGR9Yi5jb252ZXJ0RWZmZWN0SW5wdXQ9ZnVuY3Rpb24oYyl7dmFyIGY9YS5ub3JtYWxpemVLZXlmcmFtZXMoYyksZz1kKGYpLGg9ZShnKTtyZXR1cm4gZnVuY3Rpb24oYSxjKXtpZihudWxsIT1jKWguZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBjPj1hLmFwcGx5RnJvbSYmYzxhLmFwcGx5VG99KS5mb3JFYWNoKGZ1bmN0aW9uKGQpe3ZhciBlPWMtZC5zdGFydE9mZnNldCxmPWQuZW5kT2Zmc2V0LWQuc3RhcnRPZmZzZXQsZz0wPT1mPzA6ZC5lYXNpbmdGdW5jdGlvbihlL2YpO2IuYXBwbHkoYSxkLnByb3BlcnR5LGQuaW50ZXJwb2xhdGlvbihnKSl9KTtlbHNlIGZvcih2YXIgZCBpbiBnKVwib2Zmc2V0XCIhPWQmJlwiZWFzaW5nXCIhPWQmJlwiY29tcG9zaXRlXCIhPWQmJmIuY2xlYXIoYSxkKX19fShjLGQpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe3JldHVybiBhLnJlcGxhY2UoLy0oLikvZyxmdW5jdGlvbihhLGIpe3JldHVybiBiLnRvVXBwZXJDYXNlKCl9KX1mdW5jdGlvbiBlKGEsYixjKXtoW2NdPWhbY118fFtdLGhbY10ucHVzaChbYSxiXSl9ZnVuY3Rpb24gZihhLGIsYyl7Zm9yKHZhciBmPTA7ZjxjLmxlbmd0aDtmKyspe2UoYSxiLGQoY1tmXSkpfX1mdW5jdGlvbiBnKGMsZSxmKXt2YXIgZz1jOy8tLy50ZXN0KGMpJiYhYS5pc0RlcHJlY2F0ZWQoXCJIeXBoZW5hdGVkIHByb3BlcnR5IG5hbWVzXCIsXCIyMDE2LTAzLTIyXCIsXCJVc2UgY2FtZWxDYXNlIGluc3RlYWQuXCIsITApJiYoZz1kKGMpKSxcImluaXRpYWxcIiE9ZSYmXCJpbml0aWFsXCIhPWZ8fChcImluaXRpYWxcIj09ZSYmKGU9aVtnXSksXCJpbml0aWFsXCI9PWYmJihmPWlbZ10pKTtmb3IodmFyIGo9ZT09Zj9bXTpoW2ddLGs9MDtqJiZrPGoubGVuZ3RoO2srKyl7dmFyIGw9altrXVswXShlKSxtPWpba11bMF0oZik7aWYodm9pZCAwIT09bCYmdm9pZCAwIT09bSl7dmFyIG49altrXVsxXShsLG0pO2lmKG4pe3ZhciBvPWIuSW50ZXJwb2xhdGlvbi5hcHBseShudWxsLG4pO3JldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gMD09YT9lOjE9PWE/ZjpvKGEpfX19fXJldHVybiBiLkludGVycG9sYXRpb24oITEsITAsZnVuY3Rpb24oYSl7cmV0dXJuIGE/ZjplfSl9dmFyIGg9e307Yi5hZGRQcm9wZXJ0aWVzSGFuZGxlcj1mO3ZhciBpPXtiYWNrZ3JvdW5kQ29sb3I6XCJ0cmFuc3BhcmVudFwiLGJhY2tncm91bmRQb3NpdGlvbjpcIjAlIDAlXCIsYm9yZGVyQm90dG9tQ29sb3I6XCJjdXJyZW50Q29sb3JcIixib3JkZXJCb3R0b21MZWZ0UmFkaXVzOlwiMHB4XCIsYm9yZGVyQm90dG9tUmlnaHRSYWRpdXM6XCIwcHhcIixib3JkZXJCb3R0b21XaWR0aDpcIjNweFwiLGJvcmRlckxlZnRDb2xvcjpcImN1cnJlbnRDb2xvclwiLGJvcmRlckxlZnRXaWR0aDpcIjNweFwiLGJvcmRlclJpZ2h0Q29sb3I6XCJjdXJyZW50Q29sb3JcIixib3JkZXJSaWdodFdpZHRoOlwiM3B4XCIsYm9yZGVyU3BhY2luZzpcIjJweFwiLGJvcmRlclRvcENvbG9yOlwiY3VycmVudENvbG9yXCIsYm9yZGVyVG9wTGVmdFJhZGl1czpcIjBweFwiLGJvcmRlclRvcFJpZ2h0UmFkaXVzOlwiMHB4XCIsYm9yZGVyVG9wV2lkdGg6XCIzcHhcIixib3R0b206XCJhdXRvXCIsY2xpcDpcInJlY3QoMHB4LCAwcHgsIDBweCwgMHB4KVwiLGNvbG9yOlwiYmxhY2tcIixmb250U2l6ZTpcIjEwMCVcIixmb250V2VpZ2h0OlwiNDAwXCIsaGVpZ2h0OlwiYXV0b1wiLGxlZnQ6XCJhdXRvXCIsbGV0dGVyU3BhY2luZzpcIm5vcm1hbFwiLGxpbmVIZWlnaHQ6XCIxMjAlXCIsbWFyZ2luQm90dG9tOlwiMHB4XCIsbWFyZ2luTGVmdDpcIjBweFwiLG1hcmdpblJpZ2h0OlwiMHB4XCIsbWFyZ2luVG9wOlwiMHB4XCIsbWF4SGVpZ2h0Olwibm9uZVwiLG1heFdpZHRoOlwibm9uZVwiLG1pbkhlaWdodDpcIjBweFwiLG1pbldpZHRoOlwiMHB4XCIsb3BhY2l0eTpcIjEuMFwiLG91dGxpbmVDb2xvcjpcImludmVydFwiLG91dGxpbmVPZmZzZXQ6XCIwcHhcIixvdXRsaW5lV2lkdGg6XCIzcHhcIixwYWRkaW5nQm90dG9tOlwiMHB4XCIscGFkZGluZ0xlZnQ6XCIwcHhcIixwYWRkaW5nUmlnaHQ6XCIwcHhcIixwYWRkaW5nVG9wOlwiMHB4XCIscmlnaHQ6XCJhdXRvXCIsc3Ryb2tlRGFzaGFycmF5Olwibm9uZVwiLHN0cm9rZURhc2hvZmZzZXQ6XCIwcHhcIix0ZXh0SW5kZW50OlwiMHB4XCIsdGV4dFNoYWRvdzpcIjBweCAwcHggMHB4IHRyYW5zcGFyZW50XCIsdG9wOlwiYXV0b1wiLHRyYW5zZm9ybTpcIlwiLHZlcnRpY2FsQWxpZ246XCIwcHhcIix2aXNpYmlsaXR5OlwidmlzaWJsZVwiLHdpZHRoOlwiYXV0b1wiLHdvcmRTcGFjaW5nOlwibm9ybWFsXCIsekluZGV4OlwiYXV0b1wifTtiLnByb3BlcnR5SW50ZXJwb2xhdGlvbj1nfShjLGQpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGIpe3ZhciBjPWEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24oYiksZD1mdW5jdGlvbihkKXtyZXR1cm4gYS5jYWxjdWxhdGVJdGVyYXRpb25Qcm9ncmVzcyhjLGQsYil9O3JldHVybiBkLl90b3RhbER1cmF0aW9uPWIuZGVsYXkrYytiLmVuZERlbGF5LGR9Yi5LZXlmcmFtZUVmZmVjdD1mdW5jdGlvbihjLGUsZixnKXt2YXIgaCxpPWQoYS5ub3JtYWxpemVUaW1pbmdJbnB1dChmKSksaj1iLmNvbnZlcnRFZmZlY3RJbnB1dChlKSxrPWZ1bmN0aW9uKCl7aihjLGgpfTtyZXR1cm4gay5fdXBkYXRlPWZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT09KGg9aShhKSl9LGsuX2NsZWFyPWZ1bmN0aW9uKCl7aihjLG51bGwpfSxrLl9oYXNTYW1lVGFyZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiBjPT09YX0say5fdGFyZ2V0PWMsay5fdG90YWxEdXJhdGlvbj1pLl90b3RhbER1cmF0aW9uLGsuX2lkPWcsa319KGMsZCksZnVuY3Rpb24oYSxiKXthLmFwcGx5PWZ1bmN0aW9uKGIsYyxkKXtiLnN0eWxlW2EucHJvcGVydHlOYW1lKGMpXT1kfSxhLmNsZWFyPWZ1bmN0aW9uKGIsYyl7Yi5zdHlsZVthLnByb3BlcnR5TmFtZShjKV09XCJcIn19KGQpLGZ1bmN0aW9uKGEpe3dpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlPWZ1bmN0aW9uKGIsYyl7dmFyIGQ9XCJcIjtyZXR1cm4gYyYmYy5pZCYmKGQ9Yy5pZCksYS50aW1lbGluZS5fcGxheShhLktleWZyYW1lRWZmZWN0KHRoaXMsYixjLGQpKX19KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhLGIsZCl7aWYoXCJudW1iZXJcIj09dHlwZW9mIGEmJlwibnVtYmVyXCI9PXR5cGVvZiBiKXJldHVybiBhKigxLWQpK2IqZDtpZihcImJvb2xlYW5cIj09dHlwZW9mIGEmJlwiYm9vbGVhblwiPT10eXBlb2YgYilyZXR1cm4gZDwuNT9hOmI7aWYoYS5sZW5ndGg9PWIubGVuZ3RoKXtmb3IodmFyIGU9W10sZj0wO2Y8YS5sZW5ndGg7ZisrKWUucHVzaChjKGFbZl0sYltmXSxkKSk7cmV0dXJuIGV9dGhyb3dcIk1pc21hdGNoZWQgaW50ZXJwb2xhdGlvbiBhcmd1bWVudHMgXCIrYStcIjpcIitifWEuSW50ZXJwb2xhdGlvbj1mdW5jdGlvbihhLGIsZCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBkKGMoYSxiLGUpKX19fShkKSxmdW5jdGlvbihhLGIsYyl7YS5zZXF1ZW5jZU51bWJlcj0wO3ZhciBkPWZ1bmN0aW9uKGEsYixjKXt0aGlzLnRhcmdldD1hLHRoaXMuY3VycmVudFRpbWU9Yix0aGlzLnRpbWVsaW5lVGltZT1jLHRoaXMudHlwZT1cImZpbmlzaFwiLHRoaXMuYnViYmxlcz0hMSx0aGlzLmNhbmNlbGFibGU9ITEsdGhpcy5jdXJyZW50VGFyZ2V0PWEsdGhpcy5kZWZhdWx0UHJldmVudGVkPSExLHRoaXMuZXZlbnRQaGFzZT1FdmVudC5BVF9UQVJHRVQsdGhpcy50aW1lU3RhbXA9RGF0ZS5ub3coKX07Yi5BbmltYXRpb249ZnVuY3Rpb24oYil7dGhpcy5pZD1cIlwiLGImJmIuX2lkJiYodGhpcy5pZD1iLl9pZCksdGhpcy5fc2VxdWVuY2VOdW1iZXI9YS5zZXF1ZW5jZU51bWJlcisrLHRoaXMuX2N1cnJlbnRUaW1lPTAsdGhpcy5fc3RhcnRUaW1lPW51bGwsdGhpcy5fcGF1c2VkPSExLHRoaXMuX3BsYXliYWNrUmF0ZT0xLHRoaXMuX2luVGltZWxpbmU9ITAsdGhpcy5fZmluaXNoZWRGbGFnPSEwLHRoaXMub25maW5pc2g9bnVsbCx0aGlzLl9maW5pc2hIYW5kbGVycz1bXSx0aGlzLl9lZmZlY3Q9Yix0aGlzLl9pbkVmZmVjdD10aGlzLl9lZmZlY3QuX3VwZGF0ZSgwKSx0aGlzLl9pZGxlPSEwLHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMX0sYi5BbmltYXRpb24ucHJvdG90eXBlPXtfZW5zdXJlQWxpdmU6ZnVuY3Rpb24oKXt0aGlzLnBsYXliYWNrUmF0ZTwwJiYwPT09dGhpcy5jdXJyZW50VGltZT90aGlzLl9pbkVmZmVjdD10aGlzLl9lZmZlY3QuX3VwZGF0ZSgtMSk6dGhpcy5faW5FZmZlY3Q9dGhpcy5fZWZmZWN0Ll91cGRhdGUodGhpcy5jdXJyZW50VGltZSksdGhpcy5faW5UaW1lbGluZXx8IXRoaXMuX2luRWZmZWN0JiZ0aGlzLl9maW5pc2hlZEZsYWd8fCh0aGlzLl9pblRpbWVsaW5lPSEwLGIudGltZWxpbmUuX2FuaW1hdGlvbnMucHVzaCh0aGlzKSl9LF90aWNrQ3VycmVudFRpbWU6ZnVuY3Rpb24oYSxiKXthIT10aGlzLl9jdXJyZW50VGltZSYmKHRoaXMuX2N1cnJlbnRUaW1lPWEsdGhpcy5faXNGaW5pc2hlZCYmIWImJih0aGlzLl9jdXJyZW50VGltZT10aGlzLl9wbGF5YmFja1JhdGU+MD90aGlzLl90b3RhbER1cmF0aW9uOjApLHRoaXMuX2Vuc3VyZUFsaXZlKCkpfSxnZXQgY3VycmVudFRpbWUoKXtyZXR1cm4gdGhpcy5faWRsZXx8dGhpcy5fY3VycmVudFRpbWVQZW5kaW5nP251bGw6dGhpcy5fY3VycmVudFRpbWV9LHNldCBjdXJyZW50VGltZShhKXthPSthLGlzTmFOKGEpfHwoYi5yZXN0YXJ0KCksdGhpcy5fcGF1c2VkfHxudWxsPT10aGlzLl9zdGFydFRpbWV8fCh0aGlzLl9zdGFydFRpbWU9dGhpcy5fdGltZWxpbmUuY3VycmVudFRpbWUtYS90aGlzLl9wbGF5YmFja1JhdGUpLHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMSx0aGlzLl9jdXJyZW50VGltZSE9YSYmKHRoaXMuX2lkbGUmJih0aGlzLl9pZGxlPSExLHRoaXMuX3BhdXNlZD0hMCksdGhpcy5fdGlja0N1cnJlbnRUaW1lKGEsITApLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKSl9LGdldCBzdGFydFRpbWUoKXtyZXR1cm4gdGhpcy5fc3RhcnRUaW1lfSxzZXQgc3RhcnRUaW1lKGEpe2E9K2EsaXNOYU4oYSl8fHRoaXMuX3BhdXNlZHx8dGhpcy5faWRsZXx8KHRoaXMuX3N0YXJ0VGltZT1hLHRoaXMuX3RpY2tDdXJyZW50VGltZSgodGhpcy5fdGltZWxpbmUuY3VycmVudFRpbWUtdGhpcy5fc3RhcnRUaW1lKSp0aGlzLnBsYXliYWNrUmF0ZSksYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcykpfSxnZXQgcGxheWJhY2tSYXRlKCl7cmV0dXJuIHRoaXMuX3BsYXliYWNrUmF0ZX0sc2V0IHBsYXliYWNrUmF0ZShhKXtpZihhIT10aGlzLl9wbGF5YmFja1JhdGUpe3ZhciBjPXRoaXMuY3VycmVudFRpbWU7dGhpcy5fcGxheWJhY2tSYXRlPWEsdGhpcy5fc3RhcnRUaW1lPW51bGwsXCJwYXVzZWRcIiE9dGhpcy5wbGF5U3RhdGUmJlwiaWRsZVwiIT10aGlzLnBsYXlTdGF0ZSYmKHRoaXMuX2ZpbmlzaGVkRmxhZz0hMSx0aGlzLl9pZGxlPSExLHRoaXMuX2Vuc3VyZUFsaXZlKCksYi5hcHBseURpcnRpZWRBbmltYXRpb24odGhpcykpLG51bGwhPWMmJih0aGlzLmN1cnJlbnRUaW1lPWMpfX0sZ2V0IF9pc0ZpbmlzaGVkKCl7cmV0dXJuIXRoaXMuX2lkbGUmJih0aGlzLl9wbGF5YmFja1JhdGU+MCYmdGhpcy5fY3VycmVudFRpbWU+PXRoaXMuX3RvdGFsRHVyYXRpb258fHRoaXMuX3BsYXliYWNrUmF0ZTwwJiZ0aGlzLl9jdXJyZW50VGltZTw9MCl9LGdldCBfdG90YWxEdXJhdGlvbigpe3JldHVybiB0aGlzLl9lZmZlY3QuX3RvdGFsRHVyYXRpb259LGdldCBwbGF5U3RhdGUoKXtyZXR1cm4gdGhpcy5faWRsZT9cImlkbGVcIjpudWxsPT10aGlzLl9zdGFydFRpbWUmJiF0aGlzLl9wYXVzZWQmJjAhPXRoaXMucGxheWJhY2tSYXRlfHx0aGlzLl9jdXJyZW50VGltZVBlbmRpbmc/XCJwZW5kaW5nXCI6dGhpcy5fcGF1c2VkP1wicGF1c2VkXCI6dGhpcy5faXNGaW5pc2hlZD9cImZpbmlzaGVkXCI6XCJydW5uaW5nXCJ9LF9yZXdpbmQ6ZnVuY3Rpb24oKXtpZih0aGlzLl9wbGF5YmFja1JhdGU+PTApdGhpcy5fY3VycmVudFRpbWU9MDtlbHNle2lmKCEodGhpcy5fdG90YWxEdXJhdGlvbjwxLzApKXRocm93IG5ldyBET01FeGNlcHRpb24oXCJVbmFibGUgdG8gcmV3aW5kIG5lZ2F0aXZlIHBsYXliYWNrIHJhdGUgYW5pbWF0aW9uIHdpdGggaW5maW5pdGUgZHVyYXRpb25cIixcIkludmFsaWRTdGF0ZUVycm9yXCIpO3RoaXMuX2N1cnJlbnRUaW1lPXRoaXMuX3RvdGFsRHVyYXRpb259fSxwbGF5OmZ1bmN0aW9uKCl7dGhpcy5fcGF1c2VkPSExLCh0aGlzLl9pc0ZpbmlzaGVkfHx0aGlzLl9pZGxlKSYmKHRoaXMuX3Jld2luZCgpLHRoaXMuX3N0YXJ0VGltZT1udWxsKSx0aGlzLl9maW5pc2hlZEZsYWc9ITEsdGhpcy5faWRsZT0hMSx0aGlzLl9lbnN1cmVBbGl2ZSgpLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpfSxwYXVzZTpmdW5jdGlvbigpe3RoaXMuX2lzRmluaXNoZWR8fHRoaXMuX3BhdXNlZHx8dGhpcy5faWRsZT90aGlzLl9pZGxlJiYodGhpcy5fcmV3aW5kKCksdGhpcy5faWRsZT0hMSk6dGhpcy5fY3VycmVudFRpbWVQZW5kaW5nPSEwLHRoaXMuX3N0YXJ0VGltZT1udWxsLHRoaXMuX3BhdXNlZD0hMH0sZmluaXNoOmZ1bmN0aW9uKCl7dGhpcy5faWRsZXx8KHRoaXMuY3VycmVudFRpbWU9dGhpcy5fcGxheWJhY2tSYXRlPjA/dGhpcy5fdG90YWxEdXJhdGlvbjowLHRoaXMuX3N0YXJ0VGltZT10aGlzLl90b3RhbER1cmF0aW9uLXRoaXMuY3VycmVudFRpbWUsdGhpcy5fY3VycmVudFRpbWVQZW5kaW5nPSExLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKX0sY2FuY2VsOmZ1bmN0aW9uKCl7dGhpcy5faW5FZmZlY3QmJih0aGlzLl9pbkVmZmVjdD0hMSx0aGlzLl9pZGxlPSEwLHRoaXMuX3BhdXNlZD0hMSx0aGlzLl9pc0ZpbmlzaGVkPSEwLHRoaXMuX2ZpbmlzaGVkRmxhZz0hMCx0aGlzLl9jdXJyZW50VGltZT0wLHRoaXMuX3N0YXJ0VGltZT1udWxsLHRoaXMuX2VmZmVjdC5fdXBkYXRlKG51bGwpLGIuYXBwbHlEaXJ0aWVkQW5pbWF0aW9uKHRoaXMpKX0scmV2ZXJzZTpmdW5jdGlvbigpe3RoaXMucGxheWJhY2tSYXRlKj0tMSx0aGlzLnBsYXkoKX0sYWRkRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGImJlwiZmluaXNoXCI9PWEmJnRoaXMuX2ZpbmlzaEhhbmRsZXJzLnB1c2goYil9LHJlbW92ZUV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24oYSxiKXtpZihcImZpbmlzaFwiPT1hKXt2YXIgYz10aGlzLl9maW5pc2hIYW5kbGVycy5pbmRleE9mKGIpO2M+PTAmJnRoaXMuX2ZpbmlzaEhhbmRsZXJzLnNwbGljZShjLDEpfX0sX2ZpcmVFdmVudHM6ZnVuY3Rpb24oYSl7aWYodGhpcy5faXNGaW5pc2hlZCl7aWYoIXRoaXMuX2ZpbmlzaGVkRmxhZyl7dmFyIGI9bmV3IGQodGhpcyx0aGlzLl9jdXJyZW50VGltZSxhKSxjPXRoaXMuX2ZpbmlzaEhhbmRsZXJzLmNvbmNhdCh0aGlzLm9uZmluaXNoP1t0aGlzLm9uZmluaXNoXTpbXSk7c2V0VGltZW91dChmdW5jdGlvbigpe2MuZm9yRWFjaChmdW5jdGlvbihhKXthLmNhbGwoYi50YXJnZXQsYil9KX0sMCksdGhpcy5fZmluaXNoZWRGbGFnPSEwfX1lbHNlIHRoaXMuX2ZpbmlzaGVkRmxhZz0hMX0sX3RpY2s6ZnVuY3Rpb24oYSxiKXt0aGlzLl9pZGxlfHx0aGlzLl9wYXVzZWR8fChudWxsPT10aGlzLl9zdGFydFRpbWU/YiYmKHRoaXMuc3RhcnRUaW1lPWEtdGhpcy5fY3VycmVudFRpbWUvdGhpcy5wbGF5YmFja1JhdGUpOnRoaXMuX2lzRmluaXNoZWR8fHRoaXMuX3RpY2tDdXJyZW50VGltZSgoYS10aGlzLl9zdGFydFRpbWUpKnRoaXMucGxheWJhY2tSYXRlKSksYiYmKHRoaXMuX2N1cnJlbnRUaW1lUGVuZGluZz0hMSx0aGlzLl9maXJlRXZlbnRzKGEpKX0sZ2V0IF9uZWVkc1RpY2soKXtyZXR1cm4gdGhpcy5wbGF5U3RhdGUgaW57cGVuZGluZzoxLHJ1bm5pbmc6MX18fCF0aGlzLl9maW5pc2hlZEZsYWd9LF90YXJnZXRBbmltYXRpb25zOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fZWZmZWN0Ll90YXJnZXQ7cmV0dXJuIGEuX2FjdGl2ZUFuaW1hdGlvbnN8fChhLl9hY3RpdmVBbmltYXRpb25zPVtdKSxhLl9hY3RpdmVBbmltYXRpb25zfSxfbWFya1RhcmdldDpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX3RhcmdldEFuaW1hdGlvbnMoKTstMT09PWEuaW5kZXhPZih0aGlzKSYmYS5wdXNoKHRoaXMpfSxfdW5tYXJrVGFyZ2V0OmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5fdGFyZ2V0QW5pbWF0aW9ucygpLGI9YS5pbmRleE9mKHRoaXMpOy0xIT09YiYmYS5zcGxpY2UoYiwxKX19fShjLGQpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe3ZhciBiPWo7aj1bXSxhPHEuY3VycmVudFRpbWUmJihhPXEuY3VycmVudFRpbWUpLHEuX2FuaW1hdGlvbnMuc29ydChlKSxxLl9hbmltYXRpb25zPWgoYSwhMCxxLl9hbmltYXRpb25zKVswXSxiLmZvckVhY2goZnVuY3Rpb24oYil7YlsxXShhKX0pLGcoKSxsPXZvaWQgMH1mdW5jdGlvbiBlKGEsYil7cmV0dXJuIGEuX3NlcXVlbmNlTnVtYmVyLWIuX3NlcXVlbmNlTnVtYmVyfWZ1bmN0aW9uIGYoKXt0aGlzLl9hbmltYXRpb25zPVtdLHRoaXMuY3VycmVudFRpbWU9d2luZG93LnBlcmZvcm1hbmNlJiZwZXJmb3JtYW5jZS5ub3c/cGVyZm9ybWFuY2Uubm93KCk6MH1mdW5jdGlvbiBnKCl7by5mb3JFYWNoKGZ1bmN0aW9uKGEpe2EoKX0pLG8ubGVuZ3RoPTB9ZnVuY3Rpb24gaChhLGMsZCl7cD0hMCxuPSExLGIudGltZWxpbmUuY3VycmVudFRpbWU9YSxtPSExO3ZhciBlPVtdLGY9W10sZz1bXSxoPVtdO3JldHVybiBkLmZvckVhY2goZnVuY3Rpb24oYil7Yi5fdGljayhhLGMpLGIuX2luRWZmZWN0PyhmLnB1c2goYi5fZWZmZWN0KSxiLl9tYXJrVGFyZ2V0KCkpOihlLnB1c2goYi5fZWZmZWN0KSxiLl91bm1hcmtUYXJnZXQoKSksYi5fbmVlZHNUaWNrJiYobT0hMCk7dmFyIGQ9Yi5faW5FZmZlY3R8fGIuX25lZWRzVGljaztiLl9pblRpbWVsaW5lPWQsZD9nLnB1c2goYik6aC5wdXNoKGIpfSksby5wdXNoLmFwcGx5KG8sZSksby5wdXNoLmFwcGx5KG8sZiksbSYmcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7fSkscD0hMSxbZyxoXX12YXIgaT13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLGo9W10saz0wO3dpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oYSl7dmFyIGI9aysrO3JldHVybiAwPT1qLmxlbmd0aCYmaShkKSxqLnB1c2goW2IsYV0pLGJ9LHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZT1mdW5jdGlvbihhKXtqLmZvckVhY2goZnVuY3Rpb24oYil7YlswXT09YSYmKGJbMV09ZnVuY3Rpb24oKXt9KX0pfSxmLnByb3RvdHlwZT17X3BsYXk6ZnVuY3Rpb24oYyl7Yy5fdGltaW5nPWEubm9ybWFsaXplVGltaW5nSW5wdXQoYy50aW1pbmcpO3ZhciBkPW5ldyBiLkFuaW1hdGlvbihjKTtyZXR1cm4gZC5faWRsZT0hMSxkLl90aW1lbGluZT10aGlzLHRoaXMuX2FuaW1hdGlvbnMucHVzaChkKSxiLnJlc3RhcnQoKSxiLmFwcGx5RGlydGllZEFuaW1hdGlvbihkKSxkfX07dmFyIGw9dm9pZCAwLG09ITEsbj0hMTtiLnJlc3RhcnQ9ZnVuY3Rpb24oKXtyZXR1cm4gbXx8KG09ITAscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7fSksbj0hMCksbn0sYi5hcHBseURpcnRpZWRBbmltYXRpb249ZnVuY3Rpb24oYSl7aWYoIXApe2EuX21hcmtUYXJnZXQoKTt2YXIgYz1hLl90YXJnZXRBbmltYXRpb25zKCk7Yy5zb3J0KGUpLGgoYi50aW1lbGluZS5jdXJyZW50VGltZSwhMSxjLnNsaWNlKCkpWzFdLmZvckVhY2goZnVuY3Rpb24oYSl7dmFyIGI9cS5fYW5pbWF0aW9ucy5pbmRleE9mKGEpOy0xIT09YiYmcS5fYW5pbWF0aW9ucy5zcGxpY2UoYiwxKX0pLGcoKX19O3ZhciBvPVtdLHA9ITEscT1uZXcgZjtiLnRpbWVsaW5lPXF9KGMsZCksZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYihhLGIpe3ZhciBjPWEuZXhlYyhiKTtpZihjKXJldHVybiBjPWEuaWdub3JlQ2FzZT9jWzBdLnRvTG93ZXJDYXNlKCk6Y1swXSxbYyxiLnN1YnN0cihjLmxlbmd0aCldfWZ1bmN0aW9uIGMoYSxiKXtiPWIucmVwbGFjZSgvXlxccyovLFwiXCIpO3ZhciBjPWEoYik7aWYoYylyZXR1cm5bY1swXSxjWzFdLnJlcGxhY2UoL15cXHMqLyxcIlwiKV19ZnVuY3Rpb24gZChhLGQsZSl7YT1jLmJpbmQobnVsbCxhKTtmb3IodmFyIGY9W107Oyl7dmFyIGc9YShlKTtpZighZylyZXR1cm5bZixlXTtpZihmLnB1c2goZ1swXSksZT1nWzFdLCEoZz1iKGQsZSkpfHxcIlwiPT1nWzFdKXJldHVybltmLGVdO2U9Z1sxXX19ZnVuY3Rpb24gZShhLGIpe2Zvcih2YXIgYz0wLGQ9MDtkPGIubGVuZ3RoJiYoIS9cXHN8LC8udGVzdChiW2RdKXx8MCE9Yyk7ZCsrKWlmKFwiKFwiPT1iW2RdKWMrKztlbHNlIGlmKFwiKVwiPT1iW2RdJiYoYy0tLDA9PWMmJmQrKyxjPD0wKSlicmVhazt2YXIgZT1hKGIuc3Vic3RyKDAsZCkpO3JldHVybiB2b2lkIDA9PWU/dm9pZCAwOltlLGIuc3Vic3RyKGQpXX1mdW5jdGlvbiBmKGEsYil7Zm9yKHZhciBjPWEsZD1iO2MmJmQ7KWM+ZD9jJT1kOmQlPWM7cmV0dXJuIGM9YSpiLyhjK2QpfWZ1bmN0aW9uIGcoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3ZhciBjPWEoYik7cmV0dXJuIGMmJihjWzBdPXZvaWQgMCksY319ZnVuY3Rpb24gaChhLGIpe3JldHVybiBmdW5jdGlvbihjKXtyZXR1cm4gYShjKXx8W2IsY119fWZ1bmN0aW9uIGkoYixjKXtmb3IodmFyIGQ9W10sZT0wO2U8Yi5sZW5ndGg7ZSsrKXt2YXIgZj1hLmNvbnN1bWVUcmltbWVkKGJbZV0sYyk7aWYoIWZ8fFwiXCI9PWZbMF0pcmV0dXJuO3ZvaWQgMCE9PWZbMF0mJmQucHVzaChmWzBdKSxjPWZbMV19aWYoXCJcIj09YylyZXR1cm4gZH1mdW5jdGlvbiBqKGEsYixjLGQsZSl7Zm9yKHZhciBnPVtdLGg9W10saT1bXSxqPWYoZC5sZW5ndGgsZS5sZW5ndGgpLGs9MDtrPGo7aysrKXt2YXIgbD1iKGRbayVkLmxlbmd0aF0sZVtrJWUubGVuZ3RoXSk7aWYoIWwpcmV0dXJuO2cucHVzaChsWzBdKSxoLnB1c2gobFsxXSksaS5wdXNoKGxbMl0pfXJldHVybltnLGgsZnVuY3Rpb24oYil7dmFyIGQ9Yi5tYXAoZnVuY3Rpb24oYSxiKXtyZXR1cm4gaVtiXShhKX0pLmpvaW4oYyk7cmV0dXJuIGE/YShkKTpkfV19ZnVuY3Rpb24gayhhLGIsYyl7Zm9yKHZhciBkPVtdLGU9W10sZj1bXSxnPTAsaD0wO2g8Yy5sZW5ndGg7aCsrKWlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGNbaF0pe3ZhciBpPWNbaF0oYVtnXSxiW2crK10pO2QucHVzaChpWzBdKSxlLnB1c2goaVsxXSksZi5wdXNoKGlbMl0pfWVsc2UhZnVuY3Rpb24oYSl7ZC5wdXNoKCExKSxlLnB1c2goITEpLGYucHVzaChmdW5jdGlvbigpe3JldHVybiBjW2FdfSl9KGgpO3JldHVybltkLGUsZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVwiXCIsYz0wO2M8YS5sZW5ndGg7YysrKWIrPWZbY10oYVtjXSk7cmV0dXJuIGJ9XX1hLmNvbnN1bWVUb2tlbj1iLGEuY29uc3VtZVRyaW1tZWQ9YyxhLmNvbnN1bWVSZXBlYXRlZD1kLGEuY29uc3VtZVBhcmVudGhlc2lzZWQ9ZSxhLmlnbm9yZT1nLGEub3B0aW9uYWw9aCxhLmNvbnN1bWVMaXN0PWksYS5tZXJnZU5lc3RlZFJlcGVhdGVkPWouYmluZChudWxsLG51bGwpLGEubWVyZ2VXcmFwcGVkTmVzdGVkUmVwZWF0ZWQ9aixhLm1lcmdlTGlzdD1rfShkKSxmdW5jdGlvbihhKXtmdW5jdGlvbiBiKGIpe2Z1bmN0aW9uIGMoYil7dmFyIGM9YS5jb25zdW1lVG9rZW4oL15pbnNldC9pLGIpO2lmKGMpcmV0dXJuIGQuaW5zZXQ9ITAsYzt2YXIgYz1hLmNvbnN1bWVMZW5ndGhPclBlcmNlbnQoYik7aWYoYylyZXR1cm4gZC5sZW5ndGhzLnB1c2goY1swXSksYzt2YXIgYz1hLmNvbnN1bWVDb2xvcihiKTtyZXR1cm4gYz8oZC5jb2xvcj1jWzBdLGMpOnZvaWQgMH12YXIgZD17aW5zZXQ6ITEsbGVuZ3RoczpbXSxjb2xvcjpudWxsfSxlPWEuY29uc3VtZVJlcGVhdGVkKGMsL14vLGIpO2lmKGUmJmVbMF0ubGVuZ3RoKXJldHVybltkLGVbMV1dfWZ1bmN0aW9uIGMoYyl7dmFyIGQ9YS5jb25zdW1lUmVwZWF0ZWQoYiwvXiwvLGMpO2lmKGQmJlwiXCI9PWRbMV0pcmV0dXJuIGRbMF19ZnVuY3Rpb24gZChiLGMpe2Zvcig7Yi5sZW5ndGhzLmxlbmd0aDxNYXRoLm1heChiLmxlbmd0aHMubGVuZ3RoLGMubGVuZ3Rocy5sZW5ndGgpOyliLmxlbmd0aHMucHVzaCh7cHg6MH0pO2Zvcig7Yy5sZW5ndGhzLmxlbmd0aDxNYXRoLm1heChiLmxlbmd0aHMubGVuZ3RoLGMubGVuZ3Rocy5sZW5ndGgpOyljLmxlbmd0aHMucHVzaCh7cHg6MH0pO2lmKGIuaW5zZXQ9PWMuaW5zZXQmJiEhYi5jb2xvcj09ISFjLmNvbG9yKXtmb3IodmFyIGQsZT1bXSxmPVtbXSwwXSxnPVtbXSwwXSxoPTA7aDxiLmxlbmd0aHMubGVuZ3RoO2grKyl7dmFyIGk9YS5tZXJnZURpbWVuc2lvbnMoYi5sZW5ndGhzW2hdLGMubGVuZ3Roc1toXSwyPT1oKTtmWzBdLnB1c2goaVswXSksZ1swXS5wdXNoKGlbMV0pLGUucHVzaChpWzJdKX1pZihiLmNvbG9yJiZjLmNvbG9yKXt2YXIgaj1hLm1lcmdlQ29sb3JzKGIuY29sb3IsYy5jb2xvcik7ZlsxXT1qWzBdLGdbMV09alsxXSxkPWpbMl19cmV0dXJuW2YsZyxmdW5jdGlvbihhKXtmb3IodmFyIGM9Yi5pbnNldD9cImluc2V0IFwiOlwiIFwiLGY9MDtmPGUubGVuZ3RoO2YrKyljKz1lW2ZdKGFbMF1bZl0pK1wiIFwiO3JldHVybiBkJiYoYys9ZChhWzFdKSksY31dfX1mdW5jdGlvbiBlKGIsYyxkLGUpe2Z1bmN0aW9uIGYoYSl7cmV0dXJue2luc2V0OmEsY29sb3I6WzAsMCwwLDBdLGxlbmd0aHM6W3tweDowfSx7cHg6MH0se3B4OjB9LHtweDowfV19fWZvcih2YXIgZz1bXSxoPVtdLGk9MDtpPGQubGVuZ3RofHxpPGUubGVuZ3RoO2krKyl7dmFyIGo9ZFtpXXx8ZihlW2ldLmluc2V0KSxrPWVbaV18fGYoZFtpXS5pbnNldCk7Zy5wdXNoKGopLGgucHVzaChrKX1yZXR1cm4gYS5tZXJnZU5lc3RlZFJlcGVhdGVkKGIsYyxnLGgpfXZhciBmPWUuYmluZChudWxsLGQsXCIsIFwiKTthLmFkZFByb3BlcnRpZXNIYW5kbGVyKGMsZixbXCJib3gtc2hhZG93XCIsXCJ0ZXh0LXNoYWRvd1wiXSl9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gYS50b0ZpeGVkKDMpLnJlcGxhY2UoLzArJC8sXCJcIikucmVwbGFjZSgvXFwuJC8sXCJcIil9ZnVuY3Rpb24gZChhLGIsYyl7cmV0dXJuIE1hdGgubWluKGIsTWF0aC5tYXgoYSxjKSl9ZnVuY3Rpb24gZShhKXtpZigvXlxccypbLStdPyhcXGQqXFwuKT9cXGQrXFxzKiQvLnRlc3QoYSkpcmV0dXJuIE51bWJlcihhKX1mdW5jdGlvbiBmKGEsYil7cmV0dXJuW2EsYixjXX1mdW5jdGlvbiBnKGEsYil7aWYoMCE9YSlyZXR1cm4gaSgwLDEvMCkoYSxiKX1mdW5jdGlvbiBoKGEsYil7cmV0dXJuW2EsYixmdW5jdGlvbihhKXtyZXR1cm4gTWF0aC5yb3VuZChkKDEsMS8wLGEpKX1dfWZ1bmN0aW9uIGkoYSxiKXtyZXR1cm4gZnVuY3Rpb24oZSxmKXtyZXR1cm5bZSxmLGZ1bmN0aW9uKGUpe3JldHVybiBjKGQoYSxiLGUpKX1dfX1mdW5jdGlvbiBqKGEpe3ZhciBiPWEudHJpbSgpLnNwbGl0KC9cXHMqW1xccyxdXFxzKi8pO2lmKDAhPT1iLmxlbmd0aCl7Zm9yKHZhciBjPVtdLGQ9MDtkPGIubGVuZ3RoO2QrKyl7dmFyIGY9ZShiW2RdKTtpZih2b2lkIDA9PT1mKXJldHVybjtjLnB1c2goZil9cmV0dXJuIGN9fWZ1bmN0aW9uIGsoYSxiKXtpZihhLmxlbmd0aD09Yi5sZW5ndGgpcmV0dXJuW2EsYixmdW5jdGlvbihhKXtyZXR1cm4gYS5tYXAoYykuam9pbihcIiBcIil9XX1mdW5jdGlvbiBsKGEsYil7cmV0dXJuW2EsYixNYXRoLnJvdW5kXX1hLmNsYW1wPWQsYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihqLGssW1wic3Ryb2tlLWRhc2hhcnJheVwiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihlLGkoMCwxLzApLFtcImJvcmRlci1pbWFnZS13aWR0aFwiLFwibGluZS1oZWlnaHRcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxpKDAsMSksW1wib3BhY2l0eVwiLFwic2hhcGUtaW1hZ2UtdGhyZXNob2xkXCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsZyxbXCJmbGV4LWdyb3dcIixcImZsZXgtc2hyaW5rXCJdKSxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGUsaCxbXCJvcnBoYW5zXCIsXCJ3aWRvd3NcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxsLFtcInotaW5kZXhcIl0pLGEucGFyc2VOdW1iZXI9ZSxhLnBhcnNlTnVtYmVyTGlzdD1qLGEubWVyZ2VOdW1iZXJzPWYsYS5udW1iZXJUb1N0cmluZz1jfShkKSxmdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoYSxiKXtpZihcInZpc2libGVcIj09YXx8XCJ2aXNpYmxlXCI9PWIpcmV0dXJuWzAsMSxmdW5jdGlvbihjKXtyZXR1cm4gYzw9MD9hOmM+PTE/YjpcInZpc2libGVcIn1dfWEuYWRkUHJvcGVydGllc0hhbmRsZXIoU3RyaW5nLGMsW1widmlzaWJpbGl0eVwiXSl9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhhKXthPWEudHJpbSgpLGYuZmlsbFN0eWxlPVwiIzAwMFwiLGYuZmlsbFN0eWxlPWE7dmFyIGI9Zi5maWxsU3R5bGU7aWYoZi5maWxsU3R5bGU9XCIjZmZmXCIsZi5maWxsU3R5bGU9YSxiPT1mLmZpbGxTdHlsZSl7Zi5maWxsUmVjdCgwLDAsMSwxKTt2YXIgYz1mLmdldEltYWdlRGF0YSgwLDAsMSwxKS5kYXRhO2YuY2xlYXJSZWN0KDAsMCwxLDEpO3ZhciBkPWNbM10vMjU1O3JldHVybltjWzBdKmQsY1sxXSpkLGNbMl0qZCxkXX19ZnVuY3Rpb24gZChiLGMpe3JldHVybltiLGMsZnVuY3Rpb24oYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gTWF0aC5tYXgoMCxNYXRoLm1pbigyNTUsYSkpfWlmKGJbM10pZm9yKHZhciBkPTA7ZDwzO2QrKyliW2RdPU1hdGgucm91bmQoYyhiW2RdL2JbM10pKTtyZXR1cm4gYlszXT1hLm51bWJlclRvU3RyaW5nKGEuY2xhbXAoMCwxLGJbM10pKSxcInJnYmEoXCIrYi5qb2luKFwiLFwiKStcIilcIn1dfXZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImNhbnZhc1wiKTtlLndpZHRoPWUuaGVpZ2h0PTE7dmFyIGY9ZS5nZXRDb250ZXh0KFwiMmRcIik7YS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihjLGQsW1wiYmFja2dyb3VuZC1jb2xvclwiLFwiYm9yZGVyLWJvdHRvbS1jb2xvclwiLFwiYm9yZGVyLWxlZnQtY29sb3JcIixcImJvcmRlci1yaWdodC1jb2xvclwiLFwiYm9yZGVyLXRvcC1jb2xvclwiLFwiY29sb3JcIixcImZpbGxcIixcImZsb29kLWNvbG9yXCIsXCJsaWdodGluZy1jb2xvclwiLFwib3V0bGluZS1jb2xvclwiLFwic3RvcC1jb2xvclwiLFwic3Ryb2tlXCIsXCJ0ZXh0LWRlY29yYXRpb24tY29sb3JcIl0pLGEuY29uc3VtZUNvbG9yPWEuY29uc3VtZVBhcmVudGhlc2lzZWQuYmluZChudWxsLGMpLGEubWVyZ2VDb2xvcnM9ZH0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe2Z1bmN0aW9uIGIoKXt2YXIgYj1oLmV4ZWMoYSk7Zz1iP2JbMF06dm9pZCAwfWZ1bmN0aW9uIGMoKXt2YXIgYT1OdW1iZXIoZyk7cmV0dXJuIGIoKSxhfWZ1bmN0aW9uIGQoKXtpZihcIihcIiE9PWcpcmV0dXJuIGMoKTtiKCk7dmFyIGE9ZigpO3JldHVyblwiKVwiIT09Zz9OYU46KGIoKSxhKX1mdW5jdGlvbiBlKCl7Zm9yKHZhciBhPWQoKTtcIipcIj09PWd8fFwiL1wiPT09Zzspe3ZhciBjPWc7YigpO3ZhciBlPWQoKTtcIipcIj09PWM/YSo9ZTphLz1lfXJldHVybiBhfWZ1bmN0aW9uIGYoKXtmb3IodmFyIGE9ZSgpO1wiK1wiPT09Z3x8XCItXCI9PT1nOyl7dmFyIGM9ZztiKCk7dmFyIGQ9ZSgpO1wiK1wiPT09Yz9hKz1kOmEtPWR9cmV0dXJuIGF9dmFyIGcsaD0vKFtcXCtcXC1cXHdcXC5dK3xbXFwoXFwpXFwqXFwvXSkvZztyZXR1cm4gYigpLGYoKX1mdW5jdGlvbiBkKGEsYil7aWYoXCIwXCI9PShiPWIudHJpbSgpLnRvTG93ZXJDYXNlKCkpJiZcInB4XCIuc2VhcmNoKGEpPj0wKXJldHVybntweDowfTtpZigvXlteKF0qJHxeY2FsYy8udGVzdChiKSl7Yj1iLnJlcGxhY2UoL2NhbGNcXCgvZyxcIihcIik7dmFyIGQ9e307Yj1iLnJlcGxhY2UoYSxmdW5jdGlvbihhKXtyZXR1cm4gZFthXT1udWxsLFwiVVwiK2F9KTtmb3IodmFyIGU9XCJVKFwiK2Euc291cmNlK1wiKVwiLGY9Yi5yZXBsYWNlKC9bLStdPyhcXGQqXFwuKT9cXGQrKFtFZV1bLStdP1xcZCspPy9nLFwiTlwiKS5yZXBsYWNlKG5ldyBSZWdFeHAoXCJOXCIrZSxcImdcIiksXCJEXCIpLnJlcGxhY2UoL1xcc1srLV1cXHMvZyxcIk9cIikucmVwbGFjZSgvXFxzL2csXCJcIiksZz1bL05cXCooRCkvZywvKE58RClbKlxcL11OL2csLyhOfEQpT1xcMS9nLC9cXCgoTnxEKVxcKS9nXSxoPTA7aDxnLmxlbmd0aDspZ1toXS50ZXN0KGYpPyhmPWYucmVwbGFjZShnW2hdLFwiJDFcIiksaD0wKTpoKys7aWYoXCJEXCI9PWYpe2Zvcih2YXIgaSBpbiBkKXt2YXIgaj1jKGIucmVwbGFjZShuZXcgUmVnRXhwKFwiVVwiK2ksXCJnXCIpLFwiXCIpLnJlcGxhY2UobmV3IFJlZ0V4cChlLFwiZ1wiKSxcIiowXCIpKTtpZighaXNGaW5pdGUoaikpcmV0dXJuO2RbaV09an1yZXR1cm4gZH19fWZ1bmN0aW9uIGUoYSxiKXtyZXR1cm4gZihhLGIsITApfWZ1bmN0aW9uIGYoYixjLGQpe3ZhciBlLGY9W107Zm9yKGUgaW4gYilmLnB1c2goZSk7Zm9yKGUgaW4gYylmLmluZGV4T2YoZSk8MCYmZi5wdXNoKGUpO3JldHVybiBiPWYubWFwKGZ1bmN0aW9uKGEpe3JldHVybiBiW2FdfHwwfSksYz1mLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gY1thXXx8MH0pLFtiLGMsZnVuY3Rpb24oYil7dmFyIGM9Yi5tYXAoZnVuY3Rpb24oYyxlKXtyZXR1cm4gMT09Yi5sZW5ndGgmJmQmJihjPU1hdGgubWF4KGMsMCkpLGEubnVtYmVyVG9TdHJpbmcoYykrZltlXX0pLmpvaW4oXCIgKyBcIik7cmV0dXJuIGIubGVuZ3RoPjE/XCJjYWxjKFwiK2MrXCIpXCI6Y31dfXZhciBnPVwicHh8ZW18ZXh8Y2h8cmVtfHZ3fHZofHZtaW58dm1heHxjbXxtbXxpbnxwdHxwY1wiLGg9ZC5iaW5kKG51bGwsbmV3IFJlZ0V4cChnLFwiZ1wiKSksaT1kLmJpbmQobnVsbCxuZXcgUmVnRXhwKGcrXCJ8JVwiLFwiZ1wiKSksaj1kLmJpbmQobnVsbCwvZGVnfHJhZHxncmFkfHR1cm4vZyk7YS5wYXJzZUxlbmd0aD1oLGEucGFyc2VMZW5ndGhPclBlcmNlbnQ9aSxhLmNvbnN1bWVMZW5ndGhPclBlcmNlbnQ9YS5jb25zdW1lUGFyZW50aGVzaXNlZC5iaW5kKG51bGwsaSksYS5wYXJzZUFuZ2xlPWosYS5tZXJnZURpbWVuc2lvbnM9Zjt2YXIgaz1hLmNvbnN1bWVQYXJlbnRoZXNpc2VkLmJpbmQobnVsbCxoKSxsPWEuY29uc3VtZVJlcGVhdGVkLmJpbmQodm9pZCAwLGssL14vKSxtPWEuY29uc3VtZVJlcGVhdGVkLmJpbmQodm9pZCAwLGwsL14sLyk7YS5jb25zdW1lU2l6ZVBhaXJMaXN0PW07dmFyIG49ZnVuY3Rpb24oYSl7dmFyIGI9bShhKTtpZihiJiZcIlwiPT1iWzFdKXJldHVybiBiWzBdfSxvPWEubWVyZ2VOZXN0ZWRSZXBlYXRlZC5iaW5kKHZvaWQgMCxlLFwiIFwiKSxwPWEubWVyZ2VOZXN0ZWRSZXBlYXRlZC5iaW5kKHZvaWQgMCxvLFwiLFwiKTthLm1lcmdlTm9uTmVnYXRpdmVTaXplUGFpcj1vLGEuYWRkUHJvcGVydGllc0hhbmRsZXIobixwLFtcImJhY2tncm91bmQtc2l6ZVwiXSksYS5hZGRQcm9wZXJ0aWVzSGFuZGxlcihpLGUsW1wiYm9yZGVyLWJvdHRvbS13aWR0aFwiLFwiYm9yZGVyLWltYWdlLXdpZHRoXCIsXCJib3JkZXItbGVmdC13aWR0aFwiLFwiYm9yZGVyLXJpZ2h0LXdpZHRoXCIsXCJib3JkZXItdG9wLXdpZHRoXCIsXCJmbGV4LWJhc2lzXCIsXCJmb250LXNpemVcIixcImhlaWdodFwiLFwibGluZS1oZWlnaHRcIixcIm1heC1oZWlnaHRcIixcIm1heC13aWR0aFwiLFwib3V0bGluZS13aWR0aFwiLFwid2lkdGhcIl0pLGEuYWRkUHJvcGVydGllc0hhbmRsZXIoaSxmLFtcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIixcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCIsXCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCIsXCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiLFwiYm90dG9tXCIsXCJsZWZ0XCIsXCJsZXR0ZXItc3BhY2luZ1wiLFwibWFyZ2luLWJvdHRvbVwiLFwibWFyZ2luLWxlZnRcIixcIm1hcmdpbi1yaWdodFwiLFwibWFyZ2luLXRvcFwiLFwibWluLWhlaWdodFwiLFwibWluLXdpZHRoXCIsXCJvdXRsaW5lLW9mZnNldFwiLFwicGFkZGluZy1ib3R0b21cIixcInBhZGRpbmctbGVmdFwiLFwicGFkZGluZy1yaWdodFwiLFwicGFkZGluZy10b3BcIixcInBlcnNwZWN0aXZlXCIsXCJyaWdodFwiLFwic2hhcGUtbWFyZ2luXCIsXCJzdHJva2UtZGFzaG9mZnNldFwiLFwidGV4dC1pbmRlbnRcIixcInRvcFwiLFwidmVydGljYWwtYWxpZ25cIixcIndvcmQtc3BhY2luZ1wiXSl9KGQpLGZ1bmN0aW9uKGEsYil7ZnVuY3Rpb24gYyhiKXtyZXR1cm4gYS5jb25zdW1lTGVuZ3RoT3JQZXJjZW50KGIpfHxhLmNvbnN1bWVUb2tlbigvXmF1dG8vLGIpfWZ1bmN0aW9uIGQoYil7dmFyIGQ9YS5jb25zdW1lTGlzdChbYS5pZ25vcmUoYS5jb25zdW1lVG9rZW4uYmluZChudWxsLC9ecmVjdC8pKSxhLmlnbm9yZShhLmNvbnN1bWVUb2tlbi5iaW5kKG51bGwsL15cXCgvKSksYS5jb25zdW1lUmVwZWF0ZWQuYmluZChudWxsLGMsL14sLyksYS5pZ25vcmUoYS5jb25zdW1lVG9rZW4uYmluZChudWxsLC9eXFwpLykpXSxiKTtpZihkJiY0PT1kWzBdLmxlbmd0aClyZXR1cm4gZFswXX1mdW5jdGlvbiBlKGIsYyl7cmV0dXJuXCJhdXRvXCI9PWJ8fFwiYXV0b1wiPT1jP1shMCwhMSxmdW5jdGlvbihkKXt2YXIgZT1kP2I6YztpZihcImF1dG9cIj09ZSlyZXR1cm5cImF1dG9cIjt2YXIgZj1hLm1lcmdlRGltZW5zaW9ucyhlLGUpO3JldHVybiBmWzJdKGZbMF0pfV06YS5tZXJnZURpbWVuc2lvbnMoYixjKX1mdW5jdGlvbiBmKGEpe3JldHVyblwicmVjdChcIithK1wiKVwifXZhciBnPWEubWVyZ2VXcmFwcGVkTmVzdGVkUmVwZWF0ZWQuYmluZChudWxsLGYsZSxcIiwgXCIpO2EucGFyc2VCb3g9ZCxhLm1lcmdlQm94ZXM9ZyxhLmFkZFByb3BlcnRpZXNIYW5kbGVyKGQsZyxbXCJjbGlwXCJdKX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBmdW5jdGlvbihiKXt2YXIgYz0wO3JldHVybiBhLm1hcChmdW5jdGlvbihhKXtyZXR1cm4gYT09PWs/YltjKytdOmF9KX19ZnVuY3Rpb24gZChhKXtyZXR1cm4gYX1mdW5jdGlvbiBlKGIpe2lmKFwibm9uZVwiPT0oYj1iLnRvTG93ZXJDYXNlKCkudHJpbSgpKSlyZXR1cm5bXTtmb3IodmFyIGMsZD0vXFxzKihcXHcrKVxcKChbXildKilcXCkvZyxlPVtdLGY9MDtjPWQuZXhlYyhiKTspe2lmKGMuaW5kZXghPWYpcmV0dXJuO2Y9Yy5pbmRleCtjWzBdLmxlbmd0aDt2YXIgZz1jWzFdLGg9bltnXTtpZighaClyZXR1cm47dmFyIGk9Y1syXS5zcGxpdChcIixcIiksaj1oWzBdO2lmKGoubGVuZ3RoPGkubGVuZ3RoKXJldHVybjtmb3IodmFyIGs9W10sbz0wO288ai5sZW5ndGg7bysrKXt2YXIgcCxxPWlbb10scj1qW29dO2lmKHZvaWQgMD09PShwPXE/e0E6ZnVuY3Rpb24oYil7cmV0dXJuXCIwXCI9PWIudHJpbSgpP206YS5wYXJzZUFuZ2xlKGIpfSxOOmEucGFyc2VOdW1iZXIsVDphLnBhcnNlTGVuZ3RoT3JQZXJjZW50LEw6YS5wYXJzZUxlbmd0aH1bci50b1VwcGVyQ2FzZSgpXShxKTp7YTptLG46a1swXSx0Omx9W3JdKSlyZXR1cm47ay5wdXNoKHApfWlmKGUucHVzaCh7dDpnLGQ6a30pLGQubGFzdEluZGV4PT1iLmxlbmd0aClyZXR1cm4gZX19ZnVuY3Rpb24gZihhKXtyZXR1cm4gYS50b0ZpeGVkKDYpLnJlcGxhY2UoXCIuMDAwMDAwXCIsXCJcIil9ZnVuY3Rpb24gZyhiLGMpe2lmKGIuZGVjb21wb3NpdGlvblBhaXIhPT1jKXtiLmRlY29tcG9zaXRpb25QYWlyPWM7dmFyIGQ9YS5tYWtlTWF0cml4RGVjb21wb3NpdGlvbihiKX1pZihjLmRlY29tcG9zaXRpb25QYWlyIT09Yil7Yy5kZWNvbXBvc2l0aW9uUGFpcj1iO3ZhciBlPWEubWFrZU1hdHJpeERlY29tcG9zaXRpb24oYyl9cmV0dXJuIG51bGw9PWRbMF18fG51bGw9PWVbMF0/W1shMV0sWyEwXSxmdW5jdGlvbihhKXtyZXR1cm4gYT9jWzBdLmQ6YlswXS5kfV06KGRbMF0ucHVzaCgwKSxlWzBdLnB1c2goMSksW2QsZSxmdW5jdGlvbihiKXt2YXIgYz1hLnF1YXQoZFswXVszXSxlWzBdWzNdLGJbNV0pO3JldHVybiBhLmNvbXBvc2VNYXRyaXgoYlswXSxiWzFdLGJbMl0sYyxiWzRdKS5tYXAoZikuam9pbihcIixcIil9XSl9ZnVuY3Rpb24gaChhKXtyZXR1cm4gYS5yZXBsYWNlKC9beHldLyxcIlwiKX1mdW5jdGlvbiBpKGEpe3JldHVybiBhLnJlcGxhY2UoLyh4fHl8enwzZCk/JC8sXCIzZFwiKX1mdW5jdGlvbiBqKGIsYyl7dmFyIGQ9YS5tYWtlTWF0cml4RGVjb21wb3NpdGlvbiYmITAsZT0hMTtpZighYi5sZW5ndGh8fCFjLmxlbmd0aCl7Yi5sZW5ndGh8fChlPSEwLGI9YyxjPVtdKTtmb3IodmFyIGY9MDtmPGIubGVuZ3RoO2YrKyl7dmFyIGo9YltmXS50LGs9YltmXS5kLGw9XCJzY2FsZVwiPT1qLnN1YnN0cigwLDUpPzE6MDtjLnB1c2goe3Q6aixkOmsubWFwKGZ1bmN0aW9uKGEpe2lmKFwibnVtYmVyXCI9PXR5cGVvZiBhKXJldHVybiBsO3ZhciBiPXt9O2Zvcih2YXIgYyBpbiBhKWJbY109bDtyZXR1cm4gYn0pfSl9fXZhciBtPWZ1bmN0aW9uKGEsYil7cmV0dXJuXCJwZXJzcGVjdGl2ZVwiPT1hJiZcInBlcnNwZWN0aXZlXCI9PWJ8fChcIm1hdHJpeFwiPT1hfHxcIm1hdHJpeDNkXCI9PWEpJiYoXCJtYXRyaXhcIj09Ynx8XCJtYXRyaXgzZFwiPT1iKX0sbz1bXSxwPVtdLHE9W107aWYoYi5sZW5ndGghPWMubGVuZ3RoKXtpZighZClyZXR1cm47dmFyIHI9ZyhiLGMpO289W3JbMF1dLHA9W3JbMV1dLHE9W1tcIm1hdHJpeFwiLFtyWzJdXV1dfWVsc2UgZm9yKHZhciBmPTA7ZjxiLmxlbmd0aDtmKyspe3ZhciBqLHM9YltmXS50LHQ9Y1tmXS50LHU9YltmXS5kLHY9Y1tmXS5kLHc9bltzXSx4PW5bdF07aWYobShzLHQpKXtpZighZClyZXR1cm47dmFyIHI9ZyhbYltmXV0sW2NbZl1dKTtvLnB1c2goclswXSkscC5wdXNoKHJbMV0pLHEucHVzaChbXCJtYXRyaXhcIixbclsyXV1dKX1lbHNle2lmKHM9PXQpaj1zO2Vsc2UgaWYod1syXSYmeFsyXSYmaChzKT09aCh0KSlqPWgocyksdT13WzJdKHUpLHY9eFsyXSh2KTtlbHNle2lmKCF3WzFdfHwheFsxXXx8aShzKSE9aSh0KSl7aWYoIWQpcmV0dXJuO3ZhciByPWcoYixjKTtvPVtyWzBdXSxwPVtyWzFdXSxxPVtbXCJtYXRyaXhcIixbclsyXV1dXTticmVha31qPWkocyksdT13WzFdKHUpLHY9eFsxXSh2KX1mb3IodmFyIHk9W10sej1bXSxBPVtdLEI9MDtCPHUubGVuZ3RoO0IrKyl7dmFyIEM9XCJudW1iZXJcIj09dHlwZW9mIHVbQl0/YS5tZXJnZU51bWJlcnM6YS5tZXJnZURpbWVuc2lvbnMscj1DKHVbQl0sdltCXSk7eVtCXT1yWzBdLHpbQl09clsxXSxBLnB1c2goclsyXSl9by5wdXNoKHkpLHAucHVzaCh6KSxxLnB1c2goW2osQV0pfX1pZihlKXt2YXIgRD1vO289cCxwPUR9cmV0dXJuW28scCxmdW5jdGlvbihhKXtyZXR1cm4gYS5tYXAoZnVuY3Rpb24oYSxiKXt2YXIgYz1hLm1hcChmdW5jdGlvbihhLGMpe3JldHVybiBxW2JdWzFdW2NdKGEpfSkuam9pbihcIixcIik7cmV0dXJuXCJtYXRyaXhcIj09cVtiXVswXSYmMTY9PWMuc3BsaXQoXCIsXCIpLmxlbmd0aCYmKHFbYl1bMF09XCJtYXRyaXgzZFwiKSxxW2JdWzBdK1wiKFwiK2MrXCIpXCJ9KS5qb2luKFwiIFwiKX1dfXZhciBrPW51bGwsbD17cHg6MH0sbT17ZGVnOjB9LG49e21hdHJpeDpbXCJOTk5OTk5cIixbayxrLDAsMCxrLGssMCwwLDAsMCwxLDAsayxrLDAsMV0sZF0sbWF0cml4M2Q6W1wiTk5OTk5OTk5OTk5OTk5OTlwiLGRdLHJvdGF0ZTpbXCJBXCJdLHJvdGF0ZXg6W1wiQVwiXSxyb3RhdGV5OltcIkFcIl0scm90YXRlejpbXCJBXCJdLHJvdGF0ZTNkOltcIk5OTkFcIl0scGVyc3BlY3RpdmU6W1wiTFwiXSxzY2FsZTpbXCJOblwiLGMoW2ssaywxXSksZF0sc2NhbGV4OltcIk5cIixjKFtrLDEsMV0pLGMoW2ssMV0pXSxzY2FsZXk6W1wiTlwiLGMoWzEsaywxXSksYyhbMSxrXSldLHNjYWxlejpbXCJOXCIsYyhbMSwxLGtdKV0sc2NhbGUzZDpbXCJOTk5cIixkXSxza2V3OltcIkFhXCIsbnVsbCxkXSxza2V3eDpbXCJBXCIsbnVsbCxjKFtrLG1dKV0sc2tld3k6W1wiQVwiLG51bGwsYyhbbSxrXSldLHRyYW5zbGF0ZTpbXCJUdFwiLGMoW2ssayxsXSksZF0sdHJhbnNsYXRleDpbXCJUXCIsYyhbayxsLGxdKSxjKFtrLGxdKV0sdHJhbnNsYXRleTpbXCJUXCIsYyhbbCxrLGxdKSxjKFtsLGtdKV0sdHJhbnNsYXRlejpbXCJMXCIsYyhbbCxsLGtdKV0sdHJhbnNsYXRlM2Q6W1wiVFRMXCIsZF19O2EuYWRkUHJvcGVydGllc0hhbmRsZXIoZSxqLFtcInRyYW5zZm9ybVwiXSksYS50cmFuc2Zvcm1Ub1N2Z01hdHJpeD1mdW5jdGlvbihiKXt2YXIgYz1hLnRyYW5zZm9ybUxpc3RUb01hdHJpeChlKGIpKTtyZXR1cm5cIm1hdHJpeChcIitmKGNbMF0pK1wiIFwiK2YoY1sxXSkrXCIgXCIrZihjWzRdKStcIiBcIitmKGNbNV0pK1wiIFwiK2YoY1sxMl0pK1wiIFwiK2YoY1sxM10pK1wiKVwifX0oZCksZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEsYil7Yi5jb25jYXQoW2FdKS5mb3JFYWNoKGZ1bmN0aW9uKGIpe2IgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlJiYoZFthXT1iKSxlW2JdPWF9KX12YXIgZD17fSxlPXt9O2MoXCJ0cmFuc2Zvcm1cIixbXCJ3ZWJraXRUcmFuc2Zvcm1cIixcIm1zVHJhbnNmb3JtXCJdKSxjKFwidHJhbnNmb3JtT3JpZ2luXCIsW1wid2Via2l0VHJhbnNmb3JtT3JpZ2luXCJdKSxjKFwicGVyc3BlY3RpdmVcIixbXCJ3ZWJraXRQZXJzcGVjdGl2ZVwiXSksYyhcInBlcnNwZWN0aXZlT3JpZ2luXCIsW1wid2Via2l0UGVyc3BlY3RpdmVPcmlnaW5cIl0pLGEucHJvcGVydHlOYW1lPWZ1bmN0aW9uKGEpe3JldHVybiBkW2FdfHxhfSxhLnVucHJlZml4ZWRQcm9wZXJ0eU5hbWU9ZnVuY3Rpb24oYSl7cmV0dXJuIGVbYV18fGF9fShkKX0oKSxmdW5jdGlvbigpe2lmKHZvaWQgMD09PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikuYW5pbWF0ZShbXSkub25jYW5jZWwpe3ZhciBhO2lmKHdpbmRvdy5wZXJmb3JtYW5jZSYmcGVyZm9ybWFuY2Uubm93KXZhciBhPWZ1bmN0aW9uKCl7cmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpfTtlbHNlIHZhciBhPWZ1bmN0aW9uKCl7cmV0dXJuIERhdGUubm93KCl9O3ZhciBiPWZ1bmN0aW9uKGEsYixjKXt0aGlzLnRhcmdldD1hLHRoaXMuY3VycmVudFRpbWU9Yix0aGlzLnRpbWVsaW5lVGltZT1jLHRoaXMudHlwZT1cImNhbmNlbFwiLHRoaXMuYnViYmxlcz0hMSx0aGlzLmNhbmNlbGFibGU9ITEsdGhpcy5jdXJyZW50VGFyZ2V0PWEsdGhpcy5kZWZhdWx0UHJldmVudGVkPSExLHRoaXMuZXZlbnRQaGFzZT1FdmVudC5BVF9UQVJHRVQsdGhpcy50aW1lU3RhbXA9RGF0ZS5ub3coKX0sYz13aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZTt3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZT1mdW5jdGlvbihkLGUpe3ZhciBmPWMuY2FsbCh0aGlzLGQsZSk7Zi5fY2FuY2VsSGFuZGxlcnM9W10sZi5vbmNhbmNlbD1udWxsO3ZhciBnPWYuY2FuY2VsO2YuY2FuY2VsPWZ1bmN0aW9uKCl7Zy5jYWxsKHRoaXMpO3ZhciBjPW5ldyBiKHRoaXMsbnVsbCxhKCkpLGQ9dGhpcy5fY2FuY2VsSGFuZGxlcnMuY29uY2F0KHRoaXMub25jYW5jZWw/W3RoaXMub25jYW5jZWxdOltdKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZC5mb3JFYWNoKGZ1bmN0aW9uKGEpe2EuY2FsbChjLnRhcmdldCxjKX0pfSwwKX07dmFyIGg9Zi5hZGRFdmVudExpc3RlbmVyO2YuYWRkRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihhLGIpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGImJlwiY2FuY2VsXCI9PWE/dGhpcy5fY2FuY2VsSGFuZGxlcnMucHVzaChiKTpoLmNhbGwodGhpcyxhLGIpfTt2YXIgaT1mLnJlbW92ZUV2ZW50TGlzdGVuZXI7cmV0dXJuIGYucmVtb3ZlRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihhLGIpe2lmKFwiY2FuY2VsXCI9PWEpe3ZhciBjPXRoaXMuX2NhbmNlbEhhbmRsZXJzLmluZGV4T2YoYik7Yz49MCYmdGhpcy5fY2FuY2VsSGFuZGxlcnMuc3BsaWNlKGMsMSl9ZWxzZSBpLmNhbGwodGhpcyxhLGIpfSxmfX19KCksZnVuY3Rpb24oYSl7dmFyIGI9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LGM9bnVsbCxkPSExO3RyeXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKGIpLmdldFByb3BlcnR5VmFsdWUoXCJvcGFjaXR5XCIpLGY9XCIwXCI9PWU/XCIxXCI6XCIwXCI7Yz1iLmFuaW1hdGUoe29wYWNpdHk6W2YsZl19LHtkdXJhdGlvbjoxfSksYy5jdXJyZW50VGltZT0wLGQ9Z2V0Q29tcHV0ZWRTdHlsZShiKS5nZXRQcm9wZXJ0eVZhbHVlKFwib3BhY2l0eVwiKT09Zn1jYXRjaChhKXt9ZmluYWxseXtjJiZjLmNhbmNlbCgpfWlmKCFkKXt2YXIgZz13aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZTt3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuYW5pbWF0ZT1mdW5jdGlvbihiLGMpe3JldHVybiB3aW5kb3cuU3ltYm9sJiZTeW1ib2wuaXRlcmF0b3ImJkFycmF5LnByb3RvdHlwZS5mcm9tJiZiW1N5bWJvbC5pdGVyYXRvcl0mJihiPUFycmF5LmZyb20oYikpLEFycmF5LmlzQXJyYXkoYil8fG51bGw9PT1ifHwoYj1hLmNvbnZlcnRUb0FycmF5Rm9ybShiKSksZy5jYWxsKHRoaXMsYixjKX19fShjKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXt2YXIgYz1iLnRpbWVsaW5lO2MuY3VycmVudFRpbWU9YSxjLl9kaXNjYXJkQW5pbWF0aW9ucygpLDA9PWMuX2FuaW1hdGlvbnMubGVuZ3RoP2Y9ITE6cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGQpfXZhciBlPXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZT1mdW5jdGlvbihhKXtyZXR1cm4gZShmdW5jdGlvbihjKXtiLnRpbWVsaW5lLl91cGRhdGVBbmltYXRpb25zUHJvbWlzZXMoKSxhKGMpLGIudGltZWxpbmUuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpfSl9LGIuQW5pbWF0aW9uVGltZWxpbmU9ZnVuY3Rpb24oKXt0aGlzLl9hbmltYXRpb25zPVtdLHRoaXMuY3VycmVudFRpbWU9dm9pZCAwfSxiLkFuaW1hdGlvblRpbWVsaW5lLnByb3RvdHlwZT17Z2V0QW5pbWF0aW9uczpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9kaXNjYXJkQW5pbWF0aW9ucygpLHRoaXMuX2FuaW1hdGlvbnMuc2xpY2UoKX0sX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlczpmdW5jdGlvbigpe2IuYW5pbWF0aW9uc1dpdGhQcm9taXNlcz1iLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXMuZmlsdGVyKGZ1bmN0aW9uKGEpe3JldHVybiBhLl91cGRhdGVQcm9taXNlcygpfSl9LF9kaXNjYXJkQW5pbWF0aW9uczpmdW5jdGlvbigpe3RoaXMuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbnM9dGhpcy5fYW5pbWF0aW9ucy5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuXCJmaW5pc2hlZFwiIT1hLnBsYXlTdGF0ZSYmXCJpZGxlXCIhPWEucGxheVN0YXRlfSl9LF9wbGF5OmZ1bmN0aW9uKGEpe3ZhciBjPW5ldyBiLkFuaW1hdGlvbihhLHRoaXMpO3JldHVybiB0aGlzLl9hbmltYXRpb25zLnB1c2goYyksYi5yZXN0YXJ0V2ViQW5pbWF0aW9uc05leHRUaWNrKCksYy5fdXBkYXRlUHJvbWlzZXMoKSxjLl9hbmltYXRpb24ucGxheSgpLGMuX3VwZGF0ZVByb21pc2VzKCksY30scGxheTpmdW5jdGlvbihhKXtyZXR1cm4gYSYmYS5yZW1vdmUoKSx0aGlzLl9wbGF5KGEpfX07dmFyIGY9ITE7Yi5yZXN0YXJ0V2ViQW5pbWF0aW9uc05leHRUaWNrPWZ1bmN0aW9uKCl7Znx8KGY9ITAscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGQpKX07dmFyIGc9bmV3IGIuQW5pbWF0aW9uVGltZWxpbmU7Yi50aW1lbGluZT1nO3RyeXtPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LmRvY3VtZW50LFwidGltZWxpbmVcIix7Y29uZmlndXJhYmxlOiEwLGdldDpmdW5jdGlvbigpe3JldHVybiBnfX0pfWNhdGNoKGEpe310cnl7d2luZG93LmRvY3VtZW50LnRpbWVsaW5lPWd9Y2F0Y2goYSl7fX0oMCxlKSxmdW5jdGlvbihhLGIsYyl7Yi5hbmltYXRpb25zV2l0aFByb21pc2VzPVtdLGIuQW5pbWF0aW9uPWZ1bmN0aW9uKGIsYyl7aWYodGhpcy5pZD1cIlwiLGImJmIuX2lkJiYodGhpcy5pZD1iLl9pZCksdGhpcy5lZmZlY3Q9YixiJiYoYi5fYW5pbWF0aW9uPXRoaXMpLCFjKXRocm93IG5ldyBFcnJvcihcIkFuaW1hdGlvbiB3aXRoIG51bGwgdGltZWxpbmUgaXMgbm90IHN1cHBvcnRlZFwiKTt0aGlzLl90aW1lbGluZT1jLHRoaXMuX3NlcXVlbmNlTnVtYmVyPWEuc2VxdWVuY2VOdW1iZXIrKyx0aGlzLl9ob2xkVGltZT0wLHRoaXMuX3BhdXNlZD0hMSx0aGlzLl9pc0dyb3VwPSExLHRoaXMuX2FuaW1hdGlvbj1udWxsLHRoaXMuX2NoaWxkQW5pbWF0aW9ucz1bXSx0aGlzLl9jYWxsYmFjaz1udWxsLHRoaXMuX29sZFBsYXlTdGF0ZT1cImlkbGVcIix0aGlzLl9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbigpLHRoaXMuX2FuaW1hdGlvbi5jYW5jZWwoKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxiLkFuaW1hdGlvbi5wcm90b3R5cGU9e191cGRhdGVQcm9taXNlczpmdW5jdGlvbigpe3ZhciBhPXRoaXMuX29sZFBsYXlTdGF0ZSxiPXRoaXMucGxheVN0YXRlO3JldHVybiB0aGlzLl9yZWFkeVByb21pc2UmJmIhPT1hJiYoXCJpZGxlXCI9PWI/KHRoaXMuX3JlamVjdFJlYWR5UHJvbWlzZSgpLHRoaXMuX3JlYWR5UHJvbWlzZT12b2lkIDApOlwicGVuZGluZ1wiPT1hP3RoaXMuX3Jlc29sdmVSZWFkeVByb21pc2UoKTpcInBlbmRpbmdcIj09YiYmKHRoaXMuX3JlYWR5UHJvbWlzZT12b2lkIDApKSx0aGlzLl9maW5pc2hlZFByb21pc2UmJmIhPT1hJiYoXCJpZGxlXCI9PWI/KHRoaXMuX3JlamVjdEZpbmlzaGVkUHJvbWlzZSgpLHRoaXMuX2ZpbmlzaGVkUHJvbWlzZT12b2lkIDApOlwiZmluaXNoZWRcIj09Yj90aGlzLl9yZXNvbHZlRmluaXNoZWRQcm9taXNlKCk6XCJmaW5pc2hlZFwiPT1hJiYodGhpcy5fZmluaXNoZWRQcm9taXNlPXZvaWQgMCkpLHRoaXMuX29sZFBsYXlTdGF0ZT10aGlzLnBsYXlTdGF0ZSx0aGlzLl9yZWFkeVByb21pc2V8fHRoaXMuX2ZpbmlzaGVkUHJvbWlzZX0sX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKTt2YXIgYSxjLGQsZSxmPSEhdGhpcy5fYW5pbWF0aW9uO2YmJihhPXRoaXMucGxheWJhY2tSYXRlLGM9dGhpcy5fcGF1c2VkLGQ9dGhpcy5zdGFydFRpbWUsZT10aGlzLmN1cnJlbnRUaW1lLHRoaXMuX2FuaW1hdGlvbi5jYW5jZWwoKSx0aGlzLl9hbmltYXRpb24uX3dyYXBwZXI9bnVsbCx0aGlzLl9hbmltYXRpb249bnVsbCksKCF0aGlzLmVmZmVjdHx8dGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuS2V5ZnJhbWVFZmZlY3QpJiYodGhpcy5fYW5pbWF0aW9uPWIubmV3VW5kZXJseWluZ0FuaW1hdGlvbkZvcktleWZyYW1lRWZmZWN0KHRoaXMuZWZmZWN0KSxiLmJpbmRBbmltYXRpb25Gb3JLZXlmcmFtZUVmZmVjdCh0aGlzKSksKHRoaXMuZWZmZWN0IGluc3RhbmNlb2Ygd2luZG93LlNlcXVlbmNlRWZmZWN0fHx0aGlzLmVmZmVjdCBpbnN0YW5jZW9mIHdpbmRvdy5Hcm91cEVmZmVjdCkmJih0aGlzLl9hbmltYXRpb249Yi5uZXdVbmRlcmx5aW5nQW5pbWF0aW9uRm9yR3JvdXAodGhpcy5lZmZlY3QpLGIuYmluZEFuaW1hdGlvbkZvckdyb3VwKHRoaXMpKSx0aGlzLmVmZmVjdCYmdGhpcy5lZmZlY3QuX29uc2FtcGxlJiZiLmJpbmRBbmltYXRpb25Gb3JDdXN0b21FZmZlY3QodGhpcyksZiYmKDEhPWEmJih0aGlzLnBsYXliYWNrUmF0ZT1hKSxudWxsIT09ZD90aGlzLnN0YXJ0VGltZT1kOm51bGwhPT1lP3RoaXMuY3VycmVudFRpbWU9ZTpudWxsIT09dGhpcy5faG9sZFRpbWUmJih0aGlzLmN1cnJlbnRUaW1lPXRoaXMuX2hvbGRUaW1lKSxjJiZ0aGlzLnBhdXNlKCkpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LF91cGRhdGVDaGlsZHJlbjpmdW5jdGlvbigpe2lmKHRoaXMuZWZmZWN0JiZcImlkbGVcIiE9dGhpcy5wbGF5U3RhdGUpe3ZhciBhPXRoaXMuZWZmZWN0Ll90aW1pbmcuZGVsYXk7dGhpcy5fY2hpbGRBbmltYXRpb25zLmZvckVhY2goZnVuY3Rpb24oYyl7dGhpcy5fYXJyYW5nZUNoaWxkcmVuKGMsYSksdGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3QmJihhKz1iLmdyb3VwQ2hpbGREdXJhdGlvbihjLmVmZmVjdCkpfS5iaW5kKHRoaXMpKX19LF9zZXRFeHRlcm5hbEFuaW1hdGlvbjpmdW5jdGlvbihhKXtpZih0aGlzLmVmZmVjdCYmdGhpcy5faXNHcm91cClmb3IodmFyIGI9MDtiPHRoaXMuZWZmZWN0LmNoaWxkcmVuLmxlbmd0aDtiKyspdGhpcy5lZmZlY3QuY2hpbGRyZW5bYl0uX2FuaW1hdGlvbj1hLHRoaXMuX2NoaWxkQW5pbWF0aW9uc1tiXS5fc2V0RXh0ZXJuYWxBbmltYXRpb24oYSl9LF9jb25zdHJ1Y3RDaGlsZEFuaW1hdGlvbnM6ZnVuY3Rpb24oKXtpZih0aGlzLmVmZmVjdCYmdGhpcy5faXNHcm91cCl7dmFyIGE9dGhpcy5lZmZlY3QuX3RpbWluZy5kZWxheTt0aGlzLl9yZW1vdmVDaGlsZEFuaW1hdGlvbnMoKSx0aGlzLmVmZmVjdC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGMpe3ZhciBkPWIudGltZWxpbmUuX3BsYXkoYyk7dGhpcy5fY2hpbGRBbmltYXRpb25zLnB1c2goZCksZC5wbGF5YmFja1JhdGU9dGhpcy5wbGF5YmFja1JhdGUsdGhpcy5fcGF1c2VkJiZkLnBhdXNlKCksYy5fYW5pbWF0aW9uPXRoaXMuZWZmZWN0Ll9hbmltYXRpb24sdGhpcy5fYXJyYW5nZUNoaWxkcmVuKGQsYSksdGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3QmJihhKz1iLmdyb3VwQ2hpbGREdXJhdGlvbihjKSl9LmJpbmQodGhpcykpfX0sX2FycmFuZ2VDaGlsZHJlbjpmdW5jdGlvbihhLGIpe251bGw9PT10aGlzLnN0YXJ0VGltZT9hLmN1cnJlbnRUaW1lPXRoaXMuY3VycmVudFRpbWUtYi90aGlzLnBsYXliYWNrUmF0ZTphLnN0YXJ0VGltZSE9PXRoaXMuc3RhcnRUaW1lK2IvdGhpcy5wbGF5YmFja1JhdGUmJihhLnN0YXJ0VGltZT10aGlzLnN0YXJ0VGltZStiL3RoaXMucGxheWJhY2tSYXRlKX0sZ2V0IHRpbWVsaW5lKCl7cmV0dXJuIHRoaXMuX3RpbWVsaW5lfSxnZXQgcGxheVN0YXRlKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbj90aGlzLl9hbmltYXRpb24ucGxheVN0YXRlOlwiaWRsZVwifSxnZXQgZmluaXNoZWQoKXtyZXR1cm4gd2luZG93LlByb21pc2U/KHRoaXMuX2ZpbmlzaGVkUHJvbWlzZXx8KC0xPT1iLmFuaW1hdGlvbnNXaXRoUHJvbWlzZXMuaW5kZXhPZih0aGlzKSYmYi5hbmltYXRpb25zV2l0aFByb21pc2VzLnB1c2godGhpcyksdGhpcy5fZmluaXNoZWRQcm9taXNlPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGEsYil7dGhpcy5fcmVzb2x2ZUZpbmlzaGVkUHJvbWlzZT1mdW5jdGlvbigpe2EodGhpcyl9LHRoaXMuX3JlamVjdEZpbmlzaGVkUHJvbWlzZT1mdW5jdGlvbigpe2Ioe3R5cGU6RE9NRXhjZXB0aW9uLkFCT1JUX0VSUixuYW1lOlwiQWJvcnRFcnJvclwifSl9fS5iaW5kKHRoaXMpKSxcImZpbmlzaGVkXCI9PXRoaXMucGxheVN0YXRlJiZ0aGlzLl9yZXNvbHZlRmluaXNoZWRQcm9taXNlKCkpLHRoaXMuX2ZpbmlzaGVkUHJvbWlzZSk6KGNvbnNvbGUud2FybihcIkFuaW1hdGlvbiBQcm9taXNlcyByZXF1aXJlIEphdmFTY3JpcHQgUHJvbWlzZSBjb25zdHJ1Y3RvclwiKSxudWxsKX0sZ2V0IHJlYWR5KCl7cmV0dXJuIHdpbmRvdy5Qcm9taXNlPyh0aGlzLl9yZWFkeVByb21pc2V8fCgtMT09Yi5hbmltYXRpb25zV2l0aFByb21pc2VzLmluZGV4T2YodGhpcykmJmIuYW5pbWF0aW9uc1dpdGhQcm9taXNlcy5wdXNoKHRoaXMpLHRoaXMuX3JlYWR5UHJvbWlzZT1uZXcgUHJvbWlzZShmdW5jdGlvbihhLGIpe3RoaXMuX3Jlc29sdmVSZWFkeVByb21pc2U9ZnVuY3Rpb24oKXthKHRoaXMpfSx0aGlzLl9yZWplY3RSZWFkeVByb21pc2U9ZnVuY3Rpb24oKXtiKHt0eXBlOkRPTUV4Y2VwdGlvbi5BQk9SVF9FUlIsbmFtZTpcIkFib3J0RXJyb3JcIn0pfX0uYmluZCh0aGlzKSksXCJwZW5kaW5nXCIhPT10aGlzLnBsYXlTdGF0ZSYmdGhpcy5fcmVzb2x2ZVJlYWR5UHJvbWlzZSgpKSx0aGlzLl9yZWFkeVByb21pc2UpOihjb25zb2xlLndhcm4oXCJBbmltYXRpb24gUHJvbWlzZXMgcmVxdWlyZSBKYXZhU2NyaXB0IFByb21pc2UgY29uc3RydWN0b3JcIiksbnVsbCl9LGdldCBvbmZpbmlzaCgpe3JldHVybiB0aGlzLl9hbmltYXRpb24ub25maW5pc2h9LHNldCBvbmZpbmlzaChhKXt0aGlzLl9hbmltYXRpb24ub25maW5pc2g9XCJmdW5jdGlvblwiPT10eXBlb2YgYT9mdW5jdGlvbihiKXtiLnRhcmdldD10aGlzLGEuY2FsbCh0aGlzLGIpfS5iaW5kKHRoaXMpOmF9LGdldCBvbmNhbmNlbCgpe3JldHVybiB0aGlzLl9hbmltYXRpb24ub25jYW5jZWx9LHNldCBvbmNhbmNlbChhKXt0aGlzLl9hbmltYXRpb24ub25jYW5jZWw9XCJmdW5jdGlvblwiPT10eXBlb2YgYT9mdW5jdGlvbihiKXtiLnRhcmdldD10aGlzLGEuY2FsbCh0aGlzLGIpfS5iaW5kKHRoaXMpOmF9LGdldCBjdXJyZW50VGltZSgpe3RoaXMuX3VwZGF0ZVByb21pc2VzKCk7dmFyIGE9dGhpcy5fYW5pbWF0aW9uLmN1cnJlbnRUaW1lO3JldHVybiB0aGlzLl91cGRhdGVQcm9taXNlcygpLGF9LHNldCBjdXJyZW50VGltZShhKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbi5jdXJyZW50VGltZT1pc0Zpbml0ZShhKT9hOk1hdGguc2lnbihhKSpOdW1iZXIuTUFYX1ZBTFVFLHRoaXMuX3JlZ2lzdGVyKCksdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGIsYyl7Yi5jdXJyZW50VGltZT1hLWN9KSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxnZXQgc3RhcnRUaW1lKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbi5zdGFydFRpbWV9LHNldCBzdGFydFRpbWUoYSl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9hbmltYXRpb24uc3RhcnRUaW1lPWlzRmluaXRlKGEpP2E6TWF0aC5zaWduKGEpKk51bWJlci5NQVhfVkFMVUUsdGhpcy5fcmVnaXN0ZXIoKSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYixjKXtiLnN0YXJ0VGltZT1hK2N9KSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxnZXQgcGxheWJhY2tSYXRlKCl7cmV0dXJuIHRoaXMuX2FuaW1hdGlvbi5wbGF5YmFja1JhdGV9LHNldCBwbGF5YmFja1JhdGUoYSl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKTt2YXIgYj10aGlzLmN1cnJlbnRUaW1lO3RoaXMuX2FuaW1hdGlvbi5wbGF5YmFja1JhdGU9YSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYil7Yi5wbGF5YmFja1JhdGU9YX0pLG51bGwhPT1iJiYodGhpcy5jdXJyZW50VGltZT1iKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxwbGF5OmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9wYXVzZWQ9ITEsdGhpcy5fYW5pbWF0aW9uLnBsYXkoKSwtMT09dGhpcy5fdGltZWxpbmUuX2FuaW1hdGlvbnMuaW5kZXhPZih0aGlzKSYmdGhpcy5fdGltZWxpbmUuX2FuaW1hdGlvbnMucHVzaCh0aGlzKSx0aGlzLl9yZWdpc3RlcigpLGIuYXdhaXRTdGFydFRpbWUodGhpcyksdGhpcy5fZm9yRWFjaENoaWxkKGZ1bmN0aW9uKGEpe3ZhciBiPWEuY3VycmVudFRpbWU7YS5wbGF5KCksYS5jdXJyZW50VGltZT1ifSksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0scGF1c2U6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuY3VycmVudFRpbWUmJih0aGlzLl9ob2xkVGltZT10aGlzLmN1cnJlbnRUaW1lKSx0aGlzLl9hbmltYXRpb24ucGF1c2UoKSx0aGlzLl9yZWdpc3RlcigpLHRoaXMuX2ZvckVhY2hDaGlsZChmdW5jdGlvbihhKXthLnBhdXNlKCl9KSx0aGlzLl9wYXVzZWQ9ITAsdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sZmluaXNoOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUHJvbWlzZXMoKSx0aGlzLl9hbmltYXRpb24uZmluaXNoKCksdGhpcy5fcmVnaXN0ZXIoKSx0aGlzLl91cGRhdGVQcm9taXNlcygpfSxjYW5jZWw6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpLHRoaXMuX2FuaW1hdGlvbi5jYW5jZWwoKSx0aGlzLl9yZWdpc3RlcigpLHRoaXMuX3JlbW92ZUNoaWxkQW5pbWF0aW9ucygpLHRoaXMuX3VwZGF0ZVByb21pc2VzKCl9LHJldmVyc2U6ZnVuY3Rpb24oKXt0aGlzLl91cGRhdGVQcm9taXNlcygpO3ZhciBhPXRoaXMuY3VycmVudFRpbWU7dGhpcy5fYW5pbWF0aW9uLnJldmVyc2UoKSx0aGlzLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYSl7YS5yZXZlcnNlKCl9KSxudWxsIT09YSYmKHRoaXMuY3VycmVudFRpbWU9YSksdGhpcy5fdXBkYXRlUHJvbWlzZXMoKX0sYWRkRXZlbnRMaXN0ZW5lcjpmdW5jdGlvbihhLGIpe3ZhciBjPWI7XCJmdW5jdGlvblwiPT10eXBlb2YgYiYmKGM9ZnVuY3Rpb24oYSl7YS50YXJnZXQ9dGhpcyxiLmNhbGwodGhpcyxhKX0uYmluZCh0aGlzKSxiLl93cmFwcGVyPWMpLHRoaXMuX2FuaW1hdGlvbi5hZGRFdmVudExpc3RlbmVyKGEsYyl9LHJlbW92ZUV2ZW50TGlzdGVuZXI6ZnVuY3Rpb24oYSxiKXt0aGlzLl9hbmltYXRpb24ucmVtb3ZlRXZlbnRMaXN0ZW5lcihhLGImJmIuX3dyYXBwZXJ8fGIpfSxfcmVtb3ZlQ2hpbGRBbmltYXRpb25zOmZ1bmN0aW9uKCl7Zm9yKDt0aGlzLl9jaGlsZEFuaW1hdGlvbnMubGVuZ3RoOyl0aGlzLl9jaGlsZEFuaW1hdGlvbnMucG9wKCkuY2FuY2VsKCl9LF9mb3JFYWNoQ2hpbGQ6ZnVuY3Rpb24oYil7dmFyIGM9MDtpZih0aGlzLmVmZmVjdC5jaGlsZHJlbiYmdGhpcy5fY2hpbGRBbmltYXRpb25zLmxlbmd0aDx0aGlzLmVmZmVjdC5jaGlsZHJlbi5sZW5ndGgmJnRoaXMuX2NvbnN0cnVjdENoaWxkQW5pbWF0aW9ucygpLHRoaXMuX2NoaWxkQW5pbWF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGEpe2IuY2FsbCh0aGlzLGEsYyksdGhpcy5lZmZlY3QgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3QmJihjKz1hLmVmZmVjdC5hY3RpdmVEdXJhdGlvbil9LmJpbmQodGhpcykpLFwicGVuZGluZ1wiIT10aGlzLnBsYXlTdGF0ZSl7dmFyIGQ9dGhpcy5lZmZlY3QuX3RpbWluZyxlPXRoaXMuY3VycmVudFRpbWU7bnVsbCE9PWUmJihlPWEuY2FsY3VsYXRlSXRlcmF0aW9uUHJvZ3Jlc3MoYS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbihkKSxlLGQpKSwobnVsbD09ZXx8aXNOYU4oZSkpJiZ0aGlzLl9yZW1vdmVDaGlsZEFuaW1hdGlvbnMoKX19fSx3aW5kb3cuQW5pbWF0aW9uPWIuQW5pbWF0aW9ufShjLGUpLGZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGIpe3RoaXMuX2ZyYW1lcz1hLm5vcm1hbGl6ZUtleWZyYW1lcyhiKX1mdW5jdGlvbiBlKCl7Zm9yKHZhciBhPSExO2kubGVuZ3RoOylpLnNoaWZ0KCkuX3VwZGF0ZUNoaWxkcmVuKCksYT0hMDtyZXR1cm4gYX12YXIgZj1mdW5jdGlvbihhKXtpZihhLl9hbmltYXRpb249dm9pZCAwLGEgaW5zdGFuY2VvZiB3aW5kb3cuU2VxdWVuY2VFZmZlY3R8fGEgaW5zdGFuY2VvZiB3aW5kb3cuR3JvdXBFZmZlY3QpZm9yKHZhciBiPTA7YjxhLmNoaWxkcmVuLmxlbmd0aDtiKyspZihhLmNoaWxkcmVuW2JdKX07Yi5yZW1vdmVNdWx0aT1mdW5jdGlvbihhKXtmb3IodmFyIGI9W10sYz0wO2M8YS5sZW5ndGg7YysrKXt2YXIgZD1hW2NdO2QuX3BhcmVudD8oLTE9PWIuaW5kZXhPZihkLl9wYXJlbnQpJiZiLnB1c2goZC5fcGFyZW50KSxkLl9wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGQuX3BhcmVudC5jaGlsZHJlbi5pbmRleE9mKGQpLDEpLGQuX3BhcmVudD1udWxsLGYoZCkpOmQuX2FuaW1hdGlvbiYmZC5fYW5pbWF0aW9uLmVmZmVjdD09ZCYmKGQuX2FuaW1hdGlvbi5jYW5jZWwoKSxkLl9hbmltYXRpb24uZWZmZWN0PW5ldyBLZXlmcmFtZUVmZmVjdChudWxsLFtdKSxkLl9hbmltYXRpb24uX2NhbGxiYWNrJiYoZC5fYW5pbWF0aW9uLl9jYWxsYmFjay5fYW5pbWF0aW9uPW51bGwpLGQuX2FuaW1hdGlvbi5fcmVidWlsZFVuZGVybHlpbmdBbmltYXRpb24oKSxmKGQpKX1mb3IoYz0wO2M8Yi5sZW5ndGg7YysrKWJbY10uX3JlYnVpbGQoKX0sYi5LZXlmcmFtZUVmZmVjdD1mdW5jdGlvbihiLGMsZSxmKXtyZXR1cm4gdGhpcy50YXJnZXQ9Yix0aGlzLl9wYXJlbnQ9bnVsbCxlPWEubnVtZXJpY1RpbWluZ1RvT2JqZWN0KGUpLHRoaXMuX3RpbWluZ0lucHV0PWEuY2xvbmVUaW1pbmdJbnB1dChlKSx0aGlzLl90aW1pbmc9YS5ub3JtYWxpemVUaW1pbmdJbnB1dChlKSx0aGlzLnRpbWluZz1hLm1ha2VUaW1pbmcoZSwhMSx0aGlzKSx0aGlzLnRpbWluZy5fZWZmZWN0PXRoaXMsXCJmdW5jdGlvblwiPT10eXBlb2YgYz8oYS5kZXByZWNhdGVkKFwiQ3VzdG9tIEtleWZyYW1lRWZmZWN0XCIsXCIyMDE1LTA2LTIyXCIsXCJVc2UgS2V5ZnJhbWVFZmZlY3Qub25zYW1wbGUgaW5zdGVhZC5cIiksdGhpcy5fbm9ybWFsaXplZEtleWZyYW1lcz1jKTp0aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzPW5ldyBkKGMpLHRoaXMuX2tleWZyYW1lcz1jLHRoaXMuYWN0aXZlRHVyYXRpb249YS5jYWxjdWxhdGVBY3RpdmVEdXJhdGlvbih0aGlzLl90aW1pbmcpLHRoaXMuX2lkPWYsdGhpc30sYi5LZXlmcmFtZUVmZmVjdC5wcm90b3R5cGU9e2dldEZyYW1lczpmdW5jdGlvbigpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHRoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXM/dGhpcy5fbm9ybWFsaXplZEtleWZyYW1lczp0aGlzLl9ub3JtYWxpemVkS2V5ZnJhbWVzLl9mcmFtZXN9LHNldCBvbnNhbXBsZShhKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLmdldEZyYW1lcygpKXRocm93IG5ldyBFcnJvcihcIlNldHRpbmcgb25zYW1wbGUgb24gY3VzdG9tIGVmZmVjdCBLZXlmcmFtZUVmZmVjdCBpcyBub3Qgc3VwcG9ydGVkLlwiKTt0aGlzLl9vbnNhbXBsZT1hLHRoaXMuX2FuaW1hdGlvbiYmdGhpcy5fYW5pbWF0aW9uLl9yZWJ1aWxkVW5kZXJseWluZ0FuaW1hdGlvbigpfSxnZXQgcGFyZW50KCl7cmV0dXJuIHRoaXMuX3BhcmVudH0sY2xvbmU6ZnVuY3Rpb24oKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiB0aGlzLmdldEZyYW1lcygpKXRocm93IG5ldyBFcnJvcihcIkNsb25pbmcgY3VzdG9tIGVmZmVjdHMgaXMgbm90IHN1cHBvcnRlZC5cIik7dmFyIGI9bmV3IEtleWZyYW1lRWZmZWN0KHRoaXMudGFyZ2V0LFtdLGEuY2xvbmVUaW1pbmdJbnB1dCh0aGlzLl90aW1pbmdJbnB1dCksdGhpcy5faWQpO3JldHVybiBiLl9ub3JtYWxpemVkS2V5ZnJhbWVzPXRoaXMuX25vcm1hbGl6ZWRLZXlmcmFtZXMsYi5fa2V5ZnJhbWVzPXRoaXMuX2tleWZyYW1lcyxifSxyZW1vdmU6ZnVuY3Rpb24oKXtiLnJlbW92ZU11bHRpKFt0aGlzXSl9fTt2YXIgZz1FbGVtZW50LnByb3RvdHlwZS5hbmltYXRlO0VsZW1lbnQucHJvdG90eXBlLmFuaW1hdGU9ZnVuY3Rpb24oYSxjKXt2YXIgZD1cIlwiO3JldHVybiBjJiZjLmlkJiYoZD1jLmlkKSxiLnRpbWVsaW5lLl9wbGF5KG5ldyBiLktleWZyYW1lRWZmZWN0KHRoaXMsYSxjLGQpKX07dmFyIGg9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiZGl2XCIpO2IubmV3VW5kZXJseWluZ0FuaW1hdGlvbkZvcktleWZyYW1lRWZmZWN0PWZ1bmN0aW9uKGEpe2lmKGEpe3ZhciBiPWEudGFyZ2V0fHxoLGM9YS5fa2V5ZnJhbWVzO1wiZnVuY3Rpb25cIj09dHlwZW9mIGMmJihjPVtdKTt2YXIgZD1hLl90aW1pbmdJbnB1dDtkLmlkPWEuX2lkfWVsc2UgdmFyIGI9aCxjPVtdLGQ9MDtyZXR1cm4gZy5hcHBseShiLFtjLGRdKX0sYi5iaW5kQW5pbWF0aW9uRm9yS2V5ZnJhbWVFZmZlY3Q9ZnVuY3Rpb24oYSl7YS5lZmZlY3QmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGEuZWZmZWN0Ll9ub3JtYWxpemVkS2V5ZnJhbWVzJiZiLmJpbmRBbmltYXRpb25Gb3JDdXN0b21FZmZlY3QoYSl9O3ZhciBpPVtdO2IuYXdhaXRTdGFydFRpbWU9ZnVuY3Rpb24oYSl7bnVsbD09PWEuc3RhcnRUaW1lJiZhLl9pc0dyb3VwJiYoMD09aS5sZW5ndGgmJnJlcXVlc3RBbmltYXRpb25GcmFtZShlKSxpLnB1c2goYSkpfTt2YXIgaj13aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZTtPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LFwiZ2V0Q29tcHV0ZWRTdHlsZVwiLHtjb25maWd1cmFibGU6ITAsZW51bWVyYWJsZTohMCx2YWx1ZTpmdW5jdGlvbigpe2IudGltZWxpbmUuX3VwZGF0ZUFuaW1hdGlvbnNQcm9taXNlcygpO3ZhciBhPWouYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiBlKCkmJihhPWouYXBwbHkodGhpcyxhcmd1bWVudHMpKSxiLnRpbWVsaW5lLl91cGRhdGVBbmltYXRpb25zUHJvbWlzZXMoKSxhfX0pLHdpbmRvdy5LZXlmcmFtZUVmZmVjdD1iLktleWZyYW1lRWZmZWN0LHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5nZXRBbmltYXRpb25zPWZ1bmN0aW9uKCl7cmV0dXJuIGRvY3VtZW50LnRpbWVsaW5lLmdldEFuaW1hdGlvbnMoKS5maWx0ZXIoZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPT1hLmVmZmVjdCYmYS5lZmZlY3QudGFyZ2V0PT10aGlzfS5iaW5kKHRoaXMpKX19KGMsZSksZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoYSl7YS5fcmVnaXN0ZXJlZHx8KGEuX3JlZ2lzdGVyZWQ9ITAsZy5wdXNoKGEpLGh8fChoPSEwLHJlcXVlc3RBbmltYXRpb25GcmFtZShlKSkpfWZ1bmN0aW9uIGUoYSl7dmFyIGI9ZztnPVtdLGIuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhLl9zZXF1ZW5jZU51bWJlci1iLl9zZXF1ZW5jZU51bWJlcn0pLGI9Yi5maWx0ZXIoZnVuY3Rpb24oYSl7YSgpO3ZhciBiPWEuX2FuaW1hdGlvbj9hLl9hbmltYXRpb24ucGxheVN0YXRlOlwiaWRsZVwiO3JldHVyblwicnVubmluZ1wiIT1iJiZcInBlbmRpbmdcIiE9YiYmKGEuX3JlZ2lzdGVyZWQ9ITEpLGEuX3JlZ2lzdGVyZWR9KSxnLnB1c2guYXBwbHkoZyxiKSxnLmxlbmd0aD8oaD0hMCxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZSkpOmg9ITF9dmFyIGY9KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImRpdlwiKSwwKTtiLmJpbmRBbmltYXRpb25Gb3JDdXN0b21FZmZlY3Q9ZnVuY3Rpb24oYil7dmFyIGMsZT1iLmVmZmVjdC50YXJnZXQsZz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBiLmVmZmVjdC5nZXRGcmFtZXMoKTtjPWc/Yi5lZmZlY3QuZ2V0RnJhbWVzKCk6Yi5lZmZlY3QuX29uc2FtcGxlO3ZhciBoPWIuZWZmZWN0LnRpbWluZyxpPW51bGw7aD1hLm5vcm1hbGl6ZVRpbWluZ0lucHV0KGgpO3ZhciBqPWZ1bmN0aW9uKCl7dmFyIGQ9ai5fYW5pbWF0aW9uP2ouX2FuaW1hdGlvbi5jdXJyZW50VGltZTpudWxsO251bGwhPT1kJiYoZD1hLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzKGEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24oaCksZCxoKSxpc05hTihkKSYmKGQ9bnVsbCkpLGQhPT1pJiYoZz9jKGQsZSxiLmVmZmVjdCk6YyhkLGIuZWZmZWN0LGIuZWZmZWN0Ll9hbmltYXRpb24pKSxpPWR9O2ouX2FuaW1hdGlvbj1iLGouX3JlZ2lzdGVyZWQ9ITEsai5fc2VxdWVuY2VOdW1iZXI9ZisrLGIuX2NhbGxiYWNrPWosZChqKX07dmFyIGc9W10saD0hMTtiLkFuaW1hdGlvbi5wcm90b3R5cGUuX3JlZ2lzdGVyPWZ1bmN0aW9uKCl7dGhpcy5fY2FsbGJhY2smJmQodGhpcy5fY2FsbGJhY2spfX0oYyxlKSxmdW5jdGlvbihhLGIsYyl7ZnVuY3Rpb24gZChhKXtyZXR1cm4gYS5fdGltaW5nLmRlbGF5K2EuYWN0aXZlRHVyYXRpb24rYS5fdGltaW5nLmVuZERlbGF5fWZ1bmN0aW9uIGUoYixjLGQpe3RoaXMuX2lkPWQsdGhpcy5fcGFyZW50PW51bGwsdGhpcy5jaGlsZHJlbj1ifHxbXSx0aGlzLl9yZXBhcmVudCh0aGlzLmNoaWxkcmVuKSxjPWEubnVtZXJpY1RpbWluZ1RvT2JqZWN0KGMpLHRoaXMuX3RpbWluZ0lucHV0PWEuY2xvbmVUaW1pbmdJbnB1dChjKSx0aGlzLl90aW1pbmc9YS5ub3JtYWxpemVUaW1pbmdJbnB1dChjLCEwKSx0aGlzLnRpbWluZz1hLm1ha2VUaW1pbmcoYywhMCx0aGlzKSx0aGlzLnRpbWluZy5fZWZmZWN0PXRoaXMsXCJhdXRvXCI9PT10aGlzLl90aW1pbmcuZHVyYXRpb24mJih0aGlzLl90aW1pbmcuZHVyYXRpb249dGhpcy5hY3RpdmVEdXJhdGlvbil9d2luZG93LlNlcXVlbmNlRWZmZWN0PWZ1bmN0aW9uKCl7ZS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LHdpbmRvdy5Hcm91cEVmZmVjdD1mdW5jdGlvbigpe2UuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxlLnByb3RvdHlwZT17X2lzQW5jZXN0b3I6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXM7bnVsbCE9PWI7KXtpZihiPT1hKXJldHVybiEwO2I9Yi5fcGFyZW50fXJldHVybiExfSxfcmVidWlsZDpmdW5jdGlvbigpe2Zvcih2YXIgYT10aGlzO2E7KVwiYXV0b1wiPT09YS50aW1pbmcuZHVyYXRpb24mJihhLl90aW1pbmcuZHVyYXRpb249YS5hY3RpdmVEdXJhdGlvbiksYT1hLl9wYXJlbnQ7dGhpcy5fYW5pbWF0aW9uJiZ0aGlzLl9hbmltYXRpb24uX3JlYnVpbGRVbmRlcmx5aW5nQW5pbWF0aW9uKCl9LF9yZXBhcmVudDpmdW5jdGlvbihhKXtiLnJlbW92ZU11bHRpKGEpO2Zvcih2YXIgYz0wO2M8YS5sZW5ndGg7YysrKWFbY10uX3BhcmVudD10aGlzfSxfcHV0Q2hpbGQ6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9Yj9cIkNhbm5vdCBhcHBlbmQgYW4gYW5jZXN0b3Igb3Igc2VsZlwiOlwiQ2Fubm90IHByZXBlbmQgYW4gYW5jZXN0b3Igb3Igc2VsZlwiLGQ9MDtkPGEubGVuZ3RoO2QrKylpZih0aGlzLl9pc0FuY2VzdG9yKGFbZF0pKXRocm93e3R5cGU6RE9NRXhjZXB0aW9uLkhJRVJBUkNIWV9SRVFVRVNUX0VSUixuYW1lOlwiSGllcmFyY2h5UmVxdWVzdEVycm9yXCIsbWVzc2FnZTpjfTtmb3IodmFyIGQ9MDtkPGEubGVuZ3RoO2QrKyliP3RoaXMuY2hpbGRyZW4ucHVzaChhW2RdKTp0aGlzLmNoaWxkcmVuLnVuc2hpZnQoYVtkXSk7dGhpcy5fcmVwYXJlbnQoYSksdGhpcy5fcmVidWlsZCgpfSxhcHBlbmQ6ZnVuY3Rpb24oKXt0aGlzLl9wdXRDaGlsZChhcmd1bWVudHMsITApfSxwcmVwZW5kOmZ1bmN0aW9uKCl7dGhpcy5fcHV0Q2hpbGQoYXJndW1lbnRzLCExKX0sZ2V0IHBhcmVudCgpe3JldHVybiB0aGlzLl9wYXJlbnR9LGdldCBmaXJzdENoaWxkKCl7cmV0dXJuIHRoaXMuY2hpbGRyZW4ubGVuZ3RoP3RoaXMuY2hpbGRyZW5bMF06bnVsbH0sZ2V0IGxhc3RDaGlsZCgpe3JldHVybiB0aGlzLmNoaWxkcmVuLmxlbmd0aD90aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoLTFdOm51bGx9LGNsb25lOmZ1bmN0aW9uKCl7Zm9yKHZhciBiPWEuY2xvbmVUaW1pbmdJbnB1dCh0aGlzLl90aW1pbmdJbnB1dCksYz1bXSxkPTA7ZDx0aGlzLmNoaWxkcmVuLmxlbmd0aDtkKyspYy5wdXNoKHRoaXMuY2hpbGRyZW5bZF0uY2xvbmUoKSk7cmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBHcm91cEVmZmVjdD9uZXcgR3JvdXBFZmZlY3QoYyxiKTpuZXcgU2VxdWVuY2VFZmZlY3QoYyxiKX0scmVtb3ZlOmZ1bmN0aW9uKCl7Yi5yZW1vdmVNdWx0aShbdGhpc10pfX0sd2luZG93LlNlcXVlbmNlRWZmZWN0LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlNlcXVlbmNlRWZmZWN0LnByb3RvdHlwZSxcImFjdGl2ZUR1cmF0aW9uXCIse2dldDpmdW5jdGlvbigpe3ZhciBhPTA7cmV0dXJuIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihiKXthKz1kKGIpfSksTWF0aC5tYXgoYSwwKX19KSx3aW5kb3cuR3JvdXBFZmZlY3QucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuR3JvdXBFZmZlY3QucHJvdG90eXBlLFwiYWN0aXZlRHVyYXRpb25cIix7Z2V0OmZ1bmN0aW9uKCl7dmFyIGE9MDtyZXR1cm4gdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGIpe2E9TWF0aC5tYXgoYSxkKGIpKX0pLGF9fSksYi5uZXdVbmRlcmx5aW5nQW5pbWF0aW9uRm9yR3JvdXA9ZnVuY3Rpb24oYyl7dmFyIGQsZT1udWxsLGY9ZnVuY3Rpb24oYil7dmFyIGM9ZC5fd3JhcHBlcjtpZihjJiZcInBlbmRpbmdcIiE9Yy5wbGF5U3RhdGUmJmMuZWZmZWN0KXJldHVybiBudWxsPT1iP3ZvaWQgYy5fcmVtb3ZlQ2hpbGRBbmltYXRpb25zKCk6MD09YiYmYy5wbGF5YmFja1JhdGU8MCYmKGV8fChlPWEubm9ybWFsaXplVGltaW5nSW5wdXQoYy5lZmZlY3QudGltaW5nKSksYj1hLmNhbGN1bGF0ZUl0ZXJhdGlvblByb2dyZXNzKGEuY2FsY3VsYXRlQWN0aXZlRHVyYXRpb24oZSksLTEsZSksaXNOYU4oYil8fG51bGw9PWIpPyhjLl9mb3JFYWNoQ2hpbGQoZnVuY3Rpb24oYSl7YS5jdXJyZW50VGltZT0tMX0pLHZvaWQgYy5fcmVtb3ZlQ2hpbGRBbmltYXRpb25zKCkpOnZvaWQgMH0sZz1uZXcgS2V5ZnJhbWVFZmZlY3QobnVsbCxbXSxjLl90aW1pbmcsYy5faWQpO3JldHVybiBnLm9uc2FtcGxlPWYsZD1iLnRpbWVsaW5lLl9wbGF5KGcpfSxiLmJpbmRBbmltYXRpb25Gb3JHcm91cD1mdW5jdGlvbihhKXthLl9hbmltYXRpb24uX3dyYXBwZXI9YSxhLl9pc0dyb3VwPSEwLGIuYXdhaXRTdGFydFRpbWUoYSksYS5fY29uc3RydWN0Q2hpbGRBbmltYXRpb25zKCksYS5fc2V0RXh0ZXJuYWxBbmltYXRpb24oYSl9LGIuZ3JvdXBDaGlsZER1cmF0aW9uPWR9KGMsZSksYi50cnVlPWF9KHt9LGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KCkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViLWFuaW1hdGlvbnMtbmV4dC1saXRlLm1pbi5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy93ZWItYW5pbWF0aW9ucy1qcy93ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy93ZWItYW5pbWF0aW9ucy1qcy93ZWItYW5pbWF0aW9ucy1uZXh0LWxpdGUubWluLmpzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsInZhciBnO1xuXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxuZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHRoaXM7XG59KSgpO1xuXG50cnkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcbn0gY2F0Y2goZSkge1xuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxuXHRcdGcgPSB3aW5kb3c7XG59XG5cbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XG5cbm1vZHVsZS5leHBvcnRzID0gZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gLi9ub2RlX21vZHVsZXMvd2VicGFjay9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21haW4uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy9tYWluLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCJpbXBvcnQgJ3dlYi1hbmltYXRpb25zLWpzL3dlYi1hbmltYXRpb25zLW5leHQtbGl0ZS5taW4nO1xyXG5pbXBvcnQgcmVuZGVyZXIgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL3Zkb20nO1xyXG5pbXBvcnQgUmVnaXN0cnkgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1JlZ2lzdHJ5JztcclxuaW1wb3J0IHsgdyB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJSb3V0ZXJJbmplY3RvciB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlckluamVjdG9yJztcclxuaW1wb3J0IHsgcmVnaXN0ZXJUaGVtZUluamVjdG9yIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQnO1xyXG5pbXBvcnQgZG9qbyBmcm9tICdAZG9qby90aGVtZXMvZG9qbyc7XHJcbmltcG9ydCAnQGRvam8vdGhlbWVzL2Rvam8vaW5kZXguY3NzJztcclxuXHJcbmltcG9ydCByb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xyXG5pbXBvcnQgQXBwIGZyb20gJy4vd2lkZ2V0cy9BcHAnO1xyXG5cclxuY29uc3QgcmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkoKTtcclxucmVnaXN0ZXJSb3V0ZXJJbmplY3Rvcihyb3V0ZXMsIHJlZ2lzdHJ5KTtcclxucmVnaXN0ZXJUaGVtZUluamVjdG9yKGRvam8sIHJlZ2lzdHJ5KTtcclxuXHJcbmNvbnN0IHIgPSByZW5kZXJlcigoKSA9PiB3KEFwcCwge30pKTtcclxuci5tb3VudCh7IHJlZ2lzdHJ5IH0pO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvbWFpbi50cyIsImV4cG9ydCBkZWZhdWx0IFtcblx0e1xuXHRcdHBhdGg6ICdob21lJyxcblx0XHRvdXRsZXQ6ICdob21lJyxcblx0XHRkZWZhdWx0Um91dGU6IHRydWVcblx0fSxcblx0e1xuXHRcdHBhdGg6ICdjYXQnLFxuXHRcdG91dGxldDogJ2NhdCdcblx0fSxcblx0e1xuXHRcdHBhdGg6ICdkb2cnLFxuXHRcdG91dGxldDogJ2RvZydcblx0fVxuXTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy9yb3V0ZXMudHMiLCJpbXBvcnQgT3V0bGV0IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL091dGxldCc7XG5pbXBvcnQgeyB2LCB3IH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2QnO1xuaW1wb3J0IFdpZGdldEJhc2UgZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL1dpZGdldEJhc2UnO1xuXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuL0J1dHRvbic7XG5pbXBvcnQgeyBDYXRDb250YWluZXIgfSBmcm9tICcuL0NhdENvbnRhaW5lcic7XG5pbXBvcnQgeyBEb2dDb250YWluZXIgfSBmcm9tICcuL0RvZ0NvbnRhaW5lcic7XG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9zdHlsZXMvQXBwLm0uY3NzJztcbmltcG9ydCB7IENvcmVBdWRpbyB9IGZyb20gJy4vQ29yZUF1ZGlvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwIGV4dGVuZHMgV2lkZ2V0QmFzZSB7XG5cdHByaXZhdGUgY29yZUF1ZGlvID0gbmV3IENvcmVBdWRpbygpO1xuXG5cdHByb3RlY3RlZCByZW5kZXIoKSB7XG5cdFx0Y29uc3QgY29yZUF1ZGlvID0gdGhpcy5jb3JlQXVkaW87XG5cdFx0Y29uc3Qgb25QbGF5U291bmQgPSAoc291bmQ6IGFueSkgPT4ge1xuXHRcdFx0Y29yZUF1ZGlvLnBsYXkoc291bmQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB2KCdkaXYnLCB7IGNsYXNzZXM6IFtjc3Mucm9vdF0gfSwgW1xuXHRcdFx0dignaGVhZGVyJywgeyBjbGFzc2VzOiBbY3NzLmhlYWRlcl0gfSwgW1xuXHRcdFx0XHR3KEJ1dHRvbiwgeyB0bzogJ2NhdCcgfSwgWydDYXRzJ10pLFxuXHRcdFx0XHR2KCdwJywge30sIFsndnMnXSksXG5cdFx0XHRcdHcoQnV0dG9uLCB7IHRvOiAnZG9nJyB9LCBbJ0RvZ3MnXSlcblx0XHRcdF0pLFxuXHRcdFx0dyhPdXRsZXQsIHsga2V5OiAnY2F0JywgaWQ6ICdjYXQnLCByZW5kZXJlcjogKCkgPT4gdyhDYXRDb250YWluZXIsIHsgb25QbGF5U291bmQgfSkgfSksXG5cdFx0XHR3KE91dGxldCwgeyBrZXk6ICdkb2cnLCBpZDogJ2RvZycsIHJlbmRlcmVyOiAoKSA9PiB3KERvZ0NvbnRhaW5lciwgeyBvblBsYXlTb3VuZCB9KSB9KVxuXHRcdF0pO1xuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvd2lkZ2V0cy9BcHAudHMiLCJpbXBvcnQgeyBIYW5kbGUgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvY29yZS9EZXN0cm95YWJsZSc7XHJcbmltcG9ydCB7IExpbmtQcm9wZXJ0aWVzIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3JvdXRpbmcvaW50ZXJmYWNlcyc7XHJcbmltcG9ydCBMaW5rIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL0xpbmsnO1xyXG5pbXBvcnQgUm91dGVyIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay9yb3V0aW5nL1JvdXRlcic7XHJcbmltcG9ydCB7IHYsIHcgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XHJcbmltcG9ydCB7IGFsd2F5c1JlbmRlciB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2Fsd2F5c1JlbmRlcic7XHJcbmltcG9ydCB7IGRpZmZQcm9wZXJ0eSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kZWNvcmF0b3JzL2RpZmZQcm9wZXJ0eSc7XHJcbmltcG9ydCBXaWRnZXRCYXNlIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlJztcclxuXHJcbmltcG9ydCAqIGFzIGNzcyBmcm9tICcuL3N0eWxlcy9CdXR0b24ubS5jc3MnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXR0b25MaW5rUHJvcGVydGllcyBleHRlbmRzIExpbmtQcm9wZXJ0aWVzIHtcclxuXHRzZWxlY3RlZD86IGJvb2xlYW47XHJcbn1cclxuXHJcbkBhbHdheXNSZW5kZXIoKVxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgV2lkZ2V0QmFzZTxCdXR0b25MaW5rUHJvcGVydGllcz4ge1xyXG5cdHByaXZhdGUgX2hhbmRsZTogSGFuZGxlIHwgdW5kZWZpbmVkO1xyXG5cclxuXHRAZGlmZlByb3BlcnR5KCdyb3V0ZXJLZXknKVxyXG5cdHByb3RlY3RlZCBvblJvdXRlcktleUNoYW5nZShjdXJyZW50OiBCdXR0b25MaW5rUHJvcGVydGllcywgbmV4dDogQnV0dG9uTGlua1Byb3BlcnRpZXMpIHtcclxuXHRcdGNvbnN0IHsgcm91dGVyS2V5ID0gJ3JvdXRlcicgfSA9IG5leHQ7XHJcblx0XHRjb25zdCBpdGVtID0gdGhpcy5yZWdpc3RyeS5nZXRJbmplY3RvcjxSb3V0ZXI+KHJvdXRlcktleSk7XHJcblx0XHRpZiAodGhpcy5faGFuZGxlKSB7XHJcblx0XHRcdHRoaXMuX2hhbmRsZS5kZXN0cm95KCk7XHJcblx0XHRcdHRoaXMuX2hhbmRsZSA9IHVuZGVmaW5lZDtcclxuXHRcdH1cclxuXHRcdGlmIChpdGVtKSB7XHJcblx0XHRcdHRoaXMuX2hhbmRsZSA9IGl0ZW0uaW52YWxpZGF0b3Iub24oJ2ludmFsaWRhdGUnLCAoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5pbnZhbGlkYXRlKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLm93bih0aGlzLl9oYW5kbGUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJvdGVjdGVkIG9uQXR0YWNoKCkge1xyXG5cdFx0aWYgKCF0aGlzLl9oYW5kbGUpIHtcclxuXHRcdFx0dGhpcy5vblJvdXRlcktleUNoYW5nZSh0aGlzLnByb3BlcnRpZXMsIHRoaXMucHJvcGVydGllcyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcm90ZWN0ZWQgcmVuZGVyKCkge1xyXG5cdFx0Y29uc3Qgc2VsZWN0ZWQgPSB0aGlzLmlzU2VsZWN0ZWQoKTtcclxuXHJcblx0XHRyZXR1cm4gdyhMaW5rLCB7IC4uLnRoaXMucHJvcGVydGllcywgY2xhc3NlczogY3NzLnJvb3QgfSwgW1xyXG5cdFx0XHR2KCdkaXYnLCB7IGNsYXNzZXM6IFtjc3MuY29udGFpbmVyLCBzZWxlY3RlZCA/IGNzcy5zZWxlY3RlZCA6IHVuZGVmaW5lZF0gfSwgdGhpcy5jaGlsZHJlbilcclxuXHRcdF0pO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBpc1NlbGVjdGVkKCkge1xyXG5cdFx0Y29uc3QgeyB0bywgcm91dGVyS2V5ID0gJ3JvdXRlcicgfSA9IHRoaXMucHJvcGVydGllcztcclxuXHRcdGNvbnN0IGl0ZW0gPSB0aGlzLnJlZ2lzdHJ5LmdldEluamVjdG9yPFJvdXRlcj4ocm91dGVyS2V5KTtcclxuXHJcblx0XHRpZiAoaXRlbSkge1xyXG5cdFx0XHRjb25zdCByb3V0ZXIgPSBpdGVtLmluamVjdG9yKCk7XHJcblx0XHRcdGNvbnN0IG91dGxldENvbnRleHQgPSByb3V0ZXIuZ2V0T3V0bGV0KHRvKTtcclxuXHRcdFx0aWYgKG91dGxldENvbnRleHQpIHtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvd2lkZ2V0cy9CdXR0b24udHMiLCJpbXBvcnQgeyBETm9kZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRoZW1lZE1peGluLCB0aGVtZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9taXhpbnMvVGhlbWVkJztcbmltcG9ydCB7IFdpZGdldEJhc2UgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvV2lkZ2V0QmFzZSc7XG5pbXBvcnQgKiBhcyBjc3MgZnJvbSAnLi9zdHlsZXMvY2F0Q29udGFpbmVyLm0uY3NzJztcbmltcG9ydCB7IHYgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvZCc7XG5pbXBvcnQgV2ViQW5pbWF0aW9uIGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9tZXRhL1dlYkFuaW1hdGlvbic7XG5pbXBvcnQgeyBoZWFkVGlsdCB9IGZyb20gJy4vdXRpbC9hbmltYXRpb25zJztcblxuY29uc3QgaGVhZCA9IHJlcXVpcmUoJy4vYXNzZXRzL2NhdC1oZWFkLnBuZycpO1xuY29uc3QgYm9keSA9IHJlcXVpcmUoJy4vYXNzZXRzL2NhdC1ib2R5LnBuZycpO1xuXG4vKipcbiAqIEB0eXBlIENhdENvbnRhaW5lclByb3BlcnRpZXNcbiAqXG4gKiBQcm9wZXJ0aWVzIHRoYXQgY2FuIGJlIHNldCBvbiBBbmltYWwgY29tcG9uZW50c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENhdENvbnRhaW5lclByb3BlcnRpZXMge1xuXHRvblBsYXlTb3VuZD8oYXVkaW86IGFueSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBUaGVtZWRCYXNlID0gVGhlbWVkTWl4aW4oV2lkZ2V0QmFzZSk7XG5cbkB0aGVtZShjc3MpXG5leHBvcnQgY2xhc3MgQ2F0Q29udGFpbmVyPFAgZXh0ZW5kcyBDYXRDb250YWluZXJQcm9wZXJ0aWVzID0gQ2F0Q29udGFpbmVyUHJvcGVydGllcz4gZXh0ZW5kcyBUaGVtZWRCYXNlPFA+IHtcblx0cHJvdGVjdGVkIHJlbmRlcigpOiBETm9kZSB8IEROb2RlW10ge1xuXHRcdGNvbnN0IGtleSA9ICdjYXRoZWFkJztcblx0XHR0aGlzLm1ldGEoV2ViQW5pbWF0aW9uKS5hbmltYXRlKGtleSwgaGVhZFRpbHQoJ2NhdEhlYWRUaWx0JykpO1xuXG5cdFx0cmV0dXJuIHYoJ2RpdicsIHsgY2xhc3NlczogY3NzLnJvb3QgfSwgW1xuXHRcdFx0dignaW1nJywgeyBrZXksIHNyYzogaGVhZCwgY2xhc3NlczogY3NzLmhlYWQgfSksXG5cdFx0XHR2KCdpbWcnLCB7IHNyYzogYm9keSwgY2xhc3NlczogY3NzLmJvZHkgfSksXG5cdFx0XHR2KCdidXR0b24nLCB7IG9uY2xpY2s6IHRoaXMub25DbGljayB9LCBbJ01lb3cnXSlcblx0XHRdKTtcblx0fVxuXG5cdHByaXZhdGUgb25DbGljaygpIHtcblx0XHRjb25zdCB7IG9uUGxheVNvdW5kIH0gPSB0aGlzLnByb3BlcnRpZXM7XG5cblx0XHRpZiAob25QbGF5U291bmQpIHtcblx0XHRcdG9uUGxheVNvdW5kKCdtZW93Jyk7XG5cdFx0fVxuXHR9XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9ub2RlX21vZHVsZXMvQGRvam8vd2VicGFjay1jb250cmliL2Nzcy1tb2R1bGUtZHRzLWxvYWRlcj90eXBlPXRzJmluc3RhbmNlTmFtZT0wX2Rvam8hLi9zcmMvd2lkZ2V0cy9DYXRDb250YWluZXIudHMiLCJleHBvcnQgY2xhc3MgQ29yZUF1ZGlvIHtcblx0cHJpdmF0ZSBjb250ZXh0ITogQXVkaW9Db250ZXh0O1xuXG5cdHByaXZhdGUgYXVkaW9NYXAgPSBuZXcgTWFwPHN0cmluZywgQXVkaW9CdWZmZXI+KCk7XG5cblx0YXN5bmMgcGxheShzb3VuZDogc3RyaW5nKSB7XG5cdFx0aWYgKCF0aGlzLmNvbnRleHQpIHtcblx0XHRcdHRoaXMuY29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblx0XHR9XG5cblx0XHQvLyBDaHJvbWUgYW5kIFNhZmFyaSBhcmUgYm90aCBhd2Z1bFxuXHRcdGlmICh0aGlzLmNvbnRleHQuc3RhdGUgPT09ICdzdXNwZW5kZWQnKSB7XG5cdFx0XHR0aGlzLmNvbnRleHQucmVzdW1lKCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc291cmNlID0gdGhpcy5jb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXHRcdHNvdXJjZS5idWZmZXIgPSBhd2FpdCB0aGlzLmxvYWRDYWNoZWQoc291bmQpO1xuXHRcdHNvdXJjZS5jb25uZWN0KHRoaXMuY29udGV4dC5kZXN0aW5hdGlvbik7XG5cdFx0c291cmNlLnN0YXJ0KHRoaXMuY29udGV4dC5jdXJyZW50VGltZSk7XG5cblx0XHRjb25zb2xlLmxvZyhzb3VuZCk7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRDYWNoZWQoc291bmQ6IHN0cmluZykge1xuXHRcdGlmICh0aGlzLmF1ZGlvTWFwLmhhcyhzb3VuZCkpIHtcblx0XHRcdHJldHVybiB0aGlzLmF1ZGlvTWFwLmdldChzb3VuZCkhO1xuXHRcdH1cblxuXHRcdGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHRoaXMubG9hZEF1ZGlvKHNvdW5kKTtcblx0XHR0aGlzLmF1ZGlvTWFwLnNldChzb3VuZCwgYnVmZmVyKTtcblx0XHRyZXR1cm4gYnVmZmVyO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkQXVkaW8oc291bmQ6IHN0cmluZykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZldGNoKGBhc3NldHMvc291bmRzLyR7c291bmR9Lm1wM2ApO1xuXHRcdGNvbnN0IGF1ZGlvRGF0YSA9IGF3YWl0IHJlc3VsdC5hcnJheUJ1ZmZlcigpO1xuXHRcdHJldHVybiBhd2FpdCB0aGlzLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGF1ZGlvRGF0YSk7XG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL0NvcmVBdWRpby50cyIsImltcG9ydCB7IEROb2RlIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgVGhlbWVkTWl4aW4sIHRoZW1lIH0gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21peGlucy9UaGVtZWQnO1xuaW1wb3J0IHsgV2lkZ2V0QmFzZSB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9XaWRnZXRCYXNlJztcbmltcG9ydCAqIGFzIGNzcyBmcm9tICcuL3N0eWxlcy9kb2dDb250YWluZXIubS5jc3MnO1xuaW1wb3J0IHsgdiB9IGZyb20gJ0Bkb2pvL2ZyYW1ld29yay93aWRnZXQtY29yZS9kJztcbmltcG9ydCBXZWJBbmltYXRpb24gZnJvbSAnQGRvam8vZnJhbWV3b3JrL3dpZGdldC1jb3JlL21ldGEvV2ViQW5pbWF0aW9uJztcbmltcG9ydCB7IGhlYWRUaWx0IH0gZnJvbSAnLi91dGlsL2FuaW1hdGlvbnMnO1xuXG5jb25zdCBoZWFkID0gcmVxdWlyZSgnLi9hc3NldHMvZG9nLWhlYWQucG5nJyk7XG5jb25zdCBib2R5ID0gcmVxdWlyZSgnLi9hc3NldHMvZG9nLWJvZHkucG5nJyk7XG5cbi8qKlxuICogQHR5cGUgRG9nQ29udGFpbmVyUHJvcGVydGllc1xuICpcbiAqIFByb3BlcnRpZXMgdGhhdCBjYW4gYmUgc2V0IG9uIEFuaW1hbCBjb21wb25lbnRzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRG9nQ29udGFpbmVyUHJvcGVydGllcyB7XG5cdG9uUGxheVNvdW5kPyhhdWRpbzogYW55KTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IFRoZW1lZEJhc2UgPSBUaGVtZWRNaXhpbihXaWRnZXRCYXNlKTtcblxuQHRoZW1lKGNzcylcbmV4cG9ydCBjbGFzcyBEb2dDb250YWluZXI8UCBleHRlbmRzIERvZ0NvbnRhaW5lclByb3BlcnRpZXMgPSBEb2dDb250YWluZXJQcm9wZXJ0aWVzPiBleHRlbmRzIFRoZW1lZEJhc2U8UD4ge1xuXHRwcm90ZWN0ZWQgcmVuZGVyKCk6IEROb2RlIHwgRE5vZGVbXSB7XG5cdFx0Y29uc3Qga2V5ID0gJ2RvZ0hlYWQnO1xuXHRcdHRoaXMubWV0YShXZWJBbmltYXRpb24pLmFuaW1hdGUoa2V5LCBoZWFkVGlsdCgnZG9nSGVhZFRpbHQnKSk7XG5cblx0XHRyZXR1cm4gdignZGl2JywgeyBjbGFzc2VzOiBjc3Mucm9vdCB9LCBbXG5cdFx0XHR2KCdpbWcnLCB7IGtleSwgc3JjOiBoZWFkLCBjbGFzc2VzOiBjc3MuaGVhZCB9KSxcblx0XHRcdHYoJ2ltZycsIHsgc3JjOiBib2R5LCBjbGFzc2VzOiBjc3MuYm9keSB9KSxcblx0XHRcdHYoJ2J1dHRvbicsIHsgb25jbGljazogdGhpcy5vbkNsaWNrIH0sIFsnV29vZiddKVxuXHRcdF0pO1xuXHR9XG5cblx0cHJpdmF0ZSBvbkNsaWNrKCkge1xuXHRcdGNvbnN0IHsgb25QbGF5U291bmQgfSA9IHRoaXMucHJvcGVydGllcztcblxuXHRcdGlmIChvblBsYXlTb3VuZCkge1xuXHRcdFx0b25QbGF5U291bmQoJ3dvb2YnKTtcblx0XHR9XG5cdH1cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL0RvZ0NvbnRhaW5lci50cyIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImNhdC1ib2R5LjJ5LXo4R3c2LnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC1ib2R5LnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWJvZHkucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImNhdC1oZWFkLjNuRW5kZ2ZKLnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2NhdC1oZWFkLnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvY2F0LWhlYWQucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImRvZy1ib2R5LjN2YlNIdldhLnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2RvZy1ib2R5LnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWJvZHkucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImRvZy1oZWFkLkZ3YkhUak1ELnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvYXNzZXRzL2RvZy1oZWFkLnBuZ1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9hc3NldHMvZG9nLWhlYWQucG5nXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL0FwcFwiLFwicm9vdFwiOlwiQXBwLW1fX3Jvb3RfXzJjVDZ0XCIsXCJoZWFkZXJcIjpcIkFwcC1tX19oZWFkZXJfXzFkSmtQXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvc3R5bGVzL0FwcC5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvQXBwLm0uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsIi8vIHJlbW92ZWQgYnkgZXh0cmFjdC10ZXh0LXdlYnBhY2stcGx1Z2luXG5tb2R1bGUuZXhwb3J0cyA9IHtcIiBfa2V5XCI6XCJjYXRzdnNkb2dzL0J1dHRvblwiLFwicm9vdFwiOlwiQnV0dG9uLW1fX3Jvb3RfXzFVWUZ3XCIsXCJjb250YWluZXJcIjpcIkJ1dHRvbi1tX19jb250YWluZXJfX09OWkRPXCIsXCJzZWxlY3RlZFwiOlwiQnV0dG9uLW1fX3NlbGVjdGVkX19uYXNtSFwifTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy93aWRnZXRzL3N0eWxlcy9CdXR0b24ubS5jc3Ncbi8vIG1vZHVsZSBpZCA9IC4vc3JjL3dpZGdldHMvc3R5bGVzL0J1dHRvbi5tLmNzc1xuLy8gbW9kdWxlIGNodW5rcyA9IG1haW4iLCIvLyByZW1vdmVkIGJ5IGV4dHJhY3QtdGV4dC13ZWJwYWNrLXBsdWdpblxubW9kdWxlLmV4cG9ydHMgPSB7XCIgX2tleVwiOlwiY2F0c3ZzZG9ncy9jYXRDb250YWluZXJcIixcInJvb3RcIjpcImNhdENvbnRhaW5lci1tX19yb290X18zM19reFwiLFwiaGVhZFwiOlwiY2F0Q29udGFpbmVyLW1fX2hlYWRfXzJNMW9FXCIsXCJib2R5XCI6XCJjYXRDb250YWluZXItbV9fYm9keV9fMmlJcnVcIn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvY2F0Q29udGFpbmVyLm0uY3NzXG4vLyBtb2R1bGUgaWQgPSAuL3NyYy93aWRnZXRzL3N0eWxlcy9jYXRDb250YWluZXIubS5jc3Ncbi8vIG1vZHVsZSBjaHVua3MgPSBtYWluIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cbm1vZHVsZS5leHBvcnRzID0ge1wiIF9rZXlcIjpcImNhdHN2c2RvZ3MvZG9nQ29udGFpbmVyXCIsXCJyb290XCI6XCJkb2dDb250YWluZXItbV9fcm9vdF9fRExEckJcIixcImhlYWRcIjpcImRvZ0NvbnRhaW5lci1tX19oZWFkX18xYWhVTFwiLFwiYm9keVwiOlwiZG9nQ29udGFpbmVyLW1fX2JvZHlfXzFVU1NaXCJ9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3dpZGdldHMvc3R5bGVzL2RvZ0NvbnRhaW5lci5tLmNzc1xuLy8gbW9kdWxlIGlkID0gLi9zcmMvd2lkZ2V0cy9zdHlsZXMvZG9nQ29udGFpbmVyLm0uY3NzXG4vLyBtb2R1bGUgY2h1bmtzID0gbWFpbiIsImltcG9ydCB7IEFuaW1hdGlvblByb3BlcnRpZXMgfSBmcm9tICdAZG9qby9mcmFtZXdvcmsvd2lkZ2V0LWNvcmUvbWV0YS9XZWJBbmltYXRpb24nO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhlYWRUaWx0KGlkOiBzdHJpbmcpOiBBbmltYXRpb25Qcm9wZXJ0aWVzIHtcclxuXHRjb25zdCBlZmZlY3RzID0gW1xyXG5cdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoMGRlZyknIH0sXHJcblx0XHR7IHRyYW5zZm9ybTogJ3JvdGF0ZSgtNWRlZyknIH0sXHJcblx0XHR7IHRyYW5zZm9ybTogJ3JvdGF0ZSgwZGVnKScgfSxcclxuXHRcdHsgdHJhbnNmb3JtOiAncm90YXRlKDVkZWcpJyB9LFxyXG5cdFx0eyB0cmFuc2Zvcm06ICdyb3RhdGUoMGRlZyknIH1cclxuXHRdO1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0aWQsXHJcblx0XHRlZmZlY3RzLFxyXG5cdFx0dGltaW5nOiB7XHJcblx0XHRcdGR1cmF0aW9uOiAxMDAwLFxyXG5cdFx0XHRpdGVyYXRpb25zOiBJbmZpbml0eVxyXG5cdFx0fSxcclxuXHRcdGNvbnRyb2xzOiB7XHJcblx0XHRcdHBsYXk6IHRydWVcclxuXHRcdH1cclxuXHR9O1xyXG59XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL25vZGVfbW9kdWxlcy9AZG9qby93ZWJwYWNrLWNvbnRyaWIvY3NzLW1vZHVsZS1kdHMtbG9hZGVyP3R5cGU9dHMmaW5zdGFuY2VOYW1lPTBfZG9qbyEuL3NyYy93aWRnZXRzL3V0aWwvYW5pbWF0aW9ucy50cyJdLCJzb3VyY2VSb290IjoiIn0=