import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HomePage, AboutPage, ReposPage, ContactPage, NotFoundPage } from '@/pages';

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
            </Routes>
        </Router>
    );
}

export default App;
