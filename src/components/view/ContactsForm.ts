import { ensureElement } from "../../utils/utils";
import { MasterForm } from "../base/MasterForm";
import { IEvents } from "../base/events";

/**
 * Представление формы ввода контактов для заказа
 */
export class ContactsForm extends MasterForm {
  protected _email: HTMLInputElement;
  protected _phone: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this.buttonNext = ensureElement<HTMLButtonElement>('.button', this.container);
    this._email = ensureElement<HTMLInputElement>('input[name=email]', this.container);
    this._phone = ensureElement<HTMLInputElement>('input[name=phone]', this.container);
  }

  /**
   * Заполнит поле email
   */
  protected set email(data: string) {
    this._email.value = data ? String(data) : '';
  }

  /**
   * Заполнит поле телефон
   */
  protected set phone(data: string) {
    this._phone.value = data ? String(data) : '';
  }

  /**
   * Заблокирует кнопку оплаты, при
   * отправке на сервер, и поменяет ее текст
   */
  protected set buttonLock(status: boolean) {
    this.setDisabled(this.buttonNext, status);
    status ? this.setText(this.buttonNext, 'Отправка...') :
              this.setText(this.buttonNext, 'Оплатить');
  }
}