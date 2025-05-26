import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import { ProductModel } from "./dao/models/Product.model.js";
import { CartModel } from "./dao/models/Cart.model.js";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://Lima:Hka1gNkNn9QCgVhQ@cluster0.yn5vp67.mongodb.net/Bse?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((error) => console.error("❌ Error de conexión a MongoDB:", error));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

const hbs = handlebars.create({
  helpers: {
    eq: (a, b) => a === b, 
  },
  defaultLayout: "main",
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
  res.render("index", { title: "Página Principal" });
});

app.get("/realtimeproducts", async (req, res) => {
  const sort = req.query.sort || 'desc'; 
  const sortOrder = sort === 'asc' ? 1 : -1;

  try {
    const allProducts = await ProductModel.find().sort({ price: sortOrder }).lean();
    res.render("realTimeProducts", {
      title: "Productos en Tiempo Real",
      productos: allProducts,
      sort, 
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener productos.");
  }
});

app.get("/productos/:pid", async (req, res) => {
  const productId = req.params.pid;
  try {
    const product = await ProductModel.findById(productId).lean();
    res.render("productDetail", { title: product.title, product });
  } catch (error) {
    console.error("❌ Error al obtener el producto:", error);
    res.status(500).send("Error al obtener el producto.");
  }
});

app.get("/cart/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await CartModel.findById(cid).populate('products.product').lean();
    res.render("cart", { title: "Carrito de Compras", cart });
  } catch (error) {
    console.error(" Error al obtener el carrito:", error);
    res.status(500).send("Error al obtener el carrito.");
  }
});

app.get("/adminproducts", async (req, res) => {
  const sort = req.query.sort || 'desc';
  const sortOrder = sort === 'asc' ? 1 : -1; 

  try {
    const allProducts = await ProductModel.find().sort({ price: sortOrder }).lean();
    res.render("adminProducts", { title: "Administrar Productos", productos: allProducts, sort });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener productos.");
  }
});

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado por WebSocket");
  ProductModel.find().lean().then((allProducts) => {
    socket.emit("productsUpdated", allProducts);
  });

  socket.on("newProduct", async (productData) => {
    try {
      await ProductModel.create(productData);
      const updatedProducts = await ProductModel.find().lean();
      io.emit("productsUpdated", updatedProducts);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await ProductModel.findByIdAndDelete(productId);
      const updatedProducts = await ProductModel.find().lean();
      io.emit("productsUpdated", updatedProducts);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  });

  socket.on("editProduct", async ({ productId, title, code, price }) => {
    try {
      const product = await ProductModel.findById(productId);
      
      if (!product) {
        console.log("Producto no encontrado");
        return;
      }
      product.title = title;
      product.code = code;
      product.price = price;
      await product.save();
      const updatedProducts = await ProductModel.find().lean();
      io.emit("productsUpdated", updatedProducts);
    } catch (error) {
      console.error("Error al editar el producto:", error);
    }
  });

  socket.on("addProductToCart", async (cartId, productId) => {
    try {
      const cart = await CartModel.findById(cartId);
      const product = await ProductModel.findById(productId);

      if (!cart || !product) {
        return socket.emit("error", "Carrito o producto no encontrado");
      }

      const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex === -1) {
        cart.products.push({ product: productId, quantity: 1 });
      } else {
        cart.products[productIndex].quantity += 1;
      }

      await cart.save();
      io.emit("cartUpdated", cart);
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
    }
  });
});
