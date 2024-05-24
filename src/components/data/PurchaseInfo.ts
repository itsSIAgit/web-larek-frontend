import { IPurchaseInfo, TPayment, TPurchaseData } from "../../types";
import { IEvents } from "../base/events";

/**
 * Отвечает за хранение данных покупателя
 */
export class PurchaseInfo implements IPurchaseInfo {
  protected events: IEvents;
  protected infoKey: string;
  protected purchaseData: TPurchaseData;

  constructor(events: IEvents, infoKey: string) {
    this.events = events;
    this.infoKey = infoKey;
    this.purchaseData = {
      payment: null,
      email: '',
      phone: '',
      address: ''
    }
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
}
