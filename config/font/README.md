字体环境安装配置
===============

manjaro
-------
#安装fcitx
```
yaourt fcitx
sudo pacman -S fcitx-configtool fcitx-im fcitx-libpinyin
sudo vim /etc/environment
```
#添加
```
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
```
#使环境生效
`source /etc/environment`

#安装输入法
`sudo pacman -S fcitx-sogoupinyin`
##若无法安装
###修改pacman.conf
`sudo vim /etc/pacman.conf`

```
[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
```
###若出现 无法提交处理 (无效或已损坏的软件包 (PGP 签名))
```
修改/etc/pacman.conf
注释 SigLevel=××××××
添加 SigLevel = Never
注意：如果害怕安全问题，可以在搞定这个包之后，再取消注释，恢复原来的SigLevel
```
