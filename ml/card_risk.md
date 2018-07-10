简介：自动调整超参数
===

调整机器学习模型的超参数有四种方法
1、手动（Manual） 依靠经验、猜测、直觉。很难达到准确结果

2、网格搜索（Grid Search）设置超参数值网格，并为每个组合训练模型并对验证结果进行评分，需要对网格中的所有参数进行训练验证，效率低

3、随机搜索（Random search）设置超参数值网格，随机组合参数训练模型并对结果进行打分。搜索迭代次数基于时间/资源设置

4、自动超参数调整（Automated Hyperparameter Tuning）使用诸如梯度下降，贝叶斯优化或进化算法之类的方法来进行最佳超参数的引导搜索。


贝叶斯优化入门
--
网格和随机搜索算法的问题在于这些是不知情的方法，因为它们不使用目标函数中不同超参数值以往产生的结果（记住目标函数接受的超参数并返回模型交叉验证分数）。
我们能够记录每组超参数和目标函数的结果，但是算法不会通过该信息选择下一个超参数值。
也就是说，如果我们能够得到过去的结果，那么我们应该用它们来推断出最有效的超参数值，并明智地选择下一个值来尝试花费更多的迭代来评估最有可能的值。
评估目标函数中的超参数非常耗时，贝叶斯优化算法的概念是通过基于先前结果去选择下一个超参数值来限制对评估函数的调用。
这使得算法花费更多时间来评估有希望的超参数值并且在超参数空间的低评分区域中花费更少的时间。

贝叶斯优化的四个部分
--
1、目标功能（Objective Function）接受输入（超参数）并返回分数以最小化或最大化（交叉验证分数）

2、域空间（Domain space）超参数范围

3、优化算法（Optimization Algorithm）用于构造代理函数的方法，并选择要评估的下一个值

4、结果（Results）超参数、分数键值对，用于构建代理函数算法

唯一的区别是，现在我们的目标函数将返回一个得分最小化（这只是优化领域的惯例），我们的域空间将是概率分布而不是超参数网格，优化算法将是一个知情的方法，
使用过去的结果来选择要评估的下一个超参数值。

Hyperopt
--
python开源库，使用Tree Parzen Estimator算法实现贝叶斯优化，以构建代理函数并选择下一个超参数值以在目标函数中进行评估。

Gradient Boosting Machine(GBM)
--
我们将使用梯度booosting机（GBM）作为我们的模型来调整LightGBM库。
GBM是我们对模型的选择，因为它对这些类型的问题表现得非常好（如排行榜上所示），并且因为性能在很大程度上取决于超参数值的选择。

Cross Validation with Early Stopping
--
与随机和网格搜索一样，我们将使用5倍交叉验证对训练数据评估每组超参数。
GBM模型将通过早期停止进行训练，其中评估器被添加到整体中，直到验证分数100次迭代没有变化（添加估算器）。

Dataset and Approach
--
我们将使用有限的数据部分 - 10000个训练数据和6000个测试数据。这样能够使notebook中的优化在合理的时间内完成。
稍后在notebook中，我将展示针对简化数据集的1000次贝叶斯超参数优化迭代的结果，然后我们将看到这些结果是否转换为完整数据集（来自此内核）。
这里开发的函数可以在任何数据集上运行或运行，或者与任何机器学习模型一起使用（只需对细节进行微小更改），并且使用较小的数据集将允许我们学习所有概念。
目前正在完整数据集上运行500次贝叶斯超参数优化迭代，并在搜索完成时使结果可用。

#### 贝叶斯优化应用于自动超参数调整demo：
```
# Data manipulation
import pandas as pd
import numpy as np

# Modeling
import lightgbm as lgb

# Evaluation of the model
from sklearn.model_selection import KFold, train_test_split
from sklearn.metrics import roc_auc_score

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns

plt.rcParams['font.size'] = 18
%matplotlib inline

# Governing choices for search
N_FOLDS = 5
MAX_EVALS = 5
```

进行交叉验证，扩充数据集

```
features = pd.read_csv('../input/home-credit-default-risk/application_train.csv')

# Sample 16000 rows (10000 for training, 6000 for testing)
features = features.sample(n = 16000, random_state = 42)

# Only numeric features
features = features.select_dtypes('number')

# Extract the labels
labels = np.array(features['TARGET'].astype(np.int32)).reshape((-1, ))
features = features.drop(columns = ['TARGET', 'SK_ID_CURR'])

# Split into training and testing data
train_features, test_features, train_labels, test_labels = train_test_split(features, labels, test_size = 6000, random_state = 42)

print('Train shape: ', train_features.shape)
print('Test shape: ', test_features.shape)

train_features.head()
```
建立基础模型

首先，我们可以创建一个具有超参数默认值的模型，并使用早期停止的交叉验证对其进行评分。
使用cv LightGBM功能需要创建数据集。

```
model = lgb.LGBMClassifier(random_state=50)

# Training set
train_set = lgb.Dataset(train_features, label = train_labels)
test_set = lgb.Dataset(test_features, label = test_labels)
# Default hyperparamters
hyperparameters = model.get_params()

# Using early stopping to determine number of estimators.
del hyperparameters['n_estimators']

# Perform cross validation with early stopping
cv_results = lgb.cv(hyperparameters, train_set, num_boost_round = 10000, nfold = N_FOLDS, metrics = 'auc', 
           early_stopping_rounds = 100, verbose_eval = False, seed = 42)

# Highest score
best = cv_results['auc-mean'][-1]

# Standard deviation of best score
best_std = cv_results['auc-stdv'][-1]

print('The maximium ROC AUC in cross validation was {:.5f} with std of {:.5f}.'.format(best, best_std))
print('The ideal number of iterations was {}.'.format(len(cv_results['auc-mean'])))
```

现在我们可以评估测试数据的基础模型

```
# Optimal number of esimators found in cv
model.n_estimators = len(cv_results['auc-mean'])

# Train and make predicions with model
model.fit(train_features, train_labels)
preds = model.predict_proba(test_features)[:, 1]
baseline_auc = roc_auc_score(test_labels, preds)

print('The baseline model scores {:.5f} ROC AUC on the test set.'.format(baseline_auc))
```

建立目标函数（Objective Function）

```
import csv
from hyperopt import STATUS_OK
from timeit import default_timer as timer

def objective(hyperparameters):
    """Objective function for Gradient Boosting Machine Hyperparameter Optimization.
       Writes a new line to `outfile` on every iteration"""
    
    # Keep track of evals
    global ITERATION
    
    ITERATION += 1
    
    # Using early stopping to find number of trees trained
    if 'n_estimators' in hyperparameters:
        del hyperparameters['n_estimators']
    
    # Retrieve the subsample
    subsample = hyperparameters['boosting_type'].get('subsample', 1.0)
    
    # Extract the boosting type and subsample to top level keys
    hyperparameters['boosting_type'] = hyperparameters['boosting_type']['boosting_type']
    hyperparameters['subsample'] = subsample
    
    # Make sure parameters that need to be integers are integers
    for parameter_name in ['num_leaves', 'subsample_for_bin', 'min_child_samples']:
        hyperparameters[parameter_name] = int(hyperparameters[parameter_name])

    start = timer()
    
    # Perform n_folds cross validation
    cv_results = lgb.cv(hyperparameters, train_set, num_boost_round = 10000, nfold = N_FOLDS, 
                        early_stopping_rounds = 100, metrics = 'auc', seed = 50)

    run_time = timer() - start
    
    # Extract the best score
    best_score = cv_results['auc-mean'][-1]
    
    # Loss must be minimized
    loss = 1 - best_score
    
    # Boosting rounds that returned the highest cv score
    n_estimators = len(cv_results['auc-mean'])
    
    # Add the number of estimators to the hyperparameters
    hyperparameters['n_estimators'] = n_estimators

    # Write to the csv file ('a' means append)
    of_connection = open(OUT_FILE, 'a')
    writer = csv.writer(of_connection)
    writer.writerow([loss, hyperparameters, ITERATION, run_time, best_score])
    of_connection.close()

    # Dictionary with information for evaluation
    return {'loss': loss, 'hyperparameters': hyperparameters, 'iteration': ITERATION,
            'train_time': run_time, 'status': STATUS_OK}
```

空间域

```
from hyperopt import hp
from hyperopt.pyll.stochastic import sample
# Create the learning rate
learning_rate = {'learning_rate': hp.loguniform('learning_rate', np.log(0.005), np.log(0.2))}

# 从分布中抽取10000个样本来可视化学习率。
learning_rate_dist = []

# Draw 10000 samples from the learning rate domain
for _ in range(10000):
    learning_rate_dist.append(sample(learning_rate)['learning_rate'])
    
plt.figure(figsize = (8, 6))
sns.kdeplot(learning_rate_dist, color = 'red', linewidth = 2, shade = True);
plt.title('Learning Rate Distribution', size = 18); plt.xlabel('Learning Rate', size = 16); plt.ylabel('Density', size = 16);

```

条件域

在Hyperopt中，我们可以使用嵌套的条件语句来指示依赖于其他超参数的超参数。
例如，“goss”boosting_type不能使用子采样，因此当我们设置boosting_type分类变量时，我们必须将子样本设置为1.0，而对于其他增强类型，它是0.5和1.0之间的浮点数。

```
# boosting type domain 
boosting_type = {'boosting_type': hp.choice('boosting_type', 
                                            [{'boosting_type': 'gbdt', 'subsample': hp.uniform('subsample', 0.5, 1)}, 
                                             {'boosting_type': 'dart', 'subsample': hp.uniform('subsample', 0.5, 1)},
                                             {'boosting_type': 'goss', 'subsample': 1.0}])}

# Draw a sample
hyperparams = sample(boosting_type)
hyperparams
```

我们需要将boosting_type和subsample都设置为参数字典中的顶级键。
我们可以使用Python dict.get方法，默认值为1.0。
这意味着如果字典中不存在该键，则返回的值将是默认值（1.0）。

```
# Retrieve the subsample if present otherwise set to 1.0
subsample = hyperparams['boosting_type'].get('subsample', 1.0)

# Extract the boosting type
hyperparams['boosting_type'] = hyperparams['boosting_type']['boosting_type']
hyperparams['subsample'] = subsample

hyperparams

```
gbm无法使用嵌套字典，因此我们需要将boosting_type和subsample设置为顶级键。
嵌套条件允许我们根据其他超参数使用一组不同的超参数。
例如，我们可以通过使用嵌套条件来探索具有完全不同的超参数集的不同模型。
唯一的要求是第一个嵌套语句必须基于选择超参数（选择可以是模型的类型）。

完整的贝叶斯域（Complete Bayesian Domain）

总共有十个超参数优化
```
# Define the search space
space = {
    'boosting_type': hp.choice('boosting_type', 
                                            [{'boosting_type': 'gbdt', 'subsample': hp.uniform('gdbt_subsample', 0.5, 1)}, 
                                             {'boosting_type': 'dart', 'subsample': hp.uniform('dart_subsample', 0.5, 1)},
                                             {'boosting_type': 'goss', 'subsample': 1.0}]),
    'num_leaves': hp.quniform('num_leaves', 20, 150, 1),
    'learning_rate': hp.loguniform('learning_rate', np.log(0.01), np.log(0.5)),
    'subsample_for_bin': hp.quniform('subsample_for_bin', 20000, 300000, 20000),
    'min_child_samples': hp.quniform('min_child_samples', 20, 500, 5),
    'reg_alpha': hp.uniform('reg_alpha', 0.0, 1.0),
    'reg_lambda': hp.uniform('reg_lambda', 0.0, 1.0),
    'colsample_bytree': hp.uniform('colsample_by_tree', 0.6, 1.0),
    'is_unbalance': hp.choice('is_unbalance', [True, False]),
}
```

从域中采样的示例

- 我们需要将顶级键分配给GBM理解的关键字

优化算法

历史结果

实践中的自动超参数优化



