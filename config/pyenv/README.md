# pyenv安装
首先安装oh my zsh

```
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshenv
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshenv
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.zshenv
exec "$SHELL"
pyenv
-- centos
sudo yum install zlib-devel bzip2 bzip2-devel readline-devel sqlite sqlite-devel openssl-devel xz xz-devel libffi-devel
sudo yum install compat-openssl10-devel --allowerasing
-- centos
mkdir -p .pyenv/cache
wget https://www.python.org/ftp/python/3.6.5/Python-3.6.5.tar.xz
mv Python-3.6.5.tar.xz .pyenv/cache
pyenv install 3.6.5
git clone https://github.com/pyenv/pyenv-virtualenv.git $(pyenv root)/plugins/pyenv-virtualenv
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.zshenv
exec "$SHELL"
pyenv versions
pyenv virtualenv 3.6.5 venv-3.6.5

```
