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

    this.buttonCard.addEventListener('click', () => this.events.emit('online:input', { type: 'online' }));
    this.buttonCash.addEventListener('click', () => this.events.emit('physically:input', { type: 'physically' }));
    this.container.addEventListener('submit', event => {
      event.preventDefault();
      this.events.emit('modal:next');
    });

    this.container.addEventListener('input', event => {
      const target = event.target as HTMLInputElement;
      const field = target.name;
      const value = target.value;
      this.events.emit(`${field}:input`, { type: `${field}`, text: value })
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
  set errors(data: { address?: string }) {
    for (let key in data) {
      const field = this[`_${key}` as keyof OrderView] as HTMLInputElement;
      field.setCustomValidity(data[key as keyof object]);
    }
    this.setText(this._errors, Object.values(data));
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
