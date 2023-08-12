<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->get('/', function () use ($router) {
    return 'WORKING';
});

$router->get('/trending', [
    'uses' => 'AniwatchController@getTrending'
]);

$router->get('/spotlight', [
    'uses' => 'AniwatchController@getSpotlight'
]);

$router->get('/genres', [
    'uses' => 'AniwatchController@getGenres'
]);

$router->get('/top-airing', [
    'uses' => 'AniwatchController@getTopAiring'
]);

$router->get('/most-popular', [
    'uses' => 'AniwatchController@getMostPopular'
]);

$router->get('/most-favorite', [
    'uses' => 'AniwatchController@getMostFavorite'
]);

$router->get('/completed', [
    'uses' => 'AniwatchController@getCompleted'
]);

$router->get('/recently-updated', [
    'uses' => 'AniwatchController@getRecentlyUpdated'
]);

$router->get('/recently-added', [
    'uses' => 'AniwatchController@getRecentlyAdded'
]);

$router->get('/top-upcoming', [
    'uses' => 'AniwatchController@getTopUpcoming'
]);

$router->get('/subbed-anime', [
    'uses' => 'AniwatchController@getSubbedAnime'
]);

$router->get('/dubbed-anime', [
    'uses' => 'AniwatchController@getDubbedAnime'
]);

$router->get('/most-favorite', [
    'uses' => 'AniwatchController@mostFavorite'
]);

$router->get('/ova', [
    'uses' => 'AniwatchController@getOva'
]);

$router->get('/ona', [
    'uses' => 'AniwatchController@getOna'
]);

$router->get('/special', [
    'uses' => 'AniwatchController@getSpecial'
]);

$router->get('/movie', [
    'uses' => 'AniwatchController@getMovies'
]);

$router->get('/tv', [
    'uses' => 'AniwatchController@getTv'
]);

$router->get('/az-list/{path}', [
    'uses' => 'AniwatchController@getAzList'
]);

$router->get('/episode/list/server/{episodeId}', [
    'uses' => 'AniwatchController@getAjaxServerEpisodeList'
]);

$router->get('/episode/sources/{sourceId}', [
    'uses' => 'AniwatchController@getAjaxEpisodeSource'
]);

$router->get('/episode/list/{id}', [
    'uses' => 'AniwatchController@getAjaxEpisodeList'
]);

$router->get('/genre/{slug}', [
    'uses' => 'AniwatchController@getGenre'
]);

$router->get('/{slug}', [
    'uses' => 'AniwatchController@getDetail'
]);
