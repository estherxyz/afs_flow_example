# Step for uploading app to AFS

### 準備檔案

+ 注意需要上傳的檔案規格。參考[spec_flow.md](./spec_flow.md)。
+ 壓縮檔：在project中，直接壓縮所有檔案。 (不要將project的folder做壓縮)


### 上傳

+ api
`(PUT) /v1/{instance_id}/workspaces/{workspace_id}/analytics`

+ request headers：設定content的類型與SSO token。
![api request headers](/img/upload_request_headers.png)

+ request headers：選擇要上傳檔案的zip。
![api request body](/img/upload_request_body.png)

+ instance_id、workspace_id：登入AFS portal之後的url中。
![afs url](/img/afs_url.png)
