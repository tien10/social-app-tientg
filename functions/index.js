const functions = require("firebase-functions");
const admin = require("firebase-admin");
// // cach viet ngan gon
//
// const app = require("express")();
// // tuong duong voi
// const express = require("express");
// const app = express();
const app = require("express")();
admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyA3-JkbE2yYuVwxi0gXwKYciUlWhBAVBj8",
  authDomain: "social-app-tientg.firebaseapp.com",
  databaseURL: "https://social-app-tientg.firebaseio.com",
  projectId: "social-app-tientg",
  storageBucket: "social-app-tientg.appspot.com",
  messagingSenderId: "657029964561",
  appId: "1:657029964561:web:eedc62085dc8490f23a2b0",
  measurementId: "G-KJPNS1S2RP",
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });

app.get("/screams", (request, response) => {
  admin
    .firestore()
    .collection("screams")
    // // sap xep theo ngay tao moi nhat
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        // // lay data lon xon, khong theo thu tu
        // screams.push(doc.data());

        // // lay data dep, de nhin
        screams.push({
          streamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          // // toDateString() khong loi
          //   createdAt: new Date(doc.data().createdAt).toDateString(),
          // // toISOString() loi
          //   createdAt: new Date(doc.data().createdAt).toISOString(),
        });
      });
      return response.json(screams);
    })
    .catch((err) => console.error(err));
});

// // get thi screams, post thi scream
app.post("/scream", (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    // createdAt: admin.firestore.Timestamp.fromDate(new Date()),

    // // dinh dang gio cho de nhin hon
    // createdAt: new Date().toDateString(),
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then((doc) => {
      return response.json({ message: `${doc.id} created` });
    })
    .catch((err) => {
      response.status(500).json({ error: "wrong" });
      console.error(err);
    });
});

// // Viet lai bang express ngan gon hon
//
// exports.getScreams = functions.https.onRequest((request, response) => {
//   admin
//     .firestore()
//     .collection("screams")
//     .get()
//     .then((data) => {
//       let screams = [];
//       data.forEach((doc) => {
//         screams.push(doc.data());
//       });
//       return response.json(screams);
//     })
//     .catch((err) => console.error(err));
// });

// exports.createScreams = functions.https.onRequest((request, response) => {
//   if (request.method !== "POST") {
//     return response.status(400).json({ error: "Sai method" });
//   }

//   const newScream = {
//     body: request.body.body,
//     userHandle: request.body.userHandle,
//     createdAt: admin.firestore.Timestamp.fromDate(new Date()),
//   };

//   admin
//     .firestore()
//     .collection("screams")
//     .add(newScream)
//     .then((doc) => {
//       return response.json({ message: `${doc.id} created` });
//     })
//     .catch((err) => {
//       response.status(500).json({ error: "wrong" });
//       console.error(err);
//     });
// });

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  // TODO: validate data
  // // them user moi dang ky vao database users
  let userId, token;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "handle taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "email da ton tai" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
  // // cach nay chua day du
  //   firebase
  //     .auth()
  //     .createUserWithEmailAndPassword(newUser.email, newUser.password)
  //     .then((data) => {
  //       return res
  //         .status(201)
  //         .json({ message: `${data.user.uid} signed up thanh cong` });
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       return res.status(500).json({ error: err.code });
  //     });
});

// // https://baseurl.com/api/

exports.api = functions.https.onRequest(app);
