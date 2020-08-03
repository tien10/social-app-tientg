const functions = require("firebase-functions");

// // cach viet ngan gon
//
// const app = require("express")();
// // tuong duong voi
// const express = require("express");
// const app = express();
const app = require("express")();

const FBAuth = require("./util/fbAuth");

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((req, res) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   res.send("Hello from Firebase!");
// });

// // Scream routes
app.get("/screams", getAllScreams);
// // get: screams, post: scream
app.post("/scream", FBAuth, postOneScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAuth, deleteScream);
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

// // Users routes
// // Signup route
app.post("/signup", signup);
// // Login route
app.post("/login", login);
// tuong tu
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

// // Viet lai bang express ngan gon hon
//
// exports.getScreams = functions.https.onRequest((req, res) => {
//   admin
//     .firestore()
//     .collection("screams")
//     .get()
//     .then((data) => {
//       let screams = [];
//       data.forEach((doc) => {
//         screams.push(doc.data());
//       });
//       return res.json(screams);
//     })
//     .catch((err) => console.error(err));
// });

// exports.createScreams = functions.https.onRequest((req, res) => {
//   if (req.method !== "POST") {
//     return res.status(400).json({ error: "Sai method" });
//   }

//   const newScream = {
//     body: req.body.body,
//     userHandle: req.body.userHandle,
//     createdAt: admin.firestore.Timestamp.fromDate(new Date()),
//   };

//   admin
//     .firestore()
//     .collection("screams")
//     .add(newScream)
//     .then((doc) => {
//       return res.json({ message: `${doc.id} created` });
//     })
//     .catch((err) => {
//       res.status(500).json({ error: "wrong" });
//       console.error(err);
//     });
// });

// // https://baseurl.com/api/

exports.api = functions.https.onRequest(app);
