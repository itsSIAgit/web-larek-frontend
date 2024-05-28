import { TPayment } from "../../types";
import { ensureElement } from "../../utils/utils";
import { MasterForm } from "../base/MasterForm";
import { IEvents } from "../base/events";

/**
 * Представление формы ввода базовых данных для заказа
 */
export class OrderView extends MasterForm {
  protected buttonCard: HTMLButtonElement;
  protected buttonCash: HTMLButtonElement;
  protected _address: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this.buttonCard = ensureElement<HTMLButtonElement>('button[name=card]', this.container);
    this.buttonCash = ensureElement<HTMLButtonElement>('button[name=cash]', this.container);
    this.buttonNext = ensureElement<HTMLButtonElement>('.order__button', this.container);
    this._address = ensureElement<HTMLInputElement>('input[name=address]', this.container);

    this.buttonCard.addEventListener('click', () =>
        this.events.emit('payment:input', { type: 'payment', text: 'online' }));
    this.buttonCash.addEventListener('click', () =>
        this.events.emit('payment:input', { type: 'payment', text: 'physically' }));
  }

  /**
   * Переключит состояния кнопок оплаты
   */
  set payment(data: TPayment) {
    if (data) {
      const status = data === 'online';
      this.toggleClass(this.buttonCard, 'button_alt-active', status);
      this.toggleClass(this.buttonCash, 'button_alt-active', !status);
    }
  }

  /**
   * Заполнит поле адреса
   */
  set address(data: string) {
    this._address.value = String(data);
  }
}
