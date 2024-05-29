import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

/**
 * Интерфейс всплывающего окна
 */
interface IPopup {
  content: HTMLElement;
}

/**
 * Реализует основу модального окна.
 */
export class Popup extends Component<IPopup>{
  protected closeButton: HTMLButtonElement;
  protected _content: HTMLElement;

  constructor(events: IEvents, protected container: HTMLElement) {
    super(events, container);
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this._content = ensureElement<HTMLElement>('.modal__content', container);

    this.closeButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('mousedown', event => {
      if (event.target === event.currentTarget) {
        this.close();
      }
    });
    this.handleEscUp = this.handleEscUp.bind(this);
  }

  /**
   * Открывает всплывающее окно
   */
  open() {
    this.container.classList.add('modal_active');
    document.addEventListener('keyup', this.handleEscUp);
    this.events.emit('modal:open');
  }
  
  /**
   * Закрывает окно, уничтожает содержимое окна
   * (и браузерные слушатели событий содержимого)
   */
  close() {
    this.container.classList.remove('modal_active');
    document.removeEventListener('keyup', this.handleEscUp);
    this.content = null;
    this.events.emit('modal:close');
  }

  /**
   * Метод для закрытия окна по клавише ESC
   */
  protected handleEscUp (event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  /**
   * Устанавливает содержимое окна
   */
  protected set content(fill: HTMLElement) {
    this._content.replaceChildren(fill);
  }
}
