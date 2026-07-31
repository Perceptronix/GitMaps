"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [6534], {
        11097: (e, t, n) => {
            n.d(t, {
                A: () => r
            });
            let r = n(71253).A
        },
        21844: (e, t, n) => {
            n.d(t, {
                A: () => r
            });
            let r = n(87703).A
        },
        34425: (e, t, n) => {
            n.d(t, {
                A: () => r
            });

            function r(e, t = 166) {
                let n;

                function o(...r) {
                    let i = () => {
                        e.apply(this, r)
                    };
                    clearTimeout(n), n = setTimeout(i, t)
                }
                return o.clear = () => {
                    clearTimeout(n)
                }, o
            }
        },
        54532: (e, t, n) => {
            n.d(t, {
                A: () => i
            });
            var r = n(6351),
                o = n(29722);

            function i(e, t) {
                if (!e) return t;

                function n(e, t) {
                    let n = {};
                    return Object.keys(t).forEach(o => {
                        (0, r.A)(o, t[o]) && "function" == typeof e[o] && (n[o] = (...n) => {
                            e[o](...n), t[o](...n)
                        })
                    }), n
                }
                if ("function" == typeof e || "function" == typeof t) return r => {
                    let i = "function" == typeof t ? t(r) : t,
                        l = "function" == typeof e ? e({ ...r,
                            ...i
                        }) : e,
                        a = (0, o.A)(r ? .className, i ? .className, l ? .className),
                        s = n(l, i);
                    return { ...i,
                        ...l,
                        ...s,
                        ...!!a && {
                            className: a
                        },
                        ...i ? .style && l ? .style && {
                            style: { ...i.style,
                                ...l.style
                            }
                        },
                        ...i ? .sx && l ? .sx && {
                            sx: [...Array.isArray(i.sx) ? i.sx : [i.sx], ...Array.isArray(l.sx) ? l.sx : [l.sx]]
                        }
                    }
                };
                let i = n(e, t),
                    l = (0, o.A)(t ? .className, e ? .className);
                return { ...t,
                    ...e,
                    ...i,
                    ...!!l && {
                        className: l
                    },
                    ...t ? .style && e ? .style && {
                        style: { ...t.style,
                            ...e.style
                        }
                    },
                    ...t ? .sx && e ? .sx && {
                        sx: [...Array.isArray(t.sx) ? t.sx : [t.sx], ...Array.isArray(e.sx) ? e.sx : [e.sx]]
                    }
                }
            }
        },
        56276: (e, t, n) => {
            n.d(t, {
                A: () => r
            });
            let r = n(12115).createContext({})
        },
        58025: (e, t, n) => {
            n.d(t, {
                A: () => r
            });

            function r(...e) {
                return e.reduce((e, t) => null == t ? e : function(...n) {
                    e.apply(this, n), t.apply(this, n)
                }, () => {})
            }
        },
        62402: (e, t, n) => {
            n.d(t, {
                A: () => m
            });
            var r = n(12115),
                o = n(29722),
                i = n(97335),
                l = n(86670),
                a = n(16377),
                s = n(56276),
                u = n(24885),
                d = n(34449);

            function c(e) {
                return (0, d.Ay)("MuiList", e)
            }(0, u.A)("MuiList", ["root", "padding", "dense", "subheader"]);
            var f = n(95155);
            let p = (0, l.default)("ul", {
                    name: "MuiList",
                    slot: "Root",
                    overridesResolver: (e, t) => {
                        let {
                            ownerState: n
                        } = e;
                        return [t.root, !n.disablePadding && t.padding, n.dense && t.dense, n.subheader && t.subheader]
                    }
                })({
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    position: "relative",
                    variants: [{
                        props: ({
                            ownerState: e
                        }) => !e.disablePadding,
                        style: {
                            paddingTop: 8,
                            paddingBottom: 8
                        }
                    }, {
                        props: ({
                            ownerState: e
                        }) => e.subheader,
                        style: {
                            paddingTop: 0,
                            isolation: "isolate"
                        }
                    }]
                }),
                m = r.forwardRef(function(e, t) {
                    let n = (0, a.b)({
                            props: e,
                            name: "MuiList"
                        }),
                        {
                            children: l,
                            className: u,
                            component: d = "ul",
                            dense: m = !1,
                            disablePadding: h = !1,
                            subheader: y,
                            ...A
                        } = n,
                        g = r.useMemo(() => ({
                            dense: m
                        }), [m]),
                        b = { ...n,
                            component: d,
                            dense: m,
                            disablePadding: h
                        },
                        x = (e => {
                            let {
                                classes: t,
                                disablePadding: n,
                                dense: r,
                                subheader: o
                            } = e;
                            return (0, i.A)({
                                root: ["root", !n && "padding", r && "dense", o && "subheader"]
                            }, c, t)
                        })(b);
                    return (0, f.jsx)(s.A.Provider, {
                        value: g,
                        children: (0, f.jsxs)(p, {
                            as: d,
                            className: (0, o.A)(x.root, u),
                            ref: t,
                            ownerState: b,
                            ...A,
                            children: [y, l]
                        })
                    })
                })
        },
        68713: (e, t, n) => {
            n.d(t, {
                A: () => r
            });
            let r = n(81189).A
        },
        71253: (e, t, n) => {
            n.d(t, {
                A: () => r
            });

            function r(e, t) {
                if (!e || !t) return !1;
                if (e.contains(t)) return !0;
                let n = t.getRootNode ? .();
                if (n && n instanceof ShadowRoot) {
                    let n = t;
                    for (; n;) {
                        if (e === n) return !0;
                        n = n.parentNode ? ? n.host ? ? null
                    }
                }
                return !1
            }
        },
        78653: (e, t, n) => {
            n.d(t, {
                A: () => r
            });

            function r(e = window) {
                let t = e.document.documentElement.clientWidth;
                return e.innerWidth - t
            }
        },
        79194: (e, t, n) => {
            n.d(t, {
                A: () => m
            });
            var r = n(12115),
                o = n(9311),
                i = n(27005),
                l = n(30659),
                a = n(11097),
                s = n(21844),
                u = n(96080),
                d = n(95155);

            function c(e) {
                let t = parseInt(e.getAttribute("tabindex") || "", 10);
                return Number.isNaN(t) ? "true" === e.contentEditable || ("AUDIO" === e.nodeName || "VIDEO" === e.nodeName || "DETAILS" === e.nodeName) && null === e.getAttribute("tabindex") ? 0 : e.tabIndex : t
            }

            function f(e) {
                let t = [],
                    n = [];
                return Array.from(e.querySelectorAll('input,select,textarea,a[href],button,[tabindex],audio[controls],video[controls],[contenteditable]:not([contenteditable="false"])')).forEach((e, r) => {
                    let o = c(e); - 1 === o || e.disabled || "INPUT" === e.tagName && "hidden" === e.type || function(e) {
                        if ("INPUT" !== e.tagName || "radio" !== e.type || !e.name) return !1;
                        let t = t => e.ownerDocument.querySelector(`input[type="radio"]${t}`),
                            n = t(`[name="${e.name}"]:checked`);
                        return n || (n = t(`[name="${e.name}"]`)), n !== e
                    }(e) || (0 === o ? t.push(e) : n.push({
                        documentOrder: r,
                        tabIndex: o,
                        node: e
                    }))
                }), n.sort((e, t) => e.tabIndex === t.tabIndex ? e.documentOrder - t.documentOrder : e.tabIndex - t.tabIndex).map(e => e.node).concat(t)
            }

            function p() {
                return !0
            }
            let m = function(e) {
                let {
                    children: t,
                    disableAutoFocus: n = !1,
                    disableEnforceFocus: m = !1,
                    disableRestoreFocus: h = !1,
                    getTabbable: y = f,
                    isEnabled: A = p,
                    open: g
                } = e, b = r.useRef(!1), x = r.useRef(null), v = r.useRef(null), E = r.useRef(null), R = r.useRef(null), T = r.useRef(!1), k = r.useRef(null), w = (0, o.A)((0, l.A)(t), k), N = r.useRef(null);
                r.useEffect(() => {
                    g && k.current && (T.current = !n)
                }, [n, g]), r.useEffect(() => {
                    if (b.current = !1, !g || !k.current) return;
                    let e = (0, i.A)(k.current),
                        t = (0, s.A)(e),
                        n = (0, u.U)(k.current) ? ? k.current;
                    return !(0, a.A)(k.current, t) && (n.hasAttribute("tabIndex") || n.setAttribute("tabIndex", "-1"), T.current && n.focus()), () => {
                        !h && E.current && (b.current = !0, E.current.focus(), E.current = null)
                    }
                }, [g]), r.useEffect(() => {
                    if (!g || !k.current) return;
                    let e = (0, i.A)(k.current),
                        t = t => {
                            if (N.current = t, m || !A() || "Tab" !== t.key) return;
                            let n = k.current,
                                r = (0, s.A)(e);
                            if (null === n) return;
                            let o = (0, u.U)(n);
                            if (r === n || r === o) {
                                let e = y(n);
                                if (0 === e.length) return;
                                t.preventDefault(), t.shiftKey ? e[e.length - 1].focus() : e[0].focus();
                                return
                            }
                            if ((0, a.A)(n, r)) {
                                let e = y(n),
                                    o = e.indexOf(r);
                                if (-1 === o || !e.some(e => c(e) > 0)) return;
                                t.preventDefault();
                                let i = 0;
                                i = t.shiftKey ? o <= 0 ? e.length - 1 : o - 1 : o === e.length - 1 ? 0 : o + 1, e[i].focus()
                            }
                        },
                        n = () => {
                            let t = k.current;
                            if (null === t) return;
                            let n = (0, s.A)(e);
                            if (!e.hasFocus() || !A() || b.current) {
                                b.current = !1;
                                return
                            }
                            if ((0, a.A)(t, n) || m && n !== x.current && n !== v.current) return;
                            if (n !== R.current) R.current = null;
                            else if (null !== R.current) return;
                            if (!T.current) return;
                            let r = [];
                            if ((n === x.current || n === v.current) && (r = y(k.current)), r.length > 0) {
                                let e = !!(N.current ? .shiftKey && N.current ? .key === "Tab"),
                                    t = r[0],
                                    n = r[r.length - 1];
                                "string" != typeof t && "string" != typeof n && (e ? n.focus() : t.focus())
                            } else t.focus()
                        };
                    e.addEventListener("focusin", n), e.addEventListener("keydown", t, !0);
                    let r = setInterval(() => {
                        let t = (0, s.A)(e);
                        t && "BODY" === t.tagName && n()
                    }, 50);
                    return () => {
                        clearInterval(r), e.removeEventListener("focusin", n), e.removeEventListener("keydown", t, !0)
                    }
                }, [n, m, h, A, g, y]);
                let M = e => {
                    null === E.current && (E.current = e.relatedTarget), T.current = !0
                };
                return (0, d.jsxs)(r.Fragment, {
                    children: [(0, d.jsx)("div", {
                        tabIndex: g ? 0 : -1,
                        onFocus: M,
                        ref: x,
                        "data-testid": "sentinelStart"
                    }), r.cloneElement(t, {
                        ref: w,
                        onFocus: e => {
                            null === E.current && (E.current = e.relatedTarget), T.current = !0, R.current = e.target;
                            let n = t.props.onFocus;
                            n && n(e)
                        }
                    }), (0, d.jsx)("div", {
                        tabIndex: g ? 0 : -1,
                        onFocus: M,
                        ref: v,
                        "data-testid": "sentinelEnd"
                    })]
                })
            }
        },
        81189: (e, t, n) => {
            n.d(t, {
                A: () => o
            });
            var r = n(27005);

            function o(e) {
                return (0, r.A)(e).defaultView || window
            }
        },
        85915: (e, t, n) => {
            n.d(t, {
                A: () => h
            });
            var r = n(12115),
                o = n(29722),
                i = n(97335),
                l = n(86670),
                a = n(16377),
                s = n(15645),
                u = n(91425),
                d = n(24885),
                c = n(34449);

            function f(e) {
                return (0, c.Ay)("MuiBackdrop", e)
            }(0, d.A)("MuiBackdrop", ["root", "invisible"]);
            var p = n(95155);
            let m = (0, l.default)("div", {
                    name: "MuiBackdrop",
                    slot: "Root",
                    overridesResolver: (e, t) => {
                        let {
                            ownerState: n
                        } = e;
                        return [t.root, n.invisible && t.invisible]
                    }
                })({
                    position: "fixed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    right: 0,
                    bottom: 0,
                    top: 0,
                    left: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    WebkitTapHighlightColor: "transparent",
                    variants: [{
                        props: {
                            invisible: !0
                        },
                        style: {
                            backgroundColor: "transparent"
                        }
                    }]
                }),
                h = r.forwardRef(function(e, t) {
                    let n = (0, a.b)({
                            props: e,
                            name: "MuiBackdrop"
                        }),
                        {
                            children: r,
                            className: l,
                            component: d = "div",
                            invisible: c = !1,
                            open: h,
                            slotProps: y = {},
                            slots: A = {},
                            transitionDuration: g,
                            ...b
                        } = n,
                        x = { ...n,
                            component: d,
                            invisible: c
                        },
                        v = (e => {
                            let {
                                classes: t,
                                invisible: n
                            } = e;
                            return (0, i.A)({
                                root: ["root", n && "invisible"]
                            }, f, t)
                        })(x),
                        E = {
                            component: d,
                            slots: A,
                            slotProps: y
                        },
                        [R, T] = (0, s.A)("root", {
                            elementType: m,
                            externalForwardedProps: E,
                            className: (0, o.A)(v.root, l),
                            ownerState: x
                        }),
                        [k, w] = (0, s.A)("transition", {
                            elementType: u.A,
                            externalForwardedProps: E,
                            ownerState: x
                        });
                    return (0, p.jsx)(k, { in: h,
                        timeout: g,
                        ...b,
                        ...w,
                        children: (0, p.jsx)(R, { ...T,
                            ref: t,
                            children: r
                        })
                    })
                })
        },
        87703: (e, t, n) => {
            n.d(t, {
                A: () => r
            });

            function r(e) {
                let t = e.activeElement;
                for (; t ? .shadowRoot ? .activeElement != null;) t = t.shadowRoot.activeElement;
                return t
            }
        },
        91425: (e, t, n) => {
            n.d(t, {
                A: () => p
            });
            var r = n(12115),
                o = n(30659),
                i = n(30916),
                l = n(67408),
                a = n(28683),
                s = n(68033),
                u = n(95386),
                d = n(95155);
            let c = {
                    entering: {
                        opacity: 1
                    },
                    entered: {
                        opacity: 1
                    },
                    exiting: {
                        opacity: 0
                    },
                    exited: {
                        opacity: 0
                    }
                },
                f = {
                    opacity: 0,
                    visibility: "hidden"
                },
                p = r.forwardRef(function(e, t) {
                    let n = (0, a.default)(),
                        p = {
                            enter: n.transitions.duration.enteringScreen,
                            exit: n.transitions.duration.leavingScreen
                        },
                        {
                            addEndListener: m,
                            appear: h = !0,
                            children: y,
                            disablePrefersReducedMotion: A = !1,
                            easing: g,
                            in: b,
                            onEnter: x,
                            onEntered: v,
                            onEntering: E,
                            onExit: R,
                            onExited: T,
                            onExiting: k,
                            style: w,
                            timeout: N = p,
                            ...M
                        } = e,
                        I = (0, l.A)(n.motion.reducedMotion, A),
                        P = r.useRef(null),
                        C = (0, u.A)(P, (0, o.A)(y), t),
                        S = (0, s.E1)(P, E),
                        O = (0, s.E1)(P, (e, t) => {
                            I.shouldReduceMotion || (0, s.qm)(e);
                            let r = (0, s.ce)({
                                    style: w,
                                    timeout: N,
                                    easing: g
                                }, {
                                    mode: "enter"
                                }),
                                o = I.getTransitionTiming({
                                    duration: r.duration,
                                    delay: r.delay
                                });
                            e.style.transition = n.transitions.create("opacity", {
                                duration: o.duration,
                                easing: r.easing,
                                delay: o.delay
                            }), x && x(e, t)
                        }),
                        L = (0, s.E1)(P, v),
                        j = (0, s.E1)(P, k),
                        F = (0, s.E1)(P, e => {
                            let t = (0, s.ce)({
                                    style: w,
                                    timeout: N,
                                    easing: g
                                }, {
                                    mode: "exit"
                                }),
                                r = I.getTransitionTiming({
                                    duration: t.duration,
                                    delay: t.delay
                                });
                            e.style.transition = n.transitions.create("opacity", {
                                duration: r.duration,
                                easing: t.easing,
                                delay: r.delay
                            }), R && R(e)
                        }),
                        D = (0, s.E1)(P, e => {
                            e.style.transition = "", T && T(e)
                        }),
                        U = m ? e => {
                            m(P.current, e)
                        } : void 0;
                    return (0, d.jsx)(i.A, {
                        appear: h,
                        in: b,
                        nodeRef: P,
                        onEnter: O,
                        onEntered: L,
                        onEntering: S,
                        onExit: F,
                        onExited: D,
                        onExiting: j,
                        addEndListener: U,
                        reduceMotion: I.shouldReduceMotion,
                        timeout: N,
                        ...M,
                        children: (e, {
                            ownerState: t,
                            ...n
                        }) => {
                            let o = (0, s.zO)(e, b, c, f, w, y.props.style);
                            return r.cloneElement(y, {
                                style: o,
                                ref: C,
                                ...n
                            })
                        }
                    })
                })
        },
        92119: (e, t, n) => {
            n.d(t, {
                A: () => r
            });
            let r = n(34425).A
        },
        96080: (e, t, n) => {
            n.d(t, {
                E: () => r,
                U: () => o
            });
            let r = "data-mui-focusable";

            function o(e) {
                return e ? e.hasAttribute(r) ? e : e.querySelector(`[${r}]`) : null
            }
        },
        98196: (e, t, n) => {
            n.d(t, {
                A: () => L
            });
            var r = n(12115),
                o = n(29722),
                i = n(97335),
                l = n(79194),
                a = n(75193),
                s = n(86670),
                u = n(53083),
                d = n(16377),
                c = n(85915),
                f = n(27005),
                p = n(9311),
                m = n(3271),
                h = n(58025),
                y = n(72267),
                A = n(81189),
                g = n(78653);

            function b(e, t) {
                t ? e.setAttribute("aria-hidden", "true") : e.removeAttribute("aria-hidden")
            }

            function x(e) {
                return parseFloat((0, A.A)(e).getComputedStyle(e).paddingRight) || 0
            }

            function v(e, t, n, r, o) {
                let i = [t, n, ...r];
                [].forEach.call(e.children, e => {
                    let t, n, r = !i.includes(e),
                        l = (t = ["TEMPLATE", "SCRIPT", "STYLE", "LINK", "MAP", "META", "NOSCRIPT", "PICTURE", "COL", "COLGROUP", "PARAM", "SLOT", "SOURCE", "TRACK"].includes(e.tagName), n = "INPUT" === e.tagName && "hidden" === e.getAttribute("type"), !t && !n);
                    r && l && b(e, o)
                })
            }

            function E(e, t) {
                let n = -1;
                return e.some((e, r) => !!t(e) && (n = r, !0)), n
            }
            class R {
                constructor() {
                    this.modals = [], this.containers = []
                }
                add(e, t) {
                    let n, r = this.modals.indexOf(e);
                    if (-1 !== r) return r;
                    r = this.modals.length, this.modals.push(e), e.modalRef && b(e.modalRef, !1);
                    let o = (n = [], [].forEach.call(t.children, e => {
                        "true" === e.getAttribute("aria-hidden") && n.push(e)
                    }), n);
                    v(t, e.mount, e.modalRef, o, !0);
                    let i = E(this.containers, e => e.container === t);
                    return -1 !== i ? this.containers[i].modals.push(e) : this.containers.push({
                        modals: [e],
                        container: t,
                        restore: null,
                        hiddenSiblings: o
                    }), r
                }
                mount(e, t) {
                    let n = E(this.containers, t => t.modals.includes(e)),
                        r = this.containers[n];
                    r.restore || (r.restore = function(e, t) {
                        let n = [],
                            r = e.container;
                        if (!t.disableScrollLock) {
                            let e, t;
                            if ((t = (0, f.A)(r)).body === r ? (0, A.A)(r).innerWidth > t.documentElement.clientWidth : r.scrollHeight > r.clientHeight) {
                                let e = (0, g.A)((0, A.A)(r));
                                n.push({
                                    value: r.style.paddingRight,
                                    property: "padding-right",
                                    el: r
                                }), r.style.paddingRight = `${x(r)+e}px`;
                                let t = (0, f.A)(r).querySelectorAll(".mui-fixed");
                                [].forEach.call(t, t => {
                                    n.push({
                                        value: t.style.paddingRight,
                                        property: "padding-right",
                                        el: t
                                    }), t.style.paddingRight = `${x(t)+e}px`
                                })
                            }
                            if (r.parentNode instanceof DocumentFragment) e = (0, f.A)(r).body;
                            else {
                                let t = r.parentElement,
                                    n = (0, A.A)(r);
                                e = t ? .nodeName === "HTML" && "scroll" === n.getComputedStyle(t).overflowY ? t : r
                            }
                            n.push({
                                value: e.style.overflow,
                                property: "overflow",
                                el: e
                            }, {
                                value: e.style.overflowX,
                                property: "overflow-x",
                                el: e
                            }, {
                                value: e.style.overflowY,
                                property: "overflow-y",
                                el: e
                            }), e.style.overflow = "hidden"
                        }
                        return () => {
                            n.forEach(({
                                value: e,
                                el: t,
                                property: n
                            }) => {
                                e ? t.style.setProperty(n, e) : t.style.removeProperty(n)
                            })
                        }
                    }(r, t))
                }
                remove(e, t = !0) {
                    let n = this.modals.indexOf(e);
                    if (-1 === n) return n;
                    let r = E(this.containers, t => t.modals.includes(e)),
                        o = this.containers[r];
                    if (o.modals.splice(o.modals.indexOf(e), 1), this.modals.splice(n, 1), 0 === o.modals.length) o.restore && o.restore(), e.modalRef && b(e.modalRef, t), v(o.container, e.mount, e.modalRef, o.hiddenSiblings, !1), this.containers.splice(r, 1);
                    else {
                        let e = o.modals[o.modals.length - 1];
                        e.modalRef && b(e.modalRef, !1)
                    }
                    return n
                }
                isTopModal(e) {
                    return this.modals.length > 0 && this.modals[this.modals.length - 1] === e
                }
            }
            let T = () => {},
                k = new R,
                w = function(e) {
                    let {
                        container: t,
                        disableScrollLock: n = !1,
                        closeAfterTransition: o = !1,
                        onTransitionEnter: i,
                        onTransitionExited: l,
                        children: a,
                        onClose: s,
                        open: u,
                        rootRef: d
                    } = e, c = r.useRef({}), A = r.useRef(null), g = r.useRef(null), x = (0, p.A)(g, d), [v, E] = r.useState(!u), R = !!a && a.props.hasOwnProperty("in"), w = !0;
                    ("false" === e["aria-hidden"] || !1 === e["aria-hidden"]) && (w = !1);
                    let N = () => (c.current.modalRef = g.current, c.current.mount = A.current, c.current),
                        M = () => {
                            k.mount(N(), {
                                disableScrollLock: n
                            }), g.current && (g.current.scrollTop = 0)
                        },
                        I = (0, m.A)(() => {
                            let e = ("function" == typeof t ? t() : t) || (0, f.A)(A.current).body;
                            k.add(N(), e), g.current && M()
                        }),
                        P = () => k.isTopModal(N()),
                        C = (0, m.A)(e => {
                            A.current = e, e && (u && P() ? M() : g.current && b(g.current, w))
                        }),
                        S = r.useCallback(() => {
                            k.remove(N(), w)
                        }, [w]);
                    return r.useEffect(() => () => {
                        S()
                    }, [S]), r.useEffect(() => {
                        u ? I() : R && o || S()
                    }, [u, S, R, o, I]), {
                        getRootProps: (t = {}) => {
                            let n = (0, y.A)(e);
                            delete n.onTransitionEnter, delete n.onTransitionExited;
                            let r = { ...n,
                                ...t
                            };
                            return {
                                role: "presentation",
                                ...r,
                                onKeyDown: e => {
                                    r.onKeyDown ? .(e), "Escape" === e.key && 229 !== e.which && P() && (e.stopPropagation(), s && s(e, "escapeKeyDown"))
                                },
                                ref: x
                            }
                        },
                        getBackdropProps: (e = {}) => ({
                            "aria-hidden": !0,
                            ...e,
                            onClick: t => {
                                e.onClick ? .(t), t.target === t.currentTarget && s && s(t, "backdropClick")
                            },
                            open: u
                        }),
                        getTransitionProps: () => ({
                            onEnter: (0, h.A)(() => {
                                E(!1), i && i()
                            }, a ? .props.onEnter ? ? T),
                            onExited: (0, h.A)(() => {
                                E(!0), l && l(), o && S()
                            }, a ? .props.onExited ? ? T)
                        }),
                        rootRef: x,
                        portalRef: C,
                        isTopModal: P,
                        exited: v,
                        hasTransition: R
                    }
                };
            var N = n(24885),
                M = n(34449);

            function I(e) {
                return (0, M.Ay)("MuiModal", e)
            }(0, N.A)("MuiModal", ["root", "hidden", "backdrop"]);
            var P = n(15645),
                C = n(95155);
            let S = (0, s.default)("div", {
                    name: "MuiModal",
                    slot: "Root",
                    overridesResolver: (e, t) => {
                        let {
                            ownerState: n
                        } = e;
                        return [t.root, !n.open && n.exited && t.hidden]
                    }
                })((0, u.A)(({
                    theme: e
                }) => ({
                    position: "fixed",
                    zIndex: (e.vars || e).zIndex.modal,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    left: 0,
                    variants: [{
                        props: ({
                            ownerState: e
                        }) => !e.open && e.exited,
                        style: {
                            visibility: "hidden"
                        }
                    }]
                }))),
                O = (0, s.default)(c.A, {
                    name: "MuiModal",
                    slot: "Backdrop"
                })({
                    zIndex: -1
                }),
                L = r.forwardRef(function(e, t) {
                    let n = (0, d.b)({
                            name: "MuiModal",
                            props: e
                        }),
                        {
                            classes: s,
                            className: u,
                            closeAfterTransition: c = !1,
                            children: f,
                            container: p,
                            component: m,
                            disableAutoFocus: h = !1,
                            disableEnforceFocus: y = !1,
                            disablePortal: A = !1,
                            disableRestoreFocus: g = !1,
                            disableScrollLock: b = !1,
                            hideBackdrop: x = !1,
                            keepMounted: v = !1,
                            onClose: E,
                            onTransitionEnter: R,
                            onTransitionExited: T,
                            open: k,
                            slotProps: N = {},
                            slots: M = {},
                            theme: L,
                            ...j
                        } = n,
                        F = { ...n,
                            closeAfterTransition: c,
                            disableAutoFocus: h,
                            disableEnforceFocus: y,
                            disablePortal: A,
                            disableRestoreFocus: g,
                            disableScrollLock: b,
                            hideBackdrop: x,
                            keepMounted: v
                        },
                        {
                            getRootProps: D,
                            getBackdropProps: U,
                            getTransitionProps: B,
                            portalRef: K,
                            isTopModal: $,
                            exited: q,
                            hasTransition: W
                        } = w({ ...F,
                            rootRef: t
                        }),
                        z = { ...F,
                            exited: q
                        },
                        H = (e => {
                            let {
                                open: t,
                                exited: n,
                                classes: r
                            } = e;
                            return (0, i.A)({
                                root: ["root", !t && n && "hidden"],
                                backdrop: ["backdrop"]
                            }, I, r)
                        })(z),
                        Y = {};
                    if (void 0 === f.props.tabIndex && (Y.tabIndex = "-1"), W) {
                        let {
                            onEnter: e,
                            onExited: t
                        } = B();
                        Y.onEnter = e, Y.onExited = t
                    }
                    let _ = {
                            slots: M,
                            slotProps: N
                        },
                        [V, G] = (0, P.A)("root", {
                            ref: t,
                            elementType: S,
                            externalForwardedProps: { ..._,
                                ...j,
                                component: m
                            },
                            getSlotProps: D,
                            ownerState: z,
                            className: (0, o.A)(u, H ? .root, !z.open && z.exited && H ? .hidden)
                        }),
                        [X, J] = (0, P.A)("backdrop", {
                            elementType: O,
                            externalForwardedProps: _,
                            shouldForwardComponentProp: !0,
                            getSlotProps: e => U({ ...e,
                                onClick: t => {
                                    e ? .onClick && e.onClick(t)
                                }
                            }),
                            className: H ? .backdrop,
                            ownerState: z
                        });
                    return v || k || W && !q ? (0, C.jsx)(a.A, {
                        ref: K,
                        container: p,
                        disablePortal: A,
                        children: (0, C.jsxs)(V, { ...G,
                            children: [x ? null : (0, C.jsx)(X, { ...J
                            }), (0, C.jsx)(l.A, {
                                disableEnforceFocus: y,
                                disableAutoFocus: h,
                                disableRestoreFocus: g,
                                isEnabled: $,
                                open: k,
                                children: r.cloneElement(f, Y)
                            })]
                        })
                    }) : null
                })
        }
    }
]);