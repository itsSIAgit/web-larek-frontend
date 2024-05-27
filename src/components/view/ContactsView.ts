import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IComponent {
  valid: boolean;
  errors: string;
  email: string;
  phone: string;
}

export class ContactsView extends Component<IComponent> {
  protected events: IEvents;
  protected buttonNext: HTMLButtonElement;
  protected _email: HTMLInputElement;
  protected _phone: HTMLInputElement;
  protected _errors: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    // this.events = events;
    this.buttonNext = ensureElement<HTMLButtonElement>('.button', this.container);
    this._email = ensureElement<HTMLInputElement>('input[name=email]', this.container);
    this._phone = ensureElement<HTMLInputElement>('input[name=phone]', this.container);
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    this.container.addEventListener('submit', event => {
      event.preventDefault();
      const target = event.target as HTMLFormElement;
      const name = target.name;
      this.events.emit('modal:next', { name });
    });
    this.container.addEventListener('input', event => {
      const target = event.target as HTMLInputElement;
      const field = target.name;
      const value = target.value;
      this.events.emit(`${field}:input`, { type: `${field}`, text: value })
  });
  }

  /**
   * Устанавливает доступность кнопки "Оплатить"
   */
  set valid(status: boolean) {
    this.buttonNext.disabled = !status;
  }

  /**
   * Покажет ошибки ввода
   */
  set errors(data: { email?: string, phone?: string }) {
    for (let key in data) {
      const field = this[`_${key}` as keyof ContactsView] as HTMLInputElement;
      field.setCustomValidity(data[key as keyof object]);
    }
    this.setText(this._errors, Object.values(data));
  }

  /**
   * Заполнит поле email
   */
  set email(data: string) {
    this._email.value = String(data);
  }

  /**
   * Заполнит поле телефон
   */
  set phone(data: string) {
    this._phone.value = String(data);
  }
}