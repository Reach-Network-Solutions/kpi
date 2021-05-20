import React from "react";
import ReactDOM from "react-dom";
import autoBind from "react-autobind";
import ui from "js/ui";
import { bem } from "js/bem";
import { hasVerticalScrollbar, getScrollbarWidth } from "utils";
import UsersTableRow from "./usersTableRow";
import { renderLoading } from "js/components/modalForms/modalHelpers";
import {
  USERS_TABLE_CONTEXTS,
  ORDER_DIRECTIONS,
  USERS_TABLE_COLUMNS,
} from "js/components/users/usersConstants";

export default class UsersTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldHidePopover: false,
      isPopoverVisible: false,
      scrollbarWidth: null,
      isFullscreen: false,
    };
    this.bodyRef = React.createRef();
    autoBind(this);
  }

  componentDidMount() {
    this.updateScrollbarWidth();
    window.addEventListener("resize", this.updateScrollbarWidth);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScrollbarWidth);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isLoading !== this.props.isLoading) {
      this.updateScrollbarWidth();
    }
  }

  toggleFullscreen() {
    this.setState({ isFullscreen: !this.state.isFullscreen });
  }

  updateScrollbarWidth() {
    if (
      this.bodyRef &&
      this.bodyRef.current &&
      hasVerticalScrollbar(ReactDOM.findDOMNode(this.bodyRef.current))
    ) {
      this.setState({ scrollbarWidth: getScrollbarWidth() });
    } else {
      this.setState({ scrollbarWidth: null });
    }
  }

  /**
   * @param {number} newPageNumber
   */
  switchPage(newPageNumber) {
    this.props.onSwitchPage(newPageNumber);
  }

  /**
   * This function is only a callback handler, as the asset reordering itself
   * should be handled by the component that is providing the assets list.
   * @param {string} columnId
   */
  onChangeOrder(columnId) {
    if (this.props.orderColumnId === columnId) {
      // clicking already selected column results in switching the order direction
      let newVal;
      if (this.props.orderValue === ORDER_DIRECTIONS.ascending) {
        newVal = ORDER_DIRECTIONS.descending;
      } else if (this.props.orderValue === ORDER_DIRECTIONS.descending) {
        newVal = ORDER_DIRECTIONS.ascending;
      }
      this.props.onOrderChange(this.props.orderColumnId, newVal);
    } else {
      // change column and revert order direction to default
      this.props.onOrderChange(
        columnId,
        USERS_TABLE_COLUMNS[columnId].defaultValue
      );
    }
  }

  /**
   * This function is only a callback handler, as the asset filtering itself
   * should be handled by the component that is providing the assets list.
   * @param {string} columnId
   * @param {string} filterValue
   */
  onChangeFilter(columnId, filterValue) {
    if (
      this.props.filterColumnId === columnId &&
      this.props.filterValue === filterValue
    ) {
      // when clicking already selected item, clear it
      this.props.onFilterChange(null, null);
    } else {
      this.props.onFilterChange(columnId, filterValue);
    }
  }

  onClearFilter(evt) {
    evt.stopPropagation();
    this.props.onFilterChange(null, null);
  }

  renderHeader(columnDef) {
    let displayLabel = columnDef.label;

    return (
      <bem.UsersTableRow__column m={columnDef.id} disabled>
        {displayLabel}
      </bem.UsersTableRow__column>
    );
  }

  onMouseLeave() {
    // force hide popover in next render cycle
    // (ui.PopoverMenu interface handles it this way)
    if (this.state.isPopoverVisible) {
      this.setState({ shouldHidePopover: true });
    }
  }

  onPopoverSetVisible() {
    this.setState({ isPopoverVisible: true });
  }

  /**
   * Safe: returns nothing if pagination properties are not set.
   */
  renderPagination() {
    const hasPagination =
      typeof this.props.currentPage === "number" &&
      typeof this.props.totalPages === "number" &&
      typeof this.props.onSwitchPage === "function";
    const naturalCurrentPage = this.props.currentPage + 1;

    if (hasPagination) {
      return (
        <bem.UsersTablePagination>
          <bem.UsersTablePagination__button
            disabled={this.props.currentPage === 0}
            onClick={this.switchPage.bind(this, this.props.currentPage - 1)}
          >
            <i className="k-icon k-icon-prev" />
            {t("Previous")}
          </bem.UsersTablePagination__button>

          <bem.UsersTablePagination__index>
            {/* we avoid displaying 1/0 as it doesn't make sense to humans */}
            {naturalCurrentPage}/{this.props.totalPages || 1}
          </bem.UsersTablePagination__index>

          <bem.UsersTablePagination__button
            disabled={naturalCurrentPage >= this.props.totalPages}
            onClick={this.switchPage.bind(this, this.props.currentPage + 1)}
          >
            {t("Next")}
            <i className="k-icon k-icon-next" />
          </bem.UsersTablePagination__button>
        </bem.UsersTablePagination>
      );
    } else {
      return null;
    }
  }

  renderFooter() {
    return (
      <bem.UsersTable__footer>
        {this.props.totalUsers !== null && (
          <span>
            {t("##count## items").replace("##count##", this.props.totalusers)}
          </span>
        )}

        {this.renderPagination()}

        {this.props.totalUsers !== null && (
          <button className="mdl-button" onClick={this.toggleFullscreen}>
            {t("Toggle fullscreen")}
            <i className="k-icon k-icon-expand" />
          </button>
        )}
      </bem.UsersTable__footer>
    );
  }

  render() {
    const modifiers = [this.props.context];
    if (this.state.isFullscreen) {
      modifiers.push("fullscreen");
    }

    return (
      <bem.UsersTable m={modifiers}>
        <bem.UsersTable__header>
          <bem.UsersTableRow m="header">
            {this.renderHeader(USERS_TABLE_COLUMNS.username)}
            {this.renderHeader(USERS_TABLE_COLUMNS.name)}
            {this.renderHeader(USERS_TABLE_COLUMNS.organisation)}
            {this.renderHeader(USERS_TABLE_COLUMNS.country)}
            {this.renderHeader(USERS_TABLE_COLUMNS.sector)}
            {this.renderHeader(USERS_TABLE_COLUMNS.status, 'last')}

            {this.state.scrollbarWidth !== 0 &&
              this.state.scrollbarWidth !== null && (
                <div
                  className="assets-table__scrollbar-padding"
                  style={{ width: `${this.state.scrollbarWidth}px` }}
                />
              )}
          </bem.UsersTableRow>
        </bem.UsersTable__header>

        <bem.UsersTable__body ref={this.bodyRef}>
          {this.props.isLoading && renderLoading()}

          {!this.props.isLoading && this.props.users.length === 0 && (
            <bem.UsersTableRow m="empty-message">
              {this.props.emptyMessage || t("There are no users to display.")}
            </bem.UsersTableRow>
          )}

          {!this.props.isLoading && this.props.users.map((user,index) => {
              return (
                <UsersTableRow
                  user={user}
                  key={index}
                  context={this.props.context}
                />
              );
            })}
        </bem.UsersTable__body>

        {this.renderFooter()}
      </bem.UsersTable>
    );
  }
}

/**
 * @callback columnChangeCallback
 * @param {string} columnId
 * @param {string} columnValue
 */

/**
 * @callback switchPageCallback
 * @param {string} pageNumber
 */
