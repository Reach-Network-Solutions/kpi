import React from 'react';
import autoBind from 'react-autobind';
import reactMixin from 'react-mixin';
import Reflux from 'reflux';
import alertify from 'alertifyjs';
import {stores} from '../../stores';
import {actions} from '../../actions';
import {bem} from '../../bem';
import {MODAL_TYPES} from '../../constants';

const REST_SERVICES_SUPPORT_URL = 'rest_services.html';

export default class RESTServicesList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isLoadingHooks: true,
      assetUid: props.assetUid,
      hooks: []
    };
    autoBind(this);
  }

  componentDidMount() {
    this.listenTo(
      actions.hooks.getAll.completed,
      this.onHooksUpdate
    );

    actions.hooks.getAll(
      this.state.assetUid,
      {
        onComplete: (data) => {
          this.setState({
            isLoadingHooks: false,
            hooks: data.results
          });
        },
        onFail: (data) => {
          this.setState({
            isLoadingHooks: false
          });
          alertify.error(('Could not load REST Services'));
        }
      }
    );
  }

  onHooksUpdate(data) {
    this.setState({
      isLoadingHooks: false,
      hooks: data.results
    })
  }

  editHook(evt) {
    stores.pageState.showModal({
      assetUid: this.state.assetUid,
      type: MODAL_TYPES.REST_SERVICES,
      hookUid: evt.currentTarget.dataset.hookUid
    });
  }

  deleteHookSafe(evt) {
    const hookName = evt.currentTarget.dataset.hookName;
    const hookUid = evt.currentTarget.dataset.hookUid;
    if (this.state.assetUid) {
      const dialog = alertify.dialog('confirm');
      const title = ('Are you sure you want to delete ##target?')
        .replace('##target', hookName);
      const message = ('You are about to delete ##target. This action cannot be undone.')
        .replace('##target', `<strong>${hookName}</strong>`);
      let dialogOptions = {
        title: title,
        message: message,
        labels: { ok: ('Confirm'), cancel: ('Cancel') },
        onok: () => {
          actions.hooks.delete(this.state.assetUid, hookUid);
        },
        oncancel: () => {
          dialog.destroy();
        }
      };
      dialog.set(dialogOptions).show();
    }
  }

  openNewRESTServiceModal() {
    stores.pageState.showModal({
      assetUid: this.state.assetUid,
      // hookUid: not provided intentionally
      type: MODAL_TYPES.REST_SERVICES
    });
  }

  getSupportUrl() {
    if (stores.serverEnvironment && stores.serverEnvironment.state.support_url) {
      return stores.serverEnvironment.state.support_url + REST_SERVICES_SUPPORT_URL;
    }
  }

  renderModalButton() {
    return (
      <bem.KoboButton
        m='blue'
        onClick={this.openNewRESTServiceModal}
      >
        {('Register a New Service')}
      </bem.KoboButton>
    );
  }

  renderEmptyView() {
    return (
      <bem.FormView m={'form-settings'} className='rest-services rest-services--empty'>
        <bem.EmptyContent>
          <bem.EmptyContent__icon className='k-icon-data-sync' />

          <bem.EmptyContent__title>
            {("This project doesn't have any REST Services yet!")}
          </bem.EmptyContent__title>

          <bem.EmptyContent__message>
            {('You can use REST Services to automatically post submissions to a third-party application.')}
            &nbsp;
            <a href={this.getSupportUrl()} target='_blank'>{('Learn more')}</a>
          </bem.EmptyContent__message>

          {this.renderModalButton()}
        </bem.EmptyContent>
      </bem.FormView>
    );
  }

  renderListView() {
    return (
      <bem.FormView m={'form-settings'} className='rest-services'>
        <bem.FormView__cell m='rest-services-list'>
          <header className='rest-services-list__header'>
            <h2 className='rest-services-list__header-label'>
              {('REST Services: ##number##').replace('##number##', this.state.hooks.length)}
            </h2>

            <a
              className='rest-services-list__header-help-link rest-services-list__header-right'
              href={this.getSupportUrl()}
              target='_blank'
            >
              <i className='k-icon k-icon-help' />
              {('Need help?')}
            </a>
          </header>

          <bem.FormView__cell m={['box']}>
            <bem.ServiceRow m='header'>
              <bem.ServiceRow__column m='name'>{('Service Name')}</bem.ServiceRow__column>
              <bem.ServiceRow__column m='count'>{('Success')}</bem.ServiceRow__column>
              <bem.ServiceRow__column m='count'>{('Pending')}</bem.ServiceRow__column>
              <bem.ServiceRow__column m='count'>{('Failed')}</bem.ServiceRow__column>
              <bem.ServiceRow__column m='actions' />
            </bem.ServiceRow>

            {this.state.hooks.map((hook) => {
              const logsUrl = `/#/forms/${this.state.assetUid}/settings/rest/${hook.uid}`;
              return (
                <bem.ServiceRow key={hook.uid} m={hook.active ? 'active' : 'inactive'}>
                  <bem.ServiceRow__linkOverlay href={logsUrl}/>

                  <bem.ServiceRow__column m='name'>{hook.name}</bem.ServiceRow__column>

                  <bem.ServiceRow__column m='count'>{hook.success_count}</bem.ServiceRow__column>

                  <bem.ServiceRow__column m='count'>{hook.pending_count}</bem.ServiceRow__column>

                  <bem.ServiceRow__column m='count'>{hook.failed_count}</bem.ServiceRow__column>

                  <bem.ServiceRow__column m='actions'>
                    <bem.ServiceRow__actionButton
                      onClick={this.editHook}
                      data-hook-uid={hook.uid}
                      data-tip={('Edit')}
                    >
                      <i className='k-icon-edit' />
                    </bem.ServiceRow__actionButton>

                    <bem.ServiceRow__actionButton
                      onClick={this.deleteHookSafe.bind(this)}
                      data-hook-name={hook.name}
                      data-hook-uid={hook.uid}
                      data-tip={('Delete')}
                    >
                      <i className='k-icon-trash' />
                    </bem.ServiceRow__actionButton>
                  </bem.ServiceRow__column>
                </bem.ServiceRow>
              );
            })}
          </bem.FormView__cell>
        </bem.FormView__cell>

        {this.renderModalButton()}
      </bem.FormView>
    );
  }

  render() {
    if (this.state.isLoadingHooks) {
      return (
        <bem.Loading>
          <bem.Loading__inner>
            <i />
            {('loading...')}
          </bem.Loading__inner>
        </bem.Loading>
      )
    } else if (this.state.hooks.length === 0) {
      return this.renderEmptyView();
    } else {
      return this.renderListView();
    }
  }
}

reactMixin(RESTServicesList.prototype, Reflux.ListenerMixin);
