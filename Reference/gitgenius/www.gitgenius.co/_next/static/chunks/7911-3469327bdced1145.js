"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [7911], {
        7367: (e, t, r) => {
            r.d(t, {
                A: () => a
            });

            function a(e) {
                return Math.round(10 * (e < 1 ? 5.11916 * e ** 2 : 4.5 * Math.log(e + 1) + 2)) / 1e3
            }
        },
        16377: (e, t, r) => {
            r.d(t, {
                b: () => n
            }), r(12115);
            var a = r(33957);

            function n(e) {
                return (0, a.b)(e)
            }
            r(95155)
        },
        24885: (e, t, r) => {
            r.d(t, {
                A: () => n
            });
            var a = r(34449);

            function n(e, t, r = "Mui") {
                let i = {};
                return t.forEach(t => {
                    i[t] = (0, a.Ay)(e, t, r)
                }), i
            }
        },
        31598: (e, t, r) => {
            r.d(t, {
                A: () => a
            });
            let a = "$$material"
        },
        32216: (e, t, r) => {
            r.d(t, {
                A: () => a
            });
            let a = function(e) {
                return "ownerState" !== e && "theme" !== e && "sx" !== e && "as" !== e
            }
        },
        32764: (e, t, r) => {
            r.d(t, {
                A: () => n
            });
            var a = r(32216);
            let n = e => (0, a.A)(e) && "classes" !== e
        },
        33957: (e, t, r) => {
            r.d(t, {
                A: () => c,
                b: () => l
            });
            var a = r(12115),
                n = r(76687),
                i = r(95155);
            let o = a.createContext(void 0);

            function l({
                props: e,
                name: t
            }) {
                return function(e) {
                    let {
                        theme: t,
                        name: r,
                        props: a
                    } = e;
                    if (!t || !t.components || !t.components[r]) return a;
                    let i = t.components[r];
                    return i.defaultProps ? (0, n.A)(i.defaultProps, a, t.components.mergeClassNameAndStyle) : i.styleOverrides || i.variants ? a : (0, n.A)(i, a, t.components.mergeClassNameAndStyle)
                }({
                    props: e,
                    name: t,
                    theme: {
                        components: a.useContext(o)
                    }
                })
            }
            let c = function({
                value: e,
                children: t
            }) {
                return (0, i.jsx)(o.Provider, {
                    value: e,
                    children: t
                })
            }
        },
        35915: (e, t, r) => {
            r.d(t, {
                Ay: () => s,
                p0: () => o
            });
            let a = ["all"],
                n = {},
                i = {
                    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
                    easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
                    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
                    sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
                },
                o = {
                    shortest: 150,
                    shorter: 200,
                    short: 250,
                    standard: 300,
                    complex: 375,
                    enteringScreen: 225,
                    leavingScreen: 195
                };

            function l(e) {
                return `${Math.round(e)}ms`
            }

            function c(e) {
                if (!e) return 0;
                let t = e / 36;
                return Math.min(Math.round((4 + 15 * t ** .25 + t / 5) * 10), 3e3)
            }

            function s(e) {
                let t = { ...e
                };
                delete t.reducedMotion;
                let r = { ...i,
                        ...t.easing
                    },
                    s = { ...o,
                        ...t.duration
                    };
                return {
                    getAutoHeightDuration: c,
                    create: t.create ? ? ((e = a, t = n) => {
                        let {
                            duration: i = s.standard,
                            easing: o = r.easeInOut,
                            delay: c = 0,
                            ...d
                        } = t;
                        return (Array.isArray(e) ? e : [e]).map(e => `${e} ${"string"==typeof i?i:l(i)} ${o} ${"string"==typeof c?c:l(c)}`).join(",")
                    }),
                    ...t,
                    easing: r,
                    duration: s
                }
            }
        },
        37911: (e, t, r) => {
            r.d(t, {
                default: () => h
            });
            var a = r(12115),
                n = r(29722),
                i = r(97335),
                o = r(86670),
                l = r(53083),
                c = r(16377),
                s = r(75092),
                d = r(44074),
                p = r(80995),
                g = r(95155);
            let u = (0, o.default)("span", {
                    name: "MuiTypography",
                    slot: "Root",
                    overridesResolver: (e, t) => {
                        let {
                            ownerState: r
                        } = e;
                        return [t.root, r.variant && t[r.variant], "inherit" !== r.align && t[`align${(0,s.A)(r.align)}`], r.noWrap && t.noWrap, r.gutterBottom && t.gutterBottom]
                    }
                })((0, l.A)(({
                    theme: e
                }) => ({
                    margin: 0,
                    variants: [{
                        props: {
                            variant: "inherit"
                        },
                        style: {
                            font: "inherit",
                            lineHeight: "inherit",
                            letterSpacing: "inherit"
                        }
                    }, ...Object.entries(e.typography).filter(([e, t]) => "inherit" !== e && t && "object" == typeof t).map(([e, t]) => ({
                        props: {
                            variant: e
                        },
                        style: t
                    })), ...Object.entries(e.palette).filter((0, d.A)()).map(([t]) => ({
                        props: {
                            color: t
                        },
                        style: {
                            color: (e.vars || e).palette[t].main
                        }
                    })), ...Object.entries(e.palette ? .text || {}).filter(([, e]) => "string" == typeof e).map(([t]) => ({
                        props: {
                            color: `text${(0,s.A)(t)}`
                        },
                        style: {
                            color: (e.vars || e).palette.text[t]
                        }
                    })), {
                        props: ({
                            ownerState: e
                        }) => "inherit" !== e.align,
                        style: {
                            textAlign: "var(--Typography-textAlign)"
                        }
                    }, {
                        props: ({
                            ownerState: e
                        }) => e.noWrap,
                        style: {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }
                    }, {
                        props: ({
                            ownerState: e
                        }) => e.gutterBottom,
                        style: {
                            marginBottom: "0.35em"
                        }
                    }]
                }))),
                f = {
                    h1: "h1",
                    h2: "h2",
                    h3: "h3",
                    h4: "h4",
                    h5: "h5",
                    h6: "h6",
                    subtitle1: "h6",
                    subtitle2: "h6",
                    body1: "p",
                    body2: "p",
                    inherit: "p"
                },
                h = a.forwardRef(function(e, t) {
                    let r = (0, c.b)({
                            props: e,
                            name: "MuiTypography"
                        }),
                        {
                            color: a,
                            align: o = "inherit",
                            className: l,
                            component: d,
                            gutterBottom: h = !1,
                            noWrap: m = !1,
                            variant: y = "body1",
                            variantMapping: b = f,
                            ...A
                        } = r,
                        S = { ...r,
                            align: o,
                            color: a,
                            className: l,
                            component: d,
                            gutterBottom: h,
                            noWrap: m,
                            variant: y,
                            variantMapping: b
                        },
                        k = d || b[y] || f[y] || "span",
                        $ = (e => {
                            let {
                                align: t,
                                gutterBottom: r,
                                noWrap: a,
                                variant: n,
                                classes: o
                            } = e, l = {
                                root: ["root", n, "inherit" !== e.align && `align${(0,s.A)(t)}`, r && "gutterBottom", a && "noWrap"]
                            };
                            return (0, i.A)(l, p.y, o)
                        })(S);
                    return (0, g.jsx)(u, {
                        as: k,
                        ref: t,
                        className: (0, n.A)($.root, l),
                        ...A,
                        ownerState: S,
                        style: { ..."inherit" !== o && {
                                "--Typography-textAlign": o
                            },
                            ...A.style
                        }
                    })
                })
        },
        44074: (e, t, r) => {
            r.d(t, {
                A: () => a
            });

            function a(e = []) {
                return ([, t]) => t && function(e, t = []) {
                    if ("string" != typeof e.main) return !1;
                    for (let r of t)
                        if (!e.hasOwnProperty(r) || "string" != typeof e[r]) return !1;
                    return !0
                }(t, e)
            }
        },
        45365: (e, t, r) => {
            r.d(t, {
                X4: () => p,
                e$: () => u,
                eM: () => d,
                YL: () => c,
                a: () => h,
                Cg: () => g,
                Me: () => o,
                Nd: () => f,
                Y9: () => y,
                j4: () => m
            });
            var a = r(42853);

            function n(e, t = 0, r = 1) {
                return function(e, t = Number.MIN_SAFE_INTEGER, r = Number.MAX_SAFE_INTEGER) {
                    return Math.max(t, Math.min(e, r))
                }(e, t, r)
            }

            function i(e) {
                let t;
                if (e.type) return e;
                if ("#" === e.charAt(0)) {
                    var r;
                    let t, a;
                    return i((r = (r = e).slice(1), t = RegExp(`.{1,${r.length>=6?2:1}}`, "g"), (a = r.match(t)) && 1 === a[0].length && (a = a.map(e => e + e)), a ? `rgb${4===a.length?"a":""}(${a.map((e,t)=>t<3?parseInt(e,16):Math.round(parseInt(e,16)/255*1e3)/1e3).join(", ")})` : ""))
                }
                let n = e.indexOf("("),
                    o = e.substring(0, n);
                if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(o)) throw Error((0, a.A)(9, e));
                let l = e.substring(n + 1, e.length - 1);
                if ("color" === o) {
                    if (t = (l = l.split(" ")).shift(), 4 === l.length && "/" === l[3].charAt(0) && (l[3] = l[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(t)) throw Error((0, a.A)(10, t))
                } else l = l.split(",");
                return {
                    type: o,
                    values: l = l.map(e => parseFloat(e)),
                    colorSpace: t
                }
            }
            let o = (e, t) => {
                try {
                    let t;
                    return (t = i(e)).values.slice(0, 3).map((e, r) => t.type.includes("hsl") && 0 !== r ? `${e}%` : e).join(" ")
                } catch (t) {
                    return e
                }
            };

            function l(e) {
                let {
                    type: t,
                    colorSpace: r
                } = e, {
                    values: a
                } = e;
                return t.includes("rgb") ? a = a.map((e, t) => t < 3 ? parseInt(e, 10) : e) : t.includes("hsl") && (a[1] = `${a[1]}%`, a[2] = `${a[2]}%`), a = t.includes("color") ? `${r} ${a.join(" ")}` : `${a.join(", ")}`, `${t}(${a})`
            }

            function c(e) {
                let {
                    values: t
                } = e = i(e), r = t[0], a = t[1] / 100, n = t[2] / 100, o = a * Math.min(n, 1 - n), c = (e, t = (e + r / 30) % 12) => n - o * Math.max(Math.min(t - 3, 9 - t, 1), -1), s = "rgb", d = [Math.round(255 * c(0)), Math.round(255 * c(8)), Math.round(255 * c(4))];
                return "hsla" === e.type && (s += "a", d.push(t[3])), l({
                    type: s,
                    values: d
                })
            }

            function s(e) {
                let t = "hsl" === (e = i(e)).type || "hsla" === e.type ? i(c(e)).values : e.values;
                return Number((.2126 * (t = t.map(t => ("color" !== e.type && (t /= 255), t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4)))[0] + .7152 * t[1] + .0722 * t[2]).toFixed(3))
            }

            function d(e, t) {
                let r = s(e),
                    a = s(t);
                return (Math.max(r, a) + .05) / (Math.min(r, a) + .05)
            }

            function p(e, t) {
                return e = i(e), t = n(t), ("rgb" === e.type || "hsl" === e.type) && (e.type += "a"), "color" === e.type ? e.values[3] = `/${t}` : e.values[3] = t, l(e)
            }

            function g(e, t, r) {
                try {
                    return p(e, t)
                } catch (t) {
                    return e
                }
            }

            function u(e, t) {
                if (e = i(e), t = n(t), e.type.includes("hsl")) e.values[2] *= 1 - t;
                else if (e.type.includes("rgb") || e.type.includes("color"))
                    for (let r = 0; r < 3; r += 1) e.values[r] *= 1 - t;
                return l(e)
            }

            function f(e, t, r) {
                try {
                    return u(e, t)
                } catch (t) {
                    return e
                }
            }

            function h(e, t) {
                if (e = i(e), t = n(t), e.type.includes("hsl")) e.values[2] += (100 - e.values[2]) * t;
                else if (e.type.includes("rgb"))
                    for (let r = 0; r < 3; r += 1) e.values[r] += (255 - e.values[r]) * t;
                else if (e.type.includes("color"))
                    for (let r = 0; r < 3; r += 1) e.values[r] += (1 - e.values[r]) * t;
                return l(e)
            }

            function m(e, t, r) {
                try {
                    return h(e, t)
                } catch (t) {
                    return e
                }
            }

            function y(e, t, r) {
                try {
                    return function(e, t = .15) {
                        return s(e) > .5 ? u(e, t) : h(e, t)
                    }(e, t)
                } catch (t) {
                    return e
                }
            }
        },
        50815: (e, t, r) => {
            r.d(t, {
                A: () => Q
            });
            var a = r(42853),
                n = r(20109),
                i = r(45365);
            let o = {
                    black: "#000",
                    white: "#fff"
                },
                l = {
                    50: "#fafafa",
                    100: "#f5f5f5",
                    200: "#eeeeee",
                    300: "#e0e0e0",
                    400: "#bdbdbd",
                    500: "#9e9e9e",
                    600: "#757575",
                    700: "#616161",
                    800: "#424242",
                    900: "#212121",
                    A100: "#f5f5f5",
                    A200: "#eeeeee",
                    A400: "#bdbdbd",
                    A700: "#616161"
                },
                c = {
                    50: "#f3e5f5",
                    100: "#e1bee7",
                    200: "#ce93d8",
                    300: "#ba68c8",
                    400: "#ab47bc",
                    500: "#9c27b0",
                    600: "#8e24aa",
                    700: "#7b1fa2",
                    800: "#6a1b9a",
                    900: "#4a148c",
                    A100: "#ea80fc",
                    A200: "#e040fb",
                    A400: "#d500f9",
                    A700: "#aa00ff"
                },
                s = {
                    50: "#ffebee",
                    100: "#ffcdd2",
                    200: "#ef9a9a",
                    300: "#e57373",
                    400: "#ef5350",
                    500: "#f44336",
                    600: "#e53935",
                    700: "#d32f2f",
                    800: "#c62828",
                    900: "#b71c1c",
                    A100: "#ff8a80",
                    A200: "#ff5252",
                    A400: "#ff1744",
                    A700: "#d50000"
                },
                d = {
                    50: "#fff3e0",
                    100: "#ffe0b2",
                    200: "#ffcc80",
                    300: "#ffb74d",
                    400: "#ffa726",
                    500: "#ff9800",
                    600: "#fb8c00",
                    700: "#f57c00",
                    800: "#ef6c00",
                    900: "#e65100",
                    A100: "#ffd180",
                    A200: "#ffab40",
                    A400: "#ff9100",
                    A700: "#ff6d00"
                },
                p = {
                    50: "#e3f2fd",
                    100: "#bbdefb",
                    200: "#90caf9",
                    300: "#64b5f6",
                    400: "#42a5f5",
                    500: "#2196f3",
                    600: "#1e88e5",
                    700: "#1976d2",
                    800: "#1565c0",
                    900: "#0d47a1",
                    A100: "#82b1ff",
                    A200: "#448aff",
                    A400: "#2979ff",
                    A700: "#2962ff"
                },
                g = {
                    50: "#e1f5fe",
                    100: "#b3e5fc",
                    200: "#81d4fa",
                    300: "#4fc3f7",
                    400: "#29b6f6",
                    500: "#03a9f4",
                    600: "#039be5",
                    700: "#0288d1",
                    800: "#0277bd",
                    900: "#01579b",
                    A100: "#80d8ff",
                    A200: "#40c4ff",
                    A400: "#00b0ff",
                    A700: "#0091ea"
                },
                u = {
                    50: "#e8f5e9",
                    100: "#c8e6c9",
                    200: "#a5d6a7",
                    300: "#81c784",
                    400: "#66bb6a",
                    500: "#4caf50",
                    600: "#43a047",
                    700: "#388e3c",
                    800: "#2e7d32",
                    900: "#1b5e20",
                    A100: "#b9f6ca",
                    A200: "#69f0ae",
                    A400: "#00e676",
                    A700: "#00c853"
                };

            function f() {
                return {
                    text: {
                        primary: "rgba(0, 0, 0, 0.87)",
                        secondary: "rgba(0, 0, 0, 0.6)",
                        disabled: "rgba(0, 0, 0, 0.38)"
                    },
                    divider: "rgba(0, 0, 0, 0.12)",
                    background: {
                        paper: o.white,
                        default: o.white
                    },
                    action: {
                        active: "rgba(0, 0, 0, 0.54)",
                        hover: "rgba(0, 0, 0, 0.04)",
                        hoverOpacity: .04,
                        selected: "rgba(0, 0, 0, 0.08)",
                        selectedOpacity: .08,
                        disabled: "rgba(0, 0, 0, 0.26)",
                        disabledBackground: "rgba(0, 0, 0, 0.12)",
                        disabledOpacity: .38,
                        focus: "rgba(0, 0, 0, 0.12)",
                        focusOpacity: .12,
                        activatedOpacity: .12
                    }
                }
            }
            let h = f();

            function m() {
                return {
                    text: {
                        primary: o.white,
                        secondary: "rgba(255, 255, 255, 0.7)",
                        disabled: "rgba(255, 255, 255, 0.5)",
                        icon: "rgba(255, 255, 255, 0.5)"
                    },
                    divider: "rgba(255, 255, 255, 0.12)",
                    background: {
                        paper: "#121212",
                        default: "#121212"
                    },
                    action: {
                        active: o.white,
                        hover: "rgba(255, 255, 255, 0.08)",
                        hoverOpacity: .08,
                        selected: "rgba(255, 255, 255, 0.16)",
                        selectedOpacity: .16,
                        disabled: "rgba(255, 255, 255, 0.3)",
                        disabledBackground: "rgba(255, 255, 255, 0.12)",
                        disabledOpacity: .38,
                        focus: "rgba(255, 255, 255, 0.12)",
                        focusOpacity: .12,
                        activatedOpacity: .24
                    }
                }
            }
            let y = m();

            function b(e, t, r, a) {
                let n = a.light || a,
                    o = a.dark || 1.5 * a;
                e[t] || (e.hasOwnProperty(r) ? e[t] = e[r] : "light" === t ? e.light = (0, i.a)(e.main, n) : "dark" === t && (e.dark = (0, i.e$)(e.main, o)))
            }

            function A(e, t, r, a, n) {
                let i = n.light || n,
                    o = n.dark || 1.5 * n;
                t[r] || (t.hasOwnProperty(a) ? t[r] = t[a] : "light" === r ? t.light = `color-mix(in ${e}, ${t.main}, #fff ${(100*i).toFixed(0)}%)` : "dark" === r && (t.dark = `color-mix(in ${e}, ${t.main}, #000 ${(100*o).toFixed(0)}%)`))
            }

            function S(e) {
                let t, {
                        mode: r = "light",
                        contrastThreshold: S = 3,
                        tonalOffset: k = .2,
                        colorSpace: $,
                        ...C
                    } = e,
                    v = e.primary || function(e = "light") {
                        return "dark" === e ? {
                            main: p[200],
                            light: p[50],
                            dark: p[400]
                        } : {
                            main: p[700],
                            light: p[400],
                            dark: p[800]
                        }
                    }(r),
                    x = e.secondary || function(e = "light") {
                        return "dark" === e ? {
                            main: c[200],
                            light: c[50],
                            dark: c[400]
                        } : {
                            main: c[500],
                            light: c[300],
                            dark: c[700]
                        }
                    }(r),
                    w = e.error || function(e = "light") {
                        return "dark" === e ? {
                            main: s[500],
                            light: s[300],
                            dark: s[700]
                        } : {
                            main: s[700],
                            light: s[400],
                            dark: s[800]
                        }
                    }(r),
                    B = e.info || function(e = "light") {
                        return "dark" === e ? {
                            main: g[400],
                            light: g[300],
                            dark: g[700]
                        } : {
                            main: g[700],
                            light: g[500],
                            dark: g[900]
                        }
                    }(r),
                    j = e.success || function(e = "light") {
                        return "dark" === e ? {
                            main: u[400],
                            light: u[300],
                            dark: u[700]
                        } : {
                            main: u[800],
                            light: u[500],
                            dark: u[900]
                        }
                    }(r),
                    T = e.warning || function(e = "light") {
                        return "dark" === e ? {
                            main: d[400],
                            light: d[300],
                            dark: d[700]
                        } : {
                            main: "#ed6c02",
                            light: d[500],
                            dark: d[900]
                        }
                    }(r);

                function N(e) {
                    if ($) return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
                    return (0, i.eM)(e, y.text.primary) >= S ? y.text.primary : h.text.primary
                }
                let O = ({
                    color: e,
                    name: t,
                    mainShade: r = 500,
                    lightShade: n = 300,
                    darkShade: i = 700
                }) => {
                    if (!(e = { ...e
                        }).main && e[r] && (e.main = e[r]), !e.hasOwnProperty("main")) throw Error((0, a.A)(11, t ? ` (${t})` : "", r));
                    if ("string" != typeof e.main) throw Error((0, a.A)(12, t ? ` (${t})` : "", JSON.stringify(e.main)));
                    return $ ? (A($, e, "light", n, k), A($, e, "dark", i, k)) : (b(e, "light", n, k), b(e, "dark", i, k)), e.contrastText || (e.contrastText = N(e.main)), e
                };
                return "light" === r ? t = f() : "dark" === r && (t = m()), (0, n.A)({
                    common: { ...o
                    },
                    mode: r,
                    primary: O({
                        color: v,
                        name: "primary"
                    }),
                    secondary: O({
                        color: x,
                        name: "secondary",
                        mainShade: "A400",
                        lightShade: "A200",
                        darkShade: "A700"
                    }),
                    error: O({
                        color: w,
                        name: "error"
                    }),
                    warning: O({
                        color: T,
                        name: "warning"
                    }),
                    info: O({
                        color: B,
                        name: "info"
                    }),
                    success: O({
                        color: j,
                        name: "success"
                    }),
                    grey: l,
                    contrastThreshold: S,
                    getContrastText: N,
                    augmentColor: O,
                    tonalOffset: k,
                    ...t
                }, C)
            }
            var k = r(67991),
                $ = r(34307);
            let C = (e, t, r, a = []) => {
                let n = e;
                t.forEach((e, i) => {
                    i === t.length - 1 ? Array.isArray(n) ? n[Number(e)] = r : n && "object" == typeof n && (n[e] = r) : n && "object" == typeof n && (n[e] || (n[e] = a.includes(e) ? [] : {}), n = n[e])
                })
            };

            function v(e, t) {
                var r, a;
                let {
                    prefix: n,
                    shouldSkipGeneratingVar: i
                } = t || {}, o = {}, l = {}, c = {};
                return r = (e, t, r) => {
                        if (("string" == typeof t || "number" == typeof t) && (!i || !i(e, t))) {
                            var a, s;
                            let i = `--${n?`${n}-`:""}${e.join("-")}`,
                                d = (a = e, "number" == typeof(s = t) ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some(e => a.includes(e)) || a[a.length - 1].toLowerCase().includes("opacity") ? s : `${s}px` : s);
                            Object.assign(o, {
                                [i]: d
                            }), C(l, e, `var(${i})`, r), C(c, e, `var(${i}, ${d})`, r)
                        }
                    }, a = e => "vars" === e[0],
                    function e(t, n = [], i = []) {
                        Object.entries(t).forEach(([t, o]) => {
                            a && (!a || a([...n, t])) || null == o || ("object" == typeof o && Object.keys(o).length > 0 ? e(o, [...n, t], Array.isArray(o) ? [...i, t] : i) : r([...n, t], o, i))
                        })
                    }(e), {
                        css: o,
                        vars: l,
                        varsWithDefaults: c
                    }
            }
            let x = function(e, t = {}) {
                let {
                    getSelector: r = function(t, r) {
                        let a = i;
                        if ("class" === i && (a = ".%s"), "data" === i && (a = "[data-%s]"), i ? .startsWith("data-") && !i.includes("%s") && (a = `[${i}="%s"]`), t) {
                            if ("media" === a) {
                                if (e.defaultColorScheme === t) return ":root";
                                let a = l[t] ? .palette ? .mode || t;
                                return {
                                    [`@media (prefers-color-scheme: ${a})`]: {
                                        ":root": r
                                    }
                                }
                            }
                            if (a) return e.defaultColorScheme === t ? `:root, ${a.replace("%s",String(t))}` : a.replace("%s", String(t))
                        }
                        return ":root"
                    },
                    disableCssColorScheme: a,
                    colorSchemeSelector: i,
                    enableContrastVars: o
                } = t, {
                    colorSchemes: l = {},
                    components: c,
                    defaultColorScheme: s = "light",
                    ...d
                } = e, {
                    vars: p,
                    css: g,
                    varsWithDefaults: u
                } = v(d, t), f = u, h = {}, {
                    [s]: m,
                    ...y
                } = l;
                if (Object.entries(y || {}).forEach(([e, r]) => {
                        let {
                            vars: a,
                            css: i,
                            varsWithDefaults: o
                        } = v(r, t);
                        f = (0, n.A)(f, o), h[e] = {
                            css: i,
                            vars: a
                        }
                    }), m) {
                    let {
                        css: e,
                        vars: r,
                        varsWithDefaults: a
                    } = v(m, t);
                    f = (0, n.A)(f, a), h[s] = {
                        css: e,
                        vars: r
                    }
                }
                return {
                    vars: f,
                    generateThemeVars: () => {
                        let e = { ...p
                        };
                        return Object.entries(h).forEach(([, {
                            vars: t
                        }]) => {
                            e = (0, n.A)(e, t)
                        }), e
                    },
                    generateStyleSheets: () => {
                        let t = [],
                            n = e.defaultColorScheme || "light";

                        function i(e, r) {
                            Object.keys(r).length && t.push("string" == typeof e ? {
                                [e]: { ...r
                                }
                            } : e)
                        }
                        i(r(void 0, { ...g
                        }), g);
                        let {
                            [n]: c, ...s
                        } = h;
                        if (c) {
                            let {
                                css: e
                            } = c, t = l[n] ? .palette ? .mode, o = !a && t ? {
                                colorScheme: t,
                                ...e
                            } : { ...e
                            };
                            i(r(n, { ...o
                            }), o)
                        }
                        return Object.entries(s).forEach(([e, {
                            css: t
                        }]) => {
                            let n = l[e] ? .palette ? .mode,
                                o = !a && n ? {
                                    colorScheme: n,
                                    ...t
                                } : { ...t
                                };
                            i(r(e, { ...o
                            }), o)
                        }), o && t.push({
                            ":root": {
                                "--__l-threshold": "0.7",
                                "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
                                "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
                            }
                        }), t
                    }
                }
            };
            var w = r(89754),
                B = r(79727),
                j = r(67811),
                T = r(97516);

            function N(...e) {
                return `${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,0.2),${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,0.14),${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,0.12)`
            }
            let O = ["none", N(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), N(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), N(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), N(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), N(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), N(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), N(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), N(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), N(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), N(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), N(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), N(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), N(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), N(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), N(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), N(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), N(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), N(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), N(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), N(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), N(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), N(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), N(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), N(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)];
            var M = r(35915);
            let F = {},
                _ = {
                    mobileStepper: 1e3,
                    fab: 1050,
                    speedDial: 1050,
                    appBar: 1100,
                    drawer: 1200,
                    modal: 1300,
                    snackbar: 1400,
                    tooltip: 1500
                };

            function I(e = {}) {
                let t = { ...e
                };
                return ! function e(t) {
                    let r = Object.entries(t);
                    for (let a = 0; a < r.length; a++) {
                        let [i, o] = r[a];
                        !((0, n.Q)(o) || void 0 === o || "string" == typeof o || "boolean" == typeof o || "number" == typeof o || Array.isArray(o)) || i.startsWith("unstable_") || i.startsWith("internal_") ? delete t[i] : (0, n.Q)(o) && (t[i] = { ...o
                        }, e(t[i]))
                    }
                }(t), `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(t,null,2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.motion = { reducedMotion: 'never', ...theme.motion };
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`
            }

            function E(e) {
                return "number" == typeof e ? `${(100*e).toFixed(0)}%` : `calc((${e}) * 100%)`
            }
            let P = function(e = {}, ...t) {
                var r, o;
                let {
                    breakpoints: l,
                    mixins: c = {},
                    spacing: s,
                    palette: d = {},
                    motion: p = {},
                    transitions: g = {},
                    typography: u = {},
                    shape: f,
                    colorSpace: h,
                    ...m
                } = e;
                if (e.vars && void 0 === e.generateThemeVars) throw Error((0, a.A)(22));
                let y = S({ ...d,
                        colorSpace: h
                    }),
                    b = (0, j.A)(e),
                    A = (0, n.A)(b, {
                        mixins: (r = b.breakpoints, {
                            toolbar: {
                                minHeight: 56,
                                [r.up("xs")]: {
                                    "@media (orientation: landscape)": {
                                        minHeight: 48
                                    }
                                },
                                [r.up("sm")]: {
                                    minHeight: 64
                                }
                            },
                            ...c
                        }),
                        palette: y,
                        shadows: O.slice(),
                        typography: (0, T.A)(y, u),
                        motion: function(e = F) {
                            return {
                                reducedMotion: "never",
                                ...e
                            }
                        }(p),
                        transitions: (0, M.Ay)(g),
                        zIndex: { ..._
                        }
                    });
                return A = (0, n.A)(A, m), A = t.reduce((e, t) => (0, n.A)(e, t), A), delete A.transitions.reducedMotion, A.unstable_sxConfig = { ...w.A,
                    ...m ? .unstable_sxConfig
                }, A.unstable_sx = function(e) {
                    return (0, B.A)({
                        sx: e,
                        theme: this
                    })
                }, A.toRuntimeSource = I, Object.assign(o = A, {
                    alpha(e, t) {
                        let r = this || o;
                        return r.colorSpace ? `oklch(from ${e} l c h / ${"string"==typeof t?`calc(${t})`:t})` : r.vars ? `rgba(${e.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g,"var(--$1Channel)")} / ${"string"==typeof t?`calc(${t})`:t})` : (0, i.X4)(e, (e => {
                            if (!Number.isNaN(+e)) return +e;
                            let t = e.match(/\d*\.?\d+/g);
                            if (!t) return 0;
                            let r = 0;
                            for (let e = 0; e < t.length; e += 1) r += +t[e];
                            return r
                        })(t))
                    },
                    lighten(e, t) {
                        let r = this || o;
                        return r.colorSpace ? `color-mix(in ${r.colorSpace}, ${e}, #fff ${E(t)})` : (0, i.a)(e, t)
                    },
                    darken(e, t) {
                        let r = this || o;
                        return r.colorSpace ? `color-mix(in ${r.colorSpace}, ${e}, #000 ${E(t)})` : (0, i.e$)(e, t)
                    }
                }), A
            };
            var D = r(7367);
            let L = [...Array(25)].map((e, t) => {
                if (0 === t) return "none";
                let r = (0, D.A)(t);
                return `linear-gradient(rgba(255 255 255 / ${r}), rgba(255 255 255 / ${r}))`
            });

            function W(e) {
                return {
                    inputPlaceholder: "dark" === e ? .5 : .42,
                    inputUnderline: "dark" === e ? .7 : .42,
                    switchTrackDisabled: "dark" === e ? .2 : .12,
                    switchTrack: "dark" === e ? .3 : .38
                }
            }

            function H(e) {
                return "dark" === e ? L : []
            }

            function R(e) {
                return "motion" === e[0] || !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || "palette" === e[0] && !!e[1] ? .match(/(mode|contrastThreshold|tonalOffset)/)
            }

            function z(e, t, r) {
                !e[t] && r && (e[t] = r)
            }

            function V(e) {
                return "string" == typeof e && e.startsWith("hsl") ? (0, i.YL)(e) : e
            }

            function Y(e, t) {
                `${t}Channel` in e || (e[`${t}Channel`] = (0, i.Me)(V(e[t]), `MUI: Can't create \`palette.${t}Channel\` because \`palette.${t}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${t}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`))
            }
            let X = e => {
                try {
                    return e()
                } catch (e) {}
            };

            function G(e, t, r, a, n) {
                if (!r) return;
                r = !0 === r ? {} : r;
                let i = "dark" === n ? "dark" : "light";
                if (!a) {
                    t[n] = function(e) {
                        let {
                            palette: t = {
                                mode: "light"
                            },
                            opacity: r,
                            overlays: a,
                            colorSpace: n,
                            ...i
                        } = e, o = S({ ...t,
                            colorSpace: n
                        });
                        return {
                            palette: o,
                            opacity: { ...W(o.mode),
                                ...r
                            },
                            overlays: a || H(o.mode),
                            ...i
                        }
                    }({ ...r,
                        palette: {
                            mode: i,
                            ...r ? .palette
                        },
                        colorSpace: e
                    });
                    return
                }
                let {
                    palette: o,
                    ...l
                } = P({ ...a,
                    palette: {
                        mode: i,
                        ...r ? .palette
                    },
                    colorSpace: e
                });
                return t[n] = { ...r,
                    palette: o,
                    opacity: { ...W(i),
                        ...r ? .opacity
                    },
                    overlays: r ? .overlays || H(i)
                }, l
            }

            function J(e, t, r) {
                e.colorSchemes && r && (e.colorSchemes[t] = { ...!0 !== r && r,
                    palette: S({ ...!0 === r ? {} : r.palette,
                        mode: t
                    })
                })
            }

            function Q(e = {}, ...t) {
                let {
                    palette: r,
                    cssVariables: o = !1,
                    colorSchemes: l = !r ? {
                        light: !0
                    } : void 0,
                    defaultColorScheme: c = r ? .mode,
                    ...s
                } = e, d = c || "light", p = l ? .[d], g = { ...l,
                    ...r ? {
                        [d]: { ..."boolean" != typeof p && p,
                            palette: r
                        }
                    } : void 0
                };
                if (!1 === o) {
                    if (!("colorSchemes" in e)) return P(e, ...t);
                    let a = r;
                    "palette" in e || !g[d] || (!0 !== g[d] ? a = g[d].palette : "dark" === d && (a = {
                        mode: "dark"
                    }));
                    let n = P({ ...e,
                        palette: a
                    }, ...t);
                    return n.defaultColorScheme = d, n.colorSchemes = g, "light" === n.palette.mode && (n.colorSchemes.light = { ...!0 !== g.light && g.light,
                        palette: n.palette
                    }, J(n, "dark", g.dark)), "dark" === n.palette.mode && (n.colorSchemes.dark = { ...!0 !== g.dark && g.dark,
                        palette: n.palette
                    }, J(n, "light", g.light)), n
                }
                return r || "light" in g || "light" !== d || (g.light = !0),
                    function(e = {}, ...t) {
                        var r, o;
                        let l, c, s, {
                                colorSchemes: d = {
                                    light: !0
                                },
                                defaultColorScheme: p,
                                disableCssColorScheme: g = !1,
                                cssVarPrefix: u = "mui",
                                nativeColor: f = !1,
                                shouldSkipGeneratingVar: m = R,
                                colorSchemeSelector: b = d.light && d.dark ? "media" : void 0,
                                rootSelector: A = ":root",
                                ...S
                            } = e,
                            C = Object.keys(d)[0],
                            v = p || (d.light && "light" !== C ? "light" : C),
                            j = ((e = "mui") => (function(e = "") {
                                return (t, ...r) => `var(--${e?`${e}-`:""}${t}${function t(...r){if(!r.length)return"";let a=r[0];return"string"!=typeof a||a.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/)?`, ${a}`:`, var(--${e?`${e}-`:""}${a}${t(...r.slice(1))})`}(...r)})`
                            })(e))(u),
                            {
                                [v]: T,
                                light: N,
                                dark: O,
                                ...M
                            } = d,
                            F = { ...M
                            },
                            _ = T;
                        if (("dark" !== v || "dark" in d) && ("light" !== v || "light" in d) || (_ = !0), !_) throw Error((0, a.A)(21, v));
                        f && (l = "oklch");
                        let E = G(l, F, _, S, v);
                        N && !F.light && G(l, F, N, void 0, "light"), O && !F.dark && G(l, F, O, void 0, "dark");
                        let P = {
                            defaultColorScheme: v,
                            ...E,
                            cssVarPrefix: u,
                            colorSchemeSelector: b,
                            rootSelector: A,
                            getCssVar: j,
                            colorSchemes: F,
                            font: { ...(r = E.typography, c = {}, Object.entries(r).forEach(e => {
                                    let [t, r] = e;
                                    "object" == typeof r && (c[t] = `${r.fontStyle?`${r.fontStyle} `:""}${r.fontVariant?`${r.fontVariant} `:""}${r.fontWeight?`${r.fontWeight} `:""}${r.fontStretch?`${r.fontStretch} `:""}${r.fontSize||""}${r.lineHeight?`/${r.lineHeight} `:""}${r.fontFamily||""}`)
                                }), c),
                                ...E.font
                            },
                            spacing: "number" == typeof(o = S.spacing) ? `${o}px` : "string" == typeof o || "function" == typeof o || Array.isArray(o) ? o : "8px"
                        };
                        Object.keys(P.colorSchemes).forEach(e => {
                            let t = P.colorSchemes[e].palette,
                                r = e => {
                                    let r = e.split("-"),
                                        a = r[1],
                                        n = r[2];
                                    return j(e, t[a][n])
                                };

                            function a(e, t, r) {
                                if (l) {
                                    let a;
                                    return e === i.Cg && (a = `transparent ${((1-r)*100).toFixed(0)}%`), e === i.Nd && (a = `#000 ${(100*r).toFixed(0)}%`), e === i.j4 && (a = `#fff ${(100*r).toFixed(0)}%`), `color-mix(in ${l}, ${t}, ${a})`
                                }
                                return e(t, r)
                            }
                            if ("light" === t.mode && (z(t.common, "background", "#fff"), z(t.common, "onBackground", "#000")), "dark" === t.mode && (z(t.common, "background", "#000"), z(t.common, "onBackground", "#fff")), ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"].forEach(e => {
                                    t[e] || (t[e] = {})
                                }), "light" === t.mode) {
                                z(t.Alert, "errorColor", a(i.Nd, f ? j("palette-error-light") : t.error.light, .6)), z(t.Alert, "infoColor", a(i.Nd, f ? j("palette-info-light") : t.info.light, .6)), z(t.Alert, "successColor", a(i.Nd, f ? j("palette-success-light") : t.success.light, .6)), z(t.Alert, "warningColor", a(i.Nd, f ? j("palette-warning-light") : t.warning.light, .6)), z(t.Alert, "errorFilledBg", r("palette-error-main")), z(t.Alert, "infoFilledBg", r("palette-info-main")), z(t.Alert, "successFilledBg", r("palette-success-main")), z(t.Alert, "warningFilledBg", r("palette-warning-main")), z(t.Alert, "errorFilledColor", X(() => t.getContrastText(t.error.main))), z(t.Alert, "infoFilledColor", X(() => t.getContrastText(t.info.main))), z(t.Alert, "successFilledColor", X(() => t.getContrastText(t.success.main))), z(t.Alert, "warningFilledColor", X(() => t.getContrastText(t.warning.main))), z(t.Alert, "errorStandardBg", a(i.j4, f ? j("palette-error-light") : t.error.light, .9)), z(t.Alert, "infoStandardBg", a(i.j4, f ? j("palette-info-light") : t.info.light, .9)), z(t.Alert, "successStandardBg", a(i.j4, f ? j("palette-success-light") : t.success.light, .9)), z(t.Alert, "warningStandardBg", a(i.j4, f ? j("palette-warning-light") : t.warning.light, .9)), z(t.Alert, "errorIconColor", r("palette-error-main")), z(t.Alert, "infoIconColor", r("palette-info-main")), z(t.Alert, "successIconColor", r("palette-success-main")), z(t.Alert, "warningIconColor", r("palette-warning-main")), z(t.AppBar, "defaultBg", r("palette-grey-100")), z(t.Avatar, "defaultBg", r("palette-grey-400")), z(t.Button, "inheritContainedBg", r("palette-grey-300")), z(t.Button, "inheritContainedHoverBg", r("palette-grey-A100")), z(t.Chip, "defaultBorder", r("palette-grey-400")), z(t.Chip, "defaultAvatarColor", r("palette-grey-700")), z(t.Chip, "defaultIconColor", r("palette-grey-700")), z(t.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), z(t.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), z(t.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), z(t.LinearProgress, "primaryBg", a(i.j4, f ? j("palette-primary-main") : t.primary.main, .62)), z(t.LinearProgress, "secondaryBg", a(i.j4, f ? j("palette-secondary-main") : t.secondary.main, .62)), z(t.LinearProgress, "errorBg", a(i.j4, f ? j("palette-error-main") : t.error.main, .62)), z(t.LinearProgress, "infoBg", a(i.j4, f ? j("palette-info-main") : t.info.main, .62)), z(t.LinearProgress, "successBg", a(i.j4, f ? j("palette-success-main") : t.success.main, .62)), z(t.LinearProgress, "warningBg", a(i.j4, f ? j("palette-warning-light") : t.warning.main, .62)), z(t.Skeleton, "bg", l ? a(i.Cg, f ? j("palette-text-primary") : t.text.primary, .11) : `rgba(${r("palette-text-primaryChannel")} / 0.11)`), z(t.Slider, "primaryTrack", a(i.j4, f ? j("palette-primary-main") : t.primary.main, .62)), z(t.Slider, "secondaryTrack", a(i.j4, f ? j("palette-secondary-main") : t.secondary.main, .62)), z(t.Slider, "errorTrack", a(i.j4, f ? j("palette-error-main") : t.error.main, .62)), z(t.Slider, "infoTrack", a(i.j4, f ? j("palette-info-main") : t.info.main, .62)), z(t.Slider, "successTrack", a(i.j4, f ? j("palette-success-main") : t.success.main, .62)), z(t.Slider, "warningTrack", a(i.j4, f ? j("palette-warning-main") : t.warning.main, .62));
                                let e = l ? a(i.Nd, f ? j("palette-background-default") : t.background.default, .6825) : (0, i.Y9)(t.background.default, .8);
                                z(t.SnackbarContent, "bg", e), z(t.SnackbarContent, "color", X(() => l ? y.text.primary : t.getContrastText(e))), z(t.SpeedDialAction, "fabHoverBg", (0, i.Y9)(t.background.paper, .15)), z(t.StepConnector, "border", r("palette-grey-400")), z(t.StepContent, "border", r("palette-grey-400")), z(t.Switch, "defaultColor", r("palette-common-white")), z(t.Switch, "defaultDisabledColor", r("palette-grey-100")), z(t.Switch, "primaryDisabledColor", a(i.j4, f ? j("palette-primary-main") : t.primary.main, .62)), z(t.Switch, "secondaryDisabledColor", a(i.j4, f ? j("palette-secondary-main") : t.secondary.main, .62)), z(t.Switch, "errorDisabledColor", a(i.j4, f ? j("palette-error-main") : t.error.main, .62)), z(t.Switch, "infoDisabledColor", a(i.j4, f ? j("palette-info-main") : t.info.main, .62)), z(t.Switch, "successDisabledColor", a(i.j4, f ? j("palette-success-main") : t.success.main, .62)), z(t.Switch, "warningDisabledColor", a(i.j4, f ? j("palette-warning-main") : t.warning.main, .62)), z(t.TableCell, "border", a(i.j4, (0, i.Cg)(f ? j("palette-divider") : t.divider, 1), .88)), z(t.Tooltip, "bg", a(i.Cg, f ? j("palette-grey-700") : t.grey[700], .92))
                            }
                            if ("dark" === t.mode) {
                                z(t.Alert, "errorColor", a(i.j4, f ? j("palette-error-light") : t.error.light, .6)), z(t.Alert, "infoColor", a(i.j4, f ? j("palette-info-light") : t.info.light, .6)), z(t.Alert, "successColor", a(i.j4, f ? j("palette-success-light") : t.success.light, .6)), z(t.Alert, "warningColor", a(i.j4, f ? j("palette-warning-light") : t.warning.light, .6)), z(t.Alert, "errorFilledBg", r("palette-error-dark")), z(t.Alert, "infoFilledBg", r("palette-info-dark")), z(t.Alert, "successFilledBg", r("palette-success-dark")), z(t.Alert, "warningFilledBg", r("palette-warning-dark")), z(t.Alert, "errorFilledColor", X(() => t.getContrastText(t.error.dark))), z(t.Alert, "infoFilledColor", X(() => t.getContrastText(t.info.dark))), z(t.Alert, "successFilledColor", X(() => t.getContrastText(t.success.dark))), z(t.Alert, "warningFilledColor", X(() => t.getContrastText(t.warning.dark))), z(t.Alert, "errorStandardBg", a(i.Nd, f ? j("palette-error-light") : t.error.light, .9)), z(t.Alert, "infoStandardBg", a(i.Nd, f ? j("palette-info-light") : t.info.light, .9)), z(t.Alert, "successStandardBg", a(i.Nd, f ? j("palette-success-light") : t.success.light, .9)), z(t.Alert, "warningStandardBg", a(i.Nd, f ? j("palette-warning-light") : t.warning.light, .9)), z(t.Alert, "errorIconColor", r("palette-error-main")), z(t.Alert, "infoIconColor", r("palette-info-main")), z(t.Alert, "successIconColor", r("palette-success-main")), z(t.Alert, "warningIconColor", r("palette-warning-main")), z(t.AppBar, "defaultBg", r("palette-grey-900")), z(t.AppBar, "darkBg", r("palette-background-paper")), z(t.AppBar, "darkColor", r("palette-text-primary")), z(t.Avatar, "defaultBg", r("palette-grey-600")), z(t.Button, "inheritContainedBg", r("palette-grey-800")), z(t.Button, "inheritContainedHoverBg", r("palette-grey-700")), z(t.Chip, "defaultBorder", r("palette-grey-700")), z(t.Chip, "defaultAvatarColor", r("palette-grey-300")), z(t.Chip, "defaultIconColor", r("palette-grey-300")), z(t.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), z(t.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), z(t.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), z(t.LinearProgress, "primaryBg", a(i.Nd, f ? j("palette-primary-main") : t.primary.main, .5)), z(t.LinearProgress, "secondaryBg", a(i.Nd, f ? j("palette-secondary-main") : t.secondary.main, .5)), z(t.LinearProgress, "errorBg", a(i.Nd, f ? j("palette-error-main") : t.error.main, .5)), z(t.LinearProgress, "infoBg", a(i.Nd, f ? j("palette-info-main") : t.info.main, .5)), z(t.LinearProgress, "successBg", a(i.Nd, f ? j("palette-success-main") : t.success.main, .5)), z(t.LinearProgress, "warningBg", a(i.Nd, f ? j("palette-warning-main") : t.warning.main, .5)), z(t.Skeleton, "bg", l ? a(i.Cg, f ? j("palette-text-primary") : t.text.primary, .13) : `rgba(${r("palette-text-primaryChannel")} / 0.13)`), z(t.Slider, "primaryTrack", a(i.Nd, f ? j("palette-primary-main") : t.primary.main, .5)), z(t.Slider, "secondaryTrack", a(i.Nd, f ? j("palette-secondary-main") : t.secondary.main, .5)), z(t.Slider, "errorTrack", a(i.Nd, f ? j("palette-error-main") : t.error.main, .5)), z(t.Slider, "infoTrack", a(i.Nd, f ? j("palette-info-main") : t.info.main, .5)), z(t.Slider, "successTrack", a(i.Nd, f ? j("palette-success-main") : t.success.main, .5)), z(t.Slider, "warningTrack", a(i.Nd, f ? j("palette-warning-light") : t.warning.main, .5));
                                let e = l ? a(i.j4, f ? j("palette-background-default") : t.background.default, .985) : (0, i.Y9)(t.background.default, .98);
                                z(t.SnackbarContent, "bg", e), z(t.SnackbarContent, "color", X(() => l ? h.text.primary : t.getContrastText(e))), z(t.SpeedDialAction, "fabHoverBg", (0, i.Y9)(t.background.paper, .15)), z(t.StepConnector, "border", r("palette-grey-600")), z(t.StepContent, "border", r("palette-grey-600")), z(t.Switch, "defaultColor", r("palette-grey-300")), z(t.Switch, "defaultDisabledColor", r("palette-grey-600")), z(t.Switch, "primaryDisabledColor", a(i.Nd, f ? j("palette-primary-main") : t.primary.main, .55)), z(t.Switch, "secondaryDisabledColor", a(i.Nd, f ? j("palette-secondary-main") : t.secondary.main, .55)), z(t.Switch, "errorDisabledColor", a(i.Nd, f ? j("palette-error-main") : t.error.main, .55)), z(t.Switch, "infoDisabledColor", a(i.Nd, f ? j("palette-info-main") : t.info.main, .55)), z(t.Switch, "successDisabledColor", a(i.Nd, f ? j("palette-success-main") : t.success.main, .55)), z(t.Switch, "warningDisabledColor", a(i.Nd, f ? j("palette-warning-light") : t.warning.main, .55)), z(t.TableCell, "border", a(i.Nd, (0, i.Cg)(f ? j("palette-divider") : t.divider, 1), .68)), z(t.Tooltip, "bg", a(i.Cg, f ? j("palette-grey-700") : t.grey[700], .92))
                            }
                            f || (Y(t.background, "default"), Y(t.background, "paper"), Y(t.common, "background"), Y(t.common, "onBackground"), Y(t, "divider")), Object.keys(t).forEach(e => {
                                let r = t[e];
                                "tonalOffset" !== e && !f && r && "object" == typeof r && (r.main && z(t[e], "mainChannel", (0, i.Me)(V(r.main))), r.light && z(t[e], "lightChannel", (0, i.Me)(V(r.light))), r.dark && z(t[e], "darkChannel", (0, i.Me)(V(r.dark))), r.contrastText && z(t[e], "contrastTextChannel", (0, i.Me)(V(r.contrastText))), "text" === e && (Y(t[e], "primary"), Y(t[e], "secondary")), "action" === e && (r.active && Y(t[e], "active"), r.selected && Y(t[e], "selected")))
                            })
                        });
                        let D = {
                                prefix: u,
                                disableCssColorScheme: g,
                                shouldSkipGeneratingVar: m,
                                getSelector: (s = P = t.reduce((e, t) => (0, n.A)(e, t), P), (e, t) => {
                                    let r = s.rootSelector || ":root",
                                        a = s.colorSchemeSelector,
                                        n = a;
                                    if ("class" === a && (n = ".%s"), "data" === a && (n = "[data-%s]"), a ? .startsWith("data-") && !a.includes("%s") && (n = `[${a}="%s"]`), s.defaultColorScheme === e) {
                                        if ("dark" === e) {
                                            let a, i = {};
                                            return ((a = s.cssVarPrefix, [...[...Array(25)].map((e, t) => `--${a?`${a}-`:""}overlays-${t}`), `--${a?`${a}-`:""}palette-AppBar-darkBg`, `--${a?`${a}-`:""}palette-AppBar-darkColor`]).forEach(e => {
                                                i[e] = t[e], delete t[e]
                                            }), "media" === n) ? {
                                                [r]: t,
                                                "@media (prefers-color-scheme: dark)": {
                                                    [r]: i
                                                }
                                            } : n ? {
                                                [n.replace("%s", e)]: i,
                                                [`${r}, ${n.replace("%s",e)}`]: t
                                            } : {
                                                [r]: { ...t,
                                                    ...i
                                                }
                                            }
                                        }
                                        if (n && "media" !== n) return `${r}, ${n.replace("%s",String(e))}`
                                    } else if (e) {
                                        if ("media" === n) return {
                                            [`@media (prefers-color-scheme: ${String(e)})`]: {
                                                [r]: t
                                            }
                                        };
                                        if (n) return n.replace("%s", String(e))
                                    }
                                    return r
                                }),
                                enableContrastVars: f
                            },
                            {
                                vars: L,
                                generateThemeVars: W,
                                generateStyleSheets: H
                            } = x(P, D);
                        return P.vars = L, Object.entries(P.colorSchemes[P.defaultColorScheme]).forEach(([e, t]) => {
                            P[e] = t
                        }), P.generateThemeVars = W, P.generateStyleSheets = H, P.generateSpacing = function() {
                            return (0, k.A)(S.spacing, (0, $.LX)(this))
                        }, P.getColorSchemeSelector = function(e) {
                            return "media" === b ? `@media (prefers-color-scheme: ${e})` : b ? b.startsWith("data-") && !b.includes("%s") ? `[${b}="${e}"] &` : "class" === b ? `.${e} &` : "data" === b ? `[data-${e}] &` : `${b.replace("%s",e)} &` : "&"
                        }, P.spacing = P.generateSpacing(), P.shouldSkipGeneratingVar = m, P.unstable_sxConfig = { ...w.A,
                            ...S ? .unstable_sxConfig
                        }, P.unstable_sx = function(e) {
                            return (0, B.A)({
                                sx: e,
                                theme: this
                            })
                        }, P.internal_cache = {}, P.toRuntimeSource = I, P
                    }({ ...s,
                        colorSchemes: g,
                        defaultColorScheme: d,
                        ..."boolean" != typeof o && o
                    }, ...t)
            }
        },
        53083: (e, t, r) => {
            r.d(t, {
                A: () => i
            });
            var a = r(48420);
            let n = {
                    theme: void 0
                },
                i = function(e) {
                    let t, r;
                    return function(i) {
                        let o = t;
                        return (void 0 === o || i.theme !== r) && (n.theme = i.theme, t = o = (0, a.A)(e(n)), r = i.theme), o
                    }
                }
        },
        75092: (e, t, r) => {
            r.d(t, {
                A: () => a
            });
            let a = r(13547).A
        },
        80995: (e, t, r) => {
            r.d(t, {
                A: () => o,
                y: () => i
            });
            var a = r(24885),
                n = r(34449);

            function i(e) {
                return (0, n.Ay)("MuiTypography", e)
            }
            let o = (0, a.A)("MuiTypography", ["root", "h1", "h2", "h3", "h4", "h5", "h6", "subtitle1", "subtitle2", "body1", "body2", "inherit", "button", "caption", "overline", "alignLeft", "alignRight", "alignCenter", "alignJustify", "noWrap", "gutterBottom"])
        },
        86670: (e, t, r) => {
            r.d(t, {
                default: () => l
            });
            var a = r(39835),
                n = r(91937),
                i = r(31598),
                o = r(32764);
            let l = (0, a.Ay)({
                themeId: i.A,
                defaultTheme: n.A,
                rootShouldForwardProp: o.A
            })
        },
        91937: (e, t, r) => {
            r.d(t, {
                A: () => a
            });
            let a = (0, r(50815).A)()
        },
        97516: (e, t, r) => {
            r.d(t, {
                A: () => o
            });
            var a = r(20109);
            let n = {
                    textTransform: "uppercase"
                },
                i = '"Roboto", "Helvetica", "Arial", sans-serif';

            function o(e, t) {
                let {
                    fontFamily: r = i,
                    fontSize: o = 14,
                    fontWeightLight: l = 300,
                    fontWeightRegular: c = 400,
                    fontWeightMedium: s = 500,
                    fontWeightBold: d = 700,
                    htmlFontSize: p = 16,
                    allVariants: g,
                    pxToRem: u,
                    ...f
                } = "function" == typeof t ? t(e) : t, h = o / 14, m = u || (e => `${e/p*h}rem`), y = (e, t, a, n, o) => ({
                    fontFamily: r,
                    fontWeight: e,
                    fontSize: m(t),
                    lineHeight: a,
                    ...r === i ? {
                        letterSpacing: `${Math.round(n/t*1e5)/1e5}em`
                    } : {},
                    ...o,
                    ...g
                }), b = {
                    h1: y(l, 96, 1.167, -1.5),
                    h2: y(l, 60, 1.2, -.5),
                    h3: y(c, 48, 1.167, 0),
                    h4: y(c, 34, 1.235, .25),
                    h5: y(c, 24, 1.334, 0),
                    h6: y(s, 20, 1.6, .15),
                    subtitle1: y(c, 16, 1.75, .15),
                    subtitle2: y(s, 14, 1.57, .1),
                    body1: y(c, 16, 1.5, .15),
                    body2: y(c, 14, 1.43, .15),
                    button: y(s, 14, 1.75, .4, n),
                    caption: y(c, 12, 1.66, .4),
                    overline: y(c, 12, 2.66, 1, n),
                    inherit: {
                        fontFamily: "inherit",
                        fontWeight: "inherit",
                        fontSize: "inherit",
                        lineHeight: "inherit",
                        letterSpacing: "inherit"
                    }
                };
                return (0, a.A)({
                    htmlFontSize: p,
                    pxToRem: m,
                    fontFamily: r,
                    fontSize: o,
                    fontWeightLight: l,
                    fontWeightRegular: c,
                    fontWeightMedium: s,
                    fontWeightBold: d,
                    ...b
                }, f, {
                    clone: !1
                })
            }
        }
    }
]);