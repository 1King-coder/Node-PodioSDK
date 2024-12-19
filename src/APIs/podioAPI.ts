import axios from "../Services/axios";
import fs from "fs";
import path from "path";
import {
  IPodio,
  } from "../interfaces/podio_interfaces";

import {
  FilterOptions,
  PodioTokenData,
  WebhookOptions,
  Webhook,
  PodioItemRevision,
  PodioItemRevisionDif,
  PodioCreds,
  PodioGetItemsFromAppResponse as FilterItemsResponse,
  PodioAppItem,
  PodioSearchReferenceOptions,
  PodioSearchReferenceResponse,
  PodioSuccessAuthResponse,
  AddItemResponse,
  AddItemPayload,
  ExportOptions,
  ExportResponse,
  FindReferenceableItemsResponse,
  ItemRevision,
  PodioFields,
  ItemFieldsValues,
  RearrangeOptions,
} from "../types/podio_types";

import { CPFtoOnlyNumbers } from "../Services/utils";

require("dotenv").config();



export class Podio implements IPodio {
  private token: string = "";
  constructor(private creds: PodioCreds)
  {
     this.creds = creds;
     this.authenticate();
  }

  async authenticate(): Promise<void> {
    if (this.isAuthenticated()) {
      const tokenInfo: PodioTokenData = JSON.parse(fs.readFileSync("./podioToken.json").toString())
      this.token = tokenInfo.access_token;
      return;
    };

    if (fs.existsSync("./podioToken.json")) {
      await this.refreshToken();
      const tokenInfo: PodioTokenData = JSON.parse(fs.readFileSync("./podioToken.json").toString())
      this.token = tokenInfo.access_token;
      return;
    }


    await axios.post(
      `/oauth/token/v2`,
      {
        grant_type: "password",
        username: this.creds.username,
        password: this.creds.password,
        client_id: this.creds.clientId,
        redirect_uri: "about:blank",
        client_secret: this.creds.clientSecret,
      }
    ).then((res) => {
      const data = <PodioSuccessAuthResponse> res.data;
      if (res.status === 200) {
        fs.writeFileSync("./podioToken.json", JSON.stringify(res.data));
        this.token = data.access_token;
        return;
      }

      if (res.status === 401) {
        throw new Error("Invalid credentials");
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  isAuthenticated (): boolean {

    if (!fs.existsSync("./podioToken.json")) {
      return false;
    }

    const token: Buffer = fs.readFileSync("./podioToken.json");

    const tokenJson: PodioTokenData = JSON.parse(token.toString());

    if (tokenJson.access_token === undefined) {
      return false;
    }

    if (token.length === 0) {
      return false;
    }

    axios.get(
      "/app/top", {
        headers: {
          "Authorization": `OAuth2 ${tokenJson.access_token}`
        }
      }
    ).then((res) => {
      if (res.status === 403) {
        return false;
      }

      if (res.status === 200) {
        return true;
      }
    }).catch((err) => {
      console.log(err);
      return false;
    })

    return true;
  }

  async refreshToken (): Promise<void> {

    const tokenFile: Buffer = fs.readFileSync("./podioToken.json");

    if (tokenFile.length === 0) {
      throw new Error("Token file is empty");
    }

    const token: PodioTokenData = JSON.parse(tokenFile.toString());

    await axios.post(
      "https://api.podio.com/oauth/token/v2",
      {
        grant_type: "refresh_token",
        client_id: this.creds.clientId,
        client_secret: this.creds.clientSecret,
        refresh_token: token.refresh_token,
      }
    ).then((res) => {
      if (res.status === 200) {
        fs.writeFileSync("./podioToken.json", JSON.stringify(res.data));
        return;
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  async getTokenHeader (): Promise<Axios.AxiosXHRConfigBase<any>> {
    if (!(await this.isAuthenticated())) {
      await this.authenticate();
    }

    if (this.token === "") {
      throw new Error("Token is undefined, please authenticate");
    }

    const config: Axios.AxiosXHRConfigBase<any> = {
      headers: {
        "Authorization": `OAuth2 ${this.token}`
      }
    }

    return config
  }

  async get(urlPart: string): Promise<object> {
    const config = await this.getTokenHeader();

    return (await axios.get(urlPart, config)).data;
  }

  async post (urlPart: string, data?: object): Promise<object> {
    const config = await this.getTokenHeader();

    return (await axios.post(urlPart, data, config)).data

  }

  async delete (urlPart: string): Promise<object> {
    const config = await this.getTokenHeader();

    return (await axios.delete (urlPart, config)).data
  }

  async put (urlPart: string, data?: object): Promise<object> {
    const config = await this.getTokenHeader();

    return (await axios.put(urlPart, data, config)).data

  }

  async addItem (appId: number, data: AddItemPayload): Promise<AddItemResponse> {
    /*
    EXAMPLE OF AN ITEM PAYLOAD:
    {
      external_id:"pagamentos-2",
      fields: [
        {
          external_id: "data-da-despesa",
          values: [{start_date: "2024-12-19"}]
        },
        {
          external_id: "descricao",
          values: [{value: "TESTE"}]
        },
        {
          external_id: "valor-2",
          values: [{value: 200}]
        },
        {
          external_id: "nome-do-membro-2",
          values: [{value: itemId}]
        },
        {
          external_id: "conta-de-pagamento",
          values: [{value: selectionBubbleId}]
        },
        {
          external_id: "realizado",
          values: [{value: selectionBubbleId}]
        }
      ]
    }
    */
    return <AddItemResponse> await this.post(`/item/app/${appId}/`, data);
  }

  async CloneItem (itemId: number): Promise<AddItemResponse> {
    return <AddItemResponse> await this.post(`/item/${itemId}/clone/`);
  }

  async DeleteItem (itemId: number): Promise<object> {
    return await this.delete(`/item/${itemId}/`);
  }

  async DeleteItemReference (itemId: number): Promise<object> {
    return await this.delete(`/item/${itemId}/ref`);
  }

  async ExportItems (appId: number, exporter: "xls" | "xlsx", exportOptions: ExportOptions): Promise<ExportResponse> {
    return <ExportResponse> await this.post(`/item/app/${appId}/export/${exporter}`, exportOptions);
  }

  async FilterItems (appId: number, options?: FilterOptions): Promise<FilterItemsResponse> {
    const data = await this.post(`/item/app/${appId}/filter/`, options);
    return <FilterItemsResponse> data;
  }

  async FilterItemsByView (appId: number, view_id: number ,options?: FilterOptions): Promise<FilterItemsResponse> {
    const data = await this.post(`/item/app/${appId}/filter/${view_id}`, options);
    return <FilterItemsResponse> data;
  }

  async FindReferenceableItems (field_id: number): Promise<FindReferenceableItemsResponse[]> {
    return <FindReferenceableItemsResponse[]> await this.get(`/item/field/${field_id}/find`);
  }

  async GetFieldRanges (field_id: number): Promise<{min: number, max: number}> {
    return <{min: number, max: number}> await this.get(`/item/field/${field_id}/range`);
  }

  async GetItem (itemId: number, mark_as_viewed: boolean=true): Promise<PodioAppItem> {
    return <PodioAppItem> await this.get(`/item/${itemId}?mark_as_viewed=${mark_as_viewed}`);
  }

  async GetItemByAppItemId (appId: number, app_item_id: number): Promise<PodioAppItem> {
    return <PodioAppItem> await this.get(`/app/${appId}/item/${app_item_id}/`);
  }

  async GetItemClone (itemId: number): Promise<PodioAppItem> {
    return <PodioAppItem> await this.get(`/item/${itemId}/clone/`);
  }

  async GetItemByExternalId (appId: number, external_id: string): Promise<PodioAppItem> {
    return <PodioAppItem> await this.get(`/item/app/${appId}/external_id/${external_id}`);
  }

  async GetItemCount (appId: number, key?: string, view_id: number=0): Promise<{count: number}> {
    return <{count: number}> await this.get(`/item/app/${appId}/count?=view_id=${view_id}` + (key ? `&key=${key}` : ""));
  }

  async GetItemFieldValues (itemId: number, field_or_external_id: number): Promise<{values: object}> {
    return <{values: object}> await this.get(`/item/${itemId}/value/${field_or_external_id}/v2`);
  }

  async GetItemPreviewForFieldReference (itemId: number, field_id: number): Promise<PodioAppItem> {
    return <PodioAppItem> await this.get(`/item/${itemId}/reference/${field_id}/preview/`);
  }

  async GetItemReferences (itemId: number, limit: number=100): Promise<PodioAppItem[]> {
    return <PodioAppItem[]> await this.get(`/item/${itemId}/reference?limit=${limit}`);
  }

  async GetItemRevision (itemId: number, revision: number): Promise<ItemRevision> {
    return <ItemRevision> await this.get(`/item/${itemId}/revision/${revision}/`);
  }

  async GetItemRevisionDif (itemId: number, revision_from: number, revision_to: number): Promise<PodioItemRevisionDif> {
    return (<PodioItemRevisionDif[]> await this.get(`/item/${itemId}/revision/${revision_from}/${revision_to}`))[0];
  }

  async GetItemRevisions (itemId: number): Promise<ItemRevision[]> {
    return <ItemRevision[]> await this.get(`/item/${itemId}/revision`);
  }

  async RevertItemRevision (itemId: number, revision: number): Promise<{revision: number}> {
    return <{revision: number}> await this.delete(`/item/${itemId}/revision/${revision}`);
  }

  async RevertItemToRevision (itemId: number, revision: number): Promise<{revision: number}> {
    return <{revision: number}> await this.post(`/item/${itemId}/revision/${revision}/revert_to`);
  }

  async GetItemValues (itemId: number): Promise<ItemFieldsValues[]> {
    return <ItemFieldsValues[]> await this.get(`/item/${itemId}/value/v2`);
  }

  async GetItemsAsXlsx (appId: number, key?: string, deleted_columns: boolean=false,
    limit: number=20, offset: number=0, sort_by: string="", sort_desc: "true" | "false"="true", view_id: number=0 ): Promise<Buffer> {

    const blobData =  <Buffer> await this.get(`/item/app/${appId}/xlsx?deleted_columns=${deleted_columns}&limit=${limit}&offset=${offset}&sort_by=${sort_by}&sort_desc=${sort_desc}&view_id=${view_id}` + (key ? `&key=${key}` : ""));

    return blobData;

  }

  async GetMeetingURL (itemId: number): Promise<{url: string | null}> {
    return <{url: string | null}> await this.get(`/item/${itemId}/meeting/url`);
  }

  async GetRecalcStatusForField (itemId: number, field_id: number): Promise<{status: string, timestamp: string | null}> {
    return <{status: string, timestamp: string | null}> await this.get(`/item/${itemId}/field/${field_id}/recalc/status`);
  }

  async GetReferencesToItemByField (itemId: number, field_id: number, limit:number=10, offset:number=0): Promise<{item_id: number, title: string, link: string}> {
    return <{item_id: number, title: string, link: string}> await this.get(`/item/${itemId}/reference/field/${field_id}`);
  }

  async RearrangeItem (itemId: number, rearrangeOptions: RearrangeOptions): Promise<PodioAppItem> {
    return <PodioAppItem> await this.post(`/item/${itemId}/rearrange/`, rearrangeOptions);
  }

  async criaWebhook ( options: WebhookOptions, appId?: number): Promise<{webhook_id: number}> {
    return <{webhook_id: number}>await this.post(
      `/hook/app/${appId}/`,
      options
    )
  }

  async getWebhooks (appId: number,): Promise<Webhook[]> {
    return <Webhook[]>await this.get(
      `/hook/app/${appId}/`,
    )
  }

  async deleteWebhook (webhook_id: number): Promise<object> {
    return await this.delete(
      `/hook/${webhook_id}/`,
    )
  }

  async validaWebhook (webhook_id: number, webhook_verification_code: string): Promise<object> {
    return await this.post(
      `/hook/${webhook_id}/verify/validate`,
      {code: webhook_verification_code}
    )
  }

}
