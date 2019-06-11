" Specify a directory for plugins
" - For Neovim: ~/.local/share/nvim/plugged
" - Avoid using standard Vim directory names like 'plugin'
call plug#begin('~/.vim/plugged')

Plug 'scrooloose/nerdtree', { 'on':  'NERDTreeToggle' }
Plug 'Xuyuanp/nerdtree-git-plugin'
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --all' }
" Plug 'davidhalter/jedi-vim'
" Plug 'maralla/completor.vim'
" Plug 'maralla/completor-neosnippet'
Plug 'w0rp/ale'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'majutsushi/tagbar'
Plug 'tpope/vim-fugitive'
Plug 'sheerun/vim-polyglot'
Plug 'google/yapf'
Plug 'fisadev/vim-isort'
Plug 'morhetz/gruvbox'
Plug 'fatih/vim-go' 
Plug 'godlygeek/tabular'
Plug 'plasticboy/vim-markdown'
Plug 'Valloric/YouCompleteMe', {'do': './install.py'}
Plug 'Yggdroot/indentLine'
Plug 'Raimondi/delimitMate'

" Initialize plugin system
call plug#end()

" CONFIG AREA
"
" NERDTree Config
map <C-t> :NERDTreeToggle<CR>
let g:NERDTreeDirArrowExpandable = '▸'
let g:NERDTreeDirArrowCollapsible = '▾'
let NERDTreeIgnore=['\.pyc$', '\~$'] "ignore files in NERDTree

" Python PEP8
" enable syntax highlighting
syntax enable

" show line numbers
set number

" set tabs to have 4 spaces
set ts=4

" indent when moving to the next line while writing code
set autoindent

" expand tabs into spaces
set expandtab

" when using the >> or << commands, shift lines by 4 spaces
set shiftwidth=4

" show a visual line under the cursor's current line
set cursorline

" show the matching part of the pair for [] {} and ()
set showmatch

" enable all Python syntax highlighting features
let python_highlight_all = 1 

" Support UTF-8 
set encoding=utf-8

" IndentLine Config
let g:indentLine_enabled = 0
let g:indentLine_char = '┆'
let g:indentLine_leadingSpaceChar = '·'
let g:indentLine_concealcursor = 'inc'
let g:indentLine_conceallevel = 2

" YouCompleteMe Configuration
" Jedi
set completeopt-=preview
let g:ycm_python_binary_path = 'python'
let g:ycm_autoclose_preview_window_after_completion = 1

" 是否开启语义补全
let g:ycm_seed_identifiers_with_syntax = 1

" 是否在注释中也开启补全
let g:ycm_complete_in_comments = 1
let g:ycm_collect_identifiers_from_comments_and_strings = 0

" 字符串中也开启补全
let g:ycm_complete_in_strings = 1

" Default select first choice
" let g:ycm_key_invoke_completion = '<TAB>'

" 回车确认选择
let g:ycm_key_list_stop_completion = ['<CR>']

" ALE CONFIG
let g:ale_sign_column_always = 1
let g:ale_set_highlights = 0

let g:ale_sign_error = '✗'
let g:ale_sign_warning = '⚡'

let g:ale_statusline_format = ['✗ %d', '⚡ %d', '✔ OK']

let g:ale_echo_msg_error_str = 'E'
let g:ale_echo_msg_warning_str = 'W'
let g:ale_echo_msg_format = '[%linter%] %s [%severity%]'

nmap sp <Plug>(ale_previous_wrap)
nmap sn <Plug>(ale_next_wrap)

let g:ale_linters = {
\   'python': ['flake8'],
\}

let g:ale_python_flake8_options = "--ignor='E501'"

let g:ale_fixers = {
\   'python': ['isort', ],
\}

" Airline Configuration
let g:airline#extensions#tabline#enabled = 1
let g:airline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#buffer_nr_show = 1

nnoremap <C-N> :bn<CR>
nnoremap <C-P> :bp<CR>

let g:airline#extensions#whitespace#enabled = 0
let g:airline#extensions#whitespace#symbol = '!'

" Tagbar Configuration
nmap <F8> :TagbarToggle<CR>

" FZF Configuration
nnoremap ff :FZF<CR>

" Spilt Navigation
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" yapf Configuration
" autocmd FileType python set formatprg=yapf
" autocmd BufWritePre *.py silent normal mzgggqG`z
" nnoremap ,, :w<cr>

" isort Configuration
command! -range=% Isort :<line1>,<line2>! isort -
nnoremap <C-I> :%!isort -<CR>

" Themes Configuration
colorscheme gruvbox
set background=dark

" Go Guru
"

" Markdown Config
let g:vim_markdown_folding_disabled = 1

" 透明设置 
" hi Normal ctermbg=None 

" 
set foldmethod=indent
set foldlevel=99
 
" press space to fold/unfold code
nnoremap <space> za
vnoremap <space> zf
