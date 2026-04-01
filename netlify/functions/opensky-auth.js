const axios = require('axios');

exports.handler = async (event, context) => {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', OPENSKY_CLIENT_ID);
    params.append('client_secret', OPENSKY_CLIENT_SECRET);

    const response = await axios.post(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: 'Failed to authenticate with OpenSky' })
    };
  }
};
