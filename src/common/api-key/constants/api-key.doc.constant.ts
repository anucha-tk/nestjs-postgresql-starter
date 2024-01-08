export const ApiKeyQueryIsActive = [
  {
    name: "isActive",
    allowEmptyValue: true,
    required: false,
    type: "string",
    example: "true,false",
    description: "boolean value with ',' delimiter",
  },
];

export const ApiKeyParamsId = [
  {
    name: "apiKey",
    allowEmptyValue: false,
    required: true,
    type: "string",
    example: 1,
  },
];
