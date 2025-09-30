module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    'autoprefixer',
    'postcss-preset-env',
    // 现代化CSS功能
    'postcss-custom-properties',
    'postcss-custom-media',
    'postcss-nesting',
    // 生产环境优化
    process.env.NODE_ENV === 'production' && [
      'cssnano',
      {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          colormin: true,
          calc: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          mergeRules: true,
          minifyFontValues: true,
          minifySelectors: true,
          reduceIdents: true,
          svgo: true,
        }]
      }
    ]
  ].filter(Boolean)
};