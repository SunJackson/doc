shadowsocks 配置
===============
配置
------
```
pip install shadowsocks, salsa20 -i https://pypi.douban.com/simple
sudo cp ./shadowsocks.service /etc/systemd/system/shadowsocks.service
systemctl enable /etc/systemd/system/shadowsocks.service
systemctl start /etc/systemd/system/shadowsocks.service
```
manjaro config
--------------------
```
Shadowsocks的systemd服务可在/etc/shadowsocks/里调用不同的conf-file.json（以conf-file为区分标志），
例： 在/etc/shadowsocks/shadowsocks.json配置文件，那么执行以下语句就可以调用该配置：
    systemctl start shadowsocks@shadowsocks
若需开机自启动：
    systemctl enable shadowsocks@shadowsocks
```

配置终端走代理
----

```angular2html
sudo vim .zshrc

添加：
alias setproxy="export ALL_PROXY=socks5://127.0.0.1:1080"
alias unsetproxy="unset ALL_PROXY"
alias ip="curl -i http://ip.cn"
```
