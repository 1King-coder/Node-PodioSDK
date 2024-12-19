import { PagamentosNomeDoMembroFieldValue, PagamentosNomeDoProjetoFieldValue, PodioCreatedBy, PodioCreatedVia, PodioFields, PodioFile, WebhookOptions } from "../types/podio_types";




export interface IPodio {

  authenticate(): Promise<void>;
  isAuthenticated(): boolean;
  refreshToken(): Promise<void>;
  get (urlPart: string): Promise<object>;
  post (urlPart: string, data?: object): Promise<object>;
  put (urlPart: string, data?: object): Promise<object>;
  delete (urlPart: string): Promise<object>;
  criaWebhook (options: WebhookOptions, appId?: number,): Promise<{webhook_id: number}>;
  criaWebhook (options: WebhookOptions): Promise<{webhook_id: number}>;

}

