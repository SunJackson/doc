# Transformation和Actions

## Transformation具体内容
- map(func) :返回一个新的分布式数据集，由每个原元素经过func函数转换后组成

- filter(func) : 返回一个新的数据集，由经过func函数后返回值为true的原元素组成*flatMap(func) : 类似于map，但是每一个输入元素，会被映射为0到多个输出元素（因此，func函数的返回值是一个Seq，而不是单一元素）

- flatMap(func) : 类似于map，但是每一个输入元素，会被映射为0到多个输出元素（因此，func函数的返回值是一个Seq，而不是单一元素）

- sample(withReplacement, frac, seed) :根据给定的随机种子seed，随机抽样出数量为frac的数据
union(otherDataset) : 返回一个新的数据集，由原数据集和参数联合而成

- groupByKey([numTasks]) :
在一个由（K,V）对组成的数据集上调用，返回一个（K，Seq[V])对的数据集。注意：默认情况下，使用8个并行任务进行分组，你可以传入numTask可选参数，根据数据量设置不同数目的Task

- reduceByKey(func, [numTasks]) : 在一个（K，V)对的数据集上使用，返回一个（K，V）对的数据集，key相同的值，都被使用指定的reduce函数聚合到一起。和groupbykey类似，任务的个数是可以通过第二个可选参数来配置的。

- join(otherDataset, [numTasks]) :
在类型为（K,V)和（K,W)类型的数据集上调用，返回一个（K,(V,W))对，每个key中的所有元素都在一起的数据集

- groupWith(otherDataset, [numTasks]) : 在类型为（K,V)和(K,W)类型的数据集上调用，返回一个数据集，组成元素为（K, Seq[V], Seq[W]) Tuples。这个操作在其它框架，称为CoGroup

- cartesian(otherDataset) : 笛卡尔积。但在数据集T和U上调用时，返回一个(T，U）对的数据集，所有元素交互进行笛卡尔积。


## Actions具体内容

- reduce(func) : 通过函数func聚集数据集中的所有元素。Func函数接受2个参数，返回一个值。这个函数必须是关联性的，确保可以被正确的并发执行

- collect() : 在Driver的程序中，以数组的形式，返回数据集的所有元素。这通常会在使用filter或者其它操作后，返回一个足够小的数据子集再使用，直接将整个RDD集Collect返回，很可能会让Driver程序OOM

- count() : 返回数据集的元素个数

- take(n) : 返回一个数组，由数据集的前n个元素组成。注意，这个操作目前并非在多个节点上，并行执行，而是Driver程序所在机器，单机计算所有的元素(Gateway的内存压力会增大，需要谨慎使用）

- first() : 返回数据集的第一个元素（类似于take(1)）

- saveAsTextFile(path) : 将数据集的元素，以textfile的形式，保存到本地文件系统，hdfs或者任何其它hadoop支持的文件系统。Spark将会调用每个元素的toString方法，并将它转换为文件中的一行文本

- saveAsSequenceFile(path) : 将数据集的元素，以sequencefile的格式，保存到指定的目录下，本地系统，hdfs或者任何其它hadoop支持的文件系统。RDD的元素必须由key-value对组成，并都实现了Hadoop的Writable接口，或隐式可以转换为Writable（Spark包括了基本类型的转换，例如Int，Double，String等等）

- foreach(func) : 在数据集的每一个元素上，运行函数func。这通常用于更新一个累加器变量，或者和外部存储系统做交互


## 算子分类
大致可以分为三大类算子:
1. Value数据类型的Transformation算子，这种变换并不触发提交作业，针对处理的数据项是Value型的数据。
2. Key-Value数据类型的Transfromation算子，这种变换并不触发提交作业，针对处理的数据项是Key-Value型的数据对。
3. Action算子，这类算子会触发SparkContext提交Job作业。


# 值型Transformation算子

处理数据类型为Value型的Transformation算子可以根据RDD变换算子的输入分区与输出分区关系分为以下几种类型:

1. 输入分区与输出分区一对一型
2. 输入分区与输出分区多对一型
3. 输入分区与输出分区多对多型
4. 输出分区为输入分区子集型
5. 还有一种特殊的输入与输出分区一对一的算子类型：Cache型。 Cache算子对RDD分区进行缓存

## 输入分区与输出分区一对一型

- map

    将原来RDD的每个数据项通过map中的用户自定义函数f映射转变为一个新的元素。源码中的map算子相当于初始化一个RDD，新RDD叫作MapPartitionsRDD(this,sc.clean(f))。

- flatMap

    将原来RDD中的每个元素通过函数f转换为新的元素，并将生成的RDD的每个集合中的元素合并为一个集合。 内部创建FlatMappedRDD（this，sc.clean（f））。

- mapPartitions

    mapPartitions函数获取到每个分区的迭代器，在函数中通过这个分区整体的迭代器对整个分区的元素进行操作。 内部实现是生成MapPartitionsRDD。

- glom

    glom函数将每个分区形成一个数组，内部实现是返回的RDD[Array[T]]。


## 输入分区与输出分区多对一型

- union

    使用union函数时需要保证两个RDD元素的数据类型相同，返回的RDD数据类型和被合并的RDD元素数据类型相同，并不进行去重操作，保存所有元素。如果想去重，可以使用distinct（）。++符号相当于uion函数操作。

- certesian

    对两个RDD内的所有元素进行笛卡尔积操作。操作后，内部实现返回CartesianRDD。

## 输入分区与输出分区多对多型

- groupBy

    将元素通过函数生成相应的Key，数据就转化为Key-Value格式，之后将Key相同的元素分为一组。


## 输出分区为输入分区子集型

- filter

    filter的功能是对元素进行过滤，对每个元素应用f函数，返回值为true的元素在RDD中保留，返回为false的将过滤掉。 内部实现相当于生成FilteredRDD(this，sc.clean(f))。

- distinc

    distinct将RDD中的元素进行去重操作。

- subtract

    subtract相当于进行集合的差操作，RDD 1去除RDD 1和RDD 2交集中的所有元素。

- sample

    sample将RDD这个集合内的元素进行采样，获取所有元素的子集。用户可以设定是否有放回的抽样、百分比、随机种子，进而决定采样方式。

- takeSample

    takeSample()函数和上面的sample函数是一个原理，但是不使用相对比例采样，而是按设定的采样个数进行采样，同时返回结果不再是RDD，而是相当于对采样后的数据进行collect()，返回结果的集合为单机的数组。

## Cache型

- cache

    cache将RDD元素从磁盘缓存到内存，相当于persist（MEMORY_ONLY）函数的功能。

- persist

    persist函数对RDD进行缓存操作。数据缓存在哪里由StorageLevel枚举类型确定。
有几种类型的组合，DISK代表磁盘，MEMORY代表内存，SER代表数据是否进行序列化存储。StorageLevel是枚举类型，代表存储模式，如，MEMORY_AND_DISK_SER代表数据可以存储在内存和磁盘，并且以序列化的方式存储。 其他同理。

# Transformation操作

Transformation处理的数据为Key-Value形式的算子大致可以分为：

1. 输入分区与输出分区一对一
2. 聚集操作
3. 连接操作

## 输入分区与输出分区一对一

- mapValues

    针对（Key，Value）型数据中的Value进行Map操作，而不对Key进行处理

## 单个RDD或两个RDD聚集

- combineByKey

    combineByKey是对单个Rdd的聚合。相当于将元素为（Int，Int）的RDD转变为了（Int，Seq[Int]）类型元素的RDD。

- reduceByKey

    reduceByKey是更简单的一种情况，只是两个值合并成一个值，所以createCombiner很简单，就是直接返回v，而mergeValue和mergeCombiners的逻辑相同，没有区别。

- partitionBy

    partitionBy函数对RDD进行分区操作。如果原有RDD的分区器和现有分区器（partitioner）一致，则不重分区，如果不一致，则相当于根据分区器生成一个新的ShuffledRDD。

- cogroup

    cogroup函数将两个RDD进行协同划分。对在两个RDD中的Key-Value类型的元素，每个RDD相同Key的元素分别聚合为一个集合，并且返回两个RDD中对应Key的元素集合的迭代器(K, (Iterable[V], Iterable[w]))。其中，Key和Value，Value是两个RDD下相同Key的两个数据集合的迭代器所构成的元组。

## 连接

- join

    join对两个需要连接的RDD进行cogroup函数操作。cogroup操作之后形成的新RDD，对每个key下的元素进行笛卡尔积操作，返回的结果再展平，对应Key下的所有元组形成一个集合，最后返回RDD[(K，(V，W))]。

- leftOuterJoin和rightOuterJoin

    LeftOuterJoin（左外连接）和RightOuterJoin（右外连接）相当于在join的基础上先判断一侧的RDD元素是否为空，如果为空，则填充为空。 如果不为空，则将数据进行连接运算，并返回结果。

# Action算子 

本质上在Actions算子中通过SparkContext执行提交作业的runJob操作，触发了RDD DAG的执行。 
根据Action算子的输出空间将Action算子进行分类：
1. 无输出
2. HDFS
3. Scala集合和数据类型。

## 无输出

- foreach

    对RDD中的每个元素都应用f函数操作，不返回RDD和Array，而是返回Uint。

## HDFS

- saveAsTextFile

    函数将数据输出，存储到HDFS的指定目录。将RDD中的每个元素映射转变为（Null，x.toString），然后再将其写入HDFS。

- saveAsObjectFile

    saveAsObjectFile将分区中的每10个元素组成一个Array，然后将这个Array序列化，映射为（Null，BytesWritable（Y））的元素，写入HDFS为SequenceFile的格式。

## Scala集合和数据类型

- collect

    collect相当于toArray，toArray已经过时不推荐使用，collect将分布式的RDD返回为一个单机的scala Array数组。 在这个数组上运用scala的函数式操作。

- collectAsMap

    collectAsMap对（K，V）型的RDD数据返回一个单机HashMap。对于重复K的RDD元素，后面的元素覆盖前面的元素。

- reduceByKeyLocally

    实现的是先reduce再collectAsMap的功能，先对RDD的整体进行reduce操作，然后再收集所有结果返回为一个HashMap。

- lookup

    Lookup函数对（Key，Value）型的RDD操作，返回指定Key对应的元素形成的Seq。这个函数处理优化的部分在于，如果这个RDD包含分区器，则只会对应处理K所在的分区，然后返回由（K，V）形成的Seq。如果RDD不包含分区器，则需要对全RDD元素进行暴力扫描处理，搜索指定K对应的元素。

- count

    count返回整个RDD的元素个数。

- top

    top可返回最大的k个元素。

- reduce

    reduce函数相当于对RDD中的元素进行reduceLeft函数的操作。

- fold

    fold和reduce的原理相同，但是与reduce不同，相当于每个reduce时，迭代器取的第一个元素是zeroValue。

- aggregate

    aggregate先对每个分区的所有元素进行aggregate操作，再对分区的结果进行fold操作。 

    aggreagate与fold和reduce的不同之处在于，aggregate相当于采用归并的方式进行数据聚集，这种聚集是并行化的。 而在fold和reduce函数的运算过程中，每个分区中需要进行串行处理，每个分区串行计算完结果，结果再按之前的方式进行聚集，并返回最终聚集结果。 
