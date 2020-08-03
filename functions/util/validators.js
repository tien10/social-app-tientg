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

exports.validateSignupData = (data) => {
  let errors = {};

  // // kiem tra email co rong va hop le hay khong
  if (isEmpty(data.email)) {
    errors.email = "Email khong duoc de trong";
  } else if (!isEmail(data.email)) {
    errors.email = "Email khong hop le";
  }

  // kiem tra password co rong va trung voi confirmPassword khong
  if (isEmpty(data.password)) errors.password = "Password khong duoc rong";
  if (isEmpty(data.handle)) errors.handle = "Handle khong duoc rong";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Password khong khop";

  // if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = "Email khong duoc trong";
  if (isEmpty(data.password)) errors.password = "Password khong duoc trong";

  //   if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isEmpty(data.website.trim())) {
    // https://website.com
    if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website.trim()}`;
    } else userDetails.website = data.website;
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location;
  return userDetails;
};
