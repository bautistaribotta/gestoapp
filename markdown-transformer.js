const upstream = require('@expo/metro-config/babel-transformer');

/** Convierte cada .md en un módulo que exporta su contenido como texto. */
module.exports = {
  ...upstream,
  transform({ filename, src, ...rest }) {
    if (filename.endsWith('.md')) {
      src = `export default ${JSON.stringify(src)};`;
    }
    return upstream.transform({ filename, src, ...rest });
  },
};
