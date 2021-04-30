/**
 * library specific actions
 */

import Reflux from "reflux";
import { dataInterface } from "js/dataInterface";
import { notify } from "utils";

const usersActions = Reflux.createActions({
  searchMyUsers: {
    children: ["started", "completed", "failed"],
  },
});



/**
 * Gets users
 * Note: `started` callback returns abort method immediately
 */
usersActions.searchMyUsers.listen(() => {
  const xhr = dataInterface
    .searchMyUsers()
    .done(usersActions.searchMyUsers.completed)
    .fail(usersActions.searchMyUsers.failed);
  usersActions.searchMyUsers.started(xhr.abort);
});

const onAnySearchFailed = (response) => {
    if (response.statusText !== 'abort') {
      notify((response.responseJSON.detail) || (t('Failed to get the results'), 'error'));
    }
  };

usersActions.searchMyUsers.failed.listen(onAnySearchFailed);

export default usersActions;
