var express = require("express");
const path = require("path");
var router = express.Router();

const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(query = "", projectId = "test-agent-gmgc") {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
    keyFile: path.join(
      __dirname,
      "../config/test-agent-gmgc-458c30991546.json"
    ),
  });
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: query,
        // The language used by the client (en-US)
        languageCode: "en-US",
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log("Detected intent");
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log("  No intent matched.");
  }
  return {
    queryAsked: result.queryText,
    fulfillmentText: result.fulfillmentText,
    intent: result.intent.displayName,
  };
}

/* GET home page. */
router.post("/", async function (req, res, next) {
  const query = req.body.query;

  if (query) {
    const result = await runSample(query);
    res.header("Access-Control-Allow-Origin", "*");
    res.json(result);
  } else {
    res.json({ status: 1, message: "Empty query" });
  }
  // runSample();
});

module.exports = router;
