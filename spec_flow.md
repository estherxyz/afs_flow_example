# Spec for uploading to AFS

## Node-RED需要的檔案

### HTML, JS統一用node_config命名。
+ node_config.html
+ node_config.js

### HTML file必填內容的規格
+ registerType()中的匿名函數，統一命名為`node_config`。AFS動態加入code需要使用。
> 第一個`<script></script>`區塊中
```
RED.nodes.registerType('', node_config={})
```

+ 在registerType()外的JS需要加上一段註解，讓AFS可以動態加入其他參數設定。
> 第一個`<script></script>`區塊中
```
// AFS config
```

+ node_config{ defaults:{} } 中的url欄位刪除，會由AFS加入app的url資訊。

+ Node-RED node config[預設保留的key word](https://nodered.org/docs/creating-nodes/properties)
> 不要在defaults中有相同的命名。
```
type, x, y, z, wires, outputs
```

+ 如果node為firehose start node，要多加一組key-value在defaults{}中，之後串接parser，才能找到firehose。
```
_node_type = {value: "firehose"}
```

---

## python api(.py)中的規格

+ 目前request api的預設endpoint為`/`
> AFS request的url 是app本身的host url。

+ api的port上傳CF需要為8080。

---

## APP CF push必要的檔案

+ main.py
> app執行的python

+ manifest.yml
> app name 命名在20個字元內，不要有空白。

+ requirements.txt
+ runtime.txt
+ Procfile

