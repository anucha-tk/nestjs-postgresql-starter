import { ENUM_API_KEY_TYPE } from "../constants/api-key.enum.constant";
import { ApiKeyEntity } from "../repository/entities/api-key.entity";

export interface IApiKeyPayload {
  id: number;
  key: string;
  type: ENUM_API_KEY_TYPE;
  name: string;
}

export interface IApiKeyCreated {
  secret: string;
  doc: ApiKeyEntity;
}
