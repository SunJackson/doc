# [nginx](http://www.ttlsa.com/nginx/nginx-install-on-linux/)

### [安装](https://segmentfault.com/a/1190000007116797)
```
sudo yum install pcre* //如过你已经装了，请跳过这一步

sudo yum install openssl*

sudo rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm

sudo yum install -y nginx

rpm -ql nginx //来查看安装路径
```

### 启动

```
sudo systemctl start nginx.service

sudo systemctl enable nginx.service //设置开机启动
```

### Nginx配置信息
```
网站文件存放默认目录
/usr/share/nginx/html

网站默认站点配置
/etc/nginx/conf.d/default.conf

自定义Nginx站点配置文件存放目录
/etc/nginx/conf.d/

Nginx全局配置
/etc/nginx/nginx.conf

Nginx启动
nginx -c nginx.conf
```

### 方案

```
nginx利用uwsgi解析python
```