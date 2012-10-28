/**
 * config is a object ,configure the
 * request attribute , it can have following properties:
 *   params:object or string
 *      request parameters. if the method is 'GET' ,
 *      the parameter's key must be encoded.
 *   headers:key-value object
 *      request headers.
 *   method:string
 *      request method.it can be 'GET' 'POST' 'HEAD',
 *      the default value is 'GET'
 *   async:boolean
 *      whether the request is asynchronized,default to true.
 */
var xhrRequest = null;
(function(){
        var defaultConfig = {
            params:null,
            headers:{},
            method:'GET',
            body:"",
            async:true;
        };
        var defaultSucc = function(responseText){
            console.log(responseText);
        };
        var defaultFailure = function(xhr){
            console.log("error fetching data!"
                +"\n\nreadyState:" + xhr.readyState
                +"\nstatus: " + xhr.status
                +"\nheaders: " + xhr.getAllResponseHeaders());
        };

        xhrRequest = function(url,config,succ,failure){
            config = config || {};
            config = objExtend(defaultConfig,config);
            succ = succ || defaultSucc;
            failure = failure || deafultFailure;

            var xhr = null;
            if(window.XMLHttpRequest){
                xhr = new XMLHttpRequest();
            }else if(window.ActiveXObject){
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xhr.open(config.method,url,config.async);
            //set request header
            for(var i in config.headers){
                xhr.setRequestHeader(i,config.headers[i]);
            }
            
            //set request body
            if(config.method == "GET"){
                var params = null;
                if(config.params !== null){
                    if(typeof config.params == "string" || 
                        config.params.constructor == Document ){
                        params = config.params;
                        }else {
                            params = obj2ReqParams(config.params);
                        }
                }

                xhr.send(params);
            }else{
                xhr.send(config.body);
            }
            xhr.onreadystatechange = function(){
                if(xhr.readyState ==  4){
                    if(xhr.status == 200){//successful
                        succ(xhr.responseText);
                    }else{
                        failure(xhr);
                    }
                }
            }
        }
})();

//add params to url
function addQueryParam(url,paramObj){
    if(url.indexOf("?") == 0){
        url = url + "?";
    }else{
        url = url + "&";
    }
    for(var i in paramObj){
        url = url + (i + "=" + encodeURIComponent(paramObj[i]));
    }
    return url;
}

