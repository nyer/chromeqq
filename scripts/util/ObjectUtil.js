function objOverride(base,override){
    for(var i in override){
        if(typeof override[i] == "object" && typeof base[i] == "object"){
            objOverride(base[i],override[i]);
        }
        else{
            base[i] = override[i];
        }
    }
    return base;
}

function obj2ReqParams(obj){
    var result = "";
    for(var i in obj){
        result = result + i + "=" + encodeURIComponent(obj[i]);
    }
    return result;
}
    
