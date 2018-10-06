let buildify = require("buildify");
let YAML = require("js-yaml");

const playlistConfig = {
    path: 'playlists',
    fileformat: '.yml'
};

const playlists = [
    'indonesia/rock',
    'indonesia/classic-rock',
    'indonesia/indorock',
    'indonesia/hiphop',
    'indonesia/pop',
    'indonesia/reggae',
    'indonesia/funk',
    'indonesia/jazz',
    'indonesia/keroncong',
    'indonesia/dangdut',
    'indonesia/electronic',
    'indonesia/avantgarde',
    'indonesia/folk',
    'indonesia/andi',
    'chicano'
];

function wrapPlaylistInPath(playlist) {
    return playlistConfig.path + "/" + playlist + playlistConfig.fileformat;
}

buildify()
    .concat(playlists.map(wrapPlaylistInPath))
    .perform((content) => JSON.stringify(YAML.load(content)))
    .wrap('playlist.tpl')
    .uglify()
    .save('playlist.js');