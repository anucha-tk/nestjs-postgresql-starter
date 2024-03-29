import { ENUM_PAGINATION_ORDER_DIRECTION_TYPE } from "src/common/pagination/constants/pagination.enum.constant";
import { ENUM_ROLE_TYPE } from "src/modules/role/constants/role.enum.constant";

export const ROLE_DEFAULT_ORDER_BY = "id";
export const ROLE_DEFAULT_ORDER_DIRECTION = ENUM_PAGINATION_ORDER_DIRECTION_TYPE.DESC;
export const ROLE_DEFAULT_PER_PAGE = 20;
export const ROLE_DEFAULT_AVAILABLE_ORDER_BY = ["id", "name", "createdAt"];
export const ROLE_DEFAULT_AVAILABLE_SEARCH = ["name"];
export const ROLE_DEFAULT_IS_ACTIVE = [true, false];
export const ROLE_DEFAULT_TYPE = Object.values(ENUM_ROLE_TYPE);
