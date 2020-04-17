import React from "react";
import { Tabs, Carousel, Layout, Icon } from "antd";
import "./style.less";
import { ReSetPane, ReSetActivePane, initRoomWebSocket } from '@/store/actions'
import { connect, } from 'react-redux'
import { bindActionCreators } from 'redux'
const Footer = Layout.Footer;
const TabPane = Tabs.TabPane;
const imgs = [
    `${process.env.REACT_APP_BASE_URL}/public/images/b1.jpg`,
    `${process.env.REACT_APP_BASE_URL}/public/images/b2.jpg`,
    `${process.env.REACT_APP_BASE_URL}/public/images/b3.jpg`
];
const store = connect(
    (state) => ({ panes: state.panes, activepane: state.activepane, roomwebsocket: state.roomwebsocket, user: state.user }),
    (dispatch) => bindActionCreators({ ReSetPane, ReSetActivePane }, dispatch)
)
@store
class MyContent extends React.Component {
	/**
	 *  标签页的改变触发的函数
	 */
    onChange = activeKey => {
        this.props.onChangeState(
            null, activeKey
        );
    };
    onEdit = (targetKey, action) => {
        if (action === "remove") {
            this.remove(targetKey);
        }
    };
	/**
	 * 关闭标签页
	 */
    remove = targetKey => {
        let activeMenu = this.props.activepane;
        console.log('activenow', activeMenu)
        let panes = this.props.panes.slice();
        let preIndex = panes.findIndex(item => item.key === targetKey) - 1;
        console.log('targetKey', targetKey)
        preIndex = Math.max(preIndex, 0);
        panes = panes.filter(item => item.key !== targetKey);
        if (targetKey === activeMenu) {
            activeMenu = panes[preIndex] ? panes[preIndex].key : "";
        }
        this.props.onChangeState(
            panes,
            activeMenu
        );
        //要关闭标签页则断开 则必须每个直播间分配一个不同的websocket  我这里要关闭同时关闭websocket就全部关闭了 故不实现关闭标签页则下线功能
        if (this.props.roomwebsocket) {
            this.props.roomwebsocket.close()

        }
    };
    render() {
        let { panes, activepane } = this.props;
        return (
            <div className="content-container">
                {" "}
                {panes.length ? (
                    <Tabs
                        style={{
                            height: "100%"
                        }}
                        tabBarStyle={{
                            background: "#f0f2f5",
                            marginBottom: 0
                        }}
                        onEdit={this.onEdit}
                        onChange={this.onChange}
                        activeKey={activepane}
                        type="editable-card"
                        hideAdd
                    >
                        {panes.map(item => (
                            <TabPane key={item.key} tab={item.name}>
                                <div className="tabpane-box"> {item.content} </div>{" "}
                                <Footer
                                    style={{
                                        textAlign: "center",
                                        // background: "#fff"
                                    }}
                                >
                                    G - Show Live© {new Date().getFullYear()}{' '}
									Created by 2320165467 @qq.com{" "}
                                    <a
                                        target="_blank"
                                        href="https://github.com/Diango1101"
                                        rel="noopener noreferrer"
                                    >
                                        <Icon type="github" />
                                    </a>{" "}
                                </Footer>{" "}
                            </TabPane>
                        ))}{" "}
                    </Tabs>
                ) : (
                        <div className="bg-box">
                            <Carousel className="bg-size" autoplay autoplaySpeed={5000}>
                                {" "}
                                {imgs.map(item => (
                                    <div className="bg-size" key={item}>
                                        <img
                                            src={item}
                                            alt=""
                                            style={{
                                                width: "100%",
                                                height: "100%"
                                            }}
                                        />{" "}
                                    </div>
                                ))}{" "}
                            </Carousel>{" "}
                        </div>
                    )}{" "}
            </div>
        );
    }
}

export default MyContent;
