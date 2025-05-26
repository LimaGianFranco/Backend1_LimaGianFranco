import { Router } from 'express';
import { ProductModel } from '../dao/models/Product.model.js';


const router = Router();

router.get('/', async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron obtener los productos' });
    }
});

router.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price == null || status == null || stock == null || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const newProduct = new ProductModel({
            title, description, code, price, status, stock, category, thumbnails
        });

        await newProduct.save();

        const io = req.app.get('io');
        const allProducts = await ProductModel.find();
        io.emit('productsUpdated', allProducts);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo crear el producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        const deleted = await ProductModel.findByIdAndDelete(pid);

        const io = req.app.get('io');
        const allProducts = await ProductModel.find();
        io.emit('productsUpdated', allProducts);

        deleted
            ? res.json({ message: 'Producto eliminado correctamente' })
            : res.status(404).json({ error: 'Producto no encontrado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;
