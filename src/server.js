import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import ProductManager from "./managers/ProductManager.js";  
const productManager = new ProductManager();                
const app = express();
const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.engine("handlebars", handlebars.engine({
    defaultLayout: 'main' 
}));
app.set("view engine", "handlebars");
console.log("Ruta de vistas:", path.join(__dirname, "../views"));
app.set("views", path.join(__dirname, "../views"));
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.get("/", (req, res) => {
    res.render("index", { title: "Página Principal" });
});

app.get("/realtimeproducts", async (req, res) => {
    try {
        const allProducts = await productManager.getProducts();
        res.render("realTimeProducts", { title: "Productos en Tiempo Real", productos: allProducts });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).send("Error al obtener los productos.");
    }
});

io.on("connection", (socket) => {
    console.log("Cliente conectado por WebSocket");

    productManager.getProducts().then((allProducts) => {
        socket.emit('productsUpdated', allProducts);
    });

    socket.on('newProduct', async (productData) => {
        try {
            await productManager.addProduct(productData);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts); 
        } catch (error) {
            console.error("Error al agregar producto:", error);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.deleteProduct(productId);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts); 
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    });
});
