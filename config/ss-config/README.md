shadowsocks 配置
===============
`配置`
------
`pip install shadowsocks, salsa20 -i https://pypi.douban.com/simple
sudo cp ./shadowsocks.service /etc/systemd/system/shadowsocks.service
systemctl enable /etc/systemd/system/shadowsocks.service
systemctl start /etc/systemd/system/shadowsocks.service`

`manjaro config`
--------------------
Shadowsocks的systemd服务可在/etc/shadowsocks/里调用不同的conf-file.json（以conf-file为区分标志），例： 在/etc/shadowsocks/中创建了foo.json配置文件，那么执行以下语句就可以调用该配置：

    systemctl start shadowsocks@foo
若需开机自启动：

    systemctl enable shadowsocks@foo
