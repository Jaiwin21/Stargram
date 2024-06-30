import './global.css';
import { Routes, Route } from 'react-router-dom';
import SignInForm from './_auth/forms/SignInForm';
import SignUpForm from './_auth/forms/SignUpForm';
import { Home } from './_root/pages';
import AuthLayout from './_auth/AuthLayout'
import RootLayout from './_root/RootLayout';

const App = () => {
  return (
    <main className='flex h-screen'>
        <Routes>

            <Route element={<AuthLayout />}>
                {/* public routes */}
                <Route path='/sign-in' element={<SignInForm />} />
                <Route path='/sign-up' element={<SignUpForm />} />
            </Route>

            <Route element={<RootLayout />}>
                {/* private route */}
                <Route index element={<Home />}/>
            </Route>

        </Routes>

    </main>
  )
}

export default App