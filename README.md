### Porton

 &emsp;&emsp;Porton 是一个基于koa es6 mongo开发的数据监控开源系统，包含web、app、server错误日志上报,打点测速上报和数据访问统计、点击统计等多功能为一体的监控系统。

===================

##### 使用
---

1. 启动mongodb,如果没有，需要安装 [MonoDB](https://www.mongodb.org/).

&emsp;

2. `npm install & npm start`


##### 使用pm2运行

---

`pm2 start pm2.json`

---

附pm2运行命令：[https://github.com/Unitech/pm2](https://github.com/Unitech/pm2)

```
$ pm2 start app.js --watch      # Restart application on file change
$ pm2 start script.sh           # Start bash script
$ pm2 start app.js -- -a 34     # Start app and pass option -a 34
$ pm2 start app.json            # Start all applications declared in app.json
$ pm2 start my-python-script.py --interpreter python

$ pm2 list	#list all process

$ pm2 stop     <app_name|id|'all'|json_conf>
$ pm2 restart  <app_name|id|'all'|json_conf>
$ pm2 delete   <app_name|id|'all'|json_conf>
$ pm2 describe <id|app_name>

$ pm2 start app.js -i 0  # Enable load-balancer and cluster features
$ pm2 reload all           # Reload all apps in 0s manner
$ pm2 scale <app_name> <instance_number> # Increase / Decrease process number
```


