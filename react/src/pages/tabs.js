import React from 'react'
import LoadableComponent from '../utils/LoadableComponent'
//const Test = React.lazy(() => import('./Test'));   //报错，就没用React.lazy了
const ButtonDemo = LoadableComponent(import('./ButtonDemo/index'), true);
const IconDemo = LoadableComponent(import('./IconDemo/index'), true);
const FeedbackDemo = LoadableComponent(import('./FeedbackDemo/index'), true);
const Users = LoadableComponent(import('./Users/index'), true);
const Collection = LoadableComponent(import('./LiveRooms/index'), true);
const MessageBoard = LoadableComponent(import('./MessageBoard/index'), true);
const Chat = LoadableComponent(import('./Chat/index'), true);
const About = LoadableComponent(import('./About/index'), true);
const Presents = LoadableComponent(import('./Presents/index'), true);
const PresentRecords = LoadableComponent(import('./PresentRecords/index'), true)
const Games = LoadableComponent(import('./Games/index'), true)
const GameRecords = LoadableComponent(import('./GameRecords/index'), true)
const menu = [
    // {
    //     name: 'antd',
    //     icon: 'ant-design',
    //     key: 'antd',
    //     children: [
    //         {
    //             name: '按钮',
    //             icon: '',
    //             key: 'ButtonDemo',
    //         },
    //         {
    //             name: '图标',
    //             icon: '',
    //             key: 'IconDemo',
    //         },
    //         {
    //             name: '反馈',
    //             icon: '',
    //             key: 'FeedbackDemo',
    //         },
    //     ]
    // },
    {
        name: '用户管理',
        icon: 'user',
        key: 'Users'
    },
    {
        name: '直播间',
        icon: 'bulb',
        key: 'Collection'
    },
    {
        name: '礼物兑换',
        icon: 'strikethrough',
        key: 'Presents'
    },
    {
        name: '兑换记录',
        icon: 'zoom-in',
        key: 'PresentRecords'
    },
    {
        name: '游戏中心',
        icon: 'dollar',
        key: 'Games'
    },
    {
        name: '游戏记录',
        icon: 'ordered-list',
        key: 'GameRecords'
    },
    {
        name: '留言板',
        icon: 'message',
        key: 'MessageBoard'
    },
    {
        name: '聊天室',
        icon: 'qq',
        key: 'Chat'
    },
    {
        name: '关于',
        icon: 'info-circle',
        key: 'About'
    }
]

const tabs = {
    // ButtonDemo: <ButtonDemo />,
    IconDemo: <IconDemo />,
    FeedbackDemo: <FeedbackDemo />,
    Users: <Users />,
    Collection: <Collection />,
    Presents: <Presents />,
    PresentRecords: <PresentRecords />,
    Games: <Games />,
    GameRecords: <GameRecords />,
    MessageBoard: <MessageBoard />,
    Chat: <Chat />,
    About: <About />,

}

export {
    menu,
    tabs
}