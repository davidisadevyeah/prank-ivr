const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const file = path.join("/tmp", "messages.json");

const defaults = {
  welcome: "Salut! Pentru varianta unu apasa 1. Pentru varianta doi apasa 2. Pentru surpriza apasa 3.",
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
    return res.status(401).json({ error: "Parola incorecta." });
  }
  next();
}

app.get("/health", (req, res) => {
  res.json({ ok: true });
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
  Endpoint pregatit pentru providerul de telefonie.
  Providerul va trimite aici informatia despre cifra DTMF.
*/
app.post("/ivr", (req, res) => {
  const messages = getMessages();
  const digit = String(req.body.Digits || "");

  const response = {
    welcome: messages.welcome,
    digit,
    message:
      digit === "1" ? messages.one :
      digit === "2" ? messages.two :
      digit === "3" ? messages.three :
      messages.invalid
  };

  res.json(response);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`IVR server listening on ${PORT}`);
});
