router.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price == null || status == null || stock == null || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const newProduct = await productManager.addProduct({
        title, description, code, price, status, stock, category, thumbnails
    });
    const io = req.app.get('io');
    const allProducts = await productManager.getProducts();
    io.emit('productsUpdated', allProducts);

    res.status(201).json(newProduct);
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    const deleted = await productManager.deleteProduct(pid);

    const io = req.app.get('io');
    const allProducts = await productManager.getProducts();
    io.emit('productsUpdated', allProducts);

    deleted
        ? res.json({ message: 'Producto eliminado correctamente' })
        : res.status(404).json({ error: 'Producto no encontrado' });
});
