let https = require('https');
let process = require('process');

let releaseId = (process.argv[2]) ? process.argv[2] : false;
let trackIds = (process.argv[3]) ? process.argv[3].split(',') : [];

if(!releaseId)  {
    console.log("");
    console.log("Invalid params!!!");
    console.log("");
    console.log("discogs release_id track_no,track_no");
    console.log("discogs 75943 1,3,7");
    console.log("");
    process.exit(1);
}

process.stdout.write('\033c');

console.log("");
console.log("Discogs");
console.log("=======");
console.log("> Search: r" + releaseId);
console.log("> GET: https://api.discogs.com/releases/" + releaseId);

const httpsOptions = {
    hostname: 'api.discogs.com',
    path: '/releases/' + releaseId,
    headers: { 'User-Agent': 'Mozilla/5.0' }
};

https.get(httpsOptions, function(res){
    var body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => discogsAPIParser(JSON.parse(body)));
}).on('error', (e) => console.log("Got an error: ", e));

function getTrackList(response) {
    if(trackIds.length === 0) {
        return response.tracklist.map((x) => { return x.title; })
    }

    return trackIds.map((x) => { return response.tracklist[x - 1].title; });
}

function discogsAPIParser(response) {
    generateTrackEmbed({
        id: response.id,
        uri: response.uri,
        album: response.title,
        artist: response.artists.map((x) => { return x.name; }),
        genre: response.genres.concat(response.styles, [response.year]).join(" • "),
        tracks: getTrackList(response)
    });
}

function pbcopy(data) {
    const proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(data); proc.stdin.end();
}

function generateTrackEmbed(data)   {
    let trackDetails = data.tracks.map((x) => { return trackSnippet.replace("{name}", x) });

    pbcopy(trackEmbedSnippet
        .replace("{title}", data.album)
        .replace("{artist}", data.artist)
        .replace("{genre}", data.genre)
        .replace("{tracks}", trackDetails.join('')));

    console.log("> Success: " + data.uri);
    console.log("> TrackEmbed: Copied");
    console.log("> Done");
    console.log("");
    console.log(data.album);
    console.log("by " + data.artist);
    console.log(data.genre);
    console.log("");
    data.tracks.forEach((x, i) => {
        console.log(((!trackIds.length) ? i+1 : trackIds[i]) + ". " + x);
    });
    console.log("");
}

let trackEmbedSnippet = "<li class=\"TrackEmbed\">\n" +
    "   <div class=\"TrackEmbed__Details\">\n" +
        "   <img class=\"TrackEmbed__AlbumArt\" src=\"/images/stations/\"/>\n" +
        "   <div class=\"TrackEmbed__Meta\">\n" +
            "   <h4 class=\"TrackEmbed__AlbumName\">{title}</h4>\n" +
            "   <p class=\"TrackEmbed__ArtistName\">by {artist}</p>\n" +
            "   <p class=\"TrackEmbed__Style\">{genre} </p>\n" +
        "   </div>\n" +
    "   </div>\n" +
    "   <ol class=\"TrackEmbed__Tracks\">\n{tracks}    </ol>\n" +
"</li>";

let trackSnippet = "\t<li><p>{name}</p><i class=\"Play\" data-track-id=\"\">PLAY</i></li>\n";