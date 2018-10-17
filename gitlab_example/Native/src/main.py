#-*-coding:utf-8 -*-
from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
import datetime
import time
import json
import requests
import os, sys
import pandas as pd

from afs.get_env import app_env
from afs.flow import flow



app = Flask(__name__)



@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    # response.headers['Content-Type'] = 'application/json'

    return response
    


@app.route('/', methods=['POST'])
def example():
    """
    example.
    :param  (json) POST request body
    
    :return (json) query result: {column[], value[]}
    """
    time_format = '%Y-%m-%dT%H:%M:%S.%fZ'  # time format
    print('start: ' + datetime.datetime.strftime(datetime.datetime.now(), time_format))


    # get param in request headers    
    headers_obj = {
        'flow_id': request.headers['flow_id'],
        'node_id': request.headers['node_id']
    }

    if headers_obj == None:
        return jsonify({
            'error_node': 'firehose', 
            'error_msg': 'Request headers is wrong.'
        }), 400
    # print(headers_obj)


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

    if node_obj==None:
        return jsonify({
            'error_node': str(afs_flow.current_node_id), 
            'error_msg': 'Can not get node config.'
        }), 400
    

    error_node, error_msg = afs_flow.exe_next_node(data={'data': {}}, next_list=None, debug=True)

    if error_node=='0' :
        return jsonify({'status_code': '0'}), 200
    else :
        return jsonify({'error_node': str(error_node), 'error_msg': str(error_msg)}), 500



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
