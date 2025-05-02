const socket = io();

socket.on('productsUpdated', (products) => {
  const list = document.getElementById('productList');
  list.innerHTML = ''; 
  products.forEach(product => {
    const li = document.createElement('li');
    li.textContent = `${product.title} - $${product.price}`;
    list.appendChild(li);
  });
});
