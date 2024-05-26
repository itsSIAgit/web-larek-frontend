import { TPayment } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component"
import { IEvents } from "../base/events";

interface IOrderView {
  valid: boolean;
  errors: string;
  payment: TPayment;
  address: string;
}

/**
 * Готовит представление формы ввода базовых данных для заказа
 */
export class OrderView extends Component<IOrderView> {
  protected events: IEvents;
  protected buttonCard: HTMLButtonElement;
  protected buttonCash: HTMLButtonElement;
  protected buttonNext: HTMLButtonElement;
  protected _address: HTMLInputElement;
  protected _errors: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(container);
    this.events = events;
    this.buttonCard = ensureElement<HTMLButtonElement>('button[name=card]', this.container);
    this.buttonCash = ensureElement<HTMLButtonElement>('button[name=cash]', this.container);
    this.buttonNext = ensureElement<HTMLButtonElement>('.order__button', this.container);
    this._address = ensureElement<HTMLInputElement>('input[name=address]', this.container);
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    this.buttonCard.addEventListener('click', () => this.events.emit('payMethod:click', { method: 'online' }));
    this.buttonCash.addEventListener('click', () => this.events.emit('payMethod:click', { method: 'physically' }));
    this.container.addEventListener('submit', event => {
      event.preventDefault();
      this.events.emit('modal:next');
    });
    this._address.addEventListener('input', event => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      this.events.emit('address:input', { type: 'address', text: value })
    });
  }

  /**
   * Устанавливает доступность кнопки "Далее"
   */
  set valid(status: boolean) {
    this.buttonNext.disabled = !status;
  }

  /**
   * Покажет ошибки ввода
   */
  set errors(data: string) {
    this._address.setCustomValidity(data);
    this.setText(this._errors, data);
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
    this.setText(this._address, data);
  }
}
