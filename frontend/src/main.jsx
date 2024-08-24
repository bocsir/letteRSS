import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Login from './components/pages/Login.jsx'
import SignUp from './components/pages/SignUp.jsx'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import NotFound from './components/pages/NotFound.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <NotFound/>
  },
  {
    path: '/login',
    element: <Login/>,
  },
  {
    path: '/signup',
    element: <SignUp/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* set entry point of app as router */}
    <RouterProvider router={router} />
  </StrictMode>,
)
