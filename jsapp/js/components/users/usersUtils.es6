import {hashHistory} from 'react-router';

/**
 * Checks if on `/library/…`
 */
export function isOnUsersRoute() {
  return hashHistory.getCurrentLocation().pathname.split('/')[1] === 'users';
}

