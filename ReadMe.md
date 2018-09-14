## AFS - Flow IDE Develop Example

Date: 20180626

---

#### Notification

If there is `required` in annotation of the variable, need to update value to this variable.
The value seems like host url, instance id.

---

### sample_node

Node template for adding node into Node-RED. Add file into folder below.
```
.\node-red\nodes\core\{new_folder}\
```

---

### influxdb_node

> update: 2018-09-14

Example about developing influxdb node to AFS.
Include node for Node-RED, api for query influxdb. About spec can reference `spec_flow.md`.

#### Notification

`./afs` is python AFS SDK. This version not the lastest AFS SDK, and it is part of AFS SDK. If you want to use the lastest version, please reference to [How to use in python api](./readme/env_variable.md#how-to-use-in-python-api)

---

### sso_node

> update: 2018-09-14

Node for getting SSO token.

#### Notification

In sso.js, AFS dynamic set value in this variable (`{VALUE}`).
```js
var afs_instance_id = "{afs_instance_id}";
var afs_workspace_id = "{afs_workspace_id}";
var afs_host_url = format_url("{afs_host_url}");
var afs_auth_code = "{afs_auth_code}";
var node_host_url = format_url("{node_host_url}");
var sso_host_url = format_url("{sso_host_url}");
```

---

### s3_example

Example about getting file from S3.

---

### ~~afs (deprecated)~~

~~Add this folder into project (./). Use this sdk instead of origin flow.py.~~

---
