import template from "./find-template";
import config from "../config";
import express, { Express, Request, Response } from "express";

type Nav = NavItem[];

type NavItem = {
    slug: string,
    title: string,
    sort?: number,
    expanded?: boolean,
    active?: boolean,
    nav?: Nav,
    exists?: boolean,
};

type FuzzyData = {
    '@type': 'fuzzyfile',
    fuzzes: {
        name: string,
        str: string,
        href: string,
    }[]
}

type TaitanData = {
    '@type': 'data', // not actually provided by taitan
    title: string,
    slug: string,
    url: string,
    updated_at: string,
    image?: string,
    message?: string,
    body: string,
    sidebar?: string,
    sort?: number,
    expanded?: boolean,
    anchors: {
        id: string,
        value: string,
        level: number
    }[],
    nav: Nav,
}

type RenderData = TaitanData & {
    original_updated_at: string,
    lang: string,
    default_lang: string
}

const comparePages = (a: NavItem, b: NavItem) => {
    if (a.sort === b.sort) {
        if (a.title === b.title) return 0
        if (a.title === undefined) return 1;
        if (b.title === undefined) return -1;

        return a.title.localeCompare(b.title, 'sv-SE') // the comparison ignores case
    }

    if (a.sort === undefined) return 1;
    if (b.sort === undefined) return -1;

    return (a.sort - b.sort);
};

const deepSortNav = (nav: Nav) => {
    nav.sort(comparePages)
    nav.forEach(item => {
        if (item.nav) {
            deepSortNav(item.nav);
        }
    })
}

const mergeNavs = (base: Nav, add: Nav | undefined) => {
    if (add === undefined) {
        return base;
    }

    return base.map(item => {
        const o: NavItem | undefined = add.find((o) => {
            return o.slug === item.slug;
        });


        return o ? {
            ...item,
            ...(o.title !== '' ? {
                title: o.title,
                exists: true,
            } : {}),
            nav: item.nav && mergeNavs(item.nav, o.nav),
        } : item;
    })
};

const fetchTaitanData = async (path: string, lang: string) => {
    const url = `${config.taitanUrl}${path}?lang=${lang}`;

    return fetch(url)
        .then(response => {
            if (response.ok && response.url === url) {
                return response.json();
            } else if (response.ok) {
                // why do we do this ????
                if (response.url.indexOf(config.taitanUrl) === 0)
                    throw response.url.substring(config.taitanUrl.length)
                else
                    throw response.url
            } else {
                throw response.status
            }
        })
};

type PageRequest = Request<unknown, unknown, unknown, { lang?: string }>;

export default (app: Express) => {

    // Static assets will be available on the same path as their directory,
    // i.e. assets => /assets, static => /static
    app.use('/static', express.static(config.staticDir));

    // All requests that are not static files should be resolved
    app.get("*", (req: PageRequest, res: Response) => {
        const templatePath = template.find(req.path);
        const lang = req.query.lang ?? config.defaultLang;
        const defaultLangData = fetchTaitanData(req.path, config.defaultLang).then(data => ({
            nav: data.nav,
            original_updated_at: data.updated_at
        }));


        if (templatePath) {
            fetchTaitanData(req.path, lang)
                // todo: validate that the returned data matches type in an non-overkill way
                .then(async (data: FuzzyData | TaitanData) => {
                    if (data["@type"] === "fuzzyfile") {
                        res.send(data);
                        return Promise.resolve();
                    } else {
                        return defaultLangData.then((baseData) => {
                            deepSortNav(baseData.nav);

                            const renderData: RenderData = {
                                ...data,
                                lang,
                                nav: mergeNavs(baseData.nav, data.nav),
                                original_updated_at: baseData.original_updated_at,
                                default_lang: config.defaultLang
                            };

                            res.render(templatePath, renderData);
                        })
                    }
                })
                .catch((err: string | number) => {
                    defaultLangData.then((baseData) =>
                        fetchTaitanData("/", lang)
                            .then((langBase: FuzzyData | TaitanData) => {
                                if (langBase["@type"] == "fuzzyfile") {
                                    return Promise.reject(500);
                                }
                                deepSortNav(baseData.nav);

                                const renderData: RenderData = {
                                    ...langBase,
                                    nav: mergeNavs(baseData.nav, langBase.nav),
                                    original_updated_at: baseData.original_updated_at,
                                    lang,
                                    default_lang: config.defaultLang
                                };
                                res.render(`_untranslated.${config.extension}`, renderData);
                            })
                    ).catch((err2) => {
                        if (err2 == 404) {
                            res.status(404).render(`_404.${config.extension}`, { req: req });
                        } else if (typeof err === "string" && (err.startsWith("/") || err.startsWith("http"))) {
                            res.redirect(err);
                        } else {
                            res.status(500).send("An unexpected error occured. " + err);
                        }
                    })

                })
        } else {
            res.status(404).send("404: The page could not be found and this gloo instance contains no 404 template");
        }

    });

};
