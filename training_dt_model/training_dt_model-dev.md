
```python
manifest = {
    'memory': 2048,
    'disk_quota': 2048,
    'buildpack': 'python_buildpack',
    'requirements': [
        'numpy',
        'pandas',
        'scikit-learn',
        'influxdb',
        'requests',
        'scipy',
        'urllib3',
        'afs'
    ],
    'type': 'API'
}
```


```python
from afs import config_handler
from pandas import DataFrame
import json
cfg = config_handler()
cfg.set_param('criterion', type='string', required=True, default="gini")
cfg.set_param('random_state', type='string', required=True, default="2")
cfg.set_param('max_depth', type='string', required=True, default="3")
cfg.set_param('K_fold', type='integer', required=True, default=10)

cfg.set_param('model_name', type='string', required=True, default="model.pkl")
cfg.set_features(True)
cfg.set_column('data')
cfg.summary()
```


```python
from sklearn import tree
from sklearn.cross_validation import train_test_split
from sklearn import metrics
from sklearn.externals import joblib
from afs import models
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import LabelBinarizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import GridSearchCV

import pandas as pd
import numpy as np
import json
import requests
```


```python
def grid(data , target , parameters_dt , cv):
    clf = tree.DecisionTreeClassifier()
    grid = GridSearchCV(estimator = clf, param_grid = parameters_dt, cv = cv, 
                        scoring = 'accuracy')
    grid.fit(data,target)
    best_accuracy = grid.best_score_
    best_params = grid.best_params_
    return best_accuracy,best_params
```


```python
def training_model(data , target ,best_params , best_accuracy ,model_name):
    clf = tree.DecisionTreeClassifier(**best_params)
    clf = clf.fit(data, target)
    #save model
    joblib.dump(clf , model_name)
    client = models()
    client.upload_model(model_name, accuracy=best_accuracy, loss=0.0, tags=dict(machine='dt'))

    return model_name
```


```python
# POST /

# Set flow architecture, REQUEST is the request including body and headers from client
cfg.set_kernel_gateway(REQUEST)
# Get the parameter from node-red setting

criterion = str(cfg.get_param('criterion'))
random_state = str(cfg.get_param('random_state'))
max_depth = str(cfg.get_param('max_depth'))
cv = cfg.get_param('K_fold')


model_name = str(cfg.get_param('model_name'))
select_feature = cfg.get_features_selected()
data_column_name = cfg.get_features_numerical()
target2 = cfg.get_features_target()

labels_column_name = [x for x in select_feature if x not in data_column_name]
labels_column_name = [x for x in labels_column_name if x not in target2]

if(labels_column_name==[]):
    labels_column_name=["No"]
    
a1=["time"]
labels_column_name = [x for x in labels_column_name if x not in a1]

if "All" in labels_column_name:
    labels_column_name.remove("All")

if(data_column_name==[]):
    data_column_name=["No"]
    
criterion = criterion.split(",")
random_state = random_state.split(",")
max_depth = max_depth.split(",")

random_state =list(map(int, random_state))
max_depth = list(map(int, max_depth))

parameters_dt = {"criterion" : criterion , "random_state" : random_state , "max_depth" : max_depth}



# Get the data from request, and transform to DataFrame Type
df = cfg.get_data()
df = pd.DataFrame(df)

target = np.array(df.loc[:,[target2]])

if (data_column_name[0]=="All"):
    all_df_column = [df.columns[i] for i in range(len(df.columns))]
    if (labels_column_name[0]!="No"):
        for i in range(len(labels_column_name)):
            all_df_column.remove(labels_column_name[i])
        all_df_column.remove(target2)
    if (labels_column_name[0]=="No"):
        all_df_column.remove(target2)
    data = np.array(df.loc[:,all_df_column])

elif (data_column_name[0]=="No"):
    data = np.array([]).reshape(df.shape[0],0)
    if (labels_column_name[0]!="No"):
        for i in labels_column_name:   
            if ((False in map((lambda x: type(x) == str), df[i]))==False):
                label2 = LabelBinarizer().fit_transform(df[i])
                data = np.hstack((data,label2))
            if ((False in map((lambda x: type(x) == int), df[i]))==False):
                target9 = OneHotEncoder( sparse=False ).fit_transform(df[i].values.reshape(-1,1))
                data = np.hstack((data,target9))

else:    
    data = np.array(df.loc[:,data_column_name])
    if (labels_column_name[0]!="No"):
        for i in labels_column_name:   
            if ((False in map((lambda x: type(x) == str), df[i]))==False):
                label2 = LabelBinarizer().fit_transform(df[i])
                data = np.hstack((data,label2))
            if ((False in map((lambda x: type(x) == int), df[i]))==False):
                target9 = OneHotEncoder( sparse=False ).fit_transform(df[i].values.reshape(-1,1))
                data = np.hstack((data,target9))
                
best_accuracy,best_params = grid(data , target , parameters_dt , cv)
result = training_model(data , target ,best_params , best_accuracy ,model_name)
result = str(result)

df2 = pd.DataFrame([result], columns=['model_name'])
# df_dict = df2.to_dict()  


# # Send the result to next node, and result is  DataFrame Type

ret = cfg.next_node(df2, debug=False) 

# The printing is the API response.
print(json.dumps(ret))
```
