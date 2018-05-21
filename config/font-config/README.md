字体环境安装配置
===============

manjaro
-------
####安装fcitx
`yaourt fcitx`
`sudo pacman -S fcitx-configtool, fcitx-im, fcitx-libpinyin`
`vi /etc/environment`
`sudo vi /etc/environment`
####添加
```
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
```
####使环境生效
`source /etc/environment`
