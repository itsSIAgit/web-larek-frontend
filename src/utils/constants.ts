//API_URL - используется для запросов данных о товарах и отправки заказа
//CDN_URL - используется для формирования адреса картинки в товаре
//{baseUrl}/product/ - для получения всего списка товаров
//{baseUrl}/product/{id} - для получения информации о товаре по id
//{baseUrl}/order - для отправки заказа

export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {
  cardCatalogTemplate: '#card-catalog',
  cardPreviewTemplate: '#card-preview',
  cardBasketTemplate: '#card-basket',
  basketTemplate: '#basket',
  orderTemplate: '#order',
  contactsTemplate: '#contacts',
  successTemplate: '#success',
  
  modalContainer: '#modal-container',
  
  typeSelector: {
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'другое': 'card__category_other',
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button'
  },
  
  msg: {
    'address': 'Нужно ввести адрес.',
    'email': 'Нужно ввести email.',
    'phone': 'Нужно ввести телефон.'
  },
  
  basketStorageKey: 'goods',
  infoStorageKey: 'info'
};
