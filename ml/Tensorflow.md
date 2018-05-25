#Tensorflow

##Estimator
###创建一个或多个输入函数
```
创建输入函数来提供用于训练、评估和预测的数据
    输入函数是返回 tf.data.Dataset 对象的函数（可以以任何方式生成建议使用 TensorFlow 的 Dataset API，它可以解析各种数据）
    格式：features,label
        features - Python 字典，其中：
            每个键都是特征的名称。
            每个值都是包含此特征所有值的数组。
        label - 包含每个样本的标签值的数组。
```
####简单的实现
```
def input_evaluation_set():
    features = {'SepalLength': np.array([6.4, 5.0]),
                'SepalWidth':  np.array([2.8, 2.3]),
                'PetalLength': np.array([5.6, 3.3]),
                'PetalWidth':  np.array([2.2, 1.0])}
    labels = np.array([2, 1])
    return features, labels
```

###定义模型的特征列
###实例化 Estimator，指定特征列和各种超参数
###在 Estimator 对象上调用一个或多个方法，传递适当的输入函数作为数据的来源