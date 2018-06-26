#-*-coding:utf-8 -*-
import datetime
import time
import json
import traceback
import re
import configparser

import boto
import boto.s3.connection

"""
S3 get data
"""



### set connect ###

config = configparser.ConfigParser()
config.read('config.ini')


# read S3 config file
host = config['s3']['host']
port = int(config['s3']['port'])
access_key = config['s3']['access_key']
secret_key = config['s3']['secret_key']
# print (host + " " + access_key + " " + secret_key)
conn = boto.connect_s3(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    port=port,
    host=host,
    is_secure=False,
    calling_format=boto.s3.connection.OrdinaryCallingFormat())

###



# get buckets in s3
for bucket in conn.get_all_buckets():
    print(bucket)

    for key in bucket.list():
        print(key.name)
        key.get_contents_to_filename(key.name)  # download file. rename with {key.name}

###
