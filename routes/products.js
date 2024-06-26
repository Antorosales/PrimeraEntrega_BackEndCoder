const express = require('express');
const fs = require('fs');
const router = express.Router();

const productsFile = './data/productos.json';

const readFile = (file) => {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const writeFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

router.get('/', (req, res) => {
    const { limit } = req.query;
    const products = readFile(productsFile);
    if (limit) {
        res.json(products.slice(0, limit));
    } else {
        res.json(products);
    }
});

router.get('/:pid', (req, res) => {
    const products = readFile(productsFile);
    const product = products.find(p => p.id === req.params.pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

router.post('/', (req, res) => {
    const products = readFile(productsFile);
    const newProduct = {
        id: products.length ? (parseInt(products[products.length - 1].id) + 1).toString() : '1',
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: req.body.status !== undefined ? req.body.status : true,
        stock: req.body.stock,
        category: req.body.category,
        thumbnails: req.body.thumbnails || []
    };

    if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, a excepción de thumbnails' });
    }

    products.push(newProduct);
    writeFile(productsFile, products);
    res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
    const products = readFile(productsFile);
    const productIndex = products.findIndex(p => p.id === req.params.pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = { ...products[productIndex], ...req.body };
    delete updatedProduct.id; 

    products[productIndex] = updatedProduct;
    writeFile(productsFile, products);
    res.json(updatedProduct);
});

router.delete('/:pid', (req, res) => {
    const products = readFile(productsFile);
    const newProducts = products.filter(p => p.id !== req.params.pid);

    if (newProducts.length === products.length) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    writeFile(productsFile, newProducts);
    res.status(204).send();
});

module.exports = router;
