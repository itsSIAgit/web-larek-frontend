import { IApi, IProduct, TPayment } from './types';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
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
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';
import './scss/styles.scss';

//Компоненты для создания событий, и связи с сервером
const events = new EventEmitter();
const baseApi = new Api(API_URL);
const api = new ShopApi(baseApi as IApi);

//Компоненты данных
const catalog = new Catalog(events);
const basket = new Basket(events, settings.basketStorageKey);
const info = new PurchaseInfo(events, settings.infoStorageKey);

//Компоненты представления
const page = new Page(events, document.body);
const modal = new Popup(events, ensureElement(settings.modalContainer))
const basketView = new BasketView(events, cloneTemplate(ensureElement<HTMLTemplateElement>(settings.basketTemplate)));
const orderForm = new OrderForm(events, cloneTemplate(ensureElement<HTMLTemplateElement>(settings.orderTemplate)));
const contactsForm = new ContactsForm(events, cloneTemplate(ensureElement<HTMLTemplateElement>(settings.contactsTemplate)));
const success = new Success(events, cloneTemplate(ensureElement<HTMLTemplateElement>(settings.successTemplate)));

//Переиспользуемые шаблоны
const cardCatalogTemplate = ensureElement(settings.cardCatalogTemplate);
const cardPreviewTemplate = ensureElement(settings.cardPreviewTemplate);
const cardBasketTemplate = ensureElement(settings.cardBasketTemplate);

/**
 * Обновляет вид содержимого корзины
 */
function renderActualBasket() {
  const basketArr = basket.items.map((productData, position) => {
    const card = new Card(events, cloneTemplate(cardBasketTemplate as HTMLTemplateElement));
    const { id, title, price } = productData;
    return card.render({ id, title, price, position: ++position });
  })
  basketView.render({
    list: basketArr,
    total: basket.total(),
    purchaseOpportunity: basket.purchaseOpportunity()
  });
}


//События изменения данных

//Изменение каталога, и по сути первичная
//инициализация после получения товаров с сервера,
//т.к. больше нет того чтобы могло поменять каталог 
events.on('goods:changed', () => {
  const galleryArr = catalog.getGoods().map(productData => {
    const card = new Card(events, cloneTemplate(cardCatalogTemplate as HTMLTemplateElement));
    const { id, title, price, image, category } = productData;
    const type = settings.typeSelector[category as keyof object];
    return card.render({ id, title, price, image, category, type });
  });
  page.render({ gallery: galleryArr });
});

//Изменение данных корзины:
//загрузка с локального хранилища, добавление по кнопке из большой формы,
//удаление по кнопке карточки в форме корзины, очистка корзины
events.on('basket:changed', () => {
  basket.save();
  page.render({ count: basket.goodsCount() });
  renderActualBasket();
});

//При изменении данных для оформления покупки
events.on('info:changed', () => {
  info.save();
});

//Нажатие кнопки купить в большой форме карточки (если доступна)
events.on('buy:click', (data: { card: Card, id: string }) => {
  data.card.render({ canBuy: 'no' })
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
  renderActualBasket();
  modal.render({ content: basketView.render() });
  modal.open();
});

//Нажатие на карточку для открытия большого окна
events.on('big:open', (data: { id: string }) => {
  const card = new Card(events, cloneTemplate(cardPreviewTemplate as HTMLTemplateElement));
  const product = catalog.getProduct(data.id);
  const { id, title, price, image, category, description } = product;
  const type = settings.typeSelector[category as keyof object];
  const canBuy = catalog.pricelessProduct(id) ?? basket.notIn(id);
  const content = card.render({ id, title, price, image, category, type, description, canBuy });
  modal.render({ content });
  modal.open();
});

//Нажатие кнопок "Оформить", "Далее", "Оплатить", "За покупками" в формах

events.on('basket:next', () => {
  const { payment, address } = info.getData();
  const { valid } = info.checkValid(['payment', 'address']);
  const content = orderForm.render({ payment, address, valid });
  modal.render({ content });
});

events.on('order:next', () => {
  const { email, phone } = info.getData();
  const { valid } = info.checkValid(['email', 'phone']);
  const content = contactsForm.render({ email, phone, valid });
  modal.render({ content });
});

events.on('contacts:next', () => {
  const total = basket.total();
  const items = basket.items.map(item => item.id);
  const { payment, address, email, phone } = info.getData();
  const postData = { payment, email, phone, address, total, items };
  api.makePurchase(postData)
    .then(res => {
      console.info(res);
      const content = success.render({ cost: total });
      modal.render({ content });
      basket.clear();
      info.clear();
    })
    .catch((err) => {
      console.error(err);
      alert(`Отправка заказа не удалась\n${err}`);
    });
});

events.on('success:next', () => {
  modal.close();
});


//События изменения данных из-за действий пользователя
//При нажатия кнопок "Онлайн" и "При получении"

events.on('payment:click', ({ payment }: { payment: TPayment }) => {
  info.setData({ payment });
  const { valid } = info.checkValid(['payment', 'address']);
  orderForm.render({ payment, valid })
});

//При вводе в поля форм
//Логика проверки input-ов в том чтобы вывести ошибку
//конкретного, и только тогда когда пользователь что-то ввёл/стёр,
//а кнопку формы блокировать до тех пор пока все поля не будут валидны

events.on('address:input', ({ address }: { address: string }) => {
  info.setData({ address });
  const { valid, errors } = info.checkValid(['payment', 'address']);
  orderForm.render({ valid, errors })
});

events.on('email:input', ({ email }: { email: string }) => {
  info.setData({ email });
  const { valid, errors } = info.checkValid(['email', 'phone']);
  contactsForm.render({ valid, errors })
});

events.on('phone:input', ({ phone }: { phone: string }) => {
  info.setData({ phone });
  const { valid, errors } = info.checkValid(['email', 'phone']);
  contactsForm.render({ valid, errors })
});

//Блокировка прокрутки страницы если открыто окно
events.on('modal:open', () => {
  page.render({ locked: true });
});

//Разблокировка
events.on('modal:close', () => {
  page.render({ locked: false });
});

//Первичная загрузка товаров
api.getGoods()
  .then(goods => {
    catalog.setGoods(goods.items, CDN_URL);
    basket.load();
    info.load();
})
.catch((err) => {
  console.error(err);
  if (confirm(`Первичная загрузка не удалась.\n${err}\nПерезагрузить?`)) {
    window.location.reload();
  }
});
