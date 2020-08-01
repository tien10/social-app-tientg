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
