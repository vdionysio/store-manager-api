const sinon = require('sinon');
const { expect } = require('chai');
const { ObjectID } = require('mongodb');

const { MongoClient } = require('mongodb');
const { getConnection } = require('./mongoMockConnection');

require('dotenv').config();

const ProductModel = require('../../models/ProductModel');
const SalesModel = require('../../models/SalesModel');

/* PRODUCTS */

describe('MODEL 1 - Insert a new product on DB', () => {
  let connectionMock;

  const newProduct = {
    name: 'product_name',
    quantity: 1
  };

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  })

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('when is successefully inserted', () => {
    it('should return a object', async () => {
      const response = await ProductModel.create(newProduct);

      expect(response).to.be.a('object');
    });

    it('that should have an id', async () => {
      const response = await ProductModel.create(newProduct);

      expect(response).to.have.a.property('_id');
    });

    it('that should have a name', async () => {
      const response = await ProductModel.create(newProduct);

      expect(response).to.have.a.property('name');
    });

    it('that should have a quantity', async () => {
      const response = await ProductModel.create(newProduct);

      expect(response).to.have.a.property('quantity');
    });

    it('that should have a product with the name inserted', async () => {
      await ProductModel.create(newProduct);
      const productInserted = await ProductModel.getByName(newProduct.name)
      expect(productInserted).to.be.not.null;
    })
  });
});

describe('MODEL 2 - List all products', () => {

  describe('when the product list is empty', async () => {
    let connectionMock;

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    });


    after(async () => {
      MongoClient.connect.restore();
    });

    it('should return an array', async () => {
      const list = await ProductModel.getAll();

      expect(list).to.be.an('array');
    });

    it('that is empty', async () => {
    await ProductModel.cleanCollection();
    const list = await ProductModel.getAll();

    expect(list).to.be.empty;
    })

  });

  describe('when the product list is not empty', async () => {
    const newProd = { name: 'product1', quantity: 1};

    let connectionMock;

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    });


    after(() => {
      MongoClient.connect.restore();
    });

    it('should return an array', async () => {
      await connectionMock.db('StoreManager').collection('products').insertOne(newProd)
      const list = await ProductModel.getAll();

      expect(list).to.be.an('array');
    });

    it('that is not empty', async () => {
      const list = await ProductModel.getAll();

      expect(list).to.be.not.empty;
    });

  });
});

describe('MODEL 3 - List a product by ID', () => {

  describe('when there is no product with the id on the list', async () => {
    let connectionMock;

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    });


    after(async () => {
      MongoClient.connect.restore();
    });

    it('should return a null', async () => {
      const fakeId = "11aa1111aa11a1111a1111a1"
      const product = await ProductModel.getById(fakeId);

      expect(product).to.be.null;
    });
  });

  describe('when the product id is valid', async () => {
    const prodList = [
      { name: 'product1', quantity: 1},
      { name: 'product2', quantity: 2},
      { name: 'product3', quantity: 3},
      { name: 'product4', quantity: 4},
    ];

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
      prodList.forEach(async (newProd) => {
        await connectionMock.db('StoreManager').collection('products').insertOne({ ...newProd });
      });
    });


    after(async () => {
      await connectionMock.db('StoreManager').collection('products').drop();
      MongoClient.connect.restore();
    });

    it('should return an object', async () => {
      const { _id } = await connectionMock.db('StoreManager').collection('products').findOne();
      const product = await ProductModel.getById(_id);

      expect(product).to.be.an('object');
    });

    it('that have an id', async () => {
      const { _id } = await connectionMock.db('StoreManager').collection('products').findOne();
      const product = await ProductModel.getById(_id);

      expect(product).to.have.property('_id');
    });

    it('that have a name', async () => {
      const { _id } = await connectionMock.db('StoreManager').collection('products').findOne();
      const product = await ProductModel.getById(_id);

      expect(product).to.have.property('name');
    });

    it('that have a quantity', async () => {
      const { _id } = await connectionMock.db('StoreManager').collection('products').findOne();
      const product = await ProductModel.getById(_id);

      expect(product).to.have.property('quantity');
    });
  });
});

describe('MODEL 4 - Update a product by ID', () => {
  const product = { name: 'pre-update', quantity: 1 };
  let connectionMock;
  const fakeId = '11aa1111aa11a1111a1111a1';

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('when is successefully updated', () => {

    it('should return the updated product', async () => {
      const { _id } = await ProductModel.create(product)

      const result = await ProductModel.update(
        { id: _id, name: 'post-update', quantity: 20},
      );

      expect(result).to.deep.equal({ _id, name: 'post-update', quantity: 20});
    });
  });

  describe('when there is no product with the id', () => {

    it('should return a null', async () => {
      const result = await ProductModel.update(
        { id: fakeId, name: 'post-update', quantity: 20},
      );

      expect(result).to.be.null;
    });
  });
});

describe('MODEL 5 - Delete a product by ID', () => {
  const product = { name: 'product', quantity: 1 };
  let connectionMock;
  const fakeId = '11aa1111aa11a1111a1111a1';

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('when is successefully deleted', () => {

    it('should return the deleted product', async () => {
      const { _id } = await ProductModel.create(product)

      const result = await ProductModel.deleteProduct(_id);

      expect(result).to.deep.equal({ _id, ...product});
    });
  });

  describe('when there is no product with the id', () => {

    it('should return a null', async () => {
      await ProductModel.create(product)
      const result = await ProductModel.deleteProduct(fakeId);

      expect(result).to.be.null;
    });
  });
});

/* SALES */

describe('MODEL 6 - Register a new sale', () => {
  let connectionMock;

  const products = [
    { name: 'product1', quantity: 30 },
    { name: 'product2', quantity: 30 },
    { name: 'product3', quantity: 30 },
  ];

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  })

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('When is successefully registered', async () => {
    it('should return an object with _id and itensSold properties', async () => {
      ProductModel.cleanCollection();
      const { insertedIds } = await connectionMock.db('StoreManager').collection('products').insertMany(products)
      const saleInput = [{ productId: insertedIds['0'], "quantity": 10 }];

      const newSale = await SalesModel.create(saleInput)
      expect(newSale).to.be.an('object');
      expect(newSale).to.have.a.property('_id');
      expect(newSale).to.have.a.property('itensSold')
      expect(newSale.itensSold).to.be.an('array');
    });
  });
});

describe('MODEL 7 - List all sales', () => {

  describe('when the product list is empty', async () => {
    let connectionMock;

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    });


    after(async () => {
      MongoClient.connect.restore();
    });

    it('should return an array', async () => {
      const list = await SalesModel.getAll();

      expect(list).to.be.an('array');
    });

    it('that is empty', async () => {
    await SalesModel.cleanCollection();
    const list = await SalesModel.getAll();

    expect(list).to.be.empty;
    })

  });

  describe('when the product list is not empty', async () => {
    const ID_EXAMPLE = '604cb554311d68f491ba5781';
    const itens = [{ productId: ID_EXAMPLE, quantity: 10 }];

    let connectionMock;

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    });


    after(() => {
      MongoClient.connect.restore();
    });

    it('should return an array', async () => {
      await connectionMock.db('StoreManager').collection('sales').insertOne({ itens })
      const list = await SalesModel.getAll();

      expect(list).to.be.an('array');
    });

    it('that is not empty', async () => {
      const list = await SalesModel.getAll();

      expect(list).to.be.not.empty;
    });

  });
});

describe('MODEL 8 - List a sale by ID', () => {

  describe('when there is no product with the id on the list', async () => {
    let connectionMock;

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    });


    after(async () => {
      MongoClient.connect.restore();
    });

    it('should return a null', async () => {
      const fakeId = "11aa1111aa11a1111a1111a1"
      const sale = await SalesModel.getById(fakeId);

      expect(sale).to.be.null;
    });
  });

  describe('when the product id is valid', async () => {
    const itensSold = [
      { productId: '1234561', quantity: 1},
      { productId: '1234562', quantity: 2},
      { productId: '1234563', quantity: 3},
      { productId: '1234564', quantity: 4},
    ];

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
      await SalesModel.cleanCollection();
      await connectionMock.db('StoreManager').collection('sales').insertOne({ itensSold });
    });


    after(async () => {
      await connectionMock.db('StoreManager').collection('sales').drop();
      MongoClient.connect.restore();
    });

    it('should return an object', async () => {
      const { _id } = await connectionMock.db('StoreManager').collection('sales').findOne();
      const sale = await SalesModel.getById(_id);

      expect(sale).to.be.an('object');
    });

    it('that have an id', async () => {
      const { _id } = await connectionMock.db('StoreManager').collection('sales').findOne();
      const sale = await SalesModel.getById(_id);

      expect(sale).to.have.property('_id');
    });

    it('that have a itensSold array', async () => {
      const { _id } = await connectionMock.db('StoreManager').collection('sales').findOne();
      const sale = await SalesModel.getById(_id);

      expect(sale).to.have.property('itensSold');
      expect(sale.itensSold).to.be.an('array');
    });
  });
});

describe('MODEL 9 - Update a sale by ID', () => {
  const sale = [{ productId: '123456', quantity: 10 }];

  let connectionMock;
  const fakeId = '11aa1111aa11a1111a1111a1';

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('when there is no product with the id', () => {

    it('should return a null', async () => {
      const result = await SalesModel.update(
        { id: fakeId, itensSold: [{ productId: '123456', quantity: 10 }] },
      );

      expect(result).to.be.null;
    });
  });

  describe('when is successefully updated', () => {

    it('should return the updated product', async () => {
      const { _id } = await SalesModel.create(sale)

      const result = await SalesModel.update(
        { id: _id, itensSold: [{ productId: '123456', quantity: 80 }] },
      );

      expect(result).to.deep.equal({ _id, itensSold: [{ productId: '123456', quantity: 80 }] });
    });
  });
});

describe('MODEL 10 - Delete a sale by ID', () => {
  const sale = [{ productId: '123456', quantity: 10 }];
  let connectionMock;
  const fakeId = '11aa1111aa11a1111a1111a1';

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  describe('when is successefully deleted', () => {

    it('should return the deleted sale', async () => {
      const { _id } = await SalesModel.create(sale)

      const result = await SalesModel.deleteSale(_id);

      expect(result).to.deep.equal({ _id, itensSold: sale });
    });
  });

  describe('when there is no sale with the id', () => {

    it('should return a null', async () => {
      await SalesModel.create(sale)
      const result = await SalesModel.deleteSale(fakeId);

      expect(result).to.be.null;
    });
  });
});
