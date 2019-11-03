const sinon = require('sinon');
const { sendError } = require('../src/util');
const expect = require('expect');

describe('Util.js module', () => {
    describe('sendError function', () => {
        const sendFake = sinon.fake()
        const resFake = {
            status: sinon.fake.returns({
                send: sendFake
            }),
            
        }
        afterEach(() => {
            sinon.restore();
        })

        it('should send body', () => {
            sendError(resFake, 400, 'I am dummy', {
                message: 'I am Error',
                type: 'dummy'
            })
            expect(resFake.status.lastArg).toEqual(400)
            expect(sendFake.lastArg).toMatchObject({
                ok: false,
                message: 'I am dummy',
                error:{
                    message: 'I am Error',
                    type: 'dummy'
                }
            })
        }),
        it('should send body without message', () => {
            sendError(resFake, 400)
            expect(resFake.status.lastArg).toEqual(400)
            expect(sendFake.lastArg).toMatchObject({
                ok: false
            })
        }),
        it('should send body without error', () => {
            sendError(resFake, 400,'I am dummy')
            expect(resFake.status.lastArg).toEqual(400)
            expect(sendFake.lastArg).toMatchObject({
                ok: false,
                message: 'I am dummy',
            })
        })
    })
})