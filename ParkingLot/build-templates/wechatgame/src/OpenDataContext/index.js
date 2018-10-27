/**
更新用户托管数据通关次数
*/
var updateRank = function(data){
	wx.setUserCloudStorage({
		KVDataList :[{key:'maxscore',value:data.maxscore+""},{key:'userId',value:data.userId+""}],
		success : function () {
			console("setUserCloudStorage===="+data.maxscore+"===="+ JSON.stringify(arguments));
		},
		fail : function () {
			console(JSON.stringify(arguments));
		},
		complete : function () {
		},
	});
};

/**
 * 获取好友信息
 */
var getUserInfo = function(data) {
	wx.getUserInfo({
		openIdList: ['selfOpenId'],
		lang: 'zh_CN',
		success: function(params) {
			console.log('getUserInfo success ' + JSON.stringify(params));
			var sharedCanvas = wx.getSharedCanvas();
			var context = sharedCanvas.getContext("2d");
			context[data.method_id] = {
				data : params.data,
				status: true
			}
		},
		fail: function(params) {
			console.log('getUserInfo fail ' + JSON.stringify(arguments));
			var sharedCanvas = wx.getSharedCanvas();
			var context = sharedCanvas.getContext("2d");
			context[data.method_id] = {
				data : params,
				status: false
			}
		}
	});
}

/**
 * 获取好友排行榜
 * @param data
 */
var getFriendRankData = function(data) {
	wx.getFriendCloudStorage({
		keyList:["avatarUrl","nickName",'userId','maxscore'],
		success: function (result) {
			var resultData = result.data;
			var sharedCanvas = wx.getSharedCanvas();
			var context = sharedCanvas.getContext("2d");
			context[data.method_id] = {
				data : resultData,
				status: true
			}
		},
		fail: function (result) {
			var sharedCanvas = wx.getSharedCanvas();
			var context = sharedCanvas.getContext("2d");
			context[data.method_id] = {
				data : result,
				status: false
			}
		},
		complete: function () {

		}
	});
}

/**
 * 获取群排行信息
 * @param data
 */
var getGroupRankData = function(data) {
	wx.getGroupCloudStorage({
		shareTicket: data.shareTicket,
		keyList:["avatarUrl","nickName",'userId','maxscore'],
		success: function (result) {
			console.log("getGroupRankData_success" + JSON.stringify(result));
			var resultData = result.data;
			var sharedCanvas = wx.getSharedCanvas();
			var context = sharedCanvas.getContext("2d");
			context[data.method_id] = {
				data: resultData,
				status: true
			}
		},
		fail: function (result) {
			console.log("getGroupRankData_fail" + JSON.stringify(result));
			var sharedCanvas = wx.getSharedCanvas();
			var context = sharedCanvas.getContext("2d");
			context[data.method_id] = {
				data: result,
				status: false
			}
		},
		complete: function () {

		}
	});
}

wx.onMessage(function(data) {
	switch (data.method){
		case 'updateMaxScore':{//更新托管数据
			updateRank(data);
			break;
		}
		case 'getUserInfo':{//获取好友信息
			getUserInfo(data);
			break
		}
		case 'getFriendRankData':{//获取好友排行
			getFriendRankData(data);
			break
		}
		case 'getGroupRankData':{// 获取群排行信息
			getGroupRankData(data);
			break
		}
  }
});