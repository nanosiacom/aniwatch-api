import * as cheerio from 'cheerio';

export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36';

export const renameKey = (obj, oldKey, newKey) => {
    if (!obj.hasOwnProperty(oldKey)) return;
    const oldValue = obj[oldKey];
    delete obj[oldKey];
    obj[newKey] = oldValue;
};

export const getItem = (item) => {
    return {
        id: parseInt(item.find('.film-poster a').attr('data-id')),
        slug: item.find('.film-name a').attr('href').split('/')[1].split('?')[0],
        title: item.find('.film-name a').text(),
        original_title: item.find('.film-name a').attr('data-jname'),
        poster: item.find('.film-poster img').attr('data-src'),
        type: item.find('.fd-infor .fdi-item').first().text(),
        runtime: parseInt(item.find('.fd-infor .fdi-duration').text()),
        sub: parseInt(item.find('.tick-sub').text()),
        dub: parseInt(item.find('.tick-dub').text()),
        eps: parseInt(item.find('.tick-eps').text()),
    }
}

export const slugify = (str) => {
    return String(str)
        .normalize('NFKD') // split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
        .trim() // trim leading or trailing whitespace
        .toLowerCase() // convert to lowercase
        .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens
}

export const getArchiveItems = (html) => {
    const $ = cheerio.load(html);
    const list = [];

    $('.film_list-wrap .flw-item').each((i, el) => {
        list.push(getItem($(el)));
    });

    const data = {
        per_page: parseInt(list.length),
        results: list,
        total_pages: parseInt($('ul.pagination li:last-child a').attr('href').split('=').pop())
    };

    return data;
}