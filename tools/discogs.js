let https = require('https');
let ora = require('ora');
let process = require('process');
let argv = require('minimist')(process.argv.slice(2));

let config = require('./config');

function searchDiscogs(releaseId) {
    const httpsOptions = {
        hostname: 'api.discogs.com',
        path: '/releases/' + releaseId + '?key=' + config.discogs.key + '&secret=' + config.discogs.secret,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    https.get(httpsOptions, function(res){
        var body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            spinner.stop();
            onReleaseFound(releaseId, JSON.parse(body))
        });
    }).on('error', (e) => showConnectionnErrorPrompt());
}

function onReleaseFound(releaseId, response) {
    if(response.hasOwnProperty('message'))  {
        showReleaseNotFoundPrompt();
        let releaseId = getRandomReleaseId();
        showSearchingPrompt(releaseId);
        spinner.start();
        searchDiscogs(releaseId);
        return true;
    }

    if(response.status === 'Draft') {
        showDraftFoundPrompt();
        let releaseId = getRandomReleaseId();
        showSearchingPrompt(releaseId);
        spinner.start();
        searchDiscogs(releaseId);
        return true;
    }

    showSuccessPrompt(response.uri);
    let releaseDetails = responseParser(response);

    if(trackNos.length > 0) {
        scaffoldTrackEmbed(releaseDetails);
        showTrackEmbedPrompt(releaseDetails.tracks);
    }

    showReleaseDetails(releaseDetails);
    process.exit(1);
}

function responseParser(response) {
    return {
        id: response.id,
        uri: response.uri,
        album: response.title,
        artist: response.artists.map((x) => { return x.name; }),
        genre: (response.hasOwnProperty('genres')) ? response.genres : [],
        style: (response.hasOwnProperty('styles')) ? response.styles : [],
        country: response.country,
        year: response.year,
        tracks: response.tracklist.map((x) => { return x.title; }),
        imageUrl: (response.hasOwnProperty('images')) ? response.images[0].uri : false,
        community: response.community
    };
}

function scaffoldTrackEmbed(data) {
    let trackListingHTML = trackNos.filter( x => data.tracks[x-1] )
        .map(x => { return data.tracks[x-1] })
        .map((x) => { return trackSnippetTpl().replace("{name}", x) })
        .join('');

    pbcopy(trackEmbedTpl()
        .replace("{title}", data.album)
        .replace("{artist}", data.artist)
        .replace("{genre}", data.genre.concat(data.style, [data.year]).join(" • "))
        .replace("{tracks}", trackListingHTML));

}

function pbcopy(data) {
    const proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(data); proc.stdin.end();
}

function showHeaderPrompt() {
    console.log("");
    console.log("Discogs");
    console.log("=======");
}

function showSearchingPrompt(releaseId)  {
    console.log("> RELEASE: " + releaseId);
    console.log("> GET DETAILS: https://api.discogs.com/releases/" + releaseId);
}

function showSuccessPrompt(url) {
    console.log("> SUCCESS: " + url);
}

function showTrackEmbedPrompt(tracks) {
    let trackfound = trackNos.filter(x => tracks[x - 1]);
    if(trackfound.length > 0) {
        console.log("> TRACKEMBED: [" + trackfound.join(',') + "] Copied to clipboard");
    }else   {
        console.log("> TRACKEMBED: Invalid track numbers");
    }
}

function showReleaseDetails(data) {
    console.log("");
    console.log("");
    console.log("Album ...... " + data.album);
    console.log("Artist ..... " + data.artist);
    console.log("");
    console.log("Genre ...... " + data.genre.join(','));
    console.log("Style ...... " + data.style.join(','));
    console.log("Country .... " + ((data.country) ? data.country : ''));
    console.log("Year ....... " + ((data.year) ? data.year : ''));
    console.log("");
    console.log("Rating ..... " + data.community.rating.average + " ★ from " + data.community.rating.count + " ㋡");
    console.log("Have/Want .. " + data.community.have + "/" + data.community.want);
    console.log("");
    data.tracks.forEach((x, i) => { console.log((i+1) + ". " + x) });
    console.log("");
    console.log("");
}

function showReleaseNotFoundPrompt() {
    console.log("> FAILED: Release Not Found");
}

function showDraftFoundPrompt() {
    console.log("> FORBIDDEN: The release is in draft mode");
}

function showConnectionnErrorPrompt() {
    console.log("> ERROR: No Internnet Connection");
    console.log("");
}

function trackEmbedTpl() {
    return (
        "<li class=\"TrackEmbed\">\n" +
        "   <div class=\"TrackEmbed__Details\">\n" +
        "   <img class=\"TrackEmbed__AlbumArt\" src=\"/images/stations/\"/>\n" +
        "   <div class=\"TrackEmbed__Meta\">\n" +
        "   <h4 class=\"TrackEmbed__AlbumName\">{title}</h4>\n" +
        "   <p class=\"TrackEmbed__ArtistName\">by {artist}</p>\n" +
        "   <p class=\"TrackEmbed__Style\">{genre} </p>\n" +
        "   </div>\n" +
        "   </div>\n" +
        "   <ol class=\"TrackEmbed__Tracks\">\n{tracks}    </ol>\n" +
        "</li>"
    );
}

function trackSnippetTpl()  {
    return (
        "\t<li><p>{name}</p><i class=\"Play\" data-track-id=\"\">PLAY</i></li>\n"
    );
}

function getRandomReleaseId()   {
    return Math.floor(Math.random() * 11001697) + 1
}

process.stdout.write('\033c');

let releaseId = argv._[0] || getRandomReleaseId();
let trackNos = (argv.hasOwnProperty('t')) ? argv.t.toString().split(',') : [];
let spinner = ora();

showHeaderPrompt();
showSearchingPrompt(releaseId);
spinner.start();
searchDiscogs(releaseId);