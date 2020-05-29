

# *   **Team Per Game Stats**：每支队伍平均每场比赛的表现统计

# | 数据名 | 含义 |
# | --- | --- |
# | Rk -- Rank | 排名 |
# | G -- Games | 参与的比赛场数（都为 82 场） |
# | MP -- Minutes Played | 平均每场比赛进行的时间 |
# | FG--Field Goals | 投球命中次数 |
# | FGA--Field Goal Attempts | 投射次数 |
# | FG%--Field Goal Percentage | 投球命中次数 |
# | 3P--3-Point Field Goals | 三分球命中次数 |
# | 3PA--3-Point Field Goal Attempts | 三分球投射次数 |
# | 3P%--3-Point Field Goal Percentage | 三分球命中率 |
# | 2P--2-Point Field Goals | 二分球命中次数 |
# | 2PA--2-point Field Goal Attempts | 二分球投射次数 |
# | 2P%--2-Point Field Goal Percentage | 二分球命中率 |
# | FT--Free Throws | 罚球命中次数 |
# | FTA--Free Throw Attempts | 罚球投射次数 |
# | FT%--Free Throw Percentage | 罚球命中率 |
# | ORB--Offensive Rebounds | 进攻篮板球 |
# | DRB--Defensive Rebounds | 防守篮板球 |
# | TRB--Total Rebounds | 篮板球总数 |
# | AST--Assists | 助攻 |
# | STL--Steals | 抢断 |
# | BLK -- Blocks | 封盖 |
# | TOV -- Turnovers | 失误 |
# | PF -- Personal Fouls | 个犯 |
# | PTS -- Points | 得分 |

# *   **Opponent Per Game Stats**：所遇到的对手平均每场比赛的统计信息，所包含的统计数据与 **Team Per Game Stats** 中的一致，只是代表的是该球队对应的对手的统计信息

# *   **Miscellaneous Stats**：综合统计数据

# | 数据项 | 数据含义 |
# | --- | --- |
# | Rk (Rank) | 排名 |
# | Age | 队员的平均年龄 |
# | W (Wins) | 胜利次数 |
# | L (Losses) | 失败次数 |
# | PW (Pythagorean wins) | 基于毕达哥拉斯理论计算的赢的概率 |
# | PL (Pythagorean losses) | 基于毕达哥拉斯理论计算的输的概率 |
# | MOV (Margin of Victory) | 赢球次数的平均间隔 |
# | SOS (Strength of Schedule) | 用以评判对手选择与其球队或是其他球队的难易程度对比，0 为平均线，可以为正负数 |
# | SRS (Simple Rating System) | 简易评级系统，根据他们的积分差异对球队进行排名 |
# | ORtg (Offensive Rating) | 每 100 个比赛回合中的进攻比例 |
# | DRtg (Defensive Rating) | 每 100 个比赛回合中的防守比例 |
# | Pace (Pace Factor) | 每 48 分钟内大概会进行多少个回合 |
# | FTr (Free Throw Attempt Rate) | 罚球次数所占投射次数的比例 |
# | 3PAr (3-Point Attempt Rate) | 三分球投射占投射次数的比例 |
# | TS% (True Shooting Percentage) | 二分球、三分球和罚球的总共命中率 |
# | eFG% (Effective Field Goal Percentage) | 有效的投射百分比（含二分球、三分球） |
# | TOV% (Turnover Percentage) | 每 100 场比赛中失误的比例 |
# | ORB% (Offensive Rebound Percentage) | 球队中平均每个人的进攻篮板的比例 |
# | FT/FGA | 罚球所占投射的比例 |
# | eFG% (Opponent Effective Field Goal Percentage) | 对手投射命中比例 |
# | TOV% (Opponent Turnover Percentage) | 对手的失误比例 |
# | DRB% (Defensive Rebound Percentage) | 球队平均每个球员的防守篮板比例 |
# | FT/FGA (Opponent Free Throws Per Field Goal Attempt) | 对手的罚球次数占投射次数的比例 |




#  _Schedule_ 表格中所包含的数据为：

# | 数据项 | 数据含义 |
# | --- | --- |
# | Date | 比赛日期 |
# | Start (ET) | 比赛开始时间 |
# | Visitor/Neutral | 客场作战队伍 |
# | PTS | 客场队伍最后得分 |
# | Home/Neutral | 主场队伍 |
# | PTS | 主场队伍最后得分 |
# | Notes | 备注，表明是否为加时赛等 |

#  该表为处理后得到
# 19-20Schedule 表格中所包含的数据为：
# | 数据项 | 数据含义 |
# | --- | --- |
# | Date | 日期 |
# | Start (ET) | 开始时间 |
# | Vteam | 客场队伍 |
# | Hteam | 主场队伍 |


#  该表为最后结果
# 19-20Result 表格中所包含的数据为：
# | 数据项 | 数据含义 |
# | --- | --- |
# | date | 详细开始时间（转换为十三位时间戳） |
# | win | 胜利队伍 |
# | lose | 失败队伍 |
# | probability | 获胜概率 |

import ipython_genutils
import pandas as pd
import math
import csv
import random
import time
import numpy as np
from sklearn import linear_model
from sklearn.model_selection import cross_val_score


# 设置回归训练时所需用到的参数变量：



# 当每支队伍没有elo等级分时，赋予其基础elo等级分
base_elo = 1600
team_elos = {} 
team_stats = {}
X = []
y = []
# 存放数据的目录
folder = 'data' 


# 在最开始需要初始化数据，从 **T、O 和 M** 表格中读入数据，去除一些无关数据并将这三个表格通过`Team`属性列进行连接：



# 根据每支队伍的Miscellaneous Opponent，Team统计数据csv文件进行初始化
def initialize_data(Mstat, Ostat, Tstat):
    new_Mstat = Mstat.drop(['Rk', 'Arena'], axis=1)
    new_Ostat = Ostat.drop(['Rk', 'G', 'MP'], axis=1)
    new_Tstat = Tstat.drop(['Rk', 'G', 'MP'], axis=1)

    team_stats1 = pd.merge(new_Mstat, new_Ostat, how='left', on='Team')
    team_stats1 = pd.merge(team_stats1, new_Tstat, how='left', on='Team')
    return team_stats1.set_index('Team', inplace=False, drop=True)


# 获取每支队伍的`Elo Score`等级分函数，当在开始没有等级分时，将其赋予初始`base_elo`值：



def get_elo(team):
    try:
        return team_elos[team]
    except:
        # 当最初没有elo时，给每个队伍最初赋base_elo
        team_elos[team] = base_elo
        return team_elos[team]


# 定义计算每支球队的`Elo等级分`函数：



# 计算每个球队的elo值
def calc_elo(win_team, lose_team):
    winner_rank = get_elo(win_team)
    loser_rank = get_elo(lose_team)

    rank_diff = winner_rank - loser_rank
    exp = (rank_diff  * -1) / 400
    odds = 1 / (1 + math.pow(10, exp))
    # 根据rank级别修改K值
    if winner_rank < 2100:
        k = 32
    elif winner_rank >= 2100 and winner_rank < 2400:
        k = 24
    else:
        k = 16
    
    # 更新 rank 数值
    new_winner_rank = round(winner_rank + (k * (1 - odds)))      
    new_loser_rank = round(loser_rank + (k * (0 - odds)))
    return new_winner_rank, new_loser_rank


# 基于我们初始好的统计数据，及每支队伍的 **Elo score** 计算结果，建立对应 2018~2019 年常规赛和季后赛中每场比赛的数据集（在主客场比赛时，我们认为主场作战的队伍更加有优势一点，因此会给主场作战队伍相应加上 100 等级分）：


def  build_dataSet(all_data):
    print("Building data set..")
    X = []
    skip = 0
    for index, row in all_data.iterrows():

        Wteam = row['WTeam']
        Lteam = row['LTeam']

        #获取最初的elo或是每个队伍最初的elo值
        team1_elo = get_elo(Wteam)
        team2_elo = get_elo(Lteam)

        # 给主场比赛的队伍加上100的elo值
        if row['WLoc'] == 'H':
            team1_elo += 100
        else:
            team2_elo += 100

        # 把elo当为评价每个队伍的第一个特征值
        team1_features = [team1_elo]
        team2_features = [team2_elo]

        # 添加我们从basketball reference.com获得的每个队伍的统计信息
        for key, value in team_stats.loc[Wteam].iteritems():
            team1_features.append(value)
        for key, value in team_stats.loc[Lteam].iteritems():
            team2_features.append(value)

        # 将两支队伍的特征值随机的分配在每场比赛数据的左右两侧
        # 并将对应的0/1赋给y值
        # 由Elo score 的机制决定的，类似于一种人为设计好的特征提取方法
        if random.random() > 0.5:
            X.append(team1_features + team2_features)
            y.append(0)
        else:
            X.append(team2_features + team1_features)
            y.append(1)

        if skip == 0:
            print('X',X)
            skip = 1

        # 根据这场比赛的数据更新队伍的elo值
        new_winner_rank, new_loser_rank = calc_elo(Wteam, Lteam)
        team_elos[Wteam] = new_winner_rank
        team_elos[Lteam] = new_loser_rank
        # print("X",np.nan_to_num(X))
        # print("Y",y)
        # print("#################################################################")
    #将可能出现的异常NAN转换为0  防止异常发生
    return np.nan_to_num(X), y


# 最终在 main 函数中调用这些数据处理函数，使用 sklearn 的`Logistic Regression`方法建立回归模型：



if __name__ == '__main__':

    Mstat = pd.read_csv(folder + '/18-19Miscellaneous_Stat.csv')
    Ostat = pd.read_csv(folder + '/18-19Opponent_Per_Game_Stat.csv')
    Tstat = pd.read_csv(folder + '/18-19Team_Per_Game_Stat.csv')

    team_stats = initialize_data(Mstat, Ostat, Tstat)

    result_data = pd.read_csv(folder + '/2018-2019_result.csv')
    X, y = build_dataSet(result_data)

    # 训练网络模型
    print("Fitting on %d game samples.." % len(X))

    model = linear_model.LogisticRegression()
    model.fit(X, y)

    # 利用10折交叉验证计算训练正确率
    print("Doing cross-validation..")
    print(cross_val_score(model, X, y, cv = 10, scoring='accuracy', n_jobs=-1).mean())


# 最终利用训练好的模型在 19~20 年的常规赛数据中进行预测。
# 
# 利用模型对一场新的比赛进行胜负判断，并返回其胜利的概率：



def predict_winner(team_1, team_2, model):
    features = []

    # team 1，客场队伍
    features.append(get_elo(team_1))
    for key, value in team_stats.loc[team_1].iteritems():
        features.append(value)

    # team 2，主场队伍
    features.append(get_elo(team_2) + 100)
    for key, value in team_stats.loc[team_2].iteritems():
        features.append(value)

    features = np.nan_to_num(features)
    return model.predict_proba([features])


# 在 main 函数中调用该函数，并将预测结果输出



# 利用训练好的model在19_20年的比赛中进行预测

print('Predicting on new schedule..')
schedule1617 = pd.read_csv(folder + '/19-20Schedule.csv')
result = []
for index, row in schedule1617.iterrows():
    team1 = row['Vteam']
    team2 = row['Hteam']
    date =row['Date']+' '+row['Start (ET)']
    format_date=date[:-1]
    timeArray = time.strptime(format_date, "%a %b %d %Y %H:%M")
    timestamp = time.mktime(timeArray)*1000

    pred = predict_winner(team1, team2, model)
    prob = pred[0][0]
    if prob > 0.5:
        winner = team1
        loser = team2
        result.append([str(int(timestamp))+" \t",winner, loser, prob])
    else:
        winner = team2
        loser = team1
        result.append([str(int(timestamp))+" \t",winner, loser, 1 - prob])

with open('19-20Result.csv', 'w',newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['date','win', 'lose', 'probability'])
    writer.writerows(result)
    print('done.')


pd.read_csv('19-20Result.csv',header=0)



