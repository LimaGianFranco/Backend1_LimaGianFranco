import fs from 'fs/promises';
import path from 'path';

const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

class ProductManager {
    async getProducts() {
        try {
            const data = await fs.readFile(productsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }


    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === id);
    }

    async addProduct(productData) {
        const products = await this.getProducts();
        const newProduct = { id: String(Date.now()), ...productData };
        products.push(newProduct);
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;

        if (Object.keys(updatedFields).length === 0) {
            throw new Error("No hay campos para actualizar");
        }

        products[index] = { ...products[index], ...updatedFields, id };
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
        return products[index];
    }

    async deleteProduct(id) {
        let products = await this.getProducts();
        const newProducts = products.filter(p => p.id !== id);
        if (products.length === newProducts.length) return false;

        await fs.writeFile(productsFilePath, JSON.stringify(newProducts, null, 2));
        return true;
    }
}

export default ProductManager;
