import React from 'react';
import reactMixin from 'react-mixin';
import autoBind from 'react-autobind';
import Reflux from 'reflux';
import Select from 'react-select';
import PropTypes from 'prop-types';
import TextBox from 'js/components/common/textBox';
import { bem } from 'js/bem';
import { actions } from 'js/actions';
import { stores } from 'js/stores';
import { hashHistory } from 'react-router';
import {notify} from 'utils';
import {
  renderLoading,
  renderBackButton
} from './modalHelpers';
import {
  MODAL_TYPES,
  ASSET_TYPES,
  ROUTES,
} from 'js/constants';
import mixins from 'js/mixins';

class UsersNewUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.unlisteners = [];
    this.state = {
      isSessionLoaded: !!stores.session.currentAccount,
      data: {
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: ''
      },
      isPending: false
    };

    autoBind(this);
    if (this.props.user) {
      this.applyPropsData();
    }
  }

  componentDidMount() {
    this.listenTo(stores.session, () => {
      this.setState({ isSessionLoaded: true });
    });

    this.unlisteners.push(
      actions.users.createUser.completed.listen(this.onCreateUserCompleted.bind(this)),
      actions.users.createUser.failed.listen(this.onCreateUserFailed.bind(this)),
      // actions.users.updateUser.completed.listen(this.onUpdateUserCompleted.bind(this)),
      // actions.users.updateUser.failed.listen(this.onUpdateUserFailed.bind(this))
    );
  }

  componentWillUnmount() {
    this.unlisteners.forEach((clb) => { clb(); });
  }

  applyPropsData() {
    if (this.props.user.username) {
      this.state.data.username = this.props.user.username;
    }
    if (this.props.user.first_name) {
      this.state.data.first_name = this.props.user.first_name;
    }
    if (this.props.user.last_name) {
      this.state.data.last_name = this.props.user.last_name;
    }
    if (this.props.user.email) {
      this.state.data.email = this.props.user.email;
    }
  }

  onCreateUserCompleted(response) {
    this.setState({ isPending: false });
    notify(t('User ##name## created').replace('##name##', response.username));
    stores.pageState.hideModal();
  }

  onCreateUserFailed() {
    this.setState({ isPending: false });
    notify(t('Failed to create user'), 'error');
  }

  onUpdateUserCompleted() {
    this.setState({ isPending: false });
    stores.pageState.hideModal();
  }

  onUpdateUserFailed() {
    this.setState({ isPending: false });
    notify(t('Failed to update user'), 'error');
  }

  onSubmit(evt) {
    evt.preventDefault();
    this.setState({ isPending: true });

    if (this.props.user) {
      actions.users.updateUser(
        //
      );
    } else {
      const params = {
        username: this.state.data.username,
        first_name: this.state.data.first_name,
        last_name: this.state.data.last_name,
        email: this.state.data.email,
        password: this.state.data.password,
      };

      actions.users.createUser(params);
    }
  }

  onPropertyChange(property, newValue) {
    const data = this.state.data;
    data[property] = newValue;
    this.setState({ data: data });
  }

  onUsernameChange(newValue) { this.onPropertyChange('username', newValue); }
  onFirstnameChange(newValue) { this.onPropertyChange('first_name', newValue); }
  onLastnameChange(newValue) { this.onPropertyChange('last_name', newValue); }
  onEmailChange(newValue) { this.onPropertyChange('email', newValue); }
  onPasswordChange(newValue) { this.onPropertyChange('password', newValue); }

  renderLoading(message = t('loading…')) {
    return (
      <bem.Loading>
        <bem.Loading__inner>
          <i />
          {message}
        </bem.Loading__inner>
      </bem.Loading>
    );
  }

  isSubmitEnabled() {
    return !this.state.isPending;
  }

  getSubmitButtonLabel() {
    if (this.props.user) {
      if (this.state.isPending) {
        return t('Saving…');
      } else {
        return t('Save');
      }
    } else if (this.state.isPending) {
      return t('Creating…');
    } else {
      return t('Create');
    }
  }

  render() {
    if (!this.state.isSessionLoaded) {
      return this.renderLoading();
    }

    return (
      <bem.FormModal__form className='project-settings project-settings--form-source'>
        <bem.FormModal__item m='wrapper' disabled={this.state.isPending}>
          <bem.FormModal__item>
            <TextBox
              value={this.state.data.username}
              onChange={this.onUsernameChange}
              label={t('Username')}
            />
          </bem.FormModal__item>

          <bem.FormModal__item>
            <TextBox
              value={this.state.data.first_name}
              onChange={this.onFirstnameChange}
              label={t('Firstname')}
            />
          </bem.FormModal__item>

          <bem.FormModal__item>
            <TextBox
              value={this.state.data.last_name}
              onChange={this.onLastnameChange}
              label={t('Lastname')}
            />
          </bem.FormModal__item>

          <bem.FormModal__item>
            <TextBox
              value={this.state.data.email}
              onChange={this.onEmailChange}
              label={t('Email')}
            />
          </bem.FormModal__item>

          <bem.FormModal__item>
            <TextBox
              value={this.state.data.password}
              onChange={this.onPasswordChange}
              label={t('Password')}
            />
          </bem.FormModal__item>

          <bem.FormModal__item>
            <TextBox
              value={this.state.data.password}
              onChange={this.onPasswordChange}
              label={t('Password Confirmation')}
            />
          </bem.FormModal__item>


        </bem.FormModal__item>

        <bem.Modal__footer>
          {renderBackButton(this.state.isPending)}

          <bem.KoboButton
            m='blue'
            type='submit'
            onClick={this.onSubmit}
            disabled={!this.isSubmitEnabled()}
            className='mdl-js-button'
          >
            {this.getSubmitButtonLabel()}
          </bem.KoboButton>
        </bem.Modal__footer>
      </bem.FormModal__form>
    );
  }
}

reactMixin(UsersNewUserForm.prototype, Reflux.ListenerMixin);
reactMixin(UsersNewUserForm.prototype, mixins.contextRouter);

UsersNewUserForm.contextTypes = {
  router: PropTypes.object
};

export default UsersNewUserForm;