const { db } = require("../util/admin");

exports.getAllScreams = (req, res) => {
  db.collection("screams")
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
};

exports.postOneScream = (req, res) => {
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

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      return res.json({ message: `${doc.id} created` });
    })
    .catch((err) => {
      res.status(500).json({ error: "wrong" });
      console.error(err);
    });
};

// Get on scream
exports.getScream = (req, res) => {
  let screamData = {};
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("screamId", "==", req.params.screamId)
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Comment on scream
exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === "")
    return res.json(400).json({ error: "Must not be empty" });
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      }
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
