const { clearHash } = require('../services/cache')

module.exports = async (req, res, next) => {
    await next()

    await clearHash(req.user.id)

}