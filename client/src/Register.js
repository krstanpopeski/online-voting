import React from "react";
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";


export default class Register extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            email: "",
            password: "",
            repeatPassword: "",
            name: ""
        };
        this.notificationDOMRef = React.createRef();
    }

    componentDidMount = () => {
        this.checkEmpty();
    };

    onSumbit = (event) => {
        event.preventDefault();
      let registerData = {
          name: this.state.name,
          password: this.state.password,
          email: this.state.email
      };

      let validEmail = this.checkEmail();
      let emptyFields = this.checkEmpty();


      if(!validEmail){
          this.notificationDOMRef.current.addNotification({
              title: "Error",
              message: "Invalid E-mail format!",
              type: "danger",
              insert: "top",
              container: "top-center",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: { duration: 3000 },
              dismissable: { click: true }
          });
      }
      if(emptyFields){
          this.notificationDOMRef.current.addNotification({
              title: "Error",
              message: "All fields are required. Please fill them all.",
              type: "danger",
              insert: "top",
              container: "top-center",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: { duration: 3000 },
              dismissable: { click: true }
          });
      }
      if(this.state.password.localeCompare(this.state.repeatPassword) !== 0){
          this.notificationDOMRef.current.addNotification({
              title: "Error",
              message: "Password and repeated password must match!",
              type: "danger",
              insert: "top",
              container: "top-center",
              animationIn: ["animated", "fadeIn"],
              animationOut: ["animated", "fadeOut"],
              dismiss: { duration: 3000 },
              dismissable: { click: true }
          });
      }
      if(validEmail && !emptyFields && this.state.password.localeCompare(this.state.repeatPassword) === 0) {


          fetch("http://localhost:3001/api/register", {
              method: 'POST',
              body: JSON.stringify(registerData),
              headers: {
                  'Content-Type': 'application/json'
              }
          })
              .then(res => {
                  if (res.status === 200) {
                      console.log(res.status);
                      this.notificationDOMRef.current.addNotification({
                          title: "Success",
                          message: "Successfully registered!",
                          type: "success",
                          insert: "top",
                          container: "top-center",
                          animationIn: ["animated", "fadeIn"],
                          animationOut: ["animated", "fadeOut"],
                          dismiss: {duration: 2000},
                          dismissable: {click: true}
                      });
                      setTimeout(()=>{document.location.href="/login";},1000);
                  }
                  else if (res.status === 500) {
                      res.json().then(data => {
                          this.notificationDOMRef.current.addNotification({
                              title: "Error",
                              message: data.error,
                              type: "danger",
                              insert: "top",
                              container: "top-center",
                              animationIn: ["animated", "fadeIn"],
                              animationOut: ["animated", "fadeOut"],
                              dismiss: {duration: 2000},
                              dismissable: {click: true}
                          });
                      })
                  }
              })
      }

    };

    handleEmailChange = (event) => {
        let email = event.target.value;
        this.setState({
            email: email
        });

    };

    handleNameChange = (event) => {
        let name = event.target.value;
        this.setState({
            name: name
        });
    };

    handlePasswordChange = (event) => {
        let password = event.target.value;
        this.setState({
            password: password
        });
    };

    handleRepeatPasswordChange = (event) => {
        let repeatPass = event.target.value;
        this.setState({
            repeatPassword: repeatPass
        });



    };

    checkEmpty = () => {

        if(this.state.email.length === 0 || this.state.name.length === 0 || this.state.password.length === 0 || this.state.repeatPassword.length === 0){
            return true;
        }
        else{
            return false;
        }

    };

    checkEmail = () => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(String(this.state.email).length !== 0){
            return re.test(String(this.state.email).toLowerCase());
        }
    };

    render(){
        return(
            <div className="container login-container">
                <ReactNotification ref={this.notificationDOMRef}/>
            <div className="row">
                <div className="col-md-12 col-sm-6 login-form-1">
                    <h3>Register to E-Vote</h3>
                    <form onSubmit={this.onSumbit} >
                        <div className="form-group">
                            <input type="text" name="name" className="form-control" placeholder="Your Name" onChange={this.handleNameChange} />
                        </div>
                        <div className="form-group">
                            <input type="text" name="email" className="form-control" placeholder="Your Email" onChange={this.handleEmailChange}/>
                        </div>
                        <div className="form-group">
                            <input type="password" name="password" className="form-control" placeholder="Your Password" onChange={this.handlePasswordChange}/>
                        </div>
                        <div className="form-group">
                            <input type="password" name="reppassword" className="form-control" placeholder="Repeat Your Password" onChange={this.handleRepeatPasswordChange}/>
                        </div>
                        <div className="form-group">
                            <input id="registerButton" type="submit" className="btnSubmit" value="Register" />
                        </div>
                    </form>
                </div>

            </div>
        </div>);
    }
}