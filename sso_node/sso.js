module.exports = function(RED) {
    var request = require("request");
    var http = require("http");
    var https = require("https");



    function Sso_setting(config) {
        RED.nodes.createNode(this,config);
        var node = this;


        // run Node-RED flow
        node.on('input', function(msg) {
            // set msg.payload
            msg.payload = {
            };

            node.send(msg);
        });

    }
    
    RED.nodes.registerType("sso_setting",Sso_setting);



    // --- get env variable ---
    var afs_instance_id = "{afs_instance_id}"; // get env: instance id
    var afs_workspace_id = "{afs_workspace_id}"; // get env: workspace id

    var afs_host_url = format_url("{afs_host_url}"); // get env: afs host url
    var afs_auth_code = "{afs_auth_code}";  // get env: afs auth code
    var node_host_url = format_url("{node_host_url}");   // get env: node host url
    var sso_host_url = format_url("{sso_host_url}");  // sso host url

    // get from afs api
    var rmm_host_url = '';  // rmm host url (will change)
    // --- --- ---


    // --- request afs to get required varaible ---
    var str_url = afs_host_url + "/v1/" + afs_instance_id + "/workspaces/" + afs_workspace_id + "/env?auth_code=" + afs_auth_code;
    console.log("get required param from afs api:\n" + str_url);
    request(
    {
        method: "GET",
        url: str_url,
        headers: {
            "Content-Type": "application/json"
        },
        timeout: 5000,

        body: JSON.stringify({})
    }, function(error, response, body) {
        if (error) {
            return console.error(error);    // error control
        }
        var tmp = JSON.parse(body);

        // sso_host_url = format_url(tmp["sso_host_url"]);
        rmm_host_url = format_url(tmp["rmm_host_url"]);

        print_env_variable();   // print all env variable
    });
    // --- --- ---
    

    // --- format url ---
    /**
     * Format url without / at last character.
     * 
     * @param {string} url  url before format.
     * @returns {string}    url after format.
     */
    function format_url(url) {
        url = String(url);  // trans to url
        var url_last_char = url.slice(-1);

        if ( url_last_char.localeCompare("/")==0 ) {
            url = url.slice(0, -1); // remove last character /
        }

        // console.log("url: " + url);
        return url;
    }
    // --- --- ---


    // --- print env variable ---
    /**
     * Print value of env variable.
     */
    function print_env_variable() {
        console.log("env afs_instance_id: " + String(afs_instance_id));
        console.log("env afs_host_url: " + String(afs_host_url));
        console.log("env afs_auth_code: " + String(afs_auth_code));
        console.log("env node_host_url: " + String(node_host_url));
        console.log("env sso_host_url: " + String(sso_host_url));
        console.log("env rmm_host_url: " + String(rmm_host_url));
    }
    // --- --- ---


    // --- endpoint for HTML get env variable ---
    RED.httpAdmin.get("/sso/env_var", function(req, res){
        console.log("--- endpoint get env variable ---");
        console.log("env afs_instance_id: " + afs_instance_id);

        res.setHeader("Content-Type", "application/json");
        res.status(200);
        res.send({
            "_afs_instance_id": afs_instance_id,
            "_afs_host_url": afs_host_url,
            "_node_host_url": node_host_url,
            "_sso_host_url": sso_host_url,
            "_rmm_host_url": rmm_host_url
        });
        
    });
    // --- --- ---


    // --- endpoint for get sso token ---
    RED.httpAdmin.post("/sso/token", function(req, res){
        console.log("--- endpoint get sso token ---");

        if (sso_host_url=='') {
            console.error("sso url not exist.");
            
            // set response
            res.setHeader("Content-Type", "application/json");
            res.status(404);
            res.send( JSON.stringify({message: "SSO url not exist."}) );
        }

        // get request headers
        var sso_user = req.get("sso_user");
        var sso_password = req.get("sso_password");
        
        // sso request body
        var req_param = {
            "username": sso_user,
            "password": sso_password
        };
        // console.log(req_param);

        // -- request to get sso token --
        request(
        {
            method: "POST",
            url: sso_host_url + "/v1.5/auth/native",
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 7000,
            body: JSON.stringify(req_param)
        },
        function(error, response, body) {
            if (error) {
                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(500);
                res.send( JSON.stringify({message: "Request SSO api error."}) );

                return console.error(error);    // error control
            }

            if ( (response!=null) && (body!=null) ) {
                try {
                    var result = JSON.parse(body); // trans to json
                    // console.log(result);
                    console.log("status code: " + response.statusCode);
                }
                catch(err) {
                    console.error(err);

                    // set response
                    res.setHeader("Content-Type", "application/json");
                    res.status(500);
                    res.send( JSON.stringify({message: "Request SSO api error."}) );

                    return console.error(err);    // error control
                }

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(response.statusCode);
                res.send(result);
            }
            else {
                console.log("Request sso api to get sso token error.");

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(404);
                res.send( JSON.stringify({message: "Request SSO api error."}) );
            }
        });
        // -- -- --

    });
    // --- --- ---


    // --- endpoint for get space credentials ---
    RED.httpAdmin.post("/afs/credentials", function(req, res){
        console.log("--- endpoint get space credentials ---");
        console.log("env afs_instance_id: " + afs_instance_id);

        if (afs_host_url=='') {
            console.error("afs url not exist.");
            
            // set response
            res.setHeader("Content-Type", "application/json");
            res.status(404);
            res.send( JSON.stringify({message: "AFS url not exist."}) );
        }

        // get request headers
        var sso_token = req.get("sso_token");   // sso token
        
        // -- request to get credentials --
        request(
        {
            method: "GET",
            url: afs_host_url + "/v1/" + afs_instance_id + "/services",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sso_token
            },
            timeout: 5000,
        },
        function(error, response, body) {
            if (error) {
                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(500);
                res.send( JSON.stringify({message: "Request AFS api error."}) );

                return console.error(error);    // error control
            }

            if ( (response!=null) && (body!=null) ) {
                try {
                    var result = JSON.parse(body); // trans to json
                    // console.log(result);
                    console.log("status code: " + response.statusCode);
                }
                catch(err) {
                    console.error(err);

                    // set response
                    res.setHeader("Content-Type", "application/json");
                    res.status(500);
                    res.send( JSON.stringify({message: "Request AFS api error."}) );

                    return console.error(err);    // error control
                }

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(response.statusCode);
                res.send(result);
            }
            else {
                console.log("Request AFS api to get credentials error.");

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(404);
                res.send( JSON.stringify({message: "Request AFS api error."}) );
            }
        });
        // -- -- --

    });

    // --- --- ---


    // --- endpoint for get rmm url ---
    RED.httpAdmin.get("/sso/rmm_url", function(req, res){
        console.log("--- endpoint get rmm url ---");
        console.log("env afs_instance_id: " + afs_instance_id);

        if (afs_host_url=='') {
            console.error("afs url not exist.");
            
            // set response
            res.setHeader("Content-Type", "application/json");
            res.status(404);
            res.send( JSON.stringify({message: "afs url not exist."}) );
        }
        
        // -- request to get rmm url --
        var str_url = afs_host_url + "/v1/" + afs_instance_id + "/workspaces/" + afs_workspace_id + "/env?auth_code=" + afs_auth_code;
        console.log("get required param from afs api:\n" + str_url);
        request(
        {
            method: "GET",
            url: str_url,
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 5000,    
            body: JSON.stringify({})
        }, function(error, response, body) {
            if (error) {
                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(500);
                res.send( JSON.stringify({message: "Request AFS api error."}) );

                return console.error(error);    // error control
            }

            if ( (response!=null) && (body!=null) ) {
                try {
                    var tmp = JSON.parse(body);
                    rmm_host_url = format_url(tmp["rmm_host_url"]);
            
                    print_env_variable();   // print all env variable
                }
                catch(err) {
                    console.error(err);

                    // set response
                    res.setHeader("Content-Type", "application/json");
                    res.status(500);
                    res.send( JSON.stringify({message: "Request AFS api error."}) );

                    return console.error(err);    // error control
                }

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(response.statusCode);
                res.send({"_rmm_host_url": rmm_host_url});
            }
            else {
                console.log("Request AFS api to get rmm url error.");

                // set response
                res.setHeader("Content-Type", "application/json");
                res.status(404);
                res.send( JSON.stringify({message: "Request AFS api error."}) );
            }
        });
        // -- -- --
    });

    // --- --- ---

}

