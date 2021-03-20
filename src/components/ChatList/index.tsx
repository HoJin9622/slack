import React, { useCallback, useRef, VFC } from 'react'
import { IDM } from '../../typings/db'
import Chat from '../Chat'
import { ChatZone, Section } from './styles'
import { Scrollbars } from 'react-custom-scrollbars'

interface Props {
  chatData?: IDM[]
}

const ChatList: VFC<Props> = ({ chatData }) => {
  const scrollbarRef = useRef(null)

  const onScroll = useCallback(() => {}, [])

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        <Section>
          {chatData?.map(chat => (
            <Chat key={chat.id} data={chat} />
          ))}
        </Section>
      </Scrollbars>
    </ChatZone>
  )
}

export default ChatList
