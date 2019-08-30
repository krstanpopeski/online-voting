import React from 'react';
import { Comment, Avatar, Form, Button, List, Input } from 'antd';

const { TextArea } = Input;


const CommentList = ({ comments }) => (
    <List
        dataSource={comments}
        header={`${comments.length} Comments`}
        itemLayout="horizontal"
        renderItem={props => <Comment {...props} />}
    />
);

const Editor = ({ onChange, onSubmit, submitting, value }) => (
    <div>
        <Form.Item>
            <TextArea rows={4}  onChange={onChange} value={value} />
        </Form.Item>
        <Form.Item>
            <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
                Add Comment
            </Button>
        </Form.Item>
    </div>
);

export default class Comments extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            submitting: false,
            value: "",
            comments: []
        }
    }

    componentWillMount(){
        if(this.props.data.comments.length === 0)
            return;

        const comments = this.props.data.comments.map(comment => {
            return {
                author: comment.authorName,
                avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                content: <p>{comment.content}</p>,
                datetime: comment.createdAt
            }
        });
        this.setState({
            comments: comments,
        });
    }


    handleSubmit = () => {
        if(!this.state.value || !this.props.user){
            return;
        }

        this.setState({
            submitting: true,
        });

        fetch('http://localhost:3001/api/comment', {
            method: 'POST',
            body: JSON.stringify({pollId: this.props.data.id, authorId: this.props.user._id ,authorName: this.props.user.name, value: this.state.value}),
            headers: {
                'Content-Type' : 'application/json'
            }
        })
            .then(res => {
                if(res.status === 200){
                    res.json().then(data => {
                        this.setState({
                            submitting: false,
                            value: '',
                            comments: [{
                                author: data.authorName,
                                avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                                content: <p>{data.content}</p>,
                                datetime: data.createdAt
                            },
                                ... this.state.comments
                            ],
                        });

                    })
                }
            })
    };

    handleChange = (e) => {
        this.setState({
            value: e.target.value,
        });
    };





    render(){
        const { comments, submitting, value } = this.state;
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                {comments.length > 0 && <CommentList comments={comments} />}
                <Comment
                    avatar={
                        <Avatar
                            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                            alt="Han Solo"
                        />
                    }
                    content={
                        <Editor
                            onChange={this.handleChange}
                            onSubmit={this.handleSubmit}
                            submitting={submitting}
                            value={value}
                        />
                    }
                />
                    </div>
                </div>
            </div>
        )
    }
}