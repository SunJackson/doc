Tensorflow
==

## [机器学习术语表][3]


[Tensorflow入门链接][1]

[Tensorflow models链接][2]



![TensorFlow API 层的编程堆栈](image/tensorflow_programming_environment.png)

Estimator
==
### 创建一个或多个输入函数
```
创建输入函数来提供用于训练、评估和预测的数据
    输入函数是返回 tf.data.Dataset 对象的函数（可以以任何方式生成建议使用 TensorFlow 的 Dataset API，它可以解析各种数据）
    格式：features,label
        features - Python 字典，其中：
            每个键都是特征的名称。
            每个值都是包含此特征所有值的数组。
        label - 包含每个样本的标签值的数组。
```
#### 简单的实现
```
def input_evaluation_set():
    features = {'SepalLength': np.array([6.4, 5.0]),
                'SepalWidth':  np.array([2.8, 2.3]),
                'PetalLength': np.array([5.6, 3.3]),
                'PetalWidth':  np.array([2.2, 1.0])}
    labels = np.array([2, 1])
    return features, labels
```

### 定义模型的特征列
```
特征列是一个对象，用于说明模型应该如何使用特征字典中的原始输入数据。在构建 Estimator 模型时，您会向其传递一个特征列
的列表，其中包含您希望模型使用的每个特征。tf.feature_column 模块提供很多用于向模型表示数据的选项。
```

```
# Feature columns describe how to use the input.
my_feature_columns = []
for key in train_x.keys():
    my_feature_columns.append(tf.feature_column.numeric_column(key=key))
```
### 实例化 Estimator，指定特征列和各种超参数

>TensorFlow 提供了几个预创建的分类器 Estimator

> - tf.estimator.DNNClassifier：适用于执行多类别分类的深度模型。

> - tf.estimator.DNNLinearCombinedClassifier：适用于宽度和深度模型。

> - tf.estimator.LinearClassifier：适用于基于线性模型的分类器。

### 训练、评估和预测

- 训练模型。
- 评估经过训练的模型。
- 使用经过训练的模型进行预测。

如何保存和恢复通过 Estimator 构建的 TensorFlow 模型
=============
- 检查点：这种格式依赖于创建模型的代码。

- [SavedModel][4]：这种格式与创建模型的代码无关。

## 保存经过部分训练的模型
### Estimator 自动将以下内容写入磁盘：

- 检查点：训练期间所创建的模型版本。
- 事件文件：其中包含 TensorBoard 用于创建可视化图表的信息

```
要指定 Estimator 在其中存储其信息的顶级目录，请为任何 Estimator 的构造函数的可选 model_dir 参数分配一个值
classifier = tf.estimator.DNNClassifier(
    feature_columns=my_feature_columns,
    hidden_units=[10, 10],
    n_classes=3,
    model_dir='models/path')
```

#### 默认检查点目录


>如果您未在 Estimator 的构造函数中指定 model_dir，则 Estimator 会将检查点文件写入由 Python 的 tempfile.mkdtemp 函数选择的临时目录
中


#### 检查点频率

>默认情况下，Estimator 按照以下时间安排将检查点保存到 model_dir 中：

- 每 10 分钟（600 秒）写入一个检查点。
- 在 train 方法开始（第一次迭代）和完成（最后一次迭代）时写入一个检查点。
- 只在目录中保留 5 个最近写入的检查点。

>可以通过执行下列步骤来更改默认时间

- 创建一个 RunConfig 对象来定义所需的时间安排。
- 在实例化 Estimator 时，将该 RunConfig 对象传递给 Estimator 的 config 参数。

```
my_checkpointing_config = tf.estimator.RunConfig(
    save_checkpoints_secs = 20*60,  # Save checkpoints every 20 minutes.
    keep_checkpoint_max = 10,       # Retain the 10 most recent checkpoints.
)

classifier = tf.estimator.DNNClassifier(
    feature_columns=my_feature_columns,
    hidden_units=[10, 10],
    n_classes=3,
    model_dir='models/path',
    config=my_checkpointing_config)
```

### 恢复模型

第一次调用 Estimator 的 train 方法时，TensorFlow 会将一个检查点保存到 model_dir 中。随后每次调用 Estimator 的 train、eval 或 
predict 方法时，都会发生下列情况：

- Estimator 通过运行 model_fn() 构建模型图。(要详细了解 model_fn()，请参阅创建自定义 Estimator)
- Estimator 根据最近写入的检查点中存储的数据来初始化新模型的权重。

一旦存在检查点，TensorFlow 就会在您每次调用 train()、evaluate() 或 predict() 时重建模型。

![恢复模型](image/subsequent_calls.png)

### 避免不当恢复

>通过检查点恢复模型的状态这一操作仅在模型和检查点兼容时可行(当模型重要参数发生变化时，无法检查点恢复)

解决方案
- 要运行实验（训练并比较略微不同的模型版本），请保存一份创建每个 model-dir 所需的代码的副本，同时可能需要为每个版本创建一个单独的 git 
分支。这种区分将有助于保证检查点的可恢复性。

- 以 SavedModel 格式导出和导入模型，这是一种独立于语言且可恢复的序列化格式

更多信息 [保存和恢复][4]

特征列
==

#### 特征列将各种原始数据转换为 Estimator 可以使用的格式

## 深度神经网络的输入

> 由于深度神经网络各个神经元需要对输入参数进行运算，因此深度神经网络的输入数据必须为数字，但原始很多数据集是类别信息，此时需要对类别信息
进行转换将分类值表示为简单的矢量

## 特征列

> 特征列在输入数据（由 input_fn 返回）与模型之间架起了桥梁

> 要创建特征列，请调用 tf.feature_column 模块的函数。本文档介绍了该模块中的九个函数。如下图所示，所有九个函数都会返回一个 Categorical-Column 
或一个 Dense-Column 对象，但却不会返回 bucketized_column，后者继承自这两个类：

![特征列方法](image/some_constructors.jpg "特征列方法")

### 数值列

- 转化数值类型  默认数据类型 (tf.float32)   
- dtype 参数  指定非默认数据类型

### 分桶列

- 将数据进行矢量划分，用 0 1 阶段表示数据分布
- 调用 tf.feature_column.numeric_column

优点
```
该分类将单个输入数字分成了一个四元素矢量。因此，模型现在可以学习四个单独的权重，而非仅仅一个；
相比一个权重，四个权重能够创建一个内容更丰富的模型。更重要的是，借助分桶，模型能够清楚地区分不同年份类别，
因为仅设置了一个元素 (1)，其他三个元素则被清除 (0)。当我们仅将单个数字（年份）用作输入时，模型只能学习线性关系。
因此，分桶为模型提供了可用于学习的额外灵活性。
```

示例代码
```
# First, convert the raw input to a numeric column.
numeric_feature_column = tf.feature_column.numeric_column("Year")

# Then, bucketize the numeric column on the years 1960, 1980, and 2000.
bucketized_feature_column = tf.feature_column.bucketized_column(
    source_column = numeric_feature_column,
    boundaries = [1960, 1980, 2000])
```
### 分类标识列

- 分桶列的一种特殊情况
- 每个分桶表示一个唯一整数
- 用数字将类别区分开
- 调用 tf.feature_column.categorical_column_with_identity

### 分类词汇列

- 将字符串表示为独热矢量
- 分类词汇列就像是分类标识列的枚举版本


TensorFlow 提供了两种不同的函数来创建分类词汇列

- tf.feature_column.categorical_column_with_vocabulary_list
- tf.feature_column.categorical_column_with_vocabulary_file

```
categorical_column_with_vocabulary_list 根据明确的词汇表将每个字符串映射到一个整数
当list过长时采用 categorical_column_with_vocabulary_file （每个单词一行）
```

### 经过哈希处理的列

- 当类别的数量非常大，以至于无法为每个词汇或整数设置单独的类别（因为这会消耗太多内存）
- tf.feature_column.categorical_column_with_hash_bucket 函数使您能够指定类别的数量

```
虽然会导致不同特征被hash到同一个类别，哈希类别为模型提供了一些分隔方式。如果通过其他特征依然能够将目标区分开，这样做能够适当减少内存损耗。
```


### 组合列

- 通过将多个特征组合为一个特征，模型可学习每个特征组合的单独权重


### 指标列和嵌入列

指标列

- 指标列和嵌入列从不直接处理特征，而是将分类列视为输入

- 指标列将每个类别视为独热矢量中的一个元素，其中匹配类别的值为 1，其余类别为 0

- 调用 tf.feature_column.indicator_column 创建指标列

嵌入列

随着类别数量的增加，使用指标列来训练神经网络变得不可行

- 嵌入列并非将数据表示为很多维度的独热矢量，而是将数据表示为低维度普通矢量，其中每个单元格可以包含任意数字，而不仅仅是 0 或 1。
通过使每个单元格能够包含更丰富的数字，嵌入列包含的单元格数量远远少于指标列。

- 嵌入列将分类数据存储在低于指标列的低维度矢量中。（我们只是将随机数字放入嵌入矢量中；由训练决定实际数字。）

- 嵌入矢量维数应该是类别数量的 4 次方根 （一般指南）

- 调用 tf.feature_column.embedding_column 来创建一个 embedding_column

#### [嵌入][5]是机器学习中的一个重要主题


## 传递特征列到 Estimator

并非所有 Estimator 都支持所有类型的 feature_columns 参数：

> - LinearClassifier 和 LinearRegressor：接受所有类型的特征列。
> - DNNClassifier 和 DNNRegressor：只接受密集列。其他类型的列必须封装在 indicator_column 或 embedding_column 中。
> - DNNLinearCombinedClassifier 和 DNNLinearCombinedRegressor：
>> - linear_feature_columns 参数接受任何特征列类型。
>> - dnn_feature_columns 参数只接受密集列。










[1]:https://www.tensorflow.org/get_started/premade_estimators?hl=zh-cn "Tensorflow入门链接"
[2]:https://github.com/tensorflow/models "Tensorflow models链接"
[3]:https://developers.google.com/machine-learning/glossary/?hl=zh-cn#TensorBoard "机器学习术语表"
[4]:https://www.tensorflow.org/programmers_guide/saved_model?hl=zh-cn "《TensorFlow 编程人员指南》- 保存和恢复"
[5]:https://www.tensorflow.org/programmers_guide/embedding?hl=zh-cn "《TensorFlow 编程人员指南》- 嵌入"
