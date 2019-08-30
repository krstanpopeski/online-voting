import React from 'react';
import ControlledCarousel from './ControlledCarousel';
import ReactNotification from "react-notifications-component";
import Modal from "react-bootstrap/Modal";
import "react-notifications-component/dist/theme.css";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import FlipMove from "react-flip-move";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';
import { Spin, Divider } from 'antd';
import ListPolls from './ListPolls';



export default class App extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            lgShow: false,
            name: "",
            options: [],
            endDate: new Date(),
            selectedFile: null,
            loading: false,
            user: null,
            loggedIn:false,
            changeOccurred: false
        };
        this.notificationDOMRef = React.createRef();
        this.notificationDOM = React.createRef();
    }

    componentWillMount(){
        const token = sessionStorage.getItem('jwtToken');
        if(token){
            fetch("http://localhost:3001/api/verify", {
                method: 'GET',
                headers: new Headers({
                    'Authorization': token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                })
            })
                .then(res => {
                    if(res.status === 200){
                        res.json().then(data => {
                            this.setState({ name: data.name, user:data, loggedIn:true});
                        });

                    }
                });


        }
        else{
            this.setState({
                loggedIn: false
            });
        }


    };

    showNotification = (ref,message, title, type, duration) => {

        ref.current.addNotification({
            title: title,
            message: message,
            type: type,
            insert: "top",
            container: "top-center",
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: { duration: duration },
            dismissable: { click: true }
        });

    };


    openModal = () => {
        const token = sessionStorage.getItem('jwtToken');
        if(this.state.loggedIn && token){
            this.setState({
                lgShow: true
            });
        }
        else{
            this.showNotification(this.notificationDOMRef,"You have to be logged in to create a poll! Redirecting to Login page shortly! ","Info","warning",2000);
            setTimeout(() => this.props.history.push('/login'),1500);
        }


    };

    addOptions= () => {
        let hasSame = false;
         for(let i=0; i<this.state.options.length;i++){
             if(this.state.options[i].key === this.textInput.value){
                 hasSame = true;
                 break;
             }
         }
        if(this.textInput.value.localeCompare("") !== 0 && !hasSame) {
            let options = this.state.options;
            options.push(
                {
                    name: this.textInput.value,
                    key: this.textInput.value,
                    votes: 0
                }
            );
            this.setState({
                options: options
            }, () => {this.textInput.value="";});
        }
    };

    deleteItem = (key) => {
      let filteredItems =  this.state.options.filter(item => {
          return (item.key !== key);
      });
      this.setState({
          options: filteredItems
      });
    };

    onRegister = () =>{
      if(this.pollDescription.value.length === 0 || this.pollTitle.value.length === 0 || this.state.options.length ===0 || this.state.options.length === 0){

          this.showNotification(this.notificationDOM,"All fields must not be empty!", "Error", "danger", 2000);
      }
      else{
        let data = {
            author: this.state.name,
            authorId: this.state.user._id,
            title: this.pollTitle.value,
            options: this.state.options,
            expireDate: this.state.endDate,
            description: this.pollDescription.value
        };

        let toUpload = new FormData();
        toUpload.append('file', this.state.selectedFile);
        toUpload.append('json', JSON.stringify(data));
        this.setState({
            loading: true
        });
        axios.post("http://localhost:3001/api/upload", toUpload, {

        })
            .then(res=>{
                if(res.status === 200) {
                    this.showNotification(this.notificationDOMRef,"The poll was successfully created!", "Success", "success", 2000);
                    this.setState({
                        lgShow: false,
                        loading: false,
                        changeOccurred: true
                    }, () => {
                        setTimeout(() => {this.setState({changeOccurred: false})}, 2000);
                    })
                }
            })

      }

    };

    handleChange = (date) => {
        this.setState({
            endDate: date
        });

    };

    handleFileChange = (event) => {
        this.setState({
            selectedFile: event.target.files[0]
        })
    };


    render() {
        let lgClose = () => this.setState({ lgShow: false });
        return (
            <div>
                <ReactNotification ref={this.notificationDOMRef} />
                <div className="container-fluid p-0">
                    <div className="row">
                        <div className="col-md-12">
                            <ControlledCarousel/>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row justify-content-md-center">
                        <div className="col-md-6 my-3 d-flex align-items-center flex-column">
                            <h5>To create your own poll, press the following button.</h5>
                            <button type="button" className="btn btn-secondary hvr-bob" onClick={this.openModal}>Create Poll</button>
                        </div>
                    </div>
                </div>
                <div>
                    <Modal
                        size="lg"
                        show={this.state.lgShow}
                        onHide={lgClose}
                        aria-labelledby="example-modal-sizes-title-lg"
                    >
                        <ReactNotification ref={this.notificationDOM} />
                        <Modal.Header closeButton>
                            <Modal.Title id="example-modal-sizes-title-lg">
                                Create A Poll
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Group controlId="exampleForm.ControlInput1">
                                    <Form.Label>Poll Title</Form.Label>
                                    <Form.Control type="email" placeholder="Enter Title For The Poll" ref={input => this.pollTitle = input}/>
                                </Form.Group>
                                <Form.Group controlId="exampleForm.ControlSelect1">
                                    <Form.Label>Add Voting Options</Form.Label>
                                    <InputGroup className="mb-3">
                                        <FormControl
                                            placeholder="Voting Option"
                                            aria-label="Voting Option"
                                            aria-describedby="basic-addon2"
                                            ref={input => this.textInput = input}
                                        />
                                        <InputGroup.Append>
                                            <Button onClick = {this.addOptions} variant="outline-secondary">Add</Button>
                                        </InputGroup.Append>
                                    </InputGroup>

                                    <ul className="listOptions">
                                        <FlipMove duration={250} easing="ease-out">
                                            {
                                                this.state.options.map(t => {return <li className="lis hvr-bounce-out" onClick={() => this.deleteItem(t.key)} key={t.key}>{t.name}</li>})
                                            }
                                        </FlipMove>
                                    </ul>

                                </Form.Group>
                                <Row>
                                    <Col>
                                <Form.Group controlId="datePicker">
                                    <Form.Label>How Long Will This Poll Be Active?</Form.Label>
                                    <InputGroup>
                                    <DatePicker
                                        inline
                                        selected={this.state.endDate}
                                        onChange={this.handleChange}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        timeCaption="Time"
                                    />
                                    </InputGroup>
                                </Form.Group>
                                    </Col>
                                    <Col md="6">
                                    <Form.Group controlId="fileUpload">
                                        <Form.Label >Upload Your Image</Form.Label>
                                            <form method="post" action="#" id="#">
                                                <div className="form-group files">
                                                    <input type="file" className="form-control" multiple="" onChange={this.handleFileChange}/>
                                                </div>

                                            </form>
                                    </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group controlId="exampleForm.ControlTextarea1">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows="3" ref={input => this.pollDescription = input}/>
                                </Form.Group>
                                <Button onClick={this.onRegister} variant="primary" >
                                    Submit
                                </Button>
                            </Form.Group>
                        </Modal.Body>
                    </Modal>
                    <Spin spinning={this.state.loading}/>
                </div>
                <Divider>All Polls</Divider>
                <ListPolls isLoggedIn={this.state.loggedIn} user={this.state.user} hasChanged={this.state.changeOccurred}/>
            </div>

                )
        }
}

