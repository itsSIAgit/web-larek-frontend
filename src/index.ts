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

//События изменения данных

//Изменение каталога, и по сути первичная
//инициализация после получения товаров с сервера,
//т.к. больше нет того чтобы могло поменять каталог 
events.on('goods:changed', () => {
  const galleryArr = catalog.items.map(productData => {
    const card = new Card(events, cloneTemplate(cardCatalogTemplate as HTMLTemplateElement));
    return card.render(cardDataBuilder(productData, 'gallery'));
  });
  page.render({ gallery: galleryArr });
});

//Изменение данных корзины:
//загрузка с локального хранилища, добавление по кнопке из большой формы,
//удаление по кнопке карточки в форме корзины, очистка корзины
events.on('basket:changed', () => {
  basket.save();
  page.count = basket.goodsCount();
  const basketArr = basket.items.map((productData, position) => {
    const card = new Card(events, cloneTemplate(cardBasketTemplate as HTMLTemplateElement));
    return card.render(cardDataBuilder(productData, 'basket', position));
  })
  basketView.render({
    list: basketArr,
    total: basket.total(),
    purchaseOpportunity: basket.purchaseOpportunity()
  });
});

//При изменении данных для оформления покупки
events.on('info:changed', () => {
  info.save();
});

//Нажатие кнопки купить в большой форме карточки (если доступна)
events.on('buy:click', (data: { card: ICard, id: string }) => {
  data.card.canBuy = 'no';
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

//Нажатие кнопок "Оформить", "Далее", "Оплатить", "За покупками" в формах
events.on('modal:next', (data: { name: string }) => {
  //Прим.: конструкция switch-case не дает задекларировать только нужные
  //данные в кейсах, считая что они уже были, хотя и не могли
  const { payment, email, phone, address } = info.getData();
  switch (data.name) {
    case 'basket':
      modal.content = orderForm.render({
        payment, address, valid: !!payment && !!address
      });
      break;
    case 'order':
      modal.content = contactsForm.render({
        email, phone, valid: !!email && !!phone
      });
      break;
    case 'contacts':
      const total = basket.total();
      const items = basket.items.map(item => item.id);
      const postData = { payment, email, phone, address, total, items };
      api.makePurchase(postData)
        .then(res => {
          console.info(res);
          modal.content = success.render({ cost: total });
          basket.clear();
        })
        .catch((err) => {
          console.error(err);
          alert(`Отправка заказа не удалась\n${err}`);
        });
      break;
    case 'success':
      modal.close();
  }
});


//События изменения данных из-за действий пользователя
//При вводе в поля форм, и нажатия кнопок "Онлайн" и "При получении"
//Кнопки способа оплаты на форме тоже считаются элементом ввода
//Выводит ошибки ввода на форме, если они есть
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
  const putErr = (form: OrderForm | ContactsForm) => {
    form.valid = formValid();
    if (!text) form.errors = { [type]: settings.msg[type as keyof object] };
    else form.errors = { [type]: '' };
  }

  info.setData({ [type]: text });
  switch (type) {
    case 'payment':
      orderForm.payment = text as TPayment;
      orderForm.valid = formValid();
      break;
    case 'address':
      putErr(orderForm);
      break;
    case 'email':
    case 'phone':
      putErr(contactsForm);
  }
});

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
