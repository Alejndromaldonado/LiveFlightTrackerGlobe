const axios = require('axios');

exports.handler = async (event, context) => {
  const { token } = event.queryStringParameters || {};
  
  try {
    const response = await axios.get('https://opensky-network.org/api/states/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: 'Failed to fetch OpenSky states' })
    };
  }
};
