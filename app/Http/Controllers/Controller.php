<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Laravel\Lumen\Routing\Controller as BaseController;
use Symfony\Component\DomCrawler\Crawler;

class Controller extends BaseController
{
    const BASE_URL = "https://aniwatch.to/";
    public mixed $page = 1;

    public function __construct()
    {
        $this->page = request()->page ?? 1;
    }

    public function getDetail(string $slug): array
    {
        $html = Http::get(self::BASE_URL.$slug)->body();
        $crawler = new Crawler($html);

        $statTick = $crawler->filter('.film-stats .tick');
        $info = $crawler->filter('.anisc-info .item:not(.w-hide)');

        $details = $info->each(function($detail) {
            $key = str($detail->filter('.item-head')->text(''))->slug('_')->toString();
            $value = empty($detail->filter('span.name')->text('')) ?
                $detail->filter('a')->each(function ($list) {
                    return [
                        str($list->attr('href'))->afterLast('/')->toString() => $list->text()
                    ];
                }) : $detail->filter('span.name')->text();

            return [$key => is_array($value) ? collect($value)->collapse()->all() : $value];
        });

        $related = $crawler->filter('#main-sidebar .anif-block-ul')->first();

        return [
            'title' => $crawler->filter('h2.film-name')->text(),
            'original_title' => $crawler->filter('h2.film-name')->attr('data-jname'),
            'certificate' => $statTick->filter('.tick-pg')->text(),
            'quality' => $statTick->filter('.tick-quality')->text(),
            'sub' => $statTick->filter('.tick-sub')->text(),
            'dub' => $statTick->filter('.tick-dub')->text(),
            'type' => $statTick->filter('.item')->first()->text(),
            'runtime' => (int) rtrim($statTick->filter('.item')->last()->text(), 'm'),
            'description' => $crawler->filter('.film-description .text')->text(),
            'info' => collect($details)->collapse()->all(),
            'recommendations' => $this->getItems(
                $crawler->filter('#main-content .block_area_category .film_list-wrap')
            ),
            'related' => $related->filter('ul.ulclear li')->each(function($item) {
                return [
                    'id' => $item->filter('.film-poster')->attr('data-id'),
                    'original_title' => $this->getOriginalTitle($item),
                    'title' => $this->getTitle($item),
                    'slug' => $this->getSlug($item),
                    'poster' => $item->filter('img')->attr('data-src'),
                    'sub' => $this->getSub($item),
                    'dub' => $this->getDub($item),
                    'type' => str($item->filter('.tick')->text(''))->afterLast(' ')->toString(),
                ];
            })
        ];
    }

    public function getGenre(string $slug): array
    {
        $html = Http::get(self::BASE_URL."genre/$slug?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getAjaxEpisodeSource(int $sourceId)
    {
        return Http::get(self::BASE_URL."ajax/v2/episode/sources?id=$sourceId")->json();
    }

    public function getAjaxServerEpisodeList(int $episodeId): array
    {
        $response = Http::get(self::BASE_URL."ajax/v2/episode/servers?episodeId=$episodeId")->json();

        if (! $response['status']) {
            abort(404);
        }

        $crawler = new Crawler($response['html']);

        return $crawler->filter('.server-item')->each(function ($server) {
            return [
                'type' => $server->attr('data-type'),
                'id' => (int) $server->attr('data-id'),
                'server_id' => (int) $server->attr('data-server-id'),
                'name' => $server->filter('a')->text('')
            ];
        });
    }

    public function getAjaxEpisodeList(int $id): array
    {
        $response = Http::get(self::BASE_URL."ajax/v2/episode/list/$id")->json();

        if (! $response['status']) {
            abort(404);
        }

        $crawler = new Crawler($response['html']);

        return $crawler->filter('.ss-list .ep-item')->each(function ($ep) {
            return [
                'number' => $ep->attr('data-number'),
                'order' => (int) $ep->filter('.ssli-order')->text(),
                'id' => (int) $ep->attr('data-id'),
                'name' => $ep->filter('.ep-name')->text(''),
                'original_name' => $ep->filter('.ep-name')->attr('data-jname')
            ];
        });
    }

    public function getGenres(): array
    {
        $html = Http::get(self::BASE_URL."home")->body();

        $crawler = new Crawler($html);
        $genres = $crawler->filter('#sidebar_subs_genre ul')->first();

        return $genres->filter('li.nav-item')
            ->each(function ($item) {
                return [
                    'name' => $item->filter('a.nav-link')->text(),
                    'slug' => str($item->filter('a')->attr('href'))->afterLast('/')->toString(),
                ];
        });
    }

    public function getSpotlight(): array
    {
        $html = Http::get(self::BASE_URL."home")->body();

        $crawler = new Crawler($html);
        $featured = $crawler->filter('#slider')->first();

        return $featured->filter('.swiper-slide')->each(function ($item) {
            return [
                'id' => (int) str($item->filter('a')->last()->attr('href'))->afterLast('-')->toString(),
                'label' => $item->filter('.desi-sub-text')->text(),
                'original_title' => $item->filter('.desi-head-title')->attr('data-jname'),
                'title' => $item->filter('.desi-head-title')->text(),
                'slug' => ltrim($item->filter('a')->last()->attr('href'), '/'),
                'backdrop' => $item->filter('img')->attr('data-src'),
                'description' => $item->filter('.desi-description')->text(),
            ];
        });
    }

    public function getTrending(): array
    {
        $html = Http::get(self::BASE_URL."home")->body();

        $crawler = new Crawler($html);
        $trendingList = $crawler->filter('.trending-list')->first();

        return $trendingList->filter('.item-qtip')->each(function ($item) {
            return [
                'id' => (int) $item->attr('data-id'),
                'original_title' => $item->filter('.film-title')->attr('data-jname'),
                'title' => $item->filter('.film-title')->text(),
                'slug' => ltrim($item->filter('a')->attr('href'), '/'),
                'poster' => $item->filter('img')->attr('data-src')
            ];
        });
    }

    public function getTopAiring(): array
    {
        $html = Http::get(self::BASE_URL."top-airing?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getMostPopular(): array
    {
        $html = Http::get(self::BASE_URL."most-popular?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getMostFavorite(): array
    {
        $html = Http::get(self::BASE_URL."most-favorite?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getCompleted(): array
    {
        $html = Http::get(self::BASE_URL."completed?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getRecentlyUpdated(): array
    {
        $html = Http::get(self::BASE_URL."recently-updated?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getRecentlyAdded(): array
    {
        $html = Http::get(self::BASE_URL."recently-added?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getTopUpcoming(): array
    {
        $html = Http::get(self::BASE_URL."top-upcoming?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getSubbedAnime(): array
    {
        $html = Http::get(self::BASE_URL."subbed-anime?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getDubbedAnime(): array
    {
        $html = Http::get(self::BASE_URL."dubbed-anime?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getOva(): array
    {
        $html = Http::get(self::BASE_URL."ova?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getOna(): array
    {
        $html = Http::get(self::BASE_URL."ona?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getSpecial(): array
    {
        $html = Http::get(self::BASE_URL."special?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getMovies(): array
    {
        $html = Http::get(self::BASE_URL."movie?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getTv(): array
    {
        $html = Http::get(self::BASE_URL."tv?page=$this->page")->body();

        return $this->getArchive($html);
    }

    public function getAzList(string $path = ''): array
    {
        $html = Http::get(self::BASE_URL."az-list/$path?page=$this->page")->body();

        return $this->getArchive($html);
    }

    private function getArchive(string $html): array
    {
        $crawler = new Crawler($html);
        $lists = $crawler->filter('.film_list-wrap')->first();

        $results = $this->getItems($lists);

        return [
            'page' => $this->page,
            'results' => $results,
            'total_pages' => (int) str(
                $crawler->filter('.page-item')
                    ->last()
                    ->filter('a')
                    ->attr('href')
            )->afterLast('=')->toString()
        ];
    }

    private function getItems($lists)
    {
        return $lists->filter('.flw-item')->each(function ($item) {
            $a1 = $item->filter('a')->first();
            $infor = $item->filter('.fd-infor')->first();

            return [
                'id' => (int) $a1->attr('data-id'),
                'type' => $infor->filter('.fdi-item')->first()->text(''),
                'runtime' => (int) rtrim($infor->filter('.fdi-duration')->text(''), 'm'),
                'original_title' => $this->getOriginalTitle($item),
                'title' => $this->getTitle($item),
                'description' => $item->filter('.description')->text(''),
                'slug' => $this->getSlug($item),
                'poster' => $item->filter('img')->attr('data-src'),
                'sub' => (int) $item->filter('.tick-sub')->text(''),
                'dub' => (int) $item->filter('.tick-dub')->text(''),
                'eps' => (int) $item->filter('.tick-eps')->text(''),
            ];
        });
    }

    private function getTitle($item): string
    {
        return $item->filter('.film-name a')->text();
    }

    private function getOriginalTitle($item): string
    {
        return $item->filter('.film-name a')->attr('data-jname');
    }

    private function getSlug($item): string
    {
        return str($item->filter('.film-name a')->attr('href'))->afterLast('/')->toString();
    }

    private function getSub($item): int
    {
        return $item->filter('.tick-sub')->text(0);
    }

    private function getDub($item): int
    {
        return $item->filter('.tick-dub')->text(0);
    }
}
