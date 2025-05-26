
import { Router } from "express";
import { ProductModel } from "../dao/models/Product.model.js";

const router = Router();
router.get("/all-products", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render("productDetail", {
      title: "Todos los Productos",
      products,
    });
  } catch (error) {
    console.error(" Error al obtener productos:", error);
    res.status(500).send("Error al obtener los productos");
  }
});
router.get('/adminproducts', async (req, res) => {
  res.render('adminProducts', { title: 'Administrar Productos' });
});

export default router;
router.get("/products/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    res.render("productDetail", {
      title: `Detalles de ${product.title}`,
      product,
    });
  } catch (error) {
    console.error(" Error al obtener el producto:", error);
    res.status(500).send("Error al obtener el producto");
  }
});
