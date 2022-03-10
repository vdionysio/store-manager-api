const { MongoClient } = require('mongodb');
require('dotenv').config();

const OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let db = null;

function getConnection() {
  return db
  ? Promise.resolve(db)
  : MongoClient.connect(process.env.MONGO_DB_URL, OPTIONS).then((conn) => {
    db = conn.db(process.env.DB_NAME);
    return db;
  });
}

module.exports = { getConnection };
