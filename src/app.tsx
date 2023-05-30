import * as ReactDOMClient from 'react-dom/client'
import {
  createMemoryRouter,
  RouteObject,
  RouterProvider,
} from 'react-router-dom'
import Chatroom from './pages/Chatroom'
import PrimaryLayout from './components/Layout/PrimaryLayout'
import Boots from './pages/Boots'
import Signup from './pages/Account/Signup'
import Signin from './pages/Account/Signin'
import { CurrentUserProvider } from './context/currentUser'

const routesList: RouteObject[] = [
  {
    path: '/',
    element: <PrimaryLayout />,
    children: [
      {
        path: '/signup',
        element: <Signup />,
      },
      {
        path: '/signin',
        element: <Signin />,
      },
      {
        path: '/',
        element: <Boots />,
      },
      {
        path: '/chatroom',
        element: <Chatroom />,
      },
    ],
  },
]
const routes = createMemoryRouter(routesList)

function App() {
  return (
    <CurrentUserProvider>
      <RouterProvider router={routes} />
    </CurrentUserProvider>
  )
}

function render() {
  const container = document.getElementById('app')
  const root = ReactDOMClient.createRoot(container)
  root.render(<App />)
}

render()
