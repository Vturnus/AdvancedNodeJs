const Page = require('./helpers/page')

let page

beforeEach(async () => {
    page = await Page.build() // page is the proxy.
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
})

test('Header has the correct text', async () => {


    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster')

})

test('Clicking login starts oauth flow', async () => {
    await page.click('.right a')
    const url = await page.url()

    // console.log(url)

    expect(url).toMatch(/accounts\.google\.com/)
})

test('When signed in shows logout button', async () => {

    await page.login()
    console.log('Logged In passed ✅')
    const text = await page.getContentsOf('a[href="/auth/logout"]')

    expect(text).toEqual('Logout')
})