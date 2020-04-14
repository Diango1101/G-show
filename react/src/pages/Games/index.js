import React, { Component } from 'react';
import { Table, Card, Form, Input, Button, DatePicker, message, Icon, Row, Col, Divider, Modal, Popconfirm, notification, Select } from 'antd'
import { connect } from 'react-redux'
import { json } from '../../utils/ajax'
import moment from 'moment'
import { withRouter } from 'react-router-dom'
import './style.less'
import CreateModal from './CreateModal'
import BetModal from './BetModal'
import SettleModal from './SettleModal'
const { Option } = Select;


const store = connect(
    (state) => ({ user: state.user })
)

@withRouter @store @Form.create()
class Games extends Component {
    state = {
        games: [],   //游戏列表
        team1: [],
        team2: [],
        gamedate: [],
        gamesLoading: false,//获取礼物==游戏loading
        pagination: {
            total: 0,
            current: 1,  //前台分页是从1开始的，后台分页是从0开始的，所以要注意一下
            pageSize: 10,
            showQuickJumper: true
        },
        gameInfo: {},        //当前行的game信息
        selectedRowKeys: [],   //选择中的行keys
        isShowCreateModal: false,
        isShowBetModal: false,
        isShowSettleModal: false

    }
    async componentDidMount() {
        await this.getAll()
        console.log(this.state.games)
    }
    componentDidUpdate() {

    }
    getAll = async () => {
        await this.getGames()
    }

    getGames = async (page = 1) => {
        const { pagination } = this.state
        const fields = this.props.form.getFieldsValue()
        this.setState({
            gamesLoading: true,
        })
        const res = await json.get('/games/getAllGames', {
            current: page - 1,
            team1: fields.team1 || '',   //koa会把参数转换为字符串，undefined也会
            team2: fields.team2 || '',
            gamedate1: fields.gamedate1 ? fields.gamedate1.valueOf() : 0,
            gamedate2: fields.gamedate2 ? fields.gamedate2.valueOf() : '9999999999999',
            status: fields.status || '',
            presentValue: fields.presentValue || 999999,

        })
        if (res.status !== 0) {
            this.setState({
                gamesLoading: false,
            })
            return
        }
        this.setState({
            gamesLoading: false,
            games: res.data.list,
            pagination: {
                ...pagination,
                total: res.data.total,
                current: page
            }
        })
    }
    /**
    * 打开/关闭创建模态框
    */
    toggleShowCreateModal = (visible) => {
        this.setState({
            isShowCreateModal: visible
        })
    }
    /**
   * 打开/关闭更新模态框
   */
    toggleShowUpdateModal = (visible, records = []) => {
        console.log('updateinfo', records)
        this.setState({
            isShowSettleModal: visible,
            gameInfo: records
        })
    }
    openUpdateModal = (records) => {
        this.toggleShowUpdateModal(true, records)
    }
    openCreateModal = () => {
        this.toggleShowCreateModal(true)
    }
    /**
    * 打开兑换模态框，并初始化礼物信息回显
    */
    showGetModal = (visible, record = []) => {
        this.setState({
            gameInfo: record,
            isShowGetModal: visible
        })
    }
    /**
     * 关闭兑换模态框
     */
    closeGetModal = () => {
        this.setState({
            isShowGetModal: false,
            gameInfo: {}
        })
    }
    /**
     * 打开下注模态框，并初始化游戏信息回显
     */
    showBetModal = (visible, record = []) => {
        this.setState({
            gameInfo: record,
            isShowBetModal: visible
        })
    }
    /**
       * 打开结算模态框，并初始化游戏信息回显
       */
    ShowSettleModal = (visible, record = []) => {
        this.setState({
            gameInfo: record,
            isShowSettleModal: visible
        })
    }
    /**
     * 关闭下注模态框
     */
    closeBetModal = () => {
        this.setState({
            isShowBetModal: false,
            gameInfo: {}
        })
    }

    /**
   * table分页
   */
    onTableChange = async (page) => {
        await this.setState({
            pagination: page
        })
        this.getGames(page.current)

    }
    /**
     * 搜索函数
     */
    onSearch = () => {
        this.getGames()
    }
    /**
     * 重置函数
     */
    onReset = () => {
        this.props.form.resetFields()
        this.getGames()
        this.setState({
            selectedRowKeys: []
        })
        message.success('重置成功')
    }

    /**
    * 批量结束
    */
    batchStop = () => {
        Modal.confirm({
            title: '提示',
            content: '您确定批量结束勾选内容吗？',
            onOk: async () => {
                if (!this.props.user.isAdmin) {
                    message.warning('管理员才可批量结束')
                    return
                }
                const res = await json.post('/games/stopGame', {
                    ids: this.state.selectedRowKeys
                })
                if (res.status === 0) {
                    notification.success({
                        message: '结束成功',
                        description: res.message,
                    })
                    this.setState({
                        selectedRowKeys: []
                    })
                    this.getGames()
                }
            }
        })
    }

    /**
    * 单条结束
    */
    singleStop = async (record) => {
        const res = await json.post('/games/stopGame', {
            ids: [record.id]
        })
        if (res.status === 0) {
            message.success(`已结束`)
            this.getGames()
        }
    }

    render() {
        const RealUser = this.props.user
        const { getFieldDecorator } = this.props.form
        const { games, gamesLoading, pagination, gameInfo, selectedRowKeys, isShowCreateModal, isShowBetModal, isShowSettleModal } = this.state
        var columns = [
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
                align: 'center'
            },
            {
                title: '比赛时间',
                dataIndex: 'gamedate',
                align: 'center',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss'),
                sorter: (a, b) => a.gamedate - b.gamedate
            },
            {
                title: '状态',
                dataIndex: 'status',
                align: 'center',
                render: (text) => (text ? '进行中' : '已结束')
            },
            {
                title: '参加人数',
                dataIndex: 'userCounts',
                align: 'center',
                sorter: (a, b) => a.userCounts - b.userCounts
            },
            {
                title: '操作',
                key: 'active',
                align: 'center',
                render: (text, record) => (
                    <div style={{ textAlign: 'left' }}>

                        {
                            record.status === 1 &&
                            <span className='my-a' onClick={() => this.showBetModal(true, record)}><Divider type='vertical' /><Icon type="plus-circle" /> 下注</span>
                        }
                        {
                            (RealUser.isAnchor === 1 && RealUser.isAdmin === 1) &&
                            (<Popconfirm title='您确定要结算本场游戏吗？' onConfirm={() => this.ShowSettleModal(true, record)}>
                                <span className='my-a'><Divider type='vertical' /><Icon type='issues-close' /> 结算</span>
                            </Popconfirm>)
                        }
                        {
                            (RealUser.isAnchor === 1 && RealUser.isAdmin === 1) &&
                            (<Popconfirm title='您确定要结束本场游戏吗？' onConfirm={() => this.singleStop(record)}>
                                <span className='my-a'><Divider type='vertical' /><Icon type='fund' /> 结束</span>
                            </Popconfirm>)
                        }
                        {/* {
                            RealUser.isAdmin === 1 &&
                            <Popconfirm title='您确定下架当前礼品吗？' onConfirm={() => this.singleDelete(record)}>
                                <span className='my-a'><Divider type='vertical' /><Icon type='delete' /> 下架</span>
                            </Popconfirm>
                        }
                        {
                            RealUser.isAdmin === 1 &&
                            <span className='my-a' onClick={() => this.openUpdateModal(record)}><Divider type='vertical' /><Icon type='edit' /> 修改</span>
                        }
                        <span className='my-a' onClick={() => this.showGetModal(true, record)}><Divider type='vertical' /><Icon type='transaction' /> 兑换</span> */}

                    </div>
                )
            },
        ]
        var AdminAnchorColumn = [
            {
                title: '预测获胜队伍',
                dataIndex: 'preWinner',
                align: 'center',
            },
            {
                title: '获胜率',
                dataIndex: 'probability',
                align: 'center',
                sorter: (a, b) => a.probability - b.probability
            },
        ]

        if (RealUser.isAdmin == '1' || RealUser.isAnchor == '1') {
            columns.splice(3, 0, ...AdminAnchorColumn)
        }
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys) => this.setState({ selectedRowKeys }),

        }
        return (
            <div style={{ padding: 24 }}>
                <Card bordered={false}>
                    <Form layout='inline' style={{ marginBottom: 16 }}>
                        <Row>
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
                                <Form.Item label="比赛开始时间">
                                    {getFieldDecorator('gamedate1')(
                                        <DatePicker style={{ width: 200 }} showTime />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="比赛截止时间">
                                    {getFieldDecorator('gamedate2')(
                                        <DatePicker style={{ width: 200 }} showTime />
                                    )}
                                </Form.Item>
                            </Col>

                            <Col span={4}>
                                <Form.Item label="状态">
                                    {getFieldDecorator('status')(
                                        <Select
                                            showSearch
                                            style={{ width: 150 }}
                                            placeholder="请选择"
                                        >
                                            <Option key={'1'} value={'1'}>
                                                进行中
                                            </Option>
                                            <Option key={'0'} value={'0'}>
                                                已结束
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
                    <div style={{ marginBottom: 16, textAlign: 'right' }}>
                        {(RealUser.isAdmin === 1 || RealUser.isAnchor === 1) && <Button type='primary' icon='plus' className='prebutton' onClick={() => this.toggleShowCreateModal(true)}>新增</Button>}
                        {RealUser.isAdmin === 1 && <Button type='danger' icon='delete' className='prebutton' disabled={!selectedRowKeys.length} onClick={this.batchStop}>批量结束</Button>}
                    </div>
                    <Table
                        bordered
                        rowKey='id'
                        columns={columns}
                        dataSource={games}
                        loading={gamesLoading}
                        rowSelection={rowSelection}
                        pagination={pagination}
                        onChange={this.onTableChange}
                    />
                </Card>
                <CreateModal
                    visible={isShowCreateModal}
                    toggleVisible={this.toggleShowCreateModal}
                    onCreated={this.getAll} />
                <BetModal
                    gameInfo={gameInfo}
                    visible={isShowBetModal}
                    onGeted={this.getAll}
                    toggleVisible={this.showBetModal}
                />
                <SettleModal
                    gameInfo={gameInfo}
                    visible={isShowSettleModal}
                    onGeted={this.getAll}
                    toggleVisible={this.ShowSettleModal}
                />

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
}


export default Games