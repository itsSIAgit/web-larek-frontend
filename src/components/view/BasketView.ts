import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IBasketView {
  list: HTMLElement[];
  total: number;
  purchaseOpportunity: boolean;
}

/**
 * Готовит представление корзины из шаблона.\
 * Подготавливает к отображению все карточки добавленные в корзину.
 */
export class BasketView extends Component<IBasketView> {
  protected events: IEvents;
  protected _list: HTMLElement;
  protected _purchaseButton: HTMLButtonElement;
  protected _total: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(container);
    this.events = events;
    this._purchaseButton = ensureElement<HTMLButtonElement>('.basket__button', container);
    this._total = ensureElement<HTMLElement>('.basket__price', container);
    this._list = ensureElement<HTMLElement>('.basket__list', container);

    this._purchaseButton.addEventListener('click', () => this.events.emit('purchase:next'));
  }
  
  /**
   * Устанавливает стоимость покупки
   */
  set total(data: number) {
    this.setText(this._total, data);
  }

  /**
   * Устанавливает доступность кнопки оформления покупки
   */
  set purchaseOpportunity(status: boolean) {
    this.setDisabled(this._purchaseButton, !status);
  }

  /**
   * Добавляет карточки товаров,
   * или уничтожает если пришел null
   */
  set list(fill: HTMLElement[]) {
    if (fill) this._list.replaceChildren(...fill);
    else this._list.replaceChildren(null);
  }
}
