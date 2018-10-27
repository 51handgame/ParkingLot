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
            tooltip: "选择管卡单个pfb"
        }

    },

    _parkingTouch(event, pCallback ){
        // console.log("### 点击车位 x = " + event.target.x + ", y = " + event.target.y);
        // console.log("### 点击的位置 = " + event.target.carPosition);
        this._initParkingTouch(false);
        var self = this;
        if ( this.levelCarPosition[event.target.carPosition] != 0 ) {
            // 移动小车
            var pEndIndex = -1;
            var zeroIndex = -1;
            var pZOrder = 0;
            for (var i = 0; i < this.levelCarPosition.length; i++) {
                if (this.levelCarPosition[i] == 0 ) {
                    zeroIndex = i;
                    break;
                }
            }

            var canWalkRoad = this._getRoadByPos(this.levelRoads, zeroIndex);
            for (let i = 0; i < canWalkRoad.length; i++) {
                // console.log(this.levelRoads[i]);
                if ( canWalkRoad[i][1] == event.target.carPosition ) {
                    pEndIndex = canWalkRoad[i][0];
                    pZOrder = canWalkRoad[i][2];
                    break;
                }else if( canWalkRoad[i][0] == event.target.carPosition ){
                    pEndIndex = canWalkRoad[i][1];
                    pZOrder = canWalkRoad[i][2];
                    break;
                }
            }

            if (pEndIndex == -1) {
                this._initParkingTouch(true);
                console.error("错误的 pEndIndex");
                return;
            }
            var pEndPos = this.node_parking.getChildByName("parking"+pEndIndex).getPosition();
            var moveTo = cc.moveTo(0.5,pEndPos);
            var callFunc = cc.callFunc(function(){
                // 1、交换 this.tPositin
                var temp = self.levelCarPosition[pEndIndex];
                self.levelCarPosition[pEndIndex] = self.levelCarPosition[event.target.carPosition];
                self.levelCarPosition[event.target.carPosition] = temp;
                // console.log(self.levelCarPosition);
                // 2、旋转车
                self._initCarToRatation();
                // 3、重新设置可点击
                self._initParkingTouch(true);
                // 4、检查是否过关
                self._checkIsPassLevel();
                // 5、回调
                if (pCallback) {
                    pCallback();
                }
                
            });
            var sequence = cc.sequence(moveTo,callFunc) 

            var carItem = this.node_parking.getChildByName("car"+ this.levelCarPosition[event.target.carPosition] );
            carItem.setLocalZOrder(pZOrder+1);//车的层级比路高一级
            carItem.runAction(sequence);
        }
    },

    _initParkingTouch( isRegister ){
        for (let i = 0; i < 6; i++) {
            var parking = this.node_parking.getChildByName("parking"+i);
            parking.carPosition = i;
            if (isRegister) {
                parking.on(cc.Node.EventType.TOUCH_START, this._parkingTouch, this);
            }else{
                parking.off(cc.Node.EventType.TOUCH_START, this._parkingTouch, this);
            }
        }
    },

    // 查找所有跟pos连通的路
    _getRoadByPos(pRoads,pos){
        var temp_roads = [];
        var pRoadsLength = pRoads.length;
        for (let i = 0; i < pRoadsLength; i++) {
            if (pRoads[i][0] == pos || pRoads[i][1] == pos ) {
                temp_roads.push(pRoads[i]);
            }
        }
        return temp_roads;
    },

    // 初始化各层级的显示
    _initEachLayer(isResult){
        this.layer_result.active = isResult;
    },

    // 将指定的车放到指定的位置
    _initCarToPosition(){
        var cars = ["","blue","red","yellow","green","pink"]
        for (let i = 0; i < 6; i++) {
            if (cars[i] != "") {
                var carItem = this.node_parking.getChildByName("car"+ this.levelCarPosition[i] );
                var levelCarPosition =  this.node_parking.getChildByName("parking"+ i).getPosition();
                carItem.setPosition(levelCarPosition);
            }
        }
    },

    // 渲染指定的路
    _initRoadToPosition(){
        // 清空上一关道路数据
        var children = this.node_parking.children;
        for (let i = children.length-1; i > 0; i--) {
            if (children[i].name == "road") {
                children[i].removeFromParent();
            }
        }
       
        var forLength = this.levelRoads.length; 
        for (let i = 0; i < forLength; i++) {
            // 添加路
            var startPos = this.levelRoads[i][0];
            var endPos = this.levelRoads[i][1];
            this.levelRoads[i][2] = this.levelRoads[i][2] + i*2; // 路之间的层级错开，保证车的层级正确
            var zOrder = this.levelRoads[i][2];

            var item = null;
            if (endPos - startPos == 1) {
                item = cc.instantiate(this.pfb_road1);//最短一条路
            }else if( (endPos-startPos)%2 == 0  ){
                item = cc.instantiate(this.pfb_road2);//中间长一条路
            }else if(endPos - startPos == 3){
                item = cc.instantiate(this.pfb_road3);//最长一条路
            }else if (endPos - startPos == 5) {
                item = cc.instantiate(this.pfb_road1);//最短一条路
            }

            // 旋转路面
            var positionStart = this.node_parking.getChildByName("parking"+ startPos).getPosition();
            var positionEnd = this.node_parking.getChildByName("parking"+ endPos).getPosition();
            var deltaP = positionStart.sub(positionEnd);
            var angle = cc.pToAngle(cc.p(deltaP.y, deltaP.x) ) / Math.PI * 180;
            item.rotation = angle;
           
            if (item) {
                var itemPostion = cc.pAdd(positionStart,positionEnd);
                item.setPosition( cc.p(itemPostion.x/2,itemPostion.y/2) );
                item.setLocalZOrder(zOrder);
                item.name = "road";
                this.node_parking.addChild(item);
            }else{
                console.log("### 为空有问题，第几条路为空 = "+ i)
            }
           

        }
    },

    // 初始化旋转车
    _initCarToRatation(){
        var self = this;
        // 车，开始位置，结束位置，车颜色
        function rotationCar( pCar, pStart, pEnd, pColor ){
            self.carsAngle[pColor] = self.node_parking.getChildByName("parking"+ pStart).getPosition();
            var pEndPos = self.node_parking.getChildByName("parking"+ pEnd).getPosition();
            var deltaP = pEndPos.sub( self.carsAngle[pColor] );
            var angle = cc.pToAngle(cc.p(deltaP.y, deltaP.x) ) / Math.PI * 180;
            // pCar.rotation = angle;
            var rotationAni = cc.rotateTo(0.2,angle);
            pCar.runAction(rotationAni);
            self.carsAngle[pColor] = pEndPos;
        };

        var zeroIndex = -1;
        for (var i = 0; i < this.levelCarPosition.length; i++) {
            if (this.levelCarPosition[i] == 0 ) {
                zeroIndex = i;
                break;
            }
        }
        
        var canWalkRoad = this._getRoadByPos(this.levelRoads, zeroIndex);
        for (let i = 0; i < canWalkRoad.length; i++) {
            var pos = canWalkRoad[i][0] != zeroIndex ? canWalkRoad[i][0] : canWalkRoad[i][1];
            var carItem = this.node_parking.getChildByName("car"+ this.levelCarPosition[pos] );
            rotationCar(carItem, pos, zeroIndex, this.levelCarPosition[pos]);
        }
    },

    // 检查是否过关
    _checkIsPassLevel(){
        if (this.levelCarPosition.toString() == [0,1,2,3,4,5].toString() ) {
            this._initBlockInputNode(false);
            // 弹出一个框，恭喜过关，下面有个复选框，分享给朋友，默认选中
            console.log("### 恭喜过关！");

            this._initEachLayer(true);
            this._initResultLayer();
        }
    },

    _initResultLayer(){
        
        // 当前关卡大于本地存储关卡才存
        var localLevel = Utils.getItemFromLocalStorage("passLevel",0);
        if (this.currentLevel > parseInt(localLevel) ) {
            Utils.setItemToLocalStorage("passLevel",this.currentLevel);
        }

        // 赋值代码不应该在这；
        var lbl_success = this.layer_result.getChildByName("lbl_success").getComponent(cc.Label);
        lbl_success.string = "恭喜你，通过第"+ this.currentLevel +"关！";
        if (this.currentLevel >= Object.keys(LevelData).length) {
            lbl_success.string = "恭喜你，已全部通关";
        }else{
            lbl_success.string = "恭喜你，通过第"+ this.currentLevel +"关！";
        }
    },

    // 屏蔽层
    _initBlockInputNode(isShow){
        this.node_blockInput.active = isShow;
    },

    _initLevelGame(){
        // this.levelRoads =  LevelData["level"+this.currentLevel][0];
        // this.levelCarPosition = LevelData["level"+this.currentLevel][1];
        // 上面的写法有局限，中间不能出现断格关卡配置
        var levelAllKeys = Object.keys(LevelData);
        this.levelRoads =  LevelData[ levelAllKeys[this.currentLevel-1] ][0];
        this.levelCarPosition = Utils.deepCopy( LevelData[ levelAllKeys[this.currentLevel-1] ][1] ) ;

        // 记录车的最后旋转角度
        this.carsAngle = [this.blueAngle,this.redAngle,this.yellowAngle,this.greenAngle,this.pinkAngle];
        // 设置层级和关卡
        this._initEachLayer(false);
        this.lbl_currentLevel.string = this.currentLevel;
        this.lbl_lv.string = this.currentLevel;

        // 1、将指定的车放到指定的位置
        this._initCarToPosition();
        // 2、渲染指定的路
        this._initRoadToPosition();
        // 3、初始化旋转车
        this._initCarToRatation();
        // 4、注册停车场事件
        this._initParkingTouch(true);
        // 5、屏蔽层
        this._initBlockInputNode(false);
    },


    _selectLevelClick(event){
        console.log(event.target.levelNum);

        // 点击选择关卡再调用
        this.currentLevel = event.target.levelNum; // 根据选择的关卡设置 34
        console.log(Object.keys(LevelData));
        this._initLevelGame();
        // 设置选择关卡不可见
        this.layer_level.active = false;
        this.layer_game.active = true;
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

    start () {
        this.layer_level.active = true;
        this.layer_game.active = false;
        this._initSelectLevel();
    },

    btnReset(){
        if ( this.levelCarPosition.toString() == LevelData[ Object.keys(LevelData)[this.currentLevel-1] ][1].toString()  ) {
            console.log("### 当前即为初始化状态，无需重置！！！");
        }else{
            this._initLevelGame();
        }
    },

    btnMenu(){
        this.layer_level.active = true;
        this.layer_game.active = false;
        this._initSelectLevel();
    },

    btnFindWay(){
        var self = this;
        console.log("### auto find way solution !!!");
        var autoFindWay = self.node_findWay.getComponent("Test6_1")._autoFindWay(self.levelRoads, self.levelCarPosition);
        // console.log(autoFindWay.solution);
        var solution = autoFindWay.solution.toString().split("_");
        // 1、整个屏幕不能点击
        self._initBlockInputNode(true);
        // 2、通过回调播放完所有行走路径
        var excuteNum = 0;
        function playWalkAni(pPos){
            excuteNum += 1;
            // 自动走步，完成挑战
            var item = {};
            item.target = {};
            item.target.carPosition = pPos;
            item.target.x = self.node_parking.getChildByName("parking"+item.target.carPosition).x;
            item.target.y = self.node_parking.getChildByName("parking"+item.target.carPosition).y;
            if (excuteNum>=solution.length) {
                self._parkingTouch( item );
            }else{
                self._parkingTouch( item, function(){
                    playWalkAni(solution[excuteNum]);
                } );
            }
            
        };
        playWalkAni(solution[0]);
        
    },


    btnResultOk(){
        if (this.currentLevel >= Object.keys(LevelData).length) {
            this.currentLevel = 1; // 通全关，重新去第一关
        }else{
            this.currentLevel += 1;
        }

        var toggle_share = this.layer_result.getChildByName("toggle_share").getComponent(cc.Toggle);
        if (toggle_share.isChecked) {
            console.log("选中状态！！");
        }else{
            console.log("未选中状态！！")
        }
        
        this._initLevelGame();
        
    },

});
