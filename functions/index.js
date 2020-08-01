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
const { json } = require("express");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((req, res) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   res.send("Hello from Firebase!");
// });

app.get("/screams", (req, res) => {
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
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

// // sau khi dang nhap, co token, xac thuc token de them moi scream
const FBAuth = (req, res, next) => {
  let idToken;
  // // startsWith khong phai startWith, thieu chu s, cay!
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // split tao ra 1 mang co 2 phan tu
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("Khong tim thay token");
    return res.status(403).json({ error: "chua duoc cap quyen, unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      console.log(decodedToken);
      return (
        db
          .collection("users")
          // // uid chu khong phai id, thieu chu u, cay!
          // .where("userId", "==", req.user.id)
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get()
      );
    })
    .then((data) => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch((err) => {
      console.error("Loi khi verify token", err);
      return res.status(403).json(err);
    });
};

// // get: screams, post: scream
app.post("/scream", FBAuth, (req, res) => {
  const newScream = {
    body: req.body.body,
    // // cach cu khi chua truyen FBAuth vao
    // userHandle: req.body.userHandle,

    // // cach moi khi truyen FBAuth vao
    userHandle: req.user.handle,
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
      return res.json({ message: `${doc.id} created` });
    })
    .catch((err) => {
      res.status(500).json({ error: "wrong" });
      console.error(err);
    });
});

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

// // kiem tra email nhap vao co hop le khong
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

// // kiem tra xem co nhap email, password chua
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

// Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  // // kiem tra email co rong va hop le hay khong
  if (isEmpty(newUser.email)) {
    errors.email = "Email khong duoc de trong";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Email khong hop le";
  }

  // kiem tra password co rong va trung voi confirmPassword khong
  if (isEmpty(newUser.password)) errors.password = "Password khong duoc rong";
  if (isEmpty(newUser.handle)) errors.handle = "Handle khong duoc rong";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Password khong khop";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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

// // Login route
app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};

  if (isEmpty(user.email)) errors.email = "Email khong duoc trong";
  if (isEmpty(user.password)) errors.password = "Password khong duoc trong";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res.status(403).json({ general: "sai password" });
      } else return res.status(500).json({ error: err.code });
    });
});

// // https://baseurl.com/api/

exports.api = functions.https.onRequest(app);
