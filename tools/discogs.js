let https = require('https');
let process = require('process');
let argv = require('minimist')(process.argv.slice(2));

function searchDiscogs(releaseId) {
    const httpsOptions = {
        hostname: 'api.discogs.com',
        path: '/releases/' + releaseId + '?key=YNoLiWCOwTgGWeKngZzN&secret=vVjhSQXuHjpUtYXVTOxFiVIMsVltCEmN',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    https.get(httpsOptions, function(res){
        var body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => onReleaseFound(releaseId, JSON.parse(body)));
    }).on('error', (e) => showConnectionnErrorPrompt());
}

function onReleaseFound(releaseId, response) {
    if(response.hasOwnProperty('message'))  {
        showReleaseNotFoundPrompt();
        process.exit(1);
    }

    if(response.status === 'Draft') {
        showDraftFoundPrompt();
        process.exit(1);
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
        imageUrl: (response.hasOwnProperty('images')) ? response.images[0].uri : false
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
    console.log("Search: r" + releaseId);
    console.log("GET: https://api.discogs.com/releases/" + releaseId);
}

function showSuccessPrompt(url) {
    console.log("Success: " + url);
}

function showTrackEmbedPrompt(tracks) {
    let trackfound = trackNos.filter(x => tracks[x - 1]);
    if(trackfound.length > 0) {
        console.log("TrackEmbed: [" + trackfound.join(',') + "] Copied to clipboard");
    }else   {
        console.log("TrackEmbed: Invalid track numbers");
    }
}

function showReleaseDetails(data) {
    console.log("");
    console.log("Album: " + data.album);
    console.log("Artist: " + data.artist);
    console.log("Genre: " + data.genre.join(','));
    console.log("Style: " + data.style.join(','));
    console.log("Country: " + ((data.country) ? data.country : ''));
    console.log("Year: " + ((data.year) ? data.year : ''));
    console.log("");
    data.tracks.forEach((x, i) => { console.log((i+1) + ". " + x) });
    console.log("");
}

function showReleaseNotFoundPrompt() {
    console.log("Failed: Release Not Found");
    console.log("");
}

function showDraftFoundPrompt() {
    console.log("Forbidden: The release is in draft mode");
    console.log("");
}

function showConnectionnErrorPrompt() {
    console.log("Error: No Internnet Connection");
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

let releaseId = (argv._.length <= 0) ? getRandomReleaseId() : argv._[0];
let trackNos = (argv.hasOwnProperty('t')) ? argv.t.toString().split(',') : [];

showHeaderPrompt();
showSearchingPrompt(releaseId);
searchDiscogs(releaseId);