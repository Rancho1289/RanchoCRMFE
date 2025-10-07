module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/@react-aria\/ssr/ // 이 모듈을 source-map-loader에서 제외
        ],
      },
    ],
  },
};
