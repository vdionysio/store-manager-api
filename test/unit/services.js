const sinon = require('sinon'); // to Mock
const { expect } = require('chai');

const { MongoClient } = require('mongodb');
const { getConnection } = require('./mongoMockConnection');

require('dotenv').config();

const ProductModel = require('../../models/ProductModel');
const ProductService = require('../../services/ProductService');

const SalesModel = require('../../models/SalesModel');
const SalesService = require('../../services/SalesService');

/* PRODUCTS */

describe('SERVICE 1 - Insert a new product on DB', () => {
  describe('not possible to create a product when', () => {
    it('name lenght is less than 5 character long', async () => {
      const response = await ProductService.create({ name: 'prod', quantity: 1})
      const { err } = response;

      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"name" length must be at least 5 characters long');
    });

    it('have the same name', async () => {
      await ProductModel.create({ name: 'mesmo_nome', quantity: 1});
      const response = await ProductService.create({ name: 'mesmo_nome', quantity: 1});

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('Product already exists');
    });

    it('quantity is less than 0', async () => {
      const response = await ProductService.create({ name: 'product1', quantity: -1});

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"quantity" must be larger than or equal to 1');
    });

    it('quantity is 0', async () => {
      const response = await ProductService.create({ name: 'product2', quantity: 0});

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"quantity" must be larger than or equal to 1');
    });

    it('quantity is a string', async () => {
      const response = await ProductService.create({ name: 'product3', quantity: 'string'});

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"quantity" must be a number');
    });
  });

  describe('when the product is successfully inserted', async () => {
    const newProduct = {
      name: 'product_name',
      quantity: 1
    };

    before(() => {
      const ID_EXAMPLE = '604cb554311d68f491ba5781';

      sinon.stub(ProductModel, 'create')
        .resolves({
          _id: ID_EXAMPLE,
          ...newProduct
        })
    });

    after(() => {
      ProductModel.create.restore();
    })

    it('returns an object', async () => {
      const response = await ProductService.create({ name: 'product4', quantity: 2});

      expect(response).to.be.an('object')
    });

    it('with and _id', async () => {
      const response = await ProductService.create({ name: 'product4', quantity: 2});

      expect(response).to.have.a.property('_id');
    });

    it('with a name', async () => {
      const response = await ProductService.create({ name: 'product4', quantity: 2});

      expect(response).to.have.a.property('name');
    });

    it('with a quantity', async () => {
      const response = await ProductService.create({ name: 'product4', quantity: 2});

      expect(response).to.have.a.property('quantity');
    });
  });
})

describe('SERVICE 2 - List all products', () => {
  describe('when the product list is empty', async () => {
    before(async () => {
      sinon.stub(ProductModel, 'getAll')
        .resolves([]);
    });


    after(async () => {
      ProductModel.getAll.restore();
    });

    it('should return an array', async () => {
      const list = await ProductService.getAll();

      expect(list).to.be.an('array');
    });

    it('that is empty', async () => {
      const list = await ProductModel.getAll();

      expect(list).to.be.empty;
    })

  });

  describe('when the product list is not empty', async () => {
    before(async () => {
      sinon.stub(ProductModel, 'getAll').resolves([
        { name: 'product1', quantity: 1},
        { name: 'product2', quantity: 2},
        { name: 'product3', quantity: 3},
        { name: 'product4', quantity: 4},
      ]);
    });

    after(() => {
      ProductModel.getAll.restore();
    });

    it('should return an array', async () => {
      const list = await ProductService.getAll();

      expect(list).to.be.an('array');
    });

    it('that is not empty', async () => {
      const products = await ProductService.getAll();

      expect(products).to.be.not.empty;
    });

  });
});

describe('SERVICE 3 -List a product by ID', () => {

  describe('when there is no product with the id on the list', async () => {
    before(async () => {
      sinon.stub(ProductModel, 'getById')
        .resolves(null);
    });

    after(async () => {
      ProductModel.getById.restore();
    });

    it('should return a null', async () => {
      const fakeId = "11aa1111aa11a1111a1111a1"
      const product = await ProductService.getById(fakeId);

      expect(product).to.have.property('err');
    });
  });

  describe('when the product id is valid', async () => {
    const ID_EXAMPLE = '604cb554311d68f491ba5781';

    before(async () => {
      sinon.stub(ProductModel, 'getById')
        .resolves({ _id: ID_EXAMPLE, name: 'product1', quantity: 1})
    });

    after(async () => {
      ProductModel.getById.restore();
    });

    it('should return an object', async () => {
      const product = await ProductService.getById(ID_EXAMPLE);

      expect(product).to.be.an('object');
    });

    it('that have an id', async () => {
      const product = await ProductService.getById(ID_EXAMPLE);

      expect(product).to.have.property('_id');
    });

    it('that have a name', async () => {
      const product = await ProductService.getById(ID_EXAMPLE);

      expect(product).to.have.property('name');
    });

    it('that have a quantity', async () => {
      const product = await ProductService.getById(ID_EXAMPLE);

      expect(product).to.have.property('quantity');
    });
  });
});

describe('SERVICE 4 - Update a product by ID', () => {
  const ID_EXAMPLE = '604cb554311d68f491ba5781';
  describe('is not possible when', () => {
    it('name lenght is less than 5 character long', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'prod', quantity: 1 })
      const { err } = response;

      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"name" length must be at least 5 characters long');
    });

    // it('have the same name', async () => {
    //   await ProductModel.create({ id: ID_EXAMPLE, name: 'mesmo_nome', quantity: 1});
    //   const response = await ProductService.create({ name: 'mesmo_nome', quantity: 1});

    //   const { err } = response;
    //   expect(err.code).to.be.equal('invalid_data');
    //   expect(err.message).to.be.equal('Product already exists');
    // });

    it('quantity is less than 0', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'product1', quantity: -1 });

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"quantity" must be larger than or equal to 1');
    });

    it('quantity is 0', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'product2', quantity: 0 });

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"quantity" must be larger than or equal to 1');
    });

    it('quantity is a string', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'product3', quantity: 'string' });

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('"quantity" must be a number');
    });
  });

  describe('when the product is successfully inserted', async () => {
    const updatedProduct = {
      name: 'product_name',
      quantity: 1
    };

    before(() => {
      const ID_EXAMPLE = '604cb554311d68f491ba5781';

      sinon.stub(ProductModel, 'update')
        .resolves({
          _id: ID_EXAMPLE,
          ...updatedProduct
        })
    });

    after(() => {
      ProductModel.update.restore();
    })

    it('returns an object', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'product4', quantity: 2 });

      expect(response).to.be.an('object')
    });

    it('with and _id', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'product4', quantity: 2 });

      expect(response).to.have.a.property('_id');
    });

    it('with a name', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'product4', quantity: 2 });

      expect(response).to.have.a.property('name');
    });

    it('with a quantity', async () => {
      const response = await ProductService.update({ id: ID_EXAMPLE, name: 'product4', quantity: 2 });

      expect(response).to.have.a.property('quantity');
    });
  });
});

describe('SERVICE 5 - Delete a product by ID', () => {
  const ID_EXAMPLE = '604cb554311d68f491ba5781';
  const fakeId = '11aa1111aa11a1111a1111a1';

  describe('is not possible when', () => {
    before(() => {
      sinon.stub(ProductModel, 'deleteProduct')
        .resolves(null)
    });

    after(() => {
      ProductModel.deleteProduct.restore();
    })

    it('the id is invalid', async () => {
      const response = await ProductService.deleteProduct('123');

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('Wrong id format');
    });

    it('there is no product with the id', async () => {
      const response = await ProductService.deleteProduct(fakeId);

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('Wrong id format');
    });
  });

  describe('when the product is successfully deleted', async () => {
    const deletedProduct = {
      _id: ID_EXAMPLE,
      name: 'product_name',
      quantity: 1
    };

    before(() => {
      sinon.stub(ProductModel, 'deleteProduct')
        .resolves(deletedProduct)
    });

    after(() => {
      ProductModel.deleteProduct.restore();
    })

    it('returns an object', async () => {
      const response = await ProductService.deleteProduct(ID_EXAMPLE);

      expect(response).to.be.an('object')
    });

    it('with and _id', async () => {
      const response = await ProductService.deleteProduct(ID_EXAMPLE);

      expect(response).to.have.a.property('_id');
    });

    it('with a name', async () => {
      const response = await ProductService.deleteProduct(ID_EXAMPLE);

      expect(response).to.have.a.property('name');
    });

    it('with a quantity', async () => {
      const response = await ProductService.deleteProduct(ID_EXAMPLE);

      expect(response).to.have.a.property('quantity');
    });
  });
});

/* SALES */
describe('SERVICE 6 - Register a new sale on DB', async () => {
  const stdError = {code: 'invalid_data', message: 'Wrong product ID or invalid quantity' };
  const ID_EXAMPLE = '604cb554311d68f491ba5781';

  describe('not possible to register a product when', () => {
    it('the id is not registered on products db', async () => {
      const response = await SalesService.create([{ productId: ID_EXAMPLE, quantity: 1}]);

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });

    it('quantity is less than 0', async () => {
      const { _id } = await ProductModel.create({ name: 'product', quantity: 20 });
      const response = await SalesService.create([{ productId: _id, quantity: -1}]);

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });

    it('quantity is 0', async () => {
      const { _id } = await ProductModel.create({ name: 'product', quantity: 20 });
      const response = await SalesService.create([{ productId: _id, quantity: 0}]);

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });

    it('quantity is a string', async () => {
      const { _id } = await ProductModel.create({ name: 'product', quantity: 20 });
      const response = await SalesService.create([{ productId: _id, quantity: 'string'}]);

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });
  });

  describe('when the product is successfully inserted', async () => {
    const itensSold = [{
      productId: _id,
      quantity: 1
    }];

    before(() => {
      sinon.stub(SalesModel, 'create')
        .resolves({
          _id: ID_EXAMPLE,
          itensSold,
        })
    });

    after(() => {
      SalesModel.create.restore();
    })

    it('returns an object', async () => {
      const response = await SalesService.create(itensSold);

      expect(response).to.be.an('object')
    });

    it('with an _id', async () => {
      const response = await SalesService.create(itensSold);

      expect(response).to.have.a.property('_id');
    });

    it('and a itensSold property, that is a not empty array', async () => {
      const response = await SalesService.create(itensSold);

      expect(response).to.have.a.property('itensSold');
      expect(response.itensSold).to.be.not.empty;
    });
  });
});

describe('SERVICE 7 - List all sales', () => {
  describe('when the sales list is empty', async () => {
    before(async () => {
      sinon.stub(SalesModel, 'getAll')
        .resolves([]);
    });


    after(async () => {
      SalesModel.getAll.restore();
    });

    it('should return an array', async () => {
      const list = await SalesService.getAll();

      expect(list).to.be.an('array');
    });

    it('that is empty', async () => {
      const list = await SalesService.getAll();

      expect(list).to.be.empty;
    })

  });

  describe('when the product list is not empty', async () => {
    before(async () => {
      sinon.stub(SalesModel, 'getAll').resolves([
        { _id: '11111', itensSold: [{ productId: '12345', quantity: 2 }] },
        { _id: '22222', itensSold: [{ productId: '12345', quantity: 2 }] },
        { _id: '33333', itensSold: [{ productId: '12345', quantity: 2 }] },
        { _id: '44444', itensSold: [{ productId: '12345', quantity: 2 }] },
      ]);
    });

    after(() => {
      SalesModel.getAll.restore();
    });

    it('should return an array', async () => {
      const list = await SalesService.getAll();

      expect(list).to.be.an('array');
    });

    it('that is not empty', async () => {
      const sales = await SalesService.getAll();

      expect(sales).to.be.not.empty;
    });

  });
});

describe('SERVICE 8 -List a sale by ID', () => {

  describe('when there is no sale with the id on the list', async () => {
    before(async () => {
      sinon.stub(ProductModel, 'getById')
        .resolves(null);
    });

    after(async () => {
      ProductModel.getById.restore();
    });

    it('should return a null', async () => {
      const fakeId = "11aa1111aa11a1111a1111a1"
      const sale = await SalesService.getById(fakeId);

      expect(sale).to.have.property('err');
    });
  });

  describe('when the sale id is valid', async () => {
    const ID_EXAMPLE = '604cb554311d68f491ba5781';

    before(async () => {
      sinon.stub(SalesModel, 'getById')
        .resolves({ _id: ID_EXAMPLE, itensSold: [{ productId: '123456', quantity: 10 }] });
    });

    after(async () => {
      SalesModel.getById.restore();
    });

    it('should return an object', async () => {
      const sale = await SalesService.getById(ID_EXAMPLE);

      expect(sale).to.be.an('object');
    });

    it('that have an id', async () => {
      const sale = await SalesService.getById(ID_EXAMPLE);

      expect(sale).to.have.property('_id');
    });

    it('that have a itensSold property', async () => {
      const sale = await SalesService.getById(ID_EXAMPLE);

      expect(sale).to.have.property('itensSold');
    });
  });
});

describe('SERVICE 9 - Update a sale by ID', () => {
  const stdError = {code: 'invalid_data', message: 'Wrong product ID or invalid quantity' };
  const ID_EXAMPLE = '604cb554311d68f491ba5781';
  describe('is not possible when', () => {
      it('the id is not registered on products db', async () => {
      const { _id: id } = await SalesModel.create([{ productId: '123456', quantity: 10 }])
      const response = await SalesService.update({ id, itensSold: [{ productId: ID_EXAMPLE, quantity: 1}]});

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });

    it('quantity is less than 0', async () => {
      const { _id } = await ProductModel.create({ name: 'product', quantity: 20 });
      const { _id: id } = await SalesModel.create([{ productId: _id, quantity: 10 }])
      const response = await SalesService.update({ id, itensSold: [{ productId: _id, quantity: -1}]});

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });

    it('quantity is 0', async () => {
      const { _id } = await ProductModel.create({ name: 'product', quantity: 20 });
      const { _id: id } = await SalesModel.create([{ productId: _id, quantity: 10 }])
      const response = await SalesService.update({ id, itensSold: [{ productId: _id, quantity: 0}]});

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });

    it('quantity is a string', async () => {
      const { _id } = await ProductModel.create({ name: 'product', quantity: 20 });
      const { _id: id } = await SalesModel.create([{ productId: _id, quantity: 10 }])
      const response = await SalesService.update({ id, itensSold: [{ productId: _id, quantity: 'string'}]});

      const { err } = response;
      expect(err.code).to.be.equal(stdError.code);
      expect(err.message).to.be.equal(stdError.message);
    });
  });

  describe('when the sale is successfully inserted', async () => {
    const updatedSale = {
      itensSold: [
        { productId: '123456789012', quantity: 20}
      ]
    };

    before(() => {
      const ID_EXAMPLE = '604cb554311d68f491ba5781';

      sinon.stub(SalesModel, 'update')
        .resolves({
          _id: ID_EXAMPLE,
          ...updatedSale
        })
    });

    after(() => {
      SalesModel.update.restore();
    })

    it('returns an object', async () => {
      const { _id: prodID } = await ProductModel.create({ name: 'produto', quantity: 20})
      const response = await SalesService.update({ id: ID_EXAMPLE, itensSold: [{ productId: prodID, quantity: 5}] });

      expect(response).to.be.an('object')
    });

    it('with and _id', async () => {
      const { _id: prodID } = await ProductModel.create({ name: 'produto', quantity: 20})
      const response = await SalesService.update({ id: ID_EXAMPLE, itensSold: [{ productId: prodID, quantity: 5}] });

      expect(response).to.have.a.property('_id');
    });

    it('with a itensSold property', async () => {
      const { _id: prodID } = await ProductModel.create({ name: 'produto', quantity: 20})
      const response = await SalesService.update({ id: ID_EXAMPLE, itensSold: [{ productId: prodID, quantity: 5}] });

      expect(response).to.have.a.property('itensSold');
    });
  });
});

describe('SERVICE 10 - Delete a sale by ID', () => {
  const ID_EXAMPLE = '604cb554311d68f491ba5781';
  const fakeId = '11aa1111aa11a1111a1111a1';

  describe('is not possible when', () => {
    before(() => {
      sinon.stub(SalesModel, 'deleteSale')
        .resolves(null)
    });

    after(() => {
      SalesModel.deleteSale.restore();
    })

    it('the id is invalid', async () => {
      const response = await SalesService.deleteSale('123');

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('Wrong sale ID format');
    });

    it('there is no product with the id', async () => {
      const response = await SalesService.deleteSale(fakeId);

      const { err } = response;
      expect(err.code).to.be.equal('invalid_data');
      expect(err.message).to.be.equal('Wrong sale ID format');
    });
  });

  describe('when the sale is successfully deleted', async () => {
    const deletedSale = {
      _id: ID_EXAMPLE,
      itensSold: [
        { productId: '1233456', quantity: 5 }
      ]
    };

    before(() => {
      sinon.stub(SalesModel, 'deleteSale')
        .resolves(deletedSale)
    });

    after(() => {
      SalesModel.deleteSale.restore();
    })

    it('returns an object', async () => {
      const response = await SalesService.deleteSale(ID_EXAMPLE);

      expect(response).to.be.an('object')
    });

    it('with and _id', async () => {
      const response = await SalesService.deleteSale(ID_EXAMPLE);

      expect(response).to.have.a.property('_id');
    });

    it('with a itensSold property', async () => {
      const response = await SalesService.deleteSale(ID_EXAMPLE);

      expect(response).to.have.a.property('itensSold');
    });
  });
});
