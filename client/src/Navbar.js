import React from 'react';
import { withRouter } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown';
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";


class NavBar extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loggedIn:false,
            user: ""
        };
        this.notificationDOMRef = React.createRef();
    }

    componentWillMount(){
        const token = sessionStorage.getItem('jwtToken');
        if(token) {
            fetch("http://localhost:3001/api/verify", {
                method: 'GET',
                headers: new Headers({
                    'Authorization': token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                })
            }).then(res => {
                if(res.status === 200){
                    res.json().then(data => {
                        this.setState({
                            loggedIn: true,
                            user: data

                        });
                    })
                }
                else{
                    this.setState({
                        loggedIn: false
                    });
                }
            })
        }
    };

    signOut = () => {
        sessionStorage.removeItem('jwtToken');
        this.setState(
            {
                loggedIn:false
            }
        );
        this.notificationDOMRef.current.addNotification({
            title: "Success!",
            message: "Successfully logged out!",
            type: "success",
            insert: "top",
            container: "top-center",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: { duration: 2000 },
            dismissable: { click: true }
        });
        this.props.history.push('/');
    };

    render(){

        let signed;
        if(this.state.loggedIn === false){
            signed = (
                <Nav>
                    <Nav.Link onClick={() => this.props.history.push("/login")}>Sign In</Nav.Link>
                    <Nav.Link onClick={() => this.props.history.push("/register")}> Sign Up</Nav.Link>
                </Nav>);
        }
        else{
            signed = (
                <Nav className="dropdownToggle">
                    <NavDropdown title={this.state.user.name} id="basic-nav-dropdown">
                        <NavDropdown.Item  href="#action/3.1">Action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={this.signOut}>Sign Out</NavDropdown.Item>
                    </NavDropdown>
                </Nav>)
        }

        return(
            <Navbar bg="secondary" expand="lg" variant="dark">
                <ReactNotification ref={this.notificationDOMRef} />
                <Navbar.Brand href="/">E-Vote</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link onClick={() => this.props.history.push("/")}>Home</Nav.Link>
                </Nav>
                {signed}
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default withRouter(NavBar)