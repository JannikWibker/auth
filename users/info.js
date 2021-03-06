const db = require('../db.js')

const sendFailure = (res) => res.status(500).json({
  message: 'retrieving user data failed',
  status: 'failure'
})

const sendSuccess = (res, user) => res.status(200).json({
  message: 'retrieved user data successfully',
  status: 'success',
  user: user
})

module.exports = (req, res) => {
  const username = req.params.username || req.body.username

  if(username === undefined) {
    sendSuccess(res, req.user)
  } else if(username === req.user.username) {
    sendSuccess(res, req.user)
  } else if(req.user.account_type === 'admin') {
    db.getUserIfExists(username, (err, user) => {
      if(err) sendFailure(res)
      else    sendSuccess(res, user)
    })
  } else {
    db.getUserLimitedIfExists(username, (err, user) => {
      if(err) sendFailure(res)
      else    sendSuccess(res, user)
    })
  }

}