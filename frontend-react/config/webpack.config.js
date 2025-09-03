// Add this to the exports object
module.exports = {
    // ... existing config ...
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "querystring": require.resolve("querystring-es3"),
        "url": require.resolve("url/"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
        "os": require.resolve("os-browserify/browser"),
        "fs": false,
        "net": false
      }
    }
  }