const { handleMessage } = require("./lib/Telegram");

async function handler(req) {
    console.log("Incoming request body:", JSON.stringify(req.body, null, 2));

    try {
        if (req.body) {
            // Handle regular messages
            if (req.body.message) {
                console.log("Processing message:", req.body.message);
                await handleMessage(req.body.message);
            }

            // Handle callback queries (inline keyboard button clicks)
            else if (req.body.callback_query) {
                console.log("Processing callback query:", req.body.callback_query);
                // Create a message-like object for callback queries
                const callbackMessage = {
                    callback_query: req.body.callback_query
                };
                await handleMessage(callbackMessage);
            }

            // Handle other types of updates
            else if (req.body.edited_message) {
                console.log("Message edited, ignoring...");
            }

            else {
                console.log("Unknown update type:", Object.keys(req.body));
            }
        }
    } catch (error) {
        console.error("Handler error:", error.message);
        // Don't throw error, just log it to prevent webhook issues
    }

    // Always return OK to Telegram to acknowledge receipt
    return "OK";
}

module.exports = { handler };