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
        <bem.UsersTableRow__link href={`#/library/asset/${this.props.user.uid}`}/>

        {/* <bem.UsersTableRow__buttons>
          <AssetActionButtons asset={this.props.user}/>
        </bem.UsersTableRow__buttons> */}

        <bem.UsersTableRow__column m='username'>
        <p>{this.props.user.username}</p>
        </bem.UsersTableRow__column>

        <bem.UsersTableRow__column m='name'>
          {/* <ui.AssetName {...this.props.user.username}/> */}
          <p>{this.props.user.username}</p>

          
        </bem.UsersTableRow__column>

        <bem.UsersTableRow__column m='organisation'>
          {/* {assetUtils.getAssetOwnerDisplayName(this.props.user.owner__username)} */}
          <p>organisation</p>
        </bem.UsersTableRow__column>

        <bem.UsersTableRow__column m='country'>
          {/* {assetUtils.getLanguagesDisplayString(this.props.user)} */}
          <p>country</p>
        </bem.UsersTableRow__column>

        
          <bem.UsersTableRow__column m='primary-sector'>
            {/* {assetUtils.getSectorDisplayString(this.props.user)} */}
            <p>sector</p>
          </bem.UsersTableRow__column>
        

        <bem.UsersTableRow__column m='status'>
          {/* {formatTime(this.props.user.date_modified)} */}
          <p>status</p>
        </bem.UsersTableRow__column>
      </bem.UsersTableRow>
    );
  }
}

export default UsersTableRow;
