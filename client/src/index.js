import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, } from "react-router-dom";
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import NavBar from './Navbar';
import App from './App';
import Login from './Login';
import Register from './Register';



class Index extends React.Component{

    constructor(props){
       super(props);
       this.state={
         loggedIn: false
       };
    }

    render(){
        return(
            <BrowserRouter>
                <React.Fragment>
                    <NavBar/>
                    <Route exact path="/" component={App} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/register" component={Register} />
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<Index/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

