// const ProductService = require('../services/ProductService');
const SalesService = require('../services/SalesService');

const getAll = async (req, res) => {
  const sales = await SalesService.getAll();

  res.status(200).json({ sales });
};

const getById = async (req, res) => {
  const { id } = req.params;

  const sale = await SalesService.getById(id);

  if (sale.err) {
    return res.status(404).json(sale);
  }

  res.status(200).json(sale);
};

const create = async (req, res) => {
  const itensSold = req.body;
  const newSale = await SalesService.create(itensSold);

  if (newSale.err && newSale.err.code === 'stock_problem') {
    return res.status(404).json(newSale);
  }

  if (newSale.err) {
    return res.status(422).json(newSale);
  }

  res.status(200).json(newSale);
};

const update = async (req, res) => {
  const { body } = req;
  const { id } = req.params;

  const updatedSale = await SalesService.update({ id, itensSold: body });

  if (updatedSale.err) {
    return res.status(422).json(updatedSale);
  }

  res.status(200).json(updatedSale);
};

const deleteSale = async (req, res) => {
  const { id } = req.params;

  const deletedSale = await SalesService.deleteSale(id);

  if (deletedSale.err) {
    return res.status(422).json(deletedSale);
  }

  res.status(200).json(deletedSale);
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteSale,
};
