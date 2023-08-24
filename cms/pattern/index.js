const fs = require('fs');
const path = require('path');
const readline = require('readline');
const cheerio = require('cheerio');

const config = require('./config');

const { question } = readline;

const grandParentFolderPath = path.resolve(__dirname, '../..'); // Adjust as needed

function getHTMLFiles(dir) {
    const files = fs.readdirSync(dir);
    const htmlFiles = [];

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && file !== 'node_modules' && file !== 'cms') {
            htmlFiles.push(...getHTMLFiles(filePath));
        } else if (stat.isFile() && path.extname(file) === '.html') {
            htmlFiles.push(filePath);
        }
    }

    return htmlFiles;
}

async function findAndReplaceInHTML(filePaths, findHTML, replaceHTML) {
    const matchingFiles = [];

    for (const filePath of filePaths) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(fileContent);

        const foundElements = $(config.findSelector);
        if (foundElements.length > 0) {
            matchingFiles.push(filePath);
        }
    }

    if (matchingFiles.length === 0) {
        console.log('No matching files found.');
        return;
    }

    console.log('Matching files:');
    if (matchingFiles.length > 0) console.log(matchingFiles.length + ' files found.');
    console.log('- ' + matchingFiles.join('\n- '));

    const userResponse = await questionAsync(`\n Do you want to replace the content in all matching files? (yes/no): `);
    if (userResponse.toLowerCase() === 'yes') {
        for (const filePath of matchingFiles) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const $ = cheerio.load(fileContent);

            const foundElements = $(config.findSelector);
            foundElements.replaceWith(config.replaceContent);

            fs.writeFileSync(filePath, $.html(), 'utf-8');
            console.log(`Content replaced in: ${filePath}`);
        }
    } else {
        console.log('Content not replaced in any files.');
    }
}

function questionAsync(prompt) {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(prompt, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

// const findHTML = fs.readFileSync(path.join(__dirname, 'find.html'), 'utf-8');
// const replaceHTML = fs.readFileSync(path.join(__dirname, 'replace.html'), 'utf-8');

const htmlFiles = getHTMLFiles(grandParentFolderPath);
findAndReplaceInHTML(htmlFiles);