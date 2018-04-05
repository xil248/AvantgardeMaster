module.exports={
    users : {
        userName: { type : String , required : true },
        password: { type : String , required : true },
        dataFiles: { type: Array, required : false},
        curSessionObj: { type: Object, required : true}
    },
    dataFiles: {
        fileName: {type : String, required : true },
        fileObj: {type : Object, required : true},
        dataType: {type : Object, required : true},
        sessionObjs: { type: Array, required : false}
    }
};