const { ObjectId } = require('mongodb');
const mongoConnection = require('./connection');

const getAll = async () => {
  const salesCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('sales'));

  const sales = await salesCollection
    .find().toArray();

  return sales;
};

const getById = async (id) => {
  const salesCollection = await mongoConnection.getConnection()
  .then((db) => db.collection('sales'));

  const product = await salesCollection
    .findOne({ _id: ObjectId(id) });

  return product;
};

const create = async (itensSold) => {
  const salesCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('sales'));

  const { insertedId: _id } = await salesCollection
    .insertOne({ itensSold });

  return {
    _id,
    itensSold,
  };
};

const deleteSale = async (id) => {
  const sale = await getById(id);

  if (!sale) {
    return null;
  }

  const SalesCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('sales'));

  await SalesCollection
    .deleteOne(
      { _id: ObjectId(id) },
    );

  return sale;
};

const cleanCollection = async () => {
  const salesCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('sales'));

  await salesCollection
    .deleteMany({});
};

const update = async ({ id, itensSold }) => {
  const salesCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('sales'));

  const result = await salesCollection
    .updateOne(
      { _id: ObjectId(id) },
      { $set: { itensSold } },
    );

  if (result.matchedCount === 0) {
    return null;
  }

  return { _id: id, itensSold };
};

module.exports = {
  create,
  getAll,
  getById,
  deleteSale,
  update,
  cleanCollection,
};
