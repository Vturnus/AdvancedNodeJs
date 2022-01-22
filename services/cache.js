const mongoose = require('mongoose')
const redis = require('redis')
const keys = require('../config/keys')


const client = redis.createClient({
    host: keys.redisUrl,
    port: keys.redisPort
})
client.connect().then()

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true
    this.hashKey = JSON.stringify(options.key || 'default')
    return this
}


mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))

    // See if we have a value for the 'key' in redis if we do,
    const cacheValue = await client.hGet(this.hashKey, key)


    // Return that
    if (cacheValue) {
        const doc = JSON.parse(cacheValue)
        return Array.isArray(doc)
            ? doc.map(d => this.model(d))
            : new this.model(doc)
    }
    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments)

    await client.hSet(this.hashKey, key, JSON.stringify(result), 'EX', 10)
    return result

}

module.exports = {
    async clearHash(hashKey) {
        await client.del(JSON.stringify(hashKey))
    }
}