import React, { useCallback } from 'react'
import gravatar from 'gravatar'
import { Container, Header } from './styles'
import useSWR from 'swr'
import fetcher from '../../utils/fetcher'
import { useParams } from 'react-router'
import ChatBox from '../../components/ChatBox'
import ChatList from '../../components/ChatList'
import useInput from '../../hooks/useInput'
import axios from 'axios'
import { IDM } from '../../typings/db'
import makeSection from '../../utils/makeSection'

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>()

  const [chat, onChangeChat, setChat] = useInput('')

  const { data: userData } = useSWR(
    `http://localhost:3095/api/workspaces/${workspace}/users/${id}`,
    fetcher
  )
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher)
  const { data: chatData, mutate: mutateChat, revalidate } = useSWR<IDM[]>(
    `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher
  )

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
          })
          .catch(console.error)
      }
    },
    [chat, id, workspace, setChat, revalidate]
  )

  if (!userData || !myData) {
    return null
  }

  const chatSections = makeSection(chatData ? [...chatData].reverse() : [])

  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(userData.email, { s: '24px', d: 'retro' })}
          alt={userData.nickname}
        />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} />
      <ChatBox
        chat={chat}
        onSubmitForm={onSubmitForm}
        onChangeChat={onChangeChat}
      />
    </Container>
  )
}

export default DirectMessage
