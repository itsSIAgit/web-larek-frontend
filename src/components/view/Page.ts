import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";

/**
 * Отвечает за вывод контента на главной странице:
 * каталога товаров (карточек), и иконки корзины со счетчиком.\
 * Иконка корзины - показывает число товаров, и создает событие
 * для открытия корзины.
 */
export class Page {
  protected events: IEvents;
  protected containerCard: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected _count: HTMLElement;
  
  constructor(events: IEvents) {
    this.events = events;
    this.containerCard = ensureElement<HTMLElement>('.gallery');
    this.basketButton = ensureElement<HTMLButtonElement>('.header__basket');
    this._count = ensureElement<HTMLElement>('.header__basket-counter', this.basketButton);

    this.basketButton.addEventListener('click', () => events.emit('basket:open'));
  }

  /**
   * Обновляет отображение каталога и возвращает контейнер с плиткой карточек
   */
  render(items: HTMLElement[]): HTMLElement {
    if (items) this.containerCard.replaceChildren(...items);
    return this.containerCard;
  }

  /**
   * Обновляет счетчик числа товаров в корзине
   */
  set goodsCount(data: number) {
    this._count.textContent = String(data);
  }

  /**
   * Блокировка прокрутки страницы.\
   * Реализация через блокировку скролла,
   * т.к. через класс страница дергается в начало.
   */
  set locked(value: boolean) {
    if (value) {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop;
      const scrollLeft =
        window.scrollX ||
        document.documentElement.scrollLeft;
      window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
      };
    } else {
      window.onscroll = function () {};
    }
  }
}
