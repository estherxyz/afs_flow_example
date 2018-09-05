# Environment variable about CF org/space

with **AFS v1.2.17**

---

## How to use in Node-RED

### Get define environment variable in HTML

在前端中可以使用`_afs_param_obj`這個變數物件中，取得以下的變數資訊。

+ _afs_host_url：當前訂閱AFS的host url。
+ _afs_instance_id：當前訂閱AFS的space名稱。
+ _node_host_url：當前訂閱AFS所使用的Node-RED的host url。
+ _sso_host_url：當前訂閱AFS所使用的SSO認證host url。
+ _rmm_host_url：當前訂閱AFS所使用的RMM的host url。

前端使用的語言為Javascript，取用變數方式如下：
```js
// get _afs_host_url value and set into temp.
var temp = _afs_param_obj["_afs_host_url"];
```


### API

#### (GET) /sso/env_var
Request headers
```js
{
    "Content-Type": "application/json"
}
```

Response body: 200
```js
{
    "_afs_instance_id": $AFS_INSTANCE_ID,
    "_afs_host_url": $AFS_HOST_URL,
    "_node_host_url": $NODE_HOST_URL,
    "_sso_host_url": $SSO_HOST_URL,
    "_rmm_host_url": $RMM_HOST_URL
}
```


#### (POST) /sso/token
Request headers
```js
{
    "Content-Type": "application/json; charset=utf-8",
    "Accept": "application/json",
    "sso_user": $SSO_USER,
    "sso_password": $SSO_PASSWORD
}
```

Response body: success
> accessToken is value about sso token.
```js
{
    "tokenType": $TOKEN_TYPE,
    "accessToken": $TOKEN,
    "expiresIn": $EXPIRES_IN,
    "refreshToken": $REFRESH_TOKEN
}
```


#### (POST) /afs/credentials
Request headers
```js
{
    "Content-Type": "application/json; charset=utf-8",
    "Accept": "application/json",
    "sso_token": $SSO_TOKEN
}
```

Response body: success
```js
[
    {
        "name": $SERVICE_NAME_BY_USER,
        "service": $SERVICE_NAME,
        "service_keys": [
            {
                $CREDENTIAL_NAME: {
                    $CREDENTIAL_INFO
                }
            },...
        ]
    },...
]
```


#### (GET) /sso/rmm_url
Request headers
```js
{
    "Content-Type": "application/json"
}
```

Response body: success
```js
{
    "_rmm_host_url": $RMM_HOST_URL
}
```


## How to use in python api

### Get AFS SDK for python

+ Download [AFS SDK](https://github.com/benchuang11046/afs) source code from Github.

+ Put directory: ./afs into your project.
![afs dir](./img/afs_dir.png)
> `main.py` is about your api main function.


### How to include in python api

#### Include afs sdk in `main.py`

```python
from afs.get_env import app_env 
from afs.flow import flow
```

#### Use flow object

##### Init flow object
Init flow object for getting environment variable and processing flow on Online Flow IDE.
```python
afs_flow = flow()    # init afs flow object
afs_flow.set_flow_config(headers_obj)   # set afs flow config
flow_list = afs_flow.get_flow_list()    # get flow list
```

`headers_obj` is variable about request headers. Like below.
```python  
headers_obj = {
    'flow_id': request.headers['flow_id'],
    'node_id': request.headers['node_id']
}
```

##### Get current node config

Get object about node config in Online Flow IDE.
`node_obj` is a python dict object which include config about user setting in Online Flow IDE.
```python
node_obj = afs_flow.get_node_item(afs_flow.current_node_id)
```

Get what user setting in Online Flow IDE. Below is user setting query string in Online Flow IDE.
![set query string](./img/flow_ide_setting_ui.png)

The key name of query string is `query`. Then you can get query string(value) by key name, `query`.
```python
str_query = node_obj['query']
```

##### Execute next node

Use `exe_next_node()` to execute next node which is linked after current node. This function will return `error_node`, `error_msg`.
```python
error_node, error_msg = afs_flow.exe_next_node(data={'data': df_dict}, next_list=None, debug=False)
```

`df_dict` is data for sending to next node. This object is pandas object transform into python dict object.
```python
df = pd.DataFrame(values, columns=columns)
df_dict = df.to_dict() 
```

#### api response

At the end of api, set response body and status code like below. If no error_node exist, return 200. If error_node exist, return 500.
```python
if error_node=='0' :
    return jsonify({'status_code': '0'}), 200
else :
    return jsonify({'error_node': str(error_node), 'error_msg': str(error_msg)}), 500
```

