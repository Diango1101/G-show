import React, { Component } from 'react';
import { Table, Card, Form, Input, Button, DatePicker, message, Icon, Row, Col, Divider, Modal, Popconfirm, notification, Select } from 'antd'
import { connect } from 'react-redux'
import { json } from '../../utils/ajax'
import moment from 'moment'
import { withRouter } from 'react-router-dom'
import './style.less'
import CreateModal from './CreateModal'
import GetModal from './GetModal'
import UpdateModal from './UpdateModal'
const { Option } = Select;


const store = connect(
    (state) => ({ user: state.user })
)

@withRouter @store @Form.create()
class Presents extends Component {
    state = {
        presents: [],   //礼物列表
        presentsType: [],  //礼物品种
        presentsLoading: false,//获取礼物loading
        pagination: {
            total: 0,
            current: 1,  //前台分页是从1开始的，后台分页是从0开始的，所以要注意一下
            pageSize: 10,
            showQuickJumper: true
        },
        presentInfo: {},        //当前行的user信息
        selectedRowKeys: [],   //选择中的行keys
        isShowCreateModal: false,
        isShowGetModal: false,
        isShowUpdateModal: false

    }
    async componentDidMount() {
        await this.getPresents()
        await this.getPresentsType()
        console.log(this.state.presents, this.state.presentsType)
    }
    componentDidUpdate() {

    }
    getAll = async () => {
        await this.getPresents()
        await this.getPresentsType()
    }

    getPresents = async (page = 1) => {
        const { pagination } = this.state
        const fields = this.props.form.getFieldsValue()
        this.setState({
            presentsLoading: true,
        })
        const res = await json.get('/presents/getAllPresents', {
            current: page - 1,
            presentName: fields.presentName || '',   //koa会把参数转换为字符串，undefined也会
            presentType: fields.presentType || '',
            presentValue: fields.presentValue || 999999,

        })
        if (res.status !== 0) {
            this.setState({
                presentsLoading: false,
            })
            return
        }
        this.setState({
            presentsLoading: false,
            presents: res.data.list,
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
            isShowUpdateModal: visible,
            presentInfo: records
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
            presentInfo: record,
            isShowGetModal: visible
        })
    }
    /**
     * 关闭兑换模态框
     */
    closeGetModal = () => {
        this.setState({
            isShowGetModal: false,
            presentInfo: {}
        })
    }
    /**
    * 获得礼品种类
    */
    getPresentsType = async () => {
        const res = await json.get('/presents/getPresentsType')
        if (res.status == 0) {
            this.setState({
                presentsType: res.data || []
            })
        }
    }

    /**
   * table分页
   */
    onTableChange = async (page) => {
        await this.setState({
            pagination: page
        })
        this.getPresents(page.current)

    }
    /**
     * 搜索函数
     */
    onSearch = () => {
        this.getPresents()
    }
    /**
     * 重置函数
     */
    onReset = () => {
        this.props.form.resetFields()
        this.getPresents()
        this.setState({
            selectedRowKeys: []
        })
        message.success('重置成功')
    }

    /**
    * 批量删除
    */
    batchDelete = () => {
        Modal.confirm({
            title: '提示',
            content: '您确定批量删除勾选内容吗？',
            onOk: async () => {
                if (!this.props.user.isAdmin) {
                    message.warning('管理员才可批量删除')
                    return
                }
                const res = await json.post('/presents/deletePresent', {
                    ids: this.state.selectedRowKeys
                })
                if (res.status === 0) {
                    notification.success({
                        message: '删除成功',
                        description: res.message,
                    })
                    this.setState({
                        selectedRowKeys: []
                    })
                    this.getPresents()
                }
            }
        })
    }

    /**
    * 单条删除
    */
    singleDelete = async (record) => {
        const res = await json.post('/presents/deletePresent', {
            ids: [record.id]
        })
        if (res.status === 0) {
            message.success(`${record.presentName}已删除`)
            this.getPresents()
        }
    }

    render() {
        const RealUser = this.props.user
        const { getFieldDecorator } = this.props.form
        const { presents, presentsLoading, pagination, presentInfo, selectedRowKeys, presentsType, isShowCreateModal, isShowGetModal, isShowUpdateModal } = this.state
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
                title: '礼物名',
                dataIndex: 'presentName',
                align: 'center'
            },
            {
                title: '礼物图片',
                dataIndex: 'presentAvatar',
                align: 'center',
                render: (text, record) => (
                    <img src={text} alt={text} style={styles.pics}>

                    </img>
                )
            },
            {
                title: '礼物种类',
                dataIndex: 'presentType',
                align: 'center',
            },
            {
                title: '单品所需积分',
                dataIndex: 'presentValue',
                align: 'center',
                sorter: (a, b) => a.presentValue - b.presentValue

            },
            {
                title: '礼物简介',
                dataIndex: 'presentDesc',
                align: 'center',
            },
            {
                title: '现存数量',
                dataIndex: 'presentCounts',
                align: 'center',
                sorter: (a, b) => a.presentCounts - b.presentCounts
            },
            {
                title: '操作',
                key: 'active',
                align: 'center',
                render: (text, record) => (
                    <div style={{ textAlign: 'left' }}>
                        {/* <span className='my-a' onClick={() => this.showInfoModal(record)}><Icon type="eye" /> 查看</span> */}
                        {
                            RealUser.isAdmin === 1 &&
                            <Popconfirm title='您确定下架当前礼品吗？' onConfirm={() => this.singleDelete(record)}>
                                <span className='my-a'><Divider type='vertical' /><Icon type='delete' /> 下架</span>
                            </Popconfirm>
                        }
                        {
                            RealUser.isAdmin === 1 &&
                            <span className='my-a' onClick={() => this.openUpdateModal(record)}><Divider type='vertical' /><Icon type='edit' /> 修改</span>
                        }
                        <span className='my-a' onClick={() => this.showGetModal(true, record)}><Divider type='vertical' /><Icon type='transaction' /> 兑换</span>
                        {/* {
                            (record.isToBeAnchor === 1 && RealUser.isAdmin === 1) &&
                            (<span className='my-a' onClick={() => this.toggleShowSHModal(true, record.id)}><Divider type='vertical' /><Icon type='check-circle' /> 审核</span>)
                        } */}
                    </div>
                )
            },
        ]
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys) => this.setState({ selectedRowKeys }),

        }

        //获取礼物种类
        const presentTypeOptions = []
        presentsType.forEach((element, index) => {
            presentTypeOptions.push(
                <Option key={index} value={element.presentType}>
                    {element.presentType}
                </Option>
            )
        })
        return (
            <div style={{ padding: 24 }}>
                <Card bordered={false}>
                    <Form layout='inline' style={{ marginBottom: 16 }}>
                        <Row>
                            <Col span={5}>
                                <Form.Item label="礼物名">
                                    {getFieldDecorator('presentName')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="礼物名"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="礼物种类">
                                    {getFieldDecorator('presentType')(
                                        <Select
                                            showSearch
                                            style={{ width: 150 }}
                                            placeholder="请选择"
                                        //   optionFilterProp="children"
                                        //   filterOption={(input, option) =>
                                        //     option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        //   }
                                        >
                                            {presentTypeOptions}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item label="单品积分小于">
                                    {getFieldDecorator('presentValue')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="单品积分"
                                        />
                                    )}
                                </Form.Item>
                            </Col>

                            <Col span={4}>
                                <Form.Item style={{ marginRight: 0, width: '100%' }} wrapperCol={{ span: 24 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <Button type="primary" icon='search' onClick={this.onSearch}>搜索</Button>&emsp;
                                        <Button icon="reload" onClick={this.onReset}>重置</Button>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    <div style={{ marginBottom: 16, textAlign: 'right' }}>
                        {RealUser.isAdmin === 1 && <Button type='primary' icon='plus' className='prebutton' onClick={() => this.toggleShowCreateModal(true)}>新增</Button>}
                        {RealUser.isAdmin === 1 && <Button type='danger' icon='delete' className='prebutton' disabled={!selectedRowKeys.length} onClick={this.batchDelete}>批量下架</Button>}
                    </div>
                    <Table
                        bordered
                        rowKey='id'
                        columns={columns}
                        dataSource={presents}
                        loading={presentsLoading}
                        rowSelection={rowSelection}
                        pagination={pagination}
                        onChange={this.onTableChange}
                    />
                </Card>
                <CreateModal
                    visible={isShowCreateModal}
                    toggleVisible={this.toggleShowCreateModal}
                    onCreated={this.getAll} />
                <GetModal presentInfo={presentInfo}
                    visible={isShowGetModal}
                    onCancel={this.closeGetModal}
                    onGeted={this.getAll}
                    toggleVisible={this.showGetModal}
                />
                <UpdateModal
                    presentInfo={presentInfo}
                    visible={isShowUpdateModal}
                    toggleVisible={this.toggleShowUpdateModal}
                    onUpdated={this.getAll} />

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


export default Presents