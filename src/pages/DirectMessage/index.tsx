import React, { useCallback, useEffect, useRef } from 'react'
import gravatar from 'gravatar'
import { Container, Header } from './styles'
import useSWR, { useSWRInfinite } from 'swr'
import fetcher from '../../utils/fetcher'
import { useParams } from 'react-router'
import ChatBox from '../../components/ChatBox'
import ChatList from '../../components/ChatList'
import useInput from '../../hooks/useInput'
import axios from 'axios'
import { IDM } from '../../typings/db'
import makeSection from '../../utils/makeSection'
import Scrollbars from 'react-custom-scrollbars'

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>()

  const scrollbarRef = useRef<Scrollbars>(null)

  const [chat, onChangeChat, setChat] = useInput('')

  const { data: userData } = useSWR(
    `http://localhost:3095/api/workspaces/${workspace}/users/${id}`,
    fetcher
  )
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher)
  const { data: chatData, revalidate, setSize } = useSWRInfinite<IDM[]>(
    index =>
      `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${
        index + 1
      }`,
    fetcher
  )

  const isEmpty = chatData?.[0]?.length === 0
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false

  const onSubmitForm = useCallback(
    e => {
      e.preventDefault()
      if (chat?.trim()) {
        axios
          .post(
            `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats`,
            { content: chat },
            { withCredentials: true }
          )
          .then(() => {
            revalidate()
            setChat('')
            scrollbarRef.current?.scrollToBottom()
          })
          .catch(console.error)
      }
    },
    [chat, id, workspace, setChat, revalidate]
  )

  useEffect(() => {
    scrollbarRef.current?.scrollToBottom()
  }, [chatData])

  if (!userData || !myData) {
    return null
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : [])

  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(userData.email, { s: '24px', d: 'retro' })}
          alt={userData.nickname}
        />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox
        chat={chat}
        onSubmitForm={onSubmitForm}
        onChangeChat={onChangeChat}
      />
    </Container>
  )
}

export default DirectMessage
