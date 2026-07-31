(() => {
    "use strict";
    var e, t, r, a, c, o, n, f, d = {},
        s = {};

    function i(e) {
        var t = s[e];
        if (void 0 !== t) return t.exports;
        var r = s[e] = {
                exports: {}
            },
            a = !0;
        try {
            d[e].call(r.exports, r, r.exports, i), a = !1
        } finally {
            a && delete s[e]
        }
        return r.exports
    }
    i.m = d, e = [], i.O = (t, r, a, c) => {
        if (r) {
            c = c || 0;
            for (var o = e.length; o > 0 && e[o - 1][2] > c; o--) e[o] = e[o - 1];
            e[o] = [r, a, c];
            return
        }
        for (var n = 1 / 0, o = 0; o < e.length; o++) {
            for (var [r, a, c] = e[o], f = !0, d = 0; d < r.length; d++)(!1 & c || n >= c) && Object.keys(i.O).every(e => i.O[e](r[d])) ? r.splice(d--, 1) : (f = !1, c < n && (n = c));
            if (f) {
                e.splice(o--, 1);
                var s = a();
                void 0 !== s && (t = s)
            }
        }
        return t
    }, i.n = e => {
        var t = e && e.__esModule ? () => e.default : () => e;
        return i.d(t, {
            a: t
        }), t
    }, r = Object.getPrototypeOf ? e => Object.getPrototypeOf(e) : e => e.__proto__, i.t = function(e, a) {
        if (1 & a && (e = this(e)), 8 & a || "object" == typeof e && e && (4 & a && e.__esModule || 16 & a && "function" == typeof e.then)) return e;
        var c = Object.create(null);
        i.r(c);
        var o = {};
        t = t || [null, r({}), r([]), r(r)];
        for (var n = 2 & a && e;
            "object" == typeof n && !~t.indexOf(n); n = r(n)) Object.getOwnPropertyNames(n).forEach(t => o[t] = () => e[t]);
        return o.default = () => e, i.d(c, o), c
    }, i.d = (e, t) => {
        for (var r in t) i.o(t, r) && !i.o(e, r) && Object.defineProperty(e, r, {
            enumerable: !0,
            get: t[r]
        })
    }, i.f = {}, i.e = e => Promise.all(Object.keys(i.f).reduce((t, r) => (i.f[r](e, t), t), [])), i.u = e => 8197 === e ? "static/chunks/8197.87401262e85d2c3d.js" : 9023 === e ? "static/chunks/9023.5a8136689aa13a8c.js" : 749 === e ? "static/chunks/749.b2960db96f3962f5.js" : 1829 === e ? "static/chunks/1829.65ab67fcdc9308a0.js" : 8335 === e ? "static/chunks/8335.fb2a1441230faa7f.js" : 7064 === e ? "static/chunks/7064.ece9e9fc4e04b107.js" : 3992 === e ? "static/chunks/3992.5729723abf4cb766.js" : 6178 === e ? "static/chunks/6178.23df574401537ae9.js" : 5438 === e ? "static/chunks/5438.441d9b7276a2554d.js" : 3666 === e ? "static/chunks/3666.d086ab626c129fa5.js" : "static/chunks/" + e + "-" + ({
        475: "289a6b31955d8f4f",
        1299: "4ad089a377fd3543",
        1766: "1f250bdde0e47fd2",
        1781: "e30ccd62528cdda6",
        2018: "747178cbe6ddd5f3",
        2129: "d48700dd17ce66f1",
        2619: "9aac8983f30c7c8a",
        2774: "fe3c7d7075652da0",
        2783: "5d9c3f939de276b1",
        2834: "3eb2697a33aeb3bf",
        4988: "54d1982fc07ecb90",
        5415: "2689c28fc6de84f5",
        5503: "4ebf5afa384d2e5b",
        5544: "e25aa16776f203d7",
        5772: "59ba8266d172326f",
        6149: "eea9219410552823",
        6166: "dc827c5eb8323c9f",
        6534: "f01a94f9700275a5",
        6580: "e547865afa3da585",
        6678: "a2b468348f691c58",
        6701: "815869a7d86a3664",
        6806: "83ffb5c3c7dd2ede",
        6992: "e0dc2855e38d7ff9",
        7835: "80fe384800f51470",
        7882: "1671d144bf460571",
        8091: "f03b216fc09b1734",
        8935: "005e7bff4fed936d",
        9098: "518bd808864d5229",
        9306: "2bc40e9651c87e1b"
    })[e] + ".js", i.miniCssF = e => {}, i.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
            return this || Function("return this")()
        } catch (e) {
            if ("object" == typeof window) return window
        }
    }(), i.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t), a = {}, i.l = (e, t, r, c) => {
        if (a[e]) return void a[e].push(t);
        if (void 0 !== r)
            for (var o, n, f = document.getElementsByTagName("script"), d = 0; d < f.length; d++) {
                var s = f[d];
                if (s.getAttribute("src") == e || s.getAttribute("data-webpack") == "_N_E:" + r) {
                    o = s;
                    break
                }
            }
        o || (n = !0, (o = document.createElement("script")).charset = "utf-8", o.timeout = 120, i.nc && o.setAttribute("nonce", i.nc), o.setAttribute("data-webpack", "_N_E:" + r), o.src = i.tu(e)), a[e] = [t];
        var u = (t, r) => {
                o.onerror = o.onload = null, clearTimeout(l);
                var c = a[e];
                if (delete a[e], o.parentNode && o.parentNode.removeChild(o), c && c.forEach(e => e(r)), t) return t(r)
            },
            l = setTimeout(u.bind(null, void 0, {
                type: "timeout",
                target: o
            }), 12e4);
        o.onerror = u.bind(null, o.onerror), o.onload = u.bind(null, o.onload), n && document.head.appendChild(o)
    }, i.r = e => {
        "u" > typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }, i.tt = () => (void 0 === c && (c = {
        createScriptURL: e => e
    }, "u" > typeof trustedTypes && trustedTypes.createPolicy && (c = trustedTypes.createPolicy("nextjs#bundler", c))), c), i.tu = e => i.tt().createScriptURL(e), i.p = "https://www.gitgenius.co/_next/", o = {
        8068: 0,
        5154: 0,
        6002: 0
    }, i.f.j = (e, t) => {
        var r = i.o(o, e) ? o[e] : void 0;
        if (0 !== r)
            if (r) t.push(r[2]);
            else if (/^(5154|6002|8068)$/.test(e)) o[e] = 0;
        else {
            var a = new Promise((t, a) => r = o[e] = [t, a]);
            t.push(r[2] = a);
            var c = i.p + i.u(e),
                n = Error();
            i.l(c, t => {
                if (i.o(o, e) && (0 !== (r = o[e]) && (o[e] = void 0), r)) {
                    var a = t && ("load" === t.type ? "missing" : t.type),
                        c = t && t.target && t.target.src;
                    n.message = "Loading chunk " + e + " failed.\n(" + a + ": " + c + ")", n.name = "ChunkLoadError", n.type = a, n.request = c, r[1](n)
                }
            }, "chunk-" + e, e)
        }
    }, i.O.j = e => 0 === o[e], n = (e, t) => {
        var r, a, [c, n, f] = t,
            d = 0;
        if (c.some(e => 0 !== o[e])) {
            for (r in n) i.o(n, r) && (i.m[r] = n[r]);
            if (f) var s = f(i)
        }
        for (e && e(t); d < c.length; d++) a = c[d], i.o(o, a) && o[a] && o[a][0](), o[a] = 0;
        return i.O(s)
    }, (f = self.webpackChunk_N_E = self.webpackChunk_N_E || []).forEach(n.bind(null, 0)), f.push = n.bind(null, f.push.bind(f))
})();