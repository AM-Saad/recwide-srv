const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = callback => {
  MongoClient.connect(
    "mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/actproUsers?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
    .then(client => {
      console.log("connected");
      _db = client.db();
    })
    .catch(err => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No Database Found";
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
