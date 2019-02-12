import {InlineKeyboardMarkup, InlineKeyboardButton} from 'telegram-typings'

import ActionCode from './action-code'

type StringOrStringFunc = string | ((ctx: any) => Promise<string> | string)

export interface ButtonInfo {
  hide?: ((ctx: any) => Promise<boolean> | boolean);
  root?: boolean;
  text: StringOrStringFunc;
  action?: StringOrStringFunc;
  switchToChat?: StringOrStringFunc;
  switchToCurrentChat?: StringOrStringFunc;
  url?: StringOrStringFunc;
}

type ButtonRow = ButtonInfo[]
type KeyboardPartCreator = (ctx: any) => (Promise<ButtonRow[]> | ButtonRow[])

export async function buildKeyboard(content: (ButtonRow | KeyboardPartCreator)[], actionCodePrefix: string, ctx: any): Promise<InlineKeyboardMarkup> {
  const resultButtons: InlineKeyboardButton[][][] = await Promise.all(content.map(async row => {
    if (typeof row === 'function') {
      const innerKeyboard = await row(ctx)
      return Promise.all(innerKeyboard.map(innerRow => buildKeyboardRow(innerRow, actionCodePrefix, ctx)))
    }

    return [await buildKeyboardRow(row, actionCodePrefix, ctx)]
  }))
  const resultButtonsFlatted = resultButtons
    // .flat(1) requires NodeJS 11 / ES2019. This would be nice but is to far away for now.
    .reduce((accumulator, currentValue) => accumulator.concat(currentValue), [])
    .filter(o => o.length > 0)
  return {
    inline_keyboard: resultButtonsFlatted
  }
}

async function buildKeyboardRow(row: ButtonInfo[], actionCodePrefix: string, ctx: any): Promise<InlineKeyboardButton[]> {
  const buttons = await Promise.all(
    row.map(buttonInfo => buildKeyboardButton(buttonInfo, actionCodePrefix, ctx))
  )
  const withoutHidden = buttons
    .filter(o => o !== undefined) as InlineKeyboardButton[]
  return withoutHidden
}

export async function buildKeyboardButton(buttonInfo: ButtonInfo, actionCodePrefix: string, ctx: any): Promise<InlineKeyboardButton | undefined> {
  const {hide, text, action, url, switchToChat, switchToCurrentChat, root} = buttonInfo

  if (hide) {
    const hideIt = await hide(ctx)
    if (hideIt) {
      return undefined
    }
  }

  const button: InlineKeyboardButton = {
    text: typeof text === 'function' ? await text(ctx) : text
  }

  if (action) {
    const thisActionResult = typeof action === 'function' ? await action(ctx) : action
    if (root) {
      button.callback_data = thisActionResult
    } else {
      button.callback_data = new ActionCode(actionCodePrefix).concat(thisActionResult).getString()
    }
  } else if (url) {
    button.url = typeof url === 'function' ? await url(ctx) : url
  } else if (switchToChat) {
    button.switch_inline_query = typeof switchToChat === 'function' ? await switchToChat(ctx) : switchToChat
  } else if (switchToCurrentChat) {
    button.switch_inline_query_current_chat = typeof switchToCurrentChat === 'function' ? await switchToCurrentChat(ctx) : switchToCurrentChat
  } else {
    throw new Error('button was not completly intialized')
  }

  return button
}