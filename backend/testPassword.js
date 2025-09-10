// testPassword.js
import bcrypt from "bcryptjs";

const hash = "$2b$10$8CKN8CmUt5zgIr6hNVUhK.HjFaDhc.mUKqsKY5LssHaqLu9WN.9xe"; // passwordHash from DB
const password = "akas@123"; // password you want to test

bcrypt.compare(password, hash).then(result => {
  console.log("Password match?", result);
});
