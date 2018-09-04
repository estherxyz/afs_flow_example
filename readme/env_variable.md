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


#### "/sso/rmm_url
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


## How to use in api

