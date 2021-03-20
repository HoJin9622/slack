import axios from 'axios'
import React, { FC, useCallback } from 'react'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import useInput from '../../hooks/useInput'
import { Button, Input, Label } from '../../pages/SignUp/styles'
import { IChannel, IUser } from '../../typings/db'
import fetcher from '../../utils/fetcher'
import Modal from '../Modal'

interface Props {
  show: boolean
  onCloseModal: () => void
  setShowInviteWorkspaceModal: (flag: boolean) => void
}

const InviteWorkspaceModal: FC<Props> = ({
  show,
  onCloseModal,
  setShowInviteWorkspaceModal,
}) => {
  const { workspace, channel } = useParams<{
    workspace: string
    channel: string
  }>()

  const [newMember, onChangeNewMember, setNewMember] = useInput('')

  const { data: userData } = useSWR<IUser>(
    'http://localhost:3095/api/users',
    fetcher
  )
  const { revalidate: revalidateMember } = useSWR<IChannel[]>(
    userData && channel
      ? `http://localhost:3095/api/workspaces/${workspace}/members`
      : null,
    fetcher
  )

  const onInviteMember = useCallback(
    e => {
      e.preventDefault()
      if (!newMember || !newMember.trim()) {
        return
      }
      axios
        .post(
          `http://localhost:3095/api/workspaces/${workspace}/members`,
          {
            email: newMember,
          },
          { withCredentials: true }
        )
        .then(response => {
          revalidateMember()
          setShowInviteWorkspaceModal(false)
          setNewMember('')
        })
        .catch(error => {
          console.dir(error)
          toast.error(error.response?.data, { position: 'bottom-center' })
        })
    },
    [
      workspace,
      newMember,
      revalidateMember,
      setNewMember,
      setShowInviteWorkspaceModal,
    ]
  )

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id='member-label'>
          <span>이메일</span>
          <Input
            id='member'
            type='email'
            value={newMember}
            onChange={onChangeNewMember}
          />
        </Label>
        <Button type='submit'>초대하기</Button>
      </form>
    </Modal>
  )
}

export default InviteWorkspaceModal
