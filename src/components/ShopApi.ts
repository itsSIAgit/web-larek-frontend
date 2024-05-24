import { IApi, IProduct, TApiPostData } from "../types";

/**
 * Тип данных с сервера после успешной покупки
 */
type TApiPostResult = {
  id: string;
  total: number;
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
   * Получает весь массив продуктов с сервера в формате IProduct[]
   */
  getGoods(): Promise<IProduct[]> {
    return this._baseApi.get<IProduct[]>('/product').then((items: IProduct[]) => items);
  }

  /**
  * Получает один продукт с сервера в формате IProduct
  */
  getProduct(id: string): Promise<IProduct> {
    return this._baseApi.get<IProduct>(`/product/${id}`).then((item: IProduct) => item);
  }

  /**
  * Отправляет на сервер POST-запрос, в формате TApiPostData, с данными для заказа
  */
  makePurchase (data: TApiPostData): Promise<TApiPostResult> {
    return this._baseApi.post<TApiPostResult>('/order', data).then((res: TApiPostResult) => res);
  }
}
