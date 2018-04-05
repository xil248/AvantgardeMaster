var express = require('express');
var router = express.Router();


router.get('/init', function(req,res,next){/*请求参数，相应参数和负责把错误信息运送出来的next参数*/
	var usersModel= global.dbHandle.getModel("users");/*获取note数据库模型，模型能直接对数据库进行操作*/
	// console.log("/init been called");
	usersModel.find({},function(err,user){
		if(err){
			// console.log(err);
			return next(err);
		}else{
			// console.log("get all users info ");
			res.json(user);
			// console.log(user);
		}
	})
});

router.post('/addUser', function(req,res,next){
	var newUser=req.body;
	var userModel=global.dbHandle.getModel("users");
	
	userModel.find({userName:newUser['userName']},function(err,users){
		if(err){
			console.log("User Added Error!");
		}else{
			console.log(users)
			if(users.length){
				var emptyRst = [];
				res.json(emptyRst);
			}
			else{
				userModel.create(newUser,function(err){
					if(err){
						return next(err);
					}else{
							console.log("/addUser success！！！");
							userModel.find({userName:newUser['userName']},function(err,users){
								if(err){
									console.log("Error!");
								}else{
									// res.json(users[0]['_id']);
									res.json(users[0]);
								}
							});
						}
				});
			}

			// // res.json(users[0]['_id']);
			// res.json(users[0]);
			
		}
	});

	// userModel.create(newUser,function(err){
	// 	if(err){
	// 		return next(err);
	// 	}else{
	// 		console.log("/addUser success！！！");
	// 		userModel.find({userName:newUser['userName']},function(err,users){
	// 			if(err){
	// 				console.log("Error!");
	// 			}else{
	// 				// res.json(users[0]['_id']);
	// 				res.json(users[0]);
	// 			}
	// 		});
	// 	}
	// });
});

router.get('/checkUser', function(req,res,next){/*请求参数，相应参数和负责把错误信息运送出来的next参数*/
	var usersModel= global.dbHandle.getModel("users");/*获取note数据库模型，模型能直接对数据库进行操作*/
	console.log("/checkUser been called");
	var userName = req.query['user']['userName'];
	var password = req.query['user']['password'];
	
	usersModel.find({$and: [ { userName: userName }, { password: password } ]},function(err,user){
		if(err){
			// console.log(err);
			return next(err);
		}else{
		
			if(user.length == 0){
				res.json("");
			}
			else{
				var userObj = {id : user[0]['_id'], userName : user[0]['userName'] }
				res.json(userObj);
			}

		}
	})
});




router.post('/addDataFile', function(req,res,next){
	var dataFile = req.body[0];
	var userID = req.body[1];
	
	var dataFileModel = global.dbHandle.getModel("dataFiles");
	var userModel = global.dbHandle.getModel("users");
	// var userID =  "5a3f3fa8e5114badf4d134a0";
	dataFileModel.create(dataFile,function(err,curDataFile){
		if(err){
			return next(err);
		}else{
			var curDataID = curDataFile['_id'];
			
			
			userModel.update({_id : userID }, {$push:{dataFiles:curDataID}},function(err){
				if(err){
					console.log("Error!");
				}else{
					console.log("Success: data file name added to user model");
					res.json( {id:curDataID, name:curDataFile['fileName']});
				}
			});
			console.log("/addDataFile success！！！");
			
			// dataFileModel.find({},function(err,newDataFile){
			// 	if(err){
			// 		console.log("Error!");
			// 	}else{
			// 		// console.log(newDataFile);
			// 		res.json(newDataFile);
			// 	}
			// });
		}
	});
});

router.get('/getDataFile', function(req,res,next){
	//Get userID from request

	var userID = req.query['UserID'];
	var dataFileModel = global.dbHandle.getModel("dataFiles");
	var usersModel= global.dbHandle.getModel("users");

	usersModel.findOne({_id : userID},{dataFiles : 1},function(err,files){
		if(err){
			console.log(err);
			return next(err);
		}else{
			console.log("get data called ");
			// console.log(files["dataFiles"]);
			dataFileModel.find({"_id":{"$in":files["dataFiles"]}},{fileName : 1},function(err,dataFiles){
				if(err){
					console.log(err);
					return next(err);
				}else{
					res.json(dataFiles);
				}
			});
		}
	})
});

router.get('/getRawData', function(req,res,next){


	var dataID = req.query['Data_ID'];
	var dataFileModel = global.dbHandle.getModel("dataFiles");

	dataFileModel.find({_id : dataID}, function(err,files){
		if(err){
			console.log(err);
			return next(err);
		}else{
			// console.log("get data called ");
			// console.log(files);
			res.json(files);
			
		}
	})
});


router.post('/updateSession', function(req,res,next){

	const maxSessions = 5;

	var sessionObj = req.body['sessionObj'];
	var userID = req.body['userID'];

	var userModel = global.dbHandle.getModel("users");

	userModel.find({_id : userID},{sessionObjs : 1},function(err,findResult){
		if(err){
			console.log(err);
			return next(err);
		}else{
			
			if(findResult[0]['sessionObjs'].length >= maxSessions){
				userModel.update({ _id: userID}, { $pop: { sessionObjs: -1 }},function(err){
					if(err){
						console.log(err);
					}
				})
			}

			userModel.update({ _id: userID}, { $push: { sessionObjs: sessionObj }},function(err){
				if(err){
					console.log(err);
				}
				else{
					userModel.find({_id : userID},{sessionObjs : 1},function(err,Result){
						
						var tempRest = Result[0]['sessionObjs'];	
						res.json(tempRest);
						
					})
				}
			})
		
		}
	})

});

router.get('/getSessionObjs', function(req,res,next){


	console.log("-----------getSession------------");
	var userID = req.query['userID'];
	var fileID = req.query['fileID'];

	var userModel = global.dbHandle.getModel("users");
	var dataFileModel = global.dbHandle.getModel("dataFiles");

	if(!fileID){
		var emptyRst = []
		res.json(emptyRst);
	}
	else{
		dataFileModel.find({_id : fileID},{sessionObjs : 1},function(err,findResult){
			if(err){
				console.log(err);
				return next(err);
			}else{
				console.log(findResult[0]['sessionObjs']);
				res.json(findResult[0]['sessionObjs']);

			}
		})
	}




});

router.post('/updateCurSession', function(req,res,next){

	var sessionObj = req.body['sessionObj'];
	var userID = req.body['userID'];

	console.log("-----------------------")
	console.log(sessionObj)

	var userModel = global.dbHandle.getModel("users");

	userModel.find({_id : userID},{curSessionObj : 1},function(err,curSession){
		if(err){
			console.log(err);
			return next(err);
		}else{

			if('dataFileID' in sessionObj){
				userModel.update({ _id: userID}, { $set: { "curSessionObj.dataFileID" : sessionObj['dataFileID'] }},function(err){
					if(err){
						console.log(err);
					}
					else{
						console.log('1111111111');
					}
				})
			}


			if('features' in sessionObj){
				
				userModel.update({ _id: userID}, { $set: { "curSessionObj.features": sessionObj['features'] }},function(err){
					if(err){
						console.log(err);
					}
					else{
						console.log('222222222');
					}
				})
			}

			if('featureName' in sessionObj){
				var shouldAdd = true;
				var newFeatures = curSession[0]['curSessionObj']['features'];
				for (var i = 0; i < newFeatures.length; i++){
					if(newFeatures[i] == sessionObj['featureName']){
						newFeatures.splice(i, 1);
						shouldAdd = false;
						break;
					}
				}
				if(shouldAdd) newFeatures.push(sessionObj['featureName']);

				userModel.update({ _id: userID}, { $set: { "curSessionObj.features": newFeatures }},function(err){
					if(err){
						console.log(err);
					}
					else{
						// res.json('Success');
						console.log('33333333');
					}
				})
			}

			res.json('Success');


			
			// if(findResult[0]['sessionObjs'].length >= maxSessions){
			// 	userModel.update({ _id: userID}, { $pop: { sessionObjs: -1 }},function(err){
			// 		if(err){
			// 			console.log(err);
			// 		}
			// 	})
			// }

			// userModel.update({ _id: userID}, { $push: { sessionObjs: sessionObj }},function(err){
			// 	if(err){
			// 		console.log(err);
			// 	}
			// 	else{
			// 		userModel.find({_id : userID},{sessionObjs : 1},function(err,Result){
						
			// 			var tempRest = Result[0]['sessionObjs'];	
			// 			res.json(tempRest);
						
			// 		})
			// 	}
			// })
		
		}
	})

});

router.get('/getCurSession', function(req,res,next){


	console.log("-----------getCurSession------------");
	var userID = req.query['userID'];

	var userModel = global.dbHandle.getModel("users");
	

	userModel.find({_id : userID},{curSessionObj : 1},function(err,findResult){
		if(err){
			console.log(err);
			return next(err);
		}else{
		
			res.json(findResult[0]['curSessionObj']);

		}
	})


});


router.post('/saveCurSession', function(req,res,next){

	const maxSessions = 5;

	// var sessionObj = req.body['sessionObj'];
	var userID = req.body['userID'];
	var fileID = req.body['fileID'];
	var userModel = global.dbHandle.getModel("users");
	var dataFileModel = global.dbHandle.getModel("dataFiles");

	dataFileModel.find({_id : fileID},{sessionObjs : 1},function(err,findResult){
		if(err){
			console.log(err);
			return next(err);
		}else{
			
			userModel.find({_id : userID},{curSessionObj : 1},function(err,curSession){

				const curSessionObj = curSession[0]['curSessionObj'];
			
				if(findResult[0]['sessionObjs'].length >= maxSessions){
					dataFileModel.update({ _id: fileID}, { $pop: { sessionObjs: -1 }},function(err){
						if(err){
							console.log(err);
						}
					})
				}

				dataFileModel.update({ _id: fileID}, { $push: { sessionObjs: curSessionObj }},function(err){
					if(err){
						console.log(err);
					}
					else{
						// userModel.find({_id : userID},{sessionObjs : 1},function(err,Result){
							
						// 	var tempRest = Result[0]['sessionObjs'];	
						// 	res.json(tempRest);
							
						// })
						res.json('Success');
					}
				})
			
			})
		}
	})

	// userModel.find({_id : userID},{sessionObjs : 1},function(err,findResult){
	// 	if(err){
	// 		console.log(err);
	// 		return next(err);
	// 	}else{

	// 		userModel.find({_id : userID},{curSessionObj : 1},function(err,curSession){

	// 			const curSessionObj = curSession[0]['curSessionObj'];
			
	// 			if(findResult[0]['sessionObjs'].length >= maxSessions){
	// 				userModel.update({ _id: userID}, { $pop: { sessionObjs: -1 }},function(err){
	// 					if(err){
	// 						console.log(err);
	// 					}
	// 				})
	// 			}

	// 			userModel.update({ _id: userID}, { $push: { sessionObjs: curSessionObj }},function(err){
	// 				if(err){
	// 					console.log(err);
	// 				}
	// 				else{
	// 					// userModel.find({_id : userID},{sessionObjs : 1},function(err,Result){
							
	// 					// 	var tempRest = Result[0]['sessionObjs'];	
	// 					// 	res.json(tempRest);
							
	// 					// })
	// 					res.json('Success');
	// 				}
	// 			})
			
	// 		})
	// 	}
	// })

});


router.post('/loadPrevSession', function(req,res,next){



	var sessionObj = req.body['prevSessionObj'];
	var userID = req.body['userID'];
	// console.log('@@@@@@@@@@@@@@@');
	// console.log(userID)
	// console.log(sessionObj);


	var userModel = global.dbHandle.getModel("users");


	userModel.update({ _id: userID}, { $set: { "curSessionObj": sessionObj }},function(err){
		if(err){
			console.log(err);
		}
		else{
			res.json('Success');
			// console.log('33333333');
		}
	})

});


module.exports = router;
