let buildify = require("buildify");
let YAML = require("js-yaml");

const playlistConfig = {
    path: 'playlists',
    fileformat: '.yml'
};

const playlists = [
    'turn-up-the-808/prelude',
    'turn-up-the-808/electro',
    'turn-up-the-808/freestyle',
    'turn-up-the-808/miami-bass',
    'turn-up-the-808/favela-funk',
    'turn-up-the-808/chicago-house',
    'turn-up-the-808/detroit-techno',
    'turn-up-the-808/italo-disco',
    'turn-up-the-808/where-else',
    'turn-up-the-808/bonus',
    'sheilachandra',
    'thesaigonkick',
    'rossereysothea',
    'italianrock',
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
    'discoveringzeppelin',
    'chicano',
    'thefirsttime',
    'songsikeepcomingbackto',
    'noomrave',
    'beforeinindia',
    'afternooninspiration',
    'yamasukisingers',
    'atomicforest',
    'charanjitsingh',
    'maoripulse',
    'technocity',
    'yantibersaudara',
    'soundsofsiam',
    'djamleelii'
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