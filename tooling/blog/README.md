# Blog

Poor mans blog post generator. This script simply takes the markdown and parse it into html and the use the article template to create the html file. To run the script

```
$ node index.js <article-source.md>
```

## Source Markdown Setup

For better parsing, you should provide a metadata about the article as a YAML front matter in the article markdown file. 

```
---
Title: 
Description: 
Date: 
Slug: 
---
```