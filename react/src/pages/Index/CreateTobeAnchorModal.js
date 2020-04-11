import React, { Component } from 'react';
import { Form, Input, Modal, Icon, message, Upload } from 'antd'
import { json } from '../../utils/ajax'
import { connect } from 'react-redux'
import { isAuthenticated, authenticateSuccess } from '../../utils/session'
const { TextArea } = Input;

const store = connect(
    (state) => ({ user: state.user })
)

@store @Form.create()
class CreateTobeAnchorModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploading: false
        }
    }
    componentDidMount() {
        console.log('userrrr', this.props.user)
    }
    onCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    onOk = () => {
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (!errors) {
                let { title, description, roomavatar, userId, author } = values
                let value = {
                    userid: userId,
                    room: {
                        title: title,
                        description: description,
                        roomavatar: roomavatar,
                        author: author
                    }
                }
                this.onCreate(value)
            }
        })
    }
    onCreate = async (values) => {
        const res = await json.post('/user/tobeAnchor', values)
        if (res.status === 0) {
            message.success('亲爱的用户，申请成功，请等待超管批准哦')
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
        const { user } = this.props
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        const { getFieldDecorator, getFieldValue } = this.props.form

        const roomavatar = getFieldValue('roomavatar')
        const uploadProps = {
            name: "roomavatar",
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
                    message.success('上传房间封面成功')
                } else if (info.file.status === 'error') {
                    this.setState({
                        uploading: false
                    })
                    message.error(info.file.response.message || '上传房间封面失败')
                }
            }
        }
        return (
            <Modal
                visible={this.props.visible}
                title='申请直播间'
                centered
                onCancel={this.onCancel}
                // okButtonProps={{ disabled: !this.props.user.isAdmin && !this.props.isAnchor }}
                onOk={this.onOk}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={'用户Id'}>
                        {getFieldDecorator('userId', {
                            initialValue: user.id,
                            rules: [
                                { required: true, message: '请输入直播间名称' },
                            ]
                        })(
                            <Input disabled={true} placeholder='请输入直播间名称' />
                        )}
                    </Form.Item>
                    <Form.Item label={'直播间名称'}>
                        {getFieldDecorator('title', {
                            rules: [
                                { required: true, message: '请输入直播间名称' },
                            ]
                        })(
                            <Input placeholder='请输入直播间名称' />
                        )}
                    </Form.Item>
                    <Form.Item label={'主播名称'}>
                        {getFieldDecorator('author', {
                            initialValue: user.username,
                            rules: [
                                { required: true, message: '请输入主播名称' },
                            ]
                        })(
                            <Input disabled={true} placeholder='请输入主播名称' />
                        )}
                    </Form.Item>
                    <Form.Item label={'直播间描述'}>
                        {getFieldDecorator('description', {
                            rules: [
                                { required: true, message: '直播间描述' },
                            ]
                        })(
                            <TextArea placeholder='直播间描述' />
                        )}
                    </Form.Item>
                    <Form.Item label={'直播间封面'} {...formItemLayout}>
                        {getFieldDecorator('roomavatar', {
                            rules: [{ required: true, message: '请上传直播间封面' }],
                            getValueFromEvent: this._normFile,     //将上传的结果作为表单项的值（用normalize报错了，所以用的这个属性）
                        })(
                            <Upload {...uploadProps} style={styles.avatarUploader}>
                                {roomavatar ? <img src={roomavatar} alt="roomavatar" style={styles.roomavatar} /> : <Icon style={styles.icon} type={uploading ? 'loading' : 'plus'} />}
                            </Upload>
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
    roomavatar: {
        maxWidth: '100%',
        maxHeight: '100%',
    },
}

export default CreateTobeAnchorModal;