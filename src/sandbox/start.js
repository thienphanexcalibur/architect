let chalk = require('chalk')
let db = require('./db')
let env = require('./env')
let events = require('./events')
let http = require('./http')
let series = require('run-series')
let init = require('../util/init')

module.exports = function start(callback) {
  let client
  let bus
  series([
    // hulk smash
    function _banner(callback) {
      init(function _init(err) {
        if (err) callback(err)
        else callback()
      })
    },
    function _db(callback) {
      // start dynalite with tables enumerated in .arc
      // TODO: consider the case where an arc app does not have the db, i.e.
      // pure @static app
      client = db.start(function() {
        let start = chalk.grey(chalk.green.dim('✓'), '@tables created in local database')
        console.log(`${start}`)
        callback()
      })
    },
    function _env(callback) {
      // populates process.env from .arc-env
      env(callback)
    },
    function _events(callback) {
      // listens for arc.event.publish events on 3334 and runs them in a child process
      // TODO: consider the case where an arc app does not use events, i.e.
      // pure @static app
      bus = events.start(function() {
        let start = chalk.grey(chalk.green.dim('✓'), '@events pub/sub ready on local event bus')
        console.log(`${start}`)
        callback()
      })
    },
    function _http(callback) {
      // vanilla af http server that mounts routes defined by .arc
      // TODO: consider the case where an arc app does not have http handlers
      // defined, i.e. pure @static app
      http.start(function() {
        let start = chalk.grey('\n', 'Started HTTP "server" @ ')
        let end = chalk.cyan.underline(`http://localhost:${process.env.PORT}`)
        console.log(`${start} ${end}`)
        callback()
      })
    }
  ],
  function _done(err) {
    if (err) throw err
    function end() {
      client.close()
      http.close()
      bus.close()
    }
    // return a function to shut everything down if this is beinng used as a module
    if (callback) callback(end)
  })
}

