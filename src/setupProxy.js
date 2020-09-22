// eslint-disable-next-line import/no-extraneous-dependencies
const { createProxyMiddleware } = require("http-proxy-middleware")

const { IS_REMOTE_ENV, REMOTE_IP, REMOTE_HOST } = process.env

module.exports = function addProxy(app) {
  if (IS_REMOTE_ENV === "true") {
    if (!REMOTE_HOST) {
      throw new Error("Cannot proxy to remote: specify REMOTE_HOST in .env.development file")
    }
    if (!REMOTE_IP) {
      throw new Error("Cannot proxy to remote: specify REMOTE_IP in .env.development file")
    }

    app.use("/api",
      createProxyMiddleware({
        headers: {
          Host: REMOTE_HOST,
        },
        target: `https://${REMOTE_IP}`,
        changeOrigin: true,
        secure: false,
      }))
  }
}
