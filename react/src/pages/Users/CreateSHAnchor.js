import React from 'react'
import { Modal, Form, Upload, Icon, message, Input, Alert, Button } from 'antd'
import { isAuthenticated, authenticateSuccess } from '../../utils/session'
import moment from 'moment'
import './style.less'
import { json } from '../../utils/ajax'
import { setUser, initWebSocket } from '../../store/actions'
import { connect, } from 'react-redux'
import { bindActionCreators } from 'redux'
const { TextArea } = Input;



const store = connect(
    (state) => ({ user: state.user, websocket: state.websocket }),
)
// const form = Form.create({
//     /**
//      * 表单回显
//      * @param {*} props 
//      */
//     mapPropsToFields(props) {
//         const user = props.user
//         return createFormField({
//             ...user,
//             birth: user.birth ? moment(user.birth) : null
//         })
//     }
// })

@store @Form.create()
class CreateSHAnchor extends React.Component {
    state = {
        uploading: false
    }
    /**
     * 关闭模态框
     */
    handleCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    /**
     * 模态框的确定按钮
     */
    handleOk = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.authAnchor(values)
            }
        });
    }
    /**
    *  禁止 传值
    */
    handlenotAuth = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.notAuth(values)
            }
        });
    }
    /**
     * 不允许成为主播
     */
    notAuth = async (values) => {
        const { userId, title, description, author, roomavatar } = values
        let value = {
            userid: userId,
        }
        console.log(value)
        const res = await json.post('/user/NotAuthAnchor', value)
        if (res.status === 0) {
            message.success(`已禁止${author}的申请`)
            this.props.getUsers()  //更新外面的数据
            this.handleCancel()

        }
    }
    /**
     * 允许成为主播
     */
    authAnchor = async (values) => {
        const { userId, title, description, author, roomavatar } = values
        let value = {
            userid: userId,
            room: {
                title: title,
                description: description,
                author: author,
                roomavatar: roomavatar
            }
        }
        const res = await json.post('/user/AuthAnchor', value)
        if (res.status === 0) {
            message.success(`已允许${author}成为主播，并开通其直播间${title}`)
            this.props.getUsers()  //更新外面的数据
            this.handleCancel()

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
        const { visible } = this.props
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { userId, title, description, author } = this.props.TobeAnchor
        const Initalavatar = this.props.TobeAnchor.roomavatar
        const roomavatar = this.props.TobeAnchor.roomavatar

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }

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
                onCancel={this.handleCancel}
                onOk={this.handleOk}
                visible={visible}
                centered
                title="待审核直播信息">
                <div style={{ height: '60vh', overflow: 'auto' }}>
                    <Form>
                        <Form.Item label={'直播间封面'} {...formItemLayout}>
                            {getFieldDecorator('roomavatar', {
                                initialValue: Initalavatar,
                                rules: [{ required: true, message: '请上传直播间封面' }],
                                getValueFromEvent: this._normFile,     //将上传的结果作为表单项的值（用normalize报错了，所以用的这个属性）
                            })(
                                <Upload {...uploadProps} style={styles.avatarUploader} disabled={true}>
                                    {roomavatar ? <img src={roomavatar} alt="roomavatar" style={styles.roomavatar} /> : <Icon style={styles.icon} type={uploading ? 'loading' : 'plus'} />}
                                </Upload>
                            )}
                        </Form.Item>

                        <Form.Item label={'直播间名称'}  {...formItemLayout}>
                            {getFieldDecorator('title', {
                                initialValue: title,
                                rules: [
                                    { required: true, message: '请输入直播间名称' },
                                ]
                            })(
                                <Input placeholder='请输入直播间名称' disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label={'直播间描述'}  {...formItemLayout}>
                            {getFieldDecorator('description', {
                                initialValue: description,
                                rules: [
                                    { required: true, message: '直播间描述' },
                                ]
                            })(
                                <TextArea placeholder='直播间描述' disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label={'直播者'}  {...formItemLayout}>
                            {getFieldDecorator('author', {
                                initialValue: author,
                                rules: [
                                    { required: true, message: '直播间描述' },
                                ]
                            })(
                                <Input placeholder='直播间描述' disabled={true} />
                            )}
                        </Form.Item>
                        <Form.Item label={'直播者Id'}  {...formItemLayout}>
                            {getFieldDecorator('userId', {
                                initialValue: userId,
                                rules: [
                                    { required: true, message: '直播者Id' },
                                ]
                            })(
                                <Input placeholder='直播者Id' disabled={true} />
                            )}
                        </Form.Item>

                        <Form.Item >
                            <Button className='NotAuthbutton' icon='stop' type='danger' onClick={this.handlenotAuth} >禁止</Button>
                            <Alert message={"禁止后，请联系申请者告知禁止原因，以便重新申请"} type="info" />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
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


export default CreateSHAnchor