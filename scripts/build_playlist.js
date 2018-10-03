let buildify = require("buildify");
let YAML = require("js-yaml");

const playlistConfig = {
    path: 'playlists',
    fileformat: '.yaml'
};

const playlists = [
    'indonesian',
    'chicano'
];

function wrapPlaylistInPath(playlist) {
    return playlistConfig.path + "/" + playlist + playlistConfig.fileformat;
}

buildify()
    .concat(playlists.map(wrapPlaylistInPath))
    .perform((content) => JSON.stringify(YAML.load(content)))
    .wrap('playlist_tpl.js')
    .uglify()
    .save('playlist.js');