import React, { Component } from 'react';
import AnimatedBook from '../../components/AnimatedBook'
import { Card, Icon, Button, Empty, Modal, Checkbox, message, Spin, Upload, Avatar } from 'antd'
import './style.less'
import { connect } from 'react-redux'
import CreateModal from './CreateModal'
import EditModal from './EditModal'
import { json } from '../../utils/ajax'


const store = connect(
    (state) => ({ user: state.user })
)

@store
class Collection extends Component {
    state = {
        collections: [],   //在播列表
        Stopedcollections: [],   //被封停列表
        UNTuiJiancollections: [],   //未被推荐列表
        TuiJiancollections: [],   //已推荐列表
        isShowCreateModal: false,
        isShowEditModal: false,
        loading: false
    }
    componentDidMount() {
        this.getAllCollections()
    }
    /**
    * 获得列表
    */
    getAllCollections = async () => {
        this.getCollections()
        this.getStopedCollections()
        this.getUnTJCollections()
        this.getTJCollections()
    }

    /**
     * 获得在播列表
     */
    getCollections = async () => {
        this.setState({
            loading: true
        })
        const res = await json.get('/liverooms/list')
        console.log('在播列表', res.data)
        this.setState({
            collections: res.data || [],
            loading: false
        })
    }
    /**
     * 被封停列表
     */
    getStopedCollections = async () => {
        this.setState({
            loading: true
        })
        const res = await json.get('/liverooms/Stopedlist')
        this.setState({
            Stopedcollections: res.data || [],
            loading: false
        })
    }
    /**
     * 获得未被推荐列表
     */
    getUnTJCollections = async () => {
        this.setState({
            loading: true
        })
        const res = await json.get('/liverooms/UnTJlist')
        this.setState({
            UNTuiJiancollections: res.data || [],
            loading: false
        })
    }
    /**
     * 获得已推荐列表
     */
    getTJCollections = async () => {
        this.setState({
            loading: true
        })
        const res = await json.get('/liverooms/TJlist')
        this.setState({
            TuiJiancollections: res.data || [],
            loading: false
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
    toggleShowEditModal = (visible) => {
        this.setState({
            isShowEditModal: visible
        })
    }
    openCreateModal = () => {
        this.toggleShowCreateModal(true)
    }
    openEditModal = () => {
        this.toggleShowEditModal(true)
    }
    openDeleteModal = () => {
        let ids = []
        Modal.confirm({
            title: '请在下面勾选要删除的直播间(仅管理员)',
            content: (
                <div style={{ marginTop: 30 }}>
                    <Checkbox.Group onChange={(values) => ids = values}>
                        {
                            this.state.collections.map(item => (
                                <p key={item.id}><Checkbox value={item.id}>{item.title}</Checkbox></p>
                            ))
                        }

                    </Checkbox.Group>
                </div>
            ),
            maskClosable: true,
            okButtonProps: {
                disabled: !this.props.user.isAdmin
            },
            onOk: async () => {
                const res = await json.post('/liverooms/delete', { ids })
                if (res.status === 0) {
                    message.success('删除成功')
                    this.getAllCollections()
                }
            }
        })
    }
    openStopModal = () => {
        let ids = []
        Modal.confirm({
            title: '请在下面勾选要封停的直播间(仅管理员)',
            content: (
                <div style={{ marginTop: 30 }}>
                    <Checkbox.Group onChange={(values) => ids = values}>
                        {
                            this.state.collections.map(item => (
                                <p key={item.id}><Checkbox value={item.id}>{item.title}</Checkbox></p>
                            ))
                        }

                    </Checkbox.Group>
                </div>
            ),
            maskClosable: true,
            okButtonProps: {
                disabled: !this.props.user.isAdmin
            },
            onOk: async () => {
                const res = await json.post('/liverooms/stop', { ids })
                if (res.status === 0) {
                    message.success('封停成功')
                    this.getAllCollections()
                }
            }
        })
    }
    openJFModal = () => {
        let ids = []
        Modal.confirm({
            title: '请在下面勾选要解封的直播间(仅管理员)',
            content: (
                <div style={{ marginTop: 30 }}>
                    <Checkbox.Group onChange={(values) => ids = values}>
                        {
                            this.state.Stopedcollections.map(item => (
                                <p key={item.id}><Checkbox value={item.id}>{item.title}</Checkbox></p>
                            ))
                        }

                    </Checkbox.Group>
                </div>
            ),
            maskClosable: true,
            okButtonProps: {
                disabled: !this.props.user.isAdmin
            },
            onOk: async () => {
                const res = await json.post('/liverooms/jiefeng', { ids })
                if (res.status === 0) {
                    message.success('解封成功')
                    this.getAllCollections()
                }
            }
        })
    }
    openTJModal = () => {
        let ids = []
        Modal.confirm({
            title: '请在下面勾选要推荐的直播间(仅管理员)',
            content: (
                <div style={{ marginTop: 30 }}>
                    <Checkbox.Group onChange={(values) => ids = values}>
                        {
                            this.state.UNTuiJiancollections.map(item => (
                                <p key={item.id}><Checkbox value={item.id}>{item.title}</Checkbox></p>
                            ))
                        }

                    </Checkbox.Group>
                </div>
            ),
            maskClosable: true,
            okButtonProps: {
                disabled: !this.props.user.isAdmin
            },
            onOk: async () => {
                const res = await json.post('/liverooms/tuijian', { ids })
                if (res.status === 0) {
                    message.success('推荐成功')
                    this.getAllCollections()
                }
            }
        })
    }
    openUnTJModal = () => {
        let ids = []
        Modal.confirm({
            title: '请在下面勾选要解除推荐的直播间(仅管理员)',
            content: (
                <div style={{ marginTop: 30 }}>
                    <Checkbox.Group onChange={(values) => ids = values}>
                        {
                            this.state.TuiJiancollections.map(item => (
                                <p key={item.id}><Checkbox value={item.id}>{item.title}</Checkbox></p>
                            ))
                        }

                    </Checkbox.Group>
                </div>
            ),
            maskClosable: true,
            okButtonProps: {
                disabled: !this.props.user.isAdmin
            },
            onOk: async () => {
                const res = await json.post('/liverooms/Untuijian', { ids })
                if (res.status === 0) {
                    message.success('解除推荐成功')
                    this.getAllCollections()
                }
            }
        })
    }


    render() {
        const { collections, isShowCreateModal, isShowEditModal, loading } = this.state
        const { user } = this.props
        const colors = ['#f3b47e', '#83d3d3', '#8bc2e8', '#a3c7a3']
        return (
            <div>
                <Spin spinning={loading}>
                    <Card bordered={false}>
                        <div style={{ textAlign: 'right', marginBottom: 40 }}>
                            {
                                (user.isAdmin === 1 || user.isAnchor === 1) ? (<Button className='openbutton' icon='plus' onClick={this.openCreateModal}>创建</Button>) : null
                            }
                            {
                                (user.isAdmin === 1 || user.isAnchor === 1) ? (<Button className='openbutton' type='primary' icon='edit' onClick={this.openEditModal}>修改个人直播间信息</Button>) : null
                            }
                            {
                                (user.isAdmin === 1) ? (<Button className='openbutton' icon='delete' type='danger' onClick={this.openDeleteModal} >删除</Button>) : null
                            }
                            {
                                (user.isAdmin === 1) ? (<Button className='openbutton' icon='stop' type='danger' onClick={this.openStopModal} >封停</Button>) : null
                            }
                            {
                                (user.isAdmin === 1) ? (<Button className='openbutton' icon='issues-close' onClick={this.openJFModal} >解封</Button>) : null
                            }
                            {
                                (user.isAdmin === 1) ? (<Button className='openbutton' icon='crown' type='primary' onClick={this.openTJModal} >推荐</Button>) : null
                            }
                            {
                                (user.isAdmin === 1) ? (<Button className='openbutton' icon='issues-close' type='danger' onClick={this.openUnTJModal} >解除推荐</Button>) : null
                            }
                        </div>
                        <div style={styles.box}>
                            {collections && collections.map((item, index) => (
                                <AnimatedBook
                                    key={item.id}
                                    cover={(
                                        <div className='cover-box' style={(item.status !== '2') ? { background: colors[index % 4] } : { background: 'red' }}>

                                            <h3 className='title ellipsis'>{item.title}</h3>
                                            <p className='ellipsis'>主播：{item.author}</p>
                                            <img src={item.roomavatar} className='coverimg'></img>

                                        </div>
                                    )}
                                    content={(
                                        <div className='content-box'>
                                            <div className='btn'>
                                                <Icon type="reddit" />
                                                <p>介绍：</p>
                                                <p>&nbsp;&nbsp;&nbsp;&nbsp;{(item.description) ? item.description : '本直播间很神秘，暂无介绍~'}</p>
                                            </div>
                                        </div>
                                    )}

                                    style={{ marginBottom: 100 }} />
                            ))}
                        </div>
                        {
                            !collections.length && <Empty />
                        }
                    </Card>
                    <CreateModal
                        visible={isShowCreateModal}
                        toggleVisible={this.toggleShowCreateModal}
                        onCreated={this.getAllCollections} />
                    <EditModal
                        username={user.username}
                        visible={isShowEditModal}
                        toggleVisible={this.toggleShowEditModal}
                        onEdited={this.getAllCollections}
                    />
                </Spin>
            </div>
        );
    }
}

const styles = {
    box: {
        display: 'flex',
        width: '100%',
        flexWrap: 'wrap',
    }

}


export default Collection;