performance.mark("js-parse-end:6627-0b9487edeb720053.js");
export const __rspack_esm_id = 6627;
export const __rspack_esm_ids = [6627];
export const __webpack_modules__ = {
    613743(t, e, i) {
        var s = i(389997);
        i.d(e, {
            XX: () => s.XX,
            _3: () => s._3,
            qy: () => s.qy
        })
    },
    574567(t, e, i) {
        class s extends Event {
            name;
            filter;
            value;
            description;
            inlineDescription = !1;
            action;
            priority;
            icon;
            avatar;
            constructor({
                filter: t,
                value: e,
                name: i = "",
                description: s = "",
                inlineDescription: r = !1,
                priority: a = 1 / 0,
                icon: n,
                avatar: l,
                action: o
            }) {
                super("filter-item"), this.filter = t, this.value = e, this.name = i, this.description = s, this.inlineDescription = r, this.priority = a, this.icon = n, this.avatar = l, this.action = o
            }
        }

        function r(t) {
            return t instanceof Object
        }
        class a extends Event {
            id;
            priority;
            value;
            action;
            description;
            icon;
            scope;
            prefixText;
            prefixColor;
            isFallbackSuggestion;
            constructor({
                id: t,
                priority: e,
                value: i,
                action: s,
                description: r = "",
                icon: a,
                scope: n = "DEFAULT",
                prefixText: l,
                prefixColor: o,
                isFallbackSuggestion: u,
                isUpdate: h
            }) {
                super(h ? "update-item" : "search-item"), this.id = t, this.priority = e, this.value = i, this.prefixText = l, this.prefixColor = o, this.action = s, this.description = r, this.icon = a, this.scope = n, this.isFallbackSuggestion = u || !1
            }
        }
        class n extends Event {
            fetchPromise;
            constructor(t) {
                super("fetch-data"), this.fetchPromise = t
            }
        }
        class l extends Event {
            parsedQuery;
            rawQuery;
            parsedMetadata;
            constructor(t, e, i) {
                super("query"), this.parsedQuery = t, this.rawQuery = e, this.parsedMetadata = i
            }
            toString() {
                return this.rawQuery
            }
        }
        Event, i.d(e, {
            CN: () => a,
            P$: () => l,
            dS: () => n,
            nM: () => r,
            qi: () => s
        }, {
            VJ: {
                Normal: "normal",
                Entity: "entity",
                Constant: "constant",
                FilterValue: "filter-value"
            },
            k8: "Autocomplete",
            m4: {
                Apps: "apps",
                Archived: "archived",
                Book: "book",
                Bookmark: "bookmark",
                Branch: "branch",
                Calendar: "calendar",
                Circle: "circle",
                Code: "code",
                CodeReview: "code-review",
                CodeSquare: "code-square",
                Comment: "comment",
                CommentDiscussion: "comment-discussion",
                Copilot: "copilot",
                CopilotError: "copilot-error",
                Codespaces: "codespaces",
                CreditCard: "credit-card",
                Default: "default",
                DeviceDesktop: "device-desktop",
                DeviceMobile: "device-mobile",
                Discussion: "discussion",
                Draft: "draft",
                FileCode: "file-code",
                Filter: "filter",
                Forbidden: "forbidden",
                Gift: "gift",
                Globe: "globe",
                Heart: "heart",
                History: "history",
                Issue: "issue",
                IssueOpened: "issue-opened",
                IssueClosed: "issueClosed",
                Iterations: "iterations",
                Mention: "mention",
                Merged: "merged",
                Milestone: "milestone",
                No: "no",
                Not: "not",
                Organization: "organization",
                Package: "package",
                Pencil: "pencil",
                Person: "person",
                Play: "play",
                PlusCircle: "plus-circle",
                Project: "project",
                PullRequest: "pullRequest",
                Question: "question",
                Reaction: "reaction",
                Repo: "repo",
                Rocket: "rocket",
                Search: "search",
                Server: "server",
                ShieldCheck: "shield-check",
                SingleSelect: "single-select",
                Sort: "sort",
                Tag: "tag",
                Team: "team",
                Telescope: "telescope",
                Trash: "trash",
                Workflow: "workflow"
            },
            o7: {
                DIRECTORY: "Search in this directory",
                ORG: "Search in this organization",
                OWNER: "Search in this owner",
                REPO: "Search in this repository",
                ENTERPRISE: "Search in this enterprise",
                GITHUB: "Search all of GitHub",
                GENERAL: "Submit search",
                COMMAND: "Run command",
                COPILOT_CHAT: "Start a new Copilot thread",
                COPILOT_SEARCH: "Search with Copilot",
                EXPLORE: "Learn More",
                DEFAULT: "Jump to"
            },
            yk: {
                Entity: "--color-prettylights-syntax-entity",
                Constant: "--color-prettylights-syntax-constant",
                Keyword: "--color-prettylights-syntax-keyword",
                Variable: "--color-prettylights-syntax-variable",
                String: "--color-prettylights-syntax-string"
            }
        })
    },
    209358(t, e, i) {
        i.d(e, {
            dS: () => o.dS,
            qi: () => o.qi,
            m4: () => o.m4,
            MK: () => c,
            CN: () => o.CN
        });
        var s = i(331635),
            r = i(651135),
            a = i(935908),
            n = i(402604),
            l = i(613743),
            o = i(574567);
        class u {#
            t;#
            e;
            constructor(t) {
                this.#t = t
            }
            resetSignature() {
                this.#e = void 0
            }
            render(t, {
                usingCustomParser: e,
                filterKey: i
            }) {
                this.#i(this.#t.input.value);
                let s = this.#s(t, e, i);
                if (s !== this.#e) {
                    let r = document.createDocumentFragment();
                    for (let s of t) {
                        let t = document.createElement("span"),
                            a = document.createElement("span");
                        a.textContent = " ";
                        let n = !e;
                        if ("filter" === s.type) {
                            let {
                                filter: e,
                                value: r
                            } = s, l = document.createElement("span");
                            t.setAttribute("data-type", "filter-expression"), l.setAttribute("data-type", "filter"), l.textContent = e;
                            let o = document.createElement("span");
                            o.textContent = i;
                            let u = document.createElement("span");
                            u.setAttribute("data-type", "filter-value"), u.textContent = r, t.appendChild(l), t.appendChild(o), t.appendChild(u), n && t.appendChild(a)
                        } else n ? t.textContent = `${s.value} ` : t.textContent = s.value, s.style === o.VJ.Constant ? t.classList.add("qb-constant") : s.style === o.VJ.Entity ? t.classList.add("qb-entity") : s.style === o.VJ.FilterValue && t.classList.add("qb-filter-value");
                        r.append(t)
                    }
                    this.#t.styledInputContent.replaceChildren(r), this.#e = s
                }
                t.length > 0 && this.#r()
            }#
            s(t, e, i) {
                return JSON.stringify([e, i, t.map(t => "filter" === t.type ? ["f", t.filter, t.value] : ["t", t.style ? ? "", t.value])])
            }#
            i(t) {
                let {
                    input: e,
                    sizer: i
                } = this.#t;
                if (i.textContent = "", null !== e.selectionStart && e.selectionStart === e.selectionEnd) {
                    let s = e.selectionStart,
                        r = document.createElement("span");
                    i.append(t.substring(0, s), r, t.substring(s))
                } else i.textContent = t
            }#
            r() {
                let {
                    input: t,
                    sizer: e,
                    styledInputContainer: i,
                    minWidth: s
                } = this.#t;
                requestAnimationFrame(() => {
                    let r = e.querySelector("span");
                    r && (r.offsetLeft < i.scrollLeft ? i.scrollLeft = r.offsetLeft - s : r.offsetLeft > i.scrollLeft + i.clientWidth && (i.scrollLeft = r.offsetLeft - i.clientWidth + s));
                    let a = Math.max(e.scrollWidth + 2, 2 * ("" === t.value), s);
                    t.style.width = `${a}px`
                })
            }
        }
        class h extends Event {
            key;
            text;
            data;
            constructor(t, e, i) {
                super("query-builder-feedback", {
                    bubbles: !0,
                    cancelable: !0
                }), this.key = t, this.text = e, this.data = i
            }
        }
        let d = (t, e) => t.priority - e.priority;
        class c extends HTMLElement {#
            a;#
            n = !1;#
            l = !1;#
            o = {};#
            u = new Set;#
            h = null;#
            d = null;#
            c = new Map;#
            p = new Map;#
            m = new Set;#
            y = new Set;#
            f = new Map;#
            v;#
            g = "QueryBuilder-focus";#
            I = new Map;#
            b = new u(this);#
            C = new Map;#
            $ = 0;#
            L = 150;#
            q = 3e3;#
            A = !1;#
            E = !1;#
            F = !1;
            parser = {
                parse: this.#S.bind(this),
                flatten: t => t
            };
            parsedMetadata = void 0;
            renderSingularItemNames = !1;#
            w = !1;
            lastParsedQuery = void 0;
            FOCUS_TIMEOUT_VALUE = 100;
            minWidth = 300;
            get input() {
                return (0, r.FB)(this, "input")
            }
            get styledInputContent() {
                return (0, r.FB)(this, "styledInputContent")
            }
            get styledInputContainer() {
                return (0, r.FB)(this, "styledInputContainer")
            }
            get styledInput() {
                return (0, r.FB)(this, "styledInput")
            }
            get overlay() {
                return (0, r.FB)(this, "overlay")
            }
            get sizer() {
                return (0, r.FB)(this, "sizer")
            }
            get clearButton() {
                return (0, r.FB)(this, "clearButton")
            }
            get resultsList() {
                return (0, r.FB)(this, "resultsList")
            }
            get screenReaderFeedback() {
                return (0, r.FB)(this, "screenReaderFeedback")
            }
            get query() {
                return this.input.value
            }
            get i18n() {
                return {
                    suggestion: "suggestion",
                    suggestions: "suggestions",
                    clear_search: "Input cleared."
                }
            }#
            R(t) {
                return t.ctrlKey || t.metaKey
            }#
            x(t, e) {
                e && this.#R(e) ? window.open(t) : window.location.href = t
            }
            navigate(t) {
                let e = t ? .target ? .closest("li"),
                    i = this.#P(e);
                i && ((0, n.BI)("query-builder-element.click", {
                    url: i
                }), this.dispatchEvent(new CustomEvent("query-builder:navigate", {
                    bubbles: !0,
                    detail: {
                        url: i
                    }
                })), this.#x(i, t instanceof MouseEvent ? t : void 0))
            }#
            P(t) {
                if (!t) return;
                let e = t.getAttribute("id");
                if (e) return this.#C.get(e)
            }
            get closed() {
                return this.overlay && this.overlay.hasAttribute("hidden")
            }
            set closed(t) {
                if (t) this.closed || (this.overlay && (this.overlay.hidden = !0), this.input.setAttribute("aria-expanded", "false"), this.#a ? .clearSelection(), this.screenReaderFeedback.hidden = !0);
                else {
                    if (!this.closed) return;
                    this.overlay && (this.overlay.hidden = !1), this.input.setAttribute("aria-expanded", "true"), this.screenReaderFeedback.hidden = !1
                }
            }
            show() {
                this.closed = !1, this.overlay ? .scrollIntoView ? .({
                    behavior: "smooth",
                    block: "nearest"
                })
            }
            hide() {
                "false" === this.resultsList.getAttribute("data-persist-list") && (this.closed = !0)
            }
            initialize(t, e) {
                for (let i of (this.parser = t, this.#w = !0, this.#E = !0, e)) this.attachProvider(i);
                this.#E = !1, this.#o = e.reduce((t, e) => ({ ...t,
                    [e.value]: e
                }), {})
            }
            elementDefinitionReadyForProviders = t => {
                t.detail.id === this.#v && (this.readyForRequestProviders(), t.stopImmediatePropagation())
            };
            detachElementDefinitionReadyForProviders() {
                this.removeEventListener("query-builder:ready-to-request-provider", this.elementDefinitionReadyForProviders)
            }
            connectedCallback() {
                this.#h ? .abort();
                let {
                    signal: t
                } = this.#h = new AbortController;
                t.addEventListener("abort", () => {
                    this.#o = {}
                }), this.#v = this.input.getAttribute("id"), this.hasAttribute("defer-request-providers") || (document.addEventListener("query-builder:ready-to-request-provider", this.elementDefinitionReadyForProviders, !0), this.readyForRequestProviders())
            }
            readyForRequestProviders() {
                this.#k() > 0 && this.#F || (this.#a || = new a.A(this.input, this.resultsList, {
                    tabInsertsSuggestions: !1
                }), this.requestProviders())
            }
            async requestProviders() {
                this.#F = !0, await Promise.resolve(), this.#E = !0, this.dispatchEvent(new Event("query-builder:request-provider", {
                    bubbles: !0
                })), this.#E = !1, this.#I = new Map, this.#b.resetSignature();
                let t = this.parseInputValue();
                this.styleInputText(t), this.toggleClearButtonVisibility()
            }
            parseInputValue() {
                return this.parsedMetadata = this.parser.parse(this.input.value, this.input.selectionStart || 0), this.parser.flatten(this.parsedMetadata)
            }
            attachProvider(t) {
                if (!this.#h) return;
                let {
                    signal: e
                } = this.#h;
                if (!this.#E) throw Error("Can't attach providers after the query builder has been connected");
                this.#o[t.value] || (this.#o[t.value] = t, "filter" === t.type ? (this.#u.add(t.value), t.addEventListener("filter-item", e => {
                    this.#B(this.#f, t), this.#f.get(t) ? .push(e), this.#T()
                }, {
                    signal: e
                }), t.addEventListener("show", () => {
                    this.#y.add(t), this.#T()
                }, {
                    signal: e
                }), t.addEventListener("fetch-data", async t => {
                    let e = new Promise(t => setTimeout(t, this.#q));
                    this.#A = Promise.race([Promise.all([this.#A, t.fetchPromise]), e]);
                    let i = this.#A;
                    try {
                        await i
                    } catch (t) {
                        if ("AbortError" !== t.name) throw this.#A = !1, t
                    }
                    i === this.#A && (this.#A = !1, this.#T(), this.updateVisibility())
                }, {
                    signal: e
                })) : (t.addEventListener("fetch-data", async e => {
                    this.#m.delete(t), await e.fetchPromise, this.#c.set(t, this.#p.get(t) || []), this.#p.delete(t), this.#T()
                }), t.addEventListener("search-item", e => {
                    this.#B(this.#c, t), this.#p.has(t) ? this.#p.get(t) ? .push(e) : (this.#m.has(t) && (this.#c.set(t, []), this.#m.delete(t)), this.#c.get(t) ? .push(e), this.#T())
                }, {
                    signal: e
                }), t.addEventListener("update-item", e => {
                    let i = this.#c.get(t);
                    if (!i) return;
                    let s = i.findIndex(t => t.id === e.id);
                    s < 0 || (i[s] = e, this.#T())
                }, {
                    signal: e
                })))
            }
            disconnectedCallback() {
                this.#h ? .abort()
            }
            comboboxCommit(t) {
                let e = t.target,
                    i = e ? .getAttribute("data-type"),
                    s = e ? .getAttribute("data-value") || "",
                    r = e ? .getAttribute("data-replace-query-with") || "",
                    a = parseInt(e ? .getAttribute("data-move-caret-to") || "0") || 0,
                    n = this.parseInputValue();
                if ("url-result" === i);
                else if ("filter-result" === i) n.pop(), n.push({
                    type: "filter",
                    filter: s,
                    value: ""
                });
                else if ("command-result" === i) {
                    let t = e.getAttribute("data-command-name") || "",
                        i = JSON.parse(e.getAttribute("data-command-payload") || "{}");
                    this.dispatchEvent(new CustomEvent(t, {
                        detail: i
                    }))
                } else if ("query-result" === i)
                    if (r) this.input.value = r, this.input.focus(), n = void 0;
                    else {
                        let t = this.parser.flatten(this.parser.parse(s, 0));
                        n.push(...t), n.push({
                            type: "text",
                            value: ""
                        })
                    }
                else "filter-item" === i && (r ? (this.input.value = r, this.input.focus(), n = void 0) : this.addSelectedItemToFilter(s, n));
                if (this.parseQuery(n), r) {
                    let t = -1 === a ? this.input.value.length : a;
                    this.input.setSelectionRange(t, t)
                }
                this.input.removeAttribute("aria-activedescendant")
            }
            addSelectedItemToFilter(t, e) {
                let i = /\s/.test(t),
                    s = e.pop();
                if (s ? .type === "filter") {
                    let r = s.value.split(",");
                    r.pop(), r.push(i ? `"${t}"` : t), e.push({
                        type: "filter",
                        filter: s ? .filter,
                        value: r.join(",")
                    }), e.push({
                        type: "text",
                        value: ""
                    })
                } else s && e.push(s)
            }
            async inputChange() {
                await this.parseQuery()
            }
            inputBlur() {
                if (clearTimeout(this.focusTimeout), this.#n) {
                    this.#n = !1;
                    return
                }
                this.styledInput.classList.remove(this.#g), this.input.removeAttribute("aria-activedescendant"), this.hide()
            }
            resultsMousedown() {
                this.#n = !0
            }
            async inputFocus() {
                this.styledInput.classList.add(this.#g), this.readyForRequestProviders(), this.#a.start();
                let t = this.input.value;
                this.lastParsedQuery && this.lastParsedQuery === this.input.value || await this.parseQuery(), this.closed && this.input.value === t && this.input.setSelectionRange(0, this.input.value.length), this.focusTimeout ? clearTimeout(this.focusTimeout) : this.focusTimeout = setTimeout(() => {
                    this.input.focus()
                }, this.FOCUS_TIMEOUT_VALUE)
            }
            moveCaretToEndOfInput() {
                this.input.setSelectionRange(this.input.value.length, this.input.value.length)
            }
            hasFocus() {
                return this.styledInput.classList.contains(this.#g)
            }
            inputKeydown(t) {
                let e = t.key;
                if ("Escape" === e) this.hide();
                else if ("Enter" === e) {
                    let e = this.resultsList.querySelector('[aria-selected="true"], [data-combobox-option-default="true"]');
                    if (!e || "true" === e.getAttribute("aria-disabled")) return;
                    let i = this.#P(e);
                    if (!i) return;
                    this.#x(i, t)
                }
            }
            inputSubmit() {
                this.hide()
            }
            clearButtonFocus(t) {
                let e = t.relatedTarget;
                e && e === this.input && this.show()
            }
            clearButtonBlur() {
                this.hide()
            }
            toggleClearButtonVisibility() {
                if (this.clearButton)
                    if ("" !== this.input.value) {
                        if (!1 === this.clearButton.hidden) return;
                        this.clearButton.hidden = !1
                    } else this.clearButton.hidden = !0
            }
            updateVisibility() {
                this.hasFocus() && (this.#f.size > 0 || this.#c.size > 0 || this.#y.size > 0 ? this.show() : this.#A || this.hide())
            }#
            B = (t, e) => {
                t.has(e) || t.set(e, [])
            };#
            O = !1;#
            T() {
                this.#O || (this.#O = !0, this.toggleClearButtonVisibility(), this.#O = !1, this.#M())
            }#
            V() {
                if (0 !== this.#y.size) return (0, l.qy)
                `<li role="presentation" class="ActionList-sectionDivider">
      <h3 role="presentation" class="ActionList-sectionDivider-title p-2 text-left" aria-hidden="true">
        Suggested filters
      </h3>
      <ul role="presentation">
        ${[...this.#y].sort(d).map(t=>this.#D(t))}
      </ul>
    </li>`
            }#
            Q(t, e, i = !1) {
                let s = [];
                if ("filter" === t.type ? t.manuallyDetermineFilterEligibility ? s = this.#f.get(t) ? .sort(d).map(t => this.#N(t)) || [] : e ? .type === "filter" && (s = this.#f.get(t) ? .filter(t => t.filter === e.filter).sort(d).map(t => this.#N(t)) || []) : s = [...this.#c.get(t) || []].filter(t => t.isFallbackSuggestion === i).sort(d).map(t => this.#_(t)), s.length)
                    if ("" === t.name) return (0, l.qy)
                `<li role="presentation" class="ActionList-sectionDivider">
        <ul role="presentation">
          ${s}
        </ul>
      </li>`;
                else return (0, l.qy)
                `<li role="presentation" class="ActionList-sectionDivider">
        <h3
          role="presentation"
          class="ActionList-sectionDivider-title QueryBuilder-sectionTitle p-2 text-left"
          aria-hidden="true"
        >
          ${t.name}
        </h3>
        <ul role="presentation">
          ${s}
        </ul>
      </li>`
            }#
            W() {
                this.#C.clear(), this.#$ = 0
            }#
            M() {
                let t;
                this.#W();
                let e = this.parseInputValue().at(-1),
                    i = Object.values(this.#o).sort((t, e) => t.priority - e.priority).map(t => this.#Q(t, e)).filter(t => void 0 !== t);
                this.#A || 0 !== i.length || (i = Object.values(this.#o).sort((t, e) => t.priority - e.priority).map(t => this.#Q(t, e, !0)).filter(t => void 0 !== t));
                let s = this.#V();
                s && i.push(s), 0 === i.length ? this.#A || (this.resultsList.textContent = "", (0, l.XX)((0, l.qy)
                    ``, this.resultsList)) : (0, l.XX)((0, l.qy)
                    `${i.map((t,e)=>e===i.length-1?t:(0,l.qy)`${t}
                <li aria-hidden="true" class="ActionList-sectionDivider"></li>`)}`, this.resultsList);
                let r = this.resultsList.querySelectorAll('[role="option"]').length,
                    a = 1 === r ? this.i18n.suggestion : this.i18n.suggestions;
                t = `${r} ${a}.`, this.#l && (t = `${this.i18n.clear_search} ${t}`, this.#l = !1), this.screenReaderFeedback.textContent === t && (t += "\xa0"), setTimeout(() => this.updateScreenReaderFeedback(t), this.#L)
            }#
            z(t) {
                if (t) return t.replace(/\s/g, "-").toLowerCase()
            }
            getLeadingVisual(t, e) {
                if (e) {
                    let t = "org" === e.type ? "avatar avatar-1 avatar-small" : "avatar avatar-1 avatar-small circle";
                    return (0, l.qy)
                    `<img src="${e.url}" alt="" role="presentation" class="${t}" />`
                }
                if (t && (0, o.nM)(t)) return (0, l.qy)([t.html]);
                let i = document.getElementById(`${t}-icon`);
                return (0, l.qy)([i ? .innerHTML])
            }#
            _({
                value: t,
                prefixText: e,
                prefixColor: i,
                target: s,
                action: r,
                description: a,
                icon: n,
                scope: u
            }) {
                let h = `${this.#v||"search-item"}-result-${this.#$++}`;
                if ("url" in r) {
                    let d = "GENERAL" === u ? `${o.o7[u]}` : `jump to this ${s.singularItemName}`,
                        c = a ? `, ${a}` : "",
                        p = `${e?`${e} `:""}${t}${c}, ${d}`;
                    this.#C.set(h, r.url);
                    let m = null;
                    return e && (m = (0, l.qy)
                        `
          <span>
            <div class="d-inline-flex position-relative">
              <div
                class="position-absolute rounded-1 flex-items-stretch height-full width-full"
                style="opacity: 0.1; background-color: var(${i})"
              ></div>
              <div class="px-1" style="color: var(${i})">${e}</div>
            </div>
            ${this.#U(t)}
          </span>
        `), (0, l.qy)
                    `<li
        role="option"
        class="ActionListItem"
        data-type="url-result"
        id="${h}"
        data-value="${t}"
        aria-label="${p}"
        data-href="${r.url}"
        data-action="click:query-builder#navigate"
      >
        <span class="QueryBuilder-ListItem-link ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          ${n?(0,l.qy)`<span id="${h}--leading" class="ActionListItem-visual ActionListItem-visual--leading">
                ${this.getLeadingVisual(n)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal"> ${m||this.#U(t)} </span>
            ${a?(0,l.qy)`<span class="ActionListItem-description">${a}</span>`:null}
          </span>

          <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${o.o7[u]}</span
          >
        </span>
      </li>`
                }
                if ("commandName" in r) {
                    let e = o.o7[u] || o.o7.COMMAND,
                        i = a ? `, ${a}` : "",
                        s = `${t}${i}, ${e}`;
                    return (0, l.qy)
                    `<li
        role="option"
        class="ActionListItem"
        data-type="command-result"
        id="${h}"
        data-value="${t}"
        data-command-name="${r.commandName}"
        data-command-payload="${JSON.stringify(r.data)}"
        aria-label="${s}"
      >
        <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          ${n?(0,l.qy)`<span id="${h}--leading" class="ActionListItem-visual ActionListItem-visual--leading">
                ${this.getLeadingVisual(n)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal"> ${this.#U(t)} </span>
            ${a?(0,l.qy)`<span class="ActionListItem-description">${a}</span>`:null}
          </span>

          <span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${e}</span
          >
        </span>
      </li>`
                } {
                    let e = "",
                        i = 0;
                    "replaceQueryWith" in r && (e = r.replaceQueryWith, i = r.moveCaretTo);
                    let s = "query" in r ? o.o7[u] : o.k8;
                    return (0, l.qy)
                    ` <li
        role="option"
        class="ActionListItem"
        data-type="query-result"
        data-value="${t}"
        aria-label="${t}${a?`, ${a}`:""}"
        data-replace-query-with="${e}"
        data-move-caret-to="${i}"
        id="${h}"
      >
        <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
          ${n?(0,l.qy)`<span id="${h}--leading" class="ActionListItem-visual ActionListItem-visual--leading">
                ${this.getLeadingVisual(n)}
              </span>`:null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal">${this.#U(t)}</span>
            ${a?(0,l.qy)`<span class="ActionListItem-description">${a}</span>`:null}
          </span>

          ${this.#c.size>0?(0,l.qy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
                >${s}</span
              >`:(0,l.qy)``}
        </span>
      </li>`
                }
            }#
            U(t) {
                let e = this.parser.flatten(this.parser.parse(t, 0)),
                    i = !this.#w,
                    s = [];
                for (let t of e)
                    if ("filter" === t.type) s.push((0, l.qy)
                        `<span>${t.filter}:</span
            ><span data-type="filter-value">${t.value}${i?" ":""}</span>`);
                    else {
                        let e = "";
                        t.style === o.VJ.Constant ? e = "qb-constant" : t.style === o.VJ.Entity ? e = "qb-entity" : t.style === o.VJ.FilterValue && (e = "qb-filter-value"), s.push((0, l.qy)
                            `<span class="${e}">${t.value}${i?" ":""}</span>`)
                    }
                return s
            }#
            D({
                singularItemName: t,
                icon: e,
                description: i,
                value: s
            }) {
                let r = i ? `, ${i}` : "",
                    a = `${this.renderSingularItemNames?t:s}${r}`;
                return (0, l.qy)
                ` <li
      role="option"
      class="ActionListItem"
      data-type="filter-result"
      data-value="${s}"
      id="${this.#v||"filter"}-result-${this.#z(s)}"
      aria-label="${a}, filter"
    >
      <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
        ${e?(0,l.qy)`<span
              id="${this.#v||"filter"}-result-${this.#z(s)}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(e)}
            </span>`:null}
        <span class="ActionListItem-descriptionWrap">
          <span class="ActionListItem-label text-normal">
            ${this.renderSingularItemNames?t:`${s}:`}
          </span>
          ${i?(0,l.qy)`<span class="ActionListItem-description">${i}</span>`:null}
        </span>

        ${this.#c.size>0?(0,l.qy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${o.k8}</span
            >`:(0,l.qy)``}
      </span>
    </li>`
            }#
            N({
                name: t,
                value: e,
                target: i,
                icon: s,
                avatar: r,
                description: a,
                inlineDescription: n,
                action: u
            }) {
                let h = t && t.length > 0 ? t : e,
                    d = a ? `, ${a}` : "",
                    c = i.singularItemName ? `${h}${d}, autocomplete this ${i.singularItemName}` : `${h}${d}, ${i.name}`,
                    p = "",
                    m = 0;
                return u && "replaceQueryWith" in u && (p = u.replaceQueryWith, m = u.moveCaretTo), (0, l.qy)
                ` <li
      role="option"
      class="ActionListItem"
      data-type="filter-item"
      data-replace-query-with="${p}"
      data-move-caret-to="${m}"
      data-value="${e}"
      id="${this.#v||"filter-item"}-result-${this.#z(e)}"
      aria-label="${c}"
    >
      <span class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem">
        ${s?(0,l.qy)`<span
              id="${this.#v||"filter-item"}-result-${this.#z(e)}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(s,r)}
            </span>`:null}
        <span class="${n?"ActionListItem-descriptionWrap-inline":"ActionListItem-descriptionWrap"}">
          <span class="ActionListItem-label text-normal">${h}</span>
          ${a?(0,l.qy)`<span class="ActionListItem-description">${a}</span>`:null}
        </span>

        ${this.#c.size>0?(0,l.qy)`<span aria-hidden="true" class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${o.k8}</span
            >`:(0,l.qy)``}
      </span>
    </li>`
            }
            updateScreenReaderFeedback(t) {
                let e = new h("NEW_RESULTS", t, {});
                this.dispatchEvent(e), this.screenReaderFeedback.textContent = e.text
            }
            async clear() {
                this.dispatchEvent(new CustomEvent("query-builder:clear", {
                    bubbles: !0,
                    cancelable: !0
                })) && await this.clearInput()
            }
            async clearInput({
                focusInput: t = !0
            } = {}) {
                await this.parseQuery([], t), this.#l = !0
            }
            async parseQuery(t, e = !0) {
                this.#d ? .abort();
                let {
                    signal: i
                } = this.#d = new AbortController;
                if (t) {
                    let e = t.map(t => "filter" === t.type ? `${t.filter}:${t.value}` : t.value).join(this.#w ? "" : " "),
                        i = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.input), "value") ? .set;
                    i ? i ? .call(this.input, e) : this.input.value = e, this.input.dispatchEvent(new Event("change", {
                        bubbles: !0
                    }))
                } else t = this.parseInputValue();
                if (this.lastParsedQuery = this.input.value, await new Promise(t => requestAnimationFrame(t)), i.aborted || (this.styleInputText(t), e && this.input.focus(), await new Promise(t => setTimeout(t, 100)), i.aborted)) return;
                for (let t of this.#c.keys()) this.#m.add(t);
                this.#f.clear(), this.#y.clear();
                let s = new o.P$(t, this.input.value, this.parsedMetadata);
                this.dispatchEvent(s);
                let r = !1;
                for (let t of this.#m.keys()) this.#c.delete(t), this.#m.delete(t), r = !0;
                r && this.#T(), this.updateVisibility()
            }#
            S(t) {
                let e = this.#I.get(t);
                if (e) return e.slice(); {
                    let e = [];
                    for (let i of t.split(/\s(?=(?:[^"]*"[^"]*")*[^"]*$)/g)) {
                        let t = i.indexOf(this.filterKey);
                        if (t > 0) {
                            let s = i.substring(0, t),
                                r = i.substring(t + 1);
                            e.push(this.#u.has(s) ? {
                                type: "filter",
                                filter: s,
                                value: r
                            } : {
                                type: "text",
                                value: i
                            })
                        } else e.push({
                            type: "text",
                            value: i
                        })
                    }
                    return this.#I.set(t, [...e]), e
                }
            }
            styleInputText(t) {
                this.#b.render(t, {
                    usingCustomParser: this.#w,
                    filterKey: this.filterKey
                })
            }#
            k() {
                return Object.keys(this.#o).length
            }
        }(0, s.Cg)([r.CF], c.prototype, "filterKey", void 0), (0, s.Cg)([r.CF], c.prototype, "minWidth", void 0), c = (0, s.Cg)([(0, r.p_)("query-builder")], c)
    }
};
//# sourceMappingURL=6627-0b9487edeb720053-dfc18c2ace12430e.js.map