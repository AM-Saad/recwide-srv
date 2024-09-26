const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const User = require("./models/User");
const PublicKeyCred = require("./models/PublicKeyCred");
const app = express();
const http = require("http").Server(app);
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/recwide`;

const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: "sessions",
});

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend origin
    credentials: true,
  })
); // Use this after the variable declaration

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/temp", express.static(path.join(__dirname, "temp")));
app.use("/thumbnails", express.static(path.join(__dirname, "thumbnails")));

app.use((req, res, next) => {
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: false, // Ensure this is false for HTTP
      maxAge: 1000 * 60 * 15, // 15 minutes
    },
  })
);

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Registration route to generate a challenge
app.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const options = await generateRegistrationOptions({
      rpName: "Recwide",
      rpID: "localhost", // Change this to your domain
      user: {
        id: user._id,
        name: user.email,
        displayName: user.name,
      },
      userName: email,
      userDisplayName: user.name,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        authenticatorAttachment: "platform",
        requireResidentKey: false,
        userVerification: "preferred",
      },
      timeout: 60000,
    });
    req.session.challenge = options.challenge;
    req.session.email = email;

    // Explicitly save the session to ensure it persists
    req.session.save((err) => {
      if (err) {
        console.log("Error saving session:", err);
        return res.status(500).send("Session save error");
      }
      return res.status(200).json(options);
    });
    // return res.status(200).json(options);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

// Registration route to verify the response
app.post("/register/verify", async (req, res) => {
  const email = req.session.email;
  const expectedChallenge = req.session.challenge;
  const expectedOrigin = "http://localhost:3000";
  const expectedRPID = "localhost";
  const response = req.body;

  if (!email) {
    return res.status(400).send("No email found in session");
  }
  const user = await User.findOne({ email });
  try {
    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      requireUserVerification: false,
    });
    if (!verified) {
      return res.status(400).send("Verification failed");
    }

    if (verified) {
      const { credentialPublicKey, credentialID } = registrationInfo;

      const base64PublicKey = credentialPublicKey;
      const base64CredentialID = credentialID;
      const publicKeyCred = await PublicKeyCred.create({
        id: base64CredentialID,
        public_key: base64PublicKey,
        transports: response.response.transports,
        passkey_user_id: user._id,
        backed_up: registrationInfo.credentialBackedUp,
      });

      await publicKeyCred.save();

      user.passkey_user_id = publicKeyCred._id;
      await user.save();
      res.json({ verified: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// Authentication route to generate a challenge
app.post("/authenticate", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const userPasskeys = await PublicKeyCred.find({ passkey_user_id: user._id });
  console.log("userPasskeys ->", userPasskeys);

  const options = await generateAuthenticationOptions({
    // Require users to use a previously-registered authenticator
    allowCredentials: userPasskeys.map((passkey) => ({
      id: passkey.id,
      transports: passkey.transports,
    })),
  });

  console.log("Options ->", options);
  req.session.challenge = options.challenge;
  req.session.email = email;

  res.json(options);
});

// Authentication route to verify the response
app.post("/authenticate/verify", async (req, res) => {
  const { body } = req;
  const email = req.session.email;

  if (!email) {
    return res.status(400).send("No email found in session");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("User not found");
  }
  console.log("body ->", body);
  const credential = await PublicKeyCred.findOne({
    passkey_user_id: user._id,
    _id: body.id,
  });

  console.log("credential ->", credential);
  try {
    const verification = await verifyAuthenticationResponse({
      credential: body,
      expectedChallenge: req.session.challenge,
      expectedOrigin: "http://localhost:3000", // Replace with your origin
      expectedRPID: "localhost", // Replace with your domain
      authenticator: credential,
    });

    if (verification.verified) {
      res.json({ verified: true });
    } else {
      res.status(400).send("Verification failed");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

mongoose
  .connect(MONGODBURI)
  .then((result) => console.log("connected"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 8000;
http.listen(port, function () {
  console.log("listening on *:000");
});
