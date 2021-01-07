const { assert } = require('chai')

const SocialNetwork = artifacts.require('./SocialNetwork.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('SocialNetwork', ([deployer, author, tipper]) => {
    let socialNetwork

    before(async () => {
        socialNetwork = await SocialNetwork.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await socialNetwork.address
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await socialNetwork.name()
            assert.equal(name, "Ethereum SocialNetwork")
        })
    })

    describe('posts', async () => {
        let result, postCount, content

        before(async () => {
            content = 'First post'
            result = await socialNetwork.createPost(content, { from: author })
            postCount = await socialNetwork.postCount()
        })

        it('creates posts', async () => {
            // FAILURE: post must have content
            await socialNetwork.createPost('', { from: author }).should.be.rejected

            // SUCCESS
            assert.equal(postCount, 1)

            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.content, content, 'content is correct')
            assert.equal(event.tipAmount, '0', 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')
        })

        it('lists posts', async () => {
            const post = await socialNetwork.posts(postCount)
            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(post.content, content, 'content is correct')
            assert.equal(post.tipAmount, '0', 'tip amount is correct')
            assert.equal(post.author, author, 'author is correct')
        })

        it('allows users to tip posts', async () => {
            // Track the author balance before purchase
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            let tipAmount = web3.utils.toWei('1', 'Ether')
            result = await socialNetwork.tipPost(postCount, { from: tipper, value: tipAmount })

            // FAILURE: Tries to tip a post that does not exist
            await socialNetwork.tipPost(99, { from: tipper, value: tipAmount }).should.be.rejected

            // SUCCESS
            assert.equal(postCount, 1)

            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
            assert.equal(event.content, content, 'content is correct')
            assert.equal(event.tipAmount, tipAmount, 'tip amount is correct')
            assert.equal(event.author, author, 'author is correct')

            // Check that author received funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            const expectedBalance = oldAuthorBalance.add(new web3.utils.BN(tipAmount))
            assert.equal(newAuthorBalance.toString(), expectedBalance.toString(), 'author received tip amount')
        })
    })
})