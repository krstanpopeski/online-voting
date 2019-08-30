import React from 'react';
import "antd/dist/antd.css";
import "./index.css";
import { List, Avatar, Icon, Skeleton, Divider, Radio, Statistic, Collapse, message } from "antd";
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import ChartBar from './Chart';
import Comments from './Comments';





const { Countdown } = Statistic;
const { Panel } = Collapse;

const IconText = ({ type, text, onClick, display }) => (
    <span>
    <Icon type={type} style={{ marginRight: 8, display: display}} onClick={onClick}  />
        {text}
  </span>
);


const poll =
    {
        "_id": "",
        "author": "",
        "authorId": "",
        "title": "",
        "options": [
            {
                "_id": "",
                "name": "",
                "key": "",
                "votes": 0
            },
            {
                "_id": "",
                "name": "",
                "key": "",
                "votes": 0
            }
        ],
        "expireDate": "",
        "image": {
            "_id": "",
            "url": "",
            "type": ""
        },
        "description": "",
        "likes": 0,
        "comments": [],
        "createdAt": "",
        "updatedAt": "",
        "__v": 0
    };

export default class ListPolls extends React.Component{

    constructor(props){
        super(props);

        this.state={
            loading: false,
            polls: [],
            listData: [],
            visible: false,
            selectedPoll: poll,
            radioValue: null,
            show: false,
            user: null,
            change: false
        };

        this.notificationDOMREF = React.createRef();
    }


    componentDidMount(){
        this.getPolls();
    }

   componentWillReceiveProps(nextProps){
        let someProps = nextProps!== null ? nextProps : this.props;
       this.setState({
           user: someProps.user
       }, () => {
                  if(nextProps.hasChanged === true)
                   this.getPolls();
       });


    }

    getPolls = () => {
        this.setState({
            loading: true
        }, () => {
            fetch('http://localhost:3001/api/polls')
                .then(res => {
                    if (res.status === 200) {
                        res.json().then(data => {
                            this.setState({
                                loading: false,
                                polls: data,
                                selectedPoll: data[0]
                            }, () => {this.populateData()});
                        })
                    }
                })
        });
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


    populateData = () => {
          let listData = [];
          this.state.polls.forEach(item => {
              listData.push({
                  title: item.title,
                  avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
                  content: item.description,
                  imageUrl: item.image.url,
                  createdAt: item.createdAt,
                  likes: item.likes,
                  comments: item.comments,
                  id: item._id,
                  authorId: item.authorId,
              });
          });
          this.setState({
              listData: listData,
              user: this.props.user
          });

    };

    handlePollClick = (id) => {
        let poll = this.getPollById(id);
        const expDate = new Date(poll.expireDate).valueOf();
        const dateNow = Date.now();

        if(dateNow>=expDate){
            this.showNotification(this.notificationDOMREF,"This poll has expired so you won't be able to vote!","Info","warning",2000);
        }

      this.setState({
          visible: true,
          selectedPoll: poll
      });
    };

    handleOk = () => {
      this.setState({
          visible: false
      })
    };


    handleCancel = () => {
      this.setState({
          visible: false
      })
    };

    getPollById = (id) =>{
      let poll = this.state.polls.filter(poll => {
          return poll._id === id;
      });
      return poll[0];
    };

    onChange = (e) => {
        this.setState({
            radioValue: e.target.value
        });
    };

    handleClose = () =>{
      this.setState({
          show: false
      });
    };

    openSecondModal = () => {
      this.setState({
          show: true
      });
    };

    handleOkVote = () => {
        let currentPollId = this.state.selectedPoll._id;
        const vote = {
          pollId: currentPollId,
          voteId: this.state.radioValue,
          userId: this.state.user._id
        };

        fetch("http://localhost:3001/api/vote",{
            method: 'POST',
            body: JSON.stringify(vote),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if(res.status === 200) {
                    let alteredSelectedPoll = this.state.selectedPoll;
                    alteredSelectedPoll.options = this.state.selectedPoll.options.map(option => {
                        if(option._id.localeCompare(vote.voteId) === 0){
                            option.votes++;
                        }
                        return option;
                    });

                    let voteToAdd = {
                        pollId: vote.pollId,
                        voteId: vote.voteId
                    };
                    let alteredUser = this.state.user;
                    alteredUser.votes.push(voteToAdd);
                    this.setState({
                        selectedPoll: alteredSelectedPoll,
                        user: alteredUser,
                        show: false,
                        change: true
                    }, () => { setTimeout(()=> {this.setState({change: false})},2000)});
                }
                else{
                    res.json().then(data => {console.log(data)});
                }
            })
    };

    checkForRadioAvailability = (pollId, expireDate) => {
        const numExpDate = new Date(expireDate).valueOf();
        const numDateNow = Date.now();

        if(numDateNow >= numExpDate){
            return true;
        }

        if(this.props.isLoggedIn) {
            let votes = this.state.user.votes;
            if(votes.length === 0){
                return false;
            }
            let voted = votes.filter(vote => {
                return vote.pollId.localeCompare(pollId) === 0
            });
            return voted.length !== 0
        }
        else{
            return true;
        }

    };

    checkIfChecked = (pollId, optionId) => {
      if(this.props.isLoggedIn) {

          let votes = this.state.user.votes;
          if(votes.length === 0){
              return false;
          }
          let voted = votes.filter(vote => {
              return vote.voteId.localeCompare(optionId) === 0;
          });
          return voted.length!==0;
      }
      else{
          return false;
      }

    };


    addLike = (pollId) => {
        if(this.props.isLoggedIn) {

            fetch('http://localhost:3001/api/like', {
                method: 'POST',
                body: JSON.stringify({pollId: pollId}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    if (res.status === 200) {
                        let listData = this.state.listData.map(item => {
                            if (item.id.localeCompare(pollId) === 0) {
                                item.likes++;
                            }
                            return item;
                        });

                        this.setState({
                            listData: listData
                        });

                    }
                })
        }
    };

    deletePoll = (pollId) => {
        fetch('http://localhost:3001/api/delete', {
            method: 'POST',
            body: JSON.stringify({pollId: pollId}),
            headers: {
                'Content-Type' : 'application/json'
            }
        })
            .then(res => {
                if(res.status === 200){
                    message.success("The pole was successfully removed!");
                    this.getPolls();
                }
                else if(res.status === 500){
                    message.error("There was an error while removing the poll! Try again!");
                }
            })
    };

    checkIfSameAuthor = (authorId, user) => {
        if(this.props.isLoggedIn){
            return authorId.localeCompare(user._id) === 0 ? 'inline':'none'
        }
        else{
            return 'none';
        }

    };

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col md-12">
                        <Skeleton loading={this.state.loading} active>
                        <List
                            itemLayout="vertical"
                            size="large"
                            pagination={{
                                onChange: page => {
                                    console.log(page);
                                },
                                pageSize: 3
                            }}
                            dataSource={this.state.listData}
                            footer={
                                <div>
                                    <b>ant design</b> footer part
                                </div>
                            }
                            renderItem={item => (
                                <List.Item
                                    key={item.title}
                                    actions={[
                                        <IconText type="like-o" text={item.likes} onClick={() => {this.addLike(item.id)}} display='inline' />,
                                        <Collapse accordion bordered={false} expandIcon={() => <IconText type="message" text={item.comments.length} display='inline'/>}>
                                            <Panel key="1" header="">
                                                <Comments data={item} user={this.state.user}/>
                                            </Panel>
                                        </Collapse>,
                                        <IconText type="delete" onClick={() => {this.deletePoll(item.id)}} display={this.checkIfSameAuthor(item.authorId, this.props.user)}/>
                                    ]}
                                    extra={
                                        <button className="invisible-button" onClick={() => this.handlePollClick(item.id)}>
                                        <img
                                            width={272}
                                            alt="logo"
                                            src={'http://localhost:3001/api/image/' + item.imageUrl}
                                        />
                                        </button>
                                    }
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.avatar} />}
                                        title={<button className="invisible-button" onClick={() => this.handlePollClick(item.id)}>{item.title}</button>}
                                        description={`Created at: ${new Date(this.state.selectedPoll.createdAt).toLocaleString('mk-MK', {timeZone: 'UTC'})}`}
                                    />
                                    {item.content}
                                </List.Item>
                            )}
                        />
                        </Skeleton>
                    </div>
                </div>
                <div className="row">
                    <Modal show={this.state.show} onHide={this.handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Are You Sure?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>By clicking OK you accept to vote for the selected option!</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={this.handleOkVote}>
                                OK
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <div className="row">
                    <ReactNotification ref={this.notificationDOMREF}/>
                    <Modal
                    size="lg"
                    show={this.state.visible}
                    onHide={this.handleCancel}
                    aria-labelledby="example-modal-sizes-title-lg"

                    >

                        <Modal.Header closeButton>
                         <Modal.Title id="example-modal-sizes-title-lg">
                             {this.state.selectedPoll.title}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-4">
                                        <p><small>Author: {this.state.selectedPoll.author}</small></p>
                                    </div>
                                    <div className="col-md-4">
                                        <p><small>Created at: {new Date(this.state.selectedPoll.createdAt).toLocaleString('mk-MK', {timeZone: 'UTC'})}</small></p>
                                    </div>
                                    <div className="col-md-4">
                                        <Countdown title="Time Remaining" value={this.state.selectedPoll.expireDate} format="D - H : m : s " />
                                    </div>
                                    <div className="col-md-12">
                                        <Image src={'http://localhost:3001/api/image/' + this.state.selectedPoll.image.url}
                                             alt={this.state.selectedPoll._id}
                                             height={300}
                                             fluid
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <h6>Description:</h6>
                                        <h6>{this.state.selectedPoll.description }</h6>
                                    </div>
                                    <Divider orientation="left">Voting Options</Divider>
                                    <div className="col-md-3 mx-auto">
                                        <Radio.Group onChange={this.onChange} value={this.state.radioValue}>
                                            {
                                                this.state.selectedPoll.options.map(option => {
                                                    return <Radio key={option._id} onClick={this.openSecondModal}  value={option._id} disabled={this.checkForRadioAvailability(this.state.selectedPoll._id, this.state.selectedPoll.expireDate)}
                                                                 checked={this.checkIfChecked(this.state.selectedPoll._id, option._id)} defaultChecked={this.checkIfChecked(this.state.selectedPoll._id, option._id)}>{option.name}</Radio>
                                                })
                                            }
                                        </Radio.Group>
                                    </div>
                                    <Divider orientation="left">Votes Result</Divider>
                                    <div className="col-auto mx-auto">
                                        <ChartBar data={this.state.selectedPoll} change={this.state.change}/>
                                    </div>
                                    <Divider/>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        );
    }
}