import React, { Component } from 'react';
import { Form, Input, Modal, Icon, message, Upload, InputNumber, Select } from 'antd'
import { json } from '../../utils/ajax'
import { connect } from 'react-redux'
import { isAuthenticated, authenticateSuccess } from '../../utils/session'
const { TextArea } = Input;
const { Option } = Select;

const store = connect(
    (state) => ({ user: state.user })
)

@store @Form.create()
class UpdateModal extends Component {
    state = {
        uploading: false
    }
    onCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    onOk = () => {
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (!errors) {
                this.onUpdate(values)
            }
        })
    }
    onUpdate = async (values) => {
        const value = {
            ...values,
            id: this.props.presentInfo.id
        }
        console.log('update', value)
        const res = await json.post('/presents/updatePresent', value)
        if (res.status === 0) {
            message.success(`修改礼物成功`)
            this.props.onUpdated()  //更新外面的数据
            this.onCancel()
        }
    }
    /**
    * 转换上传组件表单的值
    */
    _normFile = (e) => {
        if (e.file.response && e.file.response.data) {
            return e.file.response.data.url
        } else {
            return ''
        }
    }
    render() {
        const { uploading } = this.state
        const { presentInfo } = this.props
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        const { getFieldDecorator, getFieldValue } = this.props.form

        const presentAvatar = getFieldValue('presentAvatar')
        const uploadProps = {
            name: "presentAvatar",
            listType: "picture-card",
            headers: {
                Authorization: `Bearer ${isAuthenticated()}`,
            },
            action: `${process.env.REACT_APP_BASE_URL}/upload?isImg=1`,
            showUploadList: false,
            accept: "image/*",
            onChange: (info) => {
                if (info.file.status !== 'uploading') {
                    this.setState({
                        uploading: true
                    })
                }
                if (info.file.status === 'done') {
                    this.setState({
                        uploading: false
                    })
                    message.success('上传头像成功')
                } else if (info.file.status === 'error') {
                    this.setState({
                        uploading: false
                    })
                    message.error(info.file.response.message || '上传头像失败')
                }
            }
        }
        const presentTypes = ['食物', '饮品', '电子产品', '书籍', '点券', '作者的嘿嘿嘿']
        const presentTypeOptions = []
        presentTypes.forEach((element, index) => {
            presentTypeOptions.push(
                <Option key={element} value={element}>
                    {element}
                </Option>
            )
        })
        return (
            <Modal
                visible={this.props.visible}
                title='新增礼物'
                centered
                onCancel={this.onCancel}
                okButtonProps={{ disabled: !this.props.user.isAdmin && !this.props.isAnchor }}
                onOk={this.onOk}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={'礼物名称'}>
                        {getFieldDecorator('presentName', {
                            initialValue: presentInfo.presentName,
                            rules: [
                                { required: true, message: '请输入礼物名称' },
                            ]
                        })(
                            <Input placeholder='请输入礼物名称' />
                        )}
                    </Form.Item>
                    <Form.Item label={'礼物描述'}>
                        {getFieldDecorator('presentDesc', {
                            initialValue: presentInfo.presentDesc,
                            rules: [
                                { required: true, message: '请输入礼物描述' },
                            ]
                        })(
                            <TextArea placeholder='请输入礼物描述' />
                        )}
                    </Form.Item>
                    <Form.Item label={'礼物图片'} {...formItemLayout}>
                        {getFieldDecorator('presentAvatar', {
                            initialValue: presentInfo.presentAvatar,
                            rules: [{ required: true, message: '请上传直播间封面' }],
                            getValueFromEvent: this._normFile,     //将上传的结果作为表单项的值（用normalize报错了，所以用的这个属性）
                        })(
                            <Upload {...uploadProps} style={styles.avatarUploader}>
                                {getFieldValue('presentAvatar') ? <img src={getFieldValue('presentAvatar')} alt="presentAvatar" style={styles.presentAvatar} /> : <Icon style={styles.icon} type={uploading ? 'loading' : 'plus'} />}
                            </Upload>
                        )}
                    </Form.Item>
                    <Form.Item label={'礼物种类'}>
                        {getFieldDecorator('presentType', {
                            initialValue: presentInfo.presentType,
                            rules: [
                                { required: true, message: '请输入礼物种类' },
                            ]
                        })(
                            <Select
                                showSearch
                                style={{ width: 150 }}
                                placeholder="请选择"
                            >
                                {presentTypeOptions}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label={'礼物数量'} >
                        {getFieldDecorator('presentCounts', {
                            initialValue: presentInfo.presentCounts,
                            rules: [
                                { required: true, message: '请输入礼物数量' },
                            ]
                        })(
                            <InputNumber placeholder='1' min={1} max={10000} />
                        )}
                    </Form.Item>
                    <Form.Item label={'单品积分'}>
                        {getFieldDecorator('presentValue', {
                            initialValue: presentInfo.presentValue,
                            rules: [
                                { required: true, message: '请输入单品积分' },
                            ]
                        })(
                            <InputNumber placeholder='10' min={1} max={100000} />
                        )}
                    </Form.Item>
                </Form>

            </Modal>
        );
    }
}

const styles = {
    avatarUploader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        height: 150,
        backgroundColor: '#fff'
    },
    icon: {
        fontSize: 28,
        color: '#999'
    },
    presentAvatar: {
        maxWidth: '100%',
        maxHeight: '100%',
    },
}

export default UpdateModal;