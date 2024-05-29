import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IPage {
  gallery: HTMLElement[];
  count: number;
  locked: boolean;
}

/**
 * Отвечает за вывод контента на главной странице:
 * каталога товаров (карточек), и иконки корзины со счетчиком.\
 * Иконка корзины - показывает число товаров, и создает событие
 * для открытия корзины.
 */
export class Page extends Component<IPage> {
  protected _gallery: HTMLElement;
  protected _wrapper: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected _count: HTMLElement;
  protected scrollTop: number;
  protected scrollLeft: number;
  
  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this._gallery = ensureElement<HTMLElement>('.gallery');
    this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
    this.basketButton = ensureElement<HTMLButtonElement>('.header__basket');
    this._count = ensureElement<HTMLElement>('.header__basket-counter', this.basketButton);

    this.basketButton.addEventListener('click', () => events.emit('basket:open'));
  }

  /**
   * Обновляет отображение каталога и возвращает контейнер с плиткой карточек
   */
  protected set gallery(items: HTMLElement[]) {
    if (items) this._gallery.replaceChildren(...items);
  }

  /**
   * Обновляет счетчик числа товаров в корзине
   */
  protected set count(data: number) {
    this._count.textContent = String(data);
  }

  /**
   * Блокировка прокрутки страницы
   */
  protected set locked(value: boolean) {
    //Т.к. из-за установки класса страница улетает в начало,
    //то при блокировке запоминаем где был скролл, а после восстанавливаем
    if (value) {
      this.scrollTop = window.scrollY || document.documentElement.scrollTop;
      this.scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      this._wrapper.classList.add('page__wrapper_locked');
    } else {
      this._wrapper.classList.remove('page__wrapper_locked');
      window.scrollTo(this.scrollLeft, this.scrollTop);
    }
  }
}
