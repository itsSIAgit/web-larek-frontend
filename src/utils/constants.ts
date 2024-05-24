//API_URL - используется для запросов данных о товарах и отправки заказа
//CDN_URL - используется для формирования адреса картинки в товаре
//{baseUrl}/product/ - для получения всего списка товаров
//{baseUrl}/product/{id} - для получения информации о товаре по id
//{baseUrl}/order - для отправки заказа

export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {

};
