(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [2334], {
        19e3: (e, t, n) => {
            "use strict";
            n.d(t, {
                default: () => T
            });
            var l = n(95155),
                r = n(45227),
                i = n(94502),
                s = n(68953),
                a = n(63879),
                d = n(37911),
                o = n(20961),
                c = n(58687),
                u = n(89495),
                m = n(88254),
                h = n(27966),
                f = n(92377),
                g = n(82755),
                x = n(92533),
                A = n(28565),
                p = n(48341),
                w = n(53296),
                j = n(36493),
                C = n(56701),
                b = n(28683),
                S = n(12115),
                v = n(92608);
            let k = ({
                columns: e,
                columnVisibilityModel: t,
                setColumnVisibilityModel: n,
                anchorEl: i,
                handleMenuOpen: s,
                handleMenuClose: h
            }) => (0, l.jsxs)(l.Fragment, {
                children: [(0, l.jsxs)(a.A, {
                    onClick: s,
                    "aria-label": "Select Columns",
                    size: "small",
                    sx: {
                        ml: 1
                    },
                    children: [(0, l.jsx)(r.A, {
                        fontSize: "small"
                    }), (0, l.jsx)(d.default, {
                        variant: "caption",
                        sx: {
                            ml: .5
                        },
                        children: "Select Columns"
                    })]
                }), (0, l.jsx)(o.A, {
                    anchorEl: i,
                    open: !!i,
                    onClose: h,
                    children: e.map(e => (0, l.jsx)(c.A, {
                        children: (0, l.jsx)(u.A, {
                            control: (0, l.jsx)(m.A, {
                                checked: !!t[e.field],
                                onChange: () => n(t => ({ ...t,
                                    [e.field]: !t[e.field]
                                })),
                                size: "small"
                            }),
                            label: e.headerName || e.field
                        })
                    }, e.field))
                })]
            });

            function T(e) {
                let {
                    libraryList: t
                } = e, n = (0, b.default)(), [r, a] = S.useState([]), [d, o] = S.useState({}), [c, u] = S.useState(null), [m, T] = S.useState(0), [E, y] = S.useState("Total7Stars"), [P, N] = S.useState("desc");
                S.useEffect(() => {
                    let e = [{
                        field: "actions",
                        headerName: " ",
                        renderCell: e => (0, l.jsx)(h.default, {
                            sx: {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            },
                            children: (0, l.jsx)(v.O, {
                                row: e,
                                iconProps: {
                                    fontSize: "small",
                                    sx: {
                                        p: 0,
                                        m: 0,
                                        minWidth: 0
                                    }
                                }
                            })
                        })
                    }, {
                        field: "Trending",
                        headerName: " ",
                        width: 30,
                        renderCell: e => {
                            let t = e.Trending,
                                n = {
                                    color: 1 === t ? "green" : "red",
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1.25rem"
                                    }
                                };
                            return (0, l.jsx)(h.default, {
                                sx: {
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                },
                                children: 1 === t ? (0, l.jsx)(s.default, {
                                    sx: n
                                }) : -1 === t ? (0, l.jsx)(i.default, {
                                    sx: n
                                }) : null
                            })
                        }
                    }, {
                        field: "RepoName",
                        headerName: "Name"
                    }, {
                        field: "RepoUser",
                        headerName: "Owner"
                    }, {
                        field: "Total7Stars",
                        headerName: "Last 7 Days",
                        renderCell: e => (0, l.jsx)("strong", {
                            children: (e.Total7Stars || 0).toLocaleString()
                        })
                    }, {
                        field: "TotalPrevStars",
                        headerName: "Previous 7 Days",
                        renderCell: e => (0, l.jsx)("strong", {
                            children: (e.TotalPrevStars || 0).toLocaleString()
                        })
                    }, {
                        field: "Total30Stars",
                        headerName: "Last 30 Days",
                        renderCell: e => (0, l.jsx)("strong", {
                            children: (e.Total30Stars || 0).toLocaleString()
                        })
                    }];
                    a(e);
                    let t = () => {
                        o(e.reduce((e, t) => (window.innerWidth >= 900 ? e[t.field] = !0 : window.innerWidth >= 800 ? e[t.field] = !["TotalPrevStars"].includes(t.field) : e[t.field] = !["Total30Stars", "TotalPrevStars"].includes(t.field), e), {}))
                    };
                    return t(), window.addEventListener("resize", t), () => {
                        window.removeEventListener("resize", t)
                    }
                }, []);
                let R = S.useMemo(() => {
                        let e = [...t];
                        return e.sort((e, t) => {
                            let n = e[E],
                                l = t[E];
                            if (null == n && (n = ""), null == l && (l = ""), "number" == typeof n && "number" == typeof l) return "asc" === P ? n - l : l - n; {
                                let e = String(n).toLowerCase(),
                                    t = String(l).toLowerCase();
                                return e < t ? "asc" === P ? -1 : 1 : e > t ? "asc" === P ? 1 : -1 : 0
                            }
                        }), e
                    }, [t, E, P]),
                    z = S.useMemo(() => {
                        let e = 25 * m;
                        return R.slice(e, e + 25)
                    }, [m, R]);
                return (0, l.jsxs)(h.default, {
                    children: [(0, l.jsx)(h.default, {
                        sx: {
                            display: "flex",
                            alignItems: "center",
                            mb: 1
                        },
                        children: (0, l.jsx)(k, {
                            columns: r,
                            columnVisibilityModel: d,
                            setColumnVisibilityModel: o,
                            anchorEl: c,
                            handleMenuOpen: e => u(e.currentTarget),
                            handleMenuClose: () => u(null)
                        })
                    }), (0, l.jsx)(f.A, {
                        component: g.default,
                        children: (0, l.jsxs)(x.A, {
                            size: "small",
                            "aria-label": "Trending Repositories Table",
                            sx: {
                                fontSize: {
                                    xs: "0.85rem",
                                    sm: "1rem",
                                    md: "1.1rem"
                                },
                                "& .MuiTableCell-root": {
                                    whiteSpace: "normal",
                                    lineHeight: "1.2",
                                    textAlign: "center",
                                    wordBreak: "break-word",
                                    padding: "4px 8px",
                                    cursor: "default",
                                    userSelect: "none",
                                    fontSize: {
                                        xs: "0.85rem",
                                        sm: "1rem",
                                        md: "1.1rem"
                                    }
                                }
                            },
                            children: [(0, l.jsx)(A.A, {
                                children: (0, l.jsx)(p.A, {
                                    children: r.filter(e => d[e.field]).map(e => {
                                        let t = "actions" !== e.field && "Trending" !== e.field,
                                            n = E === e.field ? "asc" === P ? " ▲" : " ▼" : "";
                                        return (0, l.jsxs)(w.A, {
                                            align: "center",
                                            sx: {
                                                fontWeight: "bold",
                                                fontSize: {
                                                    xs: "0.85rem",
                                                    sm: "1rem",
                                                    md: "1.1rem"
                                                },
                                                padding: "actions" === e.field || "Trending" === e.field ? "2px" : "4px 8px",
                                                width: "actions" === e.field || "Trending" === e.field ? 40 : "auto",
                                                cursor: t ? "pointer" : "default",
                                                userSelect: t ? "none" : "auto"
                                            },
                                            onClick: t ? () => {
                                                var t;
                                                E === (t = e.field) ? N(e => "asc" === e ? "desc" : "asc") : (y(t), N("asc")), T(0)
                                            } : void 0,
                                            children: [e.headerName || e.field, n]
                                        }, e.field)
                                    })
                                })
                            }), (0, l.jsx)(j.A, {
                                children: z.map((e, t) => {
                                    let i = t % 2 == 0;
                                    return (0, l.jsx)(p.A, {
                                        sx: {
                                            backgroundColor: i ? "dark" === n.palette.mode ? "#424242" : "#f5f5f5" : "dark" === n.palette.mode ? "#303030" : "#ffffff",
                                            "&:hover": {
                                                backgroundColor: "dark" === n.palette.mode ? "#505050" : "#e0e0e0"
                                            }
                                        },
                                        children: r.filter(e => d[e.field]).map(t => (0, l.jsx)(w.A, {
                                            align: "center",
                                            sx: {
                                                verticalAlign: "middle",
                                                fontSize: {
                                                    xs: "0.85rem",
                                                    sm: "1rem",
                                                    md: "1.1rem"
                                                },
                                                padding: "actions" === t.field || "Trending" === t.field ? "2px" : "4px 8px"
                                            },
                                            children: t.renderCell ? t.renderCell(e) : e[t.field]
                                        }, t.field))
                                    }, e.id || t)
                                })
                            })]
                        })
                    }), (0, l.jsx)(C.A, {
                        component: "div",
                        count: t.length,
                        page: m,
                        onPageChange: (e, t) => {
                            T(t)
                        },
                        rowsPerPage: 25,
                        rowsPerPageOptions: [25],
                        labelRowsPerPage: ""
                    })]
                })
            }
        },
        25967: (e, t, n) => {
            Promise.resolve().then(n.bind(n, 94502)), Promise.resolve().then(n.bind(n, 68953)), Promise.resolve().then(n.bind(n, 27966)), Promise.resolve().then(n.bind(n, 36759)), Promise.resolve().then(n.bind(n, 12129)), Promise.resolve().then(n.bind(n, 37911)), Promise.resolve().then(n.t.bind(n, 98500, 23)), Promise.resolve().then(n.bind(n, 84331)), Promise.resolve().then(n.bind(n, 19e3))
        },
        84331: (e, t, n) => {
            "use strict";
            n.r(t), n.d(t, {
                default: () => r
            });
            var l = n(12115);

            function r({
                id: e,
                data: t
            }) {
                let n = "string" == typeof t ? t : JSON.stringify(t);
                return (0, l.useEffect)(() => {
                    if (!e || !n) return;
                    let t = document.getElementById(e);
                    return t || ((t = document.createElement("script")).id = e, t.type = "application/ld+json", document.head.appendChild(t)), t.textContent = n, () => {
                        t ? .parentNode && t.parentNode.removeChild(t)
                    }
                }, [e, n]), null
            }
        },
        92608: (e, t, n) => {
            "use strict";
            n.d(t, {
                O: () => f
            });
            var l = n(95155),
                r = n(77632),
                i = n(45227),
                s = n(63879),
                a = n(20961),
                d = n(58687),
                o = n(28683),
                c = n(90058),
                u = n(5772),
                m = n(12115);
            let h = {
                src: "https://www.gitgenius.co/_next/static/media/logo-gitgenius.ed396850.png",
                height: 140,
                width: 140,
                blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAALVBMVEVMaXEygsMqt04iceoptkojZvolcO86uk8osk4ibuonskspslEkZf8id+4fhZ+R8o+9AAAAD3RSTlMAAyHtZxmFDeUl4PBTD/OTGuycAAAACXBIWXMAAAsTAAALEwEAmpwYAAAANElEQVR4nCWKxxEAMAzC5JJe9h835/gDOhAAEoF6Nrq6t0/N+9RvbLsBxayWGEY9Kccp8AAUwwCchjx1LgAAAABJRU5ErkJggg==",
                blurWidth: 8,
                blurHeight: 8
            };

            function f({
                row: e,
                gitGeniusUrl: t,
                githubUrl: n,
                gitGeniusLabel: g = "Open in GitGenius",
                githubLabel: x = "Open on Github"
            }) {
                let [A, p] = m.useState(null), w = () => p(null), j = (0, o.default)(), C = (0, c.A)(j.breakpoints.up("sm")), b = `${e.RepoUser}/${e.RepoName}`, S = t || `https://www.gitgenius.co/repos/${b}`, v = n || `https://www.github.com/${b}`, k = e => {
                    "GitGenius" == e ? (window.open(S), p(!1)) : "Github" == e && (window.open(v), p(!1)), w()
                };
                return (0, l.jsxs)(l.Fragment, {
                    children: [C && (0, l.jsxs)(l.Fragment, {
                        children: [(0, l.jsx)("span", {
                            style: {
                                cursor: "pointer",
                                marginRight: 4
                            },
                            title: g,
                            onClick: () => {
                                window.open(S)
                            },
                            children: (0, l.jsx)(u.default, {
                                src: h,
                                alt: "GitGenius",
                                style: {
                                    width: 20,
                                    height: 20,
                                    verticalAlign: "middle",
                                    marginRight: 4
                                }
                            })
                        }), (0, l.jsx)("span", {
                            style: {
                                cursor: "pointer",
                                marginLeft: 4,
                                marginRight: 4
                            },
                            title: x,
                            onClick: () => {
                                window.open(v)
                            },
                            children: (0, l.jsx)(r.A, {
                                fontSize: "small"
                            })
                        })]
                    }), !C && (0, l.jsxs)(l.Fragment, {
                        children: [(0, l.jsx)(s.A, {
                            "aria-label": "more icon",
                            onClick: e => p(e.currentTarget),
                            children: (0, l.jsx)(i.A, {})
                        }), (0, l.jsxs)(a.A, {
                            anchorEl: A,
                            open: !!A,
                            onClose: w,
                            children: [(0, l.jsx)(d.A, {
                                onClick: () => k("GitGenius"),
                                children: g
                            }), (0, l.jsx)(d.A, {
                                onClick: () => k("Github"),
                                children: x
                            })]
                        }), " "]
                    })]
                })
            }
        }
    },
    e => {
        e.O(0, [1667, 7911, 8500, 2129, 9845, 475, 6534, 1781, 6678, 2783, 6992, 1718, 5772, 4839, 6701, 2774, 3442, 8441, 3794, 7358], () => e(e.s = 25967)), _N_E = e.O()
    }
]);