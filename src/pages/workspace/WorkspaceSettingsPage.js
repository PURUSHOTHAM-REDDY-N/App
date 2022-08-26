import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import * as Policy from '../../libs/actions/Policy';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import AvatarWithImagePicker from '../../components/AvatarWithImagePicker';
import defaultTheme from '../../styles/themes/default';
import CONST from '../../CONST';
import Picker from '../../components/Picker';
import TextInput from '../../components/TextInput';
import FixedFooter from '../../components/FixedFooter';
import WorkspacePageWithSections from './WorkspacePageWithSections';
import withFullPolicy, {fullPolicyPropTypes, fullPolicyDefaultProps} from './withFullPolicy';
import {withNetwork} from '../../components/OnyxProvider';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';

const propTypes = {
    ...fullPolicyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    ...fullPolicyDefaultProps,
};

class WorkspaceSettingsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.policy.name,
            previewAvatarURL: props.policy.avatarURL,
            currency: props.policy.outputCurrency,
        };

        this.submit = this.submit.bind(this);
        this.uploadAvatar = this.uploadAvatar.bind(this);
        this.removeAvatar = this.removeAvatar.bind(this);
        this.getCurrencyItems = this.getCurrencyItems.bind(this);
        this.validate = this.validate.bind(this);
    }

    /**
     * @returns {Object[]}
     */
    getCurrencyItems() {
        const currencyListKeys = _.keys(this.props.currencyList);
        return _.map(currencyListKeys, currencyCode => ({
            value: currencyCode,
            label: `${currencyCode} - ${this.props.currencyList[currencyCode].symbol}`,
        }));
    }

    removeAvatar() {
        this.setState({previewAvatarURL: ''});
        Policy.deleteWorkspaceAvatar(this.props.policy.id);
    }

    /**
     * @param {Object} image
     * @param {String} image.uri
     */
    uploadAvatar(image) {
        if (this.props.policy.isAvatarUploading) {
            return;
        }
        this.setState({previewAvatarURL: image.uri});
        Policy.uploadAvatar(this.props.policy.id, image);
    }

    submit() {
        if (this.props.policy.isPolicyUpdating || !this.validate()) {
            return;
        }
        const name = this.state.name.trim();
        const outputCurrency = this.state.currency;
        Policy.updateWorkspaceGeneralSettings(this.props.policy.id, name, outputCurrency);
    }

    validate() {
        const errors = {};
        if (!this.state.name.trim().length) {
            errors.nameError = true;
        }
        return _.size(errors) === 0;
    }

    render() {
        return (
            <FullPageNotFoundView shouldShow={_.isEmpty(this.props.policy)}>
                <WorkspacePageWithSections
                    headerText={this.props.translate('workspace.common.settings')}
                    route={this.props.route}
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_SETTINGS}
                    footer={(
                        <FixedFooter style={[styles.w100]}>
                            <OfflineWithFeedback
                                errors={lodashGet(this.props.policy, 'errorFields.generalSettings')}
                                onClose={() => Policy.clearWorkspaceGeneralSettingsErrors(this.props.policy.id)}
                            >
                                <Button
                                    success
                                    isLoading={this.props.policy.isPolicyUpdating}
                                    text={this.props.translate('workspace.editor.save')}
                                    onPress={this.submit}
                                    pressOnEnter
                                />
                            </OfflineWithFeedback>
                        </FixedFooter>
                    )}
                >
                    {hasVBA => (
                        <View style={[styles.pageWrapper, styles.flex1, styles.alignItemsStretch]}>
                            <OfflineWithFeedback
                                pendingAction={lodashGet(this.props.policy, 'pendingFields.avatarURL', null)}
                                errors={lodashGet(this.props.policy, 'errorFields.avatarURL', null)}
                                onClose={() => Policy.clearAvatarErrors(this.props.policy.id)}
                            >
                                <AvatarWithImagePicker
                                    isUploading={this.props.policy.isAvatarUploading}
                                    avatarURL={this.state.previewAvatarURL}
                                    size={CONST.AVATAR_SIZE.LARGE}
                                    DefaultAvatar={() => (
                                        <Icon
                                            src={Expensicons.Workspace}
                                            height={80}
                                            width={80}
                                            fill={defaultTheme.iconSuccessFill}
                                        />
                                    )}
                                    fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                    style={[styles.mb3]}
                                    anchorPosition={{top: 172, right: 18}}
                                    isUsingDefaultAvatar={!this.state.previewAvatarURL}
                                    onImageSelected={this.uploadAvatar}
                                    onImageRemoved={this.removeAvatar}
                                />
                            </OfflineWithFeedback>
                            <OfflineWithFeedback
                                pendingAction={lodashGet(this.props.policy, 'pendingFields.generalSettings')}
                            >
                                <TextInput
                                    label={this.props.translate('workspace.editor.nameInputLabel')}
                                    containerStyles={[styles.mt4]}
                                    onChangeText={name => this.setState({name})}
                                    value={this.state.name}
                                    hasError={!this.state.name.trim().length}
                                    errorText={this.state.name.trim().length ? '' : this.props.translate('workspace.editor.nameIsRequiredError')}
                                />
                                <View style={[styles.mt4]}>
                                    <Picker
                                        label={this.props.translate('workspace.editor.currencyInputLabel')}
                                        onInputChange={currency => this.setState({currency})}
                                        items={this.getCurrencyItems()}
                                        value={this.state.currency}
                                        isDisabled={hasVBA}
                                    />
                                </View>
                                <Text style={[styles.textLabel, styles.colorMuted, styles.mt2]}>
                                    {this.props.translate('workspace.editor.currencyInputHelpText')}
                                </Text>
                            </OfflineWithFeedback>
                        </View>
                    )}
                </WorkspacePageWithSections>
            </FullPageNotFoundView>
        );
    }
}

WorkspaceSettingsPage.propTypes = propTypes;
WorkspaceSettingsPage.defaultProps = defaultProps;

export default compose(
    withFullPolicy,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
    withLocalize,
    withNetwork(),
)(WorkspaceSettingsPage);
