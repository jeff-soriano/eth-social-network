import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json'
import Navbar from './Navbar'
import Identicon from 'identicon.js';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })

    // Initiate contract
    const networkId = await web3.eth.net.getId()
    const networkData = SocialNetwork.networks[networkId]
    if (networkData) {
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      const postCount = await socialNetwork.methods.postCount().call()

      this.setState({ socialNetwork: socialNetwork })
      this.setState({ postCount: postCount })

      for (var i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({ posts: [...this.state.posts, post] })
      }

      console.log(this.state.posts)
    } else {
      window.alert('SocialNetwork contract not deployed to detected network')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: []
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Eth Social Network</h1>
              </div>
            </main>
          </div>
          {this.state.posts.map((post, key) => {
            return (
              <div className="row">
                <main role="main" className="col-lg-12 d-flex text-center">
                  <div className="content mr-auto ml-auto">
                    <div className="card mb-4" key={key} >
                      <div className="card-header">
                        <img
                          className='mr-2'
                          width='30'
                          height='30'
                          src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                        />
                        <small className="text-muted">{post.author}</small>
                      </div>
                      <ul id="postList" className="list-group list-group-flush">
                        <li className="list-group-item">
                          <p>{post.content}</p>
                        </li>
                        <li key={key} className="list-group-item py-2">
                          <small className="float-left mt-1 text-muted">
                            TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                        </small>
                          <button
                            className="btn btn-link btn-sm float-right pt-0"
                            name={post.id}
                          >
                            TIP 0.1 ETH
                        </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </main>
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}

export default App;
