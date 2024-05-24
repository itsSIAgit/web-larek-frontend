import { IBasket, IProduct } from "../../types";
import { IEvents } from "../base/events";

/**
 * Отвечает за хранение содержимого корзины.\
 */
export class Basket implements IBasket {
  protected events: IEvents;
  protected _items: IProduct[] = [];
  protected _storageKey: string;

  constructor(events: IEvents, key: string) {
    this.events = events;
    this._storageKey = key;
  }

  /**
   * Сохранить корзину в локальное хранилище
   */
  save() {
    localStorage.setItem(
      this._storageKey,
      JSON.stringify(this._items)
    );
  }

  /**
   * Загрузить корзину из локального хранилища
   */
  load() {
    try {
      const rawData: string = localStorage.getItem(this._storageKey);
      if (rawData) {
        const items: IProduct[] = JSON.parse(rawData);
        for (const item of items) {
          this.add(item);
        }
      }
    } catch (err) {
      console.warn(`Не удалось прочитать корзину из localStorage`, err);
    }
  }

  /**
   * Добавляет товар в массив корзины и вызывает событие изменения массива корзины
   */
  add(product: IProduct): void {
    this._items.push(product);
    this.events.emit('basket:changed');
  }

  /**
   * Удаляет товар из массива корзины и вызывает событие изменения массива корзины
   */
  remove(id: string): void {
    this._items = this._items.filter(item => item.id !== id);
    this.events.emit('basket:changed');
  }

  /**
   * Проверить возможна ли покупка
   */
  purchaseOpportunity(): boolean {
    if (!this._items.length || this.total() <= 0) return false;
    return true;
  }

  /**
   * Проверить, есть ли товар в корзине
   */
  haveProduct(id: string): boolean {
    return this._items.some(item => item.id === id);
  }

  /**
   * Узнать сколько товаров в корзине
   */
  goodsCount(): number {
    return this._items.length;
  }

  /**
   * Узнать стоимость товаров в корзине
   */
  total(): number {
    return this._items.reduce((price, item) => price += item.price ? item.price : 0 , 0);
  }

  /**
   * Очистить корзину от товаров
   */
  clear(): void {
    this._items = [];
  }

  /**
   * Возвращает ссылку на массив товаров корзины
   */
  get items(): IProduct[] {
    return this._items;
  }
}
