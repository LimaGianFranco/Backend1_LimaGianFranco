import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
    const carts = await cartManager.getAllCarts();
    res.json(carts);
});

router.get('/:cid', async (req, res) => {
    const cart = await cartManager.getCartById(req.params.cid);
    cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
    cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

export default router;
