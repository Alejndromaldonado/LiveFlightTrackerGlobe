const axios = require('axios');

exports.handler = async (event, context) => {
  const { token } = event.queryStringParameters || {};
  
  try {
    console.log('SERVERLESS: Fetching flights from OpenSky API...');
    const response = await axios.get('https://opensky-network.org/api/states/all', {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('SERVERLESS API ERROR:', error.response?.status, error.message);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch OpenSky states',
        status: error.response?.status
      })
    };
  }
};
