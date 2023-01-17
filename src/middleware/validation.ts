const crypto = require('crypto')

const text = 'I love cupcakes'
const key = process.env.API_SECRET

crypto.createHmac('sha1', key)
  .update(text)
  .digest('hex')