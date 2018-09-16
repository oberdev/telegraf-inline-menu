import test from 'ava'
import ActionCode from './action-code'

const {buildKeyboardButton} = require('./build-keyboard')

test('hide is questioned first and does not trigger other func', async t => {
  const result = await buildKeyboardButton({
    text: () => t.fail(),
    action: 'a',
    hide: () => true
  }, new ActionCode(''), 42)
  t.true(result.hide)
})

test('async func possible', async t => {
  const result = await buildKeyboardButton({
    text: () => Promise.resolve('42'),
    action: 'a',
    hide: () => Promise.resolve(false)
  }, new ActionCode(''))
  t.deepEqual(result, {
    text: '42',
    callback_data: 'a'
  })
})

test('urlButton', async t => {
  const result = await buildKeyboardButton({
    text: '42',
    url: () => 'https://edjopato.de'
  })
  t.deepEqual(result, {
    text: '42',
    url: 'https://edjopato.de'
  })
})

test('unfinished button', async t => {
  await t.throwsAsync(() => buildKeyboardButton({
    text: '42'
  }))
})
