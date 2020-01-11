// This is default stack. We need this to work-around yarn PnP resolution issues.
module.exports = {
  stack: [
    require("lws-basic-auth"),
    require("lws-body-parser"),
    require("lws-request-monitor"),
    require("lws-log"),
    require("lws-cors"),
    require("lws-json"),
    require("lws-compress"),
    require("lws-rewrite"),
    require("lws-blacklist"),
    require("lws-conditional-get"),
    require("lws-mime"),
    require("lws-range"),
    require("lws-spa"),
    require("lws-static"),
    require("lws-index")
  ]
};
