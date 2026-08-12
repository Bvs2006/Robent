import { i as __require, o as __toESM, t as __commonJSMin } from "./rolldown-runtime-BMI-E3GI.js";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { BrowserWindow, app, dialog, ipcMain, safeStorage, shell } from "electron";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
import * as os from "os";
import { spawn } from "child_process";
import path, { normalize } from "node:path";
import { EventEmitter, addAbortListener, on, once, setMaxListeners } from "node:events";
import { createRequire } from "module";
import { fileURLToPath as fileURLToPath$1 } from "node:url";
import { ChildProcess, execFile, spawn as spawn$1, spawnSync } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import { aborted, callbackify, debuglog, inspect, promisify, stripVTControlCharacters } from "node:util";
import process$1, { execArgv, execPath, hrtime, platform } from "node:process";
import tty from "node:tty";
import { scheduler, setImmediate as setImmediate$1, setTimeout as setTimeout$1 } from "node:timers/promises";
import { constants } from "node:os";
import { serialize } from "node:v8";
import fs, { appendFileSync, closeSync, createReadStream, createWriteStream, openSync, readFileSync, readSync, statSync as statSync$1, writeFileSync as writeFileSync$1 } from "node:fs";
import { Buffer as Buffer$1 } from "node:buffer";
import { finished } from "node:stream/promises";
import { Duplex, PassThrough, Readable, Transform, Writable, getDefaultHighWaterMark } from "node:stream";
import path$1 from "node:path/win32";
//#region node_modules/ms/index.js
var require_ms = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Helpers.
	*/
	var s = 1e3;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;
	/**
	* Parse or format the given `val`.
	*
	* Options:
	*
	*  - `long` verbose formatting [false]
	*
	* @param {String|Number} val
	* @param {Object} [options]
	* @throws {Error} throw an error if val is not a non-empty string or a number
	* @return {String|Number}
	* @api public
	*/
	module.exports = function(val, options) {
		options = options || {};
		var type = typeof val;
		if (type === "string" && val.length > 0) return parse(val);
		else if (type === "number" && isFinite(val)) return options.long ? fmtLong(val) : fmtShort(val);
		throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
	};
	/**
	* Parse the given `str` and return milliseconds.
	*
	* @param {String} str
	* @return {Number}
	* @api private
	*/
	function parse(str) {
		str = String(str);
		if (str.length > 100) return;
		var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
		if (!match) return;
		var n = parseFloat(match[1]);
		switch ((match[2] || "ms").toLowerCase()) {
			case "years":
			case "year":
			case "yrs":
			case "yr":
			case "y": return n * y;
			case "weeks":
			case "week":
			case "w": return n * w;
			case "days":
			case "day":
			case "d": return n * d;
			case "hours":
			case "hour":
			case "hrs":
			case "hr":
			case "h": return n * h;
			case "minutes":
			case "minute":
			case "mins":
			case "min":
			case "m": return n * m;
			case "seconds":
			case "second":
			case "secs":
			case "sec":
			case "s": return n * s;
			case "milliseconds":
			case "millisecond":
			case "msecs":
			case "msec":
			case "ms": return n;
			default: return;
		}
	}
	/**
	* Short format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtShort(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + "d";
		if (msAbs >= h) return Math.round(ms / h) + "h";
		if (msAbs >= m) return Math.round(ms / m) + "m";
		if (msAbs >= s) return Math.round(ms / s) + "s";
		return ms + "ms";
	}
	/**
	* Long format for `ms`.
	*
	* @param {Number} ms
	* @return {String}
	* @api private
	*/
	function fmtLong(ms) {
		var msAbs = Math.abs(ms);
		if (msAbs >= d) return plural(ms, msAbs, d, "day");
		if (msAbs >= h) return plural(ms, msAbs, h, "hour");
		if (msAbs >= m) return plural(ms, msAbs, m, "minute");
		if (msAbs >= s) return plural(ms, msAbs, s, "second");
		return ms + " ms";
	}
	/**
	* Pluralization helper.
	*/
	function plural(ms, msAbs, n, name) {
		var isPlural = msAbs >= n * 1.5;
		return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
	}
}));
//#endregion
//#region node_modules/debug/src/common.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the common logic for both the Node.js and web browser
	* implementations of `debug()`.
	*/
	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = require_ms();
		createDebug.destroy = destroy;
		Object.keys(env).forEach((key) => {
			createDebug[key] = env[key];
		});
		/**
		* The currently active debug mode names, and names to skip.
		*/
		createDebug.names = [];
		createDebug.skips = [];
		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};
		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;
			for (let i = 0; i < namespace.length; i++) {
				hash = (hash << 5) - hash + namespace.charCodeAt(i);
				hash |= 0;
			}
			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;
		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;
			function debug(...args) {
				if (!debug.enabled) return;
				const self = debug;
				const curr = Number(/* @__PURE__ */ new Date());
				self.diff = curr - (prevTime || curr);
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;
				args[0] = createDebug.coerce(args[0]);
				if (typeof args[0] !== "string") args.unshift("%O");
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					if (match === "%%") return "%";
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === "function") {
						const val = args[index];
						match = formatter.call(self, val);
						args.splice(index, 1);
						index--;
					}
					return match;
				});
				createDebug.formatArgs.call(self, args);
				(self.log || createDebug.log).apply(self, args);
			}
			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy;
			Object.defineProperty(debug, "enabled", {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) return enableOverride;
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}
					return enabledCache;
				},
				set: (v) => {
					enableOverride = v;
				}
			});
			if (typeof createDebug.init === "function") createDebug.init(debug);
			return debug;
		}
		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}
		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;
			createDebug.names = [];
			createDebug.skips = [];
			const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
			for (const ns of split) if (ns[0] === "-") createDebug.skips.push(ns.slice(1));
			else createDebug.names.push(ns);
		}
		/**
		* Checks if the given string matches a namespace template, honoring
		* asterisks as wildcards.
		*
		* @param {String} search
		* @param {String} template
		* @return {Boolean}
		*/
		function matchesTemplate(search, template) {
			let searchIndex = 0;
			let templateIndex = 0;
			let starIndex = -1;
			let matchIndex = 0;
			while (searchIndex < search.length) if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
				if (template[templateIndex] === "*") {
					starIndex = templateIndex;
					matchIndex = searchIndex;
					templateIndex++;
				} else {
					searchIndex++;
					templateIndex++;
				}
			} else if (starIndex !== -1) {
				templateIndex = starIndex + 1;
				matchIndex++;
				searchIndex = matchIndex;
			} else return false;
			while (templateIndex < template.length && template[templateIndex] === "*") templateIndex++;
			return templateIndex === template.length;
		}
		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [...createDebug.names, ...createDebug.skips.map((namespace) => "-" + namespace)].join(",");
			createDebug.enable("");
			return namespaces;
		}
		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			for (const skip of createDebug.skips) if (matchesTemplate(name, skip)) return false;
			for (const ns of createDebug.names) if (matchesTemplate(name, ns)) return true;
			return false;
		}
		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) return val.stack || val.message;
			return val;
		}
		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
		}
		createDebug.enable(createDebug.load());
		return createDebug;
	}
	module.exports = setup;
}));
//#endregion
//#region node_modules/debug/src/browser.js
var require_browser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* This is the web browser implementation of `debug()`.
	*/
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();
	exports.destroy = (() => {
		let warned = false;
		return () => {
			if (!warned) {
				warned = true;
				console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
			}
		};
	})();
	/**
	* Colors.
	*/
	exports.colors = [
		"#0000CC",
		"#0000FF",
		"#0033CC",
		"#0033FF",
		"#0066CC",
		"#0066FF",
		"#0099CC",
		"#0099FF",
		"#00CC00",
		"#00CC33",
		"#00CC66",
		"#00CC99",
		"#00CCCC",
		"#00CCFF",
		"#3300CC",
		"#3300FF",
		"#3333CC",
		"#3333FF",
		"#3366CC",
		"#3366FF",
		"#3399CC",
		"#3399FF",
		"#33CC00",
		"#33CC33",
		"#33CC66",
		"#33CC99",
		"#33CCCC",
		"#33CCFF",
		"#6600CC",
		"#6600FF",
		"#6633CC",
		"#6633FF",
		"#66CC00",
		"#66CC33",
		"#9900CC",
		"#9900FF",
		"#9933CC",
		"#9933FF",
		"#99CC00",
		"#99CC33",
		"#CC0000",
		"#CC0033",
		"#CC0066",
		"#CC0099",
		"#CC00CC",
		"#CC00FF",
		"#CC3300",
		"#CC3333",
		"#CC3366",
		"#CC3399",
		"#CC33CC",
		"#CC33FF",
		"#CC6600",
		"#CC6633",
		"#CC9900",
		"#CC9933",
		"#CCCC00",
		"#CCCC33",
		"#FF0000",
		"#FF0033",
		"#FF0066",
		"#FF0099",
		"#FF00CC",
		"#FF00FF",
		"#FF3300",
		"#FF3333",
		"#FF3366",
		"#FF3399",
		"#FF33CC",
		"#FF33FF",
		"#FF6600",
		"#FF6633",
		"#FF9900",
		"#FF9933",
		"#FFCC00",
		"#FFCC33"
	];
	/**
	* Currently only WebKit-based Web Inspectors, Firefox >= v31,
	* and the Firebug extension (any Firefox version) are known
	* to support "%c" CSS customizations.
	*
	* TODO: add a `localStorage` variable to explicitly enable/disable colors
	*/
	function useColors() {
		if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) return true;
		if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
		let m;
		return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	}
	/**
	* Colorize log arguments if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
		if (!this.useColors) return;
		const c = "color: " + this.color;
		args.splice(1, 0, c, "color: inherit");
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, (match) => {
			if (match === "%%") return;
			index++;
			if (match === "%c") lastC = index;
		});
		args.splice(lastC, 0, c);
	}
	/**
	* Invokes `console.debug()` when available.
	* No-op when `console.debug` is not a "function".
	* If `console.debug` is not available, falls back
	* to `console.log`.
	*
	* @api public
	*/
	exports.log = console.debug || console.log || (() => {});
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		try {
			if (namespaces) exports.storage.setItem("debug", namespaces);
			else exports.storage.removeItem("debug");
		} catch (error) {}
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		let r;
		try {
			r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
		} catch (error) {}
		if (!r && typeof process !== "undefined" && "env" in process) r = process.env.DEBUG;
		return r;
	}
	/**
	* Localstorage attempts to return the localstorage.
	*
	* This is necessary because safari throws
	* when a user disables cookies/localstorage
	* and you attempt to access it.
	*
	* @return {LocalStorage}
	* @api private
	*/
	function localstorage() {
		try {
			return localStorage;
		} catch (error) {}
	}
	module.exports = require_common()(exports);
	var { formatters } = module.exports;
	/**
	* Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	*/
	formatters.j = function(v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return "[UnexpectedJSONParseError]: " + error.message;
		}
	};
}));
//#endregion
//#region node_modules/has-flag/index.js
var require_has_flag = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = (flag, argv = process.argv) => {
		const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf("--");
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
}));
//#endregion
//#region node_modules/supports-color/index.js
var require_supports_color = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var os$2 = __require("os");
	var tty$3 = __require("tty");
	var hasFlag = require_has_flag();
	var { env } = process;
	var forceColor;
	if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) forceColor = 0;
	else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) forceColor = 1;
	if ("FORCE_COLOR" in env) {
		if (env.FORCE_COLOR === "true") forceColor = 1;
		else if (env.FORCE_COLOR === "false") forceColor = 0;
		else forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
	function translateLevel(level) {
		if (level === 0) return false;
		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}
	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) return 0;
		if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) return 3;
		if (hasFlag("color=256")) return 2;
		if (haveStream && !streamIsTTY && forceColor === void 0) return 0;
		const min = forceColor || 0;
		if (env.TERM === "dumb") return min;
		if (process.platform === "win32") {
			const osRelease = os$2.release().split(".");
			if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) return Number(osRelease[2]) >= 14931 ? 3 : 2;
			return 1;
		}
		if ("CI" in env) {
			if ([
				"TRAVIS",
				"CIRCLECI",
				"APPVEYOR",
				"GITLAB_CI",
				"GITHUB_ACTIONS",
				"BUILDKITE"
			].some((sign) => sign in env) || env.CI_NAME === "codeship") return 1;
			return min;
		}
		if ("TEAMCITY_VERSION" in env) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		if (env.COLORTERM === "truecolor") return 3;
		if ("TERM_PROGRAM" in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
			switch (env.TERM_PROGRAM) {
				case "iTerm.app": return version >= 3 ? 3 : 2;
				case "Apple_Terminal": return 2;
			}
		}
		if (/-256(color)?$/i.test(env.TERM)) return 2;
		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) return 1;
		if ("COLORTERM" in env) return 1;
		return min;
	}
	function getSupportLevel(stream) {
		return translateLevel(supportsColor(stream, stream && stream.isTTY));
	}
	module.exports = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty$3.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty$3.isatty(2)))
	};
}));
//#endregion
//#region node_modules/debug/src/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Module dependencies.
	*/
	var tty$2 = __require("tty");
	var util = __require("util");
	/**
	* This is the Node.js implementation of `debug()`.
	*/
	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.destroy = util.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
	/**
	* Colors.
	*/
	exports.colors = [
		6,
		2,
		3,
		4,
		5,
		1
	];
	try {
		const supportsColor = require_supports_color();
		if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	} catch (error) {}
	/**
	* Build up the default `inspectOpts` object from the environment variables.
	*
	*   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	*/
	exports.inspectOpts = Object.keys(process.env).filter((key) => {
		return /^debug_/i.test(key);
	}).reduce((obj, key) => {
		const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});
		let val = process.env[key];
		if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
		else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
		else if (val === "null") val = null;
		else val = Number(val);
		obj[prop] = val;
		return obj;
	}, {});
	/**
	* Is stdout a TTY? Colored output is enabled when `true`.
	*/
	function useColors() {
		return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty$2.isatty(process.stderr.fd);
	}
	/**
	* Adds ANSI color escape codes if enabled.
	*
	* @api public
	*/
	function formatArgs(args) {
		const { namespace: name, useColors } = this;
		if (useColors) {
			const c = this.color;
			const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
			const prefix = `  ${colorCode};1m${name} \u001B[0m`;
			args[0] = prefix + args[0].split("\n").join("\n" + prefix);
			args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
		} else args[0] = getDate() + name + " " + args[0];
	}
	function getDate() {
		if (exports.inspectOpts.hideDate) return "";
		return (/* @__PURE__ */ new Date()).toISOString() + " ";
	}
	/**
	* Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
	*/
	function log(...args) {
		return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
	}
	/**
	* Save `namespaces`.
	*
	* @param {String} namespaces
	* @api private
	*/
	function save(namespaces) {
		if (namespaces) process.env.DEBUG = namespaces;
		else delete process.env.DEBUG;
	}
	/**
	* Load `namespaces`.
	*
	* @return {String} returns the previously persisted debug modes
	* @api private
	*/
	function load() {
		return process.env.DEBUG;
	}
	/**
	* Init logic for `debug` instances.
	*
	* Create a new `inspectOpts` object in case `useColors` is set
	* differently for a particular `debug` instance.
	*/
	function init(debug) {
		debug.inspectOpts = {};
		const keys = Object.keys(exports.inspectOpts);
		for (let i = 0; i < keys.length; i++) debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
	module.exports = require_common()(exports);
	var { formatters } = module.exports;
	/**
	* Map %o to `util.inspect()`, all on a single line.
	*/
	formatters.o = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
	};
	/**
	* Map %O to `util.inspect()`, allowing multiple lines if needed.
	*/
	formatters.O = function(v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts);
	};
}));
//#endregion
//#region node_modules/debug/src/index.js
var require_src$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Detect Electron renderer / nwjs process, which is node, but we should
	* treat as a browser.
	*/
	if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) module.exports = require_browser();
	else module.exports = require_node();
}));
//#endregion
//#region node_modules/@kwsites/file-exists/dist/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	var fs_1 = __require("fs");
	var log = __importDefault(require_src$1()).default("@kwsites/file-exists");
	function check(path, isFile, isDirectory) {
		log(`checking %s`, path);
		try {
			const stat = fs_1.statSync(path);
			if (stat.isFile() && isFile) {
				log(`[OK] path represents a file`);
				return true;
			}
			if (stat.isDirectory() && isDirectory) {
				log(`[OK] path represents a directory`);
				return true;
			}
			log(`[FAIL] path represents something other than a file or directory`);
			return false;
		} catch (e) {
			if (e.code === "ENOENT") {
				log(`[FAIL] path is not accessible: %o`, e);
				return false;
			}
			log(`[FATAL] %o`, e);
			throw e;
		}
	}
	/**
	* Synchronous validation of a path existing either as a file or as a directory.
	*
	* @param {string} path The path to check
	* @param {number} type One or both of the exported numeric constants
	*/
	function exists(path, type = exports.READABLE) {
		return check(path, (type & exports.FILE) > 0, (type & exports.FOLDER) > 0);
	}
	exports.exists = exists;
	/**
	* Constant representing a file
	*/
	exports.FILE = 1;
	/**
	* Constant representing a folder
	*/
	exports.FOLDER = 2;
	/**
	* Constant representing either a file or a folder
	*/
	exports.READABLE = exports.FILE + exports.FOLDER;
}));
//#endregion
//#region node_modules/@simple-git/args-pathspec/dist/index.mjs
var import_dist = (/* @__PURE__ */ __commonJSMin(((exports) => {
	function __export(m) {
		for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(require_src());
})))();
var t = /* @__PURE__ */ new WeakMap();
function c$2(...n) {
	const e = new String(n);
	return t.set(e, n), e;
}
function r(n) {
	return n instanceof String && t.has(n);
}
function o$1(n) {
	return t.get(n) ?? [];
}
//#endregion
//#region node_modules/@kwsites/promise-deferred/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createDeferred = exports.deferred = void 0;
	/**
	* Creates a new `DeferredPromise`
	*
	* ```typescript
	import {deferred} from '@kwsites/promise-deferred`;
	```
	*/
	function deferred() {
		let done;
		let fail;
		let status = "pending";
		return {
			promise: new Promise((_done, _fail) => {
				done = _done;
				fail = _fail;
			}),
			done(result) {
				if (status === "pending") {
					status = "resolved";
					done(result);
				}
			},
			fail(error) {
				if (status === "pending") {
					status = "rejected";
					fail(error);
				}
			},
			get fulfilled() {
				return status !== "pending";
			},
			get status() {
				return status;
			}
		};
	}
	exports.deferred = deferred;
	/**
	* Alias of the exported `deferred` function, to help consumers wanting to use `deferred` as the
	* local variable name rather than the factory import name, without needing to rename on import.
	*
	* ```typescript
	import {createDeferred} from '@kwsites/promise-deferred`;
	```
	*/
	exports.createDeferred = deferred;
}));
//#endregion
//#region node_modules/@simple-git/argv-parser/dist/index.mjs
var import_src = /* @__PURE__ */ __toESM(require_src$1());
var import_dist$1 = require_dist();
function* U(e, t) {
	const n = t === "global";
	for (const o of e) o.isGlobal === n && (yield o);
}
var k = /* @__PURE__ */ new Set([
	"--add",
	"--edit",
	"--remove-section",
	"--rename-section",
	"--replace-all",
	"--unset",
	"--unset-all",
	"-e"
]);
var S = /* @__PURE__ */ new Set([
	"--get",
	"--get-all",
	"--get-color",
	"--get-colorbool",
	"--get-regexp",
	"--get-urlmatch",
	"--list",
	"-l"
]);
var P = /* @__PURE__ */ new Set([
	"edit",
	"remove-section",
	"rename-section",
	"set",
	"unset"
]);
var E = /* @__PURE__ */ new Set([
	"get",
	"get-color",
	"get-colorbool",
	"list"
]);
function F(e, t) {
	for (const { name: o } of U(e, "task")) {
		if (k.has(o)) return p(!0, t);
		if (S.has(o)) return p(!1, t);
	}
	const n = t.at(0)?.toLowerCase();
	return n === void 0 ? null : P.has(n) ? p(!0, t.slice(1)) : E.has(n) ? p(!1, t.slice(1)) : t.length === 1 ? p(!1, t) : p(!0, t);
}
function p(e = !1, t = []) {
	const n = t.at(0)?.toLowerCase();
	return n === void 0 ? null : {
		isWrite: e,
		isRead: !e,
		key: n,
		value: t.at(1)
	};
}
function A(e, t) {
	return t.isWrite && t.value !== void 0 ? {
		key: t.key,
		value: t.value,
		scope: e
	} : {
		key: t.key,
		scope: e
	};
}
function M(e) {
	const t = e?.indexOf("=") || -1;
	return !e || t < 0 ? null : {
		key: e.slice(0, t).trim().toLowerCase(),
		value: e.slice(t + 1)
	};
}
function N(e) {
	for (const { name: t } of U(e, "task")) switch (t) {
		case "--global": return "global";
		case "--system": return "system";
		case "--worktree": return "worktree";
		case "--local": return "local";
		case "--file":
		case "-f": return "file";
	}
	return "local";
}
function G({ name: e }) {
	if (e === "-c" || e === "--config") return "inline";
	if (e === "--config-env") return "env";
}
function* O(e) {
	for (const t of e) {
		const n = G(t), o = n && M(t.value);
		o && (yield {
			...o,
			scope: n
		});
	}
}
function L(e, t, n) {
	const o = {
		read: [],
		write: [...O(t)]
	};
	return e === "config" && $$1(o, N(t), F(t, n)), o;
}
function $$1(e, t, n) {
	if (n === null) return;
	const o = A(t, n);
	n.isWrite ? e.write.push(o) : e.read.push(o);
}
var x = { short: /* @__PURE__ */ new Map([["c", !0]]) };
var D = {
	short: new Map([
		["C", !0],
		["P", !1],
		["h", !1],
		["p", !1],
		["v", !1],
		...x.short.entries()
	]),
	long: /* @__PURE__ */ new Set([
		"attr-source",
		"config-env",
		"exec-path",
		"git-dir",
		"list-cmds",
		"namespace",
		"super-prefix",
		"work-tree"
	])
};
var R = {
	clone: {
		short: /* @__PURE__ */ new Map([
			["b", !0],
			["j", !0],
			["l", !1],
			["n", !1],
			["o", !0],
			["q", !1],
			["s", !1],
			["u", !0]
		]),
		long: /* @__PURE__ */ new Set([
			"branch",
			"config",
			"jobs",
			"origin",
			"upload-pack",
			"u",
			"template"
		])
	},
	commit: {
		short: /* @__PURE__ */ new Map([
			["C", !0],
			["F", !0],
			["c", !0],
			["m", !0],
			["t", !0]
		]),
		long: /* @__PURE__ */ new Set([
			"file",
			"message",
			"reedit-message",
			"reuse-message",
			"template"
		])
	},
	config: {
		short: /* @__PURE__ */ new Map([
			["e", !1],
			["f", !0],
			["l", !1]
		]),
		long: /* @__PURE__ */ new Set([
			"blob",
			"comment",
			"default",
			"file",
			"type",
			"value"
		])
	},
	fetch: {
		short: /* @__PURE__ */ new Map(),
		long: /* @__PURE__ */ new Set(["upload-pack"])
	},
	init: {
		short: /* @__PURE__ */ new Map(),
		long: /* @__PURE__ */ new Set(["template"])
	},
	pull: {
		short: /* @__PURE__ */ new Map(),
		long: /* @__PURE__ */ new Set(["upload-pack"])
	},
	push: {
		short: /* @__PURE__ */ new Map(),
		long: /* @__PURE__ */ new Set(["exec", "receive-pack"])
	}
};
var T = {
	short: /* @__PURE__ */ new Map(),
	long: /* @__PURE__ */ new Set()
};
function I(e) {
	const t = R[e ?? ""] ?? T;
	return {
		short: new Map([...x.short.entries(), ...t.short.entries()]),
		long: t.long
	};
}
function b(e, t = D) {
	if (e.startsWith("--")) {
		const n = e.indexOf("=");
		if (n > 2) return [{
			name: e.slice(0, n),
			value: e.slice(n + 1),
			needsNext: !1
		}];
		const o = e.slice(2);
		return [{
			name: e,
			needsNext: t.long.has(o)
		}];
	}
	if (e.length === 2) {
		const n = e.charAt(1);
		return [{
			name: e,
			needsNext: t.short.get(n) === !0
		}];
	}
	return W(e, t.short);
}
function W(e, t) {
	const n = e.slice(1).split(""), o = [];
	for (let s = 0; s < n.length; s++) {
		const r = n[s], l = t.get(r);
		if (l === void 0) return [{
			name: e,
			needsNext: !1
		}];
		if (l) {
			const a = n.slice(s + 1).join("");
			if (a && ![...a].every((w) => t.has(w))) return o.push({
				name: `-${r}`,
				value: a,
				needsNext: !1
			}), o;
		}
		o.push({
			name: `-${r}`,
			needsNext: l
		});
	}
	return o;
}
function j(e, t = []) {
	let n = 0;
	for (; n < e.length;) {
		const o = String(e[n]);
		if (!o.startsWith("-") || o.length < 2) break;
		const s = b(o);
		let r = n + 1;
		for (const l of s) {
			const a = {
				name: l.name,
				value: l.value,
				absorbedNext: !1,
				isGlobal: !0
			};
			l.needsNext && a.value === void 0 && r < e.length && (a.value = String(e[r]), a.absorbedNext = !0, r++), t.push(a);
		}
		n = r;
	}
	return {
		flags: t,
		taskIndex: n
	};
}
function B(e, t, n = []) {
	const o = I(t), s = [], r$1 = [];
	let l = 0;
	for (; l < e.length;) {
		const a = e[l];
		if (r(a)) {
			r$1.push(...o$1(a)), l++;
			continue;
		}
		const f = String(a);
		if (f === "--") {
			for (let g = l + 1; g < e.length; g++) {
				const u = e[g];
				r(u) ? r$1.push(...o$1(u)) : r$1.push(String(u));
			}
			break;
		}
		if (!f.startsWith("-") || f.length < 2) {
			s.push(f), l++;
			continue;
		}
		const w = b(f, o);
		let d = l + 1;
		for (const g of w) {
			const u = {
				name: g.name,
				value: g.value,
				absorbedNext: !1,
				isGlobal: !1
			};
			g.needsNext && u.value === void 0 && d < e.length && !r(e[d]) && (u.value = String(e[d]), u.absorbedNext = !0, d++), n.push(u);
		}
		l = d;
	}
	return {
		flags: n,
		positionals: s,
		pathspecs: r$1
	};
}
function* V({ write: e }) {
	for (const t of e) for (const n of q) {
		const o = n(t.key);
		o && (yield o);
	}
}
function c$1(e, t, n = String(e)) {
	const o = typeof e == "string" ? new RegExp(`\\s*${e.toLowerCase()}`) : e;
	return function(r) {
		if (o.test(r)) return {
			category: t,
			message: `Configuring ${n} is not permitted without enabling ${t}`
		};
	};
}
function i$1(e, t) {
	return c$1(new RegExp(`\\s*${e.toLowerCase().replace(/\./g, "(..+)?.")}`), t, e);
}
var q = [
	c$1("alias", "allowUnsafeAlias"),
	c$1("core.askPass", "allowUnsafeAskPass"),
	c$1("core.editor", "allowUnsafeEditor"),
	c$1("core.fsmonitor", "allowUnsafeFsMonitor"),
	c$1("core.gitProxy", "allowUnsafeGitProxy"),
	c$1("core.hooksPath", "allowUnsafeHooksPath"),
	c$1("core.pager", "allowUnsafePager"),
	c$1("core.sshCommand", "allowUnsafeSshCommand"),
	i$1("credential.helper", "allowUnsafeCredentialHelper"),
	i$1("diff.command", "allowUnsafeDiffExternal"),
	c$1("diff.external", "allowUnsafeDiffExternal"),
	i$1("diff.textconv", "allowUnsafeDiffTextConv"),
	i$1("filter.clean", "allowUnsafeFilter"),
	i$1("filter.smudge", "allowUnsafeFilter"),
	i$1("gpg.program", "allowUnsafeGpgProgram"),
	c$1("init.templateDir", "allowUnsafeTemplateDir"),
	i$1("merge.driver", "allowUnsafeMergeDriver"),
	i$1("mergetool.path", "allowUnsafeMergeDriver"),
	i$1("mergetool.cmd", "allowUnsafeMergeDriver"),
	i$1("protocol.allow", "allowUnsafeProtocolOverride"),
	i$1("remote.receivepack", "allowUnsafePack"),
	i$1("remote.uploadpack", "allowUnsafePack"),
	c$1("sequence.editor", "allowUnsafeEditor")
];
function* K(e, t) {
	for (const n of t) for (const o of H) {
		const s = o(e, n.name);
		s && (yield s);
	}
}
function h$1(e, t, n, o = String(t)) {
	const s = typeof t == "string" ? new RegExp(`\\s*${t.toLowerCase()}`) : t, r = `Use of ${e ? `${e} with option ` : ""}${o} is not permitted without enabling ${n}`;
	return function(a, f) {
		if ((!e || a === e) && s.test(f)) return {
			category: n,
			message: r
		};
	};
}
var H = [
	h$1(null, /--(upload|receive)-pack/, "allowUnsafePack", "--upload-pack or --receive-pack"),
	h$1("clone", /^-\w*u/, "allowUnsafePack"),
	h$1("clone", "--u", "allowUnsafePack"),
	h$1("push", "--exec", "allowUnsafePack"),
	h$1(null, "--template", "allowUnsafeTemplateDir")
];
function C(e, t, n) {
	return [...K(e, t), ...V(n)];
}
function Y(...e) {
	const { flags: t, taskIndex: n } = j(e), o = n < e.length ? String(e[n]).toLowerCase() : null, { positionals: r, pathspecs: l } = B(o !== null ? e.slice(n + 1) : [], o, t), a = L(o, t, r);
	return {
		task: o,
		flags: t.map(J),
		paths: l,
		config: a,
		vulnerabilities: z(C(o, t, a))
	};
}
function z(e) {
	return Object.defineProperty(e, "vulnerabilities", { value: e });
}
function J({ value: e, name: t }) {
	return e !== void 0 ? {
		name: t,
		value: e
	} : { name: t };
}
var y = {
	editor: "allowUnsafeEditor",
	git_askpass: "allowUnsafeAskPass",
	git_config_global: "allowUnsafeConfigPaths",
	git_config_system: "allowUnsafeConfigPaths",
	git_config_count: "allowUnsafeConfigEnvCount",
	git_config: "allowUnsafeConfigPaths",
	git_editor: "allowUnsafeEditor",
	git_exec_path: "allowUnsafeConfigPaths",
	git_external_diff: "allowUnsafeDiffExternal",
	git_pager: "allowUnsafePager",
	git_proxy_command: "allowUnsafeGitProxy",
	git_template_dir: "allowUnsafeTemplateDir",
	git_sequence_editor: "allowUnsafeEditor",
	git_ssh: "allowUnsafeSshCommand",
	git_ssh_command: "allowUnsafeSshCommand",
	pager: "allowUnsafePager",
	prefix: "allowUnsafeConfigPaths",
	ssh_askpass: "allowUnsafeAskPass"
};
function* Q(e) {
	const t = parseInt(e.git_config_count ?? "0", 10);
	for (let n = 0; n < t; n++) {
		const o = e[`git_config_key_${n}`], s = e[`git_config_value_${n}`];
		o !== void 0 && (yield {
			key: o.toLowerCase().trim(),
			value: s,
			scope: "env"
		});
	}
}
function* X(e) {
	for (const t of Object.keys(e)) if (_(t)) {
		const n = y[t];
		yield {
			category: n,
			message: `Use of "${t.toUpperCase()}" is not permitted without enabling ${n}`
		};
	}
}
function _(e) {
	return Object.hasOwn(y, e);
}
function Z(e) {
	const t = {};
	for (const [n, o] of Object.entries(e)) {
		const s = n.toLowerCase().trim();
		(_(s) || s.startsWith("git")) && (t[s] = String(o));
	}
	return t;
}
function ee(e) {
	const t = Z(e), n = {
		read: [],
		write: [...Q(t)]
	};
	return {
		config: n,
		vulnerabilities: [...X(t), ...C(null, [], n)]
	};
}
function ne(e, t) {
	return [...Y(...e).vulnerabilities, ...ee(t).vulnerabilities];
}
//#endregion
//#region node_modules/simple-git/dist/esm/index.js
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var GitError;
var init_git_error = __esm({ "src/lib/errors/git-error.ts"() {
	"use strict";
	GitError = class extends Error {
		constructor(task, message) {
			super(message);
			this.task = task;
			Object.setPrototypeOf(this, new.target.prototype);
		}
	};
} });
var GitResponseError;
var init_git_response_error = __esm({ "src/lib/errors/git-response-error.ts"() {
	"use strict";
	init_git_error();
	GitResponseError = class extends GitError {
		constructor(git, message) {
			super(void 0, message || String(git));
			this.git = git;
		}
	};
} });
var TaskConfigurationError;
var init_task_configuration_error = __esm({ "src/lib/errors/task-configuration-error.ts"() {
	"use strict";
	init_git_error();
	TaskConfigurationError = class extends GitError {
		constructor(message) {
			super(void 0, message);
		}
	};
} });
function asFunction(source) {
	if (typeof source !== "function") return NOOP;
	return source;
}
function isUserFunction(source) {
	return typeof source === "function" && source !== NOOP;
}
function splitOn(input, char) {
	const index = input.indexOf(char);
	if (index <= 0) return [input, ""];
	return [input.substr(0, index), input.substr(index + 1)];
}
function first(input, offset = 0) {
	return isArrayLike(input) && input.length > offset ? input[offset] : void 0;
}
function last(input, offset = 0) {
	if (isArrayLike(input) && input.length > offset) return input[input.length - 1 - offset];
}
function isArrayLike(input) {
	return filterHasLength(input);
}
function toLinesWithContent(input = "", trimmed2 = true, separator = "\n") {
	return input.split(separator).reduce((output, line) => {
		const lineContent = trimmed2 ? line.trim() : line;
		if (lineContent) output.push(lineContent);
		return output;
	}, []);
}
function forEachLineWithContent(input, callback) {
	return toLinesWithContent(input, true).map((line) => callback(line));
}
function folderExists(path) {
	return (0, import_dist.exists)(path, import_dist.FOLDER);
}
function append(target, item) {
	if (Array.isArray(target)) {
		if (!target.includes(item)) target.push(item);
	} else target.add(item);
	return item;
}
function including(target, item) {
	if (Array.isArray(target) && !target.includes(item)) target.push(item);
	return target;
}
function remove(target, item) {
	if (Array.isArray(target)) {
		const index = target.indexOf(item);
		if (index >= 0) target.splice(index, 1);
	} else target.delete(item);
	return item;
}
function asArray(source) {
	return Array.isArray(source) ? source : [source];
}
function asCamelCase(str) {
	return str.replace(/[\s-]+(.)/g, (_all, chr) => {
		return chr.toUpperCase();
	});
}
function asStringArray(source) {
	return asArray(source).map((item) => {
		return item instanceof String ? item : String(item);
	});
}
function asNumber(source, onNaN = 0) {
	if (source == null) return onNaN;
	const num = parseInt(source, 10);
	return Number.isNaN(num) ? onNaN : num;
}
function prefixedArray(input, prefix) {
	const output = [];
	for (let i = 0, max = input.length; i < max; i++) output.push(prefix, input[i]);
	return output;
}
function bufferToString(input) {
	return (Array.isArray(input) ? Buffer.concat(input) : input).toString("utf-8");
}
function pick(source, properties) {
	const out = {};
	properties.forEach((key) => {
		if (source[key] !== void 0) out[key] = source[key];
	});
	return out;
}
function delay(duration = 0) {
	return new Promise((done) => setTimeout(done, duration));
}
function orVoid(input) {
	if (input === false) return;
	return input;
}
var NULL;
var NOOP;
var objectToString$2;
var init_util = __esm({ "src/lib/utils/util.ts"() {
	"use strict";
	init_argument_filters();
	NULL = "\0";
	NOOP = () => {};
	objectToString$2 = Object.prototype.toString.call.bind(Object.prototype.toString);
} });
function filterType(input, filter, def) {
	if (filter(input)) return input;
	return arguments.length > 2 ? def : void 0;
}
function filterPrimitives(input, omit) {
	const type = r(input) ? "string" : typeof input;
	return /number|string|boolean/.test(type) && (!omit || !omit.includes(type));
}
function filterPlainObject(input) {
	return !!input && objectToString$2(input) === "[object Object]";
}
function filterFunction(input) {
	return typeof input === "function";
}
var filterArray;
var filterNumber;
var filterString;
var filterStringOrStringArray;
var filterHasLength;
var init_argument_filters = __esm({ "src/lib/utils/argument-filters.ts"() {
	"use strict";
	init_util();
	filterArray = (input) => {
		return Array.isArray(input);
	};
	filterNumber = (input) => {
		return typeof input === "number";
	};
	filterString = (input) => {
		return typeof input === "string" || r(input);
	};
	filterStringOrStringArray = (input) => {
		return filterString(input) || Array.isArray(input) && input.every(filterString);
	};
	filterHasLength = (input) => {
		if (input == null || "number|boolean|function".includes(typeof input)) return false;
		return typeof input.length === "number";
	};
} });
var ExitCodes;
var init_exit_codes = __esm({ "src/lib/utils/exit-codes.ts"() {
	"use strict";
	ExitCodes = /* @__PURE__ */ ((ExitCodes2) => {
		ExitCodes2[ExitCodes2["SUCCESS"] = 0] = "SUCCESS";
		ExitCodes2[ExitCodes2["ERROR"] = 1] = "ERROR";
		ExitCodes2[ExitCodes2["NOT_FOUND"] = -2] = "NOT_FOUND";
		ExitCodes2[ExitCodes2["UNCLEAN"] = 128] = "UNCLEAN";
		return ExitCodes2;
	})(ExitCodes || {});
} });
var GitOutputStreams;
var init_git_output_streams = __esm({ "src/lib/utils/git-output-streams.ts"() {
	"use strict";
	GitOutputStreams = class _GitOutputStreams {
		constructor(stdOut, stdErr) {
			this.stdOut = stdOut;
			this.stdErr = stdErr;
		}
		asStrings() {
			return new _GitOutputStreams(this.stdOut.toString("utf8"), this.stdErr.toString("utf8"));
		}
	};
} });
function useMatchesDefault() {
	throw new Error(`LineParser:useMatches not implemented`);
}
var LineParser;
var RemoteLineParser;
var init_line_parser = __esm({ "src/lib/utils/line-parser.ts"() {
	"use strict";
	LineParser = class {
		constructor(regExp, useMatches) {
			this.matches = [];
			this.useMatches = useMatchesDefault;
			this.parse = (line, target) => {
				this.resetMatches();
				if (!this._regExp.every((reg, index) => this.addMatch(reg, index, line(index)))) return false;
				return this.useMatches(target, this.prepareMatches()) !== false;
			};
			this._regExp = Array.isArray(regExp) ? regExp : [regExp];
			if (useMatches) this.useMatches = useMatches;
		}
		resetMatches() {
			this.matches.length = 0;
		}
		prepareMatches() {
			return this.matches;
		}
		addMatch(reg, index, line) {
			const matched = line && reg.exec(line);
			if (matched) this.pushMatch(index, matched);
			return !!matched;
		}
		pushMatch(_index, matched) {
			this.matches.push(...matched.slice(1));
		}
	};
	RemoteLineParser = class extends LineParser {
		addMatch(reg, index, line) {
			return /^remote:\s/.test(String(line)) && super.addMatch(reg, index, line);
		}
		pushMatch(index, matched) {
			if (index > 0 || matched.length > 1) super.pushMatch(index, matched);
		}
	};
} });
function createInstanceConfig(...options) {
	const baseDir = process.cwd();
	const config = Object.assign({
		baseDir,
		...defaultOptions
	}, ...options.filter((o) => typeof o === "object" && o));
	config.baseDir = config.baseDir || baseDir;
	config.trimmed = config.trimmed === true;
	return config;
}
var defaultOptions;
var init_simple_git_options = __esm({ "src/lib/utils/simple-git-options.ts"() {
	"use strict";
	defaultOptions = {
		binary: "git",
		maxConcurrentProcesses: 5,
		config: [],
		trimmed: false
	};
} });
function appendTaskOptions(options, commands = []) {
	if (!filterPlainObject(options)) return commands;
	return Object.keys(options).reduce((commands2, key) => {
		const value = options[key];
		if (r(value)) commands2.push(value);
		else if (filterPrimitives(value, ["boolean"])) commands2.push(key + "=" + value);
		else if (Array.isArray(value)) {
			for (const v of value) if (!filterPrimitives(v, ["string", "number"])) commands2.push(key + "=" + v);
		} else commands2.push(key);
		return commands2;
	}, commands);
}
function getTrailingOptions(args, initialPrimitive = 0, objectOnly = false) {
	const command = [];
	for (let i = 0, max = initialPrimitive < 0 ? args.length : initialPrimitive; i < max; i++) if ("string|number".includes(typeof args[i])) command.push(String(args[i]));
	appendTaskOptions(trailingOptionsArgument(args), command);
	if (!objectOnly) command.push(...trailingArrayArgument(args));
	return command;
}
function trailingArrayArgument(args) {
	return asStringArray(filterType(last(args, typeof last(args) === "function" ? 1 : 0), filterArray, []));
}
function trailingOptionsArgument(args) {
	return filterType(last(args, filterFunction(last(args)) ? 1 : 0), filterPlainObject);
}
function trailingFunctionArgument(args, includeNoop = true) {
	const callback = asFunction(last(args));
	return includeNoop || isUserFunction(callback) ? callback : void 0;
}
var init_task_options = __esm({ "src/lib/utils/task-options.ts"() {
	"use strict";
	init_argument_filters();
	init_util();
} });
function callTaskParser(parser4, streams) {
	return parser4(streams.stdOut, streams.stdErr);
}
function parseStringResponse(result, parsers12, texts, trim = true) {
	asArray(texts).forEach((text) => {
		for (let lines = toLinesWithContent(text, trim), i = 0, max = lines.length; i < max; i++) {
			const line = (offset = 0) => {
				if (i + offset >= max) return;
				return lines[i + offset];
			};
			parsers12.some(({ parse }) => parse(line, result));
		}
	});
	return result;
}
var init_task_parser = __esm({ "src/lib/utils/task-parser.ts"() {
	"use strict";
	init_util();
} });
var utils_exports = {};
__export(utils_exports, {
	ExitCodes: () => ExitCodes,
	GitOutputStreams: () => GitOutputStreams,
	LineParser: () => LineParser,
	NOOP: () => NOOP,
	NULL: () => NULL,
	RemoteLineParser: () => RemoteLineParser,
	append: () => append,
	appendTaskOptions: () => appendTaskOptions,
	asArray: () => asArray,
	asCamelCase: () => asCamelCase,
	asFunction: () => asFunction,
	asNumber: () => asNumber,
	asStringArray: () => asStringArray,
	bufferToString: () => bufferToString,
	callTaskParser: () => callTaskParser,
	createInstanceConfig: () => createInstanceConfig,
	delay: () => delay,
	filterArray: () => filterArray,
	filterFunction: () => filterFunction,
	filterHasLength: () => filterHasLength,
	filterNumber: () => filterNumber,
	filterPlainObject: () => filterPlainObject,
	filterPrimitives: () => filterPrimitives,
	filterString: () => filterString,
	filterStringOrStringArray: () => filterStringOrStringArray,
	filterType: () => filterType,
	first: () => first,
	folderExists: () => folderExists,
	forEachLineWithContent: () => forEachLineWithContent,
	getTrailingOptions: () => getTrailingOptions,
	including: () => including,
	isUserFunction: () => isUserFunction,
	last: () => last,
	objectToString: () => objectToString$2,
	orVoid: () => orVoid,
	parseStringResponse: () => parseStringResponse,
	pick: () => pick,
	prefixedArray: () => prefixedArray,
	remove: () => remove,
	splitOn: () => splitOn,
	toLinesWithContent: () => toLinesWithContent,
	trailingFunctionArgument: () => trailingFunctionArgument,
	trailingOptionsArgument: () => trailingOptionsArgument
});
var init_utils = __esm({ "src/lib/utils/index.ts"() {
	"use strict";
	init_argument_filters();
	init_exit_codes();
	init_git_output_streams();
	init_line_parser();
	init_simple_git_options();
	init_task_options();
	init_task_parser();
	init_util();
} });
var check_is_repo_exports = {};
__export(check_is_repo_exports, {
	CheckRepoActions: () => CheckRepoActions,
	checkIsBareRepoTask: () => checkIsBareRepoTask,
	checkIsRepoRootTask: () => checkIsRepoRootTask,
	checkIsRepoTask: () => checkIsRepoTask
});
function checkIsRepoTask(action) {
	switch (action) {
		case "bare": return checkIsBareRepoTask();
		case "root": return checkIsRepoRootTask();
	}
	return {
		commands: ["rev-parse", "--is-inside-work-tree"],
		format: "utf-8",
		onError,
		parser
	};
}
function checkIsRepoRootTask() {
	return {
		commands: ["rev-parse", "--git-dir"],
		format: "utf-8",
		onError,
		parser(path) {
			return /^\.(git)?$/.test(path.trim());
		}
	};
}
function checkIsBareRepoTask() {
	return {
		commands: ["rev-parse", "--is-bare-repository"],
		format: "utf-8",
		onError,
		parser
	};
}
function isNotRepoMessage(error) {
	return /(Not a git repository|Kein Git-Repository)/i.test(String(error));
}
var CheckRepoActions;
var onError;
var parser;
var init_check_is_repo = __esm({ "src/lib/tasks/check-is-repo.ts"() {
	"use strict";
	init_utils();
	CheckRepoActions = /* @__PURE__ */ ((CheckRepoActions2) => {
		CheckRepoActions2["BARE"] = "bare";
		CheckRepoActions2["IN_TREE"] = "tree";
		CheckRepoActions2["IS_REPO_ROOT"] = "root";
		return CheckRepoActions2;
	})(CheckRepoActions || {});
	onError = ({ exitCode }, error, done, fail) => {
		if (exitCode === 128 && isNotRepoMessage(error)) return done(Buffer.from("false"));
		fail(error);
	};
	parser = (text) => {
		return text.trim() === "true";
	};
} });
function cleanSummaryParser(dryRun, text) {
	const summary = new CleanResponse(dryRun);
	const regexp = dryRun ? dryRunRemovalRegexp : removalRegexp;
	toLinesWithContent(text).forEach((line) => {
		const removed = line.replace(regexp, "");
		summary.paths.push(removed);
		(isFolderRegexp.test(removed) ? summary.folders : summary.files).push(removed);
	});
	return summary;
}
var CleanResponse;
var removalRegexp;
var dryRunRemovalRegexp;
var isFolderRegexp;
var init_CleanSummary = __esm({ "src/lib/responses/CleanSummary.ts"() {
	"use strict";
	init_utils();
	CleanResponse = class {
		constructor(dryRun) {
			this.dryRun = dryRun;
			this.paths = [];
			this.files = [];
			this.folders = [];
		}
	};
	removalRegexp = /^[a-z]+\s*/i;
	dryRunRemovalRegexp = /^[a-z]+\s+[a-z]+\s*/i;
	isFolderRegexp = /\/$/;
} });
var task_exports = {};
__export(task_exports, {
	EMPTY_COMMANDS: () => EMPTY_COMMANDS,
	adhocExecTask: () => adhocExecTask,
	configurationErrorTask: () => configurationErrorTask,
	isBufferTask: () => isBufferTask,
	isEmptyTask: () => isEmptyTask,
	straightThroughBufferTask: () => straightThroughBufferTask,
	straightThroughStringTask: () => straightThroughStringTask
});
function adhocExecTask(parser4) {
	return {
		commands: EMPTY_COMMANDS,
		format: "empty",
		parser: parser4
	};
}
function configurationErrorTask(error) {
	return {
		commands: EMPTY_COMMANDS,
		format: "empty",
		parser() {
			throw typeof error === "string" ? new TaskConfigurationError(error) : error;
		}
	};
}
function straightThroughStringTask(commands, trimmed2 = false) {
	return {
		commands,
		format: "utf-8",
		parser(text) {
			return trimmed2 ? String(text).trim() : text;
		}
	};
}
function straightThroughBufferTask(commands) {
	return {
		commands,
		format: "buffer",
		parser(buffer) {
			return buffer;
		}
	};
}
function isBufferTask(task) {
	return task.format === "buffer";
}
function isEmptyTask(task) {
	return task.format === "empty" || !task.commands.length;
}
var EMPTY_COMMANDS;
var init_task = __esm({ "src/lib/tasks/task.ts"() {
	"use strict";
	init_task_configuration_error();
	EMPTY_COMMANDS = [];
} });
var clean_exports = {};
__export(clean_exports, {
	CONFIG_ERROR_INTERACTIVE_MODE: () => CONFIG_ERROR_INTERACTIVE_MODE,
	CONFIG_ERROR_MODE_REQUIRED: () => CONFIG_ERROR_MODE_REQUIRED,
	CONFIG_ERROR_UNKNOWN_OPTION: () => CONFIG_ERROR_UNKNOWN_OPTION,
	CleanOptions: () => CleanOptions,
	cleanTask: () => cleanTask,
	cleanWithOptionsTask: () => cleanWithOptionsTask,
	isCleanOptionsArray: () => isCleanOptionsArray
});
function cleanWithOptionsTask(mode, customArgs) {
	const { cleanMode, options, valid } = getCleanOptions(mode);
	if (!cleanMode) return configurationErrorTask(CONFIG_ERROR_MODE_REQUIRED);
	if (!valid.options) return configurationErrorTask(CONFIG_ERROR_UNKNOWN_OPTION + JSON.stringify(mode));
	options.push(...customArgs);
	if (options.some(isInteractiveMode)) return configurationErrorTask(CONFIG_ERROR_INTERACTIVE_MODE);
	return cleanTask(cleanMode, options);
}
function cleanTask(mode, customArgs) {
	return {
		commands: [
			"clean",
			`-${mode}`,
			...customArgs
		],
		format: "utf-8",
		parser(text) {
			return cleanSummaryParser(mode === "n", text);
		}
	};
}
function isCleanOptionsArray(input) {
	return Array.isArray(input) && input.every((test) => CleanOptionValues.has(test));
}
function getCleanOptions(input) {
	let cleanMode;
	let options = [];
	let valid = {
		cleanMode: false,
		options: true
	};
	input.replace(/[^a-z]i/g, "").split("").forEach((char) => {
		if (isCleanMode(char)) {
			cleanMode = char;
			valid.cleanMode = true;
		} else valid.options = valid.options && isKnownOption(options[options.length] = `-${char}`);
	});
	return {
		cleanMode,
		options,
		valid
	};
}
function isCleanMode(cleanMode) {
	return cleanMode === "f" || cleanMode === "n";
}
function isKnownOption(option) {
	return /^-[a-z]$/i.test(option) && CleanOptionValues.has(option.charAt(1));
}
function isInteractiveMode(option) {
	if (/^-[^\-]/.test(option)) return option.indexOf("i") > 0;
	return option === "--interactive";
}
var CONFIG_ERROR_INTERACTIVE_MODE;
var CONFIG_ERROR_MODE_REQUIRED;
var CONFIG_ERROR_UNKNOWN_OPTION;
var CleanOptions;
var CleanOptionValues;
var init_clean = __esm({ "src/lib/tasks/clean.ts"() {
	"use strict";
	init_CleanSummary();
	init_utils();
	init_task();
	CONFIG_ERROR_INTERACTIVE_MODE = "Git clean interactive mode is not supported";
	CONFIG_ERROR_MODE_REQUIRED = "Git clean mode parameter (\"n\" or \"f\") is required";
	CONFIG_ERROR_UNKNOWN_OPTION = "Git clean unknown option found in: ";
	CleanOptions = /* @__PURE__ */ ((CleanOptions2) => {
		CleanOptions2["DRY_RUN"] = "n";
		CleanOptions2["FORCE"] = "f";
		CleanOptions2["IGNORED_INCLUDED"] = "x";
		CleanOptions2["IGNORED_ONLY"] = "X";
		CleanOptions2["EXCLUDING"] = "e";
		CleanOptions2["QUIET"] = "q";
		CleanOptions2["RECURSIVE"] = "d";
		return CleanOptions2;
	})(CleanOptions || {});
	CleanOptionValues = /* @__PURE__ */ new Set(["i", ...asStringArray(Object.values(CleanOptions))]);
} });
function configListParser(text) {
	const config = new ConfigList();
	for (const item of configParser(text)) config.addValue(item.file, String(item.key), item.value);
	return config;
}
function configGetParser(text, key) {
	let value = null;
	const values = [];
	const scopes = /* @__PURE__ */ new Map();
	for (const item of configParser(text, key)) {
		if (item.key !== key) continue;
		values.push(value = item.value);
		if (!scopes.has(item.file)) scopes.set(item.file, []);
		scopes.get(item.file).push(value);
	}
	return {
		key,
		paths: Array.from(scopes.keys()),
		scopes,
		value,
		values
	};
}
function configFilePath(filePath) {
	return filePath.replace(/^(file):/, "");
}
function* configParser(text, requestedKey = null) {
	const lines = text.split("\0");
	for (let i = 0, max = lines.length - 1; i < max;) {
		const file = configFilePath(lines[i++]);
		let value = lines[i++];
		let key = requestedKey;
		if (value.includes("\n")) {
			const line = splitOn(value, "\n");
			key = line[0];
			value = line[1];
		}
		yield {
			file,
			key,
			value
		};
	}
}
var ConfigList;
var init_ConfigList = __esm({ "src/lib/responses/ConfigList.ts"() {
	"use strict";
	init_utils();
	ConfigList = class {
		constructor() {
			this.files = [];
			this.values = /* @__PURE__ */ Object.create(null);
		}
		get all() {
			if (!this._all) this._all = this.files.reduce((all, file) => {
				return Object.assign(all, this.values[file]);
			}, {});
			return this._all;
		}
		addFile(file) {
			if (!(file in this.values)) {
				const latest = last(this.files);
				this.values[file] = latest ? Object.create(this.values[latest]) : {};
				this.files.push(file);
			}
			return this.values[file];
		}
		addValue(file, key, value) {
			const values = this.addFile(file);
			if (!Object.hasOwn(values, key)) values[key] = value;
			else if (Array.isArray(values[key])) values[key].push(value);
			else values[key] = [values[key], value];
			this._all = void 0;
		}
	};
} });
function asConfigScope(scope, fallback) {
	if (typeof scope === "string" && Object.hasOwn(GitConfigScope, scope)) return scope;
	return fallback;
}
function addConfigTask(key, value, append2, scope) {
	const commands = ["config", `--${scope}`];
	if (append2) commands.push("--add");
	commands.push(key, value);
	return {
		commands,
		format: "utf-8",
		parser(text) {
			return text;
		}
	};
}
function getConfigTask(key, scope) {
	const commands = [
		"config",
		"--null",
		"--show-origin",
		"--get-all",
		key
	];
	if (scope) commands.splice(1, 0, `--${scope}`);
	return {
		commands,
		format: "utf-8",
		parser(text) {
			return configGetParser(text, key);
		}
	};
}
function listConfigTask(scope) {
	const commands = [
		"config",
		"--list",
		"--show-origin",
		"--null"
	];
	if (scope) commands.push(`--${scope}`);
	return {
		commands,
		format: "utf-8",
		parser(text) {
			return configListParser(text);
		}
	};
}
function config_default() {
	return {
		addConfig(key, value, ...rest) {
			return this._runTask(addConfigTask(key, value, rest[0] === true, asConfigScope(rest[1], "local")), trailingFunctionArgument(arguments));
		},
		getConfig(key, scope) {
			return this._runTask(getConfigTask(key, asConfigScope(scope, void 0)), trailingFunctionArgument(arguments));
		},
		listConfig(...rest) {
			return this._runTask(listConfigTask(asConfigScope(rest[0], void 0)), trailingFunctionArgument(arguments));
		}
	};
}
var GitConfigScope;
var init_config = __esm({ "src/lib/tasks/config.ts"() {
	"use strict";
	init_ConfigList();
	init_utils();
	GitConfigScope = /* @__PURE__ */ ((GitConfigScope2) => {
		GitConfigScope2["system"] = "system";
		GitConfigScope2["global"] = "global";
		GitConfigScope2["local"] = "local";
		GitConfigScope2["worktree"] = "worktree";
		return GitConfigScope2;
	})(GitConfigScope || {});
} });
function isDiffNameStatus(input) {
	return diffNameStatus.has(input);
}
var DiffNameStatus;
var diffNameStatus;
var init_diff_name_status = __esm({ "src/lib/tasks/diff-name-status.ts"() {
	"use strict";
	DiffNameStatus = /* @__PURE__ */ ((DiffNameStatus2) => {
		DiffNameStatus2["ADDED"] = "A";
		DiffNameStatus2["COPIED"] = "C";
		DiffNameStatus2["DELETED"] = "D";
		DiffNameStatus2["MODIFIED"] = "M";
		DiffNameStatus2["RENAMED"] = "R";
		DiffNameStatus2["CHANGED"] = "T";
		DiffNameStatus2["UNMERGED"] = "U";
		DiffNameStatus2["UNKNOWN"] = "X";
		DiffNameStatus2["BROKEN"] = "B";
		return DiffNameStatus2;
	})(DiffNameStatus || {});
	diffNameStatus = new Set(Object.values(DiffNameStatus));
} });
function grepQueryBuilder(...params) {
	return new GrepQuery().param(...params);
}
function parseGrep(grep) {
	const paths = /* @__PURE__ */ new Set();
	const results = {};
	forEachLineWithContent(grep, (input) => {
		const [path, line, preview] = input.split(NULL);
		paths.add(path);
		(results[path] = results[path] || []).push({
			line: asNumber(line),
			path,
			preview
		});
	});
	return {
		paths,
		results
	};
}
function grep_default() {
	return { grep(searchTerm) {
		const then = trailingFunctionArgument(arguments);
		const options = getTrailingOptions(arguments);
		for (const option of disallowedOptions) if (options.includes(option)) return this._runTask(configurationErrorTask(`git.grep: use of "${option}" is not supported.`), then);
		if (typeof searchTerm === "string") searchTerm = grepQueryBuilder().param(searchTerm);
		const commands = [
			"grep",
			"--null",
			"-n",
			"--full-name",
			...options,
			...searchTerm
		];
		return this._runTask({
			commands,
			format: "utf-8",
			parser(stdOut) {
				return parseGrep(stdOut);
			}
		}, then);
	} };
}
var disallowedOptions;
var Query;
var _a;
var GrepQuery;
var init_grep = __esm({ "src/lib/tasks/grep.ts"() {
	"use strict";
	init_utils();
	init_task();
	disallowedOptions = ["-h"];
	Query = Symbol("grepQuery");
	GrepQuery = class {
		constructor() {
			this[_a] = [];
		}
		*[(_a = Query, Symbol.iterator)]() {
			for (const query of this[Query]) yield query;
		}
		and(...and) {
			and.length && this[Query].push("--and", "(", ...prefixedArray(and, "-e"), ")");
			return this;
		}
		param(...param) {
			this[Query].push(...prefixedArray(param, "-e"));
			return this;
		}
	};
} });
var reset_exports = {};
__export(reset_exports, {
	ResetMode: () => ResetMode,
	getResetMode: () => getResetMode,
	resetTask: () => resetTask
});
function resetTask(mode, customArgs) {
	const commands = ["reset"];
	if (isValidResetMode(mode)) commands.push(`--${mode}`);
	commands.push(...customArgs);
	return straightThroughStringTask(commands);
}
function getResetMode(mode) {
	if (isValidResetMode(mode)) return mode;
	switch (typeof mode) {
		case "string":
		case "undefined": return "soft";
	}
}
function isValidResetMode(mode) {
	return typeof mode === "string" && validResetModes.includes(mode);
}
var ResetMode;
var validResetModes;
var init_reset = __esm({ "src/lib/tasks/reset.ts"() {
	"use strict";
	init_utils();
	init_task();
	ResetMode = /* @__PURE__ */ ((ResetMode2) => {
		ResetMode2["MIXED"] = "mixed";
		ResetMode2["SOFT"] = "soft";
		ResetMode2["HARD"] = "hard";
		ResetMode2["MERGE"] = "merge";
		ResetMode2["KEEP"] = "keep";
		return ResetMode2;
	})(ResetMode || {});
	validResetModes = asStringArray(Object.values(ResetMode));
} });
function createLog() {
	return (0, import_src.default)("simple-git");
}
function prefixedLogger(to, prefix, forward) {
	if (!prefix || !String(prefix).replace(/\s*/, "")) return !forward ? to : (message, ...args) => {
		to(message, ...args);
		forward(message, ...args);
	};
	return (message, ...args) => {
		to(`%s ${message}`, prefix, ...args);
		if (forward) forward(message, ...args);
	};
}
function childLoggerName(name, childDebugger, { namespace: parentNamespace }) {
	if (typeof name === "string") return name;
	const childNamespace = childDebugger && childDebugger.namespace || "";
	if (childNamespace.startsWith(parentNamespace)) return childNamespace.substr(parentNamespace.length + 1);
	return childNamespace || parentNamespace;
}
function createLogger(label, verbose, initialStep, infoDebugger = createLog()) {
	const labelPrefix = label && `[${label}]` || "";
	const spawned = [];
	const debugDebugger = typeof verbose === "string" ? infoDebugger.extend(verbose) : verbose;
	const key = childLoggerName(filterType(verbose, filterString), debugDebugger, infoDebugger);
	return step(initialStep);
	function sibling(name, initial) {
		return append(spawned, createLogger(label, key.replace(/^[^:]+/, name), initial, infoDebugger));
	}
	function step(phase) {
		const stepPrefix = phase && `[${phase}]` || "";
		const debug2 = debugDebugger && prefixedLogger(debugDebugger, stepPrefix) || NOOP;
		const info = prefixedLogger(infoDebugger, `${labelPrefix} ${stepPrefix}`, debug2);
		return Object.assign(debugDebugger ? debug2 : info, {
			label,
			sibling,
			info,
			step
		});
	}
}
var init_git_logger = __esm({ "src/lib/git-logger.ts"() {
	"use strict";
	init_utils();
	import_src.default.formatters.L = (value) => String(filterHasLength(value) ? value.length : "-");
	import_src.default.formatters.B = (value) => {
		if (Buffer.isBuffer(value)) return value.toString("utf8");
		return objectToString$2(value);
	};
} });
var TasksPendingQueue;
var init_tasks_pending_queue = __esm({ "src/lib/runners/tasks-pending-queue.ts"() {
	"use strict";
	init_git_error();
	init_git_logger();
	TasksPendingQueue = class _TasksPendingQueue {
		constructor(logLabel = "GitExecutor") {
			this.logLabel = logLabel;
			this._queue = /* @__PURE__ */ new Map();
		}
		withProgress(task) {
			return this._queue.get(task);
		}
		createProgress(task) {
			const name = _TasksPendingQueue.getName(task.commands[0]);
			return {
				task,
				logger: createLogger(this.logLabel, name),
				name
			};
		}
		push(task) {
			const progress = this.createProgress(task);
			progress.logger("Adding task to the queue, commands = %o", task.commands);
			this._queue.set(task, progress);
			return progress;
		}
		fatal(err) {
			for (const [task, { logger }] of Array.from(this._queue.entries())) {
				if (task === err.task) {
					logger.info(`Failed %o`, err);
					logger(`Fatal exception, any as-yet un-started tasks run through this executor will not be attempted`);
				} else logger.info(`A fatal exception occurred in a previous task, the queue has been purged: %o`, err.message);
				this.complete(task);
			}
			if (this._queue.size !== 0) throw new Error(`Queue size should be zero after fatal: ${this._queue.size}`);
		}
		complete(task) {
			if (this.withProgress(task)) this._queue.delete(task);
		}
		attempt(task) {
			const progress = this.withProgress(task);
			if (!progress) throw new GitError(void 0, "TasksPendingQueue: attempt called for an unknown task");
			progress.logger("Starting task");
			return progress;
		}
		static getName(name = "empty") {
			return `task:${name}:${++_TasksPendingQueue.counter}`;
		}
		static {
			this.counter = 0;
		}
	};
} });
function pluginContext(task, commands) {
	return {
		method: first(task.commands) || "",
		commands
	};
}
function onErrorReceived(target, logger) {
	return (err) => {
		logger(`[ERROR] child process exception %o`, err);
		target.push(Buffer.from(String(err.stack), "ascii"));
	};
}
function onDataReceived(target, name, logger, output) {
	return (buffer) => {
		logger(`%s received %L bytes`, name, buffer);
		output(`%B`, buffer);
		target.push(buffer);
	};
}
var GitExecutorChain;
var init_git_executor_chain = __esm({ "src/lib/runners/git-executor-chain.ts"() {
	"use strict";
	init_git_error();
	init_task();
	init_utils();
	init_tasks_pending_queue();
	GitExecutorChain = class {
		constructor(_executor, _scheduler, _plugins) {
			this._executor = _executor;
			this._scheduler = _scheduler;
			this._plugins = _plugins;
			this._chain = Promise.resolve();
			this._queue = new TasksPendingQueue();
		}
		get cwd() {
			return this._cwd || this._executor.cwd;
		}
		set cwd(cwd) {
			this._cwd = cwd;
		}
		get env() {
			return this._executor.env;
		}
		get outputHandler() {
			return this._executor.outputHandler;
		}
		chain() {
			return this;
		}
		push(task) {
			this._queue.push(task);
			return this._chain = this._chain.then(() => this.attemptTask(task));
		}
		async attemptTask(task) {
			const onScheduleComplete = await this._scheduler.next();
			const onQueueComplete = () => this._queue.complete(task);
			try {
				const { logger } = this._queue.attempt(task);
				return await (isEmptyTask(task) ? this.attemptEmptyTask(task, logger) : this.attemptRemoteTask(task, logger));
			} catch (e) {
				throw this.onFatalException(task, e);
			} finally {
				onQueueComplete();
				onScheduleComplete();
			}
		}
		onFatalException(task, e) {
			const gitError = e instanceof GitError ? Object.assign(e, { task }) : new GitError(task, e && String(e));
			this._chain = Promise.resolve();
			this._queue.fatal(gitError);
			return gitError;
		}
		async attemptRemoteTask(task, logger) {
			const binary = this._plugins.exec("spawn.binary", "", pluginContext(task, task.commands));
			const args = this._plugins.exec("spawn.args", [...task.commands], {
				...pluginContext(task, task.commands),
				env: { ...this.env }
			});
			const raw = await this.gitResponse(task, binary, args, this.outputHandler, logger.step("SPAWN"));
			const outputStreams = await this.handleTaskData(task, args, raw, logger.step("HANDLE"));
			logger(`passing response to task's parser as a %s`, task.format);
			if (isBufferTask(task)) return callTaskParser(task.parser, outputStreams);
			return callTaskParser(task.parser, outputStreams.asStrings());
		}
		async attemptEmptyTask(task, logger) {
			logger(`empty task bypassing child process to call to task's parser`);
			return task.parser(this);
		}
		handleTaskData(task, args, result, logger) {
			const { exitCode, rejection, stdOut, stdErr } = result;
			return new Promise((done, fail) => {
				logger(`Preparing to handle process response exitCode=%d stdOut=`, exitCode);
				const { error } = this._plugins.exec("task.error", { error: rejection }, {
					...pluginContext(task, args),
					...result
				});
				if (error && task.onError) {
					logger.info(`exitCode=%s handling with custom error handler`);
					return task.onError(result, error, (newStdOut) => {
						logger.info(`custom error handler treated as success`);
						logger(`custom error returned a %s`, objectToString$2(newStdOut));
						done(new GitOutputStreams(Array.isArray(newStdOut) ? Buffer.concat(newStdOut) : newStdOut, Buffer.concat(stdErr)));
					}, fail);
				}
				if (error) {
					logger.info(`handling as error: exitCode=%s stdErr=%s rejection=%o`, exitCode, stdErr.length, rejection);
					return fail(error);
				}
				logger.info(`retrieving task output complete`);
				done(new GitOutputStreams(Buffer.concat(stdOut), Buffer.concat(stdErr)));
			});
		}
		async gitResponse(task, command, args, outputHandler, logger) {
			const outputLogger = logger.sibling("output");
			const spawnOptions = this._plugins.exec("spawn.options", {
				cwd: this.cwd,
				env: this.env,
				windowsHide: true
			}, pluginContext(task, task.commands));
			return new Promise((done) => {
				const stdOut = [];
				const stdErr = [];
				logger.info(`%s %o`, command, args);
				logger("%O", spawnOptions);
				let rejection = this._beforeSpawn(task, args);
				if (rejection) return done({
					stdOut,
					stdErr,
					exitCode: 9901,
					rejection
				});
				this._plugins.exec("spawn.before", void 0, {
					...pluginContext(task, args),
					kill(reason) {
						rejection = reason || rejection;
					}
				});
				const spawned = spawn(command, args, spawnOptions);
				spawned.stdout.on("data", onDataReceived(stdOut, "stdOut", logger, outputLogger.step("stdOut")));
				spawned.stderr.on("data", onDataReceived(stdErr, "stdErr", logger, outputLogger.step("stdErr")));
				spawned.on("error", onErrorReceived(stdErr, logger));
				if (outputHandler) {
					logger(`Passing child process stdOut/stdErr to custom outputHandler`);
					outputHandler(command, spawned.stdout, spawned.stderr, [...args]);
				}
				this._plugins.exec("spawn.after", void 0, {
					...pluginContext(task, args),
					spawned,
					close(exitCode, reason) {
						done({
							stdOut,
							stdErr,
							exitCode,
							rejection: rejection || reason
						});
					},
					kill(reason) {
						if (spawned.killed) return;
						rejection = reason;
						spawned.kill("SIGINT");
					}
				});
			});
		}
		_beforeSpawn(task, args) {
			let rejection;
			this._plugins.exec("spawn.before", void 0, {
				...pluginContext(task, args),
				kill(reason) {
					rejection = reason || rejection;
				}
			});
			return rejection;
		}
	};
} });
var git_executor_exports = {};
__export(git_executor_exports, { GitExecutor: () => GitExecutor });
var GitExecutor;
var init_git_executor = __esm({ "src/lib/runners/git-executor.ts"() {
	"use strict";
	init_git_executor_chain();
	GitExecutor = class {
		constructor(cwd, _scheduler, _plugins) {
			this.cwd = cwd;
			this._scheduler = _scheduler;
			this._plugins = _plugins;
			this._chain = new GitExecutorChain(this, this._scheduler, this._plugins);
		}
		chain() {
			return new GitExecutorChain(this, this._scheduler, this._plugins);
		}
		push(task) {
			return this._chain.push(task);
		}
	};
} });
function taskCallback(task, response, callback = NOOP) {
	const onSuccess = (data) => {
		callback(null, data);
	};
	const onError2 = (err) => {
		if (err?.task === task) callback(err instanceof GitResponseError ? addDeprecationNoticeToError(err) : err, void 0);
	};
	response.then(onSuccess, onError2);
}
function addDeprecationNoticeToError(err) {
	let log = (name) => {
		console.warn(`simple-git deprecation notice: accessing GitResponseError.${name} should be GitResponseError.git.${name}, this will no longer be available in version 3`);
		log = NOOP;
	};
	return Object.create(err, Object.getOwnPropertyNames(err.git).reduce(descriptorReducer, {}));
	function descriptorReducer(all, name) {
		if (name in err) return all;
		all[name] = {
			enumerable: false,
			configurable: false,
			get() {
				log(name);
				return err.git[name];
			}
		};
		return all;
	}
}
var init_task_callback = __esm({ "src/lib/task-callback.ts"() {
	"use strict";
	init_git_response_error();
	init_utils();
} });
function changeWorkingDirectoryTask(directory, root) {
	return adhocExecTask((instance) => {
		if (!folderExists(directory)) throw new Error(`Git.cwd: cannot change to non-directory "${directory}"`);
		return (root || instance).cwd = directory;
	});
}
var init_change_working_directory = __esm({ "src/lib/tasks/change-working-directory.ts"() {
	"use strict";
	init_utils();
	init_task();
} });
function checkoutTask(args) {
	const commands = ["checkout", ...args];
	if (commands[1] === "-b" && commands.includes("-B")) commands[1] = remove(commands, "-B");
	return straightThroughStringTask(commands);
}
function checkout_default() {
	return {
		checkout() {
			return this._runTask(checkoutTask(getTrailingOptions(arguments, 1)), trailingFunctionArgument(arguments));
		},
		checkoutBranch(branchName, startPoint) {
			return this._runTask(checkoutTask([
				"-b",
				branchName,
				startPoint,
				...getTrailingOptions(arguments)
			]), trailingFunctionArgument(arguments));
		},
		checkoutLocalBranch(branchName) {
			return this._runTask(checkoutTask([
				"-b",
				branchName,
				...getTrailingOptions(arguments)
			]), trailingFunctionArgument(arguments));
		}
	};
}
var init_checkout = __esm({ "src/lib/tasks/checkout.ts"() {
	"use strict";
	init_utils();
	init_task();
} });
function countObjectsResponse() {
	return {
		count: 0,
		garbage: 0,
		inPack: 0,
		packs: 0,
		prunePackable: 0,
		size: 0,
		sizeGarbage: 0,
		sizePack: 0
	};
}
function count_objects_default() {
	return { countObjects() {
		return this._runTask({
			commands: ["count-objects", "--verbose"],
			format: "utf-8",
			parser(stdOut) {
				return parseStringResponse(countObjectsResponse(), [parser2], stdOut);
			}
		});
	} };
}
var parser2;
var init_count_objects = __esm({ "src/lib/tasks/count-objects.ts"() {
	"use strict";
	init_utils();
	parser2 = new LineParser(/([a-z-]+): (\d+)$/, (result, [key, value]) => {
		const property = asCamelCase(key);
		if (Object.hasOwn(result, property)) result[property] = asNumber(value);
	});
} });
function parseCommitResult(stdOut) {
	return parseStringResponse({
		author: null,
		branch: "",
		commit: "",
		root: false,
		summary: {
			changes: 0,
			insertions: 0,
			deletions: 0
		}
	}, parsers, stdOut);
}
var parsers;
var init_parse_commit = __esm({ "src/lib/parsers/parse-commit.ts"() {
	"use strict";
	init_utils();
	parsers = [
		new LineParser(/^\[([^\s]+)( \([^)]+\))? ([^\]]+)/, (result, [branch, root, commit]) => {
			result.branch = branch;
			result.commit = commit;
			result.root = !!root;
		}),
		new LineParser(/\s*Author:\s(.+)/i, (result, [author]) => {
			const parts = author.split("<");
			const email = parts.pop();
			if (!email || !email.includes("@")) return;
			result.author = {
				email: email.substr(0, email.length - 1),
				name: parts.join("<").trim()
			};
		}),
		new LineParser(/(\d+)[^,]*(?:,\s*(\d+)[^,]*)(?:,\s*(\d+))/g, (result, [changes, insertions, deletions]) => {
			result.summary.changes = parseInt(changes, 10) || 0;
			result.summary.insertions = parseInt(insertions, 10) || 0;
			result.summary.deletions = parseInt(deletions, 10) || 0;
		}),
		new LineParser(/^(\d+)[^,]*(?:,\s*(\d+)[^(]+\(([+-]))?/, (result, [changes, lines, direction]) => {
			result.summary.changes = parseInt(changes, 10) || 0;
			const count = parseInt(lines, 10) || 0;
			if (direction === "-") result.summary.deletions = count;
			else if (direction === "+") result.summary.insertions = count;
		})
	];
} });
function commitTask(message, files, customArgs) {
	return {
		commands: [
			"-c",
			"core.abbrev=40",
			"commit",
			...prefixedArray(message, "-m"),
			...files,
			...customArgs
		],
		format: "utf-8",
		parser: parseCommitResult
	};
}
function commit_default() {
	return { commit(message, ...rest) {
		const next = trailingFunctionArgument(arguments);
		const task = rejectDeprecatedSignatures(message) || commitTask(asArray(message), asArray(filterType(rest[0], filterStringOrStringArray, [])), [...asStringArray(filterType(rest[1], filterArray, [])), ...getTrailingOptions(arguments, 0, true)]);
		return this._runTask(task, next);
	} };
	function rejectDeprecatedSignatures(message) {
		return !filterStringOrStringArray(message) && configurationErrorTask(`git.commit: requires the commit message to be supplied as a string/string[]`);
	}
}
var init_commit = __esm({ "src/lib/tasks/commit.ts"() {
	"use strict";
	init_parse_commit();
	init_utils();
	init_task();
} });
function first_commit_default() {
	return { firstCommit() {
		return this._runTask(straightThroughStringTask([
			"rev-list",
			"--max-parents=0",
			"HEAD"
		], true), trailingFunctionArgument(arguments));
	} };
}
var init_first_commit = __esm({ "src/lib/tasks/first-commit.ts"() {
	"use strict";
	init_utils();
	init_task();
} });
function hashObjectTask(filePath, write) {
	const commands = ["hash-object", filePath];
	if (write) commands.push("-w");
	return straightThroughStringTask(commands, true);
}
var init_hash_object = __esm({ "src/lib/tasks/hash-object.ts"() {
	"use strict";
	init_task();
} });
function parseInit(bare, path, text) {
	const response = String(text).trim();
	let result;
	if (result = initResponseRegex.exec(response)) return new InitSummary(bare, path, false, result[1]);
	if (result = reInitResponseRegex.exec(response)) return new InitSummary(bare, path, true, result[1]);
	let gitDir = "";
	const tokens = response.split(" ");
	while (tokens.length) if (tokens.shift() === "in") {
		gitDir = tokens.join(" ");
		break;
	}
	return new InitSummary(bare, path, /^re/i.test(response), gitDir);
}
var InitSummary;
var initResponseRegex;
var reInitResponseRegex;
var init_InitSummary = __esm({ "src/lib/responses/InitSummary.ts"() {
	"use strict";
	InitSummary = class {
		constructor(bare, path, existing, gitDir) {
			this.bare = bare;
			this.path = path;
			this.existing = existing;
			this.gitDir = gitDir;
		}
	};
	initResponseRegex = /^Init.+ repository in (.+)$/;
	reInitResponseRegex = /^Rein.+ in (.+)$/;
} });
function hasBareCommand(command) {
	return command.includes(bareCommand);
}
function initTask(bare = false, path, customArgs) {
	const commands = ["init", ...customArgs];
	if (bare && !hasBareCommand(commands)) commands.splice(1, 0, bareCommand);
	return {
		commands,
		format: "utf-8",
		parser(text) {
			return parseInit(commands.includes("--bare"), path, text);
		}
	};
}
var bareCommand;
var init_init = __esm({ "src/lib/tasks/init.ts"() {
	"use strict";
	init_InitSummary();
	bareCommand = "--bare";
} });
function logFormatFromCommand(customArgs) {
	for (let i = 0; i < customArgs.length; i++) {
		const format = logFormatRegex.exec(customArgs[i]);
		if (format) return `--${format[1]}`;
	}
	return "";
}
function isLogFormat(customArg) {
	return logFormatRegex.test(customArg);
}
var logFormatRegex;
var init_log_format = __esm({ "src/lib/args/log-format.ts"() {
	"use strict";
	logFormatRegex = /^--(stat|numstat|name-only|name-status)(=|$)/;
} });
var DiffSummary;
var init_DiffSummary = __esm({ "src/lib/responses/DiffSummary.ts"() {
	"use strict";
	DiffSummary = class {
		constructor() {
			this.changed = 0;
			this.deletions = 0;
			this.insertions = 0;
			this.files = [];
		}
	};
} });
function getDiffParser(format = "") {
	const parser4 = diffSummaryParsers[format];
	return (stdOut) => parseStringResponse(new DiffSummary(), parser4, stdOut, false);
}
var statParser;
var numStatParser;
var nameOnlyParser;
var nameStatusParser;
var diffSummaryParsers;
var init_parse_diff_summary = __esm({ "src/lib/parsers/parse-diff-summary.ts"() {
	"use strict";
	init_log_format();
	init_DiffSummary();
	init_diff_name_status();
	init_utils();
	statParser = [
		new LineParser(/^(.+)\s+\|\s+(\d+)(\s+[+\-]+)?$/, (result, [file, changes, alterations = ""]) => {
			result.files.push({
				file: file.trim(),
				changes: asNumber(changes),
				insertions: alterations.replace(/[^+]/g, "").length,
				deletions: alterations.replace(/[^-]/g, "").length,
				binary: false
			});
		}),
		new LineParser(/^(.+) \|\s+Bin ([0-9.]+) -> ([0-9.]+) ([a-z]+)/, (result, [file, before, after]) => {
			result.files.push({
				file: file.trim(),
				before: asNumber(before),
				after: asNumber(after),
				binary: true
			});
		}),
		new LineParser(/(\d+) files? changed\s*((?:, \d+ [^,]+){0,2})/, (result, [changed, summary]) => {
			const inserted = /(\d+) i/.exec(summary);
			const deleted = /(\d+) d/.exec(summary);
			result.changed = asNumber(changed);
			result.insertions = asNumber(inserted?.[1]);
			result.deletions = asNumber(deleted?.[1]);
		})
	];
	numStatParser = [new LineParser(/(\d+)\t(\d+)\t(.+)$/, (result, [changesInsert, changesDelete, file]) => {
		const insertions = asNumber(changesInsert);
		const deletions = asNumber(changesDelete);
		result.changed++;
		result.insertions += insertions;
		result.deletions += deletions;
		result.files.push({
			file,
			changes: insertions + deletions,
			insertions,
			deletions,
			binary: false
		});
	}), new LineParser(/-\t-\t(.+)$/, (result, [file]) => {
		result.changed++;
		result.files.push({
			file,
			after: 0,
			before: 0,
			binary: true
		});
	})];
	nameOnlyParser = [new LineParser(/(.+)$/, (result, [file]) => {
		result.changed++;
		result.files.push({
			file,
			changes: 0,
			insertions: 0,
			deletions: 0,
			binary: false
		});
	})];
	nameStatusParser = [new LineParser(/([ACDMRTUXB])([0-9]{0,3})\t(.[^\t]*)(\t(.[^\t]*))?$/, (result, [status, similarity, from, _to, to]) => {
		result.changed++;
		result.files.push({
			file: to ?? from,
			changes: 0,
			insertions: 0,
			deletions: 0,
			binary: false,
			status: orVoid(isDiffNameStatus(status) && status),
			from: orVoid(!!to && from !== to && from),
			similarity: asNumber(similarity)
		});
	})];
	diffSummaryParsers = {
		[""]: statParser,
		["--stat"]: statParser,
		["--numstat"]: numStatParser,
		["--name-status"]: nameStatusParser,
		["--name-only"]: nameOnlyParser
	};
} });
function lineBuilder(tokens, fields) {
	return fields.reduce((line, field, index) => {
		line[field] = tokens[index] || "";
		return line;
	}, /* @__PURE__ */ Object.create({ diff: null }));
}
function createListLogSummaryParser(splitter = SPLITTER, fields = defaultFieldNames, logFormat = "") {
	const parseDiffResult = getDiffParser(logFormat);
	return function(stdOut) {
		const all = toLinesWithContent(stdOut.trim(), false, START_BOUNDARY).map(function(item) {
			const lineDetail = item.split(COMMIT_BOUNDARY);
			const listLogLine = lineBuilder(lineDetail[0].split(splitter), fields);
			if (lineDetail.length > 1 && !!lineDetail[1].trim()) listLogLine.diff = parseDiffResult(lineDetail[1]);
			return listLogLine;
		});
		return {
			all,
			latest: all.length && all[0] || null,
			total: all.length
		};
	};
}
var START_BOUNDARY;
var COMMIT_BOUNDARY;
var SPLITTER;
var defaultFieldNames;
var init_parse_list_log_summary = __esm({ "src/lib/parsers/parse-list-log-summary.ts"() {
	"use strict";
	init_utils();
	init_parse_diff_summary();
	init_log_format();
	START_BOUNDARY = "òòòòòò ";
	COMMIT_BOUNDARY = " òò";
	SPLITTER = " ò ";
	defaultFieldNames = [
		"hash",
		"date",
		"message",
		"refs",
		"author_name",
		"author_email"
	];
} });
var diff_exports = {};
__export(diff_exports, {
	diffSummaryTask: () => diffSummaryTask,
	validateLogFormatConfig: () => validateLogFormatConfig
});
function diffSummaryTask(customArgs) {
	let logFormat = logFormatFromCommand(customArgs);
	const commands = ["diff"];
	if (logFormat === "") {
		logFormat = "--stat";
		commands.push("--stat=4096");
	}
	commands.push(...customArgs);
	return validateLogFormatConfig(commands) || {
		commands,
		format: "utf-8",
		parser: getDiffParser(logFormat)
	};
}
function validateLogFormatConfig(customArgs) {
	const flags = customArgs.filter(isLogFormat);
	if (flags.length > 1) return configurationErrorTask(`Summary flags are mutually exclusive - pick one of ${flags.join(",")}`);
	if (flags.length && customArgs.includes("-z")) return configurationErrorTask(`Summary flag ${flags} parsing is not compatible with null termination option '-z'`);
}
var init_diff = __esm({ "src/lib/tasks/diff.ts"() {
	"use strict";
	init_log_format();
	init_parse_diff_summary();
	init_task();
} });
function prettyFormat(format, splitter) {
	const fields = [];
	const formatStr = [];
	Object.keys(format).forEach((field) => {
		fields.push(field);
		formatStr.push(String(format[field]));
	});
	return [fields, formatStr.join(splitter)];
}
function userOptions(input) {
	return Object.keys(input).reduce((out, key) => {
		if (!(key in excludeOptions)) out[key] = input[key];
		return out;
	}, {});
}
function parseLogOptions(opt = {}, customArgs = []) {
	const splitter = filterType(opt.splitter, filterString, SPLITTER);
	const [fields, formatStr] = prettyFormat(filterPlainObject(opt.format) ? opt.format : {
		hash: "%H",
		date: opt.strictDate === false ? "%ai" : "%aI",
		message: "%s",
		refs: "%D",
		body: opt.multiLine ? "%B" : "%b",
		author_name: opt.mailMap !== false ? "%aN" : "%an",
		author_email: opt.mailMap !== false ? "%aE" : "%ae"
	}, splitter);
	const suffix = [];
	const command = [`--pretty=format:${START_BOUNDARY}${formatStr}${COMMIT_BOUNDARY}`, ...customArgs];
	const maxCount = opt.n || opt["max-count"] || opt.maxCount;
	if (maxCount) command.push(`--max-count=${maxCount}`);
	if (opt.from || opt.to) {
		const rangeOperator = opt.symmetric !== false ? "..." : "..";
		suffix.push(`${opt.from || ""}${rangeOperator}${opt.to || ""}`);
	}
	if (filterString(opt.file)) command.push("--follow", c$2(opt.file));
	appendTaskOptions(userOptions(opt), command);
	return {
		fields,
		splitter,
		commands: [...command, ...suffix]
	};
}
function logTask(splitter, fields, customArgs) {
	const parser4 = createListLogSummaryParser(splitter, fields, logFormatFromCommand(customArgs));
	return {
		commands: ["log", ...customArgs],
		format: "utf-8",
		parser: parser4
	};
}
function log_default() {
	return { log(...rest) {
		const next = trailingFunctionArgument(arguments);
		const options = parseLogOptions(trailingOptionsArgument(arguments), asStringArray(filterType(arguments[0], filterArray, [])));
		const task = rejectDeprecatedSignatures(...rest) || validateLogFormatConfig(options.commands) || createLogTask(options);
		return this._runTask(task, next);
	} };
	function createLogTask(options) {
		return logTask(options.splitter, options.fields, options.commands);
	}
	function rejectDeprecatedSignatures(from, to) {
		return filterString(from) && filterString(to) && configurationErrorTask(`git.log(string, string) should be replaced with git.log({ from: string, to: string })`);
	}
}
var excludeOptions;
var init_log = __esm({ "src/lib/tasks/log.ts"() {
	"use strict";
	init_log_format();
	init_parse_list_log_summary();
	init_utils();
	init_task();
	init_diff();
	excludeOptions = /* @__PURE__ */ ((excludeOptions2) => {
		excludeOptions2[excludeOptions2["--pretty"] = 0] = "--pretty";
		excludeOptions2[excludeOptions2["max-count"] = 1] = "max-count";
		excludeOptions2[excludeOptions2["maxCount"] = 2] = "maxCount";
		excludeOptions2[excludeOptions2["n"] = 3] = "n";
		excludeOptions2[excludeOptions2["file"] = 4] = "file";
		excludeOptions2[excludeOptions2["format"] = 5] = "format";
		excludeOptions2[excludeOptions2["from"] = 6] = "from";
		excludeOptions2[excludeOptions2["to"] = 7] = "to";
		excludeOptions2[excludeOptions2["splitter"] = 8] = "splitter";
		excludeOptions2[excludeOptions2["symmetric"] = 9] = "symmetric";
		excludeOptions2[excludeOptions2["mailMap"] = 10] = "mailMap";
		excludeOptions2[excludeOptions2["multiLine"] = 11] = "multiLine";
		excludeOptions2[excludeOptions2["strictDate"] = 12] = "strictDate";
		return excludeOptions2;
	})(excludeOptions || {});
} });
var MergeSummaryConflict;
var MergeSummaryDetail;
var init_MergeSummary = __esm({ "src/lib/responses/MergeSummary.ts"() {
	"use strict";
	MergeSummaryConflict = class {
		constructor(reason, file = null, meta) {
			this.reason = reason;
			this.file = file;
			this.meta = meta;
		}
		toString() {
			return `${this.file}:${this.reason}`;
		}
	};
	MergeSummaryDetail = class {
		constructor() {
			this.conflicts = [];
			this.merges = [];
			this.result = "success";
		}
		get failed() {
			return this.conflicts.length > 0;
		}
		get reason() {
			return this.result;
		}
		toString() {
			if (this.conflicts.length) return `CONFLICTS: ${this.conflicts.join(", ")}`;
			return "OK";
		}
	};
} });
var PullSummary;
var PullFailedSummary;
var init_PullSummary = __esm({ "src/lib/responses/PullSummary.ts"() {
	"use strict";
	PullSummary = class {
		constructor() {
			this.remoteMessages = { all: [] };
			this.created = [];
			this.deleted = [];
			this.files = [];
			this.deletions = {};
			this.insertions = {};
			this.summary = {
				changes: 0,
				deletions: 0,
				insertions: 0
			};
		}
	};
	PullFailedSummary = class {
		constructor() {
			this.remote = "";
			this.hash = {
				local: "",
				remote: ""
			};
			this.branch = {
				local: "",
				remote: ""
			};
			this.message = "";
		}
		toString() {
			return this.message;
		}
	};
} });
function objectEnumerationResult(remoteMessages) {
	return remoteMessages.objects = remoteMessages.objects || {
		compressing: 0,
		counting: 0,
		enumerating: 0,
		packReused: 0,
		reused: {
			count: 0,
			delta: 0
		},
		total: {
			count: 0,
			delta: 0
		}
	};
}
function asObjectCount(source) {
	const count = /^\s*(\d+)/.exec(source);
	const delta = /delta (\d+)/i.exec(source);
	return {
		count: asNumber(count && count[1] || "0"),
		delta: asNumber(delta && delta[1] || "0")
	};
}
var remoteMessagesObjectParsers;
var init_parse_remote_objects = __esm({ "src/lib/parsers/parse-remote-objects.ts"() {
	"use strict";
	init_utils();
	remoteMessagesObjectParsers = [
		new RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: (\d+),/i, (result, [action, count]) => {
			const key = action.toLowerCase();
			const enumeration = objectEnumerationResult(result.remoteMessages);
			Object.assign(enumeration, { [key]: asNumber(count) });
		}),
		new RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: \d+% \(\d+\/(\d+)\),/i, (result, [action, count]) => {
			const key = action.toLowerCase();
			const enumeration = objectEnumerationResult(result.remoteMessages);
			Object.assign(enumeration, { [key]: asNumber(count) });
		}),
		new RemoteLineParser(/total ([^,]+), reused ([^,]+), pack-reused (\d+)/i, (result, [total, reused, packReused]) => {
			const objects = objectEnumerationResult(result.remoteMessages);
			objects.total = asObjectCount(total);
			objects.reused = asObjectCount(reused);
			objects.packReused = asNumber(packReused);
		})
	];
} });
function parseRemoteMessages(_stdOut, stdErr) {
	return parseStringResponse({ remoteMessages: new RemoteMessageSummary() }, parsers2, stdErr);
}
var parsers2;
var RemoteMessageSummary;
var init_parse_remote_messages = __esm({ "src/lib/parsers/parse-remote-messages.ts"() {
	"use strict";
	init_utils();
	init_parse_remote_objects();
	parsers2 = [
		new RemoteLineParser(/^remote:\s*(.+)$/, (result, [text]) => {
			result.remoteMessages.all.push(text.trim());
			return false;
		}),
		...remoteMessagesObjectParsers,
		new RemoteLineParser([/create a (?:pull|merge) request/i, /\s(https?:\/\/\S+)$/], (result, [pullRequestUrl]) => {
			result.remoteMessages.pullRequestUrl = pullRequestUrl;
		}),
		new RemoteLineParser([/found (\d+) vulnerabilities.+\(([^)]+)\)/i, /\s(https?:\/\/\S+)$/], (result, [count, summary, url]) => {
			result.remoteMessages.vulnerabilities = {
				count: asNumber(count),
				summary,
				url
			};
		})
	];
	RemoteMessageSummary = class {
		constructor() {
			this.all = [];
		}
	};
} });
function parsePullErrorResult(stdOut, stdErr) {
	const pullError = parseStringResponse(new PullFailedSummary(), errorParsers, [stdOut, stdErr]);
	return pullError.message && pullError;
}
var FILE_UPDATE_REGEX;
var SUMMARY_REGEX;
var ACTION_REGEX;
var parsers3;
var errorParsers;
var parsePullDetail;
var parsePullResult;
var init_parse_pull = __esm({ "src/lib/parsers/parse-pull.ts"() {
	"use strict";
	init_PullSummary();
	init_utils();
	init_parse_remote_messages();
	FILE_UPDATE_REGEX = /^\s*(.+?)\s+\|\s+\d+\s*(\+*)(-*)/;
	SUMMARY_REGEX = /(\d+)\D+((\d+)\D+\(\+\))?(\D+(\d+)\D+\(-\))?/;
	ACTION_REGEX = /^(create|delete) mode \d+ (.+)/;
	parsers3 = [
		new LineParser(FILE_UPDATE_REGEX, (result, [file, insertions, deletions]) => {
			result.files.push(file);
			if (insertions) result.insertions[file] = insertions.length;
			if (deletions) result.deletions[file] = deletions.length;
		}),
		new LineParser(SUMMARY_REGEX, (result, [changes, , insertions, , deletions]) => {
			if (insertions !== void 0 || deletions !== void 0) {
				result.summary.changes = +changes || 0;
				result.summary.insertions = +insertions || 0;
				result.summary.deletions = +deletions || 0;
				return true;
			}
			return false;
		}),
		new LineParser(ACTION_REGEX, (result, [action, file]) => {
			append(result.files, file);
			append(action === "create" ? result.created : result.deleted, file);
		})
	];
	errorParsers = [
		new LineParser(/^from\s(.+)$/i, (result, [remote]) => void (result.remote = remote)),
		new LineParser(/^fatal:\s(.+)$/, (result, [message]) => void (result.message = message)),
		new LineParser(/([a-z0-9]+)\.\.([a-z0-9]+)\s+(\S+)\s+->\s+(\S+)$/, (result, [hashLocal, hashRemote, branchLocal, branchRemote]) => {
			result.branch.local = branchLocal;
			result.hash.local = hashLocal;
			result.branch.remote = branchRemote;
			result.hash.remote = hashRemote;
		})
	];
	parsePullDetail = (stdOut, stdErr) => {
		return parseStringResponse(new PullSummary(), parsers3, [stdOut, stdErr]);
	};
	parsePullResult = (stdOut, stdErr) => {
		return Object.assign(new PullSummary(), parsePullDetail(stdOut, stdErr), parseRemoteMessages(stdOut, stdErr));
	};
} });
var parsers4;
var parseMergeResult;
var parseMergeDetail;
var init_parse_merge = __esm({ "src/lib/parsers/parse-merge.ts"() {
	"use strict";
	init_MergeSummary();
	init_utils();
	init_parse_pull();
	parsers4 = [
		new LineParser(/^Auto-merging\s+(.+)$/, (summary, [autoMerge]) => {
			summary.merges.push(autoMerge);
		}),
		new LineParser(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (summary, [reason, file]) => {
			summary.conflicts.push(new MergeSummaryConflict(reason, file));
		}),
		new LineParser(/^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/, (summary, [reason, file, deleteRef]) => {
			summary.conflicts.push(new MergeSummaryConflict(reason, file, { deleteRef }));
		}),
		new LineParser(/^CONFLICT\s+\((.+)\):/, (summary, [reason]) => {
			summary.conflicts.push(new MergeSummaryConflict(reason, null));
		}),
		new LineParser(/^Automatic merge failed;\s+(.+)$/, (summary, [result]) => {
			summary.result = result;
		})
	];
	parseMergeResult = (stdOut, stdErr) => {
		return Object.assign(parseMergeDetail(stdOut, stdErr), parsePullResult(stdOut, stdErr));
	};
	parseMergeDetail = (stdOut) => {
		return parseStringResponse(new MergeSummaryDetail(), parsers4, stdOut);
	};
} });
function mergeTask(customArgs) {
	if (!customArgs.length) return configurationErrorTask("Git.merge requires at least one option");
	return {
		commands: ["merge", ...customArgs],
		format: "utf-8",
		parser(stdOut, stdErr) {
			const merge = parseMergeResult(stdOut, stdErr);
			if (merge.failed) throw new GitResponseError(merge);
			return merge;
		}
	};
}
var init_merge = __esm({ "src/lib/tasks/merge.ts"() {
	"use strict";
	init_git_response_error();
	init_parse_merge();
	init_task();
} });
function pushResultPushedItem(local, remote, status) {
	const deleted = status.includes("deleted");
	const tag = status.includes("tag") || /^refs\/tags/.test(local);
	const alreadyUpdated = !status.includes("new");
	return {
		deleted,
		tag,
		branch: !tag,
		new: !alreadyUpdated,
		alreadyUpdated,
		local,
		remote
	};
}
var parsers5;
var parsePushResult;
var parsePushDetail;
var init_parse_push = __esm({ "src/lib/parsers/parse-push.ts"() {
	"use strict";
	init_utils();
	init_parse_remote_messages();
	parsers5 = [
		new LineParser(/^Pushing to (.+)$/, (result, [repo]) => {
			result.repo = repo;
		}),
		new LineParser(/^updating local tracking ref '(.+)'/, (result, [local]) => {
			result.ref = {
				...result.ref || {},
				local
			};
		}),
		new LineParser(/^[=*-]\s+([^:]+):(\S+)\s+\[(.+)]$/, (result, [local, remote, type]) => {
			result.pushed.push(pushResultPushedItem(local, remote, type));
		}),
		new LineParser(/^Branch '([^']+)' set up to track remote branch '([^']+)' from '([^']+)'/, (result, [local, remote, remoteName]) => {
			result.branch = {
				...result.branch || {},
				local,
				remote,
				remoteName
			};
		}),
		new LineParser(/^([^:]+):(\S+)\s+([a-z0-9]+)\.\.([a-z0-9]+)$/, (result, [local, remote, from, to]) => {
			result.update = {
				head: {
					local,
					remote
				},
				hash: {
					from,
					to
				}
			};
		})
	];
	parsePushResult = (stdOut, stdErr) => {
		const pushDetail = parsePushDetail(stdOut, stdErr);
		const responseDetail = parseRemoteMessages(stdOut, stdErr);
		return {
			...pushDetail,
			...responseDetail
		};
	};
	parsePushDetail = (stdOut, stdErr) => {
		return parseStringResponse({ pushed: [] }, parsers5, [stdOut, stdErr]);
	};
} });
var push_exports = {};
__export(push_exports, {
	pushTagsTask: () => pushTagsTask,
	pushTask: () => pushTask
});
function pushTagsTask(ref = {}, customArgs) {
	append(customArgs, "--tags");
	return pushTask(ref, customArgs);
}
function pushTask(ref = {}, customArgs) {
	const commands = ["push", ...customArgs];
	if (ref.branch) commands.splice(1, 0, ref.branch);
	if (ref.remote) commands.splice(1, 0, ref.remote);
	remove(commands, "-v");
	append(commands, "--verbose");
	append(commands, "--porcelain");
	return {
		commands,
		format: "utf-8",
		parser: parsePushResult
	};
}
var init_push = __esm({ "src/lib/tasks/push.ts"() {
	"use strict";
	init_parse_push();
	init_utils();
} });
function show_default() {
	return {
		showBuffer() {
			const commands = ["show", ...getTrailingOptions(arguments, 1)];
			if (!commands.includes("--binary")) commands.splice(1, 0, "--binary");
			return this._runTask(straightThroughBufferTask(commands), trailingFunctionArgument(arguments));
		},
		show() {
			const commands = ["show", ...getTrailingOptions(arguments, 1)];
			return this._runTask(straightThroughStringTask(commands), trailingFunctionArgument(arguments));
		}
	};
}
var init_show = __esm({ "src/lib/tasks/show.ts"() {
	"use strict";
	init_utils();
	init_task();
} });
var fromPathRegex;
var FileStatusSummary;
var init_FileStatusSummary = __esm({ "src/lib/responses/FileStatusSummary.ts"() {
	"use strict";
	fromPathRegex = /^(.+)\0(.+)$/;
	FileStatusSummary = class {
		constructor(path, index, working_dir) {
			this.path = path;
			this.index = index;
			this.working_dir = working_dir;
			if (index === "R" || working_dir === "R") {
				const detail = fromPathRegex.exec(path) || [
					null,
					path,
					path
				];
				this.from = detail[2] || "";
				this.path = detail[1] || "";
			}
		}
	};
} });
function renamedFile(line) {
	const [to, from] = line.split(NULL);
	return {
		from: from || to,
		to
	};
}
function parser3(indexX, indexY, handler) {
	return [`${indexX}${indexY}`, handler];
}
function conflicts(indexX, ...indexY) {
	return indexY.map((y) => parser3(indexX, y, (result, file) => result.conflicted.push(file)));
}
function splitLine(result, lineStr) {
	const trimmed2 = lineStr.trim();
	switch (" ") {
		case trimmed2.charAt(2): return data(trimmed2.charAt(0), trimmed2.charAt(1), trimmed2.slice(3));
		case trimmed2.charAt(1): return data(" ", trimmed2.charAt(0), trimmed2.slice(2));
		default: return;
	}
	function data(index, workingDir, path) {
		const raw = `${index}${workingDir}`;
		const handler = parsers6.get(raw);
		if (handler) handler(result, path);
		if (raw !== "##" && raw !== "!!") result.files.push(new FileStatusSummary(path, index, workingDir));
	}
}
var StatusSummary;
var parsers6;
var parseStatusSummary;
var init_StatusSummary = __esm({ "src/lib/responses/StatusSummary.ts"() {
	"use strict";
	init_utils();
	init_FileStatusSummary();
	StatusSummary = class {
		constructor() {
			this.not_added = [];
			this.conflicted = [];
			this.created = [];
			this.deleted = [];
			this.ignored = void 0;
			this.modified = [];
			this.renamed = [];
			this.files = [];
			this.staged = [];
			this.ahead = 0;
			this.behind = 0;
			this.current = null;
			this.tracking = null;
			this.detached = false;
			this.isClean = () => {
				return !this.files.length;
			};
		}
	};
	parsers6 = new Map([
		parser3(" ", "A", (result, file) => result.created.push(file)),
		parser3(" ", "D", (result, file) => result.deleted.push(file)),
		parser3(" ", "M", (result, file) => result.modified.push(file)),
		parser3("A", " ", (result, file) => {
			result.created.push(file);
			result.staged.push(file);
		}),
		parser3("A", "M", (result, file) => {
			result.created.push(file);
			result.staged.push(file);
			result.modified.push(file);
		}),
		parser3("D", " ", (result, file) => {
			result.deleted.push(file);
			result.staged.push(file);
		}),
		parser3("M", " ", (result, file) => {
			result.modified.push(file);
			result.staged.push(file);
		}),
		parser3("M", "M", (result, file) => {
			result.modified.push(file);
			result.staged.push(file);
		}),
		parser3("R", " ", (result, file) => {
			result.renamed.push(renamedFile(file));
		}),
		parser3("R", "M", (result, file) => {
			const renamed = renamedFile(file);
			result.renamed.push(renamed);
			result.modified.push(renamed.to);
		}),
		parser3("!", "!", (_result, _file) => {
			(_result.ignored = _result.ignored || []).push(_file);
		}),
		parser3("?", "?", (result, file) => result.not_added.push(file)),
		...conflicts("A", "A", "U"),
		...conflicts("D", "D", "U"),
		...conflicts("U", "A", "D", "U"),
		["##", (result, line) => {
			const aheadReg = /ahead (\d+)/;
			const behindReg = /behind (\d+)/;
			const currentReg = /^(.+?(?=(?:\.{3}|\s|$)))/;
			const trackingReg = /\.{3}(\S*)/;
			const onEmptyBranchReg = /\son\s(\S+?)(?=\.{3}|$)/;
			let regexResult = aheadReg.exec(line);
			result.ahead = regexResult && +regexResult[1] || 0;
			regexResult = behindReg.exec(line);
			result.behind = regexResult && +regexResult[1] || 0;
			regexResult = currentReg.exec(line);
			result.current = filterType(regexResult?.[1], filterString, null);
			regexResult = trackingReg.exec(line);
			result.tracking = filterType(regexResult?.[1], filterString, null);
			regexResult = onEmptyBranchReg.exec(line);
			if (regexResult) result.current = filterType(regexResult?.[1], filterString, result.current);
			result.detached = /\(no branch\)/.test(line);
		}]
	]);
	parseStatusSummary = function(text) {
		const lines = text.split(NULL);
		const status = new StatusSummary();
		for (let i = 0, l = lines.length; i < l;) {
			let line = lines[i++].trim();
			if (!line) continue;
			if (line.charAt(0) === "R") line += NULL + (lines[i++] || "");
			splitLine(status, line);
		}
		return status;
	};
} });
function statusTask(customArgs) {
	return {
		format: "utf-8",
		commands: [
			"status",
			"--porcelain",
			"-b",
			"-u",
			"--null",
			...customArgs.filter((arg) => !ignoredOptions.includes(arg))
		],
		parser(text) {
			return parseStatusSummary(text);
		}
	};
}
var ignoredOptions;
var init_status = __esm({ "src/lib/tasks/status.ts"() {
	"use strict";
	init_StatusSummary();
	ignoredOptions = ["--null", "-z"];
} });
function versionResponse(major = 0, minor = 0, patch = 0, agent = "", installed = true) {
	return Object.defineProperty({
		major,
		minor,
		patch,
		agent,
		installed
	}, "toString", {
		value() {
			return `${this.major}.${this.minor}.${this.patch}`;
		},
		configurable: false,
		enumerable: false
	});
}
function notInstalledResponse() {
	return versionResponse(0, 0, 0, "", false);
}
function version_default() {
	return { version() {
		return this._runTask({
			commands: ["--version"],
			format: "utf-8",
			parser: versionParser,
			onError(result, error, done, fail) {
				if (result.exitCode === -2) return done(Buffer.from(NOT_INSTALLED));
				fail(error);
			}
		});
	} };
}
function versionParser(stdOut) {
	if (stdOut === NOT_INSTALLED) return notInstalledResponse();
	return parseStringResponse(versionResponse(0, 0, 0, stdOut), parsers7, stdOut);
}
var NOT_INSTALLED;
var parsers7;
var init_version = __esm({ "src/lib/tasks/version.ts"() {
	"use strict";
	init_utils();
	NOT_INSTALLED = "installed=false";
	parsers7 = [new LineParser(/version (\d+)\.(\d+)\.(\d+)(?:\s*\((.+)\))?/, (result, [major, minor, patch, agent = ""]) => {
		Object.assign(result, versionResponse(asNumber(major), asNumber(minor), asNumber(patch), agent));
	}), new LineParser(/version (\d+)\.(\d+)\.(\D+)(.+)?$/, (result, [major, minor, patch, agent = ""]) => {
		Object.assign(result, versionResponse(asNumber(major), asNumber(minor), patch, agent));
	})];
} });
function createCloneTask(api, task, repoPath, ...args) {
	if (!filterString(repoPath)) return configurationErrorTask(`git.${api}() requires a string 'repoPath'`);
	return task(repoPath, filterType(args[0], filterString), getTrailingOptions(arguments));
}
function clone_default() {
	return {
		clone(repo, ...rest) {
			return this._runTask(createCloneTask("clone", cloneTask, filterType(repo, filterString), ...rest), trailingFunctionArgument(arguments));
		},
		mirror(repo, ...rest) {
			return this._runTask(createCloneTask("mirror", cloneMirrorTask, filterType(repo, filterString), ...rest), trailingFunctionArgument(arguments));
		}
	};
}
var cloneTask;
var cloneMirrorTask;
var init_clone = __esm({ "src/lib/tasks/clone.ts"() {
	"use strict";
	init_task();
	init_utils();
	cloneTask = (repo, directory, customArgs) => {
		const commands = ["clone", ...customArgs];
		filterString(repo) && commands.push(c$2(repo));
		filterString(directory) && commands.push(c$2(directory));
		return straightThroughStringTask(commands);
	};
	cloneMirrorTask = (repo, directory, customArgs) => {
		append(customArgs, "--mirror");
		return cloneTask(repo, directory, customArgs);
	};
} });
var simple_git_api_exports = {};
__export(simple_git_api_exports, { SimpleGitApi: () => SimpleGitApi });
var SimpleGitApi;
var init_simple_git_api = __esm({ "src/lib/simple-git-api.ts"() {
	"use strict";
	init_task_callback();
	init_change_working_directory();
	init_checkout();
	init_count_objects();
	init_commit();
	init_config();
	init_first_commit();
	init_grep();
	init_hash_object();
	init_init();
	init_log();
	init_merge();
	init_push();
	init_show();
	init_status();
	init_task();
	init_version();
	init_utils();
	init_clone();
	SimpleGitApi = class {
		constructor(_executor) {
			this._executor = _executor;
		}
		_runTask(task, then) {
			const chain = this._executor.chain();
			const promise = chain.push(task);
			if (then) taskCallback(task, promise, then);
			return Object.create(this, {
				then: { value: promise.then.bind(promise) },
				catch: { value: promise.catch.bind(promise) },
				_executor: { value: chain }
			});
		}
		add(files) {
			return this._runTask(straightThroughStringTask(["add", ...asArray(files)]), trailingFunctionArgument(arguments));
		}
		cwd(directory) {
			const next = trailingFunctionArgument(arguments);
			if (typeof directory === "string") return this._runTask(changeWorkingDirectoryTask(directory, this._executor), next);
			if (typeof directory?.path === "string") return this._runTask(changeWorkingDirectoryTask(directory.path, directory.root && this._executor || void 0), next);
			return this._runTask(configurationErrorTask("Git.cwd: workingDirectory must be supplied as a string"), next);
		}
		hashObject(path, write) {
			return this._runTask(hashObjectTask(path, write === true), trailingFunctionArgument(arguments));
		}
		init(bare) {
			return this._runTask(initTask(bare === true, this._executor.cwd, getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
		}
		merge() {
			return this._runTask(mergeTask(getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
		}
		mergeFromTo(remote, branch) {
			if (!(filterString(remote) && filterString(branch))) return this._runTask(configurationErrorTask(`Git.mergeFromTo requires that the 'remote' and 'branch' arguments are supplied as strings`));
			return this._runTask(mergeTask([
				remote,
				branch,
				...getTrailingOptions(arguments)
			]), trailingFunctionArgument(arguments, false));
		}
		outputHandler(handler) {
			this._executor.outputHandler = handler;
			return this;
		}
		push() {
			const task = pushTask({
				remote: filterType(arguments[0], filterString),
				branch: filterType(arguments[1], filterString)
			}, getTrailingOptions(arguments));
			return this._runTask(task, trailingFunctionArgument(arguments));
		}
		stash() {
			return this._runTask(straightThroughStringTask(["stash", ...getTrailingOptions(arguments)]), trailingFunctionArgument(arguments));
		}
		status() {
			return this._runTask(statusTask(getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
		}
	};
	Object.assign(SimpleGitApi.prototype, checkout_default(), clone_default(), commit_default(), config_default(), count_objects_default(), first_commit_default(), grep_default(), log_default(), show_default(), version_default());
} });
var scheduler_exports = {};
__export(scheduler_exports, { Scheduler: () => Scheduler });
var createScheduledTask;
var Scheduler;
var init_scheduler = __esm({ "src/lib/runners/scheduler.ts"() {
	"use strict";
	init_utils();
	init_git_logger();
	createScheduledTask = /* @__PURE__ */ (() => {
		let id = 0;
		return () => {
			id++;
			const { promise, done } = (0, import_dist$1.createDeferred)();
			return {
				promise,
				done,
				id
			};
		};
	})();
	Scheduler = class {
		constructor(concurrency = 2) {
			this.concurrency = concurrency;
			this.logger = createLogger("", "scheduler");
			this.pending = [];
			this.running = [];
			this.logger(`Constructed, concurrency=%s`, concurrency);
		}
		schedule() {
			if (!this.pending.length || this.running.length >= this.concurrency) {
				this.logger(`Schedule attempt ignored, pending=%s running=%s concurrency=%s`, this.pending.length, this.running.length, this.concurrency);
				return;
			}
			const task = append(this.running, this.pending.shift());
			this.logger(`Attempting id=%s`, task.id);
			task.done(() => {
				this.logger(`Completing id=`, task.id);
				remove(this.running, task);
				this.schedule();
			});
		}
		next() {
			const { promise, id } = append(this.pending, createScheduledTask());
			this.logger(`Scheduling id=%s`, id);
			this.schedule();
			return promise;
		}
	};
} });
var apply_patch_exports = {};
__export(apply_patch_exports, { applyPatchTask: () => applyPatchTask });
function applyPatchTask(patches, customArgs) {
	return straightThroughStringTask([
		"apply",
		...customArgs,
		...patches
	]);
}
var init_apply_patch = __esm({ "src/lib/tasks/apply-patch.ts"() {
	"use strict";
	init_task();
} });
function branchDeletionSuccess(branch, hash) {
	return {
		branch,
		hash,
		success: true
	};
}
function branchDeletionFailure(branch) {
	return {
		branch,
		hash: null,
		success: false
	};
}
var BranchDeletionBatch;
var init_BranchDeleteSummary = __esm({ "src/lib/responses/BranchDeleteSummary.ts"() {
	"use strict";
	BranchDeletionBatch = class {
		constructor() {
			this.all = [];
			this.branches = {};
			this.errors = [];
		}
		get success() {
			return !this.errors.length;
		}
	};
} });
function hasBranchDeletionError(data, processExitCode) {
	return processExitCode === 1 && deleteErrorRegex.test(data);
}
var deleteSuccessRegex;
var deleteErrorRegex;
var parsers8;
var parseBranchDeletions;
var init_parse_branch_delete = __esm({ "src/lib/parsers/parse-branch-delete.ts"() {
	"use strict";
	init_BranchDeleteSummary();
	init_utils();
	deleteSuccessRegex = /(\S+)\s+\(\S+\s([^)]+)\)/;
	deleteErrorRegex = /^error[^']+'([^']+)'/m;
	parsers8 = [new LineParser(deleteSuccessRegex, (result, [branch, hash]) => {
		const deletion = branchDeletionSuccess(branch, hash);
		result.all.push(deletion);
		result.branches[branch] = deletion;
	}), new LineParser(deleteErrorRegex, (result, [branch]) => {
		const deletion = branchDeletionFailure(branch);
		result.errors.push(deletion);
		result.all.push(deletion);
		result.branches[branch] = deletion;
	})];
	parseBranchDeletions = (stdOut, stdErr) => {
		return parseStringResponse(new BranchDeletionBatch(), parsers8, [stdOut, stdErr]);
	};
} });
var BranchSummaryResult;
var init_BranchSummary = __esm({ "src/lib/responses/BranchSummary.ts"() {
	"use strict";
	BranchSummaryResult = class {
		constructor() {
			this.all = [];
			this.branches = {};
			this.current = "";
			this.detached = false;
		}
		push(status, detached, name, commit, label) {
			if (status === "*") {
				this.detached = detached;
				this.current = name;
			}
			this.all.push(name);
			this.branches[name] = {
				current: status === "*",
				linkedWorkTree: status === "+",
				name,
				commit,
				label
			};
		}
	};
} });
function branchStatus(input) {
	return input ? input.charAt(0) : "";
}
function parseBranchSummary(stdOut, currentOnly = false) {
	return parseStringResponse(new BranchSummaryResult(), currentOnly ? [currentBranchParser] : parsers9, stdOut);
}
var parsers9;
var currentBranchParser;
var init_parse_branch = __esm({ "src/lib/parsers/parse-branch.ts"() {
	"use strict";
	init_BranchSummary();
	init_utils();
	parsers9 = [new LineParser(/^([*+]\s)?\((?:HEAD )?detached (?:from|at) (\S+)\)\s+([a-z0-9]+)\s(.*)$/, (result, [current, name, commit, label]) => {
		result.push(branchStatus(current), true, name, commit, label);
	}), new LineParser(/^([*+]\s)?(\S+)\s+([a-z0-9]+)\s?(.*)$/s, (result, [current, name, commit, label]) => {
		result.push(branchStatus(current), false, name, commit, label);
	})];
	currentBranchParser = new LineParser(/^(\S+)$/s, (result, [name]) => {
		result.push("*", false, name, "", "");
	});
} });
var branch_exports = {};
__export(branch_exports, {
	branchLocalTask: () => branchLocalTask,
	branchTask: () => branchTask,
	containsDeleteBranchCommand: () => containsDeleteBranchCommand,
	deleteBranchTask: () => deleteBranchTask,
	deleteBranchesTask: () => deleteBranchesTask
});
function containsDeleteBranchCommand(commands) {
	const deleteCommands = [
		"-d",
		"-D",
		"--delete"
	];
	return commands.some((command) => deleteCommands.includes(command));
}
function branchTask(customArgs) {
	const isDelete = containsDeleteBranchCommand(customArgs);
	const isCurrentOnly = customArgs.includes("--show-current");
	const commands = ["branch", ...customArgs];
	if (commands.length === 1) commands.push("-a");
	if (!commands.includes("-v")) commands.splice(1, 0, "-v");
	return {
		format: "utf-8",
		commands,
		parser(stdOut, stdErr) {
			if (isDelete) return parseBranchDeletions(stdOut, stdErr).all[0];
			return parseBranchSummary(stdOut, isCurrentOnly);
		}
	};
}
function branchLocalTask() {
	return {
		format: "utf-8",
		commands: ["branch", "-v"],
		parser(stdOut) {
			return parseBranchSummary(stdOut);
		}
	};
}
function deleteBranchesTask(branches, forceDelete = false) {
	return {
		format: "utf-8",
		commands: [
			"branch",
			"-v",
			forceDelete ? "-D" : "-d",
			...branches
		],
		parser(stdOut, stdErr) {
			return parseBranchDeletions(stdOut, stdErr);
		},
		onError({ exitCode, stdOut }, error, done, fail) {
			if (!hasBranchDeletionError(String(error), exitCode)) return fail(error);
			done(stdOut);
		}
	};
}
function deleteBranchTask(branch, forceDelete = false) {
	const task = {
		format: "utf-8",
		commands: [
			"branch",
			"-v",
			forceDelete ? "-D" : "-d",
			branch
		],
		parser(stdOut, stdErr) {
			return parseBranchDeletions(stdOut, stdErr).branches[branch];
		},
		onError({ exitCode, stdErr, stdOut }, error, _, fail) {
			if (!hasBranchDeletionError(String(error), exitCode)) return fail(error);
			throw new GitResponseError(task.parser(bufferToString(stdOut), bufferToString(stdErr)), String(error));
		}
	};
	return task;
}
var init_branch = __esm({ "src/lib/tasks/branch.ts"() {
	"use strict";
	init_git_response_error();
	init_parse_branch_delete();
	init_parse_branch();
	init_utils();
} });
function toPath$1(input) {
	const path = input.trim().replace(/^["']|["']$/g, "");
	return path && normalize(path);
}
var parseCheckIgnore;
var init_CheckIgnore = __esm({ "src/lib/responses/CheckIgnore.ts"() {
	"use strict";
	parseCheckIgnore = (text) => {
		return text.split(/\n/g).map(toPath$1).filter(Boolean);
	};
} });
var check_ignore_exports = {};
__export(check_ignore_exports, { checkIgnoreTask: () => checkIgnoreTask });
function checkIgnoreTask(paths) {
	return {
		commands: ["check-ignore", ...paths],
		format: "utf-8",
		parser: parseCheckIgnore
	};
}
var init_check_ignore = __esm({ "src/lib/tasks/check-ignore.ts"() {
	"use strict";
	init_CheckIgnore();
} });
function parseFetchResult(stdOut, stdErr) {
	return parseStringResponse({
		raw: stdOut,
		remote: null,
		branches: [],
		tags: [],
		updated: [],
		deleted: []
	}, parsers10, [stdOut, stdErr]);
}
var parsers10;
var init_parse_fetch = __esm({ "src/lib/parsers/parse-fetch.ts"() {
	"use strict";
	init_utils();
	parsers10 = [
		new LineParser(/From (.+)$/, (result, [remote]) => {
			result.remote = remote;
		}),
		new LineParser(/\* \[new branch]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
			result.branches.push({
				name,
				tracking
			});
		}),
		new LineParser(/\* \[new tag]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
			result.tags.push({
				name,
				tracking
			});
		}),
		new LineParser(/- \[deleted]\s+\S+\s*-> (.+)$/, (result, [tracking]) => {
			result.deleted.push({ tracking });
		}),
		new LineParser(/\s*([^.]+)\.\.(\S+)\s+(\S+)\s*-> (.+)$/, (result, [from, to, name, tracking]) => {
			result.updated.push({
				name,
				tracking,
				to,
				from
			});
		})
	];
} });
var fetch_exports = {};
__export(fetch_exports, { fetchTask: () => fetchTask });
function disallowedCommand(command) {
	return /^--upload-pack(=|$)/.test(command);
}
function fetchTask(remote, branch, customArgs) {
	const commands = ["fetch", ...customArgs];
	if (remote && branch) commands.push(remote, branch);
	if (commands.find(disallowedCommand)) return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
	return {
		commands,
		format: "utf-8",
		parser: parseFetchResult
	};
}
var init_fetch = __esm({ "src/lib/tasks/fetch.ts"() {
	"use strict";
	init_parse_fetch();
	init_task();
} });
function parseMoveResult(stdOut) {
	return parseStringResponse({ moves: [] }, parsers11, stdOut);
}
var parsers11;
var init_parse_move = __esm({ "src/lib/parsers/parse-move.ts"() {
	"use strict";
	init_utils();
	parsers11 = [new LineParser(/^Renaming (.+) to (.+)$/, (result, [from, to]) => {
		result.moves.push({
			from,
			to
		});
	})];
} });
var move_exports = {};
__export(move_exports, { moveTask: () => moveTask });
function moveTask(from, to) {
	return {
		commands: [
			"mv",
			"-v",
			...asArray(from),
			to
		],
		format: "utf-8",
		parser: parseMoveResult
	};
}
var init_move = __esm({ "src/lib/tasks/move.ts"() {
	"use strict";
	init_parse_move();
	init_utils();
} });
var pull_exports = {};
__export(pull_exports, { pullTask: () => pullTask });
function pullTask(remote, branch, customArgs) {
	const commands = ["pull", ...customArgs];
	if (remote && branch) commands.splice(1, 0, remote, branch);
	return {
		commands,
		format: "utf-8",
		parser(stdOut, stdErr) {
			return parsePullResult(stdOut, stdErr);
		},
		onError(result, _error, _done, fail) {
			const pullError = parsePullErrorResult(bufferToString(result.stdOut), bufferToString(result.stdErr));
			if (pullError) return fail(new GitResponseError(pullError));
			fail(_error);
		}
	};
}
var init_pull = __esm({ "src/lib/tasks/pull.ts"() {
	"use strict";
	init_git_response_error();
	init_parse_pull();
	init_utils();
} });
function parseGetRemotes(text) {
	const remotes = {};
	forEach(text, ([name]) => remotes[name] = { name });
	return Object.values(remotes);
}
function parseGetRemotesVerbose(text) {
	const remotes = {};
	forEach(text, ([name, url, purpose]) => {
		if (!Object.hasOwn(remotes, name)) remotes[name] = {
			name,
			refs: {
				fetch: "",
				push: ""
			}
		};
		if (purpose && url) remotes[name].refs[purpose.replace(/[^a-z]/g, "")] = url;
	});
	return Object.values(remotes);
}
function forEach(text, handler) {
	forEachLineWithContent(text, (line) => handler(line.split(/\s+/)));
}
var init_GetRemoteSummary = __esm({ "src/lib/responses/GetRemoteSummary.ts"() {
	"use strict";
	init_utils();
} });
var remote_exports = {};
__export(remote_exports, {
	addRemoteTask: () => addRemoteTask,
	getRemotesTask: () => getRemotesTask,
	listRemotesTask: () => listRemotesTask,
	remoteTask: () => remoteTask,
	removeRemoteTask: () => removeRemoteTask
});
function addRemoteTask(remoteName, remoteRepo, customArgs) {
	return straightThroughStringTask([
		"remote",
		"add",
		...customArgs,
		remoteName,
		remoteRepo
	]);
}
function getRemotesTask(verbose) {
	const commands = ["remote"];
	if (verbose) commands.push("-v");
	return {
		commands,
		format: "utf-8",
		parser: verbose ? parseGetRemotesVerbose : parseGetRemotes
	};
}
function listRemotesTask(customArgs) {
	const commands = [...customArgs];
	if (commands[0] !== "ls-remote") commands.unshift("ls-remote");
	return straightThroughStringTask(commands);
}
function remoteTask(customArgs) {
	const commands = [...customArgs];
	if (commands[0] !== "remote") commands.unshift("remote");
	return straightThroughStringTask(commands);
}
function removeRemoteTask(remoteName) {
	return straightThroughStringTask([
		"remote",
		"remove",
		remoteName
	]);
}
var init_remote = __esm({ "src/lib/tasks/remote.ts"() {
	"use strict";
	init_GetRemoteSummary();
	init_task();
} });
var stash_list_exports = {};
__export(stash_list_exports, { stashListTask: () => stashListTask });
function stashListTask(opt = {}, customArgs) {
	const options = parseLogOptions(opt);
	const commands = [
		"stash",
		"list",
		...options.commands,
		...customArgs
	];
	const parser4 = createListLogSummaryParser(options.splitter, options.fields, logFormatFromCommand(commands));
	return validateLogFormatConfig(commands) || {
		commands,
		format: "utf-8",
		parser: parser4
	};
}
var init_stash_list = __esm({ "src/lib/tasks/stash-list.ts"() {
	"use strict";
	init_log_format();
	init_parse_list_log_summary();
	init_diff();
	init_log();
} });
var sub_module_exports = {};
__export(sub_module_exports, {
	addSubModuleTask: () => addSubModuleTask,
	initSubModuleTask: () => initSubModuleTask,
	subModuleTask: () => subModuleTask,
	updateSubModuleTask: () => updateSubModuleTask
});
function addSubModuleTask(repo, path) {
	return subModuleTask([
		"add",
		repo,
		path
	]);
}
function initSubModuleTask(customArgs) {
	return subModuleTask(["init", ...customArgs]);
}
function subModuleTask(customArgs) {
	const commands = [...customArgs];
	if (commands[0] !== "submodule") commands.unshift("submodule");
	return straightThroughStringTask(commands);
}
function updateSubModuleTask(customArgs) {
	return subModuleTask(["update", ...customArgs]);
}
var init_sub_module = __esm({ "src/lib/tasks/sub-module.ts"() {
	"use strict";
	init_task();
} });
function singleSorted(a, b) {
	const aIsNum = Number.isNaN(a);
	if (aIsNum !== Number.isNaN(b)) return aIsNum ? 1 : -1;
	return aIsNum ? sorted(a, b) : 0;
}
function sorted(a, b) {
	return a === b ? 0 : a > b ? 1 : -1;
}
function trimmed(input) {
	return input.trim();
}
function toNumber(input) {
	if (typeof input === "string") return parseInt(input.replace(/^\D+/g, ""), 10) || 0;
	return 0;
}
var TagList;
var parseTagList;
var init_TagList = __esm({ "src/lib/responses/TagList.ts"() {
	"use strict";
	TagList = class {
		constructor(all, latest) {
			this.all = all;
			this.latest = latest;
		}
	};
	parseTagList = function(data, customSort = false) {
		const tags = data.split("\n").map(trimmed).filter(Boolean);
		if (!customSort) tags.sort(function(tagA, tagB) {
			const partsA = tagA.split(".");
			const partsB = tagB.split(".");
			if (partsA.length === 1 || partsB.length === 1) return singleSorted(toNumber(partsA[0]), toNumber(partsB[0]));
			for (let i = 0, l = Math.max(partsA.length, partsB.length); i < l; i++) {
				const diff = sorted(toNumber(partsA[i]), toNumber(partsB[i]));
				if (diff) return diff;
			}
			return 0;
		});
		const latest = customSort ? tags[0] : [...tags].reverse().find((tag) => tag.indexOf(".") >= 0);
		return new TagList(tags, latest);
	};
} });
var tag_exports = {};
__export(tag_exports, {
	addAnnotatedTagTask: () => addAnnotatedTagTask,
	addTagTask: () => addTagTask,
	tagListTask: () => tagListTask
});
function tagListTask(customArgs = []) {
	const hasCustomSort = customArgs.some((option) => /^--sort=/.test(option));
	return {
		format: "utf-8",
		commands: [
			"tag",
			"-l",
			...customArgs
		],
		parser(text) {
			return parseTagList(text, hasCustomSort);
		}
	};
}
function addTagTask(name) {
	return {
		format: "utf-8",
		commands: ["tag", name],
		parser() {
			return { name };
		}
	};
}
function addAnnotatedTagTask(name, tagMessage) {
	return {
		format: "utf-8",
		commands: [
			"tag",
			"-a",
			"-m",
			tagMessage,
			name
		],
		parser() {
			return { name };
		}
	};
}
var init_tag = __esm({ "src/lib/tasks/tag.ts"() {
	"use strict";
	init_TagList();
} });
var require_git = __commonJS({ "src/git.js"(exports, module) {
	"use strict";
	var { GitExecutor: GitExecutor2 } = (init_git_executor(), __toCommonJS(git_executor_exports));
	var { SimpleGitApi: SimpleGitApi2 } = (init_simple_git_api(), __toCommonJS(simple_git_api_exports));
	var { Scheduler: Scheduler2 } = (init_scheduler(), __toCommonJS(scheduler_exports));
	var { adhocExecTask: adhocExecTask2, configurationErrorTask: configurationErrorTask2 } = (init_task(), __toCommonJS(task_exports));
	var { asArray: asArray2, filterArray: filterArray2, filterPrimitives: filterPrimitives2, filterString: filterString2, filterStringOrStringArray: filterStringOrStringArray2, filterType: filterType2, getTrailingOptions: getTrailingOptions2, trailingFunctionArgument: trailingFunctionArgument2, trailingOptionsArgument: trailingOptionsArgument2 } = (init_utils(), __toCommonJS(utils_exports));
	var { applyPatchTask: applyPatchTask2 } = (init_apply_patch(), __toCommonJS(apply_patch_exports));
	var { branchTask: branchTask2, branchLocalTask: branchLocalTask2, deleteBranchesTask: deleteBranchesTask2, deleteBranchTask: deleteBranchTask2 } = (init_branch(), __toCommonJS(branch_exports));
	var { checkIgnoreTask: checkIgnoreTask2 } = (init_check_ignore(), __toCommonJS(check_ignore_exports));
	var { checkIsRepoTask: checkIsRepoTask2 } = (init_check_is_repo(), __toCommonJS(check_is_repo_exports));
	var { cleanWithOptionsTask: cleanWithOptionsTask2, isCleanOptionsArray: isCleanOptionsArray2 } = (init_clean(), __toCommonJS(clean_exports));
	var { diffSummaryTask: diffSummaryTask2 } = (init_diff(), __toCommonJS(diff_exports));
	var { fetchTask: fetchTask2 } = (init_fetch(), __toCommonJS(fetch_exports));
	var { moveTask: moveTask2 } = (init_move(), __toCommonJS(move_exports));
	var { pullTask: pullTask2 } = (init_pull(), __toCommonJS(pull_exports));
	var { pushTagsTask: pushTagsTask2 } = (init_push(), __toCommonJS(push_exports));
	var { addRemoteTask: addRemoteTask2, getRemotesTask: getRemotesTask2, listRemotesTask: listRemotesTask2, remoteTask: remoteTask2, removeRemoteTask: removeRemoteTask2 } = (init_remote(), __toCommonJS(remote_exports));
	var { getResetMode: getResetMode2, resetTask: resetTask2 } = (init_reset(), __toCommonJS(reset_exports));
	var { stashListTask: stashListTask2 } = (init_stash_list(), __toCommonJS(stash_list_exports));
	var { addSubModuleTask: addSubModuleTask2, initSubModuleTask: initSubModuleTask2, subModuleTask: subModuleTask2, updateSubModuleTask: updateSubModuleTask2 } = (init_sub_module(), __toCommonJS(sub_module_exports));
	var { addAnnotatedTagTask: addAnnotatedTagTask2, addTagTask: addTagTask2, tagListTask: tagListTask2 } = (init_tag(), __toCommonJS(tag_exports));
	var { straightThroughBufferTask: straightThroughBufferTask2, straightThroughStringTask: straightThroughStringTask2 } = (init_task(), __toCommonJS(task_exports));
	function Git2(options, plugins) {
		this._plugins = plugins;
		this._executor = new GitExecutor2(options.baseDir, new Scheduler2(options.maxConcurrentProcesses), plugins);
		this._trimmed = options.trimmed;
	}
	(Git2.prototype = Object.create(SimpleGitApi2.prototype)).constructor = Git2;
	Git2.prototype.customBinary = function(command) {
		this._plugins.reconfigure("binary", command);
		return this;
	};
	Git2.prototype.env = function(name, value) {
		if (arguments.length === 1 && typeof name === "object") this._executor.env = name;
		else (this._executor.env = this._executor.env || {})[name] = value;
		return this;
	};
	Git2.prototype.stashList = function(options) {
		return this._runTask(stashListTask2(trailingOptionsArgument2(arguments) || {}, filterArray2(options) && options || []), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.mv = function(from, to) {
		return this._runTask(moveTask2(from, to), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.checkoutLatestTag = function(then) {
		var git = this;
		return this.pull(function() {
			git.tags(function(err, tags) {
				git.checkout(tags.latest, then);
			});
		});
	};
	Git2.prototype.pull = function(remote, branch, options, then) {
		return this._runTask(pullTask2(filterType2(remote, filterString2), filterType2(branch, filterString2), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.fetch = function(remote, branch) {
		return this._runTask(fetchTask2(filterType2(remote, filterString2), filterType2(branch, filterString2), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.silent = function(silence) {
		return this._runTask(adhocExecTask2(() => console.warn("simple-git deprecation notice: git.silent: logging should be configured using the `debug` library / `DEBUG` environment variable, this method will be removed.")));
	};
	Git2.prototype.tags = function(options, then) {
		return this._runTask(tagListTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.rebase = function() {
		return this._runTask(straightThroughStringTask2(["rebase", ...getTrailingOptions2(arguments)]), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.reset = function(mode) {
		return this._runTask(resetTask2(getResetMode2(mode), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.revert = function(commit) {
		const next = trailingFunctionArgument2(arguments);
		if (typeof commit !== "string") return this._runTask(configurationErrorTask2("Commit must be a string"), next);
		return this._runTask(straightThroughStringTask2([
			"revert",
			...getTrailingOptions2(arguments, 0, true),
			commit
		]), next);
	};
	Git2.prototype.addTag = function(name) {
		const task = typeof name === "string" ? addTagTask2(name) : configurationErrorTask2("Git.addTag requires a tag name");
		return this._runTask(task, trailingFunctionArgument2(arguments));
	};
	Git2.prototype.addAnnotatedTag = function(tagName, tagMessage) {
		return this._runTask(addAnnotatedTagTask2(tagName, tagMessage), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.deleteLocalBranch = function(branchName, forceDelete, then) {
		return this._runTask(deleteBranchTask2(branchName, typeof forceDelete === "boolean" ? forceDelete : false), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.deleteLocalBranches = function(branchNames, forceDelete, then) {
		return this._runTask(deleteBranchesTask2(branchNames, typeof forceDelete === "boolean" ? forceDelete : false), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.branch = function(options, then) {
		return this._runTask(branchTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.branchLocal = function(then) {
		return this._runTask(branchLocalTask2(), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.raw = function(commands) {
		const createRestCommands = !Array.isArray(commands);
		const command = [].slice.call(createRestCommands ? arguments : commands, 0);
		for (let i = 0; i < command.length && createRestCommands; i++) if (!filterPrimitives2(command[i])) {
			command.splice(i, command.length - i);
			break;
		}
		command.push(...getTrailingOptions2(arguments, 0, true));
		var next = trailingFunctionArgument2(arguments);
		if (!command.length) return this._runTask(configurationErrorTask2("Raw: must supply one or more command to execute"), next);
		return this._runTask(straightThroughStringTask2(command, this._trimmed), next);
	};
	Git2.prototype.submoduleAdd = function(repo, path, then) {
		return this._runTask(addSubModuleTask2(repo, path), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.submoduleUpdate = function(args, then) {
		return this._runTask(updateSubModuleTask2(getTrailingOptions2(arguments, true)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.submoduleInit = function(args, then) {
		return this._runTask(initSubModuleTask2(getTrailingOptions2(arguments, true)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.subModule = function(options, then) {
		return this._runTask(subModuleTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.listRemote = function() {
		return this._runTask(listRemotesTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.addRemote = function(remoteName, remoteRepo, then) {
		return this._runTask(addRemoteTask2(remoteName, remoteRepo, getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.removeRemote = function(remoteName, then) {
		return this._runTask(removeRemoteTask2(remoteName), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.getRemotes = function(verbose, then) {
		return this._runTask(getRemotesTask2(verbose === true), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.remote = function(options, then) {
		return this._runTask(remoteTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.tag = function(options, then) {
		const command = getTrailingOptions2(arguments);
		if (command[0] !== "tag") command.unshift("tag");
		return this._runTask(straightThroughStringTask2(command), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.updateServerInfo = function(then) {
		return this._runTask(straightThroughStringTask2(["update-server-info"]), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.pushTags = function(remote, then) {
		const task = pushTagsTask2({ remote: filterType2(remote, filterString2) }, getTrailingOptions2(arguments));
		return this._runTask(task, trailingFunctionArgument2(arguments));
	};
	Git2.prototype.rm = function(files) {
		return this._runTask(straightThroughStringTask2([
			"rm",
			"-f",
			...asArray2(files)
		]), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.rmKeepLocal = function(files) {
		return this._runTask(straightThroughStringTask2([
			"rm",
			"--cached",
			...asArray2(files)
		]), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.catFile = function(options, then) {
		return this._catFile("utf-8", arguments);
	};
	Git2.prototype.binaryCatFile = function() {
		return this._catFile("buffer", arguments);
	};
	Git2.prototype._catFile = function(format, args) {
		var handler = trailingFunctionArgument2(args);
		var command = ["cat-file"];
		var options = args[0];
		if (typeof options === "string") return this._runTask(configurationErrorTask2("Git.catFile: options must be supplied as an array of strings"), handler);
		if (Array.isArray(options)) command.push.apply(command, options);
		const task = format === "buffer" ? straightThroughBufferTask2(command) : straightThroughStringTask2(command);
		return this._runTask(task, handler);
	};
	Git2.prototype.diff = function(options, then) {
		const task = filterString2(options) ? configurationErrorTask2("git.diff: supplying options as a single string is no longer supported, switch to an array of strings") : straightThroughStringTask2(["diff", ...getTrailingOptions2(arguments)]);
		return this._runTask(task, trailingFunctionArgument2(arguments));
	};
	Git2.prototype.diffSummary = function() {
		return this._runTask(diffSummaryTask2(getTrailingOptions2(arguments, 1)), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.applyPatch = function(patches) {
		const task = !filterStringOrStringArray2(patches) ? configurationErrorTask2(`git.applyPatch requires one or more string patches as the first argument`) : applyPatchTask2(asArray2(patches), getTrailingOptions2([].slice.call(arguments, 1)));
		return this._runTask(task, trailingFunctionArgument2(arguments));
	};
	Git2.prototype.revparse = function() {
		const commands = ["rev-parse", ...getTrailingOptions2(arguments, true)];
		return this._runTask(straightThroughStringTask2(commands, true), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.clean = function(mode, options, then) {
		const usingCleanOptionsArray = isCleanOptionsArray2(mode);
		const cleanMode = usingCleanOptionsArray && mode.join("") || filterType2(mode, filterString2) || "";
		const customArgs = getTrailingOptions2([].slice.call(arguments, usingCleanOptionsArray ? 1 : 0));
		return this._runTask(cleanWithOptionsTask2(cleanMode, customArgs), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.exec = function(then) {
		return this._runTask({
			commands: [],
			format: "utf-8",
			parser() {
				if (typeof then === "function") then();
			}
		});
	};
	Git2.prototype.clearQueue = function() {
		return this._runTask(adhocExecTask2(() => console.warn("simple-git deprecation notice: clearQueue() is deprecated and will be removed, switch to using the abortPlugin instead.")));
	};
	Git2.prototype.checkIgnore = function(pathnames, then) {
		return this._runTask(checkIgnoreTask2(asArray2(filterType2(pathnames, filterStringOrStringArray2, []))), trailingFunctionArgument2(arguments));
	};
	Git2.prototype.checkIsRepo = function(checkType, then) {
		return this._runTask(checkIsRepoTask2(filterType2(checkType, filterString2)), trailingFunctionArgument2(arguments));
	};
	module.exports = Git2;
} });
init_git_error();
var GitConstructError = class extends GitError {
	constructor(config, message) {
		super(void 0, message);
		this.config = config;
	}
};
init_git_error();
init_git_error();
var GitPluginError = class extends GitError {
	constructor(task, plugin, message) {
		super(task, message);
		this.task = task;
		this.plugin = plugin;
		Object.setPrototypeOf(this, new.target.prototype);
	}
};
init_git_response_error();
init_task_configuration_error();
init_check_is_repo();
init_clean();
init_config();
init_diff_name_status();
init_grep();
init_reset();
function abortPlugin(signal) {
	if (!signal) return;
	return [{
		type: "spawn.before",
		action(_data, context) {
			if (signal.aborted) context.kill(new GitPluginError(void 0, "abort", "Abort already signaled"));
		}
	}, {
		type: "spawn.after",
		action(_data, context) {
			function kill() {
				context.kill(new GitPluginError(void 0, "abort", "Abort signal received"));
			}
			signal.addEventListener("abort", kill);
			context.spawned.on("close", () => signal.removeEventListener("abort", kill));
		}
	}];
}
function blockUnsafeOperationsPlugin(options = {}) {
	return {
		type: "spawn.args",
		action(args, { env }) {
			for (const vulnerability of ne(args, env)) if (options[vulnerability.category] !== true) throw new GitPluginError(void 0, "unsafe", vulnerability.message);
			return args;
		}
	};
}
init_utils();
function commandConfigPrefixingPlugin(configuration) {
	const prefix = prefixedArray(configuration, "-c");
	return {
		type: "spawn.args",
		action(data) {
			return [...prefix, ...data];
		}
	};
}
init_utils();
var never = (0, import_dist$1.deferred)().promise;
function completionDetectionPlugin({ onClose = true, onExit = 50 } = {}) {
	function createEvents() {
		let exitCode = -1;
		const events = {
			close: (0, import_dist$1.deferred)(),
			closeTimeout: (0, import_dist$1.deferred)(),
			exit: (0, import_dist$1.deferred)(),
			exitTimeout: (0, import_dist$1.deferred)()
		};
		const result = Promise.race([onClose === false ? never : events.closeTimeout.promise, onExit === false ? never : events.exitTimeout.promise]);
		configureTimeout(onClose, events.close, events.closeTimeout);
		configureTimeout(onExit, events.exit, events.exitTimeout);
		return {
			close(code) {
				exitCode = code;
				events.close.done();
			},
			exit(code) {
				exitCode = code;
				events.exit.done();
			},
			get exitCode() {
				return exitCode;
			},
			result
		};
	}
	function configureTimeout(flag, event, timeout) {
		if (flag === false) return;
		(flag === true ? event.promise : event.promise.then(() => delay(flag))).then(timeout.done);
	}
	return {
		type: "spawn.after",
		async action(_data, { spawned, close }) {
			const events = createEvents();
			let deferClose = true;
			let quickClose = () => void (deferClose = false);
			spawned.stdout?.on("data", quickClose);
			spawned.stderr?.on("data", quickClose);
			spawned.on("error", quickClose);
			spawned.on("close", (code) => events.close(code));
			spawned.on("exit", (code) => events.exit(code));
			try {
				await events.result;
				if (deferClose) await delay(50);
				close(events.exitCode);
			} catch (err) {
				close(events.exitCode, err);
			}
		}
	};
}
init_utils();
var WRONG_NUMBER_ERR = `Invalid value supplied for custom binary, requires a single string or an array containing either one or two strings`;
var WRONG_CHARS_ERR = `Invalid value supplied for custom binary, restricted characters must be removed or supply the unsafe.allowUnsafeCustomBinary option`;
function isBadArgument(arg) {
	return !arg || !/^([a-z]:)?([a-z0-9/.\\_~-]+)$/i.test(arg);
}
function toBinaryConfig(input, allowUnsafe) {
	if (input.length < 1 || input.length > 2) throw new GitPluginError(void 0, "binary", WRONG_NUMBER_ERR);
	if (input.some(isBadArgument)) {
		if (allowUnsafe) console.warn(WRONG_CHARS_ERR);
		else throw new GitPluginError(void 0, "binary", WRONG_CHARS_ERR);
	}
	const [binary, prefix] = input;
	return {
		binary,
		prefix
	};
}
function customBinaryPlugin(plugins, input = ["git"], allowUnsafe = false) {
	let config = toBinaryConfig(asArray(input), allowUnsafe);
	plugins.on("binary", (input2) => {
		config = toBinaryConfig(asArray(input2), allowUnsafe);
	});
	plugins.append("spawn.binary", () => {
		return config.binary;
	});
	plugins.append("spawn.args", (data) => {
		return config.prefix ? [config.prefix, ...data] : data;
	});
}
init_git_error();
function isTaskError(result) {
	return !!(result.exitCode && result.stdErr.length);
}
function getErrorMessage(result) {
	return Buffer.concat([...result.stdOut, ...result.stdErr]);
}
function errorDetectionHandler(overwrite = false, isError = isTaskError, errorMessage = getErrorMessage) {
	return (error, result) => {
		if (!overwrite && error || !isError(result)) return error;
		return errorMessage(result);
	};
}
function errorDetectionPlugin(config) {
	return {
		type: "task.error",
		action(data, context) {
			const error = config(data.error, {
				stdErr: context.stdErr,
				stdOut: context.stdOut,
				exitCode: context.exitCode
			});
			if (Buffer.isBuffer(error)) return { error: new GitError(void 0, error.toString("utf-8")) };
			return { error };
		}
	};
}
init_utils();
var PluginStore = class {
	constructor() {
		this.plugins = /* @__PURE__ */ new Set();
		this.events = new EventEmitter();
	}
	on(type, listener) {
		this.events.on(type, listener);
	}
	reconfigure(type, data) {
		this.events.emit(type, data);
	}
	append(type, action) {
		const plugin = append(this.plugins, {
			type,
			action
		});
		return () => this.plugins.delete(plugin);
	}
	add(plugin) {
		const plugins = [];
		asArray(plugin).forEach((plugin2) => plugin2 && this.plugins.add(append(plugins, plugin2)));
		return () => {
			plugins.forEach((plugin2) => this.plugins.delete(plugin2));
		};
	}
	exec(type, data, context) {
		let output = data;
		const contextual = Object.freeze(Object.create(context));
		for (const plugin of this.plugins) if (plugin.type === type) output = plugin.action(output, contextual);
		return output;
	}
};
init_utils();
function progressMonitorPlugin(progress) {
	const progressCommand = "--progress";
	const progressMethods = [
		"checkout",
		"clone",
		"fetch",
		"pull",
		"push"
	];
	return [{
		type: "spawn.args",
		action(args, context) {
			if (!progressMethods.includes(context.method)) return args;
			return including(args, progressCommand);
		}
	}, {
		type: "spawn.after",
		action(_data, context) {
			if (!context.commands.includes(progressCommand)) return;
			context.spawned.stderr?.on("data", (chunk) => {
				const message = /^([\s\S]+?):\s*(\d+)% \((\d+)\/(\d+)\)/.exec(chunk.toString("utf8"));
				if (!message) return;
				progress({
					method: context.method,
					stage: progressEventStage(message[1]),
					progress: asNumber(message[2]),
					processed: asNumber(message[3]),
					total: asNumber(message[4])
				});
			});
		}
	}];
}
function progressEventStage(input) {
	return String(input.toLowerCase().split(" ", 1)) || "unknown";
}
init_utils();
function spawnOptionsPlugin(spawnOptions) {
	const options = pick(spawnOptions, ["uid", "gid"]);
	return {
		type: "spawn.options",
		action(data) {
			return {
				...options,
				...data
			};
		}
	};
}
function timeoutPlugin({ block, stdErr = true, stdOut = true }) {
	if (block > 0) return {
		type: "spawn.after",
		action(_data, context) {
			let timeout;
			function wait() {
				timeout && clearTimeout(timeout);
				timeout = setTimeout(kill, block);
			}
			function stop() {
				context.spawned.stdout?.off("data", wait);
				context.spawned.stderr?.off("data", wait);
				context.spawned.off("exit", stop);
				context.spawned.off("close", stop);
				timeout && clearTimeout(timeout);
			}
			function kill() {
				stop();
				context.kill(new GitPluginError(void 0, "timeout", `block timeout reached`));
			}
			stdOut && context.spawned.stdout?.on("data", wait);
			stdErr && context.spawned.stderr?.on("data", wait);
			context.spawned.on("exit", stop);
			context.spawned.on("close", stop);
			wait();
		}
	};
}
function suffixPathsPlugin() {
	return {
		type: "spawn.args",
		action(data) {
			const prefix = [];
			let suffix;
			function append2(args) {
				(suffix = suffix || []).push(...args);
			}
			for (let i = 0; i < data.length; i++) {
				const param = data[i];
				if (r(param)) {
					append2(o$1(param));
					continue;
				}
				if (param === "--") {
					append2(data.slice(i + 1).flatMap((item) => r(item) && o$1(item) || item));
					break;
				}
				prefix.push(param);
			}
			return !suffix ? prefix : [
				...prefix,
				"--",
				...suffix.map(String)
			];
		}
	};
}
init_utils();
var Git = require_git();
function gitInstanceFactory(baseDir, options) {
	const plugins = new PluginStore();
	const config = createInstanceConfig(baseDir && (typeof baseDir === "string" ? { baseDir } : baseDir) || {}, options);
	if (!folderExists(config.baseDir)) throw new GitConstructError(config, `Cannot use simple-git on a directory that does not exist`);
	if (Array.isArray(config.config)) plugins.add(commandConfigPrefixingPlugin(config.config));
	plugins.add(blockUnsafeOperationsPlugin(config.unsafe));
	plugins.add(completionDetectionPlugin(config.completion));
	config.abort && plugins.add(abortPlugin(config.abort));
	config.progress && plugins.add(progressMonitorPlugin(config.progress));
	config.timeout && plugins.add(timeoutPlugin(config.timeout));
	config.spawnOptions && plugins.add(spawnOptionsPlugin(config.spawnOptions));
	plugins.add(suffixPathsPlugin());
	plugins.add(errorDetectionPlugin(errorDetectionHandler(true)));
	config.errors && plugins.add(errorDetectionPlugin(config.errors));
	customBinaryPlugin(plugins, config.binary, config.unsafe?.allowUnsafeCustomBinary);
	return new Git(config, plugins);
}
init_git_response_error();
var simpleGit = gitInstanceFactory;
//#endregion
//#region node_modules/node-pty/lib/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2017, Daniel Imms (MIT License).
	* Copyright (c) 2018, Microsoft Corporation (MIT License).
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.loadNativeModule = exports.assign = void 0;
	function assign(target) {
		var sources = [];
		for (var _i = 1; _i < arguments.length; _i++) sources[_i - 1] = arguments[_i];
		sources.forEach(function(source) {
			return Object.keys(source).forEach(function(key) {
				return target[key] = source[key];
			});
		});
		return target;
	}
	exports.assign = assign;
	function loadNativeModule(name) {
		var dirs = [
			"build/Release",
			"build/Debug",
			"prebuilds/" + process.platform + "-" + process.arch
		];
		var relative = ["..", "."];
		var lastError;
		for (var _i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
			var d = dirs_1[_i];
			for (var _a = 0, relative_1 = relative; _a < relative_1.length; _a++) {
				var dir = relative_1[_a] + "/" + d + "/";
				try {
					return {
						dir,
						module: __require(dir + "/" + name + ".node")
					};
				} catch (e) {
					lastError = e;
				}
			}
		}
		throw new Error("Failed to load native module: " + name + ".node, checked: " + dirs.join(", ") + ": " + lastError);
	}
	exports.loadNativeModule = loadNativeModule;
}));
//#endregion
//#region node_modules/node-pty/lib/eventEmitter2.js
var require_eventEmitter2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2019, Microsoft Corporation (MIT License).
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EventEmitter2 = void 0;
	exports.EventEmitter2 = function() {
		function EventEmitter2() {
			this._listeners = [];
		}
		Object.defineProperty(EventEmitter2.prototype, "event", {
			get: function() {
				var _this = this;
				if (!this._event) this._event = function(listener) {
					_this._listeners.push(listener);
					return { dispose: function() {
						for (var i = 0; i < _this._listeners.length; i++) if (_this._listeners[i] === listener) {
							_this._listeners.splice(i, 1);
							return;
						}
					} };
				};
				return this._event;
			},
			enumerable: false,
			configurable: true
		});
		EventEmitter2.prototype.fire = function(data) {
			var queue = [];
			for (var i = 0; i < this._listeners.length; i++) queue.push(this._listeners[i]);
			for (var i = 0; i < queue.length; i++) queue[i].call(void 0, data);
		};
		return EventEmitter2;
	}();
}));
//#endregion
//#region node_modules/node-pty/lib/terminal.js
var require_terminal = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2012-2015, Christopher Jeffrey (MIT License)
	* Copyright (c) 2016, Daniel Imms (MIT License).
	* Copyright (c) 2018, Microsoft Corporation (MIT License).
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Terminal = exports.DEFAULT_ROWS = exports.DEFAULT_COLS = void 0;
	var events_1 = __require("events");
	var eventEmitter2_1 = require_eventEmitter2();
	exports.DEFAULT_COLS = 80;
	exports.DEFAULT_ROWS = 24;
	/**
	* Default messages to indicate PAUSE/RESUME for automatic flow control.
	* To avoid conflicts with rebound XON/XOFF control codes (such as on-my-zsh),
	* the sequences can be customized in `IPtyForkOptions`.
	*/
	var FLOW_CONTROL_PAUSE = "";
	var FLOW_CONTROL_RESUME = "";
	exports.Terminal = function() {
		function Terminal(opt) {
			this._pid = 0;
			this._fd = 0;
			this._cols = 0;
			this._rows = 0;
			this._readable = false;
			this._writable = false;
			this._onData = new eventEmitter2_1.EventEmitter2();
			this._onExit = new eventEmitter2_1.EventEmitter2();
			this._internalee = new events_1.EventEmitter();
			this.handleFlowControl = !!(opt === null || opt === void 0 ? void 0 : opt.handleFlowControl);
			this._flowControlPause = (opt === null || opt === void 0 ? void 0 : opt.flowControlPause) || FLOW_CONTROL_PAUSE;
			this._flowControlResume = (opt === null || opt === void 0 ? void 0 : opt.flowControlResume) || FLOW_CONTROL_RESUME;
			if (!opt) return;
			this._checkType("name", opt.name ? opt.name : void 0, "string");
			this._checkType("cols", opt.cols ? opt.cols : void 0, "number");
			this._checkType("rows", opt.rows ? opt.rows : void 0, "number");
			this._checkType("cwd", opt.cwd ? opt.cwd : void 0, "string");
			this._checkType("env", opt.env ? opt.env : void 0, "object");
			this._checkType("uid", opt.uid ? opt.uid : void 0, "number");
			this._checkType("gid", opt.gid ? opt.gid : void 0, "number");
			this._checkType("encoding", opt.encoding ? opt.encoding : void 0, "string");
		}
		Object.defineProperty(Terminal.prototype, "onData", {
			get: function() {
				return this._onData.event;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Terminal.prototype, "onExit", {
			get: function() {
				return this._onExit.event;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Terminal.prototype, "pid", {
			get: function() {
				return this._pid;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Terminal.prototype, "cols", {
			get: function() {
				return this._cols;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(Terminal.prototype, "rows", {
			get: function() {
				return this._rows;
			},
			enumerable: false,
			configurable: true
		});
		Terminal.prototype.write = function(data) {
			if (this.handleFlowControl) {
				if (data === this._flowControlPause) {
					this.pause();
					return;
				}
				if (data === this._flowControlResume) {
					this.resume();
					return;
				}
			}
			this._write(data);
		};
		Terminal.prototype._forwardEvents = function() {
			var _this = this;
			this.on("data", function(e) {
				return _this._onData.fire(e);
			});
			this.on("exit", function(exitCode, signal) {
				return _this._onExit.fire({
					exitCode,
					signal
				});
			});
		};
		Terminal.prototype._checkType = function(name, value, type, allowArray) {
			if (allowArray === void 0) allowArray = false;
			if (value === void 0) return;
			if (allowArray) {
				if (Array.isArray(value)) {
					value.forEach(function(v, i) {
						if (typeof v !== type) throw new Error(name + "[" + i + "] must be a " + type + " (not a " + typeof v[i] + ")");
					});
					return;
				}
			}
			if (typeof value !== type) throw new Error(name + " must be a " + type + " (not a " + typeof value + ")");
		};
		/** See net.Socket.end */
		Terminal.prototype.end = function(data) {
			this._socket.end(data);
		};
		/** See stream.Readable.pipe */
		Terminal.prototype.pipe = function(dest, options) {
			return this._socket.pipe(dest, options);
		};
		/** See net.Socket.pause */
		Terminal.prototype.pause = function() {
			return this._socket.pause();
		};
		/** See net.Socket.resume */
		Terminal.prototype.resume = function() {
			return this._socket.resume();
		};
		/** See net.Socket.setEncoding */
		Terminal.prototype.setEncoding = function(encoding) {
			if (this._socket._decoder) delete this._socket._decoder;
			if (encoding) this._socket.setEncoding(encoding);
		};
		Terminal.prototype.addListener = function(eventName, listener) {
			this.on(eventName, listener);
		};
		Terminal.prototype.on = function(eventName, listener) {
			if (eventName === "close") {
				this._internalee.on("close", listener);
				return;
			}
			this._socket.on(eventName, listener);
		};
		Terminal.prototype.emit = function(eventName) {
			var args = [];
			for (var _i = 1; _i < arguments.length; _i++) args[_i - 1] = arguments[_i];
			if (eventName === "close") return this._internalee.emit.apply(this._internalee, arguments);
			return this._socket.emit.apply(this._socket, arguments);
		};
		Terminal.prototype.listeners = function(eventName) {
			return this._socket.listeners(eventName);
		};
		Terminal.prototype.removeListener = function(eventName, listener) {
			this._socket.removeListener(eventName, listener);
		};
		Terminal.prototype.removeAllListeners = function(eventName) {
			this._socket.removeAllListeners(eventName);
		};
		Terminal.prototype.once = function(eventName, listener) {
			this._socket.once(eventName, listener);
		};
		Terminal.prototype._close = function() {
			this._socket.readable = false;
			this.write = function() {};
			this.end = function() {};
			this._writable = false;
			this._readable = false;
		};
		Terminal.prototype._parseEnv = function(env) {
			var keys = Object.keys(env || {});
			var pairs = [];
			for (var i = 0; i < keys.length; i++) {
				if (keys[i] === void 0) continue;
				pairs.push(keys[i] + "=" + env[keys[i]]);
			}
			return pairs;
		};
		return Terminal;
	}();
}));
//#endregion
//#region node_modules/node-pty/lib/shared/conout.js
var require_conout = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2020, Microsoft Corporation (MIT License).
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getWorkerPipeName = void 0;
	function getWorkerPipeName(conoutPipeName) {
		return conoutPipeName + "-worker";
	}
	exports.getWorkerPipeName = getWorkerPipeName;
}));
//#endregion
//#region node_modules/node-pty/lib/windowsConoutConnection.js
var require_windowsConoutConnection = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2020, Microsoft Corporation (MIT License).
	*/
	var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	var __generator = exports && exports.__generator || function(thisArg, body) {
		var _ = {
			label: 0,
			sent: function() {
				if (t[0] & 1) throw t[1];
				return t[1];
			},
			trys: [],
			ops: []
		}, f, y, t, g;
		return g = {
			next: verb(0),
			"throw": verb(1),
			"return": verb(2)
		}, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
			return this;
		}), g;
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while (_) try {
				if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
				if (y = 0, t) op = [op[0] & 2, t.value];
				switch (op[0]) {
					case 0:
					case 1:
						t = op;
						break;
					case 4:
						_.label++;
						return {
							value: op[1],
							done: false
						};
					case 5:
						_.label++;
						y = op[1];
						op = [0];
						continue;
					case 7:
						op = _.ops.pop();
						_.trys.pop();
						continue;
					default:
						if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
							_ = 0;
							continue;
						}
						if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
							_.label = op[1];
							break;
						}
						if (op[0] === 6 && _.label < t[1]) {
							_.label = t[1];
							t = op;
							break;
						}
						if (t && _.label < t[2]) {
							_.label = t[2];
							_.ops.push(op);
							break;
						}
						if (t[2]) _.ops.pop();
						_.trys.pop();
						continue;
				}
				op = body.call(thisArg, _);
			} catch (e) {
				op = [6, e];
				y = 0;
			} finally {
				f = t = 0;
			}
			if (op[0] & 5) throw op[1];
			return {
				value: op[0] ? op[1] : void 0,
				done: true
			};
		}
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ConoutConnection = void 0;
	var worker_threads_1 = __require("worker_threads");
	var conout_1 = require_conout();
	var path_1 = __require("path");
	var eventEmitter2_1 = require_eventEmitter2();
	/**
	* The amount of time to wait for additional data after the conpty shell process has exited before
	* shutting down the worker and sockets. The timer will be reset if a new data event comes in after
	* the timer has started.
	*/
	var FLUSH_DATA_INTERVAL = 1e3;
	exports.ConoutConnection = function() {
		function ConoutConnection(_conoutPipeName, _useConptyDll) {
			var _this = this;
			this._conoutPipeName = _conoutPipeName;
			this._useConptyDll = _useConptyDll;
			this._isDisposed = false;
			this._onReady = new eventEmitter2_1.EventEmitter2();
			var workerData = { conoutPipeName: _conoutPipeName };
			var scriptPath = import.meta.dirname.replace("node_modules.asar", "node_modules.asar.unpacked");
			this._worker = new worker_threads_1.Worker(path_1.join(scriptPath, "worker/conoutSocketWorker.js"), { workerData });
			this._worker.on("message", function(message) {
				switch (message) {
					case 1:
						_this._onReady.fire();
						return;
					default: console.warn("Unexpected ConoutWorkerMessage", message);
				}
			});
		}
		Object.defineProperty(ConoutConnection.prototype, "onReady", {
			get: function() {
				return this._onReady.event;
			},
			enumerable: false,
			configurable: true
		});
		ConoutConnection.prototype.dispose = function() {
			if (!this._useConptyDll && this._isDisposed) return;
			this._isDisposed = true;
			this._drainDataAndClose();
		};
		ConoutConnection.prototype.connectSocket = function(socket) {
			socket.connect(conout_1.getWorkerPipeName(this._conoutPipeName));
		};
		ConoutConnection.prototype._drainDataAndClose = function() {
			var _this = this;
			if (this._drainTimeout) clearTimeout(this._drainTimeout);
			this._drainTimeout = setTimeout(function() {
				return _this._destroySocket();
			}, FLUSH_DATA_INTERVAL);
		};
		ConoutConnection.prototype._destroySocket = function() {
			return __awaiter(this, void 0, void 0, function() {
				return __generator(this, function(_a) {
					switch (_a.label) {
						case 0: return [4, this._worker.terminate()];
						case 1:
							_a.sent();
							return [2];
					}
				});
			});
		};
		return ConoutConnection;
	}();
}));
//#endregion
//#region node_modules/node-pty/lib/windowsPtyAgent.js
var require_windowsPtyAgent = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2012-2015, Christopher Jeffrey, Peter Sunde (MIT License)
	* Copyright (c) 2016, Daniel Imms (MIT License).
	* Copyright (c) 2018, Microsoft Corporation (MIT License).
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.argsToCommandLine = exports.WindowsPtyAgent = void 0;
	var fs$2 = __require("fs");
	var os$1 = __require("os");
	var path$3 = __require("path");
	var child_process_1 = __require("child_process");
	var net_1 = __require("net");
	var windowsConoutConnection_1 = require_windowsConoutConnection();
	var utils_1 = require_utils();
	var conptyNative;
	var winptyNative;
	/**
	* The amount of time to wait for additional data after the conpty shell process has exited before
	* shutting down the socket. The timer will be reset if a new data event comes in after the timer
	* has started.
	*/
	var FLUSH_DATA_INTERVAL = 1e3;
	exports.WindowsPtyAgent = function() {
		function WindowsPtyAgent(file, args, env, cwd, cols, rows, debug, _useConpty, _useConptyDll, conptyInheritCursor) {
			var _this = this;
			if (_useConptyDll === void 0) _useConptyDll = false;
			if (conptyInheritCursor === void 0) conptyInheritCursor = false;
			this._useConpty = _useConpty;
			this._useConptyDll = _useConptyDll;
			this._pid = 0;
			this._innerPid = 0;
			if (this._useConpty === void 0 || this._useConpty === true) this._useConpty = this._getWindowsBuildNumber() >= 18309;
			if (this._useConpty) {
				if (!conptyNative) conptyNative = utils_1.loadNativeModule("conpty").module;
			} else if (!winptyNative) winptyNative = utils_1.loadNativeModule("pty").module;
			this._ptyNative = this._useConpty ? conptyNative : winptyNative;
			cwd = path$3.resolve(cwd);
			var commandLine = argsToCommandLine(file, args);
			var term;
			if (this._useConpty) term = this._ptyNative.startProcess(file, cols, rows, debug, this._generatePipeName(), conptyInheritCursor, this._useConptyDll);
			else {
				term = this._ptyNative.startProcess(file, commandLine, env, cwd, cols, rows, debug);
				this._pid = term.pid;
				this._innerPid = term.innerPid;
			}
			this._fd = term.fd;
			this._pty = term.pty;
			this._outSocket = new net_1.Socket();
			this._outSocket.setEncoding("utf8");
			this._conoutSocketWorker = new windowsConoutConnection_1.ConoutConnection(term.conout, this._useConptyDll);
			this._conoutSocketWorker.onReady(function() {
				_this._conoutSocketWorker.connectSocket(_this._outSocket);
			});
			this._outSocket.on("connect", function() {
				_this._outSocket.emit("ready_datapipe");
			});
			var inSocketFD = fs$2.openSync(term.conin, "w");
			this._inSocket = new net_1.Socket({
				fd: inSocketFD,
				readable: false,
				writable: true
			});
			this._inSocket.setEncoding("utf8");
			if (this._useConpty) {
				var connect = this._ptyNative.connect(this._pty, commandLine, cwd, env, this._useConptyDll, function(c) {
					return _this._$onProcessExit(c);
				});
				this._innerPid = connect.pid;
			}
		}
		Object.defineProperty(WindowsPtyAgent.prototype, "inSocket", {
			get: function() {
				return this._inSocket;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(WindowsPtyAgent.prototype, "outSocket", {
			get: function() {
				return this._outSocket;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(WindowsPtyAgent.prototype, "fd", {
			get: function() {
				return this._fd;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(WindowsPtyAgent.prototype, "innerPid", {
			get: function() {
				return this._innerPid;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(WindowsPtyAgent.prototype, "pty", {
			get: function() {
				return this._pty;
			},
			enumerable: false,
			configurable: true
		});
		WindowsPtyAgent.prototype.resize = function(cols, rows) {
			if (this._useConpty) {
				if (this._exitCode !== void 0) throw new Error("Cannot resize a pty that has already exited");
				this._ptyNative.resize(this._pty, cols, rows, this._useConptyDll);
				return;
			}
			this._ptyNative.resize(this._pid, cols, rows);
		};
		WindowsPtyAgent.prototype.clear = function() {
			if (this._useConpty) this._ptyNative.clear(this._pty, this._useConptyDll);
		};
		WindowsPtyAgent.prototype.kill = function() {
			var _this = this;
			if (this._useConpty) {
				if (!this._useConptyDll) {
					this._inSocket.readable = false;
					this._outSocket.readable = false;
					this._getConsoleProcessList().then(function(consoleProcessList) {
						consoleProcessList.forEach(function(pid) {
							try {
								process.kill(pid);
							} catch (e) {}
						});
					});
					this._ptyNative.kill(this._pty, this._useConptyDll);
					this._conoutSocketWorker.dispose();
				} else {
					this._inSocket.destroy();
					this._ptyNative.kill(this._pty, this._useConptyDll);
					this._outSocket.on("data", function() {
						_this._conoutSocketWorker.dispose();
					});
				}
			} else {
				var processList = this._ptyNative.getProcessList(this._pid);
				this._ptyNative.kill(this._pid, this._innerPid);
				processList.forEach(function(pid) {
					try {
						process.kill(pid);
					} catch (e) {}
				});
			}
		};
		WindowsPtyAgent.prototype._getConsoleProcessList = function() {
			var _this = this;
			return new Promise(function(resolve) {
				var agent = child_process_1.fork(path$3.join(import.meta.dirname, "conpty_console_list_agent"), [_this._innerPid.toString()]);
				agent.on("message", function(message) {
					clearTimeout(timeout);
					resolve(message.consoleProcessList);
				});
				var timeout = setTimeout(function() {
					agent.kill();
					resolve([_this._innerPid]);
				}, 5e3);
			});
		};
		Object.defineProperty(WindowsPtyAgent.prototype, "exitCode", {
			get: function() {
				if (this._useConpty) return this._exitCode;
				var winptyExitCode = this._ptyNative.getExitCode(this._innerPid);
				return winptyExitCode === -1 ? void 0 : winptyExitCode;
			},
			enumerable: false,
			configurable: true
		});
		WindowsPtyAgent.prototype._getWindowsBuildNumber = function() {
			var osVersion = /(\d+)\.(\d+)\.(\d+)/g.exec(os$1.release());
			var buildNumber = 0;
			if (osVersion && osVersion.length === 4) buildNumber = parseInt(osVersion[3]);
			return buildNumber;
		};
		WindowsPtyAgent.prototype._generatePipeName = function() {
			return "conpty-" + Math.random() * 1e7;
		};
		/**
		* Triggered from the native side when a contpy process exits.
		*/
		WindowsPtyAgent.prototype._$onProcessExit = function(exitCode) {
			var _this = this;
			this._exitCode = exitCode;
			if (!this._useConptyDll) {
				this._flushDataAndCleanUp();
				this._outSocket.on("data", function() {
					return _this._flushDataAndCleanUp();
				});
			}
		};
		WindowsPtyAgent.prototype._flushDataAndCleanUp = function() {
			var _this = this;
			if (this._useConptyDll) return;
			if (this._closeTimeout) clearTimeout(this._closeTimeout);
			this._closeTimeout = setTimeout(function() {
				return _this._cleanUpProcess();
			}, FLUSH_DATA_INTERVAL);
		};
		WindowsPtyAgent.prototype._cleanUpProcess = function() {
			if (this._useConptyDll) return;
			this._inSocket.readable = false;
			this._outSocket.readable = false;
			this._outSocket.destroy();
		};
		return WindowsPtyAgent;
	}();
	function argsToCommandLine(file, args) {
		if (isCommandLine(args)) {
			if (args.length === 0) return file;
			return argsToCommandLine(file, []) + " " + args;
		}
		var argv = [file];
		Array.prototype.push.apply(argv, args);
		var result = "";
		for (var argIndex = 0; argIndex < argv.length; argIndex++) {
			if (argIndex > 0) result += " ";
			var arg = argv[argIndex];
			var hasLopsidedEnclosingQuote = xOr(arg[0] !== "\"", arg[arg.length - 1] !== "\"");
			var hasNoEnclosingQuotes = arg[0] !== "\"" && arg[arg.length - 1] !== "\"";
			var quote = arg === "" || (arg.indexOf(" ") !== -1 || arg.indexOf("	") !== -1) && arg.length > 1 && (hasLopsidedEnclosingQuote || hasNoEnclosingQuotes);
			if (quote) result += "\"";
			var bsCount = 0;
			for (var i = 0; i < arg.length; i++) {
				var p = arg[i];
				if (p === "\\") bsCount++;
				else if (p === "\"") {
					result += repeatText("\\", bsCount * 2 + 1);
					result += "\"";
					bsCount = 0;
				} else {
					result += repeatText("\\", bsCount);
					bsCount = 0;
					result += p;
				}
			}
			if (quote) {
				result += repeatText("\\", bsCount * 2);
				result += "\"";
			} else result += repeatText("\\", bsCount);
		}
		return result;
	}
	exports.argsToCommandLine = argsToCommandLine;
	function isCommandLine(args) {
		return typeof args === "string";
	}
	function repeatText(text, count) {
		var result = "";
		for (var i = 0; i < count; i++) result += text;
		return result;
	}
	function xOr(arg1, arg2) {
		return arg1 && !arg2 || !arg1 && arg2;
	}
}));
//#endregion
//#region node_modules/node-pty/lib/windowsTerminal.js
var require_windowsTerminal = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2012-2015, Christopher Jeffrey, Peter Sunde (MIT License)
	* Copyright (c) 2016, Daniel Imms (MIT License).
	* Copyright (c) 2018, Microsoft Corporation (MIT License).
	*/
	var __extends = exports && exports.__extends || (function() {
		var extendStatics = function(d, b) {
			extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
				d.__proto__ = b;
			} || function(d, b) {
				for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WindowsTerminal = void 0;
	var terminal_1 = require_terminal();
	var windowsPtyAgent_1 = require_windowsPtyAgent();
	var utils_1 = require_utils();
	var DEFAULT_FILE = "cmd.exe";
	var DEFAULT_NAME = "Windows Shell";
	exports.WindowsTerminal = function(_super) {
		__extends(WindowsTerminal, _super);
		function WindowsTerminal(file, args, opt) {
			var _this = _super.call(this, opt) || this;
			_this._checkType("args", args, "string", true);
			args = args || [];
			file = file || DEFAULT_FILE;
			opt = opt || {};
			opt.env = opt.env || process.env;
			if (opt.encoding) console.warn("Setting encoding on Windows is not supported");
			var env = utils_1.assign({}, opt.env);
			_this._cols = opt.cols || terminal_1.DEFAULT_COLS;
			_this._rows = opt.rows || terminal_1.DEFAULT_ROWS;
			var cwd = opt.cwd || process.cwd();
			var name = opt.name || env.TERM || DEFAULT_NAME;
			var parsedEnv = _this._parseEnv(env);
			_this._isReady = false;
			_this._deferreds = [];
			_this._agent = new windowsPtyAgent_1.WindowsPtyAgent(file, args, parsedEnv, cwd, _this._cols, _this._rows, false, opt.useConpty, opt.useConptyDll, opt.conptyInheritCursor);
			_this._socket = _this._agent.outSocket;
			_this._pid = _this._agent.innerPid;
			_this._fd = _this._agent.fd;
			_this._pty = _this._agent.pty;
			_this._socket.on("ready_datapipe", function() {
				_this._socket.once("data", function() {
					if (!_this._isReady) {
						_this._isReady = true;
						_this._deferreds.forEach(function(fn) {
							fn.run();
						});
						_this._deferreds = [];
					}
				});
				_this._socket.on("error", function(err) {
					_this._close();
					if (err.code) {
						if (~err.code.indexOf("errno 5") || ~err.code.indexOf("EIO")) return;
					}
					if (_this.listeners("error").length < 2) throw err;
				});
				_this._socket.on("close", function() {
					_this.emit("exit", _this._agent.exitCode);
					_this._close();
				});
			});
			_this._file = file;
			_this._name = name;
			_this._readable = true;
			_this._writable = true;
			_this._forwardEvents();
			return _this;
		}
		WindowsTerminal.prototype._write = function(data) {
			this._defer(this._doWrite, data);
		};
		WindowsTerminal.prototype._doWrite = function(data) {
			this._agent.inSocket.write(data);
		};
		/**
		* openpty
		*/
		WindowsTerminal.open = function(options) {
			throw new Error("open() not supported on windows, use Fork() instead.");
		};
		/**
		* TTY
		*/
		WindowsTerminal.prototype.resize = function(cols, rows) {
			var _this = this;
			if (cols <= 0 || rows <= 0 || isNaN(cols) || isNaN(rows) || cols === Infinity || rows === Infinity) throw new Error("resizing must be done using positive cols and rows");
			this._deferNoArgs(function() {
				_this._agent.resize(cols, rows);
				_this._cols = cols;
				_this._rows = rows;
			});
		};
		WindowsTerminal.prototype.clear = function() {
			var _this = this;
			this._deferNoArgs(function() {
				_this._agent.clear();
			});
		};
		WindowsTerminal.prototype.destroy = function() {
			var _this = this;
			this._deferNoArgs(function() {
				_this.kill();
			});
		};
		WindowsTerminal.prototype.kill = function(signal) {
			var _this = this;
			this._deferNoArgs(function() {
				if (signal) throw new Error("Signals not supported on windows.");
				_this._close();
				_this._agent.kill();
			});
		};
		WindowsTerminal.prototype._deferNoArgs = function(deferredFn) {
			var _this = this;
			if (this._isReady) {
				deferredFn.call(this);
				return;
			}
			this._deferreds.push({ run: function() {
				return deferredFn.call(_this);
			} });
		};
		WindowsTerminal.prototype._defer = function(deferredFn, arg) {
			var _this = this;
			if (this._isReady) {
				deferredFn.call(this, arg);
				return;
			}
			this._deferreds.push({ run: function() {
				return deferredFn.call(_this, arg);
			} });
		};
		Object.defineProperty(WindowsTerminal.prototype, "process", {
			get: function() {
				return this._name;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(WindowsTerminal.prototype, "master", {
			get: function() {
				throw new Error("master is not supported on Windows");
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(WindowsTerminal.prototype, "slave", {
			get: function() {
				throw new Error("slave is not supported on Windows");
			},
			enumerable: false,
			configurable: true
		});
		return WindowsTerminal;
	}(terminal_1.Terminal);
}));
//#endregion
//#region node_modules/node-pty/lib/unixTerminal.js
var require_unixTerminal = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __extends = exports && exports.__extends || (function() {
		var extendStatics = function(d, b) {
			extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
				d.__proto__ = b;
			} || function(d, b) {
				for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
			};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UnixTerminal = void 0;
	/**
	* Copyright (c) 2012-2015, Christopher Jeffrey (MIT License)
	* Copyright (c) 2016, Daniel Imms (MIT License).
	* Copyright (c) 2018, Microsoft Corporation (MIT License).
	*/
	var fs$1 = __require("fs");
	var path$2 = __require("path");
	var tty$1 = __require("tty");
	var terminal_1 = require_terminal();
	var utils_1 = require_utils();
	var native = utils_1.loadNativeModule("pty");
	var pty = native.module;
	var helperPath = native.dir + "/spawn-helper";
	helperPath = path$2.resolve(import.meta.dirname, helperPath);
	helperPath = helperPath.replace("app.asar", "app.asar.unpacked");
	helperPath = helperPath.replace("node_modules.asar", "node_modules.asar.unpacked");
	var DEFAULT_FILE = "sh";
	var DEFAULT_NAME = "xterm";
	var DESTROY_SOCKET_TIMEOUT_MS = 200;
	exports.UnixTerminal = function(_super) {
		__extends(UnixTerminal, _super);
		function UnixTerminal(file, args, opt) {
			var _a, _b;
			var _this = _super.call(this, opt) || this;
			_this._boundClose = false;
			_this._emittedClose = false;
			if (typeof args === "string") throw new Error("args as a string is not supported on unix.");
			args = args || [];
			file = file || DEFAULT_FILE;
			opt = opt || {};
			opt.env = opt.env || process.env;
			_this._cols = opt.cols || terminal_1.DEFAULT_COLS;
			_this._rows = opt.rows || terminal_1.DEFAULT_ROWS;
			var uid = (_a = opt.uid) !== null && _a !== void 0 ? _a : -1;
			var gid = (_b = opt.gid) !== null && _b !== void 0 ? _b : -1;
			var env = utils_1.assign({}, opt.env);
			if (opt.env === process.env) _this._sanitizeEnv(env);
			var cwd = opt.cwd || process.cwd();
			env.PWD = cwd;
			var name = opt.name || env.TERM || DEFAULT_NAME;
			env.TERM = name;
			var parsedEnv = _this._parseEnv(env);
			var encoding = opt.encoding === void 0 ? "utf8" : opt.encoding;
			var onexit = function(code, signal) {
				if (!_this._emittedClose) {
					if (_this._boundClose) return;
					_this._boundClose = true;
					var timeout_1 = setTimeout(function() {
						timeout_1 = null;
						_this._socket.destroy();
					}, DESTROY_SOCKET_TIMEOUT_MS);
					_this.once("close", function() {
						if (timeout_1 !== null) clearTimeout(timeout_1);
						_this.emit("exit", code, signal);
					});
					return;
				}
				_this.emit("exit", code, signal);
			};
			var term = pty.fork(file, args, parsedEnv, cwd, _this._cols, _this._rows, uid, gid, encoding === "utf8", helperPath, onexit);
			_this._socket = new tty$1.ReadStream(term.fd);
			if (encoding !== null) _this._socket.setEncoding(encoding);
			_this._writeStream = new CustomWriteStream(term.fd, encoding || void 0);
			_this._socket.on("error", function(err) {
				if (err.code) {
					if (~err.code.indexOf("EAGAIN")) return;
				}
				_this._close();
				if (!_this._emittedClose) {
					_this._emittedClose = true;
					_this.emit("close");
				}
				if (err.code) {
					if (~err.code.indexOf("errno 5") || ~err.code.indexOf("EIO")) return;
				}
				if (_this.listeners("error").length < 2) throw err;
			});
			_this._pid = term.pid;
			_this._fd = term.fd;
			_this._pty = term.pty;
			_this._file = file;
			_this._name = name;
			_this._readable = true;
			_this._writable = true;
			_this._socket.on("close", function() {
				if (_this._emittedClose) return;
				_this._emittedClose = true;
				_this._close();
				_this.emit("close");
			});
			_this._forwardEvents();
			return _this;
		}
		Object.defineProperty(UnixTerminal.prototype, "master", {
			get: function() {
				return this._master;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(UnixTerminal.prototype, "slave", {
			get: function() {
				return this._slave;
			},
			enumerable: false,
			configurable: true
		});
		UnixTerminal.prototype._write = function(data) {
			this._writeStream.write(data);
		};
		Object.defineProperty(UnixTerminal.prototype, "fd", {
			get: function() {
				return this._fd;
			},
			enumerable: false,
			configurable: true
		});
		Object.defineProperty(UnixTerminal.prototype, "ptsName", {
			get: function() {
				return this._pty;
			},
			enumerable: false,
			configurable: true
		});
		/**
		* openpty
		*/
		UnixTerminal.open = function(opt) {
			var self = Object.create(UnixTerminal.prototype);
			opt = opt || {};
			if (arguments.length > 1) opt = {
				cols: arguments[1],
				rows: arguments[2]
			};
			var cols = opt.cols || terminal_1.DEFAULT_COLS;
			var rows = opt.rows || terminal_1.DEFAULT_ROWS;
			var encoding = opt.encoding === void 0 ? "utf8" : opt.encoding;
			var term = pty.open(cols, rows);
			self._master = new tty$1.ReadStream(term.master);
			if (encoding !== null) self._master.setEncoding(encoding);
			self._master.resume();
			self._slave = new tty$1.ReadStream(term.slave);
			if (encoding !== null) self._slave.setEncoding(encoding);
			self._slave.resume();
			self._socket = self._master;
			self._pid = -1;
			self._fd = term.master;
			self._pty = term.pty;
			self._file = process.argv[0] || "node";
			self._name = process.env.TERM || "";
			self._readable = true;
			self._writable = true;
			self._socket.on("error", function(err) {
				self._close();
				if (self.listeners("error").length < 2) throw err;
			});
			self._socket.on("close", function() {
				self._close();
			});
			return self;
		};
		UnixTerminal.prototype.destroy = function() {
			var _this = this;
			this._close();
			this._socket.once("close", function() {
				_this.kill("SIGHUP");
			});
			this._socket.destroy();
			this._writeStream.dispose();
		};
		UnixTerminal.prototype.kill = function(signal) {
			try {
				process.kill(this.pid, signal || "SIGHUP");
			} catch (e) {}
		};
		Object.defineProperty(UnixTerminal.prototype, "process", {
			/**
			* Gets the name of the process.
			*/
			get: function() {
				if (process.platform === "darwin") {
					var title = pty.process(this._fd);
					return title !== "kernel_task" ? title : this._file;
				}
				return pty.process(this._fd, this._pty) || this._file;
			},
			enumerable: false,
			configurable: true
		});
		/**
		* TTY
		*/
		UnixTerminal.prototype.resize = function(cols, rows) {
			if (cols <= 0 || rows <= 0 || isNaN(cols) || isNaN(rows) || cols === Infinity || rows === Infinity) throw new Error("resizing must be done using positive cols and rows");
			pty.resize(this._fd, cols, rows);
			this._cols = cols;
			this._rows = rows;
		};
		UnixTerminal.prototype.clear = function() {};
		UnixTerminal.prototype._sanitizeEnv = function(env) {
			delete env["TMUX"];
			delete env["TMUX_PANE"];
			delete env["STY"];
			delete env["WINDOW"];
			delete env["WINDOWID"];
			delete env["TERMCAP"];
			delete env["COLUMNS"];
			delete env["LINES"];
		};
		return UnixTerminal;
	}(terminal_1.Terminal);
	/**
	* A custom write stream that writes directly to a file descriptor with proper
	* handling of backpressure and errors. This avoids some event loop exhaustion
	* issues that can occur when using the standard APIs in Node.
	*/
	var CustomWriteStream = function() {
		function CustomWriteStream(_fd, _encoding) {
			this._fd = _fd;
			this._encoding = _encoding;
			this._writeQueue = [];
		}
		CustomWriteStream.prototype.dispose = function() {
			clearImmediate(this._writeImmediate);
			this._writeImmediate = void 0;
		};
		CustomWriteStream.prototype.write = function(data) {
			var buffer = typeof data === "string" ? Buffer.from(data, this._encoding) : Buffer.from(data);
			if (buffer.byteLength !== 0) {
				this._writeQueue.push({
					buffer,
					offset: 0
				});
				if (this._writeQueue.length === 1) this._processWriteQueue();
			}
		};
		CustomWriteStream.prototype._processWriteQueue = function() {
			var _this = this;
			this._writeImmediate = void 0;
			if (this._writeQueue.length === 0) return;
			var task = this._writeQueue[0];
			fs$1.write(this._fd, task.buffer, task.offset, function(err, written) {
				if (err) {
					if ("code" in err && err.code === "EAGAIN") _this._writeImmediate = setImmediate(function() {
						return _this._processWriteQueue();
					});
					else {
						_this._writeQueue.length = 0;
						console.error("Unhandled pty write error", err);
					}
					return;
				}
				task.offset += written;
				if (task.offset >= task.buffer.byteLength) _this._writeQueue.shift();
				_this._processWriteQueue();
			});
		};
		return CustomWriteStream;
	}();
}));
//#endregion
//#region electron/drivers.ts
var import_lib = (/* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Copyright (c) 2012-2015, Christopher Jeffrey, Peter Sunde (MIT License)
	* Copyright (c) 2016, Daniel Imms (MIT License).
	* Copyright (c) 2018, Microsoft Corporation (MIT License).
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.native = exports.open = exports.createTerminal = exports.fork = exports.spawn = void 0;
	var utils_1 = require_utils();
	var terminalCtor;
	if (process.platform === "win32") terminalCtor = require_windowsTerminal().WindowsTerminal;
	else terminalCtor = require_unixTerminal().UnixTerminal;
	/**
	* Forks a process as a pseudoterminal.
	* @param file The file to launch.
	* @param args The file's arguments as argv (string[]) or in a pre-escaped
	* CommandLine format (string). Note that the CommandLine option is only
	* available on Windows and is expected to be escaped properly.
	* @param options The options of the terminal.
	* @throws When the file passed to spawn with does not exists.
	* @see CommandLineToArgvW https://msdn.microsoft.com/en-us/library/windows/desktop/bb776391(v=vs.85).aspx
	* @see Parsing C++ Comamnd-Line Arguments https://msdn.microsoft.com/en-us/library/17w5ykft.aspx
	* @see GetCommandLine https://msdn.microsoft.com/en-us/library/windows/desktop/ms683156.aspx
	*/
	function spawn(file, args, opt) {
		return new terminalCtor(file, args, opt);
	}
	exports.spawn = spawn;
	/** @deprecated */
	function fork(file, args, opt) {
		return new terminalCtor(file, args, opt);
	}
	exports.fork = fork;
	/** @deprecated */
	function createTerminal(file, args, opt) {
		return new terminalCtor(file, args, opt);
	}
	exports.createTerminal = createTerminal;
	function open(options) {
		return terminalCtor.open(options);
	}
	exports.open = open;
	/**
	* Expose the native API when not Windows, note that this is not public API and
	* could be removed at any time.
	*/
	exports.native = process.platform !== "win32" ? utils_1.loadNativeModule("pty").module : null;
})))();
var BaseDriver = class {
	ptyProcess = null;
	rawOutput = "";
	/** Parse raw output to extract summary, tokens, cost */
	parseResult(_raw) {
		return {};
	}
	run(task, workdir, onOutput) {
		const jobId = Math.random().toString(36).substring(7);
		this.rawOutput = "";
		return {
			jobId,
			promise: new Promise((resolve) => {
				const { command, args } = this.getCommandAndArgs(task);
				const isWin = os.platform() === "win32";
				const shell = isWin ? "cmd.exe" : "bash";
				const fullCmd = [command, ...args].join(" ");
				const shellArgs = isWin ? ["/c", fullCmd] : ["-c", fullCmd];
				this.ptyProcess = (0, import_lib.spawn)(shell, shellArgs, {
					name: "xterm-color",
					cols: 120,
					rows: 40,
					cwd: workdir,
					env: { ...process.env }
				});
				this.ptyProcess.onData((data) => {
					this.rawOutput += data;
					onOutput(data);
				});
				this.ptyProcess.onExit(({ exitCode }) => {
					const parsed = this.parseResult(this.rawOutput);
					resolve({
						status: exitCode === 0 ? "success" : "failed",
						summary: parsed.summary || (exitCode === 0 ? "Task completed." : `Process exited with code ${exitCode}`),
						raw: this.rawOutput,
						tokenCount: parsed.tokenCount,
						cost: parsed.cost
					});
				});
			})
		};
	}
	cancel(_jobId) {
		if (this.ptyProcess) {
			this.ptyProcess.kill();
			this.ptyProcess = null;
		}
	}
};
var ClaudeCodeDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "claude",
			args: [
				"-p",
				`"${task}"`,
				"--output-format",
				"json"
			]
		};
	}
	parseResult(raw) {
		try {
			const json = JSON.parse(raw.trim().split("\n").filter((l) => l.startsWith("{")).join(""));
			return {
				summary: json.result || json.summary || "Done",
				tokenCount: json.usage?.input_tokens,
				cost: json.usage?.input_tokens ? json.usage.input_tokens * 3e-6 : 0
			};
		} catch {
			return {};
		}
	}
};
var CodexDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "codex",
			args: [
				"exec",
				`"${task}"`,
				"--full-auto"
			]
		};
	}
};
var AntigravityDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "agy",
			args: [
				"-p",
				`"${task}"`,
				"--output-format",
				"json"
			]
		};
	}
	parseResult(raw) {
		if (raw.includes("Authentication required") || raw.includes("not logged in")) return {
			summary: "⚠️ Auth error: run `agy login` first",
			status: "failed"
		};
		return {};
	}
};
var AiderDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "aider",
			args: [
				"--message",
				`"${task}"`,
				"--yes",
				"--no-auto-commits"
			]
		};
	}
	parseResult(raw) {
		const tokenMatch = raw.match(/Tokens:\s*([\d,]+)\s*sent/i);
		const costMatch = raw.match(/Cost:\s*\$?([\d.]+)/i);
		return {
			tokenCount: tokenMatch ? parseInt(tokenMatch[1].replace(",", "")) : void 0,
			cost: costMatch ? parseFloat(costMatch[1]) : void 0
		};
	}
};
var OpenCodeDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "opencode",
			args: [
				"run",
				`"${task}"`,
				"--yes"
			]
		};
	}
};
var CursorDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "cursor",
			args: [
				"--task",
				`"${task}"`,
				"--headless"
			]
		};
	}
};
var GithubCopilotDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "gh",
			args: [
				"api",
				"copilot/chat",
				"-f",
				`message="${task}"`,
				"--method",
				"POST"
			]
		};
	}
	parseResult(raw) {
		try {
			const json = JSON.parse(raw.trim().split("\n").filter((l) => l.startsWith("{")).join(""));
			return { summary: json.content || json.message || "Done" };
		} catch {
			return {};
		}
	}
};
var DummyDriver = class extends BaseDriver {
	getCommandAndArgs(task) {
		return {
			command: "echo",
			args: [`"[Robent] Running: ${task.substring(0, 80)}..."`]
		};
	}
};
function createDriver(agentName) {
	switch (agentName?.toLowerCase().replace(/\s+/g, "-")) {
		case "claude-code":
		case "claude code": return new ClaudeCodeDriver();
		case "codex": return new CodexDriver();
		case "antigravity": return new AntigravityDriver();
		case "aider": return new AiderDriver();
		case "opencode": return new OpenCodeDriver();
		case "cursor": return new CursorDriver();
		case "github copilot":
		case "github-copilot": return new GithubCopilotDriver();
		default: return new DummyDriver();
	}
}
//#endregion
//#region electron/db.ts
/**
* electron/db.ts — SQLite Job Store
* All persistent state: jobs, agents, credentials, activities, MCP servers, skills
*/
var Database = createRequire(import.meta.url)("better-sqlite3");
var db;
function getDb() {
	if (!db) {
		const userDataPath = app.getPath("userData");
		mkdirSync(userDataPath, { recursive: true });
		db = new Database(join(userDataPath, "robent.db"));
		db.pragma("journal_mode = WAL");
		db.pragma("foreign_keys = ON");
		initSchema();
	}
	return db;
}
function ensureColumn(table, column, ddl) {
	if (!db.prepare(`PRAGMA table_info(${table})`).all().some((item) => item.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}
function initSchema() {
	db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned',
      priority TEXT NOT NULL DEFAULT 'normal',
      agent TEXT NOT NULL DEFAULT 'Aider',
      branch TEXT,
      worktree TEXT,
      pr_number INTEGER,
      ci_status TEXT DEFAULT 'none',
      runtime INTEGER DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      failed_tests TEXT,
      sub_status TEXT,
      token_count INTEGER DEFAULT 0,
      estimated_cost REAL DEFAULT 0,
      diff TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS terminal_lines (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      agent TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      runtime INTEGER DEFAULT 0,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      agent TEXT NOT NULL,
      label TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mcp_servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      command TEXT NOT NULL,
      args TEXT DEFAULT '[]',
      env TEXT DEFAULT '{}',
      is_enabled INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plugins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      command TEXT,
      args TEXT DEFAULT '[]',
      env TEXT DEFAULT '{}',
      is_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      git_remote TEXT DEFAULT '',
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tool_statuses (
      tool_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      binary TEXT NOT NULL,
      version TEXT,
      installed INTEGER NOT NULL DEFAULT 0,
      auth_status TEXT NOT NULL DEFAULT 'not-installed',
      available INTEGER NOT NULL DEFAULT 0,
      details TEXT,
      last_checked_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tool_secrets (
      tool_id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      secret_encrypted TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
	ensureColumn("mcp_servers", "transport", "transport TEXT DEFAULT 'stdio'");
	ensureColumn("mcp_servers", "url", "url TEXT DEFAULT ''");
	ensureColumn("mcp_servers", "enabled", "enabled INTEGER DEFAULT 1");
	ensureColumn("mcp_servers", "is_enabled", "is_enabled INTEGER DEFAULT 1");
	ensureColumn("skills", "description", "description TEXT DEFAULT ''");
	ensureColumn("skills", "tags", "tags TEXT DEFAULT '[]'");
	ensureColumn("skills", "enabled", "enabled INTEGER DEFAULT 1");
	ensureColumn("plugins", "source", "source TEXT DEFAULT ''");
	ensureColumn("plugins", "version", "version TEXT DEFAULT ''");
	ensureColumn("plugins", "enabled", "enabled INTEGER DEFAULT 1");
	ensureColumn("plugins", "is_enabled", "is_enabled INTEGER DEFAULT 1");
}
function createJob(job) {
	getDb().prepare(`INSERT INTO jobs (id, title, description, agent, priority, status) VALUES (?, ?, ?, ?, ?, 'planned')`).run(job.id, job.title, job.description, job.agent, job.priority);
}
function getJobs() {
	return getDb().prepare(`SELECT * FROM jobs ORDER BY created_at DESC`).all();
}
function getJob(id) {
	return getDb().prepare(`SELECT * FROM jobs WHERE id = ?`).get(id);
}
function updateJob(id, fields) {
	const keys = Object.keys(fields);
	if (keys.length === 0) return;
	const setClause = keys.map((k) => `${k} = ?`).join(", ");
	const values = Object.values(fields);
	getDb().prepare(`UPDATE jobs SET ${setClause} WHERE id = ?`).run(...values, id);
}
function addActivity(activity) {
	getDb().prepare(`INSERT INTO activities (id, job_id, type, message) VALUES (?, ?, ?, ?)`).run(activity.id, activity.jobId || null, activity.type, activity.message);
}
function getActivities(limit = 50) {
	return getDb().prepare(`SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?`).all(limit);
}
function addTerminalLine(line) {
	getDb().prepare(`INSERT INTO terminal_lines (id, job_id, type, content) VALUES (?, ?, ?, ?)`).run(line.id, line.jobId, line.type, line.content);
}
function getTerminalLines(jobId) {
	return getDb().prepare(`SELECT * FROM terminal_lines WHERE job_id = ? ORDER BY timestamp ASC`).all(jobId);
}
function upsertWorker(worker) {
	getDb().prepare(`INSERT OR REPLACE INTO workers (id, job_id, agent, status, runtime) VALUES (?, ?, ?, ?, ?)`).run(worker.id, worker.jobId, worker.agent, worker.status, worker.runtime);
}
function removeWorker(jobId) {
	getDb().prepare(`DELETE FROM workers WHERE job_id = ?`).run(jobId);
}
function getWorkers() {
	return getDb().prepare(`SELECT w.*, j.title as task_title FROM workers w JOIN jobs j ON j.id = w.job_id`).all();
}
function getMcpServers() {
	return getDb().prepare(`SELECT * FROM mcp_servers ORDER BY name`).all();
}
function addMcpServer(server) {
	getDb().prepare(`INSERT INTO mcp_servers (id, name, transport, command, url, args, env, enabled, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(server.id, server.name, server.transport || "stdio", server.command || "", server.url || "", server.args || "[]", server.env || "{}", server.enabled === false ? 0 : 1, server.enabled === false ? 0 : 1);
}
function updateMcpServer(id, fields) {
	const keys = Object.keys(fields);
	if (keys.length === 0) return;
	const setClause = keys.map((k) => `${k} = ?`).join(", ");
	const values = Object.values(fields);
	getDb().prepare(`UPDATE mcp_servers SET ${setClause} WHERE id = ?`).run(...values, id);
}
function deleteMcpServer(id) {
	getDb().prepare(`DELETE FROM mcp_servers WHERE id = ?`).run(id);
}
function getCredentials() {
	return getDb().prepare(`SELECT id, agent, label, is_active, created_at FROM credentials`).all();
}
function addCredential(cred) {
	getDb().prepare(`INSERT INTO credentials (id, agent, label) VALUES (?, ?, ?)`).run(cred.id, cred.agent, cred.label);
}
function deleteCredential(id) {
	getDb().prepare(`DELETE FROM credentials WHERE id = ?`).run(id);
}
function getSkills() {
	return getDb().prepare(`SELECT * FROM skills ORDER BY created_at DESC`).all();
}
function addSkill(skill) {
	getDb().prepare(`INSERT INTO skills (id, name, description, content, tags, enabled) VALUES (?, ?, ?, ?, ?, ?)`).run(skill.id, skill.name, skill.description || "", skill.content, skill.tags || "[]", skill.enabled === false ? 0 : 1);
}
function updateSkill(id, fields) {
	const keys = Object.keys(fields);
	if (keys.length === 0) return;
	const setClause = keys.map((k) => `${k} = ?`).join(", ");
	const values = Object.values(fields);
	getDb().prepare(`UPDATE skills SET ${setClause} WHERE id = ?`).run(...values, id);
}
function deleteSkill(id) {
	getDb().prepare(`DELETE FROM skills WHERE id = ?`).run(id);
}
function getPlugins() {
	return getDb().prepare(`SELECT * FROM plugins ORDER BY created_at DESC`).all();
}
function addPlugin(plugin) {
	getDb().prepare(`INSERT INTO plugins (id, name, source, version, type, command, args, env, enabled, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(plugin.id, plugin.name, plugin.source || "", plugin.version || "", plugin.type || "", plugin.command || null, plugin.args || "[]", plugin.env || "{}", plugin.enabled === false ? 0 : 1, plugin.enabled === false ? 0 : 1);
}
function updatePlugin(id, fields) {
	const keys = Object.keys(fields);
	if (keys.length === 0) return;
	const setClause = keys.map((k) => `${k} = ?`).join(", ");
	const values = Object.values(fields);
	getDb().prepare(`UPDATE plugins SET ${setClause} WHERE id = ?`).run(...values, id);
}
function deletePlugin(id) {
	getDb().prepare(`DELETE FROM plugins WHERE id = ?`).run(id);
}
function togglePlugin(id, enabled) {
	getDb().prepare(`UPDATE plugins SET is_enabled = ?, enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, enabled ? 1 : 0, id);
}
function getProjects() {
	return getDb().prepare(`SELECT * FROM projects ORDER BY is_active DESC, created_at DESC`).all();
}
function getProject(id) {
	return getDb().prepare(`SELECT * FROM projects WHERE id = ?`).get(id);
}
function addProject(project) {
	const db = getDb();
	const count = db.prepare(`SELECT COUNT(*) as count FROM projects`).get().count;
	db.prepare(`INSERT INTO projects (id, name, path, git_remote, is_active) VALUES (?, ?, ?, ?, ?)`).run(project.id, project.name, project.path, project.gitRemote || "", count === 0 ? 1 : 0);
}
function deleteProject(id) {
	getDb().prepare(`DELETE FROM projects WHERE id = ?`).run(id);
}
function setActiveProject(id) {
	getDb().prepare(`UPDATE projects SET is_active = 0`).run();
	getDb().prepare(`UPDATE projects SET is_active = 1 WHERE id = ?`).run(id);
}
function upsertToolStatus(status) {
	getDb().prepare(`INSERT OR REPLACE INTO tool_statuses (tool_id, name, binary, version, installed, auth_status, available, details, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`).run(status.toolId, status.name, status.binary, status.version, status.installed ? 1 : 0, status.authStatus, status.available ? 1 : 0, status.details || null);
}
function getToolSecret(toolId) {
	return getDb().prepare(`SELECT tool_id, label, secret_encrypted FROM tool_secrets WHERE tool_id = ?`).get(toolId);
}
function upsertToolSecret(toolId, label, secretEncrypted) {
	getDb().prepare(`INSERT OR REPLACE INTO tool_secrets (tool_id, label, secret_encrypted, created_at) VALUES (?, ?, ?, datetime('now'))`).run(toolId, label, secretEncrypted);
}
function getSettings() {
	const rows = getDb().prepare(`SELECT key, value FROM settings`).all();
	const result = {};
	for (const row of rows) result[row.key] = row.value;
	return result;
}
function setSetting(key, value) {
	getDb().prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run(key, value);
}
/** Remove demo jobs created by older versions of the app. */
function purgeDemoData() {
	getDb().prepare(`DELETE FROM jobs WHERE id LIKE 'AUTH-%'`).run();
}
function seedDefaultData() {
	const insertMcp = getDb().prepare(`INSERT OR IGNORE INTO mcp_servers (id, name, transport, command, url, args, env, enabled, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
	insertMcp.run("mcp-github", "GitHub MCP", "stdio", "npx", "", JSON.stringify(["-y", "@modelcontextprotocol/server-github"]), "{}", 1, 1);
	insertMcp.run("mcp-fs", "Filesystem MCP", "stdio", "npx", "", JSON.stringify([
		"-y",
		"@modelcontextprotocol/server-filesystem",
		"."
	]), "{}", 1, 1);
	insertMcp.run("mcp-sequential", "Sequential Thinking MCP", "stdio", "npx", "", JSON.stringify(["-y", "@modelcontextprotocol/server-sequential-thinking"]), "{}", 1, 1);
	const insertSkill = getDb().prepare(`INSERT OR IGNORE INTO skills (id, name, description, content, tags, enabled) VALUES (?, ?, ?, ?, ?, ?)`);
	insertSkill.run("skill-react", "React Hook Patterns", "Reusable React hook patterns and guardrails", `## React Hooks Best Practices\n\n- Use useCallback for functions passed as props\n- Use useMemo for expensive calculations\n- Use useLayoutEffect for DOM mutations\n- Destructure hooks at the top of the component\n\n## Common Patterns\n\`\`\`tsx\nconst [state, setState] = useState(initial);\nconst debounced = useMemo(() => debounce(value, 300), [value]);\n\`\`\``, "[\"react\",\"hooks\"]", 1);
	insertSkill.run("skill-node", "Node.js Security", "Security checklist for Node.js services", `## Security Best Practices\n\n- Never trust user input - validate with Zod\n- Use parameterized queries (better-sqlite3)\n- Sanitize output to prevent XSS\n- Use Helmet.js for Express apps\n- Rate-limit API endpoints\n- Implement proper error boundaries`, "[\"security\",\"node\"]", 1);
	insertSkill.run("skill-git", "Git Worktree Strategy", "Git workflow guidance for isolated worktrees", `## Git Worktree Workflow\n\n- Always create a branch per task: git worktree add -b agent/<jobId>\n- Keep main branch clean - merge with --no-ff\n- Clean up worktrees: git worktree remove --force path\n- Delete merged branches: git branch -d agent/<jobId>\n\n## Best Practices\n- Never commit directly to main\n- Run tests before merging\n- Capture diff before merge: git diff HEAD~1`, "[\"git\",\"workflow\"]", 1);
	insertSkill.run("skill-md", "Markdown PR Summaries", "Template for concise pull request summaries", `## Pull Request Summary Template\n\n- What changed\n- Why it changed\n- How to verify\n- Known risks\n- Follow-up items`, "[\"docs\",\"writing\"]", 1);
	insertSkill.run("skill-electron", "Electron Security", "Electron security guidelines for renderer/main boundaries", `## Electron Security Guidelines\n\n- Enable contextIsolation (contextIsolation: true)\n- Disable nodeIntegration in renderer (nodeIntegration: false)\n- Use contextBridge for safe IPC\n- Validate all IPC input with Zod\n- Never expose remote module\n- Use safeStorage for secrets\n- Avoid eval() and new Function()\n- Sanitize URLs before loading`, "[\"electron\",\"security\"]", 1);
	const insertPlugin = getDb().prepare(`INSERT OR IGNORE INTO plugins (id, name, type, command, args, env) VALUES (?, ?, ?, ?, ?, ?)`);
	insertPlugin.run("plugin-ruff", "Ruff Linter", "linter", "uv", JSON.stringify([
		"run",
		"ruff",
		"check"
	]), "{}");
	insertPlugin.run("plugin-eslint", "ESLint", "linter", "npx", JSON.stringify(["eslint"]), "{}");
	insertPlugin.run("plugin-tsc", "TypeScript Check", "checker", "npx", JSON.stringify(["tsc", "--noEmit"]), "{}");
	insertPlugin.run("plugin-prettier", "Prettier Formatter", "formatter", "npx", JSON.stringify(["prettier", "--write"]), "{}");
	insertPlugin.run("plugin-tests", "Test Runner", "tester", "npm", JSON.stringify(["test"]), "{}");
	insertPlugin.run("plugin-vitest", "Vitest UI", "tester", "npx", JSON.stringify(["vitest", "ui"]), "{}");
	insertPlugin.run("plugin-semgrep", "Semgrep SAST", "analyzer", "semgrep", JSON.stringify(["--config=auto", "--json"]), "{}");
	insertPlugin.run("plugin-codespell", "Codespell Spellcheck", "analyzer", "codespell", JSON.stringify(["--skip=.git,node_modules,dist"]), "{}");
	insertPlugin.run("plugin-oxc", "Oxc Linter", "linter", "npx", JSON.stringify(["@oxc-lang/oxc", "lint"]), "{}");
}
//#endregion
//#region electron/mcp.ts
/**
* electron/mcp.ts — Shared MCP Server Connection Layer
* 
* Loads MCP server configs from SQLite, generates per-agent configuration files,
* and exposes utilities to connect agents to MCP tools.
*/
/** Map agent names to their config file location and format */
var AGENT_CONFIG_PATHS = {
	"Claude Code": {
		path: (workdir) => join(workdir, ".mcp.json"),
		format: "json"
	},
	"Cursor": {
		path: (workdir) => join(workdir, ".cursor", "mcp.json"),
		format: "json"
	},
	"OpenCode": {
		path: (workdir) => join(workdir, "opencode.json"),
		format: "json"
	},
	"Codex": {
		path: (workdir) => join(workdir, "codex-mcp.json"),
		format: "json"
	},
	"Aider": {
		path: (workdir) => join(workdir, ".aider-mcp.json"),
		format: "json"
	}
};
/** Get active MCP server configs from DB */
function getActiveMcpServers() {
	return getMcpServers().filter((r) => r.is_enabled === 1).map((r) => ({
		id: r.id,
		name: r.name,
		command: r.command,
		args: JSON.parse(r.args || "[]"),
		env: JSON.parse(r.env || "{}"),
		isEnabled: r.is_enabled === 1
	}));
}
/** Generate per-agent MCP config file before task runs */
function writeAgentMcpConfig(agent, workdir) {
	const servers = getActiveMcpServers();
	if (servers.length === 0) return null;
	const agentKey = agent.toLowerCase().replace(/\s+/g, "-");
	const config = AGENT_CONFIG_PATHS[agent] || AGENT_CONFIG_PATHS[agentKey];
	if (!config) return null;
	const configPath = config.path(workdir);
	const configDir = join(...configPath.split(/[/\\]/).slice(0, -1));
	if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });
	let fileContent;
	if (config.format === "json") fileContent = JSON.stringify({ mcpServers: servers.map((s) => ({
		name: s.name,
		command: s.command,
		args: s.args,
		env: s.env
	})) }, null, 2);
	else fileContent = "";
	writeFileSync(configPath, fileContent);
	return configPath;
}
//#endregion
//#region node_modules/is-plain-obj/index.js
function isPlainObject(value) {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
//#endregion
//#region node_modules/execa/lib/arguments/file-url.js
var safeNormalizeFileUrl = (file, name) => {
	const fileString = normalizeFileUrl(normalizeDenoExecPath(file));
	if (typeof fileString !== "string") throw new TypeError(`${name} must be a string or a file URL: ${fileString}.`);
	return fileString;
};
var normalizeDenoExecPath = (file) => isDenoExecPath(file) ? file.toString() : file;
var isDenoExecPath = (file) => typeof file !== "string" && file && Object.getPrototypeOf(file) === String.prototype;
var normalizeFileUrl = (file) => file instanceof URL ? fileURLToPath$1(file) : file;
//#endregion
//#region node_modules/execa/lib/methods/parameters.js
var normalizeParameters = (rawFile, rawArguments = [], rawOptions = {}) => {
	const filePath = safeNormalizeFileUrl(rawFile, "First argument");
	const [commandArguments, options] = isPlainObject(rawArguments) ? [[], rawArguments] : [rawArguments, rawOptions];
	if (!Array.isArray(commandArguments)) throw new TypeError(`Second argument must be either an array of arguments or an options object: ${commandArguments}`);
	if (commandArguments.some((commandArgument) => typeof commandArgument === "object" && commandArgument !== null)) throw new TypeError(`Second argument must be an array of strings: ${commandArguments}`);
	const normalizedArguments = commandArguments.map(String);
	const nullByteArgument = normalizedArguments.find((normalizedArgument) => normalizedArgument.includes("\0"));
	if (nullByteArgument !== void 0) throw new TypeError(`Arguments cannot contain null bytes ("\\0"): ${nullByteArgument}`);
	if (!isPlainObject(options)) throw new TypeError(`Last argument must be an options object: ${options}`);
	return [
		filePath,
		normalizedArguments,
		{
			__proto__: null,
			...options
		}
	];
};
//#endregion
//#region node_modules/execa/lib/utils/uint-array.js
var { toString: objectToString$1 } = Object.prototype;
var isArrayBuffer = (value) => objectToString$1.call(value) === "[object ArrayBuffer]";
var isUint8Array = (value) => objectToString$1.call(value) === "[object Uint8Array]";
var bufferToUint8Array = (buffer) => new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
var textEncoder$1 = new TextEncoder();
var stringToUint8Array = (string) => textEncoder$1.encode(string);
var textDecoder = new TextDecoder();
var uint8ArrayToString = (uint8Array) => textDecoder.decode(uint8Array);
var joinToString = (uint8ArraysOrStrings, encoding) => {
	return uint8ArraysToStrings(uint8ArraysOrStrings, encoding).join("");
};
var uint8ArraysToStrings = (uint8ArraysOrStrings, encoding) => {
	if (encoding === "utf8" && uint8ArraysOrStrings.every((uint8ArrayOrString) => typeof uint8ArrayOrString === "string")) return uint8ArraysOrStrings;
	const decoder = new StringDecoder(encoding);
	const strings = uint8ArraysOrStrings.map((uint8ArrayOrString) => typeof uint8ArrayOrString === "string" ? stringToUint8Array(uint8ArrayOrString) : uint8ArrayOrString).map((uint8Array) => decoder.write(uint8Array));
	const finalString = decoder.end();
	return finalString === "" ? strings : [...strings, finalString];
};
var joinToUint8Array = (uint8ArraysOrStrings) => {
	if (uint8ArraysOrStrings.length === 1 && isUint8Array(uint8ArraysOrStrings[0])) return uint8ArraysOrStrings[0];
	return concatUint8Arrays(stringsToUint8Arrays(uint8ArraysOrStrings));
};
var stringsToUint8Arrays = (uint8ArraysOrStrings) => uint8ArraysOrStrings.map((uint8ArrayOrString) => typeof uint8ArrayOrString === "string" ? stringToUint8Array(uint8ArrayOrString) : uint8ArrayOrString);
var concatUint8Arrays = (uint8Arrays) => {
	const result = new Uint8Array(getJoinLength(uint8Arrays));
	let index = 0;
	for (const uint8Array of uint8Arrays) {
		result.set(uint8Array, index);
		index += uint8Array.length;
	}
	return result;
};
var getJoinLength = (uint8Arrays) => {
	let joinLength = 0;
	for (const uint8Array of uint8Arrays) joinLength += uint8Array.length;
	return joinLength;
};
//#endregion
//#region node_modules/execa/lib/methods/template.js
var isTemplateString = (templates) => Array.isArray(templates) && Array.isArray(templates.raw);
var parseTemplates = (templates, expressions) => {
	let tokens = [];
	for (const [index, template] of templates.entries()) tokens = parseTemplate({
		templates,
		expressions,
		tokens,
		index,
		template
	});
	if (tokens.length === 0) throw new TypeError("Template script must not be empty");
	const [file, ...commandArguments] = tokens;
	return [
		file,
		commandArguments,
		{}
	];
};
var parseTemplate = ({ templates, expressions, tokens, index, template }) => {
	if (template === void 0) throw new TypeError(`Invalid backslash sequence: ${templates.raw[index]}`);
	const { nextTokens, leadingWhitespaces, trailingWhitespaces } = splitByWhitespaces(template, templates.raw[index]);
	const newTokens = concatTokens(tokens, nextTokens, leadingWhitespaces);
	if (index === expressions.length) return newTokens;
	const expression = expressions[index];
	return concatTokens(newTokens, Array.isArray(expression) ? expression.map((expression) => parseExpression(expression)) : [parseExpression(expression)], trailingWhitespaces);
};
var splitByWhitespaces = (template, rawTemplate) => {
	if (rawTemplate.length === 0) return {
		nextTokens: [],
		leadingWhitespaces: false,
		trailingWhitespaces: false
	};
	const nextTokens = [];
	let templateStart = 0;
	const isLeadingWhitespaces = DELIMITERS.has(rawTemplate[0]);
	for (let templateIndex = 0, rawIndex = 0; templateIndex < template.length; templateIndex += 1, rawIndex += 1) {
		const rawCharacter = rawTemplate[rawIndex];
		if (DELIMITERS.has(rawCharacter)) {
			if (templateStart !== templateIndex) nextTokens.push(template.slice(templateStart, templateIndex));
			templateStart = templateIndex + 1;
		} else if (rawCharacter === "\\") {
			const nextRawCharacter = rawTemplate[rawIndex + 1];
			if (nextRawCharacter === "\n") {
				templateIndex -= 1;
				rawIndex += 1;
			} else if (nextRawCharacter === "u" && rawTemplate[rawIndex + 2] === "{") rawIndex = rawTemplate.indexOf("}", rawIndex + 3);
			else rawIndex += ESCAPE_LENGTH[nextRawCharacter] ?? 1;
		}
	}
	const isTrailingWhitespaces = templateStart === template.length;
	if (!isTrailingWhitespaces) nextTokens.push(template.slice(templateStart));
	return {
		nextTokens,
		leadingWhitespaces: isLeadingWhitespaces,
		trailingWhitespaces: isTrailingWhitespaces
	};
};
var DELIMITERS = /* @__PURE__ */ new Set([
	" ",
	"	",
	"\r",
	"\n"
]);
var ESCAPE_LENGTH = {
	x: 3,
	u: 5
};
var concatTokens = (tokens, nextTokens, isSeparated) => isSeparated || tokens.length === 0 || nextTokens.length === 0 ? [...tokens, ...nextTokens] : [
	...tokens.slice(0, -1),
	`${tokens.at(-1)}${nextTokens[0]}`,
	...nextTokens.slice(1)
];
var parseExpression = (expression) => {
	const typeOfExpression = typeof expression;
	if (typeOfExpression === "string") return expression;
	if (typeOfExpression === "number") return String(expression);
	if (isPlainObject(expression) && ("stdout" in expression || "isMaxBuffer" in expression)) return getSubprocessResult(expression);
	if (expression instanceof ChildProcess || Object.prototype.toString.call(expression) === "[object Promise]") throw new TypeError("Unexpected subprocess in template expression. Please use ${await subprocess} instead of ${subprocess}.");
	throw new TypeError(`Unexpected "${typeOfExpression}" in template expression`);
};
var getSubprocessResult = ({ stdout }) => {
	if (typeof stdout === "string") return stdout;
	if (isUint8Array(stdout)) return uint8ArrayToString(stdout);
	if (stdout === void 0) throw new TypeError("Missing result.stdout in template expression. This is probably due to the previous subprocess' \"stdout\" option.");
	throw new TypeError(`Unexpected "${typeof stdout}" stdout in template expression`);
};
//#endregion
//#region node_modules/execa/lib/utils/standard-stream.js
var isStandardStream = (stream) => STANDARD_STREAMS.includes(stream);
var STANDARD_STREAMS = [
	process$1.stdin,
	process$1.stdout,
	process$1.stderr
];
var STANDARD_STREAMS_ALIASES = [
	"stdin",
	"stdout",
	"stderr"
];
var getStreamName = (fdNumber) => STANDARD_STREAMS_ALIASES[fdNumber] ?? `stdio[${fdNumber}]`;
//#endregion
//#region node_modules/execa/lib/arguments/specific.js
var normalizeFdSpecificOptions = (options) => {
	const optionsCopy = { ...options };
	for (const optionName of FD_SPECIFIC_OPTIONS) optionsCopy[optionName] = normalizeFdSpecificOption(options, optionName);
	return optionsCopy;
};
var normalizeFdSpecificOption = (options, optionName) => {
	const stdioLength = getStdioLength(options);
	const optionBaseArray = Array.from({ length: stdioLength + 1 });
	return addDefaultValue$1(normalizeFdSpecificValue(options[optionName], optionBaseArray, optionName, stdioLength), optionName);
};
var getStdioLength = ({ stdio }) => Array.isArray(stdio) ? Math.max(stdio.length, STANDARD_STREAMS_ALIASES.length) : STANDARD_STREAMS_ALIASES.length;
var normalizeFdSpecificValue = (optionValue, optionArray, optionName, stdioLength) => isPlainObject(optionValue) ? normalizeOptionObject(optionValue, optionArray, optionName, stdioLength) : optionArray.fill(optionValue);
var normalizeOptionObject = (optionValue, optionArray, optionName, stdioLength) => {
	for (const fdName of Object.keys(optionValue).sort(compareFdName)) for (const fdNumber of parseFdName(fdName, optionName, stdioLength)) optionArray[fdNumber] = optionValue[fdName];
	return optionArray;
};
var compareFdName = (fdNameA, fdNameB) => getFdNameOrder(fdNameA) < getFdNameOrder(fdNameB) ? 1 : -1;
var getFdNameOrder = (fdName) => {
	if (fdName === "stdout" || fdName === "stderr") return 0;
	return fdName === "all" ? 2 : 1;
};
var parseFdName = (fdName, optionName, stdioLength) => {
	if (fdName === "ipc") return [stdioLength];
	const fdNumber = parseFd(fdName);
	if (fdNumber === void 0 || fdNumber === 0) throw new TypeError(`"${optionName}.${fdName}" is invalid.
It must be "${optionName}.stdout", "${optionName}.stderr", "${optionName}.all", "${optionName}.ipc", or "${optionName}.fd3", "${optionName}.fd4" (and so on).`);
	if (fdNumber !== "all" && fdNumber >= stdioLength) throw new TypeError(`"${optionName}.${fdName}" is invalid: that file descriptor does not exist.
Please set the "stdio" option to ensure that file descriptor exists.`);
	return fdNumber === "all" ? [1, 2] : [fdNumber];
};
var parseFd = (fdName) => {
	if (fdName === "all") return fdName;
	if (STANDARD_STREAMS_ALIASES.includes(fdName)) return STANDARD_STREAMS_ALIASES.indexOf(fdName);
	const regexpResult = FD_REGEXP.exec(fdName);
	if (regexpResult !== null) return Number(regexpResult.groups.fdNumber);
};
var FD_REGEXP = /^fd(?<fdNumber>\d+)$/;
var addDefaultValue$1 = (optionArray, optionName) => optionArray.map((optionValue) => optionValue === void 0 ? DEFAULT_OPTIONS[optionName] : optionValue);
var DEFAULT_OPTIONS = {
	lines: false,
	buffer: true,
	maxBuffer: 1e8,
	verbose: debuglog("execa").enabled ? "full" : "none",
	stripFinalNewline: true
};
var FD_SPECIFIC_OPTIONS = [
	"lines",
	"buffer",
	"maxBuffer",
	"verbose",
	"stripFinalNewline"
];
var getFdSpecificValue = (optionArray, fdNumber) => fdNumber === "ipc" ? optionArray.at(-1) : optionArray[fdNumber];
//#endregion
//#region node_modules/execa/lib/verbose/values.js
var isVerbose = ({ verbose }, fdNumber) => getFdVerbose(verbose, fdNumber) !== "none";
var isFullVerbose = ({ verbose }, fdNumber) => !["none", "short"].includes(getFdVerbose(verbose, fdNumber));
var getVerboseFunction = ({ verbose }, fdNumber) => {
	const fdVerbose = getFdVerbose(verbose, fdNumber);
	return isVerboseFunction(fdVerbose) ? fdVerbose : void 0;
};
var getFdVerbose = (verbose, fdNumber) => fdNumber === void 0 ? getFdGenericVerbose(verbose) : getFdSpecificValue(verbose, fdNumber);
var getFdGenericVerbose = (verbose) => verbose.find((fdVerbose) => isVerboseFunction(fdVerbose)) ?? VERBOSE_VALUES.findLast((fdVerbose) => verbose.includes(fdVerbose));
var isVerboseFunction = (fdVerbose) => typeof fdVerbose === "function";
var VERBOSE_VALUES = [
	"none",
	"short",
	"full"
];
//#endregion
//#region node_modules/execa/lib/arguments/escape.js
var joinCommand = (filePath, rawArguments) => {
	const fileAndArguments = [filePath, ...rawArguments];
	return {
		command: fileAndArguments.join(" "),
		escapedCommand: fileAndArguments.map((fileAndArgument) => quoteString(escapeControlCharacters(fileAndArgument))).join(" ")
	};
};
var escapeLines = (lines) => stripVTControlCharacters(lines).split("\n").map((line) => escapeControlCharacters(line)).join("\n");
var escapeControlCharacters = (line) => line.replaceAll(SPECIAL_CHAR_REGEXP, (character) => escapeControlCharacter(character));
var escapeControlCharacter = (character) => {
	const commonEscape = COMMON_ESCAPES[character];
	if (commonEscape !== void 0) return commonEscape;
	const codepoint = character.codePointAt(0);
	const codepointHex = codepoint.toString(16);
	return codepoint <= ASTRAL_START ? `\\u${codepointHex.padStart(4, "0")}` : `\\U${codepointHex}`;
};
var getSpecialCharRegExp = () => {
	try {
		return /* @__PURE__ */ new RegExp("\\p{Separator}|\\p{Other}", "gu");
	} catch {
		return /[\s\u0000-\u001F\u007F-\u009F\u00AD]/g;
	}
};
var SPECIAL_CHAR_REGEXP = getSpecialCharRegExp();
var COMMON_ESCAPES = {
	" ": " ",
	"\b": "\\b",
	"\f": "\\f",
	"\n": "\\n",
	"\r": "\\r",
	"	": "\\t"
};
var ASTRAL_START = 65535;
var quoteString = (escapedArgument) => {
	if (NO_ESCAPE_REGEXP.test(escapedArgument)) return escapedArgument;
	return platform === "win32" ? `"${escapedArgument.replaceAll("\"", "\"\"")}"` : `'${escapedArgument.replaceAll("'", "'\\''")}'`;
};
var NO_ESCAPE_REGEXP = /^[\w\-./]+$/;
//#endregion
//#region node_modules/is-unicode-supported/index.js
function isUnicodeSupported() {
	const { env } = process$1;
	const { TERM, TERM_PROGRAM } = env;
	if (process$1.platform !== "win32") return TERM !== "linux";
	return Boolean(env.WT_SESSION) || Boolean(env.TERMINUS_SUBLIME) || env.ConEmuTask === "{cmd::Cmder}" || TERM_PROGRAM === "Terminus-Sublime" || TERM_PROGRAM === "vscode" || TERM === "xterm-256color" || TERM === "alacritty" || TERM === "rxvt-unicode" || TERM === "rxvt-unicode-256color" || env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
//#endregion
//#region node_modules/figures/index.js
var common = {
	circleQuestionMark: "(?)",
	questionMarkPrefix: "(?)",
	square: "█",
	squareDarkShade: "▓",
	squareMediumShade: "▒",
	squareLightShade: "░",
	squareTop: "▀",
	squareBottom: "▄",
	squareLeft: "▌",
	squareRight: "▐",
	squareCenter: "■",
	bullet: "●",
	dot: "․",
	ellipsis: "…",
	pointerSmall: "›",
	triangleUp: "▲",
	triangleUpSmall: "▴",
	triangleDown: "▼",
	triangleDownSmall: "▾",
	triangleLeftSmall: "◂",
	triangleRightSmall: "▸",
	home: "⌂",
	heart: "♥",
	musicNote: "♪",
	musicNoteBeamed: "♫",
	arrowUp: "↑",
	arrowDown: "↓",
	arrowLeft: "←",
	arrowRight: "→",
	arrowLeftRight: "↔",
	arrowUpDown: "↕",
	almostEqual: "≈",
	notEqual: "≠",
	lessOrEqual: "≤",
	greaterOrEqual: "≥",
	identical: "≡",
	infinity: "∞",
	subscriptZero: "₀",
	subscriptOne: "₁",
	subscriptTwo: "₂",
	subscriptThree: "₃",
	subscriptFour: "₄",
	subscriptFive: "₅",
	subscriptSix: "₆",
	subscriptSeven: "₇",
	subscriptEight: "₈",
	subscriptNine: "₉",
	oneHalf: "½",
	oneThird: "⅓",
	oneQuarter: "¼",
	oneFifth: "⅕",
	oneSixth: "⅙",
	oneEighth: "⅛",
	twoThirds: "⅔",
	twoFifths: "⅖",
	threeQuarters: "¾",
	threeFifths: "⅗",
	threeEighths: "⅜",
	fourFifths: "⅘",
	fiveSixths: "⅚",
	fiveEighths: "⅝",
	sevenEighths: "⅞",
	line: "─",
	lineBold: "━",
	lineDouble: "═",
	lineDashed0: "┄",
	lineDashed1: "┅",
	lineDashed2: "┈",
	lineDashed3: "┉",
	lineDashed4: "╌",
	lineDashed5: "╍",
	lineDashed6: "╴",
	lineDashed7: "╶",
	lineDashed8: "╸",
	lineDashed9: "╺",
	lineDashed10: "╼",
	lineDashed11: "╾",
	lineDashed12: "−",
	lineDashed13: "–",
	lineDashed14: "‐",
	lineDashed15: "⁃",
	lineVertical: "│",
	lineVerticalBold: "┃",
	lineVerticalDouble: "║",
	lineVerticalDashed0: "┆",
	lineVerticalDashed1: "┇",
	lineVerticalDashed2: "┊",
	lineVerticalDashed3: "┋",
	lineVerticalDashed4: "╎",
	lineVerticalDashed5: "╏",
	lineVerticalDashed6: "╵",
	lineVerticalDashed7: "╷",
	lineVerticalDashed8: "╹",
	lineVerticalDashed9: "╻",
	lineVerticalDashed10: "╽",
	lineVerticalDashed11: "╿",
	lineDownLeft: "┐",
	lineDownLeftArc: "╮",
	lineDownBoldLeftBold: "┓",
	lineDownBoldLeft: "┒",
	lineDownLeftBold: "┑",
	lineDownDoubleLeftDouble: "╗",
	lineDownDoubleLeft: "╖",
	lineDownLeftDouble: "╕",
	lineDownRight: "┌",
	lineDownRightArc: "╭",
	lineDownBoldRightBold: "┏",
	lineDownBoldRight: "┎",
	lineDownRightBold: "┍",
	lineDownDoubleRightDouble: "╔",
	lineDownDoubleRight: "╓",
	lineDownRightDouble: "╒",
	lineUpLeft: "┘",
	lineUpLeftArc: "╯",
	lineUpBoldLeftBold: "┛",
	lineUpBoldLeft: "┚",
	lineUpLeftBold: "┙",
	lineUpDoubleLeftDouble: "╝",
	lineUpDoubleLeft: "╜",
	lineUpLeftDouble: "╛",
	lineUpRight: "└",
	lineUpRightArc: "╰",
	lineUpBoldRightBold: "┗",
	lineUpBoldRight: "┖",
	lineUpRightBold: "┕",
	lineUpDoubleRightDouble: "╚",
	lineUpDoubleRight: "╙",
	lineUpRightDouble: "╘",
	lineUpDownLeft: "┤",
	lineUpBoldDownBoldLeftBold: "┫",
	lineUpBoldDownBoldLeft: "┨",
	lineUpDownLeftBold: "┥",
	lineUpBoldDownLeftBold: "┩",
	lineUpDownBoldLeftBold: "┪",
	lineUpDownBoldLeft: "┧",
	lineUpBoldDownLeft: "┦",
	lineUpDoubleDownDoubleLeftDouble: "╣",
	lineUpDoubleDownDoubleLeft: "╢",
	lineUpDownLeftDouble: "╡",
	lineUpDownRight: "├",
	lineUpBoldDownBoldRightBold: "┣",
	lineUpBoldDownBoldRight: "┠",
	lineUpDownRightBold: "┝",
	lineUpBoldDownRightBold: "┡",
	lineUpDownBoldRightBold: "┢",
	lineUpDownBoldRight: "┟",
	lineUpBoldDownRight: "┞",
	lineUpDoubleDownDoubleRightDouble: "╠",
	lineUpDoubleDownDoubleRight: "╟",
	lineUpDownRightDouble: "╞",
	lineDownLeftRight: "┬",
	lineDownBoldLeftBoldRightBold: "┳",
	lineDownLeftBoldRightBold: "┯",
	lineDownBoldLeftRight: "┰",
	lineDownBoldLeftBoldRight: "┱",
	lineDownBoldLeftRightBold: "┲",
	lineDownLeftRightBold: "┮",
	lineDownLeftBoldRight: "┭",
	lineDownDoubleLeftDoubleRightDouble: "╦",
	lineDownDoubleLeftRight: "╥",
	lineDownLeftDoubleRightDouble: "╤",
	lineUpLeftRight: "┴",
	lineUpBoldLeftBoldRightBold: "┻",
	lineUpLeftBoldRightBold: "┷",
	lineUpBoldLeftRight: "┸",
	lineUpBoldLeftBoldRight: "┹",
	lineUpBoldLeftRightBold: "┺",
	lineUpLeftRightBold: "┶",
	lineUpLeftBoldRight: "┵",
	lineUpDoubleLeftDoubleRightDouble: "╩",
	lineUpDoubleLeftRight: "╨",
	lineUpLeftDoubleRightDouble: "╧",
	lineUpDownLeftRight: "┼",
	lineUpBoldDownBoldLeftBoldRightBold: "╋",
	lineUpDownBoldLeftBoldRightBold: "╈",
	lineUpBoldDownLeftBoldRightBold: "╇",
	lineUpBoldDownBoldLeftRightBold: "╊",
	lineUpBoldDownBoldLeftBoldRight: "╉",
	lineUpBoldDownLeftRight: "╀",
	lineUpDownBoldLeftRight: "╁",
	lineUpDownLeftBoldRight: "┽",
	lineUpDownLeftRightBold: "┾",
	lineUpBoldDownBoldLeftRight: "╂",
	lineUpDownLeftBoldRightBold: "┿",
	lineUpBoldDownLeftBoldRight: "╃",
	lineUpBoldDownLeftRightBold: "╄",
	lineUpDownBoldLeftBoldRight: "╅",
	lineUpDownBoldLeftRightBold: "╆",
	lineUpDoubleDownDoubleLeftDoubleRightDouble: "╬",
	lineUpDoubleDownDoubleLeftRight: "╫",
	lineUpDownLeftDoubleRightDouble: "╪",
	lineCross: "╳",
	lineBackslash: "╲",
	lineSlash: "╱"
};
var specialMainSymbols = {
	tick: "✔",
	info: "ℹ",
	warning: "⚠",
	cross: "✘",
	squareSmall: "◻",
	squareSmallFilled: "◼",
	circle: "◯",
	circleFilled: "◉",
	circleDotted: "◌",
	circleDouble: "◎",
	circleCircle: "ⓞ",
	circleCross: "ⓧ",
	circlePipe: "Ⓘ",
	radioOn: "◉",
	radioOff: "◯",
	checkboxOn: "☒",
	checkboxOff: "☐",
	checkboxCircleOn: "ⓧ",
	checkboxCircleOff: "Ⓘ",
	pointer: "❯",
	triangleUpOutline: "△",
	triangleLeft: "◀",
	triangleRight: "▶",
	lozenge: "◆",
	lozengeOutline: "◇",
	hamburger: "☰",
	smiley: "㋡",
	mustache: "෴",
	star: "★",
	play: "▶",
	nodejs: "⬢",
	oneSeventh: "⅐",
	oneNinth: "⅑",
	oneTenth: "⅒"
};
var specialFallbackSymbols = {
	tick: "√",
	info: "i",
	warning: "‼",
	cross: "×",
	squareSmall: "□",
	squareSmallFilled: "■",
	circle: "( )",
	circleFilled: "(*)",
	circleDotted: "( )",
	circleDouble: "( )",
	circleCircle: "(○)",
	circleCross: "(×)",
	circlePipe: "(│)",
	radioOn: "(*)",
	radioOff: "( )",
	checkboxOn: "[×]",
	checkboxOff: "[ ]",
	checkboxCircleOn: "(×)",
	checkboxCircleOff: "( )",
	pointer: ">",
	triangleUpOutline: "∆",
	triangleLeft: "◄",
	triangleRight: "►",
	lozenge: "♦",
	lozengeOutline: "◊",
	hamburger: "≡",
	smiley: "☺",
	mustache: "┌─┐",
	star: "✶",
	play: "►",
	nodejs: "♦",
	oneSeventh: "1/7",
	oneNinth: "1/9",
	oneTenth: "1/10"
};
var mainSymbols = {
	...common,
	...specialMainSymbols
};
var fallbackSymbols = {
	...common,
	...specialFallbackSymbols
};
var figures = isUnicodeSupported() ? mainSymbols : fallbackSymbols;
Object.entries(specialMainSymbols);
//#endregion
//#region node_modules/yoctocolors/base.js
var hasColors = tty?.WriteStream?.prototype?.hasColors?.() ?? false;
var format = (open, close) => {
	if (!hasColors) return (input) => input;
	const openCode = `\u001B[${open}m`;
	const closeCode = `\u001B[${close}m`;
	return (input) => {
		const string = input + "";
		let index = string.indexOf(closeCode);
		if (index === -1) return openCode + string + closeCode;
		let result = openCode;
		let lastIndex = 0;
		const replaceCode = (close === 22 ? closeCode : "") + openCode;
		while (index !== -1) {
			result += string.slice(lastIndex, index) + replaceCode;
			lastIndex = index + closeCode.length;
			index = string.indexOf(closeCode, lastIndex);
		}
		result += string.slice(lastIndex) + closeCode;
		return result;
	};
};
format(0, 0);
var bold = format(1, 22);
format(2, 22);
format(3, 23);
format(4, 24);
format("4:2", 24);
format("4:3", 24);
format("4:4", 24);
format("4:5", 24);
format(53, 55);
format(7, 27);
format(8, 28);
format(9, 29);
format(30, 39);
format(31, 39);
format(32, 39);
format(33, 39);
format(34, 39);
format(35, 39);
format(36, 39);
format(37, 39);
var gray = format(90, 39);
format(40, 49);
format(41, 49);
format(42, 49);
format(43, 49);
format(44, 49);
format(45, 49);
format(46, 49);
format(47, 49);
format(100, 49);
var redBright = format(91, 39);
format(92, 39);
var yellowBright = format(93, 39);
format(94, 39);
format(95, 39);
format(96, 39);
format(97, 39);
format(101, 49);
format(102, 49);
format(103, 49);
format(104, 49);
format(105, 49);
format(106, 49);
format(107, 49);
format("58;5;0", 59);
format("58;5;1", 59);
format("58;5;2", 59);
format("58;5;3", 59);
format("58;5;4", 59);
format("58;5;5", 59);
format("58;5;6", 59);
format("58;5;7", 59);
format("58;5;8", 59);
format("58;5;9", 59);
format("58;5;10", 59);
format("58;5;11", 59);
format("58;5;12", 59);
format("58;5;13", 59);
format("58;5;14", 59);
format("58;5;15", 59);
//#endregion
//#region node_modules/execa/lib/verbose/default.js
var defaultVerboseFunction = ({ type, message, timestamp, piped, commandId, result: { failed = false } = {}, options: { reject = true } }) => {
	const timestampString = serializeTimestamp(timestamp);
	const icon = ICONS[type]({
		failed,
		reject,
		piped
	});
	const color = COLORS[type]({ reject });
	return `${gray(`[${timestampString}]`)} ${gray(`[${commandId}]`)} ${color(icon)} ${color(message)}`;
};
var serializeTimestamp = (timestamp) => `${padField(timestamp.getHours(), 2)}:${padField(timestamp.getMinutes(), 2)}:${padField(timestamp.getSeconds(), 2)}.${padField(timestamp.getMilliseconds(), 3)}`;
var padField = (field, padding) => String(field).padStart(padding, "0");
var getFinalIcon = ({ failed, reject }) => {
	if (!failed) return figures.tick;
	return reject ? figures.cross : figures.warning;
};
var ICONS = {
	command: ({ piped }) => piped ? "|" : "$",
	output: () => " ",
	ipc: () => "*",
	error: getFinalIcon,
	duration: getFinalIcon
};
var identity$1 = (string) => string;
var COLORS = {
	command: () => bold,
	output: () => identity$1,
	ipc: () => identity$1,
	error: ({ reject }) => reject ? redBright : yellowBright,
	duration: () => gray
};
//#endregion
//#region node_modules/execa/lib/verbose/custom.js
var applyVerboseOnLines = (printedLines, verboseInfo, fdNumber) => {
	const verboseFunction = getVerboseFunction(verboseInfo, fdNumber);
	return printedLines.map(({ verboseLine, verboseObject }) => applyVerboseFunction(verboseLine, verboseObject, verboseFunction)).filter((printedLine) => printedLine !== void 0).map((printedLine) => appendNewline(printedLine)).join("");
};
var applyVerboseFunction = (verboseLine, verboseObject, verboseFunction) => {
	if (verboseFunction === void 0) return verboseLine;
	const printedLine = verboseFunction(verboseLine, verboseObject);
	if (typeof printedLine === "string") return printedLine;
};
var appendNewline = (printedLine) => printedLine.endsWith("\n") ? printedLine : `${printedLine}\n`;
//#endregion
//#region node_modules/execa/lib/verbose/log.js
var verboseLog = ({ type, verboseMessage, fdNumber, verboseInfo, result }) => {
	const finalLines = applyVerboseOnLines(getPrintedLines(verboseMessage, getVerboseObject({
		type,
		result,
		verboseInfo
	})), verboseInfo, fdNumber);
	if (finalLines !== "") console.warn(finalLines.slice(0, -1));
};
var getVerboseObject = ({ type, result, verboseInfo }) => {
	const { escapedCommand, commandId, rawOptions } = verboseInfo;
	const { piped = false, ...options } = rawOptions;
	return {
		type,
		escapedCommand,
		commandId: `${commandId}`,
		timestamp: /* @__PURE__ */ new Date(),
		piped,
		result,
		options
	};
};
var getPrintedLines = (verboseMessage, verboseObject) => verboseMessage.split("\n").map((message) => getPrintedLine({
	...verboseObject,
	message
}));
var getPrintedLine = (verboseObject) => {
	return {
		verboseLine: defaultVerboseFunction(verboseObject),
		verboseObject
	};
};
var serializeVerboseMessage = (message) => {
	return escapeLines(typeof message === "string" ? message : inspect(message)).replaceAll("	", () => " ".repeat(TAB_SIZE));
};
var TAB_SIZE = 2;
//#endregion
//#region node_modules/execa/lib/verbose/start.js
var logCommand = (escapedCommand, verboseInfo) => {
	if (!isVerbose(verboseInfo)) return;
	verboseLog({
		type: "command",
		verboseMessage: escapedCommand,
		verboseInfo
	});
};
//#endregion
//#region node_modules/execa/lib/verbose/info.js
var getVerboseInfo = (verbose, escapedCommand, rawOptions) => {
	validateVerbose(verbose);
	return {
		verbose,
		escapedCommand,
		commandId: getCommandId(verbose),
		rawOptions
	};
};
var getCommandId = (verbose) => isVerbose({ verbose }) ? COMMAND_ID++ : void 0;
var COMMAND_ID = 0n;
var validateVerbose = (verbose) => {
	for (const fdVerbose of verbose) {
		if (fdVerbose === false) throw new TypeError("The \"verbose: false\" option was renamed to \"verbose: 'none'\".");
		if (fdVerbose === true) throw new TypeError("The \"verbose: true\" option was renamed to \"verbose: 'short'\".");
		if (!VERBOSE_VALUES.includes(fdVerbose) && !isVerboseFunction(fdVerbose)) {
			const allowedValues = VERBOSE_VALUES.map((allowedValue) => `'${allowedValue}'`).join(", ");
			throw new TypeError(`The "verbose" option must not be ${fdVerbose}. Allowed values are: ${allowedValues} or a function.`);
		}
	}
};
//#endregion
//#region node_modules/execa/lib/return/duration.js
var getStartTime = () => hrtime.bigint();
var getDurationMs = (startTime) => Number(hrtime.bigint() - startTime) / 1e6;
//#endregion
//#region node_modules/execa/lib/arguments/command.js
var handleCommand = (filePath, rawArguments, rawOptions) => {
	const startTime = getStartTime();
	const { command, escapedCommand } = joinCommand(filePath, rawArguments);
	const verboseInfo = getVerboseInfo(normalizeFdSpecificOption(rawOptions, "verbose"), escapedCommand, { ...rawOptions });
	logCommand(escapedCommand, verboseInfo);
	return {
		command,
		escapedCommand,
		startTime,
		verboseInfo
	};
};
//#endregion
//#region node_modules/path-key/index.js
function pathKey(options = {}) {
	const { env = process.env, platform = process.platform } = options;
	if (platform !== "win32") return "PATH";
	return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
}
promisify(execFile);
function toPath(urlOrPath) {
	return urlOrPath instanceof URL ? fileURLToPath$1(urlOrPath) : urlOrPath;
}
function traversePathUp(startPath) {
	return { *[Symbol.iterator]() {
		let currentPath = path.resolve(toPath(startPath));
		let previousPath;
		while (previousPath !== currentPath) {
			yield currentPath;
			previousPath = currentPath;
			currentPath = path.resolve(currentPath, "..");
		}
	} };
}
//#endregion
//#region node_modules/npm-run-path/index.js
var npmRunPath = ({ cwd = process$1.cwd(), path: pathOption = process$1.env[pathKey()], preferLocal = true, execPath = process$1.execPath, addExecPath = true } = {}) => {
	const cwdPath = path.resolve(toPath(cwd));
	const result = [];
	const pathParts = pathOption.split(path.delimiter);
	if (preferLocal) applyPreferLocal(result, pathParts, cwdPath);
	if (addExecPath) applyExecPath(result, pathParts, execPath, cwdPath);
	return pathOption === "" || pathOption === path.delimiter ? `${result.join(path.delimiter)}${pathOption}` : [...result, pathOption].join(path.delimiter);
};
var applyPreferLocal = (result, pathParts, cwdPath) => {
	for (const directory of traversePathUp(cwdPath)) {
		const pathPart = path.join(directory, "node_modules/.bin");
		if (!pathParts.includes(pathPart)) result.push(pathPart);
	}
};
var applyExecPath = (result, pathParts, execPath, cwdPath) => {
	const pathPart = path.resolve(cwdPath, toPath(execPath), "..");
	if (!pathParts.includes(pathPart)) result.push(pathPart);
};
var npmRunPathEnv = ({ env = process$1.env, ...options } = {}) => {
	env = { ...env };
	const pathName = pathKey({ env });
	options.path = env[pathName];
	env[pathName] = npmRunPath(options);
	return env;
};
//#endregion
//#region node_modules/execa/lib/return/final-error.js
var getFinalError = (originalError, message, isSync) => {
	return new (isSync ? ExecaSyncError : ExecaError)(message, originalError instanceof DiscardedError ? {} : { cause: originalError });
};
var DiscardedError = class extends Error {};
var setErrorName = (ErrorClass, value) => {
	Object.defineProperties(ErrorClass.prototype, {
		name: {
			value,
			writable: true,
			enumerable: false,
			configurable: true
		},
		[execaErrorSymbol]: {
			value: true,
			writable: false,
			enumerable: false,
			configurable: false
		}
	});
};
var isExecaError = (error) => isErrorInstance(error) && execaErrorSymbol in error;
var execaErrorSymbol = Symbol("isExecaError");
var isErrorInstance = (value) => Object.prototype.toString.call(value) === "[object Error]";
var ExecaError = class extends Error {};
setErrorName(ExecaError, ExecaError.name);
var ExecaSyncError = class extends Error {};
setErrorName(ExecaSyncError, ExecaSyncError.name);
//#endregion
//#region node_modules/human-signals/build/src/realtime.js
var getRealtimeSignals = () => {
	const length = 64 - SIGRTMIN + 1;
	return Array.from({ length }, getRealtimeSignal);
};
var getRealtimeSignal = (value, index) => ({
	name: `SIGRT${index + 1}`,
	number: SIGRTMIN + index,
	action: "terminate",
	description: "Application-specific signal (realtime)",
	standard: "posix"
});
var SIGRTMIN = 34;
//#endregion
//#region node_modules/human-signals/build/src/core.js
var SIGNALS = [
	{
		name: "SIGHUP",
		number: 1,
		action: "terminate",
		description: "Terminal closed",
		standard: "posix"
	},
	{
		name: "SIGINT",
		number: 2,
		action: "terminate",
		description: "User interruption with CTRL-C",
		standard: "ansi"
	},
	{
		name: "SIGQUIT",
		number: 3,
		action: "core",
		description: "User interruption with CTRL-\\",
		standard: "posix"
	},
	{
		name: "SIGILL",
		number: 4,
		action: "core",
		description: "Invalid machine instruction",
		standard: "ansi"
	},
	{
		name: "SIGTRAP",
		number: 5,
		action: "core",
		description: "Debugger breakpoint",
		standard: "posix"
	},
	{
		name: "SIGABRT",
		number: 6,
		action: "core",
		description: "Aborted",
		standard: "ansi"
	},
	{
		name: "SIGIOT",
		number: 6,
		action: "core",
		description: "Aborted",
		standard: "bsd"
	},
	{
		name: "SIGBUS",
		number: 7,
		action: "core",
		description: "Bus error due to misaligned, non-existing address or paging error",
		standard: "bsd"
	},
	{
		name: "SIGEMT",
		number: 7,
		action: "terminate",
		description: "Command should be emulated but is not implemented",
		standard: "other"
	},
	{
		name: "SIGFPE",
		number: 8,
		action: "core",
		description: "Floating point arithmetic error",
		standard: "ansi"
	},
	{
		name: "SIGKILL",
		number: 9,
		action: "terminate",
		description: "Forced termination",
		standard: "posix",
		forced: true
	},
	{
		name: "SIGUSR1",
		number: 10,
		action: "terminate",
		description: "Application-specific signal",
		standard: "posix"
	},
	{
		name: "SIGSEGV",
		number: 11,
		action: "core",
		description: "Segmentation fault",
		standard: "ansi"
	},
	{
		name: "SIGUSR2",
		number: 12,
		action: "terminate",
		description: "Application-specific signal",
		standard: "posix"
	},
	{
		name: "SIGPIPE",
		number: 13,
		action: "terminate",
		description: "Broken pipe or socket",
		standard: "posix"
	},
	{
		name: "SIGALRM",
		number: 14,
		action: "terminate",
		description: "Timeout or timer",
		standard: "posix"
	},
	{
		name: "SIGTERM",
		number: 15,
		action: "terminate",
		description: "Termination",
		standard: "ansi"
	},
	{
		name: "SIGSTKFLT",
		number: 16,
		action: "terminate",
		description: "Stack is empty or overflowed",
		standard: "other"
	},
	{
		name: "SIGCHLD",
		number: 17,
		action: "ignore",
		description: "Child process terminated, paused or unpaused",
		standard: "posix"
	},
	{
		name: "SIGCLD",
		number: 17,
		action: "ignore",
		description: "Child process terminated, paused or unpaused",
		standard: "other"
	},
	{
		name: "SIGCONT",
		number: 18,
		action: "unpause",
		description: "Unpaused",
		standard: "posix",
		forced: true
	},
	{
		name: "SIGSTOP",
		number: 19,
		action: "pause",
		description: "Paused",
		standard: "posix",
		forced: true
	},
	{
		name: "SIGTSTP",
		number: 20,
		action: "pause",
		description: "Paused using CTRL-Z or \"suspend\"",
		standard: "posix"
	},
	{
		name: "SIGTTIN",
		number: 21,
		action: "pause",
		description: "Background process cannot read terminal input",
		standard: "posix"
	},
	{
		name: "SIGBREAK",
		number: 21,
		action: "terminate",
		description: "User interruption with CTRL-BREAK",
		standard: "other"
	},
	{
		name: "SIGTTOU",
		number: 22,
		action: "pause",
		description: "Background process cannot write to terminal output",
		standard: "posix"
	},
	{
		name: "SIGURG",
		number: 23,
		action: "ignore",
		description: "Socket received out-of-band data",
		standard: "bsd"
	},
	{
		name: "SIGXCPU",
		number: 24,
		action: "core",
		description: "Process timed out",
		standard: "bsd"
	},
	{
		name: "SIGXFSZ",
		number: 25,
		action: "core",
		description: "File too big",
		standard: "bsd"
	},
	{
		name: "SIGVTALRM",
		number: 26,
		action: "terminate",
		description: "Timeout or timer",
		standard: "bsd"
	},
	{
		name: "SIGPROF",
		number: 27,
		action: "terminate",
		description: "Timeout or timer",
		standard: "bsd"
	},
	{
		name: "SIGWINCH",
		number: 28,
		action: "ignore",
		description: "Terminal window size changed",
		standard: "bsd"
	},
	{
		name: "SIGIO",
		number: 29,
		action: "terminate",
		description: "I/O is available",
		standard: "other"
	},
	{
		name: "SIGPOLL",
		number: 29,
		action: "terminate",
		description: "Watched event",
		standard: "other"
	},
	{
		name: "SIGINFO",
		number: 29,
		action: "ignore",
		description: "Request for process information",
		standard: "other"
	},
	{
		name: "SIGPWR",
		number: 30,
		action: "terminate",
		description: "Device running out of power",
		standard: "systemv"
	},
	{
		name: "SIGSYS",
		number: 31,
		action: "core",
		description: "Invalid system call",
		standard: "other"
	},
	{
		name: "SIGUNUSED",
		number: 31,
		action: "terminate",
		description: "Invalid system call",
		standard: "other"
	}
];
//#endregion
//#region node_modules/human-signals/build/src/signals.js
var getSignals = () => {
	const realtimeSignals = getRealtimeSignals();
	return [...SIGNALS, ...realtimeSignals].map(normalizeSignal$1);
};
var normalizeSignal$1 = ({ name, number: defaultNumber, description, action, forced = false, standard }) => {
	const { signals: { [name]: constantSignal } } = constants;
	const supported = constantSignal !== void 0;
	return {
		name,
		number: supported ? constantSignal : defaultNumber,
		description,
		supported,
		action,
		forced,
		standard
	};
};
//#endregion
//#region node_modules/human-signals/build/src/main.js
var getSignalsByName = () => {
	const signals = getSignals();
	return Object.fromEntries(signals.map(getSignalByName));
};
var getSignalByName = ({ name, number, description, supported, action, forced, standard }) => [name, {
	name,
	number,
	description,
	supported,
	action,
	forced,
	standard
}];
var signalsByName = getSignalsByName();
var getSignalsByNumber = () => {
	const signals = getSignals();
	const signalsA = Array.from({ length: 65 }, (value, number) => getSignalByNumber(number, signals));
	return Object.assign({}, ...signalsA);
};
var getSignalByNumber = (number, signals) => {
	const signal = findSignalByNumber(number, signals);
	if (signal === void 0) return {};
	const { name, description, supported, action, forced, standard } = signal;
	return { [number]: {
		name,
		number,
		description,
		supported,
		action,
		forced,
		standard
	} };
};
var findSignalByNumber = (number, signals) => {
	const signal = signals.find(({ name }) => constants.signals[name] === number);
	if (signal !== void 0) return signal;
	return signals.find((signalA) => signalA.number === number);
};
getSignalsByNumber();
//#endregion
//#region node_modules/execa/lib/terminate/signal.js
var normalizeKillSignal = (killSignal) => {
	const optionName = "option `killSignal`";
	if (killSignal === 0) throw new TypeError(`Invalid ${optionName}: 0 cannot be used.`);
	return normalizeSignal(killSignal, optionName);
};
var normalizeSignalArgument = (signal) => signal === 0 ? signal : normalizeSignal(signal, "`subprocess.kill()`'s argument");
var normalizeSignal = (signalNameOrInteger, optionName) => {
	if (Number.isInteger(signalNameOrInteger)) return normalizeSignalInteger(signalNameOrInteger, optionName);
	if (typeof signalNameOrInteger === "string") return normalizeSignalName(signalNameOrInteger, optionName);
	throw new TypeError(`Invalid ${optionName} ${String(signalNameOrInteger)}: it must be a string or an integer.\n${getAvailableSignals()}`);
};
var normalizeSignalInteger = (signalInteger, optionName) => {
	if (signalsIntegerToName.has(signalInteger)) return signalsIntegerToName.get(signalInteger);
	throw new TypeError(`Invalid ${optionName} ${signalInteger}: this signal integer does not exist.\n${getAvailableSignals()}`);
};
var getSignalsIntegerToName = () => new Map(Object.entries(constants.signals).reverse().map(([signalName, signalInteger]) => [signalInteger, signalName]));
var signalsIntegerToName = getSignalsIntegerToName();
var normalizeSignalName = (signalName, optionName) => {
	if (signalName in constants.signals) return signalName;
	if (signalName.toUpperCase() in constants.signals) throw new TypeError(`Invalid ${optionName} '${signalName}': please rename it to '${signalName.toUpperCase()}'.`);
	throw new TypeError(`Invalid ${optionName} '${signalName}': this signal name does not exist.\n${getAvailableSignals()}`);
};
var getAvailableSignals = () => `Available signal names: ${getAvailableSignalNames()}.
Available signal numbers: ${getAvailableSignalIntegers()}.`;
var getAvailableSignalNames = () => Object.keys(constants.signals).sort().map((signalName) => `'${signalName}'`).join(", ");
var getAvailableSignalIntegers = () => [...new Set(Object.values(constants.signals).sort((signalInteger, signalIntegerTwo) => signalInteger - signalIntegerTwo))].join(", ");
var getSignalDescription = (signal) => signalsByName[signal].description;
//#endregion
//#region node_modules/execa/lib/terminate/kill.js
var normalizeForceKillAfterDelay = (forceKillAfterDelay) => {
	if (forceKillAfterDelay === false) return forceKillAfterDelay;
	if (forceKillAfterDelay === true) return DEFAULT_FORCE_KILL_TIMEOUT;
	if (!Number.isFinite(forceKillAfterDelay) || forceKillAfterDelay < 0) throw new TypeError(`Expected the \`forceKillAfterDelay\` option to be a non-negative integer, got \`${forceKillAfterDelay}\` (${typeof forceKillAfterDelay})`);
	return forceKillAfterDelay;
};
var DEFAULT_FORCE_KILL_TIMEOUT = 5e3;
var subprocessKill = ({ kill, options: { forceKillAfterDelay, killSignal }, onInternalError, context, controller }, signalOrError, errorArgument) => {
	const { signal, error } = parseKillArguments(signalOrError, errorArgument, killSignal);
	emitKillError(error, onInternalError);
	const killResult = kill(signal);
	setKillTimeout({
		kill,
		signal,
		forceKillAfterDelay,
		killSignal,
		killResult,
		context,
		controller
	});
	return killResult;
};
var parseKillArguments = (signalOrError, errorArgument, killSignal) => {
	const [signal = killSignal, error] = isErrorInstance(signalOrError) ? [void 0, signalOrError] : [signalOrError, errorArgument];
	if (typeof signal !== "string" && !Number.isInteger(signal)) throw new TypeError(`The first argument must be an error instance or a signal name string/integer: ${String(signal)}`);
	if (error !== void 0 && !isErrorInstance(error)) throw new TypeError(`The second argument is optional. If specified, it must be an error instance: ${error}`);
	return {
		signal: normalizeSignalArgument(signal),
		error
	};
};
var emitKillError = (error, onInternalError) => {
	if (error !== void 0) onInternalError.reject(error);
};
var setKillTimeout = async ({ kill, signal, forceKillAfterDelay, killSignal, killResult, context, controller }) => {
	if (signal === killSignal && killResult) killOnTimeout({
		kill,
		forceKillAfterDelay,
		context,
		controllerSignal: controller.signal
	});
};
var killOnTimeout = async ({ kill, forceKillAfterDelay, context, controllerSignal }) => {
	if (forceKillAfterDelay === false) return;
	try {
		await setTimeout$1(forceKillAfterDelay, void 0, { signal: controllerSignal });
		if (kill("SIGKILL")) context.isForcefullyTerminated ??= true;
	} catch {}
};
//#endregion
//#region node_modules/execa/lib/utils/abort-signal.js
var onAbortedSignal = async (mainSignal, stopSignal) => {
	if (!mainSignal.aborted) await once(mainSignal, "abort", { signal: stopSignal });
};
//#endregion
//#region node_modules/execa/lib/terminate/cancel.js
var validateCancelSignal = ({ cancelSignal }) => {
	if (cancelSignal !== void 0 && Object.prototype.toString.call(cancelSignal) !== "[object AbortSignal]") throw new Error(`The \`cancelSignal\` option must be an AbortSignal: ${String(cancelSignal)}`);
};
var throwOnCancel = ({ kill, cancelSignal, gracefulCancel, context, controller }) => cancelSignal === void 0 || gracefulCancel ? [] : [terminateOnCancel(kill, cancelSignal, context, controller)];
var terminateOnCancel = async (kill, cancelSignal, context, { signal }) => {
	await onAbortedSignal(cancelSignal, signal);
	context.terminationReason ??= "cancel";
	kill();
	throw cancelSignal.reason;
};
//#endregion
//#region node_modules/execa/lib/ipc/validation.js
var validateIpcMethod = ({ methodName, isSubprocess, ipc, isConnected }) => {
	validateIpcOption(methodName, isSubprocess, ipc);
	validateConnection(methodName, isSubprocess, isConnected);
};
var validateIpcOption = (methodName, isSubprocess, ipc) => {
	if (!ipc) throw new Error(`${getMethodName(methodName, isSubprocess)} can only be used if the \`ipc\` option is \`true\`.`);
};
var validateConnection = (methodName, isSubprocess, isConnected) => {
	if (!isConnected) throw new Error(`${getMethodName(methodName, isSubprocess)} cannot be used: the ${getOtherProcessName(isSubprocess)} has already exited or disconnected.`);
};
var throwOnEarlyDisconnect = (isSubprocess) => {
	throw new Error(`${getMethodName("getOneMessage", isSubprocess)} could not complete: the ${getOtherProcessName(isSubprocess)} exited or disconnected.`);
};
var throwOnStrictDeadlockError = (isSubprocess) => {
	throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} is sending a message too, instead of listening to incoming messages.
This can be fixed by both sending a message and listening to incoming messages at the same time:

const [receivedMessage] = await Promise.all([
	${getMethodName("getOneMessage", isSubprocess)},
	${getMethodName("sendMessage", isSubprocess, "message, {strict: true}")},
]);`);
};
var getStrictResponseError = (error, isSubprocess) => new Error(`${getMethodName("sendMessage", isSubprocess)} failed when sending an acknowledgment response to the ${getOtherProcessName(isSubprocess)}.`, { cause: error });
var throwOnMissingStrict = (isSubprocess) => {
	throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} is not listening to incoming messages.`);
};
var throwOnStrictDisconnect = (isSubprocess) => {
	throw new Error(`${getMethodName("sendMessage", isSubprocess)} failed: the ${getOtherProcessName(isSubprocess)} exited without listening to incoming messages.`);
};
var getAbortDisconnectError = () => /* @__PURE__ */ new Error(`\`cancelSignal\` aborted: the ${getOtherProcessName(true)} disconnected.`);
var throwOnMissingParent = () => {
	throw new Error("`getCancelSignal()` cannot be used without setting the `cancelSignal` subprocess option.");
};
var handleEpipeError = ({ error, methodName, isSubprocess }) => {
	if (error.code === "EPIPE") throw new Error(`${getMethodName(methodName, isSubprocess)} cannot be used: the ${getOtherProcessName(isSubprocess)} is disconnecting.`, { cause: error });
};
var handleSerializationError = ({ error, methodName, isSubprocess, message }) => {
	if (isSerializationError(error)) throw new Error(`${getMethodName(methodName, isSubprocess)}'s argument type is invalid: the message cannot be serialized: ${String(message)}.`, { cause: error });
};
var isSerializationError = ({ code, message }) => SERIALIZATION_ERROR_CODES.has(code) || SERIALIZATION_ERROR_MESSAGES.some((serializationErrorMessage) => message.includes(serializationErrorMessage));
var SERIALIZATION_ERROR_CODES = /* @__PURE__ */ new Set(["ERR_MISSING_ARGS", "ERR_INVALID_ARG_TYPE"]);
var SERIALIZATION_ERROR_MESSAGES = [
	"could not be cloned",
	"circular structure",
	"call stack size exceeded"
];
var getMethodName = (methodName, isSubprocess, parameters = "") => methodName === "cancelSignal" ? "`cancelSignal`'s `controller.abort()`" : `${getNamespaceName(isSubprocess)}${methodName}(${parameters})`;
var getNamespaceName = (isSubprocess) => isSubprocess ? "" : "subprocess.";
var getOtherProcessName = (isSubprocess) => isSubprocess ? "parent process" : "subprocess";
var disconnect = (anyProcess) => {
	if (anyProcess.connected) anyProcess.disconnect();
};
//#endregion
//#region node_modules/execa/lib/utils/deferred.js
var createDeferred = () => {
	const methods = {};
	const promise = new Promise((resolve, reject) => {
		Object.assign(methods, {
			resolve,
			reject
		});
	});
	return Object.assign(promise, methods);
};
//#endregion
//#region node_modules/execa/lib/utils/max-listeners.js
var incrementMaxListeners = (eventEmitter, maxListenersIncrement, signal) => {
	const maxListeners = eventEmitter.getMaxListeners();
	if (maxListeners === 0 || maxListeners === Infinity) return;
	eventEmitter.setMaxListeners(maxListeners + maxListenersIncrement);
	addAbortListener(signal, () => {
		eventEmitter.setMaxListeners(eventEmitter.getMaxListeners() - maxListenersIncrement);
	});
};
//#endregion
//#region node_modules/execa/lib/ipc/reference.js
var addReference = (channel, reference) => {
	if (reference) addReferenceCount(channel);
};
var addReferenceCount = (channel) => {
	channel.refCounted();
};
var removeReference = (channel, reference) => {
	if (reference) removeReferenceCount(channel);
};
var removeReferenceCount = (channel) => {
	channel.unrefCounted();
};
var undoAddedReferences = (channel, isSubprocess) => {
	if (!isSubprocess) return;
	removeReferenceCount(channel);
	removeReferenceCount(channel);
};
var redoAddedReferences = (channel, isSubprocess) => {
	if (!isSubprocess) return;
	addReferenceCount(channel);
	addReferenceCount(channel);
};
//#endregion
//#region node_modules/execa/lib/ipc/incoming.js
var onMessage = async ({ anyProcess, channel, isSubprocess, ipcEmitter }, wrappedMessage) => {
	if (handleStrictResponse(wrappedMessage) || handleAbort(wrappedMessage)) return;
	if (!INCOMING_MESSAGES.has(anyProcess)) INCOMING_MESSAGES.set(anyProcess, []);
	const incomingMessages = INCOMING_MESSAGES.get(anyProcess);
	incomingMessages.push(wrappedMessage);
	if (incomingMessages.length > 1) return;
	while (incomingMessages.length > 0) {
		await waitForOutgoingMessages(anyProcess, ipcEmitter, wrappedMessage);
		await scheduler.yield();
		const message = await handleStrictRequest({
			wrappedMessage: incomingMessages[0],
			anyProcess,
			channel,
			isSubprocess,
			ipcEmitter
		});
		incomingMessages.shift();
		ipcEmitter.emit("message", message);
		ipcEmitter.emit("message:done");
	}
};
var onDisconnect = async ({ anyProcess, channel, isSubprocess, ipcEmitter, boundOnMessage }) => {
	abortOnDisconnect();
	const incomingMessages = INCOMING_MESSAGES.get(anyProcess);
	while (incomingMessages?.length > 0) await once(ipcEmitter, "message:done");
	anyProcess.removeListener("message", boundOnMessage);
	redoAddedReferences(channel, isSubprocess);
	ipcEmitter.connected = false;
	ipcEmitter.emit("disconnect");
};
var INCOMING_MESSAGES = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/execa/lib/ipc/forward.js
var getIpcEmitter = (anyProcess, channel, isSubprocess) => {
	if (IPC_EMITTERS.has(anyProcess)) return IPC_EMITTERS.get(anyProcess);
	const ipcEmitter = new EventEmitter();
	ipcEmitter.connected = true;
	IPC_EMITTERS.set(anyProcess, ipcEmitter);
	forwardEvents({
		ipcEmitter,
		anyProcess,
		channel,
		isSubprocess
	});
	return ipcEmitter;
};
var IPC_EMITTERS = /* @__PURE__ */ new WeakMap();
var forwardEvents = ({ ipcEmitter, anyProcess, channel, isSubprocess }) => {
	const boundOnMessage = onMessage.bind(void 0, {
		anyProcess,
		channel,
		isSubprocess,
		ipcEmitter
	});
	anyProcess.on("message", boundOnMessage);
	anyProcess.once("disconnect", onDisconnect.bind(void 0, {
		anyProcess,
		channel,
		isSubprocess,
		ipcEmitter,
		boundOnMessage
	}));
	undoAddedReferences(channel, isSubprocess);
};
var isConnected = (anyProcess) => {
	const ipcEmitter = IPC_EMITTERS.get(anyProcess);
	return ipcEmitter === void 0 ? anyProcess.channel !== void 0 && anyProcess.channel !== null : ipcEmitter.connected;
};
//#endregion
//#region node_modules/execa/lib/ipc/strict.js
var handleSendStrict = ({ anyProcess, channel, isSubprocess, message, strict }) => {
	if (!strict) return message;
	const hasListeners = hasMessageListeners(anyProcess, getIpcEmitter(anyProcess, channel, isSubprocess));
	return {
		id: count++,
		type: REQUEST_TYPE,
		message,
		hasListeners
	};
};
var count = 0n;
var validateStrictDeadlock = (outgoingMessages, wrappedMessage) => {
	if (wrappedMessage?.type !== REQUEST_TYPE || wrappedMessage.hasListeners) return;
	for (const { id } of outgoingMessages) if (id !== void 0) STRICT_RESPONSES[id].resolve({
		isDeadlock: true,
		hasListeners: false
	});
};
var handleStrictRequest = async ({ wrappedMessage, anyProcess, channel, isSubprocess, ipcEmitter }) => {
	if (wrappedMessage?.type !== REQUEST_TYPE || !anyProcess.connected) return wrappedMessage;
	const { id, message } = wrappedMessage;
	const response = {
		id,
		type: RESPONSE_TYPE,
		message: hasMessageListeners(anyProcess, ipcEmitter)
	};
	try {
		await sendMessage$1({
			anyProcess,
			channel,
			isSubprocess,
			ipc: true
		}, response);
	} catch (error) {
		ipcEmitter.emit("strict:error", error);
	}
	return message;
};
var handleStrictResponse = (wrappedMessage) => {
	if (wrappedMessage?.type !== RESPONSE_TYPE) return false;
	const { id, message: hasListeners } = wrappedMessage;
	STRICT_RESPONSES[id]?.resolve({
		isDeadlock: false,
		hasListeners
	});
	return true;
};
var waitForStrictResponse = async (wrappedMessage, anyProcess, isSubprocess) => {
	if (wrappedMessage?.type !== REQUEST_TYPE) return;
	const deferred = createDeferred();
	STRICT_RESPONSES[wrappedMessage.id] = deferred;
	const controller = new AbortController();
	try {
		const { isDeadlock, hasListeners } = await Promise.race([deferred, throwOnDisconnect$1(anyProcess, isSubprocess, controller)]);
		if (isDeadlock) throwOnStrictDeadlockError(isSubprocess);
		if (!hasListeners) throwOnMissingStrict(isSubprocess);
	} finally {
		controller.abort();
		delete STRICT_RESPONSES[wrappedMessage.id];
	}
};
var STRICT_RESPONSES = {};
var throwOnDisconnect$1 = async (anyProcess, isSubprocess, { signal }) => {
	incrementMaxListeners(anyProcess, 1, signal);
	await once(anyProcess, "disconnect", { signal });
	throwOnStrictDisconnect(isSubprocess);
};
var REQUEST_TYPE = "execa:ipc:request";
var RESPONSE_TYPE = "execa:ipc:response";
//#endregion
//#region node_modules/execa/lib/ipc/outgoing.js
var startSendMessage = (anyProcess, wrappedMessage, strict) => {
	if (!OUTGOING_MESSAGES.has(anyProcess)) OUTGOING_MESSAGES.set(anyProcess, /* @__PURE__ */ new Set());
	const outgoingMessages = OUTGOING_MESSAGES.get(anyProcess);
	const outgoingMessage = {
		onMessageSent: createDeferred(),
		id: strict ? wrappedMessage.id : void 0
	};
	outgoingMessages.add(outgoingMessage);
	return {
		outgoingMessages,
		outgoingMessage
	};
};
var endSendMessage = ({ outgoingMessages, outgoingMessage }) => {
	outgoingMessages.delete(outgoingMessage);
	outgoingMessage.onMessageSent.resolve();
};
var waitForOutgoingMessages = async (anyProcess, ipcEmitter, wrappedMessage) => {
	while (!hasMessageListeners(anyProcess, ipcEmitter) && OUTGOING_MESSAGES.get(anyProcess)?.size > 0) {
		const outgoingMessages = [...OUTGOING_MESSAGES.get(anyProcess)];
		validateStrictDeadlock(outgoingMessages, wrappedMessage);
		await Promise.all(outgoingMessages.map(({ onMessageSent }) => onMessageSent));
	}
};
var OUTGOING_MESSAGES = /* @__PURE__ */ new WeakMap();
var IPC_SUBPROCESS_OPTIONS = /* @__PURE__ */ new WeakMap();
var setIpcSubprocessOptions = (subprocess, options) => {
	IPC_SUBPROCESS_OPTIONS.set(subprocess, options);
};
var hasMessageListeners = (anyProcess, ipcEmitter) => ipcEmitter.listenerCount("message") > getMinListenerCount(anyProcess);
var getMinListenerCount = (anyProcess) => getOptions(anyProcess) !== void 0 && !getFdSpecificValue(getOptions(anyProcess).buffer, "ipc") ? 1 : 0;
var getOptions = (anyProcess) => IPC_SUBPROCESS_OPTIONS.get(anyProcess);
//#endregion
//#region node_modules/execa/lib/ipc/send.js
var sendMessage$1 = ({ anyProcess, channel, isSubprocess, ipc }, message, { strict = false } = {}) => {
	const methodName = "sendMessage";
	validateIpcMethod({
		methodName,
		isSubprocess,
		ipc,
		isConnected: anyProcess.connected
	});
	return sendMessageAsync({
		anyProcess,
		channel,
		methodName,
		isSubprocess,
		message,
		strict
	});
};
var sendMessageAsync = async ({ anyProcess, channel, methodName, isSubprocess, message, strict }) => {
	const wrappedMessage = handleSendStrict({
		anyProcess,
		channel,
		isSubprocess,
		message,
		strict
	});
	const outgoingMessagesState = startSendMessage(anyProcess, wrappedMessage, strict);
	try {
		await sendOneMessage({
			anyProcess,
			methodName,
			isSubprocess,
			wrappedMessage,
			message
		});
	} catch (error) {
		disconnect(anyProcess);
		throw error;
	} finally {
		endSendMessage(outgoingMessagesState);
	}
};
var sendOneMessage = async ({ anyProcess, methodName, isSubprocess, wrappedMessage, message }) => {
	const sendMethod = getSendMethod(anyProcess);
	try {
		await Promise.all([waitForStrictResponse(wrappedMessage, anyProcess, isSubprocess), sendMethod(wrappedMessage)]);
	} catch (error) {
		handleEpipeError({
			error,
			methodName,
			isSubprocess
		});
		handleSerializationError({
			error,
			methodName,
			isSubprocess,
			message
		});
		throw error;
	}
};
var getSendMethod = (anyProcess) => {
	if (PROCESS_SEND_METHODS.has(anyProcess)) return PROCESS_SEND_METHODS.get(anyProcess);
	const sendMethod = promisify(anyProcess.send.bind(anyProcess));
	PROCESS_SEND_METHODS.set(anyProcess, sendMethod);
	return sendMethod;
};
var PROCESS_SEND_METHODS = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/execa/lib/ipc/graceful.js
var sendAbort = (subprocess, message) => {
	const methodName = "cancelSignal";
	validateConnection(methodName, false, subprocess.connected);
	return sendOneMessage({
		anyProcess: subprocess,
		methodName,
		isSubprocess: false,
		wrappedMessage: {
			type: GRACEFUL_CANCEL_TYPE,
			message
		},
		message
	});
};
var getCancelSignal$1 = async ({ anyProcess, channel, isSubprocess, ipc }) => {
	await startIpc({
		anyProcess,
		channel,
		isSubprocess,
		ipc
	});
	return cancelController.signal;
};
var startIpc = async ({ anyProcess, channel, isSubprocess, ipc }) => {
	if (isCancelListening) return;
	isCancelListening = true;
	if (!ipc) {
		throwOnMissingParent();
		return;
	}
	if (channel === null) {
		abortOnDisconnect();
		return;
	}
	getIpcEmitter(anyProcess, channel, isSubprocess);
	await scheduler.yield();
};
var isCancelListening = false;
var handleAbort = (wrappedMessage) => {
	if (wrappedMessage?.type !== GRACEFUL_CANCEL_TYPE) return false;
	cancelController.abort(wrappedMessage.message);
	return true;
};
var GRACEFUL_CANCEL_TYPE = "execa:ipc:cancel";
var abortOnDisconnect = () => {
	cancelController.abort(getAbortDisconnectError());
};
var cancelController = new AbortController();
//#endregion
//#region node_modules/execa/lib/terminate/graceful.js
var validateGracefulCancel = ({ gracefulCancel, cancelSignal, ipc, serialization }) => {
	if (!gracefulCancel) return;
	if (cancelSignal === void 0) throw new Error("The `cancelSignal` option must be defined when setting the `gracefulCancel` option.");
	if (!ipc) throw new Error("The `ipc` option cannot be false when setting the `gracefulCancel` option.");
	if (serialization === "json") throw new Error("The `serialization` option cannot be 'json' when setting the `gracefulCancel` option.");
};
var throwOnGracefulCancel = ({ subprocess, kill, cancelSignal, gracefulCancel, forceKillAfterDelay, context, controller }) => gracefulCancel ? [sendOnAbort({
	subprocess,
	kill,
	cancelSignal,
	forceKillAfterDelay,
	context,
	controller
})] : [];
var sendOnAbort = async ({ subprocess, kill, cancelSignal, forceKillAfterDelay, context, controller: { signal } }) => {
	await onAbortedSignal(cancelSignal, signal);
	await sendAbort(subprocess, getReason(cancelSignal));
	killOnTimeout({
		kill,
		forceKillAfterDelay,
		context,
		controllerSignal: signal
	});
	context.terminationReason ??= "gracefulCancel";
	throw cancelSignal.reason;
};
var getReason = ({ reason }) => {
	if (!(reason instanceof DOMException)) return reason;
	const error = new Error(reason.message);
	Object.defineProperty(error, "stack", {
		value: reason.stack,
		enumerable: false,
		configurable: true,
		writable: true
	});
	return error;
};
//#endregion
//#region node_modules/execa/lib/terminate/timeout.js
var validateTimeout = ({ timeout }) => {
	if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
};
var throwOnTimeout = (kill, timeout, context, controller) => timeout === 0 || timeout === void 0 ? [] : [killAfterTimeout(kill, timeout, context, controller)];
var killAfterTimeout = async (kill, timeout, context, { signal }) => {
	await setTimeout$1(timeout, void 0, { signal });
	context.terminationReason ??= "timeout";
	kill();
	throw new DiscardedError();
};
//#endregion
//#region node_modules/execa/lib/methods/node.js
var mapNode = ({ options }) => {
	if (options.node === false) throw new TypeError("The \"node\" option cannot be false with `execaNode()`.");
	return { options: {
		...options,
		node: true
	} };
};
var handleNodeOption = (file, commandArguments, { node: shouldHandleNode = false, nodePath = execPath, nodeOptions = execArgv.filter((nodeOption) => !nodeOption.startsWith("--inspect")), cwd, execPath: formerNodePath, ...options }) => {
	if (formerNodePath !== void 0) throw new TypeError("The \"execPath\" option has been removed. Please use the \"nodePath\" option instead.");
	const normalizedNodePath = safeNormalizeFileUrl(nodePath, "The \"nodePath\" option");
	const resolvedNodePath = path.resolve(cwd, normalizedNodePath);
	const newOptions = {
		__proto__: null,
		shell: false,
		...options,
		nodePath: resolvedNodePath,
		node: shouldHandleNode,
		cwd
	};
	if (!shouldHandleNode) return [
		file,
		commandArguments,
		newOptions
	];
	if (path.basename(file, ".exe") === "node") throw new TypeError("When the \"node\" option is true, the first argument does not need to be \"node\".");
	return [
		resolvedNodePath,
		[
			...nodeOptions,
			file,
			...commandArguments
		],
		{
			__proto__: null,
			ipc: true,
			...newOptions,
			shell: false
		}
	];
};
//#endregion
//#region node_modules/execa/lib/ipc/ipc-input.js
var validateIpcInputOption = ({ ipcInput, ipc, serialization }) => {
	if (ipcInput === void 0) return;
	if (!ipc) throw new Error("The `ipcInput` option cannot be set unless the `ipc` option is `true`.");
	validateIpcInput[serialization](ipcInput);
};
var validateAdvancedInput = (ipcInput) => {
	try {
		serialize(ipcInput);
	} catch (error) {
		throw new Error("The `ipcInput` option is not serializable with a structured clone.", { cause: error });
	}
};
var validateJsonInput = (ipcInput) => {
	try {
		JSON.stringify(ipcInput);
	} catch (error) {
		throw new Error("The `ipcInput` option is not serializable with JSON.", { cause: error });
	}
};
var validateIpcInput = {
	advanced: validateAdvancedInput,
	json: validateJsonInput
};
var sendIpcInput = async (subprocess, ipcInput, ipc) => {
	if (ipcInput === void 0) return;
	await sendMessage$1({
		anyProcess: subprocess,
		channel: subprocess.channel,
		isSubprocess: false,
		ipc
	}, ipcInput);
};
//#endregion
//#region node_modules/execa/lib/arguments/encoding-option.js
var validateEncoding = ({ encoding }) => {
	if (ENCODINGS.has(encoding)) return;
	const correctEncoding = getCorrectEncoding(encoding);
	if (correctEncoding !== void 0) throw new TypeError(`Invalid option \`encoding: ${serializeEncoding(encoding)}\`.
Please rename it to ${serializeEncoding(correctEncoding)}.`);
	const correctEncodings = [...ENCODINGS].map((correctEncoding) => serializeEncoding(correctEncoding)).join(", ");
	throw new TypeError(`Invalid option \`encoding: ${serializeEncoding(encoding)}\`.
Please rename it to one of: ${correctEncodings}.`);
};
var TEXT_ENCODINGS = /* @__PURE__ */ new Set(["utf8", "utf16le"]);
var BINARY_ENCODINGS = /* @__PURE__ */ new Set([
	"buffer",
	"hex",
	"base64",
	"base64url",
	"latin1",
	"ascii"
]);
var ENCODINGS = TEXT_ENCODINGS.union(BINARY_ENCODINGS);
var getCorrectEncoding = (encoding) => {
	if (encoding === null) return "buffer";
	if (typeof encoding !== "string") return;
	const lowerEncoding = encoding.toLowerCase();
	if (lowerEncoding in ENCODING_ALIASES) return ENCODING_ALIASES[lowerEncoding];
	if (ENCODINGS.has(lowerEncoding)) return lowerEncoding;
};
var ENCODING_ALIASES = {
	"utf-8": "utf8",
	"utf-16le": "utf16le",
	"ucs-2": "utf16le",
	ucs2: "utf16le",
	binary: "latin1"
};
var serializeEncoding = (encoding) => typeof encoding === "string" ? `"${encoding}"` : String(encoding);
//#endregion
//#region node_modules/which-command/index.js
var isWindows$1 = process$1.platform === "win32";
var separatorPattern = isWindows$1 ? new RegExp("[\\/\\\\]", "v") : new RegExp("\\/", "v");
var defaultPathExt = ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC";
function resolveOptions(command, options) {
	if (typeof command !== "string" || command.length === 0) throw new TypeError("Expected a non-empty string.");
	const { cwd = process$1.cwd(), path: searchPath = process$1.env.PATH ?? (isWindows$1 ? process$1.env.Path : void 0) ?? "", pathExt = process$1.env.PATHEXT || defaultPathExt } = options;
	return {
		cwd,
		searchPath,
		pathExt
	};
}
function windowsExtensions(command, pathExt) {
	const extensions = pathExt.split(path.delimiter).filter(Boolean);
	const commandExtension = path.extname(command).toLowerCase();
	if (commandExtension !== "" && extensions.some((extension) => extension.toLowerCase() === commandExtension)) return ["", ...extensions];
	return extensions;
}
function* candidatePaths(command, { cwd, searchPath, pathExt }) {
	const extensions = isWindows$1 ? windowsExtensions(command, pathExt) : [""];
	if (separatorPattern.test(command)) {
		const base = path.resolve(cwd, command);
		for (const extension of extensions) yield base + extension;
		return;
	}
	const directories = [...isWindows$1 ? [cwd] : [], ...searchPath.split(path.delimiter)];
	for (const directory of directories) {
		const unquoted = isWindows$1 && directory.length > 1 && directory.startsWith("\"") && directory.endsWith("\"") ? directory.slice(1, -1) : directory;
		if (unquoted === "") continue;
		const base = path.resolve(cwd, unquoted, command);
		for (const extension of extensions) yield base + extension;
	}
}
function isExecutableSync(filePath) {
	let stats;
	try {
		stats = fs.statSync(filePath);
	} catch (error) {
		return isWindows$1 && error.code === "EACCES";
	}
	if (!stats.isFile()) return false;
	if (isWindows$1) return true;
	try {
		fs.accessSync(filePath, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
function whichCommandSync(command, options = {}) {
	const resolved = resolveOptions(command, options);
	for (const candidate of candidatePaths(command, resolved)) if (isExecutableSync(candidate)) return candidate;
}
//#endregion
//#region node_modules/execa/lib/arguments/command-file.js
var parseCommandFile = (file, commandArguments, options) => {
	const parsed = {
		file,
		commandArguments: [...commandArguments],
		options
	};
	if (options.shell || process$1.platform !== "win32") return parsed;
	return escapeWindowsCommand(parsed);
};
var directlyExecutableRegExp = /\.(?:com|exe)$/i;
var batchFileRegExp = /\.(?:bat|cmd)$/i;
var escapeWindowsCommand = (parsed) => {
	const resolvedFile = resolveWithShebang(parsed);
	if (resolvedFile !== void 0 && directlyExecutableRegExp.test(resolvedFile)) {
		if (parsed.options.argv0 === void 0) parsed.options.argv0 = parsed.file;
		parsed.file = resolvedFile;
		return parsed;
	}
	for (const value of [parsed.file, ...parsed.commandArguments]) assertNoLineBreak(value);
	const isDoubleEscape = resolvedFile !== void 0 && batchFileRegExp.test(resolvedFile);
	const commandLine = `"${[escapeMetaChars(path.normalize(resolvedFile ?? parsed.file)), ...parsed.commandArguments.map((argument) => escapeArgument(argument, isDoubleEscape))].join(" ")}"`;
	parsed.options.windowsVerbatimArguments = true;
	return {
		file: process$1.env.comspec || "cmd.exe",
		commandArguments: [
			"/d",
			"/s",
			"/c",
			commandLine
		],
		options: parsed.options
	};
};
var resolveWithShebang = (parsed) => {
	const resolvedFile = resolvePath(parsed);
	const interpreter = resolvedFile !== void 0 && readShebang(resolvedFile);
	if (!interpreter) return resolvedFile;
	parsed.commandArguments.unshift(resolvedFile);
	parsed.file = interpreter;
	return resolvePath(parsed);
};
var resolvePath = (parsed) => {
	const environment = parsed.options.env || process$1.env;
	const cwd = parsed.options.cwd ?? process$1.cwd();
	const environmentPathExt = getWindowsEnvironmentValue(environment, "PATHEXT");
	const commandExtension = path.extname(parsed.file);
	const pathExt = commandExtension === "" ? environmentPathExt : `${commandExtension}${path.delimiter}${environmentPathExt ?? ""}`;
	if (hasWindowsPathSeparator(parsed.file)) return whichCommandSync(path.resolve(cwd, parsed.file), {
		cwd,
		pathExt
	});
	const resolveOptions = {
		cwd,
		path: getWindowsEnvironmentValue(environment, "PATH") ?? getWindowsEnvironmentValue(process$1.env, "PATH") ?? "",
		pathExt
	};
	return shouldSearchCurrentDirectory(environment) ? whichCommandSync(parsed.file, resolveOptions) : resolvePathDirectories(parsed.file, resolveOptions);
};
var hasWindowsPathSeparator = (file) => file.includes("/") || file.includes("\\") || file.includes(":");
var shouldSearchCurrentDirectory = (environment) => getWindowsEnvironmentValue(process$1.env, "NODEFAULTCURRENTDIRECTORYINEXEPATH") === void 0 && getWindowsEnvironmentValue(environment, "NODEFAULTCURRENTDIRECTORYINEXEPATH") === void 0;
var resolvePathDirectories = (file, { cwd, path: searchPath, pathExt }) => {
	for (const directory of searchPath.split(path.delimiter)) {
		const unquotedDirectory = directory.length > 1 && directory.startsWith("\"") && directory.endsWith("\"") ? directory.slice(1, -1) : directory;
		if (unquotedDirectory === "") continue;
		const resolvedFile = whichCommandSync(path.resolve(cwd, unquotedDirectory, file), {
			cwd,
			pathExt
		});
		if (resolvedFile !== void 0) return resolvedFile;
	}
};
var getWindowsEnvironmentValue = (environment, name) => {
	const environmentKey = Object.keys(environment).sort().find((key) => key.toUpperCase() === name);
	return environmentKey === void 0 ? void 0 : environment[environmentKey];
};
var SHEBANG_BYTE_LENGTH = 150;
var readShebang = (file) => {
	const buffer = Buffer$1.alloc(SHEBANG_BYTE_LENGTH);
	try {
		const fileDescriptor = openSync(file, "r");
		try {
			readSync(fileDescriptor, buffer, 0, SHEBANG_BYTE_LENGTH, 0);
		} finally {
			closeSync(fileDescriptor);
		}
	} catch {
		return;
	}
	return parseShebang(buffer.toString());
};
var shebangRegExp = /^#!(?<line>.*)/;
var parseShebang = (contents) => {
	const shebangLine = contents.match(shebangRegExp)?.groups.line.trim();
	if (!shebangLine) return;
	const [interpreterPath, argument] = shebangLine.split(" ");
	const interpreter = interpreterPath.split("/").at(-1);
	if (interpreter === "env") return argument;
	return argument ? `${interpreter} ${argument}` : interpreter;
};
var lineBreakRegExp = /[\n\r]/;
var assertNoLineBreak = (value) => {
	if (lineBreakRegExp.test(value)) throw new TypeError(`The command and its arguments cannot contain a line break on Windows without a shell.\nThis would allow a command injection with \`cmd.exe\`.\nInvalid value: ${JSON.stringify(`${value}`)}`);
};
var metaCharsRegExp = /[()\][%!^"`<>&|;, *?]/g;
var escapeMetaChars = (value) => value.replaceAll(metaCharsRegExp, "^$&");
var backslashRunRegExp = /\\+/g;
var escapeArgument = (rawArgument, doubleEscape) => {
	const escapedArgument = escapeMetaChars(`"${`${rawArgument}`.replaceAll(backslashRunRegExp, (backslashes, offset, string) => {
		const nextCharacter = string[offset + backslashes.length];
		return nextCharacter === "\"" || nextCharacter === void 0 ? backslashes.repeat(2) : backslashes;
	}).replaceAll("\"", "\\\"")}"`);
	return doubleEscape ? escapeMetaChars(escapedArgument) : escapedArgument;
};
//#endregion
//#region node_modules/execa/lib/arguments/cwd.js
var normalizeCwd = (cwd = getDefaultCwd()) => {
	const cwdString = safeNormalizeFileUrl(cwd, "The \"cwd\" option");
	return path.resolve(cwdString);
};
var getDefaultCwd = () => {
	try {
		return process$1.cwd();
	} catch (error) {
		error.message = `The current directory does not exist.\n${error.message}`;
		throw error;
	}
};
var fixCwdError = (originalMessage, cwd) => {
	if (cwd === getDefaultCwd()) return originalMessage;
	let cwdStat;
	try {
		cwdStat = statSync$1(cwd);
	} catch (error) {
		return `The "cwd" option is invalid: ${cwd}.\n${error.message}\n${originalMessage}`;
	}
	if (!cwdStat.isDirectory()) return `The "cwd" option is not a directory: ${cwd}.\n${originalMessage}`;
	return originalMessage;
};
//#endregion
//#region node_modules/execa/lib/arguments/options.js
var cmdExeRegExp = /^cmd(?:\.exe)?$/i;
var normalizeOptions = (filePath, rawArguments, rawOptions) => {
	const sanitizedOptions = {
		__proto__: null,
		...rawOptions
	};
	sanitizedOptions.cwd = normalizeCwd(sanitizedOptions.cwd);
	const [processedFile, processedArguments, processedOptions] = handleNodeOption(filePath, rawArguments, sanitizedOptions);
	const options = addDefaultOptions(normalizeFdSpecificOptions(processedOptions));
	options.env = getEnv(options);
	const { file, commandArguments } = parseCommandFile(processedFile, processedArguments, options);
	validateTimeout(options);
	validateEncoding(options);
	validateIpcInputOption(options);
	validateCancelSignal(options);
	validateGracefulCancel(options);
	options.shell = normalizeFileUrl(options.shell);
	options.killSignal = normalizeKillSignal(options.killSignal);
	options.forceKillAfterDelay = normalizeForceKillAfterDelay(options.forceKillAfterDelay);
	options.lines = options.lines.map((lines, fdNumber) => lines && !BINARY_ENCODINGS.has(options.encoding) && options.buffer[fdNumber]);
	if (process$1.platform === "win32" && cmdExeRegExp.test(path.basename(file))) commandArguments.unshift("/q");
	return {
		file,
		commandArguments,
		options
	};
};
var addDefaultOptions = ({ extendEnv = true, preferLocal = false, cwd, localDir: localDirectory = cwd, encoding = "utf8", reject = true, cleanup = true, killDescendants = false, all = false, windowsHide = true, killSignal = "SIGTERM", forceKillAfterDelay = true, gracefulCancel = false, ipcInput, ipc = ipcInput !== void 0 || gracefulCancel, serialization = "advanced", ...options }) => ({
	__proto__: null,
	...options,
	extendEnv,
	preferLocal,
	cwd,
	localDirectory,
	encoding,
	reject,
	cleanup,
	killDescendants,
	all,
	windowsHide,
	killSignal,
	forceKillAfterDelay,
	gracefulCancel,
	ipcInput,
	ipc,
	serialization
});
var getEnv = ({ env: envOption, extendEnv, preferLocal, node, localDirectory, nodePath }) => {
	const env = extendEnv ? {
		...process$1.env,
		...envOption
	} : envOption;
	if (preferLocal || node) return npmRunPathEnv({
		env,
		cwd: localDirectory,
		execPath: nodePath,
		preferLocal,
		addExecPath: node
	});
	return env;
};
//#endregion
//#region node_modules/execa/lib/arguments/shell.js
var concatenateShell = (file, commandArguments, options) => options.shell && commandArguments.length > 0 ? [
	[file, ...commandArguments].join(" "),
	[],
	options
] : [
	file,
	commandArguments,
	options
];
//#endregion
//#region node_modules/strip-final-newline/index.js
function stripFinalNewline(input) {
	if (typeof input === "string") return stripFinalNewlineString(input);
	if (!(ArrayBuffer.isView(input) && input.BYTES_PER_ELEMENT === 1)) throw new Error("Input must be a string or a Uint8Array");
	return stripFinalNewlineBinary(input);
}
var stripFinalNewlineString = (input) => input.at(-1) === LF ? input.slice(0, input.at(-2) === CR ? -2 : -1) : input;
var stripFinalNewlineBinary = (input) => input.at(-1) === LF_BINARY ? input.subarray(0, input.at(-2) === CR_BINARY ? -2 : -1) : input;
var LF = "\n";
var LF_BINARY = LF.codePointAt(0);
var CR = "\r";
var CR_BINARY = CR.codePointAt(0);
//#endregion
//#region node_modules/is-stream/index.js
function isStream(stream, { checkOpen = true } = {}) {
	return stream !== null && typeof stream === "object" && (stream.writable || stream.readable || !checkOpen || stream.writable === void 0 && stream.readable === void 0) && typeof stream.pipe === "function";
}
function isWritableStream$1(stream, { checkOpen = true } = {}) {
	return isStream(stream, { checkOpen }) && (stream.writable || !checkOpen) && typeof stream.write === "function" && typeof stream.end === "function" && typeof stream.writable === "boolean" && typeof stream.writableObjectMode === "boolean" && typeof stream.destroy === "function" && typeof stream.destroyed === "boolean";
}
function isReadableStream$1(stream, { checkOpen = true } = {}) {
	return isStream(stream, { checkOpen }) && (stream.readable || !checkOpen) && typeof stream.read === "function" && typeof stream.readable === "boolean" && typeof stream.readableObjectMode === "boolean" && typeof stream.destroy === "function" && typeof stream.destroyed === "boolean";
}
function isDuplexStream(stream, options) {
	return isWritableStream$1(stream, options) && isReadableStream$1(stream, options);
}
//#endregion
//#region node_modules/@sec-ant/readable-stream/dist/ponyfill/asyncIterator.js
var a = Object.getPrototypeOf(Object.getPrototypeOf(
	/* istanbul ignore next */
	async function* () {}
).prototype);
var c = class {
	#t;
	#n;
	#r = !1;
	#e = void 0;
	constructor(e, t) {
		this.#t = e, this.#n = t;
	}
	next() {
		const e = () => this.#s();
		return this.#e = this.#e ? this.#e.then(e, e) : e(), this.#e;
	}
	return(e) {
		const t = () => this.#i(e);
		return this.#e ? this.#e.then(t, t) : t();
	}
	async #s() {
		if (this.#r) return {
			done: !0,
			value: void 0
		};
		let e;
		try {
			e = await this.#t.read();
		} catch (t) {
			throw this.#e = void 0, this.#r = !0, this.#t.releaseLock(), t;
		}
		return e.done && (this.#e = void 0, this.#r = !0, this.#t.releaseLock()), e;
	}
	async #i(e) {
		if (this.#r) return {
			done: !0,
			value: e
		};
		if (this.#r = !0, !this.#n) {
			const t = this.#t.cancel(e);
			return this.#t.releaseLock(), await t, {
				done: !0,
				value: e
			};
		}
		return this.#t.releaseLock(), {
			done: !0,
			value: e
		};
	}
};
var n = Symbol();
function i() {
	return this[n].next();
}
Object.defineProperty(i, "name", { value: "next" });
function o(r) {
	return this[n].return(r);
}
Object.defineProperty(o, "name", { value: "return" });
var u = Object.create(a, {
	next: {
		enumerable: !0,
		configurable: !0,
		writable: !0,
		value: i
	},
	return: {
		enumerable: !0,
		configurable: !0,
		writable: !0,
		value: o
	}
});
function h({ preventCancel: r = !1 } = {}) {
	const t = new c(this.getReader(), r), s = Object.create(u);
	return s[n] = t, s;
}
//#endregion
//#region node_modules/get-stream/source/stream.js
var getAsyncIterable = (stream) => {
	if (isReadableStream$1(stream, { checkOpen: false }) && nodeImports.on !== void 0) return getStreamIterable(stream);
	if (typeof stream?.[Symbol.asyncIterator] === "function") return stream;
	if (toString.call(stream) === "[object ReadableStream]") return h.call(stream);
	throw new TypeError("The first argument must be a Readable, a ReadableStream, or an async iterable.");
};
var { toString } = Object.prototype;
var getStreamIterable = async function* (stream) {
	const controller = new AbortController();
	const state = {};
	handleStreamEnd(stream, controller, state);
	try {
		for await (const [chunk] of nodeImports.on(stream, "data", { signal: controller.signal })) yield chunk;
	} catch (error) {
		if (state.error !== void 0) throw state.error;
		else if (!controller.signal.aborted) throw error;
	} finally {
		stream.destroy();
	}
};
var handleStreamEnd = async (stream, controller, state) => {
	try {
		await nodeImports.finished(stream, {
			cleanup: true,
			readable: true,
			writable: false,
			error: false
		});
	} catch (error) {
		state.error = error;
	} finally {
		controller.abort();
	}
};
var nodeImports = {};
//#endregion
//#region node_modules/get-stream/source/contents.js
var getStreamContents$1 = async (stream, { init, convertChunk, getSize, truncateChunk, addChunk, getFinalChunk, finalize }, { maxBuffer = Number.POSITIVE_INFINITY } = {}) => {
	const asyncIterable = getAsyncIterable(stream);
	const state = init();
	state.length = 0;
	try {
		for await (const chunk of asyncIterable) appendChunk({
			convertedChunk: convertChunk[getChunkType(chunk)](chunk, state),
			state,
			getSize,
			truncateChunk,
			addChunk,
			maxBuffer
		});
		appendFinalChunk({
			state,
			convertChunk,
			getSize,
			truncateChunk,
			addChunk,
			getFinalChunk,
			maxBuffer
		});
		return finalize(state);
	} catch (error) {
		const normalizedError = typeof error === "object" && error !== null ? error : new Error(error);
		normalizedError.bufferedData = finalize(state);
		throw normalizedError;
	}
};
var appendFinalChunk = ({ state, getSize, truncateChunk, addChunk, getFinalChunk, maxBuffer }) => {
	const convertedChunk = getFinalChunk(state);
	if (convertedChunk !== void 0) appendChunk({
		convertedChunk,
		state,
		getSize,
		truncateChunk,
		addChunk,
		maxBuffer
	});
};
var appendChunk = ({ convertedChunk, state, getSize, truncateChunk, addChunk, maxBuffer }) => {
	const chunkSize = getSize(convertedChunk);
	const newLength = state.length + chunkSize;
	if (newLength <= maxBuffer) {
		addNewChunk(convertedChunk, state, addChunk, newLength);
		return;
	}
	const truncatedChunk = truncateChunk(convertedChunk, maxBuffer - state.length);
	if (truncatedChunk !== void 0) addNewChunk(truncatedChunk, state, addChunk, maxBuffer);
	throw new MaxBufferError();
};
var addNewChunk = (convertedChunk, state, addChunk, newLength) => {
	state.contents = addChunk(convertedChunk, state, newLength);
	state.length = newLength;
};
var getChunkType = (chunk) => {
	const typeOfChunk = typeof chunk;
	if (typeOfChunk === "string") return "string";
	if (typeOfChunk !== "object" || chunk === null) return "others";
	if (globalThis.Buffer?.isBuffer(chunk)) return "buffer";
	const prototypeName = objectToString.call(chunk);
	if (prototypeName === "[object ArrayBuffer]") return "arrayBuffer";
	if (prototypeName === "[object DataView]") return "dataView";
	if (Number.isInteger(chunk.byteLength) && Number.isInteger(chunk.byteOffset) && objectToString.call(chunk.buffer) === "[object ArrayBuffer]") return "typedArray";
	return "others";
};
var { toString: objectToString } = Object.prototype;
var MaxBufferError = class extends Error {
	name = "MaxBufferError";
	constructor() {
		super("maxBuffer exceeded");
	}
};
//#endregion
//#region node_modules/get-stream/source/utils.js
var identity = (value) => value;
var noop$1 = () => void 0;
var getContentsProperty = ({ contents }) => contents;
var throwObjectStream = (chunk) => {
	throw new Error(`Streams in object mode are not supported: ${String(chunk)}`);
};
var getLengthProperty = (convertedChunk) => convertedChunk.length;
//#endregion
//#region node_modules/get-stream/source/array.js
async function getStreamAsArray(stream, options) {
	return getStreamContents$1(stream, arrayMethods, options);
}
var initArray = () => ({ contents: [] });
var increment = () => 1;
var addArrayChunk = (convertedChunk, { contents }) => {
	contents.push(convertedChunk);
	return contents;
};
var arrayMethods = {
	init: initArray,
	convertChunk: {
		string: identity,
		buffer: identity,
		arrayBuffer: identity,
		dataView: identity,
		typedArray: identity,
		others: identity
	},
	getSize: increment,
	truncateChunk: noop$1,
	addChunk: addArrayChunk,
	getFinalChunk: noop$1,
	finalize: getContentsProperty
};
//#endregion
//#region node_modules/get-stream/source/array-buffer.js
async function getStreamAsArrayBuffer(stream, options) {
	return getStreamContents$1(stream, arrayBufferMethods, options);
}
var initArrayBuffer = () => ({ contents: /* @__PURE__ */ new ArrayBuffer(0) });
var useTextEncoder = (chunk) => textEncoder.encode(chunk);
var textEncoder = new TextEncoder();
var useUint8Array = (chunk) => new Uint8Array(chunk);
var useUint8ArrayWithOffset = (chunk) => new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
var truncateArrayBufferChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
var addArrayBufferChunk = (convertedChunk, { contents, length: previousLength }, length) => {
	const newContents = hasArrayBufferResize() ? resizeArrayBuffer(contents, length) : resizeArrayBufferSlow(contents, length);
	new Uint8Array(newContents).set(convertedChunk, previousLength);
	return newContents;
};
var resizeArrayBufferSlow = (contents, length) => {
	if (length <= contents.byteLength) return contents;
	const arrayBuffer = new ArrayBuffer(getNewContentsLength(length));
	new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
	return arrayBuffer;
};
var resizeArrayBuffer = (contents, length) => {
	if (length <= contents.maxByteLength) {
		contents.resize(length);
		return contents;
	}
	const arrayBuffer = new ArrayBuffer(length, { maxByteLength: getNewContentsLength(length) });
	new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0);
	return arrayBuffer;
};
var getNewContentsLength = (length) => SCALE_FACTOR ** Math.ceil(Math.log(length) / Math.log(SCALE_FACTOR));
var SCALE_FACTOR = 2;
var finalizeArrayBuffer = ({ contents, length }) => hasArrayBufferResize() ? contents : contents.slice(0, length);
var hasArrayBufferResize = () => "resize" in ArrayBuffer.prototype;
var arrayBufferMethods = {
	init: initArrayBuffer,
	convertChunk: {
		string: useTextEncoder,
		buffer: useUint8Array,
		arrayBuffer: useUint8Array,
		dataView: useUint8ArrayWithOffset,
		typedArray: useUint8ArrayWithOffset,
		others: throwObjectStream
	},
	getSize: getLengthProperty,
	truncateChunk: truncateArrayBufferChunk,
	addChunk: addArrayBufferChunk,
	getFinalChunk: noop$1,
	finalize: finalizeArrayBuffer
};
//#endregion
//#region node_modules/get-stream/source/string.js
async function getStreamAsString(stream, options) {
	return getStreamContents$1(stream, stringMethods, options);
}
var initString = () => ({
	contents: "",
	textDecoder: new TextDecoder()
});
var useTextDecoder = (chunk, { textDecoder }) => textDecoder.decode(chunk, { stream: true });
var addStringChunk = (convertedChunk, { contents }) => contents + convertedChunk;
var truncateStringChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize);
var getFinalStringChunk = ({ textDecoder }) => {
	const finalChunk = textDecoder.decode();
	return finalChunk === "" ? void 0 : finalChunk;
};
var stringMethods = {
	init: initString,
	convertChunk: {
		string: identity,
		buffer: useTextDecoder,
		arrayBuffer: useTextDecoder,
		dataView: useTextDecoder,
		typedArray: useTextDecoder,
		others: throwObjectStream
	},
	getSize: getLengthProperty,
	truncateChunk: truncateStringChunk,
	addChunk: addStringChunk,
	getFinalChunk: getFinalStringChunk,
	finalize: getContentsProperty
};
//#endregion
//#region node_modules/execa/lib/io/max-buffer.js
var handleMaxBuffer = ({ error, stream, readableObjectMode, lines, encoding, fdNumber }) => {
	if (!(error instanceof MaxBufferError)) throw error;
	if (fdNumber === "all") return error;
	error.maxBufferInfo = {
		fdNumber,
		unit: getMaxBufferUnit(readableObjectMode, lines, encoding)
	};
	stream.destroy();
	throw error;
};
var getMaxBufferUnit = (readableObjectMode, lines, encoding) => {
	if (readableObjectMode) return "objects";
	if (lines) return "lines";
	if (encoding === "buffer") return "bytes";
	return "characters";
};
var checkIpcMaxBuffer = (subprocess, ipcOutput, maxBuffer) => {
	if (ipcOutput.length !== maxBuffer) return;
	const error = new MaxBufferError();
	error.maxBufferInfo = { fdNumber: "ipc" };
	throw error;
};
var getMaxBufferMessage = (error, maxBuffer) => {
	const { streamName, threshold, unit } = getMaxBufferInfo(error, maxBuffer);
	return `Command's ${streamName} was larger than ${threshold} ${unit}`;
};
var getMaxBufferInfo = (error, maxBuffer) => {
	if (error?.maxBufferInfo === void 0) return {
		streamName: "output",
		threshold: maxBuffer[1],
		unit: "bytes"
	};
	const { maxBufferInfo: { fdNumber, unit } } = error;
	delete error.maxBufferInfo;
	const threshold = getFdSpecificValue(maxBuffer, fdNumber);
	if (fdNumber === "ipc") return {
		streamName: "IPC output",
		threshold,
		unit: "messages"
	};
	return {
		streamName: getStreamName(fdNumber),
		threshold,
		unit
	};
};
var isMaxBufferSync = (resultError, output, maxBuffer) => resultError?.code === "ENOBUFS" && output !== null && output.some((result) => result !== null && result.length > getMaxBufferSync(maxBuffer));
var truncateMaxBufferSync = (result, isMaxBuffer, maxBuffer) => {
	if (!isMaxBuffer) return result;
	const maxBufferValue = getMaxBufferSync(maxBuffer);
	return result.length > maxBufferValue ? result.slice(0, maxBufferValue) : result;
};
var getMaxBufferSync = ([, stdoutMaxBuffer]) => stdoutMaxBuffer;
//#endregion
//#region node_modules/execa/lib/return/message.js
var createMessages = ({ stdio, all, ipcOutput, originalError, signal, signalDescription, exitCode, escapedCommand, timedOut, isCanceled, isGracefullyCanceled, isMaxBuffer, isForcefullyTerminated, forceKillAfterDelay, killSignal, maxBuffer, timeout, cwd }) => {
	const errorCode = originalError?.code;
	const prefix = getErrorPrefix({
		originalError,
		timedOut,
		timeout,
		isMaxBuffer,
		maxBuffer,
		errorCode,
		signal,
		signalDescription,
		exitCode,
		isCanceled,
		isGracefullyCanceled,
		isForcefullyTerminated,
		forceKillAfterDelay,
		killSignal
	});
	const originalMessage = getOriginalMessage(originalError, cwd);
	const shortMessage = `${prefix}: ${escapedCommand}${originalMessage === void 0 ? "" : `\n${originalMessage}`}`;
	return {
		originalMessage,
		shortMessage,
		message: [
			shortMessage,
			...all === void 0 ? [stdio[2], stdio[1]] : [all],
			...stdio.slice(3),
			ipcOutput.map((ipcMessage) => serializeIpcMessage(ipcMessage)).join("\n")
		].map((messagePart) => escapeLines(stripFinalNewline(serializeMessagePart(messagePart)))).filter(Boolean).join("\n\n")
	};
};
var getErrorPrefix = ({ originalError, timedOut, timeout, isMaxBuffer, maxBuffer, errorCode, signal, signalDescription, exitCode, isCanceled, isGracefullyCanceled, isForcefullyTerminated, forceKillAfterDelay, killSignal }) => {
	const forcefulSuffix = getForcefulSuffix(isForcefullyTerminated, forceKillAfterDelay);
	if (timedOut) return `Command timed out after ${timeout} milliseconds${forcefulSuffix}`;
	if (isGracefullyCanceled) {
		if (signal === void 0) return `Command was gracefully canceled with exit code ${exitCode}`;
		return isForcefullyTerminated ? `Command was gracefully canceled${forcefulSuffix}` : `Command was gracefully canceled with ${signal} (${signalDescription})`;
	}
	if (isCanceled) return `Command was canceled${forcefulSuffix}`;
	if (isMaxBuffer) return `${getMaxBufferMessage(originalError, maxBuffer)}${forcefulSuffix}`;
	if (errorCode !== void 0) return `Command failed with ${errorCode}${forcefulSuffix}`;
	if (isForcefullyTerminated) return `Command was killed with ${killSignal} (${getSignalDescription(killSignal)})${forcefulSuffix}`;
	if (signal !== void 0) return `Command was killed with ${signal} (${signalDescription})`;
	if (exitCode !== void 0) return `Command failed with exit code ${exitCode}`;
	return "Command failed";
};
var getForcefulSuffix = (isForcefullyTerminated, forceKillAfterDelay) => isForcefullyTerminated ? ` and was forcefully terminated after ${forceKillAfterDelay} milliseconds` : "";
var getOriginalMessage = (originalError, cwd) => {
	if (originalError instanceof DiscardedError) return;
	const escapedOriginalMessage = escapeLines(fixCwdError(isExecaError(originalError) ? originalError.originalMessage : String(originalError?.message ?? originalError), cwd));
	return escapedOriginalMessage === "" ? void 0 : escapedOriginalMessage;
};
var serializeIpcMessage = (ipcMessage) => typeof ipcMessage === "string" ? ipcMessage : inspect(ipcMessage);
var serializeMessagePart = (messagePart) => Array.isArray(messagePart) ? messagePart.map((messageItem) => stripFinalNewline(serializeMessageItem(messageItem))).filter(Boolean).join("\n") : serializeMessageItem(messagePart);
var serializeMessageItem = (messageItem) => {
	if (typeof messageItem === "string") return messageItem;
	if (isUint8Array(messageItem)) return uint8ArrayToString(messageItem);
	return "";
};
//#endregion
//#region node_modules/execa/lib/return/result.js
var makeSuccessResult = ({ command, escapedCommand, stdio, all, ipcOutput, options: { cwd }, startTime }) => omitUndefinedProperties({
	command,
	escapedCommand,
	cwd,
	durationMs: getDurationMs(startTime),
	failed: false,
	timedOut: false,
	isCanceled: false,
	isGracefullyCanceled: false,
	isTerminated: false,
	isMaxBuffer: false,
	isForcefullyTerminated: false,
	exitCode: 0,
	stdout: stdio[1],
	stderr: stdio[2],
	all,
	stdio,
	ipcOutput,
	pipedFrom: []
});
var makeEarlyError = ({ error, command, escapedCommand, fileDescriptors, options, startTime, isSync }) => makeError({
	error,
	command,
	escapedCommand,
	startTime,
	timedOut: false,
	isCanceled: false,
	isGracefullyCanceled: false,
	isMaxBuffer: false,
	isForcefullyTerminated: false,
	stdio: Array.from({ length: fileDescriptors.length }),
	ipcOutput: [],
	options,
	isSync
});
var makeError = ({ error: originalError, command, escapedCommand, startTime, timedOut, isCanceled, isGracefullyCanceled, isMaxBuffer, isForcefullyTerminated, exitCode: rawExitCode, signal: rawSignal, stdio, all, ipcOutput, options: { timeoutDuration, timeout = timeoutDuration, forceKillAfterDelay, killSignal, cwd, maxBuffer }, isSync }) => {
	const { exitCode, signal, signalDescription } = normalizeExitPayload(rawExitCode, rawSignal);
	const { originalMessage, shortMessage, message } = createMessages({
		stdio,
		all,
		ipcOutput,
		originalError,
		signal,
		signalDescription,
		exitCode,
		escapedCommand,
		timedOut,
		isCanceled,
		isGracefullyCanceled,
		isMaxBuffer,
		isForcefullyTerminated,
		forceKillAfterDelay,
		killSignal,
		maxBuffer,
		timeout,
		cwd
	});
	const error = getFinalError(originalError, message, isSync);
	Object.assign(error, getErrorProperties({
		error,
		command,
		escapedCommand,
		startTime,
		timedOut,
		isCanceled,
		isGracefullyCanceled,
		isMaxBuffer,
		isForcefullyTerminated,
		exitCode,
		signal,
		signalDescription,
		stdio,
		all,
		ipcOutput,
		cwd,
		originalMessage,
		shortMessage
	}));
	return error;
};
var getErrorProperties = ({ error, command, escapedCommand, startTime, timedOut, isCanceled, isGracefullyCanceled, isMaxBuffer, isForcefullyTerminated, exitCode, signal, signalDescription, stdio, all, ipcOutput, cwd, originalMessage, shortMessage }) => omitUndefinedProperties({
	shortMessage,
	originalMessage,
	command,
	escapedCommand,
	cwd,
	durationMs: getDurationMs(startTime),
	failed: true,
	timedOut,
	isCanceled,
	isGracefullyCanceled,
	isTerminated: signal !== void 0,
	isMaxBuffer,
	isForcefullyTerminated,
	exitCode,
	signal,
	signalDescription,
	code: error.cause?.code,
	stdout: stdio[1],
	stderr: stdio[2],
	all,
	stdio,
	ipcOutput,
	pipedFrom: []
});
var omitUndefinedProperties = (result) => Object.fromEntries(Object.entries(result).filter(([, value]) => value !== void 0));
var normalizeExitPayload = (rawExitCode, rawSignal) => {
	const exitCode = rawExitCode === null ? void 0 : rawExitCode;
	const signal = rawSignal === null ? void 0 : rawSignal;
	return {
		exitCode,
		signal,
		signalDescription: signal === void 0 ? void 0 : getSignalDescription(rawSignal)
	};
};
//#endregion
//#region node_modules/parse-ms/index.js
var toZeroIfInfinity = (value) => Number.isFinite(value) ? value : 0;
function parseNumber(milliseconds) {
	return {
		days: Math.trunc(milliseconds / 864e5),
		hours: Math.trunc(milliseconds / 36e5 % 24),
		minutes: Math.trunc(milliseconds / 6e4 % 60),
		seconds: Math.trunc(milliseconds / 1e3 % 60),
		milliseconds: Math.trunc(milliseconds % 1e3),
		microseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e3) % 1e3),
		nanoseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e6) % 1e3)
	};
}
function parseBigint(milliseconds) {
	return {
		days: milliseconds / 86400000n,
		hours: milliseconds / 3600000n % 24n,
		minutes: milliseconds / 60000n % 60n,
		seconds: milliseconds / 1000n % 60n,
		milliseconds: milliseconds % 1000n,
		microseconds: 0n,
		nanoseconds: 0n
	};
}
function parseMilliseconds(milliseconds) {
	switch (typeof milliseconds) {
		case "number":
			if (Number.isFinite(milliseconds)) return parseNumber(milliseconds);
			break;
		case "bigint": return parseBigint(milliseconds);
	}
	throw new TypeError("Expected a finite number or bigint");
}
//#endregion
//#region node_modules/pretty-ms/index.js
var isZero = (value) => value === 0 || value === 0n;
var pluralize = (word, count) => count === 1 || count === 1n ? word : `${word}s`;
var SECOND_ROUNDING_EPSILON = 1e-7;
var ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n;
function prettyMilliseconds(milliseconds, options) {
	const isBigInt = typeof milliseconds === "bigint";
	if (!isBigInt && !Number.isFinite(milliseconds)) throw new TypeError("Expected a finite number or bigint");
	options = { ...options };
	const sign = milliseconds < 0 ? "-" : "";
	milliseconds = milliseconds < 0 ? -milliseconds : milliseconds;
	if (options.colonNotation) {
		options.compact = false;
		options.formatSubMilliseconds = false;
		options.separateMilliseconds = false;
		options.verbose = false;
	}
	if (options.compact) {
		options.unitCount = 1;
		options.secondsDecimalDigits = 0;
		options.millisecondsDecimalDigits = 0;
	}
	let result = [];
	const floorDecimals = (value, decimalDigits) => {
		const flooredInterimValue = Math.floor(value * 10 ** decimalDigits + SECOND_ROUNDING_EPSILON);
		return (Math.round(flooredInterimValue) / 10 ** decimalDigits).toFixed(decimalDigits);
	};
	const add = (value, long, short, valueString) => {
		if ((result.length === 0 || !options.colonNotation) && isZero(value) && !(options.colonNotation && short === "m")) return;
		valueString ??= String(value);
		if (options.colonNotation) {
			const wholeDigits = valueString.includes(".") ? valueString.split(".")[0].length : valueString.length;
			const minLength = result.length > 0 ? 2 : 1;
			valueString = "0".repeat(Math.max(0, minLength - wholeDigits)) + valueString;
		} else valueString += options.verbose ? " " + pluralize(long, value) : short;
		result.push(valueString);
	};
	const parsed = parseMilliseconds(milliseconds);
	const days = BigInt(parsed.days);
	if (options.hideYearAndDays) add(BigInt(days) * 24n + BigInt(parsed.hours), "hour", "h");
	else {
		if (options.hideYear) add(days, "day", "d");
		else {
			add(days / 365n, "year", "y");
			add(days % 365n, "day", "d");
		}
		add(Number(parsed.hours), "hour", "h");
	}
	add(Number(parsed.minutes), "minute", "m");
	if (!options.hideSeconds) {
		if (options.separateMilliseconds || options.formatSubMilliseconds || !options.colonNotation && milliseconds < 1e3 && !options.subSecondsAsDecimals) {
			const seconds = Number(parsed.seconds);
			const milliseconds = Number(parsed.milliseconds);
			const microseconds = Number(parsed.microseconds);
			const nanoseconds = Number(parsed.nanoseconds);
			add(seconds, "second", "s");
			if (options.formatSubMilliseconds) {
				add(milliseconds, "millisecond", "ms");
				add(microseconds, "microsecond", "µs");
				add(nanoseconds, "nanosecond", "ns");
			} else {
				const millisecondsAndBelow = milliseconds + microseconds / 1e3 + nanoseconds / 1e6;
				const millisecondsDecimalDigits = typeof options.millisecondsDecimalDigits === "number" ? options.millisecondsDecimalDigits : 0;
				const millisecondsString = millisecondsDecimalDigits ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits) : millisecondsAndBelow >= 1 ? Math.round(millisecondsAndBelow) : Math.ceil(millisecondsAndBelow);
				add(Number.parseFloat(millisecondsString), "millisecond", "ms", millisecondsString);
			}
		} else {
			const secondsFixed = floorDecimals((isBigInt ? Number(milliseconds % ONE_DAY_IN_MILLISECONDS) : milliseconds) / 1e3 % 60, typeof options.secondsDecimalDigits === "number" ? options.secondsDecimalDigits : 1);
			const secondsString = options.keepDecimalsOnWholeSeconds ? secondsFixed : secondsFixed.replace(/\.0+$/, "");
			add(Number.parseFloat(secondsString), "second", "s", secondsString);
		}
	}
	if (result.length === 0) return sign + "0" + (options.verbose ? " milliseconds" : "ms");
	const separator = options.colonNotation ? ":" : " ";
	if (typeof options.unitCount === "number") result = result.slice(0, Math.max(options.unitCount, 1));
	return sign + result.join(separator);
}
//#endregion
//#region node_modules/execa/lib/verbose/error.js
var logError = (result, verboseInfo) => {
	if (result.failed) verboseLog({
		type: "error",
		verboseMessage: result.shortMessage,
		verboseInfo,
		result
	});
};
//#endregion
//#region node_modules/execa/lib/verbose/complete.js
var logResult = (result, verboseInfo) => {
	if (!isVerbose(verboseInfo)) return;
	logError(result, verboseInfo);
	logDuration(result, verboseInfo);
};
var logDuration = (result, verboseInfo) => {
	verboseLog({
		type: "duration",
		verboseMessage: `(done in ${prettyMilliseconds(result.durationMs)})`,
		verboseInfo,
		result
	});
};
//#endregion
//#region node_modules/execa/lib/return/reject.js
var handleResult = (result, verboseInfo, { reject }) => {
	logResult(result, verboseInfo);
	if (result.failed && reject) throw result;
	return result;
};
//#endregion
//#region node_modules/execa/lib/stdio/type.js
var getStdioItemType = (value, optionName) => {
	if (isAsyncGenerator(value)) return "asyncGenerator";
	if (isSyncGenerator(value)) return "generator";
	if (isUrl(value)) return "fileUrl";
	if (isFilePathObject(value)) return "filePath";
	if (isWebStream(value)) return "webStream";
	if (isStream(value, { checkOpen: false })) return "native";
	if (isUint8Array(value)) return "uint8Array";
	if (isAsyncIterableObject(value)) return "asyncIterable";
	if (isIterableObject(value)) return "iterable";
	if (isTransformStream(value)) return getTransformStreamType({ transform: value }, optionName);
	if (isTransformOptions(value)) return getTransformObjectType(value, optionName);
	return "native";
};
var getTransformObjectType = (value, optionName) => {
	if (isDuplexStream(value.transform, { checkOpen: false })) return getDuplexType(value, optionName);
	if (isTransformStream(value.transform)) return getTransformStreamType(value, optionName);
	return getGeneratorObjectType(value, optionName);
};
var getDuplexType = (value, optionName) => {
	validateNonGeneratorType(value, optionName, "Duplex stream");
	return "duplex";
};
var getTransformStreamType = (value, optionName) => {
	validateNonGeneratorType(value, optionName, "web TransformStream");
	return "webTransform";
};
var validateNonGeneratorType = ({ final, binary, objectMode }, optionName, typeName) => {
	checkUndefinedOption(final, `${optionName}.final`, typeName);
	checkUndefinedOption(binary, `${optionName}.binary`, typeName);
	checkBooleanOption(objectMode, `${optionName}.objectMode`);
};
var checkUndefinedOption = (value, optionName, typeName) => {
	if (value !== void 0) throw new TypeError(`The \`${optionName}\` option can only be defined when using a generator, not a ${typeName}.`);
};
var getGeneratorObjectType = ({ transform, final, binary, objectMode }, optionName) => {
	if (transform !== void 0 && !isGenerator(transform)) throw new TypeError(`The \`${optionName}.transform\` option must be a generator, a Duplex stream or a web TransformStream.`);
	if (isDuplexStream(final, { checkOpen: false })) throw new TypeError(`The \`${optionName}.final\` option must not be a Duplex stream.`);
	if (isTransformStream(final)) throw new TypeError(`The \`${optionName}.final\` option must not be a web TransformStream.`);
	if (final !== void 0 && !isGenerator(final)) throw new TypeError(`The \`${optionName}.final\` option must be a generator.`);
	checkBooleanOption(binary, `${optionName}.binary`);
	checkBooleanOption(objectMode, `${optionName}.objectMode`);
	return isAsyncGenerator(transform) || isAsyncGenerator(final) ? "asyncGenerator" : "generator";
};
var checkBooleanOption = (value, optionName) => {
	if (value !== void 0 && typeof value !== "boolean") throw new TypeError(`The \`${optionName}\` option must use a boolean.`);
};
var isGenerator = (value) => isAsyncGenerator(value) || isSyncGenerator(value);
var isAsyncGenerator = (value) => Object.prototype.toString.call(value) === "[object AsyncGeneratorFunction]";
var isSyncGenerator = (value) => Object.prototype.toString.call(value) === "[object GeneratorFunction]";
var isTransformOptions = (value) => isPlainObject(value) && (value.transform !== void 0 || value.final !== void 0);
var isUrl = (value) => Object.prototype.toString.call(value) === "[object URL]";
var isRegularUrl = (value) => isUrl(value) && value.protocol !== "file:";
var isFilePathObject = (value) => isPlainObject(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => FILE_PATH_KEYS.has(key)) && isFilePathString(value.file);
var FILE_PATH_KEYS = /* @__PURE__ */ new Set(["file", "append"]);
var isFilePathString = (file) => typeof file === "string";
var isStdioValueObject = (value) => isPlainObject(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => STDIO_VALUE_KEYS.has(key)) && "value" in value;
var STDIO_VALUE_KEYS = /* @__PURE__ */ new Set(["value", "input"]);
var isUnknownStdioString = (type, value) => type === "native" && typeof value === "string" && !KNOWN_STDIO_STRINGS.has(value);
var KNOWN_STDIO_STRINGS = /* @__PURE__ */ new Set([
	"ipc",
	"ignore",
	"inherit",
	"overlapped",
	"pipe"
]);
var isReadableStream = (value) => Object.prototype.toString.call(value) === "[object ReadableStream]";
var isWritableStream = (value) => Object.prototype.toString.call(value) === "[object WritableStream]";
var isWebStream = (value) => isReadableStream(value) || isWritableStream(value);
var isTransformStream = (value) => isReadableStream(value?.readable) && isWritableStream(value?.writable);
var isAsyncIterableObject = (value) => isObject(value) && typeof value[Symbol.asyncIterator] === "function";
var isIterableObject = (value) => isObject(value) && typeof value[Symbol.iterator] === "function";
var isObject = (value) => typeof value === "object" && value !== null;
var TRANSFORM_TYPES = /* @__PURE__ */ new Set([
	"generator",
	"asyncGenerator",
	"duplex",
	"webTransform"
]);
var FILE_TYPES = /* @__PURE__ */ new Set([
	"fileUrl",
	"filePath",
	"fileNumber"
]);
var SPECIAL_DUPLICATE_TYPES_SYNC = /* @__PURE__ */ new Set(["fileUrl", "filePath"]);
var SPECIAL_DUPLICATE_TYPES = /* @__PURE__ */ new Set([
	...SPECIAL_DUPLICATE_TYPES_SYNC,
	"webStream",
	"nodeStream"
]);
var FORBID_DUPLICATE_TYPES = /* @__PURE__ */ new Set(["webTransform", "duplex"]);
var TYPE_TO_MESSAGE = {
	generator: "a generator",
	asyncGenerator: "an async generator",
	fileUrl: "a file URL",
	filePath: "a file path string",
	fileNumber: "a file descriptor number",
	webStream: "a web stream",
	nodeStream: "a Node.js stream",
	webTransform: "a web TransformStream",
	duplex: "a Duplex stream",
	native: "any value",
	iterable: "an iterable",
	asyncIterable: "an async iterable",
	string: "a string",
	uint8Array: "a Uint8Array"
};
//#endregion
//#region node_modules/execa/lib/transform/object-mode.js
var getTransformObjectModes = (objectMode, index, newTransforms, direction) => direction === "output" ? getOutputObjectModes(objectMode, index, newTransforms) : getInputObjectModes(objectMode, index, newTransforms);
var getOutputObjectModes = (objectMode, index, newTransforms) => {
	const writableObjectMode = index !== 0 && newTransforms[index - 1].value.readableObjectMode;
	return {
		writableObjectMode,
		readableObjectMode: objectMode ?? writableObjectMode
	};
};
var getInputObjectModes = (objectMode, index, newTransforms) => {
	const writableObjectMode = index === 0 ? objectMode === true : newTransforms[index - 1].value.readableObjectMode;
	return {
		writableObjectMode,
		readableObjectMode: index !== newTransforms.length - 1 && (objectMode ?? writableObjectMode)
	};
};
var getFdObjectMode = (stdioItems, direction) => {
	const lastTransform = stdioItems.findLast(({ type }) => TRANSFORM_TYPES.has(type));
	if (lastTransform === void 0) return false;
	return direction === "input" ? lastTransform.value.writableObjectMode : lastTransform.value.readableObjectMode;
};
//#endregion
//#region node_modules/execa/lib/transform/normalize.js
var normalizeTransforms = (stdioItems, optionName, direction, options) => [...stdioItems.filter(({ type }) => !TRANSFORM_TYPES.has(type)), ...getTransforms(stdioItems, optionName, direction, options)];
var getTransforms = (stdioItems, optionName, direction, { encoding }) => {
	const transforms = stdioItems.filter(({ type }) => TRANSFORM_TYPES.has(type));
	const newTransforms = Array.from({ length: transforms.length });
	for (const [index, stdioItem] of Object.entries(transforms)) newTransforms[index] = normalizeTransform({
		stdioItem,
		index: Number(index),
		newTransforms,
		optionName,
		direction,
		encoding
	});
	return sortTransforms(newTransforms, direction);
};
var normalizeTransform = ({ stdioItem, stdioItem: { type }, index, newTransforms, optionName, direction, encoding }) => {
	if (type === "duplex") return normalizeDuplex({
		stdioItem,
		optionName
	});
	if (type === "webTransform") return normalizeTransformStream({
		stdioItem,
		index,
		newTransforms,
		direction
	});
	return normalizeGenerator({
		stdioItem,
		index,
		newTransforms,
		direction,
		encoding
	});
};
var normalizeDuplex = ({ stdioItem, optionName }) => {
	const { value } = stdioItem;
	const { transform } = value;
	const { writableObjectMode, readableObjectMode } = transform;
	const { objectMode = readableObjectMode } = value;
	if (objectMode && !readableObjectMode) throw new TypeError(`The \`${optionName}.objectMode\` option can only be \`true\` if \`new Duplex({objectMode: true})\` is used.`);
	if (!objectMode && readableObjectMode) throw new TypeError(`The \`${optionName}.objectMode\` option cannot be \`false\` if \`new Duplex({objectMode: true})\` is used.`);
	return {
		...stdioItem,
		value: {
			transform,
			writableObjectMode,
			readableObjectMode
		}
	};
};
var normalizeTransformStream = ({ stdioItem, stdioItem: { value }, index, newTransforms, direction }) => {
	const { transform, objectMode } = isPlainObject(value) ? value : { transform: value };
	const { writableObjectMode, readableObjectMode } = getTransformObjectModes(objectMode, index, newTransforms, direction);
	return {
		...stdioItem,
		value: {
			transform,
			writableObjectMode,
			readableObjectMode
		}
	};
};
var normalizeGenerator = ({ stdioItem, stdioItem: { value }, index, newTransforms, direction, encoding }) => {
	const { transform, final, binary: binaryOption = false, preserveNewlines = false, objectMode } = isPlainObject(value) ? value : { transform: value };
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const { writableObjectMode, readableObjectMode } = getTransformObjectModes(objectMode, index, newTransforms, direction);
	return {
		...stdioItem,
		value: {
			transform,
			final,
			binary,
			preserveNewlines,
			writableObjectMode,
			readableObjectMode
		}
	};
};
var sortTransforms = (newTransforms, direction) => direction === "input" ? newTransforms.reverse() : newTransforms;
//#endregion
//#region node_modules/execa/lib/stdio/direction.js
var getStreamDirection = (stdioItems, fdNumber, optionName) => {
	const directions = stdioItems.map((stdioItem) => getStdioItemDirection(stdioItem, fdNumber));
	if (directions.includes("input") && directions.includes("output")) throw new TypeError(`The \`${optionName}\` option must not be an array of both readable and writable values.`);
	return directions.find(Boolean) ?? DEFAULT_DIRECTION;
};
var getStdioItemDirection = (stdioItem, fdNumber) => KNOWN_DIRECTIONS[fdNumber] ?? getRequestedDirection(stdioItem);
var getRequestedDirection = ({ type, value, direction, optionName }) => {
	const guessedDirection = guessStreamDirection[type](value);
	if (direction === "input" && guessedDirection === "output") throw new TypeError(`The \`${optionName}\` option is invalid: \`input: true\` cannot be used with a writable value, which is always an output.`);
	return direction ?? guessedDirection;
};
var KNOWN_DIRECTIONS = [
	"input",
	"output",
	"output"
];
var anyDirection = () => void 0;
var alwaysInput = () => "input";
var guessStreamDirection = {
	generator: anyDirection,
	asyncGenerator: anyDirection,
	fileUrl: anyDirection,
	filePath: anyDirection,
	iterable: alwaysInput,
	asyncIterable: alwaysInput,
	uint8Array: alwaysInput,
	webStream: (value) => isWritableStream(value) ? "output" : "input",
	nodeStream(value) {
		if (!isReadableStream$1(value, { checkOpen: false })) return "output";
		return isWritableStream$1(value, { checkOpen: false }) ? void 0 : "input";
	},
	webTransform: anyDirection,
	duplex: anyDirection,
	native(value) {
		const standardStreamDirection = getStandardStreamDirection(value);
		if (standardStreamDirection !== void 0) return standardStreamDirection;
		if (isStream(value, { checkOpen: false })) return guessStreamDirection.nodeStream(value);
	}
};
var getStandardStreamDirection = (value) => {
	if ([0, process$1.stdin].includes(value)) return "input";
	if ([
		1,
		2,
		process$1.stdout,
		process$1.stderr
	].includes(value)) return "output";
};
var DEFAULT_DIRECTION = "output";
//#endregion
//#region node_modules/execa/lib/ipc/array.js
var normalizeIpcStdioArray = (stdioArray, ipc) => ipc ? [...stdioArray, "ipc"] : stdioArray;
//#endregion
//#region node_modules/execa/lib/stdio/stdio-option.js
var normalizeStdioOption = ({ stdio, ipc, buffer, ...options }, verboseInfo, isSync) => {
	const stdioArray = getStdioArray(stdio, options).map((stdioOption, fdNumber) => addDefaultValue(stdioOption, fdNumber));
	validateIpcStdioOption(stdioArray);
	return isSync ? normalizeStdioSync(stdioArray, buffer, verboseInfo) : normalizeIpcStdioArray(stdioArray, ipc);
};
var validateIpcStdioOption = (stdioArray) => {
	if (stdioArray.some((stdioOption) => hasIpcStdioOption(stdioOption))) throw new Error("The `ipc: true` option must be used instead of `stdio: 'ipc'`.");
};
var hasIpcStdioOption = (stdioOption) => {
	if (Array.isArray(stdioOption)) return stdioOption.some((item) => hasIpcStdioItem(item));
	return hasIpcStdioItem(stdioOption);
};
var hasIpcStdioItem = (stdioOption) => {
	if (isStdioValueObject(stdioOption)) return stdioOption.value === "ipc";
	return stdioOption === "ipc";
};
var getStdioArray = (stdio, options) => {
	if (stdio === void 0) return STANDARD_STREAMS_ALIASES.map((alias) => options[alias]);
	if (hasAlias(options)) throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${STANDARD_STREAMS_ALIASES.map((alias) => `\`${alias}\``).join(", ")}`);
	if (typeof stdio === "string") return [
		stdio,
		stdio,
		stdio
	];
	if (!Array.isArray(stdio)) throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
	const length = Math.max(stdio.length, STANDARD_STREAMS_ALIASES.length);
	return Array.from({ length }, (_, fdNumber) => stdio[fdNumber]);
};
var hasAlias = (options) => STANDARD_STREAMS_ALIASES.some((alias) => options[alias] !== void 0);
var addDefaultValue = (stdioOption, fdNumber) => {
	if (Array.isArray(stdioOption)) return stdioOption.map((item) => addDefaultValue(item, fdNumber));
	if (stdioOption === null || stdioOption === void 0) return fdNumber >= STANDARD_STREAMS_ALIASES.length ? "ignore" : "pipe";
	return stdioOption;
};
var normalizeStdioSync = (stdioArray, buffer, verboseInfo) => stdioArray.map((stdioOption, fdNumber) => !buffer[fdNumber] && fdNumber !== 0 && !isFullVerbose(verboseInfo, fdNumber) && isOutputPipeOnly(stdioOption, fdNumber) ? "ignore" : stdioOption);
var isOutputPipeOnly = (stdioOption, fdNumber) => isOutputPipe(stdioOption, fdNumber) || Array.isArray(stdioOption) && stdioOption.every((item) => isOutputPipe(item, fdNumber));
var isOutputPipe = (stdioOption, fdNumber) => stdioOption === "pipe" || isOutputPipeObject(stdioOption, fdNumber);
var isOutputPipeObject = (stdioOption, fdNumber) => isStdioValueObject(stdioOption) && stdioOption.value === "pipe" && (stdioOption.input === void 0 || stdioOption.input === false || isFixedOutputPipe(fdNumber, stdioOption.input));
var isFixedOutputPipe = (fdNumber, input) => input === true && (fdNumber === 1 || fdNumber === 2);
//#endregion
//#region node_modules/execa/lib/arguments/fd-options.js
var getToStream = (destination, to = "stdin") => {
	const isWritable = true;
	const { options, fileDescriptors } = SUBPROCESS_OPTIONS.get(destination);
	const fdNumber = getFdNumber(fileDescriptors, to, isWritable);
	const destinationStream = destination.stdio[fdNumber];
	if (destinationStream === null) throw new TypeError(getInvalidStdioOptionMessage(fdNumber, to, options, isWritable));
	return destinationStream;
};
var getFromStream = (source, from = "stdout") => {
	const isWritable = false;
	const { options, fileDescriptors } = SUBPROCESS_OPTIONS.get(source);
	const fdNumber = getFdNumber(fileDescriptors, from, isWritable);
	const sourceStream = fdNumber === "all" ? source.all : source.stdio[fdNumber];
	if (sourceStream === null || sourceStream === void 0) throw new TypeError(getInvalidStdioOptionMessage(fdNumber, from, options, isWritable));
	return sourceStream;
};
var SUBPROCESS_OPTIONS = /* @__PURE__ */ new WeakMap();
var getFdNumber = (fileDescriptors, fdName, isWritable) => {
	const fdNumber = parseFdNumber(fdName, isWritable);
	validateFdNumber(fdNumber, fdName, isWritable, fileDescriptors);
	return fdNumber;
};
var parseFdNumber = (fdName, isWritable) => {
	const fdNumber = parseFd(fdName);
	if (fdNumber !== void 0) return fdNumber;
	const { validOptions, defaultValue } = isWritable ? {
		validOptions: "\"stdin\"",
		defaultValue: "stdin"
	} : {
		validOptions: "\"stdout\", \"stderr\", \"all\"",
		defaultValue: "stdout"
	};
	throw new TypeError(`"${getOptionName(isWritable)}" must not be "${fdName}".
It must be ${validOptions} or "fd3", "fd4" (and so on).
It is optional and defaults to "${defaultValue}".`);
};
var validateFdNumber = (fdNumber, fdName, isWritable, fileDescriptors) => {
	const fileDescriptor = fileDescriptors[getUsedDescriptor(fdNumber)];
	if (fileDescriptor === void 0) throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. That file descriptor does not exist.
Please set the "stdio" option to ensure that file descriptor exists.`);
	if (fileDescriptor.direction === "input" && !isWritable) throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. It must be a readable stream, not writable.`);
	if (fileDescriptor.direction !== "input" && isWritable) throw new TypeError(`"${getOptionName(isWritable)}" must not be ${fdName}. It must be a writable stream, not readable.
If you meant to use it as input, please set its "stdio" option to \`{value: 'pipe', input: true}\`.`);
};
var getInvalidStdioOptionMessage = (fdNumber, fdName, options, isWritable) => {
	if (fdNumber === "all" && !options.all) return "The \"all\" option must be true to use \"from: 'all'\".";
	const { optionName, optionValue } = getInvalidStdioOption(fdNumber, options);
	return `The "${optionName}: ${serializeOptionValue(optionValue)}" option is incompatible with using "${getOptionName(isWritable)}: ${serializeOptionValue(fdName)}".
Please set this option with "pipe" instead.`;
};
var getInvalidStdioOption = (fdNumber, { stdin, stdout, stderr, stdio }) => {
	const usedDescriptor = getUsedDescriptor(fdNumber);
	if (usedDescriptor === 0 && stdin !== void 0) return {
		optionName: "stdin",
		optionValue: stdin
	};
	if (usedDescriptor === 1 && stdout !== void 0) return {
		optionName: "stdout",
		optionValue: stdout
	};
	if (usedDescriptor === 2 && stderr !== void 0) return {
		optionName: "stderr",
		optionValue: stderr
	};
	return {
		optionName: `stdio[${usedDescriptor}]`,
		optionValue: stdio[usedDescriptor]
	};
};
var getUsedDescriptor = (fdNumber) => fdNumber === "all" ? 1 : fdNumber;
var getOptionName = (isWritable) => isWritable ? "to" : "from";
var serializeOptionValue = (value) => {
	if (typeof value === "string") return `'${value}'`;
	return typeof value === "number" ? `${value}` : "Stream";
};
//#endregion
//#region node_modules/execa/lib/stdio/native.js
var handleNativeStream = ({ stdioItem, stdioItem: { type }, isStdioArray, fdNumber, direction, isSync }) => {
	if (!isStdioArray || type !== "native") return stdioItem;
	return isSync ? handleNativeStreamSync({
		stdioItem,
		fdNumber,
		direction
	}) : handleNativeStreamAsync({
		stdioItem,
		fdNumber
	});
};
var handleNativeStreamSync = ({ stdioItem, stdioItem: { value, optionName }, fdNumber, direction }) => {
	const targetFd = getTargetFd({
		value,
		optionName,
		fdNumber,
		direction
	});
	if (targetFd !== void 0) return targetFd;
	if (isStream(value, { checkOpen: false })) throw new TypeError(`The \`${optionName}: Stream\` option cannot both be an array and include a stream with synchronous methods.`);
	return stdioItem;
};
var getTargetFd = ({ value, optionName, fdNumber, direction }) => {
	const targetFdNumber = getTargetFdNumber(value, fdNumber);
	if (targetFdNumber === void 0) return;
	if (direction === "output") return {
		type: "fileNumber",
		value: targetFdNumber,
		optionName
	};
	if (tty.isatty(targetFdNumber)) throw new TypeError(`The \`${optionName}: ${serializeOptionValue(value)}\` option is invalid: it cannot be a TTY with synchronous methods.`);
	return {
		type: "uint8Array",
		value: bufferToUint8Array(readFileSync(targetFdNumber)),
		optionName
	};
};
var getTargetFdNumber = (value, fdNumber) => {
	if (value === "inherit") return fdNumber;
	if (typeof value === "number") return value;
	const standardStreamIndex = STANDARD_STREAMS.indexOf(value);
	if (standardStreamIndex !== -1) return standardStreamIndex;
};
var handleNativeStreamAsync = ({ stdioItem, stdioItem: { value, optionName }, fdNumber }) => {
	if (value === "inherit") return {
		type: "nodeStream",
		value: getStandardStream(fdNumber, value, optionName),
		optionName
	};
	if (typeof value === "number") return {
		type: "nodeStream",
		value: getStandardStream(value, value, optionName),
		optionName
	};
	if (isStream(value, { checkOpen: false })) return {
		type: "nodeStream",
		value,
		optionName
	};
	return stdioItem;
};
var getStandardStream = (fdNumber, value, optionName) => {
	const standardStream = STANDARD_STREAMS[fdNumber];
	if (standardStream === void 0) throw new TypeError(`The \`${optionName}: ${value}\` option is invalid: no such standard stream.`);
	return standardStream;
};
//#endregion
//#region node_modules/execa/lib/stdio/input-option.js
var handleInputOptions = ({ input, inputFile }, fdNumber) => fdNumber === 0 ? [...handleInputOption(input), ...handleInputFileOption(inputFile)] : [];
var handleInputOption = (input) => input === void 0 ? [] : [{
	type: getInputType(input),
	value: input,
	optionName: "input"
}];
var getInputType = (input) => {
	if (isReadableStream$1(input, { checkOpen: false })) return "nodeStream";
	if (typeof input === "string") return "string";
	if (isUint8Array(input)) return "uint8Array";
	throw new Error("The `input` option must be a string, a Uint8Array or a Node.js Readable stream.");
};
var handleInputFileOption = (inputFile) => inputFile === void 0 ? [] : [{
	...getInputFileType(inputFile),
	optionName: "inputFile"
}];
var getInputFileType = (inputFile) => {
	if (isUrl(inputFile)) return {
		type: "fileUrl",
		value: inputFile
	};
	if (isFilePathString(inputFile)) return {
		type: "filePath",
		value: { file: inputFile }
	};
	throw new Error("The `inputFile` option must be a file path string or a file URL.");
};
//#endregion
//#region node_modules/execa/lib/stdio/duplicate.js
var filterDuplicates = (stdioItems) => stdioItems.filter((stdioItemOne, indexOne) => stdioItems.every((stdioItemTwo, indexTwo) => !hasSameValueAndDirection(stdioItemOne, stdioItemTwo) || indexOne >= indexTwo || stdioItemOne.type === "generator" || stdioItemOne.type === "asyncGenerator"));
var hasSameValueAndDirection = (stdioItemOne, stdioItemTwo) => stdioItemOne.value === stdioItemTwo.value && stdioItemOne.direction === stdioItemTwo.direction;
var getDuplicateStream = ({ stdioItem: { type, value, optionName }, direction, fileDescriptors, isSync }) => {
	const otherStdioItems = getOtherStdioItems(fileDescriptors, type);
	if (otherStdioItems.length === 0) return;
	if (isSync) {
		validateDuplicateStreamSync({
			otherStdioItems,
			type,
			value,
			optionName,
			direction
		});
		return;
	}
	if (SPECIAL_DUPLICATE_TYPES.has(type)) return getDuplicateStreamInstance({
		otherStdioItems,
		type,
		value,
		optionName,
		direction
	});
	if (FORBID_DUPLICATE_TYPES.has(type)) validateDuplicateTransform({
		otherStdioItems,
		type,
		value,
		optionName
	});
};
var getOtherStdioItems = (fileDescriptors, type) => fileDescriptors.flatMap(({ direction, stdioItems }) => stdioItems.filter((stdioItem) => stdioItem.type === type).map(((stdioItem) => ({
	...stdioItem,
	direction
}))));
var validateDuplicateStreamSync = ({ otherStdioItems, type, value, optionName, direction }) => {
	if (SPECIAL_DUPLICATE_TYPES_SYNC.has(type)) getDuplicateStreamInstance({
		otherStdioItems,
		type,
		value,
		optionName,
		direction
	});
};
var getDuplicateStreamInstance = ({ otherStdioItems, type, value, optionName, direction }) => {
	const duplicateStdioItems = otherStdioItems.filter((stdioItem) => hasSameValue(stdioItem, value));
	if (duplicateStdioItems.length === 0) return;
	throwOnDuplicateStream(duplicateStdioItems.find((stdioItem) => stdioItem.direction !== direction), optionName, type);
	return direction === "output" ? duplicateStdioItems[0].stream : void 0;
};
var hasSameValue = ({ type, value }, secondValue) => {
	if (type === "filePath") return value.file === secondValue.file;
	if (type === "fileUrl") return value.href === secondValue.href;
	return value === secondValue;
};
var validateDuplicateTransform = ({ otherStdioItems, type, value, optionName }) => {
	throwOnDuplicateStream(otherStdioItems.find(({ value: { transform } }) => transform === value.transform), optionName, type);
};
var throwOnDuplicateStream = (stdioItem, optionName, type) => {
	if (stdioItem !== void 0) throw new TypeError(`The \`${stdioItem.optionName}\` and \`${optionName}\` options must not target ${TYPE_TO_MESSAGE[type]} that is the same.`);
};
//#endregion
//#region node_modules/execa/lib/stdio/handle.js
var handleStdio = (addProperties, options, verboseInfo, isSync) => {
	const fileDescriptors = getFinalFileDescriptors({
		initialFileDescriptors: normalizeStdioOption(options, verboseInfo, isSync).map((stdioOption, fdNumber) => getFileDescriptor({
			stdioOption,
			fdNumber,
			options,
			isSync
		})),
		addProperties,
		options,
		isSync
	});
	options.stdio = fileDescriptors.map(({ stdioItems }) => forwardStdio(stdioItems));
	return fileDescriptors;
};
var getFileDescriptor = ({ stdioOption, fdNumber, options, isSync }) => {
	const optionName = getStreamName(fdNumber);
	const { stdioItems: initialStdioItems, isStdioArray } = initializeStdioItems({
		stdioOption,
		fdNumber,
		options,
		optionName
	});
	const direction = getStreamDirection(initialStdioItems, fdNumber, optionName);
	const normalizedStdioItems = normalizeTransforms(initialStdioItems.map((stdioItem) => handleNativeStream({
		stdioItem,
		isStdioArray,
		fdNumber,
		direction,
		isSync
	})), optionName, direction, options);
	const objectMode = getFdObjectMode(normalizedStdioItems, direction);
	validateFileObjectMode(normalizedStdioItems, objectMode);
	return {
		direction,
		objectMode,
		stdioItems: normalizedStdioItems
	};
};
var initializeStdioItems = ({ stdioOption, fdNumber, options, optionName }) => {
	const values = Array.isArray(stdioOption) ? stdioOption : [stdioOption];
	const inputStdioItems = handleInputOptions(options, fdNumber);
	const stdioItems = filterDuplicates([...omitInheritedStdin(values.map((value) => initializeStdioItem(value, optionName)), inputStdioItems), ...inputStdioItems]);
	const isStdioArray = stdioItems.length > 1;
	validateStdioArray(stdioItems, isStdioArray, optionName);
	validateStreams(stdioItems);
	return {
		stdioItems,
		isStdioArray
	};
};
var omitInheritedStdin = (stdioItems, inputStdioItems) => inputStdioItems.length > 0 && isInheritedStdinOnly(stdioItems) ? [] : stdioItems;
var isInheritedStdinOnly = (stdioItems) => stdioItems.length === 1 && stdioItems[0].type === "native" && stdioItems[0].value === "inherit";
var initializeStdioItem = (value, optionName) => {
	if (isStdioValueObject(value)) return initializeStdioValueObject(value, optionName);
	return {
		type: getStdioItemType(value, optionName),
		value,
		optionName
	};
};
var initializeStdioValueObject = ({ value, input }, optionName) => {
	checkBooleanOption(input, `${optionName}.input`);
	return {
		type: getStdioItemType(value, optionName),
		value,
		direction: input ? "input" : void 0,
		optionName
	};
};
var validateStdioArray = (stdioItems, isStdioArray, optionName) => {
	if (stdioItems.length === 0) throw new TypeError(`The \`${optionName}\` option must not be an empty array.`);
	if (!isStdioArray) return;
	for (const { value, optionName } of stdioItems) if (INVALID_STDIO_ARRAY_OPTIONS.has(value)) throw new Error(`The \`${optionName}\` option must not include \`${value}\`.`);
};
var INVALID_STDIO_ARRAY_OPTIONS = /* @__PURE__ */ new Set(["ignore"]);
var validateStreams = (stdioItems) => {
	for (const stdioItem of stdioItems) validateFileStdio(stdioItem);
};
var validateFileStdio = ({ type, value, optionName }) => {
	if (isRegularUrl(value)) throw new TypeError(`The \`${optionName}: URL\` option must use the \`file:\` scheme.
For example, you can use the \`pathToFileURL()\` method of the \`url\` core module.`);
	if (isUnknownStdioString(type, value)) throw new TypeError(`The \`${optionName}: { file: '...' }\` option must be used instead of \`${optionName}: '...'\`.`);
};
var validateFileObjectMode = (stdioItems, objectMode) => {
	if (!objectMode) return;
	const fileStdioItem = stdioItems.find(({ type }) => FILE_TYPES.has(type));
	if (fileStdioItem !== void 0) throw new TypeError(`The \`${fileStdioItem.optionName}\` option cannot use both files and transforms in objectMode.`);
};
var getFinalFileDescriptors = ({ initialFileDescriptors, addProperties, options, isSync }) => {
	const fileDescriptors = [];
	try {
		for (const fileDescriptor of initialFileDescriptors) fileDescriptors.push(getFinalFileDescriptor({
			fileDescriptor,
			fileDescriptors,
			addProperties,
			options,
			isSync
		}));
		return fileDescriptors;
	} catch (error) {
		cleanupCustomStreams(fileDescriptors);
		throw error;
	}
};
var getFinalFileDescriptor = ({ fileDescriptor: { direction, objectMode, stdioItems }, fileDescriptors, addProperties, options, isSync }) => {
	return {
		direction,
		objectMode,
		stdioItems: stdioItems.map((stdioItem) => addStreamProperties({
			stdioItem,
			addProperties,
			direction,
			options,
			fileDescriptors,
			isSync
		}))
	};
};
var addStreamProperties = ({ stdioItem, addProperties, direction, options, fileDescriptors, isSync }) => {
	const duplicateStream = getDuplicateStream({
		stdioItem,
		direction,
		fileDescriptors,
		isSync
	});
	if (duplicateStream !== void 0) return {
		...stdioItem,
		stream: duplicateStream
	};
	return {
		...stdioItem,
		...addProperties[direction][stdioItem.type](stdioItem, options)
	};
};
var cleanupCustomStreams = (fileDescriptors) => {
	for (const { stdioItems } of fileDescriptors) for (const { stream } of stdioItems) if (stream !== void 0 && !isStandardStream(stream)) stream.destroy();
};
var forwardStdio = (stdioItems) => {
	if (stdioItems.length > 1) return stdioItems.some(({ value }) => value === "overlapped") ? "overlapped" : "pipe";
	const [{ type, value }] = stdioItems;
	return type === "native" ? value : "pipe";
};
//#endregion
//#region node_modules/execa/lib/stdio/handle-sync.js
var handleStdioSync = (options, verboseInfo) => handleStdio(addPropertiesSync, options, verboseInfo, true);
var forbiddenIfSync = ({ type, optionName }) => {
	throwInvalidSyncValue(optionName, TYPE_TO_MESSAGE[type]);
};
var forbiddenNativeIfSync = ({ optionName, value }) => {
	if (value === "overlapped") throwInvalidSyncValue(optionName, `"${value}"`);
	return {};
};
var forbiddenNativeInputIfSync = (stdioItem) => {
	const { optionName, value } = stdioItem;
	if (value === "pipe" && optionName !== "stdin") throw new TypeError(`Only the \`stdin\` option, not \`${optionName}\`, can be an input pipe with synchronous methods.`);
	return forbiddenNativeIfSync(stdioItem);
};
var throwInvalidSyncValue = (optionName, value) => {
	throw new TypeError(`The \`${optionName}\` option cannot be ${value} with synchronous methods.`);
};
var addProperties$1 = {
	generator() {},
	asyncGenerator: forbiddenIfSync,
	webStream: forbiddenIfSync,
	nodeStream: forbiddenIfSync,
	webTransform: forbiddenIfSync,
	duplex: forbiddenIfSync,
	asyncIterable: forbiddenIfSync,
	native: forbiddenNativeIfSync
};
var addPropertiesSync = {
	input: {
		...addProperties$1,
		native: forbiddenNativeInputIfSync,
		fileUrl: ({ value }) => ({ contents: [bufferToUint8Array(readFileSync(value))] }),
		filePath: ({ value: { file } }) => ({ contents: [bufferToUint8Array(readFileSync(file))] }),
		fileNumber: forbiddenIfSync,
		iterable: ({ value }) => ({ contents: [...value] }),
		string: ({ value }) => ({ contents: [value] }),
		uint8Array: ({ value }) => ({ contents: [value] })
	},
	output: {
		...addProperties$1,
		fileUrl: ({ value }) => ({ path: value }),
		filePath: ({ value: { file, append } }) => ({
			path: file,
			append
		}),
		fileNumber: ({ value }) => ({ path: value }),
		iterable: forbiddenIfSync,
		string: forbiddenIfSync,
		uint8Array: forbiddenIfSync
	}
};
//#endregion
//#region node_modules/execa/lib/io/strip-newline.js
var stripNewline = (value, { stripFinalNewline: stripFinalNewline$1 }, fdNumber) => getStripFinalNewline(stripFinalNewline$1, fdNumber) && value !== void 0 && !Array.isArray(value) ? stripFinalNewline(value) : value;
var getStripFinalNewline = (stripFinalNewline, fdNumber) => fdNumber === "all" ? stripFinalNewline[1] || stripFinalNewline[2] : stripFinalNewline[fdNumber];
//#endregion
//#region node_modules/execa/lib/transform/split.js
var getSplitLinesGenerator = (binary, preserveNewlines, skipped, state) => binary || skipped ? void 0 : initializeSplitLines(preserveNewlines, state);
var splitLinesSync = (chunk, preserveNewlines, objectMode) => objectMode ? chunk.flatMap((item) => splitLinesItemSync(item, preserveNewlines)) : splitLinesItemSync(chunk, preserveNewlines);
var splitLinesItemSync = (chunk, preserveNewlines) => {
	const { transform, final } = initializeSplitLines(preserveNewlines, {});
	return [...transform(chunk), ...final()];
};
var initializeSplitLines = (preserveNewlines, state) => {
	state.previousChunks = "";
	return {
		transform: splitGenerator.bind(void 0, state, preserveNewlines),
		final: linesFinal.bind(void 0, state)
	};
};
var splitGenerator = function* (state, preserveNewlines, chunk) {
	if (typeof chunk !== "string") {
		yield chunk;
		return;
	}
	let { previousChunks } = state;
	let start = -1;
	for (let end = 0; end < chunk.length; end += 1) {
		if (chunk[end] !== "\n") continue;
		const newlineLength = getNewlineLength(chunk, end, preserveNewlines, state);
		let line = chunk.slice(start + 1, end + 1 - newlineLength);
		if (previousChunks.length > 0) {
			line = concatString(previousChunks, line);
			previousChunks = "";
		}
		yield line;
		start = end;
	}
	if (start !== chunk.length - 1) previousChunks = concatString(previousChunks, chunk.slice(start + 1));
	state.previousChunks = previousChunks;
};
var getNewlineLength = (chunk, end, preserveNewlines, state) => {
	if (preserveNewlines) return 0;
	state.isWindowsNewline = end !== 0 && chunk[end - 1] === "\r";
	return state.isWindowsNewline ? 2 : 1;
};
var linesFinal = function* ({ previousChunks }) {
	if (previousChunks.length > 0) yield previousChunks;
};
var getAppendNewlineGenerator = ({ binary, preserveNewlines, readableObjectMode, state }) => binary || preserveNewlines || readableObjectMode ? void 0 : { transform: appendNewlineGenerator.bind(void 0, state) };
var appendNewlineGenerator = function* ({ isWindowsNewline = false }, chunk) {
	const { unixNewline, windowsNewline, LF, concatBytes } = typeof chunk === "string" ? linesStringInfo : linesUint8ArrayInfo;
	if (chunk.at(-1) === LF) {
		yield chunk;
		return;
	}
	yield concatBytes(chunk, isWindowsNewline ? windowsNewline : unixNewline);
};
var concatString = (firstChunk, secondChunk) => `${firstChunk}${secondChunk}`;
var linesStringInfo = {
	windowsNewline: "\r\n",
	unixNewline: "\n",
	LF: "\n",
	concatBytes: concatString
};
var concatUint8Array = (firstChunk, secondChunk) => {
	const chunk = new Uint8Array(firstChunk.length + secondChunk.length);
	chunk.set(firstChunk, 0);
	chunk.set(secondChunk, firstChunk.length);
	return chunk;
};
var linesUint8ArrayInfo = {
	windowsNewline: new Uint8Array([13, 10]),
	unixNewline: new Uint8Array([10]),
	LF: 10,
	concatBytes: concatUint8Array
};
//#endregion
//#region node_modules/execa/lib/transform/validate.js
var getValidateTransformInput = (writableObjectMode, optionName) => writableObjectMode ? void 0 : validateStringTransformInput.bind(void 0, optionName);
var validateStringTransformInput = function* (optionName, chunk) {
	if (typeof chunk !== "string" && !isUint8Array(chunk) && !Buffer$1.isBuffer(chunk)) throw new TypeError(`The \`${optionName}\` option's transform must use "objectMode: true" to receive as input: ${typeof chunk}.`);
	yield chunk;
};
var getValidateTransformReturn = (readableObjectMode, optionName) => readableObjectMode ? validateObjectTransformReturn.bind(void 0, optionName) : validateStringTransformReturn.bind(void 0, optionName);
var validateObjectTransformReturn = function* (optionName, chunk) {
	validateEmptyReturn(optionName, chunk);
	yield chunk;
};
var validateStringTransformReturn = function* (optionName, chunk) {
	validateEmptyReturn(optionName, chunk);
	if (typeof chunk !== "string" && !isUint8Array(chunk)) throw new TypeError(`The \`${optionName}\` option's function must yield a string or an Uint8Array, not ${typeof chunk}.`);
	yield chunk;
};
var validateEmptyReturn = (optionName, chunk) => {
	if (chunk === null || chunk === void 0) throw new TypeError(`The \`${optionName}\` option's function must not call \`yield ${chunk}\`.
Instead, \`yield\` should either be called with a value, or not be called at all. For example:
  if (condition) { yield value; }`);
};
//#endregion
//#region node_modules/execa/lib/transform/encoding-transform.js
var getEncodingTransformGenerator = (binary, encoding, skipped) => {
	if (skipped) return;
	if (binary) return { transform: encodingUint8ArrayGenerator.bind(void 0, new TextEncoder()) };
	const stringDecoder = new StringDecoder(encoding);
	return {
		transform: encodingStringGenerator.bind(void 0, stringDecoder),
		final: encodingStringFinal.bind(void 0, stringDecoder)
	};
};
var encodingUint8ArrayGenerator = function* (textEncoder, chunk) {
	if (Buffer$1.isBuffer(chunk)) yield bufferToUint8Array(chunk);
	else if (typeof chunk === "string") yield textEncoder.encode(chunk);
	else yield chunk;
};
var encodingStringGenerator = function* (stringDecoder, chunk) {
	yield isUint8Array(chunk) ? stringDecoder.write(chunk) : chunk;
};
var encodingStringFinal = function* (stringDecoder) {
	const lastChunk = stringDecoder.end();
	if (lastChunk !== "") yield lastChunk;
};
//#endregion
//#region node_modules/execa/lib/transform/run-async.js
var pushChunks = callbackify(async (getChunks, state, getChunksArguments, transformStream) => {
	state.currentIterable = getChunks(...getChunksArguments);
	try {
		for await (const chunk of state.currentIterable) transformStream.push(chunk);
	} finally {
		delete state.currentIterable;
	}
});
var transformChunk = async function* (chunk, generators, index) {
	if (index === generators.length) {
		yield chunk;
		return;
	}
	const { transform = identityGenerator$1 } = generators[index];
	for await (const transformedChunk of transform(chunk)) yield* transformChunk(transformedChunk, generators, index + 1);
};
var finalChunks = async function* (generators) {
	for (const [index, { final }] of Object.entries(generators)) yield* generatorFinalChunks(final, Number(index), generators);
};
var generatorFinalChunks = async function* (final, index, generators) {
	if (final === void 0) return;
	for await (const finalChunk of final()) yield* transformChunk(finalChunk, generators, index + 1);
};
var destroyTransform = callbackify(async ({ currentIterable }, error) => {
	if (currentIterable !== void 0) {
		await (error ? currentIterable.throw(error) : currentIterable.return());
		return;
	}
	if (error) throw error;
});
var identityGenerator$1 = function* (chunk) {
	yield chunk;
};
//#endregion
//#region node_modules/execa/lib/transform/run-sync.js
var pushChunksSync = (getChunksSync, getChunksArguments, transformStream, done) => {
	try {
		for (const chunk of getChunksSync(...getChunksArguments)) transformStream.push(chunk);
		done();
	} catch (error) {
		done(error);
	}
};
var runTransformSync = (generators, chunks) => [...chunks.flatMap((chunk) => [...transformChunkSync(chunk, generators, 0)]), ...finalChunksSync(generators)];
var transformChunkSync = function* (chunk, generators, index) {
	if (index === generators.length) {
		yield chunk;
		return;
	}
	const { transform = identityGenerator } = generators[index];
	for (const transformedChunk of transform(chunk)) yield* transformChunkSync(transformedChunk, generators, index + 1);
};
var finalChunksSync = function* (generators) {
	for (const [index, { final }] of Object.entries(generators)) yield* generatorFinalChunksSync(final, Number(index), generators);
};
var generatorFinalChunksSync = function* (final, index, generators) {
	if (final === void 0) return;
	for (const finalChunk of final()) yield* transformChunkSync(finalChunk, generators, index + 1);
};
var identityGenerator = function* (chunk) {
	yield chunk;
};
//#endregion
//#region node_modules/execa/lib/transform/generator.js
var generatorToStream = ({ value, value: { transform, final, writableObjectMode, readableObjectMode }, optionName }, { encoding }) => {
	const state = {};
	const generators = addInternalGenerators(value, encoding, optionName);
	const transformAsync = isAsyncGenerator(transform);
	const finalAsync = isAsyncGenerator(final);
	const transformMethod = transformAsync ? pushChunks.bind(void 0, transformChunk, state) : pushChunksSync.bind(void 0, transformChunkSync);
	const finalMethod = transformAsync || finalAsync ? pushChunks.bind(void 0, finalChunks, state) : pushChunksSync.bind(void 0, finalChunksSync);
	const destroyMethod = transformAsync || finalAsync ? destroyTransform.bind(void 0, state) : void 0;
	return { stream: new Transform({
		writableObjectMode,
		writableHighWaterMark: getDefaultHighWaterMark(writableObjectMode),
		readableObjectMode,
		readableHighWaterMark: getDefaultHighWaterMark(readableObjectMode),
		transform(chunk, encoding, done) {
			transformMethod([
				chunk,
				generators,
				0
			], this, done);
		},
		flush(done) {
			finalMethod([generators], this, done);
		},
		destroy: destroyMethod
	}) };
};
var runGeneratorsSync = (chunks, stdioItems, encoding, isInput) => {
	const generators = stdioItems.filter(({ type }) => type === "generator");
	const reversedGenerators = isInput ? generators.reverse() : generators;
	for (const { value, optionName } of reversedGenerators) chunks = runTransformSync(addInternalGenerators(value, encoding, optionName), chunks);
	return chunks;
};
var addInternalGenerators = ({ transform, final, binary, writableObjectMode, readableObjectMode, preserveNewlines }, encoding, optionName) => {
	const state = {};
	return [
		{ transform: getValidateTransformInput(writableObjectMode, optionName) },
		getEncodingTransformGenerator(binary, encoding, writableObjectMode),
		getSplitLinesGenerator(binary, preserveNewlines, writableObjectMode, state),
		{
			transform,
			final
		},
		{ transform: getValidateTransformReturn(readableObjectMode, optionName) },
		getAppendNewlineGenerator({
			binary,
			preserveNewlines,
			readableObjectMode,
			state
		})
	].filter(Boolean);
};
//#endregion
//#region node_modules/execa/lib/io/input-sync.js
var addInputOptionsSync = (fileDescriptors, options) => {
	for (const fdNumber of getInputFdNumbers(fileDescriptors)) addInputOptionSync(fileDescriptors, fdNumber, options);
};
var getInputFdNumbers = (fileDescriptors) => new Set(Object.entries(fileDescriptors).filter(([, { direction }]) => direction === "input").map(([fdNumber]) => Number(fdNumber)));
var addInputOptionSync = (fileDescriptors, fdNumber, options) => {
	const { stdioItems } = fileDescriptors[fdNumber];
	const allStdioItems = stdioItems.filter(({ contents }) => contents !== void 0);
	if (allStdioItems.length === 0) return;
	if (fdNumber !== 0) {
		const [{ type, optionName }] = allStdioItems;
		throw new TypeError(`Only the \`stdin\` option, not \`${optionName}\`, can be ${TYPE_TO_MESSAGE[type]} with synchronous methods.`);
	}
	options.input = joinToUint8Array(allStdioItems.map(({ contents }) => contents).map((contents) => applySingleInputGeneratorsSync(contents, stdioItems)));
};
var applySingleInputGeneratorsSync = (contents, stdioItems) => {
	const newContents = runGeneratorsSync(contents, stdioItems, "utf8", true);
	validateSerializable(newContents);
	return joinToUint8Array(newContents);
};
var validateSerializable = (newContents) => {
	const invalidItem = newContents.find((item) => typeof item !== "string" && !isUint8Array(item));
	if (invalidItem !== void 0) throw new TypeError(`The \`stdin\` option is invalid: when passing objects as input, a transform must be used to serialize them to strings or Uint8Arrays: ${invalidItem}.`);
};
//#endregion
//#region node_modules/execa/lib/verbose/output.js
var shouldLogOutput = ({ stdioItems, encoding, verboseInfo, fdNumber }) => fdNumber !== "all" && isFullVerbose(verboseInfo, fdNumber) && !BINARY_ENCODINGS.has(encoding) && isFdVerbose(fdNumber) && (stdioItems.some(({ type, value }) => type === "native" && PIPED_STDIO_VALUES.has(value)) || stdioItems.every(({ type }) => TRANSFORM_TYPES.has(type)));
var isFdVerbose = (fdNumber) => fdNumber === 1 || fdNumber === 2;
var PIPED_STDIO_VALUES = /* @__PURE__ */ new Set(["pipe", "overlapped"]);
var logLines = async (linesIterable, stream, fdNumber, verboseInfo) => {
	for await (const line of linesIterable) if (!isPipingStream(stream)) logLine(line, fdNumber, verboseInfo);
};
var logLinesSync = (linesArray, fdNumber, verboseInfo) => {
	for (const line of linesArray) logLine(line, fdNumber, verboseInfo);
};
var isPipingStream = (stream) => stream._readableState.pipes.length > 0;
var logLine = (line, fdNumber, verboseInfo) => {
	verboseLog({
		type: "output",
		verboseMessage: serializeVerboseMessage(line),
		fdNumber,
		verboseInfo
	});
};
//#endregion
//#region node_modules/execa/lib/io/output-sync.js
var transformOutputSync = ({ fileDescriptors, syncResult: { output }, options, isMaxBuffer, verboseInfo }) => {
	if (output === null) return { output: Array.from({ length: 3 }) };
	const state = {};
	const outputFiles = /* @__PURE__ */ new Set();
	return {
		output: output.map((result, fdNumber) => transformOutputResultSync({
			result,
			fileDescriptors,
			fdNumber,
			state,
			outputFiles,
			isMaxBuffer,
			verboseInfo
		}, options)),
		...state
	};
};
var transformOutputResultSync = ({ result, fileDescriptors, fdNumber, state, outputFiles, isMaxBuffer, verboseInfo }, { buffer, encoding, lines, stripFinalNewline, maxBuffer }) => {
	if (result === null) return;
	const uint8ArrayResult = bufferToUint8Array(truncateMaxBufferSync(result, isMaxBuffer, maxBuffer));
	const { stdioItems, objectMode } = fileDescriptors[fdNumber];
	const { serializedResult, finalResult = serializedResult } = serializeChunks({
		chunks: runOutputGeneratorsSync([uint8ArrayResult], stdioItems, encoding, state),
		objectMode,
		encoding,
		lines,
		stripFinalNewline,
		fdNumber
	});
	logOutputSync({
		serializedResult,
		fdNumber,
		state,
		verboseInfo,
		encoding,
		stdioItems,
		objectMode
	});
	const returnedResult = buffer[fdNumber] ? finalResult : void 0;
	try {
		if (state.error === void 0) writeToFiles(serializedResult, stdioItems, outputFiles);
		return returnedResult;
	} catch (error) {
		state.error = error;
		return returnedResult;
	}
};
var runOutputGeneratorsSync = (chunks, stdioItems, encoding, state) => {
	try {
		return runGeneratorsSync(chunks, stdioItems, encoding, false);
	} catch (error) {
		state.error = error;
		return chunks;
	}
};
var serializeChunks = ({ chunks, objectMode, encoding, lines, stripFinalNewline, fdNumber }) => {
	if (objectMode) return { serializedResult: chunks };
	if (encoding === "buffer") return { serializedResult: joinToUint8Array(chunks) };
	const serializedResult = joinToString(chunks, encoding);
	if (lines[fdNumber]) return {
		serializedResult,
		finalResult: splitLinesSync(serializedResult, !stripFinalNewline[fdNumber], objectMode)
	};
	return { serializedResult };
};
var logOutputSync = ({ serializedResult, fdNumber, state, verboseInfo, encoding, stdioItems, objectMode }) => {
	if (!shouldLogOutput({
		stdioItems,
		encoding,
		verboseInfo,
		fdNumber
	})) return;
	const linesArray = splitLinesSync(serializedResult, false, objectMode);
	try {
		logLinesSync(linesArray, fdNumber, verboseInfo);
	} catch (error) {
		state.error ??= error;
	}
};
var writeToFiles = (serializedResult, stdioItems, outputFiles) => {
	const fileItems = stdioItems.filter(({ type }) => FILE_TYPES.has(type));
	for (const { path, append } of fileItems) {
		const pathString = typeof path === "string" ? path : path.toString();
		if (append || outputFiles.has(pathString)) appendFileSync(path, serializedResult);
		else {
			outputFiles.add(pathString);
			writeFileSync$1(path, serializedResult);
		}
	}
};
//#endregion
//#region node_modules/execa/lib/resolve/all-sync.js
var getAllSync = ([, stdout, stderr], options) => {
	if (!options.all) return;
	if (stdout === void 0) return stderr;
	if (stderr === void 0) return stdout;
	if (Array.isArray(stdout)) return Array.isArray(stderr) ? [...stdout, ...stderr] : [...stdout, stripNewline(stderr, options, "all")];
	if (Array.isArray(stderr)) return [stripNewline(stdout, options, "all"), ...stderr];
	if (isUint8Array(stdout) && isUint8Array(stderr)) return concatUint8Arrays([stdout, stderr]);
	return `${stdout}${stderr}`;
};
//#endregion
//#region node_modules/execa/lib/resolve/exit-async.js
var waitForExit = async (subprocess, context) => {
	const [exitCode, signal] = await waitForExitOrError(subprocess);
	context.isForcefullyTerminated ??= false;
	return [exitCode, signal];
};
var waitForExitOrError = async (subprocess) => {
	const [spawnPayload, exitPayload] = await Promise.allSettled([once(subprocess, "spawn"), once(subprocess, "exit")]);
	if (spawnPayload.status === "rejected") return [];
	return exitPayload.status === "rejected" ? waitForSubprocessExit(subprocess) : exitPayload.value;
};
var waitForSubprocessExit = async (subprocess) => {
	try {
		return await once(subprocess, "exit");
	} catch {
		return waitForSubprocessExit(subprocess);
	}
};
var waitForSuccessfulExit = async (exitPromise) => {
	const [exitCode, signal] = await exitPromise;
	if (!isSubprocessErrorExit(exitCode, signal) && isFailedExit(exitCode, signal)) throw new DiscardedError();
	return [exitCode, signal];
};
var isSubprocessErrorExit = (exitCode, signal) => exitCode === void 0 && signal === void 0;
var isFailedExit = (exitCode, signal) => exitCode !== 0 || signal !== null;
//#endregion
//#region node_modules/execa/lib/resolve/exit-sync.js
var getExitResultSync = ({ error, status: exitCode, signal, output }, { maxBuffer }) => {
	const resultError = getResultError(error, exitCode, signal);
	return {
		resultError,
		exitCode,
		signal,
		timedOut: resultError?.code === "ETIMEDOUT",
		isMaxBuffer: isMaxBufferSync(resultError, output, maxBuffer)
	};
};
var getResultError = (error, exitCode, signal) => {
	if (error !== void 0) return error;
	return isFailedExit(exitCode, signal) ? new DiscardedError() : void 0;
};
//#endregion
//#region node_modules/execa/lib/methods/main-sync.js
var execaCoreSync = (rawFile, rawArguments, rawOptions) => {
	const { file, commandArguments, command, escapedCommand, startTime, verboseInfo, options, fileDescriptors } = handleSyncArguments(rawFile, rawArguments, rawOptions);
	return handleResult(spawnSubprocessSync({
		file,
		commandArguments,
		options,
		command,
		escapedCommand,
		verboseInfo,
		fileDescriptors,
		startTime
	}), verboseInfo, options);
};
var handleSyncArguments = (rawFile, rawArguments, rawOptions) => {
	const { command, escapedCommand, startTime, verboseInfo } = handleCommand(rawFile, rawArguments, rawOptions);
	const { file, commandArguments, options } = normalizeOptions(rawFile, rawArguments, normalizeSyncOptions(rawOptions));
	validateSyncOptions(options);
	return {
		file,
		commandArguments,
		command,
		escapedCommand,
		startTime,
		verboseInfo,
		options,
		fileDescriptors: handleStdioSync(options, verboseInfo)
	};
};
var normalizeSyncOptions = (options) => options.node && !options.ipc ? {
	...options,
	ipc: false
} : options;
var validateSyncOptions = ({ ipc, ipcInput, detached, cancelSignal, killDescendants }) => {
	if (ipcInput) throwInvalidSyncOption("ipcInput");
	if (ipc) throwInvalidSyncOption("ipc: true");
	if (detached) throwInvalidSyncOption("detached: true");
	if (killDescendants) throwInvalidSyncOption("killDescendants: true");
	if (cancelSignal) throwInvalidSyncOption("cancelSignal");
};
var throwInvalidSyncOption = (value) => {
	throw new TypeError(`The "${value}" option cannot be used with synchronous methods.`);
};
var spawnSubprocessSync = ({ file, commandArguments, options, command, escapedCommand, verboseInfo, fileDescriptors, startTime }) => {
	const syncResult = runSubprocessSync({
		file,
		commandArguments,
		options,
		command,
		escapedCommand,
		fileDescriptors,
		startTime
	});
	if (syncResult.failed) return syncResult;
	const { resultError, exitCode, signal, timedOut, isMaxBuffer } = getExitResultSync(syncResult, options);
	const { output, error = resultError } = transformOutputSync({
		fileDescriptors,
		syncResult,
		options,
		isMaxBuffer,
		verboseInfo
	});
	return getSyncResult({
		error,
		exitCode,
		signal,
		timedOut,
		isMaxBuffer,
		stdio: output.map((stdioOutput, fdNumber) => stripNewline(stdioOutput, options, fdNumber)),
		all: stripNewline(getAllSync(output, options), options, "all"),
		options,
		command,
		escapedCommand,
		startTime
	});
};
var runSubprocessSync = ({ file, commandArguments, options, command, escapedCommand, fileDescriptors, startTime }) => {
	try {
		addInputOptionsSync(fileDescriptors, options);
		const normalizedOptions = normalizeSpawnSyncOptions(options);
		return spawnSync(...concatenateShell(file, commandArguments, normalizedOptions));
	} catch (error) {
		return makeEarlyError({
			error,
			command,
			escapedCommand,
			fileDescriptors,
			options,
			startTime,
			isSync: true
		});
	}
};
var normalizeSpawnSyncOptions = ({ encoding, maxBuffer, ...options }) => ({
	...options,
	encoding: "buffer",
	maxBuffer: getMaxBufferSync(maxBuffer)
});
var getSyncResult = ({ error, exitCode, signal, timedOut, isMaxBuffer, stdio, all, options, command, escapedCommand, startTime }) => error === void 0 ? makeSuccessResult({
	command,
	escapedCommand,
	stdio,
	all,
	ipcOutput: [],
	options,
	startTime
}) : makeError({
	error,
	command,
	escapedCommand,
	timedOut,
	isCanceled: false,
	isGracefullyCanceled: false,
	isMaxBuffer,
	isForcefullyTerminated: false,
	exitCode,
	signal,
	stdio,
	all,
	ipcOutput: [],
	options,
	startTime,
	isSync: true
});
//#endregion
//#region node_modules/execa/lib/ipc/get-one.js
var internalGetOneMessageOptions = Symbol("internalGetOneMessageOptions");
var getOneMessage$1 = ({ anyProcess, channel, isSubprocess, ipc }, options = {}) => {
	const { reference = true, filter } = options;
	const { signal } = options[internalGetOneMessageOptions] ?? {};
	validateIpcMethod({
		methodName: "getOneMessage",
		isSubprocess,
		ipc,
		isConnected: isConnected(anyProcess)
	});
	return getOneMessageAsync({
		anyProcess,
		channel,
		isSubprocess,
		filter,
		reference,
		signal
	});
};
var getOneMessageAsync = async ({ anyProcess, channel, isSubprocess, filter, reference, signal }) => {
	addReference(channel, reference);
	const ipcEmitter = getIpcEmitter(anyProcess, channel, isSubprocess);
	const controller = new AbortController();
	stopOnAbort$1(signal, controller);
	try {
		return await Promise.race([
			getMessage(ipcEmitter, filter, controller),
			throwOnDisconnect(ipcEmitter, isSubprocess, controller),
			throwOnStrictError(ipcEmitter, isSubprocess, controller)
		]);
	} catch (error) {
		disconnect(anyProcess);
		throw error;
	} finally {
		controller.abort();
		removeReference(channel, reference);
	}
};
var stopOnAbort$1 = (signal, controller) => {
	if (signal === void 0) return;
	if (signal.aborted) {
		controller.abort();
		return;
	}
	signal.addEventListener("abort", () => {
		controller.abort();
	}, {
		once: true,
		signal: controller.signal
	});
};
var getMessage = async (ipcEmitter, filter, { signal }) => {
	if (filter === void 0) {
		const [message] = await once(ipcEmitter, "message", { signal });
		return message;
	}
	for await (const [message] of on(ipcEmitter, "message", { signal })) if (filter(message)) return message;
};
var throwOnDisconnect = async (ipcEmitter, isSubprocess, { signal }) => {
	await once(ipcEmitter, "disconnect", { signal });
	throwOnEarlyDisconnect(isSubprocess);
};
var throwOnStrictError = async (ipcEmitter, isSubprocess, { signal }) => {
	const [error] = await once(ipcEmitter, "strict:error", { signal });
	throw getStrictResponseError(error, isSubprocess);
};
//#endregion
//#region node_modules/execa/lib/ipc/get-each.js
var internalGetEachMessageOptions = Symbol("internalGetEachMessageOptions");
var getEachMessage$1 = (subprocessInfo, options = {}) => {
	const { reference = true } = options;
	const { signal, shouldAwait = !subprocessInfo.isSubprocess } = options[internalGetEachMessageOptions] ?? {};
	return loopOnMessages({
		...subprocessInfo,
		shouldAwait,
		reference,
		signal
	});
};
var loopOnMessages = ({ anyProcess, waitProcess = anyProcess, channel, isSubprocess, ipc, shouldAwait, reference, signal }) => {
	validateIpcMethod({
		methodName: "getEachMessage",
		isSubprocess,
		ipc,
		isConnected: isConnected(anyProcess)
	});
	addReference(channel, reference);
	const ipcEmitter = getIpcEmitter(anyProcess, channel, isSubprocess);
	const controller = new AbortController();
	const state = {};
	stopOnAbort(signal, controller);
	stopOnDisconnect(anyProcess, ipcEmitter, controller);
	abortOnStrictError({
		ipcEmitter,
		isSubprocess,
		controller,
		state
	});
	return iterateOnMessages({
		anyProcess,
		waitProcess,
		channel,
		ipcEmitter,
		isSubprocess,
		shouldAwait,
		controller,
		state,
		reference
	});
};
var stopOnAbort = (signal, controller) => {
	if (signal === void 0) return;
	if (signal.aborted) {
		controller.abort();
		return;
	}
	signal.addEventListener("abort", () => {
		controller.abort();
	}, {
		once: true,
		signal: controller.signal
	});
};
var stopOnDisconnect = async (anyProcess, ipcEmitter, controller) => {
	try {
		await once(ipcEmitter, "disconnect", { signal: controller.signal });
		controller.abort();
	} catch {}
};
var abortOnStrictError = async ({ ipcEmitter, isSubprocess, controller, state }) => {
	try {
		const [error] = await once(ipcEmitter, "strict:error", { signal: controller.signal });
		state.error = getStrictResponseError(error, isSubprocess);
		controller.abort();
	} catch {}
};
var iterateOnMessages = async function* ({ anyProcess, waitProcess, channel, ipcEmitter, isSubprocess, shouldAwait, controller, state, reference }) {
	try {
		for await (const [message] of on(ipcEmitter, "message", { signal: controller.signal })) {
			throwIfStrictError(state);
			yield message;
		}
	} catch {
		throwIfStrictError(state);
	} finally {
		controller.abort();
		removeReference(channel, reference);
		if (!isSubprocess) disconnect(anyProcess);
		if (shouldAwait) await waitProcess;
	}
};
var throwIfStrictError = ({ error }) => {
	if (error) throw error;
};
//#endregion
//#region node_modules/execa/lib/ipc/methods.js
var addIpcMethods = (target, subprocess, { ipc }) => {
	Object.assign(target, getIpcMethods(subprocess, false, ipc, target));
};
var getIpcExport = () => {
	const anyProcess = process$1;
	const isSubprocess = true;
	const isIpc = process$1.channel !== void 0;
	return {
		...getIpcMethods(anyProcess, isSubprocess, isIpc),
		getCancelSignal: getCancelSignal$1.bind(void 0, {
			anyProcess,
			channel: anyProcess.channel,
			isSubprocess,
			ipc: isIpc
		})
	};
};
var getIpcMethods = (anyProcess, isSubprocess, ipc, waitProcess = anyProcess) => ({
	sendMessage: sendMessage$1.bind(void 0, {
		anyProcess,
		channel: anyProcess.channel,
		isSubprocess,
		ipc
	}),
	getOneMessage: getOneMessage$1.bind(void 0, {
		anyProcess,
		channel: anyProcess.channel,
		isSubprocess,
		ipc
	}),
	getEachMessage: getEachMessage$1.bind(void 0, {
		anyProcess,
		channel: anyProcess.channel,
		isSubprocess,
		ipc,
		waitProcess
	})
});
//#endregion
//#region node_modules/execa/lib/return/early-error.js
var handleEarlyError = ({ error, command, escapedCommand, fileDescriptors, options, startTime, verboseInfo }) => {
	cleanupCustomStreams(fileDescriptors);
	const subprocess = new ChildProcess();
	const all = createDummyStreams(subprocess, fileDescriptors);
	return {
		subprocess,
		promise: handleDummyPromise(makeEarlyError({
			error,
			command,
			escapedCommand,
			fileDescriptors,
			options,
			startTime,
			isSync: false
		}), verboseInfo, options),
		all: options.all ? all : void 0,
		convertedStreams: {
			readable,
			writable,
			duplex,
			readableStream,
			writableStream,
			transformStream,
			iterable,
			[Symbol.asyncIterator]: iterable
		}
	};
};
var createDummyStreams = (subprocess, fileDescriptors) => {
	const stdin = createDummyStream();
	const stdout = createDummyStream();
	const stderr = createDummyStream();
	const extraStdio = Array.from({ length: fileDescriptors.length - 3 }, createDummyStream);
	const all = createDummyStream();
	const stdio = [
		stdin,
		stdout,
		stderr,
		...extraStdio
	];
	Object.assign(subprocess, {
		stdin,
		stdout,
		stderr,
		stdio
	});
	return all;
};
var createDummyStream = () => {
	const stream = new PassThrough();
	stream.end();
	return stream;
};
var readable = () => new Readable({ read() {} });
var writable = () => new Writable({ write() {} });
var duplex = () => new Duplex({
	read() {},
	write() {}
});
var readableStream = () => Readable.toWeb(readable());
var writableStream = () => Writable.toWeb(writable());
var transformStream = () => Duplex.toWeb(duplex());
var iterable = async function* () {};
var handleDummyPromise = async (error, verboseInfo, options) => handleResult(error, verboseInfo, options);
//#endregion
//#region node_modules/execa/lib/stdio/handle-async.js
var handleStdioAsync = (options, verboseInfo) => handleStdio(addPropertiesAsync, options, verboseInfo, false);
var forbiddenIfAsync = ({ type, optionName }) => {
	throw new TypeError(`The \`${optionName}\` option cannot be ${TYPE_TO_MESSAGE[type]}.`);
};
var addProperties = {
	fileNumber: forbiddenIfAsync,
	generator: generatorToStream,
	asyncGenerator: generatorToStream,
	nodeStream: ({ value }) => ({ stream: value }),
	webTransform({ value: { transform, writableObjectMode, readableObjectMode } }) {
		const objectMode = writableObjectMode || readableObjectMode;
		return { stream: Duplex.fromWeb(transform, { objectMode }) };
	},
	duplex: ({ value: { transform } }) => ({ stream: transform }),
	native() {}
};
var addPropertiesAsync = {
	input: {
		...addProperties,
		fileUrl: ({ value }) => ({ stream: createReadStream(value) }),
		filePath: ({ value: { file } }) => ({ stream: createReadStream(file) }),
		webStream: ({ value }) => ({ stream: Readable.fromWeb(value) }),
		iterable: ({ value }) => ({ stream: Readable.from(value) }),
		asyncIterable: ({ value }) => ({ stream: Readable.from(value) }),
		string: ({ value }) => ({ stream: Readable.from(value) }),
		uint8Array: ({ value }) => ({ stream: Readable.from(Buffer$1.from(value)) })
	},
	output: {
		...addProperties,
		fileUrl: ({ value }) => ({ stream: createWriteStream(value) }),
		filePath: ({ value: { file, append } }) => ({ stream: createWriteStream(file, append ? { flags: "a" } : {}) }),
		webStream: ({ value }) => ({ stream: Writable.fromWeb(value) }),
		iterable: forbiddenIfAsync,
		asyncIterable: forbiddenIfAsync,
		string: forbiddenIfAsync,
		uint8Array: forbiddenIfAsync
	}
};
//#endregion
//#region node_modules/@sindresorhus/merge-streams/index.js
function mergeStreams(streams) {
	if (!Array.isArray(streams)) throw new TypeError(`Expected an array, got \`${typeof streams}\`.`);
	for (const stream of streams) validateStream(stream);
	const objectMode = streams.some(({ readableObjectMode }) => readableObjectMode);
	const highWaterMark = getHighWaterMark(streams, objectMode);
	const passThroughStream = new MergedStream({
		objectMode,
		writableHighWaterMark: highWaterMark,
		readableHighWaterMark: highWaterMark
	});
	for (const stream of streams) passThroughStream.add(stream);
	return passThroughStream;
}
var getHighWaterMark = (streams, objectMode) => {
	if (streams.length === 0) return getDefaultHighWaterMark(objectMode);
	const highWaterMarks = streams.filter(({ readableObjectMode }) => readableObjectMode === objectMode).map(({ readableHighWaterMark }) => readableHighWaterMark);
	return Math.max(...highWaterMarks);
};
var MergedStream = class extends PassThrough {
	#streams = /* @__PURE__ */ new Set([]);
	#ended = /* @__PURE__ */ new Set([]);
	#aborted = /* @__PURE__ */ new Set([]);
	#onFinished;
	#unpipeEvent = Symbol("unpipe");
	#streamPromises = /* @__PURE__ */ new WeakMap();
	add(stream) {
		validateStream(stream);
		if (this.#streams.has(stream)) return;
		this.#streams.add(stream);
		this.#onFinished ??= onMergedStreamFinished(this, this.#streams, this.#unpipeEvent);
		const streamPromise = endWhenStreamsDone({
			passThroughStream: this,
			stream,
			streams: this.#streams,
			ended: this.#ended,
			aborted: this.#aborted,
			onFinished: this.#onFinished,
			unpipeEvent: this.#unpipeEvent
		});
		this.#streamPromises.set(stream, streamPromise);
		stream.pipe(this, { end: false });
	}
	async remove(stream) {
		validateStream(stream);
		if (!this.#streams.has(stream)) return false;
		const streamPromise = this.#streamPromises.get(stream);
		if (streamPromise === void 0) return false;
		this.#streamPromises.delete(stream);
		stream.unpipe(this);
		await streamPromise;
		return true;
	}
};
var onMergedStreamFinished = async (passThroughStream, streams, unpipeEvent) => {
	updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_COUNT);
	const controller = new AbortController();
	try {
		await Promise.race([onMergedStreamEnd(passThroughStream, controller), onInputStreamsUnpipe(passThroughStream, streams, unpipeEvent, controller)]);
	} finally {
		controller.abort();
		updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_COUNT);
	}
};
var onMergedStreamEnd = async (passThroughStream, { signal }) => {
	try {
		await finished(passThroughStream, {
			signal,
			cleanup: true
		});
	} catch (error) {
		errorOrAbortStream(passThroughStream, error);
		throw error;
	}
};
var onInputStreamsUnpipe = async (passThroughStream, streams, unpipeEvent, { signal }) => {
	for await (const [unpipedStream] of on(passThroughStream, "unpipe", { signal })) if (streams.has(unpipedStream)) unpipedStream.emit(unpipeEvent);
};
var validateStream = (stream) => {
	if (typeof stream?.pipe !== "function") throw new TypeError(`Expected a readable stream, got: \`${typeof stream}\`.`);
};
var endWhenStreamsDone = async ({ passThroughStream, stream, streams, ended, aborted, onFinished, unpipeEvent }) => {
	updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_PER_STREAM);
	const controller = new AbortController();
	try {
		await Promise.race([
			afterMergedStreamFinished(onFinished, stream, controller),
			onInputStreamEnd({
				passThroughStream,
				stream,
				streams,
				ended,
				aborted,
				controller
			}),
			onInputStreamUnpipe({
				stream,
				streams,
				ended,
				aborted,
				unpipeEvent,
				controller
			})
		]);
	} finally {
		controller.abort();
		updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_PER_STREAM);
	}
	if (streams.size > 0 && streams.size === ended.size + aborted.size) {
		if (ended.size === 0 && aborted.size > 0) abortStream(passThroughStream);
		else endStream(passThroughStream);
	}
};
var afterMergedStreamFinished = async (onFinished, stream, { signal }) => {
	try {
		await onFinished;
		if (!signal.aborted) abortStream(stream);
	} catch (error) {
		if (!signal.aborted) errorOrAbortStream(stream, error);
	}
};
var onInputStreamEnd = async ({ passThroughStream, stream, streams, ended, aborted, controller: { signal } }) => {
	try {
		await finished(stream, {
			signal,
			cleanup: true,
			readable: true,
			writable: false
		});
		if (streams.has(stream)) ended.add(stream);
	} catch (error) {
		if (signal.aborted || !streams.has(stream)) return;
		if (isAbortError(error)) aborted.add(stream);
		else errorStream(passThroughStream, error);
	}
};
var onInputStreamUnpipe = async ({ stream, streams, ended, aborted, unpipeEvent, controller: { signal } }) => {
	await once(stream, unpipeEvent, { signal });
	if (!stream.readable) return once(signal, "abort", { signal });
	streams.delete(stream);
	ended.delete(stream);
	aborted.delete(stream);
};
var endStream = (stream) => {
	if (stream.writable) stream.end();
};
var errorOrAbortStream = (stream, error) => {
	if (isAbortError(error)) abortStream(stream);
	else errorStream(stream, error);
};
var isAbortError = (error) => error?.code === "ERR_STREAM_PREMATURE_CLOSE";
var abortStream = (stream) => {
	if (stream.readable || stream.writable) stream.destroy();
};
var errorStream = (stream, error) => {
	if (!stream.destroyed) {
		stream.once("error", noop);
		stream.destroy(error);
	}
};
var noop = () => {};
var updateMaxListeners = (passThroughStream, increment) => {
	const maxListeners = passThroughStream.getMaxListeners();
	if (maxListeners !== 0 && maxListeners !== Number.POSITIVE_INFINITY) passThroughStream.setMaxListeners(maxListeners + increment);
};
var PASSTHROUGH_LISTENERS_COUNT = 2;
var PASSTHROUGH_LISTENERS_PER_STREAM = 1;
//#endregion
//#region node_modules/execa/lib/io/pipeline.js
var pipeStreams = (source, destination) => {
	source.pipe(destination);
	onSourceFinish(source, destination);
	onDestinationFinish(source, destination);
};
var onSourceFinish = async (source, destination) => {
	if (isStandardStream(source) || isStandardStream(destination)) return;
	try {
		await finished(source, {
			cleanup: true,
			readable: true,
			writable: false
		});
	} catch {}
	endDestinationStream(destination);
};
var endDestinationStream = (destination) => {
	if (destination.writable) destination.end();
};
var onDestinationFinish = async (source, destination) => {
	if (isStandardStream(source) || isStandardStream(destination)) return;
	try {
		await finished(destination, {
			cleanup: true,
			readable: false,
			writable: true
		});
	} catch {}
	abortSourceStream(source);
};
var abortSourceStream = (source) => {
	if (source.readable) source.destroy();
};
//#endregion
//#region node_modules/execa/lib/io/output-async.js
var pipeOutputAsync = (subprocess, fileDescriptors, controller) => {
	const pipeGroups = /* @__PURE__ */ new Map();
	for (const [fdNumber, { stdioItems, direction }] of Object.entries(fileDescriptors)) {
		const transformItems = stdioItems.filter(({ type }) => TRANSFORM_TYPES.has(type));
		for (const { stream } of transformItems) pipeTransform(subprocess, stream, direction, fdNumber);
		const nonTransformItems = stdioItems.filter(({ type }) => !TRANSFORM_TYPES.has(type));
		for (const { stream } of nonTransformItems) pipeStdioItem({
			subprocess,
			stream,
			direction,
			fdNumber,
			pipeGroups,
			controller
		});
	}
	for (const [outputStream, inputStreams] of pipeGroups) pipeStreams(inputStreams.length === 1 ? inputStreams[0] : mergeStreams(inputStreams), outputStream);
};
var pipeTransform = (subprocess, stream, direction, fdNumber) => {
	if (direction === "output") pipeStreams(subprocess.stdio[fdNumber], stream);
	else pipeStreams(stream, subprocess.stdio[fdNumber]);
	const streamProperty = SUBPROCESS_STREAM_PROPERTIES[fdNumber];
	if (streamProperty !== void 0) subprocess[streamProperty] = stream;
	subprocess.stdio[fdNumber] = stream;
};
var SUBPROCESS_STREAM_PROPERTIES = [
	"stdin",
	"stdout",
	"stderr"
];
var pipeStdioItem = ({ subprocess, stream, direction, fdNumber, pipeGroups, controller }) => {
	if (stream === void 0) return;
	setStandardStreamMaxListeners(stream, controller);
	const [inputStream, outputStream] = direction === "output" ? [stream, subprocess.stdio[fdNumber]] : [subprocess.stdio[fdNumber], stream];
	const outputStreams = pipeGroups.get(inputStream) ?? [];
	pipeGroups.set(inputStream, [...outputStreams, outputStream]);
};
var setStandardStreamMaxListeners = (stream, { signal }) => {
	if (isStandardStream(stream)) incrementMaxListeners(stream, MAX_LISTENERS_INCREMENT, signal);
};
var MAX_LISTENERS_INCREMENT = 2;
//#endregion
//#region node_modules/execa/lib/terminate/kill-descendants.js
var isWindows = process$1.platform === "win32";
var getSpawnOptions = (options) => options.killDescendants && !isWindows ? {
	...options,
	detached: true
} : options;
var getKillFunction = (subprocess, { killDescendants }) => {
	if (!killDescendants) return subprocess.kill.bind(subprocess);
	return (isWindows ? killDescendantsWindows : killDescendantsUnix).bind(void 0, subprocess);
};
var killDescendantsUnix = (subprocess, signal) => {
	if (subprocess.pid === void 0) return false;
	try {
		return process$1.kill(-subprocess.pid, signal);
	} catch {
		return subprocess.kill(signal);
	}
};
var killDescendantsWindows = (subprocess, signal) => {
	if (subprocess.pid === void 0) return false;
	const taskkillFile = getTaskkillFile();
	if (taskkillFile === void 0) return subprocess.kill(signal);
	execFile(taskkillFile, [
		"/pid",
		`${subprocess.pid}`,
		"/T",
		"/F"
	], (error) => {
		if (error) subprocess.kill(signal);
	});
	return true;
};
var getTaskkillFile = () => {
	const windowsDirectory = [process$1.env.SystemRoot, process$1.env.windir].find((directory) => directory && isWindowsDriveAbsolutePath(directory));
	return windowsDirectory === void 0 ? void 0 : path$1.join(windowsDirectory, "System32", "taskkill.exe");
};
var isWindowsDriveAbsolutePath = (directory) => {
	const { root } = path$1.parse(directory);
	return /^[a-z]:[/\\]/i.test(root);
};
//#endregion
//#region node_modules/signal-exit/dist/mjs/signals.js
/**
* This is not the set of all possible signals.
*
* It IS, however, the set of all signals that trigger
* an exit on either Linux or BSD systems.  Linux is a
* superset of the signal names supported on BSD, and
* the unknown signals just fail to register, so we can
* catch that easily enough.
*
* Windows signals are a different set, since there are
* signals that terminate Windows processes, but don't
* terminate (or don't even exist) on Posix systems.
*
* Don't bother with SIGKILL.  It's uncatchable, which
* means that we can't fire any callbacks anyway.
*
* If a user does happen to register a handler on a non-
* fatal signal like SIGWINCH or something, and then
* exit, it'll end up firing `process.emit('exit')`, so
* the handler will be fired anyway.
*
* SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
* artificially, inherently leave the process in a
* state from which it is not safe to try and enter JS
* listeners.
*/
var signals = [];
signals.push("SIGHUP", "SIGINT", "SIGTERM");
if (process.platform !== "win32") signals.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
if (process.platform === "linux") signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
//#endregion
//#region node_modules/signal-exit/dist/mjs/index.js
var processOk = (process) => !!process && typeof process === "object" && typeof process.removeListener === "function" && typeof process.emit === "function" && typeof process.reallyExit === "function" && typeof process.listeners === "function" && typeof process.kill === "function" && typeof process.pid === "number" && typeof process.on === "function";
var kExitEmitter = Symbol.for("signal-exit emitter");
var global = globalThis;
var ObjectDefineProperty = Object.defineProperty.bind(Object);
var Emitter = class {
	emitted = {
		afterExit: false,
		exit: false
	};
	listeners = {
		afterExit: [],
		exit: []
	};
	count = 0;
	id = Math.random();
	constructor() {
		if (global[kExitEmitter]) return global[kExitEmitter];
		ObjectDefineProperty(global, kExitEmitter, {
			value: this,
			writable: false,
			enumerable: false,
			configurable: false
		});
	}
	on(ev, fn) {
		this.listeners[ev].push(fn);
	}
	removeListener(ev, fn) {
		const list = this.listeners[ev];
		const i = list.indexOf(fn);
		/* c8 ignore start */
		if (i === -1) return;
		/* c8 ignore stop */
		if (i === 0 && list.length === 1) list.length = 0;
		else list.splice(i, 1);
	}
	emit(ev, code, signal) {
		if (this.emitted[ev]) return false;
		this.emitted[ev] = true;
		let ret = false;
		for (const fn of this.listeners[ev]) ret = fn(code, signal) === true || ret;
		if (ev === "exit") ret = this.emit("afterExit", code, signal) || ret;
		return ret;
	}
};
var SignalExitBase = class {};
var signalExitWrap = (handler) => {
	return {
		onExit(cb, opts) {
			return handler.onExit(cb, opts);
		},
		load() {
			return handler.load();
		},
		unload() {
			return handler.unload();
		}
	};
};
var SignalExitFallback = class extends SignalExitBase {
	onExit() {
		return () => {};
	}
	load() {}
	unload() {}
};
var SignalExit = class extends SignalExitBase {
	/* c8 ignore start */
	#hupSig = process$2.platform === "win32" ? "SIGINT" : "SIGHUP";
	/* c8 ignore stop */
	#emitter = new Emitter();
	#process;
	#originalProcessEmit;
	#originalProcessReallyExit;
	#sigListeners = {};
	#loaded = false;
	constructor(process) {
		super();
		this.#process = process;
		this.#sigListeners = {};
		for (const sig of signals) this.#sigListeners[sig] = () => {
			const listeners = this.#process.listeners(sig);
			let { count } = this.#emitter;
			/* c8 ignore start */
			const p = process;
			if (typeof p.__signal_exit_emitter__ === "object" && typeof p.__signal_exit_emitter__.count === "number") count += p.__signal_exit_emitter__.count;
			/* c8 ignore stop */
			if (listeners.length === count) {
				this.unload();
				const ret = this.#emitter.emit("exit", null, sig);
				/* c8 ignore start */
				const s = sig === "SIGHUP" ? this.#hupSig : sig;
				if (!ret) process.kill(process.pid, s);
			}
		};
		this.#originalProcessReallyExit = process.reallyExit;
		this.#originalProcessEmit = process.emit;
	}
	onExit(cb, opts) {
		/* c8 ignore start */
		if (!processOk(this.#process)) return () => {};
		/* c8 ignore stop */
		if (this.#loaded === false) this.load();
		const ev = opts?.alwaysLast ? "afterExit" : "exit";
		this.#emitter.on(ev, cb);
		return () => {
			this.#emitter.removeListener(ev, cb);
			if (this.#emitter.listeners["exit"].length === 0 && this.#emitter.listeners["afterExit"].length === 0) this.unload();
		};
	}
	load() {
		if (this.#loaded) return;
		this.#loaded = true;
		this.#emitter.count += 1;
		for (const sig of signals) try {
			const fn = this.#sigListeners[sig];
			if (fn) this.#process.on(sig, fn);
		} catch (_) {}
		this.#process.emit = (ev, ...a) => {
			return this.#processEmit(ev, ...a);
		};
		this.#process.reallyExit = (code) => {
			return this.#processReallyExit(code);
		};
	}
	unload() {
		if (!this.#loaded) return;
		this.#loaded = false;
		signals.forEach((sig) => {
			const listener = this.#sigListeners[sig];
			/* c8 ignore start */
			if (!listener) throw new Error("Listener not defined for signal: " + sig);
			/* c8 ignore stop */
			try {
				this.#process.removeListener(sig, listener);
			} catch (_) {}
			/* c8 ignore stop */
		});
		this.#process.emit = this.#originalProcessEmit;
		this.#process.reallyExit = this.#originalProcessReallyExit;
		this.#emitter.count -= 1;
	}
	#processReallyExit(code) {
		/* c8 ignore start */
		if (!processOk(this.#process)) return 0;
		this.#process.exitCode = code || 0;
		/* c8 ignore stop */
		this.#emitter.emit("exit", this.#process.exitCode, null);
		return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
	}
	#processEmit(ev, ...args) {
		const og = this.#originalProcessEmit;
		if (ev === "exit" && processOk(this.#process)) {
			if (typeof args[0] === "number") this.#process.exitCode = args[0];
			/* c8 ignore start */
			const ret = og.call(this.#process, ev, ...args);
			/* c8 ignore start */
			this.#emitter.emit("exit", this.#process.exitCode, null);
			/* c8 ignore stop */
			return ret;
		} else return og.call(this.#process, ev, ...args);
	}
};
var process$2 = globalThis.process;
var { onExit, load, unload } = signalExitWrap(processOk(process$2) ? new SignalExit(process$2) : new SignalExitFallback());
//#endregion
//#region node_modules/execa/lib/terminate/cleanup.js
var cleanupOnExit = (kill, { cleanup, detached }, { signal }) => {
	if (!cleanup || detached) return;
	const removeExitHandler = onExit(() => {
		kill();
	});
	addAbortListener(signal, () => {
		removeExitHandler();
	});
};
//#endregion
//#region node_modules/execa/lib/convert/concurrent.js
var initializeConcurrentStreams = () => ({
	readableDestroy: /* @__PURE__ */ new WeakMap(),
	writableFinal: /* @__PURE__ */ new WeakMap(),
	writableDestroy: /* @__PURE__ */ new WeakMap()
});
var addConcurrentStream = (concurrentStreams, stream, waitName) => {
	const weakMap = concurrentStreams[waitName];
	if (!weakMap.has(stream)) weakMap.set(stream, []);
	const promises = weakMap.get(stream);
	const promise = createDeferred();
	promises.push(promise);
	return {
		resolve: promise.resolve.bind(promise),
		promises
	};
};
var waitForConcurrentStreams = async ({ resolve, promises }, subprocess) => {
	resolve();
	const [isSubprocessExit] = await Promise.race([Promise.allSettled([true, subprocess]), Promise.all([false, ...promises])]);
	return !isSubprocessExit;
};
//#endregion
//#region node_modules/execa/lib/io/iterate.js
var iterateOnSubprocessStream = ({ subprocessStdout, subprocess, binary, shouldEncode, encoding, preserveNewlines }) => {
	const controller = new AbortController();
	stopReadingOnExit(subprocess, controller);
	return iterateOnStream({
		stream: subprocessStdout,
		controller,
		binary,
		shouldEncode: !subprocessStdout.readableObjectMode && shouldEncode,
		encoding,
		shouldSplit: !subprocessStdout.readableObjectMode,
		preserveNewlines
	});
};
var stopReadingOnExit = async (subprocess, controller) => {
	try {
		await subprocess;
	} catch {} finally {
		controller.abort();
	}
};
var iterateForResult = ({ stream, onStreamEnd, lines, encoding, stripFinalNewline, allMixed }) => {
	const controller = new AbortController();
	stopReadingOnStreamEnd(onStreamEnd, controller, stream);
	const objectMode = stream.readableObjectMode && !allMixed;
	return iterateOnStream({
		stream,
		controller,
		binary: encoding === "buffer",
		shouldEncode: !objectMode,
		encoding,
		shouldSplit: !objectMode && lines,
		preserveNewlines: !stripFinalNewline
	});
};
var stopReadingOnStreamEnd = async (onStreamEnd, controller, stream) => {
	try {
		await onStreamEnd;
	} catch {
		stream.destroy();
	} finally {
		controller.abort();
	}
};
var iterateOnStream = ({ stream, controller, binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) => {
	return iterateOnData({
		onStdoutChunk: on(stream, "data", {
			signal: controller.signal,
			highWaterMark: HIGH_WATER_MARK,
			highWatermark: HIGH_WATER_MARK
		}),
		controller,
		binary,
		shouldEncode,
		encoding,
		shouldSplit,
		preserveNewlines
	});
};
var DEFAULT_OBJECT_HIGH_WATER_MARK = getDefaultHighWaterMark(true);
var HIGH_WATER_MARK = DEFAULT_OBJECT_HIGH_WATER_MARK;
var iterateOnData = async function* ({ onStdoutChunk, controller, binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) {
	const generators = getGenerators({
		binary,
		shouldEncode,
		encoding,
		shouldSplit,
		preserveNewlines
	});
	try {
		for await (const [chunk] of onStdoutChunk) yield* transformChunkSync(chunk, generators, 0);
	} catch (error) {
		if (!controller.signal.aborted) throw error;
	} finally {
		yield* finalChunksSync(generators);
	}
};
var getGenerators = ({ binary, shouldEncode, encoding, shouldSplit, preserveNewlines }) => [getEncodingTransformGenerator(binary, encoding, !shouldEncode), getSplitLinesGenerator(binary, preserveNewlines, !shouldSplit, {})].filter(Boolean);
//#endregion
//#region node_modules/execa/lib/convert/iterable.js
var createIterable = (subprocess, encoding, { from, binary: binaryOption = false, preserveNewlines = false } = {}) => {
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const subprocessStdout = getFromStream(subprocess, from);
	return iterateOnStdoutData(iterateOnSubprocessStream({
		subprocessStdout,
		subprocess,
		binary,
		shouldEncode: true,
		encoding,
		preserveNewlines
	}), subprocessStdout, subprocess);
};
var iterateOnStdoutData = async function* (onStdoutData, subprocessStdout, subprocess) {
	try {
		yield* onStdoutData;
	} finally {
		if (subprocessStdout.readable) subprocessStdout.destroy();
		await subprocess;
	}
};
//#endregion
//#region node_modules/execa/lib/resolve/wait-stream.js
var waitForStream = async (stream, fdNumber, streamInfo, { isSameDirection, stopOnExit = false } = {}) => {
	const state = handleStdinDestroy(stream, streamInfo);
	const abortController = new AbortController();
	try {
		await Promise.race([...stopOnExit ? [streamInfo.exitPromise] : [], finished(stream, {
			cleanup: true,
			signal: abortController.signal
		})]);
	} catch (error) {
		if (!state.stdinCleanedUp) handleStreamError(error, fdNumber, streamInfo, isSameDirection);
	} finally {
		abortController.abort();
	}
};
var handleStdinDestroy = (stream, { originalStreams, subprocess }) => {
	const [originalStdin] = originalStreams;
	const state = { stdinCleanedUp: false };
	if (stream === originalStdin) spyOnStdinDestroy(stream, subprocess, state);
	return state;
};
var spyOnStdinDestroy = (subprocessStdin, subprocess, state) => {
	const { _destroy } = subprocessStdin;
	subprocessStdin._destroy = (...destroyArguments) => {
		setStdinCleanedUp(subprocess, state);
		_destroy.call(subprocessStdin, ...destroyArguments);
	};
};
var setStdinCleanedUp = ({ exitCode, signalCode }, state) => {
	if (exitCode !== null || signalCode !== null) state.stdinCleanedUp = true;
};
var handleStreamError = (error, fdNumber, streamInfo, isSameDirection) => {
	if (!shouldIgnoreStreamError(error, fdNumber, streamInfo, isSameDirection)) throw error;
};
var shouldIgnoreStreamError = (error, fdNumber, streamInfo, isSameDirection = true) => {
	if (streamInfo.propagating) return isStreamEpipe(error) || isStreamAbort(error);
	streamInfo.propagating = true;
	return isInputFileDescriptor(streamInfo, fdNumber) === isSameDirection ? isStreamEpipe(error) : isStreamAbort(error);
};
var isInputFileDescriptor = ({ fileDescriptors }, fdNumber) => fdNumber !== "all" && fileDescriptors[fdNumber].direction === "input";
var isStreamAbort = (error) => error?.code === "ERR_STREAM_PREMATURE_CLOSE";
var isStreamEpipe = (error) => error?.code === "EPIPE";
//#endregion
//#region node_modules/execa/lib/convert/shared.js
var safeWaitForSubprocessStdin = async (subprocessStdin) => {
	if (subprocessStdin === void 0) return;
	try {
		await waitForSubprocessStdin(subprocessStdin);
	} catch {}
};
var safeWaitForSubprocessStdout = async (subprocessStdout) => {
	if (subprocessStdout === void 0) return;
	try {
		await waitForSubprocessStdout(subprocessStdout);
	} catch {}
};
var waitForSubprocessStdin = async (subprocessStdin) => {
	await finished(subprocessStdin, {
		cleanup: true,
		readable: false,
		writable: true
	});
};
var waitForSubprocessStdout = async (subprocessStdout) => {
	await finished(subprocessStdout, {
		cleanup: true,
		readable: true,
		writable: false
	});
};
var waitForSubprocess = async (subprocess, error) => {
	await subprocess;
	if (error) throw error;
};
var destroyOtherStream = (stream, isOpen, error) => {
	if (error && !isStreamAbort(error)) stream.destroy(error);
	else if (isOpen) stream.destroy();
};
//#endregion
//#region node_modules/execa/lib/convert/readable.js
var createReadable = ({ subprocess, concurrentStreams, encoding }, { from, binary: binaryOption = true, preserveNewlines = true } = {}) => {
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const { subprocessStdout, waitReadableDestroy } = getSubprocessStdout(subprocess, from, concurrentStreams);
	const { readableEncoding, readableObjectMode, readableHighWaterMark } = getReadableOptions(subprocessStdout, binary);
	const { read, onStdoutDataDone } = getReadableMethods({
		subprocessStdout,
		subprocess,
		binary,
		encoding,
		preserveNewlines
	});
	const readable = new Readable({
		read,
		destroy: callbackify(onReadableDestroy.bind(void 0, {
			subprocessStdout,
			subprocess,
			waitReadableDestroy
		})),
		highWaterMark: readableHighWaterMark,
		objectMode: readableObjectMode,
		encoding: readableEncoding
	});
	onStdoutFinished({
		subprocessStdout,
		onStdoutDataDone,
		readable,
		subprocess
	});
	return readable;
};
var getSubprocessStdout = (subprocess, from, concurrentStreams) => {
	const subprocessStdout = getFromStream(subprocess, from);
	return {
		subprocessStdout,
		waitReadableDestroy: addConcurrentStream(concurrentStreams, subprocessStdout, "readableDestroy")
	};
};
var getReadableOptions = ({ readableEncoding, readableObjectMode, readableHighWaterMark }, binary) => binary ? {
	readableEncoding,
	readableObjectMode,
	readableHighWaterMark
} : {
	readableEncoding,
	readableObjectMode: true,
	readableHighWaterMark: DEFAULT_OBJECT_HIGH_WATER_MARK
};
var getReadableMethods = ({ subprocessStdout, subprocess, binary, encoding, preserveNewlines }) => {
	const onStdoutDataDone = createDeferred();
	const onStdoutData = iterateOnSubprocessStream({
		subprocessStdout,
		subprocess,
		binary,
		shouldEncode: !binary,
		encoding,
		preserveNewlines
	});
	return {
		read() {
			onRead(this, onStdoutData, onStdoutDataDone);
		},
		onStdoutDataDone
	};
};
var onRead = async (readable, onStdoutData, onStdoutDataDone) => {
	try {
		const { value, done } = await onStdoutData.next();
		if (done) onStdoutDataDone.resolve();
		else readable.push(value);
	} catch {}
};
var onStdoutFinished = async ({ subprocessStdout, onStdoutDataDone, readable, subprocess, subprocessStdin }) => {
	try {
		await waitForSubprocessStdout(subprocessStdout);
		await subprocess;
		await safeWaitForSubprocessStdin(subprocessStdin);
		await onStdoutDataDone;
		if (readable.readable) readable.push(null);
	} catch (error) {
		await safeWaitForSubprocessStdin(subprocessStdin);
		destroyOtherReadable(readable, await getPrematureCloseError(subprocess, error));
	}
};
var getPrematureCloseError = async (subprocess, error) => {
	if (error.code !== "ERR_STREAM_PREMATURE_CLOSE") return error;
	try {
		await subprocess;
	} catch (subprocessError) {
		return subprocessError;
	}
	return error;
};
var onReadableDestroy = async ({ subprocessStdout, subprocess, waitReadableDestroy }, error) => {
	if (!await waitForConcurrentStreams(waitReadableDestroy, subprocess)) return;
	destroyOtherReadable(subprocessStdout, error);
	await waitForSubprocess(subprocess, error);
};
var destroyOtherReadable = (stream, error) => {
	destroyOtherStream(stream, stream.readable, error);
};
//#endregion
//#region node_modules/execa/lib/convert/web.js
var createReadableStream = (subprocess, readableOptions) => Readable.toWeb(subprocess.readable(readableOptions));
var createWritableStream = (subprocess, writableOptions) => Writable.toWeb(subprocess.writable(writableOptions));
var createTransformStream = (subprocess, duplexOptions) => Duplex.toWeb(subprocess.duplex(duplexOptions));
//#endregion
//#region node_modules/execa/lib/pipe/pipe-arguments.js
var normalizePipeArguments = ({ source, sourcePromise, boundOptions, createNested }, ...pipeArguments) => {
	const startTime = getStartTime();
	const { destination, destinationStream, destinationError, from, unpipeSignal } = getDestinationStream(boundOptions, createNested, pipeArguments);
	const { sourceStream, sourceError } = getSourceStream(source, from);
	const { options: sourceOptions, fileDescriptors } = SUBPROCESS_OPTIONS.get(source);
	return {
		sourcePromise,
		sourceStream,
		sourceOptions,
		sourceError,
		destination,
		destinationStream,
		destinationError,
		unpipeSignal,
		fileDescriptors,
		startTime
	};
};
var getDestinationStream = (boundOptions, createNested, pipeArguments) => {
	try {
		const { destination, pipeOptions: { from, to, unpipeSignal } = {} } = getDestination(boundOptions, createNested, ...pipeArguments);
		return {
			destination,
			destinationStream: getToStream(destination, to),
			from,
			unpipeSignal
		};
	} catch (error) {
		return { destinationError: error };
	}
};
var getDestination = (boundOptions, createNested, firstArgument, ...pipeArguments) => {
	if (Array.isArray(firstArgument)) return {
		destination: createNested(mapDestinationArguments, boundOptions)(firstArgument, ...pipeArguments),
		pipeOptions: boundOptions
	};
	if (typeof firstArgument === "string" || firstArgument instanceof URL || isDenoExecPath(firstArgument)) {
		if (Object.keys(boundOptions).length > 0) throw new TypeError("Please use .pipe(\"file\", ..., options) or .pipe(execa(\"file\", ..., options)) instead of .pipe(options)(\"file\", ...).");
		const [rawFile, rawArguments, rawOptions] = normalizeParameters(firstArgument, ...pipeArguments);
		return {
			destination: createNested(mapDestinationArguments)(rawFile, rawArguments, rawOptions),
			pipeOptions: rawOptions
		};
	}
	if (SUBPROCESS_OPTIONS.has(firstArgument)) {
		if (Object.keys(boundOptions).length > 0) throw new TypeError("Please use .pipe(options)`command` or .pipe($(options)`command`) instead of .pipe(options)($`command`).");
		return {
			destination: firstArgument,
			pipeOptions: pipeArguments[0]
		};
	}
	throw new TypeError(`The first argument must be a template string, an options object, or an Execa subprocess: ${firstArgument}`);
};
var mapDestinationArguments = ({ options }) => ({ options: {
	...options,
	stdin: "pipe",
	piped: true
} });
var getSourceStream = (source, from) => {
	try {
		return { sourceStream: getFromStream(source, from) };
	} catch (error) {
		return { sourceError: error };
	}
};
//#endregion
//#region node_modules/execa/lib/pipe/throw.js
var handlePipeArgumentsError = ({ sourceStream, sourceError, destinationStream, destinationError, fileDescriptors, sourceOptions, startTime }) => {
	const error = getPipeArgumentsError({
		sourceStream,
		sourceError,
		destinationStream,
		destinationError
	});
	if (error !== void 0) throw createNonCommandError({
		error,
		fileDescriptors,
		sourceOptions,
		startTime
	});
};
var getPipeArgumentsError = ({ sourceStream, sourceError, destinationStream, destinationError }) => {
	if (sourceError !== void 0 && destinationError !== void 0) return destinationError;
	if (destinationError !== void 0) {
		abortSourceStream(sourceStream);
		return destinationError;
	}
	if (sourceError !== void 0) {
		endDestinationStream(destinationStream);
		return sourceError;
	}
};
var createNonCommandError = ({ error, fileDescriptors, sourceOptions, startTime }) => makeEarlyError({
	error,
	command: PIPE_COMMAND_MESSAGE,
	escapedCommand: PIPE_COMMAND_MESSAGE,
	fileDescriptors,
	options: sourceOptions,
	startTime,
	isSync: false
});
var PIPE_COMMAND_MESSAGE = "source.pipe(destination)";
//#endregion
//#region node_modules/execa/lib/pipe/sequence.js
var waitForBothSubprocesses = async (subprocessPromises) => {
	const [{ status: sourceStatus, reason: sourceReason, value: sourceResult = sourceReason }, { status: destinationStatus, reason: destinationReason, value: destinationResult = destinationReason }] = await subprocessPromises;
	if (!destinationResult.pipedFrom.includes(sourceResult)) destinationResult.pipedFrom.push(sourceResult);
	if (destinationStatus === "rejected") throw destinationResult;
	if (sourceStatus === "rejected") throw sourceResult;
	return destinationResult;
};
//#endregion
//#region node_modules/execa/lib/pipe/streaming.js
var pipeSubprocessStream = (sourceStream, destinationStream, maxListenersController) => {
	const mergedStream = MERGED_STREAMS.has(destinationStream) ? pipeMoreSubprocessStream(sourceStream, destinationStream) : pipeFirstSubprocessStream(sourceStream, destinationStream);
	incrementMaxListeners(sourceStream, SOURCE_LISTENERS_PER_PIPE, maxListenersController.signal);
	incrementMaxListeners(destinationStream, DESTINATION_LISTENERS_PER_PIPE, maxListenersController.signal);
	cleanupMergedStreamsMap(destinationStream);
	return mergedStream;
};
var pipeFirstSubprocessStream = (sourceStream, destinationStream) => {
	const mergedStream = mergeStreams([sourceStream]);
	pipeStreams(mergedStream, destinationStream);
	MERGED_STREAMS.set(destinationStream, mergedStream);
	return mergedStream;
};
var pipeMoreSubprocessStream = (sourceStream, destinationStream) => {
	const mergedStream = MERGED_STREAMS.get(destinationStream);
	mergedStream.add(sourceStream);
	return mergedStream;
};
var cleanupMergedStreamsMap = async (destinationStream) => {
	try {
		await finished(destinationStream, {
			cleanup: true,
			readable: false,
			writable: true
		});
	} catch {}
	MERGED_STREAMS.delete(destinationStream);
};
var MERGED_STREAMS = /* @__PURE__ */ new WeakMap();
var SOURCE_LISTENERS_PER_PIPE = 2;
var DESTINATION_LISTENERS_PER_PIPE = 1;
//#endregion
//#region node_modules/execa/lib/pipe/abort.js
var unpipeOnAbort = (unpipeSignal, unpipeContext) => unpipeSignal === void 0 ? [] : [unpipeOnSignalAbort(unpipeSignal, unpipeContext)];
var unpipeOnSignalAbort = async (unpipeSignal, { sourceStream, mergedStream, fileDescriptors, sourceOptions, startTime }) => {
	await aborted(unpipeSignal, sourceStream);
	await mergedStream.remove(sourceStream);
	throw createNonCommandError({
		error: /* @__PURE__ */ new Error("Pipe canceled by `unpipeSignal` option."),
		fileDescriptors,
		sourceOptions,
		startTime
	});
};
//#endregion
//#region node_modules/execa/lib/pipe/setup.js
var pipeToSubprocess = (sourceInfo, ...pipeArguments) => {
	if (isPlainObject(pipeArguments[0])) return pipeToSubprocess.bind(void 0, {
		...sourceInfo,
		boundOptions: {
			...sourceInfo.boundOptions,
			...pipeArguments[0]
		}
	});
	const { destination, ...normalizedInfo } = normalizePipeArguments(sourceInfo, ...pipeArguments);
	const pipeFailureController = new AbortController();
	const promise = handlePipePromise({
		...normalizedInfo,
		destination,
		pipeFailureController
	});
	promise.pipe = pipeToSubprocess.bind(void 0, {
		...sourceInfo,
		source: destination,
		sourcePromise: promise,
		boundOptions: {}
	});
	forwardDestinationMethods(promise, destination, pipeFailureController.signal);
	return promise;
};
var forwardDestinationMethods = (promise, destination, pipeFailureSignal) => {
	if (destination === void 0) return;
	forwardReadableMethods(promise, destination);
	forwardIpcMethods(promise, destination, pipeFailureSignal);
};
var forwardReadableMethods = (promise, destination) => {
	const subprocessOptions = SUBPROCESS_OPTIONS.get(destination);
	SUBPROCESS_OPTIONS.set(promise, subprocessOptions);
	promise.stdio = destination.stdio;
	promise.all = destination.all;
	const { options: { encoding } } = subprocessOptions;
	const concurrentStreams = initializeConcurrentStreams();
	promise[Symbol.asyncIterator] = createIterable.bind(void 0, promise, encoding, {});
	promise.iterable = createIterable.bind(void 0, promise, encoding);
	promise.readable = createPipeReadable.bind(void 0, promise, {
		subprocess: promise,
		concurrentStreams,
		encoding
	});
	promise.readableStream = createReadableStream.bind(void 0, promise);
	forwardAll(promise, destination);
};
var forwardAll = (promise, destination) => {
	if (destination.all === void 0) {
		promise.all = void 0;
		return;
	}
	Object.defineProperty(promise, "all", {
		get() {
			setAllProperty(promise, destination.all);
			const all = promise.readable({ from: "all" });
			setAllProperty(promise, all);
			return all;
		},
		enumerable: true,
		configurable: true
	});
};
var setAllProperty = (promise, value) => {
	Object.defineProperty(promise, "all", {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
};
var createPipeReadable = (promise, readableOptions, ...arguments_) => {
	const readable = createReadable(readableOptions, ...arguments_);
	destroyOnPipeFailure(promise, readable);
	return readable;
};
var destroyOnPipeFailure = async (promise, readable) => {
	try {
		await promise;
	} catch (error) {
		readable.destroy(error);
	}
};
var forwardIpcMethods = (promise, destination, pipeFailureSignal) => {
	promise.sendMessage = destination.sendMessage;
	promise.getOneMessage = getOnePipeMessage.bind(void 0, destination, pipeFailureSignal);
	promise.getEachMessage = getEachPipeMessage.bind(void 0, promise, destination, pipeFailureSignal);
};
var getOnePipeMessage = (destination, pipeFailureSignal, ...arguments_) => {
	const controller = new AbortController();
	return waitForOnePipeMessage(pipeFailureSignal, destination.getOneMessage(...addPipeOptions(arguments_, controller.signal, internalGetOneMessageOptions)), controller);
};
var waitForOnePipeMessage = async (pipeFailureSignal, messagePromise, controller) => {
	try {
		return await Promise.race([messagePromise, getSignalRejection(pipeFailureSignal, controller.signal)]);
	} finally {
		controller.abort();
	}
};
var getSignalRejection = (signal, listenerSignal) => new Promise((_, reject) => {
	if (signal.aborted) {
		reject(signal.reason);
		return;
	}
	signal.addEventListener("abort", () => {
		reject(signal.reason);
	}, {
		once: true,
		signal: listenerSignal
	});
});
var getEachPipeMessage = (promise, destination, pipeFailureSignal, ...arguments_) => {
	const controller = new AbortController();
	const iterator = destination.getEachMessage(...addPipeOptions(arguments_, controller.signal, internalGetEachMessageOptions));
	abortOnSignal(pipeFailureSignal, controller);
	return iterateOnPipeMessages(promise, iterator, controller);
};
var iterateOnPipeMessages = async function* (promise, iterator, controller) {
	try {
		yield* iterator;
	} finally {
		controller.abort();
		await promise;
	}
};
var addPipeOptions = (arguments_, signal, internalOptionsSymbol) => {
	if (arguments_[0] === null) return arguments_;
	const [options] = arguments_;
	return [{
		...options,
		[internalOptionsSymbol]: {
			signal,
			shouldAwait: false
		}
	}];
};
var abortOnSignal = (signal, controller) => {
	if (signal.aborted) {
		controller.abort();
		return;
	}
	signal.addEventListener("abort", () => {
		controller.abort();
	}, {
		once: true,
		signal: controller.signal
	});
};
var handlePipePromise = async ({ sourcePromise, sourceStream, sourceOptions, sourceError, destination, destinationStream, destinationError, unpipeSignal, fileDescriptors, startTime, pipeFailureController }) => {
	const maxListenersController = new AbortController();
	try {
		const subprocessPromises = getSubprocessPromises(sourcePromise, destination);
		handlePipeArgumentsError({
			sourceStream,
			sourceError,
			destinationStream,
			destinationError,
			fileDescriptors,
			sourceOptions,
			startTime
		});
		const mergedStream = pipeSubprocessStream(sourceStream, destinationStream, maxListenersController);
		return await Promise.race([waitForBothSubprocesses(subprocessPromises), ...unpipeOnAbort(unpipeSignal, {
			sourceStream,
			mergedStream,
			sourceOptions,
			fileDescriptors,
			startTime
		})]);
	} catch (error) {
		pipeFailureController.abort(error);
		throw error;
	} finally {
		maxListenersController.abort();
	}
};
var getSubprocessPromises = (sourcePromise, destination) => Promise.allSettled([sourcePromise, destination]);
//#endregion
//#region node_modules/execa/lib/io/contents.js
var getStreamOutput = async ({ stream, onStreamEnd, fdNumber, encoding, buffer, maxBuffer, lines, allMixed, stripFinalNewline, verboseInfo, streamInfo }) => {
	const logPromise = logOutputAsync({
		stream,
		onStreamEnd,
		fdNumber,
		encoding,
		allMixed,
		verboseInfo,
		streamInfo
	});
	if (!buffer) {
		await Promise.all([resumeStream(stream), logPromise]);
		return;
	}
	const iterable = iterateForResult({
		stream,
		onStreamEnd,
		lines,
		encoding,
		stripFinalNewline: getStripFinalNewline(stripFinalNewline, fdNumber),
		allMixed
	});
	const [output] = await Promise.all([getStreamContents({
		stream,
		iterable,
		fdNumber,
		encoding,
		maxBuffer,
		lines
	}), logPromise]);
	return output;
};
var logOutputAsync = async ({ stream, onStreamEnd, fdNumber, encoding, allMixed, verboseInfo, streamInfo: { fileDescriptors } }) => {
	if (!shouldLogOutput({
		stdioItems: fileDescriptors[fdNumber]?.stdioItems,
		encoding,
		verboseInfo,
		fdNumber
	})) return;
	await logLines(iterateForResult({
		stream,
		onStreamEnd,
		lines: true,
		encoding,
		stripFinalNewline: true,
		allMixed
	}), stream, fdNumber, verboseInfo);
};
var resumeStream = async (stream) => {
	await setImmediate$1();
	if (stream.readableFlowing === null) stream.resume();
};
var getStreamContents = async ({ stream, stream: { readableObjectMode }, iterable, fdNumber, encoding, maxBuffer, lines }) => {
	try {
		if (readableObjectMode || lines) return await getStreamAsArray(iterable, { maxBuffer });
		if (encoding === "buffer") return new Uint8Array(await getStreamAsArrayBuffer(iterable, { maxBuffer }));
		return await getStreamAsString(iterable, { maxBuffer });
	} catch (error) {
		return handleBufferedData(handleMaxBuffer({
			error,
			stream,
			readableObjectMode,
			lines,
			encoding,
			fdNumber
		}));
	}
};
var getBufferedData = async (streamPromise) => {
	try {
		return await streamPromise;
	} catch (error) {
		return handleBufferedData(error);
	}
};
var handleBufferedData = ({ bufferedData }) => isArrayBuffer(bufferedData) ? new Uint8Array(bufferedData) : bufferedData;
//#endregion
//#region node_modules/execa/lib/resolve/stdio.js
var waitForStdioStreams = ({ subprocess, encoding, buffer, maxBuffer, lines, stripFinalNewline, verboseInfo, streamInfo }) => subprocess.stdio.map((stream, fdNumber) => waitForSubprocessStream({
	stream,
	fdNumber,
	encoding,
	buffer: buffer[fdNumber],
	maxBuffer: maxBuffer[fdNumber],
	lines: lines[fdNumber],
	allMixed: false,
	stripFinalNewline,
	verboseInfo,
	streamInfo
}));
var waitForSubprocessStream = async ({ stream, fdNumber, encoding, buffer, maxBuffer, lines, allMixed, stripFinalNewline, verboseInfo, streamInfo }) => {
	if (!stream) return;
	const onStreamEnd = waitForStream(stream, fdNumber, streamInfo);
	if (isInputFileDescriptor(streamInfo, fdNumber)) {
		await onStreamEnd;
		return;
	}
	const [output] = await Promise.all([getStreamOutput({
		stream,
		onStreamEnd,
		fdNumber,
		encoding,
		buffer,
		maxBuffer,
		lines,
		allMixed,
		stripFinalNewline,
		verboseInfo,
		streamInfo
	}), onStreamEnd]);
	return output;
};
//#endregion
//#region node_modules/execa/lib/resolve/all-async.js
var makeAllStream = ({ stdout, stderr }, { all }) => all && (stdout || stderr) ? mergeStreams([stdout, stderr].filter(Boolean)) : void 0;
var waitForAllStream = ({ subprocess, all, encoding, buffer, maxBuffer, lines, stripFinalNewline, verboseInfo, streamInfo }) => waitForSubprocessStream({
	...getAllStream(subprocess, all, buffer),
	fdNumber: "all",
	encoding,
	maxBuffer: maxBuffer[1] + maxBuffer[2],
	lines: lines[1] || lines[2],
	allMixed: getAllMixed(subprocess, all),
	stripFinalNewline,
	verboseInfo,
	streamInfo
});
var getAllStream = ({ stdout, stderr }, all, [, bufferStdout, bufferStderr]) => {
	const buffer = bufferStdout || bufferStderr;
	if (!buffer) return {
		stream: all,
		buffer
	};
	if (!bufferStdout) return {
		stream: stderr,
		buffer
	};
	if (!bufferStderr) return {
		stream: stdout,
		buffer
	};
	return {
		stream: all,
		buffer
	};
};
var getAllMixed = ({ stdout, stderr }, all) => all && stdout && stderr && stdout.readableObjectMode !== stderr.readableObjectMode;
//#endregion
//#region node_modules/execa/lib/verbose/ipc.js
var shouldLogIpc = (verboseInfo) => isFullVerbose(verboseInfo, "ipc");
var logIpcOutput = (message, verboseInfo) => {
	verboseLog({
		type: "ipc",
		verboseMessage: serializeVerboseMessage(message),
		fdNumber: "ipc",
		verboseInfo
	});
};
//#endregion
//#region node_modules/execa/lib/ipc/buffer-messages.js
var waitForIpcOutput = async ({ subprocess, buffer: bufferArray, maxBuffer: maxBufferArray, ipc, ipcOutput, verboseInfo }) => {
	if (!ipc) return ipcOutput;
	const isVerbose = shouldLogIpc(verboseInfo);
	const buffer = getFdSpecificValue(bufferArray, "ipc");
	const maxBuffer = getFdSpecificValue(maxBufferArray, "ipc");
	for await (const message of loopOnMessages({
		anyProcess: subprocess,
		channel: subprocess.channel,
		isSubprocess: false,
		ipc,
		shouldAwait: false,
		reference: true
	})) {
		if (buffer) {
			checkIpcMaxBuffer(subprocess, ipcOutput, maxBuffer);
			ipcOutput.push(message);
		}
		if (isVerbose) logIpcOutput(message, verboseInfo);
	}
	return ipcOutput;
};
var getBufferedIpcOutput = async (ipcOutputPromise, ipcOutput) => {
	await Promise.allSettled([ipcOutputPromise]);
	return ipcOutput;
};
//#endregion
//#region node_modules/execa/lib/resolve/wait-subprocess.js
var waitForSubprocessResult = async ({ subprocess, kill, all, options: { encoding, buffer, maxBuffer, lines, timeoutDuration: timeout, cancelSignal, gracefulCancel, forceKillAfterDelay, stripFinalNewline, ipc, ipcInput }, context, verboseInfo, fileDescriptors, originalStreams, onInternalError, controller }) => {
	const exitPromise = waitForExit(subprocess, context);
	const streamInfo = {
		originalStreams,
		fileDescriptors,
		subprocess,
		exitPromise,
		propagating: false
	};
	const stdioPromises = waitForStdioStreams({
		subprocess,
		encoding,
		buffer,
		maxBuffer,
		lines,
		stripFinalNewline,
		verboseInfo,
		streamInfo
	});
	const allPromise = waitForAllStream({
		subprocess,
		all,
		encoding,
		buffer,
		maxBuffer,
		lines,
		stripFinalNewline,
		verboseInfo,
		streamInfo
	});
	const ipcOutput = [];
	const ipcOutputPromise = waitForIpcOutput({
		subprocess,
		buffer,
		maxBuffer,
		ipc,
		ipcOutput,
		verboseInfo
	});
	const originalPromises = waitForOriginalStreams(originalStreams, subprocess, streamInfo);
	const customStreamsEndPromises = waitForCustomStreamsEnd(fileDescriptors, streamInfo);
	try {
		return await Promise.race([
			Promise.all([
				{},
				waitForSuccessfulExit(exitPromise),
				Promise.all(stdioPromises),
				allPromise,
				ipcOutputPromise,
				sendIpcInput(subprocess, ipcInput, ipc),
				...originalPromises,
				...customStreamsEndPromises
			]),
			onInternalError,
			throwOnSubprocessError(subprocess, controller),
			...throwOnTimeout(kill, timeout, context, controller),
			...throwOnCancel({
				kill,
				cancelSignal,
				gracefulCancel,
				context,
				controller
			}),
			...throwOnGracefulCancel({
				subprocess,
				kill,
				cancelSignal,
				gracefulCancel,
				forceKillAfterDelay,
				context,
				controller
			})
		]);
	} catch (error) {
		context.terminationReason ??= "other";
		return Promise.all([
			{ error },
			exitPromise,
			Promise.all(stdioPromises.map((stdioPromise) => getBufferedData(stdioPromise))),
			getBufferedData(allPromise),
			getBufferedIpcOutput(ipcOutputPromise, ipcOutput),
			Promise.allSettled(originalPromises),
			Promise.allSettled(customStreamsEndPromises)
		]);
	}
};
var waitForOriginalStreams = (originalStreams, subprocess, streamInfo) => originalStreams.map((stream, fdNumber) => stream === subprocess.stdio[fdNumber] ? void 0 : waitForStream(stream, fdNumber, streamInfo));
var waitForCustomStreamsEnd = (fileDescriptors, streamInfo) => fileDescriptors.flatMap(({ stdioItems }, fdNumber) => stdioItems.filter(({ value, stream = value }) => isStream(stream, { checkOpen: false }) && !isStandardStream(stream)).map(({ type, value, stream = value }) => waitForStream(stream, fdNumber, streamInfo, {
	isSameDirection: TRANSFORM_TYPES.has(type),
	stopOnExit: type === "native"
})));
var throwOnSubprocessError = async (subprocess, { signal }) => {
	const [error] = await once(subprocess, "error", { signal });
	throw error;
};
//#endregion
//#region node_modules/execa/lib/convert/writable.js
var createWritable = ({ subprocess, concurrentStreams }, { to } = {}) => {
	const { subprocessStdin, waitWritableFinal, waitWritableDestroy } = getSubprocessStdin(subprocess, to, concurrentStreams);
	const writable = new Writable({
		...getWritableMethods(subprocessStdin, subprocess, waitWritableFinal),
		destroy: callbackify(onWritableDestroy.bind(void 0, {
			subprocessStdin,
			subprocess,
			waitWritableFinal,
			waitWritableDestroy
		})),
		highWaterMark: subprocessStdin.writableHighWaterMark,
		objectMode: subprocessStdin.writableObjectMode
	});
	onStdinFinished(subprocessStdin, writable, void 0, subprocess);
	return writable;
};
var getSubprocessStdin = (subprocess, to, concurrentStreams) => {
	const subprocessStdin = getToStream(subprocess, to);
	return {
		subprocessStdin,
		waitWritableFinal: addConcurrentStream(concurrentStreams, subprocessStdin, "writableFinal"),
		waitWritableDestroy: addConcurrentStream(concurrentStreams, subprocessStdin, "writableDestroy")
	};
};
var getWritableMethods = (subprocessStdin, subprocess, waitWritableFinal) => ({
	write: onWrite.bind(void 0, subprocessStdin),
	final: callbackify(onWritableFinal.bind(void 0, subprocessStdin, subprocess, waitWritableFinal))
});
var onWrite = (subprocessStdin, chunk, encoding, done) => {
	if (subprocessStdin.write(chunk, encoding)) done();
	else subprocessStdin.once("drain", done);
};
var onWritableFinal = async (subprocessStdin, subprocess, waitWritableFinal) => {
	if (!await waitForConcurrentStreams(waitWritableFinal, subprocess)) return;
	if (subprocessStdin.writable) subprocessStdin.end();
	await subprocess;
};
var onStdinFinished = async (subprocessStdin, writable, subprocessStdout, subprocess) => {
	try {
		await waitForSubprocessStdin(subprocessStdin);
		await subprocess;
		if (writable.writable) writable.end();
	} catch (error) {
		await safeWaitForSubprocessStdout(subprocessStdout);
		destroyOtherWritable(writable, await getSubprocessError(subprocess, error));
	}
};
var getSubprocessError = async (subprocess, error) => {
	if (!shouldUseSubprocessError(error)) return error;
	try {
		await subprocess;
	} catch (subprocessError) {
		return subprocessError;
	}
	return error;
};
var shouldUseSubprocessError = (error) => error === void 0 || isStreamAbort(error);
var onWritableDestroy = async ({ subprocessStdin, subprocess, waitWritableFinal, waitWritableDestroy }, error) => {
	await waitForConcurrentStreams(waitWritableFinal, subprocess);
	if (await waitForConcurrentStreams(waitWritableDestroy, subprocess)) {
		destroyOtherWritable(subprocessStdin, error);
		await waitForSubprocess(subprocess, error);
	}
};
var destroyOtherWritable = (stream, error) => {
	destroyOtherStream(stream, stream.writable, error);
};
//#endregion
//#region node_modules/execa/lib/convert/duplex.js
var createDuplex = ({ subprocess, concurrentStreams, encoding }, { from, to, binary: binaryOption = true, preserveNewlines = true } = {}) => {
	const binary = binaryOption || BINARY_ENCODINGS.has(encoding);
	const { subprocessStdout, waitReadableDestroy } = getSubprocessStdout(subprocess, from, concurrentStreams);
	const { subprocessStdin, waitWritableFinal, waitWritableDestroy } = getSubprocessStdin(subprocess, to, concurrentStreams);
	const { readableEncoding, readableObjectMode, readableHighWaterMark } = getReadableOptions(subprocessStdout, binary);
	const { read, onStdoutDataDone } = getReadableMethods({
		subprocessStdout,
		subprocess,
		binary,
		encoding,
		preserveNewlines
	});
	const duplex = new Duplex({
		read,
		...getWritableMethods(subprocessStdin, subprocess, waitWritableFinal),
		destroy: callbackify(onDuplexDestroy.bind(void 0, {
			subprocessStdout,
			subprocessStdin,
			subprocess,
			waitReadableDestroy,
			waitWritableFinal,
			waitWritableDestroy
		})),
		readableHighWaterMark,
		writableHighWaterMark: subprocessStdin.writableHighWaterMark,
		readableObjectMode,
		writableObjectMode: subprocessStdin.writableObjectMode,
		encoding: readableEncoding
	});
	onStdoutFinished({
		subprocessStdout,
		onStdoutDataDone,
		readable: duplex,
		subprocess,
		subprocessStdin
	});
	onStdinFinished(subprocessStdin, duplex, subprocessStdout, subprocess);
	return duplex;
};
var onDuplexDestroy = async ({ subprocessStdout, subprocessStdin, subprocess, waitReadableDestroy, waitWritableFinal, waitWritableDestroy }, error) => {
	await Promise.all([onReadableDestroy({
		subprocessStdout,
		subprocess,
		waitReadableDestroy
	}, error), onWritableDestroy({
		subprocessStdin,
		subprocess,
		waitWritableFinal,
		waitWritableDestroy
	}, error)]);
};
//#endregion
//#region node_modules/execa/lib/convert/add.js
var addConvertedStreams = (subprocess, { encoding }) => {
	const concurrentStreams = initializeConcurrentStreams();
	subprocess.readable = createReadable.bind(void 0, {
		subprocess,
		concurrentStreams,
		encoding
	});
	subprocess.writable = createWritable.bind(void 0, {
		subprocess,
		concurrentStreams
	});
	subprocess.duplex = createDuplex.bind(void 0, {
		subprocess,
		concurrentStreams,
		encoding
	});
	subprocess.readableStream = createReadableStream.bind(void 0, subprocess);
	subprocess.writableStream = createWritableStream.bind(void 0, subprocess);
	subprocess.transformStream = createTransformStream.bind(void 0, subprocess);
	subprocess.iterable = createIterable.bind(void 0, subprocess, encoding);
	subprocess[Symbol.asyncIterator] = createIterable.bind(void 0, subprocess, encoding, {});
};
//#endregion
//#region node_modules/execa/lib/methods/promise.js
var mergePromise = (promise, properties) => Object.assign(promise, properties);
//#endregion
//#region node_modules/execa/lib/methods/main-async.js
var execaCoreAsync = (rawFile, rawArguments, rawOptions, createNested) => {
	const { file, commandArguments, command, escapedCommand, startTime, verboseInfo, options, fileDescriptors } = handleAsyncArguments(rawFile, rawArguments, rawOptions);
	const { subprocess: nodeChildProcess, promise, kill, all, convertedStreams } = spawnSubprocessAsync({
		file,
		commandArguments,
		options,
		startTime,
		verboseInfo,
		command,
		escapedCommand,
		fileDescriptors
	});
	const subprocess = getSubprocessPromise({
		promise,
		nodeChildProcess,
		kill,
		all,
		convertedStreams,
		options
	});
	subprocess.pipe = pipeToSubprocess.bind(void 0, {
		source: subprocess,
		sourcePromise: promise,
		boundOptions: {},
		createNested
	});
	SUBPROCESS_OPTIONS.set(subprocess, {
		options,
		fileDescriptors
	});
	return subprocess;
};
var handleAsyncArguments = (rawFile, rawArguments, rawOptions) => {
	const { command, escapedCommand, startTime, verboseInfo } = handleCommand(rawFile, rawArguments, rawOptions);
	const { file, commandArguments, options: normalizedOptions } = normalizeOptions(rawFile, rawArguments, rawOptions);
	const options = handleAsyncOptions(normalizedOptions);
	return {
		file,
		commandArguments,
		command,
		escapedCommand,
		startTime,
		verboseInfo,
		options,
		fileDescriptors: handleStdioAsync(options, verboseInfo)
	};
};
var handleAsyncOptions = ({ timeout, signal, ...options }) => {
	if (signal !== void 0) throw new TypeError("The \"signal\" option has been renamed to \"cancelSignal\" instead.");
	return {
		...options,
		timeoutDuration: timeout
	};
};
var spawnSubprocessAsync = ({ file, commandArguments, options, startTime, verboseInfo, command, escapedCommand, fileDescriptors }) => {
	let subprocess;
	try {
		subprocess = spawn$1(...concatenateShell(file, commandArguments, getSpawnOptions(options)));
	} catch (error) {
		return handleEarlyError({
			error,
			command,
			escapedCommand,
			fileDescriptors,
			options,
			startTime,
			verboseInfo
		});
	}
	const controller = new AbortController();
	setMaxListeners(Infinity, controller.signal);
	const originalStreams = [...subprocess.stdio];
	pipeOutputAsync(subprocess, fileDescriptors, controller);
	setIpcSubprocessOptions(subprocess, options);
	const context = {};
	const onInternalError = createDeferred();
	const kill = subprocessKill.bind(void 0, {
		kill: getKillFunction(subprocess, options),
		options,
		onInternalError,
		context,
		controller
	});
	cleanupOnExit(kill, options, controller);
	const all = makeAllStream(subprocess, options);
	const promise = handlePromise({
		subprocess,
		kill,
		all,
		options,
		startTime,
		verboseInfo,
		fileDescriptors,
		originalStreams,
		command,
		escapedCommand,
		context,
		onInternalError,
		controller
	});
	return {
		subprocess,
		promise,
		kill,
		all
	};
};
var getSubprocessPromise = ({ promise, nodeChildProcess, kill, all, convertedStreams, options }) => {
	const subprocess = mergePromise(promise, getSubprocessProperties(nodeChildProcess, all));
	subprocess.kill = kill ?? subprocess.kill;
	if (convertedStreams === void 0) addConvertedStreams(subprocess, options);
	else Object.assign(subprocess, convertedStreams);
	addIpcMethods(subprocess, nodeChildProcess, options);
	return subprocess;
};
var getSubprocessProperties = (nodeChildProcess, all) => ({
	nodeChildProcess,
	pid: nodeChildProcess.pid,
	stdin: nodeChildProcess.stdin,
	stdout: nodeChildProcess.stdout,
	stderr: nodeChildProcess.stderr,
	stdio: nodeChildProcess.stdio,
	all,
	kill: nodeChildProcess.kill.bind(nodeChildProcess)
});
var handlePromise = async ({ subprocess, kill, all: allStream, options, startTime, verboseInfo, fileDescriptors, originalStreams, command, escapedCommand, context, onInternalError, controller }) => {
	const [errorInfo, [exitCode, signal], stdioResults, allResult, ipcOutput] = await waitForSubprocessResult({
		subprocess,
		kill,
		all: allStream,
		options,
		context,
		verboseInfo,
		fileDescriptors,
		originalStreams,
		onInternalError,
		controller
	});
	controller.abort();
	onInternalError.resolve();
	return handleResult(getAsyncResult({
		errorInfo,
		exitCode,
		signal,
		stdio: stdioResults.map((stdioResult, fdNumber) => stripNewline(stdioResult, options, fdNumber)),
		all: stripNewline(allResult, options, "all"),
		ipcOutput,
		context,
		options,
		command,
		escapedCommand,
		startTime
	}), verboseInfo, options);
};
var getAsyncResult = ({ errorInfo, exitCode, signal, stdio, all, ipcOutput, context, options, command, escapedCommand, startTime }) => "error" in errorInfo ? makeError({
	error: errorInfo.error,
	command,
	escapedCommand,
	timedOut: context.terminationReason === "timeout",
	isCanceled: context.terminationReason === "cancel" || context.terminationReason === "gracefulCancel",
	isGracefullyCanceled: context.terminationReason === "gracefulCancel",
	isMaxBuffer: errorInfo.error instanceof MaxBufferError,
	isForcefullyTerminated: context.isForcefullyTerminated,
	exitCode,
	signal,
	stdio,
	all,
	ipcOutput,
	options,
	startTime,
	isSync: false
}) : makeSuccessResult({
	command,
	escapedCommand,
	stdio,
	all,
	ipcOutput,
	options,
	startTime
});
//#endregion
//#region node_modules/execa/lib/methods/bind.js
var mergeOptions = (boundOptions, options) => {
	const safeBoundOptions = {
		__proto__: null,
		...boundOptions
	};
	const mergedOptions = Object.fromEntries(Object.entries(options).map(([optionName, optionValue]) => [optionName, mergeOption(optionName, safeBoundOptions[optionName], optionValue)]));
	return {
		...safeBoundOptions,
		...mergedOptions
	};
};
var mergeOption = (optionName, boundOptionValue, optionValue) => {
	if (DEEP_OPTIONS.has(optionName) && isPlainObject(boundOptionValue) && isPlainObject(optionValue)) return {
		...boundOptionValue,
		...optionValue
	};
	return optionValue;
};
var DEEP_OPTIONS = /* @__PURE__ */ new Set(["env", ...FD_SPECIFIC_OPTIONS]);
//#endregion
//#region node_modules/execa/lib/methods/create.js
var createExeca = (mapArguments, boundOptions, deepOptions, setBoundExeca) => {
	const createNested = (mapArguments, boundOptions, setBoundExeca) => createExeca(mapArguments, boundOptions, deepOptions, setBoundExeca);
	const boundExeca = (...execaArguments) => callBoundExeca({
		mapArguments,
		deepOptions,
		boundOptions,
		setBoundExeca,
		createNested
	}, ...execaArguments);
	if (setBoundExeca !== void 0) setBoundExeca(boundExeca, createNested, boundOptions);
	return boundExeca;
};
var callBoundExeca = ({ mapArguments, deepOptions = {}, boundOptions = {}, setBoundExeca, createNested }, firstArgument, ...nextArguments) => {
	if (isPlainObject(firstArgument)) return createNested(mapArguments, mergeOptions(boundOptions, firstArgument), setBoundExeca);
	const { file, commandArguments, options, isSync } = parseArguments({
		mapArguments,
		firstArgument,
		nextArguments,
		deepOptions,
		boundOptions
	});
	return isSync ? execaCoreSync(file, commandArguments, options) : execaCoreAsync(file, commandArguments, options, createNested);
};
var parseArguments = ({ mapArguments, firstArgument, nextArguments, deepOptions, boundOptions }) => {
	const [initialFile, initialArguments, initialOptions] = normalizeParameters(...isTemplateString(firstArgument) ? parseTemplates(firstArgument, nextArguments) : [firstArgument, ...nextArguments]);
	const mergedOptions = mergeOptions(mergeOptions(deepOptions, boundOptions), initialOptions);
	const { options = mergedOptions, isSync = false } = mapArguments({ options: mergedOptions });
	return {
		file: initialFile,
		commandArguments: initialArguments,
		options,
		isSync
	};
};
//#endregion
//#region node_modules/execa/lib/methods/script.js
var setScriptSync = (boundExeca, createNested, boundOptions) => {
	boundExeca.sync = createNested(mapScriptSync, boundOptions);
	boundExeca.s = boundExeca.sync;
};
var mapScriptAsync = ({ options }) => getScriptOptions(options);
var mapScriptSync = ({ options }) => ({
	...getScriptOptions(options),
	isSync: true
});
var getScriptOptions = (options) => ({ options: {
	...getScriptStdinOption(options),
	...options
} });
var getScriptStdinOption = ({ input, inputFile, stdio }) => input === void 0 && inputFile === void 0 && stdio === void 0 ? { stdin: "inherit" } : {};
var deepScriptOptions = { preferLocal: true };
//#endregion
//#region node_modules/execa/index.js
var execa = createExeca(() => ({}));
createExeca(() => ({ isSync: true }));
createExeca(mapNode);
createExeca(mapScriptAsync, {}, deepScriptOptions, setScriptSync);
var { sendMessage, getOneMessage, getEachMessage, getCancelSignal } = getIpcExport();
//#endregion
//#region electron/tool-setup.ts
var TOOL_DEFINITIONS = {
	"claude-code": {
		id: "claude-code",
		name: "Claude Code",
		binary: "claude",
		versionFlag: "--version",
		installCommand: "npm install -g @anthropic-ai/claude-code",
		authCommand: "claude",
		authArgs: [
			"-p",
			"Return READY if authenticated.",
			"--output-format",
			"json"
		],
		authProbeCommand: "claude",
		authProbeArgs: ["auth", "status"],
		authProbeStrict: true,
		authSuccessPatterns: [
			/READY/i,
			/authenticated/i,
			/login successful/i,
			/loggedIn"?\s*:\s*true/i
		],
		authErrorPatterns: [
			/authentication required/i,
			/not logged in/i,
			/login required/i,
			/no credentials/i,
			/unauthorized/i,
			/401/i
		],
		capability: "large refactors and multi-file reasoning"
	},
	codex: {
		id: "codex",
		name: "Codex",
		binary: "codex",
		versionFlag: "--version",
		installCommand: "npm install -g @openai/codex",
		authCommand: "codex",
		authArgs: ["login"],
		authProbeCommand: "codex",
		authProbeArgs: ["login", "status"],
		authProbeStrict: true,
		authSuccessPatterns: [
			/signed in/i,
			/logged in/i,
			/authenticated/i,
			/account/i,
			/user/i
		],
		authErrorPatterns: [
			/authentication required/i,
			/not logged in/i,
			/login required/i,
			/no credentials/i,
			/unauthorized/i,
			/401/i
		],
		capability: "small well-defined functions and boilerplate"
	},
	antigravity: {
		id: "antigravity",
		name: "Antigravity",
		binary: "agy",
		versionFlag: "--version",
		installCommand: "npm install -g @google/antigravity-cli",
		authCommand: "agy",
		authArgs: ["status"],
		authSuccessPatterns: [
			/ready/i,
			/authenticated/i,
			/signed in/i,
			/ok/i
		],
		authErrorPatterns: [
			/authentication required/i,
			/not logged in/i,
			/login required/i,
			/unauthorized/i,
			/401/i
		],
		capability: "browser and UI verification"
	},
	aider: {
		id: "aider",
		name: "Aider",
		binary: "aider",
		versionFlag: "--version",
		installCommand: "pip install aider-chat",
		authSuccessPatterns: [
			/ready/i,
			/authenticated/i,
			/configured/i
		],
		authErrorPatterns: [
			/api key/i,
			/token/i,
			/authentication required/i,
			/unauthorized/i,
			/401/i
		],
		capability: "small precise diffs and tight scope"
	},
	opencode: {
		id: "opencode",
		name: "OpenCode",
		binary: "opencode",
		versionFlag: "--version",
		installCommand: "npm install -g opencode",
		authCommand: "opencode",
		authArgs: ["auth", "login"],
		authProbeCommand: "opencode",
		authProbeArgs: ["auth", "list"],
		authProbeStrict: true,
		authSuccessPatterns: [
			/ready/i,
			/authenticated/i,
			/signed in/i,
			/logged in/i,
			/connected/i,
			/provider/i,
			/ok/i
		],
		authErrorPatterns: [
			/authentication required/i,
			/not logged in/i,
			/login required/i,
			/no credentials/i,
			/unauthorized/i,
			/401/i
		],
		capability: "general-purpose planning and fallback work"
	}
};
var TOOL_IDS = Object.keys(TOOL_DEFINITIONS);
function shellQuote(value) {
	if (/^[A-Za-z0-9_\-./:@=]+$/.test(value)) return value;
	return `"${value.replace(/"/g, "\\\"")}"`;
}
function shellCommandLine(command, args) {
	return [command, ...args.map(shellQuote)].join(" ");
}
function existingDirs(paths) {
	return paths.filter((candidate) => candidate && existsSync(candidate));
}
function pythonScriptDirs(root) {
	if (!root || !existsSync(root)) return [];
	try {
		return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^Python\d+/i.test(entry.name)).map((entry) => join(root, entry.name, "Scripts")).filter((candidate) => existsSync(candidate));
	} catch {
		return [];
	}
}
function normalizeWindowsCommandLine(commandLine) {
	if (os.platform() !== "win32") return commandLine;
	return commandLine.replace(/^npm(?=\s)/i, "npm.cmd").replace(/^npx(?=\s)/i, "npx.cmd").replace(/^pip(?=\s)/i, "python -m pip");
}
/**
* Electron apps on Windows are commonly started from the Start menu and do
* not inherit the PATH that the user's terminal has.  npm global binaries
* then appear to be missing even though `npm` can see them.  Add the usual
* npm/node locations to every probe and action without mutating the process
* environment globally.
*/
function toolEnv() {
	const env = { ...process.env };
	if (os.platform() !== "win32") return env;
	const userProfile = process.env.USERPROFILE || os.homedir();
	const candidates = [
		process.env.APPDATA ? join(process.env.APPDATA, "npm") : "",
		process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "pnpm") : "",
		process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "Programs", "nodejs") : "",
		process.env.ProgramFiles ? join(process.env.ProgramFiles, "nodejs") : "",
		process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "nodejs") : "",
		process.env.ProgramData ? join(process.env.ProgramData, "chocolatey", "bin") : "",
		process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "Microsoft", "WindowsApps") : "",
		userProfile ? join(userProfile, "scoop", "shims") : "",
		userProfile ? join(userProfile, ".local", "bin") : "",
		...pythonScriptDirs(process.env.APPDATA ? join(process.env.APPDATA, "Python") : void 0),
		...pythonScriptDirs(process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "Programs", "Python") : void 0)
	].filter(Boolean);
	const current = (env.PATH || env.Path || "").split(";").filter(Boolean);
	env.PATH = [.../* @__PURE__ */ new Set([...current, ...existingDirs(candidates)])].join(";");
	env.Path = env.PATH;
	return env;
}
async function captureShellCommand(commandLine, timeout) {
	const isWin = os.platform() === "win32";
	return execa(isWin ? "cmd.exe" : "bash", isWin ? [
		"/d",
		"/s",
		"/c",
		normalizeWindowsCommandLine(commandLine)
	] : ["-lc", commandLine], {
		reject: false,
		timeout,
		env: toolEnv(),
		windowsHide: true
	});
}
function runShellCommand(commandLine, workdir, onOutput) {
	const isWin = os.platform() === "win32";
	const shell = isWin ? "cmd.exe" : "bash";
	const normalizedCommandLine = normalizeWindowsCommandLine(commandLine);
	const ptyProcess = (0, import_lib.spawn)(shell, isWin ? [
		"/d",
		"/s",
		"/c",
		normalizedCommandLine
	] : ["-lc", normalizedCommandLine], {
		name: "xterm-color",
		cols: 120,
		rows: 40,
		cwd: workdir,
		env: toolEnv()
	});
	let rawOutput = "";
	return {
		ptyProcess,
		promise: new Promise((resolve) => {
			ptyProcess.onData((data) => {
				rawOutput += data;
				onOutput(data);
			});
			ptyProcess.onExit(({ exitCode }) => resolve({
				exitCode,
				rawOutput
			}));
		})
	};
}
async function detectTool(binary, versionFlag) {
	try {
		const result = await captureShellCommand(shellCommandLine(binary, [versionFlag]), 1e4);
		const version = (result.stdout || result.stderr || "").trim() || null;
		if (result.exitCode === 0) return {
			installed: true,
			version
		};
		if (os.platform() === "win32") {
			const located = await captureShellCommand(shellCommandLine("where.exe", [binary]), 5e3);
			const locations = `${located.stdout || ""}\n${located.stderr || ""}`.trim();
			if (located.exitCode === 0) return {
				installed: false,
				version: null,
				details: `${binary} was found but could not run.${version ? `\n${version}` : ""}${locations ? `\n${locations}` : ""}`
			};
		}
		return {
			installed: false,
			version: null,
			details: version || null
		};
	} catch {
		return {
			installed: false,
			version: null
		};
	}
}
function hasAnyPattern(raw, patterns) {
	return patterns.some((pattern) => pattern.test(raw));
}
async function detectAuth(tool, installed) {
	if (!installed) return { status: "not-installed" };
	if (tool.id === "aider") {
		if (getToolSecret(tool.id)?.secret_encrypted) return { status: "ready" };
		return { status: "installed-not-signed-in" };
	}
	if (!tool.authCommand || !tool.authArgs) return {
		status: "ready",
		details: "CLI is installed."
	};
	try {
		const probe = await captureShellCommand(shellCommandLine(tool.authProbeCommand || tool.authCommand, tool.authProbeArgs || tool.authArgs), 15e3);
		const raw = `${probe.stdout || ""}\n${probe.stderr || ""}`.trim();
		if (probe.exitCode === 0 && (!tool.authProbeStrict || hasAnyPattern(raw, tool.authSuccessPatterns) || raw.length === 0)) return {
			status: "ready",
			details: raw || "CLI is ready."
		};
		if (hasAnyPattern(raw, tool.authSuccessPatterns)) return {
			status: "ready",
			details: raw || "CLI is ready."
		};
		if (hasAnyPattern(raw, tool.authErrorPatterns)) return {
			status: "installed-not-signed-in",
			details: raw || null
		};
		if (tool.authProbeStrict) return {
			status: "installed-not-signed-in",
			details: raw || "Sign-in required."
		};
		return {
			status: "ready",
			details: raw || "CLI is ready."
		};
	} catch (error) {
		return {
			status: "installed-not-signed-in",
			details: error instanceof Error ? error.message : "Unable to verify sign-in."
		};
	}
}
async function refreshToolStatuses() {
	const snapshots = await Promise.all(TOOL_IDS.map(async (tool) => {
		const def = TOOL_DEFINITIONS[tool];
		const detected = await detectTool(def.binary, def.versionFlag);
		const auth = await detectAuth(def, detected.installed);
		const snapshot = {
			toolId: def.id,
			name: def.name,
			binary: def.binary,
			version: detected.version,
			installed: detected.installed,
			authStatus: auth.status,
			available: auth.status === "ready",
			details: auth.details || detected.details || null,
			lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		upsertToolStatus({
			toolId: snapshot.toolId,
			name: snapshot.name,
			binary: snapshot.binary,
			version: snapshot.version,
			installed: snapshot.installed,
			authStatus: snapshot.authStatus,
			available: snapshot.available,
			details: snapshot.details
		});
		return snapshot;
	}));
	syncAgentProfiles(snapshots);
	return snapshots;
}
function getSetupCompleted() {
	return getDb().prepare(`SELECT value FROM settings WHERE key = ?`).get("toolSetupCompleted")?.value === "true";
}
function setSetupCompleted(completed) {
	getDb().prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run("toolSetupCompleted", completed ? "true" : "false");
}
function saveToolSecret(toolId, label, secret) {
	upsertToolSecret(toolId, label, safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(secret).toString("base64") : Buffer.from(secret, "utf8").toString("base64"));
}
function runToolAction(toolId, kind, onOutput, onSuccessSignal, secret) {
	const def = TOOL_DEFINITIONS[toolId];
	const sessionId = `${toolId}-${Math.random().toString(36).slice(2, 9)}`;
	let commandLine = "";
	if (kind === "install") commandLine = normalizeWindowsCommandLine(def.installCommand);
	else if (toolId === "aider") {
		if (secret) saveToolSecret(toolId, "Aider API key", secret);
		commandLine = "echo Aider API key saved.";
	} else commandLine = shellCommandLine(def.authCommand || def.binary, def.authArgs && def.authArgs.length > 0 ? def.authArgs : []);
	const { promise } = runShellCommand(commandLine, process.cwd(), (chunk) => {
		onOutput(chunk);
		if (onSuccessSignal && hasAnyPattern(chunk, def.authSuccessPatterns)) onSuccessSignal(chunk);
	});
	return {
		sessionId,
		promise
	};
}
function syncAgentProfiles(statuses) {
	const profilePath = join(process.cwd(), "agent-profiles.json");
	const profiles = TOOL_IDS.map((toolId) => {
		const def = TOOL_DEFINITIONS[toolId];
		const status = statuses.find((item) => item.toolId === toolId);
		return {
			id: def.id,
			name: def.name,
			binary: def.binary,
			capability: def.capability,
			available: status ? status.available : false,
			status: status?.authStatus || "not-installed",
			version: status?.version || null
		};
	});
	writeFileSync(profilePath, JSON.stringify(profiles, null, 2), "utf8");
}
//#endregion
//#region electron/capabilities.ts
process.cwd();
var slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
function parseJsonArray(value) {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return value.split(",").map((item) => item.trim()).filter(Boolean);
	}
}
function parseJsonObject(value) {
	if (!value) return {};
	try {
		const parsed = JSON.parse(value);
		return typeof parsed === "object" && parsed ? parsed : {};
	} catch {
		return {};
	}
}
function parseMcpServers() {
	return getMcpServers().map((row) => ({
		id: row.id,
		name: row.name,
		transport: row.transport || "stdio",
		command: row.command || "",
		url: row.url || "",
		args: row.args || "[]",
		env: row.env || "{}",
		enabled: (row.enabled ?? row.is_enabled ?? 1) === 1
	}));
}
function parseSkills() {
	return getSkills().map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description || "",
		content: row.content || "",
		tags: row.tags || "[]",
		enabled: (row.enabled ?? 1) === 1
	}));
}
function parsePlugins() {
	return getPlugins().map((row) => ({
		id: row.id,
		name: row.name,
		source: row.source || row.command || "",
		version: row.version || "",
		enabled: (row.enabled ?? row.is_enabled ?? 1) === 1
	}));
}
function getCapabilityRegistry() {
	return {
		mcpServers: parseMcpServers(),
		skills: parseSkills(),
		plugins: parsePlugins()
	};
}
function clearDirectory(targetDir) {
	if (!existsSync(targetDir)) return;
	rmSync(targetDir, {
		recursive: true,
		force: true
	});
}
function ensureDir(targetDir) {
	mkdirSync(targetDir, { recursive: true });
}
function writeJson(targetPath, value) {
	ensureDir(dirname(targetPath));
	writeFileSync(targetPath, JSON.stringify(value, null, 2), "utf8");
}
function writeSkillFile(targetPath, skill) {
	ensureDir(dirname(targetPath));
	const tags = parseJsonArray(skill.tags);
	const frontmatter = [
		"---",
		`name: ${skill.name}`,
		`description: ${skill.description || skill.name}`,
		`tags: [${tags.map((tag) => JSON.stringify(tag)).join(", ")}]`,
		"---",
		"",
		skill.content,
		""
	].join("\n");
	writeFileSync(targetPath, frontmatter, "utf8");
}
async function testMcpServerConnection(server) {
	try {
		if (!server.enabled) return {
			ok: false,
			message: "Server is disabled"
		};
		if (server.transport === "stdio") {
			const module = await import("./client-rsCCR4w_.js");
			const transportModule = await import("./stdio-D90AQvmQ.js");
			const client = new module.Client({
				name: "robent-capabilities-check",
				version: "1.0.0"
			});
			const transport = new transportModule.StdioClientTransport({
				command: server.command,
				args: parseJsonArray(server.args),
				env: parseJsonObject(server.env)
			});
			await client.connect(transport);
			await client.listTools();
			await client.close();
			return {
				ok: true,
				message: "Connection successful"
			};
		}
		const response = await fetch(server.url);
		if (!response.ok) return {
			ok: false,
			message: `HTTP ${response.status}`
		};
		return {
			ok: true,
			message: "Connection successful"
		};
	} catch (error) {
		return {
			ok: false,
			message: error?.message || "Connection failed"
		};
	}
}
function syncClaudeCodeConfig(workdir, context = {}) {
	const logs = [];
	try {
		const registry = getCapabilityRegistry();
		const root = resolve(workdir);
		const mcpPath = join(root, ".mcp.json");
		const skillRoot = join(root, ".claude", "skills");
		clearDirectory(skillRoot);
		writeJson(mcpPath, { mcpServers: registry.mcpServers.filter((server) => server.enabled).map((server) => ({
			name: server.name,
			transport: server.transport,
			command: server.command,
			url: server.url,
			args: parseJsonArray(server.args),
			env: parseJsonObject(server.env)
		})) });
		logs.push(`Wrote ${mcpPath}`);
		const selectedSkills = selectSkills(registry.skills, context.skillIds);
		for (const skill of selectedSkills) writeSkillFile(join(skillRoot, slugify(skill.name), "SKILL.md"), skill);
		return {
			ok: true,
			unavailable: false,
			logs
		};
	} catch (error) {
		return {
			ok: false,
			unavailable: false,
			logs,
			error: error?.message || "Claude sync failed"
		};
	}
}
function syncCodexConfig(workdir, context = {}) {
	const logs = [];
	try {
		const registry = getCapabilityRegistry();
		const root = resolve(workdir);
		const codexRoot = join(root, ".codex");
		const configPath = join(codexRoot, "config.toml");
		const skillRoot = join(codexRoot, "skills");
		clearDirectory(skillRoot);
		ensureDir(codexRoot);
		const toml = [
			"[mcp_servers]",
			...registry.mcpServers.filter((server) => server.enabled).map((server) => `[[mcp_servers.${slugify(server.name)}]]\nname = ${JSON.stringify(server.name)}\ntransport = ${JSON.stringify(server.transport)}\ncommand = ${JSON.stringify(server.command)}\nurl = ${JSON.stringify(server.url)}\nargs = ${JSON.stringify(parseJsonArray(server.args))}\nenv = ${JSON.stringify(parseJsonObject(server.env))}`),
			""
		].join("\n");
		writeFileSync(configPath, toml, "utf8");
		logs.push(`Wrote ${configPath}`);
		const selectedSkills = selectSkills(registry.skills, context.skillIds);
		for (const skill of selectedSkills) writeSkillFile(join(skillRoot, `${slugify(skill.name)}.md`), skill);
		return {
			ok: true,
			unavailable: false,
			logs
		};
	} catch (error) {
		return {
			ok: false,
			unavailable: false,
			logs,
			error: error?.message || "Codex sync failed"
		};
	}
}
function syncAntigravityConfig(workdir, context = {}) {
	const logs = [];
	try {
		const registry = getCapabilityRegistry();
		const root = resolve(workdir);
		const settingsPath = join(root, ".antigravity", "settings.json");
		const skillRoot = join(root, ".agents", "skills");
		const pluginRoot = join(root, ".antigravity", "plugins");
		clearDirectory(skillRoot);
		ensureDir(pluginRoot);
		writeJson(settingsPath, { mcpServers: registry.mcpServers.filter((server) => server.enabled).map((server) => ({
			name: server.name,
			transport: server.transport,
			command: server.command,
			url: server.url,
			args: parseJsonArray(server.args),
			env: parseJsonObject(server.env)
		})) });
		logs.push(`Wrote ${settingsPath}`);
		const selectedSkills = selectSkills(registry.skills, context.skillIds);
		for (const skill of selectedSkills) writeSkillFile(join(skillRoot, slugify(skill.name), "SKILL.md"), skill);
		const enabledPlugins = registry.plugins.filter((plugin) => plugin.enabled);
		for (const plugin of enabledPlugins) writeJson(join(pluginRoot, `${slugify(plugin.name)}.json`), plugin);
		return {
			ok: true,
			unavailable: false,
			logs
		};
	} catch (error) {
		return {
			ok: false,
			unavailable: false,
			logs,
			error: error?.message || "Antigravity sync failed"
		};
	}
}
function syncAiderConfig(_workdir, _context = {}) {
	return {
		ok: true,
		unavailable: true,
		logs: ["Aider has no native MCP or skill config; capabilities are prepended into the task prompt."]
	};
}
function syncOpenCodeConfig(workdir, context = {}) {
	const logs = [];
	try {
		const registry = getCapabilityRegistry();
		const root = resolve(workdir);
		const configPath = join(root, "opencode.json");
		const skillRoot = join(root, ".opencode", "skills");
		clearDirectory(skillRoot);
		writeJson(configPath, { mcpServers: registry.mcpServers.filter((server) => server.enabled).map((server) => ({
			name: server.name,
			transport: server.transport,
			command: server.command,
			url: server.url,
			args: parseJsonArray(server.args),
			env: parseJsonObject(server.env)
		})) });
		logs.push(`Wrote ${configPath}`);
		const selectedSkills = selectSkills(registry.skills, context.skillIds);
		for (const skill of selectedSkills) writeSkillFile(join(skillRoot, slugify(skill.name), "SKILL.md"), skill);
		return {
			ok: true,
			unavailable: false,
			logs
		};
	} catch (error) {
		return {
			ok: false,
			unavailable: false,
			logs,
			error: error?.message || "OpenCode sync failed"
		};
	}
}
function syncCapabilitiesForDriver(driverName, workdir, context = {}) {
	switch (driverName.toLowerCase().replace(/\s+/g, "-")) {
		case "claude-code":
		case "claude": return syncClaudeCodeConfig(workdir, context);
		case "codex": return syncCodexConfig(workdir, context);
		case "antigravity":
		case "agy": return syncAntigravityConfig(workdir, context);
		case "aider": return syncAiderConfig(workdir, context);
		case "opencode": return syncOpenCodeConfig(workdir, context);
		default: return {
			ok: true,
			unavailable: true,
			logs: [`No capability sync adapter for ${driverName}`]
		};
	}
}
function composePromptForDriver(driverName, prompt, context = {}) {
	if (driverName.toLowerCase().replace(/\s+/g, "-") !== "aider") return prompt;
	const selectedSkills = selectSkills(getCapabilityRegistry().skills, context.skillIds);
	if (selectedSkills.length === 0) return prompt;
	return `${selectedSkills.map((skill) => `## ${skill.name}\n${skill.content}`).join("\n\n")}\n\n${prompt}`;
}
function selectSkills(skills, skillIds) {
	return skillIds && skillIds.length > 0 ? skills.filter((skill) => skill.enabled && skillIds.includes(skill.id)) : skills.filter((skill) => skill.enabled);
}
//#endregion
//#region electron/main.ts
/**
* electron/main.ts — Electron Main Process
* 
* Owns: all IPC handlers, driver instances, SQLite DB, git operations.
* Renderer communicates ONLY via IPC — never directly touches the file system.
*/
var _filename = fileURLToPath(import.meta.url);
var _dirname = dirname(_filename);
if (typeof globalThis.__dirname === "undefined") globalThis.__dirname = _dirname;
if (typeof globalThis.__filename === "undefined") globalThis.__filename = _filename;
var __dirname = _dirname;
process.env.APP_ROOT = join(__dirname, "..");
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var MAIN_DIST = join(process.env.APP_ROOT, "dist-electron");
var RENDERER_DIST = join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win = null;
var activeJobs = /* @__PURE__ */ new Map();
var activeToolSessions = /* @__PURE__ */ new Map();
/** Preview server tracking (Phase I: Review Loop) */
var previewServers = /* @__PURE__ */ new Map();
function createWindow() {
	win = new BrowserWindow({
		width: 1440,
		height: 900,
		titleBarStyle: "hidden",
		titleBarOverlay: {
			color: "#09090b",
			symbolColor: "#a1a1aa",
			height: 40
		},
		webPreferences: {
			preload: join(__dirname, "preload.mjs"),
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
	else win.loadFile(join(RENDERER_DIST, "index.html"));
}
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(() => {
	try {
		const db = getDb();
		purgeDemoData();
		seedDefaultData();
		db.prepare(`DELETE FROM workers`).run();
		db.prepare(`UPDATE jobs SET status = 'planned' WHERE status = 'working'`).run();
		refreshToolStatuses().catch((error) => console.error("Tool status refresh failed:", error));
	} catch (e) {
		console.error("DB init error:", e);
	}
	createWindow();
});
function genId() {
	return Math.random().toString(36).substring(2, 9);
}
function emit(channel, ...args) {
	win?.webContents.send(channel, ...args);
}
function toolSetupCompleted() {
	return getSetupCompleted();
}
ipcMain.handle("get-jobs", () => getJobs());
ipcMain.handle("get-job", (_e, id) => getJob(id));
ipcMain.handle("create-job", (_e, job) => {
	createJob(job);
	addActivity({
		id: genId(),
		jobId: job.id,
		type: "task_created",
		message: `Task created — ${job.title}`
	});
	return getJob(job.id);
});
ipcMain.handle("update-job", (_e, id, fields) => {
	updateJob(id, fields);
	return getJob(id);
});
ipcMain.handle("get-activities", () => getActivities(100));
ipcMain.handle("get-workers", () => getWorkers());
ipcMain.handle("get-terminal-lines", (_e, jobId) => getTerminalLines(jobId));
ipcMain.handle("get-tool-statuses", () => getToolStatusSnapshots());
ipcMain.handle("refresh-tool-statuses", async () => {
	const statuses = await refreshToolStatuses();
	emit("tool-statuses-changed", statuses);
	return statuses;
});
ipcMain.handle("get-tool-setup-completed", () => ({ completed: toolSetupCompleted() }));
ipcMain.handle("set-tool-setup-completed", (_e, completed) => {
	setSetupCompleted(completed);
	return { completed: toolSetupCompleted() };
});
ipcMain.handle("save-tool-secret", (_e, payload) => {
	saveToolSecret(payload.toolId, payload.label, payload.secret);
	return { success: true };
});
ipcMain.handle("run-tool-action", async (event, payload) => {
	const { sessionId, promise } = runToolAction(payload.toolId, payload.kind, (chunk) => {
		event.sender.send("tool-output", payload.toolId, sessionId, chunk);
	}, () => {
		refreshToolStatuses().then((statuses) => emit("tool-statuses-changed", statuses)).catch((error) => console.error("Tool status refresh failed:", error));
	}, payload.secret);
	activeToolSessions.set(sessionId, {
		toolId: payload.toolId,
		kind: payload.kind,
		sessionId
	});
	event.sender.send("tool-action-started", payload.toolId, sessionId, payload.kind);
	const result = await promise;
	activeToolSessions.delete(sessionId);
	const statuses = await refreshToolStatuses().catch((error) => {
		console.error("Tool status refresh failed:", error);
		return null;
	});
	if (statuses) emit("tool-statuses-changed", statuses);
	event.sender.send("tool-action-ended", payload.toolId, sessionId, result.exitCode, result.rawOutput);
	return {
		sessionId,
		exitCode: result.exitCode
	};
});
ipcMain.handle("run-task", async (event, { taskId, agent, workdir }) => {
	const job = getJob(taskId);
	if (!job) return { error: "Job not found" };
	const jobRunId = genId();
	const branchName = `agent/${taskId.toLowerCase()}-${jobRunId}`;
	let actualWorkdir = workdir;
	try {
		const git = simpleGit(workdir);
		const wtPath = join(workdir, ".agent-worktrees", jobRunId);
		mkdirSync(join(workdir, ".agent-worktrees"), { recursive: true });
		await git.raw([
			"worktree",
			"add",
			"-b",
			branchName,
			wtPath
		]);
		actualWorkdir = wtPath;
	} catch (e) {
		console.warn("Worktree creation failed, using original workdir:", e);
	}
	const mcpConfigPath = writeAgentMcpConfig(agent, actualWorkdir);
	if (mcpConfigPath) addActivity({
		id: genId(),
		jobId: taskId,
		type: "mcp_configured",
		message: `MCP config written: ${mcpConfigPath}`
	});
	const capabilitySync = syncCapabilitiesForDriver(agent, actualWorkdir, { skillIds: Array.isArray(job.skill_ids) ? job.skill_ids : void 0 });
	if (!capabilitySync.ok) {
		updateJob(taskId, { sub_status: `Capability sync failed for ${agent}` });
		addActivity({
			id: genId(),
			jobId: taskId,
			type: "capability_sync_failed",
			message: capabilitySync.error || `Capability sync failed for ${agent}`
		});
	} else for (const log of capabilitySync.logs) addActivity({
		id: genId(),
		jobId: taskId,
		type: "capability_sync",
		message: log
	});
	updateJob(taskId, {
		status: "working",
		branch: branchName,
		worktree: actualWorkdir,
		started_at: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
		runtime: 0
	});
	upsertWorker({
		id: `worker-${taskId}`,
		jobId: taskId,
		agent,
		status: "running",
		runtime: 0
	});
	addActivity({
		id: genId(),
		jobId: taskId,
		type: "agent_started",
		message: `${agent} started on ${job.title}`
	});
	addActivity({
		id: genId(),
		jobId: taskId,
		type: "worktree_created",
		message: `Worktree: ${actualWorkdir}`
	});
	emit("state-changed");
	const driver = createDriver(agent);
	const prompt = composePromptForDriver(agent, job.description, { skillIds: Array.isArray(job.skill_ids) ? job.skill_ids : void 0 });
	const { jobId: runId, promise } = driver.run(prompt, actualWorkdir, (chunk) => {
		event.sender.send("task-output", taskId, chunk);
		addTerminalLine({
			id: genId(),
			jobId: taskId,
			type: "output",
			content: chunk
		});
	});
	activeJobs.set(taskId, {
		driver,
		jobId: runId
	});
	promise.then(async (result) => {
		activeJobs.delete(taskId);
		let diffText = "";
		try {
			const git = simpleGit(actualWorkdir);
			await git.add(".");
			const status = await git.status();
			if (status.staged.length > 0 || status.created.length > 0 || status.modified.length > 0) {
				await git.commit(`feat(${taskId}): ${job.title}`);
				addActivity({
					id: genId(),
					jobId: taskId,
					type: "git_committed",
					message: `Committed worktree changes to ${branchName}`
				});
				diffText = await git.diff(["HEAD~1"]);
			} else diffText = await git.diff(["HEAD"]);
		} catch (e) {
			console.warn("Git commit/diff failed:", e);
		}
		const tokenCount = result.tokenCount || 0;
		const estimatedCost = result.cost || 0;
		updateJob(taskId, {
			status: "review",
			diff: diffText,
			token_count: tokenCount,
			estimated_cost: estimatedCost,
			pr_number: null,
			ci_status: result.status === "success" ? "passing" : "failed",
			completed_at: (/* @__PURE__ */ new Date()).toLocaleTimeString()
		});
		removeWorker(taskId);
		addActivity({
			id: genId(),
			jobId: taskId,
			type: result.status === "success" ? "ci_passed" : "ci_failed",
			message: `${agent} finished: ${result.summary}`
		});
		emit("state-changed");
		emit("task-done", taskId, result);
	});
	return {
		success: true,
		runId
	};
});
ipcMain.handle("cancel-task", (_e, taskId) => {
	const job = activeJobs.get(taskId);
	if (job) {
		job.driver.cancel(job.jobId);
		activeJobs.delete(taskId);
		updateJob(taskId, { status: "planned" });
		removeWorker(taskId);
		addActivity({
			id: genId(),
			jobId: taskId,
			type: "agent_stopped",
			message: "Agent cancelled by user"
		});
		emit("state-changed");
	}
	return { success: true };
});
ipcMain.handle("kill-all", () => {
	for (const [taskId, job] of activeJobs.entries()) {
		job.driver.cancel(job.jobId);
		updateJob(taskId, { status: "planned" });
		removeWorker(taskId);
		addActivity({
			id: genId(),
			jobId: taskId,
			type: "agent_stopped",
			message: "Killed by global stop"
		});
	}
	activeJobs.clear();
	emit("state-changed");
	return { success: true };
});
ipcMain.handle("run-race", async (event, { taskId, agents, workdir }) => {
	const job = getJob(taskId);
	if (!job || agents.length < 2) return { error: "Invalid race params" };
	const raceResults = {};
	const runners = agents.map(async (agent) => {
		const driver = createDriver(agent);
		const capabilitySync = syncCapabilitiesForDriver(agent, workdir, { skillIds: Array.isArray(job.skill_ids) ? job.skill_ids : void 0 });
		if (!capabilitySync.ok) addActivity({
			id: genId(),
			jobId: taskId,
			type: "capability_sync_failed",
			message: capabilitySync.error || `Capability sync failed for ${agent}`
		});
		const prompt = composePromptForDriver(agent, job.description, { skillIds: Array.isArray(job.skill_ids) ? job.skill_ids : void 0 });
		const { jobId, promise } = driver.run(prompt, workdir, (chunk) => {
			event.sender.send("race-output", taskId, agent, chunk);
		});
		const result = await promise;
		raceResults[agent] = {
			...result,
			jobId
		};
		emit("race-result", taskId, agent, result);
		return result;
	});
	await Promise.all(runners);
	return raceResults;
});
ipcMain.handle("merge-task", async (_e, taskId) => {
	const job = getJob(taskId);
	if (!job) return { error: "Not found" };
	try {
		if (job.worktree && job.branch) {
			const git = simpleGit((await simpleGit(job.worktree).revparse(["--show-toplevel"])).trim());
			const targetBranch = (await git.revparse(["--abbrev-ref", "HEAD"])).trim();
			if (!targetBranch || targetBranch === "HEAD") throw new Error("Repository is in detached HEAD state");
			await git.checkout(targetBranch);
			try {
				await git.merge([
					job.branch,
					"--no-ff",
					"-m",
					`Merge ${job.branch} into ${targetBranch}`
				]);
			} catch (mergeError) {
				await git.merge(["--abort"]).catch(() => void 0);
				throw mergeError;
			}
			try {
				await git.raw([
					"worktree",
					"remove",
					"--force",
					job.worktree
				]);
				await git.deleteLocalBranch(job.branch, true);
			} catch {}
		}
	} catch (e) {
		const message = e?.message || "Git merge failed";
		console.warn("Merge failed:", message);
		addActivity({
			id: genId(),
			jobId: taskId,
			type: "merge_failed",
			message
		});
		emit("state-changed");
		return {
			success: false,
			error: message
		};
	}
	updateJob(taskId, {
		status: "done",
		branch: null,
		worktree: null,
		completed_at: (/* @__PURE__ */ new Date()).toLocaleTimeString()
	});
	addActivity({
		id: genId(),
		jobId: taskId,
		type: "pr_merged",
		message: `PR #${job.pr_number} merged into main`
	});
	emit("state-changed");
	return { success: true };
});
ipcMain.handle("discard-task", async (_e, taskId) => {
	const job = getJob(taskId);
	if (!job) return { error: "Not found" };
	try {
		if (job.worktree && job.branch) {
			const git = simpleGit((await simpleGit(job.worktree).revparse(["--show-toplevel"])).trim());
			await git.raw([
				"worktree",
				"remove",
				"--force",
				job.worktree
			]);
			await git.deleteLocalBranch(job.branch, true);
		}
	} catch (e) {
		console.warn("Discard cleanup failed:", e);
	}
	updateJob(taskId, {
		status: "planned",
		branch: null,
		worktree: null,
		diff: null,
		pr_number: null
	});
	addActivity({
		id: genId(),
		jobId: taskId,
		type: "agent_stopped",
		message: "Worktree discarded"
	});
	emit("state-changed");
	return { success: true };
});
ipcMain.handle("start-preview-server", (_e, taskId) => {
	const job = getJob(taskId);
	if (!job || !job.worktree) return { error: "No worktree found" };
	if (previewServers.has(taskId)) return {
		port: previewServers.get(taskId).port,
		alreadyRunning: true
	};
	const existing = previewServers.get(taskId);
	if (existing) {
		existing.proc.kill();
		previewServers.delete(taskId);
	}
	let port = 3e3;
	const proc = spawn("npm", ["run", "dev"], {
		cwd: job.worktree,
		stdio: "pipe",
		shell: true,
		env: {
			...process.env,
			PORT: String(port)
		}
	});
	let output = "";
	proc.stdout?.on("data", (data) => {
		const str = data.toString();
		output += str;
		const portMatch = str.match(/port\s+(\d+)/i) || str.match(/Listening on\s+.*:(\d+)/i);
		if (portMatch && !previewServers.has(taskId)) {
			port = parseInt(portMatch[1]);
			previewServers.set(taskId, {
				proc,
				port,
				taskId
			});
			emit("preview-ready", taskId, port, output);
		}
	});
	proc.stderr?.on("data", (data) => {
		output += data.toString();
	});
	setTimeout(() => {
		if (!previewServers.has(taskId)) {
			previewServers.set(taskId, {
				proc,
				port,
				taskId
			});
			emit("preview-ready", taskId, port, output);
		}
	}, 1e4);
	return {
		port,
		starting: true
	};
});
ipcMain.handle("stop-preview-server", (_e, taskId) => {
	const existing = previewServers.get(taskId);
	if (existing) {
		existing.proc.kill();
		previewServers.delete(taskId);
	}
	return { success: true };
});
ipcMain.handle("get-mcp-servers", () => getMcpServers());
ipcMain.handle("get-capability-registry", () => getCapabilityRegistry());
ipcMain.handle("test-mcp-server-connection", async (_e, server) => testMcpServerConnection(server));
ipcMain.handle("add-mcp-server", (_e, server) => {
	const id = genId();
	addMcpServer({
		...server,
		id
	});
	return getMcpServers();
});
ipcMain.handle("update-mcp-server", (_e, id, fields) => {
	updateMcpServer(id, fields);
	return getMcpServers();
});
ipcMain.handle("delete-mcp-server", (_e, id) => {
	deleteMcpServer(id);
	return getMcpServers();
});
ipcMain.handle("get-credentials", () => getCredentials());
ipcMain.handle("add-credential", (_e, cred) => {
	const id = genId();
	if (safeStorage.isEncryptionAvailable()) {
		const encrypted = safeStorage.encryptString(cred.secret);
		console.log(`Stored encrypted credential for ${cred.agent}:${cred.label} (${encrypted.length} bytes)`);
	}
	addCredential({
		id,
		agent: cred.agent,
		label: cred.label
	});
	return getCredentials();
});
ipcMain.handle("delete-credential", (_e, id) => {
	deleteCredential(id);
	return getCredentials();
});
ipcMain.handle("get-skills", () => getSkills());
ipcMain.handle("add-skill", (_e, skill) => {
	addSkill({
		id: genId(),
		...skill
	});
	return getSkills();
});
ipcMain.handle("update-skill", (_e, id, fields) => {
	updateSkill(id, fields);
	return getSkills();
});
ipcMain.handle("delete-skill", (_e, id) => {
	deleteSkill(id);
	return getSkills();
});
ipcMain.handle("get-plugins", () => getPlugins());
ipcMain.handle("add-plugin", (_e, plugin) => {
	const id = genId();
	addPlugin({
		...plugin,
		id
	});
	return getPlugins();
});
ipcMain.handle("update-plugin", (_e, id, fields) => {
	updatePlugin(id, fields);
	return getPlugins();
});
ipcMain.handle("delete-plugin", (_e, id) => {
	deletePlugin(id);
	return getPlugins();
});
ipcMain.handle("toggle-plugin", (_e, id, enabled) => {
	togglePlugin(id, enabled);
	return getPlugins();
});
ipcMain.handle("open-external", (_e, url) => {
	if (url && (url.startsWith("http://") || url.startsWith("https://"))) shell.openExternal(url);
	return { success: true };
});
ipcMain.handle("get-settings", () => getSettings());
ipcMain.handle("set-setting", (_e, key, value) => {
	setSetting(key, value);
	return getSettings();
});
ipcMain.handle("show-open-dialog", async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog(win, { properties: ["openDirectory"] });
	return {
		canceled,
		filePaths
	};
});
ipcMain.handle("get-projects", () => getProjects());
ipcMain.handle("get-project", (_e, id) => getProject(id));
ipcMain.handle("add-project", async (_e, project) => {
	const projectPath = project.path.trim();
	const remote = project.gitRemote?.trim() || "";
	if (!project.name.trim() || !projectPath) return { error: "Project name and folder are required" };
	try {
		if (remote && !existsSync(projectPath)) await simpleGit().clone(remote, projectPath);
		else if (remote && existsSync(projectPath) && statSync(projectPath).isDirectory()) {
			if (readdirSync(projectPath).length === 0) await simpleGit().clone(remote, projectPath);
			else if (!existsSync(join(projectPath, ".git"))) return { error: "Destination folder is not empty and is not a Git repository" };
		}
	} catch (error) {
		return { error: `Git clone failed: ${error?.message || "check the URL and access rights"}` };
	}
	if (!existsSync(projectPath) || !statSync(projectPath).isDirectory()) return { error: "Project folder does not exist" };
	const id = genId();
	addProject({
		...project,
		id,
		path: projectPath,
		gitRemote: remote
	});
	return getProjects();
});
ipcMain.handle("delete-project", (_e, id) => {
	deleteProject(id);
	return getProjects();
});
ipcMain.handle("set-active-project", (_e, id) => {
	setActiveProject(id);
	return getProjects();
});
setInterval(() => {
	if (activeJobs.size === 0) return;
	const runtimes = {};
	for (const [taskId] of activeJobs.entries()) {
		const job = getJob(taskId);
		if (job && job.status === "working") {
			const newRuntime = (job.runtime || 0) + 1;
			updateJob(taskId, { runtime: newRuntime });
			runtimes[taskId] = newRuntime;
		}
	}
	if (Object.keys(runtimes).length > 0) emit("runtime-tick", runtimes);
}, 1e3);
//#endregion
export { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL };
