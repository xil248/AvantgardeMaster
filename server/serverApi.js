
class serverApi {

  static onAddDataFile(dataFile,userID){
    // this.props.dispatch(actions.addUser(newUser));
    // actions.addUser(newUser);
    // this.props.dispatch(newUser);
    // console.log(this.props.dispatch);
    console.log("onAddDataFile~~~~~~~~~~")
    var dataFileObj;
    $.ajax({
            url : "/addDataFile",
            type : "post",
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            async: false,
            data : JSON.stringify([dataFile,userID]),/*反序列化，到了服务端再被bodypaser.json（）序列化*/
            cache : false,
            success : function(fileData){
                console.log("Success: new data file added");
                dataFileObj = fileData;
                // this.changeDataset({value:fileData['id'], label:fileData['name']});
            }.bind(this),
            error : function(){
                console.log("Error: Failed to add new data file !");
            }
        });
    return dataFileObj;

  }


  static getSessionObjs( userID , fileID){

    var sessionObjs;

    $.ajax({
      url : "/getSessionObjs",
      type : "get",
      dataType : "json",
      async: false,
      contentType : "application/json; charset=utf-8",
      data : {userID:userID, fileID:fileID},
      cache : false,
      success : function(sessionObjsResult){
          console.log("Success: get sessionObj")
          sessionObjs = sessionObjsResult;
          
      }.bind(this),
      error : function(err){
          console.log("getSession failed !");
          console.log(err);
      }
    });
    

    return sessionObjs;

  }

  static saveCurSession(userID, fileID){

    $.ajax({
      url : "/saveCurSession",
      type : "post",
      contentType : "application/json; charset=utf-8",
      dataType : "json",
      async: false,
      data : JSON.stringify({userID:userID, fileID:fileID}),
      cache : false,
      success : function(){
          console.log("Success: updateSession!");
      }.bind(this),
      error : function(){
          console.log("Error: Failed to updateSession !");
      }
    });

  }

  static getCurSession( userID ){

    var sessionObjs;

    $.ajax({
      url : "/getCurSession",
      type : "get",
      dataType : "json",
      async: false,
      contentType : "application/json; charset=utf-8",
      data : {userID:userID},
      cache : false,
      success : function(sessionObjsResult){
          console.log("Success: get curSessionObj")
          sessionObjs = sessionObjsResult;
          
      }.bind(this),
      error : function(err){
          console.log("getCurSession failed !");
          console.log(err);
      }
    });
    
    return sessionObjs;

  }

  static loadPrevSession(userID, prevSessionObj){
   
    var sessionObjs;

    $.ajax({
      url : "/loadPrevSession",
      type : "post",
      contentType : "application/json; charset=utf-8",
      dataType : "json",
      async: false,
      data : JSON.stringify({userID:userID,prevSessionObj:prevSessionObj}),
      cache : false,
      success : function(){
          console.log("Success: updateSession!");
          // sessionObjs = sessionObjRes;
          
      }.bind(this),
      error : function(){
          console.log("Error: Failed to updateSession !");
      }
    });

    return sessionObjs;

  }


}

export default serverApi;
