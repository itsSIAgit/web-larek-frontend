import { IApi, IProduct, TApiPostData } from "../../types";

/**
 * Тип данных получаемых с сервера
 */
type TApiGetResult = {
  total: number,
  items: IProduct[]
}

/**
 * Тип данных с сервера после успешной покупки
 */
type TApiPostResult = {
  id: string,
  total: number
}

/**
  * Предоставляет методы реализующие взаимодействие с бэкендом сервиса.
  */
export class ShopApi {
  private _baseApi: IApi;

  constructor (baseApi: IApi) {
    this._baseApi = baseApi;
  }

  /**
   * Получает весь массив продуктов с сервера в формате TApiGetResult
   */
  getGoods(): Promise<TApiGetResult> {
    return this._baseApi.get<TApiGetResult>('/product');
  }

  /**
  * Получает один продукт с сервера в формате IProduct
  */
  getProduct(id: string): Promise<IProduct> {
    return this._baseApi.get<IProduct>(`/product/${id}`);
  }

  /**
  * Отправляет на сервер POST-запрос, в формате TApiPostData, с данными для заказа
  */
  makePurchase (data: TApiPostData): Promise<TApiPostResult> {
    return this._baseApi.post<TApiPostResult>('/order', data);
  }
}
