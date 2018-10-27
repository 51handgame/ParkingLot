module.exports = {
    /**
     * 设置本地缓存数据
     * @param keyStr 
     * @param ValueStr
     */
    setItemToLocalStorage: function(keyStr, ValueStr) {
        try{
            cc.sys.localStorage.setItem(keyStr, ValueStr+"");
        } catch(e) {
            cc.error("Utils", "setItemToLocalStorage fail");
        }
    },

    /**
     * 获取本地缓存数据
     * @param keyStr 
     * @param defaultValue
     * @returns {string} 返回本地缓存数据，数据类型String
     */
    getItemFromLocalStorage: function(keyStr, defaultValue) {
        if(!cc.sys.localStorage.getItem) {
            return def_value;
        }
        var tmp = cc.sys.localStorage.getItem(keyStr);
        if (!tmp) {
            return defaultValue;
        }
        return String(tmp);
    },

    /**
     * 对象的深拷贝
     */
    deepCopy: function(obj) {
        var out = [],len = obj.length;
        for (var i= 0; i < len; i++) {
            if (obj[i] instanceof Array){
                out[i] = deepCopy(obj[i]);
            } else {
                out[i] = obj[i];
            }
        }
        return out;
    },
};