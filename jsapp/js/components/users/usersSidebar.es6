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

  isUsersSelected() {
    return this.context.router.isActive('users/summary');
  }

  render() {
    let sidebarModifier = '';
    if (this.state.isLoading) {
      sidebarModifier = 'loading';
    }

    return (
      <React.Fragment>
        <bem.KoboButton m={["blue", "fullwidth"]}
        onClick={this.showUsersNewModal}>
          {t("new user")}
        </bem.KoboButton>
        
        <bem.FormSidebar m={sidebarModifier}>
          <bem.FormSidebar__label
          m={{selected: this.isUsersSelected()}}
          href='#/users/summary'>
            <i className="k-icon-users" />
            <bem.FormSidebar__labelText>
              {t("Users")}
            </bem.FormSidebar__labelText>
            <bem.FormSidebar__labelCount>{this.state.usersCount}</bem.FormSidebar__labelCount>
          </bem.FormSidebar__label>

          <bem.FormSidebar__label>
            <i className="k-icon-group" />
            <bem.FormSidebar__labelText>
              {t("Groups")}
            </bem.FormSidebar__labelText>
          </bem.FormSidebar__label>
        </bem.FormSidebar>
      </React.Fragment>
    );
  }
}

UsersSidebar.contextTypes = {
  router: PropTypes.object,
};

reactMixin(UsersSidebar.prototype, Reflux.ListenerMixin);

export default UsersSidebar;
