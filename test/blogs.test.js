const Page = require('./helpers/page')

let page

beforeEach(async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
})


describe('When logged in', () => {
    beforeEach(async () => {
        await page.login()
        await page.click('a.btn-floating')
    })


    test('Can see blog create form', async () => {
        const label = await page.getContentsOf('form label')

        expect(label).toEqual('Blog Title')
    })

    describe('And using valid inputs', () => {

        beforeEach(async () => {
            await page.type('.title input', 'The Watchers Monolith')
            await page.type('.content input', 'Revenants untouched by the scythe' +
                'They are lost in the dark woods of time')
            await page.click('form button')

        })

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5')

            expect(text).toEqual('Please confirm your entries')
        })

        test('Submitting then saving adds blogs to index page', async () => {
            await page.click('button.green')
            await page.waitFor('.card')

            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')

            expect(title).toEqual('The Watchers Monolith')
            expect(content).toEqual('Revenants untouched by the scythe' +
                'They are lost in the dark woods of time')
        })
    })

    describe('And using invalid inputs', () => {
        beforeEach(async () => {
            await page.click('form button')

        })
        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text')
            const contentError = await page.getContentsOf('.content .red-text')

            expect(titleError && contentError).toEqual('You must provide a value')
        })
    })
})

describe('User is not logged in', () => {

    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'The Watchers Monolith',
                content: 'Revenants untouched by the scythe' +
                    'They are lost in the dark woods of time'
            }
        }
    ]
    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions)

        for (let result of results) {
            expect(result).toEqual({ error: 'You must log in!' })
        }

    })
})