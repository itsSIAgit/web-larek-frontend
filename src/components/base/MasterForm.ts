import { TPayment } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Component } from "./Component";
import { IEvents } from "./events";

export interface IMasterForm {
  errors: {
    address?: string,
    email?: string,
    phone?: string
  };
  valid: boolean;
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
}

/**
 * Базовый абстрактный класс для форм ввода данных при оформлении заказа
 */
export abstract class MasterForm extends Component<IMasterForm> {
  protected buttonNext: HTMLButtonElement;
  protected _errors: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    this.container.addEventListener('input', event => {
      const target = event.target as HTMLInputElement;
      const field = target.name;
      const value = target.value;
      // this.events.emit(`${field}:input`, { type: `${field}`, text: value })
      this.events.emit(`${field}:input`, { [field]: value })
    });

    this.container.addEventListener('submit', event => {
      event.preventDefault();
      const target = event.target as HTMLFormElement;
      const name = target.name;
      this.events.emit(`${name}:next`);
    });
  }

  /**
   * Устанавливает доступность кнопки продолжения
   */
  protected set valid(status: boolean) {
    this.buttonNext.disabled = !status;
  }

  /**
   * Покажет ошибки ввода
   */
  protected set errors(data: { address?: string, email?: string, phone?: string }) {
    for (let key in data) {
      const field = this[`_${key}` as keyof object] as HTMLInputElement;
      field.setCustomValidity(data[key as keyof object]);
    }
    this.setText(this._errors, Object.values(data));
  }
}
