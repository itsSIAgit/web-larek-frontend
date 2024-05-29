import { ICatalog, IProduct } from "../../types";
import { IEvents } from "../base/events";

/**
 * Отвечает за хранение всего каталога продуктов
 */
export class Catalog implements ICatalog {
  protected events: IEvents;
  protected _items: IProduct[] = [];
  
  constructor(events: IEvents) {
    this.events = events;
  }

  /**
   * Записывает значения массива продуктов
   * и вызывает событие изменения массива каталога
   */
  setGoods(items: IProduct[], CDN_URL: string): void {
    if (items) {
      this._items = items.map(item => {
        item.image = CDN_URL + item.image;
        return item;
      });
      this.events.emit('goods:changed');
    }
  }

  /**
   * Позволяет получить данные продукта по id
   */
  getProduct(id: string): IProduct {
    return this._items.find(item => item.id === id);
  }

  /**
   * Проверить продукт на бесценность\
   * Вернет 'inf' или null
   */
  pricelessProduct(id: string): 'inf' | null {
    const item = this._items.find(item => item.id === id);
    return item.price === null ? 'inf' : null
  }

  /**
   * Возвращает ссылку на массив товаров каталога
   */
  getGoods(): IProduct[] {
    return this._items;
  }
}
