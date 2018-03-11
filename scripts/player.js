var MINI = require('minified');
var $ = MINI.$;

var View = {
    $el: {
        play: $('.Play')
    },

    loadEventBindings: function()   {
        this.$el.play.onClick(function() {
            Player.stationRequest(this.get('@data-station-id'));
        }, this);
    },

    init: function()    {
        this.loadEventBindings();
        this.Radio.init();
    }
}


View.Radio = {
    $el: {
        stationArt: $('.Radio__StationArt'),
        stationName: $('.Radio__Station'),
        trackName: $('.Radio__TrackName'),
        trackArtist: $('.Radio__TrackArtist'),
        controlButton: $('.Radio__Button'),
        radioImage: $('.Radio__Model--Image')
    },

    updateInfo: function(stationArt, stationName, trackArtist, trackName)  {
        this.$el.stationArt.set('@src', '/images/stations/' + stationArt);
        this.$el.stationName.set('innerHTML', 'Current playlist - ' + stationName);
        this.$el.trackName.set('innerHTML', trackName);
        this.$el.trackArtist.set('innerHTML', trackArtist);
    },

    loadEventBindings: function()   {
        this.$el.controlButton.on('click', function()   {
            switch(this.get('@data-control'))   {
                case 'play':
                    Player.youtube.playVideo();
                    this.set('@src', '/images/pause.svg');
                    this.set('@data-control', 'pause');
                    break;
                case 'pause':
                    Player.youtube.pauseVideo();
                    this.set('@src', '/images/play.svg');
                    this.set('@data-control', 'play');
                    break;
                case 'skip':
                    Player.cueNextTrack();
                    break;
            }
        });
    },

    showRadioImage: function()  {
        var source = [
            '/images/radio/banjo.png',
            '/images/radio/melinda.png',
            '/images/radio/whitney.png'
        ];

        var selected = source[Math.floor(Math.random() * Math.floor(3))];
console.log(selected);
        this.$el.radioImage.set('src', selected);
    },

    init: function()    {
        this.showRadioImage();
        this.loadEventBindings();
    }
};

var Player = {
    youtube: null,

    queue: [],
    station: null,
    tracks: [],
    currentTrackIndex: -1,

    initQueue: function()   {
        for(var name in Stations)    {
            this.queue.push(Stations[name]);
        }
    },

    getStation: function()  {
        var currentStation = this.queue.shift();
        this.station = currentStation;
        this.tracks = currentStation.songs;
        this.currentTrackIndex = -1;
        this.queue.push(currentStation);
    },

    stationRequest: function(stationId)  {
        if(!this.isCurrentStation(stationId))   {
            var stationIndex = this.findStationIndex(stationId);
            if(stationIndex >= 0)    {
                this.youtube.stopVideo();
                this.queuePriority(stationIndex);
                this.getStation();
                this.cueNextTrack();
            }
        }
    },

    queuePriority: function(index)  {
        var station = this.queue[index];
        this.queue.splice(index, 1);
        this.queue.unshift(station);
    },

    isCurrentStation: function(id)    {
        return (id === this.station.id) ? true : false;
    },
    
    findStationIndex: function(id)    {
        function isStation(station)  {
            return station.id === id;
        }
        return this.queue.findIndex(isStation);
    },

    cueNextTrack: function()   {
        this.currentTrackIndex++;
        if(this.currentTrackIndex < this.tracks.length)    {
            var song = this.tracks[this.currentTrackIndex];
            this.youtube.loadVideoById(song.source, 0, "large");
            View.Radio.updateInfo(this.station.art, this.station.name, song.artist, song.track);
            console.log('• Currently listening to ' + song.track + ' by ' + song.artist);
        }else {
            this.getStation();
            this.cueNextTrack();
        }
    },

    resetPlayerVolume: function() {
      this.youtube.unMute();
      this.youtube.setVolume = 100;
    },

    onPlayerReady: function()   {
      this.resetPlayerVolume();
      this.initQueue();
      this.getStation();
      this.cueNextTrack();
    },

    onStateChange: function(state)   {
        switch(state.data)  {
            case 0:
                this.cueNextTrack();
                break;
            case 5:
                this.youtube.playVideo();
                break;
        }
    },

    init: function()    {
      console.log('Songs currated by Jaison');
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
}

function initYoutube()  {
    var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        
    var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() { Player.init(); }

/** Initializing */
initYoutube();
$.ready(function(){  View.init(); });