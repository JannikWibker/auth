const db = require('../db.js')

module.exports = ({ registerTokenCache, validateRegisterToken, signJwtNoCheck, generateRefreshToken, manualAddToCache }) => (req, res) => {
  const data = req.body
  if(data.username && data.password && data.first_name && data.last_name && data.email) {

    let account_type = 'default'
    let registerTokenStatus
    let metadata
    
    if(data.register_token) {
      const registerTokenData = validateRegisterToken(data.register_token)
      if(reigsterTokenData.status !== 'failure' && registerTokenCache.get(registerTokenData.id) !== null) {
        account_type = registerTokenData.account_type || 'default'
        metadata = registerTokenData.metadata || {}
        registerTokenStatus = 'register token used successfully'
        // I strongly believe that this should NOT be `serviceCache`, it should probably be `registerTokenCache`.
        // changed it now, still have to find out if this is actually the right thing.
        registerTokenCache.del(registerTokenData.id)
      } else {
        registerTokenStatus = "supplied register token was not valid, could not be used"
      }
    }
    
    let password = data.password
    const getRefreshToken = req.body.getRefreshToken || password.startsWith('Get-Refresh-Token:')

    if(getRefreshToken && password.startsWith('Get-Refresh-Token:'))
      password = password.substring('Get-Refresh-Token:'.length)

    // return created user information
    db.addUser(data.username, password, data.first_name, data.last_name, data.email, account_type, metadata, (err, row) => {
      if(err) {
        res.json({ message: err, status: 'failure' })
      } else {
        console.log('[' + format_date() + '][user/add] "' + row.lastID, row)

        const payload = { id: row.lastID, username: data.username, iss: 'accounts.jannik.ml', account_type: account_type, '2fa_enabled': row['2fa_enabled'] }
        const token = signJwtNoCheck(payload)

        let refreshToken
        if(getRefreshToken) refreshToken = generateRefreshToken(data.username, row.lastID)
        
        console.log('[' + format_date() + '][user/add] "' + token.substring(0, 96), payload)

        manualAddToCache(row.lastID, token, payload, 30 * 60 * 1000)
          .then(() =>
            res.json({
              message: 'account creation successful',
              status: 'success',
              token: token,
              data: {
                username: data.username,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                account_type: account_type
              },
              ...(getRefreshToken ? { refreshToken: refreshToken } : {}),
              ...(registerTokenStatus ? { registerTokenStatus: registerTokenStatus } : {})
            })
          )
      }
    })
  } else {
    res.json({ message: 'supply "username", "password", "first_name", "last_name" and "email"', status: 'failure' })
  }
}