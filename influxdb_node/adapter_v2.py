#-*-coding:utf-8 -*-
from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
import datetime
import time
import json
import traceback
import requests
import os, sys
import pandas as pd

from influxdb import InfluxDBClient

from flow import *  # flow



app = Flask(__name__)



@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    # response.headers['Content-Type'] = 'application/json'

    return response
    


@app.route('/', methods=['POST'])
def query_influxdb():
    """
    Get data from influxdb.

    :param  (json) POST request body
        :param  query: query string
    
    :return (json) query result: {column[], value[]}
    """
    time_format = '%Y-%m-%dT%H:%M:%S.%fZ'  # time format
    print('query influxdb start: ' + datetime.datetime.strftime(datetime.datetime.now(), time_format))


    # get param in request headers    
    headers_obj = {
        'flow_id': request.headers['flow_id'],
        'node_id': request.headers['node_id'],
        'host_url': request.headers['host_url']
    }

    if headers_obj == None:
        return jsonify({
            'EXEC_DESC': '63',
            'message': 'request headers is wrong.'
        }), 400


    afs_flow = flow()    # init afs flow object
    afs_flow.set_flow_config(headers_obj)   # set afs flow config
    flow_list = afs_flow.get_flow_list()    # get flow list
    
    if flow_list==None:
        return jsonify({
            'error_node': str(afs_flow.current_node_id), 
            'error_msg': 'Can not get flow list.'
        }), 400


    # get node config in Node-RED
    node_obj = afs_flow.get_node_item(afs_flow.current_node_id)
    

    # get sso node config in Node-RED
    sso_node_id = afs_flow.get_sso_node_id()    # get sso node id
    if sso_node_id=='':
        return jsonify({
            'error_node': str(afs_flow.current_node_id), 
            'error_msg': 'Can not get sso node.'
        }), 400

    sso_obj = afs_flow.get_node_item(sso_node_id, is_current_node=False)  # get sso node config in Node-RED
    

    # get sso token
    sso_config = {
        'username': sso_obj['sso_user'],
        'password': sso_obj['sso_password']
    }
    sso_token = ''  # sso token
    sso_resp_result, sso_resp_status = afs_flow.get_sso_token(sso_config)   # get sso token
    
    if sso_resp_status==200:
        sso_token = sso_resp_result
    else:
        return jsonify({
            'error_node': str(afs_flow.current_node_id), 
            'error_msg': sso_resp_result
        }), 400
    

    # get afs credentials
    afs_credentials = ''    # afs credentials list
    afs_resp_result, afs_resp_status = afs_flow.get_afs_credentials(sso_token)

    if afs_resp_status==200:
        afs_credentials = afs_resp_result
    else:
        return jsonify({
            'error_node': str(afs_flow.current_node_id), 
            'error_msg': afs_resp_result
        }), 400


    # get credentials information
    obj_credential = None

    if ( ('service_name' in node_obj and node_obj['service_name']!='0')
        and ('service_key' in node_obj and node_obj['service_key']!='0') ):
        for item_service in afs_credentials:
            # find credentials service name
            if node_obj['service_name'] == item_service['name']:
                # get key object array
                for item_key in item_service['service_keys']:
                    for key_name in item_key.keys():
                        # find credentials service key
                        if node_obj['service_key'] == key_name:
                            # print(item_key[ node_obj['service_key'] ])
                            obj_credential = item_key[ node_obj['service_key'] ]
                            break
    else:
        return jsonify({
            'error_node': str(afs_flow.current_node_id), 
            'error_msg': 'Service name or service key value did not exist.'
        }), 400
    

    if obj_credential==None:
        return jsonify({
            'error_node': str(afs_flow.current_node_id), 
            'error_msg': 'Service name or service key value did not map to credentials.'
        }), 400


    # connect influxdb
    client = InfluxDBClient(obj_credential['host'], obj_credential['port'], obj_credential['username'], obj_credential['password'], obj_credential['database'])


    # set param
    query = node_obj['query']
    print(query)


    # query
    if (query==None or query==''):
        return jsonify({
            'EXEC_DESC': '62',
            'message': 'query string is none.'
        }), 400
    
    try:
        result = client.query(query)    # query
        result = result.raw # trans query result to json
    except:
        traceback.print_exc()

        return jsonify({
            'EXEC_DESC': '90',
            'message': 'Script is fail.'
        }), 500


    # set response
    if 'series' in result:
        data = result['series'][0]  # {columns, values}
        columns = data['columns']   # column
        values = data['values']    # data value
    else:
        columns = []
        values = []
        
    
    df = pd.DataFrame(values, columns=columns)
    df_dict = df.to_dict()  # trans to python dict
    error_node, error_msg = afs_flow.exe_next_node(data=df_dict, next_list=None, debug=True)


    return jsonify({'error_node': str(error_node), 'error_msg': str(error_msg)}), 200



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)

