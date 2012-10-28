var DataMgr = function(meta){
    this.data = new Array();
    this.meta = meta;
    this.listenerTypes = ["add","del","update"];
    this.listeners = {};
    this.listeners.add = [];
    this.listeners.del = [];
    this.listeners.update = [];
}

DataMgr.prototype.add = function(row){
    var suc = 0;
    var added = [];
    if(Object.prototype.toString.call(row) == "[object Array]"){
        for(var i=0, j = row.length;i < j;i ++){
            var el = row[i];
            if(el.constructor == this.meta){
                this.data.push(el);
                added.push(el);
                suc++;
            }
        }
    }else{
        if(row.constructor == this.meta){
            this.data.push(row);
            added.push(row);
            suc ++;
        }
    }
    this.fireEvent("add",added);
    return suc;
}


DataMgr.prototype.unshift = function(row){
    if(row.constructor == this.meta){
        this.data.unshift(row);
    }
    this.fireEvent("add",[row]);
    return this.data.length;
}

DataMgr.prototype.size = function(){
    return this.data.length;
}


DataMgr.prototype.fireEvent = function(type,event){
    var tid = this.listenerTypes.indexOf(type);
    if(tid >= 0){
        var lists = this.listeners[type];
        for(var i=0,j=lists.length;i < j;i ++){
            lists[i](event);
        }
    }
}

DataMgr.prototype.attachListener = function(type,listener){
    var tid = this.listenerTypes.indexOf(type);
    if(tid >= 0){
        this.listeners[type].push(listener);
    }
}

DataMgr.prototype.removeListener = function(type,listener){
    var tid = this.listenerTypes.indexOf(type);
    if(tid >= 0){
        this.listeners[type] = this.listeners[type].filter(function(el){
            return el != listener;
        });
    }
}

DataMgr.prototype.get = function(queryFunc){
    var result = this.data.filter(queryFunc);
    return result;
}

DataMgr.prototype.getAt = function(idx){
    return this.data[idx];
}

DataMgr.prototype.del = function(queryFunc){
    var deleted = [];
    var newData = this.data.filter(function(el){
        var r = queryFunc(el);
        if(r){
            deleted.push(el);
        }
        return !r;
    });
    this.data = newData;
    this.fireEvent("del",deleted);
    return deleted.length;
}

DataMgr.prototype.delAt = function(idx){
    var removed = undefined;
    if(idx >= 0 && idx < this.data.length){
        removed = this.data[idx];
        var newData = [];
        for(var i=0,j=this.data.length;i < j;i++){
            if(i != idx)
                newData.push(data[i]);
        }
        this.data = newData();
        this.fireEvent("del",[removed]);
    }
    return removed;
}

DataMgr.prototype.clear = function(){
    var temp = this.data;
    this.data = [];
    this.fireEvent("del",temp);
    return temp.length;
}

DataMgr.prototype.update = function(updateFunc){
    var updated = [];
    for(var i=0,j=this.data.length;i < j;i ++){
        var r = updateFunc(data[i]);
        if(r){
            updated.push(this.data[i]);
        }
    }
    this.fireEvent("update",updated);
    return updated.length;
}
