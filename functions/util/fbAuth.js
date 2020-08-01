const { admin, db } = require("./admin");

// // sau khi dang nhap, co token, xac thuc token de them moi scream
module.exports = (req, res, next) => {
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
