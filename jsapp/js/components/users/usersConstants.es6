export const ROOT_BREADCRUMBS = Object.freeze({
  USERS: {
    label: t("Users"),
    href: "#/users/summary",
  },
});

export const USERS_TABLE_CONTEXTS = {};
new Set([
  'MY_USERS',
]).forEach((name) => {USERS_TABLE_CONTEXTS[name] = name;});
Object.freeze(USERS_TABLE_CONTEXTS);

export const ORDER_DIRECTIONS = {};
new Set([
  'ascending',
  'descending',
]).forEach((name) => {ORDER_DIRECTIONS[name] = name;});
Object.freeze(ORDER_DIRECTIONS);

export const USERS_TABLE_COLUMNS = Object.freeze({
  
  status: {
    label: t('Status'),
    id: 'status',
    orderBy: 'status',
    defaultValue: ORDER_DIRECTIONS.descending,
  },
  username: {
    label: t('Username'),
    id: 'username',
    orderBy: 'username',
    defaultValue: ORDER_DIRECTIONS.ascending,
  },
  name: {
    label: t('Name'),
    id: 'name',
    orderBy: 'name',
    defaultValue: ORDER_DIRECTIONS.ascending,
  },
  organisation: {
    label: t('Organisation'),
    id: '0rgansation',
    orderBy: 'organisation',
    defaultValue: ORDER_DIRECTIONS.ascending,
  },
  country: {
    label: t('Country'),
    id: 'country',
    filterBy: 'country',
    defaultValue: ORDER_DIRECTIONS.ascending,
  },
  sector: {
    label: t('Primary Sector'),
    id: 'primary-sector',
    filterBy: 'settings__sector__value',
    filterByPath: ['settings', 'sector'],
    filterByMetadataName: 'sectors',
  },
});
