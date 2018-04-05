/* eslint-disable */
import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

import * as actions from '../actions/index';
import DataUtils from '../utils/dataUtils';
import serverApi from "../../server/serverApi"

import Sidebar from './Filters/Sidebar';
import GraphContainer from './Graphs/GraphContainer';
import ClusterContainer from './Clusters/ClusterContainer';
import MapContainer from './Graphs/MapContainer';
import LineChartContainer from './Graphs/LineChartContainer';

import $ from "./jquery.min.js";


const propTypes = {
  /**
   * Object containing the features to display coming
   * from Redux state
   */
  features: PropTypes.object,

  /**
   * Redux action creator to initialize the filters
   * on the data
   */
  initializeFilters: PropTypes.func,


  /**
   * Parameters from React-router
   */
  params: PropTypes.object,
};

const defaultProps = {
  features: {},
  initializeFilters() {},
  // Use default dataset if unspecified
  params: { dataset: 'default' },
};

/**
 * Component that handles all the feature and filter
 * toggling. This component uses local state to keep
 * track of all the filters that have been applied.
 */
class Main extends React.Component {

  constructor(props) {

    super(props);
    this.sessionObjs = [];
    this.curSessionObj = {};

    this.changeDataset = this.changeDataset.bind(this);
    // this.getSessionObjs = this.getSessionObjs.bind(this);
    this.updateCurSession = this.updateCurSession.bind(this);

    this.state={
      users : [],
      dataFiles : [],
      sessionUserID : '',
      sessionUserName : '',
    };
  }

  componentDidMount(){
      $.ajax({
          url : "/init",
          type : "get",
          dataType : "json",
          cache : false,
          success : function(users){

              console.log("AJAX request success!");
          
              this.setState({
                  users: users
              });
              // console.log(this.state.notes);
          }.bind(this),
          error : function(){
              console.log("Init failed !");
          }
      });
  }

  componentWillMount() {

    var ID = localStorage.getItem("userID");
    var UserName = localStorage.getItem("userName");

    if(ID){

      this.setState({sessionUserID:ID, sessionUserName:UserName});
      this.props.initializeFilters(this.props.params.dataset);

      this.curSessionObj = serverApi.getCurSession(ID);
      // console.log("**************************");
      // console.log(this.curSessionObj);
      // console.log(this.props.params.dataset);
      
      var curDataset = this.curSessionObj['dataFileID'];
      var expectedDataset = this.props.params.dataset ? this.props.params.dataset : '';
      
      if(curDataset != expectedDataset){
        window.location.href = `/viz/${curDataset}`;
      }
      else{
        // var pastSessionObjs = serverApi.getSessionObjs(ID,curDataset);
        
        const features = this.curSessionObj['features'];
        this.props.loadAllFeatures(features);
      }
      

    }
    else{
      window.location.href = '/';
    }
    // window.location.href = '/';

  }

  onAddNewUser(newUser){
   
    console.log(newUser);
    $.ajax({
            url : "/addUser",
            type : "post",
            contentType : "application/json; charset=utf-8",
            dataType : "json",
            async: false,
            data : JSON.stringify(newUser),/*反序列化，到了服务端再被bodypaser.json（）序列化*/
            cache : false,
            success : function(users){
                console.log("Success: user added");
                // notes=this.notesSort(users);
                this.setState({
                    users:users
                });
            }.bind(this),
            error : function(){
                console.log("Error: user added failure!");
            }
        });
  }

  // onAddDataFile(dataFile,userID){
  //   // this.props.dispatch(actions.addUser(newUser));
  //   // actions.addUser(newUser);
  //   // this.props.dispatch(newUser);
  //   // console.log(this.props.dispatch);
  //   console.log("onAddDataFile~~~~~~~~~~")

  //   $.ajax({
  //           url : "/addDataFile",
  //           type : "post",
  //           contentType : "application/json; charset=utf-8",
  //           dataType : "json",
  //           data : JSON.stringify([dataFile,userID]),/*反序列化，到了服务端再被bodypaser.json（）序列化*/
  //           cache : false,
  //           success : function(fileData){
  //               console.log("Success: new data file added");
  //               this.changeDataset({value:fileData['id'], label:fileData['name']});
  //           }.bind(this),
  //           error : function(){
  //               console.log("Error: Failed to add new data file !");
  //           }
  //       });

  // }

  updateSession( sessionObj , userID ){

    var sessionObjs;

    $.ajax({
      url : "/updateSession",
      type : "post",
      contentType : "application/json; charset=utf-8",
      dataType : "json",
      async: false,
      data : JSON.stringify({sessionObj:sessionObj,userID:userID}),
      cache : false,
      success : function(sessionObjRes){
          console.log("Success: updateSession!");
          sessionObjs = sessionObjRes;
          
      }.bind(this),
      error : function(){
          console.log("Error: Failed to updateSession !");
      }
    });

    return sessionObjs;

  }

  // getSessionObjs( userID ){

  //   var sessionObjs;

  //   $.ajax({
  //     url : "/getSession",
  //     type : "get",
  //     dataType : "json",
  //     async: false,
  //     contentType : "application/json; charset=utf-8",
  //     data : {userID:userID},
  //     cache : false,
  //     success : function(sessionObjsResult){
  //         console.log("Success: get sessionObj")
  //         sessionObjs = sessionObjsResult;
          
  //     }.bind(this),
  //     error : function(err){
  //         console.log("getSession failed !");
  //         console.log(err);
  //     }
  //   });
    

  //   return sessionObjs;

  // }

  updateCurSession( sessionObj , userID ){

    var sessionObjs;

    $.ajax({
      url : "/updateCurSession",
      type : "post",
      contentType : "application/json; charset=utf-8",
      dataType : "json",
      async: false,
      data : JSON.stringify({sessionObj:sessionObj,userID:userID}),
      cache : false,
      success : function(){
          console.log("Success: updateCurSession!");
          // sessionObjs = sessionObjRes;
          
      }.bind(this),
      error : function(err){
          console.log("Error: Failed to updateCurSession !");
          console.log(err);
      }
    });

    return sessionObjs;

  }


  // getCurSession( userID ){

  //   var sessionObjs;

  //   $.ajax({
  //     url : "/getCurSession",
  //     type : "get",
  //     dataType : "json",
  //     async: false,
  //     contentType : "application/json; charset=utf-8",
  //     data : {userID:userID},
  //     cache : false,
  //     success : function(sessionObjsResult){
  //         console.log("Success: get curSessionObj")
  //         sessionObjs = sessionObjsResult;
          
  //     }.bind(this),
  //     error : function(err){
  //         console.log("getCurSession failed !");
  //         console.log(err);
  //     }
  //   });
    
  //   return sessionObjs;

  // }






  changeDataset(datasetOptions) {
    // Only change if different
    // console.log(datasetOptions);
    if (datasetOptions.value !== this.props.params.dataset) {
      window.location.href = `/viz/${datasetOptions.value}`;
    }
  }

  render() {
    this.featuresToDisplay = Object.keys(this.props.features).filter((feature) => {
      return this.props.features[feature];
    });

    return (
      <div>
        <SplitPane split="vertical" defaultSize={'15%'}>
          <Sidebar changeDataset={this.changeDataset} datasetName={this.props.params.dataset} onAddNewUser={this.onAddNewUser.bind(this)}
          sessionUserID = {this.state.sessionUserID} sessionUserName = {this.state.sessionUserName} updateSession={this.updateSession.bind(this)}
          initSessions = {this.sessionObjs} updateCurSession = {this.updateCurSession}/>
          <div className="ag-main--container">
            <SplitPane split="horizontal" defaultSize={'50%'}>
              <div>
                <SplitPane split="vertical" defaultSize={'50%'}>
                  <div>
                    <SplitPane
                      split="horizontal"
                      defaultSize={'50%'}
                    >
                      <ClusterContainer />
                      <LineChartContainer />
                    </SplitPane>
                  </div>
                  <MapContainer />
                </SplitPane>
              </div>
              <GraphContainer />
            </SplitPane>
          </div>
        </SplitPane>
      </div>
    );
  }
}

Main.propTypes = propTypes;
Main.defaultProps = defaultProps;

function mapStateToProps(state) {
  return { features: state.features };
}

export default connect(mapStateToProps, actions)(Main);
