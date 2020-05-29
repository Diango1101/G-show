/*
 Navicat Premium Data Transfer

 Source Server         : G-Show Live
 Source Server Type    : MySQL
 Source Server Version : 80016
 Source Host           : localhost:3306
 Source Schema         : admin

 Target Server Type    : MySQL
 Target Server Version : 80016
 File Encoding         : 65001

*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for chats
-- ----------------------------
DROP TABLE IF EXISTS `chats`;
CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `username` varchar(32) DEFAULT NULL COMMENT '用户名',
  `userAvatar` varchar(128) DEFAULT NULL COMMENT '用户头像',
  `createTime` bigint(20) DEFAULT NULL COMMENT '创建时间',
  `content` varchar(512) DEFAULT NULL COMMENT '聊天内容',
  `roomId` int(11) DEFAULT NULL COMMENT '房间号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `type` int(8) DEFAULT NULL COMMENT '0(留言)、1(回复)',
  `createTime` bigint(20) DEFAULT NULL COMMENT '创建信息时间',
  `content` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '信息内容',
  `userId` int(11) DEFAULT NULL COMMENT '回复人id',
  `userIsAdmin` int(8) DEFAULT NULL COMMENT '回复人是否是管理员',
  `userName` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '回复人用户名',
  `userAvatar` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '回复人头像',
  `targetUserId` int(11) DEFAULT NULL COMMENT '被回复人id',
  `targetUserIsAdmin` int(8) DEFAULT NULL COMMENT '被回复人是否是管理员',
  `targetUserName` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '被回复人用户名',
  `targetUserAvatar` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '被回复人头像',
  `pid` int(11) DEFAULT '-1' COMMENT '父id',
  `likeNum` int(11) DEFAULT '0' COMMENT '赞的数量',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for scores
-- ----------------------------
DROP TABLE IF EXISTS `scores`;
CREATE TABLE `scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `createTime` bigint(20) DEFAULT NULL COMMENT '创建时间',
  `score` int(8) DEFAULT NULL COMMENT '分数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户密码',
  `registrationAddress` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '注册地址信息',
  `registrationTime` bigint(20) DEFAULT NULL COMMENT '注册时间',
  `lastLoginAddress` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '' COMMENT '最后登录地址信息',
  `lastLoginTime` bigint(20) DEFAULT NULL COMMENT '最后登录时间',
  `isAdmin` int(8) unsigned DEFAULT '0' COMMENT '是否是管理员',
  `isAnchor` int(8) unsigned DEFAULT '0' COMMENT '是否是主播',
  `avatar` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'http://localhost:8888/public/images/default.png' COMMENT '用户头像',
  `birth` bigint(20) DEFAULT NULL COMMENT '出生日期',
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '电话',
  `location` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '所在地',
  `gender` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '性别',
  `records` int(11) DEFAULT '0'  COMMENT '个人积分',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) COMMENT '唯一索引'
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for liverooms
-- ----------------------------
DROP TABLE IF EXISTS `liverooms`;
CREATE TABLE `liverooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '作品标题',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '作品描述',
  `createTime` bigint(20) DEFAULT NULL COMMENT '创建时间',
  `author` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '作者',
  `roomavatar` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '房间封面',
   `status` varchar(8) DEFAULT '1'  COMMENT '房间状态',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for lives
-- ----------------------------
DROP TABLE IF EXISTS `lives`;
CREATE TABLE `lives` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `userId` int(11) DEFAULT NULL COMMENT '用户id',
  `roomId` int(11) DEFAULT NULL COMMENT '房间号',
  `username` varchar(32) DEFAULT NULL COMMENT '用户名',
  `userAvatar` varchar(128) DEFAULT NULL COMMENT '用户头像',
  `createTime` bigint(20) DEFAULT NULL COMMENT '创建时间',
  `content` varchar(512) DEFAULT NULL COMMENT '聊天内容',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for presents
-- ----------------------------
DROP TABLE IF EXISTS `presents`;
CREATE TABLE `presents` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `presentName` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '礼物名字',
  `presentAvatar` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '礼物图片',
  `presentType` varchar(32) DEFAULT NULL COMMENT '礼物分类',
  `presentValue` int(11) DEFAULT NULL COMMENT '所需积分',
  `presentDesc` varchar(128) DEFAULT NULL COMMENT '礼物描述',
  `presentCounts` int(11) DEFAULT NULL COMMENT '剩余数量',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for presentsRecords
-- ----------------------------
DROP TABLE IF EXISTS `presentsRecords`;
CREATE TABLE `presentsRecords` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `presentId` int(11) DEFAULT NULL COMMENT '礼品id',
   `presentType` varchar(32) DEFAULT NULL COMMENT '礼品种类',
    `presentName` varchar(32) DEFAULT NULL COMMENT '礼品名字',
  `userId` int(11) DEFAULT NULL COMMENT '兑换用户Id',
  `counts` int(11) DEFAULT NULL COMMENT '兑换数量',
  `realCost` int(11) DEFAULT NULL COMMENT '实际消耗',
  `createTime` bigint(20) DEFAULT NULL COMMENT '兑换时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ----------------------------
-- Table structure for games
-- ----------------------------
DROP TABLE IF EXISTS `games`;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'gameid',
  `team1` varchar(32) DEFAULT NULL COMMENT 'team1',
  `team2`  varchar(32) DEFAULT NULL COMMENT 'team2',
  `preWinner`  varchar(32) DEFAULT NULL COMMENT '预测胜利队伍',
  `RealWinner`  varchar(32) DEFAULT NULL COMMENT '真实胜利队伍',
  `probablity` DECIMAL(16,15) DEFAULT NULL COMMENT '预测获胜比率',
  `gamedate` bigint(20) DEFAULT NULL COMMENT '比赛时间',
  `odds` DECIMAL(16,15) DEFAULT NULL COMMENT '赔率',
   `createTime` bigint(20) DEFAULT NULL COMMENT '兑换时间',
    `isSet` int(2) DEFAULT 0 COMMENT '是否已结算 默认0 未结算 必须结算了才能结束游戏',
   `status` int(2) DEFAULT 1 COMMENT '状态 默认1开启 0关闭',
   `userCounts` int(32) DEFAULT 0 COMMENT '参赛人数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- ----------------------------
-- Table structure for usergames
-- ----------------------------
DROP TABLE IF EXISTS `usergames`;
CREATE TABLE `usergames` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'gameid',
  `userId` int(11) DEFAULT NULL COMMENT '参加游戏用户Id',
  `gameId` int(11) DEFAULT NULL COMMENT '所参加游戏Id',
   `team1` varchar(32) DEFAULT NULL COMMENT 'team1',
  `team2`  varchar(32) DEFAULT NULL COMMENT 'team2',
   `RealWinner` varchar(32) DEFAULT NULL COMMENT 'team1',
   `preWinner` varchar(32) DEFAULT NULL COMMENT 'team1',
   `personalOdds` DECIMAL(3,2) DEFAULT 0 COMMENT '个人赔率',
  `userValue` int(11) DEFAULT NULL COMMENT '下注积分',
  `receiveValue` int(11) DEFAULT NULL COMMENT '获得积分',
    `createTime` bigint(20) DEFAULT NULL COMMENT '下注时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for tobeanchors
-- ----------------------------
DROP TABLE IF EXISTS `tobeanchors`;
CREATE TABLE `tobeanchors` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'tobeid',
  `userId` int(11) DEFAULT NULL COMMENT '申请用户Id',
 `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '直播间标题',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '直播间描述',
  `createTime` bigint(20) DEFAULT NULL COMMENT '创建时间',
  `author` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '主播名',
   `roomavatar` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '房间封面',
   `status` int(2) DEFAULT 0 COMMENT '状态 1申请通过 0申请中  默认0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for ports
-- ----------------------------
DROP TABLE IF EXISTS `ports`;
CREATE TABLE `ports` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `port` int(11) DEFAULT NULL COMMENT 'port',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;

/* 新建触发器  游戏结算时自动核算个人预测是否正确 */
drop trigger if exists SettlePersonalOdds

delimiter ;;
create trigger SettlePersonalOdds before update on  usergames
for each row
begin
	if(new.preWinner = old.preWinner) then
		if (new.RealWinner=new.preWinner)then
			set new.personalOdds=0.2;
		else
			set new.personalOdds=-0.2;
        end if;
	end if;
end;;
delimiter ;



