const SalesModel = require('../models/SalesModel');
const ProductModel = require('../models/ProductModel');

const productSchema = require('../schemas/productSchema');

const invalidIdError = {
  err: { code: 'invalid_data', message: 'Wrong product ID or invalid quantity' },
};

const notFoundError = {
  err: { code: 'not_found', message: 'Sale not found' },
};

const saleIdError = {
  err: { code: 'invalid_data', message: 'Wrong sale ID format' },
};

const stockError = {
  err: { code: 'stock_problem', message: 'Such amount is not permitted to sell' },
};

const getAll = async () => {
  const sales = await SalesModel.getAll();

  return sales;
};

const getById = async (id) => {
  if (id.length !== 24) {
    return notFoundError;
  }

  const sale = await SalesModel.getById(id);

  if (!sale) {
    return notFoundError;
  }

  return sale;
};

const errorCheck = async (itens) => {
  const erro = [];

  await Promise.all(itens.map(async (item) => {
    const product = await ProductModel.getById(item.productId);

    if (!product) {
      erro.push('true');
    }

    const { error } = productSchema.validate({ quantity: item.quantity });

    if (error) {
      erro.push('true');
    }
  }));

  if (erro.length > 0) {
    return true;
  }

  return false;
};

const stockCheck = async (itens) => {
  const error = [];

  await Promise.all(itens.map(async (item) => {
    const product = await ProductModel.getById(item.productId);

    if (item.quantity > product.quantity) {
      error.push(true);
    }
  }));

  if (error.length > 0) {
    return true;
  }

  return false;
};

const updateStock = async (itens, deleting = false) => {
  await Promise.all(itens.map(async (item) => {
    const product = await ProductModel.getById(item.productId);
    const { _id, name } = product;

    let quantity = product.quantity - item.quantity;
    if (deleting) {
      quantity = product.quantity + item.quantity;
    }
    const updated = await ProductModel.update({ id: _id, name, quantity });
    console.log(updated);
  }));
};

const create = async (itens) => {
  const error = await errorCheck(itens);

  if (error) return invalidIdError;

  const stockProblem = await stockCheck(itens);

  if (stockProblem) return stockError;

  await updateStock(itens);
  const newSale = await SalesModel.create(itens);

  return newSale;
};

const update = async ({ id, itensSold }) => {
  const error = await errorCheck(itensSold);

  if (error) return invalidIdError;

  const stockProblem = await stockCheck(itensSold);

  if (stockProblem) return stockError;

  const updatedSale = await SalesModel.update({ id, itensSold });

  if (!updatedSale) {
    return invalidIdError;
  }

  await updateStock(itensSold);

  return updatedSale;
};

const deleteSale = async (id) => {
  if (id.length !== 24) {
    return saleIdError;
  }
  const sale = await SalesModel.getById(id);
  const deletedSale = await SalesModel.deleteSale(id);

  if (!deletedSale) {
    return saleIdError;
  }

  if (sale) {
    await updateStock(sale.itensSold, true);
  }

  return deletedSale;
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteSale,
};
