import React from 'react';
import Chart from 'react-apexcharts';



export default class ChartBar extends React.Component{

    constructor(props){
        super(props);
        this.state={
            data: null,
            options: {
                chart: {
                    id: 'votesChart'
                },
                xaxis: {
                    categories: []
                }
            },
            series: [{
                name: 'Voting Results',
                data: []
            }]
        }

    }

    componentWillReceiveProps(nextProps){
        if(this.props.change === true){
            let votingOptions = nextProps.data.options.map(option => {return option.name});
            let votingValues = nextProps.data.options.map(option => {return option.votes});
            debugger;
        this.setState({
            data: nextProps.data,
            options: {
                xaxis:{
                    categories: votingOptions
                }
            },
            series: [{
                data: votingValues
            }
            ]
        });
        }
    }


    componentDidMount(){
        let votingOptions = this.props.data.options.map(option => {return option.name});
        let votingValues = this.props.data.options.map(option => {return option.votes});
        this.setState({
            data: this.props.data,
            options: {
                xaxis:{
                    categories: votingOptions
                }
            },
            series: [{
                data: votingValues
            }
            ]
        });
    }

    render(){
        return(<div>
            <Chart options={this.state.options} series={this.state.series} type="bar" width={500} height={330} />
        </div>);
    }
}