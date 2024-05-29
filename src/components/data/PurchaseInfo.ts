import { IPurchaseInfo, TPayment, TPurchaseData } from "../../types";
import { IEvents } from "../base/events";

/**
 * Отвечает за хранение данных покупателя
 */
export class PurchaseInfo implements IPurchaseInfo {
  protected events: IEvents;
  protected infoKey: string;
  protected purchaseData: TPurchaseData = {
    payment: null,
    email: null,
    phone: null,
    address: null
  };
  protected msg: object = {
    'payment': 'Нужно выбрать способ оплаты.',
    'address': 'Нужно ввести адрес.',
    'email': 'Нужно ввести email.',
    'phone': 'Нужно ввести телефон.'
  };

  constructor(events: IEvents, infoKey: string) {
    this.events = events;
    this.infoKey = infoKey;
  }

  /**
   * Сохранить информацию в локальное хранилище
   */
  save(): void {
    localStorage.setItem(
      this.infoKey,
      JSON.stringify(this.purchaseData)
    );
  }

  /**
   * Загрузить информацию из локального хранилища
   */
  load(): void {
    try {
      const rawData: string = localStorage.getItem(this.infoKey);
      if (rawData) {
        this.purchaseData = JSON.parse(rawData) as TPurchaseData;
        this.events.emit('info:changed');
      }
    } catch (err) {
      console.warn(`Не удалось прочитать инфо из localStorage`, err);
    }
  }

  /**
   * Записать значения данных для покупки
   */
  setData(data: Partial<TPurchaseData>): void {
    Object.assign(this.purchaseData as object, data ?? {});
    if (data) {
      this.events.emit('info:changed');
    }
  }

  /**
   * Получить значения данных для покупки
   */
  getData(): TPurchaseData {
    return this.purchaseData;
  }

  /**
   * Очищает данные пользователя
   */
  clear(): void {
    this.purchaseData = {
      payment: null,
      email: null,
      phone: null,
      address: null
    }
    this.events.emit('info:changed');
  }

  /**
   * Проверяет запрашиваемые поля на валидность
   */
  checkValid(data: (keyof TPurchaseData)[]): { valid: boolean, errors: Map<string, string> } {
    const errors = new Map<string, string>();
    let valid = true;
    data.forEach(name => {
      //Если значение null, то значит пользователь еще не трогал поле и об ошибке сообщать рано
      if (this.purchaseData[name as keyof object] === null) {
        valid = false;
      } else {
        if (this.purchaseData[name as keyof object] === '') {
          errors.set(name as keyof object, this.msg[name as keyof object] + ' ');
          valid = false;
        } else {
          //Пустое значение нужно чтобы убрать подсветку поля
          errors.set(name as keyof object, '');
        }
      }
    });
    return { valid, errors }
  }
}
