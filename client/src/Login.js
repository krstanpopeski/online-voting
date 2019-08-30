import React from "react";
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";



export default class Login extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            email : "",
            password : "",
        };
        this.notificationDOMRef = React.createRef();

    }


    onSubmit = (event) => {
        event.preventDefault();
        let loginData = {
            email: this.state.email,
            password: this.state.password
        };

        if(!this.checkValidEmail()){
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

        if(this.checkEmpty()){
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

        if(this.checkValidEmail() && !this.checkEmpty()) {
            fetch("http://localhost:3001/api/authenticate", {
                method: 'POST',
                body: JSON.stringify(loginData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    if (res.status === 200) {
                        res.json().then(data => {
                            sessionStorage.setItem('jwtToken', data.token);
                            this.notificationDOMRef.current.addNotification({
                                title: "Success",
                                message: "Successfully logged in!",
                                type: "success",
                                insert: "top",
                                container: "top-center",
                                animationIn: ["animated", "fadeIn"],
                                animationOut: ["animated", "fadeOut"],
                                dismiss: {duration: 2000},
                                dismissable: {click: true}
                            });
                            setTimeout(()=>{document.location.href="/";},1000);
                        });

                    }
                    else if (res.status === 401) {
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

    handleEmailChange = (event) =>{
        let email = event.target.value;
        this.setState({
            email: email
        });


    };

    handlePasswordChange = (event) => {
        let password = event.target.value;
        this.setState({
            password: password
        });
    };

    checkValidEmail = () => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(this.state.email).toLowerCase());
    };

    checkEmpty = () => {
      return this.state.email.length === 0 || this.state.password.length === 0;

    };

    render(){

        return(

            <div className="container login-container">
                <ReactNotification ref={this.notificationDOMRef} />
                <div className="row">
                    <div className="col-md-12 col-sm-6 login-form-1">
                        <h3>Login to E-Vote</h3>
                        <form onSubmit={this.onSubmit}>
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder="Your Email" onChange={this.handleEmailChange}/>
                            </div>
                            <div className="form-group">
                                <input type="password" className="form-control" placeholder="Your Password" onChange={this.handlePasswordChange}/>
                            </div>
                            <div className="form-group">
                                <input type="submit" className="btnSubmit" value="Login"/>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
            );
    }
}
