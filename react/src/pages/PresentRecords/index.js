import React, { Component } from 'react';
import { Table, Card, Form, Input, Button, DatePicker, message, Icon, Row, Col, Divider, Modal, Popconfirm, notification, Select } from 'antd'
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
class PresentRecords extends Component {
    state = {
        presentRecords: [],   //记录列表
        presentsType: [],  //礼物品种
        presentRecordsLoading: false,//获取记录loading
        pagination: {
            total: 0,
            current: 1,  //前台分页是从1开始的，后台分页是从0开始的，所以要注意一下
            pageSize: 10,
            showQuickJumper: true
        },

    }
    async componentDidMount() {
        await this.getPresentRecords()
        await this.getPresentsType()
        console.log('兑换记录', this.state.presentRecords, this.state.presentsType)
    }
    componentDidUpdate() {

    }
    getAll = async () => {
        await this.getPresentRecords()
    }

    getPresentRecords = async (page = 1) => {
        const { pagination } = this.state
        const fields = this.props.form.getFieldsValue()
        this.setState({
            presentRecordsLoading: true,
        })
        const res = await json.get('/presents/getAllPresentsRecords', {
            current: page - 1,
            presentName: fields.presentName || '',   //koa会把参数转换为字符串，undefined也会
            presentType: fields.presentType || '',
            realCost: fields.realCost || 9999999,
            userId: this.props.user.id
        })
        if (res.status !== 0) {
            this.setState({
                presentRecordsLoading: false,
            })
            return
        }
        this.setState({
            presentRecordsLoading: false,
            presentRecords: res.data.list,
            pagination: {
                ...pagination,
                total: res.data.total,
                current: page
            }
        })
    }

    /**
    * 获得礼品种类
    */
    getPresentsType = async () => {
        const res = await json.get('/presents/getRecordPresentType')
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
        this.getPresentRecords(page.current)

    }
    /**
     * 搜索函数
     */
    onSearch = () => {
        this.getPresentRecords()
    }
    /**
     * 重置函数
     */
    onReset = () => {
        this.props.form.resetFields()
        this.getPresentRecords()
        this.setState({
            selectedRowKeys: []
        })
        message.success('重置成功')
    }
    render() {
        const RealUser = this.props.user
        const { getFieldDecorator } = this.props.form
        const { presentRecords, presentRecordsLoading, pagination, presentsType } = this.state
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
                title: '礼物种类',
                dataIndex: 'presentType',
                align: 'center',
            },
            {
                title: '礼物数量',
                dataIndex: 'counts',
                align: 'center',
                sorter: (a, b) => a.counts - b.counts

            },
            {
                title: '实际花费',
                dataIndex: 'realCost',
                align: 'center',
                sorter: (a, b) => a.realCost - b.realCost
            },
            {
                title: '兑换时间',
                dataIndex: 'createTime',
                align: 'center',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss'),
                sorter: (a, b) => a.createTime - b.createTime
            },
        ]
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
                                <Form.Item label="实际消耗小于">
                                    {getFieldDecorator('realCost')(
                                        <Input
                                            onPressEnter={this.onSearch}
                                            style={{ width: 200 }}
                                            placeholder="请输入"
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
                    {/* <div style={{ marginBottom: 16, textAlign: 'right' }}>
                        {RealUser.isAdmin === 1 && <Button type='primary' icon='plus' className='prebutton' onClick={() => this.toggleShowCreateModal(true)}>新增</Button>}
                        {RealUser.isAdmin === 1 && <Button type='danger' icon='delete' className='prebutton' disabled={!selectedRowKeys.length} onClick={this.batchDelete}>批量下架</Button>}
                    </div> */}
                    <Table
                        bordered
                        rowKey='id'
                        columns={columns}
                        dataSource={presentRecords}
                        loading={presentRecordsLoading}
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
}


export default PresentRecords