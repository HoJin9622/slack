import axios from 'axios'
import React, { useCallback, VFC } from 'react'
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
  setShowCreateChannelModal: (flag: boolean) => void
}

const CreateChannelModal: VFC<Props> = ({
  show,
  onCloseModal,
  setShowCreateChannelModal,
}) => {
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('')
  const { workspace } = useParams<{
    workspace: string
    channel: string
  }>()

  const { data: userData } = useSWR<IUser | false>(
    'http://localhost:3095/api/users',
    fetcher,
    {
      dedupingInterval: 2000,
    }
  )
  const { revalidate: revalidateChannel } = useSWR<IChannel[]>(
    userData
      ? `http://localhost:3095/api/workspaces/${workspace}/channels`
      : null,
    fetcher
  )

  const onCreateChannel = useCallback(
    e => {
      e.preventDefault()
      axios
        .post(
          `/api/workspaces/${workspace}/channels`,
          { name: newChannel },
          { withCredentials: true }
        )
        .then(() => {
          setShowCreateChannelModal(false)
          revalidateChannel()
          setNewChannel('')
        })
        .catch(error => {
          console.dir(error)
          if (error.response.statusCode === 500) {
            toast.error('서버 에러 다시 시도해주세요.', {
              position: 'bottom-center',
            })
          } else {
            toast.error(error.response?.data, { position: 'bottom-center' })
          }
        })
    },
    [
      newChannel,
      workspace,
      setNewChannel,
      setShowCreateChannelModal,
      revalidateChannel,
    ]
  )

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id='channel-label'>
          <span>채널</span>
          <Input
            id='workspace'
            value={newChannel}
            onChange={onChangeNewChannel}
          />
        </Label>
        <Button type='submit'>생성하기</Button>
      </form>
    </Modal>
  )
}

export default CreateChannelModal
