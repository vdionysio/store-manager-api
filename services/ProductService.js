const ProductModel = require('../models/ProductModel');
const productSchema = require('../schemas/productSchema');

const invalidIdError = { err: { code: 'invalid_data', message: 'Wrong id format' } };

const getAll = async () => {
  const products = await ProductModel.getAll();

  return products;
};

const getById = async (id) => {
  if (id.length !== 24) {
    return invalidIdError;
  }

  const product = await ProductModel.getById(id);

  if (!product) {
    return invalidIdError;
  }

  return product;
};

const create = async ({ name, quantity }) => {
  const { error } = productSchema.validate({ name, quantity });

  if (error) {
    return { err: { code: 'invalid_data', message: error.message } };
  }

  const product = await ProductModel.getByName(name);

  if (product) {
    return { err: { code: 'invalid_data', message: 'Product already exists' } };
  }

  const newProduct = await ProductModel.create({ name, quantity });

  return newProduct;
};

const update = async ({ id, name, quantity }) => {
  const { error } = productSchema.validate({ name, quantity, id });

  if (error) {
    return { err: { code: 'invalid_data', message: error.message } };
  }

  const updatedProduct = await ProductModel.update({ id, name, quantity });

  if (!updatedProduct) {
    return invalidIdError;
  }

  return updatedProduct;
};

const deleteProduct = async (id) => {
  if (id.length !== 24) {
    return invalidIdError;
  }
  const deletedProduct = await ProductModel.deleteProduct(id);

  if (!deletedProduct) {
    return invalidIdError;
  }

  return deletedProduct;
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteProduct,
};
