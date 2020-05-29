import React, { Component } from 'react';
import { Card } from 'antd'
import Typing from '../../components/Typing/index'

class About extends Component {
    state = {}
    render() {
        return (
            <div style={{ padding: 24 }}>
                <Card bordered={false} hoverable style={{ marginBottom: 24 }} bodyStyle={{ minHeight: 130 }}>
                    <Typing className="markdown">
                        <h3>关于</h3>
                        <p>G-Show Live是一个基于NodeJS开发的直播平台，平台内预测由之前赛季数据，python进行分析与数据挖掘得到。</p>
                        <p>本平台前台使用REACT框架+蚂蚁金融的ANTD3.x版本的UI库搭建而成，后台则使用NODE中的KOA2框架搭建而成，为JS全栈开发项目。</p>
                        <p>时间与技术有限，目前本人开发的本平台仅支持同时进入一个直播间，直播间分为图文直播区以及房间内用户自由讨论区，要进入其他直播间，必须先退出（即关闭当前直播间标签页），后再进入其他直播间</p>
                        <p>主播或超管可开设平台小游戏，用户都可参加，之后由主播或超管关闭并结算游戏，用户可凭此获得积分，进行礼品兑换。</p>
                    </Typing>
                </Card>
            </div>
        );
    }
}

export default About;