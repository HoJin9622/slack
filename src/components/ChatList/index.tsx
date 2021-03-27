import React, { forwardRef, RefObject, useCallback } from 'react'
import { IDM } from '../../typings/db'
import Chat from '../Chat'
import { ChatZone, Section, StickyHeader } from './styles'
import { Scrollbars, positionValues } from 'react-custom-scrollbars'

interface Props {
  chatSections: { [key: string]: IDM[] }
  setSize: (
    size: number | ((size: number) => number)
  ) => Promise<IDM[][] | undefined>
  isReachingEnd: boolean
  scrollRef: RefObject<Scrollbars>
}

const ChatList = forwardRef<Scrollbars, Props>(
  ({ chatSections, setSize, isReachingEnd, scrollRef }) => {
    const onScroll = useCallback(
      (values: positionValues) => {
        if (values.scrollTop === 0 && !isReachingEnd) {
          console.log('가장위')
          setSize(prevSize => prevSize + 1).then(() => {
            // 스크롤 위치 유지
            if (scrollRef?.current) {
              scrollRef.current?.scrollTop(
                scrollRef.current?.getScrollHeight() - values.scrollHeight
              )
            }
          })
        }
      },
      [isReachingEnd, setSize, scrollRef]
    )

    return (
      <ChatZone>
        <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
          {Object.entries(chatSections).map(([date, chats]) => {
            return (
              <Section className={`section-${date}`} key={date}>
                <StickyHeader>
                  <button>{date}</button>
                </StickyHeader>
                {chats.map(chat => (
                  <Chat key={chat.id} data={chat} />
                ))}
              </Section>
            )
          })}
        </Scrollbars>
      </ChatZone>
    )
  }
)

export default ChatList
