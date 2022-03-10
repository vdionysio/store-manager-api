const ProductService = require('../services/ProductService');

const getAll = async (req, res) => {
  const products = await ProductService.getAll();

  res.status(200).json({ products });
};

const getById = async (req, res) => {
  const { id } = req.params;

  const product = await ProductService.getById(id);

  if (product.err) {
    return res.status(422).json(product);
  }

  res.status(200).json(product);
};

const create = async (req, res) => {
  const { name, quantity } = req.body;
  const newProduct = await ProductService.create({ name, quantity });

  if (newProduct.err) {
    return res.status(422).json(newProduct);
  }

  res.status(201).json(newProduct);
};

const update = async (req, res) => {
  const { name, quantity } = req.body;
  const { id } = req.params;

  const updatedProduct = await ProductService.update({ id, name, quantity });

  if (updatedProduct.err) {
    return res.status(422).json(updatedProduct);
  }

  res.status(200).json(updatedProduct);
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const deletedProduct = await ProductService.deleteProduct(id);

  if (deletedProduct.err) {
    return res.status(422).json(deletedProduct);
  }

  res.status(200).json(deletedProduct);
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteProduct,
};
