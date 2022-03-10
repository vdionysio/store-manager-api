const sinon = require('sinon');
const { expect } = require('chai');

const ProductService = require('../../src/services/ProductService');
const ProductController = require('../../src/controllers/ProductController');

const SalesService = require('../../src/services/SalesService');
const SalesController = require('../../src/controllers/SalesController');

/* PRODUCTS */

describe('CONTROLLER 1 - When calls the controller of create', () => {
  describe('with an invalid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = {};

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(ProductService, 'create')
        .resolves({ err: { code: 'code', message: 'message'}});
    });

    after(() => {
      ProductService.create.restore();
    });

    it('name lenght is less than 5 character long - status code 422', async () => {
      request.body = { name: 'pro', quantity: 1 };
      await ProductController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('have the same name - status code 422', async () => {
      request.body = { name: 'duplicated', quantity: 1 };
      await ProductController.create(request, response);
      await ProductController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is less than 0 - status code 422', async () => {
      request.body = { name: 'product1', quantity: -1 };
      await ProductController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is 0 - status code 422', async () => {
      request.body = { name: 'product2', quantity: 0 };
      await ProductController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is a string - status code 422', async () => {
      request.body = { name: 'product3', quantity: 'string' };
      await ProductController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });
  });

  describe('with a valid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = {
        name: 'valid',
        quantity: 1
      };

      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();

      sinon.stub(ProductService, 'create')
        .resolves({
          _id: '123',
          name: 'name',
          quantity: 2,
        });
    });

    after(() => {
      ProductService.create.restore();
    });

    it('its called with a status code 201', async () => {
      await ProductController.create(request, response);
      expect(response.status.calledWith(201)).to.be.equal(true);
      expect(response.json.calledWithMatch({
        _id: '123',
        name: 'name',
        quantity: 2,
      }))
    });
  });
});

describe('CONTROLLER 2 - When calls the controller of getAll', () => {
  describe('When the product list is empty', () => {
    const response = {};
    const request = {};

    before(() => {
      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(ProductService, 'getAll')
        .resolves([]);
    });

    after(() => {
      ProductService.getAll.restore();
    });

    it('its called with a status code 200', async () => {
      await ProductController.getAll(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await ProductController.getAll(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with a propery products and a empty array', async () => {
      await ProductController.getAll(request, response);
      expect(response.json.calledWith({ products: []})).to.be.equal(true);
    });
  });

  describe('When the product list is not empty', () => {
    const response = {};
    const request = {};
    const ID_EXAMPLE = '604cb554311d68f491ba5781';
    const product = { _id: ID_EXAMPLE, name: 'product', quantity: 2}

    before(() => {
      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(ProductService, 'getAll')
        .resolves([product]);
    });

    after(() => {
      ProductService.getAll.restore();
    });

    it('its called with a status code 200', async () => {
      await ProductController.getAll(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await ProductController.getAll(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with a propery products and a empty array', async () => {
      await ProductController.getAll(request, response);
      expect(response.json.calledWith({ products: [product]})).to.be.equal(true);
    });
  });
});

describe('CONTROLLER 3 - When calls the controller of getById', () => {
  describe('When there is no product with the id', () => {
    const response = {};
    const request = {};
    const fakeId = '11aa1111aa11a1111a1111a1';

    before(() => {
      request.params = {
        id: fakeId
      };

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(ProductService, 'getById')
        .resolves({ err: { code: 'invalid_data', message: 'Wrong id format'}});
    });

    after(() => {
      ProductService.getById.restore();
    });

    it('its called with a status code 422', async () => {
      await ProductController.getById(request, response);
      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await ProductController.getById(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with a property err', async () => {
      await ProductController.getById(request, response);
      expect(response.json.calledWith({ err: { code: 'invalid_data', message: 'Wrong id format'}}))
        .to.be.equal(true);
    });
  });

  describe('When there is a valid product id', () => {
    const response = {};
    const request = {};
    const ID_EXAMPLE = '604cb554311d68f491ba5781';
    const product = { _id: ID_EXAMPLE, name: 'product', quantity: 2}

    before(() => {
      request.params = {
        id: ID_EXAMPLE,
      };

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(ProductService, 'getById')
        .resolves(product);
    });

    after(() => {
      ProductService.getById.restore();
    });

    it('its called with a status code 200', async () => {
      await ProductController.getById(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await ProductController.getById(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with properties _id, name and quantity', async () => {
      await ProductController.getById(request, response);
      expect(response.json.calledWith(product)).to.be.equal(true);
    });
  });
});

describe('CONTROLLER 4 - When calls the controller of update', () => {
  const fakeId = '11aa1111aa11a1111a1111a1';

  describe('with an invalid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = {};

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(ProductService, 'update')
        .resolves({ err: { code: 'code', message: 'message'}});
    });

    after(() => {
      ProductService.update.restore();
    });

    it('id is invalid',async () => {
      request.body = { name: 'product', quantity: 1 };
      request.params = { id: '123' }
      await ProductController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('name lenght is less than 5 character long - status code 422', async () => {
      request.body = { name: 'pro', quantity: 1 };
      request.params = { id: '123' }
      await ProductController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('have the same name - status code 422', async () => {
      request.body = { name: 'duplicated', quantity: 1 };
      request.params = { id: '123' }
      await ProductController.update(request, response);
      await ProductController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is less than 0 - status code 422', async () => {
      request.body = { name: 'product1', quantity: -1 };
      request.params = { id: '123' }
      await ProductController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is 0 - status code 422', async () => {
      request.body = { name: 'product2', quantity: 0 };
      request.params = { id: '123' }
      await ProductController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is a string - status code 422', async () => {
      request.body = { name: 'product3', quantity: 'string' };
      request.params = { id: '123' }
      await ProductController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });
  });

  describe('with a valid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = {
        name: 'valid',
        quantity: 1
      };

      request.params = {
        id: '123'
      }
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();

      sinon.stub(ProductService, 'update')
        .resolves({
          _id: request.params.id,
          name: request.body.name,
          quantity: request.body.quantity,
        });
    });

    after(() => {
      ProductService.update.restore();
    });

    it('its called with a status code 200', async () => {
      await ProductController.update(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
      expect(response.json.calledWithMatch({
        _id: '123',
        name: 'name',
        quantity: 2,
      }))
    });
  });
});

describe('CONTROLLER 5 - When calls the controller of delete', () => {
  const fakeId = '11aa1111aa11a1111a1111a1';

  describe('with an invalid input', () => {
    const response = {};
    const request = {};

    before(() => {
      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(ProductService, 'deleteProduct')
        .resolves({ err: { code: 'code', message: 'message'}});
    });

    after(() => {
      ProductService.deleteProduct.restore();
    });

    it('id is invalid',async () => {
      request.params = { id: fakeId }
      await ProductController.deleteProduct(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });
  });

  describe('with a valid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.params = {
        id: fakeId
      }

      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();

      sinon.stub(ProductService, 'deleteProduct')
        .resolves({
          _id: request.params.id,
          name: 'product',
          quantity: 2,
        });
    });

    after(() => {
      ProductService.deleteProduct.restore();
    });

    it('its called with a status code 200', async () => {
      await ProductController.deleteProduct(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
      expect(response.json.calledWithMatch({
        _id: fakeId,
        name: 'product',
        quantity: 2,
      }))
    });
  });
});

/* SALES */

describe('CONTROLLER 6 - When calls the controller of Sales.create', () => {
  const ID_EXAMPLE = '604cb554311d68f491ba5781';
  describe('with an invalid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = {};

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(SalesService, 'create')
        .resolves({ err: { code: 'invalid_data', message: 'Wrong product ID or invalid quantity'}});
    });

    after(() => {
      SalesService.create.restore();
    });

    it('have an invalid product id - status code 422', async () => {
      request.body = [{ productId: ID_EXAMPLE, quantity: 1}];
      await SalesController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is less than 0 - status code 422', async () => {
      request.body = [{ productId: ID_EXAMPLE, quantity: -1}];
      await SalesController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is 0 - status code 422', async () => {
      request.body = [{ productId: ID_EXAMPLE, quantity: 0}];
      await SalesController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is a string - status code 422', async () => {
      request.body = [{ productId: ID_EXAMPLE, quantity: 'string'}];
      await SalesController.create(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });
  });

  describe('with a valid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = [
        { productId: ID_EXAMPLE, quantity: 1 },
      ];

      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();

      sinon.stub(SalesService, 'create')
        .resolves({
          _id: '123',
          itensSold: [
            { productId: ID_EXAMPLE, quantity: 1 },
          ]
        });
    });

    after(() => {
      SalesService.create.restore();
    });

    it('its called with a status code 200', async () => {
      await SalesController.create(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
      expect(response.json.calledWithMatch({
        _id: '123',
        itensSold: [
          { productId: ID_EXAMPLE, quantity: 1 },
        ],
      }))
    });
  });
});

describe('CONTROLLER 7 - When calls the controller of Sales.getAll', () => {
  describe('When the product list is empty', () => {
    const response = {};
    const request = {};

    before(() => {
      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(SalesService, 'getAll')
        .resolves([]);
    });

    after(() => {
      SalesService.getAll.restore();
    });

    it('its called with a status code 200', async () => {
      await SalesController.getAll(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await SalesController.getAll(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with a propery products and a empty array', async () => {
      await SalesController.getAll(request, response);
      expect(response.json.calledWith({ sales: []})).to.be.equal(true);
    });
  });

  describe('When the product list is not empty', () => {
    const response = {};
    const request = {};
    const ID_EXAMPLE = '604cb554311d68f491ba5781';
    const sale = { _id: ID_EXAMPLE, itensSold: [ { productId: '12345', quantity: 10 } ] };

    before(() => {
      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(SalesService, 'getAll')
        .resolves([sale]);
    });

    after(() => {
      SalesService.getAll.restore();
    });

    it('its called with a status code 200', async () => {
      await SalesController.getAll(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await SalesController.getAll(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with a propery products and a empty array', async () => {
      await SalesController.getAll(request, response);
      expect(response.json.calledWith({ sales: [sale]})).to.be.equal(true);
    });
  });
});

describe('CONTROLLER 8 - When calls the controller of Sales.getById', () => {
  describe('When there is no sale with the id', () => {
    const response = {};
    const request = {};
    const fakeId = '11aa1111aa11a1111a1111a1';

    before(() => {
      request.params = {
        id: fakeId
      };

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(SalesService, 'getById')
        .resolves({ err: { code: 'not_found', message: 'Sale not found' } });
    });

    after(() => {
      SalesService.getById.restore();
    });

    it('its called with a status code 404', async () => {
      await SalesController.getById(request, response);
      expect(response.status.calledWith(404)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await SalesController.getById(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with a property err', async () => {
      await SalesController.getById(request, response);
      expect(response.json.calledWith({ err: { code: 'not_found', message: 'Sale not found' } }))
        .to.be.equal(true);
    });
  });

  describe('When there is a valid sale id', () => {
    const response = {};
    const request = {};
    const ID_EXAMPLE = '604cb554311d68f491ba5781';
    const sale = { _id: ID_EXAMPLE, itensSold: [ { productId: '123456', quantity: 2 }] };

    before(() => {
      request.params = {
        id: ID_EXAMPLE,
      };

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(SalesService, 'getById')
        .resolves(sale);
    });

    after(() => {
      SalesService.getById.restore();
    });

    it('its called with a status code 200', async () => {
      await SalesController.getById(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('its called a json with an object ', async () => {
      await SalesController.getById(request, response);
      expect(response.json.calledWith(sinon.match.object)).to.be.equal(true);
    });

    it('its called a json with properties _id, name and quantity', async () => {
      await SalesController.getById(request, response);
      expect(response.json.calledWith(sale)).to.be.equal(true);
    });
  });
});

describe('CONTROLLER 4 - When calls the controller of update', () => {
  const fakeId = '11aa1111aa11a1111a1111a1';

  describe('with an invalid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = {};

      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(SalesService, 'update')
        .resolves({ err: { code: 'code', message: 'message'}});
    });

    after(() => {
      SalesService.update.restore();
    });

    it('id is invalid',async () => {
      request.body = [{ productId: '123', quantity: 10 }];
      request.params = { id: '123' }
      await SalesController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is less than 0 - status code 422', async () => {
      request.body = [{ productId: '123456789012', quantity: -1 }];
      request.params = { id: '123' }
      await SalesController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is 0 - status code 422', async () => {
      request.body = [{ productId: '123456789012', quantity: 0 }];
      request.params = { id: '123' }
      await SalesController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });

    it('quantity is a string - status code 422', async () => {
      request.body = [{ productId: '123456789012', quantity: 'string' }];
      request.params = { id: '123' }
      await SalesController.update(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });
  });

  describe('with a valid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.body = [{ productId: '123456789012', quantity: 'string' }];

      request.params = {
        id: '123'
      }
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();

      sinon.stub(SalesService, 'update')
        .resolves({
          _id: request.params.id,
          itensSold: request.body,
        });
    });

    after(() => {
      SalesService.update.restore();
    });

    it('its called with a status code 200', async () => {
      await SalesController.update(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
      expect(response.json.calledWithMatch({
        _id: '123',
        itensSold: [{ productId: '123456789012', quantity: 'string' }],
      }));
    });
  });
});

describe('CONTROLLER 10 - When calls the controller of Sales.deleteSale', () => {
  const fakeId = '11aa1111aa11a1111a1111a1';

  describe('with an invalid input', () => {
    const response = {};
    const request = {};

    before(() => {
      response.status = sinon.stub().returns(response);
      response.json = sinon.stub().returns();

      sinon.stub(SalesService, 'deleteSale')
        .resolves({ err: { code: 'invalid_data', message: 'Wrong sale ID format'}});
    });

    after(() => {
      SalesService.deleteSale.restore();
    });

    it('id is invalid',async () => {
      request.params = { id: fakeId }
      await SalesController.deleteSale(request, response);

      expect(response.status.calledWith(422)).to.be.equal(true);
    });
  });

  describe('with a valid input', () => {
    const response = {};
    const request = {};

    before(() => {
      request.params = {
        id: fakeId
      }

      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();

      sinon.stub(SalesService, 'deleteSale')
        .resolves({
          _id: request.params.id,
          itensSold: [
            { productId: '1234456', quantity: 10 },
          ],
        });
    });

    after(() => {
      SalesService.deleteSale.restore();
    });

    it('its called with a status code 200', async () => {
      await SalesController.deleteSale(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
      expect(response.json.calledWithMatch({
        _id: fakeId,
        itensSold: [
          { productId: '1234456', quantity: 10 },
        ],
      }))
    });
  });
});
