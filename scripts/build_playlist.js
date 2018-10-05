let buildify = require("buildify");
let YAML = require("js-yaml");

const playlistConfig = {
    path: 'playlists',
    fileformat: '.yaml'
};

const playlists = [
    'indonesia/rock',
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