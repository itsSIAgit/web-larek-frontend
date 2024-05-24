# Проектная работа "Веб-ларек"
https://github.com/itsSIAgit/web-larek-frontend.git

Учебный проект, в котором реализован функционал шуточного интернет-магазина с товарами для веб-разработчиков.\
В нём можно посмотреть каталог товаров, добавить товары в корзину и сделать заказ.

Стек: HTML, SCSS, TS, Webpack.\
Сайт использует внешний backend сервер для получения товаров и отправки заказа.

Содержание:
- [Файловая структура](#файловая-структура)
- [Команды консоли](#команды-консоли)
- [Архитектура приложения](#архитектура-приложения)
  - [Базовый код](#базовый-код)
    - [Класс Api](#класс-api)
    - [Класс EventEmitter](#класс-eventemitter)
  - [Слой данных](#слой-данных)
    - [Класс Catalog](#класс-catalog)
    - [Класс Basket](#класс-basket)
    - [Класс PurchaseInfo](#класс-purchaseinfo)
  - [Слой представления](#слой-представления)
    - [Класс Card](#класс-card)
    - [Класс Popup](#класс-popup)
    - [Класс BasketView](#класс-basketview)
    - [Класс OrderView](#класс-orderview)
    - [Класс ContactsView](#класс-contactsview)
    - [Класс SuccessView](#класс-successview)
    - [Класс BasketIconView](#класс-basketiconview)
  - [Слой коммуникации](#слой-коммуникации)
    - [Класс ShopApi](#класс-shopapi)
- [Взаимодействие компонентов](#взаимодействие-компонентов)
- [Список всех событий](#список-всех-событий)


## Файловая структура
Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — каталог с JS компонентами
- src/components/base/ — каталог с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами
- Файл .env который необходимо создать и добавить адрес backend сервера. Пример в .env.example


## Команды консоли
Для установки и запуска проекта необходимо выполнить команды:
```
npm install
npm run start
```
или
```
yarn
yarn start
```
Для сборки проекта необходимо выполнить команды:
```
npm run build
```
или
```
yarn build
```


## Данные и типы данных, используемые в приложении

Данные одного продукта
```
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
```

Каталог товаров
```
export interface ICatalog {
  events: IEvents;
  items: IProduct[];
  setGoods(items: IProduct[]): void;
  getProduct(id: string): IProduct;
}
```

Данные корзины
```
export interface IBasket {
  events: IEvents;
  items: IProduct[];
  add (product: IProduct): void;
  remove (id: string): void;
  purchaseOpportunity (): boolean;
  haveProduct (id: string): boolean;
  goodsCount (): number;
  total (): number;
  clear (): void;
}
```

Данные для оформления покупки
```
export interface IPurchaseInfo {
  events: IEvents;
  payment: null | 'online' | 'physically';
  address: string;
  email: string;
  phone: string;
}
```


## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой данных, отвечает за хранение и изменение данных
- слой представления, отвечает за отображение данных на странице
- презентер, отвечает за связь представления и данных

Для взаимодействия компонентов используется событийно ориентированный подход (СОП):
- классы слоя данных сообщают, когда происходят изменения хранилищ
- классы слоя представления генерируют события, когда пользователь взаимодействует с интерактивными элементами: кнопки обычные, кнопки-иконки, кнопки-карточки, поля ввода, и пр.
- презентер связывает слои, определяя слушателей событий, и то как на них реагировать


### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие


### Слой данных
Классы отвечают за хранение данных, используемых в приложении. Их изменение вызывает события в брокере.

#### Класс Catalog
Отвечает за хранение всего каталога продуктов.\
Конструктор класса принимает инстант брокера событий.

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter для инициации событий при изменении данных
- `_items: IProduct[]` - массив продуктов

Методы класса:
- `setGoods (items: IProduct[]): void` - записывает значения массива продуктов и вызывает событие изменения массива каталога
- `getProduct (id: string): IProduct` - позволяет получить данные продукта по id
- геттер items

#### Класс Basket
Отвечает за хранение содержимого корзины.\
Конструктор класса принимает инстант брокера событий.

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter для инициации событий при изменении данных
- `_items: IProduct[]` - массив продуктов в корзине

Методы класса:
- `add (product: IProduct): void` - добавляет товар в массив корзины и вызывает событие изменения массива корзины
- `remove (id: string): void` - удаляет товар из массива корзины и вызывает событие изменения массива корзины
- `purchaseOpportunity (): boolean` - проверить возможна ли покупка
- `haveProduct (id: string): boolean` - проверить, есть ли товар в корзине
- `goodsCount (): number` - узнать сколько товаров в корзине
- `total (): number` - узнать стоимость товаров в корзине 
- `clear (): void` - очистить корзину от товаров
- геттер для items 

#### Класс PurchaseInfo
Отвечает за хранение данных покупателя.\
Конструктор класса принимает инстант брокера событий.

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter для инициации событий при изменении данных
- `_payment: null | 'online' | 'physically'` - выбранный способ оплаты
- `_address: string` - адрес покупателя
- `_email: string` - почта покупателя
- `_phone: string` - телефон покупателя

Методы класса:
- геттеры всех полей (поскольку проверка на валидность примитивная, ею занимается презентер)
- сеттеры всех полей (вызывают события изменения данных)


### Слой представления
Классы отвечают за представление передаваемых в них данных, и создают события на действия пользователя.

#### Класс Card
Создает одну карточку товара в разных вариациях, для разных мест применения (на главной, большая подробная, в корзине), в зависимости от поступившего шаблона.

Конструктор:
- получает клонированный template и экземпляр класса EventEmitter
- сопоставляет поля класса с элементами которые есть в шаблоне
- В зависимости от шаблона: назначает слушателя на нажатие на карточку, кнопку покупки, кнопку удаления товара из корзины. Какие действия с card__button нужно совершить, определяет по классу карточки в шаблоне (card_full или card_compact)

Поля класса:
> Общие
- `element: HTMLElement` - элемент разметки с карточкой
- `events: IEvents` - экземпляр класса EventEmitter для инициации событий при взаимодействии пользователя с интерактивными элементами
- `_title: HTMLElement` - поле заголовка карточки
- `_price: HTMLElement` - поле цены товара в карточке
> Особые для отображения на главной странице
- `cardImage?: HTMLImageElement` - img элемент карточки
- `_category?: HTMLElement` - поле с названием категории товара
> ... в модальном окне подробного описания
- `_description?: HTMLElement` - поле с подробным описанием товара
- `buyButton?: HTMLButtonElement` - кнопка добавления товара в корзину
> ... в корзине
- `_position?: HTMLElement` - элемент со значением позиции товара в списке корзины 
- `deleteButton?: HTMLButtonElement` - кнопка удаления товара из корзины

Методы класса:\
Все сеттеры доступны, но проверяют существование изменяемого поля, и если this.поле отсутствует - ни делает ничего.
> Общие
- `render ({ data?: Partial<IProduct>, inBasket?: boolean, basketPos?: number })` - заполняет значения и возвращает готовую карточку. Если data нет - просто возвращает карточку. Управляет доступностью кнопки "Купить" (если она есть), и меняет её текст, в зависимости от поступивших данных. Не даст добавить бесценный товар или повторно.
- сеттеры для title и price
> Особые для отображения на главной странице
- сеттеры для image и category
> ... в модальном окне подробного описания
- сеттер `buyButtonStatus (active: boolean)` - меняет доступность кнопки покупки
- сеттер `buyButtonText (text: string)` - меняет текст кнопки покупки
- сеттер description
> ... в корзине
- сеттер position

#### Page
Отвечает за вывод контента на главной странице: каталога товаров (карточек), и иконки корзины со счетчиком.\
Иконка корзины - показывает число товаров, и создает событие для открытия корзины.

Конструктор:
- принимает два контейнера: в один будут выводиться карточки, другой - кнопка корзины
- получает элементы для сопоставления с полями класса и экземпляр класса EventEmitter

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter
- `containerCard: HTMLElement` - место куда складывать карточки товаров
- `basketButton: HTMLButtonElement` - кнопка корзины на главной странице
- `_count: HTMLElement` - поле с количеством товаров в корзине

Методы класса:
- `render (items: HTMLElement[]): HTMLElement` - обновляет отображение каталога и возвращает контейнер с плиткой карточек
- сеттер `count (count: number)` - обновляет счетчик числа товаров в корзине 

#### Класс Popup
Реализует модальное окно. Через сеттер принимает сгенерированную начинку, которая должна получать свои данные из компонентов модели данных.

Конструктор:
- принимает контейнер в который будет выводиться подготовленная разметка и экземпляр класса EventEmitter
- сопоставляет поля класса с элементами разметки
- назначает слушателей закрытия окна на крестик, внешнее поле и клавишу Esc

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter
- `closeButton: HTMLButtonElement` - кнопка закрытия окна
- `_content: HTMLElement` - контейнер для начинки

Методы класса:
- `open ()` - открывает всплывающее окно (меняет display: none на inherit)
- `close ()` - закрывает окно
- `erase ()` - уничтожает содержимое окна (и браузерные слушатели событий содержимого)
- сеттер `content (fill: HTMLElement)` - устанавливает содержимое окна

#### Класс BasketView
Готовит представление корзины из шаблона. Подготавливает к отображению все карточки добавленные в корзину.

Конструктор:
- получает клонированный template basket и экземпляр класса EventEmitter
- сопоставляет поля класса с элементами разметки
- назначает слушателя на кнопку оформления покупки

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter
- `container: HTMLElement` - место куда складывать карточки товаров корзины
- `_purchaseButton: HTMLButtonElement` - кнопка начала оформления покупки
- `_total: HTMLElement` - контейнер для суммы покупки

Методы класса:
- `render (items: HTMLElement[], purchaseOpportunity: boolean)` - обновляет отображаемые данные и возвращает контейнер с корзиной целиком
- сеттер `purchaseButton` - устанавливает доступность кнопки оформления покупки
- сеттер total

#### Класс OrderView
Готовит представление формы ввода базовых данных для заказа, из шаблона.

Конструктор:
- получает клонированный template order и экземпляр класса EventEmitter
- сопоставляет поля класса с элементами разметки
- назначает слушателя на кнопку оформления покупки

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter
- `buttonCard: HTMLButtonElement` - кнопка онлайн оплаты
- `buttonCash: HTMLButtonElement` - кнопка оплаты при получении
- `address: HTMLInputElement` - поле ввода адреса
- `_buttonNext: HTMLButtonElement` - кнопка "Далее"

Методы класса:
- `render (data: Partial<IPurchaseInfo>, valid: boolean)` - обновляет отображаемые данные и возвращает контейнер с формой целиком
- сеттер `buttonNext` - устанавливает доступность кнопки "Далее"

#### Класс ContactsView
Готовит представление форм ввода email-а и телефона, из шаблона.

Конструктор:
- получает клонированный template order и экземпляр класса EventEmitter
- сопоставляет поля класса с элементами разметки
- назначает слушателя на кнопку "Оплатить"

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter
- `email: HTMLInputElement` - поле ввода Email
- `phone: HTMLInputElement` - поле ввода телефона
- `_buttonPay: HTMLButtonElement` - кнопка "Оплатить"

Методы класса:
- `render (data: Partial<IPurchaseInfo>, valid: boolean)` - обновляет отображаемые данные и возвращает контейнер с формой целиком
- сеттер `buttonPay` - устанавливает доступность кнопки "Оплатить"

#### Класс SuccessView
Готовит представление успешного оформления (отправки на сервер) заказа, из шаблона.

Конструктор:
- получает клонированный template success и экземпляр класса EventEmitter
- сопоставляет поля класса с элементами разметки
- назначает слушателя на кнопку "За новыми покупками!"

Поля класса:
- `events: IEvents` - экземпляр класса EventEmitter
- `total: HTMLElement` - контейнер для суммы покупки
- `_buttonFinish: HTMLButtonElement` - кнопка "За новыми покупками!"

Методы класса:
- `render (total: number)` - обновляет отображаемые данные и возвращает контейнер


### Слой коммуникации

#### Класс ShopApi
Предоставляет методы реализующие взаимодействие с бэкендом сервиса.

Конструктор:
- принимает экземпляр класса Api

Поля класса:
- `private _baseApi: IApi` - для экземпляра класса Api

Методы класса:
- `getGoods ()` - получает весь массив продуктов с сервера в формате IProduct[]
- `getProduct (id: string)` - получает один продукт с сервера в формате IProduct
- `makePurchase (data: TApiPostData)` - отправляет на сервер POST-запрос с данными для заказа


## Взаимодействие компонентов

Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`.\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

Особенности:
- бесценный товар нельзя положить в корзину
- товар в корзине нельзя добавить повторно
- удалить добавленный товар можно только через корзину
- добавление товара заново рендерит карточку целиком, и пере-добавляет в модальное окно
- удаление товара заново запускает рендер всех карточек в корзине (в контейнере), и обновляет их индексы в списке
- поля ввода данных для оформления проверяются только на пустоту
- невалидное поле, подсветится силами браузера (за счет required у input)  
- после успешного оформления покупки (успешной отправки на сервер), очищается только корзина, данные для оформления остаются


## Список всех событий

Список всех событий, которые могут генерироваться в системе:

> События изменения данных\
> (генерируются классами данных)

- `goods:changed` - изменение массива продуктов в каталоге
- `basket:changed` - изменение массива продуктов в корзине
- `infoPayment:changed` - изменение способа оплаты
- `infoAddress:changed` - изменение адреса
- `infoEmail:changed` - изменение почты
- `infoPhone:changed` - изменение телефона

> События, возникающие при взаимодействии пользователя с интерфейсом\
> (генерируются классами, отвечающими за представление)

- `card:open` - открытие модального окна с подробным описанием товара
- `basket:open` - открытие модального окна с корзиной
- `buy:click` - нажатие кнопки "Купить" в форме подробного описания товара
- `card:delete` - нажатие кнопки удаления товара из корзины
- `purchase:next` - нажатие кнопки "Оформить" в корзине
- `modal:next` - нажатие кнопки "Далее" в форме ввода способа платежа и адреса
- `modal:submit` - нажатие кнопки "Оплатить" в форме ввода email-а и телефона
- `modal:finish` - нажатие кнопки "За новыми покупками!"
- `modal:close` - при нажатии на крестик модального окна, на клавишу ESC, или вне области.
- `address:input` - при вводе в поле формы - address (каждый символ)
- `email:input` - при вводе в поле формы - email (каждый символ)
- `phone:input` - при вводе в поле формы - phone (каждый символ)
