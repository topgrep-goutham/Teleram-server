const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const { handler } = require("./controller/index"); // use import, not require

const app = express();
app.use(express.json());

app.post("/*", async (req, res) => {
    console.log(req.body);
    res.send(await handler(req));
});

app.get("/*", async (req, res) => {
    res.send(await handler(req));
});

app.listen(PORT, () => {
    console.log("Welcome to Telegram Bot API");
});