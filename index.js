const express = require('express');
const bodyParser = require('body-parser');
const ProductController = require('./controllers/ProductController');
const SalesController = require('./controllers/SalesController');

const app = express();
app.use(bodyParser.json());

require('dotenv').config();

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.send();
});

// insert a product
app.post('/products', ProductController.create);

// list all products
app.get('/products', ProductController.getAll);

// list a product by an id
app.get('/products/:id', ProductController.getById);

// update a product by an id
app.put('/products/:id', ProductController.update);

// delete a product by an id
app.delete('/products/:id', ProductController.deleteProduct);

// register a new sale
app.post('/sales', SalesController.create);

// list all sales
app.get('/sales', SalesController.getAll);

// find a specific sale
app.get('/sales/:id', SalesController.getById);

// delete a sale by id
app.delete('/sales/:id', SalesController.deleteSale);

app.put('/sales/:id', SalesController.update);

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`));
