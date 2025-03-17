import { API } from "../Common/Api";

export class StoreIndex {
    protected _api: API;
    constructor(api: API) {
        this._api = api;
    }
}