import React from "react";
import PropTypes from "prop-types";
import reactMixin from "react-mixin";
import autoBind from "react-autobind";
import Reflux from "reflux";
import DocumentTitle from "react-document-title";
import Dropzone from "react-dropzone";
import { validFileTypes } from "utils";
import mixins from "js/mixins";
import { bem } from "js/bem";
import usersStore from "./usersStore";
import UsersTable from './usersTable';

import { ROOT_BREADCRUMBS,
  USERS_TABLE_CONTEXTS, } from "./usersConstants";

class usersRoute extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getFreshState();
    this.unlisteners = [];
    autoBind(this);
  }

  getFreshState() {
    return {
      isLoading: usersStore.data.isFetchingData,
      users: usersStore.data.users,
      metadata: usersStore.data.metadata,
      totalUsers: usersStore.data.totalSearchAssets,
      orderColumnId: usersStore.data.orderColumnId,
      orderValue: usersStore.data.orderValue,
      filterColumnId: usersStore.data.filterColumnId,
      filterValue: usersStore.data.filterValue,
      currentPage: usersStore.data.currentPage,
      totalPages: usersStore.data.totalPages,
    };
  }

  componentDidMount() {
    this.unlisteners.push(usersStore.listen(this.usersStoreChanged));
  }

  componentWillUnmount() {
    this.unlisteners.forEach((clb) => {
      clb();
    });
  }

  usersStoreChanged() {
    this.setState(this.getFreshState());
  }

  onUsersTableOrderChange(orderColumnId, orderValue) {
    usersStore.setOrder(orderColumnId, orderValue);
  }

  onUsersTableFilterChange(filterColumnId, filterValue) {
    usersStore.setFilter(filterColumnId, filterValue);
  }

  onUsersTableSwitchPage(pageNumber) {
    usersStore.setCurrentPage(pageNumber);
  }

  render() {
    let contextualEmptyMessage = t("Your search returned no results.");

    // console.table(this.state.users);

    if (usersStore.data.totalUsers === 0) {
      contextualEmptyMessage = (
        <div>
          {t(
            "Let's get started by creating your first users. Click the New User to create it."
          )}
        </div>
      );
    }

    return (
      <DocumentTitle title={`${t("Users")} | Nexus Forms`}>
        <Dropzone
          onDrop={this.dropFiles}
          disableClick
          multiple
          className="dropzone"
          activeClassName="dropzone--active"
          accept={validFileTypes()}
        >
          <bem.Breadcrumbs m="gray-wrapper">
            <bem.Breadcrumbs__crumb>
              {ROOT_BREADCRUMBS.USERS.label}
            </bem.Breadcrumbs__crumb>
          </bem.Breadcrumbs>
          
          <UsersTable
            context={USERS_TABLE_CONTEXTS.MY_USERS}
            isLoading={this.state.isLoading}
            users={this.state.users}
            totalUsers={this.state.totalUsers}
            metadata={this.state.metadata}
            orderColumnId={this.state.orderColumnId}
            orderValue={this.state.orderValue}
            onOrderChange={this.onUsersTableOrderChange.bind(this)}
            filterColumnId={this.state.filterColumnId}
            filterValue={this.state.filterValue}
            onFilterChange={this.onUsersTableFilterChange.bind(this)}
            currentPage={this.state.currentPage}
            totalPages={this.state.totalPages}
            onSwitchPage={this.onUsersTableSwitchPage.bind(this)}
            emptyMessage={contextualEmptyMessage}
          />

          <div className="dropzone-active-overlay">
            <i className="k-icon k-icon-upload" />
            {t("Drop files to upload")}
          </div>
        </Dropzone>
      </DocumentTitle>
    );
  }
}

usersRoute.contextTypes = {
  router: PropTypes.object,
};

reactMixin(usersRoute.prototype, mixins.droppable);
reactMixin(usersRoute.prototype, Reflux.ListenerMixin);

export default usersRoute;
