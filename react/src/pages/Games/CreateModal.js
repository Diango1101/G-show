import React, { Component } from 'react';
import { Form, Input, Modal, Icon, message, Upload, InputNumber, Select, DatePicker } from 'antd'
import { json } from '../../utils/ajax'
import { connect } from 'react-redux'
import { isAuthenticated, authenticateSuccess } from '../../utils/session'
import moment from 'moment'
const { TextArea } = Input;
const { Option } = Select;

const store = connect(
    (state) => ({ user: state.user })
)

@store @Form.create()
class CreateModal extends Component {
    state = {
        gamedateIn: [],
        AllTeams: [],
        TeamOptions: [],
    }
    async componentDidMount() {
        await this.getGameDate()
        await this.getAllTeams()
    }
    getGameDate = async () => {
        const res = await json.get('/games/getAllGamedate')
        if (res.status === 0) {
            this.setState({
                gamedateIn: res.data
            })
        }
    }
    getAllTeams = async () => {
        const res = await json.get('/games/getAllTeams')
        if (res.status === 0) {
            this.setState({
                AllTeams: res.data
            })
            await this.TeamToOptions(res.data)
        }
    }
    TeamToOptions = async (value) => {
        let TeamOptions = []
        value.forEach((element, index) => {
            TeamOptions.push(
                <Option key={index} value={element.Team}>
                    {element.Team}
                </Option>
            )
        })
        this.setState({
            TeamOptions
        })
    }
    getTemsByDate = async (value) => {
        const res = await json.get('/games/getGameTeamsByDate', {
            gamedate: value.valueOf()
        })
        if (res.status === 0) {
            let teams = [{ Team: res.data.win }, { Team: res.data.lose }]
            await this.TeamToOptions(teams)

        }
    }
    onCancel = () => {
        this.props.form.resetFields()
        this.props.toggleVisible(false)
    }
    onOk = () => {
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (!errors) {
                this.onCreate(values)
            }
        })
    }
    onCreate = async (values) => {
        let value = {
            team1: values.team1,
            team2: values.team2,
            gamedate: values.gamedate.valueOf()
        }
        console.log('创建游戏', value)
        const res = await json.post('/games/addGame', value)
        if (res.status === 0) {
            message.success(`新增游戏成功`)
            this.props.onCreated()  //更新外面的数据
            this.onCancel()
        }
    }

    render() {
        const { gamedateIn, TeamOptions } = this.state
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        }
        const { getFieldDecorator, getFieldValue } = this.props.form
        const gamedateOptions = []
        gamedateIn.forEach((element, index) => {
            gamedateOptions.push(
                <Option key={index} value={element.gamedate}>
                    {moment(element.gamedate).format('YYYY-MM-DD HH:mm:ss')}
                </Option>
            )
        })



        return (
            <Modal
                visible={this.props.visible}
                title='新增游戏'
                centered
                onCancel={this.onCancel}
                okButtonProps={{ disabled: !this.props.user.isAdmin && !this.props.user.isAnchor }}
                onOk={this.onOk}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={'比赛日期'}>
                        {getFieldDecorator('gamedate', {
                            rules: [
                                { required: true, message: '请输入比赛日期' },
                            ]
                        })(
                            <Select
                                showSearch
                                style={{ width: 300 }}
                                placeholder="请选择"
                                onSelect={this.getTemsByDate}
                            >
                                {gamedateOptions}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label={'Team1'}>
                        {getFieldDecorator('team1', {
                            rules: [
                                { required: true, message: '请输入team1' },
                            ]
                        })(
                            <Select
                                showSearch
                                style={{ width: 300 }}
                                placeholder="请选择"
                                disabled={!getFieldValue('gamedate')}
                            >
                                {TeamOptions}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item label={'Team2'}>
                        {getFieldDecorator('team2', {
                            rules: [
                                { required: true, message: '请输入team2' },
                            ]
                        })(
                            <Select
                                showSearch
                                style={{ width: 300 }}
                                placeholder="请选择"
                                disabled={!getFieldValue('gamedate')}
                            >
                                {TeamOptions}
                            </Select>
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

export default CreateModal;