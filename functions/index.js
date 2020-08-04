const functions = require("firebase-functions");

// // cach viet ngan gon
//
// const app = require("express")();
// // tuong duong voi
// const express = require("express");
// const app = express();
const app = require("express")();

const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");

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
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");
const fbAuth = require("./util/fbAuth");

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
app.get("/user/:handle", getUserDetails);
app.post("/notifications", fbAuth, markNotificationsRead);

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

exports.createNofificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id,
          });
        }
        return;
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    //notifications co s nha. cay
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  });

exports.createNofificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id,
          });
        }
        return;
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  });

exports.onUserImageChange = functions.firestore // .region('europe-west1')
  .document("/users/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");
      const batch = db.batch();
      return db
        .collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions// .region('europe-west1')
.firestore
  .document("/screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("screamId", "==", screamId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("screamId", "==", screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
