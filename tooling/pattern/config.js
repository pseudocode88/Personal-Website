module.exports = {
    findSelector: '.Navigation',
    replace: 'child',
    replaceContent: `
        <li class="Navigation__Item">
            <a class="Navigation__Link" href="/">Home</a>
        </li>
        <li class="Navigation__Item">
            <a class="Navigation__Link" href="/music-mag.html">Music Mag</a>
        </li>
        <li class="Navigation__Item">
            <a class="Navigation__Link" href="/radfadmad.html">Rad Fad Mad</a>
        </li>
        <li class="Navigation__Item Navigation__Item--selected">
            <a class="Navigation__Link" href="/writings.html">Writings</a>
        </li>
        <li class="Navigation__Item">
            <a class="Navigation__Link" href="/projects.html">Projects</a>
        </li>
        <li class="Navigation__Item">
            <a class="Navigation__Link" href="/about.html">About</a>
        </li>
        <li class="Navigation__Item">
            <a class="Navigation__Link" href="/about.html">NFT</a>
        </li>
        `
};