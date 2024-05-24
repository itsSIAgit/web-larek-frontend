import { IEvents } from "../components/base/events";

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
  events: IEvents;
  items: IProduct[];
  setGoods(items: IProduct[]): void;
  getProduct(id: string): IProduct;
}

/**
 * Интерфейс данных корзины
 */
export interface IBasket {
  events: IEvents;
  items: IProduct[];
  add(product: IProduct): void;
  remove(id: string): void;
  purchaseOpportunity(): boolean;
  haveProduct(id: string): boolean;
  goodsCount(): number;
  total(): number;
  clear(): void;
}

/**
 * Интерфейс данных для оформления покупки
 */
export interface IPurchaseInfo {
  events: IEvents;
  payment: null | 'online' | 'physically';
  address: string;
  email: string;
  phone: string;
}

/**
 * Интерфейс всплывающего окна (компонент Popup)
 */
interface IPopup {
  content: HTMLElement;
  open(): void;
  close(): void;
  erase(): void;
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
  payment: 'online' | 'physically';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
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
