#!/bin/python3
import os, json

class app_env(object):

    def __init__(self):
        # VCAP_APPLICATION
        if os.getenv('VCAP_APPLICATION') is None:
            self._app = {}
        else:
            self._app = json.loads(os.getenv('VCAP_APPLICATION'))

        # afs_host_url
        if os.getenv('afs_url') is None:
            self._afs_host_url = None
        else:
            self._afs_host_url = self.format_url( str(os.getenv('afs_url')) )
   
        # sso_host_url
        if os.getenv('sso_host_url') is None:
            self._sso_host_url = None
        else:
            self._sso_host_url = self.format_url( str(os.getenv('sso_host_url')) )

        # node_host_url
        if os.getenv('node_red_url') is None:
            self._node_host_url = None
        else:
            self._node_host_url = self.format_url( str(os.getenv('node_red_url')) )

        # rmm_host_url
        if os.getenv('rmm_host_url') is None:
            self._rmm_host_url = None
        else:
            self._rmm_host_url = self.format_url( str(os.getenv('rmm_host_url')) )

        # afs_auth_code
        if os.getenv('auth_code') is None:
            self._afs_auth_code = None
        else:
            self._afs_auth_code = str(os.getenv('auth_code'))


    def format_url(self, url):
        """
        Format url without / at last character.

        :param  string  url: url before format.
        :return string  f_url: url after format.
        """
        f_url = ''

        if not url.endswith('/'):
            f_url = url
        else:
            f_url = url[:-1]   # remove last character
        
        return f_url


    @property
    def afs_instance_id(self):
        return self._app.get('space_name')

    @afs_instance_id.setter
    def afs_instance_id(self, obj):
        self._app = json.loads(str(obj))

    @property
    def afs_host_url(self):
        return self._afs_host_url


    @afs_host_url.setter
    def afs_host_url(self, url):
        self._afs_host_url = self.format_url(url)


    @property
    def sso_host_url(self):
        return self._sso_host_url


    @sso_host_url.setter
    def sso_host_url(self, url):
        self._sso_host_url = self.format_url(url)


    @property
    def node_host_url(self):
        return self._node_host_url


    @node_host_url.setter
    def node_host_url(self, url):
        self._node_host_url = self.format_url(url)


    @property
    def rmm_host_url(self):
        return self._rmm_host_url


    @rmm_host_url.setter
    def rmm_host_url(self, url):
        self._rmm_host_url = self.format_url(url)


    @property
    def afs_auth_code(self):
        return self._afs_auth_code


    @afs_auth_code.setter
    def afs_auth_code(self, value):
        self._afs_auth_code = value

