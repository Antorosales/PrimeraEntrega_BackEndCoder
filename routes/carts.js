const express = require('express');
const fs = require('fs');
const router = express.Router();

const cartsFile = './data/carrito.json';

const readFile = (file) => {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const writeFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

router.post('/', (req, res) => {
    const carts = readFile(cartsFile);
    const newCart = {
        id: carts.length ? (parseInt(carts[carts.length - 1].id) + 1).toString() : '1',
        products: []
    };

    carts.push(newCart);
    writeFile(cartsFile, carts);
    res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
    const carts = readFile(cartsFile);
    const cart = carts.find(c => c.id === req.params.cid);

    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

router.post('/:cid/product/:pid', (req, res) => {
    const carts = readFile(cartsFile);
    const cartIndex = carts.findIndex(c => c.id === req.params.cid);

    if (cartIndex === -1) {
        return res.status(404).json({ error: 'Carrito no encontrado...' });
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(p => p.product === req.params.pid);

    if (productIndex === -1) {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    } else {
        cart.products[productIndex].quantity += 1;
    }

    carts[cartIndex] = cart;
    writeFile(cartsFile, carts);
    res.status(201).json(cart);
});

module.exports = router;
