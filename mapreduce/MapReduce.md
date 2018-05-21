MapReduce算法
===========

MapReduce算法背景
----------------

```
因为数据太大而让仅仅一台机器难以有效存储或分析的问题。
MapReduce通过把计算量分配给不同的计算机群，能够解决大部分和大数据有关的分析问题。
Hadoop提供了最受欢迎的利用MapReduce算法来管理大数据的开源方式。
```

拆分MapReduce算法
-----------------

```
MapReduce合并了两种经典函数：

1、映射（Mapping）对集合里的每个目标应用同一个操作。即，如果你想把表单里每个单元格乘以二，那么把这个函数单独地应用在每个单元格上的操作就属于mapping。
2、化简（Reducing ）遍历集合中的元素来返回一个综合的结果。即，输出表单里一列数字的和这个任务属于reducing。
```

经典图
---------
![MapReduce](https://github.com/SunJackson/doc/blob/master/mapreduce/mapreduce.jpg "经典MapReduce配图")
