import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface ISuccess {
  cost: number;
}
/**
 * Готовит представление успешного оформления (отправки на сервер) заказа.
 */
export class Success extends Component<ISuccess> {
  protected events: IEvents;
  protected buttonNext: HTMLButtonElement;
  protected _cost: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this._cost = ensureElement<HTMLElement>('.order-success__description', this.container);
    this.buttonNext = ensureElement<HTMLButtonElement>('.button', this.container);

    this.buttonNext.addEventListener('click', () =>
    this.events.emit('success:next'));
  }

  protected set cost(data: number) {
    this.setText(this._cost, `Списано ${data} синапсов`);
  }
}