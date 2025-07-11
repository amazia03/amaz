module.exports = function (eleventyConfig) {
  // Menyalin folder statis ke hasil akhir
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("foto");
  eleventyConfig.addPassthroughCopy("artikel"); // <-- Pastikan ini ada

  // Mengatur Nunjucks sebagai mesin template
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
  };
};
