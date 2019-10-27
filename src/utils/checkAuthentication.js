const jwt = require('jsonwebtoken');
const APP_SECRET = process.env.APP_SECRET;

function checkAuthentication(context) {
  const authorization = context.request.req.get('Authorization');

  if (authorization) {
    const token = authorization.replace('Bearer ', '');
    try {
      const { userId } = jwt.verify(token, APP_SECRET);
      return userId;
    } catch (error) {
      console.log(error);
      throw new Error('Not authenticated');
    }
  }

  throw new Error('Not authenticated');
}

module.exports = checkAuthentication;
