(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
    'object' == typeof document ? document.currentScript : void 0,
    45765,
    e => {
        'use strict';
        var t = e.i(35917);
        e.s([
            'useCopyButton',
            0,
            function (e) {
                let [r, n] = (0, t.useState)(!1),
                    s = (0, t.useRef)(e),
                    i = (0, t.useRef)(null);
                s.current = e;
                let o = (0, t.useCallback)(() => {
                    (i.current && window.clearTimeout(i.current),
                        Promise.resolve(s.current()).then(() => {
                            (n(!0),
                                (i.current = window.setTimeout(() => {
                                    n(!1);
                                }, 1500)));
                        }));
                }, []);
                return (
                    (0, t.useEffect)(
                        () => () => {
                            i.current && window.clearTimeout(i.current);
                        },
                        []
                    ),
                    [r, o]
                );
            }
        ]);
    },
    4869,
    e => {
        'use strict';
        e.s(
            [
                'DocsBody',
                () => eb,
                'DocsDescription',
                () => ey,
                'DocsPage',
                () => eg,
                'DocsTitle',
                () => ew,
                'EditOnGitHub',
                () => ev,
                'PageLastUpdate',
                () => ej,
                'page_exports',
                () => ep,
                'useDocsPage',
                () => ex
            ],
            19872
        );
        var t = e.i(32248),
            r = e.i(77408),
            n = e.i(72395),
            s = e.i(49561),
            i = e.i(71331),
            o = e.i(35917),
            a = e.i(59954),
            l = e.i(91233),
            c = e.i(87484);
        let u = (0, o.createContext)(null),
            d = (0, o.createContext)(null);
        function f({ ref: e, onActiveChange: t = () => null, ...r }) {
            let n = h(),
                s = (0, o.use)(d),
                i = r.href ? p(r.href) : null,
                u = (0, o.useRef)(null),
                [m, x] = (0, o.useState)(() => i && n.some(e => e.active && e.id === i)),
                g = (0, o.useRef)(null);
            if (null === g.current) {
                let e = n.findLast(e => e.active);
                g.current = void 0 !== e && e.id === i;
            }
            return (
                (0, l.useOnChange)(n, () => {
                    if (null === i) return;
                    let e = n.find(e => e.id === i);
                    if (!e || e.active === m) return;
                    let r = u.current,
                        o = s?.current;
                    (e.active &&
                        n.every(t => !t.active || t.t <= e.t) &&
                        o &&
                        r &&
                        (0, c.default)(r, { behavior: 'smooth', block: 'center', inline: 'center', scrollMode: 'always', boundary: o }),
                        x(e.active),
                        t(e.active));
                }),
                (0, o.useEffect)(() => {
                    let e = u.current,
                        t = s?.current;
                    g.current &&
                        t &&
                        e &&
                        (0, c.default)(e, { behavior: 'instant', block: 'center', inline: 'center', scrollMode: 'always', boundary: t });
                }, [s]),
                (0, a.jsx)('a', {
                    ref: (function (...e) {
                        return t => {
                            e.forEach(e => {
                                'function' == typeof e ? e(t) : null != e && (e.current = t);
                            });
                        };
                    })(u, e),
                    'data-active': m,
                    ...r
                })
            );
        }
        function h() {
            let e = (0, o.use)(u);
            if (!e) throw Error('Component must be used under the <AnchorProvider /> component.');
            return e;
        }
        function p(e) {
            return e.startsWith('#') ? e.slice(1) : null;
        }
        var m = class {
            constructor() {
                ((this.items = []), (this.single = !1), (this.observer = null));
            }
            callback(e) {
                if (0 === e.length) return;
                let t = !1;
                if (
                    ((this.items = this.items.map(r => {
                        let n = e.find(e => e.target.id === r.id),
                            s = n ? n.isIntersecting : r.active && !r.fallback;
                        return (
                            this.single && t && (s = !1),
                            r.active !== s && (r = { ...r, t: Date.now(), active: s, fallback: !1 }),
                            s && (t = !0),
                            r
                        );
                    })),
                    !t && e[0].rootBounds)
                ) {
                    let t = e[0].rootBounds.top,
                        r = Number.MAX_VALUE,
                        n = -1;
                    for (let e = 0; e < this.items.length; e++) {
                        let s = document.getElementById(this.items[e].id);
                        if (!s) continue;
                        let i = Math.abs(t - s.getBoundingClientRect().top);
                        i < r && ((n = e), (r = i));
                    }
                    -1 !== n && (this.items[n] = { ...this.items[n], active: !0, fallback: !0, t: Date.now() });
                }
                this.onChange?.();
            }
            setItems(e) {
                let t = this.observer;
                if (t)
                    for (let e of this.items) {
                        let r = document.getElementById(e.id);
                        r && t.unobserve(r);
                    }
                for (let t of ((this.items = []), e)) {
                    let e = p(t.url);
                    e && this.items.push({ id: e, active: !1, fallback: !1, t: 0, original: t });
                }
                this.watchItems();
            }
            watch(e) {
                this.observer || ((this.observer = new IntersectionObserver(this.callback.bind(this), e)), this.watchItems());
            }
            watchItems() {
                if (this.observer)
                    for (let e of this.items) {
                        let t = document.getElementById(e.id);
                        t && this.observer.observe(t);
                    }
            }
            unwatch() {
                (this.observer?.disconnect(), (this.observer = null));
            }
        };
        e.s(
            [
                'AnchorProvider',
                0,
                function ({ toc: e, single: t = !1, children: r }) {
                    let n = (0, o.useMemo)(() => new m(), []),
                        [s, i] = (0, o.useState)(n.items);
                    return (
                        (n.single = t),
                        (0, o.useEffect)(() => {
                            n.setItems(e);
                        }, [n, e]),
                        (0, o.useEffect)(
                            () => (
                                n.watch({ rootMargin: '0px', threshold: 0.98 }),
                                (n.onChange = () => i(n.items)),
                                () => {
                                    n.unwatch();
                                }
                            ),
                            [n]
                        ),
                        (0, a.jsx)(u, { value: s, children: r })
                    );
                },
                'ScrollProvider',
                0,
                function ({ containerRef: e, children: t }) {
                    return (0, a.jsx)(d, { value: e, children: t });
                },
                'TOCItem',
                0,
                f,
                'useActiveAnchor',
                0,
                function () {
                    let e = h();
                    return (0, o.useMemo)(() => {
                        let t;
                        for (let r of e) r.active && (!t || r.t > t.t) && (t = r);
                        return t?.id;
                    }, [e]);
                },
                'useActiveAnchors',
                0,
                function () {
                    let e = h();
                    return (0, o.useMemo)(() => {
                        let t = [];
                        for (let r of e) r.active && t.push(r.id);
                        return t;
                    }, [e]);
                },
                'useItems',
                0,
                h
            ],
            32137
        );
        var x = e.i(32137);
        let g = (0, o.createContext)([]);
        function v() {
            return (0, o.use)(g);
        }
        let { useActiveAnchor: b, useActiveAnchors: y, useItems: w } = x;
        function j({ toc: e, children: t, ...r }) {
            return (0, a.jsx)(g, { value: e, children: (0, a.jsx)(x.AnchorProvider, { toc: e, ...r, children: t }) });
        }
        function C({ ref: e, className: t, ...r }) {
            let s = (0, o.useRef)(null);
            return (0, a.jsx)('div', {
                ref: (0, i.mergeRefs)(s, e),
                className: (0, n.cn)(
                    'relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3',
                    t
                ),
                ...r,
                children: (0, a.jsx)(x.ScrollProvider, { containerRef: s, children: r.children })
            });
        }
        function k({ containerRef: e, ...t }) {
            let r = (0, o.useRef)(null),
                n = y();
            function s(t) {
                let n = r.current,
                    s = e.current;
                n && s && (n.style.setProperty('--fd-top', `${t.top}px`), n.style.setProperty('--fd-height', `${t.height}px`));
            }
            function i(t) {
                let r = e.current;
                if (!r || 0 === r.clientHeight) return null;
                if (0 === t.length) return { height: 0, top: 0 };
                let n = Number.MAX_VALUE,
                    s = 0;
                for (let e of t) {
                    let t = r.querySelector(`a[href="#${e}"]`);
                    if (!t) continue;
                    let i = getComputedStyle(t);
                    ((n = Math.min(n, t.offsetTop + parseFloat(i.paddingTop))),
                        (s = Math.max(s, t.offsetTop + t.clientHeight - parseFloat(i.paddingBottom))));
                }
                return { top: n, height: s - n };
            }
            let c = (0, o.useEffectEvent)(() => {
                let e = i(n);
                e && s(e);
            });
            return (
                (0, o.useEffect)(() => {
                    if (!e.current) return;
                    let t = e.current,
                        r = new ResizeObserver(c);
                    return (
                        r.observe(t),
                        () => {
                            r.disconnect();
                        }
                    );
                }, [e]),
                (0, l.useOnChange)(n, () => {
                    let e = i(n);
                    e && s(e);
                }),
                (0, a.jsx)('div', { ref: r, 'data-hidden': 0 === n.length, ...t })
            );
        }
        var N = (0, t.__exportAll)({ TOCEmpty: () => M, TOCItem: () => I, TOCItems: () => T });
        function T({ ref: e, className: t, ...r }) {
            let s = (0, o.useRef)(null);
            return (0, a.jsxs)('div', {
                className: 'relative',
                children: [
                    (0, a.jsx)(k, {
                        containerRef: s,
                        className: 'absolute inset-y-0 inset-s-0 bg-fd-primary w-px transition-[clip-path]',
                        style: {
                            clipPath:
                                'polygon(0 var(--fd-top), 100% var(--fd-top), 100% calc(var(--fd-top) + var(--fd-height)), 0 calc(var(--fd-top) + var(--fd-height)))'
                        }
                    }),
                    (0, a.jsx)('div', {
                        ref: (0, i.mergeRefs)(e, s),
                        className: (0, n.cn)('flex flex-col border-s border-fd-foreground/10', t),
                        ...r
                    })
                ]
            });
        }
        function M() {
            let { text: e } = (0, r.useI18n)();
            return (0, a.jsx)('div', {
                className: 'rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground',
                children: e.tocNoHeadings
            });
        }
        function I({ item: e, ...t }) {
            return (0, a.jsx)(f, {
                href: e.url,
                ...t,
                className: (0, n.cn)(
                    'prose py-1.5 text-sm text-fd-muted-foreground scroll-m-4 transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary hover:text-fd-accent-foreground',
                    e.depth <= 2 && 'ps-3',
                    3 === e.depth && 'ps-6',
                    e.depth >= 4 && 'ps-8',
                    t.className
                ),
                children: e.title
            });
        }
        var R = (0, t.__exportAll)({ TOCEmpty: () => S, TOCItem: () => L, TOCItems: () => A });
        function A({ ref: e, className: t, ...r }) {
            let s = (0, o.useRef)(null),
                l = v(),
                [c, u] = (0, o.useState)(),
                d = (0, o.useEffectEvent)(() => {
                    let e = s.current;
                    if (!e || 0 === e.clientHeight) return;
                    let t = 0,
                        r = 0,
                        n = 0,
                        i = 0,
                        o = '',
                        c = [];
                    for (let s = 0; s < l.length; s++) {
                        let u = l[s],
                            d = e.querySelector(`a[href="#${u.url.slice(1)}"]`);
                        if (!d) continue;
                        let f = getComputedStyle(d),
                            h = P(u.depth) + 0.5,
                            p = d.offsetTop + parseFloat(f.paddingTop),
                            m = d.offsetTop + d.clientHeight - parseFloat(f.paddingBottom);
                        ((t = Math.max(h + 8, t)),
                            (r = Math.max(r, m)),
                            0 === s ? (o += ` M${h} ${p} L${h} ${m}`) : (o += ` C ${i} ${p - 4} ${h} ${n + 4} ${h} ${p} L${h} ${m}`),
                            void 0 !== u._step &&
                                c.push(
                                    (0, a.jsx)('circle', { cx: h, cy: (p + m) / 2, r: '8', className: 'fill-fd-primary' }, `${s}-circle`),
                                    (0, a.jsx)(
                                        'text',
                                        {
                                            x: h,
                                            y: (p + m) / 2,
                                            textAnchor: 'middle',
                                            alignmentBaseline: 'central',
                                            dominantBaseline: 'middle',
                                            className: 'fill-fd-primary-foreground font-medium text-xs leading-none font-mono',
                                            children: u._step
                                        },
                                        `${s}-text`
                                    )
                                ),
                            (i = h),
                            (n = m));
                    }
                    (c.unshift((0, a.jsx)('path', { d: o, className: 'stroke-fd-primary', strokeWidth: '1', fill: 'none' }, 'path')),
                        u({ content: c, width: t, height: r }));
                });
            return (
                (0, o.useEffect)(() => {
                    if (!s.current) return;
                    let e = new ResizeObserver(d);
                    return (
                        d(),
                        e.observe(s.current),
                        () => {
                            e.disconnect();
                        }
                    );
                }, []),
                (0, a.jsxs)(a.Fragment, {
                    children: [
                        c &&
                            (0, a.jsxs)(k, {
                                containerRef: s,
                                className: 'absolute top-0 inset-s-0',
                                style: { width: c.width, height: c.height },
                                children: [
                                    (0, a.jsx)('svg', {
                                        xmlns: 'http://www.w3.org/2000/svg',
                                        viewBox: `0 0 ${c.width} ${c.height}`,
                                        className: 'absolute transition-[clip-path]',
                                        style: {
                                            width: c.width,
                                            height: c.height,
                                            clipPath:
                                                'polygon(0 var(--fd-top), 100% var(--fd-top), 100% calc(var(--fd-top) + var(--fd-height)), 0 calc(var(--fd-top) + var(--fd-height)))'
                                        },
                                        children: c.content
                                    }),
                                    (0, a.jsx)(E, {})
                                ]
                            }),
                        (0, a.jsx)('div', { ref: (0, i.mergeRefs)(s, e), className: (0, n.cn)('flex flex-col', t), ...r })
                    ]
                })
            );
        }
        function S() {
            let { text: e } = (0, r.useI18n)();
            return (0, a.jsx)('div', {
                className: 'rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground',
                children: e.tocNoHeadings
            });
        }
        function E() {
            let e = h(),
                t = (0, o.useRef)(null),
                r = e.findIndex(e => e.active),
                n = e.findLastIndex(e => e.active);
            if (-1 === r) return;
            let s = !1;
            if (t.current) {
                let e = t.current;
                s = e.startIdx > r || e.endIdx > n || (e.startIdx === r && e.endIdx === n && e.isUp);
            }
            t.current = { startIdx: r, endIdx: n, isUp: s };
            let i = e[s ? r : n].original;
            return (0, a.jsx)('div', {
                className: 'absolute size-1 bg-fd-primary rounded-full transition-transform',
                style: {
                    translate: `${P(i.depth) - 1.5}px calc(${s ? 'var(--fd-top)' : 'var(--fd-top) + var(--fd-height)'} - 1.5px)`,
                    scale: void 0 !== i._step ? '0' : '1'
                }
            });
        }
        function P(e) {
            return e <= 2 ? 8 : 3 === e ? 16 : 24;
        }
        function L({ item: e, ...t }) {
            var r;
            let s = v(),
                {
                    lowerOffset: i,
                    offset: l,
                    upperOffset: c
                } = (0, o.useMemo)(() => {
                    let t = s.indexOf(e),
                        r = P(e.depth);
                    return { offset: r, upperOffset: t > 0 ? P(s[t - 1].depth) : r, lowerOffset: t + 1 < s.length ? P(s[t + 1].depth) : r };
                }, [s, e]);
            return (0, a.jsxs)(f, {
                href: e.url,
                ...t,
                className: (0, n.cn)(
                    'group prose relative py-1.5 text-sm scroll-m-4 text-fd-muted-foreground hover:text-fd-accent-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 data-[active=true]:text-fd-primary',
                    t.className
                ),
                style: { paddingInlineStart: (r = e.depth) <= 2 ? 20 : 3 === r ? 32 : 44, ...t.style },
                children: [
                    l !== c &&
                        (0, a.jsx)('svg', {
                            xmlns: 'http://www.w3.org/2000/svg',
                            viewBox: `${Math.min(l, c)} 0 ${Math.abs(c - l)} 12`,
                            className: 'absolute -top-1.5 -z-1',
                            style: { width: Math.abs(c - l) + 1, height: 12, insetInlineStart: Math.min(l, c) },
                            children: (0, a.jsx)('path', {
                                d: `M ${c} 0 C ${c} 8 ${l} 4 ${l} 12`,
                                stroke: 'black',
                                strokeWidth: '1',
                                fill: 'none',
                                className: 'stroke-fd-foreground/10'
                            })
                        }),
                    (0, a.jsx)('div', {
                        className: (0, n.cn)(
                            'absolute inset-y-0 w-px bg-fd-foreground/10 -z-1',
                            l !== c && 'top-1.5',
                            l !== i && 'bottom-1.5'
                        ),
                        style: { insetInlineStart: l }
                    }),
                    void 0 !== e._step &&
                        (0, a.jsx)('div', {
                            className:
                                'absolute flex items-center justify-center -translate-1/2 -z-1 top-[calc(50%-var(--t,0px)+var(--b,0px))] size-4 font-mono font-medium text-xs bg-fd-muted text-fd-muted-foreground rounded-full leading-none group-first:[--t:--spacing(0.75)] group-last:[--b:--spacing(0.75)]',
                            style: { insetInlineStart: l },
                            children: e._step
                        }),
                    e.title
                ]
            });
        }
        var z = e.i(86331),
            O = e.i(21185),
            D = e.i(44675);
        e.i(61377);
        var $ = e.i(82479),
            B = e.i(54864);
        let _ = (0, B.default)('text-align-start', [
            ['path', { d: 'M21 5H3', key: '1fi0y6' }],
            ['path', { d: 'M15 12H3', key: '6jk70r' }],
            ['path', { d: 'M17 19H3', key: 'z6ezky' }]
        ]);
        function F(e) {
            return (0, a.jsx)(j, { ...e });
        }
        function H({ container: e, header: t, footer: s, style: i = 'normal' }) {
            let o = v(),
                { TOCItems: l, TOCEmpty: c, TOCItem: u } = 'clerk' === i ? R : N;
            return (0, a.jsxs)('div', {
                id: 'nd-toc',
                ...e,
                className: (0, n.cn)(
                    'sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex flex-col [grid-area:toc] w-(--fd-toc-width) pt-12 pe-4 pb-2 max-xl:hidden',
                    e?.className
                ),
                children: [
                    t,
                    (0, a.jsxs)('h3', {
                        id: 'toc-title',
                        className: 'inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground',
                        children: [(0, a.jsx)(_, { className: 'size-4' }), (0, a.jsx)(r.I18nLabel, { label: 'toc' })]
                    }),
                    (0, a.jsx)(C, {
                        children: (0, a.jsxs)(l, {
                            children: [0 === o.length && (0, a.jsx)(c, {}), o.map(e => (0, a.jsx)(u, { item: e }, e.url))]
                        })
                    }),
                    s
                ]
            });
        }
        let V = (0, o.createContext)(null);
        function U({ container: e, trigger: t, content: r, header: s, footer: i, style: l = 'normal' }) {
            let c = v(),
                u = (0, o.useRef)(null),
                [d, f] = (0, o.useState)(!1),
                { isNavTransparent: h } = (0, D.useDocsLayout)(),
                { TOCItems: p, TOCItem: m, TOCEmpty: x } = 'clerk' === l ? R : N,
                g = (0, o.useEffectEvent)(e => {
                    d && e.target instanceof HTMLElement && u.current && !u.current.contains(e.target) && f(!1);
                }),
                b = () => {
                    f(!1);
                };
            return (
                (0, o.useEffect)(
                    () => (
                        window.addEventListener('click', g),
                        () => {
                            window.removeEventListener('click', g);
                        }
                    ),
                    []
                ),
                (0, a.jsx)(V, {
                    value: (0, o.useMemo)(() => ({ open: d, setOpen: f }), [f, d]),
                    children: (0, a.jsx)(O.Collapsible, {
                        open: d,
                        onOpenChange: f,
                        'data-toc-popover': '',
                        ...e,
                        className: (0, n.cn)(
                            'sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]',
                            e?.className
                        ),
                        children: (0, a.jsxs)('header', {
                            ref: u,
                            className: (0, n.cn)(
                                'border-b backdrop-blur-sm transition-colors',
                                (!h || d) && 'bg-fd-background/80',
                                d && 'shadow-lg'
                            ),
                            children: [
                                (0, a.jsx)(W, { ...t }),
                                (0, a.jsxs)(K, {
                                    ...r,
                                    children: [
                                        s,
                                        (0, a.jsx)(C, {
                                            children: (0, a.jsxs)(p, {
                                                children: [
                                                    0 === c.length && (0, a.jsx)(x, {}),
                                                    c.map(e => (0, a.jsx)(m, { item: e, onClick: b }, e.url))
                                                ]
                                            })
                                        }),
                                        i
                                    ]
                                })
                            ]
                        })
                    })
                })
            );
        }
        function W({ className: e, ...t }) {
            let { text: s } = (0, r.useI18n)(),
                { open: i } = (0, o.use)(V),
                l = w(),
                c = l.findIndex(e => e.active),
                u = (0, z.useTreePath)().at(-1),
                d = -1 !== c && !i;
            return (0, a.jsxs)(O.CollapsibleTrigger, {
                className: (0, n.cn)(
                    'flex w-full h-10 items-center text-sm text-fd-muted-foreground gap-2.5 px-4 py-2.5 text-start focus-visible:outline-none [&_svg]:size-4 md:px-6',
                    e
                ),
                'data-toc-popover-trigger': '',
                ...t,
                children: [
                    (0, a.jsx)(G, {
                        value: (c + 1) / Math.max(1, l.length),
                        max: 1,
                        className: (0, n.cn)('shrink-0', i && 'text-fd-primary')
                    }),
                    (0, a.jsxs)('span', {
                        className: 'grid flex-1 *:my-auto *:row-start-1 *:col-start-1',
                        children: [
                            (0, a.jsx)('span', {
                                className: (0, n.cn)(
                                    'truncate transition-[opacity,translate,color]',
                                    i && 'text-fd-foreground',
                                    d && 'opacity-0 -translate-y-full pointer-events-none'
                                ),
                                children: u?.name ?? s.toc
                            }),
                            (0, a.jsx)('span', {
                                className: (0, n.cn)(
                                    'truncate transition-[opacity,translate]',
                                    !d && 'opacity-0 translate-y-full pointer-events-none'
                                ),
                                children: l[c]?.original.title
                            })
                        ]
                    }),
                    (0, a.jsx)($.ChevronDown, { className: (0, n.cn)('shrink-0 transition-transform mx-0.5', i && 'rotate-180') })
                ]
            });
        }
        function G({ value: e, strokeWidth: t = 2, size: r = 24, min: n = 0, max: s = 100, ...i }) {
            let o = e < n ? n : e > s ? s : e,
                l = (r - t) / 2,
                c = 2 * Math.PI * l,
                u = (o / s) * c,
                d = { cx: r / 2, cy: r / 2, r: l, fill: 'none', strokeWidth: t };
            return (0, a.jsxs)('svg', {
                role: 'progressbar',
                viewBox: `0 0 ${r} ${r}`,
                'aria-valuenow': o,
                'aria-valuemin': n,
                'aria-valuemax': s,
                ...i,
                children: [
                    (0, a.jsx)('circle', { ...d, className: 'stroke-current/25' }),
                    (0, a.jsx)('circle', {
                        ...d,
                        stroke: 'currentColor',
                        strokeDasharray: c,
                        strokeDashoffset: c - u,
                        strokeLinecap: 'round',
                        transform: `rotate(-90 ${r / 2} ${r / 2})`,
                        className: 'transition-all'
                    })
                ]
            });
        }
        function K(e) {
            return (0, a.jsx)(O.CollapsibleContent, {
                'data-toc-popover-content': '',
                ...e,
                children: (0, a.jsx)('div', { className: 'flex flex-col px-4 max-h-[50vh] md:px-6', children: e.children })
            });
        }
        var Z = e.i(50453);
        let q = new WeakMap();
        var X = e.i(89775),
            Y = e.i(539);
        let J = (0, B.default)('chevron-left', [['path', { d: 'm15 18-6-6 6-6', key: '1wnfg3' }]]);
        var Q = e.i(1789);
        function ee({ items: e, children: t, className: r, ...s }) {
            let i = (function () {
                    let { root: e } = (0, z.useTreeContext)(),
                        t = q.get(e);
                    if (t) return t;
                    let r = [];
                    for (let t of e.children)
                        !(function e(t) {
                            if ('folder' === t.type) for (let r of (t.index && e(t.index), t.children)) e(r);
                            else 'page' !== t.type || t.external || r.push(t);
                        })(t);
                    return (q.set(e, r), r);
                })(),
                l = (0, X.usePathname)(),
                { previous: c, next: u } = (0, o.useMemo)(() => {
                    if (e) return e;
                    let t = i.findIndex(e => (0, Z.isActive)(e.url, l));
                    return -1 === t ? {} : { previous: i[t - 1], next: i[t + 1] };
                }, [i, e, l]);
            return (0, a.jsxs)(a.Fragment, {
                children: [
                    (0, a.jsxs)('div', {
                        className: (0, n.cn)('@container grid gap-4', c && u ? 'grid-cols-2' : 'grid-cols-1', r),
                        ...s,
                        children: [c && (0, a.jsx)(et, { item: c, index: 0 }), u && (0, a.jsx)(et, { item: u, index: 1 })]
                    }),
                    t
                ]
            });
        }
        function et({ item: e, index: t }) {
            let { text: s } = (0, r.useI18n)(),
                i = 0 === t ? J : Q.ChevronRight;
            return (0, a.jsxs)(Y.default, {
                href: e.url,
                className: (0, n.cn)(
                    'flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground @max-lg:col-span-full',
                    1 === t && 'text-end'
                ),
                children: [
                    (0, a.jsxs)('div', {
                        className: (0, n.cn)('inline-flex items-center gap-1.5 font-medium', 1 === t && 'flex-row-reverse'),
                        children: [
                            (0, a.jsx)(i, { className: '-mx-1 size-4 shrink-0 rtl:rotate-180' }),
                            (0, a.jsx)('p', { children: e.name })
                        ]
                    }),
                    (0, a.jsx)('p', {
                        className: 'text-fd-muted-foreground truncate',
                        children: e.description ?? (0 === t ? s.previousPage : s.nextPage)
                    })
                ]
            });
        }
        var er = e.i(78964);
        function en({ includeRoot: e, includeSeparator: t, includePage: r, ...s }) {
            let i = (0, z.useTreePath)(),
                { root: l } = (0, z.useTreeContext)(),
                c = (0, o.useMemo)(
                    () => (0, er.getBreadcrumbItemsFromPath)(l, i, { includePage: r, includeSeparator: t, includeRoot: e }),
                    [r, e, t, i, l]
                );
            return 0 === c.length
                ? null
                : (0, a.jsx)('div', {
                      ...s,
                      className: (0, n.cn)('flex items-center gap-1.5 text-sm text-fd-muted-foreground', s.className),
                      children: c.map((e, t) => {
                          let r = (0, n.cn)('truncate', t === c.length - 1 && 'text-fd-primary font-medium');
                          return (0, a.jsxs)(
                              o.Fragment,
                              {
                                  children: [
                                      0 !== t && (0, a.jsx)(Q.ChevronRight, { className: 'size-3.5 shrink-0' }),
                                      e.url
                                          ? (0, a.jsx)(Y.default, {
                                                href: e.url,
                                                className: (0, n.cn)(r, 'transition-opacity hover:opacity-80'),
                                                children: e.name
                                            })
                                          : (0, a.jsx)('span', { className: r, children: e.name })
                                  ]
                              },
                              t
                          );
                      })
                  });
        }
        function es(e) {
            let {
                props: { full: t }
            } = ex();
            return (0, a.jsx)('article', {
                id: 'nd-page',
                'data-full': t,
                ...e,
                className: (0, n.cn)(
                    'flex flex-col w-full max-w-[900px] mx-auto [grid-area:main] px-4 py-6 gap-4 md:px-6 md:pt-8 xl:px-8 xl:pt-14',
                    t ? 'max-w-[1168px]' : 'xl:layout:[--fd-toc-width:268px]',
                    e.className
                ),
                children: e.children
            });
        }
        var ei = e.i(45765),
            eo = e.i(64378),
            ea = e.i(85149);
        let el = (0, B.default)('copy', [
            ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2', key: '17jyea' }],
            ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2', key: 'zix9uf' }]
        ]);
        var ec = e.i(15371),
            ec = ec;
        let eu = new Map();
        function ed({ markdownUrl: e, ...t }) {
            let [r, i] = (0, o.useState)(!1),
                [l, c] = (0, ei.useCopyButton)(async () => {
                    let t = eu.get(e);
                    if (t) return navigator.clipboard.writeText(await t);
                    i(!0);
                    try {
                        let t = fetch(e).then(e => e.text());
                        (eu.set(e, t), await navigator.clipboard.write([new ClipboardItem({ 'text/plain': t })]));
                    } finally {
                        i(!1);
                    }
                });
            return (0, a.jsxs)('button', {
                disabled: r,
                onClick: c,
                ...t,
                className: (0, n.cn)(
                    (0, s.buttonVariants)({
                        color: 'secondary',
                        size: 'sm',
                        className: 'gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground'
                    }),
                    t.className
                ),
                children: [l ? (0, a.jsx)(ea.Check, {}) : (0, a.jsx)(el, {}), t.children ?? 'Copy Markdown']
            });
        }
        function ef({ markdownUrl: e, githubUrl: t, ...r }) {
            let i = (0, X.usePathname)(),
                l = (0, o.useMemo)(() => {
                    let r = `Read ${'u' < typeof window ? i : new URL(i, window.location.origin)}, I want to ask questions about it.`;
                    return [
                        t && {
                            title: 'Open in GitHub',
                            href: t,
                            icon: (0, a.jsxs)('svg', {
                                fill: 'currentColor',
                                role: 'img',
                                viewBox: '0 0 24 24',
                                children: [
                                    (0, a.jsx)('title', { children: 'GitHub' }),
                                    (0, a.jsx)('path', {
                                        d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
                                    })
                                ]
                            })
                        },
                        e && { title: 'View as Markdown', href: e, icon: (0, a.jsx)(_, {}) },
                        {
                            title: 'Open in Scira AI',
                            href: `https://scira.ai/?${new URLSearchParams({ q: r })}`,
                            icon: (0, a.jsxs)('svg', {
                                width: '910',
                                height: '934',
                                viewBox: '0 0 910 934',
                                fill: 'none',
                                xmlns: 'http://www.w3.org/2000/svg',
                                children: [
                                    (0, a.jsx)('title', { children: 'Scira AI' }),
                                    (0, a.jsx)('path', {
                                        d: 'M647.664 197.775C569.13 189.049 525.5 145.419 516.774 66.8849C508.048 145.419 464.418 189.049 385.884 197.775C464.418 206.501 508.048 250.131 516.774 328.665C525.5 250.131 569.13 206.501 647.664 197.775Z',
                                        fill: 'currentColor',
                                        stroke: 'currentColor',
                                        strokeWidth: '8',
                                        strokeLinejoin: 'round'
                                    }),
                                    (0, a.jsx)('path', {
                                        d: 'M516.774 304.217C510.299 275.491 498.208 252.087 480.335 234.214C462.462 216.341 439.058 204.251 410.333 197.775C439.059 191.3 462.462 179.209 480.335 161.336C498.208 143.463 510.299 120.06 516.774 91.334C523.25 120.059 535.34 143.463 553.213 161.336C571.086 179.209 594.49 191.3 623.216 197.775C594.49 204.251 571.086 216.341 553.213 234.214C535.34 252.087 523.25 275.491 516.774 304.217Z',
                                        fill: 'currentColor',
                                        stroke: 'currentColor',
                                        strokeWidth: '8',
                                        strokeLinejoin: 'round'
                                    }),
                                    (0, a.jsx)('path', {
                                        d: 'M857.5 508.116C763.259 497.644 710.903 445.288 700.432 351.047C689.961 445.288 637.605 497.644 543.364 508.116C637.605 518.587 689.961 570.943 700.432 665.184C710.903 570.943 763.259 518.587 857.5 508.116Z',
                                        stroke: 'currentColor',
                                        strokeWidth: '20',
                                        strokeLinejoin: 'round'
                                    }),
                                    (0, a.jsx)('path', {
                                        d: 'M700.432 615.957C691.848 589.05 678.575 566.357 660.383 548.165C642.191 529.973 619.499 516.7 592.593 508.116C619.499 499.533 642.191 486.258 660.383 468.066C678.575 449.874 691.848 427.181 700.432 400.274C709.015 427.181 722.289 449.874 740.481 468.066C758.673 486.258 781.365 499.533 808.271 508.116C781.365 516.7 758.673 529.973 740.481 548.165C722.289 566.357 709.015 589.05 700.432 615.957Z',
                                        stroke: 'currentColor',
                                        strokeWidth: '20',
                                        strokeLinejoin: 'round'
                                    }),
                                    (0, a.jsx)('path', {
                                        d: 'M889.949 121.237C831.049 114.692 798.326 81.9698 791.782 23.0692C785.237 81.9698 752.515 114.692 693.614 121.237C752.515 127.781 785.237 160.504 791.782 219.404C798.326 160.504 831.049 127.781 889.949 121.237Z',
                                        fill: 'currentColor',
                                        stroke: 'currentColor',
                                        strokeWidth: '8',
                                        strokeLinejoin: 'round'
                                    }),
                                    (0, a.jsx)('path', {
                                        d: 'M791.782 196.795C786.697 176.937 777.869 160.567 765.16 147.858C752.452 135.15 736.082 126.322 716.226 121.237C736.082 116.152 752.452 107.324 765.16 94.6152C777.869 81.9065 786.697 65.5368 791.782 45.6797C796.867 65.5367 805.695 81.9066 818.403 94.6152C831.112 107.324 847.481 116.152 867.338 121.237C847.481 126.322 831.112 135.15 818.403 147.858C805.694 160.567 796.867 176.937 791.782 196.795Z',
                                        fill: 'currentColor',
                                        stroke: 'currentColor',
                                        strokeWidth: '8',
                                        strokeLinejoin: 'round'
                                    }),
                                    (0, a.jsx)('path', {
                                        d: 'M760.632 764.337C720.719 814.616 669.835 855.1 611.872 882.692C553.91 910.285 490.404 924.255 426.213 923.533C362.022 922.812 298.846 907.419 241.518 878.531C184.19 849.643 134.228 808.026 95.4548 756.863C56.6815 705.7 30.1238 646.346 17.8129 583.343C5.50207 520.339 7.76433 455.354 24.4266 393.359C41.089 331.364 71.7099 274.001 113.947 225.658C156.184 177.315 208.919 139.273 268.117 114.442',
                                        stroke: 'currentColor',
                                        strokeWidth: '30',
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round'
                                    })
                                ]
                            })
                        },
                        {
                            title: 'Open in ChatGPT',
                            href: `https://chatgpt.com/?${new URLSearchParams({ hints: 'search', q: r })}`,
                            icon: (0, a.jsxs)('svg', {
                                role: 'img',
                                viewBox: '0 0 24 24',
                                fill: 'currentColor',
                                xmlns: 'http://www.w3.org/2000/svg',
                                children: [
                                    (0, a.jsx)('title', { children: 'OpenAI' }),
                                    (0, a.jsx)('path', {
                                        d: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z'
                                    })
                                ]
                            })
                        },
                        {
                            title: 'Open in Claude',
                            href: `https://claude.ai/new?${new URLSearchParams({ q: r })}`,
                            icon: (0, a.jsxs)('svg', {
                                fill: 'currentColor',
                                role: 'img',
                                viewBox: '0 0 24 24',
                                xmlns: 'http://www.w3.org/2000/svg',
                                children: [
                                    (0, a.jsx)('title', { children: 'Anthropic' }),
                                    (0, a.jsx)('path', {
                                        d: 'M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z'
                                    })
                                ]
                            })
                        },
                        {
                            title: 'Open in Cursor',
                            icon: (0, a.jsxs)('svg', {
                                fill: 'currentColor',
                                role: 'img',
                                viewBox: '0 0 24 24',
                                xmlns: 'http://www.w3.org/2000/svg',
                                children: [
                                    (0, a.jsx)('title', { children: 'Cursor' }),
                                    (0, a.jsx)('path', {
                                        d: 'M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23'
                                    })
                                ]
                            }),
                            href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: r })}`
                        }
                    ].filter(e => !!e);
                }, [t, e, i]);
            return (0, a.jsxs)(eo.Popover, {
                children: [
                    (0, a.jsxs)(eo.PopoverTrigger, {
                        ...r,
                        className: (0, n.cn)(
                            (0, s.buttonVariants)({ color: 'secondary', size: 'sm' }),
                            'gap-2 data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground',
                            r.className
                        ),
                        children: [r.children ?? 'Open', (0, a.jsx)($.ChevronDown, { className: 'size-3.5 text-fd-muted-foreground' })]
                    }),
                    (0, a.jsx)(eo.PopoverContent, {
                        className: 'flex flex-col',
                        children: l.map(e =>
                            (0, a.jsxs)(
                                'a',
                                {
                                    href: e.href,
                                    rel: 'noreferrer noopener',
                                    target: '_blank',
                                    className:
                                        'text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-fd-accent-foreground hover:bg-fd-accent [&_svg]:size-4',
                                    children: [
                                        e.icon,
                                        e.title,
                                        (0, a.jsx)(ec.default, { className: 'text-fd-muted-foreground size-3.5 ms-auto' })
                                    ]
                                },
                                e.href
                            )
                        )
                    })
                ]
            });
        }
        let eh = (0, B.default)('square-pen', [
            ['path', { d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', key: '1m0v6g' }],
            [
                'path',
                {
                    d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
                    key: 'ohrbg2'
                }
            ]
        ]);
        var ep = (0, t.__exportAll)({
            DocsBody: () => eb,
            DocsDescription: () => ey,
            DocsPage: () => eg,
            DocsTitle: () => ew,
            EditOnGitHub: () => ev,
            MarkdownCopyButton: () => ed,
            PageBreadcrumb: () => en,
            PageFooter: () => ee,
            PageLastUpdate: () => ej,
            ViewOptionsPopover: () => ef,
            useDocsPage: () => ex
        });
        let em = (0, o.createContext)(null);
        function ex() {
            let e = (0, o.use)(em);
            if (!e) throw Error('Please use page components under <DocsPage /> (`fumadocs-ui/layouts/docs/page`).');
            return e;
        }
        function eg({
            tableOfContent: { enabled: e, single: t, ...r } = {},
            tableOfContentPopover: { enabled: n, ...s } = {},
            breadcrumb: { enabled: i = !0, ...o } = {},
            footer: { enabled: l = !0, ...c } = {},
            full: u = !1,
            toc: d = [],
            slots: f = {},
            children: h,
            ...p
        }) {
            ((e ??= !!(!u && (d.length > 0 || r.footer || r.header))), (n ??= !!(d.length > 0 || s.header || s.footer)));
            let m = {
                breadcrumb: f.breadcrumb ?? en,
                footer: f.footer ?? ee,
                toc: f.toc ?? { provider: F, main: H, popover: U },
                container: f.container ?? es
            };
            return (0, a.jsx)(em, {
                value: { props: { full: u }, slots: m },
                children: (0, a.jsxs)(m.toc.provider, {
                    single: t,
                    toc: e || n ? d : [],
                    children: [
                        n && (s.component ?? (0, a.jsx)(m.toc.popover, { ...s })),
                        (0, a.jsxs)(m.container, {
                            ...p,
                            children: [
                                i && (o.component ?? (0, a.jsx)(m.breadcrumb, { ...o })),
                                h,
                                l && (c.component ?? (0, a.jsx)(m.footer, { ...c }))
                            ]
                        }),
                        e && (r.component ?? (0, a.jsx)(m.toc.main, { ...r }))
                    ]
                })
            });
        }
        function ev(e) {
            return (0, a.jsx)('a', {
                target: '_blank',
                rel: 'noreferrer noopener',
                ...e,
                className: (0, n.cn)((0, s.buttonVariants)({ color: 'secondary', size: 'sm' }), 'gap-1.5 not-prose', e.className),
                children:
                    e.children ??
                    (0, a.jsxs)(a.Fragment, {
                        children: [(0, a.jsx)(eh, { className: 'size-3.5' }), (0, a.jsx)(r.I18nLabel, { label: 'editOnGithub' })]
                    })
            });
        }
        function eb({ children: e, className: t, ...r }) {
            return (0, a.jsx)('div', { ...r, className: (0, n.cn)('prose flex-1', t), children: e });
        }
        function ey({ children: e, className: t, ...r }) {
            return void 0 === e
                ? null
                : (0, a.jsx)('p', { ...r, className: (0, n.cn)('mb-8 text-lg text-fd-muted-foreground', t), children: e });
        }
        function ew({ children: e, className: t, ...r }) {
            return (0, a.jsx)('h1', { ...r, className: (0, n.cn)('text-[1.75em] font-semibold', t), children: e });
        }
        function ej({ date: e, ...t }) {
            let { text: s } = (0, r.useI18n)(),
                [i, l] = (0, o.useState)('');
            return (
                (0, o.useEffect)(() => {
                    l(e.toLocaleDateString());
                }, [e]),
                (0, a.jsxs)('p', {
                    ...t,
                    className: (0, n.cn)('text-sm text-fd-muted-foreground', t.className),
                    children: [s.lastUpdate, ' ', i]
                })
            );
        }
        (e.i(19872),
            e.s(
                [
                    'DocsBody',
                    0,
                    eb,
                    'DocsDescription',
                    0,
                    ey,
                    'DocsPage',
                    0,
                    eg,
                    'DocsTitle',
                    0,
                    ew,
                    'EditOnGitHub',
                    0,
                    ev,
                    'MarkdownCopyButton',
                    0,
                    ed,
                    'PageBreadcrumb',
                    0,
                    en,
                    'PageFooter',
                    0,
                    ee,
                    'PageLastUpdate',
                    0,
                    ej,
                    'ViewOptionsPopover',
                    0,
                    ef,
                    'page_exports',
                    0,
                    ep,
                    'useDocsPage',
                    0,
                    ex
                ],
                4869
            ));
    },
    43151,
    e => {
        'use strict';
        var t = e.i(71331),
            r = e.i(35917),
            n = e.i(59954),
            s = e.i(91967),
            i = e.i(9413),
            o = e.i(22353),
            a = e.i(60310),
            l = new WeakMap();
        function c(e, t) {
            var r, n;
            let s, i, o;
            if ('at' in Array.prototype) return Array.prototype.at.call(e, t);
            let a = ((r = e), (n = t), (s = r.length), (o = (i = u(n)) >= 0 ? i : s + i) < 0 || o >= s ? -1 : o);
            return -1 === a ? void 0 : e[a];
        }
        function u(e) {
            return e != e || 0 === e ? 0 : Math.trunc(e);
        }
        (class e extends Map {
            #e;
            constructor(e) {
                (super(e), (this.#e = [...super.keys()]), l.set(this, !0));
            }
            set(e, t) {
                return (l.get(this) && (this.has(e) ? (this.#e[this.#e.indexOf(e)] = e) : this.#e.push(e)), super.set(e, t), this);
            }
            insert(e, t, r) {
                let n,
                    s = this.has(t),
                    i = this.#e.length,
                    o = u(e),
                    a = o >= 0 ? o : i + o,
                    l = a < 0 || a >= i ? -1 : a;
                if (l === this.size || (s && l === this.size - 1) || -1 === l) return (this.set(t, r), this);
                let c = this.size + +!s;
                o < 0 && a++;
                let d = [...this.#e],
                    f = !1;
                for (let e = a; e < c; e++)
                    if (a === e) {
                        let i = d[e];
                        (d[e] === t && (i = d[e + 1]), s && this.delete(t), (n = this.get(i)), this.set(t, r));
                    } else {
                        f || d[e - 1] !== t || (f = !0);
                        let r = d[f ? e : e - 1],
                            s = n;
                        ((n = this.get(r)), this.delete(r), this.set(r, s));
                    }
                return this;
            }
            with(t, r, n) {
                let s = new e(this);
                return (s.insert(t, r, n), s);
            }
            before(e) {
                let t = this.#e.indexOf(e) - 1;
                if (!(t < 0)) return this.entryAt(t);
            }
            setBefore(e, t, r) {
                let n = this.#e.indexOf(e);
                return -1 === n ? this : this.insert(n, t, r);
            }
            after(e) {
                let t = this.#e.indexOf(e);
                if (-1 !== (t = -1 === t || t === this.size - 1 ? -1 : t + 1)) return this.entryAt(t);
            }
            setAfter(e, t, r) {
                let n = this.#e.indexOf(e);
                return -1 === n ? this : this.insert(n + 1, t, r);
            }
            first() {
                return this.entryAt(0);
            }
            last() {
                return this.entryAt(-1);
            }
            clear() {
                return ((this.#e = []), super.clear());
            }
            delete(e) {
                let t = super.delete(e);
                return (t && this.#e.splice(this.#e.indexOf(e), 1), t);
            }
            deleteAt(e) {
                let t = this.keyAt(e);
                return void 0 !== t && this.delete(t);
            }
            at(e) {
                let t = c(this.#e, e);
                if (void 0 !== t) return this.get(t);
            }
            entryAt(e) {
                let t = c(this.#e, e);
                if (void 0 !== t) return [t, this.get(t)];
            }
            indexOf(e) {
                return this.#e.indexOf(e);
            }
            keyAt(e) {
                return c(this.#e, e);
            }
            from(e, t) {
                let r = this.indexOf(e);
                if (-1 === r) return;
                let n = r + t;
                return (n < 0 && (n = 0), n >= this.size && (n = this.size - 1), this.at(n));
            }
            keyFrom(e, t) {
                let r = this.indexOf(e);
                if (-1 === r) return;
                let n = r + t;
                return (n < 0 && (n = 0), n >= this.size && (n = this.size - 1), this.keyAt(n));
            }
            find(e, t) {
                let r = 0;
                for (let n of this) {
                    if (Reflect.apply(e, t, [n, r, this])) return n;
                    r++;
                }
            }
            findIndex(e, t) {
                let r = 0;
                for (let n of this) {
                    if (Reflect.apply(e, t, [n, r, this])) return r;
                    r++;
                }
                return -1;
            }
            filter(t, r) {
                let n = [],
                    s = 0;
                for (let e of this) (Reflect.apply(t, r, [e, s, this]) && n.push(e), s++);
                return new e(n);
            }
            map(t, r) {
                let n = [],
                    s = 0;
                for (let e of this) (n.push([e[0], Reflect.apply(t, r, [e, s, this])]), s++);
                return new e(n);
            }
            reduce(...e) {
                let [t, r] = e,
                    n = 0,
                    s = r ?? this.at(0);
                for (let r of this) ((s = 0 === n && 1 === e.length ? r : Reflect.apply(t, this, [s, r, n, this])), n++);
                return s;
            }
            reduceRight(...e) {
                let [t, r] = e,
                    n = r ?? this.at(-1);
                for (let r = this.size - 1; r >= 0; r--) {
                    let s = this.at(r);
                    n = r === this.size - 1 && 1 === e.length ? s : Reflect.apply(t, this, [n, s, r, this]);
                }
                return n;
            }
            toSorted(t) {
                return new e([...this.entries()].sort(t));
            }
            toReversed() {
                let t = new e();
                for (let e = this.size - 1; e >= 0; e--) {
                    let r = this.keyAt(e),
                        n = this.get(r);
                    t.set(r, n);
                }
                return t;
            }
            toSpliced(...t) {
                let r = [...this.entries()];
                return (r.splice(...t), new e(r));
            }
            slice(t, r) {
                let n = new e(),
                    s = this.size - 1;
                if (void 0 === t) return n;
                (t < 0 && (t += this.size), void 0 !== r && r > 0 && (s = r - 1));
                for (let e = t; e <= s; e++) {
                    let t = this.keyAt(e),
                        r = this.get(t);
                    n.set(t, r);
                }
                return n;
            }
            every(e, t) {
                let r = 0;
                for (let n of this) {
                    if (!Reflect.apply(e, t, [n, r, this])) return !1;
                    r++;
                }
                return !0;
            }
            some(e, t) {
                let r = 0;
                for (let n of this) {
                    if (Reflect.apply(e, t, [n, r, this])) return !0;
                    r++;
                }
                return !1;
            }
        });
        var d = e.i(11207),
            f = e.i(85565),
            h = e.i(88248),
            p = e.i(36567),
            m = e.i(75649),
            x = 'rovingFocusGroup.onEntryFocus',
            g = { bubbles: !1, cancelable: !0 },
            v = 'RovingFocusGroup',
            [b, y, w] = (function (e) {
                let t = e + 'CollectionProvider',
                    [s, l] = (0, i.createContextScope)(t),
                    [c, u] = s(t, { collectionRef: { current: null }, itemMap: new Map() }),
                    d = e => {
                        let { scope: t, children: s } = e,
                            i = r.default.useRef(null),
                            o = r.default.useRef(new Map()).current;
                        return (0, n.jsx)(c, { scope: t, itemMap: o, collectionRef: i, children: s });
                    };
                d.displayName = t;
                let f = e + 'CollectionSlot',
                    h = (0, a.createSlot)(f),
                    p = r.default.forwardRef((e, t) => {
                        let { scope: r, children: s } = e,
                            i = u(f, r),
                            a = (0, o.useComposedRefs)(t, i.collectionRef);
                        return (0, n.jsx)(h, { ref: a, children: s });
                    });
                p.displayName = f;
                let m = e + 'CollectionItemSlot',
                    x = 'data-radix-collection-item',
                    g = (0, a.createSlot)(m),
                    v = r.default.forwardRef((e, t) => {
                        let { scope: s, children: i, ...a } = e,
                            l = r.default.useRef(null),
                            c = (0, o.useComposedRefs)(t, l),
                            d = u(m, s);
                        return (
                            r.default.useEffect(() => (d.itemMap.set(l, { ref: l, ...a }), () => void d.itemMap.delete(l))),
                            (0, n.jsx)(g, { ...{ [x]: '' }, ref: c, children: i })
                        );
                    });
                return (
                    (v.displayName = m),
                    [
                        { Provider: d, Slot: p, ItemSlot: v },
                        function (t) {
                            let n = u(e + 'CollectionConsumer', t);
                            return r.default.useCallback(() => {
                                let e = n.collectionRef.current;
                                if (!e) return [];
                                let t = Array.from(e.querySelectorAll(`[${x}]`));
                                return Array.from(n.itemMap.values()).sort((e, r) => t.indexOf(e.ref.current) - t.indexOf(r.ref.current));
                            }, [n.collectionRef, n.itemMap]);
                        },
                        l
                    ]
                );
            })(v),
            [j, C] = (0, i.createContextScope)(v, [w]),
            [k, N] = j(v),
            T = r.forwardRef((e, t) =>
                (0, n.jsx)(b.Provider, {
                    scope: e.__scopeRovingFocusGroup,
                    children: (0, n.jsx)(b.Slot, { scope: e.__scopeRovingFocusGroup, children: (0, n.jsx)(M, { ...e, ref: t }) })
                })
            );
        T.displayName = v;
        var M = r.forwardRef((e, t) => {
                let {
                        __scopeRovingFocusGroup: i,
                        orientation: a,
                        loop: l = !1,
                        dir: c,
                        currentTabStopId: u,
                        defaultCurrentTabStopId: d,
                        onCurrentTabStopIdChange: b,
                        onEntryFocus: w,
                        preventScrollOnEntryFocus: j = !1,
                        ...C
                    } = e,
                    N = r.useRef(null),
                    T = (0, o.useComposedRefs)(t, N),
                    M = (0, m.useDirection)(c),
                    [I, R] = (0, p.useControllableState)({ prop: u, defaultProp: d ?? null, onChange: b, caller: v }),
                    [A, E] = r.useState(!1),
                    P = (0, h.useCallbackRef)(w),
                    L = y(i),
                    z = r.useRef(!1),
                    [O, D] = r.useState(0);
                return (
                    r.useEffect(() => {
                        let e = N.current;
                        if (e) return (e.addEventListener(x, P), () => e.removeEventListener(x, P));
                    }, [P]),
                    (0, n.jsx)(k, {
                        scope: i,
                        orientation: a,
                        dir: M,
                        loop: l,
                        currentTabStopId: I,
                        onItemFocus: r.useCallback(e => R(e), [R]),
                        onItemShiftTab: r.useCallback(() => E(!0), []),
                        onFocusableItemAdd: r.useCallback(() => D(e => e + 1), []),
                        onFocusableItemRemove: r.useCallback(() => D(e => e - 1), []),
                        children: (0, n.jsx)(f.Primitive.div, {
                            tabIndex: A || 0 === O ? -1 : 0,
                            'data-orientation': a,
                            ...C,
                            ref: T,
                            style: { outline: 'none', ...e.style },
                            onMouseDown: (0, s.composeEventHandlers)(e.onMouseDown, () => {
                                z.current = !0;
                            }),
                            onFocus: (0, s.composeEventHandlers)(e.onFocus, e => {
                                let t = !z.current;
                                if (e.target === e.currentTarget && t && !A) {
                                    let t = new CustomEvent(x, g);
                                    if ((e.currentTarget.dispatchEvent(t), !t.defaultPrevented)) {
                                        let e = L().filter(e => e.focusable);
                                        S(
                                            [e.find(e => e.active), e.find(e => e.id === I), ...e].filter(Boolean).map(e => e.ref.current),
                                            j
                                        );
                                    }
                                }
                                z.current = !1;
                            }),
                            onBlur: (0, s.composeEventHandlers)(e.onBlur, () => E(!1))
                        })
                    })
                );
            }),
            I = 'RovingFocusGroupItem',
            R = r.forwardRef((e, t) => {
                let { __scopeRovingFocusGroup: i, focusable: o = !0, active: a = !1, tabStopId: l, children: c, ...u } = e,
                    h = (0, d.useId)(),
                    p = l || h,
                    m = N(I, i),
                    x = m.currentTabStopId === p,
                    g = y(i),
                    { onFocusableItemAdd: v, onFocusableItemRemove: w, currentTabStopId: j } = m;
                return (
                    r.useEffect(() => {
                        if (o) return (v(), () => w());
                    }, [o, v, w]),
                    (0, n.jsx)(b.ItemSlot, {
                        scope: i,
                        id: p,
                        focusable: o,
                        active: a,
                        children: (0, n.jsx)(f.Primitive.span, {
                            tabIndex: x ? 0 : -1,
                            'data-orientation': m.orientation,
                            ...u,
                            ref: t,
                            onMouseDown: (0, s.composeEventHandlers)(e.onMouseDown, e => {
                                o ? m.onItemFocus(p) : e.preventDefault();
                            }),
                            onFocus: (0, s.composeEventHandlers)(e.onFocus, () => m.onItemFocus(p)),
                            onKeyDown: (0, s.composeEventHandlers)(e.onKeyDown, e => {
                                if ('Tab' === e.key && e.shiftKey) return void m.onItemShiftTab();
                                if (e.target !== e.currentTarget) return;
                                let t = (function (e, t, r) {
                                    var n;
                                    let s =
                                        ((n = e.key),
                                        'rtl' !== r ? n : 'ArrowLeft' === n ? 'ArrowRight' : 'ArrowRight' === n ? 'ArrowLeft' : n);
                                    if (
                                        !('vertical' === t && ['ArrowLeft', 'ArrowRight'].includes(s)) &&
                                        !('horizontal' === t && ['ArrowUp', 'ArrowDown'].includes(s))
                                    )
                                        return A[s];
                                })(e, m.orientation, m.dir);
                                if (void 0 !== t) {
                                    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
                                    e.preventDefault();
                                    let s = g()
                                        .filter(e => e.focusable)
                                        .map(e => e.ref.current);
                                    if ('last' === t) s.reverse();
                                    else if ('prev' === t || 'next' === t) {
                                        var r, n;
                                        'prev' === t && s.reverse();
                                        let i = s.indexOf(e.currentTarget);
                                        s = m.loop ? ((r = s), (n = i + 1), r.map((e, t) => r[(n + t) % r.length])) : s.slice(i + 1);
                                    }
                                    setTimeout(() => S(s));
                                }
                            }),
                            children: 'function' == typeof c ? c({ isCurrentTabStop: x, hasTabStop: null != j }) : c
                        })
                    })
                );
            });
        R.displayName = I;
        var A = {
            ArrowLeft: 'prev',
            ArrowUp: 'prev',
            ArrowRight: 'next',
            ArrowDown: 'next',
            PageUp: 'first',
            Home: 'first',
            PageDown: 'last',
            End: 'last'
        };
        function S(e, t = !1) {
            let r = document.activeElement;
            for (let n of e) if (n === r || (n.focus({ preventScroll: t }), document.activeElement !== r)) return;
        }
        var E = e.i(90816),
            P = 'Tabs',
            [L, z] = (0, i.createContextScope)(P, [C]),
            O = C(),
            [D, $] = L(P),
            B = r.forwardRef((e, t) => {
                let {
                        __scopeTabs: r,
                        value: s,
                        onValueChange: i,
                        defaultValue: o,
                        orientation: a = 'horizontal',
                        dir: l,
                        activationMode: c = 'automatic',
                        ...u
                    } = e,
                    h = (0, m.useDirection)(l),
                    [x, g] = (0, p.useControllableState)({ prop: s, onChange: i, defaultProp: o ?? '', caller: P });
                return (0, n.jsx)(D, {
                    scope: r,
                    baseId: (0, d.useId)(),
                    value: x,
                    onValueChange: g,
                    orientation: a,
                    dir: h,
                    activationMode: c,
                    children: (0, n.jsx)(f.Primitive.div, { dir: h, 'data-orientation': a, ...u, ref: t })
                });
            });
        B.displayName = P;
        var _ = 'TabsList',
            F = r.forwardRef((e, t) => {
                let { __scopeTabs: r, loop: s = !0, ...i } = e,
                    o = $(_, r),
                    a = O(r);
                return (0, n.jsx)(T, {
                    asChild: !0,
                    ...a,
                    orientation: o.orientation,
                    dir: o.dir,
                    loop: s,
                    children: (0, n.jsx)(f.Primitive.div, { role: 'tablist', 'aria-orientation': o.orientation, ...i, ref: t })
                });
            });
        F.displayName = _;
        var H = 'TabsTrigger',
            V = r.forwardRef((e, t) => {
                let { __scopeTabs: r, value: i, disabled: o = !1, ...a } = e,
                    l = $(H, r),
                    c = O(r),
                    u = G(l.baseId, i),
                    d = K(l.baseId, i),
                    h = i === l.value;
                return (0, n.jsx)(R, {
                    asChild: !0,
                    ...c,
                    focusable: !o,
                    active: h,
                    children: (0, n.jsx)(f.Primitive.button, {
                        type: 'button',
                        role: 'tab',
                        'aria-selected': h,
                        'aria-controls': d,
                        'data-state': h ? 'active' : 'inactive',
                        'data-disabled': o ? '' : void 0,
                        disabled: o,
                        id: u,
                        ...a,
                        ref: t,
                        onMouseDown: (0, s.composeEventHandlers)(e.onMouseDown, e => {
                            o || 0 !== e.button || !1 !== e.ctrlKey ? e.preventDefault() : l.onValueChange(i);
                        }),
                        onKeyDown: (0, s.composeEventHandlers)(e.onKeyDown, e => {
                            [' ', 'Enter'].includes(e.key) && l.onValueChange(i);
                        }),
                        onFocus: (0, s.composeEventHandlers)(e.onFocus, () => {
                            let e = 'manual' !== l.activationMode;
                            h || o || !e || l.onValueChange(i);
                        })
                    })
                });
            });
        V.displayName = H;
        var U = 'TabsContent',
            W = r.forwardRef((e, t) => {
                let { __scopeTabs: s, value: i, forceMount: o, children: a, ...l } = e,
                    c = $(U, s),
                    u = G(c.baseId, i),
                    d = K(c.baseId, i),
                    h = i === c.value,
                    p = r.useRef(h);
                return (
                    r.useEffect(() => {
                        let e = requestAnimationFrame(() => (p.current = !1));
                        return () => cancelAnimationFrame(e);
                    }, []),
                    (0, n.jsx)(E.Presence, {
                        present: o || h,
                        children: ({ present: r }) =>
                            (0, n.jsx)(f.Primitive.div, {
                                'data-state': h ? 'active' : 'inactive',
                                'data-orientation': c.orientation,
                                role: 'tabpanel',
                                'aria-labelledby': u,
                                hidden: !r,
                                id: d,
                                tabIndex: 0,
                                ...l,
                                ref: t,
                                style: { ...e.style, animationDuration: p.current ? '0s' : void 0 },
                                children: r && a
                            })
                    })
                );
            });
        function G(e, t) {
            return `${e}-trigger-${t}`;
        }
        function K(e, t) {
            return `${e}-content-${t}`;
        }
        W.displayName = U;
        let Z = new Map(),
            q = (0, r.createContext)(null);
        e.s(
            [
                'Tabs',
                0,
                function ({
                    ref: e,
                    groupId: s,
                    persist: i = !1,
                    updateAnchor: o = !1,
                    defaultValue: a,
                    value: l,
                    onValueChange: c,
                    ...u
                }) {
                    let d = (0, r.useRef)(null),
                        f = (0, r.useMemo)(() => new Map(), []),
                        [h, p] = void 0 === l ? (0, r.useState)(a) : [l, (0, r.useEffectEvent)(e => c?.(e))];
                    return (
                        (0, r.useLayoutEffect)(() => {
                            if (!s) return;
                            let e = sessionStorage.getItem(s);
                            (i && (e ??= localStorage.getItem(s)), e && p(e));
                            let t = Z.get(s) ?? new Set();
                            return (
                                t.add(p),
                                Z.set(s, t),
                                () => {
                                    t.delete(p);
                                }
                            );
                        }, [s, i, p]),
                        (0, r.useLayoutEffect)(() => {
                            let e = window.location.hash.slice(1);
                            if (e) {
                                for (let [t, r] of f.entries())
                                    if (r === e) {
                                        (p(t), d.current?.scrollIntoView());
                                        break;
                                    }
                            }
                        }, [p, f]),
                        (0, n.jsx)(B, {
                            ref: (0, t.mergeRefs)(e, d),
                            value: h,
                            onValueChange: e => {
                                if (o) {
                                    let t = f.get(e);
                                    t && window.history.replaceState(null, '', `#${t}`);
                                }
                                if (s) {
                                    let t = Z.get(s);
                                    if (t) for (let r of t) r(e);
                                    (sessionStorage.setItem(s, e), i && localStorage.setItem(s, e));
                                } else p(e);
                            },
                            ...u,
                            children: (0, n.jsx)(q, { value: (0, r.useMemo)(() => ({ valueToIdMap: f }), [f]), children: u.children })
                        })
                    );
                },
                'TabsContent',
                0,
                function ({ value: e, ...t }) {
                    let { valueToIdMap: s } = (function () {
                        let e = (0, r.use)(q);
                        if (!e) throw Error('You must wrap your component in <Tabs>');
                        return e;
                    })();
                    return (t.id && s.set(e, t.id), (0, n.jsx)(W, { value: e, ...t, children: t.children }));
                },
                'TabsList',
                0,
                F,
                'TabsTrigger',
                0,
                V
            ],
            43151
        );
    },
    34764,
    e => {
        'use strict';
        var t = e.i(72395),
            r = e.i(45765),
            n = e.i(49561),
            s = e.i(71331),
            i = e.i(43151),
            o = e.i(35917),
            a = e.i(59954),
            l = e.i(85149);
        let c = (0, e.i(54864).default)('clipboard', [
                ['rect', { width: '8', height: '4', x: '8', y: '2', rx: '1', ry: '1', key: 'tgr4d6' }],
                ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', key: '116196' }]
            ]),
            u = (0, o.createContext)(null);
        function d({ className: e, containerRef: s, ...i }) {
            let [o, u] = (0, r.useCopyButton)(() => {
                let e = s.current?.getElementsByTagName('pre').item(0);
                if (!e) return;
                let t = e.cloneNode(!0);
                (t.querySelectorAll('.nd-copy-ignore').forEach(e => {
                    e.replaceWith('\n');
                }),
                    navigator.clipboard.writeText(t.textContent ?? ''));
            });
            return (0, a.jsx)('button', {
                type: 'button',
                'data-checked': o || void 0,
                className: (0, t.cn)(
                    (0, n.buttonVariants)({
                        className: 'hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground',
                        size: 'icon-xs'
                    }),
                    e
                ),
                'aria-label': o ? 'Copied Text' : 'Copy Text',
                onClick: u,
                ...i,
                children: o ? (0, a.jsx)(l.Check, {}) : (0, a.jsx)(c, {})
            });
        }
        e.s(
            [
                'CodeBlock',
                0,
                function ({
                    ref: e,
                    title: r,
                    allowCopy: n = !0,
                    keepBackground: s = !1,
                    icon: i,
                    viewportProps: l = {},
                    children: c,
                    Actions: f = e => (0, a.jsx)('div', { ...e, className: (0, t.cn)('empty:hidden', e.className) }),
                    ...h
                }) {
                    let p = null !== (0, o.use)(u),
                        m = (0, o.useRef)(null);
                    return (0, a.jsxs)('figure', {
                        ref: e,
                        dir: 'ltr',
                        ...h,
                        tabIndex: -1,
                        className: (0, t.cn)(
                            p ? 'bg-fd-secondary -mx-px -mb-px last:rounded-b-xl' : 'my-4 bg-fd-card rounded-xl',
                            s && 'bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)',
                            'shiki relative border shadow-sm not-prose overflow-hidden text-sm',
                            h.className
                        ),
                        children: [
                            r
                                ? (0, a.jsxs)('div', {
                                      className: 'flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4',
                                      children: [
                                          'string' == typeof i
                                              ? (0, a.jsx)('div', { className: '[&_svg]:size-3.5', dangerouslySetInnerHTML: { __html: i } })
                                              : i,
                                          (0, a.jsx)('figcaption', { className: 'flex-1 truncate', children: r }),
                                          f({ className: '-me-2', children: n && (0, a.jsx)(d, { containerRef: m }) })
                                      ]
                                  })
                                : f({
                                      className: 'absolute top-3 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground',
                                      children: n && (0, a.jsx)(d, { containerRef: m })
                                  }),
                            (0, a.jsx)('div', {
                                ref: m,
                                ...l,
                                role: 'region',
                                tabIndex: 0,
                                className: (0, t.cn)(
                                    'text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring',
                                    l.className
                                ),
                                style: {
                                    '--padding-right': r ? void 0 : 'calc(var(--spacing) * 8)',
                                    counterSet: h['data-line-numbers'] ? `line ${Number(h['data-line-numbers-start'] ?? 1) - 1}` : void 0,
                                    ...l.style
                                },
                                children: c
                            })
                        ]
                    });
                },
                'CodeBlockTab',
                0,
                function (e) {
                    return (0, a.jsx)(i.TabsContent, { ...e });
                },
                'CodeBlockTabs',
                0,
                function ({ ref: e, ...r }) {
                    let n = (0, o.useRef)(null),
                        l = null !== (0, o.use)(u);
                    return (0, a.jsx)(i.Tabs, {
                        ref: (0, s.mergeRefs)(n, e),
                        ...r,
                        className: (0, t.cn)('bg-fd-card rounded-xl border', !l && 'my-4', r.className),
                        children: (0, a.jsx)(u, {
                            value: (0, o.useMemo)(() => ({ containerRef: n, nested: l }), [l]),
                            children: r.children
                        })
                    });
                },
                'CodeBlockTabsList',
                0,
                function (e) {
                    return (0, a.jsx)(i.TabsList, {
                        ...e,
                        className: (0, t.cn)('flex flex-row px-2 overflow-x-auto text-fd-muted-foreground', e.className),
                        children: e.children
                    });
                },
                'CodeBlockTabsTrigger',
                0,
                function ({ children: e, ...r }) {
                    return (0, a.jsxs)(i.TabsTrigger, {
                        ...r,
                        className: (0, t.cn)(
                            'relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 hover:text-fd-accent-foreground data-[state=active]:text-fd-primary [&_svg]:size-3.5',
                            r.className
                        ),
                        children: [
                            (0, a.jsx)('div', { className: 'absolute inset-x-2 bottom-0 h-px group-data-[state=active]:bg-fd-primary' }),
                            e
                        ]
                    });
                },
                'Pre',
                0,
                function (e) {
                    return (0, a.jsx)('pre', {
                        ...e,
                        className: (0, t.cn)('min-w-full w-max *:flex *:flex-col', e.className),
                        children: e.children
                    });
                }
            ],
            34764
        );
    },
    21200,
    e => {
        'use strict';
        var t = e.i(72395),
            r = e.i(43151),
            n = e.i(35917),
            s = e.i(59954);
        let i = (0, n.createContext)(null);
        function o() {
            let e = (0, n.useContext)(i);
            if (!e) throw Error('You must wrap your component in <Tabs>');
            return e;
        }
        function a(e) {
            return (0, s.jsx)(r.TabsList, {
                ...e,
                className: (0, t.cn)('flex gap-3.5 text-fd-secondary-foreground overflow-x-auto px-4 not-prose', e.className)
            });
        }
        function l(e) {
            return (0, s.jsx)(r.TabsTrigger, {
                ...e,
                className: (0, t.cn)(
                    'inline-flex items-center gap-2 whitespace-nowrap text-fd-muted-foreground border-b border-transparent py-2 text-sm font-medium transition-colors [&_svg]:size-4 hover:text-fd-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-fd-primary data-[state=active]:text-fd-primary',
                    e.className
                )
            });
        }
        function c({ value: e, className: n, ...i }) {
            return (0, s.jsx)(r.TabsContent, {
                value: e,
                forceMount: !0,
                className: (0, t.cn)(
                    'p-4 text-[0.9375rem] bg-fd-background rounded-xl outline-none prose-no-margin data-[state=inactive]:hidden [&>figure:only-child]:-m-4 [&>figure:only-child]:border-none',
                    n
                ),
                ...i,
                children: i.children
            });
        }
        function u(e) {
            return e.toLowerCase().replace(/\s/, '-');
        }
        e.s([
            'Tab',
            0,
            function ({ value: e, ...t }) {
                let { items: r } = o(),
                    i =
                        e ??
                        r?.at(
                            (function () {
                                let e = (0, n.useId)(),
                                    { collection: t } = o();
                                return (
                                    (0, n.useEffect)(
                                        () => () => {
                                            let r = t.indexOf(e);
                                            -1 !== r && t.splice(r, 1);
                                        },
                                        [e, t]
                                    ),
                                    t.includes(e) || t.push(e),
                                    t.indexOf(e)
                                );
                            })()
                        );
                if (!i) throw Error('Failed to resolve tab `value`, please pass a `value` prop to the Tab component.');
                return (0, s.jsx)(c, { value: u(i), ...t, children: t.children });
            },
            'Tabs',
            0,
            function ({ ref: e, className: o, items: c, label: d, defaultIndex: f = 0, defaultValue: h = c ? u(c[f]) : void 0, ...p }) {
                let [m, x] = (0, n.useState)(h),
                    g = (0, n.useMemo)(() => [], []);
                return (0, s.jsxs)(r.Tabs, {
                    ref: e,
                    className: (0, t.cn)('flex flex-col overflow-hidden rounded-xl border bg-fd-secondary my-4', o),
                    value: m,
                    onValueChange: e => {
                        (!c || c.some(t => u(t) === e)) && x(e);
                    },
                    ...p,
                    children: [
                        c &&
                            (0, s.jsxs)(a, {
                                children: [
                                    d && (0, s.jsx)('span', { className: 'text-sm font-medium my-auto me-auto', children: d }),
                                    c.map(e => (0, s.jsx)(l, { value: u(e), children: e }, e))
                                ]
                            }),
                        (0, s.jsx)(i.Provider, { value: (0, n.useMemo)(() => ({ items: c, collection: g }), [g, c]), children: p.children })
                    ]
                });
            },
            'TabsContent',
            0,
            c,
            'TabsList',
            0,
            a,
            'TabsTrigger',
            0,
            l
        ]);
    },
    97705,
    e => {
        'use strict';
        var t = e.i(59954),
            r = e.i(35917),
            n = e.i(21957);
        let s = new Map();
        function i(e, t) {
            let r = s.get(e);
            if (r) return r;
            let n = t();
            return (s.set(e, n), n);
        }
        function o({ chart: s }) {
            let a = (0, r.useId)(),
                { resolvedTheme: l } = (0, n.useTheme)(),
                { default: c } = (0, r.use)(i('mermaid', () => e.A(8418)));
            c.initialize({
                startOnLoad: !1,
                securityLevel: 'loose',
                fontFamily: 'inherit',
                themeCSS: 'margin: 1.5rem auto 0;',
                theme: 'dark' === l ? 'dark' : 'default'
            });
            let { svg: u, bindFunctions: d } = (0, r.use)(
                i(`${s}-${l ?? 'default'}`, () => c.render(a, s.replaceAll(String.raw`\n`, '\n')))
            );
            return (0, t.jsx)('div', {
                ref: e => {
                    e && d?.(e);
                },
                dangerouslySetInnerHTML: { __html: u }
            });
        }
        e.s([
            'Mermaid',
            0,
            function ({ chart: e }) {
                let [n, s] = (0, r.useState)(!1);
                if (
                    ((0, r.useEffect)(() => {
                        s(!0);
                    }, []),
                    n)
                )
                    return (0, t.jsx)(o, { chart: e });
            }
        ]);
    }
]);
