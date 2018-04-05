/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import Select from 'react-select';

import Filter from './Filter';
import ConfidenceLegend from './ConfidenceLegend';
import * as actions from '../../actions/index';
import DataUtils from '../../utils/dataUtils';

import Filters from '../../filtering';
import {
  FILTER_CONTINUOUS,
  FILTER_CATEGORICAL,
} from '../../filtering/filterTypes';

//Import added by Ryan and Mandy
import ReactFileReader from "react-file-reader";
import Modal from 'react-modal';
import { Button,ButtonToolbar } from 'react-bootstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import serverApi from "../../../server/serverApi"

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : '100px',
    bottom                : '-10%',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    color                 : 'gray',
    zIndex                : '3',
  }
};

const defaultCurSessionObj = {
  dataFileID:'',
  features:[],
  filters:[],
  cluster:''
}

const dataTypes = [ 'String', 'Numeric', 'Enrollment Date', 'Zipcode','Geographic'];

const cellEditProp = {
  mode: 'click',
  blurToSave: true,
  nonEditableRows: function() {
    var nonEditableR = [];
    for(let i = 1; i <= tableData.length; i++){
      nonEditableR.push(i);
    }
    return nonEditableR;
  }
};

var rawData;
var rawDataJSON;
var tableData;
var tableDataTypes = {};
var fileName;
var fieldNames = [];
var fieldOptions = [];
var maxSession = 5;
var defaultSessionObj = {
  Dataset:'default',
  Features:[]
};



const propTypes = {
  /**
   * Data the display coming from Redux state
   */
  data: PropTypes.array,

  /**
   * All of the data (for filtering purposes)
   */
  allData: PropTypes.array,

  /**
   * Features shown from Redux state
   */
  features: PropTypes.object,

  /**
   * Redux Action creator to add a feature
   */
  addFeature: PropTypes.func,

  /**
   * Redux Action creator to remove a feature
   */
  removeFeature: PropTypes.func,

  /**
   * Redux action creator to change the filters
   * on the data
   */
  updateFilters: PropTypes.func,

  /**
   * Array of filters from Redux state
   */
  filters: PropTypes.array,

  /**
   * Boolean whether or not to display visualizations for All Data
   */
  showAllData: PropTypes.bool,

  /**
   * Action creator to toggle showing of visualizations for All Data
   */
  toggleAllData: PropTypes.func,

  /**
   * Function that changes the dataset by forcing a refresh
   */
  changeDataset: PropTypes.func,

  /**
   * The name of the current dataset
   */
  // datasetName: PropTypes.string.isRequired,
};

const defaultProps = {
  data: [],
  allData: [],
  features: {},
  addFeature() {},
  removeFeature() {},
  updateFilters() {},
  filters: [],
  showAllData: true,
  toggleAllData() {},
  changeDataset() {},
  params: { dataset: 'default' },
};

/**
 * Component that is responsible for rendering the filters
 */
class Sidebar extends React.Component {
  // TODO: use display:none to hide elements instead of forcing rerender
  constructor(props) {
    super(props);

    console.log("@@@@@@@@@@@@@@@");
    console.log(this.props.datasetName);

    // Hide EnrollmentDate because it's filtered in LineChart and not a proper
    // bucketable filter
    const disabledFeatures = ['EnrollmentDate', 'date', 'year', 'DateofEnrollment', 'ZIP', 'ZIP_FINAL'];

    this.possibleData = DataUtils.getAllAttributes();
    this.features = DataUtils.getAllFeatures();
    this.pastSessionObjs = serverApi.getSessionObjs(this.props.sessionUserID,this.props.datasetName);



    this.sessionObjs = this.props.initSessions;
    this.curSessionIndex = -1;
    if (this.props.initSessions.length > 0) this.curSessionIndex = this.props.initSessions.length - 1;
    this.userName = localStorage.getItem('UserName');

    this.categoricalFeatures = DataUtils.getAllCategoricalFeatures().filter((feature) => {
      return disabledFeatures.indexOf(feature) === -1;
    });
    this.continuousFeatures = DataUtils.getAllContinuousFeatures().filter((feature) => {
      return disabledFeatures.indexOf(feature) === -1;
    });



    // Function bindings
    this.handleFeature = this.handleFeature.bind(this);
    this.renderFilters = this.renderFilters.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleFilterFilters = this.handleFilterFilters.bind(this);
    this.handleAllDataToggle = this.handleAllDataToggle.bind(this);
    this.filterFilters = this.filterFilters.bind(this);
    this.filterFilters = debounce(this.filterFilters, 250);
    this.uploadFiles = this.uploadFile.bind(this);
    //modal function bindings
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.uploadModal = this.uploadModal.bind(this);
    this.loadDataFiles = this.loadDataFiles.bind(this);
    this.changeZipcodeField = this.changeZipcodeField.bind(this);
    this.changeDateField = this.changeDateField.bind(this);
    this.changeClusterField = this.changeClusterField.bind(this);
    this.changeDataset = this.changeDataset.bind(this);
    this.getPrevSession = this.getPrevSession.bind(this);
    this.getNextSession = this.getNextSession.bind(this);
    this.logout = this.logout.bind(this);
    

    // Handle the content of filter input box
    this.state = {
      // Tracks which features to display
      categoricalFeaturesDisplayed: this.categoricalFeatures,
      continuousFeaturesDisplayed: this.continuousFeatures,
      // dataFiles: this.loadDataFiles(userID),
      dataFileOptions: [],
      zipcodeField:'',
      dateField:'',
      clusterField:'',
      modalIsOpen: false,
    };
    // this.loadDataFiles(userID);
    this.loadDataFiles(this.props.sessionUserID);

  }

  componentWillMount(){

  }



  handleSubmit(event){
		event.preventDefault();
		if(this.refs.name.value=="" ||this.refs.password.value=="" ) return;
		var newUser={
      userName : this.refs.name.value,
      password : this.refs.password.value
		};
		this.props.onAddNewUser(newUser);
  }

  changeZipcodeField(curField){
    this.setState({zipcodeField:curField});
    tableDataTypes[curField['value']] = 'Zipcode';

  }

  changeDateField(curField){
    this.setState({dateField:curField});
    tableDataTypes[curField['value']] = 'Enrollment Date';
  }

  changeClusterField(curField){
    this.setState({clusterField:curField});
  }

  changeDataset(datasetOptions) {
    if (datasetOptions.value !== this.props.params.dataset) {

      var datasetPastSessionObjs = serverApi.getSessionObjs(this.props.sessionUserID, datasetOptions.value);

      // console.log('+++++++++++++++++++')
      // console.log(datasetPastSessionObjs);

      if(datasetPastSessionObjs.length == 0){
        var newSessObj = defaultCurSessionObj;
        newSessObj['dataFileID'] = datasetOptions.value;
        this.props.updateCurSession(newSessObj,this.props.sessionUserID);
      }
      else{
        this.props.updateCurSession(datasetPastSessionObjs[datasetPastSessionObjs.length - 1],this.props.sessionUserID);
      }


      window.location.href = `/viz/${datasetOptions.value}`;

      // var sessionObjs = this.sessionObjs;
      // console.log("changeDataset-----------------")
      // console.log(sessionObjs);
      
      // var newSessionObj;
      
      // if(sessionObjs.length != 0){
      //   newSessionObj = sessionObjs[this.curSessionIndex];
      // }
      // else{
      //   newSessionObj = defaultSessionObj;
      // }
      
      // newSessionObj['Dataset'] = datasetOptions.value;
      // this.sessionObjs = this.props.updateSession(newSessionObj,this.props.sessionUserID);
      // if(sessionObjs.length < maxSession) {this.curSessionIndex++}
      // else {this.curSessionIndex = maxSession-1};

      // window.location.href = `/viz/${datasetOptions.value}`;
    }
  }

  getPrevSession(){

    if(this.pastSessionObjs.length == 0 || this.curSessionIndex == 0){
      alert("No more previous session!");
    }
    else{
      // console.log('-----------------')
      // console.log(this.pastSessionObjs);
      // const curSessionObj = serverApi.getCurSession(this.props.sessionUserID);
      // console.log(curSessionObj);
      if(this.curSessionIndex == -1) this.curSessionIndex = this.pastSessionObjs.length-1;
      else this.curSessionIndex--;
      const features = this.pastSessionObjs[this.curSessionIndex]['features'];
      this.props.loadAllFeatures(features);
    }

    // console.log("PrevSession Called !");
    // // console.log(this.props.sessionObjs);
    // var sessionObjs = this.sessionObjs;
    // if(sessionObjs.length == 0 || this.curSessionIndex == 0){
    //   alert("No more previous session!");
    // }
    // else{
    //   console.log("PrevSession 2 !");
    //   // if (curSessionIndex == -1) curSessionIndex = sessionObjs.length - 1;
    //   // sessionObjs[curSessionIndex-1]

    //   var latestFeatures = sessionObjs[this.curSessionIndex-1]['Features'];
    //   this.curSessionIndex --;
    //   this.props.loadAllFeatures(latestFeatures);
    // }

  }

  getNextSession(){

    if(this.curSessionIndex == -1){
      alert("No more next session!");
    }
    else{
      this.curSessionIndex = this.curSessionIndex+1 == this.pastSessionObjs.length? -1:this.curSessionIndex+1;
      if(this.curSessionIndex==-1){
        const curSessionObj = serverApi.getCurSession(this.props.sessionUserID);
        
        const features = curSessionObj['features'];
        this.props.loadAllFeatures(features);
      }
      else{
        const features = this.pastSessionObjs[this.curSessionIndex]['features'];
        this.props.loadAllFeatures(features);
      }
    }

    // console.log("NextSession Called !");
    // var sessionObjs = this.sessionObjs;
    // // if (curSessionIndex == -1) curSessionIndex = sessionObjs.length - 1;
    // if(sessionObjs.length == 0 || this.curSessionIndex == sessionObjs.length-1){
    //   alert("No more next session!");
    // }
    // else{

    //   var latestFeatures = sessionObjs[this.curSessionIndex+1]['Features'];
    //   this.curSessionIndex ++;
    //   this.props.loadAllFeatures(latestFeatures);
    // }
  }

  // saveCurSession(userID){

  //   $.ajax({
  //     url : "/saveCurSession",
  //     type : "post",
  //     contentType : "application/json; charset=utf-8",
  //     dataType : "json",
  //     async: false,
  //     data : JSON.stringify({userID:userID}),
  //     cache : false,
  //     success : function(){
  //         console.log("Success: updateSession!");
  //     }.bind(this),
  //     error : function(){
  //         console.log("Error: Failed to updateSession !");
  //     }
  //   });


  // }

  logout(){
    if(!this.props.datasetName){
      localStorage.setItem("userID",'');
      localStorage.setItem("userName",'');
      window.location.href = '/';
    }
    else{
      localStorage.setItem("userID",'');
      localStorage.setItem("userName",'');
      serverApi.saveCurSession(this.props.sessionUserID,this.props.datasetName);
      window.location.href = '/';
    }
  
  }
  
  loadDataFiles(userID){
    $.ajax({
      url : "/getDataFile",
      type : "get",
      dataType : "json",
      async: "false",
      contentType : "application/json; charset=utf-8",
      data : {UserID : userID},
      cache : false,
      success : function(dataFiles){
          /*notes是从数据库读取到的笔记数组*/
          console.log("loadDataFiles ~~~~");
          // var options = [{value:'',label:'Default Dataset'}];
          var options = [];
  
          for (var i = 0; i < dataFiles.length; i++){
            options.push({value:dataFiles[i]['_id'], label:dataFiles[i]['fileName']});
            // fileNames.push(dataFiles[i]["fileName"]);
            // fileIDs.push(dataFiles[i]["_id"]);
          };
          this.setState({
            dataFileOptions : options
          });
  
      }.bind(this),
      error : function(err){
          console.log("LoadDataFiles failed !");
          console.log(err);
      }
    });
  }



  afterOpenModal() {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  }

  uploadModal() {
    var dataTypes = JSON.stringify(tableDataTypes);
    // var dataTypes = JSON.stringify(this.refs.table.state.data[5]);
    
    var newDataFile={
      fileName : fileName,
      fileObj : rawDataJSON,
      dataType : dataTypes
    };


    // var datafileID = this.props.onAddDataFile(newDataFile,this.props.sessionUserID); 
    var fileData = serverApi.onAddDataFile(newDataFile,this.props.sessionUserID);     
    var newSessObj = defaultCurSessionObj;
    newSessObj['dataFileID'] = fileData['id'];
    this.props.updateCurSession(newSessObj,this.props.sessionUserID);
    this.changeDataset({value:fileData['id'], label:fileData['name']});

    // this.loadDataFiles(this.props.sessionUserID);   
    // this.setState({modalIsOpen: false});
    // this.setState({zipcodeField : ""});
    // this.setState({dateField : ""});

  }

  closeModal() {
    this.setState({zipcodeField : ""});
    this.setState({dateField : ""});
    this.setState({modalIsOpen: false});
  }


  handleFeature(featureName, checked) {
    var sessObj = {featureName:featureName}
    console.log(this.curSessionIndex);
    if(this.curSessionIndex != -1){
      // this.saveCurSession(this.props.sessionUserID);
      // serverApi.saveCurSession(this.props.sessionUserID, this.props.datasetName);
      serverApi.loadPrevSession(this.props.sessionUserID, this.pastSessionObjs[this.curSessionIndex]);
      this.curSessionIndex = -1;
    }
    this.props.updateCurSession(sessObj,this.props.sessionUserID);

    if (checked) {
      this.props.addFeature({ featureName, featureData: 1 });
    }
    else{
      this.props.removeFeature(featureName);
    }

       
    // var sessionObjs = this.sessionObjs;
    // console.log("handleFeature-----------------")
    // console.log(sessionObjs);
    
    // var newSessionObj;

    // // if (curSessionIndex == -1) curSessionIndex = sessionObjs.length - 1;
    // console.log(this.curSessionIndex);
    
    // if(sessionObjs.length != 0){
    //   newSessionObj = sessionObjs[this.curSessionIndex];
    // }
    // else{
    //   newSessionObj = defaultSessionObj;
    // }
    
    // if (checked) {
    //   newSessionObj['Features'].push(featureName);
    //   this.sessionObjs = this.props.updateSession(newSessionObj,this.props.sessionUserID);
    //   this.props.addFeature({ featureName, featureData: 1 });
    //   if(sessionObjs.length < maxSession) {this.curSessionIndex++}
    //   else {this.curSessionIndex = maxSession-1};
    // }
    // else{
    //   for (var i = 0; i < newSessionObj['Features'].length; i++ ){
        
    //     if(newSessionObj['Features'][i] == featureName){
    //       newSessionObj['Features'].splice(i, 1);
    //       this.sessionObjs = this.props.updateSession(newSessionObj,this.props.sessionUserID);
    //       this.curSessionIndex = sessionObjs.length - 1;
    //       break;
    //     }
    //   }
    //   this.props.removeFeature(featureName);
    // }

  }

  /**
   * handleFilter - handles all the filtering of data
   * on Redux state by calling the action creator. Calls Filters'
   * handleUpdateFilter function to handle logic
   *
   * @param feature - the feature to apply filter on, eg. Sex
   * @param type - type of filter, (FILTER_CATEGORICAL, FILTER_CONTINUOUS)
   * @param options - filter-type-specific options
   */
  handleFilter(feature, type, options) {
    const { filters, allData } = this.props;
    console.log('Before -----------------')
    console.log(filters);
    const res = Filters.handleUpdateFilters(filters, feature, type, options);
    console.log('After --------------')
    console.log(res[0])
    console.log(res[1])
    this.props.updateFilters(allData, res);
  }

  /**
   * Function that convert csv to json and store it in localStorage.
   */
  // Feature test
  uploadFile = files => {
      
      var reader = new FileReader();
      reader.onload = function(e) {
      // Use reader.result
      
      fileName = files[0].name;
      rawDataJSON = DataUtils.csvJSON(reader.result); 
      rawData = JSON.parse(rawDataJSON)
      
      tableData = [];
      fieldNames = ['ID'];

      var nullValRow = {};
      var totalNumRow = 5;
      var countFilled = 0;
      var maxFilled;
      // Read all column names of the input csv file. 
      try{
        maxFilled = rawData[0].length;
        for(name in rawData[0] ){
          fieldOptions.push({value:name, label:name});
          var tmpName = name.toLowerCase();
          var zipType = "zip";
          var dateType = "date";
          
          fieldNames.push(name);
          tableDataTypes[name] = 'N/A';
          if(  !this.state.zipcodeField   && tmpName.indexOf(zipType) !== -1 ){
            this.changeZipcodeField({value:name, label:name});
            // this.setState({zipcodeField : {value:name, label:name}});
          }
          if( !this.state.dateField  && tmpName.indexOf(dateType) !== -1  ){
            this.changeDateField({value:name, label:name});
            // this.setState({dateField : {value:name, label:name}});
          }

          
          nullValRow[name] = 0;
        }
      }
      catch(exception){
        console.log(exception);
        alert("Error: Upload file is Null !");
      }

      var i ;
      for ( i = 0; i < rawData.length && i < 100 && countFilled != maxFilled; i++){
        if(i < totalNumRow){
          tableData.push({ID:i+1});
        }
        for( let j = 0; j < fieldNames.length; j++){
          var name = fieldNames[j];
          var curVal = rawData[i][name];
          //Check whether the raw value is empty or contain only empty string
          if (curVal && /\S/.test(curVal)){
            var pos = nullValRow[name];
            if(pos < totalNumRow){
              tableData[pos][name] = curVal;
              nullValRow[name] += 1;
            }
            else if (pos == totalNumRow){
              // tableData[totalNumRow][name] = 'String';
              countFilled += 1;
              pos += 1
            }
          } 
        }
      }

      // Open Modal pop out window
      this.setState({modalIsOpen: true});

    }.bind(this);
    reader.readAsText(files[0]);
  }


  /**
   * Function that filters specific filters. Note the separation between
   * categorical and continuous filters
   */
  handleFilterFilters(e) {
    this.filterFilters(e.target.value);
  }

  handleAllDataToggle() {
    const show = !this.props.showAllData;

    this.props.toggleAllData(show);
  }

  filterFilters(term) {
    let filteredContinuousFeatures = this.continuousFeatures;
    let filteredCategoricalFeatures = this.categoricalFeatures;

    if (term.length) {
      filteredContinuousFeatures = this.continuousFeatures.filter((feature) => {
        return feature.toLowerCase().startsWith(term.toLowerCase());
      });
      filteredCategoricalFeatures = this.categoricalFeatures.filter((feature) => {
        return feature.toLowerCase().startsWith(term.toLowerCase());
      });
    }

    this.setState({
      continuousFeaturesDisplayed: filteredContinuousFeatures,
      categoricalFeaturesDisplayed: filteredCategoricalFeatures,
    });
  }






  /**
   * Function that returns all the filters to be displayed
   *
   * @param    filterType FILTER_CATEGORICAL or FILTER_CONTINUOUS
   * @returns  Empty div or a filter
   */
  renderFilters(filterType) {

    // console.log("!!!!!!!!!!!!!");
    // console.log(this.props);

    if (filterType !== FILTER_CATEGORICAL &&
        filterType !== FILTER_CONTINUOUS) return false;

    const featuresToDisplay = (filterType === FILTER_CATEGORICAL) ?
        [...this.state.categoricalFeaturesDisplayed] :
        [...this.state.continuousFeaturesDisplayed];

    if (!featuresToDisplay) {
      return (
        <div>
          <h5>No filters</h5>
        </div>
      );
    }

    const appliedFilters = [];
    const unAppliedFilters = [];

    // Place displayed filters at the front
    featuresToDisplay.forEach((elem) => {
      if (Filters.isFilterApplied(elem)) appliedFilters.push(elem);
      else unAppliedFilters.push(elem);
    });

    const sortedFeaturesToDisplay = [
      // TODO: figure out how to sort without recreating components
      // ...appliedFilters,
      // ...unAppliedFilters,
      ...featuresToDisplay,
    ];

    // Iterate through features and return filters
    return sortedFeaturesToDisplay.map((feature, i) => {
      const attribute = this.possibleData[feature];
      if (!attribute) return <div />;

      // For barchart icon: shows if feature is activated: possible values: 1 or null
      const featureActive = this.props.features[feature] === 1;

      return (
        <Filter
          data={this.props.data}
          index={i}
          featureActive={featureActive}
          feature={feature}
          handleFeature={this.handleFeature}
          handleFilter={this.handleFilter}
          featureData={[...attribute]}
          key={feature}
          filters={this.props.filters}
          type={filterType}
        />
      );
    });
  }

  getSelectedRowKeys() {
    //Here is your answer
    console.log(this.refs.table.state.data[5]);
  }
  
  render() {
    // Only render if there is data
    
    if (!this.props.data || this.props.data.length <= 0) {
      return (
        <div>
          <h4>No data to show</h4>
        </div>
      );
    }

    // Default sidebar
    return (
      <div className="ag-sidebar clearfix">
        <h2 style={{marginTop:'4px',paddingBottom:'2px',marginBottom:'4px'}}> {'Hello ' + this.props.sessionUserName + ' ~'}</h2>
        <a  href='#' onClick = {this.logout}> logout </a>
        <div className="ag-sidebar--header">
          <br></br>
          <Select
            value={this.props.datasetName}
            options={this.state.dataFileOptions}
            onChange={this.changeDataset}
            clearable={false}
          />   
          {/* <ButtonToolbar> */}
            <ReactFileReader handleFiles={this.uploadFile} fileTypes={'.csv'}>
              <Button bsStyle="danger" bsSize="small">
                Upload CSV File
              </Button>
            </ReactFileReader>   
          <Button bsStyle="primary" bsSize="small" onClick={this.getPrevSession}> Previous Session </Button>
          <Button bsStyle="primary" bsSize="small" onClick={this.getNextSession}> Next Session </Button>
          <div>
            {/* <button onClick={this.openModal}>Open Modal</button> */}
            <Modal
              isOpen={this.state.modalIsOpen}
              onAfterOpen={this.afterOpenModal}
              onRequestClose={this.closeModal}
              style={customStyles}
              contentLabel="Example Modal"
            >
              <h2> Date File Upload Wizard </h2> <br></br>
              {/* <button onClick={this.getSelectedRowKeys.bind(this)}>Get selected row keys</button>    */}
              <BootstrapTable data={tableData} height='230px' scrollTop={ 'Bottom' } scroll cellEdit={ cellEditProp } ref='table'>
                  {fieldNames.map(function(object, i){
                      return <TableHeaderColumn width='150px' dataField = {object} isKey={i==0? true : false} editable={ { type: 'select', options: { values: dataTypes } } }> {object} </TableHeaderColumn>;
                  })}
              </BootstrapTable>
              <h4>Please select a column name for zipcode</h4>
              <div className="ag-sidebar--select">
                <Select
                  value = {this.state.zipcodeField} 
                  options={fieldOptions}
                  onChange={this.changeZipcodeField}
                /> 
              </div><br></br>
              <h4>Please select a column name for date</h4>
              <div className="ag-sidebar--select">
                <Select
                  value = {this.state.dateField} 
                  options={fieldOptions}
                  onChange={this.changeDateField}
                /> 
              </div><br></br>
              <br></br>
              <ButtonToolbar>
                <Button onClick={this.uploadModal}>OK</Button> 
                <Button onClick={this.closeModal}>Cancel</Button>  
              </ButtonToolbar>
    
            </Modal>
          </div>
          <h3 className="ag-sidebar--title">Filters</h3>
          <div className="ag-sidebar--filter-filter form-group">
            <label
              htmlFor="filterFilter"
              className="ag-sidebar--label"
            >
              Search:
              <input
                className="ag-sidebar--input form-control"
                type="text"
                name="filterFilter"
                value={this.state.filterFilters}
                onChange={this.handleFilterFilters}
              />
            </label>
          </div>
        </div>
        <label htmlFor="toggle-all-data">
          <input
            type="checkbox"
            name="toggle-all-data"
            onChange={this.handleAllDataToggle}
            checked={this.props.showAllData}
          />
          Show All Data
        </label>
        <ConfidenceLegend />
        <div className="ag-sidebar--section">
          <h4 className="ag-sidebar--filter-type">Categorical</h4>
          <ul className="ag-input--list ag-sidebar--list">
            {this.renderFilters(FILTER_CATEGORICAL)}
          </ul>
        </div>
        <div className="ag-sidebar--section">
          <h4 className="ag-sidebar--filter-type">Numeric</h4>
          <ul className="ag-input--list ag-sidebar--list">
            {this.renderFilters(FILTER_CONTINUOUS)}
          </ul>
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = propTypes;
Sidebar.defaultProps = defaultProps;

function mapStateToProps(state) {
  return {
    features: state.features,
    data: state.filters.data,
    allData: state.filters.allData,
    filters: state.filters.filters,
    showAllData: state.filters.showAllData,
  };
}

export default connect(mapStateToProps, actions)(Sidebar);
