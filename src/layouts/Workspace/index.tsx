import axios from 'axios'
import React, { useCallback, useState, VFC } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router'
import useSWR from 'swr'
import fetcher from '../../utils/fetcher'
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceModal,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from './styles'
import gravatar from 'gravatar'
import loadable from '@loadable/component'
import Menu from '../../components/Menu'
import { Link } from 'react-router-dom'
import { IChannel, IUser } from '../../typings/db'
import { Button, Input, Label } from '../../pages/SignUp/styles'
import useInput from '../../hooks/useInput'
import Modal from '../../components/Modal'
import { toast } from 'react-toastify'
import CreateChannelModal from '../../components/CreateChannelModal'
import InviteWorkspaceModal from '../../components/InviteWorkspaceModal'
import InviteChannelModal from '../../components/InviteChannelModal'
import DMList from '../../components/DMList'

const Channel = loadable(() => import('../../pages/Channel'))
const DirectMessage = loadable(() => import('../../pages/DirectMessage'))

const Workspace: VFC = () => {
  const { workspace } = useParams<{ workspace: string }>()

  const [showUserMenu, setShowUserMenu] = useState(false)

  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('')
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('')
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false)
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false)
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(
    false
  )
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(
    false
  )

  const { data: userData, revalidate, mutate } = useSWR<IUser | false>(
    'http://localhost:3095/api/users',
    fetcher,
    {
      dedupingInterval: 2000,
    }
  )
  const { data: channelData } = useSWR<IChannel[]>(
    userData
      ? `http://localhost:3095/api/workspaces/${workspace}/channels`
      : null,
    fetcher
  )
  const { data: memberData } = useSWR<IChannel[]>(
    userData
      ? `http://localhost:3095/api/workspaces/${workspace}/members`
      : null,
    fetcher
  )

  const onLogout = useCallback(() => {
    axios
      .post('http://localhost:3095/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        mutate(false, false)
      })
  }, [mutate])

  const onClickUserProfile = useCallback(e => {
    e.stopPropagation()
    setShowUserMenu(prev => !prev)
  }, [])

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true)
  }, [])

  const onCreateWorkspace = useCallback(
    e => {
      e.preventDefault()
      if (!newWorkspace || !newWorkspace.trim()) return
      if (!newUrl || !newUrl.trim()) return
      axios
        .post(
          'http://localhost:3095/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          revalidate()
          setShowCreateWorkspaceModal(false)
          setNewWorkspace('')
          setNewUrl('')
        })
        .catch(error => {
          console.dir(error)
          toast.error(error.response?.data, { position: 'bottom-center' })
        })
    },
    [newWorkspace, newUrl, revalidate, setNewUrl, setNewWorkspace]
  )

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false)
    setShowCreateChannelModal(false)
    setShowWorkspaceModal(false)
    setShowInviteWorkspaceModal(false)
    setShowInviteChannelModal(false)
  }, [])

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal(prev => !prev)
  }, [])

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(prev => !prev)
  }, [])

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(prev => !prev)
  }, [])

  if (!userData) {
    return <Redirect to='/login' />
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg
              src={gravatar.url(userData.nickname, { s: '28px', d: 'retro' })}
              alt={userData.nickname}
            />
            {showUserMenu && (
              <Menu
                style={{ right: 0, top: 38 }}
                show={showUserMenu}
                onCloseModal={onClickUserProfile}
              >
                <ProfileModal>
                  <img
                    src={gravatar.url(userData.nickname, {
                      s: '36px',
                      d: 'retro',
                    })}
                    alt={userData.nickname}
                  />
                  <div>
                    <span id='profile-name'>{userData.nickname}</span>
                    <span id='profile-active'>Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces.map(ws => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
                <WorkspaceButton>
                  {ws.name.slice(0, 1).toUpperCase()}
                </WorkspaceButton>
              </Link>
            )
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>슬랙</WorkspaceName>
          <MenuScroll>
            <Menu
              show={showWorkspaceModal}
              onCloseModal={onCloseModal}
              style={{ top: 95, left: 80 }}
            >
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>
                  워크스페이스에 사용자 초대
                </button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            {/* <ChannelList userData={userData} /> */}
            <DMList />
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route
              path='/workspace/:workspace/channel/:channel'
              component={Channel}
            />
            <Route
              path='/workspace/:workspace/dm/:id'
              component={DirectMessage}
            />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id='workspace-label'>
            <span>워크스페이스 이름</span>
            <Input
              id='workspace'
              value={newWorkspace}
              onChange={onChangeNewWorkspace}
            />
          </Label>
          <Label id='workspace-url-label'>
            <span>워크스페이스 url</span>
            <Input id='workspace' value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type='submit'>생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </div>
  )
}

export default Workspace
