// file: .eleventy.js

module.exports = function (eleventyConfig) {
  // Baris "addPassthroughCopy" Anda biarkan saja
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("foto");
  eleventyConfig.addPassthroughCopy("artikel");

  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    // HAPUS LOGIKA KONDISIONAL DAN LANGSUNG ATUR PATH INI
    pathPrefix: "/amaz/",
  };
};
