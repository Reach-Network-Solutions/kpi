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
  firstname: {
    label: t('Firstname'),
    id: 'firstname',
    orderBy: 'firstname',
    defaultValue: ORDER_DIRECTIONS.ascending,
  },
  lastname: {
    label: t('Lastname'),
    id: 'lastname',
    orderBy: 'lastname',
    defaultValue: ORDER_DIRECTIONS.ascending,
  },
  email: {
    label: t('Email'),
    id: 'email',
    filterBy: 'email',
    defaultValue: ORDER_DIRECTIONS.ascending,
  },
});
