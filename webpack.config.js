module.exports = {
    plugins: [
      new ReactRefreshPlugin({
        overlay: {
          useURLPolyfill: true,
        },
      }),
    ],
  };