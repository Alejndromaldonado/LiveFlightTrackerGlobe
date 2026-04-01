exports.handler = async (event, context) => {
  const { token } = event.queryStringParameters || {};
  
  try {
    console.log('SERVERLESS: Fetching states...');
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'OpenSky API Error', status: response.status })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('SERVERLESS API CRASH:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch OpenSky states', message: error.message })
    };
  }
};
