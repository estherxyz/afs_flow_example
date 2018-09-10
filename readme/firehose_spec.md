# Additional spec for firehose type

with **AFS v1.2.17**

---

## python api(.py)

### Request headers
Needed request param in request headers like below.
```
{
    "flow_id": "$FLOW_ID",  # execute which flow
    "node_id": "$NODE_ID"   # current node id
}
```

### Request body
**Do not receive data in request body.**

### Response
If error occur, api need to response error_node, error_msg, status_code(ex. 400, 500...etc.), like below.
```python
return jsonify({
    'error_node': "$ERROR_NODE", 
    'error_msg': "$ERROR_MSG"
    }), 500
```

If no error occur, api response success message, status_code(ex. 2xx), like below.
```python
return jsonify({
    'status_code': '0'
    }), 200
```

---

## Node HTML

### Set defaults properties
Set these properties below in `node_config={}`. Reference to [Node-RED doc - creating nodes/first node](https://nodered.org/docs/creating-nodes/first-node#lower-casehtml).
```JS
RED.nodes.registerType('$NODE_NAME', node_config={})
```

#### defaults
Firehose node need to add key-value in defaults{}.
```
_node_type = {value: "firehose"}
```

#### inputs
No input send to firehose, so set 0.
```
inputs:0
```

#### outputs
One output send to next node, so set 1.
```
outputs:1
```
