import useSelfHomeQuery, {
  SelfHomeQueryResponse,
} from '@hooks/api/queries/useSelfHome/useSelfHome.query'
import useQuery from '@hooks/api/useQuery'

const useSelfHome = () =>
  useQuery<SelfHomeQueryResponse>(useSelfHomeQuery, {
    namespace: 'self',
  })

export { useSelfHome }
