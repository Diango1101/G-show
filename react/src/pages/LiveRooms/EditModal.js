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
class EditModal extends Component {
    state = {
        uploading: false,
        room: []
    }
    async componentDidMount() {
        await this.getCollection()
        console.log('待编辑直播间', this.state.room)
    }
    getCollection = async () => {
        let username = this.props.username
        const res = await json.get(`/liverooms/${username}/OnesLiveRoom`)
        this.setState({
            room: res.data || [],
        })

    }
    onCancel = () => {
        // this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    onOk = () => {
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (!errors) {
                this.onEdit(values)
            }
        })
    }
    onEdit = async (values) => {
        const value = {
            room: {
                ...values,
                author: this.state.room.author
            }

        }
        console.log('ediit', value)
        const res = await json.post('/liverooms/updateRoom', value)
        if (res.status === 0) {
            this.props.onEdited()  //更新外面的数据
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
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { title, description } = this.state.room
        const Initalavatar = this.state.room.roomavatar

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
                    message.success('上传头像成功')
                } else if (info.file.status === 'error') {
                    this.setState({
                        uploading: false
                    })
                    message.error(info.file.response.message || '上传头像失败')
                }
            }
        }
        return (
            <Modal
                visible={this.props.visible}
                title='修改个人直播间信息'
                centered
                onCancel={this.onCancel}
                okButtonProps={{ disabled: !this.props.user.isAdmin && !this.props.isAnchor }}
                onOk={this.onOk}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={'直播间名称'}>
                        {getFieldDecorator('title', {
                            initialValue: title,
                            rules: [
                                { required: true, message: '请输入直播间名称' },
                            ]
                        })(
                            <Input placeholder='请输入直播间名称' />
                        )}
                    </Form.Item>
                    <Form.Item label={'直播间描述'}>
                        {getFieldDecorator('description', {
                            initialValue: description,
                            rules: [
                                { required: true, message: '直播间描述' },
                            ]
                        })(
                            <TextArea placeholder='直播间描述' />
                        )}
                    </Form.Item>
                    <Form.Item label={'直播间封面'} {...formItemLayout}>
                        {getFieldDecorator('roomavatar', {
                            initialValue: Initalavatar,
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

export default EditModal;