import Reflux from "reflux";
import { dataInterface } from "js/dataInterface";
import { notify } from "utils";

const usersActions = Reflux.createActions({
  searchUsers: {
    children: ["started", "completed", "failed"],
  },

  searchUsersMetadata: {
    children: ["completed", "failed"],
  },
  createUser: { asyncResult: true },
  updateUser: { asyncResult: true },
});

usersActions.searchUsers.listen((params) => {
  const xhr = dataInterface
    .searchUsers(params)
    .done(usersActions.searchUsers.completed)
    .fail(usersActions.searchUsers.failed);
  usersActions.searchUsers.started(xhr.abort);
});

usersActions.searchUsersMetadata.listen((params) => {
  dataInterface
    .searchUsersMetadata(params)
    .done(usersActions.searchUsersMetadata.completed)
    .fail(usersActions.searchUsersMetadata.failed);
});

usersActions.createUser.listen(function(details){
  dataInterface.createUser(details)
    .done(function(user){
      usersActions.createUser.completed(user);
    })
    .fail(function(...args){
      usersActions.createUser.failed(...args);
      console.log(...args);
    });
});

// usersActions.updateUser.listen(function(uid, values, params={}) {
//   dataInterface.patchAsset(uid, values)
//     .done((asset) => {
//       actions.resources.updateAsset.completed(asset);
//       if (typeof params.onComplete === 'function') {
//         params.onComplete(asset, uid, values);
//       }
//       notify(t('successfully updated'));
//     })
//     .fail(function(resp){
//       actions.resources.updateAsset.failed(resp);
//       if (params.onFailed) {
//         params.onFailed(resp);
//       }
//     });
// });

const onAnySearchFailed = (response) => {
  if (response.statusText !== "abort") {
    notify(
      response.responseJSON.detail || (t("Failed to get the results"), "error")
    );
  }
};

usersActions.searchUsers.failed.listen(onAnySearchFailed);
usersActions.searchUsersMetadata.failed.listen(onAnySearchFailed);

export default usersActions;
