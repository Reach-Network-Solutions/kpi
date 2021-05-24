import React from 'react';
import autoBind from 'react-autobind';
import {bem} from 'js/bem';
// import AssetActionButtons from './assetActionButtons';
import ui from 'js/ui';
import {formatTime} from 'utils';
import {ASSET_TYPES} from 'js/constants';
import assetUtils from 'js/assetUtils';
import {USERS_TABLE_CONTEXTS} from 'js/components/library/libraryConstants';


class UsersTableRow extends React.Component {
  constructor(props){
    super(props);
    autoBind(this);
  }

  render() {
    let iconClassName = '';
    if (this.props.user) {
      iconClassName = assetUtils.getAssetIcon(this.props.user);
    }

    return (
      <bem.UsersTableRow m={['user', `type-`]}>
        <bem.UsersTableRow__link href={`#/library/asset/${this.props.user.user_id}`}/>

        {/* <bem.UsersTableRow__buttons>
          <AssetActionButtons asset={this.props.user}/>
        </bem.UsersTableRow__buttons> */}

        <bem.UsersTableRow__column m='username'>
        <p>{this.props.user.username}</p>
        </bem.UsersTableRow__column>

        <bem.UsersTableRow__column m='firstname'>
          {/* <ui.AssetName {...this.props.user.username}/> */}
          <p>{this.props.user.first_name}</p>

          
        </bem.UsersTableRow__column>

        <bem.UsersTableRow__column m='lastname'>
          {/* {assetUtils.getAssetOwnerDisplayName(this.props.user.owner__username)} */}
          <p>{this.props.user.last_name}</p>
        </bem.UsersTableRow__column>
        

        <bem.UsersTableRow__column m='status'>
          {/* {formatTime(this.props.user.date_modified)} */}
          <p>{(this.props.user.is_active === true)? 'Active' : 'Inactive'}</p>
        </bem.UsersTableRow__column>
      </bem.UsersTableRow>
    );
  }
}

export default UsersTableRow;
