/**
 * Интерфейс данных одного продукта
 */
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

/**
 * Интерфейс каталога товаров
 */
export interface ICatalog {
  setGoods(items: IProduct[], CDN_URL: string): void;
  getProduct(id: string): IProduct | null;
  pricelessProduct(id: string): 'inf' | null;
}

/**
 * Интерфейс данных корзины
 */
export interface IBasket {
  save(): void;
  load(): void;
  add(product: IProduct): void;
  remove(id: string): void;
  purchaseOpportunity(): boolean;
  notIn(id: string): 'yes' | 'no';
  goodsCount(): number;
  total(): number;
  clear(): void;
}

/**
 * Интерфейс данных для оформления покупки
 */
export interface IPurchaseInfo {
  save(): void;
  load(): void;
  setData(data: Partial<TPurchaseData>): void;
  getData(): TPurchaseData;
  clear(): void;
  checkValid(data: (keyof TPurchaseData)[]): { valid: boolean, errors: Map<string, string> };
}

/**
 * Способы оплаты
 */
export type TPayment = null | 'online' | 'physically';

/**
 * Комплект данных для оплаты
 */
export type TPurchaseData = {
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
}

//Типы для работы с Api (компонент ShopApi)
/**
 * Методы отправки данных
 */
export type TApiPostMethods = 'POST';

/**
 * Тип данных отправляемых на сервер при покупке
 */
export type TApiPostData = {
  payment: 'online' | 'physically',
  email: string,
  phone: string,
  address: string,
  total: number,
  items: string[]
}

/**
 * Интерфейс для работы с Api\
 * (отдельно чтобы не расширять базовый и не зависеть от него)
 */
export interface IApi {
    baseUrl: string;
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object, method?: TApiPostMethods): Promise<T>;
}
