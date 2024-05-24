import { Api } from './components/base/api';
import { ShopApi } from './components/connection/ShopApi';
import { EventEmitter } from './components/base/events';

import { IApi, IProduct } from './types';
import { API_URL } from './utils/constants';
import { Catalog } from './components/data/Catalog';
import './scss/styles.scss';

const events = new EventEmitter();
const baseApi = new Api(API_URL);
const api = new ShopApi(baseApi as IApi);
const catalog = new Catalog(events);

events.onAll(event => console.log(event));

api.getGoods()
  .then(goods => {
    catalog.setGoods(goods.items as IProduct[]);
})
.catch((err) => {
  console.error(err);
});

console.log(catalog.items);

events.on('goods:changed', () => {
  console.log('goods from arr');
  console.log(catalog.items);
  console.log('product from arr');
  console.log(catalog.getProduct('854cef69-976d-4c2a-a18c-2aa45046c390'));
})


/*
api.getProduct('854cef69-976d-4c2a-a18c-2aa45046c390')
.then(goods => {
  console.log(goods);
})
.catch((err) => {
  console.error(err);
});

api.makePurchase(
  {
    payment: 'online',
    email: 'abc@abc.ru',
    phone: '1-234-56-78',
    address: 'Test Street',
    total: 2200,
    items: [
      '854cef69-976d-4c2a-a18c-2aa45046c390',
      'c101ab44-ed99-4a54-990d-47aa2bb4e7d9'
    ]
  }
  )
  .then(goods => {
    console.log(goods);
  })
  .catch((err) => {
    console.error(err);
  });
  */