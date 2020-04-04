import time
dt = "Tue Oct 22 2019 8:00"

#转换成时间数组
timeArray = time.strptime(dt, "%a %b %d %Y %H:%M")
#转换成新的时间格式(20160505-20:28:54)
timestamp = time.mktime(timeArray)

print (timestamp)
