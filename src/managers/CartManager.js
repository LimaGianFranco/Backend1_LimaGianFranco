import fs from 'fs/promises';
import path from 'path';

const cartsFilePath = path.join(process.cwd(), 'data', 'carts.json');

export default class CartManager {
    async readCarts() {
        try {
            const data = await fs.readFile(cartsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async writeCarts(carts) {
        await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    }

    async getAllCarts() {
        return await this.readCarts();
    }

    async createCart() {
        const carts = await this.readCarts();
        const newCart = { id: String(Date.now()), products: [] };
        carts.push(newCart);
        await this.writeCarts(carts);
        return newCart;
    }

    async getCartById(cid) {
        const carts = await this.readCarts();
        return carts.find(c => c.id === cid);
    }

    async addProductToCart(cid, pid) {
        const carts = await this.readCarts();
        const cartIndex = carts.findIndex(c => c.id === cid);
        if (cartIndex === -1) return null;

        const productIndex = carts[cartIndex].products.findIndex(p => p.id === String(pid));
        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity += 1;
        } else {
            carts[cartIndex].products.push({ id: String(pid), quantity: 1 });
        }

        await this.writeCarts(carts);
        return carts[cartIndex];
    }
}
