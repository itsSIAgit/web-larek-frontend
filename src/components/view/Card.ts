import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

export interface ICard {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  type: string;
  description: string;
  position: number;
  canBuy: string;
}

/**
 * Создает одну карточку товара в разных вариациях,
 * для разных мест применения (на главной, большая
 * подробная, в корзине), в зависимости от поступившего шаблона.
 */
export class Card extends Component<ICard> {
  protected _id: string;
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected _description: HTMLElement;
  protected _position: HTMLElement;
  protected buyButton: HTMLButtonElement;
  protected deleteButton: HTMLButtonElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this._title = ensureElement('.card__title', container);
    this._price = ensureElement('.card__price', container);
    
    //Здесь не используется ensureElement, т.к. так задумано,
    //что класс будет работать с тем что есть, проверяя наличие
    this._image = container.querySelector('.card__image');
    this._category = container.querySelector('.card__category');
    this._description = container.querySelector('.card__text');
    this._position = container.querySelector('.basket__item-index');
    this.buyButton = container.querySelector('.button');
    this.deleteButton = container.querySelector('.basket__item-delete');

    //В зависимости от шаблона:
    //назначает слушателя на нажатие на карточку, кнопку покупки, кнопку удаления товара из корзины
    if (container.classList.contains('gallery__item')) {
      container
        .addEventListener('click', () => this.events.emit('big:open', { id: this._id }));
    }
    if (this.buyButton) {
      this.buyButton
        .addEventListener('click', () => this.events.emit('buy:click', { card: this, id: this._id }));
    }
    if (this.deleteButton) {
      this.deleteButton
        .addEventListener('click', () => this.events.emit('card:delete', { id: this._id }));
    }
  }

  //Сеттеры отрабатывают при вызове render() родительского класса

  protected set id(data: string) {
    this._id = data ? data : '';
  }

  protected set title(data: string) {
    if (this._title) this.setText(this._title, data);
  }

  protected set price(data: number) {
    if (this._price) {
      const price = data ? data + ' синапсов' : 'Бесценно';
      this.setText(this._price, price);
    }
  }

  protected set image(data: string) {
    if (this._image) this.setImage(this._image, data, this._title.textContent);
  }

  protected set category(data: string) {
    if (this._category) this.setText(this._category, data);
  }

  protected set type(typeSelector: string) {
    if (this._category) {
      this._category.classList.value = 'card__category';
      this._category.classList.add(typeSelector);
    }
  }

  protected set description(data: string) {
    if (this._description) this.setText(this._description, data);
  }

  protected set position(data: number) {
    if (this._position) this.setText(this._position, data);
  }

  protected set canBuy(status: string) {
    if (this.buyButton) {
      this.setDisabled(this.buyButton, status !== 'yes');
      switch (status) {
        case 'inf': this.setText(this.buyButton, 'Бесценно');
        break;
        case 'no': this.setText(this.buyButton, 'В корзине');
        break;
        default: this.setText(this.buyButton, 'Купить')
      }
    }
  }
}
