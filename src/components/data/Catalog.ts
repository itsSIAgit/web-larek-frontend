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
  setGoods(items: IProduct[]): void {
    if (items) {
      this._items = items;
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
   * Возвращает ссылку на массив товаров каталога
   */
  get items(): IProduct[] {
    return this._items;
  }
}
