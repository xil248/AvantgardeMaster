/* eslint-disable */

import React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../styles/landing.scss';

export default class Landing extends React.Component {

  constructor(props) {
    super(props);
    this.onAddNewUser = this.onAddNewUser.bind(this);
    this.onCheckUser = this.onCheckUser.bind(this);
    this.state={
      showCreateAcc : false,
      showSignIn : true
    };
    // this.showCreate = this.showCreate.bind(this);

  }

  onAddNewUser(newUser){
    $.ajax({
      url : "/addUser",
      type : "post",
      contentType : "application/json; charset=utf-8",
      dataType : "json",
      data : JSON.stringify(newUser),
      cache : false,
      success : function(userObj){
          console.log("Success: user added");
          if(userObj.length == 0){
            alert("Error: The User Name Has Existed !");
          }
          else{
            localStorage.setItem("userID",userObj['_id']);
            localStorage.setItem("userName",userObj['userName']);
            window.location.href = '/viz/';
          }

      }.bind(this),
      error : function(){
          console.log("Error: user added failure!");
      }
    });
  }

  onCheckUser(existUser){

    var curUserID;
    $.ajax({
      url : "/checkUser",
      type : "get",
      contentType : "application/json; charset=utf-8",
      dataType : "json",
      // data : JSON.stringify(existUser),
      data: {user:existUser},
      cache : false,
      success : function(userObj){



          if(userObj){
            localStorage.setItem("userID",userObj['id']);
            localStorage.setItem("userName",userObj['userName']);
            window.location.href = '/viz/';
          }
          else{
            alert("Error: User Name or Password Incorrect!");
          }


      }.bind(this),
      error : function(){
          console.log("Error: user check failed!");
      }
    });

  }


  handleCreateAcc(event){
		event.preventDefault();
		if(this.refs.name.value == "" ||this.refs.password.value == "" ) {
      alert("Error: Account and Password can't be empty!")
      return;
    }
		var newUser={
      userName : this.refs.name.value,
      password : this.refs.password.value,
      dataFiles: [],
      sessionObjs: [],
      curSessionObj: {
        dataFileID:'',
        features:[],
        filters:[],
        cluster:''
      }
    };
		this.onAddNewUser(newUser);
  }

  handleSignIn(event){
    event.preventDefault();
    var existUser={
      userName : this.refs.name.value,
      password : this.refs.password.value
    };
		this.onCheckUser(existUser);
  }

  showCreate(){
    this.setState({showCreateAcc:true,showSignIn:false});
  }

  showSignIn(){
    this.setState({showCreateAcc:false,showSignIn:true});
  }



  render(){
    let showCreateAcc = this.state.showCreateAcc;
    let showSignIn = this.state.showSignIn;
    return (
    <div className="wrapper">
      <div style={{marginBottom:'0px',paddingBottom:'5px'}} className="jumbotron container ag-landing--hero">
        <h2 className="hero-text">Welcome to Avant-Garde!!</h2>
        <br></br>
            {showCreateAcc ?
            <form onSubmit={ this.handleCreateAcc.bind(this) }>
              <h3>Create account</h3>
              <input ref="name" type="text"  placeholder="name"/> <br></br>
              <input ref="password" type="text"  placeholder="password"/> <br></br> <br></br>
              <input type="button" value="Back" style={{marginRight:'25px'}} onClick={this.showSignIn.bind(this)} />
              <input type="submit" value="Create" />
            </form> : null
            }
            {showSignIn ?
            <form onSubmit={ this.handleSignIn.bind(this) }>
              <h3>Sign in</h3>
              <input ref="name" type="text"  placeholder="name"/> <br></br>
              <input ref="password" type="text"  placeholder="password"/> <br></br> <br></br>
              {/* <input type="button" value="Create Account" style={{marginRight:'15px'}} onClick={this.showCreate.bind(this)} />  */}
              <input type="submit" value="Sign in" /> <br/>
              <a href="#" onClick={this.showCreate.bind(this)}>Create Account </a>
				    </form> : null
            }
      </div>
      <div style={{marginTop:'0px'}} className="container">
        <h3 className="">Avant-Garde Project</h3>
        <div>
          <p className="ag-landing--description">Avant-Garde is a multidisciplinary research project by Schools of Medicine and Computer Science and Engineering  at the UC San Diego. Led by Dr. Davey Smith, associate professor of medicine in the Division of Infectious Diseases, Avant-garde project aims to stimulate high-impact research that may lead to groundbreaking opportunities for the prevention and treatment of HIV/AIDS in drug abusers. </p>
        </div>
      </div>
      <div className="container">
        <h3 className="">Exploratory Visual Analytics Dashboard</h3>
        <p className="ag-landing--description">As part of this endeavor, a heterogeneous dataset containing socio-demographic, clinical and viro-genetic information about patients in San Diego area has been collected.  This data can be used for more effective prevention and targeted intervention by enabling providers to better understand relationships between factors such social, demographic, genetic and genetic  of high risk groups and individuals. To achieve this goal, Dr. Weibel and his team at ubicomp lab has designed and implemented a data exploration platform tailor-made to specific needs of HIV researchers. This tool support data analysis through multiple coordinated views that represent data from various angles. Advanced interaction techniques such as dynamic filtering and brushing-and-linking enables searchers to easily investigate trends, distributions, and relationships.</p>
      </div>
      <div className="container">
        <h3 className="">Team</h3>
        <ul className="ag-landing--team">
          <li>Dr. Nadir Weibel (Supervision)</li>
          <li>Dr. Ali Sarvghad (Design, evaluation, supervision)</li>
          <li>Zifeng Chris Xie (Front-End Implementation)</li>
          <li>Vincent Liaw (Front-End Implementation)</li>
          <li>Joel Sequiera (Front-End Implementation)</li>
          <li>Xinghang Li (Back-End Implementation)</li>
          <li>Dr. Davey Smith</li>
          <li>Dr. Sanjay Mehta</li>
        </ul>
      </div>
    </div>
    );
  }



}




