// Usage: node index.js file.md

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const ejs = require('ejs');
const matter = require('gray-matter');

const markdownFilePath = process.argv[2];
if (!markdownFilePath) {
    console.log('Please provide a Markdown file path as a command-line argument.');
    process.exit(1);
}

marked.use({ gfm: true });

const markdownFileContent = fs.readFileSync(markdownFilePath, 'utf-8');
const { content, data } = matter(markdownFileContent);
const htmlContent = marked.parse(content);
const template = fs.readFileSync('template.ejs', 'utf-8');

const title = data.Title || 'Untitled';
const description = data.Description || 'Untitled';
const date = data.Date || 'Untitled';
const tags = data.tags || 'general';

const filledTemplate = ejs.render(template, { title, description, date, tags, htmlContent });

const slug = data.Slug || 'default';

const htmlFilename = `${slug}.html`;

fs.writeFileSync(htmlFilename, filledTemplate, 'utf-8');

console.log(`Conversion and templating completed. Output saved to ${htmlFilename}`);