//#region node_modules/zod/v4/core/core.js
var e;
function t(e, t, n) {
	function r(n, r) {
		if (n._zod || Object.defineProperty(n, "_zod", {
			value: {
				def: r,
				constr: o,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: !1
		}), n._zod.traits.has(e)) return;
		n._zod.traits.add(e), t(n, r);
		let i = o.prototype, a = Object.keys(i);
		for (let e = 0; e < a.length; e++) {
			let t = a[e];
			t in n || (n[t] = i[t].bind(n));
		}
	}
	let i = n?.Parent ?? Object;
	class a extends i {}
	Object.defineProperty(a, "name", { value: e });
	function o(e) {
		var t;
		let i = n?.Parent ? new a() : this;
		r(i, e), (t = i._zod).deferred ?? (t.deferred = []);
		for (let e of i._zod.deferred) e();
		return i;
	}
	return Object.defineProperty(o, "init", { value: r }), Object.defineProperty(o, Symbol.hasInstance, { value: (t) => n?.Parent && t instanceof n.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(o, "name", { value: e }), o;
}
var n = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, r = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(e = globalThis).__zod_globalConfig ?? (e.__zod_globalConfig = {});
var i = globalThis.__zod_globalConfig;
function a(e) {
	return e && Object.assign(i, e), i;
}
//#endregion
//#region node_modules/zod/v4/core/util.js
function o(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function s(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
function c(e) {
	return { get value() {
		{
			let t = e();
			return Object.defineProperty(this, "value", { value: t }), t;
		}
	} };
}
function l(e) {
	return e == null;
}
function u(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function d(e, t) {
	let n = e / t, r = Math.round(n), i = 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
var ee = /* @__PURE__*/ Symbol("evaluating");
function f(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== ee) return r === void 0 && (r = ee, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function p(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function m(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function te(e) {
	return JSON.stringify(e);
}
function ne(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var re = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function h(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var ie = /* @__PURE__*/ c(() => {
	if (i.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function g(e) {
	if (h(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return h(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function ae(e) {
	return g(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var oe = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function _(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function v(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function y(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function se(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
var ce = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function le(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	return v(e, m(e._zod.def, {
		get shape() {
			let e = {};
			for (let r in t) {
				if (!(r in n.shape)) throw Error(`Unrecognized key: "${r}"`);
				t[r] && (e[r] = n.shape[r]);
			}
			return p(this, "shape", e), e;
		},
		checks: []
	}));
}
function ue(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	return v(e, m(e._zod.def, {
		get shape() {
			let r = { ...e._zod.def.shape };
			for (let e in t) {
				if (!(e in n.shape)) throw Error(`Unrecognized key: "${e}"`);
				t[e] && delete r[e];
			}
			return p(this, "shape", r), r;
		},
		checks: []
	}));
}
function de(e, t) {
	if (!g(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = e._zod.def.shape;
		for (let e in t) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return v(e, m(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return p(this, "shape", n), n;
	} }));
}
function fe(e, t) {
	if (!g(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return v(e, m(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return p(this, "shape", n), n;
	} }));
}
function pe(e, t) {
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	return v(e, m(e._zod.def, {
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t._zod.def.shape
			};
			return p(this, "shape", n), n;
		},
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function me(e, t, n) {
	let r = t._zod.def.checks;
	if (r && r.length > 0) throw Error(".partial() cannot be used on object schemas containing refinements");
	return v(t, m(t._zod.def, {
		get shape() {
			let r = t._zod.def.shape, i = { ...r };
			if (n) for (let t in n) {
				if (!(t in r)) throw Error(`Unrecognized key: "${t}"`);
				n[t] && (i[t] = e ? new e({
					type: "optional",
					innerType: r[t]
				}) : r[t]);
			}
			else for (let t in r) i[t] = e ? new e({
				type: "optional",
				innerType: r[t]
			}) : r[t];
			return p(this, "shape", i), i;
		},
		checks: []
	}));
}
function he(e, t, n) {
	return v(t, m(t._zod.def, { get shape() {
		let r = t._zod.def.shape, i = { ...r };
		if (n) for (let t in n) {
			if (!(t in i)) throw Error(`Unrecognized key: "${t}"`);
			n[t] && (i[t] = new e({
				type: "nonoptional",
				innerType: r[t]
			}));
		}
		else for (let t in r) i[t] = new e({
			type: "nonoptional",
			innerType: r[t]
		});
		return p(this, "shape", i), i;
	} }));
}
function b(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function ge(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function x(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function _e(e) {
	return typeof e == "string" ? e : e?.message;
}
function S(e, t, n) {
	let r = e.message ? e.message : _e(e.inst?._zod.def?.error?.(e)) ?? _e(t?.error?.(e)) ?? _e(n.customError?.(e)) ?? _e(n.localeError?.(e)) ?? "Invalid input", { inst: i, continue: a, input: o, ...s } = e;
	return s.path ??= [], s.message = r, t?.reportInput && (s.input = o), s;
}
function ve(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function C(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
//#endregion
//#region node_modules/zod/v4/core/errors.js
var ye = (e, t) => {
	e.name = "$ZodError", Object.defineProperty(e, "_zod", {
		value: e._zod,
		enumerable: !1
	}), Object.defineProperty(e, "issues", {
		value: t,
		enumerable: !1
	}), e.message = JSON.stringify(t, s, 2), Object.defineProperty(e, "toString", {
		value: () => e.message,
		enumerable: !1
	});
}, be = t("$ZodError", ye), xe = t("$ZodError", ye, { Parent: Error });
function Se(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(t(i))) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Ce(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e, i = []) => {
		for (let a of e.issues) if (a.code === "invalid_union" && a.errors.length) a.errors.map((e) => r({ issues: e }, [...i, ...a.path]));
		else if (a.code === "invalid_key") r({ issues: a.issues }, [...i, ...a.path]);
		else if (a.code === "invalid_element") r({ issues: a.issues }, [...i, ...a.path]);
		else {
			let e = [...i, ...a.path];
			if (e.length === 0) n._errors.push(t(a));
			else {
				let r = n, i = 0;
				for (; i < e.length;) {
					let n = e[i];
					i === e.length - 1 ? (r[n] = r[n] || { _errors: [] }, r[n]._errors.push(t(a))) : r[n] = r[n] || { _errors: [] }, r = r[n], i++;
				}
			}
		}
	};
	return r(e), n;
}
//#endregion
//#region node_modules/zod/v4/core/parse.js
var we = (e) => (t, r, i, o) => {
	let s = i ? {
		...i,
		async: !1
	} : { async: !1 }, c = t._zod.run({
		value: r,
		issues: []
	}, s);
	if (c instanceof Promise) throw new n();
	if (c.issues.length) {
		let t = new ((o?.Err) ?? e)(c.issues.map((e) => S(e, s, a())));
		throw re(t, o?.callee), t;
	}
	return c.value;
}, Te = (e) => async (t, n, r, i) => {
	let o = r ? {
		...r,
		async: !0
	} : { async: !0 }, s = t._zod.run({
		value: n,
		issues: []
	}, o);
	if (s instanceof Promise && (s = await s), s.issues.length) {
		let t = new ((i?.Err) ?? e)(s.issues.map((e) => S(e, o, a())));
		throw re(t, i?.callee), t;
	}
	return s.value;
}, Ee = (e) => (t, r, i) => {
	let o = i ? {
		...i,
		async: !1
	} : { async: !1 }, s = t._zod.run({
		value: r,
		issues: []
	}, o);
	if (s instanceof Promise) throw new n();
	return s.issues.length ? {
		success: !1,
		error: new (e ?? be)(s.issues.map((e) => S(e, o, a())))
	} : {
		success: !0,
		data: s.value
	};
}, De = /* @__PURE__*/ Ee(xe), Oe = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, o = t._zod.run({
		value: n,
		issues: []
	}, i);
	return o instanceof Promise && (o = await o), o.issues.length ? {
		success: !1,
		error: new e(o.issues.map((e) => S(e, i, a())))
	} : {
		success: !0,
		data: o.value
	};
}, ke = /* @__PURE__*/ Oe(xe), Ae = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return we(e)(t, n, i);
}, je = (e) => (t, n, r) => we(e)(t, n, r), Me = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Te(e)(t, n, i);
}, Ne = (e) => async (t, n, r) => Te(e)(t, n, r), Pe = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Ee(e)(t, n, i);
}, Fe = (e) => (t, n, r) => Ee(e)(t, n, r), Ie = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Oe(e)(t, n, i);
}, Le = (e) => async (t, n, r) => Oe(e)(t, n, r), Re = /^[cC][0-9a-z]{6,}$/, ze = /^[0-9a-z]+$/, Be = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Ve = /^[0-9a-vA-V]{20}$/, He = /^[A-Za-z0-9]{27}$/, Ue = /^[a-zA-Z0-9_-]{21}$/, We = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Ge = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Ke = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, qe = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Je = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Ye() {
	return new RegExp(Je, "u");
}
var Xe = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ze = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Qe = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, $e = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, et = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, tt = /^[A-Za-z0-9_-]*$/, nt = /^https?$/, rt = /^\+[1-9]\d{6,14}$/, it = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", at = /*@__PURE__*/ RegExp(`^${it}$`);
function ot(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function st(e) {
	return RegExp(`^${ot(e)}$`);
}
function ct(e) {
	let t = ot({ precision: e.precision }), n = ["Z"];
	e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let r = `${t}(?:${n.join("|")})`;
	return RegExp(`^${it}T(?:${r})$`);
}
var lt = (e) => {
	let t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
	return RegExp(`^${t}$`);
}, ut = /^-?\d+$/, dt = /^-?\d+(?:\.\d+)?$/, ft = /^(?:true|false)$/i, pt = /^null$/i, mt = /^[^A-Z]*$/, ht = /^[^a-z]*$/, w = /*@__PURE__*/ t("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), gt = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, _t = /*@__PURE__*/ t("$ZodCheckLessThan", (e, t) => {
	w.init(e, t);
	let n = gt[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.maximum : n.exclusiveMaximum) ?? Infinity;
		t.value < r && (t.inclusive ? n.maximum = t.value : n.exclusiveMaximum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), vt = /*@__PURE__*/ t("$ZodCheckGreaterThan", (e, t) => {
	w.init(e, t);
	let n = gt[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.minimum : n.exclusiveMinimum) ?? -Infinity;
		t.value > r && (t.inclusive ? n.minimum = t.value : n.exclusiveMinimum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), yt = /*@__PURE__*/ t("$ZodCheckMultipleOf", (e, t) => {
	w.init(e, t), e._zod.onattach.push((e) => {
		var n;
		(n = e._zod.bag).multipleOf ?? (n.multipleOf = t.value);
	}), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : d(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), bt = /*@__PURE__*/ t("$ZodCheckNumberFormat", (e, t) => {
	w.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = ce[t.format];
	e._zod.onattach.push((e) => {
		let r = e._zod.bag;
		r.format = t.format, r.minimum = i, r.maximum = a, n && (r.pattern = ut);
	}), e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), xt = /*@__PURE__*/ t("$ZodCheckMaxLength", (e, t) => {
	var n;
	w.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !l(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.maximum ?? Infinity;
		t.maximum < n && (e._zod.bag.maximum = t.maximum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length <= t.maximum) return;
		let i = ve(r);
		n.issues.push({
			origin: i,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), St = /*@__PURE__*/ t("$ZodCheckMinLength", (e, t) => {
	var n;
	w.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !l(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.minimum ?? -Infinity;
		t.minimum > n && (e._zod.bag.minimum = t.minimum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length >= t.minimum) return;
		let i = ve(r);
		n.issues.push({
			origin: i,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Ct = /*@__PURE__*/ t("$ZodCheckLengthEquals", (e, t) => {
	var n;
	w.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !l(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.minimum = t.length, n.maximum = t.length, n.length = t.length;
	}), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if (i === t.length) return;
		let a = ve(r), o = i > t.length;
		n.issues.push({
			origin: a,
			...o ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), wt = /*@__PURE__*/ t("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	w.init(e, t), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.format = t.format, t.pattern && (n.patterns ??= /* @__PURE__ */ new Set(), n.patterns.add(t.pattern));
	}), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), Tt = /*@__PURE__*/ t("$ZodCheckRegex", (e, t) => {
	wt.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), Et = /*@__PURE__*/ t("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= mt, wt.init(e, t);
}), Dt = /*@__PURE__*/ t("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= ht, wt.init(e, t);
}), Ot = /*@__PURE__*/ t("$ZodCheckIncludes", (e, t) => {
	w.init(e, t);
	let n = _(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
	t.pattern = r, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(r);
	}), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), kt = /*@__PURE__*/ t("$ZodCheckStartsWith", (e, t) => {
	w.init(e, t);
	let n = RegExp(`^${_(t.prefix)}.*`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), At = /*@__PURE__*/ t("$ZodCheckEndsWith", (e, t) => {
	w.init(e, t);
	let n = RegExp(`.*${_(t.suffix)}$`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), jt = /*@__PURE__*/ t("$ZodCheckOverwrite", (e, t) => {
	w.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Mt = class {
	constructor(e = []) {
		this.content = [], this.indent = 0, this && (this.args = e);
	}
	indented(e) {
		this.indent += 1, e(this), --this.indent;
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.args, n = [...(this?.content ?? [""]).map((e) => `  ${e}`)];
		return new e(...t, n.join("\n"));
	}
}, Nt = {
	major: 4,
	minor: 4,
	patch: 3
}, T = /*@__PURE__*/ t("$ZodType", (e, t) => {
	var r;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Nt;
	let i = [...e._zod.def.checks ?? []];
	e._zod.traits.has("$ZodCheck") && i.unshift(e);
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (r = e._zod).deferred ?? (r.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (e, t, r) => {
			let i = b(e), a;
			for (let o of t) {
				if (o._zod.def.when) {
					if (ge(e) || !o._zod.def.when(e)) continue;
				} else if (i) continue;
				let t = e.issues.length, s = o._zod.check(e);
				if (s instanceof Promise && r?.async === !1) throw new n();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, e.issues.length !== t && (i ||= b(e, t));
				});
				else {
					if (e.issues.length === t) continue;
					i ||= b(e, t);
				}
			}
			return a ? a.then(() => e) : e;
		}, r = (r, a, o) => {
			if (b(r)) return r.aborted = !0, r;
			let s = t(a, i, o);
			if (s instanceof Promise) {
				if (o.async === !1) throw new n();
				return s.then((t) => e._zod.parse(t, o));
			}
			return e._zod.parse(s, o);
		};
		e._zod.run = (a, o) => {
			if (o.skipChecks) return e._zod.parse(a, o);
			if (o.direction === "backward") {
				let t = e._zod.parse({
					value: a.value,
					issues: []
				}, {
					...o,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => r(e, a, o)) : r(t, a, o);
			}
			let s = e._zod.parse(a, o);
			if (s instanceof Promise) {
				if (o.async === !1) throw new n();
				return s.then((e) => t(e, i, o));
			}
			return t(s, i, o);
		};
	}
	f(e, "~standard", () => ({
		validate: (t) => {
			try {
				let n = De(e, t);
				return n.success ? { value: n.data } : { issues: n.error?.issues };
			} catch {
				return ke(e, t).then((e) => e.success ? { value: e.data } : { issues: e.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	}));
}), Pt = /*@__PURE__*/ t("$ZodString", (e, t) => {
	T.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? lt(e._zod.bag), e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), E = /*@__PURE__*/ t("$ZodStringFormat", (e, t) => {
	wt.init(e, t), Pt.init(e, t);
}), Ft = /*@__PURE__*/ t("$ZodGUID", (e, t) => {
	t.pattern ??= Ge, E.init(e, t);
}), It = /*@__PURE__*/ t("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= Ke(e);
	} else t.pattern ??= Ke();
	E.init(e, t);
}), Lt = /*@__PURE__*/ t("$ZodEmail", (e, t) => {
	t.pattern ??= qe, E.init(e, t);
}), Rt = /*@__PURE__*/ t("$ZodURL", (e, t) => {
	E.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim();
			if (!t.normalize && t.protocol?.source === nt.source && !/^https?:\/\//i.test(r)) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			let i = new URL(r);
			t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(i.hostname) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(i.protocol.endsWith(":") ? i.protocol.slice(0, -1) : i.protocol) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), n.value = t.normalize ? i.href : r;
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), zt = /*@__PURE__*/ t("$ZodEmoji", (e, t) => {
	t.pattern ??= Ye(), E.init(e, t);
}), Bt = /*@__PURE__*/ t("$ZodNanoID", (e, t) => {
	t.pattern ??= Ue, E.init(e, t);
}), Vt = /*@__PURE__*/ t("$ZodCUID", (e, t) => {
	t.pattern ??= Re, E.init(e, t);
}), Ht = /*@__PURE__*/ t("$ZodCUID2", (e, t) => {
	t.pattern ??= ze, E.init(e, t);
}), Ut = /*@__PURE__*/ t("$ZodULID", (e, t) => {
	t.pattern ??= Be, E.init(e, t);
}), Wt = /*@__PURE__*/ t("$ZodXID", (e, t) => {
	t.pattern ??= Ve, E.init(e, t);
}), Gt = /*@__PURE__*/ t("$ZodKSUID", (e, t) => {
	t.pattern ??= He, E.init(e, t);
}), Kt = /*@__PURE__*/ t("$ZodISODateTime", (e, t) => {
	t.pattern ??= ct(t), E.init(e, t);
}), qt = /*@__PURE__*/ t("$ZodISODate", (e, t) => {
	t.pattern ??= at, E.init(e, t);
}), Jt = /*@__PURE__*/ t("$ZodISOTime", (e, t) => {
	t.pattern ??= st(t), E.init(e, t);
}), Yt = /*@__PURE__*/ t("$ZodISODuration", (e, t) => {
	t.pattern ??= We, E.init(e, t);
}), Xt = /*@__PURE__*/ t("$ZodIPv4", (e, t) => {
	t.pattern ??= Xe, E.init(e, t), e._zod.bag.format = "ipv4";
}), Zt = /*@__PURE__*/ t("$ZodIPv6", (e, t) => {
	t.pattern ??= Ze, E.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
		try {
			new URL(`http://[${n.value}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), Qt = /*@__PURE__*/ t("$ZodCIDRv4", (e, t) => {
	t.pattern ??= Qe, E.init(e, t);
}), $t = /*@__PURE__*/ t("$ZodCIDRv6", (e, t) => {
	t.pattern ??= $e, E.init(e, t), e._zod.check = (n) => {
		let r = n.value.split("/");
		try {
			if (r.length !== 2) throw Error();
			let [e, t] = r;
			if (!t) throw Error();
			let n = Number(t);
			if (`${n}` !== t || n < 0 || n > 128) throw Error();
			new URL(`http://[${e}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
});
function en(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var tn = /*@__PURE__*/ t("$ZodBase64", (e, t) => {
	t.pattern ??= et, E.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
		en(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function nn(e) {
	if (!tt.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return en(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var rn = /*@__PURE__*/ t("$ZodBase64URL", (e, t) => {
	t.pattern ??= tt, E.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
		nn(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), an = /*@__PURE__*/ t("$ZodE164", (e, t) => {
	t.pattern ??= rt, E.init(e, t);
});
function on(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var sn = /*@__PURE__*/ t("$ZodJWT", (e, t) => {
	E.init(e, t), e._zod.check = (n) => {
		on(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), cn = /*@__PURE__*/ t("$ZodNumber", (e, t) => {
	T.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? dt, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : "Infinity" : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), ln = /*@__PURE__*/ t("$ZodNumberFormat", (e, t) => {
	bt.init(e, t), cn.init(e, t);
}), un = /*@__PURE__*/ t("$ZodBoolean", (e, t) => {
	T.init(e, t), e._zod.pattern = ft, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), dn = /*@__PURE__*/ t("$ZodNull", (e, t) => {
	T.init(e, t), e._zod.pattern = pt, e._zod.values = /* @__PURE__ */ new Set([null]), e._zod.parse = (t, n) => {
		let r = t.value;
		return r === null || t.issues.push({
			expected: "null",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
	};
}), fn = /*@__PURE__*/ t("$ZodUnknown", (e, t) => {
	T.init(e, t), e._zod.parse = (e) => e;
}), pn = /*@__PURE__*/ t("$ZodNever", (e, t) => {
	T.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function mn(e, t, n) {
	e.issues.length && t.issues.push(...x(n, e.issues)), t.value[n] = e.value;
}
var hn = /*@__PURE__*/ t("$ZodArray", (e, t) => {
	T.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!Array.isArray(i)) return n.issues.push({
			expected: "array",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		n.value = Array(i.length);
		let a = [];
		for (let e = 0; e < i.length; e++) {
			let o = i[e], s = t.element._zod.run({
				value: o,
				issues: []
			}, r);
			s instanceof Promise ? a.push(s.then((t) => mn(t, n, e))) : mn(s, n, e);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function gn(e, t, n, r, i, a) {
	let o = n in r;
	if (e.issues.length) {
		if (i && a && !o) return;
		t.issues.push(...x(n, e.issues));
	}
	if (!o && !i) {
		e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		});
		return;
	}
	e.value === void 0 ? o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function _n(e) {
	let t = Object.keys(e.shape);
	for (let n of t) if (!e.shape?.[n]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${n}": expected a Zod schema`);
	let n = se(e.shape);
	return {
		...e,
		keys: t,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(n)
	};
}
function vn(e, t, n, r, i, a) {
	let o = [], s = i.keySet, c = i.catchall._zod, l = c.def.type, u = c.optin === "optional", d = c.optout === "optional";
	for (let i in t) {
		if (i === "__proto__" || s.has(i)) continue;
		if (l === "never") {
			o.push(i);
			continue;
		}
		let a = c.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => gn(e, n, i, t, u, d))) : gn(a, n, i, t, u, d);
	}
	return o.length && n.issues.push({
		code: "unrecognized_keys",
		keys: o,
		input: t,
		inst: a
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var yn = /*@__PURE__*/ t("$ZodObject", (e, t) => {
	if (T.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
		let e = t.shape;
		Object.defineProperty(t, "shape", { get: () => {
			let n = { ...e };
			return Object.defineProperty(t, "shape", { value: n }), n;
		} });
	}
	let n = c(() => _n(t));
	f(e._zod, "propValues", () => {
		let e = t.shape, n = {};
		for (let t in e) {
			let r = e[t]._zod;
			if (r.values) {
				n[t] ?? (n[t] = /* @__PURE__ */ new Set());
				for (let e of r.values) n[t].add(e);
			}
		}
		return n;
	});
	let r = h, i = t.catchall, a;
	e._zod.parse = (t, o) => {
		a ??= n.value;
		let s = t.value;
		if (!r(s)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: s,
			inst: e
		}), t;
		t.value = {};
		let c = [], l = a.shape;
		for (let e of a.keys) {
			let n = l[e], r = n._zod.optin === "optional", i = n._zod.optout === "optional", a = n._zod.run({
				value: s[e],
				issues: []
			}, o);
			a instanceof Promise ? c.push(a.then((n) => gn(n, t, e, s, r, i))) : gn(a, t, e, s, r, i);
		}
		return i ? vn(c, s, t, o, n.value, e) : c.length ? Promise.all(c).then(() => t) : t;
	};
}), bn = /*@__PURE__*/ t("$ZodObjectJIT", (e, t) => {
	yn.init(e, t);
	let n = e._zod.parse, r = c(() => _n(t)), a = (e) => {
		let t = new Mt([
			"shape",
			"payload",
			"ctx"
		]), n = r.value, i = (e) => {
			let t = te(e);
			return `shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`;
		};
		t.write("const input = payload.value;");
		let a = Object.create(null), o = 0;
		for (let e of n.keys) a[e] = `key_${o++}`;
		t.write("const newResult = {};");
		for (let r of n.keys) {
			let n = a[r], o = te(r), s = e[r], c = s?._zod?.optin === "optional", l = s?._zod?.optout === "optional";
			t.write(`const ${n} = ${i(r)};`), c && l ? t.write(`
        if (${n}.issues.length) {
          if (${o} in input) {
            payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${o}, ...iss.path] : [${o}]
            })));
          }
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : c ? t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : t.write(`
        const ${n}_present = ${o} in input;
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${o}]
          });
        }

        if (${n}_present) {
          if (${n}.value === undefined) {
            newResult[${o}] = undefined;
          } else {
            newResult[${o}] = ${n}.value;
          }
        }

      `);
		}
		t.write("payload.value = newResult;"), t.write("return payload;");
		let s = t.compile();
		return (t, n) => s(e, t, n);
	}, o, s = h, l = !i.jitless, u = l && ie.value, d = t.catchall, ee;
	e._zod.parse = (i, c) => {
		ee ??= r.value;
		let f = i.value;
		return s(f) ? l && u && c?.async === !1 && c.jitless !== !0 ? (o ||= a(t.shape), i = o(i, c), d ? vn([], f, i, c, ee, e) : i) : n(i, c) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: f,
			inst: e
		}), i);
	};
});
function xn(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !b(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => S(e, r, a())))
	}), t);
}
var Sn = /*@__PURE__*/ t("$ZodUnion", (e, t) => {
	T.init(e, t), f(e._zod, "optin", () => t.options.some((e) => e._zod.optin === "optional") ? "optional" : void 0), f(e._zod, "optout", () => t.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), f(e._zod, "values", () => {
		if (t.options.every((e) => e._zod.values)) return new Set(t.options.flatMap((e) => Array.from(e._zod.values)));
	}), f(e._zod, "pattern", () => {
		if (t.options.every((e) => e._zod.pattern)) {
			let e = t.options.map((e) => e._zod.pattern);
			return RegExp(`^(${e.map((e) => u(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1 ? t.options[0]._zod.run : null;
	e._zod.parse = (r, i) => {
		if (n) return n(r, i);
		let a = !1, o = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: r.value,
				issues: []
			}, i);
			if (t instanceof Promise) o.push(t), a = !0;
			else {
				if (t.issues.length === 0) return t;
				o.push(t);
			}
		}
		return a ? Promise.all(o).then((t) => xn(t, r, e, i)) : xn(o, r, e, i);
	};
}), Cn = /*@__PURE__*/ t("$ZodDiscriminatedUnion", (e, t) => {
	t.inclusive = !1, Sn.init(e, t);
	let n = e._zod.parse;
	f(e._zod, "propValues", () => {
		let e = {};
		for (let n of t.options) {
			let r = n._zod.propValues;
			if (!r || Object.keys(r).length === 0) throw Error(`Invalid discriminated union option at index "${t.options.indexOf(n)}"`);
			for (let [t, n] of Object.entries(r)) {
				e[t] || (e[t] = /* @__PURE__ */ new Set());
				for (let r of n) e[t].add(r);
			}
		}
		return e;
	});
	let r = c(() => {
		let e = t.options, n = /* @__PURE__ */ new Map();
		for (let r of e) {
			let e = r._zod.propValues?.[t.discriminator];
			if (!e || e.size === 0) throw Error(`Invalid discriminated union option at index "${t.options.indexOf(r)}"`);
			for (let t of e) {
				if (n.has(t)) throw Error(`Duplicate discriminator value "${String(t)}"`);
				n.set(t, r);
			}
		}
		return n;
	});
	e._zod.parse = (i, a) => {
		let o = i.value;
		if (!h(o)) return i.issues.push({
			code: "invalid_type",
			expected: "object",
			input: o,
			inst: e
		}), i;
		let s = r.value.get(o?.[t.discriminator]);
		return s ? s._zod.run(i, a) : t.unionFallback || a.direction === "backward" ? n(i, a) : (i.issues.push({
			code: "invalid_union",
			errors: [],
			note: "No matching discriminator",
			discriminator: t.discriminator,
			options: Array.from(r.value.keys()),
			input: o,
			path: [t.discriminator],
			inst: e
		}), i);
	};
}), wn = /*@__PURE__*/ t("$ZodIntersection", (e, t) => {
	T.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => En(e, t, n)) : En(e, i, a);
	};
});
function Tn(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (g(e) && g(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = Tn(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = Tn(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function En(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i;
	for (let n of t.issues) if (n.code === "unrecognized_keys") {
		i ??= n;
		for (let e of n.keys) r.has(e) || r.set(e, {}), r.get(e).l = !0;
	} else e.issues.push(n);
	for (let t of n.issues) if (t.code === "unrecognized_keys") for (let e of t.keys) r.has(e) || r.set(e, {}), r.get(e).r = !0;
	else e.issues.push(t);
	let a = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (a.length && i && e.issues.push({
		...i,
		keys: a
	}), b(e)) return e;
	let o = Tn(t.value, n.value);
	if (!o.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);
	return e.value = o.data, e;
}
var Dn = /*@__PURE__*/ t("$ZodRecord", (e, t) => {
	T.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!g(i)) return n.issues.push({
			expected: "record",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		let o = [], s = t.keyType._zod.values;
		if (s) {
			n.value = {};
			let c = /* @__PURE__ */ new Set();
			for (let l of s) if (typeof l == "string" || typeof l == "number" || typeof l == "symbol") {
				c.add(typeof l == "number" ? l.toString() : l);
				let s = t.keyType._zod.run({
					value: l,
					issues: []
				}, r);
				if (s instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (s.issues.length) {
					n.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: s.issues.map((e) => S(e, r, a())),
						input: l,
						path: [l],
						inst: e
					});
					continue;
				}
				let u = s.value, d = t.valueType._zod.run({
					value: i[l],
					issues: []
				}, r);
				d instanceof Promise ? o.push(d.then((e) => {
					e.issues.length && n.issues.push(...x(l, e.issues)), n.value[u] = e.value;
				})) : (d.issues.length && n.issues.push(...x(l, d.issues)), n.value[u] = d.value);
			}
			let l;
			for (let e in i) c.has(e) || (l ??= [], l.push(e));
			l && l.length > 0 && n.issues.push({
				code: "unrecognized_keys",
				input: i,
				inst: e,
				keys: l
			});
		} else {
			n.value = {};
			for (let s of Reflect.ownKeys(i)) {
				if (s === "__proto__" || !Object.prototype.propertyIsEnumerable.call(i, s)) continue;
				let c = t.keyType._zod.run({
					value: s,
					issues: []
				}, r);
				if (c instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (typeof s == "string" && dt.test(s) && c.issues.length) {
					let e = t.keyType._zod.run({
						value: Number(s),
						issues: []
					}, r);
					if (e instanceof Promise) throw Error("Async schemas not supported in object keys currently");
					e.issues.length === 0 && (c = e);
				}
				if (c.issues.length) {
					t.mode === "loose" ? n.value[s] = i[s] : n.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: c.issues.map((e) => S(e, r, a())),
						input: s,
						path: [s],
						inst: e
					});
					continue;
				}
				let l = t.valueType._zod.run({
					value: i[s],
					issues: []
				}, r);
				l instanceof Promise ? o.push(l.then((e) => {
					e.issues.length && n.issues.push(...x(s, e.issues)), n.value[c.value] = e.value;
				})) : (l.issues.length && n.issues.push(...x(s, l.issues)), n.value[c.value] = l.value);
			}
		}
		return o.length ? Promise.all(o).then(() => n) : n;
	};
}), On = /*@__PURE__*/ t("$ZodEnum", (e, t) => {
	T.init(e, t);
	let n = o(t.entries), r = new Set(n);
	e._zod.values = r, e._zod.pattern = RegExp(`^(${n.filter((e) => oe.has(typeof e)).map((e) => typeof e == "string" ? _(e) : e.toString()).join("|")})$`), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), kn = /*@__PURE__*/ t("$ZodLiteral", (e, t) => {
	if (T.init(e, t), t.values.length === 0) throw Error("Cannot create literal schema with no valid values");
	let n = new Set(t.values);
	e._zod.values = n, e._zod.pattern = RegExp(`^(${t.values.map((e) => typeof e == "string" ? _(e) : e ? _(e.toString()) : String(e)).join("|")})$`), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), An = /*@__PURE__*/ t("$ZodTransform", (e, t) => {
	T.init(e, t), e._zod.optin = "optional", e._zod.parse = (i, a) => {
		if (a.direction === "backward") throw new r(e.constructor.name);
		let o = t.transform(i.value, i);
		if (a.async) return (o instanceof Promise ? o : Promise.resolve(o)).then((e) => (i.value = e, i.fallback = !0, i));
		if (o instanceof Promise) throw new n();
		return i.value = o, i.fallback = !0, i;
	};
});
function jn(e, t) {
	return t === void 0 && (e.issues.length || e.fallback) ? {
		issues: [],
		value: void 0
	} : e;
}
var Mn = /*@__PURE__*/ t("$ZodOptional", (e, t) => {
	T.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", f(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), f(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${u(e.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (t.innerType._zod.optin === "optional") {
			let r = e.value, i = t.innerType._zod.run(e, n);
			return i instanceof Promise ? i.then((e) => jn(e, r)) : jn(i, r);
		}
		return e.value === void 0 ? e : t.innerType._zod.run(e, n);
	};
}), Nn = /*@__PURE__*/ t("$ZodExactOptional", (e, t) => {
	Mn.init(e, t), f(e._zod, "values", () => t.innerType._zod.values), f(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Pn = /*@__PURE__*/ t("$ZodNullable", (e, t) => {
	T.init(e, t), f(e._zod, "optin", () => t.innerType._zod.optin), f(e._zod, "optout", () => t.innerType._zod.optout), f(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${u(e.source)}|null)$`) : void 0;
	}), f(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Fn = /*@__PURE__*/ t("$ZodDefault", (e, t) => {
	T.init(e, t), e._zod.optin = "optional", f(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => In(e, t)) : In(r, t);
	};
});
function In(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var Ln = /*@__PURE__*/ t("$ZodPrefault", (e, t) => {
	T.init(e, t), e._zod.optin = "optional", f(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), Rn = /*@__PURE__*/ t("$ZodNonOptional", (e, t) => {
	T.init(e, t), f(e._zod, "values", () => {
		let e = t.innerType._zod.values;
		return e ? new Set([...e].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => zn(t, e)) : zn(i, e);
	};
});
function zn(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
var Bn = /*@__PURE__*/ t("$ZodCatch", (e, t) => {
	T.init(e, t), e._zod.optin = "optional", f(e._zod, "optout", () => t.innerType._zod.optout), f(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((r) => (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => S(e, n, a())) },
			input: e.value
		}), e.issues = [], e.fallback = !0), e)) : (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => S(e, n, a())) },
			input: e.value
		}), e.issues = [], e.fallback = !0), e);
	};
}), Vn = /*@__PURE__*/ t("$ZodPipe", (e, t) => {
	T.init(e, t), f(e._zod, "values", () => t.in._zod.values), f(e._zod, "optin", () => t.in._zod.optin), f(e._zod, "optout", () => t.out._zod.optout), f(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Hn(e, t.in, n)) : Hn(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Hn(e, t.out, n)) : Hn(r, t.out, n);
	};
});
function Hn(e, t, n) {
	return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues,
		fallback: e.fallback
	}, n);
}
var Un = /*@__PURE__*/ t("$ZodPreprocess", (e, t) => {
	Vn.init(e, t);
}), Wn = /*@__PURE__*/ t("$ZodReadonly", (e, t) => {
	T.init(e, t), f(e._zod, "propValues", () => t.innerType._zod.propValues), f(e._zod, "values", () => t.innerType._zod.values), f(e._zod, "optin", () => t.innerType?._zod?.optin), f(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(Gn) : Gn(r);
	};
});
function Gn(e) {
	return e.value = Object.freeze(e.value), e;
}
var Kn = /*@__PURE__*/ t("$ZodCustom", (e, t) => {
	w.init(e, t), T.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => qn(t, n, r, e));
		qn(i, n, r, e);
	};
});
function qn(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(C(e));
	}
}
//#endregion
//#region node_modules/zod/v4/core/registries.js
var Jn, Yn = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function Xn() {
	return new Yn();
}
(Jn = globalThis).__zod_globalRegistry ?? (Jn.__zod_globalRegistry = Xn());
var Zn = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function Qn(e, t) {
	return new e({
		type: "string",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $n(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function er(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function tr(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function nr(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function rr(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ir(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ar(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function or(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sr(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function cr(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function lr(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ur(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function dr(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fr(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pr(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function mr(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function hr(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function gr(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function _r(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function vr(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function yr(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function br(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xr(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Sr(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Cr(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wr(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Tr(e, t) {
	return new e({
		type: "number",
		checks: [],
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Er(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Dr(e, t) {
	return new e({
		type: "boolean",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Or(e, t) {
	return new e({
		type: "null",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function kr(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Ar(e, t) {
	return new e({
		type: "never",
		...y(t)
	});
}
// @__NO_SIDE_EFFECTS__
function jr(e, t) {
	return new _t({
		check: "less_than",
		...y(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Mr(e, t) {
	return new _t({
		check: "less_than",
		...y(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Nr(e, t) {
	return new vt({
		check: "greater_than",
		...y(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Pr(e, t) {
	return new vt({
		check: "greater_than",
		...y(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Fr(e, t) {
	return new yt({
		check: "multiple_of",
		...y(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ir(e, t) {
	return new xt({
		check: "max_length",
		...y(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Lr(e, t) {
	return new St({
		check: "min_length",
		...y(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Rr(e, t) {
	return new Ct({
		check: "length_equals",
		...y(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function zr(e, t) {
	return new Tt({
		check: "string_format",
		format: "regex",
		...y(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Br(e) {
	return new Et({
		check: "string_format",
		format: "lowercase",
		...y(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Vr(e) {
	return new Dt({
		check: "string_format",
		format: "uppercase",
		...y(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Hr(e, t) {
	return new Ot({
		check: "string_format",
		format: "includes",
		...y(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ur(e, t) {
	return new kt({
		check: "string_format",
		format: "starts_with",
		...y(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Wr(e, t) {
	return new At({
		check: "string_format",
		format: "ends_with",
		...y(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function D(e) {
	return new jt({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Gr(e) {
	return /* @__PURE__ */ D((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Kr() {
	return /* @__PURE__ */ D((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function qr() {
	return /* @__PURE__ */ D((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Jr() {
	return /* @__PURE__ */ D((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Yr() {
	return /* @__PURE__ */ D((e) => ne(e));
}
// @__NO_SIDE_EFFECTS__
function Xr(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...y(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Zr(e, t, n) {
	let r = y(n);
	return r.abort ??= !0, new e({
		type: "custom",
		check: "custom",
		fn: t,
		...r
	});
}
// @__NO_SIDE_EFFECTS__
function Qr(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...y(n)
	});
}
// @__NO_SIDE_EFFECTS__
function $r(e, t) {
	let n = /* @__PURE__ */ ei((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(C(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", r.input ??= t.value, r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(C(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function ei(e, t) {
	let n = new w({
		check: "custom",
		...y(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/zod/v4/core/to-json-schema.js
function ti(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Zn,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		external: e?.external ?? void 0
	};
}
function O(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o);
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, O(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Object.assign(o.schema, c), t.io === "input" && k(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function ni(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${a}`
			};
		}
		if (t[1] === n) return { ref: "#" };
		let i = `#/${r}/`, a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + a
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			a(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				a(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			a(n);
			continue;
		}
		if (r.cycle) {
			a(n);
			continue;
		}
		if (r.count > 1 && e.reused === "ref") {
			a(n);
			continue;
		}
	}
}
function ri(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Object.assign(i, s), Object.assign(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
			if (s.$ref && n.def) for (let e in i) e !== "$ref" && e !== "allOf" && e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e !== "$ref" && e !== "allOf" && e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	for (let t of [...e.seen.entries()].reverse()) r(t[0]);
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Object.assign(i, n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, o[e.defId] = e.def);
	}
	e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: ai(t, "input", e.processors),
					output: ai(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function k(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return k(r.element, n);
	if (r.type === "set") return k(r.valueType, n);
	if (r.type === "lazy") return k(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return k(r.innerType, n);
	if (r.type === "intersection") return k(r.left, n) || k(r.right, n);
	if (r.type === "record" || r.type === "map") return k(r.keyType, n) || k(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : k(r.in, n) || k(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (k(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (k(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (k(e, n)) return !0;
		return !!(r.rest && k(r.rest, n));
	}
	return !1;
}
var ii = (e, t = {}) => (n) => {
	let r = ti({
		...n,
		processors: t
	});
	return O(e, r), ni(r, e), ri(r, e);
}, ai = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = ti({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return O(e, o), ni(o, e), ri(o, e);
}, oi = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, si = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l } = e._zod.bag;
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = oi[s] ?? s, i.format === "" && delete i.format, s === "time" && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c];
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, ci = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, format: s, multipleOf: c, exclusiveMaximum: l, exclusiveMinimum: u } = e._zod.bag;
	i.type = typeof s == "string" && s.includes("int") ? "integer" : "number";
	let d = typeof u == "number" && u >= (a ?? -Infinity), ee = typeof l == "number" && l <= (o ?? Infinity), f = t.target === "draft-04" || t.target === "openapi-3.0";
	d ? f ? (i.minimum = u, i.exclusiveMinimum = !0) : i.exclusiveMinimum = u : typeof a == "number" && (i.minimum = a), ee ? f ? (i.maximum = l, i.exclusiveMaximum = !0) : i.exclusiveMaximum = l : typeof o == "number" && (i.maximum = o), typeof c == "number" && (i.multipleOf = c);
}, li = (e, t, n, r) => {
	n.type = "boolean";
}, ui = (e, t, n, r) => {
	t.target === "openapi-3.0" ? (n.type = "string", n.nullable = !0, n.enum = [null]) : n.type = "null";
}, di = (e, t, n, r) => {
	n.not = {};
}, fi = (e, t, n, r) => {
	let i = e._zod.def, a = o(i.entries);
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, pi = (e, t, n, r) => {
	let i = e._zod.def, a = [];
	for (let e of i.values) if (e === void 0) {
		if (t.unrepresentable === "throw") throw Error("Literal `undefined` cannot be represented in JSON Schema");
	} else if (typeof e == "bigint") {
		if (t.unrepresentable === "throw") throw Error("BigInt literals cannot be represented in JSON Schema");
		a.push(Number(e));
	} else a.push(e);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, mi = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Custom types cannot be represented in JSON Schema");
}, hi = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Transforms cannot be represented in JSON Schema");
}, gi = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = e._zod.bag;
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = O(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
}, _i = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object", i.properties = {};
	let o = a.shape;
	for (let e in o) i.properties[e] = O(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	});
	let s = new Set(Object.keys(o)), c = new Set([...s].filter((e) => {
		let n = a.shape[e]._zod;
		return t.io === "input" ? n.optin === void 0 : n.optout === void 0;
	}));
	c.size > 0 && (i.required = Array.from(c)), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = O(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, vi = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => O(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, yi = (e, t, n, r) => {
	let i = e._zod.def, a = O(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = O(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1;
	n.allOf = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
}, bi = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = o._zod.bag?.patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = O(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) i.patternProperties[t.source] = e;
	} else (t.target === "draft-07" || t.target === "draft-2020-12") && (i.propertyNames = O(a.keyType, t, {
		...r,
		path: [...r.path, "propertyNames"]
	})), i.additionalProperties = O(a.valueType, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	});
	let c = o._zod.values;
	if (c) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e);
	}
}, xi = (e, t, n, r) => {
	let i = e._zod.def, a = O(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Si = (e, t, n, r) => {
	let i = e._zod.def;
	O(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Ci = (e, t, n, r) => {
	let i = e._zod.def;
	O(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.default = JSON.parse(JSON.stringify(i.defaultValue));
}, wi = (e, t, n, r) => {
	let i = e._zod.def;
	O(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(i.defaultValue)));
}, Ti = (e, t, n, r) => {
	let i = e._zod.def;
	O(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		throw Error("Dynamic catch values are not supported in JSON Schema");
	}
	n.default = o;
}, Ei = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	O(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Di = (e, t, n, r) => {
	let i = e._zod.def;
	O(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Oi = (e, t, n, r) => {
	let i = e._zod.def;
	O(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, ki = /*@__PURE__*/ t("ZodISODateTime", (e, t) => {
	Kt.init(e, t), N.init(e, t);
});
function Ai(e) {
	return /* @__PURE__ */ xr(ki, e);
}
var ji = /*@__PURE__*/ t("ZodISODate", (e, t) => {
	qt.init(e, t), N.init(e, t);
});
function Mi(e) {
	return /* @__PURE__ */ Sr(ji, e);
}
var Ni = /*@__PURE__*/ t("ZodISOTime", (e, t) => {
	Jt.init(e, t), N.init(e, t);
});
function Pi(e) {
	return /* @__PURE__ */ Cr(Ni, e);
}
var Fi = /*@__PURE__*/ t("ZodISODuration", (e, t) => {
	Yt.init(e, t), N.init(e, t);
});
function Ii(e) {
	return /* @__PURE__ */ wr(Fi, e);
}
var A = /*@__PURE__*/ t("ZodError", (e, t) => {
	be.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
		format: { value: (t) => Ce(e, t) },
		flatten: { value: (t) => Se(e, t) },
		addIssue: { value: (t) => {
			e.issues.push(t), e.message = JSON.stringify(e.issues, s, 2);
		} },
		addIssues: { value: (t) => {
			e.issues.push(...t), e.message = JSON.stringify(e.issues, s, 2);
		} },
		isEmpty: { get() {
			return e.issues.length === 0;
		} }
	});
}, { Parent: Error }), Li = /* @__PURE__ */ we(A), Ri = /* @__PURE__ */ Te(A), zi = /* @__PURE__ */ Ee(A), Bi = /* @__PURE__ */ Oe(A), Vi = /* @__PURE__ */ Ae(A), Hi = /* @__PURE__ */ je(A), Ui = /* @__PURE__ */ Me(A), Wi = /* @__PURE__ */ Ne(A), Gi = /* @__PURE__ */ Pe(A), Ki = /* @__PURE__ */ Fe(A), qi = /* @__PURE__ */ Ie(A), Ji = /* @__PURE__ */ Le(A), Yi = /* @__PURE__ */ new WeakMap();
function Xi(e, t, n) {
	let r = Object.getPrototypeOf(e), i = Yi.get(r);
	if (i || (i = /* @__PURE__ */ new Set(), Yi.set(r, i)), !i.has(t)) {
		i.add(t);
		for (let e in n) {
			let t = n[e];
			Object.defineProperty(r, e, {
				configurable: !0,
				enumerable: !1,
				get() {
					let n = t.bind(this);
					return Object.defineProperty(this, e, {
						configurable: !0,
						writable: !0,
						enumerable: !0,
						value: n
					}), n;
				},
				set(t) {
					Object.defineProperty(this, e, {
						configurable: !0,
						writable: !0,
						enumerable: !0,
						value: t
					});
				}
			});
		}
	}
}
var j = /*@__PURE__*/ t("ZodType", (e, t) => (T.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
	input: ai(e, "input"),
	output: ai(e, "output")
} }), e.toJSONSchema = ii(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.parse = (t, n) => Li(e, t, n, { callee: e.parse }), e.safeParse = (t, n) => zi(e, t, n), e.parseAsync = async (t, n) => Ri(e, t, n, { callee: e.parseAsync }), e.safeParseAsync = async (t, n) => Bi(e, t, n), e.spa = e.safeParseAsync, e.encode = (t, n) => Vi(e, t, n), e.decode = (t, n) => Hi(e, t, n), e.encodeAsync = async (t, n) => Ui(e, t, n), e.decodeAsync = async (t, n) => Wi(e, t, n), e.safeEncode = (t, n) => Gi(e, t, n), e.safeDecode = (t, n) => Ki(e, t, n), e.safeEncodeAsync = async (t, n) => qi(e, t, n), e.safeDecodeAsync = async (t, n) => Ji(e, t, n), Xi(e, "ZodType", {
	check(...e) {
		let t = this.def;
		return this.clone(m(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return v(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(ao(e, t));
	},
	superRefine(e, t) {
		return this.check(oo(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ D(e));
	},
	optional() {
		return W(this);
	},
	exactOptional() {
		return Va(this);
	},
	nullable() {
		return Ua(this);
	},
	nullish() {
		return W(Ua(this));
	},
	nonoptional(e) {
		return Ya(this, e);
	},
	array() {
		return L(this);
	},
	or(e) {
		return B([this, e]);
	},
	and(e) {
		return Na(this, e);
	},
	transform(e) {
		return $a(this, Ra(e));
	},
	default(e) {
		return Ga(this, e);
	},
	prefault(e) {
		return qa(this, e);
	},
	catch(e) {
		return Za(this, e);
	},
	pipe(e) {
		return $a(this, e);
	},
	readonly() {
		return no(this);
	},
	describe(e) {
		let t = this.clone();
		return Zn.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Zn.get(this);
		let t = this.clone();
		return Zn.add(t, e[0]), t;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(e) {
		return e(this);
	}
}), Object.defineProperty(e, "description", {
	get() {
		return Zn.get(e)?.description;
	},
	configurable: !0
}), e)), Zi = /*@__PURE__*/ t("_ZodString", (e, t) => {
	Pt.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => si(e, t, n, r);
	let n = e._zod.bag;
	e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, Xi(e, "_ZodString", {
		regex(...e) {
			return this.check(/* @__PURE__ */ zr(...e));
		},
		includes(...e) {
			return this.check(/* @__PURE__ */ Hr(...e));
		},
		startsWith(...e) {
			return this.check(/* @__PURE__ */ Ur(...e));
		},
		endsWith(...e) {
			return this.check(/* @__PURE__ */ Wr(...e));
		},
		min(...e) {
			return this.check(/* @__PURE__ */ Lr(...e));
		},
		max(...e) {
			return this.check(/* @__PURE__ */ Ir(...e));
		},
		length(...e) {
			return this.check(/* @__PURE__ */ Rr(...e));
		},
		nonempty(...e) {
			return this.check(/* @__PURE__ */ Lr(1, ...e));
		},
		lowercase(e) {
			return this.check(/* @__PURE__ */ Br(e));
		},
		uppercase(e) {
			return this.check(/* @__PURE__ */ Vr(e));
		},
		trim() {
			return this.check(/* @__PURE__ */ Kr());
		},
		normalize(...e) {
			return this.check(/* @__PURE__ */ Gr(...e));
		},
		toLowerCase() {
			return this.check(/* @__PURE__ */ qr());
		},
		toUpperCase() {
			return this.check(/* @__PURE__ */ Jr());
		},
		slugify() {
			return this.check(/* @__PURE__ */ Yr());
		}
	});
}), Qi = /*@__PURE__*/ t("ZodString", (e, t) => {
	Pt.init(e, t), Zi.init(e, t), e.email = (t) => e.check(/* @__PURE__ */ $n($i, t)), e.url = (t) => e.check(/* @__PURE__ */ ar(na, t)), e.jwt = (t) => e.check(/* @__PURE__ */ br(_a, t)), e.emoji = (t) => e.check(/* @__PURE__ */ or(ra, t)), e.guid = (t) => e.check(/* @__PURE__ */ er(ea, t)), e.uuid = (t) => e.check(/* @__PURE__ */ tr(ta, t)), e.uuidv4 = (t) => e.check(/* @__PURE__ */ nr(ta, t)), e.uuidv6 = (t) => e.check(/* @__PURE__ */ rr(ta, t)), e.uuidv7 = (t) => e.check(/* @__PURE__ */ ir(ta, t)), e.nanoid = (t) => e.check(/* @__PURE__ */ sr(ia, t)), e.guid = (t) => e.check(/* @__PURE__ */ er(ea, t)), e.cuid = (t) => e.check(/* @__PURE__ */ cr(aa, t)), e.cuid2 = (t) => e.check(/* @__PURE__ */ lr(oa, t)), e.ulid = (t) => e.check(/* @__PURE__ */ ur(sa, t)), e.base64 = (t) => e.check(/* @__PURE__ */ _r(ma, t)), e.base64url = (t) => e.check(/* @__PURE__ */ vr(ha, t)), e.xid = (t) => e.check(/* @__PURE__ */ dr(ca, t)), e.ksuid = (t) => e.check(/* @__PURE__ */ fr(la, t)), e.ipv4 = (t) => e.check(/* @__PURE__ */ pr(ua, t)), e.ipv6 = (t) => e.check(/* @__PURE__ */ mr(da, t)), e.cidrv4 = (t) => e.check(/* @__PURE__ */ hr(fa, t)), e.cidrv6 = (t) => e.check(/* @__PURE__ */ gr(pa, t)), e.e164 = (t) => e.check(/* @__PURE__ */ yr(ga, t)), e.datetime = (t) => e.check(Ai(t)), e.date = (t) => e.check(Mi(t)), e.time = (t) => e.check(Pi(t)), e.duration = (t) => e.check(Ii(t));
});
function M(e) {
	return /* @__PURE__ */ Qn(Qi, e);
}
var N = /*@__PURE__*/ t("ZodStringFormat", (e, t) => {
	E.init(e, t), Zi.init(e, t);
}), $i = /*@__PURE__*/ t("ZodEmail", (e, t) => {
	Lt.init(e, t), N.init(e, t);
}), ea = /*@__PURE__*/ t("ZodGUID", (e, t) => {
	Ft.init(e, t), N.init(e, t);
}), ta = /*@__PURE__*/ t("ZodUUID", (e, t) => {
	It.init(e, t), N.init(e, t);
}), na = /*@__PURE__*/ t("ZodURL", (e, t) => {
	Rt.init(e, t), N.init(e, t);
}), ra = /*@__PURE__*/ t("ZodEmoji", (e, t) => {
	zt.init(e, t), N.init(e, t);
}), ia = /*@__PURE__*/ t("ZodNanoID", (e, t) => {
	Bt.init(e, t), N.init(e, t);
}), aa = /*@__PURE__*/ t("ZodCUID", (e, t) => {
	Vt.init(e, t), N.init(e, t);
}), oa = /*@__PURE__*/ t("ZodCUID2", (e, t) => {
	Ht.init(e, t), N.init(e, t);
}), sa = /*@__PURE__*/ t("ZodULID", (e, t) => {
	Ut.init(e, t), N.init(e, t);
}), ca = /*@__PURE__*/ t("ZodXID", (e, t) => {
	Wt.init(e, t), N.init(e, t);
}), la = /*@__PURE__*/ t("ZodKSUID", (e, t) => {
	Gt.init(e, t), N.init(e, t);
}), ua = /*@__PURE__*/ t("ZodIPv4", (e, t) => {
	Xt.init(e, t), N.init(e, t);
}), da = /*@__PURE__*/ t("ZodIPv6", (e, t) => {
	Zt.init(e, t), N.init(e, t);
}), fa = /*@__PURE__*/ t("ZodCIDRv4", (e, t) => {
	Qt.init(e, t), N.init(e, t);
}), pa = /*@__PURE__*/ t("ZodCIDRv6", (e, t) => {
	$t.init(e, t), N.init(e, t);
}), ma = /*@__PURE__*/ t("ZodBase64", (e, t) => {
	tn.init(e, t), N.init(e, t);
}), ha = /*@__PURE__*/ t("ZodBase64URL", (e, t) => {
	rn.init(e, t), N.init(e, t);
}), ga = /*@__PURE__*/ t("ZodE164", (e, t) => {
	an.init(e, t), N.init(e, t);
}), _a = /*@__PURE__*/ t("ZodJWT", (e, t) => {
	sn.init(e, t), N.init(e, t);
}), va = /*@__PURE__*/ t("ZodNumber", (e, t) => {
	cn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => ci(e, t, n, r), Xi(e, "ZodNumber", {
		gt(e, t) {
			return this.check(/* @__PURE__ */ Nr(e, t));
		},
		gte(e, t) {
			return this.check(/* @__PURE__ */ Pr(e, t));
		},
		min(e, t) {
			return this.check(/* @__PURE__ */ Pr(e, t));
		},
		lt(e, t) {
			return this.check(/* @__PURE__ */ jr(e, t));
		},
		lte(e, t) {
			return this.check(/* @__PURE__ */ Mr(e, t));
		},
		max(e, t) {
			return this.check(/* @__PURE__ */ Mr(e, t));
		},
		int(e) {
			return this.check(ba(e));
		},
		safe(e) {
			return this.check(ba(e));
		},
		positive(e) {
			return this.check(/* @__PURE__ */ Nr(0, e));
		},
		nonnegative(e) {
			return this.check(/* @__PURE__ */ Pr(0, e));
		},
		negative(e) {
			return this.check(/* @__PURE__ */ jr(0, e));
		},
		nonpositive(e) {
			return this.check(/* @__PURE__ */ Mr(0, e));
		},
		multipleOf(e, t) {
			return this.check(/* @__PURE__ */ Fr(e, t));
		},
		step(e, t) {
			return this.check(/* @__PURE__ */ Fr(e, t));
		},
		finite() {
			return this;
		}
	});
	let n = e._zod.bag;
	e.minValue = Math.max(n.minimum ?? -Infinity, n.exclusiveMinimum ?? -Infinity) ?? null, e.maxValue = Math.min(n.maximum ?? Infinity, n.exclusiveMaximum ?? Infinity) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? .5), e.isFinite = !0, e.format = n.format ?? null;
});
function P(e) {
	return /* @__PURE__ */ Tr(va, e);
}
var ya = /*@__PURE__*/ t("ZodNumberFormat", (e, t) => {
	ln.init(e, t), va.init(e, t);
});
function ba(e) {
	return /* @__PURE__ */ Er(ya, e);
}
var xa = /*@__PURE__*/ t("ZodBoolean", (e, t) => {
	un.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => li(e, t, n, r);
});
function F(e) {
	return /* @__PURE__ */ Dr(xa, e);
}
var Sa = /*@__PURE__*/ t("ZodNull", (e, t) => {
	dn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => ui(e, t, n, r);
});
function Ca(e) {
	return /* @__PURE__ */ Or(Sa, e);
}
var wa = /*@__PURE__*/ t("ZodUnknown", (e, t) => {
	fn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function I() {
	return /* @__PURE__ */ kr(wa);
}
var Ta = /*@__PURE__*/ t("ZodNever", (e, t) => {
	pn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => di(e, t, n, r);
});
function Ea(e) {
	return /* @__PURE__ */ Ar(Ta, e);
}
var Da = /*@__PURE__*/ t("ZodArray", (e, t) => {
	hn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => gi(e, t, n, r), e.element = t.element, Xi(e, "ZodArray", {
		min(e, t) {
			return this.check(/* @__PURE__ */ Lr(e, t));
		},
		nonempty(e) {
			return this.check(/* @__PURE__ */ Lr(1, e));
		},
		max(e, t) {
			return this.check(/* @__PURE__ */ Ir(e, t));
		},
		length(e, t) {
			return this.check(/* @__PURE__ */ Rr(e, t));
		},
		unwrap() {
			return this.element;
		}
	});
});
function L(e, t) {
	return /* @__PURE__ */ Xr(Da, e, t);
}
var Oa = /*@__PURE__*/ t("ZodObject", (e, t) => {
	bn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => _i(e, t, n, r), f(e, "shape", () => t.shape), Xi(e, "ZodObject", {
		keyof() {
			return H(Object.keys(this._zod.def.shape));
		},
		catchall(e) {
			return this.clone({
				...this._zod.def,
				catchall: e
			});
		},
		passthrough() {
			return this.clone({
				...this._zod.def,
				catchall: I()
			});
		},
		loose() {
			return this.clone({
				...this._zod.def,
				catchall: I()
			});
		},
		strict() {
			return this.clone({
				...this._zod.def,
				catchall: Ea()
			});
		},
		strip() {
			return this.clone({
				...this._zod.def,
				catchall: void 0
			});
		},
		extend(e) {
			return de(this, e);
		},
		safeExtend(e) {
			return fe(this, e);
		},
		merge(e) {
			return pe(this, e);
		},
		pick(e) {
			return le(this, e);
		},
		omit(e) {
			return ue(this, e);
		},
		partial(...e) {
			return me(za, this, e[0]);
		},
		required(...e) {
			return he(Ja, this, e[0]);
		}
	});
});
function R(e, t) {
	return new Oa({
		type: "object",
		shape: e ?? {},
		...y(t)
	});
}
function z(e, t) {
	return new Oa({
		type: "object",
		shape: e,
		catchall: I(),
		...y(t)
	});
}
var ka = /*@__PURE__*/ t("ZodUnion", (e, t) => {
	Sn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => vi(e, t, n, r), e.options = t.options;
});
function B(e, t) {
	return new ka({
		type: "union",
		options: e,
		...y(t)
	});
}
var Aa = /*@__PURE__*/ t("ZodDiscriminatedUnion", (e, t) => {
	ka.init(e, t), Cn.init(e, t);
});
function ja(e, t, n) {
	return new Aa({
		type: "union",
		options: t,
		discriminator: e,
		...y(n)
	});
}
var Ma = /*@__PURE__*/ t("ZodIntersection", (e, t) => {
	wn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => yi(e, t, n, r);
});
function Na(e, t) {
	return new Ma({
		type: "intersection",
		left: e,
		right: t
	});
}
var Pa = /*@__PURE__*/ t("ZodRecord", (e, t) => {
	Dn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => bi(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function V(e, t, n) {
	return !t || !t._zod ? new Pa({
		type: "record",
		keyType: M(),
		valueType: e,
		...y(t)
	}) : new Pa({
		type: "record",
		keyType: e,
		valueType: t,
		...y(n)
	});
}
var Fa = /*@__PURE__*/ t("ZodEnum", (e, t) => {
	On.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => fi(e, t, n, r), e.enum = t.entries, e.options = Object.values(t.entries);
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Fa({
			...t,
			checks: [],
			...y(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Fa({
			...t,
			checks: [],
			...y(r),
			entries: i
		});
	};
});
function H(e, t) {
	return new Fa({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...y(t)
	});
}
var Ia = /*@__PURE__*/ t("ZodLiteral", (e, t) => {
	kn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => pi(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function U(e, t) {
	return new Ia({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...y(t)
	});
}
var La = /*@__PURE__*/ t("ZodTransform", (e, t) => {
	An.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => hi(e, t, n, r), e._zod.parse = (n, i) => {
		if (i.direction === "backward") throw new r(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(C(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", t.input ??= n.value, t.inst ??= e, n.issues.push(C(t));
			}
		};
		let a = t.transform(n.value, n);
		return a instanceof Promise ? a.then((e) => (n.value = e, n.fallback = !0, n)) : (n.value = a, n.fallback = !0, n);
	};
});
function Ra(e) {
	return new La({
		type: "transform",
		transform: e
	});
}
var za = /*@__PURE__*/ t("ZodOptional", (e, t) => {
	Mn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function W(e) {
	return new za({
		type: "optional",
		innerType: e
	});
}
var Ba = /*@__PURE__*/ t("ZodExactOptional", (e, t) => {
	Nn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Va(e) {
	return new Ba({
		type: "optional",
		innerType: e
	});
}
var Ha = /*@__PURE__*/ t("ZodNullable", (e, t) => {
	Pn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => xi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ua(e) {
	return new Ha({
		type: "nullable",
		innerType: e
	});
}
var Wa = /*@__PURE__*/ t("ZodDefault", (e, t) => {
	Fn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ci(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Ga(e, t) {
	return new Wa({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ae(t);
		}
	});
}
var Ka = /*@__PURE__*/ t("ZodPrefault", (e, t) => {
	Ln.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => wi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function qa(e, t) {
	return new Ka({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ae(t);
		}
	});
}
var Ja = /*@__PURE__*/ t("ZodNonOptional", (e, t) => {
	Rn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => Si(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ya(e, t) {
	return new Ja({
		type: "nonoptional",
		innerType: e,
		...y(t)
	});
}
var Xa = /*@__PURE__*/ t("ZodCatch", (e, t) => {
	Bn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ti(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Za(e, t) {
	return new Xa({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : () => t
	});
}
var Qa = /*@__PURE__*/ t("ZodPipe", (e, t) => {
	Vn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ei(e, t, n, r), e.in = t.in, e.out = t.out;
});
function $a(e, t) {
	return new Qa({
		type: "pipe",
		in: e,
		out: t
	});
}
var eo = /*@__PURE__*/ t("ZodPreprocess", (e, t) => {
	Qa.init(e, t), Un.init(e, t);
}), to = /*@__PURE__*/ t("ZodReadonly", (e, t) => {
	Wn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => Di(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function no(e) {
	return new to({
		type: "readonly",
		innerType: e
	});
}
var ro = /*@__PURE__*/ t("ZodCustom", (e, t) => {
	Kn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (t, n, r) => mi(e, t, n, r);
});
function io(e, t) {
	return /* @__PURE__ */ Zr(ro, e ?? (() => !0), t);
}
function ao(e, t = {}) {
	return /* @__PURE__ */ Qr(ro, e, t);
}
function oo(e, t) {
	return /* @__PURE__ */ $r(e, t);
}
function so(e, t) {
	return new eo({
		type: "pipe",
		in: Ra(e),
		out: t
	});
}
//#endregion
//#region node_modules/@modelcontextprotocol/sdk/dist/esm/types.js
var co = "2025-11-25", lo = [
	co,
	"2025-06-18",
	"2025-03-26",
	"2024-11-05",
	"2024-10-07"
], uo = "io.modelcontextprotocol/related-task", G = io((e) => e !== null && (typeof e == "object" || typeof e == "function")), fo = B([M(), P().int()]), po = M();
z({
	ttl: P().optional(),
	pollInterval: P().optional()
});
var mo = R({ ttl: P().optional() }), ho = R({ taskId: M() }), go = z({
	progressToken: fo.optional(),
	[uo]: ho.optional()
}), K = R({ _meta: go.optional() }), _o = K.extend({ task: mo.optional() }), vo = (e) => _o.safeParse(e).success, q = R({
	method: M(),
	params: K.loose().optional()
}), J = R({ _meta: go.optional() }), Y = R({
	method: M(),
	params: J.loose().optional()
}), X = z({ _meta: go.optional() }), yo = B([M(), P().int()]), bo = R({
	jsonrpc: U("2.0"),
	id: yo,
	...q.shape
}).strict(), xo = (e) => bo.safeParse(e).success, So = R({
	jsonrpc: U("2.0"),
	...Y.shape
}).strict(), Co = (e) => So.safeParse(e).success, wo = R({
	jsonrpc: U("2.0"),
	id: yo,
	result: X
}).strict(), To = (e) => wo.safeParse(e).success, Eo;
(function(e) {
	e[e.ConnectionClosed = -32e3] = "ConnectionClosed", e[e.RequestTimeout = -32001] = "RequestTimeout", e[e.ParseError = -32700] = "ParseError", e[e.InvalidRequest = -32600] = "InvalidRequest", e[e.MethodNotFound = -32601] = "MethodNotFound", e[e.InvalidParams = -32602] = "InvalidParams", e[e.InternalError = -32603] = "InternalError", e[e.UrlElicitationRequired = -32042] = "UrlElicitationRequired";
})(Eo ||= {});
var Do = R({
	jsonrpc: U("2.0"),
	id: yo.optional(),
	error: R({
		code: P().int(),
		message: M(),
		data: I().optional()
	})
}).strict(), Oo = (e) => Do.safeParse(e).success, ko = B([
	bo,
	So,
	wo,
	Do
]);
B([wo, Do]);
var Ao = X.strict(), jo = J.extend({
	requestId: yo.optional(),
	reason: M().optional()
}), Mo = Y.extend({
	method: U("notifications/cancelled"),
	params: jo
}), Z = R({ icons: L(R({
	src: M(),
	mimeType: M().optional(),
	sizes: L(M()).optional(),
	theme: H(["light", "dark"]).optional()
})).optional() }), Q = R({
	name: M(),
	title: M().optional()
}), No = Q.extend({
	...Q.shape,
	...Z.shape,
	version: M(),
	websiteUrl: M().optional(),
	description: M().optional()
}), Po = so((e) => e && typeof e == "object" && !Array.isArray(e) && Object.keys(e).length === 0 ? { form: {} } : e, Na(R({
	form: Na(R({ applyDefaults: F().optional() }), V(M(), I())).optional(),
	url: G.optional()
}), V(M(), I()).optional())), Fo = z({
	list: G.optional(),
	cancel: G.optional(),
	requests: z({
		sampling: z({ createMessage: G.optional() }).optional(),
		elicitation: z({ create: G.optional() }).optional()
	}).optional()
}), Io = z({
	list: G.optional(),
	cancel: G.optional(),
	requests: z({ tools: z({ call: G.optional() }).optional() }).optional()
}), Lo = R({
	experimental: V(M(), G).optional(),
	sampling: R({
		context: G.optional(),
		tools: G.optional()
	}).optional(),
	elicitation: Po.optional(),
	roots: R({ listChanged: F().optional() }).optional(),
	tasks: Fo.optional(),
	extensions: V(M(), G).optional()
}), Ro = K.extend({
	protocolVersion: M(),
	capabilities: Lo,
	clientInfo: No
}), zo = q.extend({
	method: U("initialize"),
	params: Ro
}), Bo = R({
	experimental: V(M(), G).optional(),
	logging: G.optional(),
	completions: G.optional(),
	prompts: R({ listChanged: F().optional() }).optional(),
	resources: R({
		subscribe: F().optional(),
		listChanged: F().optional()
	}).optional(),
	tools: R({ listChanged: F().optional() }).optional(),
	tasks: Io.optional(),
	extensions: V(M(), G).optional()
}), Vo = X.extend({
	protocolVersion: M(),
	capabilities: Bo,
	serverInfo: No,
	instructions: M().optional()
}), Ho = Y.extend({
	method: U("notifications/initialized"),
	params: J.optional()
}), Uo = q.extend({
	method: U("ping"),
	params: K.optional()
}), Wo = R({
	progress: P(),
	total: W(P()),
	message: W(M())
}), Go = R({
	...J.shape,
	...Wo.shape,
	progressToken: fo
}), Ko = Y.extend({
	method: U("notifications/progress"),
	params: Go
}), qo = K.extend({ cursor: po.optional() }), Jo = q.extend({ params: qo.optional() }), Yo = X.extend({ nextCursor: po.optional() }), Xo = H([
	"working",
	"input_required",
	"completed",
	"failed",
	"cancelled"
]), Zo = R({
	taskId: M(),
	status: Xo,
	ttl: B([P(), Ca()]),
	createdAt: M(),
	lastUpdatedAt: M(),
	pollInterval: W(P()),
	statusMessage: W(M())
}), Qo = X.extend({ task: Zo }), $o = J.merge(Zo), es = Y.extend({
	method: U("notifications/tasks/status"),
	params: $o
}), ts = q.extend({
	method: U("tasks/get"),
	params: K.extend({ taskId: M() })
}), ns = X.merge(Zo), rs = q.extend({
	method: U("tasks/result"),
	params: K.extend({ taskId: M() })
});
X.loose();
var is = Jo.extend({ method: U("tasks/list") }), as = Yo.extend({ tasks: L(Zo) }), os = q.extend({
	method: U("tasks/cancel"),
	params: K.extend({ taskId: M() })
}), ss = X.merge(Zo), cs = R({
	uri: M(),
	mimeType: W(M()),
	_meta: V(M(), I()).optional()
}), ls = cs.extend({ text: M() }), us = M().refine((e) => {
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}, { message: "Invalid Base64 string" }), ds = cs.extend({ blob: us }), fs = H(["user", "assistant"]), $ = R({
	audience: L(fs).optional(),
	priority: P().min(0).max(1).optional(),
	lastModified: Ai({ offset: !0 }).optional()
}), ps = R({
	...Q.shape,
	...Z.shape,
	uri: M(),
	description: W(M()),
	mimeType: W(M()),
	size: W(P()),
	annotations: $.optional(),
	_meta: W(z({}))
}), ms = R({
	...Q.shape,
	...Z.shape,
	uriTemplate: M(),
	description: W(M()),
	mimeType: W(M()),
	annotations: $.optional(),
	_meta: W(z({}))
}), hs = Jo.extend({ method: U("resources/list") }), gs = Yo.extend({ resources: L(ps) }), _s = Jo.extend({ method: U("resources/templates/list") }), vs = Yo.extend({ resourceTemplates: L(ms) }), ys = K.extend({ uri: M() }), bs = ys, xs = q.extend({
	method: U("resources/read"),
	params: bs
}), Ss = X.extend({ contents: L(B([ls, ds])) }), Cs = Y.extend({
	method: U("notifications/resources/list_changed"),
	params: J.optional()
}), ws = ys, Ts = q.extend({
	method: U("resources/subscribe"),
	params: ws
}), Es = ys, Ds = q.extend({
	method: U("resources/unsubscribe"),
	params: Es
}), Os = J.extend({ uri: M() }), ks = Y.extend({
	method: U("notifications/resources/updated"),
	params: Os
}), As = R({
	name: M(),
	description: W(M()),
	required: W(F())
}), js = R({
	...Q.shape,
	...Z.shape,
	description: W(M()),
	arguments: W(L(As)),
	_meta: W(z({}))
}), Ms = Jo.extend({ method: U("prompts/list") }), Ns = Yo.extend({ prompts: L(js) }), Ps = K.extend({
	name: M(),
	arguments: V(M(), M()).optional()
}), Fs = q.extend({
	method: U("prompts/get"),
	params: Ps
}), Is = R({
	type: U("text"),
	text: M(),
	annotations: $.optional(),
	_meta: V(M(), I()).optional()
}), Ls = R({
	type: U("image"),
	data: us,
	mimeType: M(),
	annotations: $.optional(),
	_meta: V(M(), I()).optional()
}), Rs = R({
	type: U("audio"),
	data: us,
	mimeType: M(),
	annotations: $.optional(),
	_meta: V(M(), I()).optional()
}), zs = R({
	type: U("tool_use"),
	name: M(),
	id: M(),
	input: V(M(), I()),
	_meta: V(M(), I()).optional()
}), Bs = R({
	type: U("resource"),
	resource: B([ls, ds]),
	annotations: $.optional(),
	_meta: V(M(), I()).optional()
}), Vs = B([
	Is,
	Ls,
	Rs,
	ps.extend({ type: U("resource_link") }),
	Bs
]), Hs = R({
	role: fs,
	content: Vs
}), Us = X.extend({
	description: M().optional(),
	messages: L(Hs)
}), Ws = Y.extend({
	method: U("notifications/prompts/list_changed"),
	params: J.optional()
}), Gs = R({
	title: M().optional(),
	readOnlyHint: F().optional(),
	destructiveHint: F().optional(),
	idempotentHint: F().optional(),
	openWorldHint: F().optional()
}), Ks = R({ taskSupport: H([
	"required",
	"optional",
	"forbidden"
]).optional() }), qs = R({
	...Q.shape,
	...Z.shape,
	description: M().optional(),
	inputSchema: R({
		type: U("object"),
		properties: V(M(), G).optional(),
		required: L(M()).optional()
	}).catchall(I()),
	outputSchema: R({
		type: U("object"),
		properties: V(M(), G).optional(),
		required: L(M()).optional()
	}).catchall(I()).optional(),
	annotations: Gs.optional(),
	execution: Ks.optional(),
	_meta: V(M(), I()).optional()
}), Js = Jo.extend({ method: U("tools/list") }), Ys = Yo.extend({ tools: L(qs) }), Xs = X.extend({
	content: L(Vs).default([]),
	structuredContent: V(M(), I()).optional(),
	isError: F().optional()
});
Xs.or(X.extend({ toolResult: I() }));
var Zs = _o.extend({
	name: M(),
	arguments: V(M(), I()).optional()
}), Qs = q.extend({
	method: U("tools/call"),
	params: Zs
}), $s = Y.extend({
	method: U("notifications/tools/list_changed"),
	params: J.optional()
}), ec = R({
	autoRefresh: F().default(!0),
	debounceMs: P().int().nonnegative().default(300)
}), tc = H([
	"debug",
	"info",
	"notice",
	"warning",
	"error",
	"critical",
	"alert",
	"emergency"
]), nc = K.extend({ level: tc }), rc = q.extend({
	method: U("logging/setLevel"),
	params: nc
}), ic = J.extend({
	level: tc,
	logger: M().optional(),
	data: I()
}), ac = Y.extend({
	method: U("notifications/message"),
	params: ic
}), oc = R({
	hints: L(R({ name: M().optional() })).optional(),
	costPriority: P().min(0).max(1).optional(),
	speedPriority: P().min(0).max(1).optional(),
	intelligencePriority: P().min(0).max(1).optional()
}), sc = R({ mode: H([
	"auto",
	"required",
	"none"
]).optional() }), cc = R({
	type: U("tool_result"),
	toolUseId: M().describe("The unique identifier for the corresponding tool call."),
	content: L(Vs).default([]),
	structuredContent: R({}).loose().optional(),
	isError: F().optional(),
	_meta: V(M(), I()).optional()
}), lc = ja("type", [
	Is,
	Ls,
	Rs
]), uc = ja("type", [
	Is,
	Ls,
	Rs,
	zs,
	cc
]), dc = R({
	role: fs,
	content: B([uc, L(uc)]),
	_meta: V(M(), I()).optional()
}), fc = _o.extend({
	messages: L(dc),
	modelPreferences: oc.optional(),
	systemPrompt: M().optional(),
	includeContext: H([
		"none",
		"thisServer",
		"allServers"
	]).optional(),
	temperature: P().optional(),
	maxTokens: P().int(),
	stopSequences: L(M()).optional(),
	metadata: G.optional(),
	tools: L(qs).optional(),
	toolChoice: sc.optional()
}), pc = q.extend({
	method: U("sampling/createMessage"),
	params: fc
}), mc = X.extend({
	model: M(),
	stopReason: W(H([
		"endTurn",
		"stopSequence",
		"maxTokens"
	]).or(M())),
	role: fs,
	content: lc
}), hc = X.extend({
	model: M(),
	stopReason: W(H([
		"endTurn",
		"stopSequence",
		"maxTokens",
		"toolUse"
	]).or(M())),
	role: fs,
	content: B([uc, L(uc)])
}), gc = R({
	type: U("boolean"),
	title: M().optional(),
	description: M().optional(),
	default: F().optional()
}), _c = R({
	type: U("string"),
	title: M().optional(),
	description: M().optional(),
	minLength: P().optional(),
	maxLength: P().optional(),
	format: H([
		"email",
		"uri",
		"date",
		"date-time"
	]).optional(),
	default: M().optional()
}), vc = R({
	type: H(["number", "integer"]),
	title: M().optional(),
	description: M().optional(),
	minimum: P().optional(),
	maximum: P().optional(),
	default: P().optional()
}), yc = R({
	type: U("string"),
	title: M().optional(),
	description: M().optional(),
	enum: L(M()),
	default: M().optional()
}), bc = R({
	type: U("string"),
	title: M().optional(),
	description: M().optional(),
	oneOf: L(R({
		const: M(),
		title: M()
	})),
	default: M().optional()
}), xc = B([
	B([
		R({
			type: U("string"),
			title: M().optional(),
			description: M().optional(),
			enum: L(M()),
			enumNames: L(M()).optional(),
			default: M().optional()
		}),
		B([yc, bc]),
		B([R({
			type: U("array"),
			title: M().optional(),
			description: M().optional(),
			minItems: P().optional(),
			maxItems: P().optional(),
			items: R({
				type: U("string"),
				enum: L(M())
			}),
			default: L(M()).optional()
		}), R({
			type: U("array"),
			title: M().optional(),
			description: M().optional(),
			minItems: P().optional(),
			maxItems: P().optional(),
			items: R({ anyOf: L(R({
				const: M(),
				title: M()
			})) }),
			default: L(M()).optional()
		})])
	]),
	gc,
	_c,
	vc
]), Sc = B([_o.extend({
	mode: U("form").optional(),
	message: M(),
	requestedSchema: R({
		type: U("object"),
		properties: V(M(), xc),
		required: L(M()).optional()
	})
}), _o.extend({
	mode: U("url"),
	message: M(),
	elicitationId: M(),
	url: M().url()
})]), Cc = q.extend({
	method: U("elicitation/create"),
	params: Sc
}), wc = J.extend({ elicitationId: M() }), Tc = Y.extend({
	method: U("notifications/elicitation/complete"),
	params: wc
}), Ec = X.extend({
	action: H([
		"accept",
		"decline",
		"cancel"
	]),
	content: so((e) => e === null ? void 0 : e, V(M(), B([
		M(),
		P(),
		F(),
		L(M())
	])).optional())
}), Dc = R({
	type: U("ref/resource"),
	uri: M()
}), Oc = R({
	type: U("ref/prompt"),
	name: M()
}), kc = K.extend({
	ref: B([Oc, Dc]),
	argument: R({
		name: M(),
		value: M()
	}),
	context: R({ arguments: V(M(), M()).optional() }).optional()
}), Ac = q.extend({
	method: U("completion/complete"),
	params: kc
}), jc = X.extend({ completion: z({
	values: L(M()).max(100),
	total: W(P().int()),
	hasMore: W(F())
}) }), Mc = R({
	uri: M().startsWith("file://"),
	name: M().optional(),
	_meta: V(M(), I()).optional()
}), Nc = q.extend({
	method: U("roots/list"),
	params: K.optional()
}), Pc = X.extend({ roots: L(Mc) }), Fc = Y.extend({
	method: U("notifications/roots/list_changed"),
	params: J.optional()
});
B([
	Uo,
	zo,
	Ac,
	rc,
	Fs,
	Ms,
	hs,
	_s,
	xs,
	Ts,
	Ds,
	Qs,
	Js,
	ts,
	rs,
	is,
	os
]), B([
	Mo,
	Ko,
	Ho,
	Fc,
	es
]), B([
	Ao,
	mc,
	hc,
	Ec,
	Pc,
	ns,
	as,
	Qo
]), B([
	Uo,
	pc,
	Cc,
	Nc,
	ts,
	rs,
	is,
	os
]), B([
	Mo,
	Ko,
	ac,
	ks,
	Cs,
	$s,
	Ws,
	es,
	Tc
]), B([
	Ao,
	Vo,
	jc,
	Us,
	Ns,
	gs,
	vs,
	Ss,
	Xs,
	Ys,
	ns,
	as,
	Qo
]);
var Ic = class e extends Error {
	constructor(e, t, n) {
		super(`MCP error ${e}: ${t}`), this.code = e, this.data = n, this.name = "McpError";
	}
	static fromError(t, n, r) {
		if (t === Eo.UrlElicitationRequired && r) {
			let e = r;
			if (e.elicitations) return new Lc(e.elicitations, n);
		}
		return new e(t, n, r);
	}
}, Lc = class extends Ic {
	constructor(e, t = `URL elicitation${e.length > 1 ? "s" : ""} required`) {
		super(Eo.UrlElicitationRequired, t, { elicitations: e });
	}
	get elicitations() {
		return this.data?.elicitations ?? [];
	}
};
//#endregion
export { Ko as A, xo as B, vs as C, Ys as D, as as E, lo as F, vo as H, es as I, $s as L, uo as M, Ss as N, Ic as O, Cs as P, Oo as R, Ns as S, is as T, De as U, To as V, ns as _, jc as a, co as b, hc as c, Ec as d, Ao as f, ts as g, rs as h, Mo as i, Ws as j, Uo as k, Qo as l, Us as m, os as n, pc as o, Eo as p, ss as r, mc as s, Xs as t, Cc as u, Vo as v, gs as w, ec as x, ko as y, Co as z };
