const fetch = require('node-fetch')
const analytics_server = require('dotenv').config().parsed["ANALYTICS_SERVER"]

module.exports.log = ({ category, title, log, metadata }) => fetch(analytics_server + '/log/auth', {
  method: 'POST',
  body: JSON.stringify({
    category, title, log, metadata
  }),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

module.exports.event = ({ category, title, data }) => fetch(analytics_server + '/analytics/auth', {
  method: 'POST',
  body: JSON.stringify({
    category, title, data
  }),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

module.exports.bug = ({ category, error, metadata }) => fetch(analytics_server + '/bug/auth', {
  method: 'POST',
  body: JSON.stringify({
    category, error, metadata
  }),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})