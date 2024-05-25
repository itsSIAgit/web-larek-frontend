import { IApi, IProduct } from './types';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { ShopApi } from './components/connection/ShopApi';
import { Catalog } from './components/data/Catalog';
import { Basket } from './components/data/Basket';
import { PurchaseInfo } from './components/data/PurchaseInfo';
import { Page } from './components/view/Page';
import { Card } from './components/view/Card';
import { cloneTemplate } from './utils/utils';
import './scss/styles.scss';
import { Popup } from './components/view/Popup';

const events = new EventEmitter();
const baseApi = new Api(API_URL);
const api = new ShopApi(baseApi as IApi);
const catalog = new Catalog(events);
const basket = new Basket(events, settings.basketStorageKey);
const info = new PurchaseInfo(events, settings.infoStorageKey);
const page = new Page(events);
const modal = new Popup(events, document.getElementById(settings.modalContainerId))
const cardCatalogTemplate = document.getElementById(settings.cardCatalogTemplate);
const cardPreviewTemplate = document.getElementById(settings.cardPreviewTemplate);
const cardBasketTemplate = document.getElementById(settings.cardBasketTemplate);

function cardDataBuilder(data: IProduct, preset: 'gallery' | 'big' | 'basket') {
  let { id, title, price, image, category, description } = data;
  const type = settings.typeSelector[category as keyof object];
  image = CDN_URL + image;
  switch (preset) {
    case 'gallery': return { id, title, price, image, category, type };
    case 'big': return { id, title, price, image, category, type, description };
    case 'basket': return { id, title, price };
  }
}

events.onAll(event => console.log(event));
events.on('goods:changed', () => {
  const galleryArr: HTMLElement[] = [];
  catalog.items.forEach(productData => {
    const card = new Card(events, cloneTemplate(cardCatalogTemplate as HTMLTemplateElement));
    galleryArr.push(card.render(cardDataBuilder(productData, 'gallery')));
  })
  page.render(galleryArr);
});
events.on('basket:changed', () => {
  basket.save();
  page.goodsCount = basket.goodsCount();
});
events.on('info:changed', () => {
  info.save();
});

events.on('big:open', (data: { id: string }) => {
  const card = new Card(events, cloneTemplate(cardPreviewTemplate as HTMLTemplateElement));
  modal.render({ content: card.render(cardDataBuilder(catalog.getProduct(data.id), 'big')) });
});

// Блокировка прокрутки страницы если открыто окно
events.on('modal:open', () => {
  page.locked = true;
});

// Разблокировка
events.on('modal:close', () => {
  page.locked = false;
});

// events.on('buy:click', () => {});
// events.on('card:delete', () => {});


api.getGoods()
  .then(goods => {
    catalog.setGoods(goods.items as IProduct[]);
    basket.load();
    info.load();
})
.catch((err) => {
  console.error(err);
  if (confirm(`Первичная загрузка не удалась.\n${err}\nПерезагрузить?`)) {
    window.location.reload();
  }
});






/*
api.getGoods()
  .then(goods => {
    catalog.setGoods(goods.items as IProduct[]);


console.log(catalog.items);
console.log(catalog.getProduct('854cef69-976d-4c2a-a18c-2aa45046c390'));
basket.add(catalog.getProduct('854cef69-976d-4c2a-a18c-2aa45046c390'));
basket.add(catalog.getProduct('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));
console.log('goodsCount ' + basket.goodsCount());
console.log(basket.items);
console.log('purchaseOpportunity ' + basket.purchaseOpportunity());
console.log('haveProduct ' + basket.haveProduct('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));
console.log('total ' + basket.total());
console.log(basket.items);
basket.remove('854cef69-976d-4c2a-a18c-2aa45046c390');
console.log(basket.goodsCount());
basket.clear();
console.log(basket.goodsCount());
console.log(basket.items);
basket.save();
basket.clear();
console.log(basket.items);
console.log('clear')
})
.catch((err) => {
  console.error(err);
});

setTimeout(() => { 
  basket.load();
  console.log(basket.items);
 }, 3000);

console.log('info start')
info.setData({
  payment: 'online',
  email: 'abc@abc.ru',
  phone: '1-234-56-78',
  address: 'Test Street'
});
info.save();
console.log(info.getData());
info.setData({
  payment: null,
  email: '',
  phone: '',
  address: ''
});
console.log(info.getData());
setTimeout(() => { 
  info.load();
  console.log('info')
  console.log(info.getData());
 }, 4000);



events.on('goods:changed', () => {
  console.log('goods from arr');
  console.log(catalog.items);
  console.log('product from arr');
  console.log(catalog.getProduct('854cef69-976d-4c2a-a18c-2aa45046c390'));
})
console.log(catalog.items);

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