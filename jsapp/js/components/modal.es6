/**
 * Custom modal component for displaying complex modals.
 *
 * It allows for displaying single modal at a time, as there is only single
 * modal element with adjustable title content.
 *
 * To display a modal, you need to use `pageState` store with `showModal` method:
 *
 * ```
 * stores.pageState.showModal({
 *   type: MODAL_TYPES.NEW_FORM
 * });
 * ```
 *
 * Each modal type uses different props, you can add them in the above object.
 *
 * There are also two other important methods: `hideModal` and `switchModal`.
 */

import React from 'react';
import reactMixin from 'react-mixin';
import autoBind from 'react-autobind';
import Reflux from 'reflux';
import alertify from 'alertifyjs';
import {actions} from '../actions';
import {bem} from '../bem';
import ui from '../ui';
import {stores} from '../stores';
import {
  PROJECT_SETTINGS_CONTEXTS,
  MODAL_TYPES,
  ASSET_TYPES
} from 'js/constants';
import {AssetTagsForm} from './modalForms/assetTagsForm';
import {LibraryAssetForm} from './modalForms/libraryAssetForm';
import LibraryNewItemForm from './modalForms/libraryNewItemForm';
import LibraryUploadForm from './modalForms/libraryUploadForm';
import EncryptForm from './modalForms/encryptForm.es6';
import BulkEditSubmissionsForm from './modalForms/bulkEditSubmissionsForm.es6';
import ProjectSettings from './modalForms/projectSettings';
import RESTServicesForm from './RESTServices/RESTServicesForm';
import SharingForm from './permissions/sharingForm';
import Submission from './modalForms/submission';
import TableColumnFilter from './modalForms/tableColumnFilter';
import TranslationSettings from './modalForms/translationSettings';
import TranslationTable from './modalForms/translationTable';

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enketopreviewlink: false,
      error: false,
      modalClass: false
    };
    autoBind(this);
  }
  componentDidMount () {
    var type = this.props.params.type;
    switch(type) {
      case MODAL_TYPES.SHARING:
        this.setModalTitle(('Sharing Permissions'));
        break;

      case MODAL_TYPES.UPLOADING_XLS:
        var filename = this.props.params.filename || '';
        this.setState({
          title: ('Uploading XLS file'),
          message: ('Uploading: ') + filename
        });
        break;

      case MODAL_TYPES.NEW_FORM:
        // title is set by formEditors
        break;

      case MODAL_TYPES.LIBRARY_NEW_ITEM:
        this.setModalTitle(('Create Library Item'));
        break;

      case MODAL_TYPES.LIBRARY_TEMPLATE:
        this.setModalTitle(('Template details'));
        break;

      case MODAL_TYPES.LIBRARY_COLLECTION:
        this.setModalTitle(('Collection details'));
        break;

      case MODAL_TYPES.ASSET_TAGS:
        this.setModalTitle(('Edit tags'));
        break;

      case MODAL_TYPES.LIBRARY_UPLOAD:
        this.setModalTitle(('Upload file'));
        break;

      case MODAL_TYPES.ENKETO_PREVIEW:
        const uid = this.props.params.assetid || this.props.params.uid;
        stores.allAssets.whenLoaded(uid, function(asset){
          actions.resources.createSnapshot({
            asset: asset.url,
          });
        });
        this.listenTo(stores.snapshots, this.enketoSnapshotCreation);

        this.setState({
          title: ('Form Preview'),
          modalClass: 'modal--large'
        });
        break;

      case MODAL_TYPES.SUBMISSION:
        this.setState({
          title: this.submissionTitle(this.props),
          modalClass: 'modal--large modal-submission',
          sid: this.props.params.sid,
        });
      break;

      case MODAL_TYPES.REST_SERVICES:
        if (this.props.params.hookUid) {
          this.setState({title: ('Edit REST Service')});
        } else {
          this.setState({title: ('New REST Service')});
        }
        break;

      case MODAL_TYPES.REPLACE_PROJECT:
        // title is set by formEditors
        break;

      case MODAL_TYPES.TABLE_COLUMNS:
        this.setModalTitle(('Table display options'));
        break;

      case MODAL_TYPES.FORM_LANGUAGES:
        this.setModalTitle(('Manage Languages'));
        break;

      case MODAL_TYPES.FORM_TRANSLATIONS_TABLE:
        this.setState({
          title: ('Translations Table'),
          modalClass: 'modal--large'
        });
        break;

      case MODAL_TYPES.ENCRYPT_FORM:
        this.setModalTitle(('Manage Form Encryption'));
        break;

      case MODAL_TYPES.BULK_EDIT_SUBMISSIONS:
        // title is set by BulkEditSubmissionsForm
        this.setState({
          modalClass: 'modal--large modal--large-shorter'
        });
        break;

      default:
        console.error(`Unknown modal type: "${type}"!`);
    }
  }
  setModalTitle(title) {
    this.setState({title: title});
  }
  enketoSnapshotCreation (data) {
    if (data.success) {
      this.setState({
        enketopreviewlink: data.enketopreviewlink
      });
    } else {
      this.setState({
        message: data.error,
        error: true
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.sid) {
      this.setState({
        title: this.submissionTitle(nextProps),
        sid: nextProps.params.sid
      });
    }

    if (this.props.params.type != nextProps.params.type && nextProps.params.type === MODAL_TYPES.UPLOADING_XLS) {
      var filename = nextProps.params.filename || '';
      this.setState({
        title: ('Uploading XLS file'),
        message: ('Uploading: ') + filename
      });
    }
    if (nextProps.params && !nextProps.params.sid) {
      this.setState({ sid: false });
    }
  }
  submissionTitle(props) {
    let title = ('Success!'),
      p = props.params,
      sid = parseInt(p.sid);

    if (!p.isDuplicated) {
      title = ('Submission Record');
      if (p.tableInfo) {
        let index = p.ids.indexOf(sid) + (p.tableInfo.pageSize * p.tableInfo.currentPage) + 1;
        title = `${('Submission Record')} (${index} ${('of')} ${p.tableInfo.resultsTotal})`;
      } else {
        let index = p.ids.indexOf(sid);
        if (p.ids.length === 1) {
            title = `${('Submission Record')}`;
        } else {
            title = `${('Submission Record')} (${index} ${('of')} ${p.ids.length})`;
        }
      }
    }


    return title;
  }
  displaySafeCloseConfirm(title, message) {
    const dialog = alertify.dialog('confirm');
    const opts = {
      title: title,
      message: message,
      labels: {ok: ('Close'), cancel: ('Cancel')},
      onok: stores.pageState.hideModal,
      oncancel: dialog.destroy
    };
    dialog.set(opts).show();
  }
  onModalClose() {
    if (
      this.props.params.type === MODAL_TYPES.FORM_TRANSLATIONS_TABLE &&
      stores.translations.state.isTranslationTableUnsaved
    ) {
      this.displaySafeCloseConfirm(
        ('Close Translations Table?'),
        ('You will lose all unsaved changes.')
      );
    } else {
      stores.pageState.hideModal();
    }
  }
  render() {
    const uid = this.props.params.assetid || this.props.params.uid;

    return (
      <ui.Modal
        open
        onClose={this.onModalClose}
        title={this.state.title}
        className={this.state.modalClass}
        isDuplicated={this.props.params.isDuplicated}
      >
        <ui.Modal.Body>
            { this.props.params.type === MODAL_TYPES.SHARING &&
              <SharingForm uid={uid} />
            }
            { this.props.params.type === MODAL_TYPES.NEW_FORM &&
              <ProjectSettings
                context={PROJECT_SETTINGS_CONTEXTS.NEW}
                onSetModalTitle={this.setModalTitle}
              />
            }
            { this.props.params.type === MODAL_TYPES.LIBRARY_NEW_ITEM &&
              <LibraryNewItemForm
                onSetModalTitle={this.setModalTitle}
              />
            }
            { this.props.params.type === MODAL_TYPES.LIBRARY_TEMPLATE &&
              <LibraryAssetForm
                asset={this.props.params.asset}
                assetType={ASSET_TYPES.template.id}
                onSetModalTitle={this.setModalTitle}
              />
            }
            { this.props.params.type === MODAL_TYPES.LIBRARY_COLLECTION &&
              <LibraryAssetForm
                asset={this.props.params.asset}
                assetType={ASSET_TYPES.collection.id}
                onSetModalTitle={this.setModalTitle}
              />
            }
            { this.props.params.type === MODAL_TYPES.ASSET_TAGS &&
              <AssetTagsForm
                asset={this.props.params.asset}
              />
            }
            { this.props.params.type === MODAL_TYPES.LIBRARY_UPLOAD &&
              <LibraryUploadForm
                onSetModalTitle={this.setModalTitle}
              />
            }
            { this.props.params.type === MODAL_TYPES.REPLACE_PROJECT &&
              <ProjectSettings
                context={PROJECT_SETTINGS_CONTEXTS.REPLACE}
                onSetModalTitle={this.setModalTitle}
                formAsset={this.props.params.asset}
              />
            }
            { this.props.params.type === MODAL_TYPES.ENKETO_PREVIEW && this.state.enketopreviewlink &&
              <div className='enketo-holder'>
                <iframe src={this.state.enketopreviewlink} />
              </div>
            }
            { this.props.params.type === MODAL_TYPES.ENKETO_PREVIEW && !this.state.enketopreviewlink &&
              <bem.Loading>
                <bem.Loading__inner>
                  <i />
                  {('loading...')}
                </bem.Loading__inner>
              </bem.Loading>
            }
            { this.props.params.type === MODAL_TYPES.ENKETO_PREVIEW && this.state.error &&
              <div>
                {this.state.message}
              </div>
            }
            { this.props.params.type === MODAL_TYPES.UPLOADING_XLS &&
              <div>
                <bem.Loading>
                  <bem.Loading__inner>
                    <i />
                    <bem.Loading__msg>{this.state.message}</bem.Loading__msg>
                  </bem.Loading__inner>
                </bem.Loading>
              </div>
            }
            { this.props.params.type === MODAL_TYPES.SUBMISSION && this.state.sid &&
              <Submission sid={this.state.sid}
                          asset={this.props.params.asset}
                          ids={this.props.params.ids}
                          isDuplicated={this.props.params.isDuplicated}
                          duplicatedSubmission={this.props.params.duplicatedSubmission}
                          tableInfo={this.props.params.tableInfo || false} />
            }
            { this.props.params.type === MODAL_TYPES.SUBMISSION && !this.state.sid &&
              <div>
                <bem.Loading>
                  <bem.Loading__inner>
                    <i />
                  </bem.Loading__inner>
                </bem.Loading>
              </div>
            }
            { this.props.params.type === MODAL_TYPES.TABLE_COLUMNS &&
              <TableColumnFilter asset={this.props.params.asset}
                                 columns={this.props.params.columns}
                                 getColumnLabel={this.props.params.getColumnLabel}
                                 overrideLabelsAndGroups={this.props.params.overrideLabelsAndGroups} />
            }
            { this.props.params.type === MODAL_TYPES.REST_SERVICES &&
              <RESTServicesForm
                assetUid={this.props.params.assetUid}
                hookUid={this.props.params.hookUid}
              />
            }
            { this.props.params.type === MODAL_TYPES.FORM_LANGUAGES &&
              <TranslationSettings
                asset={this.props.params.asset}
                assetUid={this.props.params.assetUid}
              />
            }
            { this.props.params.type === MODAL_TYPES.FORM_TRANSLATIONS_TABLE &&
              <TranslationTable
                asset={this.props.params.asset}
                langString={this.props.params.langString}
                langIndex={this.props.params.langIndex}
              />
            }
            { this.props.params.type === MODAL_TYPES.ENCRYPT_FORM &&
              <EncryptForm
                asset={this.props.params.asset}
                assetUid={this.props.params.assetUid}
              />
            }
            { this.props.params.type === MODAL_TYPES.BULK_EDIT_SUBMISSIONS &&
              <BulkEditSubmissionsForm
                onSetModalTitle={this.setModalTitle}
                onModalClose={this.onModalClose}
                asset={this.props.params.asset}
                {...this.props.params}
              />
            }
        </ui.Modal.Body>
      </ui.Modal>
    );
  }
}

reactMixin(Modal.prototype, Reflux.ListenerMixin);

export default Modal;
