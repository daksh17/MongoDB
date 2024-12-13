/*
 * Script to pause a specific MongoDB Atlas cluster
 */

exports = async function() {
    const clusterName = "myRS";
    const projectID = "650cb3b378de3c289f06572c";
  
  // Retrieve API credentials from App Services Values
  const username = await context.values.get("atlasPublicKey");
  const password = await context.values.get("atlasPrivateKey");
  
  if (!username || !password) {
    console.error("Missing Atlas API credentials! Check stored values.");
    return { error: "Missing API credentials" };
  }
  
  const body = { paused: true }; // Set paused to true to pause the cluster
  
  const arg = {
    scheme: 'https',
    host: 'cloud.mongodb.com',
    path: `api/atlas/v1.0/groups/${projectID}/clusters/${clusterName}`,
    username: username,
    password: password,
    headers: {
      'Content-Type': ['application/json'],
      'Accept-Encoding': ['bzip, deflate']
    },
    digestAuth: true, // Enable Digest Authentication
    body: JSON.stringify(body)
  };
  
  try {
    // Make the HTTP PATCH request to pause the cluster
    const response = await context.http.patch(arg);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`Cluster '${clusterName}' paused successfully.`);
      const clusterDetails = EJSON.parse(response.body.text());
      return {
        name: clusterDetails.name,
        paused: clusterDetails.paused,
        state: clusterDetails.stateName
      };
    } else {
      console.error(`Failed to pause the cluster. HTTP Status: ${response.statusCode}`);
      const responseBody = response.body ? response.body.text() : "No response body";
      console.error(`Response Body: ${responseBody}`);
      return { error: "Failed to pause the cluster", statusCode: response.statusCode };
    }
  } catch (error) {
    console.error("Error occurred while pausing the cluster:", error.message || error);
    return { error: error.message || "Unknown error" };
  }
};