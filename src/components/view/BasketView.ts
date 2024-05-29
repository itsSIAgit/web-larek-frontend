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
  protected _list: HTMLElement;
  protected _purchaseButton: HTMLButtonElement;
  protected _total: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this._purchaseButton = ensureElement<HTMLButtonElement>('.basket__button', container);
    this._total = ensureElement<HTMLElement>('.basket__price', container);
    this._list = ensureElement<HTMLElement>('.basket__list', container);

    this._purchaseButton.addEventListener('click', () =>
        // this.events.emit('modal:next', { name: 'basket' }));
        this.events.emit('basket:next'));
  }
  
  /**
   * Устанавливает стоимость покупки
   */
  protected set total(data: number) {
    this.setText(this._total, data ? data + ' синапсов' : 'Пусто');
  }

  /**
   * Устанавливает доступность кнопки оформления покупки
   */
  protected set purchaseOpportunity(status: boolean) {
    this.setDisabled(this._purchaseButton, !status);
  }

  /**
   * Обновляет карточки товаров
   */
  protected set list(fill: HTMLElement[]) {
    this._list.replaceChildren();
    if (fill) this._list.replaceChildren(...fill);
  }
}
