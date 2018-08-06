# 主题模型
---

## 1. 词向量
1）word2vec 原理、推导.

word2vec 是一种基于神经网络的分布表示方法。与分布表示相对的是符号表示。分布表示还可以通过矩阵分解来计算，比如SVD等，主题模型也可以计算词的压缩表示。word2vec 是对神经概率语言模型等的改进，

2）hierarchical softmax 与 negative sampling.

noise contrastive estimatio（NCE，噪声对比估计）是一种对观测数据的概率密度进行估计的方法，通过构造一些分布已知的 noise data，将概率密度的估计问题转化为一个 logistic regression 问题.

3）word2vec 与 TFIDF 比较；与 LDA 比较.

4）word2vec 怎么进行增量式训练.

gensim 可以进行增量式训练，C 版本的好像不行，但都无法改变词表的大小.

5）word2vec 目标函数？为什么没加正则.

6）word2vec 考虑词语的顺序？

7）CBOW 和 skip-gram 对比？为什么 skip-gram + negative sampling 效果好？

8）TextRank 原理
### 1) word2vec 原理、推导

用一个一层的神经网络(CBOW的本质)把one-hot形式的词向量映射为分布式形式的词向量，通过这种方法，我们可以快速地计算两个词汇的相似程度。

word2vec作为神经概率语言模型的输入，其本身其实是神经概率模型的副产品，是为了通过神经网络学习某个语言模型而产生的中间结果。
- “某个语言模型”指的是：
    - “CBOW”
    - “Skip-gram”。
- 具体学习过程会用到两个降低复杂度的近似方法
    - Hierarchical Softmax
    - Negative Sampling。
    
两个模型乘以两种方法，一共有四种实现。

### 2） hierarchical softmax 与 negative sampling

- Hierarchical Softmax
    - 一种对输出层进行优化的策略，输出层从原始模型的利用softmax计算概率值改为了利用Huffman树计算概率值。
    - 本质是把 N 分类问题变成 log(N)次二分类

- Negative Sampling（简写NEG，负采样）
    - Noise-Contrastive Estimation（简写NCE，噪声对比估计）的简化版本：把语料中的一个词串的中心词替换为别的词，构造语料 D 中不存在的词串作为负样本。因此在这种策略下，优化目标变为了：最大化正样本的概率，同时最小化负样本的概率。
    - 本质是预测总体类别的一个子集
    
### 3） word2vec 与 TFIDF 比较 与 LDA 比较

- word2vec
    - 用一个一层的神经网络(CBOW的本质)把one-hot形式的词向量映射为分布式形式的词向量，通过这种方法，我们可以快速地计算两个词汇的相似程度。
    
- TFIDF
    - 是一种用于资讯检索与资讯探勘的常用加权技术。TF-IDF是一种统计方法，用以评估一字词对于一个文件集或一个语料库中的其中一份文件的重要程度。字词的重要性随着它在文件中出现的次数成正比增加，但同时会随着它在语料库中出现的频率成反比下降。
- LDA
    - 一种主题模型，它可以将文档集 中每篇文档的主题以概率分布的形式给出，从而通过分析一些文档抽取出它们的主题（分布）出来后，便可以根据主题（分布）进行主题聚类或文本分类。同时，它是一种典型的词袋模型，即一篇文档是由一组词构成，词与词之间没有先后顺序的关系。

### 4） word2vec 怎么进行增量式训练


### 7) CBOW 和 skip-gram 对比？为什么 skip-gram + negative sampling 效果好？

- CBOW 和 skip-gram 对比

    - CBOW 模型 
    最大化概率 p(w|context(w))，用 context(w) 去预测 w
    - Skip-gram 模型 
    最大化概率 p(context(w)|w)，用 w 去预测 context(w)

### 8) TextRank 原理

TextRank 根据 PageRank 改编而来的算法

- PageRank

    <a><img src="https://latex.codecogs.com/png.latex?$$S(V_i)=(1-d)+d\cdot\sum_{j\in In(V_i)}\frac{1}{|Out(V_j)|}S(V_j)$$" title="PageRank" /></a>

    - <img src="https://latex.codecogs.com/png.latex?$d$"> 是阻尼系数，一般设置为 0.85。
    - <img src="https://latex.codecogs.com/png.latex?$In(V_i)$">  是存在指向网页 
    - <img src="https://latex.codecogs.com/png.latex?$i$"> 的链接的网页集合。
    - <img src="https://latex.codecogs.com/png.latex?$$Out(V_j)$">  是网页 <img src="https://latex.codecogs.com/png.latex?$j$"> 中的链接指向的网页的集合。
    - <img src="https://latex.codecogs.com/png.latex?$$|Out(V_j)|$">  是集合中元素的个数。
    
    PageRank 需要使用上面的公式多次迭代才能得到结果。初始时，可以设置每个网页的重要性为 1。
    
- TextRank

    <a><img src="https://latex.codecogs.com/png.latex?$$WS(V_i)=(1-d)+d\cdot\sum_{V_j\in In(Vi)}\frac{w_{ji}}{\sum_{V_k\in Out(V_j)}w_{jk}}WS(V_j)$$" title="TextRank" /></a>

    - <img src="https://latex.codecogs.com/png.latex?$w_{ij}$"> 就是是为图中节点 <img src="https://latex.codecogs.com/png.latex?$V_i$"> 到 <img src="https://latex.codecogs.com/png.latex?$V_j$"> 的边的权值 。
    - <img src="https://latex.codecogs.com/png.latex?$d$"> 依然为阻尼系数，代表从图中某一节点指向其他任意节点的概率，一般取值为0.85。
    - <img src="https://latex.codecogs.com/png.latex?$In(V_i)$"> 和 <img src="https://latex.codecogs.com/png.latex?$Out(V_i)$"> 也和 PageRank 类似，分别为指向节点 <img src="https://latex.codecogs.com/png.latex?$V_i$"> 的节点集合和从节点 <img src="https://latex.codecogs.com/png.latex?$V_i$">出发的边指向的节点集合。
    
在 TextRank 构建的图中，默认节点就是句子，权值 <img src="https://latex.codecogs.com/png.latex?$w_{ij}$"> 就是两个句子 <img src="https://latex.codecogs.com/png.latex?$S_i$"> 和 <img src="https://latex.codecogs.com/png.latex?$S_j$"> 的相似程度。两个句子的相似度使用下面的公式来计算：

<img src="https://latex.codecogs.com/png.latex?$$Similarity(S_i,S_j)=\frac{|{w_k| w_k \in S_i \& w_j \in S_j}|}{\log(|S_i|)+\log(|S_j|)}$$">

分子是在两个句子中都出现的单词的数量，<img src="https://latex.codecogs.com/png.latex?$$|S_i|$$"> 是句子 i 中的单词数。

使用 TextRank 算法计算图中各节点的得分时，同样需要给图中的节点指定任意的初值，通常都设为1。然后递归计算直到收敛，即图中任意一点的误差率小于给定的极限值时就可以达到收敛，一般该极限值取 0.0001。

#### 使用 TextRank 提取关键词

现在是要提取关键词，如果把单词视作图中的节点（即把单词看成句子），那么所有边的权值都为 0（两个单词没有相似性），所以通常简单地把所有的权值都设为 1。此时算法退化为 PageRank，因而把关键字提取算法称为 PageRank 也不为过。


参考资料

1）来斯惟博士论文：基于神经网络的词和文档语义向量表示方法研究.

2）来斯惟博客

3）[word2vec 中的数学原理详解](http://blog.csdn.net/itplus/article/details/37969519)

4）[noise contrastive estimation 文献](https://yinwenpeng.wordpress.com/2013/09/25/noise-contrastive-estimation/)

5）[噪声对比估计加速词向量训练](http://models.paddlepaddle.org/2017/04/21/nce-cost-README.html)

6）[TFIDF 概率解释](http://www.cnblogs.com/weidagang2046/archive/2012/10/22/tf-idf-from-probabilistic-view.html)


### 2 随机采样方法

参考资料：

1）[从随机过程到马尔可夫链蒙特卡罗方法](http://www.cnblogs.com/daniel-D/p/3388724.html)

---
## 算法竞赛
利用用户周围的各种类型数据来判断用户是否会按期还款，是一个二分类问题，采用 AUC 评测.

### 数据预处理
1. 缺失值

1）缺失量少，均值，中位数等填充；

2）缺失量多，离散化；

3）拟合模型填充.

2. 异常值

1）基于统计的方法：3 sigma

2）聚类方法

3）isolation forest 等算法.

##### 特征工程
1）连续特征；

2）离散特征；

3）特征组合；

##### 特征选择与特征降维
1）特征选择

过滤式、包裹式、嵌入式

2）特征降维

##### 模型
LR、RF、GBDT、XGBoost

1）为什么 LR 需要归一化或者取对数；为什么 LR 把特征离散化后效果更好？

参考：[连续特征的离散化：在什么情况下将连续的特征离散化之后可以获得更好的效果？](https://www.zhihu.com/question/31989952)

2）RF 和 GBDT 的区别

3）GBDT 和 XGBoost 的区别

参考：
1）[陈天奇：XGBoost 与 Boosted Tree](http://www.52cs.org/?p=429)

2）[机器学习算法中 GBDT 和 XGBoost 的区别有哪些](https://www.zhihu.com/question/41354392/answer/128008021?group_id=773629156532445184)

##### 模型组合
平均、bagging、stacking

##### 评测指标
AUC：AUC 的定义和本质，有哪些计算方法.