shadowsocks 配置
===============
配置
------
```
pip install shadowsocks salsa20 -i https://pypi.douban.com/simple
sudo cp ./shadowsocks.service /etc/systemd/system/shadowsocks.service
sudo systemctl enable shadowsocks
sudo systemctl start shadowsocks
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

```
sudo vim .zshrc

添加：
alias setproxy="export ALL_PROXY=socks5://127.0.0.1:1080"
alias unsetproxy="unset ALL_PROXY"
alias ip="curl -i http://ip.cn"
```

CentOS安装python3
--
```
wget https://www.moerats.com/usr/shell/Python3/CentOS_Python3.6.sh && sudo sh CentOS_Python3.6.sh && sudo ln -s /usr/local/bin/python3 /usr/bin/python3 && sudo ln -s /usr/local/bin/pip3 /usr/bin/pip3
```

CentOS安装libsodium
--
```
yum install http://springdale.math.ias.edu/data/puias/computational/7/x86_64//libsodium-1.0.5-1.sdl7.x86_64.rpm

```