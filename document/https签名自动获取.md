## 说明

`[domain] 为网站域名，注意对应修改`

## 准备工作

- 安装openssl
- 创建存放ssl证书文件夹`mkdir ssl`

## 创建账号

`openssl genrsa 4096 > account.key`

## 创建CSR文件

- 创建域名私钥

`openssl genrsa 4096 > [domain].key`

- 生成 CSR 文件

    - 单域名
    
    `openssl req -new -sha256 -key domain.key -subj "/CN=[domain].com" > domain.csr`
    - 多域名
    
    `openssl req -new -sha256 -key domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:[domain].com,DNS:www.[domain].com,DNS:subdomain.[domain].com")) > domain.csr`

## 配置验证服务

- 创建验证文件夹

`mkdir -p data/challenges/`

- 再配置一个 HTTP 服务，例如 Nginx：

```
server {
  server_name www.[domain].com [domain].com subdomian.[domain].com;
  location ^~ /.well-known/acme-challenge/ {
    #存放验证文件的目录，需自行更改为对应目录
    alias /root/ssl/data/challenges/;                
    try_files $uri =404;
  }
  location / {
    rewrite ^/(.*)$ https://[domain].com/$1 permanent;
  }
}
```

## 签发证书

```
wget https://raw.githubusercontent.com/diafygi/acme-tiny/master/acme_tiny.py
python acme_tiny.py --account-key ./account.key --csr ./yuleonstar.com.csr --acme-dir /root/ssl/data/challenges/ > ./signed.crt
openssl dhparam -out dhparams.pem 2048
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
cat signed.crt intermediate.pem > chained.pem
```

## 配置nginx

```
user root;
worker_processes  4;

error_log  /var/log/nginx/error.log warn;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;
    #gzip  on;
server {
  listen       80;
  server_name www.[domain].com [domain].com;
  location ^~ /.well-known/acme-challenge/ {
    #存放验证文件的目录，需自行更改为对应目录
    alias /root/ssl/data/challenges/;
    try_files $uri =404;
  }
  location / {
    rewrite ^/(.*)$ https://[domain].com/$1 permanent;
  }
}

server {
  listen 443;
  server_name [domain], www.[domain];
  ssl on;
  ssl_certificate /root/ssl/chained.pem;          #根据你的路径更改
  ssl_certificate_key /root/ssl/[domain].key;       #根据你的路径更改
  ssl_session_timeout 5m;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA;
  ssl_session_cache shared:SSL:50m;
  ssl_dhparam /root/ssl/dhparams.pem;        #根据你的路径更改
  ssl_prefer_server_ciphers on;
            location / {
                    include        uwsgi_params;
                    uwsgi_pass     127.0.0.1:27456;
            }

            location /static/ {
                alias  /root/myweb/static/;
            }
             location /media{
                alias /root/myweb/media;
        }

}

}
```


## 配置自动更新

- 创建自动更新脚本

```
touch ./renew_cert.sh
chmod a+x ./renew_cert.sh
```

- 添加文件内容

```
python /root/ssl/acme_tiny.py --account-key /root/ssl/account.key --csr /root/ssl/[domain].csr --acme-dir /root/ssl/data/challenges/ > /root/ssl/signed.crt || exit
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > /root/ssl/intermediate.pem
cat /root/ssl/signed.crt /root/ssl/intermediate.pem > /root/ssl/chained.pem
nginx -s reload
```
