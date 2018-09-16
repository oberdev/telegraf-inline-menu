import test from 'ava'
import ActionCode from './action-code'

const {buildKeyboard} = require('./build-keyboard')

test('one row one key', async t => {
  const buttons = [[{
    text: '42',
    action: 'a'
  }]]
  const result = await buildKeyboard(buttons, new ActionCode(''))
  t.deepEqual(result.inline_keyboard, [
    [
      {
        text: '42',
        callback_data: 'a'
      }
    ]
  ])
})

test('four buttons in two rows', async t => {
  const buttons = [
    [{
      text: '42',
      action: 'a'
    }, {
      text: '43',
      action: 'b'
    }], [{
      text: '666',
      action: 'd'
    }, {
      text: '667',
      action: 'e'
    }]
  ]
  const result = await buildKeyboard(buttons, new ActionCode(''))
  t.deepEqual(result.inline_keyboard, [
    [
      {
        text: '42',
        callback_data: 'a'
      }, {
        text: '43',
        callback_data: 'b'
      }
    ], [
      {
        text: '666',
        callback_data: 'd'
      }, {
        text: '667',
        callback_data: 'e'
      }
    ]
  ])
})

test('row is func that creates one row with one button', async t => {
  const buttons = [
    () => ([[{
      text: '42',
      action: 'a'
    }]])
  ]
  const result = await buildKeyboard(buttons, new ActionCode(''))
  t.deepEqual(result.inline_keyboard, [
    [
      {
        text: '42',
        callback_data: 'a'
      }
    ]
  ])
})
