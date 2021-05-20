import React from "react";
import Reflux from "reflux";
import reactMixin from 'react-mixin';
import PropTypes from "prop-types";
import { bem } from "js/bem";
import autoBind from "react-autobind";
import {stores} from 'js/stores';
import {MODAL_TYPES} from 'js/constants';
import usersStore from "./usersStore";

class UsersSidebar extends Reflux.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersCount: 0,
      isLoading: true,
    };
    autoBind(this);
  }

  componentDidMount() {
    this.listenTo(usersStore, this.usersStoreChanged);
    this.setState({
      isLoading: false,
      usersCount: usersStore.getTotalUsers()
    });
  }

  usersStoreChanged() {
    this.setState({
      isLoading: false,
      usersCount: usersStore.getTotalUsers()
    });
  }

  showUsersNewModal(evt) {
    evt.preventDefault();
    stores.pageState.showModal({
      type: MODAL_TYPES.USERS_NEW_USER
    });
  }

  render() {
    return (
      <React.Fragment>
        <bem.KoboButton m={["blue", "fullwidth"]}
        onClick={this.showUsersNewModal}>
          {t("new user")}
        </bem.KoboButton>

        <bem.UsersSidebar>
          <bem.UsersSidebar__label>
            <i className="k-icon-users" />
            <bem.UsersSidebar__labelText>
              {t("Users")}
            </bem.UsersSidebar__labelText>
          </bem.UsersSidebar__label>

          <bem.UsersSidebar__label>
            <i className="k-icon-group" />
            <bem.UsersSidebar__labelText>
              {t("Groups")}
            </bem.UsersSidebar__labelText>
          </bem.UsersSidebar__label>
        </bem.UsersSidebar>
      </React.Fragment>
    );
  }
}

UsersSidebar.contextTypes = {
  router: PropTypes.object,
};

reactMixin(UsersSidebar.prototype, Reflux.ListenerMixin);

export default UsersSidebar;
