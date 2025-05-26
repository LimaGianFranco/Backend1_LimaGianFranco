import { Router } from "express";
import { CartModel } from "../dao/models/Cart.model.js";
import { ProductModel } from "../dao/models/Product.model.js"; 

const router = Router();

router.get("/", async (req, res) => {
  try {
    const carts = await CartModel.find().populate("products.product");
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron obtener los carritos" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid).populate("products.product");
    cart
      ? res.json(cart)
      : res.status(404).json({ error: "Carrito no encontrado" });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newCart = new CartModel();
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "No se pudo crear el carrito" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid);
    const product = await ProductModel.findById(req.params.pid);

    if (!cart || !product) {
      return res.status(404).json({ error: "Carrito o producto no encontrado" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === product._id.toString()
    );

    if (productIndex === -1) {
      cart.products.push({ product: product._id, quantity: 1 });
    } else {
      cart.products[productIndex].quantity += 1;
    }

    await cart.save();
    const io = req.app.get("io");
    io.emit("cartUpdated", cart);

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid);
    const product = cart.products.find(item => item.product.toString() === req.params.pid);

    if (!cart || !product) {
      return res.status(404).json({ error: "Carrito o producto no encontrado" });
    }

    const productIndex = cart.products.indexOf(product);
    cart.products.splice(productIndex, 1);

    await cart.save();
    const io = req.app.get("io");
    io.emit("cartUpdated", cart);

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body; 

    const cart = await CartModel.findById(req.params.cid);
    const product = cart.products.find(item => item.product.toString() === req.params.pid);

    if (!cart || !product) {
      return res.status(404).json({ error: "Carrito o producto no encontrado" });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: "La cantidad debe ser al menos 1" });
    }

    product.quantity = quantity;
    await cart.save();
    const io = req.app.get("io");
    io.emit("cartUpdated", cart);

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cantidad del producto" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.products = []; 
    await cart.save();
    const io = req.app.get("io");
    io.emit("cartUpdated", cart);

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar los productos del carrito" });
  }
});

export default router;
