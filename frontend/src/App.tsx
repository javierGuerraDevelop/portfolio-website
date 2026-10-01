import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HomePage, AboutPage, ReposPage, ContactPage, NotFoundPage } from '@/pages';
import { ParkingPage } from '@/pages/ParkingPage';

function LayoutWrapper() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<LayoutWrapper />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/about' element={<AboutPage />} />
                    <Route path='/repos' element={<ReposPage />} />
                    <Route path='/contact' element={<ContactPage />} />
                    <Route path='*' element={<NotFoundPage />} />
                </Route>
                <Route path='/e4b7f2a1-9c3d-48a2-b15f-6e8d0c4f7a3b' element={<ParkingPage />} />
            </Routes>
        </Router>
    );
}

export default App;
