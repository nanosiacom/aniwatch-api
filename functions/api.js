import express, { Router } from 'express';
import serverless from 'serverless-http';
import * as cheerio from 'cheerio';
import {getArchiveItems, getItem} from "./utils.js";

const app = express();
const router = Router();
const BASE_URL = "https://aniwatch.to";

router.get('/', (req, res) => {
    res.send("WORK!")
});

app.get('/home', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/home`, {method: "GET"})
        const html = await response.text();
        const $ = cheerio.load(html);

        const data = {
            trending: [],
            spotlight: [],
            top10: [],
            latest: [],
            top_airings: [],
            most_populars: [],
            most_favorites: [],
            latest_completeds: [],
        };

        $('#trending-home .swiper-slide').each((i, el) => {
            data['trending'].push({
                id: $(el).attr('data-id'),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-title').text(),
                original_title: $(el).find('.film-title').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.number span').text())
            });
        });

        $('#slider .swiper-slide').each((i, el) => {
            const detail = $(el).find('div.sc-detail');
            const href = $(el).find('div.desi-buttons .btn-secondary').attr('href');
            const splitHref = href.split('-');

            data['spotlight'].push({
                id: parseInt(splitHref.pop()),
                slug: href.split('/').pop(),
                title: $(el).find('div.desi-head-title').text(),
                description: $(el).find('div.desi-description').text(),
                original_title: $(el).find('div.desi-head-title').attr('data-jname'),
                backdrop: $(el).find('.film-poster-img').attr('data-src'),
                type: detail.find('.scd-item:eq(0)').text().trim(),
                runtime: parseInt(detail.find('.scd-item:eq(1)').text().trim()),
                release_date: new Date(detail.find('.scd-item:eq(2)').text().trim()),
                quality: detail.find('.scd-item:eq(3)').text().trim(),
                sub: parseInt(detail.find('.scd-item:eq(4) .tick .tick-sub').text().trim()),
                dub: parseInt(detail.find('.scd-item:eq(4) .tick .tick-dub').text().trim()),
                eps: parseInt(detail.find('.scd-item:eq(4) .tick .tick-eps').text().trim()),
            });
        });

        $('#anime-featured .anif-blocks .row .col-xl-3:eq(0) ul.ulclear li').each((i, el) => {
            data['top_airings'].push({
                id: parseInt($(el).find('.item-qtip').attr('data-id')),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-name a').text(),
                original_title: $(el).find('.film-name a').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.film-number span').text()),
                sub: parseInt($(el).find('.tick-sub').text()),
                dub: parseInt($(el).find('.tick-dub').text()),
                eps: parseInt($(el).find('.tick-eps').text()),
                type: $(el).find('span.fdi-item').text(),
            });
        })

        $('#anime-featured .anif-blocks .row .col-xl-3:eq(1) ul.ulclear li').each((i, el) => {
            data['most_populars'].push({
                id: parseInt($(el).find('.item-qtip').attr('data-id')),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-name a').text(),
                original_title: $(el).find('.film-name a').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.film-number span').text()),
                sub: parseInt($(el).find('.tick-sub').text()),
                dub: parseInt($(el).find('.tick-dub').text()),
                eps: parseInt($(el).find('.tick-eps').text()),
                type: $(el).find('span.fdi-item').text(),
            });
        })

        $('#anime-featured .anif-blocks .row .col-xl-3:eq(2) ul.ulclear li').each((i, el) => {
            data['most_favorites'].push({
                id: parseInt($(el).find('.item-qtip').attr('data-id')),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-name a').text(),
                original_title: $(el).find('.film-name a').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.film-number span').text()),
                sub: parseInt($(el).find('.tick-sub').text()),
                dub: parseInt($(el).find('.tick-dub').text()),
                eps: parseInt($(el).find('.tick-eps').text()),
                type: $(el).find('span.fdi-item').text(),
            });
        })

        $('#anime-featured .anif-blocks .row .col-xl-3:eq(3) ul.ulclear li').each((i, el) => {
            data['latest_completeds'].push({
                id: parseInt($(el).find('.item-qtip').attr('data-id')),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-name a').text(),
                original_title: $(el).find('.film-name a').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.film-number span').text()),
                sub: parseInt($(el).find('.tick-sub').text()),
                dub: parseInt($(el).find('.tick-dub').text()),
                eps: parseInt($(el).find('.tick-eps').text()),
                type: $(el).find('span.fdi-item').text(),
            });
        })

        $('#top-viewed-day ul li').each((i, el) => {
            data['top10'].push({
                id: parseInt($(el).find('.item-qtip').attr('data-id')),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-name a').text(),
                original_title: $(el).find('.film-name a').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.film-number span').text()),
                sub: parseInt($(el).find('.tick-sub').text()),
                dub: parseInt($(el).find('.tick-dub').text()),
                eps: parseInt($(el).find('.tick-eps').text()),
            });
        });

        $('#main-content section:eq(0)').find('.film_list-wrap .flw-item').each((i, el) => {
            data['latest'].push(getItem($(el)));
        });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/trending', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/home`, {method: "GET"})
        const html = await response.text();
        const $ = cheerio.load(html);

        const data = [];

        $('#trending-home .swiper-slide').each((i, el) => {
            data.push({
                id: $(el).attr('data-id'),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-title').text(),
                original_title: $(el).find('.film-title').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.number span').text())
            });
        });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/top10', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/home`, {method: "GET"})
        const html = await response.text();
        const $ = cheerio.load(html);

        const data = [];

        $('#top-viewed-day ul li').each((i, el) => {
            data.push({
                id: parseInt($(el).find('.item-qtip').attr('data-id')),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-name a').text(),
                original_title: $(el).find('.film-name a').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.film-number span').text()),
                sub: parseInt($(el).find('.tick-sub').text()),
                dub: parseInt($(el).find('.tick-dub').text()),
                eps: parseInt($(el).find('.tick-eps').text()),
            });
        });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/spotlight', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/home`, {method: "GET"})
        const html = await response.text();
        const $ = cheerio.load(html);

        const data = [];

        $('#slider .swiper-slide').each((i, el) => {
            const detail = $(el).find('div.sc-detail');
            const href = $(el).find('div.desi-buttons .btn-secondary').attr('href');
            const splitHref = href.split('-');

            data.push({
                id: parseInt(splitHref.pop()),
                slug: href.split('/').pop(),
                title: $(el).find('div.desi-head-title').text(),
                description: $(el).find('div.desi-description').text(),
                original_title: $(el).find('div.desi-head-title').attr('data-jname'),
                backdrop: $(el).find('.film-poster-img').attr('data-src'),
                type: detail.find('.scd-item:eq(0)').text().trim(),
                runtime: parseInt(detail.find('.scd-item:eq(1)').text().trim()),
                release_date: new Date(detail.find('.scd-item:eq(2)').text().trim()),
                quality: detail.find('.scd-item:eq(3)').text().trim(),
                sub: parseInt(detail.find('.scd-item:eq(4) .tick .tick-sub').text().trim()),
                dub: parseInt(detail.find('.scd-item:eq(4) .tick .tick-dub').text().trim()),
                eps: parseInt(detail.find('.scd-item:eq(4) .tick .tick-eps').text().trim()),
            });
        });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/genres', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/home`, {method: "GET"})
        const html = await response.text();
        const $ = cheerio.load(html);

        const data = [];

        $('#sidebar_subs_genre ul.nav li.nav-item:not(.nav-more)').each((i, el) => {
            data.push({
                name: $(el).text(),
                slug: $(el).find('a').attr('href').split('/').pop(),
            });
        });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/search?keyword=${keyword}&page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/movie', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/movie?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/top-airing', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/top-airing?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/most-popular', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/most-popular?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/most-favorite', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/most-favorite?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/completed', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/completed?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/recently-updated', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/recently-updated?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/recently-added', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/recently-added?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/top-upcoming', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/top-upcoming?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/subbed-anime', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/subbed-anime?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/dubbed-anime', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/dubbed-anime?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/tv', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/tv?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/ova', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/ova?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/ona', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/ona?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/special', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/special?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/az-list', async (req, res) => {
    try {
        const page = req.query.page ?? 1;

        const response = await fetch(`${BASE_URL}/az-list?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/az-list/:path', async (req, res) => {
    try {
        const page = req.query.page ?? 1;
        const path = req.params.path;

        const response = await fetch(`${BASE_URL}/az-list/${path}?page=${page}`, {method: "GET"})
        const html = await response.text();

        const data = getArchiveItems(html);

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/:slug', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/${req.params.slug}`, {method: "GET"});
        const html = await response.text();

        const $ = cheerio.load(html);

        let genres = [];
        let studios = [];
        let producers = [];
        let related = [];

        const statTick = $('.film-stats .tick');
        const details = $('.anisc-info');
        const recommended = getArchiveItems(html);

        $('#main-sidebar section:eq(0) ul.ulclear li').each((i, el) => {
            related.push({
                id: parseInt($(el).find('.item-qtip').attr('data-id')),
                slug: $(el).find('a').attr('href').split('/').pop(),
                title: $(el).find('.film-name a').text(),
                original_title: $(el).find('.film-name a').attr('data-jname'),
                poster: $(el).find('.film-poster-img').attr('data-src'),
                number: parseInt($(el).find('.film-number span').text()),
                sub: parseInt($(el).find('.tick-sub').text()),
                dub: parseInt($(el).find('.tick-dub').text()),
                eps: parseInt($(el).find('.tick-eps').text()),
            });
        });

        $('.anisc-info .item:eq(8) a').each((i, el) => {
            genres.push({
                slug: $(el).attr('href').split('/').pop(),
                name: $(el).text(),
            })
        })

        $('.anisc-info .item:eq(9) a').each((i, el) => {
            studios.push({
                slug: $(el).attr('href').split('/').pop(),
                name: $(el).text(),
            })
        })

        $('.anisc-info .item:eq(10) a').each((i, el) => {
            producers.push({
                slug: $(el).attr('href').split('/').pop(),
                name: $(el).text(),
            })
        })

        const data = {
            title: $('h2.film-name').text(),
            original_title: $('h2.film-name').attr('data-jname'),
            poster: $('.film-poster-img').attr('src'),
            certificate: statTick.find('.tick-pg').text(),
            quality: statTick.find('.tick-quality').text(),
            sub: parseInt(statTick.find('.tick-sub').text()),
            dub: parseInt(statTick.find('.tick-dub').text()),
            rate: $('.anisc-poster .film-poster').find('.tick-rate').text(),
            type: statTick.find('.item').first().text(),
            runtime: parseInt(statTick.find('.item').last().text()),
            description: $('.film-description .text').text().trim(),
            details: {
                japanese: details.find('.item:eq(1) .name').text(),
                synonyms: details.find('.item:eq(2) .name').text(),
                aired: new Date(details.find('.item:eq(3) .name').text()),
                premiered: details.find('.item:eq(4) .name').text(),
                runtime: parseInt(details.find('.item:eq(5) .name').text()),
                status: details.find('.item:eq(6) .name').text(),
                score: details.find('.item:eq(7) .name').text(),
                genres: genres,
                studios: studios,
                producers: producers,
            },
            recommended: recommended.results,
            related: related,
        };

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/episode/sources/:sourceId', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/ajax/v2/episode/sources?id=${req.params.sourceId}`, {method: "GET"});
        const html = await response.text();

        res.status(200).json(html);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/episode/list/server/:episodeId', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/ajax/v2/episode/servers?episodeId=${req.params.episodeId}`, {method: "GET"});
        const html = await response.json();

        const $ = cheerio.load(html['html']);
        let data = [];

        $('.server-item').each((i, el) => {
            data.push({
                type: $(el).attr('data-type'),
                id: parseInt($(el).attr('data-id')),
                server_id: parseInt($(el).attr('data-server-id')),
                name: $(el).find('a').text()
            })
        })

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/episode/list/:id', async (req, res) => {
    try {
        const response = await fetch(`${BASE_URL}/ajax/v2/episode/list/${req.params.id}`, {method: "GET"});
        const html = await response.json();

        const $ = cheerio.load(html['html']);
        let data = [];

        $('.ss-list .ep-item').each((i, el) => {
            data.push({
                number: parseInt($(el).attr('data-number')),
                order: parseInt($(el).find('.ssli-order').text()),
                id: parseInt($(el).attr('data-id')),
                name: $(el).find('.ep-name').text(),
                original_name: $(el).find('.ep-name').attr('data-jname')
            })
        })

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
})

app.get('/qtip/:id', async (req, res) => {
    const response = await fetch(`${BASE_URL}/ajax/movie/qtip/${req.params.id}`, {
        method: "GET",
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    })
    const html = await response.text();
    const $ = cheerio.load(html);

    let genres = [];

    $('.pre-qtip-line:eq(4) a').each((i, el) => {
        genres.push({
            slug: $(el).attr('href').split('/').pop(),
            name: $(el).text(),
        })
    })

    const data = {
        id: parseInt($('.dr-tip-fav').attr('id').split('-').pop()),
        title: $('.pre-qtip-title').text(),
        score: $('.pre-qtip-detail .pqd-li.mr-3').text(),
        quality: $('.tick-quality').text(),
        sub: parseInt($('.tick-sub').text()),
        dub: parseInt($('.tick-dub').text()),
        type: $('.badge-quality').text(),
        description: $('.pre-qtip-description').text(),
        details: {
            japanese: $('.pre-qtip-line:eq(0) .stick-text').text(),
            synonyms: $('.pre-qtip-line:eq(1) .stick-text').text(),
            aired: new Date($('.pre-qtip-line:eq(2) .stick-text').text()),
            status: $('.pre-qtip-line:eq(3) .stick-text').text(),
            genres: genres,
        },
        slug: $('.pre-qtip-button a').attr('href').split('/').pop()
    };

    res.status(200).json(data);
})

app.use('/', router);

export const handler = serverless(app);