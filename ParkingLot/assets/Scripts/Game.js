var LevelData = require("LevelData");
var Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        layer_level: {
            default: null,
            type: cc.Node,
            tooltip: "选关层"
        },
        layer_game: {
            default: null,
            type: cc.Node,
            tooltip: "游戏层"
        },
        layer_result:{
            default: null,
            type: cc.Node,
            tooltip: "过关层"
        },
        node_parking: {
            default: null,
            type: cc.Node,
            tooltip: "停车场图层"
        },
        node_blockInput: {
            default: null,
            type: cc.Node,
            tooltip: "屏蔽层"
        },
        lbl_currentLevel:{
            default: null,
            type: cc.Label,
            tooltip: "当前关卡"
        },
        lbl_lv: {
            default: null,
            type: cc.Label,
            tooltip: "当前关卡"
        },
        pfb_road1:{
            default: null,
            type: cc.Prefab,
            tooltip: "最短的一条路"
        },
        pfb_road2: {
            default: null,
            type: cc.Prefab,
            tooltip: "中间长的一条路"
        },
        pfb_road3: {
            default: null,
            type: cc.Prefab,
            tooltip: "最长的一条路"
        },
        pfb_level: {
            default: null,
            type: cc.Prefab,
            tooltip: "选择关卡单个pfb"
        }

    },

    // 屏蔽层
    _initBlockInputNode(isShow){
        this.node_blockInput.active = isShow;
    },

    _initLevelGame(){
        this.levelRoads =  LevelData["level"+this.currentLevel][0];
        this.levelCarPosition = LevelData["level"+this.currentLevel][1];

        // 设置层级和关卡
        this.lbl_currentLevel.string = this.currentLevel;
        this.lbl_lv.string = this.currentLevel;
        this._initBlockInputNode(false);
    },


    _selectLevelClick(event){
        this.currentLevel = event.target.levelNum; // 根据选择的关卡设置
        this._initLevelGame();
        this._initLayerShowOrHidden(false,true,false);
    },

    _initSelectLevel(){
        var content = cc.find("scv_level/view/content",this.layer_level);
        var passLevel = Utils.getItemFromLocalStorage("passLevel",0);
        for (let i = 0; i < Object.keys(LevelData).length; i++) {
            var item = null;
            if ( content.getChildByName("level"+i) ) {
                item = content.getChildByName("level"+i);
            }else{
                var item = cc.instantiate(this.pfb_level);
                content.addChild(item);
            }
            var lbl_level = item.getChildByName("lbl_level").getComponent(cc.Label);
            lbl_level.string = i+1;
            item.levelNum = i+1;
            item.name = "level"+i;
            if (i <= parseInt(passLevel) ) {
                // 解锁关
                lbl_level.node.color = cc.color(255,255,255);
                item.on(cc.Node.EventType.TOUCH_END, this._selectLevelClick, this);
            }else{
                // 没解锁的关
                lbl_level.node.color = cc.color(100,100,100);
            }

        }

    },

    _initLayerShowOrHidden(layerLevel,layerGame,layerResult){
        this.layer_level.active = layerLevel;
        this.layer_game.active = layerGame;
        this.layer_result.active = layerResult;
    },

    start () {
        this._initLayerShowOrHidden(true,false,false);
        this._initSelectLevel();
    },

    btnReset(){
       cc.log("重置当前关卡数据");
    },

    btnMenu(){
        this._initLayerShowOrHidden(true,false,false);
        this._initSelectLevel();
    },

    btnResultOk(){
        cc.log("通过当前关卡之后，点击确定，进入下一关");
    },

});
