import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.json(products);
});

router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductById(req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

router.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price == null || status == null || stock == null || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const newProduct = await productManager.addProduct({
        title, description, code, price, status, stock, category, thumbnails
    });

    res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const updateData = req.body;

    if (updateData.id) {
        return res.status(400).json({ error: 'No se puede modificar el id' });
    }

    const updated = await productManager.updateProduct(pid, updateData);
    updated ? res.json(updated) : res.status(404).json({ error: 'Producto no encontrado' });
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    const deleted = await productManager.deleteProduct(pid);
    deleted
        ? res.json({ message: 'Producto eliminado correctamente' })
        : res.status(404).json({ error: 'Producto no encontrado' });
});

export default router;
