import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IModalData {
  content: HTMLElement;
}

export class Popup extends Component<IModalData>{
  protected events: IEvents;
  protected closeButton: HTMLButtonElement;
  protected _content: HTMLElement;

  constructor(events: IEvents, protected container: HTMLElement) {
    super(container);
    this.events = events;
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

  open() {
    this.container.classList.add('modal_active');
    document.addEventListener("keyup", this.handleEscUp);
    this.events.emit('modal:open');
  }
  
  close() {
    this.container.classList.remove('modal_active');
    document.removeEventListener("keyup", this.handleEscUp);
    this.content = null;
    this.events.emit('modal:close');
  }

  protected handleEscUp (event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.close();
    }
  }

  render(data: IModalData): HTMLElement {
    super.render(data);
    this.open();
    return this.container;
  }

  set content(fill: HTMLElement) {
    this._content.replaceChildren(fill);
  }
}
