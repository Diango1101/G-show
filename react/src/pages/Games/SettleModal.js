import React, { Component } from 'react';
import { Form, Input, Modal, Icon, message, Upload, InputNumber, Alert, Select } from 'antd'
import { json } from '../../utils/ajax'
import { connect } from 'react-redux'
import { getUser } from '../../store/actions'
import { bindActionCreators } from 'redux'
import { isAuthenticated, authenticateSuccess } from '../../utils/session'
const { TextArea } = Input;
const { Option } = Select;


const store = connect(
    (state) => ({ user: state.user }),
    (dispatch) => bindActionCreators({ getUser }, dispatch)

)

@store @Form.create()
class SettleModal extends Component {
    state = {
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
                this.onSettle(values)
            }
        })
    }
    onSettle = async (values) => {
        const value = {
            game: {
                gameid: this.props.gameInfo.id,
                userid: this.props.user.id,
                ...this.props.gameInfo,   //必须放在RealWinner之前解构  因为参数名相同  不然会被覆盖成null  懒得手动解构
                RealWinner: values.RealWinner,
            }

        }
        console.log('Settle', value)
        const res = await json.post('/games/setGameResult', value)
        console.log('SettleRes', res)
        if (res.status === 0) {
            message.success(`${res.message}`)
            this.props.getUser({ id: value.game.userid })
            this.props.onGeted()  //更新外面的数据
            this.onCancel()
        }
    }
    render() {
        const { gameInfo, user } = this.props
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        const { getFieldDecorator, getFieldValue } = this.props.form
        return (
            <Modal
                visible={this.props.visible}
                title='游戏结算'
                centered
                onCancel={this.onCancel}
                okButtonProps={{ disabled: ((getFieldValue('presentValue') * getFieldValue('presentCounts')) > parseInt(getFieldValue('UserRecords'))) }}
                onOk={this.onOk}
            >
                <Form >
                    <Form.Item label={'Team1'} {...formItemLayout}>
                        {getFieldDecorator('team1', {
                            initialValue: gameInfo.team1,
                            rules: [
                                { required: true, message: '' },
                            ]
                        })(
                            <Input disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'Team2'} {...formItemLayout}>
                        {getFieldDecorator('team2', {
                            initialValue: gameInfo.team2,
                            rules: [
                                { required: true, message: '' },
                            ]
                        })(
                            <Input disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'预测胜利队伍'} {...formItemLayout}>
                        {getFieldDecorator('preWinner', {
                            initialValue: gameInfo.preWinner,

                            rules: [
                                { required: true, message: '' },
                            ]
                        })(
                            <Input disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'预测获胜几率'} {...formItemLayout}>
                        {getFieldDecorator('Values', {
                            initialValue: gameInfo.probability,
                            rules: [
                                { required: true, message: '' },
                            ]
                        })(
                            <Input disabled={true} />
                        )}
                    </Form.Item>
                    <Form.Item label={'真实获胜队伍'} {...formItemLayout}>
                        {getFieldDecorator('RealWinner', {
                            rules: [
                                { required: true, message: '请选择预测胜利队伍' },
                            ]
                        })(
                            <Select
                                showSearch
                                style={{ width: 300 }}
                                placeholder="请选择"

                            >
                                <Option key={1} value={gameInfo.team1}>
                                    {gameInfo.team1}
                                </Option>
                                <Option key={2} value={gameInfo.team2}>
                                    {gameInfo.team2}
                                </Option>
                            </Select>
                        )}
                    </Form.Item>
                </Form>

            </Modal>
        )
    }

}
export default SettleModal;