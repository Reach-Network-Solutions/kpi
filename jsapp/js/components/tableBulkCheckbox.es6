import React from 'react';
import autoBind from 'react-autobind';
import {bem} from 'js/bem';
import ui from 'js/ui';
import Checkbox from 'js/components/common/checkbox';

/**
 * @prop visibleRowsCount
 * @prop selectedRowsCount
 * @prop totalRowsCount
 * @prop onSelectAllPages
 * @prop onSelectCurrentPage
 * @prop onClearSelection
 */
class TableBulkCheckbox extends React.Component {
  constructor(props){
    super(props);
    autoBind(this);
  }

  onSelectAllPages() {
    this.props.onSelectAllPages();
  }

  onSelectCurrentPage() {
    this.props.onSelectCurrentPage();
  }

  onToggleCurrentPage() {
    if (this.props.selectedRowsCount === this.props.visibleRowsCount) {
      this.onClearSelection();
    } else {
      this.onSelectCurrentPage();
    }
  }

  onClearSelection() {
    this.props.onClearSelection();
  }

  render() {
    return (
      <div className='table-bulk-checkbox'>
        <Checkbox
          checked={this.props.selectedRowsCount === this.props.visibleRowsCount}
          onChange={this.onToggleCurrentPage}
        />

        <ui.PopoverMenu type='table-bulk-checkbox' triggerLabel='' additionalModifiers={['right']}>
          <bem.PopoverMenu__link onClick={this.onSelectAllPages}>
            {('Select all results (##count##)').replace('##count##', this.props.totalRowsCount)}
          </bem.PopoverMenu__link>

          <bem.PopoverMenu__link onClick={this.onSelectCurrentPage}>
            {('Select visible results (##count##)').replace('##count##', this.props.visibleRowsCount)}
          </bem.PopoverMenu__link>

          <bem.PopoverMenu__link onClick={this.onClearSelection}>
            {('None')}
          </bem.PopoverMenu__link>
        </ui.PopoverMenu>
      </div>
    );
  }
}

export default TableBulkCheckbox;
