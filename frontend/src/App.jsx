import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LoginPage from './pages/auth/login/LoginPage'
import NotificationPage from './pages/notification/NotificationPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {

	const { data: authUser, isLoading, error } = useQuery({
		queryKey: ['authUser'],
		queryFn: async () => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check`);
			if (response.status === 401) return null;
			if (!response.ok) {
				throw new Error(data.message || 'Failed to fetch');
			}	
			const data = await response.json();
			return data;
		},
		onError: () => {
			throw new Error(error.message);
		},
	});


	if (isLoading) return <div className='min-h-screen flex justify-center items-center'> <LoadingSpinner size='lg' /> </div>

	return (
		<div className='flex max-w-6xl mx-auto'>

			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App
