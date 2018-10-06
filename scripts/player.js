const MINI = require('minified');
const $ = MINI.$;

function initYoutube()  {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";

    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() { Player.init(); }

function findTrackPositionById(id, playlist)  {
    return playlist.map(function(e) { return e.id; }).indexOf(id);
}

function getTrackInfo(needle, playlist) { return playlist[needle]; }

const View = {
    $el: { play: $('.Play') },

    loadEventBindings: function()   {
        this.$el.play.onClick(function() {
            Player.goTo(findTrackPositionById(this.get('@data-track-id'), Playlist));
            View.Radio.updateTrackDisplay();
        }, this);
    },

    init: function()    {
        this.loadEventBindings();
        this.Radio.init();
    }
};

View.Radio = {
    $el: {
        albumArt: $('.Radio__StationArt'),
        trackName: $('.Radio__TrackName'),
        trackArtist: $('.Radio__TrackArtist'),
        controlButton: $('.Radio__Button'),
        radioImage: $('.Radio__Model--Image')
    },

    updateTrackDisplay: function()  {
        const track = getTrackInfo(Player.getNeedlePosition(), Playlist);
        this.$el.albumArt.set('@src', '/images/stations/' + track.albumart);
        this.$el.trackName.set('innerHTML', track.name);
        this.$el.trackArtist.set('innerHTML', track.artist);
    },

    _togglePlayButton: function(play, el)   {
        el.set('@src', (play) ? '/images/play.svg' : '/images/pause.svg');
        el.set('@data-control', (play) ? 'play' : 'pause');
    },

    loadEventBindings: function()   {
        const that = this;
        this.$el.controlButton.on('click', function()   {
            switch(this.get('@data-control'))   {
                case 'play':
                    Player.play();
                    that._togglePlayButton(false, this);
                    break;
                case 'pause':
                    Player.pause();
                    that._togglePlayButton(true, this);
                    break;
                case 'next':
                    Player.next();
                    that.updateTrackDisplay();
                    break;
                case 'previous':
                    Player.previous();
                    that.updateTrackDisplay();
                    break;
            }
        });
    },

    showRandomRadioImage: function()  {
        const source = [
            '/images/radio/banjo.png',
            '/images/radio/melinda.png',
        ];

        this.$el.radioImage.set('src', source[Math.floor(Math.random() * Math.floor(2))]);
    },

    init: function()    {
        this.showRandomRadioImage();
        this.updateTrackDisplay();
        this.loadEventBindings();
    }
};

const Player = {
    youtube: null,
    needle: 0,

    load: function(source)   { this.youtube.loadVideoById(source, 0, "large") },

    play: function()    { return Player.youtube.playVideo(); },

    pause: function()   { return Player.youtube.pauseVideo(); },

    next: function()    {
        this.needle = (this.needle + 1 === Playlist.length) ? 0 : this.needle + 1;
        this.load(getTrackInfo(this.needle, Playlist).source);
        return getTrackInfo(this.needle, Playlist);
    },

    previous: function()    {
        this.needle = (this.needle - 1 === -1) ? Playlist.length - 1 : this.needle - 1;
        this.load(getTrackInfo(this.needle, Playlist).source);
        return getTrackInfo(this.needle, Playlist);
    },

    goTo: function(needle) {
        this.needle = needle;
        this.load(getTrackInfo(this.needle, Playlist).source);
    },

    getNeedlePosition: function()   { return this.needle; },

    setVolumeToMax: function() {
        this.youtube.unMute();
        this.youtube.setVolume = 100;
    },

    onPlayerReady: function()   {
        this.setVolumeToMax();
        this.load(getTrackInfo(this.needle, Playlist).source);
    },

    /* States { 0: ended, 5: video cued } */
    onStateChange: function(state)   {
        switch(state.data)  {
            case 0:
                this.next();
                View.Radio.updateTrackDisplay();
                break;
            case 5:
                this.play();
                break;
        }
    },

    init: function()    {
        this.youtube = new YT.Player('player', {
            height: '1',
            width: '1',
            videoId: '',
            events: {
                'onReady': this.onPlayerReady.bind(this),
                'onStateChange': this.onStateChange.bind(this)
            }
        });
    }
};

initYoutube();
$.ready(function(){
    View.init();

    console.log('Currated flavours for your soul. \n' +
        'Bon Appétit!');
});