const express = require("express");
const fs = require("fs");
const path = require("path");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const file = path.join("/tmp", "messages.json");

const defaults = {
  welcome:
    "Salut! Pentru varianta unu apasa 1. Pentru varianta doi apasa 2. Pentru surpriza apasa 3.",
  one: "Ai ales varianta unu!",
  two: "Ai ales varianta doi!",
  three: "Surpriza! Acesta a fost un prank!",
  invalid: "Optiune invalida. Incearca din nou."
};

function getMessages() {
  try {
    return {
      ...defaults,
      ...JSON.parse(fs.readFileSync(file, "utf8"))
    };
  } catch {
    fs.writeFileSync(file, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

function auth(req, res, next) {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({
      error: "Parola incorecta."
    });
  }

  next();
}

function twimlSay(text) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="alice">${text}</Say>
<Hangup/>
</Response>`;
}

app.get("/health", (req, res) => {
  res.json({
    ok: true
  });
});

app.get("/api/messages", auth, (req, res) => {
  res.json(getMessages());
});

app.post("/api/messages", auth, (req, res) => {
  const old = getMessages();

  const messages = {
    welcome: String(req.body.welcome || old.welcome).slice(0, 1000),
    one: String(req.body.one || old.one).slice(0, 1000),
    two: String(req.body.two || old.two).slice(0, 1000),
    three: String(req.body.three || old.three).slice(0, 1000),
    invalid: String(req.body.invalid || old.invalid).slice(0, 1000)
  };

  fs.writeFileSync(file, JSON.stringify(messages, null, 2));

  res.json({
    ok: true,
    messages
  });
});

/*
    TWILIO - cand raspunzi la apel
*/

app.post("/voice", (req, res) => {
  const messages = getMessages();

  res.type("text/xml");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>

<Gather
input="dtmf"
numDigits="1"
action="/gather"
method="POST">

<Say voice="alice">
${messages.welcome}
</Say>

</Gather>

<Say voice="alice">
${messages.invalid}
</Say>

<Redirect method="POST">
/voice
</Redirect>

</Response>`);
});

/*
    DTMF
*/

app.post("/gather", (req, res) => {
  const messages = getMessages();

  const digit = String(req.body.Digits || "");

  let text = messages.invalid;

  if (digit === "1") text = messages.one;
  if (digit === "2") text = messages.two;
  if (digit === "3") text = messages.three;

  res.type("text/xml");
  res.send(twimlSay(text));
});

/*
    Robotul te suna
*/

app.get("/call", async (req, res) => {
  try {

    const call = await client.calls.create({

      to: process.env.MY_PHONE_NUMBER,

      from: process.env.TWILIO_PHONE_NUMBER,

      url: "https://prank-ivr.onrender.com/voice",

      method: "POST"

    });

    res.json({
      success: true,
      sid: call.sid
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`IVR server listening on ${PORT}`);
});
