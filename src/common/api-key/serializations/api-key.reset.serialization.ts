import { OmitType } from "@nestjs/swagger";
import { ApiKeyCreateSerialization } from "./api-key.create.serialization";

export class ApiKeyResetSerialization extends OmitType(ApiKeyCreateSerialization, ["key"]) {}
