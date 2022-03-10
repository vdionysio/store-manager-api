const { ObjectId } = require('mongodb');
const mongoConnection = require('./connection');

const getAll = async () => {
  const productsCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('products'));

  const products = await productsCollection
    .find().toArray();

  return products;
};

const getById = async (id) => {
  const productsCollection = await mongoConnection.getConnection()
  .then((db) => db.collection('products'));

  const product = await productsCollection
    .findOne({ _id: ObjectId(id) });

  return product;
};

const getByName = async (name) => {
  const productCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('products'));

  const product = productCollection.findOne({ name });

  return product;
};

const create = async ({ name, quantity }) => {
  const productCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('products'));

  const { insertedId: _id } = await productCollection
    .insertOne({ name, quantity });

  return {
    _id,
    name,
    quantity,
  };
};

const update = async ({ id, name, quantity }) => {
  const productCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('products'));

  const result = await productCollection
    .updateOne(
      { _id: ObjectId(id) },
      { $set: { name, quantity } },
    );

  if (result.matchedCount === 0) {
    return null;
  }

  return { _id: id, name, quantity };
};

const deleteProduct = async (id) => {
  const product = await getById(id);

  if (!product) {
    return null;
  }

  const productCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('products'));

  await productCollection
    .deleteOne(
      { _id: ObjectId(id) },
    );

  return product;
};

const cleanCollection = async () => {
  const productCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('products'));

  await productCollection
    .deleteMany({});
};

module.exports = {
  create,
  getAll,
  getByName,
  getById,
  cleanCollection,
  update,
  deleteProduct,
};
