import {
  createContext,
  FC,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react'
import IdentIcon from 'identicon.js'
import md5 from 'md5'

interface User {
  address: string
  portrait: string
}

interface UserProps {
  currentUser: User
  setAddress: Dispatch<SetStateAction<string>>
}

export const CurrentUserContext = createContext<UserProps>(null)

export const CurrentUserProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string>('')
  const [portrait, setPortrait] = useState<string>('')

  useEffect(() => {
    if (address) {
        const string = md5(address)
        const data = new IdentIcon(string, {
          size: 90,
        }).toString()
        setPortrait('data:image/png;base64,' + data)
    }
  }, [address])

  return (
    <CurrentUserContext.Provider value={{ currentUser: {
      address,
      portrait
    }, setAddress }}>
      {children}
    </CurrentUserContext.Provider>
  )
}
