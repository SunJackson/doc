# Spark Kafka DStream

## 概述

- 数据来源网站更新时Url发生变化，导致UUID随之产生变化，因此会出现整体数据无法及时找回的情况
- 来源数据个别字段值发生变化，导致数据抖动，反复录入

## 方案

采用 Spark 对 Kafka 来源数据流进行实时处理，判断数据情况是否属于新增数据。


### 总体设计

新房爬虫获取到数据之后，发送给Kafka，Spark 从mysql获取kafka 的 offset 值， 对kafka请求数据，经过 Spark 脚本处理添加UUID后存入数据库，同时保存新的 offset 偏移量。

![顶层设计](https://s1.ax1x.com/2018/08/17/PWMNmq.png)

### 算法设计

对于每一张表案例数据的Spark处理流程基本一致，如下图：

![算法设计](https://s1.ax1x.com/2018/08/17/PWMa7V.png)

对字段的具体操作流程如下图：

![算法流程](https://s1.ax1x.com/2018/08/17/PWMwkT.png)

# 部署

## kafka

kafka部署无特殊要求，按照官方文档安装即可

[kafka部署](https://kafka.apache.org/documentation/)

## 抗抖动算法

### 环境

- python3.6
- spark2.3.0

### 依赖

requirement.txt

### 启动

```
 ~/spark/bin/spark-submit --jars ~/spark-streaming-kafka_2.11-2.3.0.jar --executor-memory 4G --master spark://10.30.1.9:50002 ./sparkdemo_1_4.py > spark.log
```

