import axios from 'axios';

async function test() {
  const res = await axios.get('https://dummyjson.com/products');

  console.log(res.data.products.slice(0, 2));
}

test();
