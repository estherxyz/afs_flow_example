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

Example about developing influxdb node to AFS.
Include node for Node-RED, api for query influxdb. About spec can reference `spec_flow.md`.

---

### sso_node

Node for getting SSO token.

---

### s3_example

Example about getting file from S3.

---

### afs

Add this folder into project (./). Use this sdk instead of origin flow.py.

---
