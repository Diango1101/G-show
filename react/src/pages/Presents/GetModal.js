import React, { Component } from 'react';
import { Form, Input, Modal, Icon, message, Upload, InputNumber, Alert } from 'antd'
import { json } from '../../utils/ajax'
import { connect } from 'react-redux'
import { getUser } from '../../store/actions'
import { bindActionCreators } from 'redux'
import { isAuthenticated, authenticateSuccess } from '../../utils/session'
const { TextArea } = Input;

const store = connect(
    (state) => ({ user: state.user }),
    (dispatch) => bindActionCreators({ getUser }, dispatch)

)

@store @Form.create()
class GetModal extends Component {
    state = {
        count: 1,
        presenValue: '',
    }
    async componentDidMount() {

    }

    onCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    onOk = () => {
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (!errors) {
                this.onGet(values)
            }
        })
    }
    onGet = async (values) => {
        const value = {
            userid: this.props.user.id,
            present: {
                ...values,
                presentid: this.props.presentInfo.id,
                presentName: this.props.presentInfo.presentName,
                presentType: this.props.presentInfo.presentType
            }

        }
        console.log('get', value)
        const res = await json.post('/presents/getPresents', value)
        if (res.status === 0) {
            message.success(`${res.message}`)
            this.props.getUser({ id: value.userid })
            this.props.onGeted()  //更新外面的数据
            this.onCancel()

        }
    }
    render() {
        const { presentInfo, user } = this.props
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        const { getFieldDecorator, getFieldValue } = this.props.form
        return (
            <Modal
                visible={this.props.visible}
                title='兑换礼品'
                centered
                onCancel={this.onCancel}
                okButtonProps={{ disabled: ((getFieldValue('presentValue') * getFieldValue('presentCounts')) > parseInt(getFieldValue('UserRecords'))) }}
                onOk={this.onOk}
            >
                <Form >
                    <Form.Item label={'礼物名称'} {...formItemLayout}>
                        {getFieldDecorator('title', {
                            initialValue: presentInfo.presentName,
                            rules: [
                                { required: true, message: '请输入直播间名称' },
                            ]
                        })(
                            <Input disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'礼物描述'} {...formItemLayout}>
                        {getFieldDecorator('description', {
                            initialValue: presentInfo.presentDesc,
                            rules: [
                                { required: true, message: '礼物描述' },
                            ]
                        })(
                            <TextArea disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'单品积分'} {...formItemLayout}>
                        {getFieldDecorator('presentValue', {
                            initialValue: presentInfo.presentValue,
                            rules: [
                                { required: true, message: '请输入单品积分' },
                            ]
                        })(
                            <InputNumber disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'礼物数量'} {...formItemLayout}>
                        {getFieldDecorator('presentCounts', {
                            initialValue: '1',
                            rules: [
                                { required: true, message: '请输入礼物数量' },
                            ]
                        })(
                            <InputNumber placeholder='1' min={1} max={presentInfo.presentCounts} />
                        )}
                    </Form.Item>
                    <Form.Item label={'个人积分'}  {...formItemLayout}>
                        {getFieldDecorator('UserRecords', {
                            initialValue: user.records,
                            rules: [
                                { required: true, message: '个人积分' },
                            ]
                        })(
                            <InputNumber placeholder='个人积分' disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'所需积分'} {...formItemLayout} >
                        {getFieldDecorator('RealRecords', {
                            initialValue: (getFieldValue('presentValue') * getFieldValue('presentCounts')),
                            rules: [
                                { required: true, message: '所需积分' },
                            ]
                        })(
                            <InputNumber placeholder='所需积分' disabled={true} />
                        )}
                    </Form.Item >

                    <Form.Item >
                        <Alert message={`亲 注意您的积分${getFieldValue('UserRecords')}  要大于所需积分哦  请勿贪心~`} type="info" />
                    </Form.Item>

                </Form>

            </Modal>
        )
    }

}
export default GetModal;