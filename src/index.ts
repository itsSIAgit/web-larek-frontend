import { IApi, IProduct, TPayment } from './types';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { ShopApi } from './components/connection/ShopApi';
import { Catalog } from './components/data/Catalog';
import { Basket } from './components/data/Basket';
import { PurchaseInfo } from './components/data/PurchaseInfo';
import { Page } from './components/view/Page';
import { Card, ICard } from './components/view/Card';
import { Popup } from './components/view/Popup';
import { BasketView } from './components/view/BasketView';
import { OrderView } from './components/view/OrderView';
import { ContactsView } from './components/view/ContactsView';
import { cloneTemplate } from './utils/utils';
import './scss/styles.scss';

const events = new EventEmitter();
const baseApi = new Api(API_URL);
const api = new ShopApi(baseApi as IApi);
const catalog = new Catalog(events);
const basket = new Basket(events, settings.basketStorageKey);
const info = new PurchaseInfo(events, settings.infoStorageKey);
const page = new Page(events);
const modal = new Popup(events, document.getElementById(settings.modalContainerId))
const basketView = new BasketView(events, cloneTemplate(document.getElementById(settings.basketTemplate) as HTMLTemplateElement));
const orderView = new OrderView(events, cloneTemplate(document.getElementById(settings.orderTemplate) as HTMLTemplateElement));
const contactsView = new ContactsView(events, cloneTemplate(document.getElementById(settings.contactsTemplate) as HTMLTemplateElement));
const cardCatalogTemplate = document.getElementById(settings.cardCatalogTemplate);
const cardPreviewTemplate = document.getElementById(settings.cardPreviewTemplate);
const cardBasketTemplate = document.getElementById(settings.cardBasketTemplate);

/**
 * Подготавливает набор данных для рендера
 * карточки товара, в зависимости от типа
 */
function cardDataBuilder(data: IProduct, preset: 'gallery' | 'big' | 'basket', position?: number) {
  let { id, title, price, image, category, description } = data;
  const type = settings.typeSelector[category as keyof object];
  const canBuy = price === null ? 'inf' : basket.haveProduct(id) ? 'no' : 'yes';
  image = CDN_URL + image;
  switch (preset) {
    case 'gallery': return { id, title, price, image, category, type };
    case 'big': return { id, title, price, image, category, type, description, canBuy };
    case 'basket': return { id, title, price, position };
  }
}

events.onAll(event => console.log(event)); //! Служебное

//События изменения данных

//Изменение каталога, и по сути первичная
//инициализация после получения товаров с сервера,
//т.к. больше нет того чтобы могло поменять каталог 
events.on('goods:changed', () => {
  const galleryArr = catalog.items.map(productData => {
    const card = new Card(events, cloneTemplate(cardCatalogTemplate as HTMLTemplateElement));
    return card.render(cardDataBuilder(productData, 'gallery'));
  });
  page.render(galleryArr);
});

//Изменение данных корзины:
//- загрузка с локального хранилища
//- добавление по кнопке из большой формы
//- удаление по кнопке карточки в форме корзины
events.on('basket:changed', () => {
  basket.save();
  page.goodsCount = basket.goodsCount();
  if (basket.goodsCount()) {
    const basketArr = basket.items.map((productData, position) => {
      const card = new Card(events, cloneTemplate(cardBasketTemplate as HTMLTemplateElement));
      return card.render(cardDataBuilder(productData, 'basket', position));
    })
    basketView.render({
      list: basketArr,
      total: basket.total(),
      purchaseOpportunity: basket.purchaseOpportunity()
    });
  } else {
    basketView.render({
      list: null,
      total: 0,
      purchaseOpportunity: false
    });
  }
});

//При изменении данных для оформления покупки
events.on('info:changed', () => {
  info.save();
});

//Нажатие кнопки купить в большой форме карточки (если доступна)
events.on('buy:click', (data: { card: ICard, id: string }) => {
  const { card } = data;
  card.canBuy = 'no';
  basket.add(catalog.getProduct(data.id));
});

//Нажатие иконки мусорки в форме корзины
//Прим.: можно было бы удалять отдельную карточку,
//но нужно у всех сменить индексы в списке,
//поэтому полный ре-рендер
events.on('card:delete', (data: { id: string }) => {
  basket.remove(data.id);
});


//События - открывашки модалок
//Нажатие на иконку корзины
events.on('basket:open', () => {
  modal.render({ content: basketView.render() });
});

//Нажатие на карточку для открытия большого окна
events.on('big:open', (data: { id: string }) => {
  const card = new Card(events, cloneTemplate(cardPreviewTemplate as HTMLTemplateElement));
  modal.render({ content: card.render(cardDataBuilder(catalog.getProduct(data.id), 'big')) });
});

//Нажатие кнопки "Оформить" в корзине
events.on('purchase:next', () => {
  const { payment, address } = info.getData();
  modal.content = orderView.render({
    payment,
    address,
    valid: !!payment && !!address
  });
});

events.on('modal:next', () => {
  const { email, phone } = info.getData();
  modal.content = contactsView.render({
    email,
    phone,
    valid: !!email && !!phone
  });
});


//События изменения данных из-за действий пользователя
//При вводе в поля форм
//Нажатие кнопки "Онлайн" и "При получении"
//Кнопки на форме тоже считаются элементом ввода
events.on(/^.+:input/, (data: { type: string, text: string }) => {
  const { type, text } = data;
  const formValid = () => {
    switch (type) {
      case 'payment':
      case 'address':
        const { payment, address } = info.getData();
        return !!payment && !!address;
      case 'email':
      case 'phone':
        const { email, phone } = info.getData();
        return !!email && !!phone;
    }
  }
  const putErr = (form: OrderView | ContactsView) => {
    const msg = {
      'address': 'Нужно ввести адрес.',
      'email': 'Нужно ввести email.',
      'phone': 'Нужно ввести телефон.'
    }
    form.valid = formValid();
    if (!text) form.errors = { [type]: msg[type as keyof object] };
    else form.errors = { [type]: '' };
  }

  info.setData({ [type]: text });
  switch (type) {
    case 'payment':
      orderView.payment = text as TPayment;
      orderView.valid = formValid();
      break;
    case 'address':
      putErr(orderView);
      break;
    case 'email':
    case 'phone':
      putErr(contactsView);
  }
});



events.on('modal:submit', () => {});


//Блокировка прокрутки страницы если открыто окно
events.on('modal:open', () => {
  page.locked = true;
});

//Разблокировка
events.on('modal:close', () => {
  page.locked = false;
});

//Первичная загрузка товаров
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