// file: .eleventy.js

module.exports = function (eleventyConfig) {
  // Cek apakah mode produksi atau bukan
  const isProduction = process.env.NODE_ENV === "production";

  // Menyalin folder statis ke hasil akhir
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("foto");

  eleventyConfig.addPassthroughCopy("artikel");

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
    // Atur pathPrefix hanya untuk mode produksi
    pathPrefix: isProduction ? "/amaziakristanto/" : "/",
  };
};
