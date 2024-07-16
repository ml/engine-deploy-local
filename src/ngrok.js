// setup ngrok
import ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";
import open from "open";
import axios from "axios";
import https from "https";

dotenv.config();

const auth = process.env.NGROK_AUTH_TOKEN;

(async function() {
  try {

    // Check if the Engine has been started
    const healthCheckUrl = "https://localhost:3005/system/health";
    const httpsAgent = new https.Agent({  
      rejectUnauthorized: false // This will skip the SSL verification
    });

    // Check if the Engine is up and running if not retry after 5 seconds
    const checkEngineHealth = async () => {
      try {
        const healthResponse = await axios.get(healthCheckUrl, { httpsAgent });
        if (healthResponse.status === 200) {
          console.log("Engine is up and running.");

          // Check if the auth token is present
          if (!auth || auth==="" || auth.includes("<") || auth.includes(">")) {
            console.log("\n===============================================");
            console.log("No NGROK_AUTHTOKEN found. Your Engine is not accessible from the internet.");
            console.log("You can view your Engine locally at https://localhost:3005");
            console.log("To make your Engine accessible from the internet.");
            console.log("Please provide a valid NGROK_AUTHTOKEN in the .env file and redeploy.");
            console.log("===============================================\n");
            return; // Exit the function if no auth token
          } else {
            setupNgrok(); // Proceed to setup ngrok if there's auth token
          }

        } else {
          console.error("Engine is not running. Retrying...");
          setTimeout(checkEngineHealth, 5000); // Retry after 5 seconds
        }
      } catch (error) {
        console.error("Error checking engine status. Retrying...", error.message);
        setTimeout(checkEngineHealth, 5000); // Retry after 5 seconds
      }
    };

    // Setup ngrok to forward the local Engine to the internet
    const setupNgrok = async () => {

      // Create a new ngrok session and listen to the local Engine
      const session = await new ngrok.SessionBuilder().authtoken(auth).connect();
      const listener = await session.httpEndpoint().verifyUpstreamTls(false).listen();

      // Log the details about your local Engine and the ngrok URL
      console.log("\n===============================================");
      console.log("Use the following URL to import your Engine to thirdweb dashboard.");
      console.log("Engine is up and running at:", listener.url());
      console.log("===============================================\n");
      console.log("Press Ctrl+C to stop forwarding the Engine from localhost to ngrok.");

      // Forward the local engine to the ngrok URL
      listener.forward("https://localhost:3005");

      // Open the ngrok URL in the default browser
      open(listener.url());
    };

    // Start the health check loop
    checkEngineHealth();
  } catch (error) {
    console.error("Failed to start the engine health check loop:", error.message);
  }
})();
