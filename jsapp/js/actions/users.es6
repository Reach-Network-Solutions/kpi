import Reflux from 'reflux';
import {dataInterface} from 'js/dataInterface';
import {notify} from 'utils';

const usersActions = Reflux.createActions({
  searchUsers: {
    children: [
      'started',
      'completed',
      'failed'
    ]
  },

  searchUsersMetadata: {
    children: [
      'completed',
      'failed'
    ]
  },

});


  usersActions.searchUsers.listen((params) => {
    const xhr = dataInterface.searchUsers(params)
      .done(usersActions.searchUsers.completed)
      .fail(usersActions.searchUsers.failed);
    usersActions.searchUsers.started(xhr.abort);
  });
 
  
  usersActions.searchUsersMetadata.listen((params) => {
    dataInterface.searchUsersMetadata(params)
      .done(usersActions.searchUsersMetadata.completed)
      .fail(usersActions.searchUsersMetadata.failed);
  });
  
  
  
  const onAnySearchFailed = (response) => {
    if (response.statusText !== 'abort') {
      notify((response.responseJSON.detail) || (t('Failed to get the results'), 'error'));
    }
  };
  
  usersActions.searchUsers.failed.listen(onAnySearchFailed);
  usersActions.searchUsersMetadata.failed.listen(onAnySearchFailed);
  
  export default usersActions;