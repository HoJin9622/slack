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
import useSocket from '../../hooks/useSocket'

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>()

  const scrollbarRef = useRef<Scrollbars>(null)

  const [chat, onChangeChat, setChat] = useInput('')

  const { data: userData } = useSWR(
    `http://localhost:3095/api/workspaces/${workspace}/users/${id}`,
    fetcher
  )
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher)
  const {
    data: chatData,
    revalidate,
    setSize,
    mutate: mutateChat,
  } = useSWRInfinite<IDM[]>(
    index =>
      `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${
        index + 1
      }`,
    fetcher
  )
  const [socket] = useSocket(workspace)

  const isEmpty = chatData?.[0]?.length === 0
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false

  const onSubmitForm = useCallback(
    e => {
      e.preventDefault()
      if (chat?.trim() && chatData) {
        const savedChat = chat
        mutateChat(prevData => {
          prevData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          })
          return prevData
        }, false).then(() => {
          setChat('')
          scrollbarRef.current?.scrollToBottom()
        })
        axios
          .post(
            `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats`,
            { content: chat },
            { withCredentials: true }
          )
          .then(() => {
            revalidate()
          })
          .catch(console.error)
      }
    },
    [
      chat,
      id,
      workspace,
      setChat,
      revalidate,
      chatData,
      mutateChat,
      myData,
      userData,
    ]
  )

  const onMessage = useCallback(
    (data: IDM) => {
      // id는 상대방 아이디
      if (data.SenderId === Number(id) && myData.id !== Number(id)) {
        mutateChat(chatData => {
          chatData?.[0].unshift(data)
          return chatData
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() +
                scrollbarRef.current.getScrollTop() +
                150
            ) {
              console.log('scrollToBottom!', scrollbarRef.current?.getValues())
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom()
              }, 50)
            }
          }
        })
      }
    },
    [id, mutateChat, myData.id]
  )

  useEffect(() => {
    socket?.on('dm', onMessage)
    return () => {
      socket?.off('dm', onMessage)
    }
  }, [socket, onMessage])

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom()
    }
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
        scrollRef={scrollbarRef}
        setSize={setSize}
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
