const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const getDateInRu = require("./src/scripts/utilities/getDateInRU");
const util = require('util');
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(cacheBuster({}));

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addFilter("readableDate", dateObj => {
    return getDateInRu(dateObj);
  });

  eleventyConfig.addFilter("readableEpisodeDuration", time => {
    const timeElements = time.split(':');

    if (timeElements.length === 2) {
      return `${+timeElements[0]} мин`;
    } else {
      return `${+timeElements[0]} ч ${+timeElements[1]} мин`;
    }
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addFilter('dump', obj => {
    return `<pre>${util.inspect(obj)}</pre>`;
  });

  eleventyConfig.addCollection("episodes", function (collection) {
    const coll = collection.getFilteredByTag("episodes");

    for (let i = 0; i < coll.length; i++) {
      const prevEpisode = coll[i - 1];
      const nextEpisode = coll[i + 1];

      coll[i].data["prevEpisode"] = prevEpisode;
      coll[i].data["nextEpisode"] = nextEpisode;
    }

    return coll;
  });

  eleventyConfig.addCollection("podcastInterview", function (collectionApi) {
    return collectionApi.getFilteredByTags("episodes", "interview");
  });

  eleventyConfig.addCollection("podcastTeacher", function (collectionApi) {
    return collectionApi.getFilteredByTags("episodes", "teacher");
  });

  eleventyConfig.addCollection("podcastPhilosophy", function (collectionApi) {
    return collectionApi.getFilteredByTags("episodes", "philosophy");
  });

  eleventyConfig.addCollection("podcastVegetarian", function (collectionApi) {
    return collectionApi.getFilteredByTags("episodes", "vegetarian");
  });

  eleventyConfig.addCollection("podcastReligions", function (collectionApi) {
    return collectionApi.getFilteredByTags("episodes", "religions");
  });

  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/build");
  eleventyConfig.addPassthroughCopy("src/dist");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/manifest.webmanifest");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#"
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about those.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`
    // pathPrefix: "/",

    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    // These are all optional, defaults are shown:
    dir: {
      input: "src",
      includes: "includes",
      data: "data",
      output: "_site"
    }
  };
};
