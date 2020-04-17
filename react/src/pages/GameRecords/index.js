import React, { Component } from 'react';
import { Table, Card, Form, Input, Button, DatePicker, message, Icon, Row, Col, Divider, Modal, Popconfirm, notification, Select, Alert, Popover } from 'antd'
import { connect } from 'react-redux'
import { json } from '../../utils/ajax'
import moment from 'moment'
import { withRouter } from 'react-router-dom'
import './style.less'
const { Option } = Select;


const store = connect(
    (state) => ({ user: state.user })
)

@withRouter @store @Form.create()
class GameRecords extends Component {
    state = {
        GameRecords: [],   //记录列表
        GameRecordsLoading: false,//获取记录loading
        InUsers: [],     //用户列表
        totalAlert: '',
        pagination: {
            total: 0,
            current: 1,  //前台分页是从1开始的，后台分页是从0开始的，所以要注意一下
            pageSize: 10,
            showQuickJumper: true
        },

    }
    async componentDidMount() {
        await this.getAll()
        console.log('兑换记录', this.state.GameRecords)
    }
    componentDidUpdate() {

    }
    getAll = async () => {
        await this.getGameRecords()
        await this.getUsers()
    }

    getUsers = async () => {
        const res = await json.get('/games/getInUsers')
        if (res.status == 0) {
            this.setState({
                InUsers: res.data
            })
            console.log('users', res.data)
        }
    }

    getGameRecords = async (page = 1) => {
        const { pagination } = this.state
        const fields = this.props.form.getFieldsValue()
        this.setState({
            GameRecordsLoading: true,
        })
        let value
        if (this.props.user.isAdmin === 1) {
            value = {
                current: page - 1,
                team1: fields.team1 || '',   //koa会把参数转换为字符串，undefined也会
                team2: fields.team2 || '',
                receiveValue: fields.receiveValue || '',   //获得积分
                userValue: fields.userValue || '',          //下注积分
                preResult: fields.preResult || '',     //传1或0 即可  是否预测成功
                startTime: fields.startTime ? fields.startTime.valueOf() : '',
                endTime: fields.endTime ? fields.endTime.valueOf() : '',
                userId: fields.userId || '',
            }
        } else {
            value = {
                current: page - 1,
                team1: fields.team1 || '',   //koa会把参数转换为字符串，undefined也会
                team2: fields.team2 || '',
                receiveValue: fields.receiveValue || '',   //获得积分
                userValue: fields.userValue || '',          //下注积分
                preResult: fields.preResult || '',     //传1或0 即可  是否预测成功
                startTime: fields.startTime ? fields.startTime.valueOf() : '',
                endTime: fields.endTime ? fields.endTime.valueOf() : '',
                userId: this.props.user.id
            }
        }
        console.log('gamerecordsVal', value)
        const res = await json.get('/games/getAllUserGames', value)
        console.log('gamerecords', res)
        if (res.status !== 0) {
            this.setState({
                GameRecordsLoading: false,
            })
            return
        }
        this.setState({
            GameRecordsLoading: false,
            GameRecords: res.data.list,
            pagination: {
                ...pagination,
                total: res.data.total,
                current: page
            }
        })
    }


    /**
   * table分页
   */
    onTableChange = async (page) => {
        await this.setState({
            pagination: page
        })
        this.getGameRecords(page.current)

    }
    /**
     * 搜索函数
     */
    onSearch = () => {
        this.getGameRecords()
    }
    /**
     * 重置函数
     */
    onReset = () => {
        this.props.form.resetFields()
        this.getGameRecords()
        this.setState({
            selectedRowKeys: []
        })
        message.success('重置成功')
    }
    /**
    * 结果转换
    */
    formatResult = (result) => {
        if (result > 0) {
            return (<text style={styles.green}>成功</text>)
        } else {
            return (<text style={styles.red}>失败</text>)
        }
    }
    /**
   * 得到用户统计信息
   */
    getUserTotals = async (userid) => {
        console.log(userid)
        const res = await json.get('/games/getTotals', {
            userid: userid
        })
        if (res.status == 0) {
            let result = (
                <div>
                    <p>您共参加了{res.data.winCounts + res.data.loseCounts}次游戏，投入{res.data.totalCost}分，收获{res.data.totalGet}分，净赚{res.data.totalGet - res.data.totalCost}分哦</p>
                    <p>您成功预测了{res.data.winCounts}场比赛，成功率高达{String((res.data.winCounts / (res.data.winCounts + res.data.loseCounts)) * 100).replace(/^(.*\..{3}).*$/, "$1")}%哦</p>
                </div>
            )
            this.setState({
                totalAlert: result
            })
        } else {
            this.setState({
                totalAlert: '系统出错'
            })
        }
        console.log('totals', res)
    }
    render() {
        const RealUser = this.props.user
        const { getFieldDecorator } = this.props.form
        const { GameRecords, GameRecordsLoading, pagination, InUsers, totalAlert } = this.state
        const columns = [
            {
                title: '序号',
                key: 'num',
                align: 'center',
                render: (text, record, index) => {
                    let num = (pagination.current - 1) * 10 + index + 1
                    if (num < 10) {
                        num = '0' + num
                    }
                    return num
                }
            },
            {
                title: 'Team1',
                dataIndex: 'team1',
                align: 'center'
            },
            {
                title: 'Team2',
                dataIndex: 'team2',
                align: 'center',
            },
            {
                title: '玩家预测胜利队伍',
                dataIndex: 'preWinner',
                align: 'center',
            },
            {
                title: '实际胜利队伍',
                dataIndex: 'RealWinner',
                align: 'center',
            },
            {
                title: '下注积分',
                dataIndex: 'userValue',
                align: 'center',
                sorter: (a, b) => a.userValue - b.userValue
            },
            {
                title: '获得积分',
                dataIndex: 'receiveValue',
                align: 'center',
                sorter: (a, b) => a.receiveValue - b.receiveValue
            },
            {
                title: '预测结果',
                dataIndex: 'personalOdds',
                align: 'center',
                render: (text, record) => (
                    text && this.formatResult(text)
                )
            },
            {
                title: '下注时间',
                dataIndex: 'createTime',
                align: 'center',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss'),
                sorter: (a, b) => a.createTime - b.createTime
            },
        ]
        var AdminAnchorColumn = [
            {
                title: '用户名',
                dataIndex: 'username',
                align: 'center',
                render: (text, record) => text && (
                    <Popover content={totalAlert} title={`${text}的战况小结`} trigger="click">
                        <Button icon="area-char" onClick={() => this.getUserTotals(record.userId)}>{text}</Button>
                    </Popover>
                )
            },
        ]

        if (RealUser.isAdmin === 1) {
            columns.splice(1, 0, ...AdminAnchorColumn)
        }
        //获取用户
        const UserOptions = []
        InUsers.forEach((element, index) => {
            UserOptions.push(
                <Option key={index} value={element.userId}>
                    {element.username}
                </Option>
            )
        })
        return (
            <div style={{ padding: 24 }}>
                <Card bordered={false}>
                    <Form layout='inline' style={{ marginBottom: 16 }}>
                        <Row>
                            {(RealUser.isAdmin === 1) &&
                                <Col span={5}>
                                    <Form.Item label="用户名">
                                        {getFieldDecorator('userId')(
                                            <Select
                                                showSearch
                                                style={{ width: 150 }}
                                                placeholder="请选择"

                                            >
                                                {UserOptions}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            }
                            <Col span={5}>
                                <Form.Item label="team1">
                                    {getFieldDecorator('team1')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="请输入team1"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="team2">
                                    {getFieldDecorator('team2')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="请输入team2"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="投入积分<">
                                    {getFieldDecorator('userValue')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="请输入"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="收益积分<">
                                    {getFieldDecorator('receiveValue')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="请输入"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="注册开始时间">
                                    {getFieldDecorator('startTime')(
                                        <DatePicker style={{ width: 200 }} showTime />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="注册截止时间">
                                    {getFieldDecorator('endTime')(
                                        <DatePicker style={{ width: 200 }} showTime />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5} >
                                <Form.Item label="预测结果">
                                    {getFieldDecorator('preResult')(
                                        <Select
                                            showSearch
                                            style={{ width: 150 }}
                                            placeholder="请选择"

                                        >
                                            <Option key={1} value={'1'}>
                                                成功
                                            </Option>
                                            <Option key={2} value={'0'}>
                                                失败
                                            </Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item style={{ marginRight: 0, width: '100%', marginTop: 15 }} wrapperCol={{ span: 24 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <Button type="primary" icon='search' onClick={this.onSearch}>搜索</Button>&emsp;
                                        <Button icon="reload" onClick={this.onReset}>重置</Button>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>

                    <div style={{ marginBottom: 16, marginTop: 16, textAlign: 'right' }}>
                        <Popover placement="left" content={totalAlert} title="个人战况小结" trigger="click">
                            <Button type="primary" icon="area-char" onClick={() => this.getUserTotals(RealUser.id)}>获取自己战况汇总</Button>
                        </Popover>
                    </div>
                    <Table
                        bordered
                        rowKey='id'
                        columns={columns}
                        dataSource={GameRecords}
                        loading={GameRecordsLoading}
                        pagination={pagination}
                        onChange={this.onTableChange}
                    />
                </Card>


            </div>
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
    pics: {
        maxWidth: '50px',
        maxHeight: '50px',
    },
    green: {
        color: 'green'
    },
    red: {
        color: 'red'
    },
    SearchBottom: {
        marginTop: 20
    }
}


export default GameRecords