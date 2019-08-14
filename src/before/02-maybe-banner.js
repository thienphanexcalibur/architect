let utils = require('@architect/utils')
let ver = require('../../package.json').version

module.exports = function maybeBanner() {
  let version = `Architect ${ver}`
  try {
    utils.readArc()
    utils.banner({version})
  }
  catch(e) {
    null
  }
}
