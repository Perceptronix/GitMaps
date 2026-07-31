(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 50003, e => {
    "use strict";
    var t = e.i(43476),
        a = e.i(71645),
        r = e.i(83599),
        s = e.i(47163),
        o = e.i(66319),
        l = e.i(35675),
        d = e.i(75254);
    let n = (0, d.default)("flame", [
            ["path", {
                d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
                key: "96xj49"
            }]
        ]),
        i = (0, d.default)("calendar", [
            ["path", {
                d: "M8 2v4",
                key: "1cmpym"
            }],
            ["path", {
                d: "M16 2v4",
                key: "4m81vk"
            }],
            ["rect", {
                width: "18",
                height: "18",
                x: "3",
                y: "4",
                rx: "2",
                key: "1hopcy"
            }],
            ["path", {
                d: "M3 10h18",
                key: "8toen8"
            }]
        ]),
        c = (0, d.default)("calendar-days", [
            ["path", {
                d: "M8 2v4",
                key: "1cmpym"
            }],
            ["path", {
                d: "M16 2v4",
                key: "4m81vk"
            }],
            ["rect", {
                width: "18",
                height: "18",
                x: "3",
                y: "4",
                rx: "2",
                key: "1hopcy"
            }],
            ["path", {
                d: "M3 10h18",
                key: "8toen8"
            }],
            ["path", {
                d: "M8 14h.01",
                key: "6423bh"
            }],
            ["path", {
                d: "M12 14h.01",
                key: "1etili"
            }],
            ["path", {
                d: "M16 14h.01",
                key: "1gbofw"
            }],
            ["path", {
                d: "M8 18h.01",
                key: "lrp35t"
            }],
            ["path", {
                d: "M12 18h.01",
                key: "mhygvu"
            }],
            ["path", {
                d: "M16 18h.01",
                key: "kzsmim"
            }]
        ]);
    var h = e.i(73375),
        u = e.i(63059),
        m = e.i(63209);
    let p = e => fetch(e, {
            headers: {
                Accept: "application/vnd.github.v3+json"
            }
        }).then(e => e.json()),
        g = [{
            value: "daily",
            label: "Today",
            icon: n
        }, {
            value: "weekly",
            label: "This Week",
            icon: i
        }, {
            value: "monthly",
            label: "This Month",
            icon: c
        }];

    function x() {
        let [e, d] = (0, a.useState)("daily"), [n, i] = (0, a.useState)(""), [c, x] = (0, a.useState)(1), y = function(e) {
            let t = new Date;
            switch (e) {
                case "weekly":
                    t.setDate(t.getDate() - 7);
                    break;
                case "monthly":
                    t.setMonth(t.getMonth() - 1);
                    break;
                default:
                    t.setDate(t.getDate() - 1)
            }
            return t.toISOString().split("T")[0]
        }(e), f = `created:>${y}`;
        n && (f += ` language:${n}`);
        let b = new URLSearchParams({
                q: f,
                sort: {
                    daily: "stars",
                    weekly: "stars",
                    monthly: "stars"
                }[e] || "stars",
                order: "desc",
                per_page: "25",
                page: String(c)
            }),
            {
                data: v,
                error: k,
                isLoading: j
            } = (0, r.default)(`https://api.github.com/search/repositories?${b.toString()}`, p, {
                revalidateOnFocus: !1,
                keepPreviousData: !0
            }),
            N = v ? .items || [],
            w = v ? .total_count || 0;
        return (0, t.jsxs)("div", {
            className: "flex flex-col gap-6",
            children: [(0, t.jsxs)("div", {
                className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                children: [(0, t.jsx)("div", {
                    className: "flex gap-1 rounded-lg bg-secondary p-1",
                    children: g.map(a => {
                        let r = a.icon;
                        return (0, t.jsxs)("button", {
                            type: "button",
                            onClick: () => {
                                d(a.value), x(1)
                            },
                            className: (0, s.cn)("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", e === a.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
                            children: [(0, t.jsx)(r, {
                                className: "h-3.5 w-3.5"
                            }), a.label]
                        }, a.value)
                    })
                }), (0, t.jsx)("select", {
                    value: n,
                    onChange: e => {
                        i(e.target.value), x(1)
                    },
                    className: "rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring",
                    children: o.LANGUAGES.map(e => (0, t.jsx)("option", {
                        value: e.value,
                        children: e.label
                    }, e.value))
                })]
            }), k && (0, t.jsxs)("div", {
                className: "flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive",
                children: [(0, t.jsx)(m.AlertCircle, {
                    className: "h-4 w-4 flex-shrink-0"
                }), (0, t.jsx)("span", {
                    children: "Failed to load trending repositories. Please try again later."
                })]
            }), !k && !j && w > 0 && (0, t.jsxs)("p", {
                className: "text-sm text-muted-foreground",
                children: ["Showing ", N.length, " of ", w.toLocaleString(), " repositories"]
            }), (0, t.jsx)("div", {
                className: "flex flex-col gap-3",
                children: j ? Array.from({
                    length: 10
                }).map((e, a) => (0, t.jsx)(l.RepoCardSkeleton, {}, `skeleton-${a}`)) : N.map((e, a) => (0, t.jsx)(l.RepoCard, {
                    repo: e,
                    rank: (c - 1) * 25 + a + 1
                }, e.id))
            }), !j && N.length > 0 && (0, t.jsxs)("div", {
                className: "flex items-center justify-center gap-3 pt-2",
                children: [(0, t.jsxs)("button", {
                    type: "button",
                    disabled: c <= 1,
                    onClick: () => x(e => Math.max(1, e - 1)),
                    className: "flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                    children: [(0, t.jsx)(h.ChevronLeft, {
                        className: "h-4 w-4"
                    }), "Previous"]
                }), (0, t.jsxs)("span", {
                    className: "text-sm text-muted-foreground",
                    children: ["Page ", c]
                }), (0, t.jsxs)("button", {
                    type: "button",
                    disabled: N.length < 25,
                    onClick: () => x(e => e + 1),
                    className: "flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                    children: ["Next", (0, t.jsx)(u.ChevronRight, {
                        className: "h-4 w-4"
                    })]
                })]
            }), !j && 0 === N.length && !k && (0, t.jsxs)("div", {
                className: "flex flex-col items-center gap-2 py-16 text-center",
                children: [(0, t.jsx)("p", {
                    className: "text-lg font-medium text-foreground",
                    children: "No repositories found"
                }), (0, t.jsx)("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Try changing the time range or language filter."
                })]
            })]
        })
    }
    e.s(["TrendingList", () => x], 50003)
}]);